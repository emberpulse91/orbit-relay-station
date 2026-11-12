import { describe, expect, it } from '@jest/globals';
import {
  applyRound,
  bestScore,
  defaultProgress,
  efficiency,
  sectorsCleared,
  totalStars,
} from '../src/state/progressStore';
import { efficiencyPercent } from '../src/game/scoring';
import type { RoundStats } from '../src/game/types';

const won: RoundStats = {
  outcome: 'win',
  reason: 'stabilized',
  level: 0,
  energyLeft: 24,
  budget: 48,
  relaysUsed: 2,
  domesLit: 1,
  domesTotal: 1,
  secondsLeft: 70,
  score: 1820,
  stars: 3,
};

const lost: RoundStats = {
  ...won,
  outcome: 'lose',
  reason: 'collapse',
  level: 1,
  energyLeft: 0,
  score: 0,
  stars: 0,
};

describe('progress stats', () => {
  it('reports an all-zero log for a fresh station', () => {
    const p = defaultProgress();
    expect(sectorsCleared(p)).toBe(0);
    expect(totalStars(p)).toBe(0);
    expect(bestScore(p)).toBe(0);
    expect(efficiency(p)).toBe(0);
  });

  it('aggregates a win into every counter', () => {
    const p = applyRound(defaultProgress(), won);
    expect(sectorsCleared(p)).toBe(1);
    expect(totalStars(p)).toBe(3);
    expect(bestScore(p)).toBe(1820);
    expect(p.relaysDeployed).toBe(2);
    expect(p.energySaved).toBe(24);
    expect(efficiency(p)).toBe(50);
  });

  it('counts relays from a loss but no stars, score or efficiency', () => {
    const p = applyRound(defaultProgress(), lost);
    expect(sectorsCleared(p)).toBe(0);
    expect(totalStars(p)).toBe(0);
    expect(bestScore(p)).toBe(0);
    expect(p.relaysDeployed).toBe(2);
    expect(efficiency(p)).toBe(0);
  });

  it('computes efficiency as the share of the ration left over', () => {
    expect(efficiencyPercent(24, 48)).toBe(50);
    expect(efficiencyPercent(0, 0)).toBe(0);
  });
});
