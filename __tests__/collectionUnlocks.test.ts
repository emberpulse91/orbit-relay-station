import { describe, expect, it } from '@jest/globals';
import {
  MODULES,
  cheapestUnlockedCost,
  isModuleUnlocked,
  unlockedModules,
} from '../src/game/modules';
import { defaultProgress } from '../src/state/progressStore';

describe('collection unlocks', () => {
  it('describes four distinct modules', () => {
    expect(MODULES).toHaveLength(4);
    const ids = MODULES.map(m => m.id);
    expect(new Set(ids).size).toBe(4);
    const sprites = MODULES.map(m => m.index);
    expect(new Set(sprites).size).toBe(4);
  });

  it('starts with the pulse relay only', () => {
    expect(unlockedModules(0).map(m => m.id)).toEqual(['pulse']);
    expect(defaultProgress().defaultModule).toBe('pulse');
  });

  it('opens one module per unlock threshold', () => {
    expect(unlockedModules(3).map(m => m.id)).toEqual(['pulse', 'beacon']);
    expect(unlockedModules(6)).toHaveLength(3);
    expect(unlockedModules(9)).toHaveLength(4);
    expect(isModuleUnlocked(MODULES[3], 8)).toBe(false);
    expect(isModuleUnlocked(MODULES[3], 9)).toBe(true);
  });

  it('keeps the pulse relay the cheapest option at every stage', () => {
    expect(cheapestUnlockedCost(0)).toBe(12);
    expect(cheapestUnlockedCost(9)).toBe(12);
  });
});
