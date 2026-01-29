import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, Pressable, Share, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Pause,
  Play,
  Lightbulb,
  Pencil,
  Eraser,
  Home,
  Undo2,
  Trophy,
  RotateCcw,
  Share2,
  Check,
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
  withRepeat,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSudokuStore, DIFFICULTY_CONFIG, Cell } from '@/lib/sudokuStore';
import { useThemeStore, themes } from '@/lib/themeStore';
import * as StoreReview from 'expo-store-review';

const BOARD_PADDING = 16;

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
  matchPulse,
  onPress,
  cellSize,
}: {
  cell: Cell;
  row: number;
  col: number;
  isSelected: boolean;
  sameValue: boolean;
  matchPulse: number; // increments when this cell should pulse (matching correct number)
  onPress: () => void;
  cellSize: number;
}) {
  const theme = useThemeStore((s) => s.theme);
  const colors = themes[theme];
  const scale = useSharedValue(1);
  const correctPulse = useSharedValue(1);
  const correctGlow = useSharedValue(0);
  const matchGlow = useSharedValue(0);

  const isBoxBorderRight = col === 2 || col === 5;
  const isBoxBorderBottom = row === 2 || row === 5;

  // Trigger pulse animation when cell becomes correct
  useEffect(() => {
    if (cell.isCorrect && !cell.isGiven) {
      // Pulse animation for correct answer
      correctPulse.value = withSequence(
        withTiming(1.15, { duration: 150, easing: Easing.out(Easing.ease) }),
        withSpring(1, { damping: 12, stiffness: 200 })
      );
      // Glow effect
      correctGlow.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 400 })
      );
    }
  }, [cell.isCorrect]);

  // Pulse matching cells when a correct number is placed
  useEffect(() => {
    if (matchPulse > 0) {
      matchGlow.value = withSequence(
        withTiming(1, { duration: 150 }),
        withTiming(0, { duration: 500 })
      );
    }
  }, [matchPulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * correctPulse.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: correctGlow.value * 0.3,
  }));

  const matchGlowStyle = useAnimatedStyle(() => ({
    opacity: matchGlow.value * 0.4,
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.9, { duration: 50 }),
      withSpring(1, { damping: 15 })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  // Same-value now takes priority over row/col/box highlight
  const bgColor = isSelected
    ? colors.cellSelectedBg
    : sameValue && cell.value !== 0
    ? colors.cellSameValueBg
    : cell.isHighlighted
    ? colors.cellHighlightBg
    : 'transparent';

  const textColor = cell.isError
    ? colors.cellErrorText
    : cell.isCorrect && !cell.isGiven
    ? colors.cellCorrectText
    : cell.isGiven
    ? colors.cellGivenText
    : colors.cellInputText;

  const cellLabel = cell.value !== 0
    ? `Row ${row + 1}, Column ${col + 1}, value ${cell.value}`
    : cell.notes.length > 0
    ? `Row ${row + 1}, Column ${col + 1}, notes ${cell.notes.join(', ')}`
    : `Row ${row + 1}, Column ${col + 1}, empty`;

  return (
    <AnimatedPressable
      style={[
        animatedStyle,
        {
          width: cellSize,
          height: cellSize,
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
      accessibilityLabel={cellLabel}
      accessibilityRole="button"
    >
      {/* Glow effect for correct answers */}
      {cell.isCorrect && !cell.isGiven && (
        <Animated.View
          style={[
            glowStyle,
            {
              position: 'absolute',
              width: cellSize - 4,
              height: cellSize - 4,
              borderRadius: 8,
              backgroundColor: colors.cellCorrectText,
            },
          ]}
        />
      )}
      {/* Pulse glow for matching numbers when correct number placed */}
      {sameValue && cell.value !== 0 && (
        <Animated.View
          style={[
            matchGlowStyle,
            {
              position: 'absolute',
              width: cellSize - 2,
              height: cellSize - 2,
              borderRadius: 6,
              backgroundColor: colors.accentLight,
            },
          ]}
        />
      )}
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
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: '100%', height: '100%', padding: 2 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <View
              key={n}
              style={{
                width: cellSize / 3 - 1,
                height: cellSize / 3 - 1,
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
  const lastCorrectValue = useSudokuStore((s) => s.lastCorrectValue);
  const theme = useThemeStore((s) => s.theme);
  const colors = themes[theme];
  const { width } = useWindowDimensions();
  const boardSize = Math.min(width - BOARD_PADDING * 2, 500);
  const cellSize = boardSize / 9;

  // Track pulse counter — increments each time a correct number is placed
  const pulseCounter = useRef(0);
  const prevCorrectValue = useRef(0);
  if (lastCorrectValue !== 0 && lastCorrectValue !== prevCorrectValue.current) {
    pulseCounter.current++;
    prevCorrectValue.current = lastCorrectValue;
  }

  const selectedValue = selectedCell
    ? board[selectedCell.row][selectedCell.col].value
    : 0;

  return (
    <Animated.View
      entering={FadeInDown.delay(100).springify()}
      style={{
        width: boardSize,
        height: boardSize,
        backgroundColor: theme === 'dark' ? '#111318' : '#FFFFFF',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.textDim,
        overflow: 'hidden',
      }}
      accessibilityLabel="Sudoku game board"
    >
      {board.map((row, rowIndex) => (
        <View key={rowIndex} style={{ flexDirection: 'row' }}>
          {row.map((cell, colIndex) => {
            // Pulse matching cells when correct number was just placed
            const shouldPulse =
              lastCorrectValue !== 0 &&
              cell.value === lastCorrectValue &&
              !(selectedCell?.row === rowIndex && selectedCell?.col === colIndex);
            return (
              <SudokuCell
                key={`${rowIndex}-${colIndex}`}
                cell={cell}
                row={rowIndex}
                col={colIndex}
                isSelected={
                  selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                }
                sameValue={selectedValue !== 0 && cell.value === selectedValue}
                matchPulse={shouldPulse ? pulseCounter.current : 0}
                onPress={() => selectCell(rowIndex, colIndex)}
                cellSize={cellSize}
              />
            );
          })}
        </View>
      ))}
    </Animated.View>
  );
}

function NumberButton({
  num,
  onPress,
  count,
  screenWidth,
}: {
  num: number;
  onPress: () => void;
  count: number;
  screenWidth: number;
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
    <AnimatedPressable
      style={animatedStyle}
      onPress={handlePress}
      accessibilityLabel={`Enter number ${num}${isDisabled ? ', all placed' : ''}`}
      accessibilityRole="button"
    >
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          marginHorizontal: 4,
          width: (Math.min(screenWidth, 532) - 64) / 9 - 2,
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
        {isDisabled ? (
          <Check size={20} color={colors.textDimmer} strokeWidth={3} />
        ) : (
          <Text
            style={{
              fontFamily: 'Rajdhani_700Bold',
              fontSize: 26,
              color: colors.accentLight,
            }}
          >
            {num}
          </Text>
        )}
      </View>
    </AnimatedPressable>
  );
}

function NumberPad() {
  const enterNumber = useSudokuStore((s) => s.enterNumber);
  const board = useSudokuStore((s) => s.board);
  const { width } = useWindowDimensions();

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
      style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}
      accessibilityLabel="Number pad"
    >
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
        <NumberButton
          key={num}
          num={num}
          onPress={() => enterNumber(num)}
          count={counts[num]}
          screenWidth={width}
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
    <AnimatedPressable
      style={[animatedStyle, { alignItems: 'center', marginHorizontal: 12 }]}
      onPress={handlePress}
      accessibilityLabel={`${label}${badge !== undefined && badge > 0 ? `, ${badge} remaining` : ''}${isActive ? ', active' : ''}`}
      accessibilityRole="button"
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
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
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              width: 20,
              height: 20,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.accent,
            }}
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
  const undo = useSudokuStore((s) => s.undo);
  const hintsRemaining = useSudokuStore((s) => s.hintsRemaining);
  const theme = useThemeStore((s) => s.theme);
  const colors = themes[theme];

  return (
    <Animated.View
      entering={FadeInUp.delay(300).springify()}
      style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}
      accessibilityLabel="Game actions"
    >
      <ActionButton
        icon={<Undo2 size={22} color={colors.textMuted} />}
        label="Undo"
        onPress={undo}
      />
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
    <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.backgroundSecondary }}
          accessibilityLabel="Go home"
          accessibilityRole="button"
        >
          <Home size={20} color={colors.textMuted} />
        </Pressable>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 9999, marginRight: 12, backgroundColor: `${config.color}20` }}
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
            accessibilityLabel={`Time elapsed: ${formatTime(elapsedTime)}`}
          >
            {formatTime(elapsedTime)}
          </Text>
        </View>

        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            isPaused ? resumeGame() : pauseGame();
          }}
          style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.backgroundSecondary }}
          accessibilityLabel={isPaused ? 'Resume game' : 'Pause game'}
          accessibilityRole="button"
        >
          {isPaused ? <Play size={20} color={colors.textMuted} /> : <Pause size={20} color={colors.textMuted} />}
        </Pressable>
      </View>

      {/* Mistakes indicator */}
      <View
        style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 12 }}
        accessibilityLabel={`${mistakes} of ${maxMistakes} mistakes`}
      >
        {Array(maxMistakes)
          .fill(0)
          .map((_, i) => (
            <View
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                marginHorizontal: 4,
                backgroundColor: i < mistakes ? '#EF4444' : colors.border,
              }}
            />
          ))}
      </View>
    </View>
  );
}

