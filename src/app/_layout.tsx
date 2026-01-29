import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Rajdhani_400Regular, Rajdhani_500Medium, Rajdhani_600SemiBold, Rajdhani_700Bold } from '@expo-google-fonts/rajdhani';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import { View } from 'react-native';
import { useThemeStore, themes } from '@/lib/themeStore';

export const unstable_settings = {
  initialRouteName: 'index',
};

SplashScreen.preventAutoHideAsync();

const SudokuDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#6366F1',
    background: '#0A0A0F',
    card: '#12121A',
    text: '#FFFFFF',
    border: '#1F1F2E',
    notification: '#EF4444',
  },
};

const SudokuLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6366F1',
    background: '#F8FAFC',
    card: '#FFFFFF',
    text: '#1E293B',
    border: '#E2E8F0',
    notification: '#EF4444',
  },
};

function RootLayoutNav() {
  const theme = useThemeStore((s) => s.theme);
  const navTheme = theme === 'dark' ? SudokuDarkTheme : SudokuLightTheme;

  return (
    <ThemeProvider value={navTheme}>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="game" options={{ gestureEnabled: false }} />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const theme = useThemeStore((s) => s.theme);
  const loadTheme = useThemeStore((s) => s.loadTheme);

  const [fontsLoaded] = useFonts({
    Rajdhani_400Regular,
    Rajdhani_500Medium,
    Rajdhani_600SemiBold,
    Rajdhani_700Bold,
  });

  useEffect(() => {
    loadTheme();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#050508' }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <RootLayoutNav />
    </GestureHandlerRootView>
  );
}
