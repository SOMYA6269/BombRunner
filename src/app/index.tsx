import React, { useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import GameCanvas, { JoystickRef } from '../components/game/GameCanvas';
import GameUI from '../components/game/GameUI';
import VirtualJoystick from '../components/game/VirtualJoystick';
import { BOMB_COUNTDOWN } from '../game/constants';

export default function GameScreen() {
  const joystickRef = useRef<JoystickRef>({ x: 0, y: 0 });
  const isPausedRef = useRef<boolean>(false);

  const [timerSeconds, setTimerSeconds] = useState(BOMB_COUNTDOWN);
  const [bombPickedUp, setBombPickedUp] = useState(false);
  const [isPaused, setIsPaused]         = useState(false);
  const [isGameOver, setIsGameOver]     = useState(false);

  const handleTimerUpdate  = useCallback((v: number) => setTimerSeconds(v), []);
  const handleBombPickup   = useCallback(() => setBombPickedUp(true), []);
  const handleGameOver     = useCallback(() => setIsGameOver(true), []);
  const handleAnimState    = useCallback((_s: string, _f: string, _c: number, _b: boolean) => {}, []);

  const handlePause = useCallback(() => {
    setIsPaused(true);
    isPausedRef.current = true;
  }, []);
  const handleResume = useCallback(() => {
    setIsPaused(false);
    isPausedRef.current = false;
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar hidden />

      {/* Game world */}
      <GameCanvas
        joystickRef={joystickRef}
        isPausedRef={isPausedRef}
        onTimerUpdate={handleTimerUpdate}
        onBombPickup={handleBombPickup}
        onGameOver={handleGameOver}
        onAnimStateUpdate={handleAnimState}
      />

      {/* HUD */}
      <GameUI
        timerSeconds={timerSeconds}
        bombPickedUp={bombPickedUp}
        isPaused={isPaused}
        isGameOver={isGameOver}
        onPause={handlePause}
        onResume={handleResume}
      />

      {/* Bottom controls */}
      <View style={styles.controls} pointerEvents="box-none">
        {/* Joystick — bottom left */}
        <View style={styles.joystickArea}>
          <VirtualJoystick joystickRef={joystickRef} />
        </View>

        {/* Action button — bottom right */}
        <View style={styles.actionArea}>
          <Pressable
            style={styles.actionBtn}
            onPress={() => {}}
          >
            <Text style={styles.actionEmoji}>💣</Text>
            <Text style={styles.actionLabel}>THROW</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#1b5e20' },
  controls: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 140,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  joystickArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtn: {
    width: 80, height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,80,80,0.82)',
    borderWidth: 3,
    borderColor: 'rgba(255,160,160,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF3333',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  actionBtnPressed: {
    backgroundColor: 'rgba(200,40,40,0.9)',
  },
  actionEmoji: { fontSize: 28 },
  actionLabel: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 1,
  },
});
