# Reflex Rush

A minimalist reflex arcade game. Tap glowing targets before they disappear. Build combos, avoid danger targets, and chase high scores.

## Gameplay

- **Tap Targets**: Colored orbs appear randomly - tap them before they fade
- **Score Points**: Smaller targets = more points. Bonus (yellow lightning) targets = 50 points
- **Avoid Danger**: Red X targets cost you a life if tapped
- **Build Combos**: Hit consecutive targets to build multipliers (5+ = 1.5x, 10+ = 2x, etc.)
- **Level Up**: Every 200 points increases difficulty - faster spawns, shorter lifetimes
- **3 Lives**: Miss a target or tap a danger target and you lose a life

## Game Feel Features

### Countdown & Start
- Dramatic 3-2-1-GO countdown with scaling animations
- Haptic feedback on each countdown beat
- Full-screen overlay transition into gameplay

### Visual Juice
- **Particle Explosions**: 8 particles burst from hit targets matching target color
- **Screen Shake**: Device-like shake effect on misses and danger hits
- **Red Flash**: Full-screen flash overlay when taking damage
- **Level Up Banner**: Animated banner slides in when reaching new levels

### Combo System
- Tiered combo messages: "COMBO!" → "ON FIRE!" → "UNSTOPPABLE!" → "LEGENDARY!"
- Color progression: cyan → yellow → pink → purple
- Visual badge in HUD showing current streak

### Target Animations
- **Pulsing Bonus**: Yellow bonus targets pulse rhythmically
- **Rotating Danger**: Red X targets slowly rotate for visibility
- **Urgency Scale**: Targets grow slightly when about to expire

### Game Over Polish
- **Confetti**: 30 animated particles fall on new high scores
- **Score Counter**: Satisfying count-up animation with easing
- **Motivational Messages**: Context-aware messages based on performance
- **Share Button**: Native share to challenge friends

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
