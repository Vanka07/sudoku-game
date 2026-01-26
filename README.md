# Reflex Rush

A minimalist reflex arcade game. Tap glowing targets before they disappear. Build combos, avoid danger targets, and chase high scores.

## Gameplay

- **Tap Targets**: Colored orbs appear randomly - tap them before they fade
- **Score Points**: Smaller targets = more points. Bonus (yellow lightning) targets = 50 points
- **Avoid Danger**: Red X targets cost you a life if tapped
- **Build Combos**: Hit consecutive targets to build multipliers (5+ = 1.5x, 10+ = 2x, etc.)
- **Level Up**: Every 200 points increases difficulty - faster spawns, shorter lifetimes
- **3 Lives**: Miss a target or tap a danger target and you lose a life

## Features

- Neon cyberpunk aesthetic with glowing targets
- Satisfying haptic feedback on every tap
- Persistent high score tracking
- Combo system with visual feedback
- 10 difficulty levels
- Animated score counter on game over

## App Structure

```
src/
  app/
    _layout.tsx    # Root layout with fonts
    index.tsx      # Main menu screen
    game.tsx       # Core gameplay
    gameover.tsx   # Results screen
  lib/
    gameStore.ts   # Zustand store for game state
```

## Tech Stack

- Expo SDK 53 with React Native
- Expo Router for navigation
- Zustand for state management
- React Native Reanimated for 60fps animations
- Expo Haptics for tactile feedback
- Orbitron + Rajdhani fonts for arcade aesthetic

## Color Palette

- Cyan: `#00F5FF` (primary, score)
- Hot Pink: `#FF006E` (danger, lives)
- Yellow: `#FFBE0B` (bonus, combo)
- Purple: `#8338EC` (accent)
- Background: `#050508`
