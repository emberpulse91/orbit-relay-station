import { MODULE_BY_ID } from './modules';
import type { Asteroid, ModuleId, Point, Relay } from './types';

export type PlacementError =
  | 'occupied'
  | 'asteroid'
  | 'reactor'
  | 'dome'
  | 'energy'
  | 'outside';

export interface PlacementResult {
  ok: boolean;
  error?: PlacementError;
  relays: Relay[];
  energy: number;
  placedId?: string;
}

function same(a: Point, b: Point) {
  return a.col === b.col && a.row === b.row;
}

export function canPlaceAt(
  cell: Point,
  reactor: Point,
  domes: Point[],
  asteroids: Asteroid[],
  relays: Relay[],
  cols: number,
  rows: number,
): PlacementError | null {
  if (cell.col < 0 || cell.row < 0 || cell.col >= cols || cell.row >= rows) {
    return 'outside';
  }
  if (same(cell, reactor)) {
    return 'reactor';
  }
  if (domes.some(d => same(d, cell))) {
    return 'dome';
  }
  if (asteroids.some(a => same(a, cell))) {
    return 'asteroid';
  }
  if (relays.some(r => same(r, cell))) {
    return 'occupied';
  }
  return null;
}

export function placeRelay(
  cell: Point,
  moduleId: ModuleId,
  energy: number,
  relays: Relay[],
  reactor: Point,
  domes: Point[],
  asteroids: Asteroid[],
  cols: number,
  rows: number,
  idSuffix: number,
): PlacementResult {
  const blockedBy = canPlaceAt(cell, reactor, domes, asteroids, relays, cols, rows);
  if (blockedBy) {
    return { ok: false, error: blockedBy, relays, energy };
  }
  const mod = MODULE_BY_ID[moduleId];
  if (energy < mod.cost) {
    return { ok: false, error: 'energy', relays, energy };
  }
  const id = 'relay-' + idSuffix;
  const next: Relay = {
    id,
    col: cell.col,
    row: cell.row,
    moduleId,
    range: mod.range,
  };
  return {
    ok: true,
    relays: relays.concat(next),
    energy: energy - mod.cost,
    placedId: id,
  };
}

/** Recycling refunds only half, so the budget strictly decreases and the round always ends. */
export function refundFor(moduleId: ModuleId): number {
  return Math.floor(MODULE_BY_ID[moduleId].cost * 0.5);
}

export function recycleRelay(
  relayId: string,
  relays: Relay[],
  energy: number,
): { relays: Relay[]; energy: number; refund: number } {
  const target = relays.find(r => r.id === relayId);
  if (!target) {
    return { relays, energy, refund: 0 };
  }
  const refund = refundFor(target.moduleId);
  return {
    relays: relays.filter(r => r.id !== relayId),
    energy: energy + refund,
    refund,
  };
}

/**
 * The round is lost the moment nothing can be afforded any more and a dome is
 * still dark. With a 48 budget and a 12 cost that is four blind taps.
 */
export function isCollapsed(
  energy: number,
  cheapestCost: number,
  allDomesPowered: boolean,
): boolean {
  return !allDomesPowered && energy < cheapestCost;
}
