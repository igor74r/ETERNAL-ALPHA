import Phaser from 'phaser';
import { GAME, ENEMIES, WEAPONS, UPGRADES, pickUpgrade, formatTime } from '../systems/config.js';

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const dist=(a,b)=>Phaser.Math.Distance.Between(a.x,a.y,b.x,b.y);

export class ArenaScene extends Phaser.Scene {
  constructor(){super('ArenaScene');this.mode='menu';this.elapsed=0;this.spawnClock=0;this.fireClock=0;this.orbitClock=0;this.level=1;this.xp=0;this.xpNeed=6;this.kills=0;this.runGold=0;this.enemies=[];this.bullets=[];this.gems=[];this.player=null;this.stats=null;this.lastAim=null;this.joy=null;}
  create(){
    this.meta=window.__ETERNAL_ALPHA__.meta;
    this.cameras.main.setBackgroundColor('#080d18');
    this.drawArena();
    this.keys=this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,ESC,P');
    this.input.keyboard.on('keydown-ESC',()=>this.mode==='playing'?this.pause():this.mode==='paused'?this.resume():null);
    this.input.keyboard.on('keydown-P',()=>this.mode==='playing'?this.pause():this.mode==='paused'?this.resume():null);
    this.input.on('pointerdown',p=>{if(this.mode==='playing')this.lastAim={x:p.worldX,y:p.worldY};});
    this.input.on('pointermove',p=>{if(p.isDown&&this.mode==='playing')this.lastAim={x:p.worldX,y:p.worldY};});
    this.overlay=document.getElementById('overlay');
    this.showMenu();
    this.scale.on('resize',()=>this.layout());
  }
  drawArena(){
    const g=this.add.graphics();
    g.lineStyle(1,0x17243a,.58);
    for(let x=0;x<2200;x+=64)g.lineBetween(x,0,x,1600);
    for(let y=0;y<1600;y+=64)g.lineBetween(0,y,2200,y);
    g.lineStyle(2,0x273854,.55);g.strokeCircle(1100,800,570);
    g.setDepth(-10);
  }
  layout(){ if(this.player)this.cameras.main.centerOn(this.player.x,this.player.y); }
  showMenu(){
    this.mode='menu';
    const gold=this.meta.data.gold;
    this.overlay.innerHTML=`<div class="overlay-panel"><div class="eyebrow">A survival protocol</div><h1>ETERNAL ALPHA</h1><p>15 minutes against the endless. Evolve your arsenal, break the elite waves, and survive the void.</p><p style="font:600 12px Oxanium;color:#d7e4fa">WASD / ARROWS · MOUSE AIM · AUTO-FIRE</p><button class="action" id="start">Initiate run</button><button class="action sub-action" id="meta">Armory · ${gold} ◈</button></div>`;
    this.overlay.querySelector('#start').onclick=()=>this.startRun();
    this.overlay.querySelector('#meta').onclick=()=>this.showArmory();
  }
  showArmory(){
    const d=this.meta.data,items=[['power','Weapon power'],['vitality','Vitality'],['magnet','XP magnet']];
    this.overlay.innerHTML=`<div class="overlay-panel"><div class="eyebrow">Persistent upgrades</div><h1>ARMORY</h1><p>Gold: ${d.gold} ◈ · Upgrades persist between runs.</p><div style="display:grid;gap:10px;text-align:left">${items.map(([k,n])=>`<button class="level-card" data-key="${k}"><strong>${n} · Lv ${d.upgrades[k]}</strong><span>Cost ${this.meta.price(k)} gold</span></button>`).join('')}</div><p><button class="action" id="back">Back</button></p></div>`;
    this.overlay.querySelectorAll('[data-key]').forEach(b=>b.onclick=()=>{const k=b.dataset.key;if(this.meta.buy(k,this.meta.price(k)))this.showArmory();});
    this.overlay.querySelector('#back').onclick=()=>this.showMenu();
  }
  startRun(){
    this.overlay.innerHTML='';this.mode='playing';this.elapsed=0;this.spawnClock=0;this.fireClock=0;this.orbitClock=0;this.level=1;this.xp=0;this.xpNeed=6;this.kills=0;this.runGold=0;this.enemies=[];this.bullets=[];this.gems=[];
    const m=this.meta.data.upgrades;
    this.stats={hp:GAME.startingHp+m.vitality*12,maxHp:GAME.startingHp+m.vitality*12,speed:GAME.playerSpeed,damage:1+m.power*.08,cooldown:1,magn et:GAME.magnetRadius*(1+m.magnet*.12),count:1,pierce:0};
    this.stats.magnet=this.stats.magnet||GAME.magnetRadius;
    this.stats.weapons=[0];this.stats.weaponLevels={aether:1};this.stats.invuln=0;this.stats.gold=0;
    this.player=this.add.circle(0,0,15,0x67e8f9).setStrokeStyle(3,0xd8fbff).setDepth(5);
    this.physics.add.existing(this.player);this.player.body.setCircle(13);this.player.body.setCollideWorldBounds(false);
    this.cameras.main.startFollow(this.player,true,.08,.08);this.cameras.main.setZoom(Math.min(this.scale.width/900, this.scale.height/600,1.25));
    this.hud=this.add.graphics().setScrollFactor(0).setDepth(1000);
    this.hudText=this.add.text(20,18,'',{fontFamily:'Oxanium',fontSize:'14px',color:'#e9f4ff',lineSpacing:8}).setScrollFactor(0).setDepth(1001);
    this.spawnEnemy(true);this.layout();
  }
  spawnEnemy(force=false,type=null){
    if(this.enemies.length>=GAME.maxEnemies)return;
    const angle=Math.random()*Math.PI*2,range=force?320:500+Math.random()*220;
    const x=this.player.x+Math.cos(angle)*range,y=this.player.y+Math.sin(angle)*range;
    const t=type|| (this.elapsed>180&&Math.random()<.16?'brute':Math.random()<.35?'runner':'crawler');
    const cfg=ENEMIES[t];if(!cfg)return;
    const e=this.add.circle(x,y,cfg.radius,cfg.color).setStrokeStyle(t==='boss'?4:2,0xf2f6ff,.75).setDepth(3);
    this.physics.add.existing(e);e.body.setCircle(cfg.radius);e.kind=t;e.hp=cfg.hp*(1+this.elapsed/280);e.maxHp=e.hp;e.cfg=cfg;e.touchClock=0;e.xp=cfg.xp;
    this.enemies.push(e);
    if(t==='boss'){e.setScale(1.4);e.setStrokeStyle(5,0xffe1a3);this.cameras.main.shake(500,.012);}
  }
  fire(){
    const target=this.enemies.reduce((best,e)=>!best||dist(this.player,e)<dist(this.player,best)?e:best,null);
    if(!target)return;
    const w=WEAPONS[0],a=Phaser.Math.Angle.Between(this.player.x,this.player.y,target.x,target.y);
    const count=this.stats.count;
    for(let i=0;i<count;i++){
      const spread=(i-(count-1)/2)*.12,angle=a+spread;
      const b=this.add.circle(this.player.x,this.player.y,4,w.color).setDepth(4);
      this.physics.add.existing(b);b.body.setCircle(4);b.body.setVelocity(Math.cos(angle)*w.speed,Math.sin(angle)*w.speed);
      b.damage=w.damage*this.stats.damage;b.pierce=this.stats.pierce;b.life=1.5;this.bullets.push(b);
    }
  }
  makeGem(x,y,value){
    const g=this.add.circle(x,y,5,value>=4?0xfbbf24:0x7dd3fc).setStrokeStyle(1,0xffffff,.6).setDepth(2);
    this.physics.add.existing(g);g.body.setCircle(6);g.body.setAllowGravity(false);g.value=value;this.gems.push(g);
  }
  collectGem(g){
    this.xp+=g.value;g.destroy();this.gems=this.gems.filter(x=>x!==g);
    while(this.xp>=this.xpNeed){this.xp-=this.xpNeed;this.xpNeed=Math.floor(this.xpNeed*1.32+3);this.levelUp();}
  }
  levelUp(){
    this.mode='levelup';this.physics.world.pause();
    const cards=pickUpgrade(UPGRADES);
    this.overlay.innerHTML=`<div class="overlay-panel"><div class="eyebrow">Evolution detected · Level ${this.level+1}</div><h1>CHOOSE AN UPGRADE</h1><div class="level-cards">${cards.map((u,i)=>`<button class="level-card" data-i="${i}"><span>OPTION 0${i+1}</span><strong>${u.title}</strong><span>${u.detail}</span></button>`).join('')}</div></div>`;
    this.overlay.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{cards[+b.dataset.i].apply(this.stats);this.level++;this.mode='playing';this.overlay.innerHTML='';this.physics.world.resume();});
  }
  pause(){this.mode='paused';this.physics.world.pause();this.overlay.innerHTML=`<div class="overlay-panel"><div class="eyebrow">Run suspended</div><h1>PAUSED</h1><p>Take a breath. The void is waiting.</p><button class="action" id="resume">Resume</button><button class="action sub-action" id="quit">Abandon run</button></div>`;this.overlay.querySelector('#resume').onclick=()=>this.resume();this.overlay.querySelector('#quit').onclick=()=>{this.physics.world.resume();this.showMenu();};}
  resume(){this.mode='playing';this.overlay.innerHTML='';this.physics.world.resume();}
  endRun(won=false){
    this.mode='gameover';this.physics.world.pause();const earned=this.runGold+Math.floor(this.elapsed/15)+(won?100:0);this.meta.addGold(earned);
    this.overlay.innerHTML=`<div class="overlay-panel"><div class="eyebrow">${won?'Protocol complete':'Signal lost'}</div><h1>${won?'ASCENSION':'RUN OVER'}</h1><p>Time survived: ${formatTime(this.elapsed)} · Eliminations: ${this.kills}</p><p>Gold earned: ${earned} ◈</p><button class="action" id="again">Run again</button><button class="action sub-action" id="armory">Armory</button></div>`;
    this.overlay.querySelector('#again').onclick=()=>this.startRun();this.overlay.querySelector('#armory').onclick=()=>this.showArmory();
  }
  update(t,dtMs){
    if(this.mode!=='playing'||!this.player)return;
    const dt=Math.min(dtMs/1000,.05);this.elapsed+=dt;
    if(this.elapsed>=GAME.duration){this.endRun(true);return;}
    const body=this.player.body, k=this.keys;
    let vx=(k.D.isDown||k.RIGHT.isDown?1:0)-(k.A.isDown||k.LEFT.isDown?1:0);
    let vy=(k.S.isDown||k.DOWN.isDown?1:0)-(k.W.isDown||k.UP.isDown?1:0);
    const pad=this.input.gamepad?.getPad(0);
    if(pad){vx=pad.leftStick.x;vy=pad.leftStick.y;}
    const len=Math.hypot(vx,vy)||1;body.setVelocity(vx/len*this.stats.speed,vy/len*this.stats.speed);
    this.stats.invuln=Math.max(0,this.stats.invuln-dt);
    this.spawnClock+=dt;
    const interval=Math.max(.28,GAME.spawnEvery*(1-this.elapsed/GAME.duration*.58));
    if(this.spawnClock>=interval){this.spawnClock=0;this.spawnEnemy();}
    for(const milestone of GAME.bossTimes){
      if(this.elapsed>=milestone&&this.elapsed< milestone+dt){
        this.spawnEnemy(true,milestone===300?'elite':'boss');
      }
    }
    this.fireClock+=dt;
    if(this.fireClock>=WEAPONS[0].cooldown*this.stats.cooldown){this.fireClock=0;this.fire();}
    // Orbital blades: a simple continuous damaging ring.
    this.orbitClock+=dt;
    if(this.stats.weapons.includes(1)){
      const a=this.orbitClock*2.8;
      for(let j=0;j<2;j++){
        const x=this.player.x+Math.cos(a+j*Math.PI)*58,y=this.player.y+Math.sin(a+j*Math.PI)*58;
        this.enemies.forEach(e=>{if(Phaser.Math.Distance.Between(x,y,e.x,e.y)<e.cfg.radius+12)e.hp-=this.stats.damage*13*dt;});
      }
    }
    this.enemies.forEach(e=>{
      if(!e.active)return;
      const a=Phaser.Math.Angle.Between(e.x,e.y,this.player.x,this.player.y);
      e.body.setVelocity(Math.cos(a)*e.cfg.speed,Math.sin(a)*e.cfg.speed);
      e.touchClock-=dt;
      if(dist(e,this.player)<e.cfg.radius+GAME.playerRadius&&e.touchClock<=0){
        e.touchClock=.7;
        if(this.stats.invuln<=0){this.stats.hp-=e.cfg.damage;this.stats.invuln=GAME.invuln;this.player.setAlpha(.55);
          if(this.stats.hp<=0){this.endRun();return;}}
      }
      if(e.hp<=0){this.kills++;this.makeGem(e.x,e.y,e.xp);if(Math.random()<.22){this.runGold+=1;}e.destroy();}
    });
    this.enemies=this.enemies.filter(e=>e.active);
    this.bullets.forEach(b=>{
      b.life-=dt;if(b.life<=0){b.destroy();return;}
      const hit=this.enemies.find(e=>e.active&&dist(b,e)<e.cfg.radius+5);
      if(hit){hit.hp-=b.damage;if(b.pierce>0)b.pierce--;else{b.destroy();b.life=0;}}
    });
    this.bullets=this.bullets.filter(b=>b.active&&b.life>0);
    this.gems.forEach(g=>{
      const d=dist(g,this.player);
      if(d<this.stats.magnet)g.body.setVelocity((this.player.x-g.x)*3,(this.player.y-g.y)*3);
      if(d<GAME.pickupRadius)this.collectGem(g);
    });
    this.player.setAlpha(this.stats.invuln>0&&Math.floor(t/80)%2===0?.45:1);
    this.drawHud();
  }
  drawHud(){
    const g=this.hud;g.clear();
    const W=this.scale.width;
    g.fillStyle(0x080d18,.84);g.fillRoundedRect(16,14,300,76,12);
    g.fillStyle(0x25334d,1);g.fillRoundedRect(28,30,260,12,6);
    g.fillStyle(0xf16b8b,1);g.fillRoundedRect(28,30,260*clamp(this.stats.hp/this.stats.maxHp,0,1),12,6);
    g.fillStyle(0x1b3049,1);g.fillRoundedRect(28,56,260,8,4);
    g.fillStyle(0x67e8f9,1);g.fillRoundedRect(28,56,260*clamp(this.xp/this.xpNeed,0,1),8,4);
    this.hudText.setText(`HP ${Math.ceil(this.stats.hp)}/${this.stats.maxHp}     LV ${this.level}
${formatTime(this.elapsed)} / 15:00     ${this.kills} KILLS     ${this.meta.data.gold+this.runGold} ◈`);
  }
}