# ETERNAL ALPHA

A browser-based 15-minute survivor arena built with Phaser 3 + Vite.

## Run locally
```bash
npm install
npm run dev
```

## Quality checks
```bash
npm run build
npm run test
```

## Controls
- Move: WASD / Arrow keys
- Aim: mouse (auto-fire at nearest enemy when no aim input)
- Pause: Escape / P
- Touch: virtual joystick on mobile
- Gamepad: left stick

## Current vertical slice
- Arena movement, enemy waves, auto-targeting weapons, XP gems, level-up choices
- 15-minute run clock, elite/boss milestones at 5 and 10 minutes
- Gold, persistent meta upgrades, pause/game-over/restart states
- Responsive HUD and pooled projectile/XP objects
