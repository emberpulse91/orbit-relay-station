import type { Asteroid, Point, Relay } from './types';

function occupiedKey(p: Point) {
  return p.col + ':' + p.row;
}

/**
 * One drift tick. Marked rocks step one cell along their axis, bounce off the
 * edges and never enter a cell that already holds something. Ion Anchor relays
 * are hard blockers — that is what the module is for.
 */
export function driftStep(
  asteroids: Asteroid[],
  reactor: Point,
  domes: Point[],
  relays: Relay[],
  cols: number,
  rows: number,
): { asteroids: Asteroid[]; moved: string[] } {
  const blockers = new Set<string>([occupiedKey(reactor)]);
  domes.forEach(d => blockers.add(occupiedKey(d)));
  relays.forEach(r => {
    if (r.moduleId === 'anchor') {
      blockers.add(occupiedKey(r));
    }
  });
  asteroids.forEach(a => blockers.add(occupiedKey(a)));

  const moved: string[] = [];
  const next = asteroids.map(a => {
    if (!a.drifting) {
      return a;
    }
    let dir = a.dir;
    for (let flip = 0; flip < 2; flip++) {
      const col = a.axis === 'h' ? a.col + dir : a.col;
      const row = a.axis === 'v' ? a.row + dir : a.row;
      const inside = col >= 0 && row >= 0 && col < cols && row < rows;
      if (inside && !blockers.has(col + ':' + row)) {
        blockers.delete(occupiedKey(a));
        blockers.add(col + ':' + row);
        moved.push(a.id);
        return { ...a, col, row, dir };
      }
      dir = (dir === 1 ? -1 : 1) as 1 | -1;
    }
    return { ...a, dir };
  });

  return { asteroids: next, moved };
}

export function driftingIds(asteroids: Asteroid[]): string[] {
  return asteroids.filter(a => a.drifting).map(a => a.id);
}
