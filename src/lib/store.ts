import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type StakeStatus = 'active' | 'pending_proof' | 'completed' | 'failed';
export type ChallengeCategory = 'fitness' | 'learning' | 'productivity' | 'health' | 'creative';

export interface Stake {
  id: string;
  challengeId: string;
  challengeTitle: string;
  category: ChallengeCategory;
  amount: number;
  deadline: Date;
  status: StakeStatus;
  proofSubmitted?: boolean;
  createdAt: Date;
  opponentName?: string;
  opponentAvatar?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: ChallengeCategory;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: string;
  minStake: number;
  maxStake: number;
  participants: number;
  successRate: number;
  icon: string;
  verificationMethod: string;
}

export interface UserStats {
  totalStaked: number;
  totalWon: number;
  totalLost: number;
  winStreak: number;
  completedChallenges: number;
  successRate: number;
}

interface AppState {
  // User
  userName: string;
  userAvatar: string;
  balance: number;
  stats: UserStats;

  // Stakes
  activeStakes: Stake[];
  completedStakes: Stake[];

  // Actions
  setUserName: (name: string) => void;
  addStake: (stake: Stake) => void;
  completeStake: (stakeId: string, won: boolean) => void;
  addBalance: (amount: number) => void;
  withdrawBalance: (amount: number) => void;
}

// Mock data for initial state
const mockActiveStakes: Stake[] = [
  {
    id: '1',
    challengeId: 'c1',
    challengeTitle: '30-Day Running Streak',
    category: 'fitness',
    amount: 50,
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    status: 'active',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    opponentName: 'Marcus_Fit',
    opponentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
  },
  {
    id: '2',
    challengeId: 'c2',
    challengeTitle: 'Learn 50 Spanish Words',
    category: 'learning',
    amount: 25,
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    status: 'pending_proof',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    opponentName: 'LingoMaster',
    opponentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
  },
  {
    id: '3',
    challengeId: 'c3',
    challengeTitle: 'No Social Media Weekend',
    category: 'health',
    amount: 30,
    deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    status: 'active',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    opponentName: 'DigitalDetox',
    opponentAvatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop',
  },
];

