import { COLS, DOME_RANGE, REACTOR_RANGE, ROWS } from '../constants/config';
import { FALLBACK_SECTORS, sectorConfig } from './levels';
import { PULSE } from './modules';
import { blockedCount, blockedSet, distance } from './routing';
import { mulberry32, randInt, seedFor, shuffle } from './rng';
import type { Asteroid, Point, Sector } from './types';

const MAX_ATTEMPTS = 20;

function key(p: Point) {
  return p.col + ':' + p.row;
}

function allCells(): Point[] {
  const out: Point[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      out.push({ col: c, row: r });
    }
  }
  return out;
}

/**
 * Can every dome be lit with pulse relays only, inside the hop limit and the
 * budget? BFS over the reactor + every free cell (a virtual pulse) + the domes.
 */
export function isSolvable(
  reactor: Point,
  domes: Point[],
  asteroids: Point[],
  budget: number,
  maxHops: number,
): boolean {
  const blocked = blockedSet(asteroids);
  const occupied = new Set<string>([key(reactor)]);
  domes.forEach(d => occupied.add(key(d)));
  asteroids.forEach(a => occupied.add(key(a)));

  const free = allCells().filter(c => !occupied.has(key(c)));
  // nodes: 0 = reactor, 1..n = free cells (virtual pulse relays)
  const nodes: Array<{ p: Point; range: number }> = [
    { p: reactor, range: REACTOR_RANGE },
  ];
  for (let i = 0; i < free.length; i++) {
    nodes.push({ p: free[i], range: PULSE.range });
  }

  const depth: number[] = nodes.map(() => -1);
  const parent: number[] = nodes.map(() => -1);
  depth[0] = 0;
  const queue = [0];
  let head = 0;
  while (head < queue.length) {
    const cur = queue[head++];
    if (depth[cur] >= maxHops) {
      continue;
    }
    for (let j = 1; j < nodes.length; j++) {
      if (depth[j] !== -1) {
        continue;
      }
      const reach = Math.min(nodes[cur].range, nodes[j].range);
      if (distance(nodes[cur].p, nodes[j].p) > reach + 1e-6) {
        continue;
      }
      if (blockedCount(nodes[cur].p, nodes[j].p, blocked) > 0) {
        continue;
      }
      depth[j] = depth[cur] + 1;
      parent[j] = cur;
      queue.push(j);
    }
  }

  // The relays form ONE tree, so a trunk shared by several domes is paid for
  // once — count the union of the paths, not the sum of their lengths.
  const used = new Set<number>();
  for (let d = 0; d < domes.length; d++) {
    let best = -1;
    for (let j = 0; j < nodes.length; j++) {
      if (depth[j] < 0 || depth[j] + 1 > maxHops) {
        continue;
      }
      const reach = Math.min(nodes[j].range, DOME_RANGE);
      if (distance(nodes[j].p, domes[d]) > reach + 1e-6) {
        continue;
      }
      if (blockedCount(nodes[j].p, domes[d], blocked) > 0) {
        continue;
      }
      if (best === -1 || depth[j] < depth[best]) {
        best = j;
      }
    }
    if (best === -1) {
      return false;
    }
    let walk = best;
    for (let guard = 0; guard < 64 && walk > 0; guard++) {
      used.add(walk);
      walk = parent[walk];
    }
  }

  const affordable = Math.floor(budget / PULSE.cost) - 1;
  return used.size <= Math.max(1, affordable);
}

function buildAsteroids(
  raw: Point[],
  driftingCount: number,
  rng: () => number,
): Asteroid[] {
  const order = shuffle(rng, raw.map((_, i) => i));
  const drifting = new Set(order.slice(0, driftingCount));
  return raw.map((p, i) => ({
    id: 'rock-' + i,
    col: p.col,
    row: p.row,
    spin: Math.round((rng() * 28 - 14) * 10) / 10,
    drifting: drifting.has(i),
    axis: rng() < 0.5 ? 'h' : 'v',
    dir: rng() < 0.5 ? 1 : -1,
  }));
}

/**
 * generateSector(level, attempt) — quantities come from the level table, the
 * PRNG decides placement, and every candidate is checked for solvability
 * before it can be shown (game-common 6.1 / 6.3).
 */
export function generateSector(level: number, attempt: number): Sector {
  const cfg = sectorConfig(level);
  const seed = seedFor(level, attempt);

  for (let tryIndex = 0; tryIndex < MAX_ATTEMPTS; tryIndex++) {
    const rng = mulberry32(seed + tryIndex * 2654435761);

    // Reactor lives in the bottom two rows, domes in the top three.
    const reactor: Point = {
      col: randInt(rng, 0, COLS),
      row: randInt(rng, ROWS - 2, ROWS),
    };

    const domeSlots = shuffle(
      rng,
      allCells().filter(c => c.row <= 2),
    );
    const domes: Point[] = [];
    for (let i = 0; i < domeSlots.length && domes.length < cfg.domes; i++) {
      const cand = domeSlots[i];
      const tooClose = domes.some(
        d => Math.abs(d.col - cand.col) + Math.abs(d.row - cand.row) < 2,
      );
      if (!tooClose) {
        domes.push(cand);
      }
    }
    if (domes.length < cfg.domes) {
      continue;
    }

    const taken = new Set<string>([key(reactor)]);
    domes.forEach(d => taken.add(key(d)));
    // Keep a breathing ring around the reactor so the first hop always exists.
    for (let dc = -1; dc <= 1; dc++) {
      for (let dr = -1; dr <= 1; dr++) {
        taken.add(key({ col: reactor.col + dc, row: reactor.row + dr }));
      }
    }

    const rockSlots = shuffle(
      rng,
      allCells().filter(c => !taken.has(key(c))),
    );
    const rocks = rockSlots.slice(0, cfg.asteroids);
    if (rocks.length < cfg.asteroids) {
      continue;
    }

    if (!isSolvable(reactor, domes, rocks, cfg.budget, cfg.maxHops)) {
      continue;
    }

    return {
      level,
      attempt,
      seed,
      cols: COLS,
      rows: ROWS,
      reactor,
      domes,
      asteroids: buildAsteroids(rocks, cfg.driftingRocks, rng),
      budget: cfg.budget,
      maxHops: cfg.maxHops,
      flareWindowMs: cfg.flareWindowMs,
      fallback: false,
    };
  }

  // 20 attempts failed — fall back to a hardcoded layout, thinning the belt
  // until it is provably solvable so the fallback can never dead-end.
  const fb = FALLBACK_SECTORS[level % FALLBACK_SECTORS.length];
  const rng = mulberry32(seed);
  const domes = fb.domes.slice(0, Math.max(1, Math.min(cfg.domes, fb.domes.length)));
  let rocks = fb.asteroids.slice();
  while (
    rocks.length > 0 &&
    !isSolvable(fb.reactor, domes, rocks, cfg.budget, cfg.maxHops)
  ) {
    rocks = rocks.slice(0, rocks.length - 1);
  }
  return {
    level,
    attempt,
    seed,
    cols: COLS,
    rows: ROWS,
    reactor: fb.reactor,
    domes,
    asteroids: buildAsteroids(rocks, cfg.driftingRocks, rng),
    budget: cfg.budget,
    maxHops: cfg.maxHops,
    flareWindowMs: cfg.flareWindowMs,
    fallback: true,
  };
}
