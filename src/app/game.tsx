import React, { useEffect, useRef, useCallback, useState } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Heart, X, Zap, AlertTriangle } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  withSequence,
  withRepeat,
  withDelay,
  runOnJS,
  Easing,
  FadeIn,
  FadeOut,
  ZoomIn,
  SlideInUp,
  BounceIn,
  interpolate,
  cancelAnimation,
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

// Particle component for hit effects
function Particle({ x, y, color, delay }: { x: number; y: number; color: string; delay: number }) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    const angle = Math.random() * Math.PI * 2;
    const distance = 40 + Math.random() * 60;

    translateX.value = withDelay(delay, withTiming(Math.cos(angle) * distance, { duration: 400, easing: Easing.out(Easing.quad) }));
    translateY.value = withDelay(delay, withTiming(Math.sin(angle) * distance, { duration: 400, easing: Easing.out(Easing.quad) }));
    opacity.value = withDelay(delay, withTiming(0, { duration: 400 }));
    scale.value = withDelay(delay, withSequence(
      withTiming(1.5, { duration: 100 }),
      withTiming(0, { duration: 300 })
    ));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        style,
        {
          position: 'absolute',
          left: x - 4,
          top: y - 4,
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: color,
        },
      ]}
    />
  );
}

// Countdown overlay
function CountdownOverlay({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(3);
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const animate = () => {
      scale.value = 0.5;
      opacity.value = 0;
      scale.value = withSpring(1, { damping: 8, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 200 });

      setTimeout(() => {
        opacity.value = withTiming(0, { duration: 200 });
      }, 600);
    };

    animate();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const interval = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          clearInterval(interval);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setTimeout(onComplete, 300);
          return 0;
        }
        animate();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        return c - 1;
      });
    }, 800);

    return () => clearInterval(interval);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View className="absolute inset-0 z-50 items-center justify-center bg-black/80">
      <Animated.View style={animatedStyle}>
        <Text style={{ fontFamily: 'Orbitron_900Black', fontSize: 120, color: count === 0 ? '#00F5FF' : '#fff' }}>
          {count === 0 ? 'GO!' : count}
        </Text>
      </Animated.View>
    </View>
  );
}

// Level up banner
function LevelUpBanner({ level }: { level: number }) {
  return (
    <Animated.View
      entering={SlideInUp.springify()}
      exiting={FadeOut.duration(300)}
      className="absolute top-24 left-0 right-0 items-center z-20"
    >
      <LinearGradient
        colors={['#8338EC', '#3A86FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ paddingHorizontal: 24, paddingVertical: 12, borderRadius: 30 }}
      >
        <Text style={{ fontFamily: 'Orbitron_700Bold', fontSize: 18, color: '#fff' }}>
          LEVEL {level}
        </Text>
      </LinearGradient>
    </Animated.View>
  );
}

// Danger warning flash
function DangerFlash() {
  return (
    <Animated.View
      entering={FadeIn.duration(100)}
      exiting={FadeOut.duration(200)}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 0, 110, 0.3)',
      }}
    />
  );
}

interface TargetComponentProps {
  target: Target;
  onHit: (target: Target) => void;
  onMiss: (target: Target) => void;
}

