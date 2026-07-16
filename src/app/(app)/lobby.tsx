import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Animated, Pressable, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { getOrCreateProfile } from '@/lib/playerStore';
import { CHARACTERS, CHARACTER_LIST } from '@/game/characters';
import { createRoom, joinRoom, addPlayerToRoom, addBotPlayersToRoom, getRoomPlayers, updateRoomStatus, createGameSession } from '@/db/api';
import type { Room, RoomPlayer } from '@/types/types';
import HeroCharacter from '@/components/ui/HeroCharacter';

const TIPS = [
  '💡 Run AWAY from the bomb holder!',
  '💡 Use SPEED BOOST to escape fast!',
  '💡 SHIELD protects from one bomb pass!',
  '💡 FREEZE enemies to slow them down!',
  '💡 Corners are dangerous — keep moving!',
  '💡 Watch the countdown timer closely!',
];

const POWERUPS_INFO = [
  { icon: '⚡', name: 'SPEED BOOST', desc: 'Run faster for 8s', color: '#FFB800' },
  { icon: '🛡', name: 'SHIELD',      desc: 'Block one bomb pass', color: '#00E5FF' },
  { icon: '❄️', name: 'FREEZE',      desc: 'Freeze others for 3s', color: '#64B5F6' },
  { icon: '⏰', name: 'EXTRA TIME',  desc: 'Add 5s to the timer', color: '#22C55E' },
];

const HOW_TO_PLAY = [
  { num: '1', title: 'RANDOM PLAYER GETS THE BOMB', body: 'A random player starts with the bomb and timer begins.' },
  { num: '2', title: 'TOUCH TO PASS',              body: 'Run into any other player to instantly pass the bomb.' },
  { num: '3', title: 'TIME IS RUNNING OUT',        body: 'The timer keeps ticking. Pass before it hits zero!' },
  { num: '4', title: 'TIME OUT = BLAST',           body: 'Holding the bomb when time runs out? You explode!' },
  { num: '5', title: 'LAST ONE STANDING WINS',     body: 'Survive all eliminations to claim victory!' },
];

