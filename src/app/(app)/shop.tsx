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

const SHOP_TABS = ['Characters', 'Bomb Skins', 'Trails', 'Power Ups', 'Currency'] as const;
type ShopTab = typeof SHOP_TABS[number];

const SHOP_ITEMS = {
  Characters: Object.entries(CHARACTERS).map(([id, c]) => ({
    id, name: c.name, price: c.price, currency: 'coins', rarity: c.rarity,
    color: c.bodyColor, locked: c.rarity !== 'common',
  })),
  'Bomb Skins': [
    { id: 'bs_skull', name: 'Skull Bomb', price: 200, currency: 'coins', rarity: 'rare', color: '#EF4444', locked: true, emoji: '💀' },
    { id: 'bs_star', name: 'Star Bomb', price: 350, currency: 'coins', rarity: 'epic', color: '#FFB800', locked: true, emoji: '⭐' },
    { id: 'bs_blue', name: 'Blue Bomb', price: 150, currency: 'coins', rarity: 'common', color: '#2563EB', locked: false, emoji: '💙' },
    { id: 'bs_fire', name: 'Fire Bomb', price: 500, currency: 'gems', rarity: 'legendary', color: '#F97316', locked: true, emoji: '🔥' },
  ],
  Trails: [
    { id: 'tr_fire', name: 'Fire Trail', price: 250, currency: 'coins', rarity: 'epic', color: '#F97316', locked: true, emoji: '🔥' },
    { id: 'tr_ice', name: 'Ice Trail', price: 200, currency: 'coins', rarity: 'rare', color: '#38BDF8', locked: true, emoji: '❄️' },
    { id: 'tr_star', name: 'Star Trail', price: 500, currency: 'gems', rarity: 'legendary', color: '#FFB800', locked: true, emoji: '✨' },
  ],
  'Power Ups': [
    { id: 'pu_shield_x2', name: 'Shield x2', price: 50, currency: 'coins', rarity: 'common', color: '#1565C0', locked: false, emoji: '🛡' },
    { id: 'pu_speed_x2', name: 'Speed Boost x2', price: 50, currency: 'coins', rarity: 'common', color: '#E65100', locked: false, emoji: '⚡' },
    { id: 'pu_freeze_x2', name: 'Freeze x2', price: 50, currency: 'coins', rarity: 'common', color: '#006064', locked: false, emoji: '❄️' },
  ],
  Currency: [
    { id: 'cu_500', name: '500 Coins', price: 0.99, currency: 'usd', rarity: 'common', color: '#FFB800', locked: false, emoji: '🪙', amount: 500 },
    { id: 'cu_1200', name: '1200 Coins', price: 1.99, currency: 'usd', rarity: 'rare', color: '#FFB800', locked: false, emoji: '🪙', amount: 1200 },
    { id: 'cu_3000', name: '3000 Coins', price: 4.99, currency: 'usd', rarity: 'epic', color: '#FFB800', locked: false, emoji: '🪙', amount: 3000 },
    { id: 'cu_gem100', name: '100 Gems', price: 0.99, currency: 'usd', rarity: 'common', color: '#A855F7', locked: false, emoji: '💎', amount: 100 },
    { id: 'cu_gem350', name: '350 Gems', price: 2.99, currency: 'usd', rarity: 'epic', color: '#A855F7', locked: false, emoji: '💎', amount: 350 },
  ],
};

const RARITY_COLORS: Record<string, string> = {
  common: '#6B7280', rare: '#3B82F6', epic: '#A855F7', legendary: '#FFB800',
};

