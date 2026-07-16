// GameUI — AAA competitive HUD overlay
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
  const { players, bombCountdown, notification, myDeviceId, cameraX, cameraY, fps } = state;

  const alive       = players.filter(p => p.isAlive).sort((a, b) => b.score - a.score);
  const deadCount   = players.length - alive.length;
  const bombHolder  = players.find(p => p.hasBomb && p.isAlive);
  const me          = players.find(p => p.deviceId === myDeviceId);

  const timerSecs   = Math.ceil(Math.max(0, bombCountdown));
  const timerMins   = Math.floor(timerSecs / 60);
  const timerSecPart= timerSecs % 60;
  const timerDisplay= `${String(timerMins).padStart(2,'0')}:${String(timerSecPart).padStart(2,'0')}`;
  const isDanger    = bombCountdown <= 8;
  const isCritical  = bombCountdown <= 4;

  const timerColor  = isCritical ? '#FF3D00' : isDanger ? '#FFB800' : '#FFFFFF';

  return (
    <View style={styles.root} pointerEvents="box-none">

      {/* ── TOP ROW ── */}
      <View style={styles.topRow} pointerEvents="box-none">

        {/* LEFT: Player standings */}
        <View style={styles.standingsPanel}>
          <View style={styles.standingsHeader}>
            <Text style={styles.aliveCount}>👥</Text>
            <Text style={styles.aliveNum}>{alive.length}</Text>
            <Text style={styles.aliveLabel}> ALIVE</Text>
          </View>
          {alive.slice(0, 6).map((p, i) => {
            const char = CHARACTERS[p.characterId];
            const isMe = p.deviceId === myDeviceId;
            return (
              <View key={p.deviceId} style={[styles.rankRow, isMe && styles.rankRowMe]}>
                <Text style={[styles.rankNum, i < 3 && styles.rankNumTop]}>{i + 1}</Text>
                <View style={[styles.charDot, { backgroundColor: char.bodyColor, borderColor: char.bodyColor + 'AA' }]} />
                <Text style={[styles.rankName, isMe && styles.rankNameMe]} numberOfLines={1}>{p.username}</Text>
                {p.hasBomb && (
                  <View style={styles.bombTag}>
                    <Text style={styles.bombTagText}>💣</Text>
                  </View>
                )}
              </View>
            );
          })}
          {deadCount > 0 && (
            <Text style={styles.elimCount}>💀 {deadCount} eliminated</Text>
          )}
        </View>

        {/* CENTRE: Timer + bomb holder */}
        <View style={styles.timerCol} pointerEvents="none">
          <View style={[styles.timerPanel, isCritical && styles.timerPanelCrit, isDanger && !isCritical && styles.timerPanelWarn]}>
            <Text style={styles.timerIcon}>{isCritical ? '💥' : '⏱'}</Text>
            <Text style={[styles.timerDisplay, { color: timerColor }]}>{timerDisplay}</Text>
          </View>
          {bombHolder && (
            <View style={styles.holderChip}>
              <Text style={styles.holderIcon}>💣</Text>
              <Text style={styles.holderName} numberOfLines={1}>{bombHolder.username}</Text>
            </View>
          )}
        </View>

        {/* RIGHT: Minimap + stats */}
        <View style={styles.rightHud}>
          <View style={styles.hudTopRow}>
            <View style={styles.statChip}>
              <Text style={styles.statChipText}>📶 {me?.ping ?? 0}ms</Text>
            </View>
            <Text style={styles.fpsText}>{fps}fps</Text>
            <Pressable style={styles.pauseBtn} onPress={onPause}>
              <Text style={styles.pauseIcon}>⏸</Text>
            </Pressable>
          </View>
          <View style={styles.minimapWrap}>
            <MiniMap
              players={players}
              myDeviceId={myDeviceId}
              cameraX={cameraX} cameraY={cameraY}
              viewW={VIEWPORT_W} viewH={VIEWPORT_H}
            />
          </View>
        </View>
      </View>

      {/* ── BOMB WARNING banner ── */}
      {me?.hasBomb && (
        <View style={styles.bombWarning} pointerEvents="none">
          <View style={styles.bombWarningInner}>
            <Text style={styles.bombWarningIcon}>💣</Text>
            <View>
              <Text style={styles.bombWarningTitle}>YOU HOLD THE BOMB!</Text>
              <Text style={styles.bombWarningSub}>Bump into someone to pass it</Text>
            </View>
          </View>
        </View>
      )}

      {/* ── CENTRE NOTIFICATION ── */}
      {notification && (
        <View style={styles.notification} pointerEvents="none">
          <View style={styles.notifInner}>
            <Text style={styles.notifText}>{notification}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

export const GameUI = memo(GameUIInner);

const C = {
  bg: '#080E1C', panel: '#0F1E3A', panelB: '#162947',
  gold: '#FFB800', border: 'rgba(255,255,255,0.09)',
  txt: '#FFFFFF', muted: 'rgba(255,255,255,0.5)', dim: 'rgba(255,255,255,0.28)',
  blue: '#3B82F6', red: '#EF4444',
};

const styles = StyleSheet.create({
  root:    { position: 'absolute', top: 0, left: 0, width: VIEWPORT_W, height: VIEWPORT_H },

  /* TOP ROW */
  topRow:  { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 6, paddingTop: 4, gap: 4 },

  /* Standings panel */
  standingsPanel: { width: 110, backgroundColor: 'rgba(8,14,28,0.85)', borderRadius: 12, padding: 6, gap: 3, borderWidth: 1, borderColor: C.border },
  standingsHeader:{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  aliveCount:     { fontSize: 12 },
  aliveNum:       { color: C.gold, fontWeight: '900', fontSize: 14 },
  aliveLabel:     { color: C.muted, fontSize: 9, fontWeight: '700' },
  rankRow:        { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 1 },
  rankRowMe:      { backgroundColor: 'rgba(59,130,246,0.15)', borderRadius: 5, paddingHorizontal: 3 },
  rankNum:        { color: C.dim, fontSize: 9, fontWeight: '900', width: 12 },
  rankNumTop:     { color: C.gold },
  charDot:        { width: 8, height: 8, borderRadius: 4, borderWidth: 1 },
  rankName:       { flex: 1, color: C.txt, fontSize: 8.5, fontWeight: '700' },
  rankNameMe:     { color: C.blue },
  bombTag:        { backgroundColor: '#EF4444', borderRadius: 4, paddingHorizontal: 3 },
  bombTagText:    { fontSize: 8 },
  elimCount:      { color: C.dim, fontSize: 7.5, fontWeight: '600', marginTop: 2 },

  /* Timer */
  timerCol:        { flex: 1, alignItems: 'center', gap: 4 },
  timerPanel:      { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(8,14,28,0.85)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: C.border },
  timerPanelWarn:  { borderColor: 'rgba(255,184,0,0.5)' },
  timerPanelCrit:  { borderColor: 'rgba(239,68,68,0.6)', backgroundColor: 'rgba(239,68,68,0.1)' },
  timerIcon:       { fontSize: 14 },
  timerDisplay:    { fontWeight: '900', fontSize: 22, fontVariant: ['tabular-nums'] as unknown as string[] },
  holderChip:      { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(239,68,68,0.15)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: 'rgba(239,68,68,0.4)' },
  holderIcon:      { fontSize: 12 },
  holderName:      { color: '#EF4444', fontWeight: '900', fontSize: 10, maxWidth: 90 },

  /* Right HUD */
  rightHud:   { alignItems: 'flex-end', gap: 5 },
  hudTopRow:  { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statChip:   { backgroundColor: 'rgba(8,14,28,0.85)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: C.border },
  statChipText: { color: C.muted, fontSize: 9, fontWeight: '700' },
  fpsText:    { color: C.dim, fontSize: 9, fontWeight: '700' },
  pauseBtn:   { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(8,14,28,0.85)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  pauseIcon:  { fontSize: 13 },
  minimapWrap:{ width: 86, height: 86, borderRadius: 10, overflow: 'hidden', borderWidth: 1.5, borderColor: 'rgba(255,184,0,0.3)' },

  /* Bomb warning */
  bombWarning:      { alignItems: 'center', marginTop: 4 },
  bombWarningInner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(239,68,68,0.2)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 7, borderWidth: 1.5, borderColor: 'rgba(239,68,68,0.5)' },
  bombWarningIcon:  { fontSize: 22 },
  bombWarningTitle: { color: '#EF4444', fontWeight: '900', fontSize: 13, letterSpacing: 1 },
  bombWarningSub:   { color: 'rgba(239,68,68,0.7)', fontSize: 9, fontWeight: '600' },

  /* Notification */
  notification:  { position: 'absolute', top: '38%', left: 0, right: 0, alignItems: 'center' },
  notifInner:    { backgroundColor: 'rgba(8,14,28,0.9)', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(255,184,0,0.35)' },
  notifText:     { color: C.gold, fontWeight: '900', fontSize: 14, letterSpacing: 1 },
});
