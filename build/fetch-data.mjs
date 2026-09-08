// Build step: fetch all source data once and bake it into ../data.json
// Run locally with `node build/fetch-data.mjs`, or let the GitHub Action do it. Node 18+.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, "..");
const API = "https://mhw-db.com";
const RAW = "https://raw.githubusercontent.com/gatheringhallstudios/MHWorldData/master/source_data/";

const BLOAT = {"great-sword":4.8,"long-sword":3.3,"sword-and-shield":1.4,"dual-blades":1.4,"hammer":5.2,"hunting-horn":4.2,"lance":2.3,"gunlance":2.3,"switch-axe":3.5,"charge-blade":3.6,"insect-glaive":3.1,"light-bowgun":1.3,"heavy-bowgun":1.5,"bow":1.2};
const SHARP_COLORS = ["red","orange","yellow","green","blue","white","purple"];
const REAL_ELE = ["Fire","Water","Ice","Thunder","Dragon"];

// ---- progression: monsters in the order they are first huntable (LR -> HR -> MR story -> Guiding Lands -> sieges) ----
const MONSTER_ORDER = ["Great Jagras","Kulu-Ya-Ku","Pukei-Pukei","Barroth","Jyuratodus","Tobi-Kadachi","Anjanath","Rathian","Tzitzi-Ya-Ku","Paolumu","Great Girros","Radobaan","Legiana","Odogaron","Rathalos","Diablos","Kirin","Zorah Magdaros","Pink Rathian","Bazelgeuse","Azure Rathalos","Black Diablos","Dodogama","Lavasioth","Uragaan","Kushala Daora","Teostra","Vaal Hazak","Nergigante","Xeno'jiiva","Deviljho","Savage Deviljho","Lunastra","Behemoth","Leshen","Ancient Leshen","Beotodus","Banbaro","Viper Tobi-Kadachi","Nightshade Paolumu","Coral Pukei-Pukei","Barioth","Nargacuga","Glavenus","Tigrex","Brachydios","Shrieking Legiana","Fulgur Anjanath","Acidic Glavenus","Ebony Odogaron","Velkhana","Seething Bazelgeuse","Blackveil Vaal Hazak","Namielle","Shara Ishvalda","Zinogre","Stygian Zinogre","Rajang","Yian Garuga","Brute Tigrex","Furious Rajang","Raging Brachydios","Frostfang Barioth","Ruiner Nergigante","Gold Rathian","Silver Rathalos","Kulve Taroth","Safi'jiiva","Alatreon","Fatalis"];
const IDX = {}; MONSTER_ORDER.forEach((m,i)=>IDX[m]=i);
const BAND = { low:0, high:18, master:36 };                 // rank -> first index of that rank band
const rarityBand = r => (+r<=4?0 : +r<=8?18 : 36);

