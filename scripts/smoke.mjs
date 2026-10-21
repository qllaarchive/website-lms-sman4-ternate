#!/usr/bin/env node
/* Smoke test render LMS di DOM-stub:
   node scripts/smoke.mjs [data/matematika.js]  (default: data pertama di data/)
   Menjalankan boot + semua VIEWS + BIND utama, memastikan tidak ada exception
   dan tidak ada "undefined"/"NaN"/[object di HTML yang dirender. */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataFile = process.argv[2] || path.join(ROOT, "data", fs.readdirSync(path.join(ROOT, "data"))
  .filter(x => x.endsWith(".js") && x !== "registry.js").sort()[0]);
const dataSrc = fs.readFileSync(dataFile, "utf8");
const engSrc = fs.readFileSync(path.join(ROOT, "assets/lms.js"), "utf8");

/* ---------- DOM stub ---------- */
function mkEl(tag){
  const children = new Map();
  return {
    tagName: tag || "div",
    innerHTML: "", textContent: "", value: "", checked: false, hidden: false,
    disabled: false, scrollTop: 0, scrollHeight: 0, offsetWidth: 0, offsetTop: 0,
    dataset: {}, style: {}, className: "", onclick: null, onchange: null,
    classList: { add(){}, remove(){}, contains(){ return false; }, toggle(){} },
    appendChild(){}, removeChild(){}, remove(){}, focus(){}, blur(){},
    addEventListener(){}, removeEventListener(){}, setAttribute(){},
    scrollIntoView(){},
    getBoundingClientRect(){ return { top:0, left:0, width:0, height:0 }; },
    querySelector(sel){
      if(!children.has(sel)) children.set(sel, mkEl("div"));
      return children.get(sel);
    },
    querySelectorAll(){ return []; },
    getContext(){ return null; }
  };
}
const els = new Map();
function byId(id){ if(!els.has(id)) els.set(id, mkEl("div")); return els.get(id); }
const selCache = new Map();

const store = new Map();
const sandbox = {
  console,
  setTimeout(){ return 1; }, clearTimeout(){}, setInterval(){ return 1; }, clearInterval(){},
  document: {
    getElementById: byId,
    querySelector(sel){ if(!selCache.has(sel)) selCache.set(sel, mkEl("div")); return selCache.get(sel); },
    querySelectorAll(){ return []; },
    createElement: tag => mkEl(tag),
    body: mkEl("body"),
    documentElement: mkEl("html")
  },
  localStorage: {
    getItem: k => store.has(k) ? store.get(k) : null,
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: k => store.delete(k)
  },
  navigator: {},
  window: null
};
sandbox.window = {
  scrollTo(){}, matchMedia(){ return { matches:false, addListener(){}, addEventListener(){} } },
  AudioContext: undefined, webkitAudioContext: undefined, getComputedStyle(){ return {}; }
};
sandbox.window.window = sandbox.window;
const ctx = vm.createContext(sandbox);

/* ---------- jalankan icons + data + engine (boot di dalamnya) ---------- */
const fails = [];
let res = null;
function fail(where, e){ fails.push(`${where}: ${(e && e.message) || e}`); }
try{ vm.runInContext(dataSrc, ctx, { filename: dataFile }); }
catch(e){ fail("data eval", e); report(); }
try{ vm.runInContext(engSrc, ctx, { filename: "assets/lms.js" }); }
catch(e){ fail("boot/engine", e); report(); }

