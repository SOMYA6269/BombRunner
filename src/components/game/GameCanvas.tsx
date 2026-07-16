// GameCanvas — renders the entire game world
import React, { memo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { MapTileRenderer } from './MapTileRenderer';
import PlayerSprite from './PlayerSprite';
import { VIEWPORT_W, VIEWPORT_H, PLAYER_SIZE, PLAYER_HALF } from '@/game/constants';
import type { LocalGameState } from '@/lib/gameStore';

interface Props {
  state: LocalGameState;
}

function GameCanvasInner({ state }: Props) {
  const { players, cameraX, cameraY, myDeviceId, bombCountdown, gamePhase, explosionAt, powerups } = state;

  return (
    <View style={styles.viewport}>
      {/* Map tiles */}
      <MapTileRenderer cameraX={cameraX} cameraY={cameraY} />

      {/* Powerup pickups */}
      {powerups.map(pu => {
        if (pu.collected) return null;
        const sx = pu.posX - cameraX - 16;
        const sy = pu.posY - cameraY - 16;
        return (
          <View key={pu.id} style={[styles.powerup, { left: sx, top: sy }]}>
            <Text style={styles.powerupEmoji}>{POWERUP_EMOJI[pu.type] ?? '⭐'}</Text>
            <View style={styles.powerupGlow} />
          </View>
        );
      })}

      {/* Players */}
      {players.map(p => {
        const sx = p.posX - cameraX - PLAYER_HALF;
        const sy = p.posY - cameraY - PLAYER_HALF - 18;
        return (
          <View key={p.deviceId} style={[styles.playerWrap, { left: sx, top: sy }]}>
            <PlayerSprite
              characterId={p.characterId}
              animState={p.animState}
              facing={p.facing}
              animClock={p.animClock}
              hasBomb={p.hasBomb}
              isMe={p.deviceId === myDeviceId}
              username={p.username}
              activePowerup={p.activePowerup}
              shieldActive={p.shieldActive}
            />
          </View>
        );
      })}

      {/* Explosion effect */}
      {gamePhase === 'explosion' && explosionAt && (
        <View style={[styles.explosion, {
          left: explosionAt.posX - cameraX - 70,
          top: explosionAt.posY - cameraY - 70,
        }]}>
          <Text style={styles.explosionEmoji}>💥</Text>
          <View style={styles.explosionRing} />
        </View>
      )}

      {/* Countdown overlay */}
      {gamePhase === 'countdown' && (
        <View style={styles.countdownOverlay}>
          <Text style={styles.countdownNum}>{state.countdownValue}</Text>
        </View>
      )}
    </View>
  );
}

export const GameCanvas = memo(GameCanvasInner);

const POWERUP_EMOJI: Record<string, string> = {
  shield: '🛡', speed_boost: '⚡', freeze: '❄️', extra_time: '⏰', ghost_dash: '👻',
};

const styles = StyleSheet.create({
  viewport: { width: VIEWPORT_W, height: VIEWPORT_H, overflow: 'hidden', position: 'relative', backgroundColor: '#1B5E20' },
  playerWrap: { position: 'absolute', zIndex: 10 },
  powerup: { position: 'absolute', width: 32, height: 32, alignItems: 'center', justifyContent: 'center', zIndex: 8 },
  powerupEmoji: { fontSize: 20 },
  powerupGlow: { position: 'absolute', width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,200,0.25)', borderWidth: 1.5, borderColor: 'rgba(255,255,100,0.5)' },
  explosion: { position: 'absolute', width: 140, height: 140, alignItems: 'center', justifyContent: 'center', zIndex: 20 },
  explosionEmoji: { fontSize: 80 },
  explosionRing: { position: 'absolute', width: 140, height: 140, borderRadius: 70, borderWidth: 4, borderColor: '#FF6D00', backgroundColor: 'rgba(255,109,0,0.25)' },
  countdownOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', zIndex: 30 },
  countdownNum: { fontSize: 120, fontWeight: '900', color: '#FFB800' },
});