function splitCSVLine(line){const out=[];let cur="",q=false;for(let i=0;i<line.length;i++){const ch=line[i];if(q){if(ch=='"'){if(line[i+1]=='"'){cur+='"';i++;}else q=false;}else cur+=ch;}else{if(ch=='"')q=true;else if(ch==','){out.push(cur);cur="";}else cur+=ch;}}out.push(cur);return out;}
function parseCSV(text){const lines=text.split(/\r?\n/).filter(x=>x.length);const head=splitCSVLine(lines[0]);const rows=[];for(let i=1;i<lines.length;i++){const c=splitCSVLine(lines[i]);if(!c.length)continue;const o={};head.forEach((h,j)=>o[h]=c[j]);rows.push(o);}return rows;}
function sharpArr(row){return SHARP_COLORS.map(c=>+row[c]||0);}
const norm = s => (s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/["'`]/g,"").replace(/\s+/g," ").trim();
const normPiece = s => (s||"").toLowerCase().replace(/α/g,"alpha").replace(/β/g,"beta").replace(/γ/g,"gamma").replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();

const getJSON = async (path, proj) => {
  let u = API + path;
  if (proj) u += "?p=" + encodeURIComponent(JSON.stringify(proj));
  const r = await fetch(u);
  if (!r.ok) throw new Error(path + " " + r.status);
  return r.json();
};

function buildWeapons(base, sharp, WEAPONS){
  const smap = {};
  sharp.forEach(s => { const k = s.base_name_en + "|" + s.weapon_type; (smap[k] = smap[k] || {})[s.maxed === "TRUE" ? "max" : "base"] = s; });
  base.forEach(w => {
    const type = w.weapon_type; if (!BLOAT[type]) return;
    const slots = [w.slot_1, w.slot_2, w.slot_3].map(Number).filter(x => x > 0).map(r => ({rank:r}));
    const sh = smap[w.name_en + "|" + type] || {};
    (WEAPONS[type] = WEAPONS[type] || []).push({
      id: "w" + w.id, name: w.name_en, type, rarity: +w.rarity, attack: +w.attack, affinity: +(w.affinity||0),
      elementType: REAL_ELE.includes(w.element1) ? w.element1 : null,
      statusType: (w.element1 && !REAL_ELE.includes(w.element1)) ? w.element1 : null,
      elementVal: +(w.element1_attack||0), elementHidden: w.element_hidden === "TRUE", slots,
      sharpBase: sh.base ? sharpArr(sh.base) : null, sharpMax: sh.max ? sharpArr(sh.max) : null,
      critElement: false, awakening: false
    });
  });
}
function mergeSupplement(WEAPONS){
  globalThis.window = globalThis.window || {};
  const src = readFileSync(join(ROOT, "mhw-kulve-safi-supplement.js"), "utf8");
  (0, eval)(src);
  const SUP = globalThis.window.MHW_SUPPLEMENT || [];
  const shBase = [0,0,0,0,50,150,0], shMax = [0,0,0,0,50,120,30];
  SUP.forEach((s, i) => { if (!BLOAT[s.type]) return;
    (WEAPONS[s.type] = WEAPONS[s.type] || []).push({
      id: "sup" + i, name: s.name, type: s.type, rarity: s.rarity, attack: s.attack, affinity: s.affinity || 0,
      elementType: s.element ? s.element.type : null, statusType: s.status ? s.status.type : null,
      elementVal: s.element ? s.element.value : (s.status ? s.status.value : 0),
      elementHidden: false, slots: (s.slots || []).map(r => ({rank:r})),
      sharpBase: s.sharpness === null ? null : shBase, sharpMax: s.sharpness === null ? null : shMax,
      critElement: !!s.critElement, awakening: !!s.awakening, tier: s.tier || "kjarr"
    });
  });
  for (const t in WEAPONS) WEAPONS[t].sort((a,b) => (b.rarity - a.rarity) || a.name.localeCompare(b.name));
}

async function main(){
  console.log("Fetching source CSVs …");
  const [wbTxt, wsTxt, asetTxt, rewTxt, wcTxt] = await Promise.all([
    fetch(RAW + "weapons/weapon_base.csv").then(r=>r.text()),
    fetch(RAW + "weapons/weapon_sharpness.csv").then(r=>r.text()),
    fetch(RAW + "armors/armorset_base.csv").then(r=>r.text()),
    fetch(RAW + "monsters/monster_rewards.csv").then(r=>r.text()),
    fetch(RAW + "weapons/weapon_craft.csv").then(r=>r.text()),
  ]);
  const wbRows = parseCSV(wbTxt);
  const WEAPONS = {};
  buildWeapons(wbRows, parseCSV(wsTxt), WEAPONS);
  mergeSupplement(WEAPONS);

  // ---- progression indexes ----
  const aset = parseCSV(asetTxt), rew = parseCSV(rewTxt), wc = parseCSV(wcTxt);
  // item -> monster (only items dropped by exactly one monster are "specific")
  const itemMon = {}; rew.forEach(r => { const it=r.item_en, m=r.base_name_en; if(!it||!m) return; (itemMon[it]=itemMon[it]||new Set()).add(m); });
  const monOfItem = n => { const s=itemMon[n]; return (s && s.size===1) ? [...s][0] : null; };
  const craftBy = {}; wc.forEach(r => { (craftBy[r.base_name_en]=craftBy[r.base_name_en]||[]).push(r); });
  const wbByName = {}; wbRows.forEach(w => wbByName[w.name_en]=w);
  const itemsOf = n => { const rows=craftBy[n]||[]; const o=[]; rows.forEach(r=>[r.item1_name,r.item2_name,r.item3_name,r.item4_name].forEach(x=>{if(x)o.push(x);})); return o; };
  function weaponProg(name, rarity){ // max monster index across the whole upgrade chain
    const seen=new Set(); let max=-1, cur=name, d=0;
    while(cur && !seen.has(cur) && d<40){ seen.add(cur); itemsOf(cur).forEach(it=>{const m=monOfItem(it); if(m!=null && IDX[m]!=null && IDX[m]>max) max=IDX[m];}); const w=wbByName[cur]; cur=w&&w.previous_en?w.previous_en:null; d++; }
    return max<0 ? rarityBand(rarity) : max;
  }
  // armor piece (normalised name) -> progression index (from armorset_base monster, else rank band)
  const pieceProg = {};
  aset.forEach(s => { const m=(s.monster||"").trim(); let idx; if(m && IDX[m]!=null) idx=IDX[m]; else { const rk=(s.rank||"").toLowerCase(); idx = rk==="lr"?0 : rk==="hr"?18 : rk==="mr"?36 : 0; }
    ["head","chest","arms","waist","legs"].forEach(k=>{ if(s[k]) pieceProg[normPiece(s[k])]=idx; }); });

  console.log("Fetching mhw-db data …");
  const [armor, decos, charms, skillsArr, sets, mhwWeps] = await Promise.all([
    getJSON("/armor", {id:1,name:1,type:1,rank:1,rarity:1,defense:1,resistances:1,slots:1,skills:1,armorSet:1,assets:1}),
    getJSON("/decorations", {id:1,name:1,slot:1,skills:1,rarity:1}),
    getJSON("/charms", {id:1,name:1,ranks:1}),
    getJSON("/skills", {id:1,name:1,ranks:1}),
    getJSON("/armor/sets", {id:1,name:1,bonus:1}),
    getJSON("/weapons", {id:1,name:1,type:1,assets:1}).catch(() => []),
  ]);

  const skills = {}; skillsArr.forEach(s => skills[s.id] = {name:s.name, max:(s.ranks||[]).length});
  const setBonus = {}; sets.forEach(s => { if (s.bonus) setBonus[s.bonus.id] = {name:s.bonus.name, ranks:s.bonus.ranks}; });

  const weaponImg = {};
  (mhwWeps || []).forEach(w => { const a = w.assets || {}; if (a.image) weaponImg[norm(w.name)] = a.image; });

  // attach progression to weapons
  for (const t in WEAPONS) WEAPONS[t].forEach(w => {
    w.img = weaponImg[norm(w.name)] || null;
    w.prog = w.tier === "kjarr" ? IDX["Kulve Taroth"] : w.tier === "safi" ? IDX["Safi'jiiva"] : weaponProg(w.name, w.rarity);
  });
  // attach progression to armor pieces
  let armMatched = 0;
  armor.forEach(a => { const p = pieceProg[normPiece(a.name)]; if (p != null) { a.prog = p; armMatched++; } else { a.prog = a.rank==="low"?0 : a.rank==="high"?18 : 36; } });

  const data = { generated: new Date().toISOString(), monsterOrder: MONSTER_ORDER, weapons: WEAPONS, armor, decos, charms, skills, setBonus };
  writeFileSync(join(ROOT, "data.json"), JSON.stringify(data));
  const wc2 = Object.values(WEAPONS).reduce((a, w) => a + w.length, 0);
  console.log(`Wrote data.json — ${wc2} weapons, ${armor.length} armor (${armMatched} matched to a monster), ${decos.length} decorations, ${charms.length} charms, ${(JSON.stringify(data).length/1024).toFixed(0)} KB`);
}
main().catch(e => { console.error(e); process.exit(1); });
