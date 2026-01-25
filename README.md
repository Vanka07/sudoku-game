# SkillStake

A peer-to-peer accountability platform where you stake money on your goals and compete against others. Put your money where your mouth is.

## Features

- **Home Dashboard**: View your balance, active stakes, win streak, and stats at a glance
- **Explore Challenges**: Browse 10+ challenge categories including fitness, learning, health, productivity, and creative
- **Stake Creation**: Choose your stake amount, get matched with an opponent, and lock in your commitment
- **Proof Submission**: Submit photo evidence with AI verification for challenge completion
- **Leaderboard**: See top performers and trending challenges
- **Profile**: Track your stats, achievements, and manage settings

## How It Works

1. **Browse Challenges** - Find a goal you want to achieve (running streak, learn Spanish, no social media, etc.)
2. **Stake Your Money** - Put $10-$500 on the line as motivation
3. **Get Matched** - You're paired with someone betting against you
4. **Complete the Challenge** - Follow the rules for the duration
5. **Submit Proof** - Provide evidence of completion
6. **Win or Lose** - Winner takes 80% of the total pot (10% platform fee)

## App Structure

```
src/
  app/
    (tabs)/
      _layout.tsx      # Tab navigation
      index.tsx        # Home screen
      challenges.tsx   # Explore challenges
      leaderboard.tsx  # Rankings & trending
      profile.tsx      # User profile & settings
    challenge-detail.tsx  # Challenge info & stake selection
    create-stake.tsx      # Opponent matching flow
    submit-proof.tsx      # Proof upload & verification
    _layout.tsx           # Root layout with fonts
  lib/
    store.ts          # Zustand store for app state
    cn.ts             # Tailwind class merge utility
```

## Tech Stack

- Expo SDK 53 with React Native
- Expo Router for file-based navigation
- Zustand for state management
- NativeWind (Tailwind) for styling
- React Native Reanimated for animations
- Expo Haptics for feedback
- Outfit + Sora fonts for typography

## Color Palette

- Primary Green: `#00FF94`
- Accent Cyan: `#00D9FF`
- Warning Yellow: `#FFB800`
- Danger Red: `#FF4757`
- Background: `#0A0A0F`
- Card: `#12121A`
