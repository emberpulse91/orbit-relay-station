import type { ModuleId, RelayModule } from './types';

export const MODULES: RelayModule[] = [
  {
    id: 'pulse',
    index: 0,
    name: 'PULSE RELAY',
    short: 'PULSE',
    range: 2.5,
    cost: 12,
    special: 'Standard short-hop repeater',
    unlocksAfterSector: 0,
  },
  {
    id: 'beacon',
    index: 1,
    name: 'BEACON RELAY',
    short: 'BEACON',
    range: 4.0,
    cost: 24,
    special: 'Long reach across open space',
    unlocksAfterSector: 3,
  },
  {
    id: 'prism',
    index: 2,
    name: 'PRISM SPLITTER',
    short: 'PRISM',
    range: 2.0,
    cost: 18,
    special: 'Beam passes through one asteroid',
    unlocksAfterSector: 6,
  },
  {
    id: 'anchor',
    index: 3,
    name: 'ION ANCHOR',
    short: 'ANCHOR',
    range: 3.0,
    cost: 20,
    special: 'Drifting rock never enters its cell',
    unlocksAfterSector: 9,
  },
];

export const MODULE_BY_ID: Record<ModuleId, RelayModule> = MODULES.reduce(
  (acc, m) => {
    acc[m.id] = m;
    return acc;
  },
  {} as Record<ModuleId, RelayModule>,
);

export const PULSE = MODULE_BY_ID.pulse;

/** A module is unlocked when `sectorsCleared` reaches its threshold. */
export function isModuleUnlocked(m: RelayModule, sectorsCleared: number) {
  return sectorsCleared >= m.unlocksAfterSector;
}

export function unlockedModules(sectorsCleared: number): RelayModule[] {
  return MODULES.filter(m => isModuleUnlocked(m, sectorsCleared));
}

export function cheapestUnlockedCost(sectorsCleared: number): number {
  return unlockedModules(sectorsCleared).reduce(
    (min, m) => Math.min(min, m.cost),
    Number.POSITIVE_INFINITY,
  );
}
