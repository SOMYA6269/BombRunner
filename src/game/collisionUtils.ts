
// AABB collision utilities — all functions are worklet-compatible

import type { Rect } from './types';
import { PLAYER_HALF } from './constants';

/** Axis-Aligned Bounding Box overlap test */
export function aabbOverlap(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number,
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

/** Distance between two points */
export function dist(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx;
  const dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Resolve player AABB against all solid rects using separation vector.
 * Returns the corrected {px, py} after sliding collision.
 */
export function resolveCollisions(
  px: number,
  py: number,
  collisionRects: Rect[],
): { px: number; py: number } {
  const hw = PLAYER_HALF;
  const hh = PLAYER_HALF;

  let cx = px;
  let cy = py;

  // Run 2 iterations for corner smoothing
  for (let iter = 0; iter < 2; iter++) {
    for (let i = 0; i < collisionRects.length; i++) {
      const r = collisionRects[i];
      if (!aabbOverlap(cx - hw, cy - hh, hw * 2, hh * 2, r.x, r.y, r.w, r.h)) {
        continue;
      }
      // Compute overlap on each axis
      const overlapLeft  = (cx + hw) - r.x;
      const overlapRight = (r.x + r.w) - (cx - hw);
      const overlapTop   = (cy + hh) - r.y;
      const overlapBot   = (r.y + r.h) - (cy - hh);

      // Push out along axis of minimum penetration
      const minX = Math.min(overlapLeft, overlapRight);
      const minY = Math.min(overlapTop, overlapBot);

      if (minX < minY) {
        if (overlapLeft < overlapRight) {
          cx -= overlapLeft;
        } else {
          cx += overlapRight;
        }
      } else {
        if (overlapTop < overlapBot) {
          cy -= overlapTop;
        } else {
          cy += overlapBot;
        }
      }
    }
  }

  return { px: cx, py: cy };
}

/** Clamp player position inside map bounds */
export function clampToMap(
  px: number, py: number,
  mapW: number, mapH: number,
): { px: number; py: number } {
  return {
    px: Math.max(PLAYER_HALF, Math.min(mapW - PLAYER_HALF, px)),
    py: Math.max(PLAYER_HALF, Math.min(mapH - PLAYER_HALF, py)),
  };
}
