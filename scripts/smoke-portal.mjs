#!/usr/bin/env node
/* Uji portal.js + api-client.js di DOM stub: alur load slider (2 foto),
   render slider beranda + daftar kelola, dan submit form foto via FormData. */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

/* Situs (portal, mapel, data, assets) ada di folder public/ */
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "public");
const fails = [];

function mkEl(tag){
  const el = {
    tagName: tag || "div", hidden: false, disabled: false,
    innerHTML: "", textContent: "", value: "", checked: true, tabindex: 0,
    files: [], children: [], parentNode: null,
    dataset: {}, style: { setProperty(){}, }, className: "",
    classList: { add(){}, remove(){}, contains(){ return false; }, toggle(){} },
    appendChild(c){ if(c && c.__frag){ (c.kids||[]).forEach(k => (this.kids || (this.kids=[])).push(k)); return; } (this.kids || (this.kids=[])).push(c); }, removeChild(){}, remove(){}, focus(){}, blur(){}, setAttribute(){}, getAttribute(){ return ""; }, removeAttribute(){},
    insertBefore(c){ (this.kids || (this.kids = [])).push(c); return c; },
    contains(){ return false; },
    addEventListener(){}, removeEventListener(){}, closest(){ return null; },
    options: [], appendChildOpt(){},
    getBoundingClientRect(){ return { top:0, left:0, width:0, height:0, bottom:0, right:0 }; },
    offsetParent: {}, getClientRects(){ return [{}]; },
    querySelector(){ return null; }, querySelectorAll(){ return []; },
    reset(){},
  };
  let html = "";
  Object.defineProperty(el, "textContent", { get(){ return html; }, set(v){ html = String(v); } });
  Object.defineProperty(el, "innerHTML", { get(){ return html; }, set(v){ html = String(v); } });
  return el;
}
const els = new Map();
const byId = id => { if(!els.has(id)) els.set(id, mkEl("div")); return els.get(id); };
const store = new Map();
const timers = [];

const sliders = [
  { id:"s1", imageUrl:"/api/uploads/a.webp", title:"Panorama", sortOrder:0, pub:true },
  { id:"s2", imageUrl:"https://x.test/b.jpg", title:"", sortOrder:1, pub:false },
];
const selCache = new Map();
function cachedSel(sel){ if(!selCache.has(sel)) selCache.set(sel, mkEl("div")); return selCache.get(sel); }

const sandbox = {
  console, URL, confirm(){ return true; },
  setTimeout(fn){ timers.push(fn); return 1; }, clearTimeout(){},
  setInterval(){ return 1; }, clearInterval(){},
  AbortController: undefined,
  location: { href: "http://localhost:8081/", protocol: "http:", search: "" },
  navigator: {},
  sessionStorage: { getItem(){ return null; }, setItem(){}, removeItem(){} },
  localStorage: {
    getItem: k => store.has(k) ? store.get(k) : null,
    setItem: (k,v) => store.set(k, String(v)), removeItem: k => store.delete(k),
  },
  matchMedia(){ return { matches:false, addListener(){}, addEventListener(){} }; },
  addEventListener(){}, removeEventListener(){},
  requestAnimationFrame(fn){ return null; }, scrollTo(){}, scrollY: 0,
  getComputedStyle(){ return { getPropertyValue(){ return ""; } }; },
  FormData: class { constructor(){ this.parts = {}; } append(k,v){ this.parts[k] = v; } },
  fetch(raw, opts = {}){
    const url = String(raw), m = opts.method || "GET";
    let data = { ok:true, status:200, text:"{}" };
    if(url.endsWith("/lms?klass=X")) data.text = JSON.stringify({ entries: [] });
    else if(url.endsWith("/auth/me")) data.text = JSON.stringify({ user: { username:"admin" } });
    else if(url.endsWith("/lms/all")) data.text = JSON.stringify({ entries: [] });
    else if(url.endsWith("/sliders")) data.text = JSON.stringify({ sliders });
    else if(url.endsWith("/sliders/all")) data.text = JSON.stringify({ sliders });
    else if(url.endsWith("/sliders/s1")&&m==="DELETE") data.text = JSON.stringify({ ok:true });
    else if(url.includes("/sliders")&&m==="POST") data.text = JSON.stringify({ slider:{ id:"s3", imageUrl:"/api/uploads/c.jpg", title:"Baru", sortOrder:2, pub:true } });
    else if(url.endsWith("/sliders/s1")) data.text = JSON.stringify({ slider: sliders[0] });
    return Promise.resolve({ ok:data.ok, status:data.status, text: () => Promise.resolve(data.text) });
  },
  document: {
    getElementById: byId,
    querySelector(sel){
      if (sel === "main.gut") return cachedSel("main.gut");
      if (sel === ".hero") return byId("intro");
      const c = cachedSel(sel);
      c.appendChild = function(el){ (this.kids || (this.kids = [])).push(el); };
      return c;
    },
    querySelectorAll(){ return []; },
    createElement(tag){ return mkEl(tag); },
    createDocumentFragment(){ const f = { __frag: true, kids: [], appendChild(c){ f.kids.push(c); } }; return f; },
    createTextNode(t){ return { textContent: String(t) }; },
    addEventListener(){} ,
    body: mkEl("body"),
    documentElement: mkEl("html"),
  },
  metaTheme: null,
};
sandbox.window = sandbox; // portal memakai window.matchMedia dsb
sandbox.window.window = sandbox;
sandbox.window._apiUser = { username: "admin" };
sandbox.window.LMS_API_BASE = "/api";
/* Siap isi hero seperti halaman aslinya */
byId("portal-title").textContent = "Selamat datang di Portal LMS";
const ctx = vm.createContext(sandbox);

