import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CHARACTERS } from '@/game/characters';
import type { CharacterId } from '@/types/types';
import { getOrCreateProfile, updateProfile } from '@/lib/playerStore';
import HeroCharacter from '@/components/ui/HeroCharacter';

const CONFETTI_COLORS = ['#FFB800', '#3B82F6', '#22C55E', '#EF4444', '#A855F7', '#EC4899', '#00BCD4'];

export default function VictoryScreen() {
  const { winnerName, winnerChar, isMe } = useLocalSearchParams<{
    winnerName: string; winnerChar: string; isMe: string;
  }>();
  const router = useRouter();

  const scaleAnim  = useRef(new Animated.Value(0.3)).current;
  const opacAnim   = useRef(new Animated.Value(0)).current;
  const crownAnim  = useRef(new Animated.Value(0)).current;
  const shineAnim  = useRef(new Animated.Value(0)).current;

  const won    = isMe === '1';
  const charId = (winnerChar ?? 'playerone') as CharacterId;

  useEffect(() => {
    // Entrance spring
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
      Animated.timing(opacAnim,  { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start();
    // Crown bob
    Animated.loop(Animated.sequence([
      Animated.timing(crownAnim, { toValue: -10, duration: 550, useNativeDriver: true }),
      Animated.timing(crownAnim, { toValue: 0,   duration: 550, useNativeDriver: true }),
    ])).start();
    // Shine sweep
    Animated.loop(
      Animated.timing(shineAnim, { toValue: 1, duration: 2200, useNativeDriver: true }),
    ).start();
    // Award XP/coins
    (async () => {
      const profile = await getOrCreateProfile();
      if (won) {
        await updateProfile({ coins: profile.coins + 150, xp: profile.xp + 200, wins: profile.wins + 1, matches: profile.matches + 1 });
      } else {
        await updateProfile({ matches: profile.matches + 1, coins: profile.coins + 30, xp: profile.xp + 50 });
      }
    })();
  }, [won, scaleAnim, opacAnim, crownAnim, shineAnim]);

  const shineTranslate = shineAnim.interpolate({ inputRange: [0, 1], outputRange: [-300, 500] });
  const REWARDS = won
    ? [
        { icon: '🪙', label: 'COINS',  val: '+150', color: '#FFB800' },
        { icon: '⭐', label: 'XP',     val: '+200', color: '#A855F7' },
        { icon: '🏆', label: 'TROPHY', val: '+1',   color: '#FFB800' },
      ]
    : [
        { icon: '🪙', label: 'COINS',  val: '+30',  color: '#FFB800' },
        { icon: '⭐', label: 'XP',     val: '+50',  color: '#A855F7' },
      ];

  return (
    <View style={s.root}>
      <StatusBar hidden />

      {/* Background confetti burst */}
      {Array.from({ length: 28 }).map((_, i) => (
        <View key={i} style={[s.confetti, {
          left: `${(i * 23 + 8) % 100}%` as unknown as number,
          top:  `${(i * 17 + 5) % 100}%` as unknown as number,
          backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          width:  6 + (i % 5) * 5,
          height: 6 + (i % 4) * 5,
          borderRadius: i % 3 === 0 ? 20 : 2,
          opacity: won ? 0.65 : 0.25,
          transform: [{ rotate: `${(i * 31) % 360}deg` }],
        } as object]} />
      ))}

      {/* Full-bg glow */}
      <View style={[s.bgGlow, won ? s.bgGlowWin : s.bgGlowLose]} />

      <Animated.View style={[s.card, won && s.cardWin, { transform: [{ scale: scaleAnim }], opacity: opacAnim }]}>

        {/* Shine sweep */}
        {won && (
          <Animated.View style={[s.shine, { transform: [{ translateX: shineTranslate }] }]} />
        )}

        {/* Crown / skull */}
        <Animated.Text style={[s.crownEmoji, { transform: [{ translateY: crownAnim }] }]}>
          {won ? '👑' : '💀'}
        </Animated.Text>

        {/* Rank badge */}
        <View style={[s.rankRing, won ? s.rankRingWin : s.rankRingLose]}>
          <View style={[s.rankBadge, won ? s.rankBadgeWin : s.rankBadgeLose]}>
            <Text style={[s.rankText, won && s.rankTextWin]}>{won ? '#1' : 'OUT'}</Text>
          </View>
        </View>

        {/* Result headline */}
        <Text style={[s.headline, won ? s.headlineWin : s.headlineLose]}>
          {won ? '🎉 WINNER!' : '💥 ELIMINATED!'}
        </Text>
        <Text style={s.winnerName}>{winnerName}</Text>

        {/* Character showcase */}
        <View style={[s.heroShowcase, {
          borderColor: won ? 'rgba(255,184,0,0.3)' : 'rgba(239,68,68,0.2)',
          backgroundColor: won ? 'rgba(255,184,0,0.06)' : 'rgba(239,68,68,0.04)',
        }]}>
          <HeroCharacter
            characterId={charId}
            size={won ? 100 : 80}
            animState={won ? 'celebrate' : 'idle'}
            showBomb={won}
          />
        </View>

        {/* Reward chips */}
        <View style={s.rewardRow}>
          {REWARDS.map(r => (
            <View key={r.label} style={[s.rewardChip, { borderColor: r.color + '44', backgroundColor: r.color + '10' }]}>
              <Text style={s.rewardIcon}>{r.icon}</Text>
              <View>
                <Text style={[s.rewardVal, { color: r.color }]}>{r.val}</Text>
                <Text style={s.rewardLabel}>{r.label}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Match stats */}
        <View style={s.statsRow}>
          {[
            { label: 'MATCH TIME', val: '2:34' },
            { label: 'BOMBS PASSED', val: '7' },
            { label: 'DODGES', val: '12' },
          ].map(st => (
            <View key={st.label} style={s.statCell}>
              <Text style={s.statVal}>{st.val}</Text>
              <Text style={s.statLabel}>{st.label}</Text>
            </View>
          ))}
        </View>

        {/* Action buttons */}
        <View style={s.btns}>
          <Pressable style={s.homeBtn} onPress={() => router.replace('/(app)/home' as never)}>
            <Text style={s.homeBtnText}>🏠 HOME</Text>
          </Pressable>
          <Pressable style={s.playAgainBtn} onPress={() => router.replace('/(app)/lobby' as never)}>
            <Text style={s.playAgainText}>⚡ PLAY AGAIN</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  root:      { flex: 1, backgroundColor: '#040B18', alignItems: 'center', justifyContent: 'center' },
  confetti:  { position: 'absolute' },
  bgGlow:    { position: 'absolute', width: 500, height: 500, borderRadius: 250, top: '10%', alignSelf: 'center' },
  bgGlowWin: { backgroundColor: 'rgba(255,184,0,0.07)' },
  bgGlowLose:{ backgroundColor: 'rgba(239,68,68,0.05)' },

  card: {
    backgroundColor: '#0F1E35', borderRadius: 28, padding: 24,
    alignItems: 'center', gap: 12,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)',
    minWidth: 320, maxWidth: 440, width: '90%',
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.6, shadowRadius: 24,
  },
  cardWin: { borderColor: 'rgba(255,184,0,0.35)' },

  shine: {
    position: 'absolute', top: 0, bottom: 0, width: 100,
    backgroundColor: 'rgba(255,255,255,0.04)',
    transform: [{ skewX: '-20deg' }],
    zIndex: 5,
  },

  crownEmoji: { fontSize: 60 },

  rankRing: { width: 76, height: 76, borderRadius: 38, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  rankRingWin:  { borderColor: '#FFB800' },
  rankRingLose: { borderColor: '#4B5563' },
  rankBadge:    { width: 62, height: 62, borderRadius: 31, alignItems: 'center', justifyContent: 'center' },
  rankBadgeWin: { backgroundColor: '#FFB800' },
  rankBadgeLose:{ backgroundColor: '#374151' },
  rankText:     { color: 'rgba(255,255,255,0.7)', fontWeight: '900', fontSize: 20 },
  rankTextWin:  { color: '#000' },

  headline:     { fontSize: 30, fontWeight: '900', letterSpacing: 2 },
  headlineWin:  { color: '#FFB800' },
  headlineLose: { color: '#EF4444' },
  winnerName:   { color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: 1 },

  heroShowcase: {
    width: 130, height: 148, borderRadius: 20, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'flex-end',
    paddingBottom: 4,
  },

  rewardRow:  { flexDirection: 'row', gap: 8 },
  rewardChip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1 },
  rewardIcon: { fontSize: 18 },
  rewardVal:  { fontWeight: '900', fontSize: 15 },
  rewardLabel:{ color: 'rgba(255,255,255,0.45)', fontSize: 9, fontWeight: '700' },

  statsRow:   { flexDirection: 'row', gap: 0, width: '100%', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, overflow: 'hidden' },
  statCell:   { flex: 1, alignItems: 'center', paddingVertical: 10, borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.06)' },
  statVal:    { color: '#fff', fontWeight: '900', fontSize: 16 },
  statLabel:  { color: 'rgba(255,255,255,0.4)', fontSize: 8, fontWeight: '700', textAlign: 'center' },

  btns:         { flexDirection: 'row', gap: 10, width: '100%', marginTop: 4 },
  homeBtn:      { flex: 1, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  homeBtnText:  { color: 'rgba(255,255,255,0.75)', fontWeight: '800', fontSize: 14 },
  playAgainBtn: { flex: 2, backgroundColor: '#FFB800', borderRadius: 14, paddingVertical: 14, alignItems: 'center', shadowColor: '#FFB800', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 12 },
  playAgainText:{ color: '#000', fontWeight: '900', fontSize: 16 },
});
