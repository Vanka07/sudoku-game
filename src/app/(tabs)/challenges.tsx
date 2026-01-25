import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Search, Users, TrendingUp, Clock, ChevronRight, Filter, X } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInRight, useAnimatedStyle, useSharedValue, withSpring, withSequence, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { CHALLENGES, Challenge, ChallengeCategory } from '@/lib/store';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const CATEGORIES: { id: ChallengeCategory | 'all'; label: string; emoji: string }[] = [
  { id: 'all', label: 'All', emoji: '🎯' },
  { id: 'fitness', label: 'Fitness', emoji: '🏃' },
  { id: 'learning', label: 'Learning', emoji: '📚' },
  { id: 'health', label: 'Health', emoji: '💚' },
  { id: 'productivity', label: 'Productivity', emoji: '⚡' },
  { id: 'creative', label: 'Creative', emoji: '🎨' },
];

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

function ChallengeCard({ challenge, index }: { challenge: Challenge; index: number }) {
  const router = useRouter();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.97, { duration: 100 }),
      withSpring(1, { damping: 15 })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({ pathname: '/challenge-detail', params: { challengeId: challenge.id } });
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).springify()}>
      <AnimatedPressable style={animatedStyle} onPress={handlePress}>
        <View
          className="bg-[#12121A] rounded-2xl p-4 mb-3"
          style={{ borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' }}
        >
          <View className="flex-row items-start">
            {/* Emoji Icon */}
            <View className="bg-[#1A1A24] w-14 h-14 rounded-xl items-center justify-center mr-4">
              <Text className="text-2xl">{challenge.icon}</Text>
            </View>

            <View className="flex-1">
              {/* Title and Difficulty */}
              <View className="flex-row items-center justify-between mb-1">
                <Text style={{ fontFamily: 'Sora_600SemiBold' }} className="text-white text-base flex-1 mr-2" numberOfLines={1}>
                  {challenge.title}
                </Text>
                <View
                  className="px-2 py-1 rounded-md"
                  style={{ backgroundColor: `${getDifficultyColor(challenge.difficulty)}20` }}
                >
                  <Text
                    style={{ fontFamily: 'Outfit_600SemiBold', color: getDifficultyColor(challenge.difficulty) }}
                    className="text-[10px] uppercase"
                  >
                    {challenge.difficulty}
                  </Text>
                </View>
              </View>

              {/* Description */}
              <Text style={{ fontFamily: 'Outfit_400Regular' }} className="text-gray-400 text-xs mb-3" numberOfLines={2}>
                {challenge.description}
              </Text>

              {/* Stats Row */}
              <View className="flex-row items-center">
                <View className="flex-row items-center mr-4">
                  <Users size={12} color="#6B7280" />
                  <Text style={{ fontFamily: 'Outfit_500Medium' }} className="text-gray-400 text-xs ml-1">
                    {challenge.participants.toLocaleString()}
                  </Text>
                </View>
                <View className="flex-row items-center mr-4">
                  <TrendingUp size={12} color="#00FF94" />
                  <Text style={{ fontFamily: 'Outfit_500Medium' }} className="text-[#00FF94] text-xs ml-1">
                    {challenge.successRate}% success
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Clock size={12} color="#6B7280" />
                  <Text style={{ fontFamily: 'Outfit_500Medium' }} className="text-gray-400 text-xs ml-1">
                    {challenge.duration}
                  </Text>
                </View>
              </View>
            </View>

            {/* Arrow */}
            <View className="justify-center ml-2">
              <ChevronRight size={20} color="#3F3F4A" />
            </View>
          </View>

          {/* Stake Range */}
          <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-[#1F1F2E]">
            <Text style={{ fontFamily: 'Outfit_400Regular' }} className="text-gray-500 text-xs">
              Stake range
            </Text>
            <Text style={{ fontFamily: 'Outfit_600SemiBold' }} className="text-white text-sm">
              ${challenge.minStake} - ${challenge.maxStake}
            </Text>
          </View>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

function CategoryPill({ category, isSelected, onPress }: {
  category: { id: ChallengeCategory | 'all'; label: string; emoji: string };
  isSelected: boolean;
  onPress: () => void;
}) {
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
    onPress();
  };

  return (
    <AnimatedPressable style={animatedStyle} onPress={handlePress}>
      {isSelected ? (
        <LinearGradient
          colors={['#00FF94', '#00D9FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ borderRadius: 20, marginRight: 8, paddingVertical: 10, paddingHorizontal: 16 }}
        >
          <View className="flex-row items-center">
            <Text className="mr-1.5">{category.emoji}</Text>
            <Text style={{ fontFamily: 'Outfit_600SemiBold' }} className="text-black text-sm">
              {category.label}
            </Text>
          </View>
        </LinearGradient>
      ) : (
        <View
          className="mr-2 py-2.5 px-4 rounded-full flex-row items-center"
          style={{ backgroundColor: '#1A1A24', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' }}
        >
          <Text className="mr-1.5">{category.emoji}</Text>
          <Text style={{ fontFamily: 'Outfit_500Medium' }} className="text-gray-300 text-sm">
            {category.label}
          </Text>
        </View>
      )}
    </AnimatedPressable>
  );
}

export default function ChallengesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ChallengeCategory | 'all'>('all');

  const filteredChallenges = CHALLENGES.filter((challenge) => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      challenge.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || challenge.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <View className="flex-1 bg-[#0A0A0F]">
      <SafeAreaView edges={['top']} className="flex-1">
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).springify()} className="px-5 pt-4 pb-4">
          <Text style={{ fontFamily: 'Sora_700Bold' }} className="text-white text-2xl mb-1">
            Explore Challenges
          </Text>
          <Text style={{ fontFamily: 'Outfit_400Regular' }} className="text-gray-400 text-sm">
            Find your next goal and put money on the line
          </Text>
        </Animated.View>

        {/* Search Bar */}
        <Animated.View entering={FadeInDown.delay(150).springify()} className="px-5 mb-4">
          <View
            className="flex-row items-center bg-[#12121A] rounded-xl px-4 py-3"
            style={{ borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' }}
          >
            <Search size={20} color="#6B7280" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search challenges..."
              placeholderTextColor="#6B7280"
              className="flex-1 ml-3 text-white text-base"
              style={{ fontFamily: 'Outfit_400Regular' }}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <X size={18} color="#6B7280" />
              </Pressable>
            )}
          </View>
        </Animated.View>

        {/* Categories */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 4 }}
            style={{ flexGrow: 0 }}
          >
            {CATEGORIES.map((category) => (
              <CategoryPill
                key={category.id}
                category={category}
                isSelected={selectedCategory === category.id}
                onPress={() => setSelectedCategory(category.id)}
              />
            ))}
          </ScrollView>
        </Animated.View>

        {/* Results Count */}
        <Animated.View entering={FadeInDown.delay(250).springify()} className="px-5 py-4">
          <Text style={{ fontFamily: 'Outfit_500Medium' }} className="text-gray-400 text-sm">
            {filteredChallenges.length} challenge{filteredChallenges.length !== 1 ? 's' : ''} available
          </Text>
        </Animated.View>

        {/* Challenge List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        >
          {filteredChallenges.map((challenge, index) => (
            <ChallengeCard key={challenge.id} challenge={challenge} index={index} />
          ))}

          {filteredChallenges.length === 0 && (
            <View className="items-center py-12">
              <Text className="text-4xl mb-3">🔍</Text>
              <Text style={{ fontFamily: 'Sora_600SemiBold' }} className="text-white text-lg mb-1">
                No challenges found
              </Text>
              <Text style={{ fontFamily: 'Outfit_400Regular' }} className="text-gray-400 text-center">
                Try a different search or category
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
