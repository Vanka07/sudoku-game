import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X, Clock, Users, TrendingUp, Shield, CheckCircle, AlertTriangle, ChevronRight } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withSpring, withSequence, withTiming, Easing } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { CHALLENGES, useStore } from '@/lib/store';

const { width } = Dimensions.get('window');

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'easy':
      return '#00FF94';
    case 'medium':
      return '#FFB800';
    case 'hard':
      return '#FF4757';
    default:
      return '#6B7280';
  }
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between py-3 border-b border-[#1F1F2E]">
      <View className="flex-row items-center">
        {icon}
        <Text style={{ fontFamily: 'Outfit_400Regular' }} className="text-gray-400 text-sm ml-3">
          {label}
        </Text>
      </View>
      <Text style={{ fontFamily: 'Outfit_600SemiBold' }} className="text-white text-sm">
        {value}
      </Text>
    </View>
  );
}

export default function ChallengeDetailScreen() {
  const router = useRouter();
  const { challengeId } = useLocalSearchParams<{ challengeId: string }>();
  const balance = useStore((s) => s.balance);

  const challenge = CHALLENGES.find((c) => c.id === challengeId);

  const [stakeAmount, setStakeAmount] = useState(challenge?.minStake ?? 20);
  const potentialWin = stakeAmount * 1.8;

  const stakeOptions = challenge ? [
    challenge.minStake,
    Math.round((challenge.minStake + challenge.maxStake) / 4),
    Math.round((challenge.minStake + challenge.maxStake) / 2),
    challenge.maxStake,
  ] : [];

  if (!challenge) {
    return (
      <View className="flex-1 bg-[#0A0A0F] items-center justify-center">
        <Text className="text-white">Challenge not found</Text>
      </View>
    );
  }

  const handleStartChallenge = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push({
      pathname: '/create-stake',
      params: { challengeId: challenge.id, amount: stakeAmount.toString() },
    });
  };

  return (
    <View className="flex-1 bg-[#0A0A0F]">
      {/* Gradient Background */}
      <LinearGradient
        colors={['rgba(0, 255, 148, 0.1)', 'transparent']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 300 }}
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
          <View
            className="px-3 py-1.5 rounded-full"
            style={{ backgroundColor: `${getDifficultyColor(challenge.difficulty)}20` }}
          >
            <Text
              style={{ fontFamily: 'Outfit_600SemiBold', color: getDifficultyColor(challenge.difficulty) }}
              className="text-xs uppercase"
            >
              {challenge.difficulty}
            </Text>
          </View>
        </Animated.View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {/* Challenge Header */}
          <Animated.View entering={FadeInDown.delay(150).springify()} className="px-5 items-center">
            <View className="w-24 h-24 bg-[#12121A] rounded-3xl items-center justify-center mb-4">
              <Text className="text-5xl">{challenge.icon}</Text>
            </View>
            <Text style={{ fontFamily: 'Sora_700Bold' }} className="text-white text-2xl text-center mb-2">
              {challenge.title}
            </Text>
            <Text style={{ fontFamily: 'Outfit_400Regular' }} className="text-gray-400 text-center text-sm leading-5 px-4">
              {challenge.description}
            </Text>
          </Animated.View>

          {/* Stats Row */}
          <Animated.View entering={FadeInDown.delay(200).springify()} className="flex-row justify-center mt-6 mb-6">
            <View className="items-center mx-4">
              <View className="flex-row items-center">
                <Users size={14} color="#6B7280" />
                <Text style={{ fontFamily: 'Sora_600SemiBold' }} className="text-white text-lg ml-1">
                  {challenge.participants.toLocaleString()}
                </Text>
              </View>
              <Text style={{ fontFamily: 'Outfit_400Regular' }} className="text-gray-500 text-xs">
                participants
              </Text>
            </View>
            <View className="w-px h-10 bg-[#1F1F2E]" />
            <View className="items-center mx-4">
              <View className="flex-row items-center">
                <TrendingUp size={14} color="#00FF94" />
                <Text style={{ fontFamily: 'Sora_600SemiBold' }} className="text-[#00FF94] text-lg ml-1">
                  {challenge.successRate}%
                </Text>
              </View>
              <Text style={{ fontFamily: 'Outfit_400Regular' }} className="text-gray-500 text-xs">
                success rate
              </Text>
            </View>
            <View className="w-px h-10 bg-[#1F1F2E]" />
            <View className="items-center mx-4">
              <View className="flex-row items-center">
                <Clock size={14} color="#6B7280" />
                <Text style={{ fontFamily: 'Sora_600SemiBold' }} className="text-white text-lg ml-1">
                  {challenge.duration}
                </Text>
              </View>
              <Text style={{ fontFamily: 'Outfit_400Regular' }} className="text-gray-500 text-xs">
                duration
              </Text>
            </View>
          </Animated.View>

          {/* Details Card */}
          <Animated.View entering={FadeInDown.delay(250).springify()} className="px-5 mb-6">
            <View
              className="bg-[#12121A] rounded-2xl p-4"
              style={{ borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' }}
            >
              <InfoRow
                icon={<Shield size={16} color="#00D9FF" />}
                label="Verification"
                value={challenge.verificationMethod}
              />
              <InfoRow
                icon={<Clock size={16} color="#FFB800" />}
                label="Duration"
                value={challenge.duration}
              />
              <View className="flex-row items-center justify-between py-3">
                <View className="flex-row items-center">
                  <TrendingUp size={16} color="#00FF94" />
                  <Text style={{ fontFamily: 'Outfit_400Regular' }} className="text-gray-400 text-sm ml-3">
                    Stake Range
                  </Text>
                </View>
                <Text style={{ fontFamily: 'Outfit_600SemiBold' }} className="text-white text-sm">
                  ${challenge.minStake} - ${challenge.maxStake}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Stake Selection */}
          <Animated.View entering={FadeInDown.delay(300).springify()} className="px-5 mb-6">
            <Text style={{ fontFamily: 'Sora_600SemiBold' }} className="text-white text-lg mb-4">
              Choose Your Stake
            </Text>

            <View className="flex-row flex-wrap">
              {stakeOptions.map((amount, index) => (
                <Pressable
                  key={amount}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setStakeAmount(amount);
                  }}
                  className="mr-2 mb-2"
                >
                  {stakeAmount === amount ? (
                    <LinearGradient
                      colors={['#00FF94', '#00D9FF']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{ borderRadius: 12, paddingVertical: 12, paddingHorizontal: 20 }}
                    >
                      <Text style={{ fontFamily: 'Outfit_700Bold' }} className="text-black text-base">
                        ${amount}
                      </Text>
                    </LinearGradient>
                  ) : (
                    <View
                      className="py-3 px-5 rounded-xl"
                      style={{ backgroundColor: '#1A1A24', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }}
                    >
                      <Text style={{ fontFamily: 'Outfit_600SemiBold' }} className="text-white text-base">
                        ${amount}
                      </Text>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          </Animated.View>

          {/* Potential Winnings */}
          <Animated.View entering={FadeInDown.delay(350).springify()} className="px-5 mb-8">
            <LinearGradient
              colors={['#00FF94', '#00D9FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 20, padding: 1 }}
            >
              <View className="bg-[#0A0A0F] rounded-[19px] p-5">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text style={{ fontFamily: 'Outfit_400Regular' }} className="text-gray-400 text-sm">
                      If you complete the challenge
                    </Text>
                    <Text style={{ fontFamily: 'Sora_700Bold' }} className="text-[#00FF94] text-3xl mt-1">
                      +${(potentialWin - stakeAmount).toFixed(0)} profit
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text style={{ fontFamily: 'Outfit_400Regular' }} className="text-gray-400 text-xs">
                      Total return
                    </Text>
                    <Text style={{ fontFamily: 'Sora_600SemiBold' }} className="text-white text-xl">
                      ${potentialWin.toFixed(0)}
                    </Text>
                  </View>
                </View>

                {stakeAmount > balance && (
                  <View className="flex-row items-center mt-4 bg-[#FF4757]/10 rounded-lg p-3">
                    <AlertTriangle size={16} color="#FF4757" />
                    <Text style={{ fontFamily: 'Outfit_500Medium' }} className="text-[#FF4757] text-sm ml-2">
                      Insufficient balance. Add funds to stake ${stakeAmount}.
                    </Text>
                  </View>
                )}
              </View>
            </LinearGradient>
          </Animated.View>

          {/* How it works */}
          <Animated.View entering={FadeInDown.delay(400).springify()} className="px-5 mb-32">
            <Text style={{ fontFamily: 'Sora_600SemiBold' }} className="text-white text-lg mb-4">
              How It Works
            </Text>
            <View className="bg-[#12121A] rounded-2xl p-4" style={{ borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' }}>
              {[
                { step: '1', title: 'Stake your money', desc: 'Put your commitment on the line' },
                { step: '2', title: 'Complete the challenge', desc: 'Follow the rules for the duration' },
                { step: '3', title: 'Submit proof', desc: 'Verify your completion with evidence' },
                { step: '4', title: 'Get paid', desc: 'Win your stake + opponent\'s stake' },
              ].map((item, index) => (
                <View key={item.step} className={`flex-row items-center ${index < 3 ? 'mb-4 pb-4 border-b border-[#1F1F2E]' : ''}`}>
                  <View className="w-8 h-8 bg-[#00FF94]/20 rounded-full items-center justify-center mr-4">
                    <Text style={{ fontFamily: 'Outfit_700Bold' }} className="text-[#00FF94] text-sm">
                      {item.step}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text style={{ fontFamily: 'Outfit_600SemiBold' }} className="text-white text-sm">
                      {item.title}
                    </Text>
                    <Text style={{ fontFamily: 'Outfit_400Regular' }} className="text-gray-400 text-xs">
                      {item.desc}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>
        </ScrollView>

        {/* Bottom CTA */}
        <Animated.View
          entering={FadeInUp.delay(500).springify()}
          className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-4"
          style={{ backgroundColor: 'rgba(10, 10, 15, 0.95)' }}
        >
          <Pressable
            onPress={handleStartChallenge}
            disabled={stakeAmount > balance}
            style={{ opacity: stakeAmount > balance ? 0.5 : 1 }}
          >
            <LinearGradient
              colors={['#00FF94', '#00D9FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ borderRadius: 16, paddingVertical: 18, alignItems: 'center' }}
            >
              <Text style={{ fontFamily: 'Sora_700Bold' }} className="text-black text-lg">
                Stake ${stakeAmount} & Start Challenge
              </Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
