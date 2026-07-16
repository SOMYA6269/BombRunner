// MapTileRenderer — renders ground + decor tiles visible in the viewport
import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { GROUND_TILES, DECOR_TILES, POND_RECTS } from '@/game/mapData';
import { TILE_SIZE, VIEWPORT_W, VIEWPORT_H } from '@/game/constants';

interface Props {
  cameraX: number;
  cameraY: number;
}

const TILE_COLORS: Record<string, string> = {
  grass:       '#4CAF50',
  grass_dark:  '#388E3C',
  stone_path:  '#9E9E9E',
  stone_wall:  '#616161',
  bush:        '#2E7D32',
  crate:       '#795548',
  barrel:      '#5D4037',
  pillar:      '#78909C',
  torch:       '#FF7043',
  powerup_spawn: '#FFF9C4',
  water:       '#1565C0',
  decoration:  '#9E9E9E',
};

const TILE_EMOJI: Record<string, string> = {
  crate: '📦', barrel: '🛢', pillar: '🗿', torch: '🔥',
  bush: '🌿', powerup_spawn: '⭐',
};

// Pad viewport so objects near edge still render
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
      {/* Ground */}
      {visGround.map((t, i) => (
        <View
          key={`g-${i}`}
          style={[styles.tile, {
            left: t.x - cameraX,
            top: t.y - cameraY,
            width: TILE_SIZE, height: TILE_SIZE,
            backgroundColor: TILE_COLORS[t.type] ?? '#4CAF50',
          }]}
        />
      ))}

      {/* Ponds */}
      {visPonds.map((p, i) => (
        <View key={`pond-${i}`} style={[styles.pond, {
          left: p.x - cameraX, top: p.y - cameraY, width: p.w, height: p.h,
        }]} />
      ))}

      {/* Solid decor */}
      {visDecor.map((t, i) => {
        const emoji = TILE_EMOJI[t.type];
        return (
          <View key={`d-${i}`} style={[styles.tile, styles.decorTile, {
            left: t.x - cameraX, top: t.y - cameraY,
            width: TILE_SIZE, height: TILE_SIZE,
            backgroundColor: TILE_COLORS[t.type] ?? '#616161',
          }]}>
            {emoji ? (
              <View style={styles.emojiWrap}>{/* eslint-disable-next-line */}
                <View style={[styles.emojiInner, { backgroundColor: TILE_COLORS[t.type] + 'CC' }]}>
                  {/* Simple visual representation */}
                </View>
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

export const MapTileRenderer = memo(MapTileRendererInner);

const styles = StyleSheet.create({
  root: { position: 'absolute', top: 0, left: 0 },
  tile: { position: 'absolute', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.08)' },
  decorTile: { borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.25)' },
  pond: { position: 'absolute', backgroundColor: '#1565C080', borderWidth: 2, borderColor: '#1976D280', borderRadius: 8 },
  emojiWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emojiInner: { width: 40, height: 40, borderRadius: 6 },
});
