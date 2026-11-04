import { describe,it,expect } from 'vitest';
import { pickUpgrade, formatTime, UPGRADES, WEAPONS, ENEMIES, GAME } from './config.js';
describe('game config helpers',()=>{
 it('formats the 15 minute run clock',()=>{expect(formatTime(0)).toBe('00:00');expect(formatTime(65.9)).toBe('01:05');expect(formatTime(900)).toBe('15:00');});
 it('returns unique upgrade choices and respects count',()=>{const picks=pickUpgrade(UPGRADES,3,()=>0);expect(picks).toHaveLength(3);expect(new Set(picks.map(x=>x.id)).size).toBe(3);});
 it('handles fewer available upgrades',()=>expect(pickUpgrade(UPGRADES.slice(0,2),3)).toHaveLength(2));
 it('defines six distinct weapon slots',()=>{expect(WEAPONS).toHaveLength(6);expect(new Set(WEAPONS.map(w=>w.id)).size).toBe(6);});
 it('defines two boss milestones inside the run',()=>{expect(GAME.bossTimes).toEqual([300,600]);expect(ENEMIES.boss.hp).toBeGreaterThan(ENEMIES.elite.hp);});
});
