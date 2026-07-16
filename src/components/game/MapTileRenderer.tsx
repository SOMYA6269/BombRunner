import React from 'react';
import Svg, {
  Circle,
  Ellipse,
  G,
  Path,
  Rect,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import { View } from 'react-native';

import type { MapDecoration, MapTile } from '../../game/types';

// ─── Single collision tile (wall / crate) ─────────────────────────────────────
export function TileView({ tile }: { tile: MapTile }) {
  const { x, y, w, h } = tile.rect;

  if (tile.type === 'wall') {
    return (
      <View
        style={{
          position: 'absolute',
          left: x, top: y, width: w, height: h,
        }}
      >
        <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
          {/* Base stone */}
          <Rect x={0} y={0} width={w} height={h} fill="#607d8b" rx={4} />
          {/* Top highlight */}
          <Rect x={2} y={2} width={w - 4} height={6} fill="#90a4ae" rx={2} />
          {/* Bottom shadow */}
          <Rect x={0} y={h - 6} width={w} height={6} fill="#37474f" rx={2} />
          {/* Left shadow */}
          <Rect x={0} y={2} width={6} height={h - 8} fill="#455a64" />
          {/* Stone joints */}
          {w >= 128 && <Rect x={Math.floor(w / 2)} y={0} width={3} height={h} fill="#455a64" opacity={0.5} />}
          {h >= 128 && <Rect x={0} y={Math.floor(h / 2)} width={w} height={3} fill="#455a64" opacity={0.5} />}
        </Svg>
      </View>
    );
  }

  // Wooden crate
  return (
    <View style={{ position: 'absolute', left: x, top: y, width: w, height: h }}>
      <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <Rect x={0} y={0} width={w} height={h} fill="#8d6534" rx={5} />
        {/* Wood grain lines */}
        <Rect x={0} y={h * 0.3} width={w} height={3} fill="#6b4c24" opacity={0.6} />
        <Rect x={0} y={h * 0.65} width={w} height={3} fill="#6b4c24" opacity={0.6} />
        <Rect x={w * 0.3} y={0} width={3} height={h} fill="#6b4c24" opacity={0.6} />
        <Rect x={w * 0.65} y={0} width={3} height={h} fill="#6b4c24" opacity={0.6} />
        {/* Metal corners */}
        <Rect x={0} y={0} width={8} height={8} fill="#a0856e" />
        <Rect x={w - 8} y={0} width={8} height={8} fill="#a0856e" />
        <Rect x={0} y={h - 8} width={8} height={8} fill="#a0856e" />
        <Rect x={w - 8} y={h - 8} width={8} height={8} fill="#a0856e" />
        {/* Top shine */}
        <Rect x={4} y={4} width={w - 8} height={5} fill="rgba(255,220,160,0.25)" rx={2} />
      </Svg>
    </View>
  );
}

// ─── All collision tiles ───────────────────────────────────────────────────────
const AllTiles = React.memo(function AllTiles({ tiles }: { tiles: MapTile[] }) {
  return (
    <>
      {tiles.map((tile, i) => (
        <TileView key={i} tile={tile} />
      ))}
    </>
  );
});

// ─── Decoration components ─────────────────────────────────────────────────────

function TreeDeco({ x, y, scale = 1, variant = 0 }: { x: number; y: number; scale?: number; variant?: number }) {
  const trunkColors = ['#795548', '#6d4c41', '#8d6e63'];
  const leafColors  = [['#43a047', '#2e7d32', '#81c784'], ['#558b2f', '#33691e', '#9ccc65'], ['#00695c', '#004d40', '#4db6ac']];
  const tc  = trunkColors[variant % 3];
  const lcs = leafColors[variant % 3];
  const s = scale;
  const w = 64 * s;
  const h = 80 * s;
  return (
    <View style={{ position: 'absolute', left: x - w / 2, top: y - h * 0.8, width: w, height: h, pointerEvents: 'none' }}>
      <Svg width={w} height={h} viewBox="0 0 64 80">
        {/* Shadow */}
        <Ellipse cx={32} cy={77} rx={18} ry={5} fill="rgba(0,0,0,0.15)" />
        {/* Trunk */}
        <Rect x={26} y={52} width={12} height={22} rx={4} fill={tc} />
        {/* Roots bump */}
        <Ellipse cx={24} cy={68} rx={6} ry={4} fill={tc} />
        <Ellipse cx={40} cy={68} rx={6} ry={4} fill={tc} />
        {/* Back leaf shadow */}
        <Circle cx={32} cy={34} r={24} fill={lcs[1]} />
        {/* Main canopy */}
        <Circle cx={32} cy={30} r={22} fill={lcs[0]} />
        {/* Side puffs */}
        <Circle cx={16} cy={38} r={14} fill={lcs[0]} />
        <Circle cx={48} cy={38} r={14} fill={lcs[0]} />
        {/* Top puff */}
        <Circle cx={32} cy={16} r={14} fill={lcs[0]} />
        {/* Highlights */}
        <Circle cx={26} cy={20} r={8} fill={lcs[2]} opacity={0.6} />
        <Circle cx={20} cy={32} r={5} fill={lcs[2]} opacity={0.4} />
        {/* Outline shadow ring */}
        <Circle cx={32} cy={30} r={23} fill="none" stroke={lcs[1]} strokeWidth={2} />
      </Svg>
    </View>
  );
}

function BushDeco({ x, y, scale = 1, variant = 0 }: { x: number; y: number; scale?: number; variant?: number }) {
  const colors = [
    ['#66bb6a', '#388e3c', '#a5d6a7'],
    ['#26a69a', '#00695c', '#80cbc4'],
    ['#8bc34a', '#558b2f', '#c5e1a5'],
  ];
  const [main, dark, light] = colors[variant % 3];
  const s = scale;
  const w = 48 * s;
  const h = 32 * s;
  return (
    <View style={{ position: 'absolute', left: x - w / 2, top: y - h * 0.7, width: w, height: h, pointerEvents: 'none' }}>
      <Svg width={w} height={h} viewBox="0 0 48 32">
        <Ellipse cx={24} cy={30} rx={20} ry={4} fill="rgba(0,0,0,0.12)" />
        <Circle cx={12} cy={20} r={12} fill={dark} />
        <Circle cx={36} cy={20} r={12} fill={dark} />
        <Circle cx={24} cy={14} r={14} fill={main} />
        <Circle cx={10} cy={16} r={10} fill={main} />
        <Circle cx={38} cy={16} r={10} fill={main} />
        <Circle cx={20} cy={10} r={6} fill={light} opacity={0.5} />
      </Svg>
    </View>
  );
}

function RockDeco({ x, y, scale = 1, variant = 0 }: { x: number; y: number; scale?: number; variant?: number }) {
  const fills = ['#90a4ae', '#78909c', '#b0bec5'];
  const fill = fills[variant % 3];
  const s = scale;
  const w = 40 * s;
  const h = 28 * s;
  return (
    <View style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, pointerEvents: 'none' }}>
      <Svg width={w} height={h} viewBox="0 0 40 28">
        <Ellipse cx={20} cy={26} rx={16} ry={4} fill="rgba(0,0,0,0.15)" />
        <Path d="M 6 22 Q 2 14 8 8 Q 14 2 22 4 Q 32 2 36 10 Q 40 18 34 22 Z" fill={fill} />
        <Path d="M 8 12 Q 16 6 26 8 Q 32 10 34 16" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={2} />
        <Ellipse cx={14} cy={10} rx={5} ry={3} fill="rgba(255,255,255,0.2)" />
      </Svg>
    </View>
  );
}

