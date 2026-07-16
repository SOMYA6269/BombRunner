// MiniMap — top-right overview of all alive players + bomb holder
import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import type { LocalPlayer } from '@/lib/gameStore';
import { MAP_WIDTH, MAP_HEIGHT, TILE_SIZE } from '@/game/constants';
import { CHARACTERS } from '@/game/characters';

interface Props {
  players: LocalPlayer[];
  myDeviceId: string;
  cameraX: number;
  cameraY: number;
  viewW: number;
  viewH: number;
}

const MINI_W = 110;
const MINI_H = Math.round(MINI_W * (MAP_HEIGHT / MAP_WIDTH));

function MiniMapInner({ players, myDeviceId, cameraX, cameraY, viewW, viewH }: Props) {
  const scaleX = MINI_W / MAP_WIDTH;
  const scaleY = MINI_H / MAP_HEIGHT;

  return (
    <View style={styles.root}>
      {/* Terrain overlay (simple) */}
      <View style={styles.terrain} />

      {/* Camera viewport rect */}
      <View style={[styles.viewport, {
        left: cameraX * scaleX,
        top: cameraY * scaleY,
        width: viewW * scaleX,
        height: viewH * scaleY,
      }]} />

      {/* Players */}
      {players.map(p => {
        if (!p.isAlive) return null;
        const char = CHARACTERS[p.characterId];
        const isMe = p.deviceId === myDeviceId;
        return (
          <View key={p.deviceId} style={[styles.dot, {
            left: p.posX * scaleX - 3,
            top: p.posY * scaleY - 3,
            backgroundColor: p.hasBomb ? '#FF3D00' : char.bodyColor,
            width: isMe ? 8 : 6,
            height: isMe ? 8 : 6,
            borderRadius: isMe ? 4 : 3,
            borderWidth: isMe ? 1.5 : 0,
            borderColor: isMe ? '#FFB800' : 'transparent',
          }]} />
        );
      })}
    </View>
  );
}

export const MiniMap = memo(MiniMapInner);

const styles = StyleSheet.create({
  root: { width: MINI_W, height: MINI_H, backgroundColor: '#0d2c1a', borderRadius: 6, overflow: 'hidden', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)' },
  terrain: { ...StyleSheet.absoluteFillObject, backgroundColor: '#1B5E20' },
  viewport: { position: 'absolute', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.05)' },
  dot: { position: 'absolute' },
});
