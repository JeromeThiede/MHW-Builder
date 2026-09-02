// Build step: fetch all source data once and bake it into ../data.json
// Run locally with `node build/fetch-data.mjs`, or let the GitHub Action do it.
// Node 18+ (global fetch). No dependencies.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, "..");
const API = "https://mhw-db.com";
const RAW = "https://raw.githubusercontent.com/gatheringhallstudios/MHWorldData/master/source_data/weapons/";

const BLOAT = {"great-sword":4.8,"long-sword":3.3,"sword-and-shield":1.4,"dual-blades":1.4,"hammer":5.2,"hunting-horn":4.2,"lance":2.3,"gunlance":2.3,"switch-axe":3.5,"charge-blade":3.6,"insect-glaive":3.1,"light-bowgun":1.3,"heavy-bowgun":1.5,"bow":1.2};
const SHARP_COLORS = ["red","orange","yellow","green","blue","white","purple"];
const REAL_ELE = ["Fire","Water","Ice","Thunder","Dragon"];

function splitCSVLine(line){const out=[];let cur="",q=false;for(let i=0;i<line.length;i++){const ch=line[i];if(q){if(ch=='"'){if(line[i+1]=='"'){cur+='"';i++;}else q=false;}else cur+=ch;}else{if(ch=='"')q=true;else if(ch==','){out.push(cur);cur="";}else cur+=ch;}}out.push(cur);return out;}
function parseCSV(text){const lines=text.split(/\r?\n/).filter(x=>x.length);const head=splitCSVLine(lines[0]);const rows=[];for(let i=1;i<lines.length;i++){const c=splitCSVLine(lines[i]);if(!c.length)continue;const o={};head.forEach((h,j)=>o[h]=c[j]);rows.push(o);}return rows;}
function sharpArr(row){return SHARP_COLORS.map(c=>+row[c]||0);}
const norm = s => (s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/["'`]/g,"").replace(/\s+/g," ").trim();

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
  (0, eval)(src); // sets window.MHW_SUPPLEMENT
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
  console.log("Fetching weapon CSVs …");
  const [wb, ws] = await Promise.all([
    fetch(RAW + "weapon_base.csv").then(r => r.text()),
    fetch(RAW + "weapon_sharpness.csv").then(r => r.text()),
  ]);
  const WEAPONS = {};
  buildWeapons(parseCSV(wb), parseCSV(ws), WEAPONS);
  mergeSupplement(WEAPONS);

  console.log("Fetching mhw-db data …");
  const [armor, decos, charms, skillsArr, sets, mhwWeps] = await Promise.all([
    getJSON("/armor", {id:1,name:1,type:1,rank:1,rarity:1,defense:1,resistances:1,slots:1,skills:1,armorSet:1,assets:1}),
    getJSON("/decorations", {id:1,name:1,slot:1,skills:1,rarity:1}),
    getJSON("/charms", {id:1,name:1,ranks:1}),
    getJSON("/skills", {id:1,name:1,ranks:1}),
    getJSON("/armor/sets", {id:1,name:1,bonus:1}),
    getJSON("/weapons", {id:1,name:1,type:1,assets:1}).catch(() => []),
  ]);

  const skills = {};
  skillsArr.forEach(s => skills[s.id] = {name:s.name, max:(s.ranks||[]).length});
  const setBonus = {};
  sets.forEach(s => { if (s.bonus) setBonus[s.bonus.id] = {name:s.bonus.name, ranks:s.bonus.ranks}; });

  // weapon images (optional; mhw-db only covers up to rarity 8)
  const weaponImg = {};
  (mhwWeps || []).forEach(w => { const a = w.assets || {}; if (a.image) weaponImg[norm(w.name)] = a.image; });
  for (const t in WEAPONS) WEAPONS[t].forEach(w => { w.img = weaponImg[norm(w.name)] || null; });

  const data = { generated: new Date().toISOString(), weapons: WEAPONS, armor, decos, charms, skills, setBonus };
  const out = join(ROOT, "data.json");
  writeFileSync(out, JSON.stringify(data));
  const wc = Object.values(WEAPONS).reduce((a, w) => a + w.length, 0);
  console.log(`Wrote data.json — ${wc} weapons, ${armor.length} armor, ${decos.length} decorations, ${charms.length} charms, ${(JSON.stringify(data).length/1024).toFixed(0)} KB`);
}
main().catch(e => { console.error(e); process.exit(1); });
