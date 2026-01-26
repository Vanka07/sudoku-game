import React, { useEffect } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Play, Trophy, Volume2, VolumeX, Vibrate, Zap, Target, Flame } from 'lucide-react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
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
import { useGameStore, DIFFICULTY_CONFIGS, Difficulty } from '@/lib/gameStore';

const { width, height } = Dimensions.get('window');

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function PulsingOrb({ color, size, delay, x, y }: { color: string; size: number; delay: number; x: number; y: number }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.2);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.4, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.5, { duration: 2500 }),
          withTiming(0.15, { duration: 2500 })
        ),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
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
          borderRadius: size / 2,
          backgroundColor: color,
        },
      ]}
    />
  );
}

function GlowingTitle() {
  const glowOpacity = useSharedValue(0.4);

  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    textShadowColor: `rgba(0, 245, 255, ${glowOpacity.value})`,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 30,
  }));

  return (
    <Animated.View entering={FadeInDown.delay(200).springify()}>
      <Animated.Text
        style={[
          glowStyle,
          { fontFamily: 'Orbitron_900Black', fontSize: 46, color: '#fff', textAlign: 'center', letterSpacing: 3 },
        ]}
      >
        REFLEX
      </Animated.Text>
      <Animated.Text
        style={[
          glowStyle,
          { fontFamily: 'Orbitron_900Black', fontSize: 46, color: '#00F5FF', textAlign: 'center', letterSpacing: 3, marginTop: -10 },
        ]}
      >
        RUSH
      </Animated.Text>
    </Animated.View>
  );
}

function PlayButton({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);
  const innerGlow = useSharedValue(0.5);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    innerGlow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200 }),
        withTiming(0.5, { duration: 1200 })
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
      withTiming(0.85, { duration: 100 }),
      withSpring(1, { damping: 8, stiffness: 200 })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setTimeout(onPress, 150);
  };

  return (
    <Animated.View entering={FadeInUp.delay(400).springify()}>
      <AnimatedPressable style={animatedStyle} onPress={handlePress}>
        <LinearGradient
          colors={['#00F5FF', '#00D4FF', '#0099FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 150,
            height: 150,
            borderRadius: 75,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#00F5FF',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.9,
            shadowRadius: 40,
            elevation: 20,
          }}
        >
          <View
            style={{
              width: 126,
              height: 126,
              borderRadius: 63,
              backgroundColor: '#050508',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: 'rgba(0, 245, 255, 0.3)',
            }}
          >
            <Play size={56} color="#00F5FF" fill="#00F5FF" strokeWidth={0} style={{ marginLeft: 8 }} />
          </View>
        </LinearGradient>
      </AnimatedPressable>
    </Animated.View>
  );
}

function StatCard({ label, value, icon, color, delay }: { label: string; value: string | number; icon: React.ReactNode; color: string; delay: number }) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify()}
      className="flex-1 mx-1.5"
    >
      <View
        className="rounded-2xl p-4 items-center"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' }}
      >
        <View
          className="w-10 h-10 rounded-xl items-center justify-center mb-2"
          style={{ backgroundColor: `${color}20` }}
        >
          {icon}
        </View>
        <Text style={{ fontFamily: 'Orbitron_700Bold', fontSize: 22, color: '#fff' }}>
          {value}
        </Text>
        <Text style={{ fontFamily: 'Rajdhani_500Medium', fontSize: 11, color: '#666', letterSpacing: 1 }}>
          {label.toUpperCase()}
        </Text>
      </View>
    </Animated.View>
  );
}

function HowToPlayHint() {
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500 }),
        withTiming(0.6, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View entering={FadeIn.delay(900)} style={animatedStyle} className="items-center mt-6">
      <View className="flex-row items-center px-5 py-3 rounded-full" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
        <Target size={16} color="#00F5FF" />
        <Text style={{ fontFamily: 'Rajdhani_500Medium', fontSize: 14, color: '#888', marginLeft: 8 }}>
          Tap targets before they fade
        </Text>
        <View className="mx-2 w-1 h-1 rounded-full bg-gray-600" />
        <Zap size={16} color="#FFBE0B" />
        <Text style={{ fontFamily: 'Rajdhani_500Medium', fontSize: 14, color: '#888', marginLeft: 8 }}>
          Avoid red X
        </Text>
      </View>
    </Animated.View>
  );
}

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  casual: '#06FFA5',
  normal: '#00F5FF',
  hard: '#FFBE0B',
  insane: '#FF006E',
};