function WaterDeco({ x, y, scale = 1, variant = 0 }: { x: number; y: number; scale?: number; variant?: number }) {
  const baseColors = ['#29b6f6', '#0288d1', '#4fc3f7'];
  const [mid, dark, light] = [baseColors[0], baseColors[1], baseColors[2]];
  const offset = variant * 20;
  const s = scale;
  const w = 96 * s;
  const h = 64 * s;
  return (
    <View style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, pointerEvents: 'none' }}>
      <Svg width={w} height={h} viewBox="0 0 96 64">
        <Defs>
          <LinearGradient id={`wg${variant}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={light} stopOpacity={0.9} />
            <Stop offset="1" stopColor={dark} stopOpacity={0.95} />
          </LinearGradient>
        </Defs>
        {/* Water body */}
        <Ellipse cx={48} cy={32} rx={44} ry={28} fill={`url(#wg${variant})`} />
        {/* Edge darkening */}
        <Ellipse cx={48} cy={32} rx={44} ry={28} fill="none" stroke={dark} strokeWidth={3} opacity={0.4} />
        {/* Ripples */}
        <Ellipse cx={48} cy={32} rx={28} ry={14} fill="none" stroke={light} strokeWidth={2} opacity={0.5} />
        <Ellipse cx={36 + offset * 0.05} cy={28} rx={10} ry={4} fill="none" stroke="white" strokeWidth={1.5} opacity={0.4} />
        <Ellipse cx={60} cy={38} rx={8} ry={3} fill="none" stroke="white" strokeWidth={1.5} opacity={0.4} />
        {/* Shine */}
        <Ellipse cx={36} cy={22} rx={12} ry={5} fill="rgba(255,255,255,0.3)" />
      </Svg>
    </View>
  );
}

