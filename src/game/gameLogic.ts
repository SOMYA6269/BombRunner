// Core Bomb Runner game logic — pure state update functions
import {
  PLAYER_SPEED, BOMB_COUNTDOWN, BOMB_PASS_RADIUS,
  POWERUP_PICKUP_RADIUS, MAP_WIDTH, MAP_HEIGHT, CAMERA_LERP,
  VIEWPORT_W, VIEWPORT_H, RUN_FRAME_DURATION, IDLE_FRAME_DURATION,
  RUN_FRAMES, IDLE_FRAMES,
} from './constants';
import { resolveCollisions, clampToMap } from './collisionUtils';
import { COLLISION_RECTS } from './mapData';
import { SPAWN_POSITIONS } from './characters';
import type { LocalPlayer, LocalGameState, LocalPowerup } from '../lib/gameStore';
import type { CharacterId, PowerupId } from '../types/types';

export function distanceSq(ax: number, ay: number, bx: number, by: number): number {
  return (ax - bx) ** 2 + (ay - by) ** 2;
}

// ── Initial state factory ──────────────────────────────────────────────────────

export function createInitialPlayers(
  participants: Array<{ deviceId: string; username: string; characterId: CharacterId; isBot: boolean }>,
): LocalPlayer[] {
  return participants.map((p, i) => {
    const spawn = SPAWN_POSITIONS[i % SPAWN_POSITIONS.length];
    return {
      deviceId: p.deviceId,
      username: p.username,
      characterId: p.characterId,
      isBot: p.isBot,
      isAlive: true,
      hasBomb: false,
      posX: spawn.x + (Math.random() - 0.5) * 40,
      posY: spawn.y + (Math.random() - 0.5) * 40,
      vx: 0, vy: 0,
      facing: 'right',
      animState: 'idle',
      animClock: Math.random() * 500,
      activePowerup: null,
      powerupEndTime: 0,
      score: 0,
      ping: 0,
      shieldActive: false,
      frozenUntil: 0,
      botTargetX: spawn.x,
      botTargetY: spawn.y,
      botChangeTargetAt: Date.now(),
    };
  });
}

export function assignInitialBomb(players: LocalPlayer[]): { players: LocalPlayer[]; holderId: string } {
  const alive = players.filter(p => p.isAlive);
  const idx = Math.floor(Math.random() * alive.length);
  const holderId = alive[idx].deviceId;
  return {
    players: players.map(p => ({ ...p, hasBomb: p.deviceId === holderId, animState: p.deviceId === holderId ? 'carrying' : 'idle' })),
    holderId,
  };
}

// ── Local player movement ──────────────────────────────────────────────────────

export function moveLocalPlayer(
  player: LocalPlayer, jx: number, jy: number, dtMs: number,
): LocalPlayer {
  if (!player.isAlive) return player;
  const now = Date.now();
  if (player.frozenUntil > now) return player;

  const dt = Math.min(dtMs / 1000, 0.05);
  const speedMult = player.activePowerup === 'speed_boost' ? 1.6 : 1;
  const speed = PLAYER_SPEED * speedMult;

  const len = Math.sqrt(jx * jx + jy * jy) || 1;
  const nx = Math.abs(jx) + Math.abs(jy) > 0.08 ? jx / len : 0;
  const ny = Math.abs(jx) + Math.abs(jy) > 0.08 ? jy / len : 0;

  let px = player.posX + nx * speed * dt;
  let py = player.posY + ny * speed * dt;

  const clamped = clampToMap(px, py, MAP_WIDTH, MAP_HEIGHT);
  px = clamped.px; py = clamped.py;

  const resolved = resolveCollisions(px, py, COLLISION_RECTS);
  px = resolved.px; py = resolved.py;

  const isMoving = Math.abs(nx) > 0.05 || Math.abs(ny) > 0.05;
  const frameDur = isMoving ? RUN_FRAME_DURATION : IDLE_FRAME_DURATION;
  const frames   = isMoving ? RUN_FRAMES : IDLE_FRAMES;

  return {
    ...player,
    posX: px, posY: py,
    vx: nx * speed, vy: ny * speed,
    facing: nx < -0.05 ? 'left' : nx > 0.05 ? 'right' : player.facing,
    animState: player.hasBomb ? 'carrying' : isMoving ? 'running' : 'idle',
    animClock: (player.animClock + dtMs) % (frameDur * frames),
  };
}

