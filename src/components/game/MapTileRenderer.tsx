// MapTileRenderer — AAA hand-crafted environment renderer
// Features: textured tiles, ambient shadows, emoji decorations, water ripples, particle hints
import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GROUND_TILES, DECOR_TILES, POND_RECTS } from '@/game/mapData';
import { TILE_SIZE, VIEWPORT_W, VIEWPORT_H } from '@/game/constants';

interface Props {
  cameraX: number;
  cameraY: number;
}

// Rich color system: base + highlight + shadow
const TILE_STYLE: Record<string, { base: string; hi: string; shadow: string; border: string }> = {
  grass:        { base: '#2E7D32', hi: '#43A047', shadow: '#1B5E20', border: '#1B5E2088' },
  grass_dark:   { base: '#1B5E20', hi: '#256428', shadow: '#0D3B0F', border: '#0D3B0F99' },
  stone_path:   { base: '#546E7A', hi: '#607D8B', shadow: '#37474F', border: '#37474F88' },
  stone_wall:   { base: '#37474F', hi: '#455A64', shadow: '#263238', border: '#26323899' },
  bush:         { base: '#1B5E20', hi: '#2E7D32', shadow: '#104117', border: '#1B5E2066' },
  crate:        { base: '#5D4037', hi: '#6D4C41', shadow: '#4E342E', border: '#4E342E99' },
  barrel:       { base: '#4E342E', hi: '#5D4037', shadow: '#3E2723', border: '#3E272399' },
  pillar:       { base: '#455A64', hi: '#546E7A', shadow: '#263238', border: '#26323899' },
  torch:        { base: '#BF360C', hi: '#E64A19', shadow: '#870000', border: '#E64A1966' },
  powerup_spawn:{ base: '#1A1A2E', hi: '#252540', shadow: '#0D0D1A', border: 'rgba(255,184,0,0.35)' },
  water:        { base: '#0D47A1', hi: '#1565C0', shadow: '#0A2F6E', border: '#1976D266' },
  decoration:   { base: '#37474F', hi: '#455A64', shadow: '#263238', border: '#26323866' },
};

const TILE_EMOJI: Record<string, { main: string; accent?: string }> = {
  crate:         { main: '📦', accent: '🪵' },
  barrel:        { main: '🛢',  accent: undefined },
  pillar:        { main: '🗿',  accent: undefined },
  torch:         { main: '🔥',  accent: '✨' },
  bush:          { main: '🌿',  accent: '🌱' },
  powerup_spawn: { main: '⭐',  accent: '✨' },
};

// Grass variety: micro-randomize via index
const GRASS_ACCENTS = ['🌿', '🌱', '🍃', ''];

const PAD = TILE_SIZE * 2;

function MapTileRendererInner({ cameraX, cameraY }: Props) {
  const minX = cameraX - PAD;
  const maxX = cameraX + VIEWPORT_W + PAD;
  const minY = cameraY - PAD;
  const maxY = cameraY + VIEWPORT_H + PAD;

  const visGround = GROUND_TILES.filter(
    t => t.x + TILE_SIZE > minX && t.x < maxX && t.y + TILE_SIZE > minY && t.y < maxY,
  );
  const visDecor = DECOR_TILES.filter(
    t => t.x + TILE_SIZE > minX && t.x < maxX && t.y + TILE_SIZE > minY && t.y < maxY,
  );
  const visPonds = POND_RECTS.filter(
    p => p.x + p.w > minX && p.x < maxX && p.y + p.h > minY && p.y < maxY,
  );

  return (
    <View style={styles.root} pointerEvents="none">

      {/* ── Ground layer ── */}
      {visGround.map((t, i) => {
        const ts = TILE_STYLE[t.type] ?? TILE_STYLE.grass;
        const isPath = t.type === 'stone_path';
        const grassAccent = t.type === 'grass' || t.type === 'grass_dark'
          ? GRASS_ACCENTS[(t.x / TILE_SIZE + t.y / TILE_SIZE) % GRASS_ACCENTS.length]
          : null;

        return (
          <View key={`g-${i}`} style={[styles.tile, {
            left: t.x - cameraX, top: t.y - cameraY,
            width: TILE_SIZE, height: TILE_SIZE,
            backgroundColor: ts.base,
            borderColor: ts.border,
          }]}>
            {/* Top highlight edge */}
            <View style={[styles.tileHiTop, { backgroundColor: ts.hi }]} />
            {/* Left highlight edge */}
            <View style={[styles.tileHiLeft, { backgroundColor: ts.hi }]} />
            {/* Bottom shadow edge */}
            <View style={[styles.tileShadowBot, { backgroundColor: ts.shadow }]} />
            {/* Stone path cracks */}
            {isPath && (
              <>
                <View style={styles.pathCrack1} />
                <View style={styles.pathCrack2} />
              </>
            )}
            {/* Grass accent */}
            {grassAccent ? (
              <Text style={[styles.grassAccentText, {
                top: ((t.y / TILE_SIZE) * 13) % (TILE_SIZE - 12),
                left: ((t.x / TILE_SIZE) * 17) % (TILE_SIZE - 12),
              }]}>{grassAccent}</Text>
            ) : null}
          </View>
        );
      })}

      {/* ── Ponds / water ── */}
      {visPonds.map((p, i) => (
        <View key={`pond-${i}`} style={[styles.pond, {
          left: p.x - cameraX, top: p.y - cameraY, width: p.w, height: p.h,
        }]}>
          {/* Water shine streaks */}
          <View style={styles.waterShine1} />
          <View style={styles.waterShine2} />
          {/* Ripple circles */}
          <View style={[styles.waterRipple, { top: p.h * 0.3, left: p.w * 0.2 }]} />
          <View style={[styles.waterRipple, { top: p.h * 0.6, left: p.w * 0.6, width: 20, height: 10, opacity: 0.2 }]} />
        </View>
      ))}

      {/* ── Decor objects layer ── */}
      {visDecor.map((t, i) => {
        const ts    = TILE_STYLE[t.type] ?? TILE_STYLE.decoration;
        const emojis= TILE_EMOJI[t.type];
        const isTorch= t.type === 'torch';
        const isPU   = t.type === 'powerup_spawn';

        return (
          <View key={`d-${i}`} style={[styles.tile, styles.decorTile, {
            left: t.x - cameraX, top: t.y - cameraY,
            width: TILE_SIZE, height: TILE_SIZE,
            backgroundColor: ts.base,
            borderColor: ts.border,
            shadowColor: isTorch ? '#FF7043' : isPU ? '#FFB800' : '#000',
            shadowOpacity: isTorch || isPU ? 0.7 : 0.3,
          }]}>
            <View style={[styles.tileHiTop, { backgroundColor: ts.hi }]} />
            <View style={[styles.tileShadowBot, { backgroundColor: ts.shadow }]} />

            {emojis && (
              <View style={styles.decorCenter}>
                <Text style={[styles.decorEmoji, isTorch && styles.torchEmoji, isPU && styles.puEmoji]}>
                  {emojis.main}
                </Text>
                {emojis.accent && isTorch && (
                  <Text style={styles.torchAccent}>{emojis.accent}</Text>
                )}
                {isPU && <View style={styles.puGlowRing} />}
              </View>
            )}

            {t.type === 'barrel' && (
              <>
                <View style={styles.barrelBand1} />
                <View style={styles.barrelBand2} />
                <Text style={styles.barrelEmoji}>🛢</Text>
              </>
            )}

            {t.type === 'crate' && (
              <>
                <View style={styles.crateGrain1} />
                <View style={styles.crateGrain2} />
                <Text style={styles.crateEmoji}>📦</Text>
              </>
            )}
          </View>
        );
      })}
    </View>
  );
}

