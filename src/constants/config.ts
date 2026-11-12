import { Dimensions } from 'react-native';

/**
 * Splash hold. Exactly 8000 ms, timer driven, no tap-to-skip and no
 * "leave early when ready" path (game-common 2.1).
 */
export const LOADER_DURATION_MS = 8000;

/** Cross-fade used by the App-level screen switch. */
export const SCREEN_FADE_MS = 320;

/** Board geometry. */
export const COLS = 7;
export const ROWS = 9;
export const BOARD_FRAME = 8;

const win = Dimensions.get('window');
export const SCREEN_W = win.width;
export const SCREEN_H = win.height;

export const HEADER_TOP_PAD = 44;
export const HEADER_HEIGHT = 72;
export const HEADER_TOTAL = HEADER_TOP_PAD + HEADER_HEIGHT;

export const CONTROL_BAR_HEIGHT = 170;
export const CONTROL_BAR_BOTTOM = 24;

const boardMaxW = Math.min(SCREEN_W - 32, 380);
const cellFromW = Math.floor((boardMaxW - 2 * BOARD_FRAME) / COLS);
const availH =
  SCREEN_H - HEADER_TOTAL - CONTROL_BAR_HEIGHT - CONTROL_BAR_BOTTOM - 56;
const cellFromH = Math.floor((availH - 2 * BOARD_FRAME) / ROWS);

export const CELL = Math.max(26, Math.min(cellFromW, cellFromH));
export const BOARD_W = CELL * COLS + 2 * BOARD_FRAME;
export const BOARD_H = CELL * ROWS + 2 * BOARD_FRAME;

/** Level-select grid (3 x 4, never scrolls). */
export const GRID_MAX_W = Math.min(SCREEN_W - 32, 380);
export const GRID_FRAME = 8;
export const GRID_GAP = 10;
export const SECTOR_TILE = Math.floor(
  (GRID_MAX_W - 2 * GRID_FRAME - 2 * GRID_GAP) / 3,
);
export const GRID_W = SECTOR_TILE * 3 + 2 * GRID_GAP + 2 * GRID_FRAME;

/** Timings. */
export const DRIFT_INTERVAL_MS = 12000;
export const DRIFT_ANIM_MS = 420;
export const RESOLVE_MS = 900;
export const TICK_MS = 250;
export const TOAST_MS = 1400;
export const HINT_VISIBLE_MS = 6000;
export const BEAM_FLOW_MS = 900;

/** Springs. */
export const SPRING_UI = { tension: 60, friction: 9 };
export const SPRING_PRESS = { tension: 300, friction: 12 };
export const SPRING_DEPLOY = { tension: 180, friction: 8 };

/** Touch tolerance shared by every small target. */
export const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 };

/** Routing. */
export const REACTOR_RANGE = 3.0;
export const DOME_RANGE = 2.5;

export const TOTAL_SECTORS = 12;
export const STARS_PER_SECTOR = 3;
export const TOTAL_STARS = TOTAL_SECTORS * STARS_PER_SECTOR;
