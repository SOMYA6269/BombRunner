import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface GameUIProps {
  timerSeconds: number;
  bombPickedUp: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  onPause: () => void;
  onResume: () => void;
}

export default function GameUI({
  timerSeconds, bombPickedUp, isPaused, isGameOver, onPause, onResume,
}: GameUIProps) {
  const urgent = bombPickedUp && timerSeconds <= 5;
  const timerColor = urgent ? '#FF3333' : timerSeconds <= 10 ? '#FF9933' : '#FFFFFF';
  const timerBg = urgent ? 'rgba(180,0,0,0.85)' : timerSeconds <= 10 ? 'rgba(150,80,0,0.8)' : 'rgba(0,0,0,0.55)';

  return (
    <>
      {/* ── Top HUD ── */}
      <View style={styles.hud} pointerEvents="box-none">
        {/* Left: player badge */}
        <View style={styles.playerBadge}>
          <View style={styles.avatarDot} />
          <Text style={styles.playerName}>P1</Text>
        </View>

        {/* Center: bomb timer */}
        <View style={styles.timerWrap}>
          {bombPickedUp && (
            <View style={[styles.timerPill, { backgroundColor: timerBg }]}>
              <Text style={styles.timerBomb}>💣</Text>
              <Text style={[styles.timerCount, { color: timerColor }]}>{timerSeconds}</Text>
              <Text style={[styles.timerSec, { color: timerColor }]}>s</Text>
              {urgent && <Text style={styles.urgentFlash}>!</Text>}
            </View>
          )}
          {!bombPickedUp && (
            <View style={styles.hintPill}>
              <Text style={styles.hintText}>🔍  Find the bomb</Text>
            </View>
          )}
        </View>

        {/* Right: pause */}
        <Pressable style={styles.pauseBtn} onPress={isPaused ? onResume : onPause}>
          <Text style={styles.pauseIcon}>{isPaused ? '▶' : '⏸'}</Text>
        </Pressable>
      </View>

      {/* ── Pause overlay ── */}
      {isPaused && !isGameOver && (
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>⏸  PAUSED</Text>
            <Pressable style={styles.bigBtn} onPress={onResume}>
              <Text style={styles.bigBtnText}>▶  RESUME</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* ── Game Over overlay ── */}
      {isGameOver && (
        <View style={styles.overlay}>
          <View style={[styles.modalCard, styles.gameOverCard]}>
            <Text style={styles.bigEmoji}>💥</Text>
            <Text style={styles.gameOverTitle}>YOU LOSE</Text>
            <Text style={styles.gameOverSub}>The bomb exploded!</Text>
            <View style={styles.separatorLine} />
            <Text style={styles.retryHint}>Restart the app to play again</Text>
          </View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  hud: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 6,
  },
  // Player badge
  playerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    gap: 6,
  },
  avatarDot: {
    width: 22, height: 22,
    borderRadius: 11,
    backgroundColor: '#FF6B6B',
    borderWidth: 2,
    borderColor: '#fff',
  },
  playerName: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 1,
  },
  // Timer
  timerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    gap: 4,
  },
  timerBomb: { fontSize: 22 },
  timerCount: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
    lineHeight: 36,
  },
  timerSec: {
    fontSize: 16,
    fontWeight: '700',
    alignSelf: 'flex-end',
    marginBottom: 2,
  },
  urgentFlash: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FF3333',
    marginLeft: 4,
  },
  hintPill: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  hintText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '600',
  },
  // Pause button
  pauseBtn: {
    width: 42, height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseIcon: { color: '#fff', fontSize: 16 },
  // Overlays
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: 'rgba(20,25,45,0.97)',
    borderRadius: 28,
    paddingVertical: 36,
    paddingHorizontal: 52,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(100,140,255,0.3)',
    shadowColor: '#4a90e2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    gap: 16,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 4,
  },
  bigBtn: {
    backgroundColor: '#4a90e2',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderWidth: 2,
    borderColor: '#7ab4f0',
  },
  bigBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
  },
  gameOverCard: {
    borderColor: 'rgba(255,50,50,0.5)',
    shadowColor: '#FF3333',
  },
  bigEmoji: { fontSize: 72 },
  gameOverTitle: {
    color: '#FF3333',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 8,
  },
  gameOverSub: {
    color: 'rgba(255,180,180,0.85)',
    fontSize: 16,
    fontWeight: '500',
  },
  separatorLine: {
    width: 120,
    height: 1.5,
    backgroundColor: 'rgba(255,80,80,0.3)',
    borderRadius: 1,
  },
  retryHint: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
  },
});
