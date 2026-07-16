// Game-wide constants for Bomb Runner

// Map
export const MAP_WIDTH  = 3200;
export const MAP_HEIGHT = 2400;
export const TILE_SIZE  = 64;

// Logical viewport (16:9 landscape)
export const VIEWPORT_W = 900;
export const VIEWPORT_H = 500;

// Player
export const PLAYER_SIZE  = 48;
export const PLAYER_SPEED = 220; // px per second
export const PLAYER_HALF  = PLAYER_SIZE / 2;
export const BOMB_PASS_RADIUS = 56; // touch distance to pass bomb

// Camera
export const CAMERA_LERP            = 0.10;
export const CAMERA_SHAKE_MAGNITUDE = 16;
export const CAMERA_SHAKE_DURATION  = 700; // ms

// Bomb
export const BOMB_SIZE         = 32;
export const BOMB_COUNTDOWN    = 20; // seconds
export const EXPLOSION_RADIUS  = 140;
export const EXPLOSION_DURATION = 900; // ms

// Powerup
export const POWERUP_SPAWN_INTERVAL = 15000; // ms
export const POWERUP_PICKUP_RADIUS  = 44;
export const POWERUP_POSITIONS: Array<{ x: number; y: number }> = [
  { x: 800,  y: 600  },
  { x: 2400, y: 600  },
  { x: 800,  y: 1800 },
  { x: 2400, y: 1800 },
  { x: 1600, y: 700  },
  { x: 1600, y: 1700 },
];

// Animation
export const IDLE_FRAME_DURATION = 500;
export const RUN_FRAME_DURATION  = 110;
export const IDLE_FRAMES = 2;
export const RUN_FRAMES  = 4;

// Joystick
export const JOYSTICK_BASE_RADIUS = 60;
export const JOYSTICK_KNOB_RADIUS = 26;
export const JOYSTICK_DEADZONE    = 0.08;

// FPS
export const FPS_UPDATE_INTERVAL = 500;

// Bot AI
export const BOT_SPEED_MULTIPLIER = 0.75;
export const BOT_UPDATE_INTERVAL  = 16; // ms
