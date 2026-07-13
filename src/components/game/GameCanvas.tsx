import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Text } from 'react-native';

import {
  BOMB_COUNTDOWN, BOMB_SPAWN, PLAYER_SIZE, PLAYER_SPAWN,
  VIEWPORT_W, VIEWPORT_H, MAP_WIDTH, MAP_HEIGHT,
} from '../../game/constants';
import { gameTick } from '../../game/gameLogic';
import type { GameState } from '../../game/types';
import { MAP_TILES, MAP_DECORATIONS } from '../../game/mapData';
import PlayerSprite from './PlayerSprite';
import {
  GrassFloor, AllTiles, AllDecorations,
} from './MapTileRenderer';

export interface JoystickRef { x: number; y: number }

interface GameCanvasProps {
  joystickRef: React.RefObject<JoystickRef>;
  isPausedRef: React.RefObject<boolean>;
  onTimerUpdate: (seconds: number) => void;
  onBombPickup: () => void;
  onGameOver: () => void;
  onAnimStateUpdate: (state: string, facing: string, clock: number, hasBomb: boolean) => void;
}

const INITIAL_STATE: GameState = {
  player: {
    x: PLAYER_SPAWN.x, y: PLAYER_SPAWN.y,
    vx: 0, vy: 0, facing: 'right',
    animState: 'idle', animClock: 0, hasBomb: false,
  },
  camera: {
    x: PLAYER_SPAWN.x - VIEWPORT_W / 2,
    y: PLAYER_SPAWN.y - VIEWPORT_H / 2,
    shakeIntensity: 0, shakeDuration: 0, shakeElapsed: 0,
  },
  bomb: {
    x: BOMB_SPAWN.x, y: BOMB_SPAWN.y,
    pickedUp: false, countdown: BOMB_COUNTDOWN,
    exploded: false, explosionTime: 0,
  },
  isPaused: false, isGameOver: false,
  fps: 60, fpsAccumulator: 0, fpsFrameCount: 0,
};

export default function GameCanvas({
  joystickRef, isPausedRef,
  onTimerUpdate, onBombPickup, onGameOver, onAnimStateUpdate,
}: GameCanvasProps) {
  const stateRef    = useRef<GameState>(INITIAL_STATE);
  const lastTimeRef = useRef<number | null>(null);
  const elapsedRef  = useRef(0);

  // Animated values for camera (world translate)
  const worldX = useRef(new Animated.Value(-(INITIAL_STATE.camera.x))).current;
  const worldY = useRef(new Animated.Value(-(INITIAL_STATE.camera.y))).current;

  // Player position
  const playerLeft = useRef(new Animated.Value(PLAYER_SPAWN.x - PLAYER_SIZE / 2)).current;
  const playerTop  = useRef(new Animated.Value(PLAYER_SPAWN.y - PLAYER_SIZE / 2)).current;

  // Bomb
  const bombLeft    = useRef(new Animated.Value(BOMB_SPAWN.x - 16)).current;
  const bombTop     = useRef(new Animated.Value(BOMB_SPAWN.y - 16)).current;
  const bombOpacity = useRef(new Animated.Value(1)).current;

  // Explosion
  const explodeLeft    = useRef(new Animated.Value(PLAYER_SPAWN.x - 80)).current;
  const explodeTop     = useRef(new Animated.Value(PLAYER_SPAWN.y - 80)).current;
  const explodeOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let rafId: number;
    let lastTimer = BOMB_COUNTDOWN;
    let lastPick  = false;
    let lastOver  = false;
    let animFrame = 0;

    const tick = (now: number) => {
      const dtMs = lastTimeRef.current === null ? 16.67 : Math.min(now - lastTimeRef.current, 50);
      lastTimeRef.current = now;
      elapsedRef.current += dtMs / 1000;

      const next = gameTick(
        { ...stateRef.current, isPaused: isPausedRef.current ?? false },
        joystickRef.current?.x ?? 0,
        joystickRef.current?.y ?? 0,
        VIEWPORT_W, VIEWPORT_H, dtMs,
      );
      stateRef.current = next;

      const t = elapsedRef.current;
      const cam = next.camera;
      const sx = cam.shakeIntensity > 0.5 ? Math.sin(t * 47.3) * cam.shakeIntensity : 0;
      const sy = cam.shakeIntensity > 0.5 ? Math.sin(t * 63.7) * cam.shakeIntensity : 0;

      worldX.setValue(-(cam.x + sx));
      worldY.setValue(-(cam.y + sy));
      playerLeft.setValue(next.player.x - PLAYER_SIZE / 2);
      playerTop.setValue(next.player.y - PLAYER_SIZE / 2);
      bombLeft.setValue(next.bomb.x - 16);
      bombTop.setValue(next.bomb.y - 16);
      bombOpacity.setValue(next.bomb.pickedUp || next.bomb.exploded ? 0 : 1);
      explodeLeft.setValue(next.player.x - 80);
      explodeTop.setValue(next.player.y - 80);
      explodeOpacity.setValue(next.bomb.exploded ? 1 : 0);

      // Push anim state to React every ~4 frames (60fps / 4 = 15fps for react re-renders)
      animFrame++;
      if (animFrame % 4 === 0) {
        onAnimStateUpdate(next.player.animState, next.player.facing, next.player.animClock, next.player.hasBomb);
      }

      const timer = Math.ceil(next.bomb.countdown);
      if (timer !== lastTimer) { lastTimer = timer; onTimerUpdate(timer); }
      if (next.bomb.pickedUp && !lastPick) { lastPick = true; onBombPickup(); }
      if (next.isGameOver    && !lastOver) { lastOver = true; onGameOver(); }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.viewport}>
      <Animated.View style={[styles.world, { transform: [{ translateX: worldX }, { translateY: worldY }] }]}>

        {/* Floor grass */}
        <GrassFloor mapW={MAP_WIDTH} mapH={MAP_HEIGHT} border={64} />

        {/* Border wall visual */}
        <View style={styles.borderWall} />

        {/* Decorations (behind tiles) */}
        <AllDecorations decorations={MAP_DECORATIONS} />

        {/* Collision tiles */}
        <AllTiles tiles={MAP_TILES} />

        {/* Bomb pickup — pure View/Text, safe inside Animated.View */}
        <Animated.View style={[styles.bombWrap, { left: bombLeft, top: bombTop, opacity: bombOpacity }]}>
          <View style={styles.bombBody}>
            <Text style={styles.bombEmoji}>💣</Text>
          </View>
        </Animated.View>

        {/* Explosion ring */}
        <Animated.View style={[styles.explosion, { left: explodeLeft, top: explodeTop, opacity: explodeOpacity }]} />

        {/* Player — React re-renders at ~15fps for sprite, position is animated */}
        <PlayerContainer playerLeft={playerLeft} playerTop={playerTop} stateRef={stateRef} />
      </Animated.View>
    </View>
  );
}

