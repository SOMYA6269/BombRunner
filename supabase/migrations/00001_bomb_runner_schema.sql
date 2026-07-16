
-- Profiles
create table profiles (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  coins integer not null default 500,
  gems integer not null default 50,
  level integer not null default 1,
  xp integer not null default 0,
  selected_character text not null default 'playerone',
  wins integer not null default 0,
  matches integer not null default 0,
  eliminations integer not null default 0,
  device_id text unique,
  created_at timestamptz not null default now()
);

-- Rooms
create table rooms (
  id uuid primary key default gen_random_uuid(),
  room_code text not null unique,
  host_device_id text not null,
  status text not null default 'waiting' check (status in ('waiting','countdown','playing','finished')),
  map_name text not null default 'ancient_ruins',
  max_players integer not null default 8,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Room players (live game state per player)
create table room_players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  device_id text not null,
  username text not null,
  character_id text not null default 'playerone',
  is_ready boolean not null default false,
  is_bot boolean not null default false,
  is_alive boolean not null default true,
  has_bomb boolean not null default false,
  pos_x float not null default 1600,
  pos_y float not null default 1200,
  facing text not null default 'right',
  anim_state text not null default 'idle',
  score integer not null default 0,
  elimination_order integer,
  active_powerup text,
  powerup_expires_at timestamptz,
  ping integer not null default 0,
  last_seen timestamptz not null default now(),
  joined_at timestamptz not null default now(),
  unique(room_id, device_id)
);

-- Game sessions (match log)
create table game_sessions (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  winner_device_id text,
  winner_username text,
  bomb_holder_device_id text,
  bomb_countdown float not null default 20,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  updated_at timestamptz not null default now()
);

-- Player inventory
create table player_inventory (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  item_type text not null check (item_type in ('character','bomb_skin','trail','emote')),
  item_id text not null,
  acquired_at timestamptz not null default now(),
  unique(device_id, item_type, item_id)
);

-- Missions
create table mission_progress (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  mission_id text not null,
  progress integer not null default 0,
  completed boolean not null default false,
  claimed boolean not null default false,
  reset_at timestamptz,
  unique(device_id, mission_id)
);

-- RLS
alter table profiles enable row level security;
alter table rooms enable row level security;
alter table room_players enable row level security;
alter table game_sessions enable row level security;
alter table player_inventory enable row level security;
alter table mission_progress enable row level security;

-- Open policies (device-id based, not auth-based)
create policy "profiles_all" on profiles for all using (true) with check (true);
create policy "rooms_all" on rooms for all using (true) with check (true);
create policy "room_players_all" on room_players for all using (true) with check (true);
create policy "game_sessions_all" on game_sessions for all using (true) with check (true);
create policy "player_inventory_all" on player_inventory for all using (true) with check (true);
create policy "mission_progress_all" on mission_progress for all using (true) with check (true);

-- Realtime publication
alter publication supabase_realtime add table rooms;
alter publication supabase_realtime add table room_players;
alter publication supabase_realtime add table game_sessions;

-- Indexes for performance
create index room_players_room_id_idx on room_players(room_id);
create index room_players_device_id_idx on room_players(device_id);
create index game_sessions_room_id_idx on game_sessions(room_id);