// ── Bomb passing ───────────────────────────────────────────────────────────────

export function checkBombPass(
  players: LocalPlayer[],
): { players: LocalPlayer[]; notification: string | null; newHolder: string | null } {
  const holder = players.find(p => p.hasBomb && p.isAlive);
  if (!holder) return { players, notification: null, newHolder: null };

  for (const target of players) {
    if (target.deviceId === holder.deviceId || !target.isAlive) continue;
    if (target.shieldActive) continue;
    const d2 = distanceSq(holder.posX, holder.posY, target.posX, target.posY);
    if (d2 <= BOMB_PASS_RADIUS * BOMB_PASS_RADIUS) {
      const updated = players.map(p => {
        if (p.deviceId === holder.deviceId) return { ...p, hasBomb: false, animState: 'running' as const };
        if (p.deviceId === target.deviceId) return { ...p, hasBomb: true, animState: 'carrying' as const };
        return p;
      });
      return {
        players: updated,
        notification: `💣 Bomb passed to ${target.username}!`,
        newHolder: target.deviceId,
      };
    }
  }
  return { players, notification: null, newHolder: null };
}

// ── Powerup collection ──────────────────────────────────────────────────────────

export function checkPowerupPickup(
  player: LocalPlayer, powerups: LocalPowerup[],
): { player: LocalPlayer; powerups: LocalPowerup[]; collected: string | null } {
  if (!player.isAlive) return { player, powerups, collected: null };
  const now = Date.now();
  for (const pu of powerups) {
    if (pu.collected) continue;
    const d2 = distanceSq(player.posX, player.posY, pu.posX, pu.posY);
    if (d2 <= POWERUP_PICKUP_RADIUS * POWERUP_PICKUP_RADIUS) {
      const duration = POWERUP_DURATIONS[pu.type] ?? 6000;
      const updatedPlayer: LocalPlayer = {
        ...player,
        activePowerup: pu.type,
        powerupEndTime: now + duration,
        shieldActive: pu.type === 'shield' ? true : player.shieldActive,
      };
      const updatedPowerups = powerups.map(p =>
        p.id === pu.id ? { ...p, collected: true, respawnAt: now + 15000 } : p,
      );
      return { player: updatedPlayer, powerups: updatedPowerups, collected: pu.type };
    }
  }
  return { player, powerups, collected: null };
}

export const POWERUP_DURATIONS: Record<PowerupId, number> = {
  shield: 8000, speed_boost: 8000, freeze: 3000, extra_time: 0, ghost_dash: 5000,
};

// ── Powerup expiry ─────────────────────────────────────────────────────────────

export function tickPowerupExpiry(player: LocalPlayer): LocalPlayer {
  if (!player.activePowerup) return player;
  if (Date.now() >= player.powerupEndTime) {
    return { ...player, activePowerup: null, shieldActive: false };
  }
  return player;
}

// ── Explosion / elimination ─────────────────────────────────────────────────────

export function eliminatePlayer(
  players: LocalPlayer[], deviceId: string, eliminationCount: number,
): LocalPlayer[] {
  let elOrder = eliminationCount + 1;
  return players.map(p => {
    if (p.deviceId !== deviceId) return p;
    return { ...p, isAlive: false, hasBomb: false, animState: 'eliminated', eliminationOrder: elOrder };
  });
}

// ── Camera ─────────────────────────────────────────────────────────────────────

export function updateCamera(
  camX: number, camY: number,
  targetX: number, targetY: number,
  shakeIntensity: number,
): { camX: number; camY: number } {
  const halfW = VIEWPORT_W / 2;
  const halfH = VIEWPORT_H / 2;
  let cx = camX + (targetX - halfW - camX) * CAMERA_LERP;
  let cy = camY + (targetY - halfH - camY) * CAMERA_LERP;
  cx = Math.max(0, Math.min(MAP_WIDTH - VIEWPORT_W, cx));
  cy = Math.max(0, Math.min(MAP_HEIGHT - VIEWPORT_H, cy));
  if (shakeIntensity > 0) {
    cx += (Math.random() - 0.5) * shakeIntensity * 2;
    cy += (Math.random() - 0.5) * shakeIntensity * 2;
  }
  return { camX: cx, camY: cy };
}