function TargetComponent({ target, onHit, onMiss }: TargetComponentProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(1);
  const progress = useSharedValue(1);
  const pulseScale = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Spawn animation
    scale.value = withSpring(1, { damping: 10, stiffness: 300 });

    // Bonus targets pulse
    if (target.type === 'bonus') {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 300 }),
          withTiming(1, { duration: 300 })
        ),
        -1,
        true
      );
    }

    // Danger targets rotate
    if (target.type === 'danger') {
      rotation.value = withRepeat(
        withTiming(360, { duration: 2000, easing: Easing.linear }),
        -1,
        false
      );
    }

    // Lifetime countdown
    progress.value = withTiming(0, {
      duration: target.lifetime,
      easing: Easing.linear,
    });

    // Auto-miss after lifetime
    const timeout = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 150 });
      setTimeout(() => onMiss(target), 150);
    }, target.lifetime);

    return () => {
      clearTimeout(timeout);
      cancelAnimation(pulseScale);
      cancelAnimation(rotation);
    };
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value * pulseScale.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  const progressStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: progress.value }],
  }));

  // Warning pulse when time is running out
  const urgencyStyle = useAnimatedStyle(() => {
    const urgency = interpolate(progress.value, [0, 0.3, 1], [1.1, 1, 1]);
    return {
      transform: [{ scale: urgency }],
    };
  });

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(1.4, { duration: 80 }),
      withTiming(0, { duration: 120 })
    );
    opacity.value = withTiming(0, { duration: 120 });
    setTimeout(() => onHit(target), 80);
  };

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
        <Animated.View style={[urgencyStyle, { width: '100%', height: '100%' }]}>
          <LinearGradient
            colors={
              isDanger
                ? ['#FF006E', '#FF4444'] as const
                : isBonus
                ? ['#FFBE0B', '#FF8800'] as const
                : [target.color, target.color + '99'] as const
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: target.size / 2,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: isDanger ? '#FF006E' : isBonus ? '#FFBE0B' : target.color,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 1,
              shadowRadius: 20,
            }}
          >
            <View
              style={{
                width: target.size - 14,
                height: target.size - 14,
                borderRadius: (target.size - 14) / 2,
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: 'rgba(255, 255, 255, 0.2)',
              }}
            >
              {isDanger && <X size={26} color="#fff" strokeWidth={3} />}
              {isBonus && <Zap size={26} color="#fff" fill="#fff" />}
              {!isDanger && !isBonus && (
                <Text style={{ fontFamily: 'Orbitron_700Bold', color: '#fff', fontSize: 16 }}>
                  {target.points}
                </Text>
              )}
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Progress ring */}
        <View
          style={{
            position: 'absolute',
            bottom: -6,
            width: target.size * 0.7,
            height: 5,
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <Animated.View
            style={[
              progressStyle,
              {
                width: '100%',
                height: '100%',
                backgroundColor: isDanger ? '#FF006E' : isBonus ? '#FFBE0B' : '#00F5FF',
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
        withSpring(1.4, { damping: 6, stiffness: 300 }),
        withSpring(1, { damping: 10 })
      );
    }
  }, [combo]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (combo < 3) return null;

  const comboColor = combo >= 15 ? '#FF006E' : combo >= 10 ? '#FFBE0B' : '#00F5FF';

  return (
    <Animated.View style={animatedStyle} className="absolute top-1/3 left-0 right-0 items-center">
      <Text style={{ fontFamily: 'Orbitron_900Black', fontSize: 56, color: comboColor }}>
        {combo}x
      </Text>
      <Text style={{ fontFamily: 'Rajdhani_700Bold', fontSize: 16, color: comboColor, letterSpacing: 4 }}>
        {combo >= 15 ? 'UNSTOPPABLE!' : combo >= 10 ? 'ON FIRE!' : 'COMBO!'}
      </Text>
    </Animated.View>
  );
}

function FloatingScore({ score, x, y, isBonus }: { score: number; x: number; y: number; isBonus?: boolean }) {
  return (
    <Animated.View
      entering={ZoomIn.duration(150)}
      exiting={FadeOut.duration(300)}
      style={{
        position: 'absolute',
        left: x - 40,
        top: y - 35,
        alignItems: 'center',
      }}
    >
      <Text style={{ fontFamily: 'Orbitron_700Bold', fontSize: isBonus ? 32 : 26, color: isBonus ? '#FFBE0B' : '#00F5FF' }}>
        +{score}
      </Text>
      {isBonus && (
        <Text style={{ fontFamily: 'Rajdhani_600SemiBold', fontSize: 12, color: '#FFBE0B' }}>
          BONUS!
        </Text>
      )}
    </Animated.View>
  );
}

// Lives display with animation
function LivesDisplay({ lives, maxLives }: { lives: number; maxLives: number }) {
  return (
    <View className="flex-row items-center">
      {[...Array(maxLives)].map((_, i) => (
        <Animated.View
          key={i}
          entering={i < lives ? BounceIn.delay(i * 100) : undefined}
        >
          <Heart
            size={26}
            color={i < lives ? '#FF006E' : '#333'}
            fill={i < lives ? '#FF006E' : 'transparent'}
            style={{ marginRight: 6 }}
          />
        </Animated.View>
      ))}
    </View>
  );
}

export default function GameScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [showCountdown, setShowCountdown] = useState(true);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showDangerFlash, setShowDangerFlash] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: string; x: number; y: number; color: string }>>([]);

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
  const setLevel = useGameStore((s) => s.setLevel);
  const addTarget = useGameStore((s) => s.addTarget);
  const removeTarget = useGameStore((s) => s.removeTarget);

  const spawnIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gameAreaTop = insets.top + 80;
  const gameAreaBottom = height - 100;
  const gameAreaHeight = gameAreaBottom - gameAreaTop;
  const previousLevel = useRef(1);

  const [floatingScores, setFloatingScores] = useState<Array<{ id: string; score: number; x: number; y: number; isBonus?: boolean }>>([]);

  // Screen shake animation
  const shakeX = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const triggerShake = () => {
    shakeX.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-6, { duration: 50 }),
      withTiming(6, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  // Spawn particles
  const spawnParticles = (x: number, y: number, color: string) => {
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: `${Date.now()}-${i}`,
      x,
      y: y - gameAreaTop,
      color,
    }));
    setParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
    }, 500);
  };

  // Start game after countdown
  const handleCountdownComplete = () => {
    setShowCountdown(false);
    startGame();
  };

  // Spawn targets
  useEffect(() => {
    if (gameState !== 'playing' || showCountdown) return;

    const spawnTarget = () => {
      const size = Math.random() * (TARGET_MAX_SIZE - TARGET_MIN_SIZE) + TARGET_MIN_SIZE;
      const x = Math.random() * (width - GAME_AREA_PADDING * 2 - size) + GAME_AREA_PADDING + size / 2;
      const y = Math.random() * (gameAreaHeight - size) + gameAreaTop + size / 2;

      // Difficulty scaling
      const difficultyMultiplier = 1 - (level - 1) * 0.08;
      const lifetime = Math.max(700, BASE_LIFETIME * difficultyMultiplier);

      // Random target type - more danger at higher levels
      const typeRoll = Math.random();
      const dangerChance = 0.08 + (level - 1) * 0.02;
      let type: 'normal' | 'bonus' | 'danger' = 'normal';
      if (typeRoll > 0.94) type = 'bonus';
      else if (typeRoll > (1 - dangerChance) && level > 1) type = 'danger';

      const points = type === 'bonus' ? 50 : type === 'danger' ? 0 : Math.round(10 + (TARGET_MAX_SIZE - size) / 3);

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
    const interval = Math.max(350, BASE_SPAWN_INTERVAL - (level - 1) * 100);
    spawnIntervalRef.current = setInterval(spawnTarget, interval);

    return () => {
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current);
      }
    };
  }, [gameState, level, gameAreaTop, gameAreaHeight, showCountdown]);

  // Level up based on score
  useEffect(() => {
    const newLevel = Math.floor(score / 200) + 1;
    if (newLevel !== level && newLevel <= 10) {
      setLevel(newLevel);
      if (hapticEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      // Show level up banner
      if (newLevel > previousLevel.current) {
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 1500);
        previousLevel.current = newLevel;
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
      triggerShake();
      setShowDangerFlash(true);
      setTimeout(() => setShowDangerFlash(false), 200);
      loseLife();
      return;
    }

    // Good hit
    if (hapticEnabled) {
      Haptics.impactAsync(target.type === 'bonus' ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Light);
    }

    // Spawn particles
    spawnParticles(target.x, target.y, target.type === 'bonus' ? '#FFBE0B' : target.color);

    const multiplier = 1 + Math.floor(combo / 5) * 0.5;
    const points = Math.round(target.points * multiplier);

    addScore(target.points);
    incrementCombo();

    // Show floating score
    setFloatingScores((prev) => [...prev, { id: target.id, score: points, x: target.x, y: target.y - gameAreaTop, isBonus: target.type === 'bonus' }]);
    setTimeout(() => {
      setFloatingScores((prev) => prev.filter((f) => f.id !== target.id));
    }, 600);
  }, [combo, hapticEnabled, gameAreaTop]);

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
    triggerShake();
    setShowDangerFlash(true);
    setTimeout(() => setShowDangerFlash(false), 200);
    loseLife();
  }, [hapticEnabled]);

  return (
    <View className="flex-1 bg-[#050508]">
      {/* Countdown Overlay */}
      {showCountdown && <CountdownOverlay onComplete={handleCountdownComplete} />}

      {/* Danger Flash */}
      {showDangerFlash && <DangerFlash />}

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
            backgroundColor: combo >= 15 ? 'rgba(255, 0, 110, 0.1)' : combo >= 10 ? 'rgba(255, 190, 11, 0.08)' : 'rgba(0, 245, 255, 0.05)',
          }}
        />
      )}

      <Animated.View style={[shakeStyle, { flex: 1 }]}>
        {/* HUD */}
        <SafeAreaView edges={['top']} className="absolute top-0 left-0 right-0 z-10">
          <View className="flex-row items-center justify-between px-5 py-3">
            {/* Lives */}
            <LivesDisplay lives={lives} maxLives={3} />

            {/* Score */}
            <View className="items-center">
              <Text style={{ fontFamily: 'Orbitron_700Bold', fontSize: 32, color: '#00F5FF' }}>
                {score}
              </Text>
              <View className="flex-row items-center">
                <View
                  className="px-2 py-0.5 rounded-full mr-2"
                  style={{ backgroundColor: 'rgba(138, 56, 236, 0.3)' }}
                >
                  <Text style={{ fontFamily: 'Rajdhani_600SemiBold', fontSize: 11, color: '#8338EC', letterSpacing: 1 }}>
                    LVL {level}
                  </Text>
                </View>
                {combo >= 5 && (
                  <View
                    className="px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: 'rgba(255, 190, 11, 0.3)' }}
                  >
                    <Text style={{ fontFamily: 'Rajdhani_600SemiBold', fontSize: 11, color: '#FFBE0B', letterSpacing: 1 }}>
                      {combo}x
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Quit Button */}
            <Pressable
              onPress={() => {
                if (hapticEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                endGame();
              }}
              className="w-11 h-11 rounded-full items-center justify-center"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              <X size={22} color="#fff" />
            </Pressable>
          </View>
        </SafeAreaView>

        {/* Level Up Banner */}
        {showLevelUp && <LevelUpBanner level={level} />}

        {/* Game Area */}
        <View style={{ flex: 1, marginTop: gameAreaTop }}>
          {/* Particles */}
          {particles.map((p) => (
            <Particle key={p.id} x={p.x} y={p.y} color={p.color} delay={0} />
          ))}

          {!showCountdown && targets.map((target) => (
            <TargetComponent
              key={target.id}
              target={target}
              onHit={handleHit}
              onMiss={handleMiss}
            />
          ))}

          {/* Floating Scores */}
          {floatingScores.map((f) => (
            <FloatingScore key={f.id} score={f.score} x={f.x} y={f.y} isBonus={f.isBonus} />
          ))}

          {/* Combo Display */}
          <ComboDisplay combo={combo} />
        </View>
      </Animated.View>
    </View>
  );
}
