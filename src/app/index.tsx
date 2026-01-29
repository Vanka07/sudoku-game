import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Grid3x3, Trophy, Clock, Flame, ChevronRight, Sun, Moon, Calendar, CheckCircle2, Zap, Settings } from 'lucide-react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSudokuStore, DIFFICULTY_CONFIG, Difficulty } from '@/lib/sudokuStore';
import { useThemeStore, themes } from '@/lib/themeStore';
import { useSettingsStore } from '@/lib/settingsStore';
import { OnboardingModal, useOnboarding } from '@/components/OnboardingModal';
import { SettingsModal } from '@/components/SettingsModal';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const colors = themes[theme];
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.9, { duration: 50 }),
      withSpring(1, { damping: 15 })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleTheme();
  };

  return (
    <AnimatedPressable
      style={animatedStyle}
      onPress={handlePress}
      accessibilityLabel={`Toggle ${theme === 'dark' ? 'light' : 'dark'} theme`}
      accessibilityRole="button"
    >
      <View
        className="w-11 h-11 rounded-full items-center justify-center"
        style={{
          backgroundColor: colors.backgroundSecondary,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        {theme === 'dark' ? (
          <Sun size={20} color={colors.textSecondary} />
        ) : (
          <Moon size={20} color={colors.textSecondary} />
        )}
      </View>
    </AnimatedPressable>
  );
}

function SettingsButton({ onPress }: { onPress: () => void }) {
  const theme = useThemeStore((s) => s.theme);
  const colors = themes[theme];
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.9, { duration: 50 }),
      withSpring(1, { damping: 15 })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <AnimatedPressable
      style={[animatedStyle, { marginRight: 8 }]}
      onPress={handlePress}
      accessibilityLabel="Open settings"
      accessibilityRole="button"
    >
      <View
        className="w-11 h-11 rounded-full items-center justify-center"
        style={{
          backgroundColor: colors.backgroundSecondary,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Settings size={20} color={colors.textSecondary} />
      </View>
    </AnimatedPressable>
  );
}

function FloatingGrid({ delay, x, y, size, screenWidth }: { delay: number; x: number; y: number; size: number; screenWidth: number }) {
  const theme = useThemeStore((s) => s.theme);
  const colors = themes[theme];
  const opacity = useSharedValue(0.03);
  const rotate = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.08, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.03, { duration: 3000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
    rotate.value = withDelay(
      delay,
      withRepeat(
        withTiming(360, { duration: 60000, easing: Easing.linear }),
        -1
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ rotate: `${rotate.value}deg` }],
  }));

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          position: 'absolute',
          left: x,
          top: y,
          width: size,
          height: size,
        },
      ]}
    >
      {/* Simple grid pattern */}
      <View className="flex-1 flex-row flex-wrap">
        {Array(9).fill(0).map((_, i) => (
          <View
            key={i}
            style={{
              width: size / 3,
              height: size / 3,
              borderWidth: 0.5,
              borderColor: colors.accent,
            }}
          />
        ))}
      </View>
    </Animated.View>
  );
}

function Logo() {
  const theme = useThemeStore((s) => s.theme);
  const colors = themes[theme];

  return (
    <Animated.View entering={FadeInDown.delay(100).springify()} className="items-center mb-2">
      <View className="flex-row items-center justify-center mb-2">
        <View
          className="w-14 h-14 rounded-2xl items-center justify-center"
          style={{
            backgroundColor: colors.accentBg,
            borderWidth: 1,
            borderColor: colors.accentBorder,
          }}
        >
          <Grid3x3 size={28} color={colors.accentLight} strokeWidth={1.5} />
        </View>
      </View>
      <Text
        style={{
          fontFamily: 'Rajdhani_700Bold',
          fontSize: 38,
          color: colors.text,
          letterSpacing: 6,
        }}
      >
        SUDOKU
      </Text>
      <Text
        style={{
          fontFamily: 'Rajdhani_400Regular',
          fontSize: 12,
          color: colors.textMuted,
          letterSpacing: 8,
          marginTop: -4,
        }}
      >
        MINIMALIST
      </Text>
    </Animated.View>
  );
}

