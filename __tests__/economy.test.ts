import { describe, expect, it } from '@jest/globals';
import { MODULES } from '../src/game/modules';
import { defaultProgress } from '../src/state/progressStore';

describe('economy', () => {
  it('prices modules in plain integer energy only', () => {
    MODULES.forEach(m => {
      expect(Number.isInteger(m.cost)).toBe(true);
      expect(m.cost).toBeGreaterThan(0);
    });
  });

  it('starts with no wallet, balance or purchase state', () => {
    const p = defaultProgress() as unknown as Record<string, unknown>;
    ['balance', 'coins', 'wallet', 'bet', 'price', 'purchases'].forEach(key => {
      expect(p[key]).toBeUndefined();
    });
  });

  it('tracks stars as the only persistent score currency', () => {
    const p = defaultProgress();
    expect(p.stars.every(s => s === 0)).toBe(true);
  });
});
