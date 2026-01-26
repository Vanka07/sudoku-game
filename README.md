# Sudoku Minimalist

A clean, elegant Sudoku puzzle game with dark/light themes and smooth animations.

## Features

### Daily Challenge
- **Same puzzle for everyone** each day
- **Daily streak tracking** - maintain your streak by playing every day
- **Completion status** - see when you've already finished today's puzzle
- Medium difficulty for consistent challenge

### Game Modes
- **Easy**: 35 cells removed - great for beginners
- **Medium**: 45 cells removed - balanced challenge
- **Hard**: 52 cells removed - for experienced players
- **Expert**: 58 cells removed - ultimate difficulty

### Gameplay
- **Tap to Select**: Tap any cell to select it
- **Number Pad**: Enter numbers 1-9 to fill cells
- **Notes Mode**: Toggle pencil marks for possible candidates
- **Hints**: 3 hints per game to reveal correct numbers
- **Erase**: Clear a cell's value or notes
- **Undo**: Revert your last move (up to 20 moves)
- **Auto-Highlight**: Related cells highlight when you select

### Smart Features
- **Error Detection**: Wrong numbers show in red
- **3 Mistakes Limit**: Game ends after 3 errors
- **Number Tracking**: Numbers fade when all 9 are placed
- **Auto-Note Removal**: Notes clear when number is placed
- **Timer**: Track your solve time
- **Pause**: Hide the board and pause the timer

### Visual Polish
- **Victory Confetti**: Celebration animation on puzzle completion
- **Trophy Animation**: Bouncing trophy icon on win
- **Shake Effect**: Screen shake on game over
- **Animated Pause**: Pulsing play button to resume
- **Dark/Light Themes**: Toggle between themes

### Statistics
- Games won
- Best time per difficulty
- Current win streak
- Daily challenge streak

## App Structure

```
src/
  app/
    _layout.tsx    # Root layout with fonts
    index.tsx      # Home screen with daily challenge & difficulty selection
    game.tsx       # Sudoku game board and controls
  lib/
    sudokuStore.ts # Zustand store with puzzle generation & daily challenge
    themeStore.ts  # Theme state management
```

## Tech Stack

- Expo SDK 53 with React Native
- Expo Router for navigation
- Zustand for state management
- React Native Reanimated for animations
- Expo Haptics for tactile feedback
- Rajdhani font for clean typography

## Color Palette

- Indigo: `#6366F1` (primary, selection)
- Light Indigo: `#818CF8` (user input)
- Green: `#4ADE80` (success/easy)
- Blue: `#60A5FA` (medium)
- Amber: `#F59E0B` (hard/hints)
- Red: `#EF4444` (errors/expert)
- Background Dark: `#0A0A0F`
- Background Light: `#F8FAFC`
