import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  ActivityIndicator, FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { getOrCreateProfile, updateProfile } from '@/lib/playerStore';
import type { PlayerProfile } from '@/types/types';
import { CHARACTERS } from '@/game/characters';
import HeroCharacter from '@/components/ui/HeroCharacter';

const SHOP_TABS = ['Characters', 'Bomb Skins', 'Trails', 'Power Ups', 'Currency'] as const;
type ShopTab = typeof SHOP_TABS[number];

const SHOP_ITEMS = {
  Characters: Object.entries(CHARACTERS).map(([id, c]) => ({
    id, name: c.name, price: c.price ?? 0, currency: 'coins', rarity: c.rarity,
    color: c.bodyColor, locked: !c.unlocked,
  })),
  'Bomb Skins': [
    { id: 'bs_skull', name: 'Skull Bomb',  price: 200, currency: 'coins', rarity: 'rare',      color: '#EF4444', locked: true,  emoji: '💀' },
    { id: 'bs_star',  name: 'Star Bomb',   price: 350, currency: 'coins', rarity: 'epic',      color: '#FFB800', locked: true,  emoji: '⭐' },
    { id: 'bs_blue',  name: 'Blue Bomb',   price: 150, currency: 'coins', rarity: 'common',    color: '#2563EB', locked: false, emoji: '💙' },
    { id: 'bs_fire',  name: 'Fire Bomb',   price: 500, currency: 'gems',  rarity: 'legendary', color: '#F97316', locked: true,  emoji: '🔥' },
  ],
  Trails: [
    { id: 'tr_fire', name: 'Fire Trail', price: 250, currency: 'coins', rarity: 'epic',      color: '#F97316', locked: true,  emoji: '🔥' },
    { id: 'tr_ice',  name: 'Ice Trail',  price: 200, currency: 'coins', rarity: 'rare',      color: '#38BDF8', locked: true,  emoji: '❄️' },
    { id: 'tr_star', name: 'Star Trail', price: 500, currency: 'gems',  rarity: 'legendary', color: '#FFB800', locked: true,  emoji: '✨' },
  ],
  'Power Ups': [
    { id: 'pu_shield_x2', name: 'Shield x2',     price: 50, currency: 'coins', rarity: 'common', color: '#1565C0', locked: false, emoji: '🛡' },
    { id: 'pu_speed_x2',  name: 'Speed Boost x2',price: 50, currency: 'coins', rarity: 'common', color: '#E65100', locked: false, emoji: '⚡' },
    { id: 'pu_freeze_x2', name: 'Freeze x2',      price: 50, currency: 'coins', rarity: 'common', color: '#006064', locked: false, emoji: '❄️' },
  ],
  Currency: [
    { id: 'cu_500',    name: '500 Coins',  price: 0.99, currency: 'usd', rarity: 'common', color: '#FFB800', locked: false, emoji: '🪙', amount: 500 },
    { id: 'cu_1200',   name: '1200 Coins', price: 1.99, currency: 'usd', rarity: 'rare',   color: '#FFB800', locked: false, emoji: '🪙', amount: 1200 },
    { id: 'cu_3000',   name: '3000 Coins', price: 4.99, currency: 'usd', rarity: 'epic',   color: '#FFB800', locked: false, emoji: '🪙', amount: 3000 },
    { id: 'cu_gem100', name: '100 Gems',   price: 0.99, currency: 'usd', rarity: 'common', color: '#A855F7', locked: false, emoji: '💎', amount: 100 },
    { id: 'cu_gem350', name: '350 Gems',   price: 2.99, currency: 'usd', rarity: 'epic',   color: '#A855F7', locked: false, emoji: '💎', amount: 350 },
  ],
};

const RARITY_CFG: Record<string, { color: string; glow: string; label: string }> = {
  common:    { color: '#607D8B', glow: '#607D8B33', label: 'COMMON' },
  rare:      { color: '#1565C0', glow: '#1565C033', label: 'RARE' },
  epic:      { color: '#A855F7', glow: '#A855F733', label: 'EPIC' },
  legendary: { color: '#FF6D00', glow: '#FF6D0033', label: 'LEGENDARY' },
};

const TAB_ICONS: Record<string, string> = {
  'Characters': '⚔️', 'Bomb Skins': '💣', 'Trails': '✨', 'Power Ups': '⚡', 'Currency': '🪙',
};

