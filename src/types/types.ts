// Global app types

export type CharacterId = 'playerone' | 'speedy' | 'shadow' | 'blaze' | 'hunter' | 'flash' | 'nova' | 'zed';
export type PowerupId = 'shield' | 'speed_boost' | 'freeze' | 'extra_time' | 'ghost_dash';
export type GameStatus = 'waiting' | 'countdown' | 'playing' | 'finished';
export type AnimState = 'idle' | 'running' | 'carrying' | 'eliminated';
export type FacingDir = 'left' | 'right';

export interface PlayerProfile {
  deviceId: string;
  username: string;
  coins: number;
  gems: number;
  level: number;
  xp: number;
  selectedCharacter: CharacterId;
  wins: number;
  matches: number;
  eliminations: number;
  rating: number;
}

export interface RoomPlayer {
  id?: string;
  roomId: string;
  deviceId: string;
  username: string;
  characterId: CharacterId;
  isReady: boolean;
  isBot: boolean;
  isAlive: boolean;
  hasBomb: boolean;
  posX: number;
  posY: number;
  facing: FacingDir;
  animState: AnimState;
  score: number;
  eliminationOrder?: number;
  activePowerup?: PowerupId | null;
  powerupExpiresAt?: string | null;
  ping: number;
}

export interface Room {
  id: string;
  roomCode: string;
  hostDeviceId: string;
  status: GameStatus;
  mapName: string;
  maxPlayers: number;
  createdAt: string;
  updatedAt: string;
}

export interface GameSession {
  id: string;
  roomId: string;
  winnerDeviceId?: string;
  winnerUsername?: string;
  bombHolderDeviceId?: string;
  bombCountdown: number;
  startedAt: string;
  endedAt?: string;
  updatedAt: string;
}

export interface ShopItem {
  id: string;
  type: 'character' | 'bomb_skin' | 'trail' | 'emote';
  name: string;
  description: string;
  price: number;
  currency: 'coins' | 'gems';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  preview?: string;
}

export interface Mission {
  id: string;
  type: 'daily' | 'weekly' | 'achievement';
  title: string;
  description: string;
  goal: number;
  rewardCoins: number;
  rewardGems?: number;
}

export interface LeaderboardEntry {
  deviceId: string;
  rank: number;
  username: string;
  characterId: CharacterId;
  wins: number;
  matches: number;
  winRate: number;
  rating: number;
  isMe: boolean;
}
