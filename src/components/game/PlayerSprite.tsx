// PlayerSprite — draws a cute chibi hero using pure View/Text primitives
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CHARACTERS } from '@/game/characters';
import type { CharacterId } from '@/types/types';
import { PLAYER_SIZE, RUN_FRAMES, RUN_FRAME_DURATION, IDLE_FRAMES, IDLE_FRAME_DURATION } from '@/game/constants';

interface Props {
  characterId: CharacterId;
  animState: 'idle' | 'running' | 'carrying' | 'eliminated';
  facing: 'left' | 'right';
  animClock: number;
  hasBomb?: boolean;
  isMe?: boolean;
  username?: string;
  activePowerup?: string | null;
  shieldActive?: boolean;
}

export default function PlayerSprite({
  characterId, animState, facing, animClock,
  hasBomb, isMe, username, activePowerup, shieldActive,
}: Props) {
  const char = CHARACTERS[characterId] ?? CHARACTERS.playerone;

  // Compute bounce offset for running animation
  let bounceY = 0;
  let legSwing = 0;
  if (animState === 'running' || animState === 'carrying') {
    const frame = Math.floor(animClock / RUN_FRAME_DURATION) % RUN_FRAMES;
    bounceY = frame % 2 === 0 ? -3 : 1;
    legSwing = frame % 2 === 0 ? 1 : -1;
  } else if (animState === 'idle') {
    const frame = Math.floor(animClock / IDLE_FRAME_DURATION) % IDLE_FRAMES;
    bounceY = frame === 0 ? 0 : -1;
  }

  const isElim = animState === 'eliminated';
  const flip = facing === 'left' ? -1 : 1;

  return (
    <View style={[styles.root, { opacity: isElim ? 0.35 : 1 }]}>
      {/* Shield ring */}
      {shieldActive && (
        <View style={[styles.shieldRing, { borderColor: '#00BFFF' }]} />
      )}

      {/* Username label */}
      {username && (
        <View style={[styles.nameBar, isMe && styles.nameBarMe]}>
          <Text style={[styles.nameText, isMe && styles.nameTextMe]} numberOfLines={1}>
            {isMe ? '▶ ' : ''}{username}
          </Text>
        </View>
      )}

      {/* Powerup indicator */}
      {activePowerup && (
        <Text style={styles.powerupIcon}>{POWERUP_ICONS[activePowerup] ?? '✨'}</Text>
      )}

      {/* Body container with bounce */}
      <View style={[styles.body, { transform: [{ translateY: bounceY }, { scaleX: flip }] }]}>

        {/* Bomb on back if carrying */}
        {hasBomb && (
          <View style={styles.bombCarry}>
            <Text style={styles.bombEmoji}>💣</Text>
            <View style={styles.fuse}>
              <Text style={styles.fuseText}>✨</Text>
            </View>
          </View>
        )}

        {/* Head */}
        <View style={[styles.head, { backgroundColor: char.skinColor }]}>
          {/* Hair */}
          <View style={[styles.hair, { backgroundColor: char.hairColor }]} />
          {/* Face */}
          <View style={styles.faceRow}>
            <View style={styles.eye} />
            {!isElim && <View style={styles.eye} />}
            {isElim && <Text style={styles.xEye}>✕</Text>}
          </View>
          {!isElim && <View style={styles.mouth} />}
          {isElim && <View style={[styles.mouth, styles.mouthSad]} />}
        </View>

        {/* Torso */}
        <View style={[styles.torso, { backgroundColor: char.bodyColor }]}>
          {/* Arms */}
          <View style={[styles.arm, styles.armLeft, { backgroundColor: char.bodyDark, transform: [{ rotate: `${legSwing * 15}deg` }] }]} />
          <View style={[styles.arm, styles.armRight, { backgroundColor: char.bodyDark, transform: [{ rotate: `${-legSwing * 15}deg` }] }]} />
        </View>

        {/* Legs */}
        <View style={styles.legs}>
          <View style={[styles.leg, { backgroundColor: char.bodyDark, transform: [{ rotate: `${legSwing * 20}deg` }] }]}>
            <View style={[styles.shoe, { backgroundColor: char.shoeColor }]} />
          </View>
          <View style={[styles.leg, { backgroundColor: char.bodyDark, transform: [{ rotate: `${-legSwing * 20}deg` }] }]}>
            <View style={[styles.shoe, { backgroundColor: char.shoeColor }]} />
          </View>
        </View>
      </View>

      {/* Me indicator */}
      {isMe && <View style={styles.meArrow}><Text style={styles.meArrowText}>▼</Text></View>}
    </View>
  );
}

const POWERUP_ICONS: Record<string, string> = {
  shield: '🛡', speed_boost: '⚡', freeze: '❄️', extra_time: '⏰', ghost_dash: '👻',
};

const SZ = PLAYER_SIZE;

const styles = StyleSheet.create({
  root: { width: SZ, height: SZ + 18, alignItems: 'center', justifyContent: 'flex-end' },
  shieldRing: { position: 'absolute', width: SZ + 12, height: SZ + 12, borderRadius: (SZ + 12) / 2, borderWidth: 3, top: 8, opacity: 0.8 },
  nameBar: { position: 'absolute', top: 0, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 6, paddingHorizontal: 4, paddingVertical: 1, maxWidth: 80 },
  nameBarMe: { backgroundColor: 'rgba(255,184,0,0.85)' },
  nameText: { color: '#fff', fontSize: 7, fontWeight: '700', textAlign: 'center' },
  nameTextMe: { color: '#000' },
  powerupIcon: { position: 'absolute', top: -4, right: -4, fontSize: 10 },
  body: { alignItems: 'center', width: SZ },
  bombCarry: { position: 'absolute', top: 12, right: -2, zIndex: 10 },
  bombEmoji: { fontSize: 14 },
  fuse: { position: 'absolute', top: -4, right: 2 },
  fuseText: { fontSize: 8 },
  // Head
  head: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 4, overflow: 'hidden', zIndex: 3, borderWidth: 1, borderColor: 'rgba(0,0,0,0.15)' },
  hair: { position: 'absolute', top: 0, width: 22, height: 12, borderTopLeftRadius: 11, borderTopRightRadius: 11 },
  faceRow: { flexDirection: 'row', gap: 5, marginBottom: 2 },
  eye: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#1a1a1a' },
  xEye: { fontSize: 8, color: '#EF4444', fontWeight: '900' },
  mouth: { width: 8, height: 3, borderRadius: 2, backgroundColor: '#c0392b' },
  mouthSad: { borderRadius: 0, transform: [{ scaleY: -1 }] },
  // Torso
  torso: { width: 18, height: 16, borderRadius: 4, marginTop: 1, zIndex: 2, borderWidth: 1, borderColor: 'rgba(0,0,0,0.15)' },
  arm: { position: 'absolute', width: 6, height: 12, borderRadius: 3, top: 2 },
  armLeft: { left: -5 },
  armRight: { right: -5 },
  // Legs
  legs: { flexDirection: 'row', gap: 3, marginTop: 1 },
  leg: { width: 7, height: 10, borderRadius: 3, alignItems: 'center', justifyContent: 'flex-end' },
  shoe: { width: 9, height: 5, borderRadius: 3 },
  // Me indicator
  meArrow: { position: 'absolute', top: -14 },
  meArrowText: { color: '#FFB800', fontSize: 10, fontWeight: '900' },
});
