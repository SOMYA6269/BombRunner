
// Core game update logic — all functions annotated as worklets
// so they can run on the Reanimated UI thread via useFrameCallback

import {
  BOMB_COUNTDOWN,
  BOMB_PICKUP_RADIUS,
  CAMERA_LERP,
  CAMERA_SHAKE_DURATION,
  CAMERA_SHAKE_MAGNITUDE,
  EXPLOSION_DURATION,
  FPS_UPDATE_INTERVAL,
  IDLE_FRAME_DURATION,
  IDLE_FRAMES,
  MAP_HEIGHT,
  MAP_WIDTH,
  PLAYER_SPEED,
  RUN_FRAME_DURATION,
  RUN_FRAMES,
} from './constants';
import { COLLISION_RECTS } from './mapData';
import type { BombState, CameraState, GameState, PlayerState } from './types';
import { clampToMap, dist, resolveCollisions } from './collisionUtils';

/** Normalise a 2-D vector; returns (0,0) for zero-length */
function normalise(x: number, y: number): { x: number; y: number } {
  const len = Math.sqrt(x * x + y * y);
  if (len < 0.0001) return { x: 0, y: 0 };
  return { x: x / len, y: y / len };
}

/** Linear interpolation */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// ─── Player update ─────────────────────────────────────────────────────────────

export function updatePlayer(
  player: PlayerState,
  joystickX: number,
  joystickY: number,
  dt: number,
): PlayerState {
  const { x: nx, y: ny } = normalise(joystickX, joystickY);
  const isMoving = nx !== 0 || ny !== 0;

  // Velocity
  const vx = nx * PLAYER_SPEED;
  const vy = ny * PLAYER_SPEED;

  // Proposed new position
  let px = player.x + vx * dt;
  let py = player.y + vy * dt;

  // Clamp within map first
  const clamped = clampToMap(px, py, MAP_WIDTH, MAP_HEIGHT);
  px = clamped.px;
  py = clamped.py;

  // Resolve solid collisions
  const resolved = resolveCollisions(px, py, COLLISION_RECTS);
  px = resolved.px;
  py = resolved.py;

  // Facing direction (only update when actually moving)
  const facing = nx < -0.1 ? 'left' : nx > 0.1 ? 'right' : player.facing;

  // Animation clock
  const animState = isMoving ? 'running' : 'idle';
  const frameDur = animState === 'running' ? RUN_FRAME_DURATION : IDLE_FRAME_DURATION;
  const frameCount = animState === 'running' ? RUN_FRAMES : IDLE_FRAMES;
  const animClock = (player.animClock + dt * 1000) % (frameDur * frameCount);

  return {
    ...player,
    x: px,
    y: py,
    vx,
    vy,
    facing,
    animState,
    animClock,
  };
}

// ─── Camera update ─────────────────────────────────────────────────────────────

export function updateCamera(
  camera: CameraState,
  targetX: number,
  targetY: number,
  screenW: number,
  screenH: number,
  dt: number,
): CameraState {
  // Ideal camera so player is at screen center
  const idealX = targetX - screenW / 2;
  const idealY = targetY - screenH / 2;

  // Clamp to map edges
  const clampedX = Math.max(0, Math.min(MAP_WIDTH  - screenW,  idealX));
  const clampedY = Math.max(0, Math.min(MAP_HEIGHT - screenH, idealY));

  const lerpFactor = 1 - Math.pow(1 - CAMERA_LERP, dt * 60);
  const cx = lerp(camera.x, clampedX, lerpFactor);
  const cy = lerp(camera.y, clampedY, lerpFactor);

  // Shake
  let shakeElapsed = camera.shakeElapsed;
  let shakeIntensity = camera.shakeIntensity;
  if (shakeElapsed < camera.shakeDuration) {
    shakeElapsed += dt * 1000;
    shakeIntensity = CAMERA_SHAKE_MAGNITUDE * (1 - shakeElapsed / camera.shakeDuration);
  } else {
    shakeIntensity = 0;
  }

  return {
    x: cx,
    y: cy,
    shakeIntensity,
    shakeDuration: camera.shakeDuration,
    shakeElapsed,
  };
}

/** Trigger camera shake */
export function triggerShake(camera: CameraState): CameraState {
  return {
    ...camera,
    shakeIntensity: CAMERA_SHAKE_MAGNITUDE,
    shakeDuration: CAMERA_SHAKE_DURATION,
    shakeElapsed: 0,
  };
}

// ─── Bomb update ───────────────────────────────────────────────────────────────

export function updateBomb(
  bomb: BombState,
  playerX: number,
  playerY: number,
  dt: number,
): BombState {
  if (bomb.exploded) {
    return {
      ...bomb,
      explosionTime: bomb.explosionTime + dt * 1000,
    };
  }

  if (!bomb.pickedUp) {
    // Check pickup
    const d = dist(playerX, playerY, bomb.x, bomb.y);
    if (d < BOMB_PICKUP_RADIUS) {
      return { ...bomb, pickedUp: true };
    }
    return bomb;
  }

  // Bomb is ticking
  const newCountdown = bomb.countdown - dt;
  if (newCountdown <= 0) {
    return {
      ...bomb,
      countdown: 0,
      exploded: true,
      explosionTime: 0,
    };
  }

  return { ...bomb, countdown: newCountdown };
}

// ─── FPS counter ───────────────────────────────────────────────────────────────

export function updateFps(
  state: GameState,
  dt: number,
): { fps: number; fpsAccumulator: number; fpsFrameCount: number } {
  const acc = state.fpsAccumulator + dt * 1000;
  const fc = state.fpsFrameCount + 1;

  if (acc >= FPS_UPDATE_INTERVAL) {
    return {
      fps: Math.round(fc / (acc / 1000)),
      fpsAccumulator: 0,
      fpsFrameCount: 0,
    };
  }
  return { fps: state.fps, fpsAccumulator: acc, fpsFrameCount: fc };
}

// ─── Full game tick ────────────────────────────────────────────────────────────

export function gameTick(
  state: GameState,
  joystickX: number,
  joystickY: number,
  screenW: number,
  screenH: number,
  dtMs: number,
): GameState {
  if (state.isPaused || state.isGameOver) return state;

  const dt = Math.min(dtMs / 1000, 0.05); // cap dt to 50ms

  const fpsResult = updateFps(state, dt);

  let player = updatePlayer(state.player, joystickX, joystickY, dt);

  // Bomb position follows player hand when picked up
  let bomb = updateBomb(state.bomb, player.x, player.y, dt);

  // Sync hasBomb flag onto player
  if (bomb.pickedUp !== player.hasBomb) {
    player = { ...player, hasBomb: bomb.pickedUp };
  }

  let camera = updateCamera(state.camera, player.x, player.y, screenW, screenH, dt);

  let isGameOver: boolean = state.isGameOver;

  // Explosion triggers camera shake + game over
  if (bomb.exploded && !state.bomb.exploded) {
    camera = triggerShake(camera);
    isGameOver = true;
  }

  // After explosion animation finishes, just keep game over state
  const explosionDone = bomb.exploded && bomb.explosionTime >= EXPLOSION_DURATION;

  return {
    ...state,
    player,
    camera,
    bomb,
    isGameOver: isGameOver || explosionDone,
    fps: fpsResult.fps,
    fpsAccumulator: fpsResult.fpsAccumulator,
    fpsFrameCount: fpsResult.fpsFrameCount,
  };
}
