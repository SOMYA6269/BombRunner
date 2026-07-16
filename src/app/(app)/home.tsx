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
import HeroCharacter from '@/components/ui/HeroCharacter';

const NAV_ITEMS = [
  { key: 'home',        icon: '🏠', label: 'HOME',       active: true },
  { key: 'events',      icon: '🎪', label: 'EVENTS' },
  { key: 'play',        icon: '💣', label: 'PLAY',        isCenter: true },
  { key: 'leaderboard', icon: '🏆', label: 'LEADERBOARD' },
  { key: 'profile',     icon: '👤', label: 'PROFILE' },
];

const SIDEBAR_ITEMS = [
  { key: 'shop',        icon: '🛒',  label: 'SHOP',    accent: '#FFB800' },
  { key: 'characters',  icon: '🦸',  label: 'HEROES',  accent: '#A855F7' },
  { key: 'leaderboard', icon: '🏆',  label: 'RANKING', accent: '#FFB800' },
  { key: 'missions',    icon: '📋',  label: 'QUESTS',  accent: '#22C55E' },
  { key: 'profile',     icon: '👥',  label: 'FRIENDS', accent: '#3B82F6' },
  { key: 'missions',    icon: '🎁',  label: 'REWARDS', accent: '#EF4444' },
];

export default function HomeScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const pulseAnim   = useRef(new Animated.Value(1)).current;
  const floatAnim   = useRef(new Animated.Value(0)).current;
  const glowAnim    = useRef(new Animated.Value(0.6)).current;
  const bgStarAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      const p = await getOrCreateProfile();
      setProfile(p);
      setLoading(false);
    })();

    Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.05, duration: 750, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1,    duration: 750, useNativeDriver: true }),
    ])).start();

    Animated.loop(Animated.sequence([
      Animated.timing(floatAnim, { toValue: -6, duration: 1800, useNativeDriver: true }),
      Animated.timing(floatAnim, { toValue:  0, duration: 1800, useNativeDriver: true }),
    ])).start();

    Animated.loop(Animated.sequence([
      Animated.timing(glowAnim, { toValue: 1,   duration: 1200, useNativeDriver: true }),
      Animated.timing(glowAnim, { toValue: 0.5, duration: 1200, useNativeDriver: true }),
    ])).start();

    Animated.loop(
      Animated.timing(bgStarAnim, { toValue: 1, duration: 8000, useNativeDriver: true }),
    ).start();
  }, [pulseAnim, floatAnim, glowAnim, bgStarAnim]);

  const handleNav = (key: string) => {
    if (key === 'play' || key === 'home') return;
    router.push(`/(app)/${key}` as never);
  };

  const char = profile ? CHARACTERS[profile.selectedCharacter] : CHARACTERS.playerone;
  const xpPercent = (profile?.xp ?? 0) % 100;

  if (loading) {
    return (
      <View style={s.loadRoot}>
        <ActivityIndicator size="large" color="#FFB800" />
        <Text style={s.loadText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <StatusBar hidden />

      {/* Animated deep-space background */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={s.bgGrad1} />
        <View style={s.bgGrad2} />
        <View style={s.bgOrb1} />
        <View style={s.bgOrb2} />
        {/* Star particles */}
        {[...Array(18)].map((_, i) => (
          <Animated.View
            key={i}
            style={[s.star, {
              left: `${(i * 37 + 11) % 100}%` as unknown as number,
              top:  `${(i * 53 + 7)  % 100}%` as unknown as number,
              opacity: glowAnim.interpolate({ inputRange: [0.5, 1], outputRange: [0.2 + (i % 4) * 0.12, 0.7] }),
              transform: [{ scale: 0.5 + (i % 3) * 0.3 }],
            }]}
          />
        ))}
      </View>

      {/* ── Top Bar ── */}
      <View style={s.topBar}>
        <Pressable style={s.profileChip} onPress={() => router.push('/(app)/profile' as never)}>
          <Animated.View style={[s.avatarWrap, { borderColor: char.bodyColor }]}>
            <View style={[s.avatar, { backgroundColor: char.bodyColor }]}>
              <Text style={s.avatarInitial}>{profile?.username[0]?.toUpperCase()}</Text>
            </View>
            <View style={s.trophyBadge}><Text style={s.trophyText}>🏆 {profile?.wins ?? 0}</Text></View>
          </Animated.View>
          <View style={s.profileInfo}>
            <Text style={s.profileName}>{profile?.username}</Text>
            <View style={s.levelRow}>
              <View style={s.levelBadge}><Text style={s.levelNum}>{profile?.level ?? 1}</Text></View>
              <View style={s.xpBarWrap}>
                <View style={s.xpBar}>
                  <Animated.View style={[s.xpFill, { width: `${xpPercent}%` as unknown as number }]} />
                </View>
                <Text style={s.xpLabel}>{xpPercent}/100 XP</Text>
              </View>
            </View>
          </View>
        </Pressable>

        {/* Currency chips */}
        <View style={s.currencyRow}>
          <Pressable style={s.goldChip} onPress={() => router.push('/(app)/shop' as never)}>
            <Text style={s.chipIcon}>🪙</Text>
            <Text style={s.chipVal}>{(profile?.coins ?? 0).toLocaleString()}</Text>
            <View style={s.addBtn}><Text style={s.addText}>+</Text></View>
          </Pressable>
          <Pressable style={s.gemChip} onPress={() => router.push('/(app)/shop' as never)}>
            <Text style={s.chipIcon}>💎</Text>
            <Text style={s.chipVal}>{profile?.gems ?? 0}</Text>
            <View style={[s.addBtn, s.addBtnGem]}><Text style={s.addText}>+</Text></View>
          </Pressable>
        </View>

        <View style={s.topActions}>
          <Pressable style={s.iconCircle} onPress={() => {}}>
            <Text style={s.iconCircleText}>✉️</Text>
            <View style={s.notifDot} />
          </Pressable>
          <Pressable style={s.iconCircle} onPress={() => router.push('/(app)/profile' as never)}>
            <Text style={s.iconCircleText}>⚙️</Text>
          </Pressable>
        </View>
      </View>

      {/* ── Body ── */}
      <View style={s.body}>

        {/* ── Left Sidebar ── */}
        <View style={s.sidebar}>
          {SIDEBAR_ITEMS.map(item => (
            <Pressable key={item.label} style={s.sideItem} onPress={() => handleNav(item.key)}>
              <View style={[s.sideIconCircle, { borderColor: item.accent + '55', backgroundColor: item.accent + '18' }]}>
                <Text style={s.sideIcon}>{item.icon}</Text>
              </View>
              <Text style={s.sideLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* ── Centre ── */}
        <View style={s.centre}>
          {/* Title logo */}
          <View style={s.titleBlock}>
            <Text style={s.titleBomb}>💣</Text>
            <View>
              <Text style={s.titleLine1}>BOMB</Text>
              <Text style={s.titleLine2}>RUNNER</Text>
            </View>
          </View>
          <View style={s.subtitleRow}>
            <View style={s.subtitleLine} />
            <Text style={s.subtitle}>8 PLAYER MULTIPLAYER</Text>
            <View style={s.subtitleLine} />
          </View>

          {/* Hero showcase */}
          <View style={s.heroWrap}>
            <Animated.View style={[s.heroGlow, {
              backgroundColor: char.bodyColor + '28',
              opacity: glowAnim,
            }]} />
            <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
              <HeroCharacter characterId={profile?.selectedCharacter ?? 'playerone'} size={110} animState="idle" />
            </Animated.View>
            {/* Floating companion characters */}
            <View style={s.companionL}>
              <HeroCharacter characterId="speedy" size={60} animState="running" />
            </View>
            <View style={s.companionR}>
              <HeroCharacter characterId="shadow" size={60} animState="idle" />
            </View>
          </View>

          {/* Action buttons */}
          <View style={s.btnStack}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Pressable style={s.quickPlayBtn} onPress={() => router.push('/(app)/lobby' as never)}>
                <View style={s.quickPlayInner}>
                  <Text style={s.quickPlayIcon}>⚡</Text>
                  <View>
                    <Text style={s.quickPlayText}>QUICK PLAY</Text>
                    <Text style={s.quickPlaySub}>Join random match</Text>
                  </View>
                </View>
                <View style={s.quickPlayArrow}><Text style={s.quickPlayArrowText}>▶</Text></View>
              </Pressable>
            </Animated.View>
            <View style={s.btnRow}>
              <Pressable style={s.roomBtn} onPress={() => router.push('/(app)/lobby' as never)}>
                <Text style={s.roomBtnIcon}>🚪</Text>
                <View>
                  <Text style={s.roomBtnText}>ROOM MATCH</Text>
                  <Text style={s.roomBtnSub}>Play with friends</Text>
                </View>
              </Pressable>
              <Pressable style={s.privateBtn} onPress={() => router.push('/(app)/lobby' as never)}>
                <Text style={s.roomBtnIcon}>🔒</Text>
                <View>
                  <Text style={s.roomBtnText}>PRIVATE</Text>
                  <Text style={s.roomBtnSub}>Create or join</Text>
                </View>
              </Pressable>
            </View>
          </View>

          {/* Stats info row */}
          <View style={s.statsRow}>
            {[
              { icon: '👥', val: '8',       label: 'MAX PLAYERS' },
              { icon: '⏱',  val: '2-3 MIN', label: 'DURATION' },
              { icon: '💣', val: 'RANDOM',  label: 'BOMB START' },
              { icon: '👑', val: 'LAST ONE',label: 'WINS' },
            ].map(stat => (
              <View key={stat.label} style={s.statPill}>
                <Text style={s.statPillIcon}>{stat.icon}</Text>
                <Text style={s.statPillVal}>{stat.val}</Text>
                <Text style={s.statPillLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Right Panel ── */}
        <ScrollView style={s.rightPanel} contentContainerStyle={s.rightPanelContent} showsVerticalScrollIndicator={false}>
          {/* Season pass card */}
          <Pressable style={s.seasonCard} onPress={() => router.push('/(app)/missions' as never)}>
            <View style={s.seasonCardInner}>
              <View style={s.seasonBadge}><Text style={s.seasonBadgeText}>⭐ PASS</Text></View>
              <Text style={s.seasonTitle}>SEASON 1</Text>
              <View style={s.seasonBarRow}>
                <View style={s.seasonBarBg}>
                  <View style={[s.seasonBarFill, { width: '35%' }]} />
                </View>
                <View style={s.seasonLvlBadge}><Text style={s.seasonLvlText}>15</Text></View>
              </View>
              <Text style={s.seasonPts}>350 / 1000 pts</Text>
            </View>
          </Pressable>

          {/* Starter pack */}
          <View style={s.packCard}>
            <View style={s.packHeader}>
              <Text style={s.packTitle}>STARTER PACK</Text>
              <View style={s.timerChip}><Text style={s.timerText}>⏰ 23h 59m</Text></View>
            </View>
            <View style={s.packIcons}>
              <View style={s.packItem}><Text style={s.packItemIcon}>🪙</Text><Text style={s.packItemVal}>2000</Text></View>
              <View style={s.packItem}><Text style={s.packItemIcon}>💎</Text><Text style={s.packItemVal}>350</Text></View>
              <View style={s.packItem}><Text style={s.packItemIcon}>🦸</Text><Text style={s.packItemVal}>3x</Text></View>
            </View>
            <Pressable style={s.packBtn} onPress={() => router.push('/(app)/shop' as never)}>
              <Text style={s.packBtnText}>GET PACK →</Text>
            </Pressable>
          </View>

          {/* Unlock All */}
          <View style={[s.packCard, s.unlockCard]}>
            <View style={[s.packHeader, { marginBottom: 6 }]}>
              <Text style={s.packTitle}>UNLOCK ALL</Text>
              <Text style={s.unlockBadge}>🔥 HOT</Text>
            </View>
            <View style={s.unlockPreview}>
              <HeroCharacter characterId="blaze" size={52} animState="idle" />
              <View style={s.unlockInfo}>
                <Text style={s.unlockDesc}>All 8 Heroes</Text>
                <Text style={s.unlockDesc}>All Bomb Skins</Text>
                <Text style={s.unlockDesc}>No Ads Forever</Text>
              </View>
            </View>
            <Pressable style={s.unlockBtn} onPress={() => router.push('/(app)/shop' as never)}>
              <Text style={s.unlockBtnText}>₹249 UNLOCK →</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>

      {/* ── Bottom Nav ── */}
      <View style={s.bottomNav}>
        {NAV_ITEMS.map(item => (
          <Pressable
            key={item.key}
            style={[s.navItem, item.isCenter && s.navItemCenter]}
            onPress={() => handleNav(item.key)}
          >
            {item.isCenter ? (
              <View style={s.navCenterBtn}>
                <Text style={s.navCenterIcon}>{item.icon}</Text>
              </View>
            ) : (
              <>
                <Text style={[s.navIcon, item.active && s.navIconActive]}>{item.icon}</Text>
                <Text style={[s.navLabel, item.active && s.navLabelActive]}>{item.label}</Text>
                {item.active && <View style={s.navActiveDot} />}
              </>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

/* ── Design Tokens ───────────────────────────────── */
const C = {
  bg:     '#080E1C',
  panel:  '#0F1E3A',
  panelB: '#162947',
  gold:   '#FFB800',
  goldL:  '#FFC93D',
  blue:   '#3B82F6',
  green:  '#22C55E',
  red:    '#EF4444',
  purple: '#A855F7',
  border: 'rgba(255,255,255,0.09)',
  txt:    '#FFFFFF',
  muted:  'rgba(255,255,255,0.5)',
  dim:    'rgba(255,255,255,0.28)',
};

const s = StyleSheet.create({
  root:     { flex: 1, backgroundColor: C.bg },
  loadRoot: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadText: { color: C.gold, fontSize: 14, fontWeight: '700' },

  /* Background */
  bgGrad1:  { position: 'absolute', top: -80,  left: -80,  width: 320, height: 320, borderRadius: 160, backgroundColor: '#3B82F620' },
  bgGrad2:  { position: 'absolute', bottom: -60, right: -60, width: 280, height: 280, borderRadius: 140, backgroundColor: '#FFB80012' },
  bgOrb1:   { position: 'absolute', top: '30%', left: '40%', width: 200, height: 200, borderRadius: 100, backgroundColor: '#A855F708' },
  bgOrb2:   { position: 'absolute', top: '60%', left: '10%', width: 150, height: 150, borderRadius: 75,  backgroundColor: '#22C55E08' },
  star:     { position: 'absolute', width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#fff' },

  /* Top Bar */
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingTop: 6, paddingBottom: 6,
    backgroundColor: 'rgba(8,14,28,0.92)', borderBottomWidth: 1, borderBottomColor: C.border,
    gap: 8,
  },
  profileChip: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  avatarWrap:  { width: 44, height: 44, borderRadius: 22, borderWidth: 2, padding: 2, position: 'relative' },
  avatar:      { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { color: '#fff', fontWeight: '900', fontSize: 16 },
  trophyBadge: { position: 'absolute', bottom: -4, right: -4, backgroundColor: '#FFB800', borderRadius: 8, paddingHorizontal: 3, paddingVertical: 1 },
  trophyText:  { fontSize: 7, fontWeight: '900', color: '#000' },
  profileInfo: { flex: 1 },
  profileName: { color: C.txt, fontWeight: '800', fontSize: 12 },
  levelRow:    { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  levelBadge:  { backgroundColor: C.gold, borderRadius: 6, paddingHorizontal: 5, paddingVertical: 1 },
  levelNum:    { color: '#000', fontWeight: '900', fontSize: 9 },
  xpBarWrap:   { flex: 1, gap: 1 },
  xpBar:       { height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' },
  xpFill:      { height: 4, backgroundColor: C.gold, borderRadius: 2 },
  xpLabel:     { color: C.dim, fontSize: 7, fontWeight: '600' },
  currencyRow: { flexDirection: 'row', gap: 5 },
  goldChip:    { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#1A160A', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(255,184,0,0.4)' },
  gemChip:     { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#160A2A', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(168,85,247,0.4)' },
  chipIcon:    { fontSize: 13 },
  chipVal:     { color: C.txt, fontWeight: '800', fontSize: 12 },
  addBtn:      { backgroundColor: '#22C55E', borderRadius: 7, paddingHorizontal: 4, paddingVertical: 1 },
  addBtnGem:   { backgroundColor: '#A855F7' },
  addText:     { color: '#fff', fontSize: 11, fontWeight: '900' },
  topActions:  { flexDirection: 'row', gap: 5 },
  iconCircle:  { width: 32, height: 32, borderRadius: 16, backgroundColor: C.panel, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  iconCircleText: { fontSize: 14 },
  notifDot:   { position: 'absolute', top: 5, right: 5, width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#EF4444', borderWidth: 1, borderColor: C.bg },

  /* Body */
  body: { flex: 1, flexDirection: 'row' },

  /* Sidebar */
  sidebar: { width: 62, backgroundColor: 'rgba(8,14,28,0.85)', borderRightWidth: 1, borderRightColor: C.border, paddingTop: 8, alignItems: 'center', gap: 2 },
  sideItem: { alignItems: 'center', paddingVertical: 8, width: 58, borderRadius: 12 },
  sideIconCircle: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginBottom: 3 },
  sideIcon:  { fontSize: 18 },
  sideLabel: { color: C.dim, fontSize: 7.5, fontWeight: '700', letterSpacing: 0.5 },

  /* Centre */
  centre: { flex: 1, alignItems: 'center', paddingTop: 6, paddingHorizontal: 10 },
  titleBlock: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  titleBomb:  { fontSize: 36 },
  titleLine1: { color: C.gold, fontSize: 30, fontWeight: '900', letterSpacing: 4, lineHeight: 32, textShadowColor: 'rgba(255,184,0,0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8 },
  titleLine2: { color: C.txt,  fontSize: 26, fontWeight: '900', letterSpacing: 5, lineHeight: 28 },
  subtitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  subtitleLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,184,0,0.3)' },
  subtitle:    { color: 'rgba(255,184,0,0.75)', fontSize: 10, fontWeight: '700', letterSpacing: 3 },

  heroWrap: { width: 200, height: 130, alignItems: 'center', justifyContent: 'center', position: 'relative', marginVertical: 2 },
  heroGlow: { position: 'absolute', width: 160, height: 100, borderRadius: 80 },
  companionL: { position: 'absolute', left: 0,  bottom: 4, opacity: 0.8 },
  companionR: { position: 'absolute', right: 0, bottom: 4, opacity: 0.8 },

  btnStack: { width: '100%', gap: 7, marginTop: 2 },
  quickPlayBtn: {
    backgroundColor: C.gold, borderRadius: 16, paddingVertical: 10, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 2, borderColor: C.goldL,
    shadowColor: C.gold, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 14,
  },
  quickPlayInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  quickPlayIcon:  { fontSize: 22 },
  quickPlayText:  { color: '#000', fontWeight: '900', fontSize: 17, letterSpacing: 1 },
  quickPlaySub:   { color: 'rgba(0,0,0,0.55)', fontSize: 10, fontWeight: '600' },
  quickPlayArrow: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.2)', alignItems: 'center', justifyContent: 'center' },
  quickPlayArrowText: { color: '#000', fontSize: 14, fontWeight: '900' },
  btnRow:      { flexDirection: 'row', gap: 7 },
  roomBtn:     { flex: 1, backgroundColor: C.blue, borderRadius: 13, paddingVertical: 9, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: 'rgba(96,165,250,0.4)', shadowColor: C.blue, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8 },
  privateBtn:  { flex: 1, backgroundColor: C.green, borderRadius: 13, paddingVertical: 9, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: 'rgba(74,222,128,0.4)', shadowColor: C.green, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8 },
  roomBtnIcon: { fontSize: 16 },
  roomBtnText: { color: '#fff', fontWeight: '900', fontSize: 11 },
  roomBtnSub:  { color: 'rgba(255,255,255,0.6)', fontSize: 8, fontWeight: '600' },

  statsRow: { flexDirection: 'row', gap: 6, marginTop: 6, width: '100%' },
  statPill: { flex: 1, backgroundColor: C.panel, borderRadius: 10, paddingVertical: 6, paddingHorizontal: 4, alignItems: 'center', borderWidth: 1, borderColor: C.border, gap: 1 },
  statPillIcon:  { fontSize: 12 },
  statPillVal:   { color: C.gold, fontSize: 9, fontWeight: '900', textAlign: 'center' },
  statPillLabel: { color: C.dim,  fontSize: 7, fontWeight: '600', textAlign: 'center' },

  /* Right Panel */
  rightPanel: { width: 136 },
  rightPanelContent: { padding: 7, gap: 8 },

  seasonCard: { borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,184,0,0.3)' },
  seasonCardInner: { backgroundColor: C.panel, padding: 10, gap: 5 },
  seasonBadge: { backgroundColor: C.gold, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2, alignSelf: 'flex-start' },
  seasonBadgeText: { color: '#000', fontSize: 8, fontWeight: '900' },
  seasonTitle: { color: C.txt, fontWeight: '900', fontSize: 13 },
  seasonBarRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  seasonBarBg:  { flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' },
  seasonBarFill: { height: 6, backgroundColor: C.gold, borderRadius: 3 },
  seasonLvlBadge: { width: 20, height: 20, borderRadius: 10, backgroundColor: C.gold, alignItems: 'center', justifyContent: 'center' },
  seasonLvlText: { color: '#000', fontSize: 9, fontWeight: '900' },
  seasonPts: { color: C.muted, fontSize: 9, fontWeight: '600' },

  packCard: { backgroundColor: C.panel, borderRadius: 14, padding: 10, borderWidth: 1, borderColor: C.border, gap: 8 },
  unlockCard: { borderColor: 'rgba(168,85,247,0.35)' },
  packHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  packTitle:  { color: C.txt, fontWeight: '900', fontSize: 11, letterSpacing: 0.5 },
  timerChip:  { backgroundColor: 'rgba(239,68,68,0.2)', borderRadius: 8, paddingHorizontal: 5, paddingVertical: 2, borderWidth: 1, borderColor: 'rgba(239,68,68,0.4)' },
  timerText:  { color: '#EF4444', fontSize: 8, fontWeight: '800' },
  packIcons:  { flexDirection: 'row', gap: 4, justifyContent: 'center' },
  packItem:   { alignItems: 'center', gap: 1 },
  packItemIcon: { fontSize: 18 },
  packItemVal:  { color: C.gold, fontSize: 9, fontWeight: '800' },
  packBtn:    { backgroundColor: C.blue, borderRadius: 10, paddingVertical: 7, alignItems: 'center' },
  packBtnText: { color: '#fff', fontWeight: '900', fontSize: 10, letterSpacing: 0.5 },
  unlockBadge: { color: '#EF4444', fontSize: 10, fontWeight: '900' },
  unlockPreview: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  unlockInfo: { flex: 1, gap: 2 },
  unlockDesc:  { color: C.muted, fontSize: 9, fontWeight: '600' },
  unlockBtn:   { backgroundColor: C.gold, borderRadius: 10, paddingVertical: 7, alignItems: 'center' },
  unlockBtnText: { color: '#000', fontWeight: '900', fontSize: 10, letterSpacing: 0.5 },

  /* Bottom Nav */
  bottomNav: { height: 60, backgroundColor: 'rgba(8,14,28,0.96)', borderTopWidth: 1, borderTopColor: C.border, flexDirection: 'row', alignItems: 'center' },
  navItem:       { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, position: 'relative' },
  navItemCenter: { paddingBottom: 18 },
  navCenterBtn:  { width: 54, height: 54, borderRadius: 27, backgroundColor: C.gold, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: C.goldL, marginTop: -22, shadowColor: C.gold, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.6, shadowRadius: 12 },
  navCenterIcon: { fontSize: 24 },
  navIcon:       { fontSize: 18 },
  navIconActive: { textShadowColor: C.gold, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 6 },
  navLabel:      { color: C.dim,  fontSize: 8.5, fontWeight: '700', marginTop: 2 },
  navLabelActive:{ color: C.gold },
  navActiveDot:  { position: 'absolute', bottom: 4, width: 4, height: 4, borderRadius: 2, backgroundColor: C.gold },
});


