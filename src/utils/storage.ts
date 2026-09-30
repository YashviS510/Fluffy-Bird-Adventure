import {
  BirdSkin,
  Accessory,
  WorldTheme,
  PlayerStats,
  Achievement,
  BirdSkinId,
  AccessoryId,
  WorldThemeId,
} from '../types/game';

export const BIRD_SKINS: Record<BirdSkinId, BirdSkin> = {
  buttercup: {
    id: 'buttercup',
    name: 'Buttercup',
    description: 'A sun-kissed golden puff of pure happiness.',
    primaryColor: '#FBBF24', // amber-400
    secondaryColor: '#F59E0B', // amber-500
    bellyColor: '#FEF3C7', // amber-100
    wingColor: '#D97706', // amber-600
    cheekColor: '#F87171', // red-400
    particleColor: '#FDE68A',
    cost: 0,
  },
  cotton_candy: {
    id: 'cotton_candy',
    name: 'Cotton Candy',
    description: 'Sweet pastel pink plumage spun from sugar clouds.',
    primaryColor: '#F472B6', // pink-400
    secondaryColor: '#EC4899', // pink-500
    bellyColor: '#FCE7F3', // pink-100
    wingColor: '#38BDF8', // sky-400 cyan wing accent!
    cheekColor: '#FB7185',
    particleColor: '#BAE6FD',
    cost: 30,
  },
  blueberry: {
    id: 'blueberry',
    name: 'Blueberry',
    description: 'A swift, curious blue songbird of high altitudes.',
    primaryColor: '#38BDF8', // sky-400
    secondaryColor: '#0284C7', // sky-600
    bellyColor: '#E0F2FE', // sky-100
    wingColor: '#0369A1', // sky-700
    cheekColor: '#F43F5E',
    particleColor: '#7DD3FC',
    cost: 60,
  },
  matcha: {
    id: 'matcha',
    name: 'Matcha Pip',
    description: 'A peaceful woodland puff infused with green tea essence.',
    primaryColor: '#4ADE80', // green-400
    secondaryColor: '#16A34A', // green-600
    bellyColor: '#DCFCE7', // green-100
    wingColor: '#15803D', // green-700
    cheekColor: '#FB7185',
    particleColor: '#86EFAC',
    cost: 100,
  },
  midnight: {
    id: 'midnight',
    name: 'Starlight Pip',
    description: 'Cosmic twilight bird with stardust nestled in feathers.',
    primaryColor: '#818CF8', // indigo-400
    secondaryColor: '#4F46E5', // indigo-600
    bellyColor: '#E0E7FF', // indigo-100
    wingColor: '#3730A3', // indigo-800
    cheekColor: '#F472B6',
    particleColor: '#C7D2FE',
    cost: 150,
  },
};

export const ACCESSORIES: Record<AccessoryId, Accessory> = {
  none: {
    id: 'none',
    name: 'Natural Fluff',
    description: 'Pure, unadorned feathery puffiness.',
    cost: 0,
  },
  flower: {
    id: 'flower',
    name: 'Daisy Bloom',
    description: 'A freshly plucked meadow daisy tucked over the ear.',
    cost: 20,
  },
  leaf_sprout: {
    id: 'leaf_sprout',
    name: 'Twin Sprout',
    description: 'A bouncy, tender green leaf sprout perched atop your head.',
    cost: 40,
  },
  crown: {
    id: 'crown',
    name: 'Prince Crown',
    description: 'A tiny gleaming gold coronet fit for avian royalty.',
    cost: 80,
  },
  aviator: {
    id: 'aviator',
    name: 'Aviator Goggles',
    description: 'Vintage pilot goggles ready for high-speed headwind.',
    cost: 120,
  },
  halo: {
    id: 'halo',
    name: 'Angelic Halo',
    description: 'A glowing celestial ring floating gracefully above your head.',
    cost: 200,
  },
};

