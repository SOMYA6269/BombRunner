import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { getOrCreateProfile } from '@/lib/playerStore';
import { CHARACTERS } from '@/game/characters';
import { createRoom, joinRoom, addPlayerToRoom, addBotPlayersToRoom, getRoomPlayers, setPlayerReady, updateRoomStatus, createGameSession } from '@/db/api';
import type { Room, RoomPlayer } from '@/types/types';

const HOW_TO_PLAY = [
  { num: '1', title: 'RANDOM PLAYER GETS THE BOMB', body: 'A random player starts with the bomb and the timer begins.' },
  { num: '2', title: 'TOUCH TO PASS', body: 'Run into any other player to instantly pass the bomb.' },
  { num: '3', title: 'TIME IS RUNNING', body: 'The timer keeps running. Pass the bomb before time runs out!' },
  { num: '4', title: 'TIME OUT = BLAST', body: 'If you can\'t pass the bomb before time ends, you explode!' },
  { num: '5', title: 'LAST PLAYER WINS', body: 'Keep passing, survive and be the last one standing to win!' },
];

const POWERUPS_INFO = [
  { icon: '⚡', name: 'SPEED BOOST', desc: 'Run faster for 8 seconds' },
  { icon: '🛡', name: 'SHIELD', desc: 'Protects from one bomb pass' },
  { icon: '❄️', name: 'FREEZE', desc: 'Freeze others for 3 seconds' },
  { icon: '⏰', name: 'EXTRA TIME', desc: 'Add 5 seconds to the timer' },
];

