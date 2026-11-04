import { describe,it,expect } from 'vitest';
import { pickUpgrade, formatTime, UPGRADES } from './config.js';
describe('game config helpers',()=>{
  it('formats run clock',()=>{expect(formatTime(0)).toBe('00:00');expect(formatTime(65.9)).toBe('01:05');expect(formatTime(900)).toBe('15:00');});
  it('chooses unique upgrades and respects count',()=>{const picks=pickUpgrade(UPGRADES,3,()=>0);expect(picks).toHaveLength(3);expect(new Set(picks.map(x=>x.id)).size).toBe(3);});
  it('handles fewer available upgrades',()=>expect(pickUpgrade(UPGRADES.slice(0,2),3)).toHaveLength(2));
});