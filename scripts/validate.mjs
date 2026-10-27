#!/usr/bin/env node
/* Validasi skema data LMS: node scripts/validate.mjs [data/*.js ...]
   Default: semua data/*.js kecuali registry.js */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [], warns = [];
const E = (f, m) => errors.push(`${f}: ${m}`);
const W = (f, m) => warns.push(`${f}: ${m}`);

function loadContent(file){
  const src = fs.readFileSync(file, "utf8");
  const window = {};
  try{ vm.runInNewContext(src, { window }, { timeout: 5000 }); }
  catch(e){ return { err: `eval gagal: ${e.message}` }; }
  if(!window.LMS_CONTENT) return { err: "window.LMS_CONTENT tidak terdefinisi" };
  return { M: window.LMS_CONTENT };
}

const isStr = x => typeof x === "string" && x.trim().length > 0;
const isArr = (x, n=1) => Array.isArray(x) && x.length >= n;
const isNum = x => typeof x === "number" && Number.isFinite(x);

function checkItems(f, label, arr, min){
  if(!isArr(arr, min)){ E(f, `${label}: minimal ${min}, dapat ${Array.isArray(arr)?arr.length:"bukan array"}`); return; }
  arr.forEach((it, i) => {
    if(!it || typeof it !== "object"){ E(f, `${label}[${i}] bukan object`); return; }
    // soal pilihan ganda pakai q; soal gim memakai p (prompt)
    if(!isStr(it.q) && !isStr(it.p)) E(f, `${label}[${i}] tanpa q/p`);
    if(it.num !== undefined){
      // num = penanda soal isian (boolean true atau angka); ans wajib angka
      if(!isNum(it.ans)) E(f, `${label}[${i}].ans bukan angka (soal num)`);
    }else{
      if(!isArr(it.o, 2)) E(f, `${label}[${i}].o < 2`);
      else if(!Number.isInteger(it.a) || it.a < 0 || it.a >= it.o.length)
        E(f, `${label}[${i}].a=${it.a} di luar rentang 0..${it.o.length-1}`);
    }
  });
}

