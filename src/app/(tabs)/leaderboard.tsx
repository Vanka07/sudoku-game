import React from 'react';
import { View, Text, ScrollView, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Flame, TrendingUp, Medal, Crown } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInRight, useAnimatedStyle, useSharedValue, withSpring, withSequence, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  winStreak: number;
  totalWon: number;
  successRate: number;
  rank: number;
}

interface TrendingChallenge {
  id: string;
  title: string;
  icon: string;
  activeStakes: number;
  totalPool: number;
  hotScore: number;
}

const MOCK_LEADERBOARD: LeaderboardUser[] = [
  { id: '1', name: 'IronWill_Sarah', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', winStreak: 23, totalWon: 4250, successRate: 89, rank: 1 },
  { id: '2', name: 'FitnessFrankie', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', winStreak: 18, totalWon: 3820, successRate: 85, rank: 2 },
  { id: '3', name: 'GoalGetter', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop', winStreak: 15, totalWon: 3150, successRate: 82, rank: 3 },
  { id: '4', name: 'NoExcuses_Mike', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop', winStreak: 12, totalWon: 2890, successRate: 79, rank: 4 },
  { id: '5', name: 'DisciplinedDana', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', winStreak: 11, totalWon: 2540, successRate: 77, rank: 5 },
  { id: '6', name: 'StreakSeeker', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop', winStreak: 9, totalWon: 2120, successRate: 74, rank: 6 },
  { id: '7', name: 'WillPowerWin', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop', winStreak: 8, totalWon: 1890, successRate: 72, rank: 7 },
];

const TRENDING_CHALLENGES: TrendingChallenge[] = [
  { id: '1', title: '30-Day Running Streak', icon: '🏃', activeStakes: 847, totalPool: 42350, hotScore: 98 },
  { id: '2', title: 'No Social Media Weekend', icon: '📵', activeStakes: 1253, totalPool: 37590, hotScore: 95 },
  { id: '3', title: 'Wake Up at 6 AM', icon: '⏰', activeStakes: 634, totalPool: 25360, hotScore: 87 },
  { id: '4', title: '100 Pushups Daily', icon: '💪', activeStakes: 421, totalPool: 21050, hotScore: 82 },
];

function getRankColor(rank: number): readonly [string, string] {
  switch (rank) {
    case 1:
      return ['#FFD700', '#FFA500'] as const;
    case 2:
      return ['#C0C0C0', '#A8A8A8'] as const;
    case 3:
      return ['#CD7F32', '#B8860B'] as const;
    default:
      return ['#3F3F4A', '#2A2A35'] as const;
  }
}

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Crown size={16} color="#FFD700" />;
    case 2:
      return <Medal size={16} color="#C0C0C0" />;
    case 3:
      return <Medal size={16} color="#CD7F32" />;
    default:
      return null;
  }
}

function TopThreeCard({ user, position }: { user: LeaderboardUser; position: 1 | 2 | 3 }) {
  const isFirst = position === 1;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 15 })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(position * 100).springify()}
      style={animatedStyle}
      className={`items-center ${isFirst ? 'mx-2' : ''}`}
    >
      <Pressable onPress={handlePress} className="items-center">
        {/* Avatar with gradient border */}
        <LinearGradient
          colors={getRankColor(position)}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            padding: 3,
            borderRadius: 100,
            marginBottom: 8,
          }}
        >
          <Image
            source={{ uri: user.avatar }}
            style={{
              width: isFirst ? 80 : 64,
              height: isFirst ? 80 : 64,
              borderRadius: 100,
              borderWidth: 3,
              borderColor: '#0A0A0F',
            }}
          />
        </LinearGradient>

        {/* Rank Badge */}
        <View
          className="absolute -bottom-1 px-2.5 py-1 rounded-full"
          style={{ backgroundColor: getRankColor(position)[0] }}
        >
          <Text style={{ fontFamily: 'Outfit_700Bold' }} className="text-black text-xs">
            #{position}
          </Text>
        </View>
      </Pressable>

      {/* Name */}
      <Text
        style={{ fontFamily: 'Outfit_600SemiBold' }}
        className="text-white text-sm mt-3 text-center"
        numberOfLines={1}
      >
        {user.name}
      </Text>

      {/* Stats */}
      <View className="flex-row items-center mt-1">
        <Flame size={12} color="#FF4757" />
        <Text style={{ fontFamily: 'Outfit_500Medium' }} className="text-gray-400 text-xs ml-1">
          {user.winStreak} streak
        </Text>
      </View>
      <Text style={{ fontFamily: 'Sora_700Bold' }} className="text-[#00FF94] text-lg mt-1">
        ${user.totalWon.toLocaleString()}
      </Text>
    </Animated.View>
  );
}

