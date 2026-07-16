import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Animated, Pressable, ScrollView,
  StyleSheet, Text, View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { getOrCreateProfile } from '@/lib/playerStore';
import type { PlayerProfile } from '@/types/types';
import { CHARACTERS } from '@/game/characters';

const NAV_ITEMS = [
  { key: 'home', icon: '🏠', label: 'HOME' },
  { key: 'events', icon: '🎪', label: 'EVENTS' },
  { key: 'play', icon: '💣', label: 'PLAY', isCenter: true },
  { key: 'leaderboard', icon: '🏆', label: 'SCORES' },
  { key: 'profile', icon: '👤', label: 'PROFILE' },
];

const SIDEBAR_ITEMS = [
  { key: 'shop', icon: '🛒', label: 'SHOP' },
  { key: 'characters', icon: '🦸', label: 'CHARS' },
  { key: 'leaderboard', icon: '🏆', label: 'RANKING' },
  { key: 'missions', icon: '📋', label: 'MISSIONS' },
  { key: 'profile', icon: '👥', label: 'FRIENDS' },
  { key: 'missions', icon: '🎁', label: 'REWARDS' },
];

export default function HomeScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    (async () => {
      const p = await getOrCreateProfile();
      setProfile(p);
      setLoading(false);
    })();
    // Pulse the QUICK PLAY button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    ).start();
  }, [pulseAnim]);

  const handleNav = (key: string) => {
    if (key === 'play' || key === 'home') return; // already here
    router.push(`/(app)/${key}` as never);
  };

  const char = profile ? CHARACTERS[profile.selectedCharacter] : CHARACTERS.playerone;

  if (loading) {
    return (
      <View style={styles.root}>
        <ActivityIndicator size="large" color="#FFB800" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar hidden />

      {/* ── Top Bar ── */}
      <View style={styles.topBar}>
        {/* Player profile */}
        <View style={styles.profileChip}>
          <View style={[styles.avatarCircle, { backgroundColor: char.bodyColor }]}>
            <Text style={styles.avatarInitial}>{profile?.username[0]?.toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.profileName}>{profile?.username}</Text>
            <View style={styles.levelRow}>
              <Text style={styles.levelLabel}>Lv {profile?.level}</Text>
              <View style={styles.xpBar}>
                <View style={[styles.xpFill, { width: `${((profile?.xp ?? 0) % 100)}%` as unknown as number }]} />
              </View>
            </View>
          </View>
        </View>

        {/* Currency */}
        <View style={styles.currencyRow}>
          <View style={styles.currencyChip}>
            <Text style={styles.currencyIcon}>🪙</Text>
            <Text style={styles.currencyValue}>{profile?.coins.toLocaleString()}</Text>
            <Pressable style={styles.plusBtn} onPress={() => router.push('/(app)/shop' as never)}><Text style={styles.plusText}>+</Text></Pressable>
          </View>
          <View style={[styles.currencyChip, { backgroundColor: '#3D1A6E' }]}>
            <Text style={styles.currencyIcon}>💎</Text>
            <Text style={styles.currencyValue}>{profile?.gems}</Text>
            <Pressable style={[styles.plusBtn, { backgroundColor: '#7B2FBE' }]} onPress={() => router.push('/(app)/shop' as never)}><Text style={styles.plusText}>+</Text></Pressable>
          </View>
        </View>

        {/* Icons */}
        <View style={styles.topIcons}>
          <Pressable style={styles.iconBtn} onPress={() => {}}><Text style={styles.iconBtnText}>✉️</Text></Pressable>
          <Pressable style={styles.iconBtn} onPress={() => router.push('/(app)/profile' as never)}><Text style={styles.iconBtnText}>⚙️</Text></Pressable>
        </View>
      </View>

      {/* ── Body ── */}
      <View style={styles.body}>
        {/* Left Sidebar */}
        <View style={styles.sidebar}>
          {SIDEBAR_ITEMS.map(item => (
            <Pressable key={item.label} style={styles.sidebarItem} onPress={() => handleNav(item.key)}>
              <Text style={styles.sidebarIcon}>{item.icon}</Text>
              <Text style={styles.sidebarLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Centre */}
        <View style={styles.centre}>
          {/* Title */}
          <View style={styles.titleRow}>
            <Text style={styles.titleBomb}>💣</Text>
            <View>
              <Text style={styles.titleBomb2}>BOMB</Text>
              <Text style={styles.titleRunner}>RUNNER</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>8 PLAYER MULTIPLAYER</Text>

          {/* Character hero art */}
          <View style={styles.heroArea}>
            <View style={[styles.heroGlow, { backgroundColor: char.bodyColor + '33' }]} />
            {/* Big character preview */}
            <View style={styles.heroChar}>
              <View style={[styles.heroBody, { backgroundColor: char.bodyColor }]}>
                <View style={[styles.heroHead, { backgroundColor: char.skinColor }]}>
                  <View style={[styles.heroHair, { backgroundColor: char.hairColor }]} />
                  <View style={styles.heroEyes}>
                    <View style={styles.heroEye} />
                    <View style={styles.heroEye} />
                  </View>
                </View>
                <Text style={styles.heroBombLabel}>💣</Text>
              </View>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.btnCol}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Pressable style={styles.quickPlayBtn} onPress={() => router.push('/(app)/lobby' as never)}>
                <Text style={styles.quickPlayText}>⚡ QUICK PLAY</Text>
                <Text style={styles.quickPlaySub}>Join random match</Text>
              </Pressable>
            </Animated.View>
            <View style={styles.btnRow}>
              <Pressable style={styles.roomBtn} onPress={() => router.push('/(app)/lobby' as never)}>
                <Text style={styles.roomBtnText}>🚪 ROOM MATCH</Text>
                <Text style={styles.roomBtnSub}>Play with friends</Text>
              </Pressable>
              <Pressable style={styles.privateBtn} onPress={() => router.push('/(app)/lobby' as never)}>
                <Text style={styles.privateBtnText}>🔒 PRIVATE</Text>
                <Text style={styles.privateBtnSub}>Create or join</Text>
              </Pressable>
            </View>
          </View>

          {/* Stats bar */}
          <View style={styles.statsBar}>
            {[
              { icon: '👥', val: '8', label: 'MAX PLAYERS' },
              { icon: '⏱', val: '2-3 MIN', label: 'DURATION' },
              { icon: '💣', val: 'RANDOM', label: 'BOMB HOLDER' },
              { icon: '👑', val: 'LAST ONE', label: 'WINS' },
            ].map(s => (
              <View key={s.label} style={styles.statChip}>
                <Text style={styles.statIcon}>{s.icon}</Text>
                <Text style={styles.statVal}>{s.val}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Right Panel */}
        <View style={styles.rightPanel}>
          {/* Season progress */}
          <View style={styles.seasonCard}>
            <View style={styles.seasonHeader}>
              <Text style={styles.seasonIcon}>⭐</Text>
              <View>
                <Text style={styles.seasonTitle}>SEASON 1</Text>
                <View style={styles.seasonBarWrap}>
                  <View style={styles.seasonBar}>
                    <View style={[styles.seasonFill, { width: '35%' }]} />
                  </View>
                  <Text style={styles.seasonLvl}>15</Text>
                </View>
                <Text style={styles.seasonPts}>350 / 1000</Text>
              </View>
            </View>
          </View>

          {/* Starter pack */}
          <View style={styles.offerCard}>
            <Text style={styles.offerTitle}>STARTER PACK</Text>
            <View style={styles.offerIcons}>
              <Text style={styles.offerIcon}>🪙</Text>
              <Text style={styles.offerIcon}>💎</Text>
              <Text style={styles.offerIcon}>💣</Text>
            </View>
            <Text style={styles.offerTimer}>⏰ 23h 59m</Text>
            <Pressable style={styles.offerBtn} onPress={() => router.push('/(app)/shop' as never)}>
              <Text style={styles.offerBtnText}>GET PACK</Text>
            </Pressable>
          </View>

          {/* Unlock all */}
          <View style={[styles.offerCard, { backgroundColor: '#1A0A2E' }]}>
            <Text style={styles.offerTitle}>UNLOCK ALL</Text>
            <View style={[styles.avatarCircle, { backgroundColor: '#546E7A', width: 36, height: 36, borderRadius: 18, alignSelf: 'center', marginVertical: 4 }]}>
              <Text style={{ color: '#fff', fontSize: 18 }}>🥷</Text>
            </View>
            <Text style={styles.unlockSub}>All Characters + No Ads</Text>
            <Pressable style={[styles.offerBtn, { backgroundColor: '#FFB800' }]} onPress={() => router.push('/(app)/shop' as never)}>
              <Text style={[styles.offerBtnText, { color: '#000' }]}>₹249</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* ── Bottom Nav ── */}
      <View style={styles.bottomNav}>
        {NAV_ITEMS.map(item => (
          <Pressable
            key={item.key}
            style={[styles.navItem, item.isCenter && styles.navItemCenter]}
            onPress={() => handleNav(item.key)}
          >
            {item.isCenter ? (
              <View style={styles.navCenterCircle}>
                <Text style={styles.navCenterIcon}>{item.icon}</Text>
              </View>
            ) : (
              <>
                <Text style={styles.navIcon}>{item.icon}</Text>
                <Text style={[styles.navLabel, item.key === 'home' && styles.navLabelActive]}>{item.label}</Text>
              </>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const C = {
  bg: '#0B1629',
  card: '#132040',
  cardBright: '#1A2D54',
  gold: '#FFB800',
  blue: '#2563EB',
  green: '#22C55E',
  red: '#EF4444',
  border: 'rgba(255,255,255,0.1)',
  text: '#FFFFFF',
  muted: 'rgba(255,255,255,0.55)',
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  // Top bar
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 8, paddingBottom: 6, backgroundColor: '#091222', borderBottomWidth: 1, borderBottomColor: C.border, gap: 8 },
  profileChip: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  avatarCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.gold },
  avatarInitial: { color: '#fff', fontWeight: '900', fontSize: 16 },
  profileName: { color: C.text, fontWeight: '800', fontSize: 13 },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  levelLabel: { color: C.gold, fontSize: 10, fontWeight: '700' },
  xpBar: { width: 60, height: 4, backgroundColor: '#1E3A5F', borderRadius: 2 },
  xpFill: { height: 4, backgroundColor: C.gold, borderRadius: 2 },
  currencyRow: { flexDirection: 'row', gap: 6 },
  currencyChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A2A18', borderRadius: 16, paddingHorizontal: 8, paddingVertical: 4, gap: 4, borderWidth: 1, borderColor: 'rgba(255,184,0,0.3)' },
  currencyIcon: { fontSize: 14 },
  currencyValue: { color: C.text, fontWeight: '800', fontSize: 13 },
  plusBtn: { backgroundColor: '#2A6B18', borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1 },
  plusText: { color: '#fff', fontSize: 12, fontWeight: '900' },
  topIcons: { flexDirection: 'row', gap: 6 },
  iconBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  iconBtnText: { fontSize: 14 },
  // Body
  body: { flex: 1, flexDirection: 'row' },
  // Sidebar
  sidebar: { width: 64, backgroundColor: '#091222', borderRightWidth: 1, borderRightColor: C.border, paddingTop: 8, alignItems: 'center', gap: 4 },
  sidebarItem: { alignItems: 'center', paddingVertical: 8, paddingHorizontal: 4, borderRadius: 10, width: 56 },
  sidebarIcon: { fontSize: 20 },
  sidebarLabel: { color: C.muted, fontSize: 8, fontWeight: '700', marginTop: 2, textAlign: 'center' },
  // Centre
  centre: { flex: 1, alignItems: 'center', paddingTop: 8, paddingHorizontal: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  titleBomb: { fontSize: 32 },
  titleBomb2: { color: C.gold, fontSize: 28, fontWeight: '900', letterSpacing: 3, lineHeight: 30 },
  titleRunner: { color: '#FFFFFF', fontSize: 24, fontWeight: '900', letterSpacing: 4, lineHeight: 26 },
  subtitle: { color: 'rgba(255,184,0,0.7)', fontSize: 11, fontWeight: '700', letterSpacing: 3, marginTop: 2 },
  heroArea: { width: 180, height: 130, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  heroGlow: { position: 'absolute', width: 140, height: 100, borderRadius: 70 },
  heroChar: { alignItems: 'center' },
  heroBody: { width: 64, height: 80, borderRadius: 12, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 8, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  heroHead: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  heroHair: { position: 'absolute', top: 0, width: 36, height: 18, borderTopLeftRadius: 18, borderTopRightRadius: 18 },
  heroEyes: { flexDirection: 'row', gap: 6, marginTop: 14 },
  heroEye: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#1a1a2e' },
  heroBombLabel: { fontSize: 20, marginTop: 4 },
  btnCol: { width: '100%', gap: 8, marginTop: 4 },
  quickPlayBtn: { backgroundColor: C.gold, borderRadius: 14, paddingVertical: 12, alignItems: 'center', borderWidth: 2, borderColor: '#FFD054', shadowColor: C.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8 },
  quickPlayText: { color: '#000', fontWeight: '900', fontSize: 18, letterSpacing: 1 },
  quickPlaySub: { color: 'rgba(0,0,0,0.6)', fontSize: 11, fontWeight: '600' },
  btnRow: { flexDirection: 'row', gap: 8 },
  roomBtn: { flex: 1, backgroundColor: C.blue, borderRadius: 12, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(100,160,255,0.4)' },
  roomBtnText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  roomBtnSub: { color: 'rgba(255,255,255,0.6)', fontSize: 9 },
  privateBtn: { flex: 1, backgroundColor: C.green, borderRadius: 12, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(100,255,160,0.4)' },
  privateBtnText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  privateBtnSub: { color: 'rgba(255,255,255,0.6)', fontSize: 9 },
  statsBar: { flexDirection: 'row', gap: 8, marginTop: 8 },
  statChip: { flex: 1, backgroundColor: C.card, borderRadius: 10, padding: 6, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  statIcon: { fontSize: 14 },
  statVal: { color: C.gold, fontSize: 11, fontWeight: '900' },
  statLabel: { color: C.muted, fontSize: 8, fontWeight: '600', textAlign: 'center' },
  // Right panel
  rightPanel: { width: 130, padding: 8, gap: 8 },
  seasonCard: { backgroundColor: C.card, borderRadius: 12, padding: 10, borderWidth: 1, borderColor: C.border },
  seasonHeader: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  seasonIcon: { fontSize: 20 },
  seasonTitle: { color: C.gold, fontWeight: '900', fontSize: 12 },
  seasonBarWrap: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  seasonBar: { flex: 1, height: 5, backgroundColor: '#1E3A5F', borderRadius: 3 },
  seasonFill: { height: 5, backgroundColor: C.gold, borderRadius: 3 },
  seasonLvl: { color: C.gold, fontSize: 10, fontWeight: '900', width: 18, textAlign: 'center' },
  seasonPts: { color: C.muted, fontSize: 9, marginTop: 2 },
  offerCard: { backgroundColor: '#1A2840', borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: C.border, gap: 6 },
  offerTitle: { color: '#fff', fontWeight: '900', fontSize: 11, letterSpacing: 1 },
  offerIcons: { flexDirection: 'row', gap: 6 },
  offerIcon: { fontSize: 20 },
  offerTimer: { color: C.muted, fontSize: 9 },
  offerBtn: { backgroundColor: C.blue, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 6 },
  offerBtnText: { color: '#fff', fontWeight: '800', fontSize: 11 },
  unlockSub: { color: C.muted, fontSize: 9, textAlign: 'center' },
  // Bottom nav
  bottomNav: { height: 56, backgroundColor: '#091222', borderTopWidth: 1, borderTopColor: C.border, flexDirection: 'row', alignItems: 'center' },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
  navItemCenter: { paddingBottom: 16 },
  navCenterCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: C.gold, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#FFD054', marginTop: -20 },
  navCenterIcon: { fontSize: 22 },
  navIcon: { fontSize: 18 },
  navLabel: { color: C.muted, fontSize: 9, fontWeight: '700', marginTop: 2 },
  navLabelActive: { color: C.gold },
});
