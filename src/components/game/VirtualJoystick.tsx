import React, { useRef } from 'react';
import { Animated, PanResponder, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { JOYSTICK_BASE_RADIUS, JOYSTICK_DEADZONE, JOYSTICK_KNOB_RADIUS } from '../../game/constants';
import type { JoystickRef } from './GameCanvas';

interface VirtualJoystickProps {
  joystickRef: React.RefObject<JoystickRef>;
}

const BASE = JOYSTICK_BASE_RADIUS;
const KNOB = JOYSTICK_KNOB_RADIUS;
const MAX_DIST = BASE - KNOB - 4;

export default function VirtualJoystick({ joystickRef }: VirtualJoystickProps) {
  const knobAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gs) => {
        const dx = gs.dx;
        const dy = gs.dy;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len === 0) return;
        const clampLen = Math.min(len, MAX_DIST);
        const nx = dx / len;
        const ny = dy / len;
        knobAnim.setValue({ x: nx * clampLen, y: ny * clampLen });
        if (joystickRef.current) {
          if (clampLen / MAX_DIST > JOYSTICK_DEADZONE) {
            joystickRef.current.x = nx;
            joystickRef.current.y = ny;
          } else {
            joystickRef.current.x = 0;
            joystickRef.current.y = 0;
          }
        }
      },
      onPanResponderEnd: () => {
        knobAnim.setValue({ x: 0, y: 0 });
        if (joystickRef.current) { joystickRef.current.x = 0; joystickRef.current.y = 0; }
      },
      onPanResponderTerminate: () => {
        knobAnim.setValue({ x: 0, y: 0 });
        if (joystickRef.current) { joystickRef.current.x = 0; joystickRef.current.y = 0; }
      },
    }),
  ).current;

  const D = BASE * 2;

  return (
    <View style={[styles.base, { width: D, height: D, borderRadius: BASE }]} {...panResponder.panHandlers}>
      {/* SVG decorative base ring */}
      <Svg width={D} height={D} viewBox={`0 0 ${D} ${D}`} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="bg" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
            <Stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
          </RadialGradient>
        </Defs>
        <Circle cx={BASE} cy={BASE} r={BASE - 1} fill="url(#bg)" stroke="rgba(255,255,255,0.35)" strokeWidth={2.5} />
        {/* Direction indicators */}
        <Circle cx={BASE} cy={10}           r={4} fill="rgba(255,255,255,0.35)" />
        <Circle cx={BASE} cy={D - 10}       r={4} fill="rgba(255,255,255,0.35)" />
        <Circle cx={10}          cy={BASE}  r={4} fill="rgba(255,255,255,0.35)" />
        <Circle cx={D - 10}      cy={BASE}  r={4} fill="rgba(255,255,255,0.35)" />
        {/* Inner ring */}
        <Circle cx={BASE} cy={BASE} r={BASE * 0.45} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={1.5} strokeDasharray="4 4" />
      </Svg>

      {/* Animated knob */}
      <Animated.View
        style={[
          styles.knob,
          { width: KNOB * 2, height: KNOB * 2, borderRadius: KNOB },
          { transform: [{ translateX: knobAnim.x }, { translateY: knobAnim.y }] },
        ]}
      >
        <Svg width={KNOB * 2} height={KNOB * 2} viewBox={`0 0 ${KNOB * 2} ${KNOB * 2}`} style={StyleSheet.absoluteFill}>
          <Defs>
            <RadialGradient id="knob" cx="40%" cy="35%" r="60%">
              <Stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
              <Stop offset="60%" stopColor="rgba(200,220,255,0.75)" />
              <Stop offset="100%" stopColor="rgba(120,160,220,0.85)" />
            </RadialGradient>
          </Defs>
          <Circle cx={KNOB} cy={KNOB} r={KNOB - 1} fill="url(#knob)" stroke="rgba(100,160,255,0.6)" strokeWidth={2} />
          <Circle cx={KNOB * 0.65} cy={KNOB * 0.6} r={KNOB * 0.28} fill="rgba(255,255,255,0.55)" />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  knob: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
