import { describe, expect, it } from '@jest/globals';
import { MODULES, MODULE_BY_ID } from '../src/game/modules';
import { route } from '../src/game/routing';
import type { Point, Relay } from '../src/game/types';

describe('module loadout', () => {
  it('trades range against cost on every module', () => {
    expect(MODULE_BY_ID.pulse.range).toBe(2.5);
    expect(MODULE_BY_ID.pulse.cost).toBe(12);
    expect(MODULE_BY_ID.beacon.range).toBe(4);
    expect(MODULE_BY_ID.beacon.cost).toBe(24);
    expect(MODULE_BY_ID.prism.range).toBe(2);
    expect(MODULE_BY_ID.prism.cost).toBe(18);
    expect(MODULE_BY_ID.anchor.range).toBe(3);
    expect(MODULE_BY_ID.anchor.cost).toBe(20);
  });

  it('gives each module a readable name and a stated special', () => {
    MODULES.forEach(m => {
      expect(m.name.length).toBeGreaterThan(3);
      expect(m.special.length).toBeGreaterThan(3);
      expect(m.name).not.toMatch(/item|lorem|placeholder/i);
    });
  });

  it('turns the chosen module into a different reach on the board', () => {
    const reactor: Point = { col: 3, row: 8 };
    const dome: Point[] = [{ col: 3, row: 3 }];
    const pulse: Relay[] = [
      { id: 'x', col: 3, row: 6, moduleId: 'pulse', range: MODULE_BY_ID.pulse.range },
    ];
    const beacon: Relay[] = [
      { id: 'x', col: 3, row: 5, moduleId: 'beacon', range: MODULE_BY_ID.beacon.range },
    ];
    expect(route(reactor, dome, pulse, [], 4).allDomesPowered).toBe(false);
    expect(route(reactor, dome, beacon, [], 4).allDomesPowered).toBe(true);
  });
});