export default function LobbyScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<'select' | 'waiting'>('select');
  const [mode, setMode] = useState<'quick' | 'create' | 'join'>('quick');
  const [joinCode, setJoinCode] = useState('');
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [error, setError] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }, []);

  const startPolling = useCallback((roomId: string) => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      const updated = await getRoomPlayers(roomId);
      setPlayers(updated);
    }, 1500);
  }, [stopPolling]);

  useEffect(() => () => stopPolling(), [stopPolling]);

  const handleEnterRoom = async (r: Room) => {
    const profile = await getOrCreateProfile();
    await addPlayerToRoom(r.id, profile.deviceId, profile.username, profile.selectedCharacter);
    // Fill with bots up to 8
    const existing = await getRoomPlayers(r.id);
    const botCount = Math.max(0, 8 - existing.length);
    if (botCount > 0) await addBotPlayersToRoom(r.id, botCount, existing.length);
    const allPlayers = await getRoomPlayers(r.id);
    setRoom(r);
    setPlayers(allPlayers);
    setPhase('waiting');
    startPolling(r.id);
  };

  const handleQuickPlay = async () => {
    setLoading(true); setError('');
    try {
      const profile = await getOrCreateProfile();
      const r = await createRoom(profile.deviceId);
      if (!r) { setError('Failed to create room. Try again.'); setLoading(false); return; }
      await handleEnterRoom(r);
    } catch (e) { setError('Network error. Please retry.'); }
    setLoading(false);
  };

  const handleCreateRoom = async () => {
    setLoading(true); setError('');
    try {
      const profile = await getOrCreateProfile();
      const r = await createRoom(profile.deviceId);
      if (!r) { setError('Failed to create room.'); setLoading(false); return; }
      await handleEnterRoom(r);
    } catch (e) { setError('Network error.'); }
    setLoading(false);
  };

  const handleJoinRoom = async () => {
    if (joinCode.length < 4) { setError('Enter a valid room code.'); return; }
    setLoading(true); setError('');
    try {
      const r = await joinRoom(joinCode.trim());
      if (!r) { setError('Room not found or already started.'); setLoading(false); return; }
      await handleEnterRoom(r);
    } catch (e) { setError('Network error.'); }
    setLoading(false);
  };

  const handleStartGame = async () => {
    if (!room) return;
    setLoading(true);
    await updateRoomStatus(room.id, 'countdown');
    await createGameSession(room.id);
    stopPolling();
    setLoading(false);
    // Countdown 3-2-1
    setCountdown(3);
    let c = 3;
    const cd = setInterval(() => {
      c--;
      if (c <= 0) {
        clearInterval(cd);
        setCountdown(null);
        router.replace({
          pathname: '/(app)/game',
          params: { roomId: room.id },
        } as never);
      } else {
        setCountdown(c);
      }
    }, 1000);
  };

  return (
    <View style={s.root}>
      <StatusBar hidden />

      {/* Header */}
      <View style={s.header}>
        <Pressable style={s.backBtn} onPress={() => { stopPolling(); router.back(); }}>
          <Text style={s.backText}>← BACK</Text>
        </Pressable>
        <Text style={s.headerTitle}>
          {phase === 'select' ? '🚪 FIND A MATCH' : `🚪 ROOM ${room?.roomCode}`}
        </Text>
        {room && (
          <View style={s.roomCodeChip}>
            <Text style={s.roomCodeText}>{room.roomCode}</Text>
          </View>
        )}
      </View>

      {/* Countdown overlay */}
      {countdown !== null && (
        <View style={s.countdownOverlay}>
          <Text style={s.countdownNum}>{countdown}</Text>
          <Text style={s.countdownLabel}>MATCH STARTING</Text>
        </View>
      )}

      <View style={s.body}>
        {phase === 'select' ? (
          /* ── Mode select ── */
          <View style={s.modeWrap}>
            <View style={s.modeTabs}>
              {(['quick', 'create', 'join'] as const).map(m => (
                <Pressable key={m} style={[s.modeTab, mode === m && s.modeTabActive]} onPress={() => setMode(m)}>
                  <Text style={[s.modeTabText, mode === m && s.modeTabTextActive]}>
                    {m === 'quick' ? '⚡ QUICK' : m === 'create' ? '➕ CREATE' : '🔑 JOIN'}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={s.modeContent}>
              {mode === 'join' && (
                <TextInput
                  style={s.codeInput}
                  placeholder="Enter Room Code"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={joinCode}
                  onChangeText={v => setJoinCode(v.toUpperCase())}
                  maxLength={8}
                  autoCapitalize="characters"
                />
              )}
              {error ? <Text style={s.errorText}>{error}</Text> : null}
              <Pressable
                style={[s.actionBtn, loading && { opacity: 0.5 }]}
                onPress={mode === 'quick' ? handleQuickPlay : mode === 'create' ? handleCreateRoom : handleJoinRoom}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#000" /> : (
                  <Text style={s.actionBtnText}>
                    {mode === 'quick' ? '⚡ FIND MATCH NOW' : mode === 'create' ? '➕ CREATE ROOM' : '🚪 JOIN ROOM'}
                  </Text>
                )}
              </Pressable>
            </View>

            {/* How to play + powerups side by side */}
            <View style={s.infoRow}>
              <View style={s.infoCard}>
                <Text style={s.infoTitle}>📖 HOW TO PLAY</Text>
                {HOW_TO_PLAY.map(h => (
                  <View key={h.num} style={s.howItem}>
                    <View style={s.howNum}><Text style={s.howNumText}>{h.num}</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.howTitle}>{h.title}</Text>
                      <Text style={s.howBody}>{h.body}</Text>
                    </View>
                  </View>
                ))}
              </View>
              <View style={s.infoCard}>
                <Text style={s.infoTitle}>⚡ POWER-UPS</Text>
                {POWERUPS_INFO.map(p => (
                  <View key={p.name} style={s.powItem}>
                    <Text style={s.powIcon}>{p.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={s.powName}>{p.name}</Text>
                      <Text style={s.powDesc}>{p.desc}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ) : (
          /* ── Waiting room ── */
          <View style={s.waitingWrap}>
            {/* Players list */}
            <View style={s.playerList}>
              <Text style={s.sectionTitle}>👥 PLAYERS {players.filter(p => p.isAlive).length}/8</Text>
              {players.map((p, i) => {
                const char = CHARACTERS[p.characterId];
                return (
                  <View key={p.deviceId} style={s.playerRow}>
                    <Text style={s.playerRank}>{i + 1}</Text>
                    <View style={[s.playerAvatar, { backgroundColor: char.bodyColor }]}>
                      <Text style={s.playerAvatarText}>{p.username[0]}</Text>
                    </View>
                    <Text style={s.playerName} numberOfLines={1}>{p.username}</Text>
                    {p.isBot ? (
                      <View style={s.botBadge}><Text style={s.botText}>BOT</Text></View>
                    ) : (
                      <View style={[s.readyBadge, p.isReady ? s.readyBadgeOn : s.readyBadgeOff]}>
                        <Text style={s.readyText}>{p.isReady ? '✓ READY' : 'WAITING'}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
              {Array.from({ length: Math.max(0, 8 - players.length) }).map((_, i) => (
                <View key={`empty-${i}`} style={[s.playerRow, s.playerRowEmpty]}>
                  <Text style={s.playerRank}>{players.length + i + 1}</Text>
                  <View style={[s.playerAvatar, { backgroundColor: '#1E3A5F' }]}>
                    <Text style={s.playerAvatarText}>?</Text>
                  </View>
                  <Text style={s.playerNameEmpty}>Waiting...</Text>
                </View>
              ))}
              <Text style={s.startingSoon}>Game starting in 3...</Text>
            </View>

            {/* Right: how to play */}
            <View style={s.rightInfo}>
              <Text style={s.sectionTitle}>📖 HOW TO PLAY</Text>
              {HOW_TO_PLAY.slice(0, 4).map(h => (
                <View key={h.num} style={s.howItem}>
                  <View style={s.howNum}><Text style={s.howNumText}>{h.num}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.howTitle}>{h.title}</Text>
                    <Text style={s.howBody}>{h.body}</Text>
                  </View>
                </View>
              ))}
              <View style={s.divider} />
              <Text style={s.sectionTitle}>⚡ POWER-UPS</Text>
              {POWERUPS_INFO.map(p => (
                <View key={p.name} style={s.powItem}>
                  <Text style={s.powIcon}>{p.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.powName}>{p.name}</Text>
                    <Text style={s.powDesc}>{p.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Footer buttons */}
      {phase === 'waiting' && (
        <View style={s.footer}>
          <Pressable style={s.cancelBtn} onPress={() => { stopPolling(); setPhase('select'); setRoom(null); setPlayers([]); }}>
            <Text style={s.cancelText}>✕ CANCEL</Text>
          </Pressable>
          <Pressable style={[s.startBtn, loading && { opacity: 0.5 }]} onPress={handleStartGame} disabled={loading}>
            {loading ? <ActivityIndicator color="#000" /> : <Text style={s.startText}>▶ START GAME</Text>}
          </Pressable>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B1629' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#091222', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)', gap: 12 },
  backBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 8 },
  backText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  headerTitle: { flex: 1, color: '#FFB800', fontWeight: '900', fontSize: 15, letterSpacing: 2 },
  roomCodeChip: { backgroundColor: '#1A2D54', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(255,184,0,0.3)' },
  roomCodeText: { color: '#FFB800', fontWeight: '900', fontSize: 14, letterSpacing: 3 },
  // Countdown overlay
  countdownOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.8)', alignItems: 'center', justifyContent: 'center', zIndex: 99 },
  countdownNum: { color: '#FFB800', fontSize: 96, fontWeight: '900' },
  countdownLabel: { color: '#fff', fontSize: 18, fontWeight: '700', letterSpacing: 4, marginTop: -8 },
  // Body
  body: { flex: 1 },
  // Mode select
  modeWrap: { flex: 1, padding: 16, gap: 12 },
  modeTabs: { flexDirection: 'row', gap: 8 },
  modeTab: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: '#132040', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  modeTabActive: { backgroundColor: '#2563EB', borderColor: '#3B82F6' },
  modeTabText: { color: 'rgba(255,255,255,0.5)', fontWeight: '800', fontSize: 13 },
  modeTabTextActive: { color: '#fff' },
  modeContent: { gap: 10 },
  codeInput: { backgroundColor: '#132040', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', textAlign: 'center' },
  errorText: { color: '#EF4444', fontSize: 12, fontWeight: '600', textAlign: 'center' },
  actionBtn: { backgroundColor: '#FFB800', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  actionBtnText: { color: '#000', fontWeight: '900', fontSize: 16, letterSpacing: 1 },
  infoRow: { flex: 1, flexDirection: 'row', gap: 12 },
  infoCard: { flex: 1, backgroundColor: '#132040', borderRadius: 14, padding: 12, gap: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  infoTitle: { color: '#FFB800', fontWeight: '900', fontSize: 12, letterSpacing: 2, marginBottom: 4 },
  howItem: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  howNum: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  howNumText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  howTitle: { color: '#fff', fontSize: 10, fontWeight: '800' },
  howBody: { color: 'rgba(255,255,255,0.45)', fontSize: 9, lineHeight: 13 },
  powItem: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  powIcon: { fontSize: 16, width: 22, textAlign: 'center' },
  powName: { color: '#fff', fontSize: 10, fontWeight: '800' },
  powDesc: { color: 'rgba(255,255,255,0.45)', fontSize: 9 },
  // Waiting room
  waitingWrap: { flex: 1, flexDirection: 'row', padding: 16, gap: 16 },
  playerList: { flex: 1, gap: 6 },
  sectionTitle: { color: '#FFB800', fontWeight: '900', fontSize: 13, letterSpacing: 2, marginBottom: 4 },
  playerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#132040', borderRadius: 10, padding: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  playerRowEmpty: { opacity: 0.4 },
  playerRank: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '800', width: 18, textAlign: 'center' },
  playerAvatar: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  playerAvatarText: { color: '#fff', fontWeight: '900', fontSize: 12 },
  playerName: { flex: 1, color: '#fff', fontWeight: '700', fontSize: 13 },
  playerNameEmpty: { flex: 1, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', fontSize: 12 },
  botBadge: { backgroundColor: '#374151', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  botText: { color: 'rgba(255,255,255,0.5)', fontSize: 9, fontWeight: '800' },
  readyBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  readyBadgeOn: { backgroundColor: '#166534' },
  readyBadgeOff: { backgroundColor: '#374151' },
  readyText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  startingSoon: { color: 'rgba(255,184,0,0.6)', fontSize: 11, fontWeight: '700', textAlign: 'center', marginTop: 4 },
  rightInfo: { width: 220, gap: 8 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  // Footer
  footer: { flexDirection: 'row', gap: 12, padding: 12, backgroundColor: '#091222', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  cancelBtn: { flex: 1, backgroundColor: '#374151', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  cancelText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  startBtn: { flex: 2, backgroundColor: '#22C55E', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  startText: { color: '#fff', fontWeight: '900', fontSize: 16, letterSpacing: 1 },
});
