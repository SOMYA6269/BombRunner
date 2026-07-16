import React, { useEffect, useState } from 'react';
import {
  Pressable, ScrollView, StyleSheet, Text, View, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { getOrCreateProfile, updateProfile } from '@/lib/playerStore';
import { CHARACTER_LIST, CHARACTERS } from '@/game/characters';
import type { CharacterId } from '@/types/types';

export default function CharactersScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<Awaited<ReturnType<typeof getOrCreateProfile>> | null>(null);
  const [selected, setSelected] = useState<CharacterId>('playerone');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const p = await getOrCreateProfile();
      setProfile(p);
      setSelected(p.selectedCharacter);
      setLoading(false);
    })();
  }, []);

  const handleSelect = async (id: CharacterId) => {
    const char = CHARACTERS[id];
    if (!char.unlocked && (profile?.coins ?? 0) < (char.price ?? 9999)) return;
    setSelected(id);
    await updateProfile({ selectedCharacter: id });
  };

  const char = CHARACTERS[selected];

  const STAT_BARS = [
    { label: 'POWER', val: char.power, color: '#EF4444' },
    { label: 'SPEED', val: char.speed, color: '#22C55E' },
    { label: 'RANGE', val: char.range, color: '#3B82F6' },
  ];

  if (loading) return <View style={s.root}><ActivityIndicator color="#FFB800" size="large" /></View>;

  return (
    <View style={s.root}>
      <StatusBar hidden />
      {/* Header */}
      <View style={s.header}>
        <Pressable style={s.backBtn} onPress={() => router.back()}><Text style={s.backText}>← BACK</Text></Pressable>
        <Text style={s.title}>🦸 CHARACTERS</Text>
        <View style={s.currency}>
          <Text style={s.coins}>🪙 {profile?.coins.toLocaleString()}</Text>
        </View>
      </View>

      <View style={s.body}>
        {/* Character grid */}
        <ScrollView style={s.grid} contentContainerStyle={s.gridContent}>
          {CHARACTER_LIST.map(c => {
            const isSel = selected === c.id;
            const isLocked = !c.unlocked;
            return (
              <Pressable
                key={c.id}
                style={[s.charCard, isSel && s.charCardSel, isLocked && s.charCardLocked]}
                onPress={() => handleSelect(c.id)}
              >
                {/* Mini sprite */}
                <View style={[s.miniSprite, { backgroundColor: c.bodyColor }]}>
                  <View style={[s.miniHead, { backgroundColor: c.skinColor }]}>
                    <View style={[s.miniHair, { backgroundColor: c.hairColor }]} />
                  </View>
                </View>
                <Text style={[s.charName, isSel && s.charNameSel]}>{c.name}</Text>
                <View style={[s.rarityBadge, { backgroundColor: RARITY_COLOR[c.rarity] }]}>
                  <Text style={s.rarityText}>{c.rarity.toUpperCase()}</Text>
                </View>
                {isLocked && (
                  <View style={s.lockOverlay}>
                    <Text style={s.lockIcon}>🔒</Text>
                    <Text style={s.lockPrice}>🪙 {c.price}</Text>
                  </View>
                )}
                {isSel && <View style={s.selMark}><Text style={s.selMarkText}>✓</Text></View>}
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Detail panel */}
        <View style={s.detail}>
          {/* Big preview */}
          <View style={[s.bigPreview, { backgroundColor: char.bodyColor + '22' }]}>
            <View style={[s.bigBody, { backgroundColor: char.bodyColor }]}>
              <View style={[s.bigHead, { backgroundColor: char.skinColor }]}>
                <View style={[s.bigHair, { backgroundColor: char.hairColor }]} />
                <View style={s.bigEyes}>
                  <View style={s.bigEye} /><View style={s.bigEye} />
                </View>
                <View style={s.bigMouth} />
              </View>
              <View style={[s.bigShoes, { backgroundColor: char.shoeColor }]} />
            </View>
          </View>
          {/* Name + rarity */}
          <Text style={s.detailName}>{char.name}</Text>
          <View style={[s.rarityBadgeLg, { backgroundColor: RARITY_COLOR[char.rarity] }]}>
            <Text style={s.rarityTextLg}>{char.rarity.toUpperCase()}</Text>
          </View>
          <Text style={s.desc}>{char.description}</Text>

          {/* Stats */}
          {STAT_BARS.map(b => (
            <View key={b.label} style={s.statRow}>
              <Text style={s.statLabel}>{b.label}</Text>
              <View style={s.statBg}>
                <View style={[s.statFill, { width: `${b.val * 20}%`, backgroundColor: b.color }]} />
              </View>
              <Text style={[s.statNum, { color: b.color }]}>{b.val}</Text>
            </View>
          ))}

          {/* Action buttons */}
          <View style={s.actions}>
            {char.unlocked ? (
              <View style={[s.ownedBadge]}>
                <Text style={s.ownedText}>✓ SELECTED</Text>
              </View>
            ) : (
              <Pressable style={s.buyBtn} onPress={() => handleSelect(char.id)}>
                <Text style={s.buyBtnText}>🪙 {char.price} UNLOCK</Text>
              </Pressable>
            )}
            <Pressable style={s.playBtn} onPress={() => router.push('/(app)/lobby' as never)}>
              <Text style={s.playBtnText}>▶ PLAY NOW</Text>
            </Pressable>
          </View>

          {/* Anim previews */}
          <View style={s.animRow}>
            {['IDLE', 'RUN', 'CARRY', 'ELIM'].map(a => (
              <View key={a} style={s.animChip}>
                <View style={[s.animDot, { backgroundColor: char.bodyColor }]} />
                <Text style={s.animLabel}>{a}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const RARITY_COLOR: Record<string, string> = {
  common: '#607D8B', rare: '#1565C0', epic: '#6A1B9A', legendary: '#E65100',
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B1629' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#091222', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  backBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 8 },
  backText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  title: { flex: 1, textAlign: 'center', color: '#FFB800', fontWeight: '900', fontSize: 16, letterSpacing: 3 },
  currency: { flexDirection: 'row', gap: 10 },
  coins: { color: '#FFB800', fontWeight: '800', fontSize: 13 },
  body: { flex: 1, flexDirection: 'row' },
  // Grid
  grid: { flex: 1 },
  gridContent: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 10 },
  charCard: { width: 90, backgroundColor: '#132040', borderRadius: 14, padding: 8, alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)', gap: 4 },
  charCardSel: { borderColor: '#FFB800', backgroundColor: '#1A2D54' },
  charCardLocked: { opacity: 0.7 },
  miniSprite: { width: 40, height: 50, borderRadius: 8, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 4 },
  miniHead: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  miniHair: { position: 'absolute', top: 0, width: 24, height: 12, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  charName: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '700', textAlign: 'center' },
  charNameSel: { color: '#FFB800' },
  rarityBadge: { borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 },
  rarityText: { color: '#fff', fontSize: 7, fontWeight: '800' },
  lockOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 2 },
  lockIcon: { fontSize: 18 },
  lockPrice: { color: '#FFB800', fontSize: 9, fontWeight: '800' },
  selMark: { position: 'absolute', top: 4, right: 4, width: 16, height: 16, borderRadius: 8, backgroundColor: '#FFB800', alignItems: 'center', justifyContent: 'center' },
  selMarkText: { color: '#000', fontSize: 9, fontWeight: '900' },
  // Detail
  detail: { width: 220, backgroundColor: '#091222', padding: 16, borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.08)', gap: 8 },
  bigPreview: { height: 140, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  bigBody: { width: 70, height: 90, borderRadius: 14, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 8, borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' },
  bigHead: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  bigHair: { position: 'absolute', top: 0, width: 44, height: 22, borderTopLeftRadius: 22, borderTopRightRadius: 22 },
  bigEyes: { flexDirection: 'row', gap: 8, marginTop: 18 },
  bigEye: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#1a1a2e' },
  bigMouth: { width: 14, height: 5, borderRadius: 3, backgroundColor: '#c0392b', marginTop: 3 },
  bigShoes: { width: 50, height: 12, borderRadius: 6, marginTop: 'auto' },
  detailName: { color: '#fff', fontWeight: '900', fontSize: 18, textAlign: 'center' },
  rarityBadgeLg: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'center' },
  rarityTextLg: { color: '#fff', fontSize: 10, fontWeight: '800' },
  desc: { color: 'rgba(255,255,255,0.55)', fontSize: 11, textAlign: 'center', lineHeight: 16 },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statLabel: { color: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: '700', width: 44 },
  statBg: { flex: 1, height: 8, backgroundColor: '#1E3A5F', borderRadius: 4 },
  statFill: { height: 8, borderRadius: 4 },
  statNum: { fontSize: 11, fontWeight: '900', width: 14 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  ownedBadge: { flex: 1, backgroundColor: '#22C55E', borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
  ownedText: { color: '#fff', fontWeight: '900', fontSize: 11 },
  buyBtn: { flex: 1, backgroundColor: '#FFB800', borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
  buyBtnText: { color: '#000', fontWeight: '900', fontSize: 11 },
  playBtn: { flex: 1, backgroundColor: '#2563EB', borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
  playBtnText: { color: '#fff', fontWeight: '900', fontSize: 11 },
  animRow: { flexDirection: 'row', gap: 6 },
  animChip: { flex: 1, backgroundColor: '#132040', borderRadius: 8, paddingVertical: 6, alignItems: 'center', gap: 3 },
  animDot: { width: 10, height: 10, borderRadius: 5 },
  animLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 8, fontWeight: '700' },
});
