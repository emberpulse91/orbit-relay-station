import { TOTAL_SECTORS } from '../constants/config';
import type { ModuleId, RoundStats } from '../game/types';
import { loadRaw, saveRaw } from './storage';

const KEY = 'orbit.progress.v1';

export interface Progress {
  stars: number[]; // 0..3 per sector
  bestScores: number[];
  unlockedSectors: number; // how many sectors are playable, >= 1
  defaultModule: ModuleId;
  relaysDeployed: number;
  energySaved: number;
  wins: number;
  budgetOfWins: number;
}

export function defaultProgress(): Progress {
  return {
    stars: new Array(TOTAL_SECTORS).fill(0),
    bestScores: new Array(TOTAL_SECTORS).fill(0),
    unlockedSectors: 1,
    defaultModule: 'pulse',
    relaysDeployed: 0,
    energySaved: 0,
    wins: 0,
    budgetOfWins: 0,
  };
}

function clampArray(value: unknown, length: number, max: number): number[] {
  const out = new Array(length).fill(0);
  if (Array.isArray(value)) {
    for (let i = 0; i < length && i < value.length; i++) {
      const n = Number(value[i]);
      out[i] = Number.isFinite(n) ? Math.max(0, Math.min(max, Math.floor(n))) : 0;
    }
  }
  return out;
}

/** A corrupt payload must fall back to defaults, never throw. */
export function parseProgress(raw: string | null): Progress {
  const base = defaultProgress();
  if (!raw) {
    return base;
  }
  try {
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') {
      return base;
    }
    const allowed: ModuleId[] = ['pulse', 'beacon', 'prism', 'anchor'];
    return {
      stars: clampArray(data.stars, TOTAL_SECTORS, 3),
      bestScores: clampArray(data.bestScores, TOTAL_SECTORS, 999999),
      unlockedSectors: Math.max(
        1,
        Math.min(TOTAL_SECTORS, Math.floor(Number(data.unlockedSectors) || 1)),
      ),
      defaultModule: allowed.indexOf(data.defaultModule) >= 0 ? data.defaultModule : 'pulse',
      relaysDeployed: Math.max(0, Math.floor(Number(data.relaysDeployed) || 0)),
      energySaved: Math.max(0, Math.floor(Number(data.energySaved) || 0)),
      wins: Math.max(0, Math.floor(Number(data.wins) || 0)),
      budgetOfWins: Math.max(0, Math.floor(Number(data.budgetOfWins) || 0)),
    };
  } catch (e) {
    return base;
  }
}

export function applyRound(progress: Progress, stats: RoundStats): Progress {
  const next: Progress = {
    ...progress,
    stars: progress.stars.slice(),
    bestScores: progress.bestScores.slice(),
    relaysDeployed: progress.relaysDeployed + stats.relaysUsed,
  };
  if (stats.outcome === 'win') {
    const i = stats.level;
    next.stars[i] = Math.max(next.stars[i] || 0, stats.stars);
    next.bestScores[i] = Math.max(next.bestScores[i] || 0, stats.score);
    next.unlockedSectors = Math.max(
      next.unlockedSectors,
      Math.min(TOTAL_SECTORS, i + 2),
    );
    next.energySaved = progress.energySaved + Math.max(0, stats.energyLeft);
    next.wins = progress.wins + 1;
    next.budgetOfWins = progress.budgetOfWins + stats.budget;
  }
  return next;
}

export function totalStars(p: Progress): number {
  return p.stars.reduce((a, b) => a + b, 0);
}

export function sectorsCleared(p: Progress): number {
  return p.stars.filter(s => s > 0).length;
}

export function bestScore(p: Progress): number {
  return p.bestScores.reduce((a, b) => Math.max(a, b), 0);
}

export function efficiency(p: Progress): number {
  if (p.budgetOfWins <= 0) {
    return 0;
  }
  return Math.round((p.energySaved / p.budgetOfWins) * 100);
}

export function isSectorUnlocked(p: Progress, level: number): boolean {
  return level < p.unlockedSectors;
}

export function nextSector(p: Progress): number {
  for (let i = 0; i < TOTAL_SECTORS; i++) {
    if ((p.stars[i] || 0) === 0 && i < p.unlockedSectors) {
      return i;
    }
  }
  return Math.min(TOTAL_SECTORS - 1, p.unlockedSectors - 1);
}

export async function loadProgress(): Promise<Progress> {
  return parseProgress(await loadRaw(KEY));
}

export async function persistProgress(p: Progress): Promise<void> {
  await saveRaw(KEY, JSON.stringify(p));
}