function DifficultyButton({
  difficulty,
  isSelected,
  onSelect,
  delay,
  screenWidth,
}: {
  difficulty: Difficulty;
  isSelected: boolean;
  onSelect: () => void;
  delay: number;
  screenWidth: number;
}) {
  const config = DIFFICULTY_CONFIG[difficulty];
  const theme = useThemeStore((s) => s.theme);
  const colors = themes[theme];
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.95, { duration: 50 }),
      withSpring(1, { damping: 15 })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect();
  };

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()}>
      <AnimatedPressable
        style={animatedStyle}
        onPress={handlePress}
        accessibilityLabel={`${config.label} difficulty${isSelected ? ', selected' : ''}`}
        accessibilityRole="button"
      >
        <View
          className="px-6 py-3.5 rounded-2xl flex-row items-center justify-between"
          style={{
            backgroundColor: isSelected ? `${config.color}15` : colors.backgroundSecondary,
            borderWidth: 1.5,
            borderColor: isSelected ? `${config.color}50` : colors.border,
            width: screenWidth - 64,
          }}
        >
          <View className="flex-row items-center">
            <View
              className="w-3 h-3 rounded-full mr-4"
              style={{ backgroundColor: config.color }}
            />
            <Text
              style={{
                fontFamily: 'Rajdhani_600SemiBold',
                fontSize: 18,
                color: isSelected ? config.color : colors.textSecondary,
                letterSpacing: 1,
              }}
            >
              {config.label}
            </Text>
          </View>
          <ChevronRight size={20} color={isSelected ? config.color : colors.textDim} />
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

function PlayButton({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.92, { duration: 80 }),
      withSpring(1, { damping: 12 })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTimeout(onPress, 100);
  };

  return (
    <Animated.View entering={FadeInUp.delay(500).springify()}>
      <AnimatedPressable
        style={animatedStyle}
        onPress={handlePress}
        accessibilityLabel="Start new game"
        accessibilityRole="button"
      >
        <LinearGradient
          colors={['#6366F1', '#8B5CF6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingHorizontal: 56,
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
              fontSize: 18,
              color: '#FFFFFF',
              letterSpacing: 4,
            }}
          >
            START GAME
          </Text>
        </LinearGradient>
      </AnimatedPressable>
    </Animated.View>
  );
}

function StatCard({
  label,
  value,
  icon,
  delay,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  delay: number;
}) {
  const theme = useThemeStore((s) => s.theme);
  const colors = themes[theme];

  return (
    <Animated.View entering={FadeInUp.delay(delay).springify()} className="flex-1 mx-1.5">
      <View
        className="rounded-xl p-3 items-center"
        style={{
          backgroundColor: colors.backgroundSecondary,
          borderWidth: 1,
          borderColor: colors.borderLight,
        }}
        accessibilityLabel={`${label}: ${value}`}
      >
        <View className="mb-1">{icon}</View>
        <Text
          style={{
            fontFamily: 'Rajdhani_700Bold',
            fontSize: 20,
            color: colors.text,
          }}
        >
          {value}
        </Text>
        <Text
          style={{
            fontFamily: 'Rajdhani_400Regular',
            fontSize: 11,
            color: colors.textMuted,
            letterSpacing: 1,
          }}
        >
          {label.toUpperCase()}
        </Text>
      </View>
    </Animated.View>
  );
}