const driver = `
(function(){
  const out = { views:0, binds:0, quizDone:false, shell:false, notes:[], fails:[] };
  const BAD = /\\bundefined\\b|\\bNaN\\b|\\[object/ ;
  function chk(name, h){
    if(typeof h !== "string") throw new Error(name + " bukan string: " + typeof h);
    if(h.length < 60) throw new Error(name + " terlalu pendek (" + h.length + ")");
    const m = h.match(BAD);
    if(m) {
      const i = h.indexOf(m[0]);
      throw new Error(name + " mengandung '" + m[0] + "' dekat: ..." + h.slice(Math.max(0,i-70), i+70).replace(/\\s+/g," ") + "...");
    }
    out.views++;
  }
  function V(name, fn){ try{ chk(name, fn()); }catch(e){ out.fails.push(name + ": " + e.message); } }
  function B(name, fn){ try{ fn(); out.binds++; }catch(e){ out.fails.push("BIND " + name + ": " + e.message); } }

  const M = window.LMS_CONTENT;
  const NU = M.UNITS.length;

  V("home", () => VIEWS.home());
  V("courses", () => VIEWS.courses());
  V("path", () => VIEWS.path());
  V("grades", () => VIEWS.grades());
  V("assign", () => VIEWS.assign());
  V("res", () => VIEWS.res());
  V("bot", () => VIEWS.bot());
  V("set", () => VIEWS.set());
  V("forum:list", () => VIEWS.forum());
  V("forum:thread", () => VIEWS.forum(M.FORUM_SEED[0] && M.FORUM_SEED[0].id));
  for(const sub of ["diag","form","sum","rem"]) V("quiz:" + sub, () => VIEWS.quiz(sub));
  V("quiz:null", () => VIEWS.quiz());
  V("game:list", () => VIEWS.game());
  for(const g of M.GAMES) V("game:" + g.id, () => VIEWS.game(g.id));
  V("lab:list", () => VIEWS.lab());
  for(const l of M.LABS) V("lab:" + l.id, () => VIEWS.lab(l.id));
  V("ebook:list", () => VIEWS.ebook());
  for(const b of M.EBOOKS) V("ebook:" + b.id, () => VIEWS.ebook(b.id));
  const TABS = ["tujuan","awal","materi","meet","form","kuis","game","proj","refl"];
  for(let n = 1; n <= NU; n++) for(const t of TABS)
    V("unit" + n + ":" + t, () => VIEWS.unit(n, t));

  B("home", () => BIND.home());
  B("courses", () => BIND.courses());
  B("path", () => BIND.path());
  B("grades", () => BIND.grades());
  B("assign", () => BIND.assign());
  B("res", () => BIND.res());
  B("bot", () => BIND.bot());
  B("set", () => BIND.set());
  B("forum", () => BIND.forum());
  B("quiz:diag", () => BIND.quiz("diag"));
  B("quiz:sum", () => BIND.quiz("sum"));
  B("quiz:rem", () => BIND.quiz("rem"));
  B("game:list", () => BIND.game());
  B("game:0", () => BIND.game(M.GAMES[0].id));
  B("lab:list", () => BIND.lab());
  for(const l of M.LABS) B("lab:" + l.id, () => BIND.lab(l.id));
  B("ebook:list", () => BIND.ebook());
  B("unit:awal", () => BIND.unit(1, "awal"));
  B("unit:kuis", () => BIND.unit(1, "kuis"));

  /* ---- alur kuis end-to-end: start -> walk sampai selesai ---- */
  try{
    const box = document.getElementById("qbox");
    const start = box.querySelector("#q-start");
    start.onclick();
    for(let i = 0; i < 80; i++){
      const nx = box.querySelector("#q-next");
      if(!nx || !nx.onclick) break;
      nx.onclick();
      if((box.innerHTML || "").indexOf("qend") >= 0){ out.quizDone = true; break; }
    }
    if(!out.quizDone) out.fails.push("alur kuis: tidak pernah mencapai qend");
  }catch(e){ out.fails.push("alur kuis: " + e.message); }

  /* ---- shell runtime ---- */
  try{
    const t = document.getElementById("brandTitle").innerHTML || "";
    if(t.indexOf(M.meta.name) < 0) out.fails.push("shell: brandTitle tidak memuat meta.name: " + t);
    const sm = document.getElementById("sideMoto").innerHTML || "";
    if(!sm) out.fails.push("shell: sideMoto kosong");
    const nav = document.getElementById("nav").innerHTML || "";
    if(nav.length < 50) out.fails.push("shell: nav tidak dirender");
    const sb = document.getElementById("sceneBox").innerHTML || "";
    if(sb.length < 20) out.fails.push("shell: sceneBox tidak terisi");
    out.shell = true;
  }catch(e){ out.fails.push("shell: " + e.message); }

  return out;
})()`;

try{ res = vm.runInContext(driver, ctx, { filename: "smoke-driver.js" }); }
catch(e){ fail("driver", e); }
if(res && Array.isArray(res.fails)) fails.push(...res.fails);

function report(){
  const n = (res && res.views) || 0;
  if(res) console.log(`views=${res.views} binds=${res.binds} quizDone=${res.quizDone} shell=${res.shell}`);
  for(const w of (res && res.notes) || []) console.log("note  " + w);
  for(const f of fails) console.log("FAIL  " + f);
  console.log(fails.length ? `\nSMOKE GAGAL (${fails.length})` : `\nSMOKE OK — ${dataFile.split("/").pop()} · ${n} view dirender`);
  process.exit(fails.length ? 1 : 0);
}
report();
