import React, { useEffect, useRef, useState } from 'react';
import {
  Animated, Pressable, ScrollView, StyleSheet, Text, View, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { getOrCreateProfile, updateProfile } from '@/lib/playerStore';
import { CHARACTER_LIST, CHARACTERS } from '@/game/characters';
import type { CharacterId } from '@/types/types';
import HeroCharacter from '@/components/ui/HeroCharacter';

const RARITY_CONFIG: Record<string, { color: string; glow: string; label: string; stars: number }> = {
  common:    { color: '#607D8B', glow: '#607D8B44', label: 'COMMON',    stars: 1 },
  rare:      { color: '#1565C0', glow: '#1565C044', label: 'RARE',      stars: 2 },
  epic:      { color: '#A855F7', glow: '#A855F744', label: 'EPIC',      stars: 3 },
  legendary: { color: '#FF6D00', glow: '#FF6D0055', label: 'LEGENDARY', stars: 4 },
};

export default function CharactersScreen() {
  const router  = useRouter();
  const [profile,  setProfile]  = useState<Awaited<ReturnType<typeof getOrCreateProfile>> | null>(null);
  const [selected, setSelected] = useState<CharacterId>('playerone');
  const [loading,  setLoading]  = useState(true);
  const [animState, setAnimState] = useState<'idle' | 'running' | 'celebrate'>('idle');

  const glowAnim  = useRef(new Animated.Value(0.7)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      const p = await getOrCreateProfile();
      setProfile(p);
      setSelected(p.selectedCharacter);
      setLoading(false);
    })();
    Animated.loop(Animated.sequence([
      Animated.timing(glowAnim, { toValue: 1,   duration: 1200, useNativeDriver: true }),
      Animated.timing(glowAnim, { toValue: 0.5, duration: 1200, useNativeDriver: true }),
    ])).start();
  }, [glowAnim]);

  const handleSelect = async (id: CharacterId) => {
    const char = CHARACTERS[id];
    if (!char.unlocked && (profile?.coins ?? 0) < (char.price ?? 9999)) return;
    // Slide-in animation
    slideAnim.setValue(-20);
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 100, friction: 8 }).start();
    setSelected(id);
    setAnimState('celebrate');
    setTimeout(() => setAnimState('idle'), 1200);
    await updateProfile({ selectedCharacter: id });
  };

  const char   = CHARACTERS[selected];
  const rarity = RARITY_CONFIG[char.rarity] ?? RARITY_CONFIG.common;

  const STAT_BARS = [
    { label: 'POWER', val: char.power, color: '#EF4444', icon: '💥' },
    { label: 'SPEED', val: char.speed, color: '#22C55E', icon: '⚡' },
    { label: 'RANGE', val: char.range, color: '#3B82F6', icon: '🎯' },
  ];

  if (loading) return (
    <View style={s.root}><ActivityIndicator color="#FFB800" size="large" /></View>
  );

  return (
    <View style={s.root}>
      <StatusBar hidden />

      {/* Header */}
      <View style={s.header}>
        <Pressable style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backText}>← BACK</Text>
        </Pressable>
        <Text style={s.headerTitle}>⚔️ HEROES</Text>
        <View style={s.coinsChip}>
          <Text style={s.coinsIcon}>🪙</Text>
          <Text style={s.coinsVal}>{profile?.coins.toLocaleString()}</Text>
        </View>
      </View>

      <View style={s.body}>

        {/* ── Character grid ── */}
        <ScrollView style={s.grid} contentContainerStyle={s.gridContent} showsVerticalScrollIndicator={false}>
          {CHARACTER_LIST.map(c => {
            const isSel   = selected === c.id;
            const isLocked= !c.unlocked;
            const rar     = RARITY_CONFIG[c.rarity] ?? RARITY_CONFIG.common;
            return (
              <Pressable
                key={c.id}
                style={[s.charCard, isSel && s.charCardSel, isSel && { borderColor: rar.color, shadowColor: rar.color }]}
                onPress={() => handleSelect(c.id)}
              >
                {/* Rarity glow bg */}
                {isSel && <View style={[s.selGlow, { backgroundColor: rar.glow }]} />}

                {/* Hero preview */}
                <View style={[s.cardHeroArea, { backgroundColor: c.bodyColor + '18' }]}>
                  <HeroCharacter characterId={c.id} size={46} animState={isSel ? 'idle' : 'idle'} />
                </View>

                <Text style={[s.cardName, isSel && s.cardNameSel]}>{c.name}</Text>

                {/* Rarity stars */}
                <View style={[s.rarityRow, { backgroundColor: rar.color + '22' }]}>
                  {Array.from({ length: rar.stars }).map((_, i) => (
                    <Text key={i} style={{ fontSize: 7 }}>★</Text>
                  ))}
                </View>

                {/* Lock overlay */}
                {isLocked && (
                  <View style={s.lockOverlay}>
                    <Text style={s.lockIcon}>🔒</Text>
                    <Text style={s.lockPrice}>🪙 {c.price}</Text>
                  </View>
                )}

                {/* Selected checkmark */}
                {isSel && (
                  <View style={[s.selMark, { backgroundColor: rar.color }]}>
                    <Text style={s.selMarkText}>✓</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── Detail panel ── */}
        <View style={s.detail}>
          {/* Big hero showcase */}
          <View style={s.detailHeroWrap}>
            {/* Glow bg */}
            <Animated.View style={[s.detailGlow, {
              backgroundColor: char.bodyColor + '30',
              opacity: glowAnim,
            }]} />
            <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
              <HeroCharacter characterId={selected} size={110} animState={animState} showBomb={animState === 'celebrate'} />
            </Animated.View>
            {/* Floating class badge */}
            <View style={[s.classBadge, { backgroundColor: rarity.color }]}>
              <Text style={s.classBadgeText}>{rarity.label}</Text>
            </View>
          </View>

          {/* Name */}
          <Text style={s.detailName}>{char.name}</Text>

          {/* Stars */}
          <View style={s.starsRow}>
            {Array.from({ length: rarity.stars }).map((_, i) => (
              <Text key={i} style={[s.star, { color: rarity.color }]}>★</Text>
            ))}
            {Array.from({ length: 4 - rarity.stars }).map((_, i) => (
              <Text key={i + rarity.stars} style={[s.star, s.starEmpty]}>★</Text>
            ))}
          </View>

          <Text style={s.detailDesc}>{char.description}</Text>

          {/* Stats */}
          <View style={s.statsBlock}>
            {STAT_BARS.map(b => (
              <View key={b.label} style={s.statRow}>
                <Text style={s.statIcon}>{b.icon}</Text>
                <Text style={s.statLabel}>{b.label}</Text>
                <View style={s.statBg}>
                  <View style={[s.statFill, { width: `${b.val * 20}%` as unknown as number, backgroundColor: b.color, shadowColor: b.color }]} />
                </View>
                <Text style={[s.statNum, { color: b.color }]}>{b.val}/5</Text>
              </View>
            ))}
          </View>

          {/* Animation state chips */}
          <View style={s.animRow}>
            {(['idle', 'running', 'celebrate'] as const).map(anim => (
              <Pressable key={anim} style={[s.animChip, animState === anim && s.animChipActive]} onPress={() => setAnimState(anim)}>
                <Text style={s.animChipText}>{anim.toUpperCase()}</Text>
              </Pressable>
            ))}
          </View>

          {/* Actions */}
          <View style={s.actions}>
            {char.unlocked ? (
              <View style={s.ownedBadge}>
                <Text style={s.ownedText}>✓ SELECTED</Text>
              </View>
            ) : (
              <Pressable style={[s.buyBtn, { backgroundColor: rarity.color }]} onPress={() => handleSelect(char.id)}>
                <Text style={s.buyBtnText}>🪙 {char.price} UNLOCK</Text>
              </Pressable>
            )}
            <Pressable style={s.playBtn} onPress={() => router.push('/(app)/lobby' as never)}>
              <Text style={s.playBtnText}>⚡ PLAY NOW</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const C = {
  bg: '#080E1C', panel: '#0F1E3A', panelB: '#162947',
  gold: '#FFB800', border: 'rgba(255,255,255,0.09)',
  txt: '#FFFFFF', muted: 'rgba(255,255,255,0.5)', dim: 'rgba(255,255,255,0.28)',
};

const s = StyleSheet.create({
  root:      { flex: 1, backgroundColor: C.bg },
  header:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, backgroundColor: 'rgba(8,14,28,0.95)', borderBottomWidth: 1, borderBottomColor: C.border, gap: 10 },
  backBtn:   { paddingHorizontal: 12, paddingVertical: 7, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 10, borderWidth: 1, borderColor: C.border },
  backText:  { color: C.txt, fontWeight: '700', fontSize: 12 },
  headerTitle: { flex: 1, textAlign: 'center', color: C.gold, fontWeight: '900', fontSize: 16, letterSpacing: 3 },
  coinsChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,184,0,0.1)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(255,184,0,0.3)' },
  coinsIcon: { fontSize: 14 },
  coinsVal:  { color: C.gold, fontWeight: '900', fontSize: 13 },

  body:      { flex: 1, flexDirection: 'row' },

  /* Grid */
  grid:        { flex: 1 },
  gridContent: { flexDirection: 'row', flexWrap: 'wrap', padding: 10, gap: 8 },
  charCard:    {
    width: 88, backgroundColor: C.panel, borderRadius: 14, padding: 8,
    alignItems: 'center', borderWidth: 2, borderColor: C.border, gap: 4,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0, shadowRadius: 8,
  },
  charCardSel: { shadowOpacity: 0.6 },
  selGlow:     { ...StyleSheet.absoluteFillObject, borderRadius: 12 },
  cardHeroArea:{ width: 60, height: 68, borderRadius: 10, alignItems: 'center', justifyContent: 'flex-end', overflow: 'hidden' },
  cardName:    { color: C.muted, fontSize: 9.5, fontWeight: '700', textAlign: 'center' },
  cardNameSel: { color: C.gold },
  rarityRow:   { flexDirection: 'row', gap: 2, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  lockOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 4 },
  lockIcon:    { fontSize: 20 },
  lockPrice:   { color: C.gold, fontSize: 9, fontWeight: '900' },
  selMark:     { position: 'absolute', top: 5, right: 5, width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  selMarkText: { color: '#fff', fontSize: 9, fontWeight: '900' },

  /* Detail */
  detail:          { width: 228, backgroundColor: 'rgba(8,14,28,0.98)', borderLeftWidth: 1, borderLeftColor: C.border, padding: 14, gap: 8 },
  detailHeroWrap:  { height: 148, borderRadius: 16, backgroundColor: C.panel, alignItems: 'center', justifyContent: 'flex-end', overflow: 'hidden', position: 'relative', paddingBottom: 4, borderWidth: 1, borderColor: C.border },
  detailGlow:      { position: 'absolute', bottom: -20, width: 160, height: 120, borderRadius: 80 },
  classBadge:      { position: 'absolute', top: 8, right: 8, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  classBadgeText:  { color: '#fff', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  detailName:      { color: C.txt, fontWeight: '900', fontSize: 20, textAlign: 'center' },
  starsRow:        { flexDirection: 'row', gap: 4, justifyContent: 'center' },
  star:            { fontSize: 14, fontWeight: '900' },
  starEmpty:       { color: 'rgba(255,255,255,0.2)' },
  detailDesc:      { color: C.muted, fontSize: 11, textAlign: 'center', lineHeight: 16 },
  statsBlock:      { gap: 6 },
  statRow:         { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statIcon:        { fontSize: 12, width: 18, textAlign: 'center' },
  statLabel:       { color: C.dim, fontSize: 9.5, fontWeight: '700', width: 40 },
  statBg:          { flex: 1, height: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' },
  statFill:        { height: 8, borderRadius: 4, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 4 },
  statNum:         { fontSize: 10, fontWeight: '900', width: 22, textAlign: 'right' },
  animRow:         { flexDirection: 'row', gap: 5 },
  animChip:        { flex: 1, backgroundColor: C.panel, borderRadius: 8, paddingVertical: 6, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  animChipActive:  { backgroundColor: 'rgba(255,184,0,0.2)', borderColor: 'rgba(255,184,0,0.5)' },
  animChipText:    { color: C.dim, fontSize: 8, fontWeight: '800' },
  actions:         { flexDirection: 'row', gap: 7, marginTop: 2 },
  ownedBadge:      { flex: 1, backgroundColor: 'rgba(34,197,94,0.2)', borderRadius: 12, paddingVertical: 10, alignItems: 'center', borderWidth: 1.5, borderColor: '#22C55E' },
  ownedText:       { color: '#22C55E', fontWeight: '900', fontSize: 11 },
  buyBtn:          { flex: 1, borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  buyBtnText:      { color: '#fff', fontWeight: '900', fontSize: 10 },
  playBtn:         { flex: 1, backgroundColor: '#3B82F6', borderRadius: 12, paddingVertical: 10, alignItems: 'center', shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.45, shadowRadius: 8 },
  playBtnText:     { color: '#fff', fontWeight: '900', fontSize: 11 },
});
