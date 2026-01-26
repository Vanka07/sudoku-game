import React, { useEffect } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Grid3x3, Trophy, Clock, Flame, ChevronRight, Sun, Moon } from 'lucide-react-native';
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

const { width } = Dimensions.get('window');

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
    <AnimatedPressable style={animatedStyle} onPress={handlePress}>
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

function FloatingGrid({ delay, x, y, size }: { delay: number; x: number; y: number; size: number }) {
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
      <View className="flex-row items-center justify-center mb-3">
        <View
          className="w-16 h-16 rounded-2xl items-center justify-center"
          style={{
            backgroundColor: colors.accentBg,
            borderWidth: 1,
            borderColor: colors.accentBorder,
          }}
        >
          <Grid3x3 size={32} color={colors.accentLight} strokeWidth={1.5} />
        </View>
      </View>
      <Text
        style={{
          fontFamily: 'Rajdhani_700Bold',
          fontSize: 42,
          color: colors.text,
          letterSpacing: 6,
        }}
      >
        SUDOKU
      </Text>
      <Text
        style={{
          fontFamily: 'Rajdhani_400Regular',
          fontSize: 14,
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
}: {
  difficulty: Difficulty;
  isSelected: boolean;
  onSelect: () => void;
  delay: number;
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
      <AnimatedPressable style={animatedStyle} onPress={handlePress}>
        <View
          className="px-6 py-4 rounded-2xl flex-row items-center justify-between"
          style={{
            backgroundColor: isSelected ? `${config.color}15` : colors.backgroundSecondary,
            borderWidth: 1.5,
            borderColor: isSelected ? `${config.color}50` : colors.border,
            width: width - 64,
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
      <AnimatedPressable style={animatedStyle} onPress={handlePress}>
        <LinearGradient
          colors={['#6366F1', '#8B5CF6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingHorizontal: 64,
            paddingVertical: 18,
            borderRadius: 16,
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
              fontSize: 20,
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
        className="rounded-2xl p-4 items-center"
        style={{
          backgroundColor: colors.backgroundSecondary,
          borderWidth: 1,
          borderColor: colors.borderLight,
        }}
      >
        <View className="mb-2">{icon}</View>
        <Text
          style={{
            fontFamily: 'Rajdhani_700Bold',
            fontSize: 22,
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

export default function HomeScreen() {
  const router = useRouter();
  const difficulty = useSudokuStore((s) => s.difficulty);
  const setDifficulty = useSudokuStore((s) => s.setDifficulty);
  const startNewGame = useSudokuStore((s) => s.startNewGame);
  const stats = useSudokuStore((s) => s.stats);
  const loadStats = useSudokuStore((s) => s.loadStats);
  const theme = useThemeStore((s) => s.theme);
  const loadTheme = useThemeStore((s) => s.loadTheme);
  const colors = themes[theme];

  useEffect(() => {
    loadStats();
    loadTheme();
  }, []);

  const handleStartGame = () => {
    startNewGame(difficulty);
    router.push('/game');
  };

  const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Floating decorative grids */}
      <FloatingGrid delay={0} x={-40} y={80} size={120} />
      <FloatingGrid delay={500} x={width - 80} y={200} size={100} />
      <FloatingGrid delay={1000} x={30} y={500} size={80} />
      <FloatingGrid delay={1500} x={width - 120} y={600} size={140} />

      <SafeAreaView className="flex-1">
        {/* Theme Toggle at top right */}
        <View className="flex-row justify-end px-4 pt-2">
          <ThemeToggle />
        </View>

        <View className="flex-1 items-center justify-between px-8 pb-4">
          {/* Top section with Logo */}
          <View className="items-center">
            {/* Logo */}
            <Logo />

            {/* Spacer */}
            <View className="h-4" />

            {/* Difficulty Selection */}
            <Animated.View entering={FadeInDown.delay(200).springify()} className="mb-2">
              <Text
                style={{
                  fontFamily: 'Rajdhani_500Medium',
                  fontSize: 12,
                  color: colors.textDim,
                  letterSpacing: 4,
                  textAlign: 'center',
                  marginBottom: 12,
                }}
              >
                SELECT DIFFICULTY
              </Text>
            </Animated.View>

            <View className="space-y-3 mb-6">
              {difficulties.map((diff, index) => (
                <DifficultyButton
                  key={diff}
                  difficulty={diff}
                  isSelected={difficulty === diff}
                  onSelect={() => setDifficulty(diff)}
                  delay={250 + index * 50}
                />
              ))}
            </View>

            {/* Play Button */}
            <View className="mb-6">
              <PlayButton onPress={handleStartGame} />
            </View>
          </View>

          {/* Stats at bottom */}
          <View className="w-full flex-row px-2">
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
        </View>

        {/* Footer */}
        <Animated.View entering={FadeInUp.delay(800).springify()} className="pb-6 items-center">
          <Text
            style={{
              fontFamily: 'Rajdhani_400Regular',
              fontSize: 12,
              color: colors.textDimmer,
              textAlign: 'center',
            }}
          >
            Train your mind, one cell at a time
          </Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
