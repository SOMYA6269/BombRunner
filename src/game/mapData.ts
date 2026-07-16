import type { MapDecoration, MapTile, Rect } from './types';

// ─── Collision Solids ─────────────────────────────────────────────────────────
export const MAP_TILES: MapTile[] = [
  // Outer boundary walls (3200×2400 map, 64px border)
  { rect: { x: 0,    y: 0,    w: 3200, h: 64   }, type: 'wall' },
  { rect: { x: 0,    y: 2336, w: 3200, h: 64   }, type: 'wall' },
  { rect: { x: 0,    y: 64,   w: 64,   h: 2272 }, type: 'wall' },
  { rect: { x: 3136, y: 64,   w: 64,   h: 2272 }, type: 'wall' },

  // ── Top-left compound ─────────────────────────────────────────────────────
  { rect: { x: 192,  y: 192,  w: 320, h: 64  }, type: 'wall' },
  { rect: { x: 192,  y: 192,  w: 64,  h: 256 }, type: 'wall' },
  { rect: { x: 320,  y: 320,  w: 192, h: 64  }, type: 'wall' },

  // ── Top-right compound ────────────────────────────────────────────────────
  { rect: { x: 2688, y: 192,  w: 320, h: 64  }, type: 'wall' },
  { rect: { x: 2944, y: 192,  w: 64,  h: 256 }, type: 'wall' },
  { rect: { x: 2688, y: 320,  w: 192, h: 64  }, type: 'wall' },

  // ── Bottom-left compound ──────────────────────────────────────────────────
  { rect: { x: 192,  y: 1984, w: 320, h: 64  }, type: 'wall' },
  { rect: { x: 192,  y: 1984, w: 64,  h: 256 }, type: 'wall' },
  { rect: { x: 320,  y: 2048, w: 192, h: 64  }, type: 'wall' },

  // ── Bottom-right compound ─────────────────────────────────────────────────
  { rect: { x: 2688, y: 1984, w: 320, h: 64  }, type: 'wall' },
  { rect: { x: 2944, y: 1984, w: 64,  h: 256 }, type: 'wall' },
  { rect: { x: 2688, y: 2048, w: 192, h: 64  }, type: 'wall' },

  // ── Central cross walls ───────────────────────────────────────────────────
  { rect: { x: 1344, y: 832,  w: 512, h: 64  }, type: 'wall' },
  { rect: { x: 1344, y: 1504, w: 512, h: 64  }, type: 'wall' },
  { rect: { x: 1344, y: 896,  w: 64,  h: 608 }, type: 'wall' },
  { rect: { x: 1792, y: 896,  w: 64,  h: 608 }, type: 'wall' },

  // ── Mid horizontal corridors ──────────────────────────────────────────────
  { rect: { x: 576,  y: 1056, w: 448, h: 64  }, type: 'wall' },
  { rect: { x: 2176, y: 1056, w: 448, h: 64  }, type: 'wall' },
  { rect: { x: 576,  y: 1280, w: 448, h: 64  }, type: 'wall' },
  { rect: { x: 2176, y: 1280, w: 448, h: 64  }, type: 'wall' },

  // ── Vertical mid walls ────────────────────────────────────────────────────
  { rect: { x: 576,  y: 576,  w: 64,  h: 384 }, type: 'wall' },
  { rect: { x: 2560, y: 576,  w: 64,  h: 384 }, type: 'wall' },
  { rect: { x: 576,  y: 1344, w: 64,  h: 320 }, type: 'wall' },
  { rect: { x: 2560, y: 1344, w: 64,  h: 320 }, type: 'wall' },

  // ── Short diagonal blockers ───────────────────────────────────────────────
  { rect: { x: 960,  y: 448,  w: 192, h: 64  }, type: 'wall' },
  { rect: { x: 2048, y: 448,  w: 192, h: 64  }, type: 'wall' },
  { rect: { x: 960,  y: 1888, w: 192, h: 64  }, type: 'wall' },
  { rect: { x: 2048, y: 1888, w: 192, h: 64  }, type: 'wall' },

  // ── Crate clusters ────────────────────────────────────────────────────────
  // Top-center cluster
  { rect: { x: 1472, y: 256,  w: 64, h: 64 }, type: 'crate' },
  { rect: { x: 1536, y: 256,  w: 64, h: 64 }, type: 'crate' },
  { rect: { x: 1600, y: 256,  w: 64, h: 64 }, type: 'crate' },
  { rect: { x: 1472, y: 320,  w: 64, h: 64 }, type: 'crate' },
  { rect: { x: 1600, y: 320,  w: 64, h: 64 }, type: 'crate' },
  // Bottom-center cluster
  { rect: { x: 1472, y: 2048, w: 64, h: 64 }, type: 'crate' },
  { rect: { x: 1536, y: 2048, w: 64, h: 64 }, type: 'crate' },
  { rect: { x: 1600, y: 2048, w: 64, h: 64 }, type: 'crate' },
  // Left cluster
  { rect: { x: 320,  y: 768,  w: 64, h: 64 }, type: 'crate' },
  { rect: { x: 384,  y: 768,  w: 64, h: 64 }, type: 'crate' },
  { rect: { x: 320,  y: 832,  w: 64, h: 64 }, type: 'crate' },
  { rect: { x: 320,  y: 1408, w: 64, h: 64 }, type: 'crate' },
  { rect: { x: 384,  y: 1408, w: 64, h: 64 }, type: 'crate' },
  { rect: { x: 320,  y: 1472, w: 64, h: 64 }, type: 'crate' },
  // Right cluster
  { rect: { x: 2496, y: 768,  w: 64, h: 64 }, type: 'crate' },
  { rect: { x: 2432, y: 768,  w: 64, h: 64 }, type: 'crate' },
  { rect: { x: 2496, y: 832,  w: 64, h: 64 }, type: 'crate' },
  { rect: { x: 2496, y: 1408, w: 64, h: 64 }, type: 'crate' },
  { rect: { x: 2432, y: 1408, w: 64, h: 64 }, type: 'crate' },
  { rect: { x: 2496, y: 1472, w: 64, h: 64 }, type: 'crate' },
  // Scatter crates
  { rect: { x: 768,  y: 320,  w: 64, h: 64 }, type: 'crate' },
  { rect: { x: 1152, y: 576,  w: 64, h: 64 }, type: 'crate' },
  { rect: { x: 2048, y: 640,  w: 64, h: 64 }, type: 'crate' },
  { rect: { x: 2368, y: 320,  w: 64, h: 64 }, type: 'crate' },
  { rect: { x: 768,  y: 2048, w: 64, h: 64 }, type: 'crate' },
  { rect: { x: 1152, y: 1792, w: 64, h: 64 }, type: 'crate' },
  { rect: { x: 2048, y: 1728, w: 64, h: 64 }, type: 'crate' },
  { rect: { x: 2368, y: 2048, w: 64, h: 64 }, type: 'crate' },
];