function validate(id, M, f){
  const meta = M.meta;
  if(!meta){ E(f, "meta hilang"); return; }
  for(const k of ["id","name","short","emoji","color","kelas","fase","sekolah","lsKey",
                  "quote","note","rasional","refText","botName","botIntro","about","logoText"])
    if(!isStr(meta[k])) E(f, `meta.${k} kosong`);
  if(meta.id !== id) E(f, `meta.id "${meta.id}" != file "${id}"`);
  for(const k of ["moto","sideMoto"]) if(!(Array.isArray(meta[k]) && meta[k].length === 3 && meta[k].every(isStr)))
    E(f, `meta.${k} harus array 3 string`);
  if(!(Array.isArray(meta.botQuick) && meta.botQuick.length >= 3 && meta.botQuick.every(isStr)))
    E(f, "meta.botQuick minimal 3 string");
  if(!isArr(meta.scene, 1)) E(f, "meta.scene minimal 1");
  else if(meta.scene.length > 4) E(f, "meta.scene maksimal 4");
  else meta.scene.forEach((s,i)=>{ if(!isStr(s)) E(f, `meta.scene[${i}] kosong`); });
  if(meta.sceneExtra !== undefined && !isStr(meta.sceneExtra)) E(f, "meta.sceneExtra harus string");
  if(!isNum(M.KKTP) || M.KKTP < 1 || M.KKTP > 100) E(f, "KKTP tidak valid");

  // ELEMENTS
  if(!isArr(M.ELEMENTS, 1) || M.ELEMENTS.length > 5) E(f, "ELEMENTS harus 1..5");
  else M.ELEMENTS.forEach((e,i) => {
    if(e.id !== i+1) E(f, `ELEMENTS[${i}].id = ${e.id}, harus ${i+1}`);
    if(!isStr(e.name) || !isStr(e.emoji) || !isStr(e.desc)) E(f, `ELEMENTS[${i}] field kurang`);
  });
  const elIds = new Set((M.ELEMENTS||[]).map(e => e.id));

  // UNITS
  const U = M.UNITS;
  if(!isArr(U, 4)) E(f, "UNITS minimal 4");
  else {
    U.forEach((u, i) => {
      const n = i + 1, L = `UNITS[${i}](n=${u.n})`;
      if(u.n !== n) E(f, `${L}: n harus ${n}`);
      if(!elIds.has(u.el)) E(f, `${L}: el=${u.el} tidak ada di ELEMENTS`);
      if(u.sem !== 1 && u.sem !== 2) E(f, `${L}: sem harus 1|2`);
      for(const k of ["title","emoji","desc","model","task","disc"])
        if(!isStr(u[k])) E(f, `${L}: ${k} kosong`);
      if(!isArr(u.tp, 2)) E(f, `${L}: tp minimal 2`);
      else u.tp.forEach((t,j) => { if(!isStr(t.c) || !isStr(t.t) || !isStr(t.e)) E(f, `${L}.tp[${j}] field kurang`); });
      if(!isArr(u.focus, 1)) E(f, `${L}: focus minimal 1`);
      else u.focus.forEach((x,j) => { if(!Array.isArray(x) || x.length !== 2 || !isStr(x[0]) || !isStr(x[1])) E(f, `${L}.focus[${j}] harus [k,v]`); });
      checkItems(f, `${L}.diag`, u.diag, 3);
      checkItems(f, `${L}.form`, u.form, 5);
      checkItems(f, `${L}.quiz`, u.quiz, 5);
      if(!isArr(u.meet, 3)) E(f, `${L}: meet minimal 3`);
      else if(u.meet.length !== 3) W(f, `${L}: meet = ${u.meet.length} (ideal 3)`);
      else u.meet.forEach((m,j) => { if(!isStr(m.jp) || !isStr(m.topic) || !isStr(m.act)) E(f, `${L}.meet[${j}] field kurang`); });
      const p = u.proj;
      if(!p || !isStr(p.title)) E(f, `${L}: proj.title kosong`);
      else{
        if(!isArr(p.steps, 3)) E(f, `${L}: proj.steps minimal 3`);
        if(!isArr(p.rub, 2)) E(f, `${L}: proj.rub minimal 2`);
        else p.rub.forEach((r,j) => { if(!Array.isArray(r) || r.length !== 2 || !isStr(r[0]) || !isStr(r[1])) E(f, `${L}.proj.rub[${j}] harus [k,v]`); });
      }
      if(!isArr(u.refl, 3)) E(f, `${L}: refl minimal 3`);
    });
    const sem1 = U.filter(u => u.sem === 1).length, sem2 = U.length - sem1;
    if(!sem1 || !sem2) E(f, "UNITS harus ada sem 1 dan sem 2");
  }

  // EXAM
  const X = M.EXAM;
  if(!X) E(f, "EXAM hilang");
  else for(const k of ["uts","uas"]){
    const x = X[k];
    if(!x) { E(f, `EXAM.${k} hilang`); continue; }
    if(!isStr(x.title) || !isStr(x.desc)) E(f, `EXAM.${k}: title/desc kosong`);
    if(!isNum(x.time) || !isNum(x.min)) E(f, `EXAM.${k}: time/min bukan angka`);
    checkItems(f, `EXAM.${k}.q`, x.q, 8);
  }
  checkItems(f, "EXAM.rem", X?.rem, 6);

  // GAMES
  if(!isArr(M.GAMES, 2)) E(f, "GAMES minimal 2");
  else{
    const gids = new Set();
    M.GAMES.forEach((g,i) => {
      if(!isStr(g.id) || gids.has(g.id)) E(f, `GAMES[${i}].id duplikat/kosong: ${g.id}`);
      gids.add(g.id);
      for(const k of ["name","emoji","desc"]) if(!isStr(g[k])) E(f, `GAMES[${i}].${k} kosong`);
      if(!elIds.has(g.el)) E(f, `GAMES[${i}].el=${g.el} tidak valid`);
      if(!isArr(g.levels, 3)) E(f, `GAMES[${i}]: levels minimal 3 (dapat ${g.levels?.length})`);
      else g.levels.forEach((l,j) => {
        if(!isStr(l.name)) E(f, `GAMES[${i}].levels[${j}].name kosong`);
        checkItems(f, `GAMES[${i}].levels[${j}].q`, l.q, 5);
      });
    });
  }

  // LABS
  if(!isArr(M.LABS, 2)) E(f, "LABS minimal 2");
  else{
    const lids = new Set();
    M.LABS.forEach((l,i) => {
      if(!isStr(l.id) || lids.has(l.id)) E(f, `LABS[${i}].id duplikat/kosong`);
      lids.add(l.id);
      for(const k of ["name","emoji","desc"]) if(!isStr(l[k])) E(f, `LABS[${i}].${k} kosong`);
      if(!elIds.has(l.el)) E(f, `LABS[${i}].el=${l.el} tidak valid`);
      const t = l.type || (["labgraf","labtrigo","labstat"].includes(l.id) ? "sim" : l.id === "labseq" ? "seq" : null);
      if(t === "seq"){
        // id labseq tanpa steps sah — pakai SEQ_STEPS bawaan engine
        if(Array.isArray(l.steps) && l.steps.length){
          if(l.steps.length < 4) E(f, `LABS[${i}] type=seq steps < 4`);
          else l.steps.forEach((s,j) => { if(!isStr(s)) E(f, `LABS[${i}].steps[${j}] kosong`); });
        }else if(l.id !== "labseq") E(f, `LABS[${i}] type=seq butuh steps minimal 4 (atau pakai id labseq tanpa steps)`);
      }else if(t === "match"){
        if(!isArr(l.pairs, 4)) E(f, `LABS[${i}] type=match butuh pairs minimal 4`);
        else l.pairs.forEach((p,j) => {
          if(!Array.isArray(p) || p.length !== 2 || !isStr(p[0]) || !isStr(p[1])) E(f, `LABS[${i}].pairs[${j}] harus [k,v] string`);
        });
      }else if(t === "timeline"){
        if(!isArr(l.events, 4)) E(f, `LABS[${i}] type=timeline butuh events minimal 4`);
        else l.events.forEach((e,j) => { if(!isStr(e.t) || !isStr(e.y)) E(f, `LABS[${i}].events[${j}] butuh t & y`); });
      }else if(t === "sortbin"){
        if(!isArr(l.bins, 2)) E(f, `LABS[${i}] type=sortbin butuh bins minimal 2`);
        if(!isArr(l.items, 4)) E(f, `LABS[${i}] type=sortbin butuh items minimal 4`);
        else {
          const bids = new Set((l.bins || []).map(b => b.id));
          l.items.forEach((it,j) => { if(!isStr(it.t) || !bids.has(it.bin)) E(f, `LABS[${i}].items[${j}] t/bin tidak valid`); });
        }
      }else if(t === "map"){
        if(!isArr(l.ports, 4)) E(f, `LABS[${i}] type=map butuh ports minimal 4`);
        else l.ports.forEach((p,j) => { if(!isStr(p.id) || !isStr(p.name) || typeof p.x !== "number" || typeof p.y !== "number") E(f, `LABS[${i}].ports[${j}] id/name/x/y tidak valid`); });
      }else if(t === "timeslider"){
        if(typeof l.min !== "number" || typeof l.max !== "number" || l.max <= l.min) E(f, `LABS[${i}] type=timeslider butuh min/max angka`);
        if(!isArr(l.eras, 2)) E(f, `LABS[${i}] type=timeslider butuh eras minimal 2`);
        if(!isArr(l.events, 2)) E(f, `LABS[${i}] type=timeslider butuh events minimal 2`);
      }else if(t === "sim"){
        if(!["labgraf","labtrigo","labstat","labukur","labgerak","labenergi"].includes(l.id)) E(f, `LABS[${i}] sim id tidak dikenal: ${l.id}`);
      }else if(t === "info"){
        if(!isStr(l.hint) && !isStr(l.body)) W(f, `LABS[${i}] info tanpa hint/body`);
      }else E(f, `LABS[${i}].type tidak dikenal: ${l.type}`);
      if(!isStr(l.hint) && t !== "info") W(f, `LABS[${i}] tanpa hint`);
    });
  }

  // EBOOKS / GLOS / SUMBER
  if(!isArr(M.EBOOKS, 1)) E(f, "EBOOKS minimal 1");
  else M.EBOOKS.forEach((b,i) => {
    if(!isStr(b.id) || !isStr(b.title) || !isStr(b.emoji)) E(f, `EBOOKS[${i}] field kurang`);
    if(!isArr(b.pages, 2)) E(f, `EBOOKS[${i}]: pages minimal 2`);
    else b.pages.forEach((p,j) => { if(!isStr(p.h) || !isStr(p.t)) E(f, `EBOOKS[${i}].pages[${j}] field kurang`); });
  });
  if(!isArr(M.GLOS, 4)) E(f, "GLOS minimal 4");
  else M.GLOS.forEach((g,i) => { if(!Array.isArray(g) || g.length !== 2 || !isStr(g[0]) || !isStr(g[1])) E(f, `GLOS[${i}] harus [k,v]`); });
  if(!isArr(M.SUMBER, 2)) E(f, "SUMBER minimal 2");
  else M.SUMBER.forEach((s,i) => { if(!Array.isArray(s) || s.length !== 2 || !isStr(s[0]) || !isStr(s[1])) E(f, `SUMBER[${i}] harus [judul,deskripsi]`); });

  // FORUM / BOT
  if(!isArr(M.FORUM_SEED, 1)) E(f, "FORUM_SEED minimal 1");
  else M.FORUM_SEED.forEach((t,i) => {
    if(!isNum(t.id) || !isStr(t.title) || !isStr(t.body) || !isStr(t.who) || !isStr(t.av) || !isStr(t.time))
      E(f, `FORUM_SEED[${i}] field kurang`);
    if(!Array.isArray(t.replies)) E(f, `FORUM_SEED[${i}].replies bukan array`);
    else t.replies.forEach((r,j) => { if(!isStr(r.who) || !isStr(r.body) || !isStr(r.av) || !isStr(r.time)) E(f, `FORUM_SEED[${i}].replies[${j}] field kurang`); });
  });
  if(!isArr(M.BOT_RULES, 3)) E(f, "BOT_RULES minimal 3");
  else M.BOT_RULES.forEach((r,i) => {
    if(!Array.isArray(r) || r.length !== 2) E(f, `BOT_RULES[${i}] harus [regex, jawaban]`);
    else{
      // instanceof RegExp gagal lintas realm vm — pakai duck-typing
      if(!(r[0] && typeof r[0].test === "function" && typeof r[0].source === "string")) E(f, `BOT_RULES[${i}][0] bukan RegExp`);
      if(!isStr(r[1])) E(f, `BOT_RULES[${i}][1] kosong`);
    }
  });
  if(!isStr(M.BOT_FALLBACK)) E(f, "BOT_FALLBACK kosong");
}