export const MapTileRenderer = memo(MapTileRendererInner);

const styles = StyleSheet.create({
  root:        { position: 'absolute', top: 0, left: 0, width: VIEWPORT_W, height: VIEWPORT_H },

  /* Base tile */
  tile:        { position: 'absolute', borderWidth: 1, overflow: 'hidden' },
  decorTile:   { zIndex: 2, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, borderRadius: 3 },

  /* Tile edge highlights */
  tileHiTop:      { position: 'absolute', top: 0, left: 0, right: 0, height: 3, opacity: 0.55 },
  tileHiLeft:     { position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, opacity: 0.45 },
  tileShadowBot:  { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, opacity: 0.6 },

  /* Stone path cracks */
  pathCrack1:  { position: 'absolute', top: '30%', left: '10%', width: '55%', height: 1, backgroundColor: 'rgba(0,0,0,0.3)', transform: [{ rotate: '12deg' }] },
  pathCrack2:  { position: 'absolute', top: '60%', left: '35%', width: '45%', height: 1, backgroundColor: 'rgba(0,0,0,0.2)', transform: [{ rotate: '-8deg' }] },

  /* Grass accent */
  grassAccentText: { position: 'absolute', fontSize: 9, opacity: 0.6 },

  /* Pond */
  pond:        { position: 'absolute', backgroundColor: '#0D47A1', borderWidth: 1.5, borderColor: '#1976D2', borderRadius: 6, overflow: 'hidden' },
  waterShine1: { position: 'absolute', top: '20%', left: '10%', width: '35%', height: 3, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, transform: [{ rotate: '-8deg' }] },
  waterShine2: { position: 'absolute', top: '55%', left: '40%', width: '25%', height: 2, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 2, transform: [{ rotate: '5deg' }] },
  waterRipple: { position: 'absolute', width: 28, height: 14, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', opacity: 0.35 },

  /* Decor */
  decorCenter:  { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  decorEmoji:   { fontSize: 18 },
  torchEmoji:   { fontSize: 16 },
  torchAccent:  { position: 'absolute', top: 2, right: 2, fontSize: 9, opacity: 0.8 },
  puEmoji:      { fontSize: 14 },
  puGlowRing:   { position: 'absolute', width: TILE_SIZE - 4, height: TILE_SIZE - 4, borderRadius: (TILE_SIZE - 4) / 2, borderWidth: 1.5, borderColor: 'rgba(255,184,0,0.4)' },

  barrelBand1:  { position: 'absolute', top: '25%', left: 3, right: 3, height: 3, backgroundColor: 'rgba(180,120,60,0.6)', borderRadius: 2 },
  barrelBand2:  { position: 'absolute', top: '60%', left: 3, right: 3, height: 3, backgroundColor: 'rgba(180,120,60,0.6)', borderRadius: 2 },
  barrelEmoji:  { position: 'absolute', fontSize: 16, alignSelf: 'center', top: '28%' },

  crateGrain1:  { position: 'absolute', top: '40%', left: 3, right: 3, height: 2, backgroundColor: 'rgba(0,0,0,0.25)' },
  crateGrain2:  { position: 'absolute', top: 3, bottom: 3, left: '40%', width: 2, backgroundColor: 'rgba(0,0,0,0.25)' },
  crateEmoji:   { position: 'absolute', fontSize: 14, alignSelf: 'center', top: '20%' },
});
