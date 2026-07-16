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
import HeroCharacter from '@/components/ui/HeroCharacter';

const MOCK_MATCHES = [
  { won: true,  map: '🏚 Ancient Ruins', players: 8, duration: '2:14', coins: 150, xp: 200 },
  { won: false, map: '🌲 Forest Arena',  players: 6, duration: '1:48', coins: 30,  xp: 50  },
  { won: true,  map: '🌊 Ocean Docks',   players: 8, duration: '3:02', coins: 150, xp: 200 },
  { won: false, map: '🏚 Ancient Ruins', players: 5, duration: '2:33', coins: 30,  xp: 50  },
];

export default function ProfileScreen() {
  const router  = useRouter();
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState('');
  const [saving,  setSaving]  = useState(false);
  const [toast,   setToast]   = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const p = await getOrCreateProfile();
      setProfile(p);
      setDraft(p.username);
      setLoading(false);
    })();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg); setTimeout(() => setToast(null), 2200);
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
      <View style={s.loadWrap}><ActivityIndicator color="#FFB800" size="large" /></View>
    );
  }

  const char      = CHARACTERS[profile.selectedCharacter] ?? CHARACTERS.playerone;
  const winRate   = profile.matches > 0 ? Math.round((profile.wins / profile.matches) * 100) : 0;
  const level     = Math.floor(profile.xp / 200) + 1;
  const xpProg    = ((profile.xp % 200) / 200) * 100;

  const STATS = [
    { label: 'Wins',     val: profile.wins,            icon: '🏆', color: '#FFB800' },
    { label: 'Matches',  val: profile.matches,          icon: '🎮', color: '#3B82F6' },
    { label: 'Win Rate', val: `${winRate}%`,            icon: '📈', color: '#22C55E' },
    { label: 'Rating',   val: profile.rating ?? 1000,   icon: '⭐', color: '#A855F7' },
    { label: 'Coins',    val: profile.coins.toLocaleString(), icon: '🪙', color: '#F97316' },
    { label: 'Gems',     val: profile.gems,             icon: '💎', color: '#EC4899' },
  ];

  return (
    <View style={s.root}>
      <StatusBar hidden />

      {/* Header */}
      <View style={s.header}>
        <Pressable style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backText}>← BACK</Text>
        </Pressable>
        <Text style={s.headerTitle}>👤 PROFILE</Text>
        <Pressable style={s.editBtn} onPress={() => { setEditing(!editing); setDraft(profile.username); }}>
          <Text style={s.editBtnText}>{editing ? '✕ CANCEL' : '✏️ EDIT'}</Text>
        </Pressable>
      </View>

      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={s.content}>

        {/* ── Profile card ── */}
        <View style={[s.profileCard, { borderColor: char.bodyColor + '55' }]}>
          {/* Bg glow */}
          <View style={[s.profileGlow, { backgroundColor: char.bodyColor + '18' }]} />

          {/* Hero showcase */}
          <View style={s.heroWrap}>
            <HeroCharacter characterId={profile.selectedCharacter} size={96} animState="celebrate" />
          </View>

          {/* Name / edit */}
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
                {saving ? <ActivityIndicator color="#000" size="small" /> : <Text style={s.saveBtnText}>SAVE</Text>}
              </Pressable>
            </View>
          ) : (
            <Text style={s.userName}>{profile.username}</Text>
          )}

          {/* Character name + rarity */}
          <View style={[s.charBadge, { backgroundColor: char.bodyColor + '22', borderColor: char.bodyColor + '55' }]}>
            <Text style={[s.charBadgeText, { color: char.bodyColor }]}>{char.name}</Text>
            <Text style={s.rarityDot}>·</Text>
            <Text style={s.rarityText}>{char.rarity.toUpperCase()}</Text>
          </View>

          {/* Level + XP bar */}
          <View style={s.levelRow}>
            <View style={s.levelBadge}>
              <Text style={s.levelNum}>Lv {level}</Text>
            </View>
            <View style={s.xpTrack}>
              <View style={[s.xpFill, { width: `${xpProg}%` as unknown as number }]} />
            </View>
            <Text style={s.xpText}>{profile.xp % 200}/200 XP</Text>
          </View>

          {/* Trophy wins */}
          <View style={s.trophyRow}>
            <Text style={s.trophyIcon}>🏆</Text>
            <Text style={s.trophyVal}>{profile.wins} Wins</Text>
            <View style={s.trophyDivider} />
            <Text style={s.trophyVal}>{profile.matches} Matches</Text>
            <View style={s.trophyDivider} />
            <Text style={s.trophyVal}>{winRate}% Win Rate</Text>
          </View>
        </View>

        {/* ── Stats grid ── */}
        <Text style={s.sectionLabel}>📊 STATISTICS</Text>
        <View style={s.statsGrid}>
          {STATS.map(st => (
            <View key={st.label} style={[s.statCard, { borderColor: st.color + '33' }]}>
              <Text style={s.statCardIcon}>{st.icon}</Text>
              <Text style={[s.statCardVal, { color: st.color }]}>{st.val}</Text>
              <Text style={s.statCardLabel}>{st.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Recent matches ── */}
        <Text style={s.sectionLabel}>🎯 RECENT MATCHES</Text>
        <View style={s.matchList}>
          {MOCK_MATCHES.map((m, i) => (
            <View key={i} style={[s.matchRow, { borderLeftColor: m.won ? '#22C55E' : '#EF4444' }]}>
              <View style={[s.matchResult, { backgroundColor: m.won ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.12)' }]}>
                <Text style={[s.matchResultText, { color: m.won ? '#22C55E' : '#EF4444' }]}>
                  {m.won ? 'WIN' : 'OUT'}
                </Text>
              </View>
              <View style={s.matchInfo}>
                <Text style={s.matchMap}>{m.map}</Text>
                <Text style={s.matchMeta}>{m.players} players · {m.duration}</Text>
              </View>
              <View style={s.matchRewards}>
                <Text style={s.matchCoins}>+{m.coins} 🪙</Text>
                <Text style={s.matchXP}>+{m.xp} XP</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Actions ── */}
        <View style={s.actions}>
          <Pressable style={s.actionBtn} onPress={() => router.push('/(app)/characters' as never)}>
            <Text style={s.actionIcon}>⚔️</Text>
            <Text style={s.actionText}>Change Hero</Text>
          </Pressable>
          <Pressable style={s.actionBtn} onPress={() => router.push('/(app)/shop' as never)}>
            <Text style={s.actionIcon}>🛒</Text>
            <Text style={s.actionText}>Shop</Text>
          </Pressable>
          <Pressable style={[s.actionBtn, { borderColor: 'rgba(239,68,68,0.3)' }]} onPress={() => showToast('⚙️ Settings coming soon!')}>
            <Text style={s.actionIcon}>⚙️</Text>
            <Text style={s.actionText}>Settings</Text>
          </Pressable>
        </View>

      </ScrollView>

      {toast && (
        <View style={s.toast}><Text style={s.toastText}>{toast}</Text></View>
      )}
    </View>
  );
}

const C = {
  bg: '#080E1C', panel: '#0F1E3A',
  gold: '#FFB800', border: 'rgba(255,255,255,0.09)',
  txt: '#FFFFFF', muted: 'rgba(255,255,255,0.5)', dim: 'rgba(255,255,255,0.28)',
};

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: C.bg },
  loadWrap:{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },

  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, backgroundColor: 'rgba(8,14,28,0.95)', borderBottomWidth: 1, borderBottomColor: C.border, gap: 10 },
  backBtn:      { paddingHorizontal: 12, paddingVertical: 7, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 10, borderWidth: 1, borderColor: C.border },
  backText:     { color: C.txt, fontWeight: '700', fontSize: 12 },
  headerTitle:  { flex: 1, textAlign: 'center', color: C.gold, fontWeight: '900', fontSize: 16, letterSpacing: 3 },
  editBtn:      { paddingHorizontal: 12, paddingVertical: 7, backgroundColor: 'rgba(59,130,246,0.15)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(59,130,246,0.4)' },
  editBtnText:  { color: '#3B82F6', fontWeight: '800', fontSize: 11 },

  content:      { padding: 14, gap: 14, paddingBottom: 40 },

  /* Profile card */
  profileCard:  { backgroundColor: C.panel, borderRadius: 20, padding: 18, alignItems: 'center', gap: 10, borderWidth: 1.5, overflow: 'hidden' },
  profileGlow:  { position: 'absolute', top: -40, width: 240, height: 200, borderRadius: 120 },
  heroWrap:     { width: 108, height: 130, alignItems: 'center', justifyContent: 'flex-end' },
  nameEditRow:  { flexDirection: 'row', gap: 8, alignItems: 'center', width: '100%' },
  nameInput:    { flex: 1, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 9, color: '#fff', fontSize: 16, fontWeight: '700', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  saveBtn:      { backgroundColor: C.gold, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 9 },
  saveBtnText:  { color: '#000', fontWeight: '900', fontSize: 12 },
  userName:     { color: C.txt, fontWeight: '900', fontSize: 22, letterSpacing: 1 },
  charBadge:    { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  charBadgeText:{ fontWeight: '900', fontSize: 12 },
  rarityDot:    { color: C.dim, fontSize: 12 },
  rarityText:   { color: C.dim, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  levelRow:     { flexDirection: 'row', alignItems: 'center', gap: 8, width: '100%' },
  levelBadge:   { backgroundColor: C.gold, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  levelNum:     { color: '#000', fontWeight: '900', fontSize: 11 },
  xpTrack:      { flex: 1, height: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' },
  xpFill:       { height: 8, backgroundColor: C.gold, borderRadius: 4 },
  xpText:       { color: C.dim, fontSize: 9, fontWeight: '700' },
  trophyRow:    { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, width: '100%', justifyContent: 'center' },
  trophyIcon:   { fontSize: 14 },
  trophyVal:    { color: C.muted, fontSize: 11, fontWeight: '700' },
  trophyDivider:{ width: 1, height: 14, backgroundColor: C.border },

  sectionLabel: { color: C.muted, fontSize: 11, fontWeight: '900', letterSpacing: 2 },

  /* Stats */
  statsGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statCard:      { width: '31%', backgroundColor: C.panel, borderRadius: 14, padding: 12, alignItems: 'center', gap: 3, borderWidth: 1 },
  statCardIcon:  { fontSize: 18 },
  statCardVal:   { fontWeight: '900', fontSize: 18 },
  statCardLabel: { color: C.dim, fontSize: 9, fontWeight: '700', textAlign: 'center' },

  /* Matches */
  matchList:     { gap: 7 },
  matchRow:      { backgroundColor: C.panel, borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderLeftWidth: 3 },
  matchResult:   { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  matchResultText:{ fontWeight: '900', fontSize: 12 },
  matchInfo:     { flex: 1 },
  matchMap:      { color: C.txt, fontWeight: '800', fontSize: 12 },
  matchMeta:     { color: C.dim, fontSize: 10, marginTop: 2 },
  matchRewards:  { alignItems: 'flex-end', gap: 2 },
  matchCoins:    { color: C.gold, fontWeight: '900', fontSize: 12 },
  matchXP:       { color: '#A855F7', fontWeight: '700', fontSize: 10 },

  /* Actions */
  actions:      { flexDirection: 'row', gap: 8 },
  actionBtn:    { flex: 1, backgroundColor: C.panel, borderRadius: 14, paddingVertical: 14, alignItems: 'center', gap: 5, borderWidth: 1, borderColor: C.border },
  actionIcon:   { fontSize: 20 },
  actionText:   { color: C.muted, fontWeight: '800', fontSize: 10 },

  toast:        { position: 'absolute', bottom: 36, left: 24, right: 24, backgroundColor: 'rgba(0,0,0,0.9)', borderRadius: 14, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  toastText:    { color: '#fff', fontWeight: '800', fontSize: 14 },
});


