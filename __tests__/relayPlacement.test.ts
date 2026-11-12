import { describe, expect, it } from '@jest/globals';
import { canPlaceAt, placeRelay } from '../src/game/energy';
import type { Asteroid, Point, Relay } from '../src/game/types';

const reactor: Point = { col: 3, row: 8 };
const domes: Point[] = [{ col: 3, row: 0 }];
const rock: Asteroid = {
  id: 'rock-0',
  col: 3,
  row: 4,
  spin: 0,
  drifting: false,
  axis: 'h',
  dir: 1,
};

describe('relay placement', () => {
  it('writes a relay into an empty cell and subtracts its cost', () => {
    const res = placeRelay(
      { col: 3, row: 6 },
      'pulse',
      48,
      [],
      reactor,
      domes,
      [rock],
      7,
      9,
      1,
    );
    expect(res.ok).toBe(true);
    expect(res.relays).toHaveLength(1);
    expect(res.relays[0].moduleId).toBe('pulse');
    expect(res.energy).toBe(36);
  });

  it('rejects an asteroid, the reactor, a dome and an occupied cell without cost', () => {
    const placed: Relay[] = [
      { id: 'r1', col: 2, row: 6, moduleId: 'pulse', range: 2.5 },
    ];
    expect(canPlaceAt({ col: 3, row: 4 }, reactor, domes, [rock], placed, 7, 9)).toBe('asteroid');
    expect(canPlaceAt(reactor, reactor, domes, [rock], placed, 7, 9)).toBe('reactor');
    expect(canPlaceAt(domes[0], reactor, domes, [rock], placed, 7, 9)).toBe('dome');
    expect(canPlaceAt({ col: 2, row: 6 }, reactor, domes, [rock], placed, 7, 9)).toBe('occupied');

    const res = placeRelay(
      { col: 3, row: 4 },
      'pulse',
      48,
      placed,
      reactor,
      domes,
      [rock],
      7,
      9,
      2,
    );
    expect(res.ok).toBe(false);
    expect(res.energy).toBe(48);
    expect(res.relays).toBe(placed);
  });

  it('refuses a deployment the budget cannot pay for', () => {
    const res = placeRelay(
      { col: 1, row: 6 },
      'beacon',
      10,
      [],
      reactor,
      domes,
      [rock],
      7,
      9,
      3,
    );
    expect(res.ok).toBe(false);
    expect(res.error).toBe('energy');
    expect(res.energy).toBe(10);
  });

  it('keeps placements inside the grid', () => {
    expect(canPlaceAt({ col: 7, row: 2 }, reactor, domes, [rock], [], 7, 9)).toBe('outside');
    expect(canPlaceAt({ col: -1, row: 2 }, reactor, domes, [rock], [], 7, 9)).toBe('outside');
  });
});