export default function ShopScreen() {
  const router = useRouter();
  const [tab,     setTab]     = useState<ShopTab>('Characters');
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying,  setBuying]  = useState<string | null>(null);
  const [toast,   setToast]   = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const p = await getOrCreateProfile();
      setProfile(p);
      setLoading(false);
    })();
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }, []);

  const handleBuy = useCallback(async (item: {
    id: string; name: string; price: number; currency: string; locked: boolean;
  }) => {
    if (!profile || buying) return;
    setBuying(item.id);
    try {
      if (item.currency === 'coins') {
        if (profile.coins < item.price) { showToast('❌ Not enough coins!'); return; }
        await updateProfile({ coins: profile.coins - item.price });
        setProfile(p => p ? { ...p, coins: p.coins - item.price } : p);
        showToast(`✅ ${item.name} unlocked!`);
      } else if (item.currency === 'gems') {
        if (profile.gems < item.price) { showToast('❌ Not enough gems!'); return; }
        await updateProfile({ gems: profile.gems - item.price });
        setProfile(p => p ? { ...p, gems: p.gems - item.price } : p);
        showToast(`✅ ${item.name} unlocked!`);
      } else {
        showToast('💳 Redirecting to payment...');
      }
    } finally {
      setBuying(null);
    }
  }, [profile, buying, showToast]);

  const items = SHOP_ITEMS[tab] as {
    id: string; name: string; price: number; currency: string; rarity: string;
    color: string; locked: boolean; emoji?: string;
  }[];

  return (
    <View style={s.root}>
      <StatusBar hidden />

      {/* Header */}
      <View style={s.header}>
        <Pressable style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backText}>← BACK</Text>
        </Pressable>
        <Text style={s.headerTitle}>🛒 SHOP</Text>
        <View style={s.walletRow}>
          <View style={s.coinChip}>
            <Text style={s.chipIcon}>🪙</Text>
            <Text style={s.chipVal}>{(profile?.coins ?? 0).toLocaleString()}</Text>
          </View>
          <View style={s.gemChip}>
            <Text style={s.chipIcon}>💎</Text>
            <Text style={s.chipVal}>{profile?.gems ?? 0}</Text>
          </View>
        </View>
      </View>

      {/* Featured banner */}
      <View style={s.featured}>
        <View style={s.featuredBadge}><Text style={s.featuredBadgeText}>🔥 LIMITED TIME</Text></View>
        <View style={s.featuredBody}>
          <View style={s.featuredLeft}>
            <Text style={s.featuredTitle}>STARTER PACK</Text>
            <Text style={s.featuredSub}>🪙 2000 Coins + 💎 350 + 🦸 3 Heroes</Text>
            <View style={s.featuredTimer}><Text style={s.featuredTimerText}>⏰ Ends in 23:59:00</Text></View>
            <Pressable style={s.featuredBtn} onPress={() => showToast('💳 Redirecting to payment...')}>
              <Text style={s.featuredBtnText}>₹249 · BUY NOW</Text>
            </Pressable>
          </View>
          <View style={s.featuredHeroes}>
            {(['playerone', 'speedy'] as const).map((id, i) => (
              <HeroCharacter key={id} characterId={id} size={i === 0 ? 64 : 46} animState="idle" />
            ))}
          </View>
        </View>
      </View>

      {/* Tab bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabScroll} contentContainerStyle={s.tabContent}>
        {SHOP_TABS.map(t => (
          <Pressable key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)}>
            <Text style={s.tabIcon}>{TAB_ICONS[t]}</Text>
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>{t}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Items grid */}
      {loading ? (
        <View style={s.loadWrap}><ActivityIndicator color="#FFB800" size="large" /></View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          numColumns={2}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={s.gridContent}
          columnWrapperStyle={s.gridRow}
          renderItem={({ item }) => {
            const rar  = RARITY_CFG[item.rarity] ?? RARITY_CFG.common;
            const isChar = tab === 'Characters';
            const charDef = isChar ? CHARACTERS[item.id as keyof typeof CHARACTERS] : null;

            return (
              <View style={[s.itemCard, { borderColor: rar.color + '60', shadowColor: rar.color }]}>
                {/* Rarity glow bg */}
                <View style={[s.itemGlowBg, { backgroundColor: rar.glow }]} />

                {/* Rarity badge */}
                <View style={[s.rarBadge, { backgroundColor: rar.color }]}>
                  <Text style={s.rarBadgeText}>{rar.label}</Text>
                </View>

                {/* Preview */}
                <View style={[s.preview, { backgroundColor: item.color + '18' }]}>
                  {charDef ? (
                    <HeroCharacter characterId={charDef.id} size={52} animState="idle" />
                  ) : (
                    <Text style={s.previewEmoji}>{item.emoji ?? '📦'}</Text>
                  )}
                  {item.locked && (
                    <View style={s.lockOverlay}>
                      <Text style={s.lockEmoji}>🔒</Text>
                    </View>
                  )}
                </View>

                <Text style={s.itemName} numberOfLines={2}>{item.name}</Text>

                {/* Price */}
                <Pressable
                  style={[s.buyBtn, { backgroundColor: item.locked ? rar.color : '#22C55E' }]}
                  onPress={() => handleBuy(item)}
                  disabled={buying === item.id || !item.locked}
                >
                  {buying === item.id ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={s.buyBtnText}>
                      {!item.locked ? '✓ OWNED'
                        : item.currency === 'usd'
                          ? `$${item.price}`
                          : item.currency === 'gems'
                            ? `💎 ${item.price}`
                            : `🪙 ${item.price}`}
                    </Text>
                  )}
                </Pressable>
              </View>
            );
          }}
        />
      )}

      {/* Toast */}
      {toast && (
        <View style={s.toast}>
          <Text style={s.toastText}>{toast}</Text>
        </View>
      )}
    </View>
  );
}

