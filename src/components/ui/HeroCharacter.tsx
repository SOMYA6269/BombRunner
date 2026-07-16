// HeroCharacter — AAA-quality hero display for menus (not in-game)
// Uses pure View/Text primitives with rich detailing and animations
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { CHARACTERS } from '@/game/characters';
import type { CharacterId } from '@/types/types';

interface Props {
  characterId: CharacterId;
  size?: number;
  animState?: 'idle' | 'running' | 'celebrate';
  showBomb?: boolean;
  showShield?: boolean;
}

export default function HeroCharacter({
  characterId,
  size = 80,
  animState = 'idle',
  showBomb = false,
  showShield = false,
}: Props) {
  const char = CHARACTERS[characterId] ?? CHARACTERS.playerone;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const glowAnim   = useRef(new Animated.Value(0.7)).current;
  const scaleAnim  = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (animState === 'idle') {
      Animated.loop(Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -size * 0.04, duration: 900, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])).start();
    } else if (animState === 'running') {
      Animated.loop(Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -size * 0.06, duration: 250, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: size * 0.02, duration: 250, useNativeDriver: true }),
      ])).start();
    } else if (animState === 'celebrate') {
      Animated.loop(Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.08, duration: 300, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 0.96, duration: 300, useNativeDriver: true }),
      ])).start();
      Animated.loop(Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -size * 0.12, duration: 350, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
      ])).start();
    }
    Animated.loop(Animated.sequence([
      Animated.timing(glowAnim, { toValue: 1,   duration: 1400, useNativeDriver: true }),
      Animated.timing(glowAnim, { toValue: 0.5, duration: 1400, useNativeDriver: true }),
    ])).start();
    return () => { bounceAnim.stopAnimation(); glowAnim.stopAnimation(); scaleAnim.stopAnimation(); };
  }, [animState, size, bounceAnim, glowAnim, scaleAnim]);

  const sc = size / 80; // scale factor

  return (
    <View style={{ width: size, height: size * 1.3, alignItems: 'center', justifyContent: 'flex-end' }}>
      {/* Ground shadow */}
      <Animated.View style={[styles.shadow, {
        width: size * 0.65,
        opacity: glowAnim.interpolate({ inputRange: [0.5, 1], outputRange: [0.2, 0.45] }),
        backgroundColor: char.bodyColor,
        bottom: 2,
      }]} />

      {/* Shield ring */}
      {showShield && (
        <Animated.View style={[styles.shieldRing, {
          width: size * 0.95, height: size * 0.95,
          borderRadius: size * 0.475,
          opacity: glowAnim,
          bottom: size * 0.12,
        }]} />
      )}

      {/* Hero body with bounce */}
      <Animated.View style={{ transform: [{ translateY: bounceAnim }, { scale: scaleAnim }], alignItems: 'center' }}>

        {/* Bomb on back */}
        {showBomb && (
          <View style={[styles.bombWrap, { right: -sc * 2, top: sc * 18 }]}>
            <Text style={{ fontSize: sc * 18 }}>💣</Text>
            <Text style={{ fontSize: sc * 10, position: 'absolute', top: -sc * 6, right: sc * 2 }}>✨</Text>
          </View>
        )}

        {/* Head */}
        <View style={[styles.head, {
          width: sc * 30, height: sc * 30, borderRadius: sc * 15,
          backgroundColor: char.skinColor,
          shadowColor: '#000', shadowOffset: { width: 0, height: sc * 2 }, shadowOpacity: 0.4, shadowRadius: sc * 3,
        }]}>
          {/* Hair */}
          <View style={[styles.hair, {
            width: sc * 30, height: sc * 16,
            borderTopLeftRadius: sc * 15, borderTopRightRadius: sc * 15,
            backgroundColor: char.hairColor,
          }]} />
          {/* Eyes */}
          <View style={[styles.eyeRow, { gap: sc * 7, marginTop: sc * 14 }]}>
            <View style={{ width: sc * 5.5, height: sc * 6, borderRadius: sc * 3, backgroundColor: '#1a1a2e', overflow: 'hidden' }}>
              <View style={{ width: sc * 2, height: sc * 2, borderRadius: sc, backgroundColor: '#fff', position: 'absolute', top: sc, right: sc }} />
            </View>
            <View style={{ width: sc * 5.5, height: sc * 6, borderRadius: sc * 3, backgroundColor: '#1a1a2e', overflow: 'hidden' }}>
              <View style={{ width: sc * 2, height: sc * 2, borderRadius: sc, backgroundColor: '#fff', position: 'absolute', top: sc, right: sc }} />
            </View>
          </View>
          {/* Mouth */}
          <View style={[styles.smile, { width: sc * 10, height: sc * 4, borderRadius: sc * 2, backgroundColor: '#e07070', marginTop: sc * 2 }]} />
          {/* Cheek blush */}
          <View style={{ position: 'absolute', bottom: sc * 5, left: sc * 3, width: sc * 6, height: sc * 4, borderRadius: sc * 2, backgroundColor: 'rgba(255,150,150,0.45)' }} />
          <View style={{ position: 'absolute', bottom: sc * 5, right: sc * 3, width: sc * 6, height: sc * 4, borderRadius: sc * 2, backgroundColor: 'rgba(255,150,150,0.45)' }} />
        </View>

        {/* Neck */}
        <View style={{ width: sc * 10, height: sc * 4, backgroundColor: char.skinColor, zIndex: 1 }} />

        {/* Torso */}
        <View style={[styles.torso, {
          width: sc * 26, height: sc * 22,
          borderRadius: sc * 5,
          backgroundColor: char.bodyColor,
          borderColor: 'rgba(255,255,255,0.18)', borderWidth: 1.5,
          shadowColor: char.bodyColor, shadowOffset: { width: 0, height: sc * 3 }, shadowOpacity: 0.6, shadowRadius: sc * 6,
        }]}>
          {/* Collar */}
          <View style={{ position: 'absolute', top: 0, width: sc * 26, height: sc * 8, borderTopLeftRadius: sc * 5, borderTopRightRadius: sc * 5, backgroundColor: char.bodyDark, overflow: 'hidden' }}>
            <View style={{ position: 'absolute', top: 0, left: '35%', width: sc * 8, height: sc * 8, backgroundColor: char.skinColor, borderBottomLeftRadius: sc * 4, borderBottomRightRadius: sc * 4 }} />
          </View>
          {/* Arms */}
          <View style={[styles.armL, { width: sc * 8, height: sc * 16, borderRadius: sc * 4, backgroundColor: char.bodyColor, top: sc * 3, left: -sc * 7 }]} />
          <View style={[styles.armR, { width: sc * 8, height: sc * 16, borderRadius: sc * 4, backgroundColor: char.bodyColor, top: sc * 3, right: -sc * 7 }]} />
          {/* Hand L */}
          <View style={{ position: 'absolute', width: sc * 9, height: sc * 9, borderRadius: sc * 4.5, backgroundColor: char.skinColor, top: sc * 14, left: -sc * 8 }} />
          <View style={{ position: 'absolute', width: sc * 9, height: sc * 9, borderRadius: sc * 4.5, backgroundColor: char.skinColor, top: sc * 14, right: -sc * 8 }} />
        </View>

        {/* Belt */}
        <View style={{ width: sc * 26, height: sc * 5, backgroundColor: char.bodyDark, borderRadius: sc * 2, marginTop: -sc * 2 }}>
          <View style={{ position: 'absolute', left: '40%', width: sc * 8, height: sc * 5, backgroundColor: '#FFB800', borderRadius: sc * 1.5 }} />
        </View>

        {/* Legs */}
        <View style={{ flexDirection: 'row', gap: sc * 3, marginTop: sc * 1 }}>
          {[-1, 1].map((side) => (
            <View key={side} style={{ alignItems: 'center' }}>
              <View style={{ width: sc * 10, height: sc * 16, borderRadius: sc * 4, backgroundColor: char.bodyDark, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
              {/* Shoe */}
              <View style={{ width: sc * 13, height: sc * 7, borderRadius: sc * 3.5, backgroundColor: char.shoeColor, marginTop: -sc * 2, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }}>
                <View style={{ position: 'absolute', top: sc * 1.5, left: sc * 2, width: sc * 5, height: sc * 2.5, borderRadius: sc * 1.5, backgroundColor: 'rgba(255,255,255,0.3)' }} />
              </View>
            </View>
          ))}
        </View>

      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow:    { position: 'absolute', height: 8, borderRadius: 4 },
  shieldRing:{ position: 'absolute', borderWidth: 2.5, borderColor: '#00BFFF' },
  bombWrap:  { position: 'absolute', zIndex: 10 },
  head:      { alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 4, overflow: 'hidden', zIndex: 3 },
  hair:      { position: 'absolute', top: 0 },
  eyeRow:    { flexDirection: 'row' },
  smile:     {},
  torso:     { alignItems: 'center', justifyContent: 'flex-start', paddingTop: 4, overflow: 'visible' },
  armL:      { position: 'absolute' },
  armR:      { position: 'absolute' },
});
