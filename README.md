# Sudoku Minimalist

A clean, elegant Sudoku puzzle game with a dark theme and smooth animations.

## Features

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
- **Auto-Highlight**: Related cells highlight when you select

### Smart Features
- **Error Detection**: Wrong numbers show in red
- **3 Mistakes Limit**: Game ends after 3 errors
- **Number Tracking**: Numbers fade when all 9 are placed
- **Auto-Note Removal**: Notes clear when number is placed
- **Timer**: Track your solve time
- **Pause**: Hide the board and pause the timer

### Statistics
- Games won
- Best time per difficulty
- Current win streak

## App Structure

```
src/
  app/
    _layout.tsx    # Root layout with fonts
    index.tsx      # Home screen with difficulty selection
    game.tsx       # Sudoku game board and controls
  lib/
    sudokuStore.ts # Zustand store with puzzle generation
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
- Background: `#0A0A0F`
