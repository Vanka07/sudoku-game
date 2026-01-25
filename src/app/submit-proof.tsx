import React, { useState } from 'react';
import { View, Text, Pressable, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X, Camera, Upload, CheckCircle, Clock, AlertTriangle, Send } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withSpring, withSequence, withTiming, withRepeat, Easing } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useStore } from '@/lib/store';

export default function SubmitProofScreen() {
  const router = useRouter();
  const { stakeId } = useLocalSearchParams<{ stakeId: string }>();
  const activeStakes = useStore((s) => s.activeStakes);
  const completeStake = useStore((s) => s.completeStake);

  const stake = activeStakes.find((s) => s.id === stakeId);

  const [proofImage, setProofImage] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const spinValue = useSharedValue(0);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinValue.value}deg` }],
  }));

  // Mock image for demo
  const selectImage = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // In real app, this would use expo-image-picker
    setProofImage('https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop');
  };

  const submitProof = () => {
    if (!stake) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsSubmitting(true);

    // Start spinning animation
    spinValue.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      -1,
      false
    );

    // Simulate upload
    setTimeout(() => {
      setIsSubmitting(false);
      setIsVerifying(true);

      // Simulate AI verification
      setTimeout(() => {
        spinValue.value = withTiming(0);
        setIsVerifying(false);
        setIsComplete(true);

        // Mark stake as complete
        completeStake(stake.id, true);

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 2000);
    }, 1500);
  };

  if (!stake) {
    return (
      <View className="flex-1 bg-[#0A0A0F] items-center justify-center">
        <Text className="text-white">Stake not found</Text>
      </View>
    );
  }

  const getCategoryEmoji = (category: string): string => {
    const emojis: Record<string, string> = {
      fitness: '🏃',
      learning: '📚',
      productivity: '⚡',
      health: '💚',
      creative: '🎨',
    };
    return emojis[category] || '🎯';
  };

  return (
    <View className="flex-1 bg-[#0A0A0F]">
      <LinearGradient
        colors={['rgba(255, 184, 0, 0.1)', 'transparent']}
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
          <Text style={{ fontFamily: 'Outfit_600SemiBold' }} className="text-white text-base">
            {isComplete ? 'Challenge Complete!' : isVerifying ? 'Verifying...' : 'Submit Proof'}
          </Text>
          <View className="w-10" />
        </Animated.View>

        {!isComplete ? (
          <View className="flex-1 px-5">
            {/* Challenge Info */}
            <Animated.View entering={FadeInDown.delay(150).springify()} className="items-center mb-6">
              <View className="w-16 h-16 bg-[#12121A] rounded-2xl items-center justify-center mb-3">
                <Text className="text-3xl">{getCategoryEmoji(stake.category)}</Text>
              </View>
              <Text style={{ fontFamily: 'Sora_600SemiBold' }} className="text-white text-lg text-center">
                {stake.challengeTitle}
              </Text>
              <View className="flex-row items-center mt-2 bg-[#FFB800]/20 px-3 py-1.5 rounded-full">
                <Clock size={14} color="#FFB800" />
                <Text style={{ fontFamily: 'Outfit_600SemiBold' }} className="text-[#FFB800] text-xs ml-1.5">
                  Proof required
                </Text>
              </View>
            </Animated.View>

            {/* Upload Area */}
            <Animated.View entering={FadeInDown.delay(200).springify()} className="mb-6">
              <Pressable onPress={selectImage}>
                {proofImage ? (
                  <View className="relative">
                    <Image
                      source={{ uri: proofImage }}
                      className="w-full h-64 rounded-2xl"
                      resizeMode="cover"
                    />
                    <View className="absolute top-3 right-3 bg-[#00FF94] p-2 rounded-full">
                      <CheckCircle size={20} color="#000" />
                    </View>
                    <Pressable
                      onPress={selectImage}
                      className="absolute bottom-3 right-3 bg-[#12121A]/90 px-4 py-2 rounded-xl flex-row items-center"
                    >
                      <Camera size={16} color="#fff" />
                      <Text style={{ fontFamily: 'Outfit_500Medium' }} className="text-white text-sm ml-2">
                        Change
                      </Text>
                    </Pressable>
                  </View>
                ) : (
                  <View
                    className="w-full h-64 rounded-2xl items-center justify-center"
                    style={{
                      backgroundColor: '#12121A',
                      borderWidth: 2,
                      borderColor: '#1F1F2E',
                      borderStyle: 'dashed',
                    }}
                  >
                    <View className="bg-[#1A1A24] p-4 rounded-full mb-4">
                      <Camera size={32} color="#6B7280" />
                    </View>
                    <Text style={{ fontFamily: 'Outfit_600SemiBold' }} className="text-white text-base mb-1">
                      Upload Your Proof
                    </Text>
                    <Text style={{ fontFamily: 'Outfit_400Regular' }} className="text-gray-400 text-sm text-center px-8">
                      Take a photo or upload evidence of your completed challenge
                    </Text>
                  </View>
                )}
              </Pressable>
            </Animated.View>

            {/* Notes Input */}
            <Animated.View entering={FadeInDown.delay(250).springify()} className="mb-6">
              <Text style={{ fontFamily: 'Outfit_600SemiBold' }} className="text-white text-sm mb-2">
                Add Notes (Optional)
              </Text>
              <View
                className="bg-[#12121A] rounded-xl p-4"
                style={{ borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' }}
              >
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Describe your achievement..."
                  placeholderTextColor="#6B7280"
                  multiline
                  numberOfLines={3}
                  className="text-white text-base"
                  style={{ fontFamily: 'Outfit_400Regular', minHeight: 80, textAlignVertical: 'top' }}
                />
              </View>
            </Animated.View>

            {/* Verification Info */}
            <Animated.View entering={FadeInDown.delay(300).springify()}>
              <View className="bg-[#00D9FF]/10 rounded-xl p-4 flex-row items-start">
                <AlertTriangle size={20} color="#00D9FF" />
                <View className="ml-3 flex-1">
                  <Text style={{ fontFamily: 'Outfit_600SemiBold' }} className="text-[#00D9FF] text-sm mb-1">
                    AI Verification
                  </Text>
                  <Text style={{ fontFamily: 'Outfit_400Regular' }} className="text-gray-400 text-xs">
                    Your proof will be analyzed by our AI system. False or misleading submissions may result in stake forfeiture.
                  </Text>
                </View>
              </View>
            </Animated.View>

            {/* Verifying Overlay */}
            {(isSubmitting || isVerifying) && (
              <View className="absolute inset-0 bg-[#0A0A0F]/90 items-center justify-center" style={{ top: 100 }}>
                <Animated.View style={spinStyle} className="mb-6">
                  <LinearGradient
                    colors={['#00FF94', '#00D9FF', '#00FF94']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ width: 80, height: 80, borderRadius: 40, padding: 3 }}
                  >
                    <View className="flex-1 bg-[#0A0A0F] rounded-full items-center justify-center">
                      {isSubmitting ? (
                        <Upload size={28} color="#00FF94" />
                      ) : (
                        <CheckCircle size={28} color="#00FF94" />
                      )}
                    </View>
                  </LinearGradient>
                </Animated.View>
                <Text style={{ fontFamily: 'Sora_600SemiBold' }} className="text-white text-lg mb-2">
                  {isSubmitting ? 'Uploading Proof...' : 'AI Verification in Progress'}
                </Text>
                <Text style={{ fontFamily: 'Outfit_400Regular' }} className="text-gray-400 text-sm text-center px-8">
                  {isSubmitting
                    ? 'Securely uploading your evidence'
                    : 'Analyzing your submission for authenticity'}
                </Text>
              </View>
            )}
          </View>
        ) : (
          /* Success State */
          <View className="flex-1 items-center justify-center px-5">
            <Animated.View entering={FadeInDown.springify()} className="items-center">
              <LinearGradient
                colors={['#00FF94', '#00D9FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ width: 100, height: 100, borderRadius: 50, padding: 3, marginBottom: 24 }}
              >
                <View className="flex-1 bg-[#0A0A0F] rounded-full items-center justify-center">
                  <CheckCircle size={48} color="#00FF94" />
                </View>
              </LinearGradient>

              <Text style={{ fontFamily: 'Sora_700Bold' }} className="text-white text-2xl mb-2">
                Challenge Complete!
              </Text>
              <Text style={{ fontFamily: 'Outfit_400Regular' }} className="text-gray-400 text-center text-sm mb-8">
                Congratulations! Your proof has been verified.
              </Text>

              <LinearGradient
                colors={['#00FF94', '#00D9FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 20, padding: 1, width: '100%' }}
              >
                <View className="bg-[#0A0A0F] rounded-[19px] p-6 items-center">
                  <Text style={{ fontFamily: 'Outfit_400Regular' }} className="text-gray-400 text-sm mb-1">
                    You won
                  </Text>
                  <Text style={{ fontFamily: 'Sora_700Bold' }} className="text-[#00FF94] text-4xl">
                    +${(stake.amount * 0.8).toFixed(0)}
                  </Text>
                  <Text style={{ fontFamily: 'Outfit_400Regular' }} className="text-gray-400 text-xs mt-2">
                    ${stake.amount * 1.8} total returned to your balance
                  </Text>
                </View>
              </LinearGradient>

              {stake.opponentName && (
                <View className="flex-row items-center mt-6 bg-[#FF4757]/10 px-4 py-3 rounded-xl">
                  <Image
                    source={{ uri: stake.opponentAvatar }}
                    className="w-8 h-8 rounded-full mr-3"
                  />
                  <Text style={{ fontFamily: 'Outfit_500Medium' }} className="text-gray-300 text-sm">
                    You beat {stake.opponentName}!
                  </Text>
                </View>
              )}
            </Animated.View>
          </View>
        )}

        {/* Bottom CTA */}
        <Animated.View
          entering={FadeInUp.delay(400).springify()}
          className="px-5 pb-8"
        >
          {!isComplete && !isSubmitting && !isVerifying && (
            <Pressable
              onPress={submitProof}
              disabled={!proofImage}
              style={{ opacity: proofImage ? 1 : 0.5 }}
            >
              <LinearGradient
                colors={['#FFB800', '#FF8C00']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ borderRadius: 16, paddingVertical: 18, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
              >
                <Send size={20} color="#000" />
                <Text style={{ fontFamily: 'Sora_700Bold' }} className="text-black text-lg ml-2">
                  Submit for Verification
                </Text>
              </LinearGradient>
            </Pressable>
          )}

          {isComplete && (
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.dismissAll();
                router.replace('/');
              }}
            >
              <LinearGradient
                colors={['#00FF94', '#00D9FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ borderRadius: 16, paddingVertical: 18, alignItems: 'center' }}
              >
                <Text style={{ fontFamily: 'Sora_700Bold' }} className="text-black text-lg">
                  Back to Home
                </Text>
              </LinearGradient>
            </Pressable>
          )}
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
