# ETERNAL ALPHA

[![CI](https://github.com/igor74r/ETERNAL-ALPHA/actions/workflows/ci.yml/badge.svg)](https://github.com/igor74r/ETERNAL-ALPHA/actions/workflows/ci.yml)

<a href="https://github.com/codespaces/new?repo=igor74r/ETERNAL-ALPHA" target="_blank" rel="noopener"><img alt="ИГРАТЬ В БРАУЗЕРЕ" src="https://img.shields.io/badge/ETERNAL_ALPHA-ИГРАТЬ_В_БРАУЗЕРЕ-7c3aed?style=for-the-badge"></a>

Нажми **ИГРАТЬ В БРАУЗЕРЕ** — откроется браузерная среда проекта, которая установит зависимости и запустит игру из исходных файлов репозитория. В открывшемся окне предпросмотра появится стартовое меню игры.

A browser-based 15-minute survivor arena built with **Phaser 3** and **Vite**. Survive escalating voidborn waves, evolve a six-weapon arsenal, defeat milestone threats, and invest earned gold in permanent upgrades.

## Запуск локально
```bash
npm install
npm run dev
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
CI запускает тесты и проверяет production-сборку. Он не публикует игру и не выполняет её в CI.

## Tech
- Phaser 3 Arcade Physics
- Vite
- Vitest
- JavaScript ES modules
