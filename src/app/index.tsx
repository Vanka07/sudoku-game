import React, { useEffect } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Play, Trophy, Settings, Volume2, VolumeX, Vibrate, Zap } from 'lucide-react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useGameStore } from '@/lib/gameStore';

const { width, height } = Dimensions.get('window');

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function PulsingOrb({ color, size, delay, x, y }: { color: string; size: number; delay: number; x: number; y: number }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.5, { duration: 2000 + delay, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000 + delay, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 2000 + delay }),
        withTiming(0.2, { duration: 2000 + delay })
      ),
      -1,
      true
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
  const glowOpacity = useSharedValue(0.5);

  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.5, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    textShadowColor: `rgba(0, 245, 255, ${glowOpacity.value})`,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  }));

  return (
    <Animated.View entering={FadeInDown.delay(200).springify()}>
      <Animated.Text
        style={[
          glowStyle,
          { fontFamily: 'Orbitron_900Black', fontSize: 42, color: '#fff', textAlign: 'center', letterSpacing: 2 },
        ]}
      >
        REFLEX
      </Animated.Text>
      <Animated.Text
        style={[
          glowStyle,
          { fontFamily: 'Orbitron_900Black', fontSize: 42, color: '#00F5FF', textAlign: 'center', letterSpacing: 2, marginTop: -8 },
        ]}
      >
        RUSH
      </Animated.Text>
    </Animated.View>
  );
}

function PlayButton({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
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
      withTiming(0.9, { duration: 100 }),
      withSpring(1, { damping: 10 })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onPress();
  };

  return (
    <Animated.View entering={FadeInUp.delay(400).springify()}>
      <AnimatedPressable style={animatedStyle} onPress={handlePress}>
        <LinearGradient
          colors={['#00F5FF', '#00D4FF', '#0099FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 140,
            height: 140,
            borderRadius: 70,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#00F5FF',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 30,
            elevation: 20,
          }}
        >
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: '#050508',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Play size={50} color="#00F5FF" fill="#00F5FF" strokeWidth={0} style={{ marginLeft: 8 }} />
          </View>
        </LinearGradient>
      </AnimatedPressable>
    </Animated.View>
  );
}

function StatCard({ label, value, icon, delay }: { label: string; value: string | number; icon: React.ReactNode; delay: number }) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify()}
      className="flex-1 mx-1.5"
    >
      <View
        className="bg-white/5 rounded-2xl p-4 items-center"
        style={{ borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' }}
      >
        <View className="mb-2">{icon}</View>
        <Text style={{ fontFamily: 'Orbitron_700Bold' }} className="text-white text-xl">
          {value}
        </Text>
        <Text style={{ fontFamily: 'Rajdhani_500Medium' }} className="text-gray-400 text-xs uppercase tracking-wider">
          {label}
        </Text>
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
      <PulsingOrb color="#FF006E" size={200} delay={0} x={-50} y={100} />
      <PulsingOrb color="#00F5FF" size={150} delay={500} x={width - 80} y={200} />
      <PulsingOrb color="#8338EC" size={180} delay={300} x={width / 2 - 90} y={height - 300} />
      <PulsingOrb color="#FFBE0B" size={100} delay={700} x={30} y={height - 200} />

      <SafeAreaView className="flex-1">
        <View className="flex-1 items-center justify-center px-6">
          {/* Title */}
          <View className="mb-12">
            <GlowingTitle />
            <Animated.View entering={FadeInDown.delay(300).springify()}>
              <Text style={{ fontFamily: 'Rajdhani_500Medium' }} className="text-gray-400 text-center text-lg mt-4 tracking-widest">
                TAP FAST. SCORE BIG.
              </Text>
            </Animated.View>
          </View>

          {/* Play Button */}
          <View className="mb-16">
            <PlayButton onPress={handlePlay} />
          </View>

          {/* Stats */}
          <View className="w-full flex-row mb-8">
            <StatCard
              label="High Score"
              value={stats.highScore}
              icon={<Trophy size={20} color="#FFBE0B" />}
              delay={500}
            />
            <StatCard
              label="Games"
              value={stats.totalGames}
              icon={<Zap size={20} color="#00F5FF" />}
              delay={550}
            />
            <StatCard
              label="Best Streak"
              value={stats.longestStreak}
              icon={<Zap size={20} color="#FF006E" />}
              delay={600}
            />
          </View>

          {/* Settings Row */}
          <Animated.View
            entering={FadeInUp.delay(700).springify()}
            className="flex-row items-center justify-center"
          >
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                toggleSound();
              }}
              className="w-14 h-14 rounded-full items-center justify-center mx-2"
              style={{ backgroundColor: soundEnabled ? 'rgba(0, 245, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)' }}
            >
              {soundEnabled ? (
                <Volume2 size={24} color="#00F5FF" />
              ) : (
                <VolumeX size={24} color="#6B7280" />
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
              style={{ backgroundColor: hapticEnabled ? 'rgba(255, 0, 110, 0.15)' : 'rgba(255, 255, 255, 0.05)' }}
            >
              <Vibrate size={24} color={hapticEnabled ? '#FF006E' : '#6B7280'} />
            </Pressable>
          </Animated.View>
        </View>

        {/* Footer */}
        <Animated.View entering={FadeInUp.delay(800).springify()} className="pb-4">
          <Text style={{ fontFamily: 'Rajdhani_400Regular' }} className="text-gray-600 text-center text-xs">
            Tap targets before they disappear
          </Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
