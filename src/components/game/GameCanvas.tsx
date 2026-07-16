// GameCanvas — AAA game world renderer with hero bomb, particles, premium effects
import React, { memo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { MapTileRenderer } from './MapTileRenderer';
import PlayerSprite from './PlayerSprite';
import { VIEWPORT_W, VIEWPORT_H, PLAYER_SIZE, PLAYER_HALF } from '@/game/constants';
import type { LocalGameState } from '@/lib/gameStore';

interface Props {
  state: LocalGameState;
}

const POWERUP_CONFIG: Record<string, { emoji: string; glow: string; label: string }> = {
  shield:      { emoji: '🛡', glow: '#00E5FF', label: 'SHIELD' },
  speed_boost: { emoji: '⚡', glow: '#FFB800', label: 'BOOST' },
  freeze:      { emoji: '❄️', glow: '#64B5F6', label: 'FREEZE' },
  extra_time:  { emoji: '⏰', glow: '#22C55E', label: 'TIME+' },
  ghost_dash:  { emoji: '👻', glow: '#A855F7', label: 'GHOST' },
};

function GameCanvasInner({ state }: Props) {
  const { players, cameraX, cameraY, myDeviceId, bombCountdown, gamePhase, explosionAt, powerups } = state;

  // Bomb pulse intensity based on time remaining
  const bombUrgency  = Math.max(0, 1 - bombCountdown / 20);
  const pulseSize    = 1 + bombUrgency * 0.15;
  const bombGlowR    = Math.floor(255);
  const bombGlowG    = Math.floor(180 - bombUrgency * 140);
  const bombGlowColor= `rgba(${bombGlowR},${bombGlowG},0,${0.3 + bombUrgency * 0.4})`;

  return (
    <View style={styles.viewport}>
      {/* Map tiles */}
      <MapTileRenderer cameraX={cameraX} cameraY={cameraY} />

      {/* Powerup pickups */}
      {powerups.map(pu => {
        if (pu.collected) return null;
        const cfg = POWERUP_CONFIG[pu.type];
        const sx  = pu.posX - cameraX - 20;
        const sy  = pu.posY - cameraY - 20;
        return (
          <View key={pu.id} style={[styles.powerupWrap, { left: sx, top: sy }]}>
            {/* Outer glow ring */}
            <View style={[styles.powerupGlowOuter, { borderColor: cfg?.glow ?? '#FFB800', shadowColor: cfg?.glow ?? '#FFB800' }]} />
            {/* Inner panel */}
            <View style={[styles.powerupInner, { backgroundColor: (cfg?.glow ?? '#FFB800') + '22' }]}>
              <Text style={styles.powerupEmoji}>{cfg?.emoji ?? '⭐'}</Text>
            </View>
            {/* Label */}
            <Text style={[styles.powerupLabel, { color: cfg?.glow ?? '#FFB800' }]}>{cfg?.label}</Text>
          </View>
        );
      })}

      {/* Players */}
      {players.map(p => {
        const sx = p.posX - cameraX - PLAYER_HALF;
        const sy = p.posY - cameraY - PLAYER_HALF - 20;

        return (
          <View key={p.deviceId} style={[styles.playerWrap, { left: sx, top: sy }]}>
            {/* Bomb carrier glow halo */}
            {p.hasBomb && p.isAlive && (
              <View style={[styles.bombHalo, {
                backgroundColor: bombGlowColor,
                width:  PLAYER_SIZE * pulseSize + 24,
                height: PLAYER_SIZE * pulseSize + 24,
                borderRadius: (PLAYER_SIZE * pulseSize + 24) / 2,
                left:   -(PLAYER_SIZE * (pulseSize - 1) / 2 + 12),
                top:    -(PLAYER_SIZE * (pulseSize - 1) / 2 + 12) + 8,
              }]} />
            )}
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

      {/* Explosion effect — layered rings + emoji */}
      {gamePhase === 'explosion' && explosionAt && (
        <View style={[styles.explosionWrap, {
          left: explosionAt.posX - cameraX - 90,
          top:  explosionAt.posY - cameraY - 90,
        }]}>
          {/* Shockwave rings */}
          <View style={styles.shockRing1} />
          <View style={styles.shockRing2} />
          <View style={styles.shockRing3} />
          {/* Core flash */}
          <View style={styles.explosionFlash} />
          {/* Main explosion emoji */}
          <Text style={styles.explosionEmoji}>💥</Text>
          {/* Debris particles */}
          {['💫','⚡','🔥','✨','💢'].map((e, i) => (
            <Text key={i} style={[styles.debris, {
              top:  45 + Math.sin(i * 72 * Math.PI / 180) * 55,
              left: 45 + Math.cos(i * 72 * Math.PI / 180) * 55,
              fontSize: 16 + (i % 3) * 6,
            }]}>{e}</Text>
          ))}
        </View>
      )}

      {/* Countdown overlay */}
      {gamePhase === 'countdown' && (
        <View style={styles.countdownOverlay}>
          <View style={styles.countdownRing}>
            <Text style={styles.countdownNum}>{state.countdownValue}</Text>
          </View>
          <Text style={styles.countdownLabel}>GET READY!</Text>
        </View>
      )}

      {/* Freeze overlay tint */}
      {players.find(p => p.deviceId === myDeviceId && p.activePowerup === 'freeze') && (
        <View style={styles.freezeOverlay} pointerEvents="none" />
      )}
    </View>
  );
}

export const GameCanvas = memo(GameCanvasInner);

const styles = StyleSheet.create({
  viewport:    { width: VIEWPORT_W, height: VIEWPORT_H, overflow: 'hidden', position: 'relative' },

  /* Powerup pickups */
  powerupWrap:      { position: 'absolute', alignItems: 'center', width: 40, height: 56 },
  powerupGlowOuter: { position: 'absolute', width: 40, height: 40, borderRadius: 20, borderWidth: 2, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 8 },
  powerupInner:     { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  powerupEmoji:     { fontSize: 20 },
  powerupLabel:     { fontSize: 7, fontWeight: '900', letterSpacing: 0.5, marginTop: 2 },

  /* Player */
  playerWrap: { position: 'absolute', width: PLAYER_SIZE, height: PLAYER_SIZE + 20 },
  bombHalo:   { position: 'absolute' },

  /* Explosion */
  explosionWrap:  { position: 'absolute', width: 180, height: 180, alignItems: 'center', justifyContent: 'center' },
  shockRing1:     { position: 'absolute', width: 80,  height: 80,  borderRadius: 40,  borderWidth: 3, borderColor: 'rgba(255,120,0,0.7)' },
  shockRing2:     { position: 'absolute', width: 130, height: 130, borderRadius: 65,  borderWidth: 2, borderColor: 'rgba(255,80,0,0.45)' },
  shockRing3:     { position: 'absolute', width: 170, height: 170, borderRadius: 85,  borderWidth: 1.5, borderColor: 'rgba(255,50,0,0.22)' },
  explosionFlash: { position: 'absolute', width: 60,  height: 60,  borderRadius: 30,  backgroundColor: 'rgba(255,220,100,0.9)' },
  explosionEmoji: { fontSize: 52, textShadowColor: '#FF6D00', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 12 },
  debris:         { position: 'absolute' },

  /* Countdown overlay */
  countdownOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', gap: 10 },
  countdownRing:    { width: 90, height: 90, borderRadius: 45, borderWidth: 4, borderColor: '#FFB800', backgroundColor: 'rgba(255,184,0,0.1)', alignItems: 'center', justifyContent: 'center' },
  countdownNum:     { color: '#FFB800', fontSize: 54, fontWeight: '900', textShadowColor: '#FFB800', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 16 },
  countdownLabel:   { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 4 },

  /* Freeze tint */
  freezeOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(56,189,248,0.22)' },
});