export default function LobbyScreen() {
  const router = useRouter();
  const [phase,     setPhase]     = useState<'select' | 'searching' | 'waiting'>('select');
  const [mode,      setMode]      = useState<'quick' | 'create' | 'join'>('quick');
  const [joinCode,  setJoinCode]  = useState('');
  const [room,      setRoom]      = useState<Room | null>(null);
  const [players,   setPlayers]   = useState<RoomPlayer[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [tipIndex,  setTipIndex]  = useState(0);
  const [error,     setError]     = useState('');
  const pollRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const tipRef      = useRef<ReturnType<typeof setInterval> | null>(null);

  // Matchmaking animations
  const spinAnim  = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dotAnim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (phase === 'searching') {
      Animated.loop(
        Animated.timing(spinAnim, { toValue: 1, duration: 1400, useNativeDriver: true }),
      ).start();
      Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 600, useNativeDriver: true }),
      ])).start();
      Animated.loop(Animated.sequence([
        Animated.timing(dotAnim, { toValue: 3, duration: 900, useNativeDriver: false }),
        Animated.timing(dotAnim, { toValue: 0, duration: 0,   useNativeDriver: false }),
      ])).start();
      tipRef.current = setInterval(() => setTipIndex(i => (i + 1) % TIPS.length), 3500);
    } else {
      spinAnim.stopAnimation(); pulseAnim.stopAnimation(); dotAnim.stopAnimation();
      if (tipRef.current) clearInterval(tipRef.current);
    }
    return () => { if (tipRef.current) clearInterval(tipRef.current); };
  }, [phase, spinAnim, pulseAnim, dotAnim]);

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
    const profile   = await getOrCreateProfile();
    await addPlayerToRoom(r.id, profile.deviceId, profile.username, profile.selectedCharacter);
    const existing  = await getRoomPlayers(r.id);
    const botCount  = Math.max(0, 8 - existing.length);
    if (botCount > 0) await addBotPlayersToRoom(r.id, botCount, existing.length);
    const allPlayers = await getRoomPlayers(r.id);
    setRoom(r);
    setPlayers(allPlayers);
    setPhase('waiting');
    startPolling(r.id);
  };

  const handleQuickPlay = async () => {
    setLoading(true); setError('');
    setPhase('searching');
    try {
      const profile = await getOrCreateProfile();
      const r = await createRoom(profile.deviceId);
      if (!r) { setError('Failed to create room.'); setPhase('select'); setLoading(false); return; }
      await handleEnterRoom(r);
    } catch { setError('Network error. Please retry.'); setPhase('select'); }
    setLoading(false);
  };

  const handleCreateRoom = async () => {
    setLoading(true); setError('');
    try {
      const profile = await getOrCreateProfile();
      const r = await createRoom(profile.deviceId);
      if (!r) { setError('Failed to create room.'); setLoading(false); return; }
      await handleEnterRoom(r);
    } catch { setError('Network error.'); }
    setLoading(false);
  };

  const handleJoinRoom = async () => {
    if (joinCode.length < 4) { setError('Enter a valid room code.'); return; }
    setLoading(true); setError('');
    try {
      const r = await joinRoom(joinCode.trim());
      if (!r) { setError('Room not found or already started.'); setLoading(false); return; }
      await handleEnterRoom(r);
    } catch { setError('Network error.'); }
    setLoading(false);
  };

  const handleStartGame = async () => {
    if (!room) return;
    setLoading(true);
    await updateRoomStatus(room.id, 'countdown');
    await createGameSession(room.id);
    stopPolling();
    setLoading(false);
    setCountdown(3);
    let c = 3;
    const cd = setInterval(() => {
      c--;
      if (c <= 0) {
        clearInterval(cd);
        setCountdown(null);
        router.replace({ pathname: '/(app)/game', params: { roomId: room.id } } as never);
      } else { setCountdown(c); }
    }, 1000);
  };

  const spinRotate = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const heroChars  = CHARACTER_LIST.slice(0, 4).map(c => c.id);

  return (
    <View style={s.root}>
      <StatusBar hidden />

      {/* ── MATCH FOUND / COUNTDOWN overlay ── */}
      {countdown !== null && (
        <View style={s.countdownOverlay}>
          <View style={s.countdownRing}>
            <Text style={s.countdownNum}>{countdown}</Text>
          </View>
          <Text style={s.countdownLabel}>⚡ MATCH STARTING!</Text>
        </View>
      )}

      {/* ── HEADER ── */}
      <View style={s.header}>
        <Pressable style={s.backBtn} onPress={() => { stopPolling(); setPhase('select'); setRoom(null); router.back(); }}>
          <Text style={s.backText}>← BACK</Text>
        </Pressable>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>
            {phase === 'select'    ? '⚡ FIND A MATCH' :
             phase === 'searching' ? '🔍 SEARCHING...' :
             `🚪 LOBBY`}
          </Text>
          {phase === 'select' && <Text style={s.headerSub}>8-PLAYER BOMB RUNNER</Text>}
        </View>
        {room && (
          <View style={s.roomCodeChip}>
            <Text style={s.roomCodeLabel}>ROOM</Text>
            <Text style={s.roomCodeText}>{room.roomCode}</Text>
          </View>
        )}
      </View>

      <View style={s.body}>

        {/* ── SELECT MODE ── */}
        {phase === 'select' && (
          <View style={s.selectWrap}>
            {/* Mode tabs */}
            <View style={s.modeTabs}>
              {([
                { key: 'quick',  icon: '⚡', label: 'QUICK PLAY' },
                { key: 'create', icon: '➕', label: 'CREATE' },
                { key: 'join',   icon: '🔑', label: 'JOIN ROOM' },
              ] as const).map(m => (
                <Pressable key={m.key} style={[s.modeTab, mode === m.key && s.modeTabActive]} onPress={() => setMode(m.key)}>
                  <Text style={[s.modeTabIcon, mode === m.key && s.modeTabIconActive]}>{m.icon}</Text>
                  <Text style={[s.modeTabText, mode === m.key && s.modeTabTextActive]}>{m.label}</Text>
                </Pressable>
              ))}
            </View>

            {/* Action area */}
            <View style={s.actionArea}>
              {mode === 'join' && (
                <TextInput
                  style={s.codeInput}
                  placeholder="ENTER ROOM CODE"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  value={joinCode}
                  onChangeText={v => setJoinCode(v.toUpperCase())}
                  maxLength={8}
                  autoCapitalize="characters"
                />
              )}
              {error ? <Text style={s.errorText}>{error}</Text> : null}
              <Pressable
                style={[s.actionBtn, loading && s.actionBtnDisabled]}
                onPress={mode === 'quick' ? handleQuickPlay : mode === 'create' ? handleCreateRoom : handleJoinRoom}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator color="#000" />
                  : <Text style={s.actionBtnText}>
                      {mode === 'quick' ? '⚡ FIND MATCH NOW' : mode === 'create' ? '➕ CREATE ROOM' : '🚪 JOIN ROOM'}
                    </Text>
                }
              </Pressable>
            </View>

            {/* Info cards */}
            <View style={s.infoRow}>
              <View style={s.infoCard}>
                <Text style={s.infoTitle}>📖 HOW TO PLAY</Text>
                {HOW_TO_PLAY.map(h => (
                  <View key={h.num} style={s.howRow}>
                    <View style={s.howNumCircle}><Text style={s.howNumText}>{h.num}</Text></View>
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
                  <View key={p.name} style={s.powRow}>
                    <View style={[s.powIconWrap, { borderColor: p.color + '66', backgroundColor: p.color + '18' }]}>
                      <Text style={s.powIconText}>{p.icon}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.powName, { color: p.color }]}>{p.name}</Text>
                      <Text style={s.powDesc}>{p.desc}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* ── SEARCHING MATCHMAKING ── */}
        {phase === 'searching' && (
          <View style={s.searchWrap}>
            {/* Hero characters parade */}
            <View style={s.heroParade}>
              {heroChars.map((id, i) => (
                <Animated.View key={id} style={{ transform: [{ scale: i === 1 ? pulseAnim : 1 }] }}>
                  <HeroCharacter characterId={id} size={i === 1 ? 85 : 58} animState="running" />
                </Animated.View>
              ))}
            </View>

            {/* Rotating bomb */}
            <View style={s.searchBombWrap}>
              <Animated.View style={{ transform: [{ rotate: spinRotate }] }}>
                <View style={s.searchBombOuter}>
                  <Text style={s.searchBombEmoji}>💣</Text>
                </View>
              </Animated.View>
              <View style={s.searchPulse1} />
              <View style={s.searchPulse2} />
            </View>

            <Text style={s.searchTitle}>FINDING YOUR MATCH</Text>
            <Text style={s.searchSub}>Searching for 8 players...</Text>

            {/* Dots */}
            <View style={s.searchDots}>
              {[0,1,2].map(i => (
                <View key={i} style={[s.dot, { opacity: 0.3 + i * 0.3 }]} />
              ))}
            </View>

            {/* Tip */}
            <View style={s.tipBox}>
              <Text style={s.tipText}>{TIPS[tipIndex]}</Text>
            </View>

            {/* Cancel */}
            <Pressable style={s.cancelSearchBtn} onPress={() => { stopPolling(); setPhase('select'); }}>
              <Text style={s.cancelSearchText}>✕ CANCEL SEARCH</Text>
            </Pressable>
          </View>
        )}

        {/* ── WAITING ROOM (LOBBY) ── */}
        {phase === 'waiting' && (
          <View style={s.waitWrap}>
            {/* Player grid */}
            <View style={s.playerGrid}>
              <View style={s.lobbyHeader}>
                <Text style={s.lobbyTitle}>👥 PLAYERS</Text>
                <Text style={s.lobbyCount}>{players.filter(p => !p.isBot).length}/{players.length}</Text>
                <View style={s.waitingDots}>
                  <Text style={s.waitingDotsText}>Filling with bots...</Text>
                </View>
              </View>
              <View style={s.playerCardGrid}>
                {players.map((p, i) => {
                  const char = CHARACTERS[p.characterId];
                  return (
                    <View key={p.deviceId} style={[s.playerCard, p.isBot && s.playerCardBot]}>
                      {/* Character mini hero */}
                      <View style={[s.playerCardAvatar, { backgroundColor: char.bodyColor + '22', borderColor: char.bodyColor + '66' }]}>
                        <HeroCharacter characterId={p.characterId} size={38} animState={p.isBot ? 'idle' : 'celebrate'} />
                      </View>
                      {/* Rank badge */}
                      <View style={s.playerCardRank}><Text style={s.playerCardRankText}>{i + 1}</Text></View>
                      <Text style={s.playerCardName} numberOfLines={1}>{p.username}</Text>
                      {p.isBot ? (
                        <View style={s.botBadge}><Text style={s.botText}>🤖 BOT</Text></View>
                      ) : (
                        <View style={[s.readyBadge, p.isReady ? s.readyOn : s.readyOff]}>
                          <Text style={s.readyText}>{p.isReady ? '✓ READY' : '⏳'}</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
                {Array.from({ length: Math.max(0, 8 - players.length) }).map((_, i) => (
                  <View key={`empty-${i}`} style={[s.playerCard, s.playerCardEmpty]}>
                    <View style={[s.playerCardAvatar, { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }]}>
                      <Text style={{ fontSize: 22, opacity: 0.3 }}>?</Text>
                    </View>
                    <Text style={s.playerCardNameEmpty}>Waiting...</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Right info */}
            <View style={s.lobbyRight}>
              <Text style={s.infoTitle}>📖 HOW TO PLAY</Text>
              {HOW_TO_PLAY.slice(0, 4).map(h => (
                <View key={h.num} style={s.howRow}>
                  <View style={s.howNumCircle}><Text style={s.howNumText}>{h.num}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.howTitle}>{h.title}</Text>
                    <Text style={s.howBody}>{h.body}</Text>
                  </View>
                </View>
              ))}
              <View style={s.divider} />
              <Text style={s.infoTitle}>⚡ POWER-UPS</Text>
              {POWERUPS_INFO.map(p => (
                <View key={p.name} style={s.powRow}>
                  <View style={[s.powIconWrap, { borderColor: p.color + '66', backgroundColor: p.color + '18' }]}>
                    <Text style={s.powIconText}>{p.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.powName, { color: p.color }]}>{p.name}</Text>
                    <Text style={s.powDesc}>{p.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* ── FOOTER (waiting only) ── */}
      {phase === 'waiting' && (
        <View style={s.footer}>
          <Pressable style={s.cancelBtn} onPress={() => { stopPolling(); setPhase('select'); setRoom(null); setPlayers([]); }}>
            <Text style={s.cancelBtnText}>✕ LEAVE</Text>
          </Pressable>
          <Pressable style={[s.startBtn, loading && s.startBtnDisabled]} onPress={handleStartGame} disabled={loading}>
            {loading ? <ActivityIndicator color="#000" /> : <Text style={s.startBtnText}>▶ START GAME</Text>}
          </Pressable>
        </View>
      )}
    </View>
  );
}

/* ── Design Tokens ── */
const C = {
  bg:    '#080E1C', panel: '#0F1E3A', panelB: '#162947',
  gold:  '#FFB800', goldL: '#FFC93D',
  blue:  '#3B82F6', green: '#22C55E', red: '#EF4444',
  border:'rgba(255,255,255,0.09)', txt: '#FFFFFF',
  muted: 'rgba(255,255,255,0.5)', dim: 'rgba(255,255,255,0.28)',
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  /* Header */
  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, backgroundColor: 'rgba(8,14,28,0.95)', borderBottomWidth: 1, borderBottomColor: C.border, gap: 10 },
  backBtn:      { paddingHorizontal: 12, paddingVertical: 7, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 10, borderWidth: 1, borderColor: C.border },
  backText:     { color: C.txt, fontWeight: '700', fontSize: 12 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle:  { color: C.gold, fontWeight: '900', fontSize: 15, letterSpacing: 2 },
  headerSub:    { color: C.muted, fontSize: 9, fontWeight: '700', letterSpacing: 2 },
  roomCodeChip: { backgroundColor: C.panel, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(255,184,0,0.35)', alignItems: 'center' },
  roomCodeLabel:{ color: C.muted, fontSize: 7, fontWeight: '800', letterSpacing: 1 },
  roomCodeText: { color: C.gold, fontWeight: '900', fontSize: 15, letterSpacing: 3 },

  body: { flex: 1 },

  /* Select */
  selectWrap:  { flex: 1, padding: 14, gap: 10 },
  modeTabs:    { flexDirection: 'row', gap: 8 },
  modeTab:     { flex: 1, paddingVertical: 10, borderRadius: 14, backgroundColor: C.panel, alignItems: 'center', borderWidth: 1, borderColor: C.border, gap: 2 },
  modeTabActive: { backgroundColor: C.blue, borderColor: 'rgba(96,165,250,0.5)' },
  modeTabIcon:   { fontSize: 16 },
  modeTabIconActive: {},
  modeTabText:   { color: C.muted, fontWeight: '800', fontSize: 11 },
  modeTabTextActive: { color: '#fff' },
  actionArea:    { gap: 8 },
  codeInput:     { backgroundColor: C.panel, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: 6, borderWidth: 1, borderColor: C.border, textAlign: 'center' },
  errorText:     { color: '#EF4444', fontSize: 12, fontWeight: '700', textAlign: 'center' },
  actionBtn:     { backgroundColor: C.gold, borderRadius: 14, paddingVertical: 14, alignItems: 'center', shadowColor: C.gold, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 12 },
  actionBtnDisabled: { opacity: 0.5 },
  actionBtnText: { color: '#000', fontWeight: '900', fontSize: 16, letterSpacing: 1 },
  infoRow:       { flex: 1, flexDirection: 'row', gap: 10 },
  infoCard:      { flex: 1, backgroundColor: C.panel, borderRadius: 14, padding: 10, gap: 7, borderWidth: 1, borderColor: C.border },
  infoTitle:     { color: C.gold, fontWeight: '900', fontSize: 11, letterSpacing: 2, marginBottom: 2 },
  howRow:        { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  howNumCircle:  { width: 19, height: 19, borderRadius: 9.5, backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  howNumText:    { color: '#fff', fontSize: 9, fontWeight: '900' },
  howTitle:      { color: C.txt, fontSize: 9.5, fontWeight: '800' },
  howBody:       { color: C.dim, fontSize: 8.5, lineHeight: 12 },
  powRow:        { flexDirection: 'row', gap: 7, alignItems: 'center' },
  powIconWrap:   { width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  powIconText:   { fontSize: 14 },
  powName:       { fontSize: 9.5, fontWeight: '900' },
  powDesc:       { color: C.dim, fontSize: 8.5 },

  /* Searching */
  searchWrap:   { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 40 },
  heroParade:   { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  searchBombWrap:{ alignItems: 'center', justifyContent: 'center', width: 100, height: 100 },
  searchBombOuter:{ width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,184,0,0.15)', borderWidth: 2, borderColor: 'rgba(255,184,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  searchBombEmoji:{ fontSize: 44 },
  searchPulse1: { position: 'absolute', width: 88, height: 88, borderRadius: 44, borderWidth: 1.5, borderColor: 'rgba(255,184,0,0.25)' },
  searchPulse2: { position: 'absolute', width: 106, height: 106, borderRadius: 53, borderWidth: 1, borderColor: 'rgba(255,184,0,0.12)' },
  searchTitle:  { color: C.txt, fontWeight: '900', fontSize: 20, letterSpacing: 3 },
  searchSub:    { color: C.muted, fontSize: 13, fontWeight: '600' },
  searchDots:   { flexDirection: 'row', gap: 8 },
  dot:          { width: 10, height: 10, borderRadius: 5, backgroundColor: C.gold },
  tipBox:       { backgroundColor: C.panel, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 10, borderWidth: 1, borderColor: C.border, maxWidth: 360 },
  tipText:      { color: C.muted, fontSize: 12, fontWeight: '600', textAlign: 'center' },
  cancelSearchBtn: { paddingVertical: 10, paddingHorizontal: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: C.border },
  cancelSearchText:{ color: C.muted, fontWeight: '700', fontSize: 13 },

  /* Waiting room */
  waitWrap:     { flex: 1, flexDirection: 'row', padding: 14, gap: 14 },
  playerGrid:   { flex: 1, gap: 8 },
  lobbyHeader:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  lobbyTitle:   { color: C.gold, fontWeight: '900', fontSize: 13, letterSpacing: 2 },
  lobbyCount:   { color: C.txt, fontWeight: '900', fontSize: 13 },
  waitingDots:  { flex: 1, alignItems: 'flex-end' },
  waitingDotsText: { color: C.dim, fontSize: 9, fontWeight: '600' },
  playerCardGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  playerCard:   { width: '23%', backgroundColor: C.panel, borderRadius: 12, padding: 8, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: C.border, position: 'relative' },
  playerCardBot:{ borderColor: 'rgba(100,116,139,0.35)' },
  playerCardEmpty: { opacity: 0.35 },
  playerCardAvatar:{ width: 52, height: 58, borderRadius: 10, borderWidth: 1.5, alignItems: 'center', justifyContent: 'flex-end', overflow: 'hidden' },
  playerCardRank:  { position: 'absolute', top: 5, left: 5, width: 16, height: 16, borderRadius: 8, backgroundColor: C.gold, alignItems: 'center', justifyContent: 'center' },
  playerCardRankText: { color: '#000', fontSize: 8, fontWeight: '900' },
  playerCardName:  { color: C.txt, fontSize: 8.5, fontWeight: '800', textAlign: 'center' },
  playerCardNameEmpty: { color: C.dim, fontSize: 8, fontStyle: 'italic' },
  botBadge:     { backgroundColor: 'rgba(100,116,139,0.3)', borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 },
  botText:      { color: C.dim, fontSize: 8, fontWeight: '800' },
  readyBadge:   { borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 },
  readyOn:      { backgroundColor: 'rgba(34,197,94,0.25)', borderWidth: 1, borderColor: 'rgba(34,197,94,0.5)' },
  readyOff:     { backgroundColor: 'rgba(100,116,139,0.2)' },
  readyText:    { color: C.txt, fontSize: 8, fontWeight: '800' },
  lobbyRight:   { width: 210, gap: 7 },
  divider:      { height: 1, backgroundColor: C.border, marginVertical: 4 },

  /* Footer */
  footer:       { flexDirection: 'row', gap: 10, padding: 12, backgroundColor: 'rgba(8,14,28,0.95)', borderTopWidth: 1, borderTopColor: C.border },
  cancelBtn:    { flex: 1, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  cancelBtnText:{ color: C.muted, fontWeight: '800', fontSize: 13 },
  startBtn:     { flex: 2, backgroundColor: C.green, borderRadius: 12, paddingVertical: 12, alignItems: 'center', shadowColor: C.green, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 10 },
  startBtnDisabled: { opacity: 0.5 },
  startBtnText: { color: '#fff', fontWeight: '900', fontSize: 16, letterSpacing: 1 },

  /* Countdown overlay */
  countdownOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center', zIndex: 99, gap: 16 },
  countdownRing:    { width: 150, height: 150, borderRadius: 75, borderWidth: 4, borderColor: C.gold, backgroundColor: 'rgba(255,184,0,0.1)', alignItems: 'center', justifyContent: 'center', shadowColor: C.gold, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 30 },
  countdownNum:     { color: C.gold, fontSize: 100, fontWeight: '900' },
  countdownLabel:   { color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: 4 },
});