function LadderDeco({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  const s = scale;
  const w = 28 * s;
  const h = 64 * s;
  return (
    <View style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, pointerEvents: 'none' }}>
      <Svg width={w} height={h} viewBox="0 0 28 64">
        {/* Side rails */}
        <Rect x={4} y={2} width={5} height={60} rx={2} fill="#795548" />
        <Rect x={19} y={2} width={5} height={60} rx={2} fill="#795548" />
        {/* Rungs */}
        {[8, 18, 28, 38, 48, 58].map((ry, i) => (
          <Rect key={i} x={4} y={ry} width={20} height={4} rx={1} fill="#a1887f" />
        ))}
        {/* Rail shine */}
        <Rect x={5} y={2} width={2} height={60} rx={1} fill="rgba(255,220,180,0.3)" />
        <Rect x={20} y={2} width={2} height={60} rx={1} fill="rgba(255,220,180,0.3)" />
      </Svg>
    </View>
  );
}

function FlowerDeco({ x, y, scale = 1, variant = 0 }: { x: number; y: number; scale?: number; variant?: number }) {
  const petalColors = ['#f06292', '#ffb74d', '#ce93d8'];
  const col = petalColors[variant % 3];
  const s = scale;
  const sz = 20 * s;
  return (
    <View style={{ position: 'absolute', left: x - sz / 2, top: y - sz / 2, width: sz, height: sz, pointerEvents: 'none' }}>
      <Svg width={sz} height={sz} viewBox="0 0 20 20">
        {/* Stem */}
        <Rect x={9} y={12} width={2} height={7} rx={1} fill="#66bb6a" />
        {/* Petals */}
        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
          <Ellipse
            key={i}
            cx={10 + Math.cos((angle * Math.PI) / 180) * 5}
            cy={9 + Math.sin((angle * Math.PI) / 180) * 5}
            rx={3}
            ry={2}
            fill={col}
            transform={`rotate(${angle}, ${10 + Math.cos((angle * Math.PI) / 180) * 5}, ${9 + Math.sin((angle * Math.PI) / 180) * 5})`}
          />
        ))}
        {/* Centre */}
        <Circle cx={10} cy={9} r={3} fill="#ffd600" />
        <Circle cx={10} cy={9} r={1.5} fill="#ff8f00" />
      </Svg>
    </View>
  );
}

function BridgeDeco({ x, y, scale = 1, vertical = false }: { x: number; y: number; scale?: number; vertical?: boolean }) {
  const s = scale;
  const w = vertical ? 32 * s : 80 * s;
  const h = vertical ? 80 * s : 32 * s;
  const vb = vertical ? '0 0 32 80' : '0 0 80 32';
  return (
    <View style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, pointerEvents: 'none' }}>
      <Svg width={w} height={h} viewBox={vb}>
        {vertical ? (
          <>
            <Rect x={4} y={0} width={24} height={80} fill="#8d6534" />
            {[8, 20, 32, 44, 56, 68].map((py, i) => (
              <Rect key={i} x={4} y={py} width={24} height={8} fill="#a07840" />
            ))}
            {[8, 20, 32, 44, 56, 68].map((py, i) => (
              <Rect key={`s${i}`} x={4} y={py + 7} width={24} height={1} fill="#6b4c24" />
            ))}
            <Rect x={4} y={2} width={6} height={76} rx={1} fill="rgba(255,220,160,0.2)" />
          </>
        ) : (
          <>
            <Rect x={0} y={4} width={80} height={24} fill="#8d6534" />
            {[4, 16, 28, 40, 52, 64].map((px, i) => (
              <Rect key={i} x={px} y={4} width={8} height={24} fill="#a07840" />
            ))}
            {[4, 16, 28, 40, 52, 64].map((px, i) => (
              <Rect key={`s${i}`} x={px + 7} y={4} width={1} height={24} fill="#6b4c24" />
            ))}
            <Rect x={2} y={4} width={76} height={6} rx={1} fill="rgba(255,220,160,0.2)" />
          </>
        )}
      </Svg>
    </View>
  );
}

function SignDeco({ x, y, variant = 0 }: { x: number; y: number; variant?: number }) {
  const texts = ['⚠', '🏁'];
  const bgColors = ['#ffca28', '#e53935'];
  const bg = bgColors[variant % 2];
  return (
    <View style={{ position: 'absolute', left: x - 16, top: y - 32, width: 32, height: 40, pointerEvents: 'none' }}>
      <Svg width={32} height={40} viewBox="0 0 32 40">
        {/* Post */}
        <Rect x={14} y={24} width={4} height={16} rx={1} fill="#795548" />
        {/* Board */}
        <Rect x={2} y={2} width={28} height={22} rx={4} fill={bg} />
        <Rect x={2} y={2} width={28} height={6} rx={2} fill="rgba(255,255,255,0.25)" />
      </Svg>
    </View>
  );
}

