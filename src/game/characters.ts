import type { CharacterId } from '../types/types';

export interface CharacterDef {
  id: CharacterId;
  name: string;
  // Body colors
  bodyColor: string;
  bodyDark: string;
  hairColor: string;
  skinColor: string;
  shoeColor: string;
  // Stats
  speed: number;     // 1-5
  power: number;     // 1-5
  range: number;     // 1-5
  // Unlock
  unlocked: boolean;
  price?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  description: string;
}

export const CHARACTERS: Record<CharacterId, CharacterDef> = {
  playerone: {
    id: 'playerone', name: 'PlayerOne',
    bodyColor: '#E53935', bodyDark: '#B71C1C',
    hairColor: '#5D4037', skinColor: '#FFCC80',
    shoeColor: '#FFFFFF',
    speed: 3, power: 3, range: 3,
    unlocked: true, rarity: 'common',
    description: 'The fearless runner. Balanced stats, perfect for any play style.',
  },
  speedy: {
    id: 'speedy', name: 'Speedy',
    bodyColor: '#43A047', bodyDark: '#1B5E20',
    hairColor: '#1B5E20', skinColor: '#FFCC80',
    shoeColor: '#FFEB3B',
    speed: 5, power: 2, range: 3,
    unlocked: true, rarity: 'rare',
    description: 'The quickest in the arena. Outrun everyone before the boom!',
  },
  shadow: {
    id: 'shadow', name: 'Shadow',
    bodyColor: '#7B1FA2', bodyDark: '#4A148C',
    hairColor: '#6A1B9A', skinColor: '#FFCC80',
    shoeColor: '#CE93D8',
    speed: 4, power: 3, range: 4,
    unlocked: false, price: 800, rarity: 'epic',
    description: 'A mysterious ninja who moves unseen. High range for quick passes.',
  },
  blaze: {
    id: 'blaze', name: 'Blaze',
    bodyColor: '#1565C0', bodyDark: '#0D47A1',
    hairColor: '#1565C0', skinColor: '#FFCC80',
    shoeColor: '#90CAF9',
    speed: 3, power: 5, range: 3,
    unlocked: false, price: 600, rarity: 'rare',
    description: 'Explosive power in every step. Makes the bomb look like a toy.',
  },
  hunter: {
    id: 'hunter', name: 'Hunter',
    bodyColor: '#E65100', bodyDark: '#BF360C',
    hairColor: '#E65100', skinColor: '#FFCC80',
    shoeColor: '#FF8A65',
    speed: 4, power: 4, range: 2,
    unlocked: false, price: 750, rarity: 'epic',
    description: 'Tracks targets relentlessly. Speed and power combined.',
  },
  flash: {
    id: 'flash', name: 'Flash',
    bodyColor: '#EC407A', bodyDark: '#AD1457',
    hairColor: '#F06292', skinColor: '#FFCC80',
    shoeColor: '#F8BBD0',
    speed: 5, power: 2, range: 4,
    unlocked: false, price: 900, rarity: 'epic',
    description: 'Blink and she\'s gone. Fastest passer in the game.',
  },
  nova: {
    id: 'nova', name: 'Nova',
    bodyColor: '#00838F', bodyDark: '#006064',
    hairColor: '#00ACC1', skinColor: '#FFCC80',
    shoeColor: '#80DEEA',
    speed: 3, power: 4, range: 5,
    unlocked: false, price: 1200, rarity: 'legendary',
    description: 'Cosmic reach. Can pass the bomb from incredible distances.',
  },
  zed: {
    id: 'zed', name: 'Zed',
    bodyColor: '#546E7A', bodyDark: '#37474F',
    hairColor: '#ECEFF1', skinColor: '#FFCCBC',
    shoeColor: '#B0BEC5',
    speed: 2, power: 5, range: 5,
    unlocked: false, price: 1500, rarity: 'legendary',
    description: 'The ancient warrior. Low speed but unmatched power and range.',
  },
};

export const CHARACTER_LIST: CharacterDef[] = Object.values(CHARACTERS);

// Spawn positions for 8 players on the 3200x2400 map
export const SPAWN_POSITIONS: Array<{ x: number; y: number }> = [
  { x: 400,  y: 400  },
  { x: 2800, y: 400  },
  { x: 400,  y: 2000 },
  { x: 2800, y: 2000 },
  { x: 1600, y: 300  },
  { x: 1600, y: 2100 },
  { x: 300,  y: 1200 },
  { x: 2900, y: 1200 },
];
