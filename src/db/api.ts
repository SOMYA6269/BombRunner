import { supabase } from '@/client/supabase';
import type { Room, RoomPlayer, GameSession, LeaderboardEntry, CharacterId } from '../types/types';
import { CHARACTER_LIST } from '../game/characters';

// ── Rooms ─────────────────────────────────────────────────────────────────────

export async function createRoom(hostDeviceId: string, mapName = 'ancient_ruins'): Promise<Room | null> {
  const roomCode = Math.random().toString(36).slice(2, 8).toUpperCase();
  const { data, error } = await supabase
    .from('rooms')
    .insert({ room_code: roomCode, host_device_id: hostDeviceId, map_name: mapName })
    .select()
    .maybeSingle();
  if (error) { console.error('createRoom error', error); return null; }
  return dbToRoom(data);
}

export async function joinRoom(roomCode: string): Promise<Room | null> {
  const { data } = await supabase
    .from('rooms')
    .select('*')
    .eq('room_code', roomCode.toUpperCase())
    .eq('status', 'waiting')
    .maybeSingle();
  if (!data) return null;
  return dbToRoom(data);
}

export async function getRoomById(roomId: string): Promise<Room | null> {
  const { data } = await supabase.from('rooms').select('*').eq('id', roomId).maybeSingle();
  return data ? dbToRoom(data) : null;
}

export async function updateRoomStatus(roomId: string, status: Room['status']): Promise<void> {
  await supabase.from('rooms').update({ status, updated_at: new Date().toISOString() }).eq('id', roomId);
}

// ── Room Players ──────────────────────────────────────────────────────────────

export async function addPlayerToRoom(
  roomId: string, deviceId: string, username: string, characterId: CharacterId,
): Promise<RoomPlayer | null> {
  const { data, error } = await supabase
    .from('room_players')
    .upsert({
      room_id: roomId, device_id: deviceId, username, character_id: characterId,
      is_ready: false, is_bot: false, is_alive: true, has_bomb: false,
      pos_x: 1600, pos_y: 1200, facing: 'right', anim_state: 'idle',
      score: 0, ping: 0, last_seen: new Date().toISOString(),
    }, { onConflict: 'room_id,device_id' })
    .select()
    .maybeSingle();
  if (error) { console.error('addPlayerToRoom error', error); return null; }
  return dbToRoomPlayer(data);
}

export async function addBotPlayersToRoom(roomId: string, count: number, existingCount: number): Promise<void> {
  const botNames = ['BotNova', 'BotBlaze', 'BotShadow', 'BotFlash', 'BotZed', 'BotHunter', 'BotSpeedy'];
  const charIds = CHARACTER_LIST.map(c => c.id);
  const bots = Array.from({ length: count }, (_, i) => ({
    room_id: roomId,
    device_id: `bot_${roomId}_${i}`,
    username: botNames[i % botNames.length] + (i + 1),
    character_id: charIds[(existingCount + i) % charIds.length],
    is_ready: true,
    is_bot: true,
    is_alive: true,
    has_bomb: false,
    pos_x: 1600, pos_y: 1200,
    facing: 'right', anim_state: 'idle',
    score: 0, ping: 0,
    last_seen: new Date().toISOString(),
  }));
  await supabase.from('room_players').insert(bots);
}

export async function getRoomPlayers(roomId: string): Promise<RoomPlayer[]> {
  const { data } = await supabase
    .from('room_players')
    .select('*')
    .eq('room_id', roomId)
    .order('joined_at', { ascending: true })
    .limit(8);
  return Array.isArray(data) ? data.map(dbToRoomPlayer) : [];
}

export async function setPlayerReady(roomId: string, deviceId: string, ready: boolean): Promise<void> {
  await supabase.from('room_players').update({ is_ready: ready }).eq('room_id', roomId).eq('device_id', deviceId);
}

export async function removePlayerFromRoom(roomId: string, deviceId: string): Promise<void> {
  await supabase.from('room_players').delete().eq('room_id', roomId).eq('device_id', deviceId);
}

export async function updatePlayerPosition(
  roomId: string, deviceId: string,
  posX: number, posY: number, facing: string, animState: string, hasBomb: boolean,
): Promise<void> {
  await supabase.from('room_players').update({
    pos_x: posX, pos_y: posY, facing, anim_state: animState, has_bomb: hasBomb,
    last_seen: new Date().toISOString(),
  }).eq('room_id', roomId).eq('device_id', deviceId);
}

