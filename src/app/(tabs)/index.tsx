import React from 'react';
import { View, Text, ScrollView, Pressable, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Clock, TrendingUp, ChevronRight, Zap, DollarSign, Target, AlertCircle } from 'lucide-react-native';
import Animated, {
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useStore, Stake } from '@/lib/store';

const { width } = Dimensions.get('window');

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function formatTimeLeft(deadline: Date): string {
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h left`;
  return 'Due soon';
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return '#00FF94';
    case 'pending_proof':
      return '#FFB800';
    case 'completed':
      return '#00D9FF';
    case 'failed':
      return '#FF4757';
    default:
      return '#6B7280';
  }
}

function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    fitness: '🏃',
    learning: '📚',
    productivity: '⚡',
    health: '💚',
    creative: '🎨',
  };
  return emojis[category] || '🎯';
}

function StakeCard({ stake, index }: { stake: Stake; index: number }) {
  const router = useRouter();
  const scale = useSharedValue(1);
  const isUrgent = stake.status === 'pending_proof';

  const pulseAnim = useSharedValue(1);

  React.useEffect(() => {
    if (isUrgent) {
      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [isUrgent]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * pulseAnim.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.97, { duration: 100 }),
      withSpring(1, { damping: 15 })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (stake.status === 'pending_proof') {
      router.push({ pathname: '/submit-proof', params: { stakeId: stake.id } });
    }
  };

  return (
    <Animated.View entering={FadeInRight.delay(index * 100).springify()}>
      <AnimatedPressable style={animatedStyle} onPress={handlePress}>
        <View className="mr-4" style={{ width: width * 0.8 }}>
          <LinearGradient
            colors={isUrgent ? ['#2A1F00', '#1A1500', '#12121A'] : ['#1A1A24', '#12121A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 20,
              padding: 20,
              borderWidth: 1,
              borderColor: isUrgent ? 'rgba(255, 184, 0, 0.3)' : 'rgba(255, 255, 255, 0.08)',
            }}
          >
            {/* Status Badge */}
            <View className="flex-row items-center justify-between mb-4">
              <View
                className="flex-row items-center px-3 py-1.5 rounded-full"
                style={{ backgroundColor: `${getStatusColor(stake.status)}20` }}
              >
                <View
                  className="w-2 h-2 rounded-full mr-2"
                  style={{ backgroundColor: getStatusColor(stake.status) }}
                />
                <Text
                  style={{ fontFamily: 'Outfit_600SemiBold', color: getStatusColor(stake.status) }}
                  className="text-xs uppercase"
                >
                  {stake.status === 'pending_proof' ? 'Proof Needed' : stake.status}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Clock size={14} color="#6B7280" />
                <Text style={{ fontFamily: 'Outfit_500Medium' }} className="text-gray-400 text-xs ml-1">
                  {formatTimeLeft(new Date(stake.deadline))}
                </Text>
              </View>
            </View>

            {/* Challenge Title */}
            <View className="flex-row items-center mb-3">
              <Text className="text-2xl mr-2">{getCategoryEmoji(stake.category)}</Text>
              <Text style={{ fontFamily: 'Sora_600SemiBold' }} className="text-white text-lg flex-1">
                {stake.challengeTitle}
              </Text>
            </View>

            {/* Stake Amount */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="bg-[#00FF94]/20 p-2 rounded-lg mr-3">
                  <DollarSign size={18} color="#00FF94" />
                </View>
                <View>
                  <Text style={{ fontFamily: 'Outfit_400Regular' }} className="text-gray-400 text-xs">
                    Your stake
                  </Text>
                  <Text style={{ fontFamily: 'Sora_700Bold' }} className="text-white text-xl">
                    ${stake.amount}
                  </Text>
                </View>
              </View>

              {/* Opponent */}
              {stake.opponentName && (
                <View className="flex-row items-center">
                  <View className="items-end mr-2">
                    <Text style={{ fontFamily: 'Outfit_400Regular' }} className="text-gray-400 text-xs">
                      vs
                    </Text>
                    <Text style={{ fontFamily: 'Outfit_600SemiBold' }} className="text-white text-sm">
                      {stake.opponentName}
                    </Text>
                  </View>
                  <Image
                    source={{ uri: stake.opponentAvatar }}
                    className="w-10 h-10 rounded-full"
                    style={{ borderWidth: 2, borderColor: '#FF4757' }}
                  />
                </View>
              )}
            </View>

            {/* Urgent Action */}
            {isUrgent && (
              <Pressable
                className="mt-4 bg-[#FFB800] rounded-xl py-3 flex-row items-center justify-center"
                onPress={handlePress}
              >
                <AlertCircle size={18} color="#000" />
                <Text style={{ fontFamily: 'Outfit_700Bold' }} className="text-black text-sm ml-2">
                  Submit Proof Now
                </Text>
              </Pressable>
            )}
          </LinearGradient>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

function StatCard({ title, value, icon, color, delay }: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  delay: number;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()} className="flex-1">
      <View
        className="bg-[#12121A] rounded-2xl p-4 mr-2"
        style={{ borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' }}
      >
        <View className="p-2 rounded-xl self-start mb-2" style={{ backgroundColor: `${color}20` }}>
          {icon}
        </View>
        <Text style={{ fontFamily: 'Outfit_400Regular' }} className="text-gray-400 text-xs mb-1">
          {title}
        </Text>
        <Text style={{ fontFamily: 'Sora_700Bold' }} className="text-white text-xl">
          {value}
        </Text>
      </View>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const balance = useStore((s) => s.balance);
  const activeStakes = useStore((s) => s.activeStakes);
  const stats = useStore((s) => s.stats);
  const userName = useStore((s) => s.userName);

  const totalAtRisk = activeStakes.reduce((sum, s) => sum + s.amount, 0);

  return (
    <View className="flex-1 bg-[#0A0A0F]">
      <SafeAreaView edges={['top']} className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(100).springify()} className="px-5 pt-4 pb-6">
            <View className="flex-row items-center justify-between mb-6">
              <View>
                <Text style={{ fontFamily: 'Outfit_400Regular' }} className="text-gray-400 text-sm">
                  Welcome back,
                </Text>
                <Text style={{ fontFamily: 'Sora_700Bold' }} className="text-white text-2xl">
                  {userName} 👋
                </Text>
              </View>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/profile');
                }}
              >
                <LinearGradient
                  colors={['#00FF94', '#00D9FF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ padding: 2, borderRadius: 50 }}
                >
                  <View className="bg-[#0A0A0F] rounded-full p-1">
                    <View className="w-10 h-10 bg-[#12121A] rounded-full items-center justify-center">
                      <Text className="text-lg">🔥</Text>
                    </View>
                  </View>
                </LinearGradient>
              </Pressable>
            </View>

            {/* Balance Card */}
            <LinearGradient
              colors={['#00FF94', '#00D9FF', '#00FF94']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 24, padding: 1 }}
            >
              <View className="bg-[#0A0A0F] rounded-3xl p-5">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text style={{ fontFamily: 'Outfit_400Regular' }} className="text-gray-400 text-sm">
                      Available Balance
                    </Text>
                    <Text style={{ fontFamily: 'Sora_700Bold' }} className="text-white text-4xl mt-1">
                      ${balance.toFixed(2)}
                    </Text>
                  </View>
                  <View className="items-end">
                    <View className="flex-row items-center bg-[#00FF94]/20 px-3 py-1.5 rounded-full mb-2">
                      <TrendingUp size={14} color="#00FF94" />
                      <Text style={{ fontFamily: 'Outfit_600SemiBold' }} className="text-[#00FF94] text-xs ml-1">
                        +{stats.successRate}% win rate
                      </Text>
                    </View>
                    <Text style={{ fontFamily: 'Outfit_500Medium' }} className="text-gray-400 text-xs">
                      ${totalAtRisk} at risk
                    </Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Quick Stats */}
          <Animated.View entering={FadeInDown.delay(200).springify()} className="px-5 mb-6">
            <View className="flex-row">
              <StatCard
                title="Win Streak"
                value={`🔥 ${stats.winStreak}`}
                icon={<Zap size={18} color="#FFB800" />}
                color="#FFB800"
                delay={200}
              />
              <StatCard
                title="Total Won"
                value={`$${stats.totalWon}`}
                icon={<TrendingUp size={18} color="#00FF94" />}
                color="#00FF94"
                delay={250}
              />
              <StatCard
                title="Challenges"
                value={`${stats.completedChallenges}`}
                icon={<Target size={18} color="#00D9FF" />}
                color="#00D9FF"
                delay={300}
              />
            </View>
          </Animated.View>

          {/* Active Stakes */}
          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <View className="flex-row items-center justify-between px-5 mb-4">
              <Text style={{ fontFamily: 'Sora_600SemiBold' }} className="text-white text-lg">
                Active Stakes
              </Text>
              <View className="bg-[#00FF94]/20 px-3 py-1 rounded-full">
                <Text style={{ fontFamily: 'Outfit_600SemiBold' }} className="text-[#00FF94] text-xs">
                  {activeStakes.length} active
                </Text>
              </View>
            </View>

            {activeStakes.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingLeft: 20, paddingRight: 4 }}
              >
                {activeStakes.map((stake, index) => (
                  <StakeCard key={stake.id} stake={stake} index={index} />
                ))}
              </ScrollView>
            ) : (
              <View className="mx-5 bg-[#12121A] rounded-2xl p-6 items-center">
                <Text className="text-4xl mb-3">🎯</Text>
                <Text style={{ fontFamily: 'Sora_600SemiBold' }} className="text-white text-lg mb-1">
                  No Active Stakes
                </Text>
                <Text style={{ fontFamily: 'Outfit_400Regular' }} className="text-gray-400 text-center text-sm">
                  Start a challenge to put your money where your goals are
                </Text>
              </View>
            )}
          </Animated.View>

          {/* CTA Button */}
          <Animated.View entering={FadeInDown.delay(400).springify()} className="px-5 mt-6 mb-32">
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                router.push('/challenges');
              }}
            >
              <LinearGradient
                colors={['#00FF94', '#00D9FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ borderRadius: 16, padding: 1 }}
              >
                <View className="bg-[#0A0A0F] rounded-2xl">
                  <LinearGradient
                    colors={['rgba(0, 255, 148, 0.15)', 'rgba(0, 217, 255, 0.15)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ borderRadius: 16, paddingVertical: 18, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text style={{ fontFamily: 'Sora_700Bold' }} className="text-white text-lg mr-2">
                      Start New Challenge
                    </Text>
                    <ChevronRight size={20} color="#00FF94" />
                  </LinearGradient>
                </View>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
