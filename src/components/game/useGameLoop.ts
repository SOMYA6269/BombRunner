// useGameLoop — core game loop hook for Bomb Runner
import { useCallback, useEffect, useRef } from 'react';
import { BOMB_COUNTDOWN, POWERUP_POSITIONS } from '@/game/constants';
import {
  createInitialPlayers, assignInitialBomb,
  moveLocalPlayer, checkBombPass, checkPowerupPickup,
  tickPowerupExpiry, eliminatePlayer, updateCamera, distanceSq, POWERUP_DURATIONS,
} from '@/game/gameLogic';
import { updateBotPlayer } from '@/lib/botAI';
import type { LocalGameState, LocalPlayer, LocalPowerup } from '@/lib/gameStore';
import type { CharacterId, PowerupId } from '@/types/types';
import { MAP_WIDTH, MAP_HEIGHT, VIEWPORT_W, VIEWPORT_H, CAMERA_SHAKE_MAGNITUDE, CAMERA_SHAKE_DURATION, EXPLOSION_DURATION } from '@/game/constants';

export interface GameParticipant {
  deviceId: string; username: string; characterId: CharacterId; isBot: boolean;
}

interface GameLoopCallbacks {
  onStateUpdate: (state: LocalGameState) => void;
  onGameOver: (winner: LocalPlayer) => void;
}

