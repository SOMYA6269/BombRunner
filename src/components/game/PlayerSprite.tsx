import React from 'react';
import Svg, {
  Circle,
  Ellipse,
  G,
  Path,
  Rect,
} from 'react-native-svg';

import type { AnimationState, FacingDirection } from '../../game/types';

interface PlayerSpriteProps {
  size: number;
  facing: FacingDirection;
  animState: AnimationState;
  animClock: number;
  hasBomb: boolean;
}

// ── Frame calculation ──────────────────────────────────────────────────────────
function getAnimFrame(
  animState: AnimationState,
  animClock: number,
  idleDur: number,
  runDur: number,
  idleFrames: number,
  runFrames: number,
): number {
  if (animState === 'idle') {
    return Math.floor(animClock / idleDur) % idleFrames;
  }
  return Math.floor(animClock / runDur) % runFrames;
}

// ── Chibi character SVG ────────────────────────────────────────────────────────
// Drawn in a 48×56 coordinate space, centred on (24, 28)
export default function PlayerSprite({
  size,
  facing,
  animState,
  animClock,
  hasBomb,
}: PlayerSpriteProps) {
  const scale = size / 48;
  const svgW = 48;
  const svgH = 64;

  // Animation frame
  const frame = getAnimFrame(animState, animClock, 500, 110, 2, 4);

  // Body bob: idle frames bob slightly, run frames are stable
  const bodyBob = animState === 'idle' ? (frame === 0 ? 0 : 1) : 0;

  // Leg offsets for run animation
  const legOffsets: [number, number][] =
    animState === 'running'
      ? [[0, -6], [0, 0], [0, 6], [0, 0]] // left-swing, neutral, right-swing, neutral (using Y to simulate)
      : [[0, 0], [0, 0], [0, 0], [0, 0]];

  const [legDx] = legOffsets[frame] ?? [0, 0];

  const flipX = facing === 'left' ? -1 : 1;

  // Run: alternate leg X positions
  const leftLegX  = animState === 'running' ? 16 + (frame % 2 === 0 ? -5 : 3) : 16;
  const rightLegX = animState === 'running' ? 29 + (frame % 2 === 0 ? 3 : -5) : 29;
  const leftShoeX  = leftLegX  - 3;
  const rightShoeX = rightLegX - 3;

  // Arm swing
  const armSwing = animState === 'running' ? (frame % 2 === 0 ? 4 : -4) : 0;

  return (
    <Svg
      width={svgW * scale}
      height={svgH * scale}
      viewBox={`0 0 ${svgW} ${svgH}`}
    >
      <G transform={`scale(${flipX},1) translate(${flipX === -1 ? -svgW : 0},0)`}>

        {/* ── Shadow ── */}
        <Ellipse cx={24} cy={60} rx={14} ry={4} fill="rgba(0,0,0,0.2)" />

        {/* ── Legs ── */}
        <Rect
          x={leftLegX}
          y={46 + bodyBob}
          width={7}
          height={10}
          rx={3}
          fill="#3d5a99"
        />
        <Rect
          x={rightLegX}
          y={46 + bodyBob}
          width={7}
          height={10}
          rx={3}
          fill="#3d5a99"
        />

        {/* ── Shoes ── */}
        <Ellipse
          cx={leftShoeX + 5}
          cy={57 + bodyBob}
          rx={6}
          ry={4}
          fill="#cc3333"
        />
        <Ellipse
          cx={rightShoeX + 5}
          cy={57 + bodyBob}
          rx={6}
          ry={4}
          fill="#cc3333"
        />
        {/* Shoe shine */}
        <Ellipse
          cx={leftShoeX + 4}
          cy={55 + bodyBob}
          rx={3}
          ry={2}
          fill="rgba(255,255,255,0.35)"
        />
        <Ellipse
          cx={rightShoeX + 4}
          cy={55 + bodyBob}
          rx={3}
          ry={2}
          fill="rgba(255,255,255,0.35)"
        />

        {/* ── Body ── */}
        <Rect
          x={10}
          y={30 + bodyBob}
          width={28}
          height={18}
          rx={6}
          fill="#4a90e2"
        />
        {/* Body highlight */}
        <Rect
          x={13}
          y={31 + bodyBob}
          width={10}
          height={6}
          rx={3}
          fill="rgba(255,255,255,0.28)"
        />
        {/* Belt */}
        <Rect
          x={10}
          y={43 + bodyBob}
          width={28}
          height={4}
          rx={2}
          fill="#2c5f9e"
        />
        {/* Belt buckle */}
        <Rect
          x={21}
          y={43 + bodyBob}
          width={6}
          height={4}
          rx={1}
          fill="#f5c518"
        />

        {/* ── Arms ── */}
        {/* Left arm */}
        <G transform={`rotate(${-armSwing}, 10, 35)`}>
          <Rect
            x={3}
            y={30 + bodyBob}
            width={8}
            height={14}
            rx={4}
            fill="#4a90e2"
          />
          {/* Left hand */}
          <Circle cx={7} cy={45 + bodyBob} r={4} fill="#ffcba4" />
        </G>
        {/* Right arm */}
        <G transform={`rotate(${armSwing}, 38, 35)`}>
          <Rect
            x={37}
            y={30 + bodyBob}
            width={8}
            height={14}
            rx={4}
            fill="#4a90e2"
          />
          {/* Right hand */}
          <Circle cx={41} cy={45 + bodyBob} r={4} fill="#ffcba4" />
        </G>

        {/* ── Neck ── */}
        <Rect
          x={20}
          y={26 + bodyBob}
          width={8}
          height={6}
          rx={2}
          fill="#ffcba4"
        />

        {/* ── Head ── */}
        <Circle cx={24} cy={18} r={16} fill="#ffcba4" />
        {/* Head shadow underside */}
        <Path
          d="M 10 20 Q 24 34 38 20"
          fill="rgba(200,120,80,0.18)"
          stroke="none"
        />

        {/* ── Hair ── */}
        {/* Main hair */}
        <Ellipse cx={24} cy={8} rx={14} ry={8} fill="#f5c518" />
        {/* Hair bangs */}
        <Ellipse cx={14} cy={10} rx={7} ry={6} fill="#f5c518" />
        <Ellipse cx={34} cy={10} rx={7} ry={6} fill="#f5c518" />
        {/* Top spiky bits */}
        <Circle cx={20} cy={4} r={5} fill="#f5c518" />
        <Circle cx={28} cy={3} r={5} fill="#f5c518" />
        {/* Hair highlight */}
        <Ellipse cx={20} cy={7} rx={4} ry={3} fill="rgba(255,255,200,0.4)" />

        {/* ── Eyes ── */}
        {/* Eye whites */}
        <Ellipse cx={17} cy={18} rx={5} ry={5.5} fill="white" />
        <Ellipse cx={31} cy={18} rx={5} ry={5.5} fill="white" />
        {/* Iris */}
        <Circle cx={17} cy={19} r={3.5} fill="#3d85c8" />
        <Circle cx={31} cy={19} r={3.5} fill="#3d85c8" />
        {/* Pupil */}
        <Circle cx={17.5} cy={19} r={2} fill="#1a1a2a" />
        <Circle cx={31.5} cy={19} r={2} fill="#1a1a2a" />
        {/* Eye shine */}
        <Circle cx={18.5} cy={17.5} r={1} fill="white" />
        <Circle cx={32.5} cy={17.5} r={1} fill="white" />
        {/* Eyelashes / brow */}
        <Path d="M 13 13 Q 17 11 21 13" stroke="#8B6914" strokeWidth={1.2} fill="none" />
        <Path d="M 27 13 Q 31 11 35 13" stroke="#8B6914" strokeWidth={1.2} fill="none" />

        {/* ── Mouth ── */}
        {animState === 'running'
          ? <Path d="M 20 25 Q 24 28 28 25" stroke="#cc5533" strokeWidth={1.5} fill="none" />
          : <Path d="M 20 25 Q 24 27 28 25" stroke="#cc5533" strokeWidth={1.5} fill="none" />
        }

        {/* ── Cheeks ── */}
        <Ellipse cx={12} cy={21} rx={4} ry={2.5} fill="rgba(255,130,100,0.35)" />
        <Ellipse cx={36} cy={21} rx={4} ry={2.5} fill="rgba(255,130,100,0.35)" />

        {/* ── Ear ── */}
        <Circle cx={8}  cy={19} r={4} fill="#ffcba4" />
        <Circle cx={40} cy={19} r={4} fill="#ffcba4" />
        <Circle cx={8}  cy={19} r={2} fill="#f0a080" />
        <Circle cx={40} cy={19} r={2} fill="#f0a080" />

        {/* ── Bomb held above head ── */}
        {hasBomb && (
          <G>
            {/* Bomb body */}
            <Circle cx={24} cy={-6} r={9} fill="#222" />
            {/* Bomb shine */}
            <Circle cx={21} cy={-9} r={3} fill="rgba(255,255,255,0.25)" />
            {/* Fuse */}
            <Path
              d="M 24 -15 Q 28 -20 32 -17"
              stroke="#8B6914"
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
            />
            {/* Fuse spark */}
            <Circle cx={32} cy={-17} r={3} fill="#FF6B00" />
            <Circle cx={32} cy={-17} r={1.5} fill="#FFD700" />
          </G>
        )}

      </G>
    </Svg>
  );
}
