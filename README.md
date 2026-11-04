# ETERNAL ALPHA

A browser-based 15-minute survivor arena built with **Phaser 3** and **Vite**. Survive escalating voidborn waves, evolve a six-weapon arsenal, defeat milestone threats, and invest earned gold in permanent upgrades.

## Play / develop
```bash
npm install
npm run dev
```
Vite prints a local URL. Production output:
```bash
npm run test
npm run build
npm run preview
```

## Controls
| Action | Input |
| --- | --- |
| Move | WASD / Arrow keys |
| Aim | Mouse (recent aim prioritizes target near cursor) |
| Pause / resume | Escape or P |
| Touch | On-screen virtual joystick + pause |
| Gamepad | Left analog stick |

Weapons fire automatically. Focus on movement, positioning, collecting XP, and choosing upgrades.

## Run loop
- **15 minutes:** survive until protocol completion.
- **5:00:** elite encounter.
- **10:00:** boss encounter with a telegraphed dash.
- **Level up:** choose one of three options: a stat upgrade or weapon unlock/enhancement.
- **Gold:** earned during runs; persists between sessions in browser local storage.
- **Armory:** spend gold on permanent weapon power, vitality, and XP magnet ranks.

## Arsenal
1. **Aether Bolt** — homing/targeted projectile; can gain multishot.
2. **Orbit Blades** — rotating close-range damage.
3. **Nova Pulse** — area burst around the player.
4. **Storm Lance** — high-speed piercing shot.
5. **Wisp Drone** — orbiting support that fires at targets.
6. **Singularity** — large area implosion around a nearby threat.

## CI
GitHub Actions runs tests and a Vite production build on pushes and pull requests targeting `main`.

## Tech
- Phaser 3 Arcade Physics
- Vite
- Vitest
- JavaScript ES modules
