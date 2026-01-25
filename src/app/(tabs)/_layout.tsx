import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, Pressable } from 'react-native';
import { Home, Search, User, Flame } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import Animated, { useAnimatedStyle, withSpring, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface TabIconProps {
  icon: React.ReactNode;
  label: string;
  focused: boolean;
}

function TabIcon({ icon, label, focused }: TabIconProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  React.useEffect(() => {
    if (focused) {
      scale.value = withSequence(
        withTiming(1.15, { duration: 100 }),
        withSpring(1, { damping: 15, stiffness: 300 })
      );
    }
  }, [focused]);

  return (
    <Animated.View style={animatedStyle} className="items-center justify-center py-2">
      <View className={`p-2 rounded-xl ${focused ? 'bg-[#00FF94]/15' : ''}`}>
        {icon}
      </View>
      <Text
        style={{ fontFamily: 'Outfit_500Medium' }}
        className={`text-[10px] mt-1 ${focused ? 'text-[#00FF94]' : 'text-gray-500'}`}
      >
        {label}
      </Text>
    </Animated.View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'rgba(18, 18, 26, 0.85)',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255, 255, 255, 0.08)',
          height: 85,
          paddingBottom: 20,
          paddingTop: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon={<Home size={22} color={focused ? '#00FF94' : '#6B7280'} strokeWidth={focused ? 2.5 : 2} />}
              label="Home"
              focused={focused}
            />
          ),
        }}
        listeners={{
          tabPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
        }}
      />
      <Tabs.Screen
        name="challenges"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon={<Search size={22} color={focused ? '#00FF94' : '#6B7280'} strokeWidth={focused ? 2.5 : 2} />}
              label="Explore"
              focused={focused}
            />
          ),
        }}
        listeners={{
          tabPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon={<Flame size={22} color={focused ? '#00FF94' : '#6B7280'} strokeWidth={focused ? 2.5 : 2} />}
              label="Hot"
              focused={focused}
            />
          ),
        }}
        listeners={{
          tabPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon={<User size={22} color={focused ? '#00FF94' : '#6B7280'} strokeWidth={focused ? 2.5 : 2} />}
              label="Profile"
              focused={focused}
            />
          ),
        }}
        listeners={{
          tabPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
        }}
      />
    </Tabs>
  );
}
