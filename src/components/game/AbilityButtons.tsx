// AbilityButtons — shield / freeze / speed boost
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { PowerupId } from '@/types/types';

interface Props {
  activePowerup: PowerupId | null;
  powerupEndTime: number;
  onUseAbility: (ability: PowerupId) => void;
}

const ABILITIES: Array<{ id: PowerupId; icon: string; label: string; color: string }> = [
  { id: 'shield', icon: '🛡', label: 'SHIELD', color: '#1565C0' },
  { id: 'freeze', icon: '❄️', label: 'FREEZE', color: '#006064' },
  { id: 'speed_boost', icon: '⚡', label: 'SPEED', color: '#E65100' },
];

export default function AbilityButtons({ activePowerup, powerupEndTime, onUseAbility }: Props) {
  const now = Date.now();
  return (
    <View style={styles.row}>
      {ABILITIES.map(ab => {
        const isActive = activePowerup === ab.id && powerupEndTime > now;
        return (
          <Pressable
            key={ab.id}
            style={[styles.btn, { backgroundColor: ab.color }, isActive && styles.btnActive]}
            onPress={() => onUseAbility(ab.id)}
          >
            <Text style={styles.icon}>{ab.icon}</Text>
            <Text style={styles.label}>{ab.label}</Text>
            {isActive && (
              <View style={styles.activeRing} />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  btn: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  btnActive: { borderColor: '#FFB800', borderWidth: 2.5 },
  icon: { fontSize: 20 },
  label: { color: '#fff', fontSize: 7, fontWeight: '800', marginTop: 1 },
  activeRing: { position: 'absolute', width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: '#FFB800' },
});
