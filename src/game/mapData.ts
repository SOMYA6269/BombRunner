// Ancient Ruins arena — Bomb Runner map data
import type { Rect } from './types';
import { TILE_SIZE, MAP_WIDTH, MAP_HEIGHT } from './constants';

export type TileType =
  | 'grass' | 'stone_path' | 'stone_wall' | 'water'
  | 'bush' | 'crate' | 'barrel' | 'pillar'
  | 'torch' | 'powerup_spawn' | 'grass_dark' | 'decoration';

export interface GameMapTile {
  x: number; y: number;
  type: TileType;
  solid: boolean;
}

const COLS = MAP_WIDTH / TILE_SIZE;   // 50
const ROWS = MAP_HEIGHT / TILE_SIZE;  // 37

function tile(col: number, row: number, type: TileType, solid = false): GameMapTile {
  return { x: col * TILE_SIZE, y: row * TILE_SIZE, type, solid };
}

// ── Ground layer ──────────────────────────────────────────────────────────────
export const GROUND_TILES: GameMapTile[] = [];

for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    if (r === 0 || r >= ROWS - 1 || c === 0 || c >= COLS - 1) {
      GROUND_TILES.push(tile(c, r, 'stone_wall', false)); continue;
    }
    if (r === Math.floor(ROWS / 2) || c === Math.floor(COLS / 2)) {
      GROUND_TILES.push(tile(c, r, 'stone_path', false)); continue;
    }
    if ((r === 5 || r === ROWS - 6) && c >= 5 && c <= COLS - 6) {
      GROUND_TILES.push(tile(c, r, 'stone_path', false)); continue;
    }
    if ((c === 5 || c === COLS - 6) && r >= 5 && r <= ROWS - 6) {
      GROUND_TILES.push(tile(c, r, 'stone_path', false)); continue;
    }
    if ((r + c) % 20 === 0 || (r - c + COLS) % 22 === 0) {
      GROUND_TILES.push(tile(c, r, 'stone_path', false)); continue;
    }
    if ((r * 7 + c * 3) % 11 === 0) {
      GROUND_TILES.push(tile(c, r, 'grass_dark', false)); continue;
    }
    GROUND_TILES.push(tile(c, r, 'grass', false));
  }
}

// ── Decorative & solid objects ─────────────────────────────────────────────────
export const DECOR_TILES: GameMapTile[] = [];

const WALL_POSITIONS: Array<[number, number]> = [
  [8,4],[9,4],[10,4],[30,4],[31,4],[32,4],
  [8,32],[9,32],[10,32],[30,32],[31,32],[32,32],
  [4,8],[4,9],[4,10],[4,24],[4,25],[4,26],
  [45,8],[45,9],[45,10],[45,24],[45,25],[45,26],
  [15,10],[16,10],[15,11],[33,10],[34,10],[34,11],
  [15,26],[16,26],[15,25],[33,26],[34,26],[34,25],
  [22,8],[23,8],[24,8],[25,8],[22,28],[23,28],[24,28],[25,28],
  [8,18],[8,19],[41,18],[41,19],
  [20,14],[21,14],[20,22],[21,22],[28,14],[29,14],[28,22],[29,22],
];
for (const [c, r] of WALL_POSITIONS)
  DECOR_TILES.push({ x: c * TILE_SIZE, y: r * TILE_SIZE, type: 'stone_wall', solid: true });

const PILLAR_POSITIONS: Array<[number, number]> = [
  [12,12],[37,12],[12,24],[37,24],[18,6],[31,6],[18,30],[31,30],[24,3],[24,33],
];
for (const [c, r] of PILLAR_POSITIONS)
  DECOR_TILES.push({ x: c * TILE_SIZE, y: r * TILE_SIZE, type: 'pillar', solid: true });

const CRATE_POSITIONS: Array<[number, number]> = [
  [7,7],[7,8],[42,7],[42,8],[7,28],[7,29],[42,28],[42,29],
  [14,18],[14,19],[35,18],[35,19],[19,13],[19,23],[30,13],[30,23],
  [24,16],[24,20],[25,16],[25,20],
];
for (const [c, r] of CRATE_POSITIONS)
  DECOR_TILES.push({ x: c * TILE_SIZE, y: r * TILE_SIZE, type: 'crate', solid: true });

const BARREL_POSITIONS: Array<[number, number]> = [
  [11,7],[38,7],[11,29],[38,29],[6,16],[43,16],[6,20],[43,20],
  [22,11],[27,11],[22,25],[27,25],
];
for (const [c, r] of BARREL_POSITIONS)
  DECOR_TILES.push({ x: c * TILE_SIZE, y: r * TILE_SIZE, type: 'barrel', solid: true });

const BUSH_POSITIONS: Array<[number, number]> = [
  [3,3],[4,3],[46,3],[47,3],[3,33],[4,33],[46,33],[47,33],
  [16,8],[33,8],[16,28],[33,28],[20,5],[29,5],[20,31],[29,31],
  [10,16],[10,20],[39,16],[39,20],[23,15],[26,15],[23,21],[26,21],
];
for (const [c, r] of BUSH_POSITIONS)
  DECOR_TILES.push({ x: c * TILE_SIZE, y: r * TILE_SIZE, type: 'bush', solid: false });

const TORCH_POSITIONS: Array<[number, number]> = [
  [12,4],[37,4],[12,32],[37,32],[4,12],[4,24],[45,12],[45,24],[24,12],[24,24],
];
for (const [c, r] of TORCH_POSITIONS)
  DECOR_TILES.push({ x: c * TILE_SIZE, y: r * TILE_SIZE, type: 'torch', solid: false });

const PUP_POSITIONS: Array<[number, number]> = [
  [12,18],[37,18],[24,10],[24,26],[18,18],[31,18],
];
for (const [c, r] of PUP_POSITIONS)
  DECOR_TILES.push({ x: c * TILE_SIZE, y: r * TILE_SIZE, type: 'powerup_spawn', solid: false });

export const POND_RECTS: Rect[] = [
  { x: 2 * TILE_SIZE, y: 14 * TILE_SIZE, w: 2 * TILE_SIZE, h: 4 * TILE_SIZE },
  { x: 46 * TILE_SIZE, y: 14 * TILE_SIZE, w: 2 * TILE_SIZE, h: 4 * TILE_SIZE },
  { x: 22 * TILE_SIZE, y: 1 * TILE_SIZE, w: 6 * TILE_SIZE, h: 2 * TILE_SIZE },
  { x: 22 * TILE_SIZE, y: 34 * TILE_SIZE, w: 6 * TILE_SIZE, h: 2 * TILE_SIZE },
];

// ── Collision rects (Rect[] compatible with resolveCollisions) ─────────────────
export const COLLISION_RECTS: Rect[] = [
  // Border walls
  { x: 0, y: 0, w: MAP_WIDTH, h: TILE_SIZE },
  { x: 0, y: MAP_HEIGHT - TILE_SIZE, w: MAP_WIDTH, h: TILE_SIZE },
  { x: 0, y: 0, w: TILE_SIZE, h: MAP_HEIGHT },
  { x: MAP_WIDTH - TILE_SIZE, y: 0, w: TILE_SIZE, h: MAP_HEIGHT },
  // Solid objects
  ...[...WALL_POSITIONS, ...PILLAR_POSITIONS, ...CRATE_POSITIONS, ...BARREL_POSITIONS].map(
    ([c, r]) => ({ x: c * TILE_SIZE, y: r * TILE_SIZE, w: TILE_SIZE, h: TILE_SIZE }),
  ),
];

