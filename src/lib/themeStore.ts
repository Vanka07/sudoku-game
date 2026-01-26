import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark';

interface ThemeStore {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  loadTheme: () => Promise<void>;
}

const THEME_STORAGE_KEY = 'sudoku_theme';

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: 'dark',

  setTheme: async (theme) => {
    set({ theme });
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (e) {
      console.log('Failed to save theme:', e);
    }
  },

  toggleTheme: () => {
    const newTheme = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(newTheme);
  },

  loadTheme: async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') {
        set({ theme: saved });
      }
    } catch (e) {
      console.log('Failed to load theme:', e);
    }
  },
}));

// Theme colors
export const themes = {
  dark: {
    background: '#0A0A0F',
    backgroundSecondary: 'rgba(255, 255, 255, 0.03)',
    backgroundTertiary: 'rgba(255, 255, 255, 0.06)',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    textDim: '#4B5563',
    textDimmer: '#374151',
    border: 'rgba(255, 255, 255, 0.06)',
    borderLight: 'rgba(255, 255, 255, 0.05)',
    accent: '#6366F1',
    accentLight: '#818CF8',
    accentBg: 'rgba(99, 102, 241, 0.15)',
    accentBorder: 'rgba(99, 102, 241, 0.3)',
    gridLine: '#6366F1',
    cellBg: 'rgba(255, 255, 255, 0.02)',
    cellSelectedBg: 'rgba(99, 102, 241, 0.2)',
    cellHighlightBg: 'rgba(99, 102, 241, 0.08)',
    cellGivenText: '#FFFFFF',
    cellInputText: '#818CF8',
    cellErrorText: '#EF4444',
    gradient: ['#6366F1', '#8B5CF6'] as [string, string],
  },
  light: {
    background: '#F8FAFC',
    backgroundSecondary: 'rgba(0, 0, 0, 0.03)',
    backgroundTertiary: 'rgba(0, 0, 0, 0.06)',
    text: '#1E293B',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    textDim: '#CBD5E1',
    textDimmer: '#E2E8F0',
    border: 'rgba(0, 0, 0, 0.08)',
    borderLight: 'rgba(0, 0, 0, 0.05)',
    accent: '#6366F1',
    accentLight: '#818CF8',
    accentBg: 'rgba(99, 102, 241, 0.1)',
    accentBorder: 'rgba(99, 102, 241, 0.3)',
    gridLine: '#6366F1',
    cellBg: '#FFFFFF',
    cellSelectedBg: 'rgba(99, 102, 241, 0.15)',
    cellHighlightBg: 'rgba(99, 102, 241, 0.05)',
    cellGivenText: '#1E293B',
    cellInputText: '#6366F1',
    cellErrorText: '#DC2626',
    gradient: ['#6366F1', '#8B5CF6'] as [string, string],
  },
};

export type Theme = typeof themes.dark;
