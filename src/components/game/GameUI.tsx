// GameUI — HUD overlay (rankings, timer, minimap, notifications)
import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MiniMap } from './MiniMap';
import type { LocalGameState } from '@/lib/gameStore';
import { CHARACTERS } from '@/game/characters';
import { VIEWPORT_W, VIEWPORT_H } from '@/game/constants';

interface Props {
  state: LocalGameState;
  onPause: () => void;
}

function GameUIInner({ state, onPause }: Props) {
  const {
    players, bombCountdown, notification, myDeviceId,
    cameraX, cameraY, fps,
  } = state;

  const alive = players.filter(p => p.isAlive).sort((a, b) => b.score - a.score);
  const deadCount = players.length - alive.length;
  const bombHolder = players.find(p => p.hasBomb && p.isAlive);
  const me = players.find(p => p.deviceId === myDeviceId);

  // Timer color
  const timerColor = bombCountdown > 10 ? '#fff' : bombCountdown > 5 ? '#FFB800' : '#EF4444';
  const timerSecs = Math.ceil(Math.max(0, bombCountdown));
  const timerDisplay = `${String(Math.floor(timerSecs / 60)).padStart(2, '0')}:${String(timerSecs % 60).padStart(2, '0')}`;

  return (
    <View style={styles.root} pointerEvents="box-none">
      {/* ── TOP ROW ── */}
      <View style={styles.topRow} pointerEvents="box-none">
        {/* Left: Rankings */}
        <View style={styles.rankPanel}>
          <Text style={styles.rankTitle}>👥 {alive.length} ALIVE</Text>
          {alive.slice(0, 5).map((p, i) => {
            const char = CHARACTERS[p.characterId];
            return (
              <View key={p.deviceId} style={[styles.rankRow, p.deviceId === myDeviceId && styles.rankRowMe]}>
                <Text style={styles.rankNum}>{i + 1}</Text>
                <View style={[styles.rankDot, { backgroundColor: char.bodyColor }]} />
                <Text style={styles.rankName} numberOfLines={1}>{p.username}</Text>
                {p.hasBomb && <Text style={styles.bombTag}>💣</Text>}
              </View>
            );
          })}
          {deadCount > 0 && (
            <Text style={styles.deadCount}>💀 {deadCount} eliminated</Text>
          )}
        </View>

        {/* Centre: Timer */}
        <View style={styles.timerWrap}>
          <View style={[styles.timerBox, bombCountdown <= 5 && styles.timerBoxDanger]}>
            <Text style={styles.timerIcon}>⏱</Text>
            <Text style={[styles.timerText, { color: timerColor }]}>{timerDisplay}</Text>
          </View>
          {bombHolder && (
            <Text style={styles.bombHolderLabel}>💣 {bombHolder.username}</Text>
          )}
        </View>

        {/* Right: Minimap + ping + settings */}
        <View style={styles.rightPanel}>
          <View style={styles.topRightIcons}>
            <Text style={styles.pingText}>📶 {me?.ping ?? 0}ms</Text>
            <Pressable style={styles.settingsBtn} onPress={onPause}>
              <Text style={styles.settingsIcon}>⚙️</Text>
            </Pressable>
          </View>
          <MiniMap
            players={players}
            myDeviceId={myDeviceId}
            cameraX={cameraX} cameraY={cameraY}
            viewW={VIEWPORT_W} viewH={VIEWPORT_H}
          />
          <Text style={styles.fpsText}>{fps} FPS</Text>
        </View>
      </View>

      {/* ── BOMB WARNING (me has bomb) ── */}
      {me?.hasBomb && (
        <View style={styles.bombWarning}>
          <Text style={styles.bombWarningText}>💣 YOU HAVE THE BOMB!</Text>
          <Text style={styles.bombWarningSub}>Touch another player to pass it!</Text>
        </View>
      )}

      {/* ── CENTRE NOTIFICATION ── */}
      {notification && (
        <View style={styles.notification} pointerEvents="none">
          <Text style={styles.notificationText}>{notification}</Text>
        </View>
      )}
    </View>
  );
}

export const GameUI = memo(GameUIInner);

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, zIndex: 5 },
  // Top row
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 8, paddingTop: 6 },
  // Rankings
  rankPanel: { width: 130, backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: 10, padding: 7, gap: 3, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  rankTitle: { color: '#FFB800', fontSize: 10, fontWeight: '900', marginBottom: 2 },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rankRowMe: { backgroundColor: 'rgba(255,184,0,0.15)', borderRadius: 4, paddingHorizontal: 2 },
  rankNum: { color: 'rgba(255,255,255,0.5)', fontSize: 9, fontWeight: '700', width: 12 },
  rankDot: { width: 8, height: 8, borderRadius: 4 },
  rankName: { flex: 1, color: '#fff', fontSize: 9, fontWeight: '700' },
  bombTag: { fontSize: 10 },
  deadCount: { color: 'rgba(255,255,255,0.4)', fontSize: 8, marginTop: 2 },
  // Timer
  timerWrap: { alignItems: 'center', gap: 4 },
  timerBox: { backgroundColor: 'rgba(0,0,0,0.75)', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' },
  timerBoxDanger: { borderColor: '#EF4444', backgroundColor: 'rgba(239,68,68,0.2)' },
  timerIcon: { fontSize: 16 },
  timerText: { fontSize: 28, fontWeight: '900', fontVariant: ['tabular-nums'] },
  bombHolderLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 10, fontWeight: '700', backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  // Right
  rightPanel: { alignItems: 'flex-end', gap: 4 },
  topRightIcons: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pingText: { color: 'rgba(255,255,255,0.6)', fontSize: 9, fontWeight: '700' },
  settingsBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  settingsIcon: { fontSize: 14 },
  fpsText: { color: 'rgba(255,255,255,0.35)', fontSize: 8 },
  // Bomb warning
  bombWarning: { position: 'absolute', top: 80, left: 0, right: 0, alignItems: 'center' },
  bombWarningText: { color: '#FF3D00', fontSize: 18, fontWeight: '900', textShadowColor: '#000', textShadowRadius: 8 },
  bombWarningSub: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '700' },
  // Notification
  notification: { position: 'absolute', bottom: 120, left: 0, right: 0, alignItems: 'center' },
  notificationText: { color: '#FFB800', fontSize: 15, fontWeight: '900', backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,184,0,0.4)' },
});
