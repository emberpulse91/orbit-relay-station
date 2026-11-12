import { describe, expect, it } from '@jest/globals';
import { route } from '../src/game/routing';
import type { Point, Relay } from '../src/game/types';

const reactor: Point = { col: 3, row: 8 };
const farDome: Point[] = [{ col: 3, row: 0 }];
const midDome: Point[] = [{ col: 3, row: 3 }];

const chain: Relay[] = [
  { id: 'a', col: 3, row: 6, moduleId: 'pulse', range: 2.5 },
  { id: 'b', col: 3, row: 4, moduleId: 'pulse', range: 2.5 },
  { id: 'c', col: 3, row: 2, moduleId: 'pulse', range: 2.5 },
];

describe('signal decay / hop limit', () => {
  it('lights the dome when the chain fits inside the hop budget', () => {
    const r = route(reactor, farDome, chain, [], 5);
    expect(r.allDomesPowered).toBe(true);
  });

  it('leaves the dome dark when the chain is one hop too long', () => {
    const r = route(reactor, farDome, chain, [], 3);
    expect(r.allDomesPowered).toBe(false);
    expect(r.poweredRelayIds).toEqual(expect.arrayContaining(['a', 'b', 'c']));
  });

  it('makes one long jump worth more than two cheap hops', () => {
    const pulses: Relay[] = [
      { id: 'p1', col: 3, row: 6, moduleId: 'pulse', range: 2.5 },
      { id: 'p2', col: 3, row: 5, moduleId: 'pulse', range: 2.5 },
    ];
    const beacon: Relay[] = [
      { id: 'long', col: 3, row: 5, moduleId: 'beacon', range: 4 },
    ];

    // Two pulses need three hops to reach the dome — over the limit of two.
    expect(route(reactor, midDome, pulses, [], 2).allDomesPowered).toBe(false);
    // One beacon covers the same distance in two.
    expect(route(reactor, midDome, beacon, [], 2).allDomesPowered).toBe(true);
  });
});
