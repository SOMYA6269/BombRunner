import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ActivityIndicator, useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { getOrCreateProfile } from '@/lib/playerStore';
import { getRoomPlayers } from '@/db/api';
import { CHARACTERS } from '@/game/characters';
import { useGameLoop, GameParticipant } from '@/components/game/useGameLoop';
import { GameCanvas } from '@/components/game/GameCanvas';
import { GameUI } from '@/components/game/GameUI';
import VirtualJoystick from '@/components/game/VirtualJoystick';
import AbilityButtons from '@/components/game/AbilityButtons';
import type { LocalGameState, LocalPlayer } from '@/lib/gameStore';
import type { PowerupId } from '@/types/types';
import { VIEWPORT_W, VIEWPORT_H } from '@/game/constants';

// ── GameView: mounts once with resolved participants ────────────────────────────
function GameView({
  myDeviceId, participants, onGameOver,
}: {
  myDeviceId: string;
  participants: GameParticipant[];
  onGameOver: (winner: LocalPlayer) => void;
}) {
  const { width: screenW, height: screenH } = useWindowDimensions();
  const [gameState, setGameState] = useState<LocalGameState | null>(null);
  const [paused, setPaused] = useState(false);
  const router = useRouter();

  const scale = Math.min(screenW / VIEWPORT_W, screenH / VIEWPORT_H);

  const { startGame, stopGame, setJoystick } = useGameLoop(
    myDeviceId,
    participants,
    { onStateUpdate: setGameState, onGameOver },
  );

  useEffect(() => {
    startGame();
    return () => stopGame();
  }, []);

  const handleJoystick = useCallback((x: number, y: number) => setJoystick(x, y), [setJoystick]);

  const me = gameState?.players.find(p => p.deviceId === myDeviceId);

  if (!gameState) {
    return (
      <View style={s.loadWrap}>
        <ActivityIndicator color="#FFB800" size="large" />
        <Text style={s.loadText}>Launching match...</Text>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <StatusBar hidden />
      {/* Game world */}
      <View style={[s.gameArea, { transform: [{ scale }] }]}>
        <View style={{ width: VIEWPORT_W, height: VIEWPORT_H }}>
          <GameCanvas state={gameState} />
          <GameUI state={gameState} onPause={() => setPaused(true)} />
        </View>
      </View>

      {/* Controls */}
      <View style={s.controls} pointerEvents="box-none">
        <View style={s.joystickArea}>
          <VirtualJoystick onMove={handleJoystick} />
        </View>
        <View style={s.abilityArea}>
          <AbilityButtons
            activePowerup={me?.activePowerup ?? null}
            powerupEndTime={me?.powerupEndTime ?? 0}
            onUseAbility={(_: PowerupId) => {}}
          />
        </View>
      </View>

      {/* Pause */}
      {paused && (
        <View style={s.pauseModal}>
          <View style={s.pauseCard}>
            <Text style={s.pauseTitle}>⏸ PAUSED</Text>
            <Pressable style={s.pauseBtn} onPress={() => setPaused(false)}>
              <Text style={s.pauseBtnText}>▶ RESUME</Text>
            </Pressable>
            <Pressable style={[s.pauseBtn, s.quitBtn]} onPress={() => { stopGame(); router.replace('/(app)/home' as never); }}>
              <Text style={s.pauseBtnText}>🚪 QUIT</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

// ── Screen: loads participants then mounts GameView ────────────────────────────
export default function GameScreen() {
  const { roomId } = useLocalSearchParams<{ roomId?: string }>();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [myDeviceId, setMyDeviceId] = useState('');
  const [participants, setParticipants] = useState<GameParticipant[]>([]);

  useEffect(() => {
    (async () => {
      const profile = await getOrCreateProfile();
      setMyDeviceId(profile.deviceId);
      let parts: GameParticipant[] = [];
      if (roomId) {
        const rp = await getRoomPlayers(roomId);
        parts = rp.map(p => ({
          deviceId: p.deviceId, username: p.username,
          characterId: p.characterId, isBot: p.isBot,
        }));
      }
      if (parts.length === 0) {
        const allChars = Object.keys(CHARACTERS);
        parts = [
          { deviceId: profile.deviceId, username: profile.username, characterId: profile.selectedCharacter, isBot: false },
          ...Array.from({ length: 7 }, (_, i) => ({
            deviceId: `bot_${i}`,
            username: ['BotNova','BotBlaze','BotShadow','BotFlash','BotZed','BotHunter','BotSpeedy'][i],
            characterId: allChars[(i + 1) % allChars.length] as any,
            isBot: true,
          })),
        ];
      }
      setParticipants(parts);
      setReady(true);
    })();
  }, []);

  const handleGameOver = useCallback((winner: LocalPlayer) => {
    setTimeout(() => {
      router.replace({
        pathname: '/(app)/victory',
        params: {
          winnerName: winner.username,
          winnerChar: winner.characterId,
          isMe: winner.deviceId === myDeviceId ? '1' : '0',
        },
      } as never);
    }, 1800);
  }, [router, myDeviceId]);

  if (!ready) {
    return (
      <View style={s.loadWrap}>
        <StatusBar hidden />
        <ActivityIndicator color="#FFB800" size="large" />
        <Text style={s.loadText}>Loading arena...</Text>
      </View>
    );
  }

  return (
    <GameView myDeviceId={myDeviceId} participants={participants} onGameOver={handleGameOver} />
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B1629', alignItems: 'center', justifyContent: 'center' },
  gameArea: { alignItems: 'center', justifyContent: 'center' },
  controls: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 140, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 20, paddingBottom: 16 },
  joystickArea: {},
  abilityArea: { paddingBottom: 8 },
  loadWrap: { flex: 1, backgroundColor: '#0B1629', alignItems: 'center', justifyContent: 'center', gap: 16 },
  loadText: { color: '#FFB800', fontSize: 16, fontWeight: '700' },
  pauseModal: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.75)', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  pauseCard: { backgroundColor: '#132040', borderRadius: 20, padding: 32, gap: 16, alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)', minWidth: 200 },
  pauseTitle: { color: '#FFB800', fontSize: 24, fontWeight: '900' },
  pauseBtn: { backgroundColor: '#2563EB', borderRadius: 12, paddingHorizontal: 32, paddingVertical: 14, width: 180, alignItems: 'center' },
  quitBtn: { backgroundColor: '#EF4444' },
  pauseBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});
