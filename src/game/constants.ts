// Game-wide constants

// Map
export const MAP_WIDTH  = 3200;
export const MAP_HEIGHT = 2400;
export const TILE_SIZE  = 64;

// Logical viewport (16:9 landscape)
export const VIEWPORT_W = 900;
export const VIEWPORT_H = 500;

// Player
export const PLAYER_SIZE  = 48;
export const PLAYER_SPEED = 240; // px per second
export const PLAYER_HALF  = PLAYER_SIZE / 2;

// Camera
export const CAMERA_LERP            = 0.10;
export const CAMERA_SHAKE_MAGNITUDE = 14;
export const CAMERA_SHAKE_DURATION  = 600; // ms

// Bomb
export const BOMB_SIZE         = 32;
export const BOMB_PICKUP_RADIUS = 52;
export const BOMB_COUNTDOWN    = 20; // seconds
export const EXPLOSION_RADIUS  = 120;
export const EXPLOSION_DURATION = 900; // ms

// Spawn positions
export const PLAYER_SPAWN = { x: 1600, y: 1200 };
export const BOMB_SPAWN   = { x: 1900, y:  900 };

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
