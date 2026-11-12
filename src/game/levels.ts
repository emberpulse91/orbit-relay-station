import type { Point, SectorConfig } from './types';

/** The 12 sectors. Quantities are fixed here, PLACEMENT comes from the generator. */
export const SECTORS: SectorConfig[] = [
  { level: 0, asteroids: 6, domes: 1, budget: 48, maxHops: 5, driftingRocks: 0, flareWindowMs: 90000 },
  { level: 1, asteroids: 8, domes: 1, budget: 48, maxHops: 5, driftingRocks: 0, flareWindowMs: 90000 },
  { level: 2, asteroids: 9, domes: 2, budget: 60, maxHops: 5, driftingRocks: 0, flareWindowMs: 90000 },
  { level: 3, asteroids: 10, domes: 2, budget: 60, maxHops: 4, driftingRocks: 1, flareWindowMs: 90000 },
  { level: 4, asteroids: 11, domes: 2, budget: 56, maxHops: 4, driftingRocks: 1, flareWindowMs: 85000 },
  { level: 5, asteroids: 12, domes: 2, budget: 72, maxHops: 4, driftingRocks: 1, flareWindowMs: 85000 },
  { level: 6, asteroids: 13, domes: 3, budget: 72, maxHops: 4, driftingRocks: 1, flareWindowMs: 80000 },
  { level: 7, asteroids: 14, domes: 3, budget: 68, maxHops: 4, driftingRocks: 2, flareWindowMs: 80000 },
  // maxHops bottoms out at 4: a 7x9 belt cannot be routed from the reactor row
  // to the dome row in three pulse hops, so a lower limit would make every
  // generated layout unsolvable and force the fallback.
  { level: 8, asteroids: 15, domes: 3, budget: 80, maxHops: 4, driftingRocks: 2, flareWindowMs: 80000 },
  { level: 9, asteroids: 16, domes: 3, budget: 76, maxHops: 4, driftingRocks: 2, flareWindowMs: 75000 },
  { level: 10, asteroids: 17, domes: 4, budget: 84, maxHops: 4, driftingRocks: 2, flareWindowMs: 75000 },
  { level: 11, asteroids: 18, domes: 4, budget: 88, maxHops: 4, driftingRocks: 3, flareWindowMs: 70000 },
];

export function sectorConfig(level: number): SectorConfig {
  return SECTORS[Math.max(0, Math.min(SECTORS.length - 1, level))];
}

export function difficultyBand(level: number): 'low' | 'mid' | 'high' {
  if (level < 4) {
    return 'low';
  }
  if (level < 8) {
    return 'mid';
  }
  return 'high';
}

export interface FallbackLayout {
  reactor: Point;
  domes: Point[];
  asteroids: Point[];
}

/**
 * Guaranteed-solvable layouts used only when 20 generation attempts all fail.
 * The fallback is a safety net, never the game itself (game-common 6.3).
 */
export const FALLBACK_SECTORS: FallbackLayout[] = [
  {
    reactor: { col: 3, row: 8 },
    domes: [{ col: 3, row: 0 }],
    asteroids: [
      { col: 0, row: 5 }, { col: 1, row: 5 }, { col: 5, row: 5 },
      { col: 6, row: 5 }, { col: 0, row: 2 }, { col: 6, row: 2 },
    ],
  },
  {
    reactor: { col: 0, row: 8 },
    domes: [{ col: 6, row: 0 }, { col: 0, row: 0 }],
    asteroids: [
      { col: 2, row: 6 }, { col: 3, row: 6 }, { col: 4, row: 3 },
      { col: 5, row: 3 }, { col: 1, row: 3 }, { col: 6, row: 6 },
    ],
  },
  {
    reactor: { col: 6, row: 4 },
    domes: [{ col: 0, row: 1 }, { col: 0, row: 7 }, { col: 3, row: 0 }],
    asteroids: [
      { col: 4, row: 1 }, { col: 4, row: 7 }, { col: 3, row: 4 },
      { col: 2, row: 2 }, { col: 2, row: 6 }, { col: 5, row: 0 },
    ],
  },
];
