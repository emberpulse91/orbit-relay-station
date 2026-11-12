import { describe, expect, it } from '@jest/globals';
import { TOTAL_SECTORS } from '../src/constants/config';
import { SECTORS, difficultyBand, sectorConfig } from '../src/game/levels';
import type { RoundStats } from '../src/game/types';
import {
  applyRound,
  defaultProgress,
  isSectorUnlocked,
  nextSector,
} from '../src/state/progressStore';

function win(level: number, stars = 3): RoundStats {
  return {
    outcome: 'win',
    reason: 'stabilized',
    level,
    energyLeft: 20,
    budget: 48,
    relaysUsed: 2,
    domesLit: 1,
    domesTotal: 1,
    secondsLeft: 60,
    score: 500,
    stars,
  };
}

describe('level progression', () => {
  it('ships twelve sectors with rising difficulty', () => {
    expect(SECTORS).toHaveLength(TOTAL_SECTORS);
    expect(sectorConfig(0).asteroids).toBeLessThan(sectorConfig(11).asteroids);
    expect(sectorConfig(0).maxHops).toBeGreaterThan(sectorConfig(11).maxHops);
    expect(difficultyBand(0)).toBe('low');
    expect(difficultyBand(5)).toBe('mid');
    expect(difficultyBand(11)).toBe('high');
  });

  it('locks everything past the first sector on a fresh station', () => {
    const p = defaultProgress();
    expect(isSectorUnlocked(p, 0)).toBe(true);
    expect(isSectorUnlocked(p, 1)).toBe(false);
  });

  it('unlocks the next sector and stores the stars after a win', () => {
    const p = applyRound(defaultProgress(), win(0, 2));
    expect(p.stars[0]).toBe(2);
    expect(isSectorUnlocked(p, 1)).toBe(true);
    expect(nextSector(p)).toBe(1);
  });

  it('keeps the best star count when a sector is replayed worse', () => {
    const first = applyRound(defaultProgress(), win(0, 3));
    const second = applyRound(first, win(0, 1));
    expect(second.stars[0]).toBe(3);
  });

  it('never unlocks past the last sector', () => {
    const p = applyRound(defaultProgress(), win(TOTAL_SECTORS - 1));
    expect(p.unlockedSectors).toBeLessThanOrEqual(TOTAL_SECTORS);
  });
});
