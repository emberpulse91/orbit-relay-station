/* eslint-disable no-bitwise */
/**
 * Deterministic per-attempt randomness. One seed per attempt so any layout can
 * be reproduced from (level, attempt) alone — never Math.random (game-common 6.2).
 */
export function seedFor(level: number, attempt: number): number {
  const s = (level + 1) * 7919 ^ ((attempt + 1) * 104729);
  return s >>> 0;
}

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function next(): number {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Rng = () => number;

export function randInt(rng: Rng, minInclusive: number, maxExclusive: number) {
  return minInclusive + Math.floor(rng() * (maxExclusive - minInclusive));
}

export function pick<T>(rng: Rng, list: T[]): T {
  return list[randInt(rng, 0, list.length)];
}

export function shuffle<T>(rng: Rng, list: T[]): T[] {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = randInt(rng, 0, i + 1);
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}
