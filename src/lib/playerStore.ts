// Device-local player profile storage using expo-sqlite localStorage
import { supabase } from '@/client/supabase';
import type { PlayerProfile, CharacterId } from '../types/types';

const DEVICE_ID_KEY = 'bomb_runner_device_id';
const PROFILE_KEY = 'bomb_runner_profile';

function generateDeviceId(): string {
  return 'dev_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function generateUsername(): string {
  const adjectives = ['Fast', 'Bold', 'Sly', 'Wild', 'Dark', 'Brave', 'Swift', 'Cool'];
  const nouns = ['Runner', 'Blaster', 'Ninja', 'Hero', 'Shadow', 'Flash', 'Storm', 'Bolt'];
  const num = Math.floor(Math.random() * 999) + 1;
  return adjectives[Math.floor(Math.random() * adjectives.length)] +
    nouns[Math.floor(Math.random() * nouns.length)] + num;
}

let _cachedProfile: PlayerProfile | null = null;

export function getCachedProfile(): PlayerProfile | null {
  return _cachedProfile;
}

export async function getOrCreateProfile(): Promise<PlayerProfile> {
  if (_cachedProfile) return _cachedProfile;

  // Try localStorage (via expo-sqlite localStorage shim)
  let deviceId: string | null = null;
  try {
    deviceId = localStorage.getItem(DEVICE_ID_KEY);
  } catch (_) { /* web-only, noop in RN */ }

  if (!deviceId) {
    deviceId = generateDeviceId();
    try { localStorage.setItem(DEVICE_ID_KEY, deviceId); } catch (_) {}
  }

  // Fetch or create from Supabase
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('device_id', deviceId)
    .maybeSingle();

  if (error || !data) {
    const username = generateUsername();
    const newProfile = {
      device_id: deviceId,
      username,
      coins: 500,
      gems: 50,
      level: 1,
      xp: 0,
      selected_character: 'playerone',
      wins: 0,
      matches: 0,
      eliminations: 0,
    };
    const { data: created } = await supabase.from('profiles').insert(newProfile).select().maybeSingle();
    const profile = dbToProfile(created ?? { ...newProfile, id: deviceId });
    _cachedProfile = profile;
    return profile;
  }

  const profile = dbToProfile(data);
  _cachedProfile = profile;
  return profile;
}

export async function updateProfile(updates: Partial<PlayerProfile>): Promise<void> {
  if (!_cachedProfile) return;
  _cachedProfile = { ..._cachedProfile, ...updates };
  const dbUpdates: Record<string, unknown> = {};
  if (updates.coins !== undefined) dbUpdates.coins = updates.coins;
  if (updates.gems !== undefined) dbUpdates.gems = updates.gems;
  if (updates.level !== undefined) dbUpdates.level = updates.level;
  if (updates.xp !== undefined) dbUpdates.xp = updates.xp;
  if (updates.selectedCharacter !== undefined) dbUpdates.selected_character = updates.selectedCharacter;
  if (updates.wins !== undefined) dbUpdates.wins = updates.wins;
  if (updates.matches !== undefined) dbUpdates.matches = updates.matches;
  if (updates.eliminations !== undefined) dbUpdates.eliminations = updates.eliminations;
  if (Object.keys(dbUpdates).length > 0) {
    await supabase.from('profiles').update(dbUpdates).eq('device_id', _cachedProfile.deviceId);
  }
}

function dbToProfile(data: Record<string, unknown>): PlayerProfile {
  return {
    deviceId: data.device_id as string,
    username: data.username as string,
    coins: (data.coins as number) ?? 500,
    gems: (data.gems as number) ?? 50,
    level: (data.level as number) ?? 1,
    xp: (data.xp as number) ?? 0,
    selectedCharacter: (data.selected_character as CharacterId) ?? 'playerone',
    wins: (data.wins as number) ?? 0,
    matches: (data.matches as number) ?? 0,
    eliminations: (data.eliminations as number) ?? 0,
    rating: (data.rating as number) ?? 1000,
  };
}
