import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { getOrCreateProfile } from '@/lib/playerStore';
import { getLeaderboard } from '@/db/api';
import { CHARACTERS } from '@/game/characters';
import type { LeaderboardEntry } from '@/types/types';

const TABS = ['Global', 'Weekly', 'Friends'] as const;
type Tab = typeof TABS[number];

export default function LeaderboardScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('Global');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [myDeviceId, setMyDeviceId] = useState('');

  useEffect(() => {
    (async () => {
      const profile = await getOrCreateProfile();
      setMyDeviceId(profile.deviceId);
      const data = await getLeaderboard(50);
      setEntries(data);
      setLoading(false);
    })();
  }, []);

  const myRank = entries.findIndex(e => e.deviceId === myDeviceId) + 1;

  return (
    <View style={s.root}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={s.header}>
        <Pressable style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backIcon}>←</Text>
        </Pressable>
        <Text style={s.title}>🏆 LEADERBOARD</Text>
        <View style={s.headerSpacer} />
      </View>

      {/* Tabs */}
      <View style={s.tabs}>
        {TABS.map(tab => (
          <Pressable
            key={tab}
            style={[s.tab, activeTab === tab && s.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>{tab}</Text>
          </Pressable>
        ))}
      </View>

      {/* Top 3 podium */}
      {!loading && entries.length >= 3 && (
        <View style={s.podium}>
          {/* 2nd */}
          <View style={s.podiumSlot}>
            <PodiumAvatar entry={entries[1]} rank={2} />
          </View>
          {/* 1st */}
          <View style={[s.podiumSlot, s.podiumFirst]}>
            <Text style={s.podiumCrown}>👑</Text>
            <PodiumAvatar entry={entries[0]} rank={1} />
          </View>
          {/* 3rd */}
          <View style={s.podiumSlot}>
            <PodiumAvatar entry={entries[2]} rank={3} />
          </View>
        </View>
      )}

      {/* My rank strip */}
      {myRank > 0 && (
        <View style={s.myRank}>
          <Text style={s.myRankLabel}>Your Rank</Text>
          <Text style={s.myRankNum}>#{myRank}</Text>
        </View>
      )}

      {/* List */}
      {loading ? (
        <ActivityIndicator color="#FFB800" style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={entries}
          keyExtractor={item => item.deviceId}
          contentInsetAdjustmentBehavior="automatic"
          style={{ flex: 1 }}
          renderItem={({ item, index }) => (
            <LeaderboardRow entry={item} rank={index + 1} isMe={item.deviceId === myDeviceId} />
          )}
        />
      )}
    </View>
  );
}

function PodiumAvatar({ entry, rank }: { entry: LeaderboardEntry; rank: number }) {
  const char = CHARACTERS[entry.characterId as keyof typeof CHARACTERS] ?? CHARACTERS.playerone;
  const colors = ['#FFB800', '#C0C0C0', '#CD7F32'];
  return (
    <View style={[s.podiumAvatar, { borderColor: colors[rank - 1] }]}>
      <View style={[s.avatarHead, { backgroundColor: char.skinColor }]}>
        <View style={[s.avatarHair, { backgroundColor: char.hairColor }]} />
      </View>
      <View style={[s.avatarBody, { backgroundColor: char.bodyColor }]} />
      <Text style={[s.podiumRank, { color: colors[rank - 1] }]}>#{rank}</Text>
      <Text style={s.podiumName} numberOfLines={1}>{entry.username}</Text>
      <Text style={s.podiumWins}>{entry.wins}W</Text>
    </View>
  );
}

function LeaderboardRow({ entry, rank, isMe }: { entry: LeaderboardEntry; rank: number; isMe: boolean }) {
  const char = CHARACTERS[entry.characterId as keyof typeof CHARACTERS] ?? CHARACTERS.playerone;
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;
  return (
    <View style={[s.row, isMe && s.rowMe]}>
      <Text style={s.rowRank}>{medal ?? `#${rank}`}</Text>
      <View style={[s.rowDot, { backgroundColor: char.bodyColor }]} />
      <Text style={s.rowName} numberOfLines={1}>{entry.username}</Text>
      <View style={s.rowStats}>
        <Text style={s.rowStat}>🏆 {entry.wins}</Text>
        <Text style={s.rowStat}>🎮 {entry.matches}</Text>
        <Text style={s.rowScore}>{entry.rating ?? 0}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B1629' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: '#fff', fontSize: 18, fontWeight: '700' },
  title: { flex: 1, textAlign: 'center', color: '#FFB800', fontSize: 20, fontWeight: '900', letterSpacing: 2 },
  headerSpacer: { width: 36 },
  tabs: { flexDirection: 'row', marginHorizontal: 16, backgroundColor: '#132040', borderRadius: 14, padding: 4, gap: 4, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: '#2563EB' },
  tabText: { color: 'rgba(255,255,255,0.5)', fontWeight: '700', fontSize: 13 },
  tabTextActive: { color: '#fff' },
  podium: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', marginBottom: 16, gap: 12, paddingHorizontal: 24 },
  podiumSlot: { flex: 1, alignItems: 'center' },
  podiumFirst: { marginBottom: 16 },
  podiumCrown: { fontSize: 28, marginBottom: -4 },
  podiumAvatar: { alignItems: 'center', gap: 3, borderWidth: 2, borderRadius: 14, padding: 10, backgroundColor: '#0F1E35', minWidth: 80 },
  avatarHead: { width: 36, height: 36, borderRadius: 18, overflow: 'hidden', alignItems: 'center' },
  avatarHair: { position: 'absolute', top: 0, width: 36, height: 18, borderTopLeftRadius: 18, borderTopRightRadius: 18 },
  avatarBody: { width: 28, height: 22, borderRadius: 6 },
  podiumRank: { fontWeight: '900', fontSize: 14 },
  podiumName: { color: '#fff', fontWeight: '800', fontSize: 11, maxWidth: 80 },
  podiumWins: { color: '#22C55E', fontSize: 10, fontWeight: '700' },
  myRank: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(37,99,235,0.2)', marginHorizontal: 16, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(37,99,235,0.4)' },
  myRankLabel: { color: 'rgba(255,255,255,0.7)', fontWeight: '700', fontSize: 13 },
  myRankNum: { color: '#FFB800', fontWeight: '900', fontSize: 18 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', gap: 10 },
  rowMe: { backgroundColor: 'rgba(255,184,0,0.08)' },
  rowRank: { width: 32, textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontWeight: '800', fontSize: 13 },
  rowDot: { width: 10, height: 10, borderRadius: 5 },
  rowName: { flex: 1, color: '#fff', fontWeight: '700', fontSize: 14 },
  rowStats: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowStat: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '600' },
  rowScore: { color: '#FFB800', fontWeight: '900', fontSize: 14, minWidth: 40, textAlign: 'right' },
});
