import Phaser from 'phaser';
import { GAME, ENEMIES, WEAPONS, pickUpgrade, formatTime } from './systems/config.js';
import { MetaProgress } from './systems/meta.js';
import { ArenaScene } from './scenes/ArenaScene.js';
import './style.css';

const meta = new MetaProgress();
const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#090d18',
  width: GAME.width,
  height: GAME.height,
  scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
  physics: { default: 'arcade', arcade: { debug: false } },
  scene: [ArenaScene],\n  input: { gamepad: true },
  render: { antialias: true, pixelArt: false, roundPixels: false },
});
window.__ETERNAL_ALPHA__ = { game, meta, config: { GAME, ENEMIES, WEAPONS, pickUpgrade, formatTime } };