// ─── Grass floor ───────────────────────────────────────────────────────────────
export const GrassFloor = React.memo(function GrassFloor({
  mapW, mapH, border,
}: { mapW: number; mapH: number; border: number }) {
  // Tile the grass pattern in chunks to avoid one massive SVG
  const CHUNK = 512;
  const cols = Math.ceil((mapW - border * 2) / CHUNK);
  const rows = Math.ceil((mapH - border * 2) / CHUNK);

  return (
    <>
      {/* Base green */}
      <View style={{
        position: 'absolute',
        left: border, top: border,
        width: mapW - border * 2, height: mapH - border * 2,
        backgroundColor: '#4caf50',
      }} />
      {/* Grass texture chunks */}
      {Array.from({ length: rows }, (_, row) =>
        Array.from({ length: cols }, (_, col) => {
          const cx = border + col * CHUNK;
          const cy = border + row * CHUNK;
          const cw = Math.min(CHUNK, mapW - border - cx);
          const ch = Math.min(CHUNK, mapH - border - cy);
          return (
            <View key={`g${row}-${col}`} style={{ position: 'absolute', left: cx, top: cy, width: cw, height: ch }}>
              <Svg width={cw} height={ch} viewBox={`0 0 ${cw} ${ch}`}>
                {/* Darker grass base variation */}
                <Rect x={0} y={0} width={cw} height={ch} fill="#388e3c" opacity={0.18} />
                {/* Grass blades scattered */}
                {Array.from({ length: 32 }, (_, i) => {
                  const gx = ((i * 137 + col * 31 + row * 17) % cw);
                  const gy = ((i * 97 + col * 43 + row * 29) % ch);
                  const dark = (i + col + row) % 3 === 0;
                  return (
                    <Path
                      key={i}
                      d={`M ${gx} ${gy + 6} Q ${gx + 2} ${gy} ${gx + 4} ${gy + 6}`}
                      fill={dark ? '#2e7d32' : '#66bb6a'}
                      opacity={0.55}
                    />
                  );
                })}
              </Svg>
            </View>
          );
        })
      )}
    </>
  );
});

// ─── All decorations (memoised) ────────────────────────────────────────────────
const AllDecorations = React.memo(function AllDecorations({ decorations }: { decorations: MapDecoration[] }) {
  return (
    <>
      {decorations.map((d, i) => {
        switch (d.type) {
          case 'tree':     return <TreeDeco   key={i} x={d.x} y={d.y} scale={d.scale} variant={d.variant} />;
          case 'bush':     return <BushDeco   key={i} x={d.x} y={d.y} scale={d.scale} variant={d.variant} />;
          case 'rock':     return <RockDeco   key={i} x={d.x} y={d.y} scale={d.scale} variant={d.variant} />;
          case 'water':    return <WaterDeco  key={i} x={d.x} y={d.y} scale={d.scale} variant={d.variant} />;
          case 'ladder':   return <LadderDeco key={i} x={d.x} y={d.y} scale={d.scale} />;
          case 'flower':   return <FlowerDeco key={i} x={d.x} y={d.y} scale={d.scale} variant={d.variant} />;
          case 'bridge_h': return <BridgeDeco key={i} x={d.x} y={d.y} scale={d.scale} vertical={false} />;
          case 'bridge_v': return <BridgeDeco key={i} x={d.x} y={d.y} scale={d.scale} vertical />;
          case 'sign':     return <SignDeco   key={i} x={d.x} y={d.y} variant={d.variant} />;
          default:         return null;
        }
      })}
    </>
  );
});

// ─── BombWorldSprite ──────────────────────────────────────────────────────────
export function BombWorldSprite({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      {/* Shadow */}
      <Ellipse cx={16} cy={29} rx={10} ry={4} fill="rgba(0,0,0,0.2)" />
      {/* Body */}
      <Circle cx={16} cy={16} r={12} fill="#1a1a1a" />
      <Circle cx={12} cy={11} r={4} fill="rgba(255,255,255,0.2)" />
      {/* Fuse */}
      <Path d="M 16 4 Q 22 -2 28 2" stroke="#8d6534" strokeWidth={2.5} fill="none" strokeLinecap="round" />
      {/* Spark */}
      <Circle cx={28} cy={2} r={4} fill="#FF6B00" />
      <Circle cx={28} cy={2} r={2} fill="#FFD700" />
    </Svg>
  );
}

// ─── Exports ──────────────────────────────────────────────────────────────────
export { AllTiles, AllDecorations };
