import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

const SETTINGS_STORAGE_KEY = 'sudoku_settings';

export type SoundType = 'tap' | 'place' | 'error' | 'correct' | 'win' | 'hint';

interface Settings {
  soundEnabled: boolean;
  hapticEnabled: boolean;
  autoRemoveNotes: boolean;
}

interface SettingsStore extends Settings {
  loadSettings: () => Promise<void>;
  setSoundEnabled: (enabled: boolean) => void;
  setHapticEnabled: (enabled: boolean) => void;
  setAutoRemoveNotes: (enabled: boolean) => void;
  playSound: (type: SoundType) => void;
  triggerHaptic: (style?: Haptics.ImpactFeedbackStyle) => void;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  soundEnabled: true,
  hapticEnabled: true,
  autoRemoveNotes: true,

  loadSettings: async () => {
    try {
      const data = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (data) {
        const saved = JSON.parse(data) as Partial<Settings>;
        set({
          soundEnabled: saved.soundEnabled ?? true,
          hapticEnabled: saved.hapticEnabled ?? true,
          autoRemoveNotes: saved.autoRemoveNotes ?? true,
        });
      }
    } catch (e) {
      console.log('Failed to load settings:', e);
    }
  },

  setSoundEnabled: (enabled: boolean) => {
    set({ soundEnabled: enabled });
    const { hapticEnabled, autoRemoveNotes } = get();
    AsyncStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ soundEnabled: enabled, hapticEnabled, autoRemoveNotes })
    ).catch(() => {});
  },

  setHapticEnabled: (enabled: boolean) => {
    set({ hapticEnabled: enabled });
    const { soundEnabled, autoRemoveNotes } = get();
    AsyncStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ soundEnabled, hapticEnabled: enabled, autoRemoveNotes })
    ).catch(() => {});
  },

  setAutoRemoveNotes: (enabled: boolean) => {
    set({ autoRemoveNotes: enabled });
    const { soundEnabled, hapticEnabled } = get();
    AsyncStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ soundEnabled, hapticEnabled, autoRemoveNotes: enabled })
    ).catch(() => {});
  },

  /**
   * Play a sound effect. Currently uses haptic feedback as a placeholder.
   * When real audio files are added, this will use expo-av Audio.Sound.
   */
  playSound: (type: SoundType) => {
    const { soundEnabled, hapticEnabled } = get();
    if (!soundEnabled) return;

    // For now, use haptic feedback as sound substitute
    if (hapticEnabled) {
      switch (type) {
        case 'tap':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'place':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'error':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        case 'correct':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'win':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'hint':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
      }
    }
  },

  triggerHaptic: (style = Haptics.ImpactFeedbackStyle.Light) => {
    const { hapticEnabled } = get();
    if (!hapticEnabled) return;
    Haptics.impactAsync(style);
  },
}));
