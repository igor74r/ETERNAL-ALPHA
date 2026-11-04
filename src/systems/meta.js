const KEY='eternal-alpha-meta-v1';
const DEFAULT={ gold:0, upgrades:{ power:0, vitality:0, magnet:0 } };
export class MetaProgress {
  constructor(){ this.data=this.load(); }
  load(){
    try { const raw=JSON.parse(localStorage.getItem(KEY)||'null'); return raw?{...DEFAULT,...raw,upgrades:{...DEFAULT.upgrades,...raw.upgrades}}:{...DEFAULT,upgrades:{...DEFAULT.upgrades}}; }
    catch { return structuredClone(DEFAULT); }
  }
  save(){ try{localStorage.setItem(KEY,JSON.stringify(this.data));}catch{} }
  addGold(amount){this.data.gold=Math.max(0,this.data.gold+Math.floor(amount));this.save();}
  buy(key,cost){
    if(!(key in this.data.upgrades)||this.data.gold<cost)return false;
    this.data.gold-=cost;this.data.upgrades[key]++;this.save();return true;
  }
  price(key){return 40+this.data.upgrades[key]*55;}
  reset(){this.data=structuredClone(DEFAULT);this.save();}
}