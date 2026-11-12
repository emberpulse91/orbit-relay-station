import { describe, expect, it } from '@jest/globals';
import { LOADER_DURATION_MS, SCREEN_FADE_MS, TOTAL_SECTORS } from '../src/constants/config';
import { defaultProgress, nextSector } from '../src/state/progressStore';

describe('boot flow', () => {
  it('holds the loader for exactly 8000 ms', () => {
    expect(LOADER_DURATION_MS).toBe(8000);
  });

  it('cross-fades between screens', () => {
    expect(SCREEN_FADE_MS).toBeGreaterThan(0);
    expect(SCREEN_FADE_MS).toBeLessThanOrEqual(500);
  });

  it('opens on the first sector for a fresh station', () => {
    expect(nextSector(defaultProgress())).toBe(0);
    expect(TOTAL_SECTORS).toBe(12);
  });
});