// Separate component so player sprite re-renders don't affect the world view
const PlayerContainer = React.memo(function PlayerContainer({
  playerLeft, playerTop, stateRef,
}: {
  playerLeft: Animated.Value;
  playerTop: Animated.Value;
  stateRef: React.RefObject<GameState>;
}) {
  const [anim, setAnim] = React.useState({
    animState: 'idle' as 'idle' | 'running',
    facing: 'right' as 'left' | 'right',
    animClock: 0,
    hasBomb: false,
  });

  // Update anim state from parent via interval
  useEffect(() => {
    const interval = setInterval(() => {
      const p = stateRef.current?.player;
      if (p) {
        setAnim({
          animState: p.animState,
          facing: p.facing,
          animClock: p.animClock,
          hasBomb: p.hasBomb,
        });
      }
    }, 66); // ~15fps
    return () => clearInterval(interval);
  }, [stateRef]);

  return (
    <Animated.View style={[styles.playerWrap, { left: playerLeft, top: playerTop }]}>
      <PlayerSprite
        size={PLAYER_SIZE}
        facing={anim.facing}
        animState={anim.animState}
        animClock={anim.animClock}
        hasBomb={anim.hasBomb}
      />
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  viewport: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1b5e20',
    overflow: 'hidden',
  },
  world: {
    position: 'absolute',
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
  },
  borderWall: {
    position: 'absolute',
    left: 0, top: 0,
    width: MAP_WIDTH, height: MAP_HEIGHT,
    borderWidth: 64,
    borderColor: '#455a64',
  },
  playerWrap: {
    position: 'absolute',
    width: PLAYER_SIZE,
    height: PLAYER_SIZE * 1.4,
  },
  bombWrap: {
    position: 'absolute',
    width: 40, height: 40,
    alignItems: 'center', justifyContent: 'center',
  },
  bombBody: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  bombEmoji: { fontSize: 26 },
  explosion: {
    position: 'absolute',
    width: 160, height: 160,
    borderRadius: 80,
    backgroundColor: '#FF6B00',
    opacity: 0,
  },
});
