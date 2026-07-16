import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  ActivityIndicator, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { getOrCreateProfile, updateProfile } from '@/lib/playerStore';
import type { PlayerProfile } from '@/types/types';
import { CHARACTERS } from '@/game/characters';

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const p = await getOrCreateProfile();
      setProfile(p);
      setDraft(p.username);
      setLoading(false);
    })();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg); setTimeout(() => setToast(null), 2000);
  };

  const handleSave = useCallback(async () => {
    if (!profile || !draft.trim()) return;
    setSaving(true);
    await updateProfile({ username: draft.trim() });
    setProfile(p => p ? { ...p, username: draft.trim() } : p);
    setEditing(false);
    setSaving(false);
    showToast('✅ Profile saved!');
  }, [profile, draft]);

  if (loading || !profile) {
    return (
      <View style={s.loadWrap}>
        <ActivityIndicator color="#FFB800" />
      </View>
    );
  }

  const char = CHARACTERS[profile.selectedCharacter] ?? CHARACTERS.playerone;
  const winRate = profile.matches > 0 ? Math.round((profile.wins / profile.matches) * 100) : 0;
  const level = Math.floor(profile.xp / 200) + 1;
  const xpProgress = ((profile.xp % 200) / 200) * 100;

  return (
    <View style={s.root}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={s.header}>
        <Pressable style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backIcon}>←</Text>
        </Pressable>
        <Text style={s.title}>👤 PROFILE</Text>
        <Pressable style={s.editBtn} onPress={() => { setEditing(!editing); setDraft(profile.username); }}>
          <Text style={s.editBtnText}>{editing ? 'Cancel' : '✏️ Edit'}</Text>
        </Pressable>
      </View>

      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={s.content}>

        {/* Avatar card */}
        <View style={s.avatarCard}>
          <View style={[s.avatarBig, { backgroundColor: char.bodyColor + '33', borderColor: char.bodyColor }]}>
            <View style={[s.bigHead, { backgroundColor: char.skinColor }]}>
              <View style={[s.bigHair, { backgroundColor: char.hairColor }]} />
              <View style={s.bigEyes}>
                <View style={s.bigEye} /><View style={s.bigEye} />
              </View>
              <View style={s.bigMouth} />
            </View>
            <View style={[s.bigBody, { backgroundColor: char.bodyColor }]} />
            <View style={[s.bigShoe, { backgroundColor: char.shoeColor }]} />
          </View>

          {editing ? (
            <View style={s.nameEditRow}>
              <TextInput
                style={s.nameInput}
                value={draft}
                onChangeText={setDraft}
                maxLength={20}
                autoFocus
                placeholder="Enter username"
                placeholderTextColor="rgba(255,255,255,0.3)"
              />
              <Pressable style={s.saveBtn} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator color="#000" size="small" /> : <Text style={s.saveBtnText}>Save</Text>}
              </Pressable>
            </View>
          ) : (
            <Text style={s.userName}>{profile.username}</Text>
          )}

          <Text style={s.charName}>{char.name} · {char.rarity.toUpperCase()}</Text>

          {/* Level badge */}
          <View style={s.levelRow}>
            <View style={s.levelBadge}>
              <Text style={s.levelNum}>Lv {level}</Text>
            </View>
            <View style={s.xpBarWrap}>
              <View style={[s.xpBar, { width: `${xpProgress}%` }]} />
            </View>
            <Text style={s.xpText}>{profile.xp % 200}/200 XP</Text>
          </View>
        </View>

        {/* Stats grid */}
        <Text style={s.sectionLabel}>📊 STATISTICS</Text>
        <View style={s.statsGrid}>
          {[
            { label: 'Wins', val: profile.wins, icon: '🏆', color: '#FFB800' },
            { label: 'Matches', val: profile.matches, icon: '🎮', color: '#2563EB' },
            { label: 'Win Rate', val: `${winRate}%`, icon: '📈', color: '#22C55E' },
            { label: 'Rating', val: profile.rating ?? 1000, icon: '⭐', color: '#A855F7' },
            { label: 'Coins', val: profile.coins, icon: '🪙', color: '#F97316' },
            { label: 'Gems', val: profile.gems, icon: '💎', color: '#EC4899' },
          ].map(stat => (
            <View key={stat.label} style={s.statCard}>
              <Text style={s.statIcon}>{stat.icon}</Text>
              <Text style={[s.statVal, { color: stat.color }]}>{stat.val}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Recent matches (mock) */}
        <Text style={s.sectionLabel}>🎯 RECENT MATCHES</Text>
        {MOCK_MATCHES.map((m, i) => (
          <View key={i} style={s.matchRow}>
            <View style={[s.matchResult, { backgroundColor: m.won ? '#22C55E20' : '#EF444420' }]}>
              <Text style={[s.matchResultText, { color: m.won ? '#22C55E' : '#EF4444' }]}>
                {m.won ? 'WIN' : 'OUT'}
              </Text>
            </View>
            <View style={s.matchInfo}>
              <Text style={s.matchMap}>{m.map}</Text>
              <Text style={s.matchMeta}>{m.players}p · {m.duration}</Text>
            </View>
            <View style={s.matchRewards}>
              <Text style={s.matchCoins}>+{m.coins}🪙</Text>
              <Text style={s.matchXp}>+{m.xp}XP</Text>
            </View>
          </View>
        ))}

        {/* Actions */}
        <View style={s.actionRow}>
          <Pressable style={s.actionBtn} onPress={() => router.push('/(app)/characters' as never)}>
            <Text style={s.actionBtnText}>🎭 Change Character</Text>
          </Pressable>
          <Pressable style={[s.actionBtn, s.actionBtnSecondary]} onPress={() => {}}>
            <Text style={s.actionBtnText}>⚙️ Settings</Text>
          </Pressable>
        </View>

      </ScrollView>

      {toast && (
        <View style={s.toast}>
          <Text style={s.toastText}>{toast}</Text>
        </View>
      )}
    </View>
  );
}

