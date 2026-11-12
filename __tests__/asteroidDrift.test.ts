import { describe, expect, it } from '@jest/globals';
import { driftStep, driftingIds } from '../src/game/drift';
import { sectorConfig } from '../src/game/levels';
import type { Asteroid, Point, Relay } from '../src/game/types';

const reactor: Point = { col: 0, row: 8 };
const domes: Point[] = [{ col: 6, row: 0 }];

function rock(
  id: string,
  col: number,
  row: number,
  drifting: boolean,
  axis: 'h' | 'v' = 'h',
  dir: 1 | -1 = 1,
): Asteroid {
  return { id, col, row, spin: 0, drifting, axis, dir };
}

describe('asteroid drift', () => {
  it('only arms drifting rocks from sector 4 on', () => {
    expect(sectorConfig(0).driftingRocks).toBe(0);
    expect(sectorConfig(3).driftingRocks).toBe(1);
    expect(sectorConfig(11).driftingRocks).toBe(3);
  });

  it('moves a marked rock one cell along its axis', () => {
    const rocks = [rock('a', 2, 4, true, 'h', 1), rock('b', 5, 4, false)];
    const res = driftStep(rocks, reactor, domes, [], 7, 9);
    expect(res.moved).toEqual(['a']);
    expect(res.asteroids[0].col).toBe(3);
    expect(res.asteroids[1]).toEqual(rocks[1]);
  });

  it('bounces off the grid edge instead of leaving the board', () => {
    const rocks = [rock('a', 6, 4, true, 'h', 1)];
    const res = driftStep(rocks, reactor, domes, [], 7, 9);
    expect(res.asteroids[0].col).toBe(5);
    expect(res.asteroids[0].dir).toBe(-1);
  });

  it('never drifts into an ion anchor', () => {
    const anchor: Relay[] = [
      { id: 'anchor1', col: 3, row: 4, moduleId: 'anchor', range: 3 },
    ];
    const rocks = [rock('a', 2, 4, true, 'h', 1)];
    const res = driftStep(rocks, reactor, domes, anchor, 7, 9);
    expect(res.asteroids[0].col).toBe(1);
  });

  it('never drifts into the reactor, a dome or another rock', () => {
    const rocks = [rock('a', 2, 4, true, 'h', 1), rock('b', 3, 4, false)];
    const res = driftStep(rocks, reactor, domes, [], 7, 9);
    expect(res.asteroids[0].col).toBe(1);
    expect(driftingIds(res.asteroids)).toEqual(['a']);
  });
});