function ConfettiPiece({ delay, x }: { delay: number; x: number }) {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  const colors = ['#4ADE80', '#60A5FA', '#F59E0B', '#EF4444', '#A78BFA', '#F472B6'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const size = 8 + Math.random() * 8;

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withTiming(800, { duration: 3000, easing: Easing.out(Easing.quad) })
    );
    translateX.value = withDelay(
      delay,
      withTiming((Math.random() - 0.5) * 200, { duration: 3000 })
    );
    rotate.value = withDelay(
      delay,
      withTiming(360 * (Math.random() > 0.5 ? 1 : -1) * 3, { duration: 3000 })
    );
    opacity.value = withDelay(
      delay + 2000,
      withTiming(0, { duration: 1000 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          position: 'absolute',
          left: x,
          top: 0,
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: Math.random() > 0.5 ? size / 2 : 2,
        },
      ]}
    />
  );
}

function Confetti() {
  const { width } = useWindowDimensions();
  const pieces = useMemo(() => {
    return Array(40)
      .fill(0)
      .map((_, i) => ({
        id: i,
        x: Math.random() * width,
        delay: Math.random() * 500,
      }));
  }, [width]);

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {pieces.map((piece) => (
        <ConfettiPiece key={piece.id} delay={piece.delay} x={piece.x} />
      ))}
    </View>
  );
}

