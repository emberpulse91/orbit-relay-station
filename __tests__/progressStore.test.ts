import { describe, expect, it } from '@jest/globals';
import { TOTAL_SECTORS } from '../src/constants/config';
import { defaultProgress, parseProgress } from '../src/state/progressStore';

describe('progress store', () => {
  it('serializes and restores a full payload', () => {
    const saved = {
      ...defaultProgress(),
      unlockedSectors: 5,
      defaultModule: 'beacon' as const,
      relaysDeployed: 37,
      energySaved: 120,
      wins: 4,
      budgetOfWins: 220,
    };
    saved.stars[0] = 3;
    saved.bestScores[0] = 1820;
    const restored = parseProgress(JSON.stringify(saved));
    expect(restored).toEqual(saved);
  });

  it('falls back to defaults on a corrupt payload', () => {
    expect(parseProgress(null)).toEqual(defaultProgress());
    expect(parseProgress('{{{')).toEqual(defaultProgress());
    expect(parseProgress('"a string"')).toEqual(defaultProgress());
  });

  it('clamps nonsense values instead of trusting them', () => {
    const p = parseProgress(
      JSON.stringify({
        stars: [99, -4, 'x'],
        unlockedSectors: 9999,
        defaultModule: 'wormhole',
        relaysDeployed: -12,
      }),
    );
    expect(p.stars[0]).toBe(3);
    expect(p.stars[1]).toBe(0);
    expect(p.stars[2]).toBe(0);
    expect(p.stars).toHaveLength(TOTAL_SECTORS);
    expect(p.unlockedSectors).toBe(TOTAL_SECTORS);
    expect(p.defaultModule).toBe('pulse');
    expect(p.relaysDeployed).toBe(0);
  });
});
