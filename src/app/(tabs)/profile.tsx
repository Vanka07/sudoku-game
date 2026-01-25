import React from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Settings, Trophy, TrendingUp, TrendingDown, Calendar, Target, Flame, ChevronRight, CreditCard, Bell, HelpCircle, LogOut } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInRight, useAnimatedStyle, useSharedValue, withSpring, withSequence, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useStore } from '@/lib/store';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function StatBlock({ label, value, icon, color, delay }: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  delay: number;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()} className="flex-1 mx-1">
      <View
        className="bg-[#12121A] rounded-2xl p-4 items-center"
        style={{ borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' }}
      >
        <View className="p-2 rounded-xl mb-2" style={{ backgroundColor: `${color}20` }}>
          {icon}
        </View>
        <Text style={{ fontFamily: 'Sora_700Bold' }} className="text-white text-xl">
          {value}
        </Text>
        <Text style={{ fontFamily: 'Outfit_400Regular' }} className="text-gray-400 text-xs mt-1">
          {label}
        </Text>
      </View>
    </Animated.View>
  );
}

function MenuRow({ icon, label, value, onPress, delay, danger }: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress: () => void;
  delay: number;
  danger?: boolean;
}) {
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
    onPress();
  };

  return (
    <Animated.View entering={FadeInRight.delay(delay).springify()}>
      <AnimatedPressable style={animatedStyle} onPress={handlePress}>
        <View className="flex-row items-center py-4 border-b border-[#1F1F2E]">
          <View className={`p-2 rounded-xl mr-4 ${danger ? 'bg-[#FF4757]/20' : 'bg-[#1A1A24]'}`}>
            {icon}
          </View>
          <Text
            style={{ fontFamily: 'Outfit_500Medium' }}
            className={`flex-1 text-base ${danger ? 'text-[#FF4757]' : 'text-white'}`}
          >
            {label}
          </Text>
          {value && (
            <Text style={{ fontFamily: 'Outfit_400Regular' }} className="text-gray-400 text-sm mr-2">
              {value}
            </Text>
          )}
          <ChevronRight size={18} color="#3F3F4A" />
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

function AchievementBadge({ emoji, label, unlocked, delay }: {
  emoji: string;
  label: string;
  unlocked: boolean;
  delay: number;
}) {
  return (
    <Animated.View entering={FadeInRight.delay(delay).springify()} className="items-center mr-4">
      <View
        className={`w-14 h-14 rounded-full items-center justify-center mb-1 ${unlocked ? 'bg-[#1A1A24]' : 'bg-[#0F0F14]'}`}
        style={{
          borderWidth: 2,
          borderColor: unlocked ? '#00FF94' : '#1F1F2E',
          opacity: unlocked ? 1 : 0.5,
        }}
      >
        <Text className={`text-xl ${unlocked ? '' : 'grayscale'}`}>{emoji}</Text>
      </View>
      <Text
        style={{ fontFamily: 'Outfit_400Regular' }}
        className={`text-[10px] ${unlocked ? 'text-gray-300' : 'text-gray-600'}`}
      >
        {label}
      </Text>
    </Animated.View>
  );
}

export default function ProfileScreen() {
  const userName = useStore((s) => s.userName);
  const balance = useStore((s) => s.balance);
  const stats = useStore((s) => s.stats);

  return (
    <View className="flex-1 bg-[#0A0A0F]">
      <SafeAreaView edges={['top']} className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(100).springify()} className="px-5 pt-4 flex-row items-center justify-between">
            <Text style={{ fontFamily: 'Sora_700Bold' }} className="text-white text-2xl">
              Profile
            </Text>
            <Pressable
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              className="p-2 bg-[#12121A] rounded-xl"
            >
              <Settings size={20} color="#6B7280" />
            </Pressable>
          </Animated.View>

          {/* Profile Card */}
          <Animated.View entering={FadeInDown.delay(150).springify()} className="px-5 mt-6">
            <LinearGradient
              colors={['#00FF94', '#00D9FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 24, padding: 1 }}
            >
              <View className="bg-[#0A0A0F] rounded-3xl p-5">
                <View className="flex-row items-center">
                  {/* Avatar */}
                  <LinearGradient
                    colors={['#00FF94', '#00D9FF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ padding: 3, borderRadius: 100 }}
                  >
                    <View className="w-20 h-20 rounded-full bg-[#12121A] items-center justify-center">
                      <Text className="text-3xl">👤</Text>
                    </View>
                  </LinearGradient>

                  <View className="ml-4 flex-1">
                    <Text style={{ fontFamily: 'Sora_700Bold' }} className="text-white text-xl">
                      {userName}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <View className="bg-[#FFB800]/20 px-2 py-0.5 rounded-full flex-row items-center">
                        <Flame size={12} color="#FFB800" />
                        <Text style={{ fontFamily: 'Outfit_600SemiBold' }} className="text-[#FFB800] text-xs ml-1">
                          {stats.winStreak} streak
                        </Text>
                      </View>
                      <View className="bg-[#00FF94]/20 px-2 py-0.5 rounded-full flex-row items-center ml-2">
                        <Trophy size={12} color="#00FF94" />
                        <Text style={{ fontFamily: 'Outfit_600SemiBold' }} className="text-[#00FF94] text-xs ml-1">
                          {stats.successRate}% win
                        </Text>
                      </View>
                    </View>
                    <Text style={{ fontFamily: 'Outfit_400Regular' }} className="text-gray-400 text-xs mt-2">
                      Member since Jan 2024
                    </Text>
                  </View>
                </View>

                {/* Balance */}
                <View className="mt-5 pt-5 border-t border-[#1F1F2E] flex-row items-center justify-between">
                  <View>
                    <Text style={{ fontFamily: 'Outfit_400Regular' }} className="text-gray-400 text-xs">
                      Available Balance
                    </Text>
                    <Text style={{ fontFamily: 'Sora_700Bold' }} className="text-white text-2xl">
                      ${balance.toFixed(2)}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                    className="bg-[#00FF94] px-5 py-2.5 rounded-xl"
                  >
                    <Text style={{ fontFamily: 'Outfit_700Bold' }} className="text-black text-sm">
                      Add Funds
                    </Text>
                  </Pressable>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Stats Grid */}
          <Animated.View entering={FadeInDown.delay(200).springify()} className="px-4 mt-6">
            <View className="flex-row">
              <StatBlock
                label="Total Staked"
                value={`$${stats.totalStaked}`}
                icon={<Target size={18} color="#00D9FF" />}
                color="#00D9FF"
                delay={200}
              />
              <StatBlock
                label="Total Won"
                value={`$${stats.totalWon}`}
                icon={<TrendingUp size={18} color="#00FF94" />}
                color="#00FF94"
                delay={250}
              />
              <StatBlock
                label="Total Lost"
                value={`$${stats.totalLost}`}
                icon={<TrendingDown size={18} color="#FF4757" />}
                color="#FF4757"
                delay={300}
              />
            </View>
          </Animated.View>

          {/* Achievements */}
          <Animated.View entering={FadeInDown.delay(350).springify()} className="mt-8">
            <View className="flex-row items-center justify-between px-5 mb-4">
              <Text style={{ fontFamily: 'Sora_600SemiBold' }} className="text-white text-lg">
                Achievements
              </Text>
              <Text style={{ fontFamily: 'Outfit_500Medium' }} className="text-gray-400 text-sm">
                5/12 unlocked
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 20, paddingRight: 12 }}
              style={{ flexGrow: 0 }}
            >
              <AchievementBadge emoji="🔥" label="5 Streak" unlocked={true} delay={350} />
              <AchievementBadge emoji="💪" label="First Win" unlocked={true} delay={400} />
              <AchievementBadge emoji="🏃" label="Fitness Pro" unlocked={true} delay={450} />
              <AchievementBadge emoji="📚" label="Learner" unlocked={true} delay={500} />
              <AchievementBadge emoji="💰" label="$500 Won" unlocked={true} delay={550} />
              <AchievementBadge emoji="👑" label="10 Streak" unlocked={false} delay={600} />
              <AchievementBadge emoji="🏆" label="Champion" unlocked={false} delay={650} />
            </ScrollView>
          </Animated.View>

          {/* Menu */}
          <Animated.View entering={FadeInDown.delay(400).springify()} className="px-5 mt-8 mb-32">
            <Text style={{ fontFamily: 'Sora_600SemiBold' }} className="text-white text-lg mb-2">
              Settings
            </Text>
            <View className="bg-[#12121A] rounded-2xl px-4" style={{ borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' }}>
              <MenuRow
                icon={<CreditCard size={18} color="#00D9FF" />}
                label="Payment Methods"
                value="•••• 4242"
                onPress={() => {}}
                delay={450}
              />
              <MenuRow
                icon={<Bell size={18} color="#FFB800" />}
                label="Notifications"
                value="On"
                onPress={() => {}}
                delay={500}
              />
              <MenuRow
                icon={<Calendar size={18} color="#00FF94" />}
                label="Challenge History"
                value={`${stats.completedChallenges} completed`}
                onPress={() => {}}
                delay={550}
              />
              <MenuRow
                icon={<HelpCircle size={18} color="#6B7280" />}
                label="Help & Support"
                onPress={() => {}}
                delay={600}
              />
              <View className="border-b-0">
                <MenuRow
                  icon={<LogOut size={18} color="#FF4757" />}
                  label="Sign Out"
                  onPress={() => {}}
                  delay={650}
                  danger
                />
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