function PauseOverlay() {
  const isPaused = useSudokuStore((s) => s.isPaused);
  const resumeGame = useSudokuStore((s) => s.resumeGame);
  const theme = useThemeStore((s) => s.theme);
  const colors = themes[theme];
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isPaused) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [isPaused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!isPaused) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme === 'dark' ? 'rgba(10, 10, 15, 0.95)' : 'rgba(248, 250, 252, 0.95)',
      }}
    >
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          resumeGame();
        }}
        style={{ alignItems: 'center' }}
        accessibilityLabel="Resume game"
        accessibilityRole="button"
      >
        <Animated.View
          style={[
            animatedStyle,
            {
              width: 96,
              height: 96,
              borderRadius: 48,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
              backgroundColor: colors.accentBg,
              borderWidth: 2,
              borderColor: colors.accentBorder,
            },
          ]}
        >
          <Play size={44} color={colors.accentLight} style={{ marginLeft: 4 }} />
        </Animated.View>
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

  const stats = useSudokuStore((s) => s.stats);
  const isGameOver = mistakes >= maxMistakes;

  const trophyScale = useSharedValue(0);
  const trophyRotate = useSharedValue(-15);
  const shakeX = useSharedValue(0);

  useEffect(() => {
    if (isComplete && !isGameOver) {
      // Prompt for review after 3rd win
      if (stats.gamesWon > 0 && stats.gamesWon % 3 === 0) {
        setTimeout(async () => {
          try {
            if (await StoreReview.hasAction()) {
              await StoreReview.requestReview();
            }
          } catch (_) {}
        }, 2000);
      }
      // Trophy bounce animation
      trophyScale.value = withSequence(
        withTiming(1.2, { duration: 300, easing: Easing.out(Easing.back(2)) }),
        withSpring(1, { damping: 8 })
      );
      trophyRotate.value = withSequence(
        withTiming(15, { duration: 150 }),
        withTiming(-10, { duration: 150 }),
        withTiming(5, { duration: 150 }),
        withSpring(0)
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (isComplete && isGameOver) {
      // Shake animation for game over
      shakeX.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-5, { duration: 50 }),
        withTiming(5, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [isComplete, isGameOver]);

  const trophyStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: trophyScale.value },
      { rotate: `${trophyRotate.value}deg` },
    ],
  }));

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const config = DIFFICULTY_CONFIG[difficulty];
    const timeStr = formatTime(elapsedTime);
    try {
      await Share.share({
        message: `🎯 I solved a ${config.label} Sudoku in ${timeStr}! Can you beat my time? #SudokuMinimalist`,
      });
    } catch (e) {
      // User cancelled or error — do nothing
    }
  };

  if (!isComplete) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        backgroundColor: theme === 'dark' ? 'rgba(10, 10, 15, 0.97)' : 'rgba(248, 250, 252, 0.97)',
      }}
    >
      {!isGameOver && <Confetti />}

      <Animated.View style={shakeStyle}>
        <Animated.View entering={FadeInDown.delay(100).springify()} style={{ alignItems: 'center' }}>
          {/* Trophy or X icon */}
          {!isGameOver ? (
            <Animated.View
              style={[
                trophyStyle,
                {
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: '#FEF3C7',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                  borderWidth: 3,
                  borderColor: '#F59E0B',
                },
              ]}
            >
              <Trophy size={40} color="#F59E0B" fill="#FCD34D" />
            </Animated.View>
          ) : (
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: '#FEE2E2',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
                borderWidth: 3,
                borderColor: '#EF4444',
              }}
            >
              <RotateCcw size={40} color="#EF4444" />
            </View>
          )}

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

              <View style={{ flexDirection: 'row', marginBottom: 32 }}>
                <View style={{ alignItems: 'center', marginHorizontal: 16 }}>
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
              <View style={{ alignItems: 'center', marginHorizontal: 16 }}>
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

        <View style={{ flexDirection: 'row' }}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.back();
            }}
            style={{
              paddingHorizontal: 24,
              paddingVertical: 16,
              borderRadius: 12,
              marginRight: 12,
              backgroundColor: colors.backgroundSecondary,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            accessibilityLabel="Go home"
            accessibilityRole="button"
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

          {!isGameOver && (
            <Pressable
              onPress={handleShare}
              style={{
                paddingHorizontal: 24,
                paddingVertical: 16,
                borderRadius: 12,
                marginRight: 12,
                backgroundColor: colors.backgroundSecondary,
                borderWidth: 1,
                borderColor: colors.border,
              }}
              accessibilityLabel="Share your score"
              accessibilityRole="button"
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Share2 size={16} color={colors.textSecondary} style={{ marginRight: 6 }} />
                <Text
                  style={{
                    fontFamily: 'Rajdhani_600SemiBold',
                    fontSize: 16,
                    color: colors.textSecondary,
                  }}
                >
                  SHARE
                </Text>
              </View>
            </Pressable>
          )}

          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              startNewGame(difficulty);
            }}
            style={{
              paddingHorizontal: 24,
              paddingVertical: 16,
              borderRadius: 12,
              backgroundColor: colors.accent,
            }}
            accessibilityLabel="Start new game"
            accessibilityRole="button"
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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header />

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <SudokuBoard />
        <NumberPad />
        <ActionBar />
      </View>

      <PauseOverlay />
      <VictoryModal />
    </View>
  );
}
