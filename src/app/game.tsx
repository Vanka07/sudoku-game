import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Pause,
  Lightbulb,
  Pencil,
  Eraser,
  Home,
} from 'lucide-react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSudokuStore, DIFFICULTY_CONFIG, Cell } from '@/lib/sudokuStore';
import { useThemeStore, themes } from '@/lib/themeStore';

const { width } = Dimensions.get('window');
const BOARD_PADDING = 16;
const BOARD_SIZE = width - BOARD_PADDING * 2;
const CELL_SIZE = BOARD_SIZE / 9;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function SudokuCell({
  cell,
  row,
  col,
  isSelected,
  sameValue,
  onPress,
}: {
  cell: Cell;
  row: number;
  col: number;
  isSelected: boolean;
  sameValue: boolean;
  onPress: () => void;
}) {
  const theme = useThemeStore((s) => s.theme);
  const colors = themes[theme];
  const scale = useSharedValue(1);

  const isBoxBorderRight = col === 2 || col === 5;
  const isBoxBorderBottom = row === 2 || row === 5;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.9, { duration: 50 }),
      withSpring(1, { damping: 15 })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const bgColor = isSelected
    ? colors.cellSelectedBg
    : cell.isHighlighted
    ? colors.cellHighlightBg
    : sameValue && cell.value !== 0
    ? colors.cellSelectedBg
    : 'transparent';

  const textColor = cell.isError
    ? colors.cellErrorText
    : cell.isGiven
    ? colors.cellGivenText
    : colors.cellInputText;

  return (
    <AnimatedPressable
      style={[
        animatedStyle,
        {
          width: CELL_SIZE,
          height: CELL_SIZE,
          backgroundColor: bgColor,
          borderRightWidth: isBoxBorderRight ? 2 : 0.5,
          borderBottomWidth: isBoxBorderBottom ? 2 : 0.5,
          borderColor: isBoxBorderRight || isBoxBorderBottom
            ? colors.textDim
            : theme === 'dark' ? '#1F2937' : '#E5E7EB',
          alignItems: 'center',
          justifyContent: 'center',
        },
      ]}
      onPress={handlePress}
    >
      {cell.value !== 0 ? (
        <Text
          style={{
            fontFamily: cell.isGiven ? 'Rajdhani_700Bold' : 'Rajdhani_600SemiBold',
            fontSize: 24,
            color: textColor,
          }}
        >
          {cell.value}
        </Text>
      ) : cell.notes.length > 0 ? (
        <View className="flex-row flex-wrap w-full h-full p-0.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <View
              key={n}
              style={{
                width: CELL_SIZE / 3 - 1,
                height: CELL_SIZE / 3 - 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {cell.notes.includes(n) && (
                <Text
                  style={{
                    fontFamily: 'Rajdhani_500Medium',
                    fontSize: 10,
                    color: colors.textMuted,
                  }}
                >
                  {n}
                </Text>
              )}
            </View>
          ))}
        </View>
      ) : null}
    </AnimatedPressable>
  );
}

function SudokuBoard() {
  const board = useSudokuStore((s) => s.board);
  const selectedCell = useSudokuStore((s) => s.selectedCell);
  const selectCell = useSudokuStore((s) => s.selectCell);
  const theme = useThemeStore((s) => s.theme);
  const colors = themes[theme];

  const selectedValue = selectedCell
    ? board[selectedCell.row][selectedCell.col].value
    : 0;

  return (
    <Animated.View
      entering={FadeInDown.delay(100).springify()}
      style={{
        width: BOARD_SIZE,
        height: BOARD_SIZE,
        backgroundColor: theme === 'dark' ? '#111318' : '#FFFFFF',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.textDim,
        overflow: 'hidden',
      }}
    >
      {board.map((row, rowIndex) => (
        <View key={rowIndex} className="flex-row">
          {row.map((cell, colIndex) => (
            <SudokuCell
              key={`${rowIndex}-${colIndex}`}
              cell={cell}
              row={rowIndex}
              col={colIndex}
              isSelected={
                selectedCell?.row === rowIndex && selectedCell?.col === colIndex
              }
              sameValue={selectedValue !== 0 && cell.value === selectedValue}
              onPress={() => selectCell(rowIndex, colIndex)}
            />
          ))}
        </View>
      ))}
    </Animated.View>
  );
}

