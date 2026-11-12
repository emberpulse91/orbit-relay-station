import { describe, expect, it } from '@jest/globals';
import { cellsBetween, blockedCount, blockedSet, route } from '../src/game/routing';
import type { Asteroid, Point, Relay } from '../src/game/types';

const reactor: Point = { col: 3, row: 8 };

function rock(col: number, row: number, id = 'r' + col + row): Asteroid {
  return { id, col, row, spin: 0, drifting: false, axis: 'h', dir: 1 };
}

describe('power routing', () => {
  it('walks the cells between two points without the endpoints', () => {
    const between = cellsBetween({ col: 0, row: 0 }, { col: 0, row: 3 });
    expect(between).toEqual([
      { col: 0, row: 1 },
      { col: 0, row: 2 },
    ]);
  });

  it('counts asteroid cells on the straight line', () => {
    const blocked = blockedSet([rock(0, 2)]);
    expect(blockedCount({ col: 0, row: 0 }, { col: 0, row: 4 }, blocked)).toBe(1);
    expect(blockedCount({ col: 0, row: 0 }, { col: 0, row: 1 }, blocked)).toBe(0);
  });

  it('lights a dome through a chain of relays', () => {
    const domes: Point[] = [{ col: 3, row: 2 }];
    const relays: Relay[] = [
      { id: 'a', col: 3, row: 6, moduleId: 'pulse', range: 2.5 },
      { id: 'b', col: 3, row: 4, moduleId: 'pulse', range: 2.5 },
    ];
    const r = route(reactor, domes, relays, [], 5);
    expect(r.allDomesPowered).toBe(true);
    expect(r.poweredRelayIds).toEqual(expect.arrayContaining(['a', 'b']));
    expect(r.links.some(l => l.live)).toBe(true);
  });

  it('refuses to cross an asteroid, so the dome stays dark', () => {
    const domes: Point[] = [{ col: 3, row: 2 }];
    const relays: Relay[] = [
      { id: 'a', col: 3, row: 6, moduleId: 'pulse', range: 2.5 },
      { id: 'b', col: 3, row: 4, moduleId: 'pulse', range: 2.5 },
    ];
    const r = route(reactor, domes, relays, [rock(3, 3)], 5);
    expect(r.allDomesPowered).toBe(false);
    expect(r.poweredDomeIndices).toHaveLength(0);
  });

  it('never links two nodes that are out of range of each other', () => {
    const domes: Point[] = [{ col: 3, row: 0 }];
    const r = route(reactor, domes, [], [], 5);
    expect(r.allDomesPowered).toBe(false);
    expect(r.links).toHaveLength(0);
  });

  it('lets a prism splitter see through exactly one asteroid', () => {
    const domes: Point[] = [{ col: 3, row: 4 }];
    const relays: Relay[] = [
      { id: 'p', col: 3, row: 6, moduleId: 'prism', range: 2.0 },
    ];
    const lit = route(reactor, domes, relays, [rock(3, 5)], 5);
    expect(lit.poweredRelayIds).toContain('p');

    const dark = route(
      reactor,
      domes,
      [{ id: 'p', col: 3, row: 6, moduleId: 'pulse', range: 2.5 }],
      [rock(3, 7)],
      5,
    );
    expect(dark.poweredRelayIds).toHaveLength(0);
  });
});
