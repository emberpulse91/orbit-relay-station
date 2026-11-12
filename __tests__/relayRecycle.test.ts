import { describe, expect, it } from '@jest/globals';
import { recycleRelay, refundFor } from '../src/game/energy';
import type { Relay } from '../src/game/types';

const relays: Relay[] = [
  { id: 'a', col: 1, row: 1, moduleId: 'pulse', range: 2.5 },
  { id: 'b', col: 2, row: 2, moduleId: 'beacon', range: 4 },
];

describe('recycle and refund', () => {
  it('refunds half the cost, rounded down', () => {
    expect(refundFor('pulse')).toBe(6);
    expect(refundFor('beacon')).toBe(12);
    expect(refundFor('prism')).toBe(9);
    expect(refundFor('anchor')).toBe(10);
  });

  it('removes the relay and returns the refund', () => {
    const res = recycleRelay('a', relays, 10);
    expect(res.relays).toHaveLength(1);
    expect(res.relays[0].id).toBe('b');
    expect(res.energy).toBe(16);
    expect(res.refund).toBe(6);
  });

  it('keeps the budget strictly decreasing so a round always terminates', () => {
    const spend = 12;
    const back = refundFor('pulse');
    expect(back).toBeLessThan(spend);
  });

  it('ignores an unknown relay id', () => {
    const res = recycleRelay('zzz', relays, 10);
    expect(res.relays).toBe(relays);
    expect(res.energy).toBe(10);
    expect(res.refund).toBe(0);
  });
});
