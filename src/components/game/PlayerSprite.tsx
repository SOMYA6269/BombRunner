// PlayerSprite — AAA in-game hero sprite with rich detailing
// Pure View/Text rendering, optimised for 60fps game loop
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

const POWERUP_ICONS: Record<string, string> = {
  shield: '🛡', speed_boost: '⚡', freeze: '❄️', extra_time: '⏰', ghost_dash: '👻',
};

export default function PlayerSprite({
  characterId, animState, facing, animClock,
  hasBomb, isMe, username, activePowerup, shieldActive,
}: Props) {
  const char = CHARACTERS[characterId] ?? CHARACTERS.playerone;

  let bounceY   = 0;
  let legSwing  = 0;
  let armSwing  = 0;
  let squashX   = 1;
  let squashY   = 1;

  if (animState === 'running' || animState === 'carrying') {
    const frame = Math.floor(animClock / RUN_FRAME_DURATION) % RUN_FRAMES;
    bounceY  = frame % 2 === 0 ? -4 : 2;
    legSwing = frame % 2 === 0 ? 1 : -1;
    armSwing = frame % 2 === 0 ? -1 : 1;
    squashX  = frame % 2 === 0 ? 0.95 : 1.05;
    squashY  = frame % 2 === 0 ? 1.05 : 0.95;
  } else if (animState === 'idle') {
    const frame = Math.floor(animClock / IDLE_FRAME_DURATION) % IDLE_FRAMES;
    bounceY = frame === 0 ? 0 : -1.5;
  }

  const isElim = animState === 'eliminated';
  const flip   = facing === 'left' ? -1 : 1;
  const SZ     = PLAYER_SIZE;
  const sc     = SZ / 48;

  return (
    <View style={[styles.root, { opacity: isElim ? 0.3 : 1 }]}>

      {/* Shield ring */}
      {shieldActive && (
        <View style={[styles.shieldRing, {
          width: SZ + sc * 14, height: SZ + sc * 14,
          borderRadius: (SZ + sc * 14) / 2,
        }]} />
      )}

      {/* Username label */}
      {username && (
        <View style={[styles.nameBar, isMe && styles.nameBarMe]}>
          {isMe && <View style={styles.meDot} />}
          <Text style={[styles.nameText, isMe && styles.nameTextMe]} numberOfLines={1}>
            {username}
          </Text>
        </View>
      )}

      {/* Powerup pip */}
      {activePowerup && (
        <View style={styles.powerupPip}>
          <Text style={styles.powerupText}>{POWERUP_ICONS[activePowerup] ?? '✨'}</Text>
        </View>
      )}

      {/* Ground shadow ellipse */}
      <View style={[styles.groundShadow, {
        width: SZ * 0.7,
        backgroundColor: char.bodyColor + '55',
        transform: [{ scaleX: squashX }],
      }]} />

      {/* Body container */}
      <View style={[styles.body, {
        transform: [{ translateY: bounceY }, { scaleX: flip * squashX }, { scaleY: squashY }],
      }]}>

        {/* Bomb on back (carrying) */}
        {hasBomb && (
          <View style={[styles.bombBack, { right: -sc * 3, top: sc * 12 }]}>
            <View style={[styles.bombBody, { width: sc * 15, height: sc * 15, borderRadius: sc * 7.5 }]}>
              <Text style={{ fontSize: sc * 12, textAlign: 'center' }}>💣</Text>
            </View>
            {/* Fuse spark */}
            <Text style={[styles.fuseGlow, { fontSize: sc * 9, top: -sc * 8, right: sc * 1 }]}>✨</Text>
          </View>
        )}

        {/* HEAD */}
        <View style={[styles.head, {
          width: sc * 24, height: sc * 24,
          borderRadius: sc * 12,
          backgroundColor: char.skinColor,
        }]}>
          <View style={[styles.hair, {
            width: sc * 24, height: sc * 13,
            borderTopLeftRadius: sc * 12, borderTopRightRadius: sc * 12,
            backgroundColor: char.hairColor,
          }]} />
          {/* Eyes row */}
          <View style={[styles.eyeRow, { gap: sc * 6, marginTop: sc * 12 }]}>
            {isElim ? (
              <Text style={[styles.xEye, { fontSize: sc * 9 }]}>✕</Text>
            ) : (
              <>
                <View style={{ width: sc * 5, height: sc * 5.5, borderRadius: sc * 2.5, backgroundColor: '#1a1a2e', overflow: 'hidden' }}>
                  <View style={{ width: sc * 1.8, height: sc * 1.8, borderRadius: sc, backgroundColor: '#fff', position: 'absolute', top: sc * 0.5, right: sc * 0.5 }} />
                </View>
                <View style={{ width: sc * 5, height: sc * 5.5, borderRadius: sc * 2.5, backgroundColor: '#1a1a2e', overflow: 'hidden' }}>
                  <View style={{ width: sc * 1.8, height: sc * 1.8, borderRadius: sc, backgroundColor: '#fff', position: 'absolute', top: sc * 0.5, right: sc * 0.5 }} />
                </View>
              </>
            )}
          </View>
          {/* Mouth */}
          {isElim
            ? <View style={[styles.mouthSad, { width: sc * 8, height: sc * 3, borderRadius: sc * 2, marginTop: sc * 2, transform: [{ scaleY: -1 }], backgroundColor: '#e07070' }]} />
            : <View style={[styles.mouth, { width: sc * 9, height: sc * 3.5, borderRadius: sc * 2, marginTop: sc * 2, backgroundColor: '#e07070' }]} />
          }
        </View>

        {/* TORSO */}
        <View style={[styles.torso, {
          width: sc * 20, height: sc * 18,
          borderRadius: sc * 4,
          backgroundColor: char.bodyColor,
          borderColor: 'rgba(255,255,255,0.18)', borderWidth: 1,
        }]}>
          {/* Collar highlight */}
          <View style={{ position: 'absolute', top: 0, width: sc * 20, height: sc * 6, borderTopLeftRadius: sc * 4, borderTopRightRadius: sc * 4, backgroundColor: 'rgba(255,255,255,0.12)' }} />
          {/* Arms */}
          <View style={[styles.armL, {
            width: sc * 7, height: sc * 13,
            borderRadius: sc * 3.5,
            backgroundColor: char.bodyColor,
            top: sc * 2, left: -sc * 6,
            borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1,
            transform: [{ rotate: `${armSwing * 18}deg` }],
          }]} />
          <View style={[styles.armR, {
            width: sc * 7, height: sc * 13,
            borderRadius: sc * 3.5,
            backgroundColor: char.bodyColor,
            top: sc * 2, right: -sc * 6,
            borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1,
            transform: [{ rotate: `${-armSwing * 18}deg` }],
          }]} />
        </View>

        {/* LEGS */}
        <View style={[styles.legs, { gap: sc * 3, marginTop: sc * 1 }]}>
          {[1, -1].map((side, i) => (
            <View key={i} style={{ alignItems: 'center', transform: [{ rotate: `${side * legSwing * 22}deg` }] }}>
              <View style={{ width: sc * 9, height: sc * 12, borderRadius: sc * 4, backgroundColor: char.bodyDark, borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1 }} />
              <View style={{ width: sc * 11, height: sc * 6, borderRadius: sc * 3, backgroundColor: char.shoeColor, marginTop: -sc * 1, borderColor: 'rgba(255,255,255,0.15)', borderWidth: 1 }}>
                <View style={{ position: 'absolute', top: sc * 1, left: sc * 1.5, width: sc * 4, height: sc * 2, borderRadius: sc, backgroundColor: 'rgba(255,255,255,0.3)' }} />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Me arrow */}
      {isMe && (
        <View style={styles.meArrow}>
          <Text style={[styles.meArrowText, { fontSize: sc * 10 }]}>▼</Text>
        </View>
      )}
    </View>
  );
}

const SZ = PLAYER_SIZE;

const styles = StyleSheet.create({
  root:        { width: SZ, height: SZ + 20, alignItems: 'center', justifyContent: 'flex-end' },
  shieldRing:  { position: 'absolute', borderWidth: 2.5, borderColor: '#00E5FF', opacity: 0.85, bottom: 10 },
  nameBar:     { position: 'absolute', top: 0, backgroundColor: 'rgba(0,0,0,0.72)', borderRadius: 7, paddingHorizontal: 5, paddingVertical: 2, maxWidth: 82, flexDirection: 'row', alignItems: 'center', gap: 3 },
  nameBarMe:   { backgroundColor: 'rgba(255,184,0,0.9)' },
  meDot:       { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#000' },
  nameText:    { color: '#fff', fontSize: 7.5, fontWeight: '800', textAlign: 'center' },
  nameTextMe:  { color: '#000' },
  powerupPip:  { position: 'absolute', top: -2, right: -4, width: 14, height: 14, borderRadius: 7, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' },
  powerupText: { fontSize: 8 },
  groundShadow:{ position: 'absolute', bottom: 1, height: 6, borderRadius: 3, opacity: 0.4 },
  body:        { alignItems: 'center' },
  bombBack:    { position: 'absolute', zIndex: 10 },
  bombBody:    { backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  fuseGlow:    { position: 'absolute' },
  head:        { alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 3, overflow: 'hidden', zIndex: 3 },
  hair:        { position: 'absolute', top: 0 },
  eyeRow:      { flexDirection: 'row' },
  xEye:        { color: '#EF4444', fontWeight: '900' },
  mouth:       {},
  mouthSad:    {},
  torso:       { alignItems: 'center', overflow: 'visible', marginTop: 1 },
  armL:        { position: 'absolute' },
  armR:        { position: 'absolute' },
  legs:        { flexDirection: 'row' },
  meArrow:     { position: 'absolute', top: -15 },
  meArrowText: { color: '#FFB800', fontWeight: '900', textShadowColor: '#000', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
});
