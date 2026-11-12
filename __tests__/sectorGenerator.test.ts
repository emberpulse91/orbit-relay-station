import { describe, expect, it } from '@jest/globals';
import { COLS, ROWS } from '../src/constants/config';
import { sectorConfig } from '../src/game/levels';
import { mulberry32, seedFor } from '../src/game/rng';
import { generateSector, isSolvable } from '../src/game/sectorGenerator';

function key(p: { col: number; row: number }) {
  return p.col + ':' + p.row;
}

describe('sector generation', () => {
  it('derives one reproducible seed per attempt', () => {
    expect(seedFor(0, 0)).toBe(seedFor(0, 0));
    expect(seedFor(0, 0)).not.toBe(seedFor(0, 1));
    const rng = mulberry32(12345);
    const a = [rng(), rng(), rng()];
    const rng2 = mulberry32(12345);
    expect([rng2(), rng2(), rng2()]).toEqual(a);
    a.forEach(v => {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    });
  });

  it('honours the level table quantities and the grid bounds', () => {
    for (let level = 0; level < 12; level++) {
      const cfg = sectorConfig(level);
      const s = generateSector(level, 0);
      expect(s.domes.length).toBeGreaterThanOrEqual(1);
      expect(s.budget).toBe(cfg.budget);
      expect(s.maxHops).toBe(cfg.maxHops);
      expect(s.flareWindowMs).toBe(cfg.flareWindowMs);
      expect(s.flareWindowMs).toBeGreaterThanOrEqual(60000);
      [s.reactor, ...s.domes, ...s.asteroids].forEach(p => {
        expect(p.col).toBeGreaterThanOrEqual(0);
        expect(p.row).toBeGreaterThanOrEqual(0);
        expect(p.col).toBeLessThan(COLS);
        expect(p.row).toBeLessThan(ROWS);
      });
    }
  });

  it('never stacks two things on the same cell', () => {
    const s = generateSector(6, 2);
    const cells = [s.reactor, ...s.domes, ...s.asteroids].map(key);
    expect(new Set(cells).size).toBe(cells.length);
  });

  it('only returns layouts that can actually be solved', () => {
    for (let level = 0; level < 12; level++) {
      const s = generateSector(level, 1);
      expect(
        isSolvable(s.reactor, s.domes, s.asteroids, s.budget, s.maxHops),
      ).toBe(true);
    }
  });

  it('places the belt differently on a replay', () => {
    const first = generateSector(4, 0);
    const second = generateSector(4, 1);
    const a = [first.reactor, ...first.domes, ...first.asteroids].map(key).join('|');
    const b = [second.reactor, ...second.domes, ...second.asteroids].map(key).join('|');
    expect(a).not.toBe(b);
  });

  it('arms exactly as many drifting rocks as the level asks for', () => {
    const s = generateSector(11, 0);
    expect(s.asteroids.filter(r => r.drifting)).toHaveLength(
      sectorConfig(11).driftingRocks,
    );
  });
});