function formatTime(seconds: number | null): string {
  if (seconds === null) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function DailyChallengeCard({ onPress, screenWidth }: { onPress: () => void; screenWidth: number }) {
  const theme = useThemeStore((s) => s.theme);
  const colors = themes[theme];
  const dailyChallenge = useSudokuStore((s) => s.dailyChallenge);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (dailyChallenge.completed) return;
    scale.value = withSequence(
      withTiming(0.97, { duration: 50 }),
      withSpring(1, { damping: 15 })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Animated.View entering={FadeInDown.delay(150).springify()}>
      <AnimatedPressable
        style={animatedStyle}
        onPress={handlePress}
        accessibilityLabel={
          dailyChallenge.completed
            ? `Daily challenge completed in ${formatTime(dailyChallenge.bestTime)}`
            : 'Start daily challenge'
        }
        accessibilityRole="button"
      >
        <LinearGradient
          colors={dailyChallenge.completed
            ? (theme === 'dark' ? ['#064E3B', '#065F46'] : ['#D1FAE5', '#A7F3D0'])
            : (theme === 'dark' ? ['#312E81', '#3730A3'] : ['#E0E7FF', '#C7D2FE'])
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: screenWidth - 64,
            padding: 12,
            borderRadius: 14,
            marginBottom: 14,
            borderWidth: 1,
            borderColor: dailyChallenge.completed
              ? (theme === 'dark' ? '#10B981' : '#34D399')
              : (theme === 'dark' ? '#6366F1' : '#818CF8'),
          }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View
                className="w-10 h-10 rounded-lg items-center justify-center mr-3"
                style={{
                  backgroundColor: dailyChallenge.completed
                    ? (theme === 'dark' ? '#10B98130' : '#10B98120')
                    : (theme === 'dark' ? '#6366F130' : '#6366F120'),
                }}
              >
                {dailyChallenge.completed ? (
                  <CheckCircle2 size={24} color={theme === 'dark' ? '#10B981' : '#059669'} />
                ) : (
                  <Calendar size={24} color={theme === 'dark' ? '#818CF8' : '#6366F1'} />
                )}
              </View>
              <View className="flex-1">
                <Text
                  style={{
                    fontFamily: 'Rajdhani_700Bold',
                    fontSize: 16,
                    color: dailyChallenge.completed
                      ? (theme === 'dark' ? '#10B981' : '#059669')
                      : (theme === 'dark' ? '#E0E7FF' : '#3730A3'),
                    letterSpacing: 1,
                  }}
                >
                  DAILY CHALLENGE
                </Text>
                <Text
                  style={{
                    fontFamily: 'Rajdhani_500Medium',
                    fontSize: 13,
                    color: dailyChallenge.completed
                      ? (theme === 'dark' ? '#6EE7B7' : '#047857')
                      : (theme === 'dark' ? '#A5B4FC' : '#4F46E5'),
                  }}
                >
                  {dailyChallenge.completed
                    ? `Completed in ${formatTime(dailyChallenge.bestTime)}`
                    : 'New puzzle every day'
                  }
                </Text>
              </View>
            </View>

            {/* Streak badge */}
            {dailyChallenge.streak > 0 && (
              <View
                className="flex-row items-center px-3 py-1.5 rounded-full"
                style={{
                  backgroundColor: theme === 'dark' ? '#F59E0B20' : '#FEF3C7',
                }}
              >
                <Zap size={14} color="#F59E0B" fill="#F59E0B" />
                <Text
                  style={{
                    fontFamily: 'Rajdhani_700Bold',
                    fontSize: 14,
                    color: '#F59E0B',
                    marginLeft: 4,
                  }}
                >
                  {dailyChallenge.streak}
                </Text>
              </View>
            )}

            {!dailyChallenge.completed && (
              <ChevronRight
                size={20}
                color={theme === 'dark' ? '#818CF8' : '#6366F1'}
                style={{ marginLeft: 8 }}
              />
            )}
          </View>
        </LinearGradient>
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const difficulty = useSudokuStore((s) => s.difficulty);
  const setDifficulty = useSudokuStore((s) => s.setDifficulty);
  const startNewGame = useSudokuStore((s) => s.startNewGame);
  const startDailyChallenge = useSudokuStore((s) => s.startDailyChallenge);
  const loadGameState = useSudokuStore((s) => s.loadGameState);
  const isPlaying = useSudokuStore((s) => s.isPlaying);
  const stats = useSudokuStore((s) => s.stats);
  const loadStats = useSudokuStore((s) => s.loadStats);
  const loadDailyChallenge = useSudokuStore((s) => s.loadDailyChallenge);
  const theme = useThemeStore((s) => s.theme);
  const loadTheme = useThemeStore((s) => s.loadTheme);
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const colors = themes[theme];

  const { width } = useWindowDimensions();
  const { showOnboarding, dismissOnboarding } = useOnboarding();
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadStats();
    loadTheme();
    loadDailyChallenge();
    loadGameState();
    loadSettings();
  }, []);

  const handleStartGame = () => {
    startNewGame(difficulty);
    router.push('/game');
  };

  const handleResumeGame = () => {
    router.push('/game');
  };

  const handleStartDailyChallenge = () => {
    startDailyChallenge();
    router.push('/game');
  };

  const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Floating decorative grids */}
      <FloatingGrid delay={0} x={-40} y={80} size={120} screenWidth={width} />
      <FloatingGrid delay={500} x={width - 80} y={200} size={100} screenWidth={width} />
      <FloatingGrid delay={1000} x={30} y={500} size={80} screenWidth={width} />
      <FloatingGrid delay={1500} x={width - 120} y={600} size={140} screenWidth={width} />

      <SafeAreaView className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Top bar: Settings + Theme Toggle */}
          <View className="flex-row justify-end px-4 pt-2">
            <SettingsButton onPress={() => setShowSettings(true)} />
            <ThemeToggle />
          </View>

          <View className="flex-1 items-center px-8 pb-4">
            {/* Logo */}
            <Logo />

            {/* Spacer */}
            <View className="h-3" />

            {/* Continue Game button (shown when a game is in progress) */}
            {isPlaying && (
              <Animated.View entering={FadeInDown.delay(120).springify()} className="mb-3">
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    handleResumeGame();
                  }}
                  style={{
                    maxWidth: width - 64,
                    width: '100%',
                    paddingVertical: 14,
                    borderRadius: 14,
                    alignItems: 'center',
                    backgroundColor: colors.accentBg,
                    borderWidth: 1,
                    borderColor: colors.accentBorder,
                  }}
                  accessibilityLabel="Continue current game"
                  accessibilityRole="button"
                >
                  <Text
                    style={{
                      fontFamily: 'Rajdhani_700Bold',
                      fontSize: 17,
                      color: colors.accentLight,
                      letterSpacing: 3,
                    }}
                  >
                    CONTINUE GAME
                  </Text>
                </Pressable>
              </Animated.View>
            )}

            {/* Daily Challenge Card */}
            <DailyChallengeCard onPress={handleStartDailyChallenge} screenWidth={width} />

            {/* Difficulty Selection */}
            <Animated.View entering={FadeInDown.delay(200).springify()} className="mb-2">
              <Text
                style={{
                  fontFamily: 'Rajdhani_500Medium',
                  fontSize: 12,
                  color: colors.textDim,
                  letterSpacing: 4,
                  textAlign: 'center',
                  marginBottom: 8,
                }}
              >
                SELECT DIFFICULTY
              </Text>
            </Animated.View>

            <View className="space-y-2.5 mb-8">
              {difficulties.map((diff, index) => (
                <DifficultyButton
                  key={diff}
                  difficulty={diff}
                  isSelected={difficulty === diff}
                  onSelect={() => setDifficulty(diff)}
                  delay={250 + index * 50}
                  screenWidth={width}
                />
              ))}
            </View>

            {/* Play Button */}
            <View className="mb-10">
              <PlayButton onPress={handleStartGame} />
            </View>

            {/* Stats */}
            <View className="w-full flex-row px-2 mb-4">
              <StatCard
                label="Games Won"
                value={stats.gamesWon}
                icon={<Trophy size={20} color="#F59E0B" />}
                delay={600}
              />
              <StatCard
                label="Best Time"
                value={formatTime(stats.bestTime[difficulty])}
                icon={<Clock size={20} color="#60A5FA" />}
                delay={650}
              />
              <StatCard
                label="Streak"
                value={stats.currentStreak}
                icon={<Flame size={20} color="#EF4444" />}
                delay={700}
              />
            </View>

            {/* Footer */}
            <Text
              style={{
                fontFamily: 'Rajdhani_400Regular',
                fontSize: 12,
                color: colors.textDimmer,
                textAlign: 'center',
                marginTop: 4,
                marginBottom: 8,
              }}
            >
              Train your mind, one cell at a time
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Onboarding Modal */}
      <OnboardingModal visible={showOnboarding} onDismiss={dismissOnboarding} />

      {/* Settings Modal */}
      <SettingsModal visible={showSettings} onClose={() => setShowSettings(false)} />
    </View>
  );
}