export const COLLISION_RECTS: Rect[] = MAP_TILES.map((t) => t.rect);

// ─── Decorations ─────────────────────────────────────────────────────────────
export const MAP_DECORATIONS: MapDecoration[] = [
  // Corner trees
  { x: 100,  y: 100,  type: 'tree', scale: 1.4, variant: 0 },
  { x: 3060, y: 100,  type: 'tree', scale: 1.3, variant: 1 },
  { x: 100,  y: 2260, type: 'tree', scale: 1.2, variant: 2 },
  { x: 3060, y: 2260, type: 'tree', scale: 1.5, variant: 0 },

  // Top edge trees
  { x: 700,  y: 90,   type: 'tree', scale: 1.0, variant: 1 },
  { x: 1100, y: 80,   type: 'tree', scale: 0.9, variant: 2 },
  { x: 1600, y: 90,   type: 'tree', scale: 1.1, variant: 0 },
  { x: 2100, y: 80,   type: 'tree', scale: 1.0, variant: 1 },
  { x: 2500, y: 90,   type: 'tree', scale: 1.2, variant: 2 },

  // Bottom edge trees
  { x: 700,  y: 2280, type: 'tree', scale: 1.0, variant: 2 },
  { x: 1100, y: 2290, type: 'tree', scale: 1.1, variant: 0 },
  { x: 1600, y: 2280, type: 'tree', scale: 0.9, variant: 1 },
  { x: 2100, y: 2290, type: 'tree', scale: 1.0, variant: 2 },
  { x: 2500, y: 2280, type: 'tree', scale: 1.2, variant: 0 },

  // Left edge trees
  { x: 80,   y: 600,  type: 'tree', scale: 1.0, variant: 1 },
  { x: 80,   y: 1000, type: 'tree', scale: 1.1, variant: 0 },
  { x: 80,   y: 1400, type: 'tree', scale: 0.9, variant: 2 },
  { x: 80,   y: 1800, type: 'tree', scale: 1.0, variant: 1 },

  // Right edge trees
  { x: 3080, y: 600,  type: 'tree', scale: 1.1, variant: 2 },
  { x: 3080, y: 1000, type: 'tree', scale: 1.0, variant: 0 },
  { x: 3080, y: 1400, type: 'tree', scale: 1.2, variant: 1 },
  { x: 3080, y: 1800, type: 'tree', scale: 0.9, variant: 2 },

  // Inner bushes (scattered)
  { x: 450,  y: 450,  type: 'bush', scale: 1.0, variant: 0 },
  { x: 800,  y: 200,  type: 'bush', scale: 0.9, variant: 1 },
  { x: 1200, y: 350,  type: 'bush', scale: 1.1, variant: 2 },
  { x: 2000, y: 350,  type: 'bush', scale: 0.8, variant: 0 },
  { x: 2700, y: 450,  type: 'bush', scale: 1.0, variant: 1 },
  { x: 450,  y: 1900, type: 'bush', scale: 0.9, variant: 2 },
  { x: 800,  y: 2100, type: 'bush', scale: 1.1, variant: 0 },
  { x: 1200, y: 1980, type: 'bush', scale: 1.0, variant: 1 },
  { x: 2000, y: 1980, type: 'bush', scale: 0.9, variant: 2 },
  { x: 2700, y: 1900, type: 'bush', scale: 1.0, variant: 0 },
  { x: 700,  y: 900,  type: 'bush', scale: 0.8, variant: 1 },
  { x: 700,  y: 1500, type: 'bush', scale: 1.0, variant: 2 },
  { x: 2500, y: 900,  type: 'bush', scale: 0.9, variant: 0 },
  { x: 2500, y: 1500, type: 'bush', scale: 1.1, variant: 1 },
  { x: 1600, y: 700,  type: 'bush', scale: 0.8, variant: 2 },
  { x: 1600, y: 1700, type: 'bush', scale: 1.0, variant: 0 },

  // Water features (decorative ponds)
  { x: 900,  y: 600,  type: 'water', scale: 1.0, variant: 0 },
  { x: 2200, y: 600,  type: 'water', scale: 1.0, variant: 1 },
  { x: 900,  y: 1700, type: 'water', scale: 0.9, variant: 2 },
  { x: 2200, y: 1700, type: 'water', scale: 1.0, variant: 0 },

  // Rocks
  { x: 550,  y: 300,  type: 'rock', scale: 1.0, variant: 0 },
  { x: 1300, y: 200,  type: 'rock', scale: 0.8, variant: 1 },
  { x: 1800, y: 220,  type: 'rock', scale: 1.1, variant: 2 },
  { x: 2600, y: 300,  type: 'rock', scale: 0.9, variant: 0 },
  { x: 550,  y: 2050, type: 'rock', scale: 1.0, variant: 1 },
  { x: 1300, y: 2150, type: 'rock', scale: 0.9, variant: 2 },
  { x: 1800, y: 2130, type: 'rock', scale: 1.1, variant: 0 },
  { x: 2600, y: 2050, type: 'rock', scale: 1.0, variant: 1 },
  { x: 1100, y: 1200, type: 'rock', scale: 0.8, variant: 2 },
  { x: 2100, y: 1200, type: 'rock', scale: 0.9, variant: 0 },

  // Ladders
  { x: 1000, y: 1150, type: 'ladder', scale: 1.0 },
  { x: 2150, y: 1150, type: 'ladder', scale: 1.0 },
  { x: 1600, y: 550,  type: 'ladder', scale: 1.0 },
  { x: 1600, y: 1800, type: 'ladder', scale: 1.0 },

  // Flowers (small decorative)
  { x: 350,  y: 550,  type: 'flower', scale: 1.0, variant: 0 },
  { x: 500,  y: 750,  type: 'flower', scale: 0.9, variant: 1 },
  { x: 1400, y: 450,  type: 'flower', scale: 1.0, variant: 2 },
  { x: 1750, y: 450,  type: 'flower', scale: 0.8, variant: 0 },
  { x: 2800, y: 550,  type: 'flower', scale: 1.0, variant: 1 },
  { x: 350,  y: 1800, type: 'flower', scale: 0.9, variant: 2 },
  { x: 500,  y: 1600, type: 'flower', scale: 1.0, variant: 0 },
  { x: 1400, y: 1950, type: 'flower', scale: 0.8, variant: 1 },
  { x: 1750, y: 1950, type: 'flower', scale: 1.0, variant: 2 },
  { x: 2800, y: 1800, type: 'flower', scale: 0.9, variant: 0 },

  // Bridges (horizontal)
  { x: 860,  y: 570,  type: 'bridge_h', scale: 1.0 },
  { x: 2140, y: 570,  type: 'bridge_h', scale: 1.0 },
  { x: 860,  y: 1670, type: 'bridge_h', scale: 1.0 },
  { x: 2140, y: 1670, type: 'bridge_h', scale: 1.0 },

  // Sign posts
  { x: 1580, y: 400,  type: 'sign', scale: 1.0, variant: 0 },
  { x: 1580, y: 1950, type: 'sign', scale: 1.0, variant: 1 },
];
