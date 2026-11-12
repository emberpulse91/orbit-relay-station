import { DOME_RANGE, REACTOR_RANGE } from '../constants/config';
import { MODULE_BY_ID } from './modules';
import type { Asteroid, Link, Point, Relay, RouteResult } from './types';

export type NodeKind = 'reactor' | 'relay' | 'dome';

export interface RouteNode {
  id: string;
  kind: NodeKind;
  col: number;
  row: number;
  range: number;
  /** Prism splitters tolerate one blocked cell on the line. */
  blockTolerance: number;
  domeIndex?: number;
}

export function distance(a: Point, b: Point): number {
  const dx = a.col - b.col;
  const dy = a.row - b.row;
  return Math.sqrt(dx * dx + dy * dy);
}

function blockKey(col: number, row: number) {
  return col + ':' + row;
}

export function blockedSet(asteroids: Point[]): Set<string> {
  const set = new Set<string>();
  for (let i = 0; i < asteroids.length; i++) {
    set.add(blockKey(asteroids[i].col, asteroids[i].row));
  }
  return set;
}

/**
 * Bresenham between two cell centres. Endpoints are excluded: a beam leaves and
 * enters its own node, only the cells in between can block it.
 */
export function cellsBetween(a: Point, b: Point): Point[] {
  const out: Point[] = [];
  let x0 = a.col;
  let y0 = a.row;
  const x1 = b.col;
  const y1 = b.row;
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  // Hard stop: a 7x9 board can never need more than 64 steps.
  for (let guard = 0; guard < 64; guard++) {
    if (x0 === x1 && y0 === y1) {
      break;
    }
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
    if (x0 === x1 && y0 === y1) {
      break;
    }
    out.push({ col: x0, row: y0 });
  }
  return out;
}

/** How many asteroid cells the straight line a->b crosses. */
export function blockedCount(a: Point, b: Point, blocked: Set<string>): number {
  const between = cellsBetween(a, b);
  let n = 0;
  for (let i = 0; i < between.length; i++) {
    if (blocked.has(blockKey(between[i].col, between[i].row))) {
      n++;
    }
  }
  return n;
}

export function hasLineOfSight(
  a: RouteNode,
  b: RouteNode,
  blocked: Set<string>,
): boolean {
  const tolerance = Math.max(a.blockTolerance, b.blockTolerance);
  return blockedCount(a, b, blocked) <= tolerance;
}

export function canLink(
  a: RouteNode,
  b: RouteNode,
  blocked: Set<string>,
): boolean {
  if (a.id === b.id) {
    return false;
  }
  const reach = Math.min(a.range, b.range);
  if (distance(a, b) > reach + 1e-6) {
    return false;
  }
  return hasLineOfSight(a, b, blocked);
}

export function buildNodes(
  reactor: Point,
  domes: Point[],
  relays: Relay[],
): RouteNode[] {
  const nodes: RouteNode[] = [
    {
      id: 'reactor',
      kind: 'reactor',
      col: reactor.col,
      row: reactor.row,
      range: REACTOR_RANGE,
      blockTolerance: 0,
    },
  ];
  for (let i = 0; i < relays.length; i++) {
    const r = relays[i];
    nodes.push({
      id: r.id,
      kind: 'relay',
      col: r.col,
      row: r.row,
      range: r.range,
      blockTolerance: r.moduleId === 'prism' ? 1 : 0,
    });
  }
  for (let i = 0; i < domes.length; i++) {
    nodes.push({
      id: 'dome-' + i,
      kind: 'dome',
      col: domes[i].col,
      row: domes[i].row,
      range: DOME_RANGE,
      blockTolerance: 0,
      domeIndex: i,
    });
  }
  return nodes;
}

/**
 * BFS from the reactor. A node is powered only while its BFS depth stays within
 * the sector hop limit — that is the signal-decay mechanic.
 */
export function route(
  reactor: Point,
  domes: Point[],
  relays: Relay[],
  asteroids: Asteroid[],
  maxHops: number,
): RouteResult {
  const nodes = buildNodes(reactor, domes, relays);
  const blocked = blockedSet(asteroids);

  const adjacency: number[][] = nodes.map(() => []);
  const rawLinks: Array<{ a: number; b: number }> = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      // Two domes never talk to each other; they are receivers only.
      if (nodes[i].kind === 'dome' && nodes[j].kind === 'dome') {
        continue;
      }
      if (canLink(nodes[i], nodes[j], blocked)) {
        adjacency[i].push(j);
        adjacency[j].push(i);
        rawLinks.push({ a: i, b: j });
      }
    }
  }

  const depth: number[] = nodes.map(() => -1);
  depth[0] = 0;
  const queue: number[] = [0];
  let head = 0;
  while (head < queue.length) {
    const cur = queue[head++];
    if (depth[cur] >= maxHops) {
      continue;
    }
    // A dome is a terminal receiver: power never travels onward through it.
    if (nodes[cur].kind === 'dome') {
      continue;
    }
    const neighbours = adjacency[cur];
    for (let k = 0; k < neighbours.length; k++) {
      const nx = neighbours[k];
      if (depth[nx] === -1) {
        depth[nx] = depth[cur] + 1;
        queue.push(nx);
      }
    }
  }

  const links: Link[] = rawLinks.map(l => ({
    ax: nodes[l.a].col,
    ay: nodes[l.a].row,
    bx: nodes[l.b].col,
    by: nodes[l.b].row,
    live: depth[l.a] >= 0 && depth[l.b] >= 0,
  }));

  const poweredRelayIds: string[] = [];
  const poweredDomeIndices: number[] = [];
  for (let i = 0; i < nodes.length; i++) {
    if (depth[i] < 0) {
      continue;
    }
    if (nodes[i].kind === 'relay') {
      poweredRelayIds.push(nodes[i].id);
    } else if (nodes[i].kind === 'dome') {
      poweredDomeIndices.push(nodes[i].domeIndex as number);
    }
  }

  return {
    links,
    poweredRelayIds,
    poweredDomeIndices,
    allDomesPowered: domes.length > 0 && poweredDomeIndices.length === domes.length,
  };
}

export function moduleRange(moduleId: Relay['moduleId']): number {
  return MODULE_BY_ID[moduleId].range;
}
