// Core game types shared across all modules

export interface Vec2 {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type AnimationState = 'idle' | 'running';

export type FacingDirection = 'left' | 'right';

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: FacingDirection;
  animState: AnimationState;
  animClock: number; // milliseconds, used for animation frames
  hasBomb: boolean;
}

export interface CameraState {
  x: number;
  y: number;
  shakeIntensity: number;
  shakeDuration: number;
  shakeElapsed: number;
}

export interface BombState {
  x: number;
  y: number;
  pickedUp: boolean;
  countdown: number;       // seconds remaining
  exploded: boolean;
  explosionTime: number;   // ms elapsed since explosion
}

export interface GameState {
  player: PlayerState;
  camera: CameraState;
  bomb: BombState;
  isPaused: boolean;
  isGameOver: boolean;
  fps: number;
  fpsAccumulator: number;
  fpsFrameCount: number;
}

export interface MapTile {
  rect: Rect;
  type: 'wall' | 'crate';
}

export interface MapDecoration {
  x: number;
  y: number;
  type: 'tree' | 'bush' | 'ladder' | 'rock' | 'water' | 'flower' | 'bridge_h' | 'bridge_v' | 'sign';
  scale?: number;
  variant?: number; // 0-3 for colour/shape variety
}
