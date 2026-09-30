export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export type DifficultyMode = 'cozy' | 'classic' | 'windy';

export type BirdSkinId = 'buttercup' | 'cotton_candy' | 'blueberry' | 'matcha' | 'midnight';

export type AccessoryId = 'none' | 'flower' | 'crown' | 'aviator' | 'leaf_sprout' | 'halo';

export type WorldThemeId = 'morning_meadow' | 'sunset_haven' | 'starry_dream';

export type PowerUpType = 'shield' | 'magnet' | 'feather_float';

export interface BirdSkin {
  id: BirdSkinId;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  bellyColor: string;
  wingColor: string;
  cheekColor: string;
  particleColor: string;
  cost: number;
}

export interface Accessory {
  id: AccessoryId;
  name: string;
  description: string;
  cost: number;
}

export interface WorldTheme {
  id: WorldThemeId;
  name: string;
  description: string;
  skyTop: string;
  skyBottom: string;
  cloudColor: string;
  hillFar: string;
  hillNear: string;
  groundColor: string;
  groundTrim: string;
  pillarBody: string;
  pillarTrim: string;
  pillarAccent: string;
  cost: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  rewardSeeds: number;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

export interface PlayerStats {
  highScore: number;
  totalSeeds: number;
  totalFlaps: number;
  totalGames: number;
  totalBerriesCollected: number;
  unlockedSkins: BirdSkinId[];
  unlockedAccessories: AccessoryId[];
  unlockedThemes: WorldThemeId[];
  selectedSkin: BirdSkinId;
  selectedAccessory: AccessoryId;
  selectedTheme: WorldThemeId;
  selectedDifficulty: DifficultyMode;
  achievements: Record<string, boolean>;
  soundEnabled: boolean;
  musicEnabled: boolean;
}

export interface ActivePowerUp {
  type: PowerUpType;
  remainingTime: number; // in seconds
  duration: number;
}

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  life: number;
  maxLife: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  rotation: number;
  vRot: number;
  life: number;
  maxLife: number;
  type: 'feather' | 'sparkle' | 'fluff' | 'leaf' | 'star';
}

export interface Obstacle {
  x: number;
  topHeight: number;
  bottomY: number;
  bottomHeight: number;
  width: number;
  passed: boolean;
  flowerPositions: { x: number; y: number; petalColor: string }[];
}

export interface CollectibleBerry {
  id: number;
  x: number;
  y: number;
  collected: boolean;
  type: 'seed' | 'golden_berry' | 'power_up';
  powerUpType?: PowerUpType;
  bounceOffset: number;
}
