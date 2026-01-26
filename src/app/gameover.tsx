import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Dimensions, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { RotateCcw, Home, Trophy, Zap, Target, Share2, TrendingUp, Award } from 'lucide-react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
  withDelay,
  Easing,
  BounceIn,
  SlideInRight,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useGameStore } from '@/lib/gameStore';

const { width } = Dimensions.get('window');

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Confetti particle for celebration
function ConfettiParticle({ delay, color }: { delay: number; color: string }) {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(Math.random() * width);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withDelay(delay, withTiming(800, { duration: 3000, easing: Easing.out(Easing.quad) }));
    translateX.value = withDelay(delay, withTiming(translateX.value + (Math.random() - 0.5) * 100, { duration: 3000 }));
    rotate.value = withDelay(delay, withRepeat(withTiming(360, { duration: 1000 }), -1, false));
    opacity.value = withDelay(delay + 2000, withTiming(0, { duration: 1000 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        style,
        {
          position: 'absolute',
          width: 10,
          height: 10,
          backgroundColor: color,
          borderRadius: 2,
        },
      ]}
    />
  );
}

function AnimatedScore({ score, isHighScore }: { score: number; isHighScore: boolean }) {
  const scale = useSharedValue(0.5);
  const glowOpacity = useSharedValue(0);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    // Count up animation with satisfying curve
    const duration = 1800;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Custom easing for satisfying number tick
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = Math.round(score * eased);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
    scale.value = withSpring(1, { damping: 10, stiffness: 80 });

    if (isHighScore) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 800 }),
          withTiming(0.4, { duration: 800 })
        ),
        -1,
        true
      );
    }
  }, [score, isHighScore]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    textShadowColor: `rgba(255, 190, 11, ${glowOpacity.value})`,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 40,
  }));

  return (
    <Animated.View style={animatedStyle} className="items-center">
      {isHighScore && (
        <Animated.View entering={BounceIn.delay(800)} className="flex-row items-center mb-3">
          <LinearGradient
            colors={['#FFBE0B', '#FF8800']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}
          >
            <Trophy size={18} color="#000" />
            <Text style={{ fontFamily: 'Rajdhani_700Bold', color: '#000', fontSize: 14, marginLeft: 6, letterSpacing: 1 }}>
              NEW HIGH SCORE!
            </Text>
          </LinearGradient>
        </Animated.View>
      )}
      <Animated.Text
        style={[
          glowStyle,
          {
            fontFamily: 'Orbitron_900Black',
            fontSize: 80,
            color: isHighScore ? '#FFBE0B' : '#00F5FF',
          },
        ]}
      >
        {displayValue}
      </Animated.Text>
      <Text style={{ fontFamily: 'Rajdhani_500Medium', fontSize: 16, color: '#666', letterSpacing: 6 }}>
        POINTS
      </Text>
    </Animated.View>
  );
}

function StatRow({ icon, label, value, highlight, delay }: { icon: React.ReactNode; label: string; value: string | number; highlight?: boolean; delay: number }) {
  return (
    <Animated.View
      entering={SlideInRight.delay(delay).springify()}
      className="flex-row items-center justify-between py-4"
      style={{ borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.05)' }}
    >
      <View className="flex-row items-center">
        <View
          className="w-9 h-9 rounded-xl items-center justify-center mr-3"
          style={{ backgroundColor: highlight ? 'rgba(255, 190, 11, 0.2)' : 'rgba(255, 255, 255, 0.08)' }}
        >
          {icon}
        </View>
        <Text style={{ fontFamily: 'Rajdhani_500Medium', fontSize: 15, color: '#888' }}>
          {label}
        </Text>
      </View>
      <Text style={{ fontFamily: 'Orbitron_700Bold', fontSize: 20, color: highlight ? '#FFBE0B' : '#fff' }}>
        {value}
      </Text>
    </Animated.View>
  );
}

function ActionButton({
  onPress,
  icon,
  label,
  primary,
  secondary,
  delay,
}: {
  onPress: () => void;
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
  secondary?: boolean;
  delay: number;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.92, { duration: 100 }),
      withSpring(1, { damping: 10 })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Animated.View entering={FadeInUp.delay(delay).springify()} className={primary ? 'flex-1' : ''}>
      <AnimatedPressable style={animatedStyle} onPress={handlePress}>
        {primary ? (
          <LinearGradient
            colors={['#00F5FF', '#0099FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingVertical: 20,
              borderRadius: 18,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              shadowColor: '#00F5FF',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.4,
              shadowRadius: 20,
            }}
          >
            {icon}
            <Text style={{ fontFamily: 'Rajdhani_700Bold', color: '#000', fontSize: 20, marginLeft: 10 }}>
              {label}
            </Text>
          </LinearGradient>
        ) : (
          <View
            style={{
              paddingVertical: 16,
              paddingHorizontal: 20,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              backgroundColor: secondary ? 'rgba(255, 190, 11, 0.15)' : 'rgba(255, 255, 255, 0.08)',
              borderWidth: 1,
              borderColor: secondary ? 'rgba(255, 190, 11, 0.3)' : 'rgba(255, 255, 255, 0.1)',
            }}
          >
            {icon}
            {label && (
              <Text style={{ fontFamily: 'Rajdhani_700Bold', color: secondary ? '#FFBE0B' : '#fff', fontSize: 16, marginLeft: 8 }}>
                {label}
              </Text>
            )}
          </View>
        )}
      </AnimatedPressable>
    </Animated.View>
  );
}