function NumberButton({
  num,
  onPress,
  count,
}: {
  num: number;
  onPress: () => void;
  count: number;
}) {
  const theme = useThemeStore((s) => s.theme);
  const colors = themes[theme];
  const scale = useSharedValue(1);
  const isDisabled = count >= 9;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (isDisabled) return;
    scale.value = withSequence(
      withTiming(0.85, { duration: 50 }),
      withSpring(1, { damping: 12 })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <AnimatedPressable style={animatedStyle} onPress={handlePress}>
      <View
        className="items-center justify-center mx-1"
        style={{
          width: (width - 64) / 9 - 2,
          height: 56,
          backgroundColor: isDisabled
            ? colors.backgroundSecondary
            : colors.accentBg,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: isDisabled
            ? colors.borderLight
            : colors.accentBorder,
          opacity: isDisabled ? 0.3 : 1,
        }}
      >
        <Text
          style={{
            fontFamily: 'Rajdhani_700Bold',
            fontSize: 26,
            color: isDisabled ? colors.textDimmer : colors.accentLight,
          }}
        >
          {num}
        </Text>
      </View>
    </AnimatedPressable>
  );
}

function NumberPad() {
  const enterNumber = useSudokuStore((s) => s.enterNumber);
  const board = useSudokuStore((s) => s.board);

  // Count how many of each number are placed
  const counts = useMemo(() => {
    const c: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
    board.forEach((row) =>
      row.forEach((cell) => {
        if (cell.value !== 0) c[cell.value]++;
      })
    );
    return c;
  }, [board]);

  return (
    <Animated.View
      entering={FadeInUp.delay(200).springify()}
      className="flex-row justify-center mt-4"
    >
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
        <NumberButton
          key={num}
          num={num}
          onPress={() => enterNumber(num)}
          count={counts[num]}
        />
      ))}
    </Animated.View>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
  isActive,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  isActive?: boolean;
  badge?: number;
}) {
  const theme = useThemeStore((s) => s.theme);
  const colors = themes[theme];
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.9, { duration: 50 }),
      withSpring(1, { damping: 15 })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <AnimatedPressable style={animatedStyle} onPress={handlePress} className="items-center mx-3">
      <View
        className="w-14 h-14 rounded-2xl items-center justify-center relative"
        style={{
          backgroundColor: isActive
            ? colors.accentBg
            : colors.backgroundSecondary,
          borderWidth: 1,
          borderColor: isActive
            ? colors.accentBorder
            : colors.border,
        }}
      >
        {icon}
        {badge !== undefined && badge > 0 && (
          <View
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.accent }}
          >
            <Text
              style={{
                fontFamily: 'Rajdhani_600SemiBold',
                fontSize: 11,
                color: '#FFFFFF',
              }}
            >
              {badge}
            </Text>
          </View>
        )}
      </View>
      <Text
        style={{
          fontFamily: 'Rajdhani_500Medium',
          fontSize: 11,
          color: isActive ? colors.accentLight : colors.textMuted,
          marginTop: 6,
        }}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}

