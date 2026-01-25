import React, { useState } from 'react';
import { View, Text, Pressable, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X, CheckCircle, Users, Shield, Zap } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withSpring, withSequence, withTiming, withRepeat, Easing, runOnJS } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { CHALLENGES, useStore, Stake } from '@/lib/store';

const MOCK_OPPONENTS = [
  { name: 'FitChallenger', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
  { name: 'GoalGetter99', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
  { name: 'NeverQuit_Sam', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop' },
  { name: 'StreakMaster', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop' },
];

export default function CreateStakeScreen() {
  const router = useRouter();
  const { challengeId, amount } = useLocalSearchParams<{ challengeId: string; amount: string }>();
  const addStake = useStore((s) => s.addStake);

  const challenge = CHALLENGES.find((c) => c.id === challengeId);
  const stakeAmount = parseInt(amount || '0', 10);

  const [isMatching, setIsMatching] = useState(false);
  const [isMatched, setIsMatched] = useState(false);
  const [opponent, setOpponent] = useState<typeof MOCK_OPPONENTS[0] | null>(null);

  const pulseScale = useSharedValue(1);
  const rotateValue = useSharedValue(0);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateValue.value}deg` }],
  }));

  const startMatching = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsMatching(true);

    // Start animations
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    rotateValue.value = withRepeat(
      withTiming(360, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    );

    // Simulate matching after 2 seconds
    setTimeout(() => {
      pulseScale.value = withTiming(1);
      rotateValue.value = withTiming(0);

      const randomOpponent = MOCK_OPPONENTS[Math.floor(Math.random() * MOCK_OPPONENTS.length)];
      setOpponent(randomOpponent);
      setIsMatching(false);
      setIsMatched(true);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 2500);
  };

  const confirmStake = () => {
    if (!challenge || !opponent) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    const newStake: Stake = {
      id: Date.now().toString(),
      challengeId: challenge.id,
      challengeTitle: challenge.title,
      category: challenge.category,
      amount: stakeAmount,
      deadline: new Date(Date.now() + parseDuration(challenge.duration)),
      status: 'active',
      createdAt: new Date(),
      opponentName: opponent.name,
      opponentAvatar: opponent.avatar,
    };

    addStake(newStake);

    // Navigate back to home
    router.dismissAll();
    router.replace('/');
  };

  const parseDuration = (duration: string): number => {
    const match = duration.match(/(\d+)\s*(day|hour|week)/i);
    if (!match) return 7 * 24 * 60 * 60 * 1000; // Default 7 days

    const value = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();

    switch (unit) {
      case 'hour':
        return value * 60 * 60 * 1000;
      case 'day':
        return value * 24 * 60 * 60 * 1000;
      case 'week':
        return value * 7 * 24 * 60 * 60 * 1000;
      default:
        return 7 * 24 * 60 * 60 * 1000;
    }
  };

  if (!challenge) {
    return (
      <View className="flex-1 bg-[#0A0A0F] items-center justify-center">
        <Text className="text-white">Challenge not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#0A0A0F]">
      <LinearGradient
        colors={['rgba(0, 255, 148, 0.15)', 'transparent']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 400 }}
      />

      <SafeAreaView edges={['top']} className="flex-1">
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).springify()} className="px-5 pt-2 pb-4 flex-row items-center justify-between">
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
            className="w-10 h-10 bg-[#12121A] rounded-full items-center justify-center"
          >
            <X size={20} color="#fff" />
          </Pressable>
          <Text style={{ fontFamily: 'Outfit_600SemiBold' }} className="text-white text-base">
            {isMatched ? 'Match Found!' : isMatching ? 'Finding Opponent...' : 'Confirm Stake'}
          </Text>
          <View className="w-10" />
        </Animated.View>

        <View className="flex-1 items-center justify-center px-5">
          {!isMatching && !isMatched && (
            <>
              {/* Challenge Info */}
              <Animated.View entering={FadeInDown.delay(150).springify()} className="items-center mb-8">
                <View className="w-20 h-20 bg-[#12121A] rounded-2xl items-center justify-center mb-4">
                  <Text className="text-4xl">{challenge.icon}</Text>
                </View>
                <Text style={{ fontFamily: 'Sora_700Bold' }} className="text-white text-xl text-center mb-2">
                  {challenge.title}
                </Text>
                <Text style={{ fontFamily: 'Outfit_400Regular' }} className="text-gray-400 text-center text-sm">
                  {challenge.duration} challenge
                </Text>
              </Animated.View>

              {/* Stake Amount */}
              <Animated.View entering={FadeInDown.delay(200).springify()} className="w-full mb-8">
                <LinearGradient
                  colors={['#00FF94', '#00D9FF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ borderRadius: 24, padding: 1 }}
                >
                  <View className="bg-[#0A0A0F] rounded-3xl p-6 items-center">
                    <Text style={{ fontFamily: 'Outfit_400Regular' }} className="text-gray-400 text-sm mb-2">
                      Your Stake
                    </Text>
                    <Text style={{ fontFamily: 'Sora_700Bold' }} className="text-white text-5xl">
                      ${stakeAmount}
                    </Text>
                    <View className="flex-row items-center mt-3">
                      <Text style={{ fontFamily: 'Outfit_500Medium' }} className="text-gray-400 text-sm">
                        Potential win:{' '}
                      </Text>
                      <Text style={{ fontFamily: 'Sora_600SemiBold' }} className="text-[#00FF94] text-lg">
                        ${(stakeAmount * 1.8).toFixed(0)}
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </Animated.View>

              {/* Info Points */}
              <Animated.View entering={FadeInDown.delay(250).springify()} className="w-full mb-8">
                {[
                  { icon: <Users size={16} color="#00D9FF" />, text: 'You\'ll be matched with an opponent' },
                  { icon: <Shield size={16} color="#00FF94" />, text: 'Funds held securely until completion' },
                  { icon: <Zap size={16} color="#FFB800" />, text: 'Winner takes 80% of total pot' },
                ].map((item, index) => (
                  <View key={index} className="flex-row items-center mb-3">
                    <View className="w-8 h-8 bg-[#12121A] rounded-lg items-center justify-center mr-3">
                      {item.icon}
                    </View>
                    <Text style={{ fontFamily: 'Outfit_400Regular' }} className="text-gray-300 text-sm flex-1">
                      {item.text}
                    </Text>
                  </View>
                ))}
              </Animated.View>
            </>
          )}

          {isMatching && (
            <Animated.View entering={FadeInDown.springify()} className="items-center">
              <Animated.View style={[pulseStyle, { marginBottom: 32 }]}>
                <Animated.View style={rotateStyle}>
                  <LinearGradient
                    colors={['#00FF94', '#00D9FF', '#00FF94']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ width: 120, height: 120, borderRadius: 60, padding: 4 }}
                  >
                    <View className="flex-1 bg-[#0A0A0F] rounded-full items-center justify-center">
                      <Text className="text-4xl">{challenge.icon}</Text>
                    </View>
                  </LinearGradient>
                </Animated.View>
              </Animated.View>

              <Text style={{ fontFamily: 'Sora_600SemiBold' }} className="text-white text-xl mb-2">
                Finding Your Opponent
              </Text>
              <Text style={{ fontFamily: 'Outfit_400Regular' }} className="text-gray-400 text-center text-sm">
                Matching you with someone who believes they'll beat you...
              </Text>
            </Animated.View>
          )}

          {isMatched && opponent && (
            <Animated.View entering={FadeInDown.springify()} className="items-center w-full">
              {/* VS Display */}
              <View className="flex-row items-center justify-center mb-8">
                {/* You */}
                <View className="items-center">
                  <LinearGradient
                    colors={['#00FF94', '#00D9FF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ padding: 3, borderRadius: 100 }}
                  >
                    <View className="w-20 h-20 bg-[#12121A] rounded-full items-center justify-center">
                      <Text className="text-2xl">👤</Text>
                    </View>
                  </LinearGradient>
                  <Text style={{ fontFamily: 'Outfit_600SemiBold' }} className="text-white text-sm mt-2">
                    You
                  </Text>
                </View>

                {/* VS */}
                <View className="mx-6">
                  <View className="bg-[#FF4757]/20 px-4 py-2 rounded-full">
                    <Text style={{ fontFamily: 'Sora_700Bold' }} className="text-[#FF4757] text-lg">
                      VS
                    </Text>
                  </View>
                </View>

                {/* Opponent */}
                <View className="items-center">
                  <View style={{ padding: 3, borderRadius: 100, borderWidth: 3, borderColor: '#FF4757' }}>
                    <Image
                      source={{ uri: opponent.avatar }}
                      className="w-20 h-20 rounded-full"
                    />
                  </View>
                  <Text style={{ fontFamily: 'Outfit_600SemiBold' }} className="text-white text-sm mt-2">
                    {opponent.name}
                  </Text>
                </View>
              </View>

              {/* Match Info */}
              <View className="w-full bg-[#12121A] rounded-2xl p-5 mb-8" style={{ borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' }}>
                <View className="flex-row items-center justify-between mb-4">
                  <Text style={{ fontFamily: 'Outfit_400Regular' }} className="text-gray-400 text-sm">
                    Total Pot
                  </Text>
                  <Text style={{ fontFamily: 'Sora_700Bold' }} className="text-white text-2xl">
                    ${stakeAmount * 2}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between mb-4">
                  <Text style={{ fontFamily: 'Outfit_400Regular' }} className="text-gray-400 text-sm">
                    Your Stake
                  </Text>
                  <Text style={{ fontFamily: 'Outfit_600SemiBold' }} className="text-white text-lg">
                    ${stakeAmount}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between pt-4 border-t border-[#1F1F2E]">
                  <Text style={{ fontFamily: 'Outfit_400Regular' }} className="text-gray-400 text-sm">
                    If You Win
                  </Text>
                  <Text style={{ fontFamily: 'Sora_700Bold' }} className="text-[#00FF94] text-xl">
                    +${(stakeAmount * 0.8).toFixed(0)} profit
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center bg-[#FFB800]/10 rounded-xl p-4 mb-4">
                <CheckCircle size={20} color="#FFB800" />
                <Text style={{ fontFamily: 'Outfit_500Medium' }} className="text-[#FFB800] text-sm ml-3 flex-1">
                  {opponent.name} has staked ${stakeAmount}. Complete the challenge to win their money!
                </Text>
              </View>
            </Animated.View>
          )}
        </View>

        {/* Bottom CTA */}
        <Animated.View
          entering={FadeInUp.delay(300).springify()}
          className="px-5 pb-8"
        >
          {!isMatching && !isMatched && (
            <Pressable onPress={startMatching}>
              <LinearGradient
                colors={['#00FF94', '#00D9FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ borderRadius: 16, paddingVertical: 18, alignItems: 'center' }}
              >
                <Text style={{ fontFamily: 'Sora_700Bold' }} className="text-black text-lg">
                  Find Opponent & Lock Stake
                </Text>
              </LinearGradient>
            </Pressable>
          )}

          {isMatched && (
            <Pressable onPress={confirmStake}>
              <LinearGradient
                colors={['#00FF94', '#00D9FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ borderRadius: 16, paddingVertical: 18, alignItems: 'center' }}
              >
                <Text style={{ fontFamily: 'Sora_700Bold' }} className="text-black text-lg">
                  Start Challenge Now
                </Text>
              </LinearGradient>
            </Pressable>
          )}
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
