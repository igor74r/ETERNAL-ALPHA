export const GAME = {
  width: 1280, height: 720, duration: 900, spawnEvery: 1.12,
  playerSpeed: 230, playerRadius: 15, startingHp: 100,
  invuln: 0.85, xpPerGem: 1, magnetRadius: 125, pickupRadius: 24,
  bossTimes: [300, 600], maxEnemies: 190
};
export const WEAPONS = [
  { id:'aether', name:'Aether Bolt', description:'A seeking shard of condensed light.', damage:18, cooldown:0.48, speed:470, count:1, pierce:0, color:0x6ee7ff, unlock:0 },
  { id:'orbit', name:'Orbit Blades', description:'Two blades circle close and cut through.', damage:13, cooldown:0.7, speed:0, count:2, pierce:1, color:0xa78bfa, unlock:1 },
  { id:'nova', name:'Nova Pulse', description:'A pulse blooms around you.', damage:28, cooldown:2.8, speed:0, count:1, pierce:2, color:0xf9a8d4, unlock:2 },
  { id:'storm', name:'Storm Lance', description:'A piercing lance with devastating reach.', damage:36, cooldown:1.4, speed:620, count:1, pierce:5, color:0xfbbf24, unlock:3 },
  { id:'drone', name:'Wisp Drone', description:'A loyal wisp fires on your behalf.', damage:9, cooldown:0.8, speed:390, count:1, pierce:0, color:0x86efac, unlock:4 },
  { id:'singularity', name:'Singularity', description:'Pulls the void inward, then detonates.', damage:65, cooldown:4.2, speed:0, count:1, pierce:99, color:0xfb7185, unlock:5 }
];
export const ENEMIES = {
  crawler:{ hp:28, speed:58, damage:8, xp:1, radius:12, color:0x8d9bb7 },
  runner:{ hp:18, speed:100, damage:7, xp:1, radius:9, color:0xe879a9 },
  brute:{ hp:115, speed:34, damage:16, xp:4, radius:20, color:0xb98a69 },
  elite:{ hp:600, speed:48, damage:22, xp:18, radius:28, color:0xffbd5b },
  boss:{ hp:2400, speed:32, damage:30, xp:50, radius:42, color:0xf15b78 }
};
export const UPGRADES = [
  { id:'damage', title:'Overcharge', detail:'+18% weapon damage', apply:p=>p.damage*=1.18 },
  { id:'haste', title:'Quickened Core', detail:'+14% fire rate', apply:p=>p.cooldown*=0.86 },
  { id:'vitality', title:'Vitality', detail:'+25 max HP and heal 25', apply:p=>{p.maxHp+=25;p.hp=Math.min(p.maxHp,p.hp+25)} },
  { id:'speed', title:'Phase Stride', detail:'+12% movement speed', apply:p=>p.speed*=1.12 },
  { id:'magnet', title:'Gravity Well', detail:'+35% pickup radius', apply:p=>p.magnet*=1.35 },
  { id:'pierce', title:'Prismatic Edge', detail:'+1 projectile pierce', apply:p=>p.pierce+=1 },
  { id:'multishot', title:'Split Conduit', detail:'+1 bolt (−12% damage)', apply:p=>{p.count+=1;p.damage*=0.88} },
  { id:'regen', title:'Reconstitution', detail:'Restore 30% max HP', apply:p=>p.hp=Math.min(p.maxHp,p.hp+p.maxHp*.3) }
];
export function pickUpgrade(available=UPGRADES, count=3, random=Math.random) {
  const pool=[...available];
  const picks=[];
  while(pool.length && picks.length<count) {
    const i=Math.floor(random()*pool.length);
    picks.push(pool.splice(i,1)[0]);
  }
  return picks;
}
export function formatTime(seconds) {
  const s=Math.max(0,Math.floor(seconds));
  return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
}