// ---- registry cross-check ----
const regPath = path.join(ROOT, "data/registry.js");
let REG = [];
if(fs.existsSync(regPath)){
  const window = {};
  try{ vm.runInNewContext(fs.readFileSync(regPath, "utf8"), { window }, { timeout: 3000 }); REG = window.LMS_REGISTRY || []; }
  catch(e){ E("registry.js", `eval gagal: ${e.message}`); }
}else E("registry.js", "tidak ada");

const args = process.argv.slice(2);
function resolveArg(a){
  if(path.isAbsolute(a)) return a;
  const fromCwd = path.resolve(a);
  if(fs.existsSync(fromCwd)) return fromCwd;
  const fromRoot = path.join(ROOT, a);
  if(fs.existsSync(fromRoot)) return fromRoot;
  return fromCwd; // biarkan error ENOENT jelas di readFileSync
}
const files = args.length ? args.map(resolveArg)
  : fs.readdirSync(path.join(ROOT, "data")).filter(x => x.endsWith(".js") && x !== "registry.js")
      .map(x => path.join(ROOT, "data", x));

if(!files.length) E("(files)", "tidak ada file data untuk divalidasi");

for(const abs of files){
  const f = path.relative(ROOT, abs);
  const id = path.basename(abs, ".js");
  const r = loadContent(abs);
  if(r.err){ E(f, r.err); continue; }
  validate(id, r.M, f);

  // registry & shell cross-check
  const ent = REG.find(x => x.id === id);
  if(REG.length){
    if(!ent) E(f, `tidak terdaftar di data/registry.js`);
    else{
      if(ent.lsKey !== r.M.meta?.lsKey) E(f, `lsKey registry "${ent.lsKey}" != meta.lsKey "${r.M.meta?.lsKey}"`);
      if(ent.name !== r.M.meta?.name) W(f, `name registry "${ent.name}" != meta.name "${r.M.meta?.name}"`);
      if(ent.file && !fs.existsSync(path.join(ROOT, ent.file))) E(f, `shell ${ent.file} tidak ada`);
    }
  }
}

for(const m of warns) console.log("WARN  " + m);
for(const e of errors) console.log("ERROR " + e);
console.log(`\n${files.length} file · ${errors.length} error · ${warns.length} warning`);
process.exit(errors.length ? 1 : 0);
