import React, { useEffect } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { RotateCcw, Home, Trophy, Zap, Target, Share2 } from 'lucide-react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useGameStore } from '@/lib/gameStore';

const { width } = Dimensions.get('window');

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function AnimatedScore({ score, isHighScore }: { score: number; isHighScore: boolean }) {
  const displayScore = useSharedValue(0);
  const scale = useSharedValue(0.5);
  const glowOpacity = useSharedValue(0);

  const [displayValue, setDisplayValue] = React.useState(0);

  useEffect(() => {
    // Count up animation
    const duration = 1500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      const current = Math.round(score * eased);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
    scale.value = withSpring(1, { damping: 12, stiffness: 100 });

    if (isHighScore) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000 }),
          withTiming(0.5, { duration: 1000 })
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
    textShadowRadius: 30,
  }));

  return (
    <Animated.View style={animatedStyle} className="items-center">
      {isHighScore && (
        <Animated.View entering={FadeInDown.delay(500).springify()} className="flex-row items-center mb-2">
          <Trophy size={20} color="#FFBE0B" />
          <Text style={{ fontFamily: 'Rajdhani_700Bold', color: '#FFBE0B', fontSize: 16, marginLeft: 6 }}>
            NEW HIGH SCORE!
          </Text>
        </Animated.View>
      )}
      <Animated.Text
        style={[
          glowStyle,
          {
            fontFamily: 'Orbitron_900Black',
            fontSize: 72,
            color: isHighScore ? '#FFBE0B' : '#00F5FF',
          },
        ]}
      >
        {displayValue}
      </Animated.Text>
      <Text style={{ fontFamily: 'Rajdhani_500Medium', color: '#666', fontSize: 18, letterSpacing: 4 }}>
        POINTS
      </Text>
    </Animated.View>
  );
}

function StatRow({ icon, label, value, delay }: { icon: React.ReactNode; label: string; value: string | number; delay: number }) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify()}
      className="flex-row items-center justify-between py-3 border-b border-white/5"
    >
      <View className="flex-row items-center">
        {icon}
        <Text style={{ fontFamily: 'Rajdhani_500Medium', color: '#888', fontSize: 16, marginLeft: 12 }}>
          {label}
        </Text>
      </View>
      <Text style={{ fontFamily: 'Orbitron_700Bold', color: '#fff', fontSize: 18 }}>
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
  delay,
}: {
  onPress: () => void;
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
  delay: number;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 10 })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Animated.View entering={FadeInUp.delay(delay).springify()} className="flex-1 mx-2">
      <AnimatedPressable style={animatedStyle} onPress={handlePress}>
        {primary ? (
          <LinearGradient
            colors={['#00F5FF', '#0099FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingVertical: 18,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
            }}
          >
            {icon}
            <Text style={{ fontFamily: 'Rajdhani_700Bold', color: '#000', fontSize: 18, marginLeft: 8 }}>
              {label}
            </Text>
          </LinearGradient>
        ) : (
          <View
            style={{
              paddingVertical: 18,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.1)',
            }}
          >
            {icon}
            <Text style={{ fontFamily: 'Rajdhani_700Bold', color: '#fff', fontSize: 18, marginLeft: 8 }}>
              {label}
            </Text>
          </View>
        )}
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function GameOverScreen() {
  const router = useRouter();

  const score = useGameStore((s) => s.score);
  const maxCombo = useGameStore((s) => s.maxCombo);
  const level = useGameStore((s) => s.level);
  const stats = useGameStore((s) => s.stats);
  const startGame = useGameStore((s) => s.startGame);

  const isHighScore = score >= stats.highScore && score > 0;

  useEffect(() => {
    if (isHighScore) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }, []);

  const handlePlayAgain = () => {
    startGame();
    router.replace('/game');
  };

  const handleHome = () => {
    router.replace('/');
  };

  return (
    <View className="flex-1 bg-[#050508]">
      {/* Background decoration */}
      <View
        style={{
          position: 'absolute',
          top: -100,
          left: -100,
          width: 300,
          height: 300,
          borderRadius: 150,
          backgroundColor: isHighScore ? '#FFBE0B' : '#FF006E',
          opacity: 0.08,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: 100,
          backgroundColor: '#00F5FF',
          opacity: 0.05,
        }}
      />

      <SafeAreaView className="flex-1">
        <View className="flex-1 px-6 justify-center">
          {/* Game Over Title */}
          <Animated.View entering={FadeInDown.delay(100).springify()} className="items-center mb-8">
            <Text style={{ fontFamily: 'Orbitron_700Bold', color: '#FF006E', fontSize: 14, letterSpacing: 8 }}>
              GAME OVER
            </Text>
          </Animated.View>

          {/* Score Display */}
          <View className="items-center mb-10">
            <AnimatedScore score={score} isHighScore={isHighScore} />
          </View>

          {/* Stats Card */}
          <Animated.View
            entering={FadeInDown.delay(300).springify()}
            className="bg-white/5 rounded-2xl p-5 mb-8"
            style={{ borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' }}
          >
            <StatRow
              icon={<Target size={18} color="#00F5FF" />}
              label="Level Reached"
              value={level}
              delay={400}
            />
            <StatRow
              icon={<Zap size={18} color="#FFBE0B" />}
              label="Best Combo"
              value={`${maxCombo}x`}
              delay={450}
            />
            <StatRow
              icon={<Trophy size={18} color="#FF006E" />}
              label="High Score"
              value={Math.max(stats.highScore, score)}
              delay={500}
            />
            <View className="flex-row items-center justify-between pt-3">
              <View className="flex-row items-center">
                <Text style={{ fontFamily: 'Rajdhani_500Medium', color: '#666', fontSize: 14 }}>
                  Total Games Played
                </Text>
              </View>
              <Text style={{ fontFamily: 'Rajdhani_600SemiBold', color: '#666', fontSize: 14 }}>
                {stats.totalGames}
              </Text>
            </View>
          </Animated.View>

          {/* Action Buttons */}
          <View className="flex-row">
            <ActionButton
              onPress={handleHome}
              icon={<Home size={20} color="#fff" />}
              label="HOME"
              delay={600}
            />
            <ActionButton
              onPress={handlePlayAgain}
              icon={<RotateCcw size={20} color="#000" />}
              label="RETRY"
              primary
              delay={650}
            />
          </View>
        </View>

        {/* Footer tip */}
        <Animated.View entering={FadeInUp.delay(800).springify()} className="pb-4 px-6">
          <Text style={{ fontFamily: 'Rajdhani_400Regular', color: '#444', fontSize: 14, textAlign: 'center' }}>
            {isHighScore
              ? 'Amazing! Can you beat your new record?'
              : `${stats.highScore - score > 0 ? stats.highScore - score : 0} points away from your high score`}
          </Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