function LeaderboardRow({ user, index }: { user: LeaderboardUser; index: number }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.98, { duration: 100 }),
      withSpring(1, { damping: 15 })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <Animated.View entering={FadeInRight.delay(index * 50).springify()}>
      <Animated.View style={animatedStyle}>
        <Pressable
          onPress={handlePress}
          className="flex-row items-center bg-[#12121A] rounded-xl p-4 mb-2"
          style={{ borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' }}
        >
          {/* Rank */}
          <View className="w-8 items-center">
            <Text style={{ fontFamily: 'Outfit_600SemiBold' }} className="text-gray-400 text-sm">
              #{user.rank}
            </Text>
          </View>

          {/* Avatar */}
          <Image source={{ uri: user.avatar }} className="w-10 h-10 rounded-full mx-3" />

          {/* Info */}
          <View className="flex-1">
            <Text style={{ fontFamily: 'Outfit_600SemiBold' }} className="text-white text-sm">
              {user.name}
            </Text>
            <View className="flex-row items-center mt-0.5">
              <Flame size={10} color="#FF4757" />
              <Text style={{ fontFamily: 'Outfit_400Regular' }} className="text-gray-400 text-xs ml-1">
                {user.winStreak} streak · {user.successRate}% win
              </Text>
            </View>
          </View>

          {/* Earnings */}
          <Text style={{ fontFamily: 'Sora_600SemiBold' }} className="text-[#00FF94] text-sm">
            ${user.totalWon.toLocaleString()}
          </Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

function TrendingChallengeCard({ challenge, index }: { challenge: TrendingChallenge; index: number }) {
  return (
    <Animated.View entering={FadeInRight.delay(index * 80).springify()}>
      <View
        className="mr-3 bg-[#12121A] rounded-2xl p-4"
        style={{ width: 180, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' }}
      >
        {/* Hot Badge */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="bg-[#FF4757]/20 px-2 py-1 rounded-full flex-row items-center">
            <Flame size={12} color="#FF4757" />
            <Text style={{ fontFamily: 'Outfit_600SemiBold' }} className="text-[#FF4757] text-xs ml-1">
              {challenge.hotScore}% hot
            </Text>
          </View>
        </View>

        {/* Icon and Title */}
        <Text className="text-3xl mb-2">{challenge.icon}</Text>
        <Text style={{ fontFamily: 'Sora_600SemiBold' }} className="text-white text-sm mb-3" numberOfLines={2}>
          {challenge.title}
        </Text>

        {/* Stats */}
        <View className="border-t border-[#1F1F2E] pt-3">
          <View className="flex-row items-center justify-between">
            <Text style={{ fontFamily: 'Outfit_400Regular' }} className="text-gray-500 text-xs">
              Active stakes
            </Text>
            <Text style={{ fontFamily: 'Outfit_600SemiBold' }} className="text-white text-xs">
              {challenge.activeStakes.toLocaleString()}
            </Text>
          </View>
          <View className="flex-row items-center justify-between mt-1">
            <Text style={{ fontFamily: 'Outfit_400Regular' }} className="text-gray-500 text-xs">
              Total pool
            </Text>
            <Text style={{ fontFamily: 'Outfit_600SemiBold' }} className="text-[#00FF94] text-xs">
              ${challenge.totalPool.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

export default function LeaderboardScreen() {
  const topThree = MOCK_LEADERBOARD.slice(0, 3);
  const restOfLeaderboard = MOCK_LEADERBOARD.slice(3);

  return (
    <View className="flex-1 bg-[#0A0A0F]">
      <SafeAreaView edges={['top']} className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(100).springify()} className="px-5 pt-4 pb-6">
            <View className="flex-row items-center">
              <Trophy size={24} color="#FFD700" />
              <Text style={{ fontFamily: 'Sora_700Bold' }} className="text-white text-2xl ml-2">
                Leaderboard
              </Text>
            </View>
            <Text style={{ fontFamily: 'Outfit_400Regular' }} className="text-gray-400 text-sm mt-1">
              Top performers this month
            </Text>
          </Animated.View>

          {/* Top 3 Podium */}
          <Animated.View entering={FadeInDown.delay(200).springify()} className="px-5 mb-8">
            <View className="flex-row items-end justify-center">
              {/* 2nd Place */}
              <TopThreeCard user={topThree[1]} position={2} />
              {/* 1st Place */}
              <View className="-mt-4">
                <TopThreeCard user={topThree[0]} position={1} />
              </View>
              {/* 3rd Place */}
              <TopThreeCard user={topThree[2]} position={3} />
            </View>
          </Animated.View>

          {/* Trending Challenges */}
          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <View className="flex-row items-center px-5 mb-4">
              <Flame size={18} color="#FF4757" />
              <Text style={{ fontFamily: 'Sora_600SemiBold' }} className="text-white text-lg ml-2">
                Trending Now
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 20, paddingRight: 8 }}
              style={{ flexGrow: 0 }}
            >
              {TRENDING_CHALLENGES.map((challenge, index) => (
                <TrendingChallengeCard key={challenge.id} challenge={challenge} index={index} />
              ))}
            </ScrollView>
          </Animated.View>

          {/* Rest of Leaderboard */}
          <Animated.View entering={FadeInDown.delay(400).springify()} className="px-5 mt-8 mb-32">
            <Text style={{ fontFamily: 'Sora_600SemiBold' }} className="text-white text-lg mb-4">
              Rankings
            </Text>
            {restOfLeaderboard.map((user, index) => (
              <LeaderboardRow key={user.id} user={user} index={index} />
            ))}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
