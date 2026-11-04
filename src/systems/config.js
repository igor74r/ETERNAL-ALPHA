export const GAME = {
  width: 1280, height: 720, duration: 900, spawnEvery: 1.08,
  playerSpeed: 235, playerRadius: 15, startingHp: 100,
  invuln: 0.9, magnetRadius: 145, pickupRadius: 23,
  bossTimes: [300, 600], maxEnemies: 175
};

export const WEAPONS = [
  { id:'aether', name:'Aether Bolt', description:'Seeking bolts strike the nearest target.', damage:20, cooldown:0.48, speed:510, count:1, pierce:0, color:0x6ee7ff, unlock:0 },
  { id:'orbit', name:'Orbit Blades', description:'Twin blades orbit and cut nearby enemies.', damage:15, cooldown:0.12, speed:0, count:2, pierce:0, color:0xa78bfa, unlock:1 },
  { id:'nova', name:'Nova Pulse', description:'A radial blast damages everything close.', damage:42, cooldown:3.1, speed:0, count:1, pierce:99, color:0xf9a8d4, unlock:2 },
  { id:'storm', name:'Storm Lance', description:'A fast lance pierces a line of enemies.', damage:48, cooldown:1.35, speed:720, count:1, pierce:4, color:0xfbbf24, unlock:3 },
  { id:'drone', name:'Wisp Drone', description:'A hovering wisp fires at nearby threats.', damage:13, cooldown:0.72, speed:430, count:1, pierce:0, color:0x86efac, unlock:4 },
  { id:'singularity', name:'Singularity', description:'A gravity implosion devastates a wide area.', damage:90, cooldown:5.2, speed:0, count:1, pierce:99, color:0xfb7185, unlock:5 }
];

export const ENEMIES = {
  crawler:{ hp:32, speed:60, damage:8, xp:1, radius:12, color:0x8d9bb7 },
  runner:{ hp:22, speed:108, damage:7, xp:1, radius:9, color:0xe879a9 },
  brute:{ hp:145, speed:38, damage:15, xp:4, radius:20, color:0xb98a69 },
  elite:{ hp:820, speed:52, damage:21, xp:22, radius:30, color:0xffbd5b },
  boss:{ hp:3600, speed:36, damage:28, xp:65, radius:44, color:0xf15b78 }
};

export const UPGRADES = [
  { id:'damage', title:'Overcharge', detail:'+18% all weapon damage', apply:p=>p.damage*=1.18 },
  { id:'haste', title:'Quickened Core', detail:'+14% weapon cooldown speed', apply:p=>p.cooldown*=0.86 },
  { id:'vitality', title:'Vitality', detail:'+25 max HP and restore 25', apply:p=>{p.maxHp+=25;p.hp=Math.min(p.maxHp,p.hp+25)} },
  { id:'speed', title:'Phase Stride', detail:'+12% movement speed', apply:p=>p.speed*=1.12 },
  { id:'magnet', title:'Gravity Well', detail:'+35% XP pickup radius', apply:p=>p.magnet*=1.35 },
  { id:'pierce', title:'Prismatic Edge', detail:'+1 projectile pierce', apply:p=>p.pierce+=1 },
  { id:'multishot', title:'Split Conduit', detail:'+1 Aether bolt (−12% damage)', apply:p=>{p.count+=1;p.damage*=.88} },
  { id:'regen', title:'Reconstitution', detail:'Restore 35% of max HP', apply:p=>p.hp=Math.min(p.maxHp,p.hp+p.maxHp*.35) }
];

export function pickUpgrade(available=UPGRADES, count=3, random=Math.random) {
  const pool=[...available], picks=[];
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
