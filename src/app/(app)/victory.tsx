import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CHARACTERS } from '@/game/characters';
import type { CharacterId } from '@/types/types';
import { getOrCreateProfile, updateProfile } from '@/lib/playerStore';

export default function VictoryScreen() {
  const { winnerName, winnerChar, isMe } = useLocalSearchParams<{
    winnerName: string; winnerChar: string; isMe: string;
  }>();
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const crownAnim = useRef(new Animated.Value(0)).current;

  const won = isMe === '1';
  const charId = (winnerChar ?? 'playerone') as CharacterId;
  const char = CHARACTERS[charId] ?? CHARACTERS.playerone;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(crownAnim, { toValue: -8, duration: 600, useNativeDriver: true }),
        Animated.timing(crownAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
    ).start();
    // Award XP/coins
    if (won) {
      (async () => {
        const profile = await getOrCreateProfile();
        await updateProfile({
          coins: profile.coins + 150,
          xp: profile.xp + 200,
          wins: profile.wins + 1,
          matches: profile.matches + 1,
        });
      })();
    } else {
      (async () => {
        const profile = await getOrCreateProfile();
        await updateProfile({ matches: profile.matches + 1, coins: profile.coins + 30, xp: profile.xp + 50 });
      })();
    }
  }, []);

  return (
    <View style={s.root}>
      <StatusBar hidden />

      {/* Background particles (simulated with static dots) */}
      {Array.from({ length: 20 }).map((_, i) => (
        <View key={i} style={[s.confetti, {
          left: `${(i * 17 + 5) % 100}%`,
          top: `${(i * 23 + 10) % 90}%`,
          backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          width: 8 + (i % 4) * 4,
          height: 8 + (i % 3) * 4,
          borderRadius: i % 2 === 0 ? 4 : 0,
          opacity: 0.7,
        } as any]} />
      ))}

      <Animated.View style={[s.card, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
        {/* Crown */}
        <Animated.Text style={[s.crown, { transform: [{ translateY: crownAnim }] }]}>
          {won ? '👑' : '💀'}
        </Animated.Text>

        {/* Rank */}
        <View style={[s.rankBadge, won ? s.rankWinner : s.rankLoser]}>
          <Text style={s.rankNum}>{won ? '#1' : 'OUT'}</Text>
        </View>

        {/* Winner name */}
        <Text style={[s.winText, !won && s.loseText]}>
          {won ? '🎉 WINNER!' : '💥 ELIMINATED!'}
        </Text>
        <Text style={s.winnerName}>{winnerName}</Text>

        {/* Character big display */}
        <View style={[s.charDisplay, { backgroundColor: char.bodyColor + '33' }]}>
          <View style={[s.bigBody, { backgroundColor: char.bodyColor }]}>
            <View style={[s.bigHead, { backgroundColor: char.skinColor }]}>
              <View style={[s.bigHair, { backgroundColor: char.hairColor }]} />
              <View style={s.bigEyes}>
                <View style={s.bigEye} /><View style={s.bigEye} />
              </View>
              <View style={s.bigMouth} />
            </View>
            {won && <Text style={s.victoryBomb}>💣</Text>}
            <View style={[s.bigShoes, { backgroundColor: char.shoeColor }]} />
          </View>
        </View>

        {/* Rewards */}
        <View style={s.rewardsRow}>
          <View style={s.rewardChip}>
            <Text style={s.rewardIcon}>🪙</Text>
            <Text style={s.rewardVal}>+{won ? 150 : 30}</Text>
          </View>
          <View style={s.rewardChip}>
            <Text style={s.rewardIcon}>⭐</Text>
            <Text style={s.rewardVal}>+{won ? 200 : 50} XP</Text>
          </View>
          {won && (
            <View style={[s.rewardChip, s.rewardWin]}>
              <Text style={s.rewardIcon}>🏆</Text>
              <Text style={s.rewardVal}>WIN +1</Text>
            </View>
          )}
        </View>

        {/* Buttons */}
        <View style={s.btnRow}>
          <Pressable style={s.lobbyBtn} onPress={() => router.replace('/(app)/home' as never)}>
            <Text style={s.lobbyBtnText}>🏠 LOBBY</Text>
          </Pressable>
          <Pressable style={s.playAgainBtn} onPress={() => router.replace('/(app)/lobby' as never)}>
            <Text style={s.playAgainBtnText}>▶ PLAY AGAIN</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const CONFETTI_COLORS = ['#FFB800', '#2563EB', '#22C55E', '#EF4444', '#A855F7', '#EC4899'];

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#060F1E', alignItems: 'center', justifyContent: 'center' },
  confetti: { position: 'absolute' },
  card: { backgroundColor: '#0F1E35', borderRadius: 24, padding: 28, alignItems: 'center', gap: 12, borderWidth: 2, borderColor: 'rgba(255,184,0,0.3)', minWidth: 320, maxWidth: 420 },
  crown: { fontSize: 56 },
  rankBadge: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  rankWinner: { backgroundColor: '#FFB800' },
  rankLoser: { backgroundColor: '#374151' },
  rankNum: { color: '#000', fontWeight: '900', fontSize: 20 },
  winText: { color: '#FFB800', fontSize: 28, fontWeight: '900', letterSpacing: 2 },
  loseText: { color: '#EF4444' },
  winnerName: { color: '#fff', fontSize: 22, fontWeight: '800' },
  charDisplay: { width: 120, height: 150, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  bigBody: { width: 70, height: 90, borderRadius: 14, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 8, borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' },
  bigHead: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  bigHair: { position: 'absolute', top: 0, width: 44, height: 22, borderTopLeftRadius: 22, borderTopRightRadius: 22 },
  bigEyes: { flexDirection: 'row', gap: 8, marginTop: 18 },
  bigEye: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#1a1a2e' },
  bigMouth: { width: 14, height: 5, borderRadius: 3, backgroundColor: '#c0392b', marginTop: 3 },
  victoryBomb: { fontSize: 18, marginTop: 4 },
  bigShoes: { width: 50, height: 12, borderRadius: 6, marginTop: 'auto' },
  rewardsRow: { flexDirection: 'row', gap: 10 },
  rewardChip: { backgroundColor: '#132040', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  rewardWin: { backgroundColor: '#1A3A1A', borderColor: 'rgba(34,197,94,0.3)' },
  rewardIcon: { fontSize: 16 },
  rewardVal: { color: '#FFB800', fontWeight: '900', fontSize: 13 },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  lobbyBtn: { flex: 1, backgroundColor: '#374151', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  lobbyBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  playAgainBtn: { flex: 2, backgroundColor: '#FFB800', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  playAgainBtnText: { color: '#000', fontWeight: '900', fontSize: 16 },
});
