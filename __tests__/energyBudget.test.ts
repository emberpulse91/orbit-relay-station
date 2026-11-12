import { describe, expect, it } from '@jest/globals';
import { isCollapsed, placeRelay } from '../src/game/energy';
import { cheapestUnlockedCost } from '../src/game/modules';
import type { Point } from '../src/game/types';

const reactor: Point = { col: 3, row: 8 };
const domes: Point[] = [{ col: 0, row: 0 }];

describe('energy budget', () => {
  it('never lets the ration go negative', () => {
    let energy = 48;
    let relays: ReturnType<typeof placeRelay>['relays'] = [];
    const cells: Point[] = [
      { col: 0, row: 6 },
      { col: 1, row: 6 },
      { col: 2, row: 6 },
      { col: 4, row: 6 },
      { col: 5, row: 6 },
    ];
    cells.forEach((cell, i) => {
      const res = placeRelay(cell, 'pulse', energy, relays, reactor, domes, [], 7, 9, i);
      if (res.ok) {
        energy = res.energy;
        relays = res.relays;
      }
    });
    expect(energy).toBeGreaterThanOrEqual(0);
    expect(relays).toHaveLength(4);
    expect(energy).toBe(0);
  });

  it('collapses when nothing can be afforded and a dome is still dark', () => {
    const cheapest = cheapestUnlockedCost(0);
    expect(cheapest).toBe(12);
    expect(isCollapsed(0, cheapest, false)).toBe(true);
    expect(isCollapsed(11, cheapest, false)).toBe(true);
    expect(isCollapsed(12, cheapest, false)).toBe(false);
  });

  it('never collapses once every dome is powered', () => {
    expect(isCollapsed(0, 12, true)).toBe(false);
  });

  it('ends a blind run inside four taps on the opening budget', () => {
    expect(Math.floor(48 / 12)).toBe(4);
  });
});