export default function ShopScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<ShopTab>('Characters');
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const p = await getOrCreateProfile();
      setProfile(p);
      setLoading(false);
    })();
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }, []);

  const handleBuy = useCallback(async (item: any) => {
    if (!profile || buying) return;
    setBuying(item.id);
    try {
      if (item.currency === 'coins') {
        if (profile.coins < item.price) { showToast('❌ Not enough coins!'); return; }
        await updateProfile({ coins: profile.coins - item.price });
        setProfile(p => p ? { ...p, coins: p.coins - item.price } : p);
        showToast(`✅ Purchased ${item.name}!`);
      } else if (item.currency === 'gems') {
        if (profile.gems < item.price) { showToast('❌ Not enough gems!'); return; }
        await updateProfile({ gems: profile.gems - item.price });
        setProfile(p => p ? { ...p, gems: p.gems - item.price } : p);
        showToast(`✅ Purchased ${item.name}!`);
      } else {
        showToast('💳 Redirecting to payment...');
      }
    } finally {
      setBuying(null);
    }
  }, [profile, buying, showToast]);

  const items = SHOP_ITEMS[tab] as any[];

  return (
    <View style={s.root}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={s.header}>
        <Pressable style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backIcon}>←</Text>
        </Pressable>
        <Text style={s.title}>🛒 SHOP</Text>
        {profile && (
          <View style={s.walletRow}>
            <Text style={s.walletText}>🪙 {profile.coins}</Text>
            <Text style={s.walletText}>💎 {profile.gems}</Text>
          </View>
        )}
      </View>

      {/* Featured banner */}
      <View style={s.featured}>
        <View style={s.featuredContent}>
          <Text style={s.featuredLabel}>🔥 LIMITED OFFER</Text>
          <Text style={s.featuredTitle}>STARTER PACK</Text>
          <Text style={s.featuredSub}>2000 Coins + 3 Characters</Text>
          <Pressable style={s.featuredBtn} onPress={() => {}}>
            <Text style={s.featuredBtnText}>₹249 · BUY NOW</Text>
          </Pressable>
        </View>
        <Text style={s.featuredEmoji}>🎁</Text>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabsScroll} contentContainerStyle={s.tabsContent}>
        {SHOP_TABS.map(t => (
          <Pressable key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)}>
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>{t}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Items grid */}
      {loading ? (
        <ActivityIndicator color="#FFB800" style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          numColumns={2}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{ padding: 12, gap: 10 }}
          columnWrapperStyle={{ gap: 10 }}
          renderItem={({ item }) => {
            const char = tab === 'Characters' ? CHARACTERS[item.id as keyof typeof CHARACTERS] : null;
            return (
              <View style={[s.card, { borderColor: RARITY_COLORS[item.rarity] + '60' }]}>
                {/* Rarity badge */}
                <View style={[s.rarityBadge, { backgroundColor: RARITY_COLORS[item.rarity] }]}>
                  <Text style={s.rarityText}>{item.rarity.toUpperCase()}</Text>
                </View>

                {/* Item preview */}
                <View style={[s.preview, { backgroundColor: item.color + '22' }]}>
                  {char ? (
                    <View style={s.charMini}>
                      <View style={[s.miniHead, { backgroundColor: char.skinColor }]}>
                        <View style={[s.miniHair, { backgroundColor: char.hairColor }]} />
                      </View>
                      <View style={[s.miniBody, { backgroundColor: char.bodyColor }]} />
                    </View>
                  ) : (
                    <Text style={s.itemEmoji}>{(item as any).emoji ?? '📦'}</Text>
                  )}
                </View>

                <Text style={s.itemName} numberOfLines={2}>{item.name}</Text>

                <Pressable
                  style={[s.buyBtn, item.locked === false && s.buyBtnOwned]}
                  onPress={() => handleBuy(item)}
                  disabled={buying === item.id}
                >
                  {buying === item.id ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={s.buyBtnText}>
                      {item.currency === 'usd'
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

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B1629' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12, gap: 8 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: '#fff', fontSize: 18, fontWeight: '700' },
  title: { flex: 1, color: '#FFB800', fontSize: 20, fontWeight: '900', letterSpacing: 2 },
  walletRow: { flexDirection: 'row', gap: 8 },
  walletText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  featured: { marginHorizontal: 16, marginBottom: 12, backgroundColor: '#1E3A5F', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: 'rgba(255,184,0,0.3)' },
  featuredContent: { flex: 1, gap: 4 },
  featuredLabel: { color: '#EF4444', fontWeight: '900', fontSize: 11, letterSpacing: 1 },
  featuredTitle: { color: '#fff', fontWeight: '900', fontSize: 18 },
  featuredSub: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  featuredBtn: { backgroundColor: '#FFB800', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, alignSelf: 'flex-start', marginTop: 6 },
  featuredBtnText: { color: '#000', fontWeight: '900', fontSize: 12 },
  featuredEmoji: { fontSize: 48 },
  tabsScroll: { maxHeight: 52 },
  tabsContent: { paddingHorizontal: 16, gap: 8, paddingVertical: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#132040' },
  tabActive: { backgroundColor: '#2563EB' },
  tabText: { color: 'rgba(255,255,255,0.5)', fontWeight: '700', fontSize: 12 },
  tabTextActive: { color: '#fff' },
  card: { flex: 1, backgroundColor: '#0F1E35', borderRadius: 16, padding: 12, alignItems: 'center', gap: 8, borderWidth: 1.5 },
  rarityBadge: { alignSelf: 'stretch', borderRadius: 6, paddingVertical: 3, alignItems: 'center' },
  rarityText: { color: '#fff', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  preview: { width: 80, height: 80, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  charMini: { alignItems: 'center', gap: 2 },
  miniHead: { width: 28, height: 28, borderRadius: 14, overflow: 'hidden', alignItems: 'center' },
  miniHair: { position: 'absolute', top: 0, width: 28, height: 14, borderTopLeftRadius: 14, borderTopRightRadius: 14 },
  miniBody: { width: 22, height: 18, borderRadius: 5 },
  itemEmoji: { fontSize: 36 },
  itemName: { color: '#fff', fontWeight: '800', fontSize: 12, textAlign: 'center' },
  buyBtn: { backgroundColor: '#FFB800', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, alignSelf: 'stretch', alignItems: 'center' },
  buyBtnOwned: { backgroundColor: '#22C55E' },
  buyBtnText: { color: '#000', fontWeight: '900', fontSize: 12 },
  toast: { position: 'absolute', bottom: 40, left: 32, right: 32, backgroundColor: 'rgba(0,0,0,0.85)', borderRadius: 14, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  toastText: { color: '#fff', fontWeight: '800', fontSize: 14 },
});