// ── Game Sessions ─────────────────────────────────────────────────────────────

export async function createGameSession(roomId: string): Promise<GameSession | null> {
  const { data, error } = await supabase
    .from('game_sessions')
    .insert({ room_id: roomId, bomb_countdown: 20 })
    .select()
    .maybeSingle();
  if (error) { console.error('createGameSession error', error); return null; }
  return dbToGameSession(data);
}

export async function getActiveSession(roomId: string): Promise<GameSession | null> {
  const { data } = await supabase
    .from('game_sessions')
    .select('*')
    .eq('room_id', roomId)
    .is('ended_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ? dbToGameSession(data) : null;
}

export async function updateGameSession(
  sessionId: string, updates: Partial<{ bombHolderDeviceId: string; bombCountdown: number; winnerDeviceId: string; winnerUsername: string; endedAt: string }>,
): Promise<void> {
  const dbUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.bombHolderDeviceId !== undefined) dbUpdates.bomb_holder_device_id = updates.bombHolderDeviceId;
  if (updates.bombCountdown !== undefined) dbUpdates.bomb_countdown = updates.bombCountdown;
  if (updates.winnerDeviceId !== undefined) dbUpdates.winner_device_id = updates.winnerDeviceId;
  if (updates.winnerUsername !== undefined) dbUpdates.winner_username = updates.winnerUsername;
  if (updates.endedAt !== undefined) dbUpdates.ended_at = updates.endedAt;
  await supabase.from('game_sessions').update(dbUpdates).eq('id', sessionId);
}

// ── Leaderboard ───────────────────────────────────────────────────────────────

export async function getLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
  const { data } = await supabase
    .from('profiles')
    .select('device_id, username, selected_character, wins, matches, rating')
    .order('wins', { ascending: false })
    .limit(limit);
  if (!Array.isArray(data)) return [];
  return data.map((row, i) => ({
    deviceId: (row.device_id as string) ?? '',
    rank: i + 1,
    username: row.username as string,
    characterId: (row.selected_character as CharacterId) ?? 'playerone',
    wins: (row.wins as number) ?? 0,
    matches: (row.matches as number) ?? 0,
    winRate: (row.matches as number) > 0 ? Math.round(((row.wins as number) / (row.matches as number)) * 100) : 0,
    rating: (row.rating as number) ?? 1000,
    isMe: false,
  }));
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function dbToRoom(d: Record<string, unknown>): Room {
  return {
    id: d.id as string,
    roomCode: d.room_code as string,
    hostDeviceId: d.host_device_id as string,
    status: d.status as Room['status'],
    mapName: d.map_name as string,
    maxPlayers: d.max_players as number,
    createdAt: d.created_at as string,
    updatedAt: d.updated_at as string,
  };
}

function dbToRoomPlayer(d: Record<string, unknown>): RoomPlayer {
  return {
    id: d.id as string,
    roomId: d.room_id as string,
    deviceId: d.device_id as string,
    username: d.username as string,
    characterId: (d.character_id as CharacterId) ?? 'playerone',
    isReady: d.is_ready as boolean,
    isBot: d.is_bot as boolean,
    isAlive: d.is_alive as boolean,
    hasBomb: d.has_bomb as boolean,
    posX: d.pos_x as number,
    posY: d.pos_y as number,
    facing: (d.facing as 'left' | 'right') ?? 'right',
    animState: (d.anim_state as 'idle' | 'running' | 'carrying' | 'eliminated') ?? 'idle',
    score: (d.score as number) ?? 0,
    eliminationOrder: d.elimination_order as number | undefined,
    activePowerup: d.active_powerup as import('../types/types').PowerupId | null,
    powerupExpiresAt: d.powerup_expires_at as string | null,
    ping: (d.ping as number) ?? 0,
  };
}

function dbToGameSession(d: Record<string, unknown>): GameSession {
  return {
    id: d.id as string,
    roomId: d.room_id as string,
    winnerDeviceId: d.winner_device_id as string | undefined,
    winnerUsername: d.winner_username as string | undefined,
    bombHolderDeviceId: d.bomb_holder_device_id as string | undefined,
    bombCountdown: (d.bomb_countdown as number) ?? 20,
    startedAt: d.started_at as string,
    endedAt: d.ended_at as string | undefined,
    updatedAt: d.updated_at as string,
  };
}
