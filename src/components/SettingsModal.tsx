import React from 'react';
import { View, Text, Pressable, Modal, Switch } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useThemeStore, themes } from '@/lib/themeStore';
import { useSettingsStore } from '@/lib/settingsStore';

export function SettingsModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const theme = useThemeStore((s) => s.theme);
  const colors = themes[theme];
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const hapticEnabled = useSettingsStore((s) => s.hapticEnabled);
  const autoRemoveNotes = useSettingsStore((s) => s.autoRemoveNotes);
  const setSoundEnabled = useSettingsStore((s) => s.setSoundEnabled);
  const setHapticEnabled = useSettingsStore((s) => s.setHapticEnabled);
  const setAutoRemoveNotes = useSettingsStore((s) => s.setAutoRemoveNotes);

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <Animated.View
        entering={FadeIn.duration(200)}
        style={{
          flex: 1,
          backgroundColor: theme === 'dark' ? 'rgba(10, 10, 15, 0.95)' : 'rgba(248, 250, 252, 0.95)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 32,
        }}
      >
        <View
          style={{
            width: '100%',
            maxWidth: 340,
            backgroundColor: theme === 'dark' ? '#12121A' : '#FFFFFF',
            borderRadius: 20,
            padding: 24,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Text
              style={{
                fontFamily: 'Rajdhani_700Bold',
                fontSize: 22,
                color: colors.text,
                letterSpacing: 2,
              }}
            >
              SETTINGS
            </Text>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onClose();
              }}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: colors.backgroundSecondary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              accessibilityLabel="Close settings"
              accessibilityRole="button"
            >
              <X size={18} color={colors.textMuted} />
            </Pressable>
          </View>

          {/* Sound Toggle */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderBottomColor: colors.borderLight,
            }}
          >
            <View>
              <Text
                style={{
                  fontFamily: 'Rajdhani_600SemiBold',
                  fontSize: 16,
                  color: colors.text,
                }}
              >
                Sound Effects
              </Text>
              <Text
                style={{
                  fontFamily: 'Rajdhani_400Regular',
                  fontSize: 13,
                  color: colors.textMuted,
                }}
              >
                Audio feedback on actions
              </Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={(val) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSoundEnabled(val);
              }}
              trackColor={{ false: colors.border, true: `${colors.accent}80` }}
              thumbColor={soundEnabled ? colors.accent : colors.textDim}
              accessibilityLabel="Toggle sound effects"
            />
          </View>

          {/* Haptic Toggle */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderBottomColor: colors.borderLight,
            }}
          >
            <View>
              <Text
                style={{
                  fontFamily: 'Rajdhani_600SemiBold',
                  fontSize: 16,
                  color: colors.text,
                }}
              >
                Haptic Feedback
              </Text>
              <Text
                style={{
                  fontFamily: 'Rajdhani_400Regular',
                  fontSize: 13,
                  color: colors.textMuted,
                }}
              >
                Vibration on interactions
              </Text>
            </View>
            <Switch
              value={hapticEnabled}
              onValueChange={(val) => {
                if (val) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setHapticEnabled(val);
              }}
              trackColor={{ false: colors.border, true: `${colors.accent}80` }}
              thumbColor={hapticEnabled ? colors.accent : colors.textDim}
              accessibilityLabel="Toggle haptic feedback"
            />
          </View>

          {/* Auto-remove Notes Toggle */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 14,
            }}
          >
            <View>
              <Text
                style={{
                  fontFamily: 'Rajdhani_600SemiBold',
                  fontSize: 16,
                  color: colors.text,
                }}
              >
                Auto-remove Notes
              </Text>
              <Text
                style={{
                  fontFamily: 'Rajdhani_400Regular',
                  fontSize: 13,
                  color: colors.textMuted,
                }}
              >
                Clear notes when number is placed
              </Text>
            </View>
            <Switch
              value={autoRemoveNotes}
              onValueChange={(val) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setAutoRemoveNotes(val);
              }}
              trackColor={{ false: colors.border, true: `${colors.accent}80` }}
              thumbColor={autoRemoveNotes ? colors.accent : colors.textDim}
              accessibilityLabel="Toggle auto-remove notes"
            />
          </View>

          {/* Version info */}
          <Text
            style={{
              fontFamily: 'Rajdhani_400Regular',
              fontSize: 12,
              color: colors.textDimmer,
              textAlign: 'center',
              marginTop: 20,
            }}
          >
            Sudoku Minimalist v1.0.0
          </Text>
        </View>
      </Animated.View>
    </Modal>
  );
}