// Motivational message based on performance
function getMotivationalMessage(score: number, highScore: number, isHighScore: boolean, combo: number): string {
  if (isHighScore && score > 500) return "LEGENDARY! You're unstoppable!";
  if (isHighScore) return "New record! Keep pushing!";
  if (score > highScore * 0.9) return "So close! One more try...";
  if (combo >= 15) return "That combo was insane!";
  if (combo >= 10) return "Great combo skills!";
  if (score > 300) return "Impressive run!";
  if (score > 100) return "Getting better!";
  return "Practice makes perfect!";
}

export default function GameOverScreen() {
  const router = useRouter();

  const score = useGameStore((s) => s.score);
  const maxCombo = useGameStore((s) => s.maxCombo);
  const level = useGameStore((s) => s.level);
  const stats = useGameStore((s) => s.stats);
  const startGame = useGameStore((s) => s.startGame);

  const isHighScore = score >= stats.highScore && score > 0;
  const message = getMotivationalMessage(score, stats.highScore, isHighScore, maxCombo);

  // Confetti colors
  const confettiColors = ['#00F5FF', '#FF006E', '#FFBE0B', '#8338EC', '#3A86FF', '#06FFA5'];

  useEffect(() => {
    if (isHighScore) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, []);

  const handlePlayAgain = () => {
    startGame();
    router.replace('/game');
  };

  const handleHome = () => {
    router.replace('/');
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: `I just scored ${score} points in Reflex Rush! ${isHighScore ? '🏆 New High Score!' : ''} Can you beat me? 🎯`,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  return (
    <View className="flex-1 bg-[#050508]">
      {/* Confetti for high score */}
      {isHighScore && (
        <View className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <ConfettiParticle
              key={i}
              delay={i * 100}
              color={confettiColors[i % confettiColors.length]}
            />
          ))}
        </View>
      )}

      {/* Background decoration */}
      <View
        style={{
          position: 'absolute',
          top: -150,
          left: -100,
          width: 350,
          height: 350,
          borderRadius: 175,
          backgroundColor: isHighScore ? '#FFBE0B' : '#FF006E',
          opacity: 0.06,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: -80,
          right: -80,
          width: 250,
          height: 250,
          borderRadius: 125,
          backgroundColor: '#00F5FF',
          opacity: 0.04,
        }}
      />

      <SafeAreaView className="flex-1">
        <View className="flex-1 px-6 justify-center">
          {/* Game Over Title */}
          <Animated.View entering={FadeInDown.delay(100).springify()} className="items-center mb-6">
            <Text style={{ fontFamily: 'Orbitron_700Bold', fontSize: 13, color: '#FF006E', letterSpacing: 10 }}>
              GAME OVER
            </Text>
          </Animated.View>

          {/* Score Display */}
          <View className="items-center mb-8">
            <AnimatedScore score={score} isHighScore={isHighScore} />
          </View>

          {/* Motivational Message */}
          <Animated.View entering={FadeIn.delay(600)} className="items-center mb-6">
            <Text style={{ fontFamily: 'Rajdhani_600SemiBold', fontSize: 18, color: '#888', textAlign: 'center' }}>
              {message}
            </Text>
          </Animated.View>

          {/* Stats Card */}
          <Animated.View
            entering={FadeInDown.delay(400).springify()}
            className="rounded-2xl p-5 mb-6"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.04)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' }}
          >
            <StatRow
              icon={<Target size={18} color="#00F5FF" />}
              label="Level Reached"
              value={level}
              delay={500}
            />
            <StatRow
              icon={<Zap size={18} color={maxCombo >= 10 ? '#FFBE0B' : '#888'} />}
              label="Best Combo"
              value={`${maxCombo}x`}
              highlight={maxCombo >= 10}
              delay={550}
            />
            <StatRow
              icon={<Trophy size={18} color="#FF006E" />}
              label="All-Time Best"
              value={Math.max(stats.highScore, score)}
              delay={600}
            />
            <View className="flex-row items-center justify-between pt-4">
              <Text style={{ fontFamily: 'Rajdhani_500Medium', fontSize: 13, color: '#555' }}>
                Games Played
              </Text>
              <Text style={{ fontFamily: 'Rajdhani_600SemiBold', fontSize: 13, color: '#555' }}>
                {stats.totalGames}
              </Text>
            </View>
          </Animated.View>

          {/* Action Buttons */}
          <View className="flex-row items-center mb-4">
            <ActionButton
              onPress={handleHome}
              icon={<Home size={20} color="#fff" />}
              label=""
              delay={700}
            />
            <View className="w-3" />
            <ActionButton
              onPress={handleShare}
              icon={<Share2 size={20} color="#FFBE0B" />}
              label="SHARE"
              secondary
              delay={750}
            />
            <View className="w-3" />
            <ActionButton
              onPress={handlePlayAgain}
              icon={<RotateCcw size={22} color="#000" />}
              label="PLAY AGAIN"
              primary
              delay={800}
            />
          </View>
        </View>

        {/* Footer tip */}
        <Animated.View entering={FadeInUp.delay(900).springify()} className="pb-4 px-6">
          <Text style={{ fontFamily: 'Rajdhani_400Regular', fontSize: 13, color: '#444', textAlign: 'center' }}>
            {!isHighScore && stats.highScore > 0
              ? `${stats.highScore - score} points to beat your record`
              : 'Challenge your friends to beat your score!'}
          </Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