export function useGameLoop(
  myDeviceId: string,
  participants: GameParticipant[],
  callbacks: GameLoopCallbacks,
) {
  const stateRef = useRef<LocalGameState | null>(null);
  const joystickRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const startedRef = useRef(false);

  const initPowerups = useCallback((): LocalPowerup[] => {
    return POWERUP_POSITIONS.map((p, i) => ({
      id: `pu_${i}`,
      type: (['shield', 'speed_boost', 'freeze', 'extra_time', 'ghost_dash'] as PowerupId[])[i % 5],
      posX: p.x, posY: p.y,
      collected: false, respawnAt: 0,
    }));
  }, []);

  const startGame = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const players = createInitialPlayers(participants);
    const { players: withBomb, holderId } = assignInitialBomb(players);
    const me = withBomb.find(p => p.deviceId === myDeviceId);
    const camX = me ? Math.max(0, Math.min(MAP_WIDTH - VIEWPORT_W, me.posX - VIEWPORT_W / 2)) : 0;
    const camY = me ? Math.max(0, Math.min(MAP_HEIGHT - VIEWPORT_H, me.posY - VIEWPORT_H / 2)) : 0;
    stateRef.current = {
      roomId: '', sessionId: '', myDeviceId,
      players: withBomb,
      powerups: initPowerups(),
      bombCountdown: BOMB_COUNTDOWN,
      bombHolderDeviceId: holderId,
      gamePhase: 'countdown',
      countdownValue: 3,
      explosionAt: null, explosionTime: 0,
      winner: null, eliminationCount: 0,
      cameraX: camX, cameraY: camY,
      cameraShakeIntensity: 0, cameraShakeDuration: 0, cameraShakeElapsed: 0,
      fps: 60, fpsAccumulator: 0, fpsFrameCount: 0,
      notification: null, notificationTime: 0,
    };
    // Start countdown phase then play
    setTimeout(() => {
      if (stateRef.current) stateRef.current = { ...stateRef.current, countdownValue: 2 };
    }, 1000);
    setTimeout(() => {
      if (stateRef.current) stateRef.current = { ...stateRef.current, countdownValue: 1 };
    }, 2000);
    setTimeout(() => {
      if (stateRef.current) stateRef.current = { ...stateRef.current, gamePhase: 'playing' };
    }, 3000);
    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
  }, [participants, myDeviceId, initPowerups]);

  const tick = useCallback((now: number) => {
    const dt = Math.min(now - lastTimeRef.current, 50);
    lastTimeRef.current = now;
    const state = stateRef.current;
    if (!state) { rafRef.current = requestAnimationFrame(tick); return; }
    if (state.gamePhase === 'finished') return;

    let s = { ...state };

    // FPS
    s.fpsAccumulator += dt;
    s.fpsFrameCount++;
    if (s.fpsAccumulator >= 500) {
      s.fps = Math.round((s.fpsFrameCount * 1000) / s.fpsAccumulator);
      s.fpsAccumulator = 0; s.fpsFrameCount = 0;
    }

    // Explosion animation
    if (s.gamePhase === 'explosion') {
      s.cameraShakeElapsed += dt;
      s.cameraShakeIntensity = Math.max(0, CAMERA_SHAKE_MAGNITUDE * (1 - s.cameraShakeElapsed / CAMERA_SHAKE_DURATION));
      if (s.cameraShakeElapsed >= EXPLOSION_DURATION) {
        s.gamePhase = 'playing';
        s.cameraShakeIntensity = 0;
        s.explosionAt = null;
      }
      stateRef.current = s;
      callbacks.onStateUpdate(s);
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    if (s.gamePhase !== 'playing') {
      stateRef.current = s;
      callbacks.onStateUpdate(s);
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    // Bomb countdown
    s.bombCountdown -= dt / 1000;

    // Powerup respawn
    const nowMs = Date.now();
    s.powerups = s.powerups.map(pu =>
      pu.collected && pu.respawnAt < nowMs ? { ...pu, collected: false } : pu,
    );

    // Update players
    let updatedPlayers: LocalPlayer[] = s.players.map(p => {
      if (!p.isAlive) return p;
      // Expire powerups
      let up = tickPowerupExpiry(p);
      // Move
      if (up.isBot) {
        up = updateBotPlayer(up, s, dt);
      } else if (up.deviceId === myDeviceId) {
        up = moveLocalPlayer(up, joystickRef.current.x, joystickRef.current.y, dt);
      }
      // Powerup pickup
      const puResult = checkPowerupPickup(up, s.powerups);
      up = puResult.player;
      s.powerups = puResult.powerups;
      return up;
    });

    // Bomb passing
    const passResult = checkBombPass(updatedPlayers);
    updatedPlayers = passResult.players;
    if (passResult.newHolder) {
      s.bombHolderDeviceId = passResult.newHolder;
      s.bombCountdown = BOMB_COUNTDOWN; // reset timer on pass
      s.notification = passResult.notification;
      s.notificationTime = nowMs;
    }

    // Clear old notification
    if (s.notification && nowMs - s.notificationTime > 2500) s.notification = null;

    // Bomb explodes
    if (s.bombCountdown <= 0) {
      const holder = updatedPlayers.find(p => p.hasBomb && p.isAlive);
      if (holder) {
        updatedPlayers = eliminatePlayer(updatedPlayers, holder.deviceId, s.eliminationCount);
        s.eliminationCount++;
        s.gamePhase = 'explosion';
        s.explosionAt = holder;
        s.explosionTime = nowMs;
        s.cameraShakeIntensity = CAMERA_SHAKE_MAGNITUDE;
        s.cameraShakeElapsed = 0;
        s.cameraShakeDuration = CAMERA_SHAKE_DURATION;
        s.notification = `💥 ${holder.username} exploded!`;
        s.notificationTime = nowMs;

        const alivePlayers = updatedPlayers.filter(p => p.isAlive);
        if (alivePlayers.length <= 1) {
          // Game over
          const winner = alivePlayers[0] ?? holder;
          s.winner = winner;
          s.gamePhase = 'finished';
          s.players = updatedPlayers;
          stateRef.current = s;
          callbacks.onStateUpdate(s);
          callbacks.onGameOver(winner);
          return;
        }
        // Assign bomb to new random alive player
        const newHolderIdx = Math.floor(Math.random() * alivePlayers.length);
        const newHolder = alivePlayers[newHolderIdx];
        updatedPlayers = updatedPlayers.map(p => ({
          ...p, hasBomb: p.deviceId === newHolder.deviceId && p.isAlive,
          animState: p.deviceId === newHolder.deviceId && p.isAlive ? 'carrying' : p.animState,
        }));
        s.bombHolderDeviceId = newHolder.deviceId;
        s.bombCountdown = BOMB_COUNTDOWN;
      }
    }

    s.players = updatedPlayers;

    // Camera follows local player
    const me = updatedPlayers.find(p => p.deviceId === myDeviceId);
    if (me && me.isAlive) {
      const cam = updateCamera(s.cameraX, s.cameraY, me.posX, me.posY, s.cameraShakeIntensity);
      s.cameraX = cam.camX; s.cameraY = cam.camY;
    }

    stateRef.current = s;
    callbacks.onStateUpdate(s);
    rafRef.current = requestAnimationFrame(tick);
  }, [myDeviceId, callbacks]);

  const setJoystick = useCallback((x: number, y: number) => {
    joystickRef.current = { x, y };
  }, []);

  const stopGame = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    startedRef.current = false;
    stateRef.current = null;
  }, []);

  const getState = useCallback(() => stateRef.current, []);

  return { startGame, stopGame, setJoystick, getState };
}