function ActionBar() {
  const noteMode = useSudokuStore((s) => s.noteMode);
  const toggleNoteMode = useSudokuStore((s) => s.toggleNoteMode);
  const clearCell = useSudokuStore((s) => s.clearCell);
  const useHint = useSudokuStore((s) => s.useHint);
  const hintsRemaining = useSudokuStore((s) => s.hintsRemaining);
  const theme = useThemeStore((s) => s.theme);
  const colors = themes[theme];

  return (
    <Animated.View
      entering={FadeInUp.delay(300).springify()}
      className="flex-row justify-center mt-6"
    >
      <ActionButton
        icon={<Pencil size={22} color={noteMode ? colors.accentLight : colors.textMuted} />}
        label="Notes"
        onPress={toggleNoteMode}
        isActive={noteMode}
      />
      <ActionButton
        icon={<Eraser size={22} color={colors.textMuted} />}
        label="Erase"
        onPress={clearCell}
      />
      <ActionButton
        icon={<Lightbulb size={22} color="#F59E0B" />}
        label="Hint"
        onPress={useHint}
        badge={hintsRemaining}
      />
    </Animated.View>
  );
}

function Header() {
  const router = useRouter();
  const difficulty = useSudokuStore((s) => s.difficulty);
  const mistakes = useSudokuStore((s) => s.mistakes);
  const maxMistakes = useSudokuStore((s) => s.maxMistakes);
  const elapsedTime = useSudokuStore((s) => s.elapsedTime);
  const isPaused = useSudokuStore((s) => s.isPaused);
  const pauseGame = useSudokuStore((s) => s.pauseGame);
  const resumeGame = useSudokuStore((s) => s.resumeGame);
  const insets = useSafeAreaInsets();
  const theme = useThemeStore((s) => s.theme);
  const colors = themes[theme];

  const config = DIFFICULTY_CONFIG[difficulty];

  return (
    <View style={{ paddingTop: insets.top + 8 }} className="px-4 pb-4">
      <View className="flex-row items-center justify-between">
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: colors.backgroundSecondary }}
        >
          <Home size={20} color={colors.textMuted} />
        </Pressable>

        <View className="flex-row items-center">
          <View
            className="px-3 py-1.5 rounded-full mr-3"
            style={{ backgroundColor: `${config.color}20` }}
          >
            <Text
              style={{
                fontFamily: 'Rajdhani_600SemiBold',
                fontSize: 12,
                color: config.color,
                letterSpacing: 1,
              }}
            >
              {config.label.toUpperCase()}
            </Text>
          </View>

          <Text
            style={{
              fontFamily: 'Rajdhani_600SemiBold',
              fontSize: 18,
              color: colors.text,
              letterSpacing: 1,
            }}
          >
            {formatTime(elapsedTime)}
          </Text>
        </View>

        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            isPaused ? resumeGame() : pauseGame();
          }}
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: colors.backgroundSecondary }}
        >
          <Pause size={20} color={colors.textMuted} />
        </Pressable>
      </View>

      {/* Mistakes indicator */}
      <View className="flex-row justify-center mt-3">
        {Array(maxMistakes)
          .fill(0)
          .map((_, i) => (
            <View
              key={i}
              className="w-2 h-2 rounded-full mx-1"
              style={{
                backgroundColor: i < mistakes ? '#EF4444' : colors.border,
              }}
            />
          ))}
      </View>
    </View>
  );
}

function PauseOverlay() {
  const isPaused = useSudokuStore((s) => s.isPaused);
  const resumeGame = useSudokuStore((s) => s.resumeGame);
  const theme = useThemeStore((s) => s.theme);
  const colors = themes[theme];

  if (!isPaused) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      className="absolute inset-0 items-center justify-center"
      style={{ backgroundColor: theme === 'dark' ? 'rgba(10, 10, 15, 0.95)' : 'rgba(248, 250, 252, 0.95)' }}
    >
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          resumeGame();
        }}
        className="items-center"
      >
        <View
          className="w-24 h-24 rounded-full items-center justify-center mb-6"
          style={{
            backgroundColor: colors.accentBg,
            borderWidth: 2,
            borderColor: colors.accentBorder,
          }}
        >
          <Pause size={40} color={colors.accentLight} />
        </View>
        <Text
          style={{
            fontFamily: 'Rajdhani_700Bold',
            fontSize: 28,
            color: colors.text,
            letterSpacing: 2,
          }}
        >
          PAUSED
        </Text>
        <Text
          style={{
            fontFamily: 'Rajdhani_400Regular',
            fontSize: 14,
            color: colors.textMuted,
            marginTop: 8,
          }}
        >
          Tap to resume
        </Text>
      </Pressable>
    </Animated.View>
  );
}

