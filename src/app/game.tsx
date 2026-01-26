import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Heart, Pause, X, Zap } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  withSequence,
  runOnJS,
  Easing,
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useGameStore, Target, TARGET_COLORS } from '@/lib/gameStore';

const { width, height } = Dimensions.get('window');

const GAME_AREA_PADDING = 20;
const TARGET_MIN_SIZE = 50;
const TARGET_MAX_SIZE = 90;
const BASE_SPAWN_INTERVAL = 1200;
const BASE_LIFETIME = 2500;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface TargetComponentProps {
  target: Target;
  onHit: (target: Target) => void;
  onMiss: (target: Target) => void;
}

function TargetComponent({ target, onHit, onMiss }: TargetComponentProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(1);
  const progress = useSharedValue(1);

  useEffect(() => {
    // Spawn animation
    scale.value = withSpring(1, { damping: 12, stiffness: 200 });

    // Lifetime countdown
    progress.value = withTiming(0, {
      duration: target.lifetime,
      easing: Easing.linear,
    });

    // Auto-miss after lifetime
    const timeout = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 200 });
      setTimeout(() => onMiss(target), 200);
    }, target.lifetime);

    return () => clearTimeout(timeout);
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const progressStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: progress.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(1.3, { duration: 100 }),
      withTiming(0, { duration: 150 })
    );
    opacity.value = withTiming(0, { duration: 150 });
    setTimeout(() => onHit(target), 100);
  };

  const baseColor = target.color;
  const isDanger = target.type === 'danger';
  const isBonus = target.type === 'bonus';

  return (
    <Animated.View
      style={[
        containerStyle,
        {
          position: 'absolute',
          left: target.x - target.size / 2,
          top: target.y - target.size / 2,
          width: target.size,
          height: target.size,
        },
      ]}
    >
      <Pressable
        onPress={handlePress}
        style={{
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <LinearGradient
          colors={
            isDanger
              ? ['#FF006E', '#FF4444']
              : isBonus
              ? ['#FFBE0B', '#FF8800']
              : [baseColor, baseColor + '99']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: target.size / 2,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: baseColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 15,
          }}
        >
          <View
            style={{
              width: target.size - 16,
              height: target.size - 16,
              borderRadius: (target.size - 16) / 2,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isDanger && <X size={24} color="#fff" />}
            {isBonus && <Zap size={24} color="#fff" fill="#fff" />}
            {!isDanger && !isBonus && (
              <Text style={{ fontFamily: 'Orbitron_700Bold', color: '#fff', fontSize: 16 }}>
                {target.points}
              </Text>
            )}
          </View>
        </LinearGradient>

        {/* Progress ring */}
        <View
          style={{
            position: 'absolute',
            bottom: -4,
            width: target.size * 0.6,
            height: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <Animated.View
            style={[
              progressStyle,
              {
                width: '100%',
                height: '100%',
                backgroundColor: isDanger ? '#FF006E' : '#00F5FF',
                transformOrigin: 'left',
              },
            ]}
          />
        </View>
      </Pressable>
    </Animated.View>
  );
}

function ComboDisplay({ combo }: { combo: number }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (combo > 0) {
      scale.value = withSequence(
        withSpring(1.3, { damping: 8 }),
        withSpring(1, { damping: 12 })
      );
    }
  }, [combo]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (combo < 3) return null;

  return (
    <Animated.View style={animatedStyle} className="absolute top-1/3 left-0 right-0 items-center">
      <Text style={{ fontFamily: 'Orbitron_900Black', fontSize: 48, color: '#FFBE0B' }}>
        {combo}x
      </Text>
      <Text style={{ fontFamily: 'Rajdhani_600SemiBold', color: '#FFBE0B', fontSize: 16 }}>
        COMBO!
      </Text>
    </Animated.View>
  );
}

function FloatingScore({ score, x, y }: { score: number; x: number; y: number }) {
  return (
    <Animated.View
      entering={ZoomIn.duration(200)}
      exiting={FadeOut.duration(300)}
      style={{
        position: 'absolute',
        left: x - 30,
        top: y - 30,
      }}
    >
      <Text style={{ fontFamily: 'Orbitron_700Bold', color: '#00F5FF', fontSize: 24 }}>
        +{score}
      </Text>
    </Animated.View>
  );
}

export default function GameScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const gameState = useGameStore((s) => s.gameState);
  const score = useGameStore((s) => s.score);
  const lives = useGameStore((s) => s.lives);
  const level = useGameStore((s) => s.level);
  const combo = useGameStore((s) => s.combo);
  const targets = useGameStore((s) => s.targets);
  const hapticEnabled = useGameStore((s) => s.hapticEnabled);

  const startGame = useGameStore((s) => s.startGame);
  const endGame = useGameStore((s) => s.endGame);
  const addScore = useGameStore((s) => s.addScore);
  const loseLife = useGameStore((s) => s.loseLife);
  const incrementCombo = useGameStore((s) => s.incrementCombo);
  const resetCombo = useGameStore((s) => s.resetCombo);
  const setLevel = useGameStore((s) => s.setLevel);
  const addTarget = useGameStore((s) => s.addTarget);
  const removeTarget = useGameStore((s) => s.removeTarget);

  const spawnIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gameAreaTop = insets.top + 80;
  const gameAreaBottom = height - 100;
  const gameAreaHeight = gameAreaBottom - gameAreaTop;

  const [floatingScores, setFloatingScores] = React.useState<Array<{ id: string; score: number; x: number; y: number }>>([]);

  // Start game on mount
  useEffect(() => {
    startGame();
    return () => {
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current);
      }
    };
  }, []);

  // Spawn targets
  useEffect(() => {
    if (gameState !== 'playing') return;

    const spawnTarget = () => {
      const size = Math.random() * (TARGET_MAX_SIZE - TARGET_MIN_SIZE) + TARGET_MIN_SIZE;
      const x = Math.random() * (width - GAME_AREA_PADDING * 2 - size) + GAME_AREA_PADDING + size / 2;
      const y = Math.random() * (gameAreaHeight - size) + gameAreaTop + size / 2;

      // Difficulty scaling
      const difficultyMultiplier = 1 - (level - 1) * 0.08;
      const lifetime = Math.max(800, BASE_LIFETIME * difficultyMultiplier);

      // Random target type
      const typeRoll = Math.random();
      let type: 'normal' | 'bonus' | 'danger' = 'normal';
      if (typeRoll > 0.92) type = 'bonus';
      else if (typeRoll > 0.85 && level > 2) type = 'danger';

      const points = type === 'bonus' ? 50 : type === 'danger' ? 0 : Math.round(10 + (TARGET_MAX_SIZE - size) / 4);

      const target: Target = {
        id: Date.now().toString() + Math.random(),
        x,
        y,
        size,
        color: TARGET_COLORS[Math.floor(Math.random() * TARGET_COLORS.length)],
        spawnTime: Date.now(),
        lifetime,
        points,
        type,
      };

      addTarget(target);
    };

    // Initial spawn
    spawnTarget();

    // Spawn interval decreases with level
    const interval = Math.max(400, BASE_SPAWN_INTERVAL - (level - 1) * 100);
    spawnIntervalRef.current = setInterval(spawnTarget, interval);

    return () => {
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current);
      }
    };
  }, [gameState, level, gameAreaTop, gameAreaHeight]);

  // Level up based on score
  useEffect(() => {
    const newLevel = Math.floor(score / 200) + 1;
    if (newLevel !== level && newLevel <= 10) {
      setLevel(newLevel);
      if (hapticEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  }, [score, level]);

  // Check for game over
  useEffect(() => {
    if (gameState === 'gameover') {
      router.replace('/gameover');
    }
  }, [gameState]);

  const handleHit = useCallback((target: Target) => {
    removeTarget(target.id);

    if (target.type === 'danger') {
      // Hit danger target - lose life
      if (hapticEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      loseLife();
      return;
    }

    // Good hit
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const multiplier = 1 + Math.floor(combo / 5) * 0.5;
    const points = Math.round(target.points * multiplier);

    addScore(target.points);
    incrementCombo();

    // Show floating score
    setFloatingScores((prev) => [...prev, { id: target.id, score: points, x: target.x, y: target.y }]);
    setTimeout(() => {
      setFloatingScores((prev) => prev.filter((f) => f.id !== target.id));
    }, 500);
  }, [combo, hapticEnabled]);

  const handleMiss = useCallback((target: Target) => {
    removeTarget(target.id);

    if (target.type === 'danger') {
      // Good - avoided danger target
      return;
    }

    // Missed a good target
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    loseLife();
  }, [hapticEnabled]);

  return (
    <View className="flex-1 bg-[#050508]">
      {/* Background glow based on combo */}
      {combo >= 5 && (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: combo >= 10 ? 'rgba(255, 190, 11, 0.08)' : 'rgba(0, 245, 255, 0.05)',
          }}
        />
      )}

      {/* HUD */}
      <SafeAreaView edges={['top']} className="absolute top-0 left-0 right-0 z-10">
        <View className="flex-row items-center justify-between px-5 py-3">
          {/* Lives */}
          <View className="flex-row items-center">
            {[...Array(3)].map((_, i) => (
              <Heart
                key={i}
                size={24}
                color={i < lives ? '#FF006E' : '#333'}
                fill={i < lives ? '#FF006E' : 'transparent'}
                style={{ marginRight: 4 }}
              />
            ))}
          </View>

          {/* Score */}
          <View className="items-center">
            <Text style={{ fontFamily: 'Orbitron_700Bold', color: '#00F5FF', fontSize: 28 }}>
              {score}
            </Text>
            <Text style={{ fontFamily: 'Rajdhani_500Medium', color: '#666', fontSize: 12 }}>
              LEVEL {level}
            </Text>
          </View>

          {/* Pause Button */}
          <Pressable
            onPress={() => {
              if (hapticEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              endGame();
            }}
            className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
          >
            <X size={20} color="#fff" />
          </Pressable>
        </View>
      </SafeAreaView>

      {/* Game Area */}
      <View style={{ flex: 1, marginTop: gameAreaTop }}>
        {targets.map((target) => (
          <TargetComponent
            key={target.id}
            target={target}
            onHit={handleHit}
            onMiss={handleMiss}
          />
        ))}

        {/* Floating Scores */}
        {floatingScores.map((f) => (
          <FloatingScore key={f.id} score={f.score} x={f.x} y={f.y - gameAreaTop} />
        ))}

        {/* Combo Display */}
        <ComboDisplay combo={combo} />
      </View>
    </View>
  );
}
