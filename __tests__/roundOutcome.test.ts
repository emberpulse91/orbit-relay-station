import { describe, expect, it } from '@jest/globals';
import { roundScore, starsFor } from '../src/game/scoring';
import { isCollapsed } from '../src/game/energy';

describe('round outcome', () => {
  it('scores a win from the leftovers of the run', () => {
    expect(roundScore(12, 40, 2)).toBe(12 * 10 + 40 * 5 + 2 * 50);
  });

  it('never scores below zero', () => {
    expect(roundScore(-5, -5, 0)).toBe(0);
  });

  it('awards three stars for a frugal route and one for a wasteful one', () => {
    expect(starsFor(24, 48)).toBe(3);
    expect(starsFor(10, 48)).toBe(2);
    expect(starsFor(2, 48)).toBe(1);
    expect(starsFor(0, 0)).toBe(1);
  });

  it('separates the two loss reasons', () => {
    // collapse: nothing affordable while a dome is dark
    expect(isCollapsed(4, 12, false)).toBe(true);
    // flare: energy is fine, the countdown is what ends the round
    expect(isCollapsed(30, 12, false)).toBe(false);
  });
});