const MOCK_MATCHES = [
  { won: true, map: 'Ancient Ruins', players: 8, duration: '2:14', coins: 150, xp: 200 },
  { won: false, map: 'Ancient Ruins', players: 6, duration: '1:48', coins: 30, xp: 50 },
  { won: true, map: 'Ancient Ruins', players: 8, duration: '3:02', coins: 150, xp: 200 },
  { won: false, map: 'Ancient Ruins', players: 5, duration: '2:33', coins: 30, xp: 50 },
];

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B1629' },
  loadWrap: { flex: 1, backgroundColor: '#0B1629', alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: '#fff', fontSize: 18, fontWeight: '700' },
  title: { flex: 1, textAlign: 'center', color: '#FFB800', fontSize: 20, fontWeight: '900', letterSpacing: 2 },
  editBtn: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10 },
  editBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  content: { padding: 16, gap: 16 },
  // Avatar card
  avatarCard: { backgroundColor: '#132040', borderRadius: 20, padding: 24, alignItems: 'center', gap: 10 },
  avatarBig: { width: 110, height: 130, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 2, gap: 4 },
  bigHead: { width: 40, height: 40, borderRadius: 20, overflow: 'hidden', alignItems: 'center' },
  bigHair: { position: 'absolute', top: 0, width: 40, height: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  bigEyes: { flexDirection: 'row', gap: 6, marginTop: 16 },
  bigEye: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#1a1a2e' },
  bigMouth: { width: 12, height: 4, borderRadius: 2, backgroundColor: '#c0392b', marginTop: 3 },
  bigBody: { width: 60, height: 48, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  bigShoe: { width: 44, height: 10, borderRadius: 5 },
  userName: { color: '#fff', fontSize: 22, fontWeight: '900' },
  charName: { color: '#FFB800', fontSize: 13, fontWeight: '700' },
  nameEditRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  nameInput: { flex: 1, backgroundColor: '#0B1629', color: '#fff', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 16, fontWeight: '700', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  saveBtn: { backgroundColor: '#FFB800', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  saveBtnText: { color: '#000', fontWeight: '900' },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 10, width: '100%' },
  levelBadge: { backgroundColor: '#2563EB', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  levelNum: { color: '#fff', fontWeight: '900', fontSize: 13 },
  xpBarWrap: { flex: 1, height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' },
  xpBar: { height: '100%', backgroundColor: '#22C55E', borderRadius: 4 },
  xpText: { color: 'rgba(255,255,255,0.4)', fontSize: 10 },
  sectionLabel: { color: '#FFB800', fontWeight: '900', fontSize: 13, letterSpacing: 1 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { backgroundColor: '#132040', borderRadius: 14, flex: 1, minWidth: 80, alignItems: 'center', padding: 14, gap: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  statIcon: { fontSize: 22 },
  statVal: { fontWeight: '900', fontSize: 18 },
  statLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '700' },
  matchRow: { backgroundColor: '#0F1E35', borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  matchResult: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  matchResultText: { fontWeight: '900', fontSize: 12 },
  matchInfo: { flex: 1 },
  matchMap: { color: '#fff', fontWeight: '700', fontSize: 13 },
  matchMeta: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },
  matchRewards: { alignItems: 'flex-end' },
  matchCoins: { color: '#FFB800', fontWeight: '800', fontSize: 12 },
  matchXp: { color: '#22C55E', fontSize: 11 },
  actionRow: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, backgroundColor: '#2563EB', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  actionBtnSecondary: { backgroundColor: '#374151' },
  actionBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  toast: { position: 'absolute', bottom: 40, left: 32, right: 32, backgroundColor: 'rgba(0,0,0,0.85)', borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  toastText: { color: '#fff', fontWeight: '800', fontSize: 14 },
});