const C = {
  bg: '#080E1C', panel: '#0F1E3A', panelB: '#162947',
  gold: '#FFB800', border: 'rgba(255,255,255,0.09)',
  txt: '#FFFFFF', muted: 'rgba(255,255,255,0.5)', dim: 'rgba(255,255,255,0.28)',
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: 'rgba(8,14,28,0.95)',
    borderBottomWidth: 1, borderBottomColor: C.border, gap: 10,
  },
  backBtn:     { paddingHorizontal: 12, paddingVertical: 7, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 10, borderWidth: 1, borderColor: C.border },
  backText:    { color: C.txt, fontWeight: '700', fontSize: 12 },
  headerTitle: { flex: 1, color: C.gold, fontWeight: '900', fontSize: 16, letterSpacing: 3, textAlign: 'center' },
  walletRow:   { flexDirection: 'row', gap: 6 },
  coinChip:    { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,184,0,0.1)', borderRadius: 14, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(255,184,0,0.35)' },
  gemChip:     { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(168,85,247,0.1)', borderRadius: 14, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(168,85,247,0.35)' },
  chipIcon:    { fontSize: 13 },
  chipVal:     { color: C.txt, fontWeight: '900', fontSize: 12 },

  /* Featured */
  featured:          { margin: 12, borderRadius: 18, overflow: 'hidden', backgroundColor: C.panel, borderWidth: 1.5, borderColor: 'rgba(255,184,0,0.3)' },
  featuredBadge:     { backgroundColor: '#EF4444', paddingHorizontal: 12, paddingVertical: 4 },
  featuredBadgeText: { color: '#fff', fontWeight: '900', fontSize: 10, letterSpacing: 2 },
  featuredBody:      { flexDirection: 'row', padding: 12, gap: 8 },
  featuredLeft:      { flex: 1, gap: 5 },
  featuredTitle:     { color: C.txt, fontWeight: '900', fontSize: 18, letterSpacing: 1 },
  featuredSub:       { color: C.muted, fontSize: 11 },
  featuredTimer:     { backgroundColor: 'rgba(239,68,68,0.15)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', borderWidth: 1, borderColor: 'rgba(239,68,68,0.4)' },
  featuredTimerText: { color: '#EF4444', fontSize: 10, fontWeight: '800' },
  featuredBtn:       { backgroundColor: C.gold, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, alignSelf: 'flex-start', shadowColor: C.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8 },
  featuredBtnText:   { color: '#000', fontWeight: '900', fontSize: 13 },
  featuredHeroes:    { flexDirection: 'row', alignItems: 'flex-end', gap: -6 },

  /* Tabs */
  tabScroll:   { maxHeight: 54, borderBottomWidth: 1, borderBottomColor: C.border },
  tabContent:  { paddingHorizontal: 12, paddingVertical: 8, gap: 6 },
  tab:         { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: C.panel, borderWidth: 1, borderColor: C.border },
  tabActive:   { backgroundColor: '#1D4ED8', borderColor: 'rgba(96,165,250,0.5)' },
  tabIcon:     { fontSize: 13 },
  tabText:     { color: C.muted, fontWeight: '800', fontSize: 11 },
  tabTextActive: { color: '#fff' },

  loadWrap:    { flex: 1, alignItems: 'center', justifyContent: 'center' },

  /* Grid */
  gridContent: { padding: 12, paddingBottom: 40, gap: 10 },
  gridRow:     { gap: 10 },
  itemCard: {
    flex: 1, backgroundColor: C.panel, borderRadius: 16, padding: 12,
    alignItems: 'center', gap: 8, borderWidth: 1.5, overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10,
  },
  itemGlowBg:  { position: 'absolute', top: 0, left: 0, right: 0, height: 40 },
  rarBadge:    { alignSelf: 'stretch', borderRadius: 6, paddingVertical: 3, alignItems: 'center' },
  rarBadgeText:{ color: '#fff', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  preview:     { width: 80, height: 90, borderRadius: 14, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 4, overflow: 'hidden' },
  previewEmoji:{ fontSize: 38 },
  lockOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  lockEmoji:   { fontSize: 24 },
  itemName:    { color: C.txt, fontWeight: '800', fontSize: 11.5, textAlign: 'center', minHeight: 30 },
  buyBtn:      { alignSelf: 'stretch', borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
  buyBtnText:  { color: '#fff', fontWeight: '900', fontSize: 12 },

  /* Toast */
  toast:     { position: 'absolute', bottom: 36, left: 24, right: 24, backgroundColor: 'rgba(0,0,0,0.9)', borderRadius: 14, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  toastText: { color: '#fff', fontWeight: '800', fontSize: 14 },
});
