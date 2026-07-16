import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  ActivityIndicator, FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { getOrCreateProfile, updateProfile } from '@/lib/playerStore';
import type { PlayerProfile } from '@/types/types';
import { CHARACTERS } from '@/game/characters';

const MISSION_DEFS = [
  { id: 'm1', title: 'Win 3 Matches', icon: '🏆', category: 'daily', target: 3, reward: 100, field: 'wins' as const },
  { id: 'm2', title: 'Collect 5 Power-ups', icon: '⭐', category: 'daily', target: 5, reward: 100, field: 'matches' as const },
  { id: 'm3', title: 'Use Dash 10 Times', icon: '⚡', category: 'daily', target: 10, reward: 150, field: 'matches' as const },
  { id: 'm4', title: 'Play 2 matches with friends', icon: '👫', category: 'daily', target: 2, reward: 100, field: 'matches' as const },
  { id: 'm5', title: 'Pass the bomb 20 times', icon: '💣', category: 'weekly', target: 20, reward: 300, field: 'wins' as const },
  { id: 'm6', title: 'Win 10 matches', icon: '🎖', category: 'weekly', target: 10, reward: 500, field: 'wins' as const },
  { id: 'm7', title: 'Survive 50 explosions', icon: '💥', category: 'weekly', target: 50, reward: 400, field: 'matches' as const },
  { id: 'm8', title: 'Be last standing 5 times', icon: '👑', category: 'achievements', target: 5, reward: 1000, field: 'wins' as const },
  { id: 'm9', title: 'Play 100 matches', icon: '🎮', category: 'achievements', target: 100, reward: 2000, field: 'matches' as const },
];

const TABS = ['Daily', 'Weekly', 'Achievements'] as const;
type Tab = typeof TABS[number];

export default function MissionsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('Daily');
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const p = await getOrCreateProfile();
      setProfile(p);
      setLoading(false);
    })();
  }, []);

  const catKey = activeTab.toLowerCase() as 'daily' | 'weekly' | 'achievements';
  const filtered = MISSION_DEFS.filter(m => m.category === catKey);

  const totalReward = filtered.reduce((sum, m) => sum + m.reward, 0);

  return (
    <View style={s.root}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={s.header}>
        <Pressable style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backIcon}>←</Text>
        </Pressable>
        <Text style={s.title}>📋 MISSIONS</Text>
        <View style={s.headerSpacer} />
      </View>

      {/* Season progress */}
      {profile && (
        <View style={s.seasonBar}>
          <View style={s.seasonLeft}>
            <Text style={s.seasonLabel}>⭐ SEASON 1</Text>
            <Text style={s.seasonXp}>{profile.xp} / 5000 XP</Text>
          </View>
          <View style={s.progressWrap}>
            <View style={[s.progressBar, { width: `${Math.min(100, (profile.xp / 5000) * 100)}%` }]} />
          </View>
          <Text style={s.seasonLevel}>Lv {Math.floor(profile.xp / 200) + 1}</Text>
        </View>
      )}

      {/* Tabs */}
      <View style={s.tabs}>
        {TABS.map(tab => (
          <Pressable key={tab} style={[s.tab, activeTab === tab && s.tabActive]} onPress={() => setActiveTab(tab)}>
            <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>{tab}</Text>
          </Pressable>
        ))}
      </View>

      {/* Total potential reward */}
      <View style={s.totalReward}>
        <Text style={s.totalRewardText}>🪙 Total rewards: <Text style={{ color: '#FFB800' }}>{totalReward}</Text> coins</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#FFB800" style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{ padding: 16, gap: 10 }}
          renderItem={({ item }) => {
            const progress = profile ? Math.min(item.target, profile[item.field] ?? 0) : 0;
            const done = progress >= item.target;
            return (
              <View style={[s.missionCard, done && s.missionDone]}>
                <Text style={s.missionIcon}>{item.icon}</Text>
                <View style={s.missionInfo}>
                  <Text style={s.missionTitle}>{item.title}</Text>
                  <View style={s.progressRow}>
                    <View style={s.progressBg}>
                      <View style={[s.progressFill, { width: `${(progress / item.target) * 100}%` }]} />
                    </View>
                    <Text style={s.progressText}>{progress}/{item.target}</Text>
                  </View>
                </View>
                <View style={s.rewardChip}>
                  {done ? (
                    <Text style={s.doneText}>✅</Text>
                  ) : (
                    <>
                      <Text style={s.rewardIcon}>🪙</Text>
                      <Text style={s.rewardVal}>{item.reward}</Text>
                    </>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}
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
  seasonBar: { marginHorizontal: 16, backgroundColor: '#132040', borderRadius: 14, padding: 14, gap: 6, marginBottom: 12 },
  seasonLeft: { flexDirection: 'row', justifyContent: 'space-between' },
  seasonLabel: { color: '#FFB800', fontWeight: '900', fontSize: 13 },
  seasonXp: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  progressWrap: { height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: '#FFB800', borderRadius: 4 },
  seasonLevel: { color: '#fff', fontWeight: '900', fontSize: 16, alignSelf: 'flex-end' },
  tabs: { flexDirection: 'row', marginHorizontal: 16, backgroundColor: '#132040', borderRadius: 14, padding: 4, gap: 4, marginBottom: 8 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: '#2563EB' },
  tabText: { color: 'rgba(255,255,255,0.5)', fontWeight: '700', fontSize: 13 },
  tabTextActive: { color: '#fff' },
  totalReward: { paddingHorizontal: 16, marginBottom: 4 },
  totalRewardText: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  missionCard: { backgroundColor: '#132040', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  missionDone: { borderColor: 'rgba(34,197,94,0.3)', backgroundColor: '#0F2A1A' },
  missionIcon: { fontSize: 28 },
  missionInfo: { flex: 1, gap: 6 },
  missionTitle: { color: '#fff', fontWeight: '700', fontSize: 13 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressBg: { flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#22C55E', borderRadius: 3 },
  progressText: { color: 'rgba(255,255,255,0.4)', fontSize: 10, minWidth: 36, textAlign: 'right' },
  rewardChip: { backgroundColor: 'rgba(255,184,0,0.12)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 3 },
  rewardIcon: { fontSize: 13 },
  rewardVal: { color: '#FFB800', fontWeight: '900', fontSize: 12 },
  doneText: { fontSize: 18 },
});
