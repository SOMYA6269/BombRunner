import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import type { AnimationState, FacingDirection } from '../../game/types';

interface PlayerSpriteProps {
  size: number;
  facing: FacingDirection;
  animState: AnimationState;
  animClock: number;
  hasBomb: boolean;
}

// Pure View/Text player — guaranteed to render inside Animated.View on all platforms
export default function PlayerSprite({
  size,
  facing,
  animState,
  animClock,
  hasBomb,
}: PlayerSpriteProps) {
  // 4-frame run cycle, 2-frame idle bob
  const runFrame  = Math.floor(animClock / 110) % 4;
  const idleFrame = Math.floor(animClock / 500) % 2;

  // Leg anim: alternate legs left/right for run
  const leftLegUp  = animState === 'running' && runFrame % 2 === 0;
  const rightLegUp = animState === 'running' && runFrame % 2 === 1;
  // Body bob for idle
  const bodyBob    = animState === 'idle' && idleFrame === 1 ? 1 : 0;
  // Arm swing
  const leftArmSwing  = animState === 'running' ? (runFrame % 2 === 0 ? -8 : 8) : 0;
  const rightArmSwing = animState === 'running' ? (runFrame % 2 === 0 ? 8 : -8) : 0;

  const s = size / 48; // scale factor

  return (
    <View style={[styles.root, { width: size, height: size * 1.5 }]}>
      {/* Bomb carried above head */}
      {hasBomb && (
        <View style={[styles.carryBomb, { bottom: size * 1.2 + 2 }]}>
          <Text style={{ fontSize: 16 * s }}>💣</Text>
        </View>
      )}

      {/* Shadow */}
      <View style={[styles.shadow, {
        width: size * 0.75,
        height: size * 0.18,
        borderRadius: size * 0.1,
        bottom: 0,
        left: size * 0.125,
      }]} />

      {/* Left arm */}
      <View style={[styles.arm, {
        width: 7 * s, height: 18 * s, borderRadius: 4 * s,
        left: -4 * s, top: 28 * s + bodyBob,
        transform: [{ rotate: `${leftArmSwing}deg` }],
        backgroundColor: '#4a90e2',
      }]} />

      {/* Right arm */}
      <View style={[styles.arm, {
        width: 7 * s, height: 18 * s, borderRadius: 4 * s,
        right: -4 * s, top: 28 * s + bodyBob,
        transform: [{ rotate: `${rightArmSwing}deg` }],
        backgroundColor: '#4a90e2',
      }]} />

      {/* Body */}
      <View style={[styles.body, {
        width: 28 * s, height: 18 * s,
        borderRadius: 6 * s,
        left: 10 * s, top: 28 * s + bodyBob,
      }]}>
        {/* Belt */}
        <View style={[styles.belt, { height: 4 * s, bottom: 0, borderRadius: 2 * s }]}>
          <View style={[styles.buckle, { width: 6 * s, height: 4 * s, borderRadius: 1 * s }]} />
        </View>
        {/* Body shine */}
        <View style={[styles.bodyShine, { width: 10 * s, height: 5 * s, borderRadius: 3 * s, top: 2 * s, left: 3 * s }]} />
      </View>

      {/* Head */}
      <View style={[styles.head, {
        width: 30 * s, height: 30 * s,
        borderRadius: 15 * s,
        left: 9 * s, top: 0,
      }]}>
        {/* Hair (yellow top) */}
        <View style={[styles.hair, { width: 30 * s, height: 16 * s, borderRadius: 15 * s, top: -2 * s }]} />
        {/* Cheeks */}
        <View style={[styles.cheekL, { width: 8 * s, height: 5 * s, borderRadius: 4 * s, bottom: 8 * s, left: 1 * s }]} />
        <View style={[styles.cheekR, { width: 8 * s, height: 5 * s, borderRadius: 4 * s, bottom: 8 * s, right: 1 * s }]} />
        {/* Eyes — flip based on facing */}
        <View style={[styles.eyeRow, { top: 12 * s, flexDirection: facing === 'left' ? 'row-reverse' : 'row' }]}>
          <View style={[styles.eyeWhite, { width: 9 * s, height: 10 * s, borderRadius: 5 * s }]}>
            <View style={[styles.pupil, { width: 5 * s, height: 6 * s, borderRadius: 3 * s }]}>
              <View style={[styles.shine, { width: 2 * s, height: 2 * s, borderRadius: s }]} />
            </View>
          </View>
          <View style={{ width: 4 * s }} />
          <View style={[styles.eyeWhite, { width: 9 * s, height: 10 * s, borderRadius: 5 * s }]}>
            <View style={[styles.pupil, { width: 5 * s, height: 6 * s, borderRadius: 3 * s }]}>
              <View style={[styles.shine, { width: 2 * s, height: 2 * s, borderRadius: s }]} />
            </View>
          </View>
        </View>
        {/* Mouth */}
        <View style={[styles.mouth, {
          width: animState === 'running' ? 10 * s : 8 * s,
          height: 3 * s, borderRadius: 2 * s,
          bottom: 5 * s, left: 10 * s,
        }]} />
      </View>

      {/* Legs */}
      <View style={[styles.legRow, { top: 46 * s + bodyBob, left: 12 * s, gap: 4 * s }]}>
        <View style={[styles.leg, {
          width: 9 * s, height: leftLegUp ? 7 * s : 10 * s,
          borderRadius: 4 * s,
          marginTop: leftLegUp ? 3 * s : 0,
        }]}>
          {/* Shoe */}
          <View style={[styles.shoe, { width: 11 * s, height: 7 * s, borderRadius: 4 * s, left: -1 * s, bottom: -3 * s }]} />
        </View>
        <View style={[styles.leg, {
          width: 9 * s, height: rightLegUp ? 7 * s : 10 * s,
          borderRadius: 4 * s,
          marginTop: rightLegUp ? 3 * s : 0,
        }]}>
          {/* Shoe */}
          <View style={[styles.shoe, { width: 11 * s, height: 7 * s, borderRadius: 4 * s, left: -1 * s, bottom: -3 * s }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { position: 'relative', alignItems: 'center' },
  shadow: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.2)' },
  carryBomb: { position: 'absolute', alignSelf: 'center' },
  arm: { position: 'absolute' },
  body: { position: 'absolute', backgroundColor: '#4a90e2', overflow: 'hidden' },
  bodyShine: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.25)' },
  belt: { position: 'absolute', width: '100%', backgroundColor: '#2c5f9e', alignItems: 'center', justifyContent: 'center' },
  buckle: { backgroundColor: '#f5c518' },
  head: { position: 'absolute', backgroundColor: '#ffcba4', overflow: 'hidden' },
  hair: { position: 'absolute', backgroundColor: '#f5c518' },
  cheekL: { position: 'absolute', backgroundColor: 'rgba(255,120,100,0.4)' },
  cheekR: { position: 'absolute', backgroundColor: 'rgba(255,120,100,0.4)' },
  eyeRow: { position: 'absolute', flexDirection: 'row', paddingHorizontal: 2 },
  eyeWhite: { backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  pupil: { backgroundColor: '#1a1a2e', alignItems: 'flex-end', justifyContent: 'flex-start', paddingTop: 1, paddingRight: 1 },
  shine: { backgroundColor: 'white' },
  mouth: { position: 'absolute', backgroundColor: '#cc5533' },
  legRow: { position: 'absolute', flexDirection: 'row', alignItems: 'flex-start' },
  leg: { backgroundColor: '#3d5a99' },
  shoe: { position: 'absolute', backgroundColor: '#cc3333' },
});
