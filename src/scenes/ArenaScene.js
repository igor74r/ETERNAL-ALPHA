import Phaser from 'phaser';
import { GAME, ENEMIES, WEAPONS, UPGRADES, pickUpgrade, formatTime } from '../systems/config.js';

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const distance=(a,b)=>Phaser.Math.Distance.Between(a.x,a.y,b.x,b.y);
const TAU=Math.PI*2;

export class ArenaScene extends Phaser.Scene {
  constructor(){
    super('ArenaScene');
    this.mode='menu';this.elapsed=0;this.level=1;this.xp=0;this.xpNeed=6;this.kills=0;
    this.runGold=0;this.spawnClock=0;this.weaponClocks={};this.enemies=[];this.bullets=[];this.gems=[];
    this.bulletPool=[];this.player=null;this.stats=null;this.joyVector={x:0,y:0};this.joyPointer=null;
    this.milestonesSeen=new Set();this.lastAimAt=0;
  }
  create(){
    this.meta=window.__ETERNAL_ALPHA__.meta;
    this.cameras.main.setBackgroundColor('#080d18');
    this.drawArena();
    this.keys=this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,ESC,P');
    this.input.keyboard.on('keydown-ESC',()=>this.togglePause());
    this.input.keyboard.on('keydown-P',()=>this.togglePause());
    this.input.on('pointerdown',p=>{if(this.mode==='playing'&&!p.pointerType?.includes('touch')){this.lastAim={x:p.worldX,y:p.worldY};this.lastAimAt=this.time.now;}});
    this.input.on('pointermove',p=>{if(this.mode==='playing'&&p.isDown&&!p.pointerType?.includes('touch')){this.lastAim={x:p.worldX,y:p.worldY};this.lastAimAt=this.time.now;}});
    this.overlay=document.getElementById('overlay');
    this.createTouchControls();
    this.showMenu();
    this.scale.on('resize',()=>this.layout());
  }
  drawArena(){
    const g=this.add.graphics().setDepth(-20);
    g.lineStyle(1,0x17243a,.5);
    for(let x=-2400;x<2400;x+=72)g.lineBetween(x,-2400,x,2400);
    for(let y=-2400;y<2400;y+=72)g.lineBetween(-2400,y,2400,y);
    g.lineStyle(2,0x273854,.42);g.strokeCircle(0,0,900);
    g.lineStyle(1,0x26334c,.3);g.strokeCircle(0,0,600);g.strokeCircle(0,0,300);
  }
  createTouchControls(){
    this.touch=document.createElement('div');
    this.touch.className='touch-controls';
    this.touch.innerHTML='<div class="touch-stick"><div class="touch-knob"></div></div><button class="touch-pause" aria-label="Pause">Ⅱ</button>';
    this.overlay.appendChild(this.touch);
    this.stick=this.touch.querySelector('.touch-stick');this.knob=this.touch.querySelector('.touch-knob');
    const move=e=>{
      if(this.joyPointer===null)return;
      const r=this.stick.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
      const dx=e.clientX-cx,dy=e.clientY-cy,max=r.width*.36,len=Math.hypot(dx,dy)||1,scale=Math.min(1,max/len);
      this.joyVector={x:dx/len*scale,y:dy/len*scale};
      this.knob.style.transform=`translate(${dx*scale}px,${dy*scale}px)`;
    };
    const end=()=>{this.joyPointer=null;this.joyVector={x:0,y:0};this.knob.style.transform='translate(0,0)';};
    this.stick.addEventListener('pointerdown',e=>{e.preventDefault();this.joyPointer=e.pointerId;this.stick.setPointerCapture(e.pointerId);move(e);});
    this.stick.addEventListener('pointermove',move);
    this.stick.addEventListener('pointerup',end);this.stick.addEventListener('pointercancel',end);
    this.touch.querySelector('.touch-pause').onclick=()=>this.togglePause();
  }
  layout(){if(this.player)this.cameras.main.centerOn(this.player.x,this.player.y);}
  showMenu(){
    this.mode='menu';this.touch.classList.remove('visible');
    this.overlay.querySelectorAll('.overlay-panel').forEach(e=>e.remove());
    const gold=this.meta.data.gold;
    this.panel(`<div class="eyebrow">A survival protocol</div><h1>ETERNAL ALPHA</h1><p>15 minutes against the endless. Evolve your arsenal, break the elite waves, and survive the void.</p><div class="control-hint">WASD / ARROWS · MOUSE AIM · AUTO-FIRE<br>TOUCH JOYSTICK · GAMEPAD</div><div class="menu-actions"><button class="action" id="start">Initiate run</button><button class="action secondary" id="armory">Armory · ${gold} ◈</button></div>`);
    this.overlay.querySelector('#start').onclick=()=>this.startRun();
    this.overlay.querySelector('#armory').onclick=()=>this.showArmory();
  }
  panel(content){
    const p=document.createElement('div');p.className='overlay-panel';p.innerHTML=content;this.overlay.appendChild(p);return p;
  }
  showArmory(){
    this.mode='armory';this.touch.classList.remove('visible');
    this.overlay.querySelectorAll('.overlay-panel').forEach(e=>e.remove());
    const d=this.meta.data,items=[['power','Weapon power','+8% damage per rank'],['vitality','Vitality','+12 starting max HP per rank'],['magnet','XP magnet','+12% magnet range per rank']];
    const p=this.panel(`<div class="eyebrow">Persistent upgrades</div><h1>ARMORY</h1><p class="armory-gold">Available gold: <strong>${d.gold} ◈</strong></p><div class="armory-list">${items.map(([k,n,desc])=>`<button class="level-card armory-card" data-key="${k}"><span class="card-kicker">PERMANENT UPGRADE</span><strong>${n} · Lv ${d.upgrades[k]}</strong><span>${desc}</span><span class="cost">Cost ${this.meta.price(k)} gold</span></button>`).join('')}</div><button class="action" id="back">Return to title</button>`);
    p.querySelectorAll('[data-key]').forEach(b=>b.onclick=()=>{const k=b.dataset.key;if(this.meta.buy(k,this.meta.price(k)))this.showArmory();});
    p.querySelector('#back').onclick=()=>this.showMenu();
  }
  startRun(){
    this.overlay.querySelectorAll('.overlay-panel').forEach(e=>e.remove());
    this.touch.classList.add('visible');this.mode='playing';
    this.elapsed=0;this.spawnClock=0;this.level=1;this.xp=0;this.xpNeed=6;this.kills=0;this.runGold=0;
    this.milestonesSeen.clear();this.weaponClocks={};this.enemies=[];this.bullets=[];this.gems=[];
    const m=this.meta.data.upgrades;
    this.stats={hp:GAME.startingHp+m.vitality*12,maxHp:GAME.startingHp+m.vitality*12,speed:GAME.playerSpeed,damage:1+m.power*.08,cooldown:1,magnet:GAME.magnetRadius*(1+m.magnet*.12),count:1,pierce:0,weaponLevels:{aether:1},weapons:['aether'],invuln:0};
    this.player=this.add.circle(0,0,GAME.playerRadius,0x67e8f9).setStrokeStyle(3,0xd8fbff).setDepth(10);
    this.physics.add.existing(this.player);this.player.body.setCircle(13);this.player.body.setCollideWorldBounds(false);
    this.cameras.main.startFollow(this.player,true,.09,.09);this.cameras.main.setZoom(Math.min(this.scale.width/950,this.scale.height/650,1.15));
    this.hud=this.add.graphics().setScrollFactor(0).setDepth(1000);
    this.hudText=this.add.text(28,24,'',{fontFamily:'Oxanium',fontSize:'15px',color:'#e9f4ff',lineSpacing:8}).setScrollFactor(0).setDepth(1001);
    this.spawnEnemy(true);
    this.drawHud();
  }
  spawnEnemy(force=false,type=null){
    if(!this.player||this.enemies.length>=GAME.maxEnemies)return;
    const angle=Math.random()*TAU,range=force?360:580+Math.random()*250;
    const x=this.player.x+Math.cos(angle)*range,y=this.player.y+Math.sin(angle)*range;
    const t=type||(this.elapsed>100&&Math.random()<.18?'brute':Math.random()<.36?'runner':'crawler');
    const cfg=ENEMIES[t];if(!cfg)return;
    const e=this.add.circle(x,y,cfg.radius,cfg.color).setStrokeStyle(t==='boss'?5:2,0xf2f6ff,.75).setDepth(4);
    this.physics.add.existing(e);e.body.setCircle(cfg.radius);e.body.setAllowGravity(false);
    e.kind=t;e.hp=cfg.hp*(1+this.elapsed/300);e.maxHp=e.hp;e.cfg=cfg;e.touchClock=0;e.xp=cfg.xp;e.attackClock=0;
    e.setData('spawnedAt',this.elapsed);this.enemies.push(e);
    if(t==='boss'){e.setScale(1.35);e.setStrokeStyle(5,0xffe1a3);this.cameras.main.shake(450,.009);}
  }
  nearestTarget(from=this.player,maxDistance=Infinity){
    let best=null,bestD=maxDistance;
    for(const e of this.enemies){if(!e.active)continue;const d=distance(from,e);if(d<bestD){best=e;bestD=d;}}
    return best;
  }
  acquireBullet(x,y,color,radius=4){
    let b=this.bulletPool.find(o=>!o.active);
    if(!b){b=this.add.circle(x,y,radius,color).setDepth(6);this.physics.add.existing(b);b.body.setCircle(radius);b.body.setAllowGravity(false);this.bulletPool.push(b);}
    b.setActive(true).setVisible(true).setPosition(x,y).setFillStyle(color);b.body.enable=true;b.body.reset(x,y);b.damage=0;b.pierce=0;b.life=1.6;b.hitIds=new Set();
    return b;
  }
  fireProjectile(weapon,target,origin=this.player,angleOverride=null){
    if(!target)return;
    const angle=angleOverride??Phaser.Math.Angle.Between(origin.x,origin.y,target.x,target.y);
    const b=this.acquireBullet(origin.x,origin.y,weapon.color,weapon.id==='storm'?5:4);
    b.body.setVelocity(Math.cos(angle)*weapon.speed,Math.sin(angle)*weapon.speed);
    b.damage=weapon.damage*this.stats.damage*(this.stats.weaponLevels[weapon.id]||1);
    b.pierce=(weapon.pierce||0)+this.stats.pierce;b.weaponId=weapon.id;b.life=weapon.id==='storm'?1.9:1.55;
  }
  useWeapon(weapon){
    const lvl=this.stats.weaponLevels[weapon.id]||1;
    const target=this.nearestTarget(this.player,weapon.id==='drone'?560:Infinity);
    if(weapon.id==='aether'||weapon.id==='storm'){
      if(!target)return;
      const count=weapon.id==='aether'?this.stats.count:1;
      const base=Phaser.Math.Angle.Between(this.player.x,this.player.y,target.x,target.y);
      for(let i=0;i<count;i++)this.fireProjectile(weapon,target,this.player,base+(i-(count-1)/2)*.105);
    }else if(weapon.id==='orbit'){
      const count=2+Math.min(4,lvl-1),radius=64;
      for(let i=0;i<count;i++){
        const a=this.elapsed*2.6+TAU*i/count,x=this.player.x+Math.cos(a)*radius,y=this.player.y+Math.sin(a)*radius;
        this.damageEnemiesInCircle(x,y,18,weapon.damage*this.stats.damage*lvl*.18);
      }
    }else if(weapon.id==='nova'){
      const radius=220+lvl*16;this.damageEnemiesInCircle(this.player.x,this.player.y,radius,weapon.damage*this.stats.damage*lvl);
      const pulse=this.add.circle(this.player.x,this.player.y,24,weapon.color,.28).setStrokeStyle(4,weapon.color,.8).setDepth(8);
      this.tweens.add({targets:pulse,scale:radius/24,alpha:0,duration:360,onComplete:()=>pulse.destroy()});
      this.cameras.main.shake(130,.003);
    }else if(weapon.id==='drone'){
      const count=Math.min(3,lvl),nearest=this.nearestTarget(this.player,700);if(!nearest)return;
      for(let i=0;i<count;i++){
        const a=this.elapsed*1.7+TAU*i/count,origin={x:this.player.x+Math.cos(a)*70,y:this.player.y+Math.sin(a)*70};
        this.fireProjectile(weapon,nearest,origin);
      }
    }else if(weapon.id==='singularity'){
      const target=this.nearestTarget();const x=target?target.x:this.player.x,y=target?target.y:this.player.y;
      this.damageEnemiesInCircle(x,y,260+lvl*30,weapon.damage*this.stats.damage*lvl);
      const blast=this.add.circle(x,y,20,weapon.color,.34).setStrokeStyle(3,weapon.color).setDepth(8);
      this.tweens.add({targets:blast,scale:14,alpha:0,duration:460,onComplete:()=>blast.destroy()});
    }
  }
  damageEnemiesInCircle(x,y,radius,damage){
    for(const e of this.enemies){if(e.active&&Phaser.Math.Distance.Between(x,y,e.x,e.y)<=radius+e.cfg.radius)e.hp-=damage;}
  }
  makeGem(x,y,value){
    const g=this.add.circle(x,y,5,value>=4?0xfbbf24:0x7dd3fc).setStrokeStyle(1,0xffffff,.65).setDepth(3);
    this.physics.add.existing(g);g.body.setCircle(6);g.body.setAllowGravity(false);g.value=value;this.gems.push(g);
  }
  collectGem(g){
    if(!g.active)return;
    this.xp+=g.value;g.destroy();this.gems=this.gems.filter(x=>x!==g);
    while(this.xp>=this.xpNeed&&this.mode==='playing'){
      this.xp-=this.xpNeed;this.xpNeed=Math.floor(this.xpNeed*1.28+4);this.levelUp();
    }
  }
  levelUp(){
    this.mode='levelup';this.physics.world.pause();this.touch.classList.remove('visible');
    const candidates=pickUpgrade(UPGRADES,2);
    const weaponChoices=WEAPONS.filter(w=>!this.stats.weapons.includes(w.id)||this.stats.weaponLevels[w.id]<8);
    let cards=[...candidates];
    if(weaponChoices.length){
      const w=weaponChoices[Math.floor(Math.random()*weaponChoices.length)],owned=this.stats.weapons.includes(w.id);
      cards.push({id:'weapon:'+w.id,title:owned?`Enhance ${w.name}`:w.name,detail:owned?`Weapon level ${(this.stats.weaponLevels[w.id]||1)+1} · +25% damage`:w.description,weapon:w});
    }
    cards=cards.slice(0,3);
    const p=this.panel(`<div class="eyebrow">Evolution detected · Level ${this.level+1}</div><h1>CHOOSE AN UPGRADE</h1><div class="level-cards">${cards.map((u,i)=>`<button class="level-card" data-i="${i}"><span class="card-kicker">OPTION 0${i+1}</span><strong>${u.title}</strong><span>${u.detail}</span></button>`).join('')}</div><p class="control-hint">Choose one to continue</p>`);
    p.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{
      const u=cards[+b.dataset.i];
      if(u.weapon){const id=u.weapon.id;if(!this.stats.weapons.includes(id)){this.stats.weapons.push(id);this.stats.weaponLevels[id]=1;}else this.stats.weaponLevels[id]=(this.stats.weaponLevels[id]||1)+1;}
      else u.apply(this.stats);
      this.level++;this.mode='playing';p.remove();this.touch.classList.add('visible');this.physics.world.resume();
    });
  }
  togglePause(){if(this.mode==='playing')this.pause();else if(this.mode==='paused')this.resume();}
  pause(){
    this.mode='paused';this.physics.world.pause();this.touch.classList.remove('visible');
    const p=this.panel(`<div class="eyebrow">Run suspended</div><h1>PAUSED</h1><p>The void can wait.</p><button class="action" id="resume">Resume</button><button class="action secondary" id="quit">Abandon run</button>`);
    p.querySelector('#resume').onclick=()=>this.resume();p.querySelector('#quit').onclick=()=>{this.physics.world.resume();this.showMenu();};
  }
  resume(){this.mode='playing';this.overlay.querySelectorAll('.overlay-panel').forEach(e=>e.remove());this.touch.classList.add('visible');this.physics.world.resume();}
  endRun(won=false){
    if(this.mode==='gameover')return;
    this.mode='gameover';this.physics.world.pause();this.touch.classList.remove('visible');
    const earned=this.runGold+Math.floor(this.elapsed/12)+(won?150:0);this.meta.addGold(earned);
    const p=this.panel(`<div class="eyebrow">${won?'Protocol complete':'Signal lost'}</div><h1>${won?'ASCENSION':'RUN OVER'}</h1><p>Time survived: ${formatTime(this.elapsed)} · Eliminations: ${this.kills}</p><p>Gold earned: <strong>${earned} ◈</strong></p><p>Weapons reached: ${this.stats.weapons.length}/6</p><button class="action" id="again">Run again</button><button class="action secondary" id="armory">Armory</button>`);
    p.querySelector('#again').onclick=()=>{this.physics.world.resume();this.startRun();};
    p.querySelector('#armory').onclick=()=>{this.physics.world.resume();this.showArmory();};
  }
  update(time,deltaMs){
    if(this.mode!=='playing'||!this.player)return;
    const dt=Math.min(deltaMs/1000,.04);this.elapsed+=dt;
    if(this.elapsed>=GAME.duration){this.endRun(true);return;}
    const k=this.keys,pad=this.input.gamepad?.getPad(0);
    let vx=(k.D.isDown||k.RIGHT.isDown?1:0)-(k.A.isDown||k.LEFT.isDown?1:0);
    let vy=(k.S.isDown||k.DOWN.isDown?1:0)-(k.W.isDown||k.UP.isDown?1:0);
    if(Math.hypot(this.joyVector.x,this.joyVector.y)>.08){vx=this.joyVector.x;vy=this.joyVector.y;}
    if(pad&&pad.leftStick.length()>0.15){vx=pad.leftStick.x;vy=pad.leftStick.y;}
    const len=Math.hypot(vx,vy)||1;this.player.body.setVelocity(vx/len*this.stats.speed,vy/len*this.stats.speed);
    this.stats.invuln=Math.max(0,this.stats.invuln-dt);
    this.spawnClock+=dt;
    const interval=Math.max(.25,GAME.spawnEvery*(1-this.elapsed/GAME.duration*.64));
    if(this.spawnClock>=interval){this.spawnClock=0;this.spawnEnemy();}
    for(const milestone of GAME.bossTimes){
      if(this.elapsed>=milestone&&!this.milestonesSeen.has(milestone)){
        this.milestonesSeen.add(milestone);this.spawnEnemy(true,milestone===300?'elite':'boss');
      }
    }
    for(const id of this.stats.weapons){
      const weapon=WEAPONS.find(w=>w.id===id);if(!weapon)continue;
      this.weaponClocks[id]=(this.weaponClocks[id]||0)+dt;
      const cooldown=weapon.cooldown*this.stats.cooldown/(id==='orbit'?1:1);
      if(this.weaponClocks[id]>=cooldown){this.weaponClocks[id]=0;this.useWeapon(weapon);}
    }
    for(const e of this.enemies){
      if(!e.active)continue;
      const a=Phaser.Math.Angle.Between(e.x,e.y,this.player.x,this.player.y);
      let speed=e.cfg.speed;
      if(e.kind==='boss'&&this.elapsed-e.getData('spawnedAt')>8){
        e.attackClock+=dt;
        if(e.attackClock>5){e.attackClock=0;speed*=2.3;this.cameras.main.shake(200,.004);}
      }
      e.body.setVelocity(Math.cos(a)*speed,Math.sin(a)*speed);
      e.touchClock-=dt;
      if(distance(e,this.player)<e.cfg.radius+GAME.playerRadius&&e.touchClock<=0){
        e.touchClock=.72;
        if(this.stats.invuln<=0){
          this.stats.hp-=e.cfg.damage;this.stats.invuln=GAME.invuln;
          if(this.stats.hp<=0){this.endRun();return;}
        }
      }
      if(e.hp<=0){
        this.kills++;this.makeGem(e.x,e.y,e.xp);
        if(Math.random()<.22)this.runGold++;
        e.destroy();
      }
    }
    this.enemies=this.enemies.filter(e=>e.active);
    for(const b of this.bullets){
      if(!b.active)continue;
      b.life-=dt;if(b.life<=0){b.setActive(false).setVisible(false);b.body.enable=false;continue;}
      for(const e of this.enemies){
        if(!e.active||b.hitIds.has(e))continue;
        if(distance(b,e)<e.cfg.radius+5){
          e.hp-=b.damage;b.hitIds.add(e);
          if(b.pierce>0)b.pierce--;
          else{b.setActive(false).setVisible(false);b.body.enable=false;break;}
        }
      }
    }
    this.bullets=this.bullets.filter(b=>b.active);
    for(const g of this.gems){
      if(!g.active)continue;
      const d=distance(g,this.player);
      if(d<this.stats.magnet){const a=Phaser.Math.Angle.Between(g.x,g.y,this.player.x,this.player.y);g.body.setVelocity(Math.cos(a)*Math.min(480,260+(this.stats.magnet-d)),Math.sin(a)*Math.min(480,260+(this.stats.magnet-d)));}
      else g.body.setVelocity(0,0);
      if(d<GAME.pickupRadius)this.collectGem(g);
    }
    this.gems=this.gems.filter(g=>g.active);
    this.player.setAlpha(this.stats.invuln>0&&Math.floor(time/75)%2===0?.5:1);
    this.drawHud();
  }
  drawHud(){
    const g=this.hud;g.clear();const W=this.scale.width;
    g.fillStyle(0x080d18,.9);g.fillRoundedRect(18,16,320,88,12);
    g.fillStyle(0x25334d,1);g.fillRoundedRect(30,34,284,12,6);
    g.fillStyle(0xf16b8b,1);g.fillRoundedRect(30,34,284*clamp(this.stats.hp/this.stats.maxHp,0,1),12,6);
    g.fillStyle(0x1b3049,1);g.fillRoundedRect(30,62,284,8,4);
    g.fillStyle(0x67e8f9,1);g.fillRoundedRect(30,62,284*clamp(this.xp/this.xpNeed,0,1),8,4);
    const weaponNames=this.stats.weapons.map(id=>WEAPONS.find(w=>w.id===id)?.name.split(' ')[0]).join(' · ');
    this.hudText.setText(`HP ${Math.ceil(this.stats.hp)}/${this.stats.maxHp}     LV ${this.level}
${formatTime(this.elapsed)} / 15:00    ${this.kills} KILLS    ${this.meta.data.gold+this.runGold} ◈
ARSENAL: ${weaponNames}`);
  }
}
