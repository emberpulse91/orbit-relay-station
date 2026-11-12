import { describe, expect, it } from '@jest/globals';
import {
  BOARD_H,
  BOARD_W,
  BOARD_FRAME,
  CELL,
  COLS,
  HIT_SLOP,
  ROWS,
  SCREEN_W,
  SECTOR_TILE,
} from '../src/constants/config';

describe('touch targets and board geometry', () => {
  it('gives every small target a press tolerance', () => {
    expect(HIT_SLOP.top).toBeGreaterThanOrEqual(8);
    expect(HIT_SLOP.left).toBeGreaterThanOrEqual(8);
  });

  it('keeps the board inside the viewport with zero overflow', () => {
    expect(BOARD_W).toBe(CELL * COLS + 2 * BOARD_FRAME);
    expect(BOARD_H).toBe(CELL * ROWS + 2 * BOARD_FRAME);
    expect(BOARD_W).toBeLessThanOrEqual(SCREEN_W);
  });

  it('keeps sector tiles comfortably tappable', () => {
    expect(SECTOR_TILE).toBeGreaterThanOrEqual(48);
  });

  it('never collapses a cell below a usable size', () => {
    expect(CELL).toBeGreaterThanOrEqual(26);
  });
});
