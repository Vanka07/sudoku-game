import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, useWindowDimensions, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Grid3x3, Hash, Wrench } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useThemeStore, themes } from '@/lib/themeStore';
const ONBOARDING_KEY = 'hasSeenOnboarding';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface OnboardingStep {
  title: string;
  description: string;
  icon: (color: string) => React.ReactNode;
}

const steps: OnboardingStep[] = [
  {
    title: 'Tap a cell to select it',
    description: 'Touch any empty cell on the grid to highlight it. The row, column, and box will light up to help you see related cells.',
    icon: (color: string) => <Grid3x3 size={48} color={color} strokeWidth={1.5} />,
  },
  {
    title: 'Enter numbers 1–9',
    description: 'Use the number pad at the bottom to fill in your answer. If the number is wrong, it will turn red and count as a mistake.',
    icon: (color: string) => <Hash size={48} color={color} strokeWidth={1.5} />,
  },
  {
    title: 'Use notes, hints & undo',
    description: 'Toggle Notes mode to pencil in candidates. Use Hints when stuck, and Undo to reverse mistakes. You have 3 hints per game.',
    icon: (color: string) => <Wrench size={48} color={color} strokeWidth={1.5} />,
  },
];

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((value) => {
      if (value !== 'true') {
        setShowOnboarding(true);
      }
    });
  }, []);

  const dismissOnboarding = () => {
    setShowOnboarding(false);
    AsyncStorage.setItem(ONBOARDING_KEY, 'true').catch(() => {});
  };

  return { showOnboarding, dismissOnboarding };
}

export function OnboardingModal({
  visible,
  onDismiss,
}: {
  visible: boolean;
  onDismiss: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const theme = useThemeStore((s) => s.theme);
  const colors = themes[theme];
  const buttonScale = useSharedValue(1);

  const isLastStep = currentStep === steps.length - 1;
  const step = steps[currentStep];

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    buttonScale.value = withSequence(
      withTiming(0.92, { duration: 60 }),
      withSpring(1, { damping: 15 })
    );
    if (isLastStep) {
      onDismiss();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDismiss();
  };

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const { width } = useWindowDimensions();

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <Animated.View
        entering={FadeIn.duration(300)}
        style={{
          flex: 1,
          backgroundColor: theme === 'dark' ? 'rgba(10, 10, 15, 0.97)' : 'rgba(248, 250, 252, 0.97)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 32,
        }}
      >
        {/* Skip button (top right) */}
        {!isLastStep && (
          <Pressable
            onPress={handleSkip}
            style={{ position: 'absolute', top: 60, right: 24, padding: 8 }}
            accessibilityLabel="Skip onboarding"
            accessibilityRole="button"
          >
            <Text
              style={{
                fontFamily: 'Rajdhani_500Medium',
                fontSize: 15,
                color: colors.textMuted,
                letterSpacing: 1,
              }}
            >
              SKIP
            </Text>
          </Pressable>
        )}

        {/* Step Content */}
        <Animated.View
          key={currentStep}
          entering={SlideInRight.springify().damping(20)}
          exiting={SlideOutLeft.springify().damping(20)}
          style={{ alignItems: 'center', width: width - 64 }}
        >
          {/* Icon container */}
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 32,
              backgroundColor: colors.accentBg,
              borderWidth: 1,
              borderColor: colors.accentBorder,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 40,
            }}
          >
            {step.icon(colors.accentLight)}
          </View>

          {/* Title */}
          <Text
            style={{
              fontFamily: 'Rajdhani_700Bold',
              fontSize: 26,
              color: colors.text,
              letterSpacing: 1,
              textAlign: 'center',
              marginBottom: 16,
            }}
          >
            {step.title}
          </Text>

          {/* Description */}
          <Text
            style={{
              fontFamily: 'Rajdhani_400Regular',
              fontSize: 16,
              color: colors.textSecondary,
              textAlign: 'center',
              lineHeight: 24,
              paddingHorizontal: 8,
            }}
          >
            {step.description}
          </Text>
        </Animated.View>

        {/* Bottom: Dots + Button */}
        <View style={{ position: 'absolute', bottom: 80, alignItems: 'center' }}>
          {/* Dot pagination */}
          <View style={{ flexDirection: 'row', marginBottom: 32 }}>
            {steps.map((_, index) => (
              <View
                key={index}
                style={{
                  width: index === currentStep ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: index === currentStep ? colors.accent : colors.border,
                  marginHorizontal: 4,
                }}
              />
            ))}
          </View>

          {/* Next / Get Started button */}
          <AnimatedPressable
            style={buttonStyle}
            onPress={handleNext}
            accessibilityLabel={isLastStep ? 'Get Started' : 'Next step'}
            accessibilityRole="button"
          >
            <View
              style={{
                backgroundColor: colors.accent,
                paddingHorizontal: 48,
                paddingVertical: 14,
                borderRadius: 14,
                shadowColor: '#6366F1',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <Text
                style={{
                  fontFamily: 'Rajdhani_700Bold',
                  fontSize: 17,
                  color: '#FFFFFF',
                  letterSpacing: 3,
                }}
              >
                {isLastStep ? 'GET STARTED' : 'NEXT'}
              </Text>
            </View>
          </AnimatedPressable>
        </View>
      </Animated.View>
    </Modal>
  );
}