export const CHALLENGES: Challenge[] = [
  {
    id: 'c1',
    title: '30-Day Running Streak',
    description: 'Run at least 1 mile every day for 30 consecutive days. GPS verification required.',
    category: 'fitness',
    difficulty: 'hard',
    duration: '30 days',
    minStake: 20,
    maxStake: 500,
    participants: 2847,
    successRate: 34,
    icon: '🏃',
    verificationMethod: 'GPS tracking + photo proof',
  },
  {
    id: 'c2',
    title: 'Learn 50 Spanish Words',
    description: 'Master 50 new Spanish vocabulary words with 90%+ accuracy on quiz.',
    category: 'learning',
    difficulty: 'medium',
    duration: '7 days',
    minStake: 10,
    maxStake: 200,
    participants: 5231,
    successRate: 67,
    icon: '🇪🇸',
    verificationMethod: 'AI-proctored vocabulary quiz',
  },
  {
    id: 'c3',
    title: 'No Social Media Weekend',
    description: 'Stay off Instagram, TikTok, Twitter, and Facebook for 48 hours.',
    category: 'health',
    difficulty: 'medium',
    duration: '48 hours',
    minStake: 15,
    maxStake: 150,
    participants: 8924,
    successRate: 52,
    icon: '📵',
    verificationMethod: 'Screen time verification',
  },
  {
    id: 'c4',
    title: '100 Pushups Daily',
    description: 'Complete 100 pushups every day for 14 days. Can be split into sets.',
    category: 'fitness',
    difficulty: 'hard',
    duration: '14 days',
    minStake: 25,
    maxStake: 300,
    participants: 3156,
    successRate: 41,
    icon: '💪',
    verificationMethod: 'Video proof submission',
  },
  {
    id: 'c5',
    title: 'Read 1 Book',
    description: 'Finish reading one complete book of at least 200 pages.',
    category: 'learning',
    difficulty: 'easy',
    duration: '14 days',
    minStake: 10,
    maxStake: 100,
    participants: 12453,
    successRate: 78,
    icon: '📚',
    verificationMethod: 'Book summary + quiz',
  },
  {
    id: 'c6',
    title: 'Wake Up at 6 AM',
    description: 'Wake up at 6 AM or earlier every day for 7 consecutive days.',
    category: 'productivity',
    difficulty: 'medium',
    duration: '7 days',
    minStake: 15,
    maxStake: 200,
    participants: 7832,
    successRate: 45,
    icon: '⏰',
    verificationMethod: 'Morning selfie with timestamp',
  },
  {
    id: 'c7',
    title: 'Meditate Daily',
    description: 'Complete at least 10 minutes of guided meditation every day for 21 days.',
    category: 'health',
    difficulty: 'medium',
    duration: '21 days',
    minStake: 20,
    maxStake: 250,
    participants: 6547,
    successRate: 58,
    icon: '🧘',
    verificationMethod: 'App integration + session logs',
  },
  {
    id: 'c8',
    title: 'Write 1000 Words',
    description: 'Write at least 1000 words of creative content every day for 7 days.',
    category: 'creative',
    difficulty: 'hard',
    duration: '7 days',
    minStake: 20,
    maxStake: 200,
    participants: 2134,
    successRate: 39,
    icon: '✍️',
    verificationMethod: 'AI plagiarism check + word count',
  },
  {
    id: 'c9',
    title: 'No Coffee Challenge',
    description: 'Go without coffee or caffeine for 5 consecutive days.',
    category: 'health',
    difficulty: 'hard',
    duration: '5 days',
    minStake: 25,
    maxStake: 150,
    participants: 4521,
    successRate: 31,
    icon: '☕',
    verificationMethod: 'Daily check-in + honor system',
  },
  {
    id: 'c10',
    title: 'Drink 8 Glasses of Water',
    description: 'Drink at least 8 glasses of water every day for 14 days.',
    category: 'health',
    difficulty: 'easy',
    duration: '14 days',
    minStake: 10,
    maxStake: 100,
    participants: 9876,
    successRate: 72,
    icon: '💧',
    verificationMethod: 'Photo logging + tracking',
  },
];

export const useStore = create<AppState>((set, get) => ({
  userName: 'Alex',
  userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
  balance: 285.50,
  stats: {
    totalStaked: 1250,
    totalWon: 890,
    totalLost: 360,
    winStreak: 4,
    completedChallenges: 23,
    successRate: 71,
  },

  activeStakes: mockActiveStakes,
  completedStakes: [],

  setUserName: (name) => set({ userName: name }),

  addStake: (stake) => set((state) => ({
    activeStakes: [...state.activeStakes, stake],
    balance: state.balance - stake.amount,
  })),

  completeStake: (stakeId, won) => set((state) => {
    const stake = state.activeStakes.find(s => s.id === stakeId);
    if (!stake) return state;

    const updatedStake = { ...stake, status: won ? 'completed' : 'failed' as StakeStatus };
    const winnings = won ? stake.amount * 1.8 : 0; // 80% profit on wins (10% rake)

    return {
      activeStakes: state.activeStakes.filter(s => s.id !== stakeId),
      completedStakes: [...state.completedStakes, updatedStake],
      balance: state.balance + winnings,
      stats: {
        ...state.stats,
        totalWon: state.stats.totalWon + (won ? stake.amount * 0.8 : 0),
        totalLost: state.stats.totalLost + (won ? 0 : stake.amount),
        completedChallenges: state.stats.completedChallenges + 1,
        winStreak: won ? state.stats.winStreak + 1 : 0,
        successRate: Math.round(((state.stats.completedChallenges * state.stats.successRate / 100) + (won ? 1 : 0)) / (state.stats.completedChallenges + 1) * 100),
      },
    };
  }),

  addBalance: (amount) => set((state) => ({ balance: state.balance + amount })),
  withdrawBalance: (amount) => set((state) => ({ balance: Math.max(0, state.balance - amount) })),
}));
