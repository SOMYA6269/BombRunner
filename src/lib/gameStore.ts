// Local game state store for an active match
import type { CharacterId, PowerupId } from '../types/types';

export interface LocalPlayer {
  deviceId: string;
  username: string;
  characterId: CharacterId;
  isBot: boolean;
  isAlive: boolean;
  hasBomb: boolean;
  posX: number;
  posY: number;
  vx: number;
  vy: number;
  facing: 'left' | 'right';
  animState: 'idle' | 'running' | 'carrying' | 'eliminated';
  animClock: number;
  activePowerup: PowerupId | null;
  powerupEndTime: number;
  score: number;
  ping: number;
  eliminationOrder?: number;
  shieldActive: boolean;
  frozenUntil: number;
  // Bot AI
  botTargetX: number;
  botTargetY: number;
  botChangeTargetAt: number;
}

export interface LocalPowerup {
  id: string;
  type: PowerupId;
  posX: number;
  posY: number;
  collected: boolean;
  respawnAt: number;
}

export interface LocalGameState {
  roomId: string;
  sessionId: string;
  myDeviceId: string;
  players: LocalPlayer[];
  powerups: LocalPowerup[];
  bombCountdown: number;
  bombHolderDeviceId: string | null;
  gamePhase: 'countdown' | 'playing' | 'explosion' | 'finished';
  countdownValue: number;      // 3..1
  explosionAt: LocalPlayer | null;
  explosionTime: number;
  winner: LocalPlayer | null;
  eliminationCount: number;
  cameraX: number;
  cameraY: number;
  cameraShakeIntensity: number;
  cameraShakeDuration: number;
  cameraShakeElapsed: number;
  fps: number;
  fpsAccumulator: number;
  fpsFrameCount: number;
  notification: string | null;
  notificationTime: number;
}
