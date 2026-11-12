export type ModuleId = 'pulse' | 'beacon' | 'prism' | 'anchor';

export interface RelayModule {
  id: ModuleId;
  index: number; // 0..3 -> sprite_1..sprite_4
  name: string;
  short: string;
  range: number;
  cost: number;
  special: string;
  unlocksAfterSector: number; // 0 = available from the start
}

export interface Point {
  col: number;
  row: number;
}

export interface Asteroid extends Point {
  id: string;
  spin: number; // -14..14 degrees, from the seed
  drifting: boolean;
  axis: 'h' | 'v';
  dir: 1 | -1;
}

export interface Relay extends Point {
  id: string;
  moduleId: ModuleId;
  range: number;
}

export interface SectorConfig {
  level: number; // 0-based
  asteroids: number;
  domes: number;
  budget: number;
  maxHops: number;
  driftingRocks: number;
  flareWindowMs: number;
}

export interface Sector {
  level: number;
  attempt: number;
  seed: number;
  cols: number;
  rows: number;
  reactor: Point;
  domes: Point[];
  asteroids: Asteroid[];
  budget: number;
  maxHops: number;
  flareWindowMs: number;
  fallback: boolean;
}

export interface Link {
  ax: number;
  ay: number;
  bx: number;
  by: number;
  live: boolean;
}

export interface RouteResult {
  links: Link[];
  poweredRelayIds: string[];
  poweredDomeIndices: number[];
  allDomesPowered: boolean;
}

export type Outcome = 'win' | 'lose';
export type LoseReason = 'collapse' | 'flare';

export interface RoundStats {
  outcome: Outcome;
  reason: LoseReason | 'stabilized';
  level: number;
  energyLeft: number;
  budget: number;
  relaysUsed: number;
  domesLit: number;
  domesTotal: number;
  secondsLeft: number;
  score: number;
  stars: number;
}