export const WORLD_THEMES: Record<WorldThemeId, WorldTheme> = {
  morning_meadow: {
    id: 'morning_meadow',
    name: 'Morning Meadow',
    description: 'Sunny blue skies, pastel clouds, and blooming flower pillars.',
    skyTop: '#60A5FA', // blue-400
    skyBottom: '#BAE6FD', // sky-200
    cloudColor: 'rgba(255, 255, 255, 0.85)',
    hillFar: '#86EFAC', // soft green
    hillNear: '#4ADE80',
    groundColor: '#22C55E',
    groundTrim: '#15803D',
    pillarBody: '#84CC16', // lime-500
    pillarTrim: '#65A30D',
    pillarAccent: '#FB7185', // pink flowers
    cost: 0,
  },
  sunset_haven: {
    id: 'sunset_haven',
    name: 'Sunset Haven',
    description: 'Warm lavender twilight, amber lanterns, and glowing hills.',
    skyTop: '#4C1D95', // purple-900
    skyBottom: '#FB923C', // orange-400
    cloudColor: 'rgba(254, 215, 170, 0.65)',
    hillFar: '#6D28D9',
    hillNear: '#7C3AED',
    groundColor: '#581C87',
    groundTrim: '#3B0764',
    pillarBody: '#D97706', // warm amber wood
    pillarTrim: '#B45309',
    pillarAccent: '#FBBF24', // lantern glow
    cost: 50,
  },
  starry_dream: {
    id: 'starry_dream',
    name: 'Starry Dream',
    description: 'Deep cosmic night, glowing constellations, and crystal towers.',
    skyTop: '#0F172A', // slate-900
    skyBottom: '#1E1B4B', // indigo-950
    cloudColor: 'rgba(165, 180, 252, 0.3)',
    hillFar: '#1E293B',
    hillNear: '#334155',
    groundColor: '#0F172A',
    groundTrim: '#4338CA',
    pillarBody: '#6366F1', // indigo-500
    pillarTrim: '#4338CA',
    pillarAccent: '#A5B4FC', // crystal stars
    cost: 120,
  },
};

export const ACHIEVEMENTS_LIST: Achievement[] = [
  {
    id: 'first_flap',
    title: 'First Leap',
    description: 'Take flight for the very first time.',
    rewardSeeds: 5,
    unlocked: false,
  },
  {
    id: 'score_5',
    title: 'Little Flutter',
    description: 'Reach a flight score of 5 in one run.',
    rewardSeeds: 10,
    unlocked: false,
  },
  {
    id: 'score_15',
    title: 'Cloud Hopper',
    description: 'Reach a flight score of 15 in one run.',
    rewardSeeds: 25,
    unlocked: false,
  },
  {
    id: 'score_30',
    title: 'Sky Sovereign',
    description: 'Reach an impressive flight score of 30.',
    rewardSeeds: 50,
    unlocked: false,
  },
  {
    id: 'seeds_10',
    title: 'Sweet Nibble',
    description: 'Collect 10 golden seeds in a single run.',
    rewardSeeds: 15,
    unlocked: false,
  },
  {
    id: 'shield_save',
    title: 'Fluff Armor',
    description: 'Survive an obstacle hit using a Fluff Shield.',
    rewardSeeds: 20,
    unlocked: false,
  },
  {
    id: 'magnet_master',
    title: 'Golden Magnet',
    description: 'Pull in seeds with the Magnet power-up.',
    rewardSeeds: 20,
    unlocked: false,
  },
  {
    id: 'unlock_3_skins',
    title: 'Flock Collector',
    description: 'Collect and unlock at least 3 bird skins.',
    rewardSeeds: 40,
    unlocked: false,
  },
];

const STORAGE_KEY = 'fluffy_bird_player_stats_v1';

const DEFAULT_STATS: PlayerStats = {
  highScore: 0,
  totalSeeds: 10, // Starting gift seeds
  totalFlaps: 0,
  totalGames: 0,
  totalBerriesCollected: 0,
  unlockedSkins: ['buttercup'],
  unlockedAccessories: ['none'],
  unlockedThemes: ['morning_meadow'],
  selectedSkin: 'buttercup',
  selectedAccessory: 'none',
  selectedTheme: 'morning_meadow',
  selectedDifficulty: 'classic',
  achievements: {},
  soundEnabled: true,
  musicEnabled: false,
};

export function loadPlayerStats(): PlayerStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STATS,
      ...parsed,
      achievements: { ...DEFAULT_STATS.achievements, ...(parsed.achievements || {}) },
    };
  } catch {
    return DEFAULT_STATS;
  }
}

export function savePlayerStats(stats: PlayerStats): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {}
}