function run(f){ vm.runInContext(fs.readFileSync(f, "utf8"), ctx, { filename: f }); }
try { run(path.join(ROOT, "assets/icons.js")); } catch(e){ console.log("SYNC THROW icons: " + e.message); process.exit(1); }
try { run(path.join(ROOT, "assets/api-client.js")); } catch(e){ console.log("SYNC THROW api-client: " + e.message); process.exit(1); }
try { run(path.join(ROOT, "assets/portal.js")); } catch(e){ console.log("SYNC THROW portal: " + e.message); process.exit(1); }

setTimeout(() => {   /* beri kesempatan promise chain beres */
  const stage = byId("slider-stage"), dots = byId("slider-dots"),
        skl = byId("sk-list"), slider = byId("slider");
  const kids = cachedSel("main.gut").kids || [];
  const heroDots = kids.find(k => k.className === "hero-dots");
  if(!heroDots) fails.push("dot-grid tidak dibangun di belakang hero");
  else if(!heroDots.kids || heroDots.kids.length !== 150) fails.push("dot-grid jumlah titik salah: " + ((heroDots.kids || []).length));
  const titleText = (byId("portal-title").textContent || "").trim();
  const wrapped = (byId("portal-title").kids || []).some(s => s.className === "w");
  if(!wrapped) fails.push("kaskade kata tidak membungkus judul");
  else if(titleText) fails.push("teks asli judul tidak dibersihkan — judul tampil dobel: " + titleText);
  if(!(stage.innerHTML.indexOf("slider-slide") >= 0)) fails.push("slider-stage tidak merender slide");
  if(!(stage.innerHTML.indexOf("/api/uploads/a.webp") >= 0)) fails.push("slide img hilang");
  if(!(dots.innerHTML.indexOf("data-sl=\"0\"") >= 0)) fails.push("dots tidak dirender");
  const count = byId("sk-count").textContent || "";
  if(!(count.indexOf("2 foto") >= 0 && count.indexOf("1 tampil") >= 0)) fails.push("sk-count salah: " + count);
  if(!(skl.innerHTML.indexOf("sk-row") >= 0)) fails.push("sk-list tidak merender baris");
  if(!(skl.innerHTML.indexOf("sk-off-ic") >= 0)) fails.push("arsip foto tak diberi tanda eye-off");
  if(slider.hidden !== false) fails.push("slider tetap hidden");
  if(fails.length){ for(const f of fails) console.log("FAIL " + f); process.exit(1); }
  console.log("PORTAL SMOKE OK — slider & kelola foto merender tanpa error");
});