function DifficultySelector() {
  const difficulty = useGameStore((s) => s.difficulty);
  const setDifficulty = useGameStore((s) => s.setDifficulty);
  const difficulties: Difficulty[] = ['casual', 'normal', 'hard', 'insane'];

  return (
    <Animated.View entering={FadeInDown.delay(450).springify()} className="w-full mb-6">
      <Text style={{ fontFamily: 'Rajdhani_600SemiBold', fontSize: 12, color: '#555', textAlign: 'center', letterSpacing: 3, marginBottom: 12 }}>
        DIFFICULTY
      </Text>
      <View className="flex-row justify-center">
        {difficulties.map((diff) => {
          const config = DIFFICULTY_CONFIGS[diff];
          const isSelected = difficulty === diff;
          const color = DIFFICULTY_COLORS[diff];

          return (
            <Pressable
              key={diff}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setDifficulty(diff);
              }}
              className="mx-1.5 px-4 py-2.5 rounded-xl items-center"
              style={{
                backgroundColor: isSelected ? `${color}20` : 'rgba(255, 255, 255, 0.04)',
                borderWidth: 1.5,
                borderColor: isSelected ? color : 'rgba(255, 255, 255, 0.08)',
                minWidth: 75,
              }}
            >
              <Text
                style={{
                  fontFamily: 'Orbitron_600SemiBold',
                  fontSize: 11,
                  color: isSelected ? color : '#666',
                  letterSpacing: 0.5,
                }}
              >
                {config.label.toUpperCase()}
              </Text>
              <Text
                style={{
                  fontFamily: 'Rajdhani_400Regular',
                  fontSize: 9,
                  color: isSelected ? `${color}99` : '#444',
                  marginTop: 2,
                }}
              >
                LV.{config.startingLevel}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
}

export default function MenuScreen() {
  const router = useRouter();
  const stats = useGameStore((s) => s.stats);
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const hapticEnabled = useGameStore((s) => s.hapticEnabled);
  const toggleSound = useGameStore((s) => s.toggleSound);
  const toggleHaptic = useGameStore((s) => s.toggleHaptic);
  const loadStats = useGameStore((s) => s.loadStats);

  useEffect(() => {
    loadStats();
  }, []);

  const handlePlay = () => {
    router.push('/game');
  };

  return (
    <View className="flex-1 bg-[#050508]">
      {/* Background Orbs */}
      <PulsingOrb color="#FF006E" size={220} delay={0} x={-70} y={80} />
      <PulsingOrb color="#00F5FF" size={180} delay={600} x={width - 100} y={180} />
      <PulsingOrb color="#8338EC" size={200} delay={300} x={width / 2 - 100} y={height - 280} />
      <PulsingOrb color="#FFBE0B" size={120} delay={900} x={20} y={height - 180} />

      <SafeAreaView className="flex-1">
        <View className="flex-1 items-center justify-center px-6">
          {/* Title */}
          <View className="mb-10">
            <GlowingTitle />
            <Animated.View entering={FadeInDown.delay(300).springify()}>
              <Text style={{ fontFamily: 'Rajdhani_600SemiBold', fontSize: 15, color: '#555', textAlign: 'center', letterSpacing: 5, marginTop: 8 }}>
                TAP FAST. SCORE BIG.
              </Text>
            </Animated.View>
          </View>

          {/* Play Button */}
          <View className="mb-8">
            <PlayButton onPress={handlePlay} />
          </View>

          {/* Difficulty Selector */}
          <DifficultySelector />

          {/* Stats */}
          <Animated.View entering={FadeInDown.delay(500).springify()} className="w-full flex-row mb-4">
            <StatCard
              label="High Score"
              value={stats.highScore}
              icon={<Trophy size={20} color="#FFBE0B" />}
              color="#FFBE0B"
              delay={500}
            />
            <StatCard
              label="Games"
              value={stats.totalGames}
              icon={<Flame size={20} color="#FF006E" />}
              color="#FF006E"
              delay={550}
            />
            <StatCard
              label="Best Streak"
              value={stats.longestStreak}
              icon={<Zap size={20} color="#00F5FF" />}
              color="#00F5FF"
              delay={600}
            />
          </Animated.View>

          {/* How to Play Hint */}
          <HowToPlayHint />

          {/* Settings Row */}
          <Animated.View
            entering={FadeInUp.delay(700).springify()}
            className="flex-row items-center justify-center mt-8"
          >
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                toggleSound();
              }}
              className="w-14 h-14 rounded-full items-center justify-center mx-2"
              style={{
                backgroundColor: soundEnabled ? 'rgba(0, 245, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                borderWidth: 1,
                borderColor: soundEnabled ? 'rgba(0, 245, 255, 0.3)' : 'rgba(255, 255, 255, 0.08)',
              }}
            >
              {soundEnabled ? (
                <Volume2 size={22} color="#00F5FF" />
              ) : (
                <VolumeX size={22} color="#555" />
              )}
            </Pressable>
            <Pressable
              onPress={() => {
                if (hapticEnabled) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                toggleHaptic();
              }}
              className="w-14 h-14 rounded-full items-center justify-center mx-2"
              style={{
                backgroundColor: hapticEnabled ? 'rgba(255, 0, 110, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                borderWidth: 1,
                borderColor: hapticEnabled ? 'rgba(255, 0, 110, 0.3)' : 'rgba(255, 255, 255, 0.08)',
              }}
            >
              <Vibrate size={22} color={hapticEnabled ? '#FF006E' : '#555'} />
            </Pressable>
          </Animated.View>
        </View>

        {/* Footer */}
        <Animated.View entering={FadeInUp.delay(800).springify()} className="pb-4">
          <Text style={{ fontFamily: 'Rajdhani_400Regular', fontSize: 12, color: '#333', textAlign: 'center' }}>
            v1.0 • Made with caffeine and deadlines
          </Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
