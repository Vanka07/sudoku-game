import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type GameState = 'menu' | 'playing' | 'paused' | 'gameover';

export type Difficulty = 'casual' | 'normal' | 'hard' | 'insane';

export interface DifficultyConfig {
  startingLevel: number;
  label: string;
  description: string;
}

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  casual: { startingLevel: 1, label: 'Casual', description: 'Relaxed pace' },
  normal: { startingLevel: 3, label: 'Normal', description: 'Balanced challenge' },
  hard: { startingLevel: 5, label: 'Hard', description: 'Fast reactions' },
  insane: { startingLevel: 8, label: 'Insane', description: 'Reflex masters only' },
};

export interface Target {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  spawnTime: number;
  lifetime: number;
  points: number;
  type: 'normal' | 'bonus' | 'danger';
}

export interface GameStats {
  highScore: number;
  totalGames: number;
  totalTaps: number;
  perfectHits: number;
  longestStreak: number;
}

interface GameStore {
  // Game state
  gameState: GameState;
  score: number;
  lives: number;
  level: number;
  combo: number;
  maxCombo: number;
  targets: Target[];
  difficulty: Difficulty;

  // Stats
  stats: GameStats;

  // Settings
  soundEnabled: boolean;
  hapticEnabled: boolean;

  // Actions
  setGameState: (state: GameState) => void;
  startGame: () => void;
  endGame: () => void;
  addScore: (points: number) => void;
  loseLife: () => void;
  incrementCombo: () => void;
  resetCombo: () => void;
  setLevel: (level: number) => void;
  addTarget: (target: Target) => void;
  removeTarget: (id: string) => void;
  clearTargets: () => void;
  toggleSound: () => void;
  toggleHaptic: () => void;
  setDifficulty: (difficulty: Difficulty) => void;
  loadStats: () => Promise<void>;
  saveStats: () => Promise<void>;
}

const TARGET_COLORS = [
  '#FF006E', // Hot pink
  '#00F5FF', // Cyan
  '#FFBE0B', // Yellow
  '#8338EC', // Purple
  '#3A86FF', // Blue
  '#06FFA5', // Mint
];

const INITIAL_STATS: GameStats = {
  highScore: 0,
  totalGames: 0,
  totalTaps: 0,
  perfectHits: 0,
  longestStreak: 0,
};

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: 'menu',
  score: 0,
  lives: 3,
  level: 1,
  combo: 0,
  maxCombo: 0,
  targets: [],
  stats: INITIAL_STATS,
  soundEnabled: true,
  hapticEnabled: true,
  difficulty: 'normal',

  setGameState: (state) => set({ gameState: state }),

  startGame: () => {
    const { stats, difficulty } = get();
    const startingLevel = DIFFICULTY_CONFIGS[difficulty].startingLevel;
    set({
      gameState: 'playing',
      score: 0,
      lives: 3,
      level: startingLevel,
      combo: 0,
      maxCombo: 0,
      targets: [],
      stats: { ...stats, totalGames: stats.totalGames + 1 },
    });
  },

  endGame: () => {
    const { score, maxCombo, stats } = get();
    const newHighScore = Math.max(stats.highScore, score);
    const newLongestStreak = Math.max(stats.longestStreak, maxCombo);

    set({
      gameState: 'gameover',
      stats: {
        ...stats,
        highScore: newHighScore,
        longestStreak: newLongestStreak,
      },
    });

    get().saveStats();
  },

  addScore: (points) => {
    const { combo } = get();
    const multiplier = 1 + Math.floor(combo / 5) * 0.5;
    const finalPoints = Math.round(points * multiplier);

    set((state) => ({
      score: state.score + finalPoints,
      stats: { ...state.stats, totalTaps: state.stats.totalTaps + 1 },
    }));
  },

  loseLife: () => {
    const { lives } = get();
    if (lives <= 1) {
      get().endGame();
    } else {
      set({ lives: lives - 1 });
    }
    get().resetCombo();
  },

  incrementCombo: () => {
    set((state) => ({
      combo: state.combo + 1,
      maxCombo: Math.max(state.maxCombo, state.combo + 1),
    }));
  },

  resetCombo: () => set({ combo: 0 }),

  setLevel: (level) => set({ level }),

  addTarget: (target) => {
    set((state) => ({
      targets: [...state.targets, target],
    }));
  },

  removeTarget: (id) => {
    set((state) => ({
      targets: state.targets.filter((t) => t.id !== id),
    }));
  },

  clearTargets: () => set({ targets: [] }),

  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

  toggleHaptic: () => set((state) => ({ hapticEnabled: !state.hapticEnabled })),

  setDifficulty: (difficulty) => set({ difficulty }),

  loadStats: async () => {
    try {
      const saved = await AsyncStorage.getItem('reflex-rush-stats');
      if (saved) {
        set({ stats: JSON.parse(saved) });
      }
    } catch (e) {
      console.log('Failed to load stats');
    }
  },

  saveStats: async () => {
    try {
      await AsyncStorage.setItem('reflex-rush-stats', JSON.stringify(get().stats));
    } catch (e) {
      console.log('Failed to save stats');
    }
  },
}));

export { TARGET_COLORS };