function VictoryModal() {
  const router = useRouter();
  const isComplete = useSudokuStore((s) => s.isComplete);
  const mistakes = useSudokuStore((s) => s.mistakes);
  const maxMistakes = useSudokuStore((s) => s.maxMistakes);
  const elapsedTime = useSudokuStore((s) => s.elapsedTime);
  const difficulty = useSudokuStore((s) => s.difficulty);
  const startNewGame = useSudokuStore((s) => s.startNewGame);
  const theme = useThemeStore((s) => s.theme);
  const colors = themes[theme];

  const isGameOver = mistakes >= maxMistakes;

  if (!isComplete) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      className="absolute inset-0 items-center justify-center px-8"
      style={{ backgroundColor: theme === 'dark' ? 'rgba(10, 10, 15, 0.97)' : 'rgba(248, 250, 252, 0.97)' }}
    >
      <Animated.View entering={FadeInDown.delay(100).springify()} className="items-center">
        <Text
          style={{
            fontFamily: 'Rajdhani_700Bold',
            fontSize: 36,
            color: isGameOver ? '#EF4444' : '#4ADE80',
            letterSpacing: 4,
            marginBottom: 8,
          }}
        >
          {isGameOver ? 'GAME OVER' : 'COMPLETE!'}
        </Text>

        {!isGameOver && (
          <>
            <Text
              style={{
                fontFamily: 'Rajdhani_500Medium',
                fontSize: 16,
                color: colors.textMuted,
                marginBottom: 24,
              }}
            >
              You solved it in {formatTime(elapsedTime)}
            </Text>

            <View className="flex-row mb-8">
              <View className="items-center mx-4">
                <Text
                  style={{
                    fontFamily: 'Rajdhani_700Bold',
                    fontSize: 32,
                    color: colors.text,
                  }}
                >
                  {formatTime(elapsedTime)}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Rajdhani_400Regular',
                    fontSize: 12,
                    color: colors.textMuted,
                  }}
                >
                  TIME
                </Text>
              </View>
              <View className="items-center mx-4">
                <Text
                  style={{
                    fontFamily: 'Rajdhani_700Bold',
                    fontSize: 32,
                    color: colors.text,
                  }}
                >
                  {mistakes}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Rajdhani_400Regular',
                    fontSize: 12,
                    color: colors.textMuted,
                  }}
                >
                  MISTAKES
                </Text>
              </View>
            </View>
          </>
        )}

        <View className="flex-row">
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.back();
            }}
            className="px-8 py-4 rounded-xl mr-3"
            style={{
              backgroundColor: colors.backgroundSecondary,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text
              style={{
                fontFamily: 'Rajdhani_600SemiBold',
                fontSize: 16,
                color: colors.textSecondary,
              }}
            >
              HOME
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              startNewGame(difficulty);
            }}
            className="px-8 py-4 rounded-xl"
            style={{
              backgroundColor: colors.accent,
            }}
          >
            <Text
              style={{
                fontFamily: 'Rajdhani_600SemiBold',
                fontSize: 16,
                color: '#FFFFFF',
              }}
            >
              NEW GAME
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

export default function GameScreen() {
  const isPlaying = useSudokuStore((s) => s.isPlaying);
  const isPaused = useSudokuStore((s) => s.isPaused);
  const updateTime = useSudokuStore((s) => s.updateTime);
  const theme = useThemeStore((s) => s.theme);
  const colors = themes[theme];
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying && !isPaused) {
      timerRef.current = setInterval(() => {
        updateTime();
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, isPaused]);

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <Header />

      <View className="flex-1 items-center justify-center">
        <SudokuBoard />
        <NumberPad />
        <ActionBar />
      </View>

      <PauseOverlay />
      <VictoryModal />
    </View>
  );
}
