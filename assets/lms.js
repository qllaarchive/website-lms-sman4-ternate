"use strict";
/* ================= KONTEN (diinjeksi oleh data/<mapel>.js) ================= */
const M = window.LMS_CONTENT;
if(!M){ throw new Error("LMS_CONTENT kosong - muat data/<mapel>.js sebelum assets/lms.js"); }
const META = M.meta || {};
const LS_KEY = META.lsKey || "lms_v1";
const KKTP = M.KKTP || 70;
const ELEMENTS = M.ELEMENTS, UNITS = M.UNITS, EXAM = M.EXAM, GAMES = M.GAMES,
  LABS = M.LABS, EBOOKS = M.EBOOKS, GLOS = M.GLOS, SUMBER = M.SUMBER,
  FORUM_SEED = M.FORUM_SEED, BOT_RULES = M.BOT_RULES, BOT_FALLBACK = M.BOT_FALLBACK;
const NU = UNITS.length;
const DIAG = n => UNITS[n-1].diag;
const FORM = n => UNITS[n-1].form;
const JP_U = META.jpUnit || 12, JP_M = META.jpMeet || 4;
const MT = UNITS.reduce((a,u) => a + ((u.meet && u.meet.length) || 0), 0);
const BOT_NAME = META.botName || ("Teman " + (META.short || "Pelajaran"));
const BOT_INTRO = META.botIntro || ("Halo! \ud83d\udc4b Saya " + BOT_NAME + ". Tanyakan materi, tips belajar, atau minta contoh soal.");
const QUICK = META.botQuick || ["cara belajar","tips","contoh soal","ringkasan","latihan"];
const MOTOS = META.moto || ["Belajar","Berlatih","Bertumbuh"];
const SIDE_MOTOS = META.sideMoto || MOTOS;
const HALF = Math.ceil(NU/2);

/* ================= STATE ================= */
const $ = id => document.getElementById(id);
function esc(s){ return String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }
const D = { nama:"", kelas:"", sekolah:"SMAN 4 Ternate", tema:"", gs:"",
  u:{}, ex:{uts:0,uas:0,rem:0}, g:{}, lab:{}, seq:{},
  forum:null, chat:[{ who:"bot", t:BOT_INTRO }] };
/* Kode Web App Google Sheets permanen (guru) — di-override oleh ?gs= bila ada. */
const SHEET_URL_DEFAULT = META.sheetId || "AKfycbyp7tmtjjulW3rMhBN3h6nQnTtW2mxdqESfnDwrDtuVjfEgHjCBbvB5NBAinROsj_Lr";
function gsNorm(v){
  v = String(v || "").trim();
  const m = v.match(/\/macros\/s\/([^\/\s]+)/);
  return m ? m[1] : v;
}
function load(){ try{ const r = localStorage.getItem(LS_KEY); if(r) Object.assign(D, JSON.parse(r)); }catch(e){}
  if(D.kelas === "X") D.kelas = "";
  if(!D.gs && SHEET_URL_DEFAULT) D.gs = gsNorm(SHEET_URL_DEFAULT); }
function save(){ try{ const p = progAll(); D.sum = { pct: Math.round(p.d/p.t*100), d:p.d, t:p.t };
    localStorage.setItem(LS_KEY, JSON.stringify(D)); }catch(e){} }
function U(n){ if(!D.u[n]) D.u[n] = { materi:false, diag:0, form:0, quiz:0, refl:false, proj:false, meet:[false,false,false] }; return D.u[n]; }
function theme(){
  if(D.tema){ document.documentElement.dataset.theme = D.tema; return; }
  try{
    var t = localStorage.getItem("lms_theme");
    if(t === "light" || t === "dark"){ document.documentElement.dataset.theme = t; return; }
  }catch(e){}
  delete document.documentElement.dataset.theme;
}

/* progres */
const unitFlags = n => { const u = U(n); return [u.materi, u.diag>0, u.form>0, u.quiz>0, u.refl, u.proj, u.meet.every(Boolean)].filter(Boolean).length; };
const UNIT_TOT = 7;
function progAll(){ let d=0; for(let n=1;n<=NU;n++) d+=unitFlags(n);
  if(D.ex.uts>0)d++; if(D.ex.uas>0)d++; if(D.ex.rem>0)d++;
  return { d, t: NU*UNIT_TOT+3 }; }
function progUnit(n){ return Math.round(unitFlags(n)/UNIT_TOT*100); }
function allScores(n){ const u=U(n); return [u.diag,u.form,u.quiz].filter(x=>x>0); }
function avgUnit(n){ const a=allScores(n); return a.length? Math.round(a.reduce((s,x)=>s+x,0)/a.length) : 0; }

/* toast */
let toastT = null;
function toast(msg){ const old = document.querySelector(".toast"); if(old) old.remove();
  const t = document.createElement("div"); t.className = "toast"; t.textContent = msg; document.body.appendChild(t);
  clearTimeout(toastT); toastT = setTimeout(()=>t.remove(), 2600); }

/* ================= NAV & ROUTER ================= */
const NAV = [
  ["home","🏠","Beranda"],["courses","📚","Mata Pelajaran"],["path","🗺️","Alur Belajar"],
  ["lab","🧪","Lab Maya"],["game","🎮","Gim Edukatif"],["ebook","📗","Buku Digital"],
  ["assign","📌","Tugas"],["quiz","✅","Asesmen"],["forum","💬","Diskusi"],
  ["grades","📈","Nilai"],["res","📎","Sumber Belajar"],["bot","🤖",BOT_NAME],["set","⚙️","Pengaturan"]
];
const VIEWS = {};
const BIND = {};
let VIEW = { name:"home", arg:null, arg2:null };
function go(name, arg, arg2){ VIEW = { name, arg, arg2 }; render(); window.scrollTo(0,0); }
function navActive(v){ if(v==="unit")return "courses"; if(v==="exam")return "quiz"; return v; }
function renderNav(){
  $("nav").innerHTML = NAV.map(([id,ic,lb]) =>
    `<button data-nav="${id}" class="${navActive(VIEW.name)===id?"on":""}"><span>${ic}</span>${lb}</button>`).join("");
  $("nav").querySelectorAll("[data-nav]").forEach(b => b.onclick = () => { go(b.dataset.nav); play("klik"); });
}
let soundOn = true;
function play(kind){ if(!soundOn) return; try{
    const AC = window.AudioContext || window.webkitAudioContext; if(!AC) return;
    const ctx = play.ctx || (play.ctx = new AC());
    const o = ctx.createOscillator(), g = ctx.createGain(); o.connect(g); g.connect(ctx.destination);
    const f = { klik:660, benar:880, salah:220, bintang:1046 }[kind] || 660;
    o.frequency.value = f; o.type = kind==="salah" ? "square" : "sine";
    g.gain.setValueAtTime(.05, ctx.currentTime); g.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime+.16);
    o.start(); o.stop(ctx.currentTime+.16);
  }catch(e){} }
function render(){
  renderNav();
  const m = $("main");
  const fn = VIEWS[VIEW.name] || VIEWS.home;
  m.innerHTML = fn(VIEW.arg, VIEW.arg2);
  m.classList.remove("anim-in"); void m.offsetWidth; m.classList.add("anim-in");
  (BIND[VIEW.name] || (()=>{}))(VIEW.arg, VIEW.arg2);
}

/* ================= HOME ================= */
/* ---- Pengumuman: isi data siswa (absen digital) ---- */
function pengumumanCard(){
  if(D.nama && D.kelas) return "";
  let phr = "Nama & kelas dipakai untuk absen digital — kehadiranmu tercatat saat skormu terkirim ke spreadsheet guru. Tanpa data ini, barismu tampil '-' dan tidak dihitung hadir. <b>Cukup sekali diisi per perangkat.</b>";
  try{ if(typeof META !== "undefined" && META && META.announce) phr = esc(String(META.announce)); }catch(e){}
  return `<div class="announce" id="ann-card">
    <div class="ann-ic" aria-hidden="true">📢</div>
    <div class="ann-txt">
      <p class="ann-eyebrow">Pengumuman guru</p>
      <h2>Isi data siswa agar kehadiranmu dihitung</h2>
      <p class="small muted">${phr}</p>
      <div class="row ann-act">
        <button class="btn sm" data-qa="set">⚙️ Isi data sekarang</button>
      </div>
    </div>
  </div>`;
}
VIEWS.home = () => {
  const p = progAll(), pct = Math.round(p.d/p.t*100);
  const name = D.nama || "Murid Kelas X";
  const nextU = nextUnitN();
  const un = UNITS[nextU-1];
  const tiles = [["courses","📚","Mata Pelajaran"],["path","🗺️","Alur Belajar"],["quiz","✅","Asesmen"],
    ["lab","🧪","Lab"],["game","🎮","Gim"],["assign","📌","Tugas"],["grades","📈","Nilai"]];
  const useAcc = META.homeLayout === "accordion";
  const openEl = un ? un.el : 1;
  const cols = ELEMENTS.map(e => {
    const us = UNITS.filter(u => u.el === e.id);
    if(useAcc){
      const open = e.id === openEl;
      return `<div class="eacc e${e.id}${open ? " open" : ""}" data-el="${e.id}">
        <button class="eacc-h" aria-expanded="${open}">
          <span class="bub">${e.emoji}</span>
          <span class="eacc-t"><small>ELEMEN ${e.id} · ${us.length} UNIT</small><b>${esc(e.name)}</b></span>
          <span class="eacc-chev">▾</span>
        </button>
        <div class="eacc-body"><div class="ulist">${us.map(u => ucard(u)).join("")}</div></div>
      </div>`;
    }
    return `<div class="col e${e.id}">
      <div class="col-h"><span class="bub">${e.emoji}</span>
        <div><small>ELEMEN ${e.id} · ${us.length} UNIT</small><h3>${esc(e.name)}</h3></div></div>
      <div class="ulist">${us.map(u => ucard(u)).join("")}</div></div>`;
  }).join("");
  const C = [
    ["🗓️","Kalender belajar", `<div class="cal"><ul>${calItems()}</ul></div>`],
    ["⚡","Langkah cepat", `<ul class="ql">
      <li><button data-qa="next"><span>▶</span>Lanjut ${esc(un.title)}</button></li>
      <li><button data-qa="q-diag"><span>🩺</span>Asesmen diagnostik</button></li>
      <li><button data-qa="lab"><span>🧪</span>Buka Lab Maya</button></li>
      <li><button data-qa="bot"><span>🤖</span>Tanya ${BOT_NAME}</button></li></ul>`],
    ["🎯","Info nilai", `<div class="ring-wrap">
      <svg class="ring" viewBox="0 0 100 100">${ringSVG(pct)}</svg>
      <div><b style="font:800 26px var(--display)">${pct}%</b>
      <div class="small muted">${p.d} dari ${p.t} penyelesaian</div>
      <div class="bar" style="margin-top:8px"><i style="width:${pct}%"></i></div></div></div>
      <div class="stat2"><div><span class="eyebrow">Rerata Unit</span><b>${avgAll()}</b></div>
      <div><span class="eyebrow">KKTP</span><b>${KKTP}</b></div></div>`],
  ];
  return `<div class="home">
    <div class="stack">${pengumumanCard()}
      <div class="card welcome">
        <span class="globe">${META.emoji}</span>
        <div class="txt"><h2>Selamat datang, ${esc(name.split(" ")[0])}!</h2>
          <p class="muted" style="margin-top:6px">Lanjutkan belajarmu: <b>${esc(un.title)}</b> (Unit ${un.n} · Elemen ${un.el}).
          Progres semester ini ${pct}%.</p>
          <div class="row" style="margin-top:10px"><button class="btn" data-qa="next">Lanjut belajar →</button>
          <button class="btn ghost" data-qa="courses">Lihat semua unit</button></div></div>
        <div class="quote">${esc(META.quote || "")}</div>
      </div>
      <div class="card pad cp-card">
        <div class="sec-h" style="margin-bottom:10px"><span class="ic">🎯</span><h2>Capaian Pembelajaran · ${esc(META.fase || "Fase E")}</h2></div>
        <p class="small" style="margin-bottom:8px">${esc(META.rasional || META.note || "")}</p>
        ${META.refText ? `<p class="small muted">Referensi: ${esc(META.refText)}</p>` : ""}
      </div>
      <div class="tiles">${tiles.map(([v,ic,lb]) =>
        `<button class="tile" data-qa="${v}"><span class="ti">${ic}</span>${lb}</button>`).join("")}</div>
      <div class="sec-h"><span class="ic">📖</span><h2>Alur Belajar per Elemen</h2>
        <span class="right pill">${META.fase} · ${ELEMENTS.length} elemen · ${NU} unit</span></div>
      <div class="${useAcc ? "eacc-grid" : "cols"}">${cols}</div>
      <div class="card pad">
        <div class="sec-h" style="margin-bottom:10px"><span class="ic">🩺</span><h2>Asesmen Cepat</h2></div>
        <div class="grid3">
          <button class="btn ghost" data-qa="q-diag">Asesmen Diagnostik Unit ${nextU}</button>
          <button class="btn ghost" data-qa="q-form">Formatif Unit ${nextU}</button>
          <button class="btn ghost" data-qa="q-uts">Latihan UTS</button>
        </div>
      </div>
    </div>
    <aside class="rail">${C.map(([ic,t,b]) =>
      `<div class="card pad"><div class="sec-h" style="margin-bottom:10px"><span class="ic">${ic}</span><h2 style="font-size:18px">${t}</h2></div>${b}</div>`).join("")}
      <div class="card rail-moto">${esc(SIDE_MOTOS[0])}<br>${esc(SIDE_MOTOS[1])}<br>${esc(SIDE_MOTOS[2])}</div>
    </aside></div>`;
};
BIND.home = () => {
  document.querySelectorAll("[data-qa]").forEach(b => b.onclick = () => {
    const v = b.dataset.qa; play("klik");
    if(v === "next") go("unit", nextUnitN(), "materi");
    else if(v === "q-diag") go("quiz","diag",nextUnitN());
    else if(v === "q-form") go("quiz","form",nextUnitN());
    else if(v === "q-uts") go("quiz","sum",1);
    else go(v);
  });
  document.querySelectorAll(".eacc-h").forEach(b => b.onclick = () => {
    const item = b.closest(".eacc");
    const open = item.classList.toggle("open");
    b.setAttribute("aria-expanded", open);
    play("klik");
  });
};
function nextUnitN(){ for(let n=1;n<=NU;n++) if(unitFlags(n) < UNIT_TOT) return n; return NU; }
function avgAll(){ const a = []; for(let n=1;n<=NU;n++) a.push(...allScores(n));
  if(!a.length) return "—"; return Math.round(a.reduce((s,x)=>s+x,0)/a.length); }
function ringSVG(pct){
  const r = 42, c = 2*Math.PI*r;
  return `<circle cx="50" cy="50" r="${r}" fill="none" stroke="var(--line)" stroke-width="10"/>
    <circle cx="50" cy="50" r="${r}" fill="none" stroke="var(--good)" stroke-width="10" stroke-linecap="round"
      stroke-dasharray="${c}" stroke-dashoffset="${c*(1-pct/100)}" transform="rotate(-90 50 50)"/>
    <text x="50" y="56" text-anchor="middle" font-size="20" font-weight="800" fill="var(--ink)" font-family="Baloo 2">${pct}%</text>`;
}
function ucard(u){
  const pr = progUnit(u.n), done = pr >= 100;
  const best = avgUnit(u.n);
  return `<button class="ucard" data-unit="${u.n}">
    <span class="th"><span class="no">${u.n}</span>${u.emoji}</span>
    <span><h4>${esc(u.title)}</h4><p>${esc(u.desc)}</p>
      <span class="meta"><span>📘 ${u.tp.length} TP</span><span>⏱ ${JP_U} JP</span>${best?`<span>⭐ ${best}</span>`:""}</span>
      <span class="mini"><i style="width:${pr}%"></i></span></span>
    <span class="chev">${done?"✅":"›"}</span></button>`;
}
function calItems(){
  const t1 = Math.ceil(HALF/2), t2 = HALF + Math.ceil((NU-HALF)/2);
  const items = [
    ["bad","Tenggat","Proyek unit berjalan dikumpulkan setiap Jumat"],
    ["e1","Minggu 1–6",`Unit 1–${t1} · Semester Ganjil`],
    ["e2","Minggu 7–13",`Unit ${t1+1}–${HALF} · persiapan UTS`],
    ["e1","Minggu 14","UTS Semester Ganjil"],
    ["e3","Minggu 15–24",`Unit ${HALF+1}–${t2} · Semester Genap`],
    ["e4","Minggu 25–35",`Unit ${t2+1}–${NU} · persiapan UAS`],
    ["e4","Minggu 36","UAS Semester Genap"]
  ];
  return items.map(([k,w,t]) => `<li><span class="dot ${k}"></span><span><b class="small">${w}</b><br><span class="small muted">${t}</span></span></li>`).join("");
}

/* ================= MY COURSES ================= */
let courseSem = 0;
VIEWS.courses = () => {
  const list = UNITS.filter(u => !courseSem || u.sem === courseSem);
  return `<div class="stack">
    <div class="sec-h"><span class="ic">📚</span><h2>Mata Pelajaran — ${NU} Unit ${META.short} X</h2>
      <span class="right row">${[0,1,2].map(s => `<button class="btn sm ${courseSem===s?"":"ghost"}" data-sem="${s}">${s?s+" Semester":"Semua"}</button>`).join("")}</span></div>
    <div class="grid2">${list.map(u => `<div class="card pad" style="border-left:5px solid var(--e${u.el})">
      <div class="row" style="justify-content:space-between">
        <div class="row"><span style="font-size:34px">${u.emoji}</span>
          <div><span class="eyebrow">UNIT ${u.n} · SEMESTER ${u.sem} · ${JP_U} JP</span>
          <h3 style="font-size:19px">${esc(u.title)}</h3></div></div>
        <span class="pill e${u.el}">E${u.el} ${ELEMENTS[u.el-1].emoji}</span></div>
      <p class="muted small" style="margin-top:8px">${esc(u.desc)}</p>
      <div class="estrip" style="margin-top:8px">${u.tp.map(t=>`<span class="pill">🎯 ${t.c}</span>`).join("")}</div>
      <div class="mini" style="margin-top:10px"><i style="width:${progUnit(u.n)}%"></i></div>
      <div class="row" style="margin-top:10px">
        <button class="btn sm" data-open="${u.n}">Buka unit →</button>
        <span class="small muted">${progUnit(u.n)}% selesai${avgUnit(u.n)?` · rata-rata ${avgUnit(u.n)}`:""}</span></div>
    </div>`).join("")}</div></div>`;
};
BIND.courses = () => {
  document.querySelectorAll("[data-sem]").forEach(b => b.onclick = () => { courseSem = +b.dataset.sem; render(); });
  document.querySelectorAll("[data-open]").forEach(b => b.onclick = () => { go("unit", +b.dataset.open, "tujuan"); play("klik"); });
  document.querySelectorAll("[data-unit]").forEach(b => b.onclick = () => { go("unit", +b.dataset.unit, "tujuan"); play("klik"); });
};

/* ================= LEARNING PATH ================= */
VIEWS.path = () => {
  const rows = UNITS.map(u => `<tr>
    <td class="num"><b>${u.n}</b></td><td>${u.sem===1?"Ganjil":"Genap"}</td>
    <td>${u.emoji} ${esc(u.title)}</td>
    <td><span class="pill e${u.el}">E${u.el}</span><br><span class="small">${esc(ELEMENTS[u.el-1].name)}</span></td>
    <td class="num">${JP_U}</td>
    <td>${u.tp.map(t=>`<div><b class="small">${t.c}</b> — <span class="small">${esc(t.t)}</span></div>`).join("")}</td>
    <td class="num">${progUnit(u.n)}%</td></tr>`).join("");
  return `<div class="stack">
    <div class="sec-h"><span class="ic">🗺️</span><h2>Alur Belajar / ATP ${META.short} ${META.fase}</h2>
      <span class="right pill good">${MT} pertemuan × ${JP_M} JP = ${MT*JP_M} JP</span></div>
    <div class="card pad" style="background:var(--e2bg);border-color:var(--e2line)">
      <b>Rasional CP:</b> <span class="small">${esc(META.rasional || "")}</span></div>
    <div class="card tbl-wrap"><table>
      <thead><tr><th>No</th><th>Sem</th><th>Unit</th><th>Elemen</th><th>JP</th><th>Tujuan Pembelajaran</th><th>Progres</th></tr></thead>
      <tbody>${rows}</tbody></table></div>
    <div class="grid2">
      <div class="card pad"><div class="sec-h" style="margin-bottom:8px"><span class="ic">🎯</span><h2 style="font-size:18px">Distribusi Elemen</h2></div>
        ${ELEMENTS.map(e=>{const n=UNITS.filter(u=>u.el===e.id).length; const w=Math.round(n/NU*100);
          return `<div class="chart" style="border:0;padding:6px 0"><div class="r"><span>E${e.id} ${esc(e.name)}</span>
            <span class="tr"><span class="b" style="width:${w}%;background:var(--e${e.id})"></span></span><span class="v">${n}u</span></div></div>`;}).join("")}
      </div>
      <div class="card pad"><div class="sec-h" style="margin-bottom:8px"><span class="ic">🧾</span><h2 style="font-size:18px">Komposisi Penilaian</h2></div>
        <table><tbody>
          <tr><td>Asesmen Diagnostik</td><td class="num">${DIAG(1).length} soal/unit</td></tr>
          <tr><td>Formatif</td><td class="num">${FORM(1).length} soal/unit</td></tr>
          <tr><td>Kuis Unit</td><td class="num">${UNITS[0].quiz.length} soal/unit</td></tr>
          <tr><td>UTS / UAS</td><td class="num">${EXAM.uts.q.length} soal (${EXAM.uts.time} menit)</td></tr>
          <tr><td>Remedial</td><td class="num">${EXAM.rem.length} soal (skor ≥ ${KKTP})</td></tr>
          <tr><td>Proyek &amp; Refleksi</td><td class="num">1/unit</td></tr>
        </tbody></table></div>
    </div></div>`;
};
BIND.path = () => {};
/* ================= UNIT VIEW (8 tab) ================= */
const UTABS = [["tujuan","🎯","Tujuan"],["awal","🩺","Asesmen Awal"],["materi","📗","Materi"],
  ["meet","🗓️","Pertemuan"],["form","✍️","Formatif"],["kuis","🏁","Kuis Unit"],["game","🎮","Gim"],
  ["proj","🛠️","Proyek"],["refl","🪞","Refleksi"]];
function hl(s){ return esc(s).replace(/\[\[(.+?)\]\]/g, '<span class="hl">$1</span>'); }
VIEWS.unit = (n, tab) => {
  n = +n || 1; tab = tab || "tujuan";
  const u = UNITS[n-1], st = U(n), e = ELEMENTS[u.el-1];
  const body = {
    tujuan: () => `<div class="stack">
      <div class="card pad"><span class="eyebrow">UNIT ${u.n} · ELEMEN ${u.el} ${e.emoji} · SEMESTER ${u.sem} · ${JP_U} JP (${u.meet.length} × ${JP_M} JP)</span>
        <h2 style="margin-top:4px">${esc(u.title)}</h2>
        <p class="muted" style="margin-top:6px">${esc(u.desc)}</p></div>
      <div class="card pad"><div class="sec-h" style="margin-bottom:10px"><span class="ic">🎯</span><h2 style="font-size:19px">Tujuan Pembelajaran</h2></div>
        ${u.tp.map(t=>`<div class="tpcard"><div class="code">${t.c}</div><p>${esc(t.t)}</p>
          <div class="ex">Bukti: ${esc(t.e)}</div></div>`).join("")}</div>
      <div class="card pad"><div class="sec-h" style="margin-bottom:10px"><span class="ic">🧠</span><h2 style="font-size:19px">Fokus Konsep</h2></div>
        <div class="chips">${u.focus.map(f=>`<span class="chip e${u.el}"><b>${esc(f[0])}</b> · ${esc(f[1])}</span>`).join("")}</div></div></div>`,
    awal: () => `<div class="stack"><div class="card pad">
      <div class="sec-h" style="margin-bottom:6px"><span class="ic">🩺</span><h2 style="font-size:19px">Asesmen Diagnostik</h2>
        <span class="right pill">${st.diag?`Skor: ${st.diag}`:`${DIAG(n).length} soal · tanpa pengaruh nilai`}</span></div>
      <p class="muted small">Ukur kesiapan belajarmu sebelum materi dimulai. Hasil memicu rekomendasi.</p>
      <div id="qbox" style="margin-top:14px"></div></div>
      <div class="card pad"><div class="sec-h" style="margin-bottom:8px"><span class="ic">🧭</span><h2 style="font-size:19px">Hasil &amp; Rekomendasi</h2></div>
        ${diagResult(n)}</div></div>`,
    materi: () => `<div class="stack">
      <div class="card pad"><span class="eyebrow">MATERI · ${esc(e.name)}</span>
        <h2 style="margin-top:4px">${esc(u.title)}</h2>
        <p class="muted" style="margin-top:6px">${esc(u.desc)}</p></div>
      <div class="card pad"><div class="sec-h" style="margin-bottom:10px"><span class="ic">🗺️</span><h2 style="font-size:19px">Peta konsep</h2></div>
        <div class="chips">${u.focus.map(f=>`<span class="chip e${u.el}"><b>${esc(f[0])}</b> — ${esc(f[1])}</span>`).join("")}</div></div>
      <div class="card pad"><div class="sec-h" style="margin-bottom:10px"><span class="ic">✏️</span><h2 style="font-size:19px">Contoh model penyelesaian</h2></div>
        <div class="model e${u.el}">${hl(u.model)}</div></div>
      <div class="card pad"><div class="sec-h" style="margin-bottom:10px"><span class="ic">📖</span><h2 style="font-size:19px">Buku digital terkait</h2></div>
        <div class="grid3">${EBOOKS.map(bk=>`<button class="btn ghost" data-ebook="${bk.id}">${bk.emoji} ${esc(bk.title)}</button>`).join("")}</div></div>
      <div class="row"><button class="btn" data-mat-done="${n}">${st.materi?"✅ Materi ditandai selesai":"Tandai materi selesai"}</button></div></div>`,
    meet: () => `<div class="stack">${u.meet.map((m,i)=>`<div class="card pad">
      <div class="row" style="justify-content:space-between">
        <div><span class="eyebrow">PERTEMUAN ${i+1} · ${esc(m.jp)}</span><h3 style="font-size:18px">${esc(m.topic)}</h3></div>
        <button class="btn sm ${st.meet[i]?"good":"ghost"}" data-meet="${n}:${i}">${st.meet[i]?"✅ Tercentang":"Centang selesai"}</button></div>
      <div class="mlist"><span>• Kegiatan: ${esc(m.act)}</span></div></div>`).join("")}</div>`,
    form: () => `<div class="stack"><div class="card pad">
      <div class="sec-h" style="margin-bottom:6px"><span class="ic">✍️</span><h2 style="font-size:19px">Kuis Formatif</h2>
        <span class="right pill">${st.form?`Skor: ${st.form}`:`${FORM(n).length} soal · umpan balik langsung`}</span></div>
      <div id="qbox" style="margin-top:14px"></div></div></div>`,
    kuis: () => `<div class="stack"><div class="card pad">
      <div class="sec-h" style="margin-bottom:6px"><span class="ic">🏁</span><h2 style="font-size:19px">Kuis Sumatif Unit</h2>
        <span class="right pill ${st.quiz?"good":""}">${st.quiz?`Skor: ${st.quiz}`:`${u.quiz.length} soal · KKTP ${KKTP}`}</span></div>
      <p class="muted small">Kuis akhir unit: pilih jawaban yang paling tepat. Skor terbaik yang disimpan.</p>
      <div id="qbox" style="margin-top:14px"></div></div>
      <div class="card pad"><b class="small">Skor kuis unit &lt; ${KKTP}? Kerjakan ulang setelah mempelajari kembali tab Materi dan Lab terkait, atau ikuti remedial pada menu Asesmen.</b></div></div>`,
    game: () => `<div class="stack"><div class="card pad"><span class="eyebrow">GIM EDUKATIF · ELEMEN ${u.el}</span>
        <h2 style="margin-top:4px">Main sambil belajar ${esc(e.name)}</h2>
        <p class="muted small" style="margin-top:8px">Gim edukasi &amp; materi interaktif ${esc(META.short)} Kelas ${META.kelas || "X"} — dimainkan langsung di LMS.</p>
        <button class="btn" style="margin-top:12px" data-goto-game="1">🎮 Buka Gim Edukatif</button></div></div>`,
    proj: () => `<div class="stack">
      <div class="card pad"><div class="sec-h" style="margin-bottom:6px"><span class="ic">🛠️</span><h2 style="font-size:19px">Tugas &amp; Proyek</h2>
        <span class="right pill ${st.proj?"good":""}">${st.proj?"✅ Selesai":"Belum"}</span></div>
      <div class="task"><b>1. Tugas individual</b><p>${esc(u.task)}</p>
        <span class="small muted">Kumpulkan saat pertemuan 3 · dinilai dari ketepatan langkah.</span></div>
      <div class="task"><b>2. ${esc(u.proj.title)}</b>
        <ol class="steps">${u.proj.steps.map(s=>`<li>${esc(s)}</li>`).join("")}</ol></div>
      <div class="task"><b>Rubrik proyek</b><ul class="mlist">${u.proj.rub.map(r=>`<li>• ${esc(r[0])} — bobot ${esc(r[1])}</li>`).join("")}</ul></div>
      <div class="row" style="margin-top:12px"><button class="btn ${st.proj?"ghost":""}" data-proj="${n}">${st.proj?"✅ Tandai ulang":"Tandai proyek selesai"}</button></div></div>
      <div class="card pad"><div class="sec-h" style="margin-bottom:8px"><span class="ic">💬</span><h2 style="font-size:19px">Diskusi pemandu</h2></div>
        <p class="muted small">${esc(u.disc)}</p>
        <button class="btn ghost sm" style="margin-top:10px" data-goto-forum="1">Buka forum kelas →</button></div></div>`,
    refl: () => `<div class="stack"><div class="card pad">
      <div class="sec-h" style="margin-bottom:6px"><span class="ic">🪞</span><h2 style="font-size:19px">Refleksi Akhir Unit</h2>
        <span class="right pill ${st.refl?"good":""}">${st.refl?"✅ Selesai":"Isi 3 pertanyaan"}</span></div>
      <div id="reflbox">${u.refl.map((q,i)=>`<div class="refl-q"><b>${i+1}. ${esc(q)}</b>
        <textarea data-ri="${i}" rows="2" placeholder="Tulis jawabanmu..."></textarea></div>`).join("")}
        <button class="btn" id="refl-save" style="margin-top:10px">Kirim refleksi</button></div></div></div>`
  };
  return `<div class="stack">
    <div class="uhead e${u.el}">
      <button class="btn ghost sm" data-back="courses">← Semua unit</button>
      <div class="row" style="margin-top:8px"><span class="uemoji">${u.emoji}</span>
        <div><span class="eyebrow">UNIT ${u.n} · ${esc(e.name)}</span><h2>${esc(u.title)}</h2></div></div>
      <div class="mini" style="margin-top:10px"><i style="width:${progUnit(u.n)}%"></i></div>
      <span class="small">${progUnit(u.n)}% selesai</span></div>
    <div class="tabs">${UTABS.map(([id,ic,lb]) =>
      `<button class="${tab===id?"on":""}" data-tab="${id}">${ic} ${lb}${tabDone(st,id)?" ✓":""}</button>`).join("")}</div>
    ${body[tab] ? body[tab]() : body.tujuan()}</div>`;
};
function tabDone(st, id){
  return { tujuan:true, awal:st.diag>0, materi:st.materi, meet:st.meet.every(Boolean),
    form:st.form>0, kuis:st.quiz>0, game:false, proj:st.proj, refl:st.refl }[id];
}
function diagResult(n){
  const sc = U(n).diag; if(!sc) return `<p class="muted small">Belum mengerjakan. Diagnostik membantu guru memetakan kesiapanmu.</p>`;
  const ok = sc >= KKTP;
  return `<div class="res ${ok?"ok":"warn"}">
    <b>Skor ${sc}</b> — ${ok?`Kesiapanmu baik (${sc} ≥ ${KKTP}). Lanjut ke materi dengan percaya diri.`
      :`Skormu ${sc} < ${KKTP}. Jangan khawatir — baca ulang materi inti, gunakan Lab, lalu ulangi formatif.`}</div>`;
}
BIND.unit = (n, tab) => {
  n = +n || 1; const st = U(n);
  document.querySelectorAll("[data-tab]").forEach(b => b.onclick = () => { play("klik"); go("unit", n, b.dataset.tab); });
  document.querySelector("[data-back]")?.addEventListener("click", () => go("courses"));
  document.querySelectorAll("[data-ebook]").forEach(b => b.onclick = () => go("ebook", b.dataset.ebook));
  document.querySelector("[data-goto-forum]")?.addEventListener("click", () => go("forum"));
  document.querySelector("[data-mat-done]")?.addEventListener("click", e => {
    st.materi = !st.materi; save(); toast(st.materi ? "Materi selesai ✅" : "Status dibatalkan"); render(); });
  document.querySelectorAll("[data-meet]").forEach(b => b.onclick = () => {
    const [un,i] = b.dataset.meet.split(":").map(Number); const s = U(un);
    s.meet[i] = !s.meet[i]; save(); toast(s.meet[i] ? "Pertemuan ditandai ✅" : "Dibatalkan"); render(); });
  document.querySelector("[data-proj]")?.addEventListener("click", () => {
    st.proj = !st.proj; save(); toast(st.proj ? "Proyek selesai 🛠️" : "Status dibatalkan"); render(); });
  document.querySelector("#refl-save")?.addEventListener("click", () => {
    const tas = document.querySelectorAll("[data-ri]");
    if([...tas].some(t => !t.value.trim())) return toast("Jawab semua pertanyaan dulu 🙂");
    st.refl = true; save(); toast("Refleksi tersimpan 🪞"); render(); });
  if(tab === "awal") mountQuiz("qbox", DIAG(n), { title:"Asesmen Diagnostik", unit: n, done: !!st.diag,
    onScore: s => { st.diag = s; save(); },
    onDone: s => { toast(`Skor diagnostik: ${s}`); render(); } });
  if(tab === "form") mountQuiz("qbox", FORM(n), { title:"Kuis Formatif", unit: n, done: st.form > 0,
    onScore: s => { st.form = Math.max(st.form, s); save(); },
    onDone: s => { toast(`Skor formatif: ${s}`); render(); } });
  if(tab === "kuis") mountQuiz("qbox", UNITS[n-1].quiz, { title:"Kuis Unit", unit: n, done: st.quiz > 0,
    onScore: s => { st.quiz = Math.max(st.quiz, s); save(); },
    onDone: s => { toast(s >= KKTP ? `Kuis unit tuntas: ${s} 🎉` : `Skor kuis: ${s}`); render(); } });
  document.querySelector("[data-goto-game]")?.addEventListener("click", () => { play("klik"); go("game"); });
};

/* ================= MESIN KUIS ================= */
function mountQuiz(boxId, items, opt){
  const box = $(boxId); if(!box) return;
  box.innerHTML = `<button class="btn" id="q-start">▶ ${opt.done?"Ulangi":"Mulai"}</button>`;
  box.querySelector("#q-start").onclick = () => { play("klik"); startQuiz(box, items, opt); };
}
function startQuiz(box, items, opt){
  if(!box) return;
  items = items.map(shuffleQ);
  let i = 0, correct = 0, picked = null, answered = false;
  const score = () => Math.round(correct / items.length * 100);
  function draw(){
    if(i >= items.length){
      const s = score(), pass = s >= KKTP;
      box.innerHTML = `<div class="qend ${pass?"good":"bad"}">
        <div class="qscore">${s}</div><b>${pass?"Lulus! 🎉":"Belum tuntas"}</b>
        <p class="small">${correct} dari ${items.length} benar · KKTP ${KKTP}</p>
        ${pass?"":`<p class="small">Skor terbaikmu tersimpan untuk remedial — coba lagi setelah belajar ulang.</p>`}
        <div class="row" style="margin-top:12px"><button class="btn" id="q-retry">↻ Ulangi</button>
        <button class="btn ghost" id="q-close">Selesai</button></div></div>`;
      box.querySelector("#q-retry").onclick = () => { i=0; correct=0; draw(); };
      box.querySelector("#q-close").onclick = () => opt.onDone && opt.onDone(s);
      gsNilai(opt, s);
      opt.onScore && opt.onScore(s);
      return;
    }
    const q = items[i];
    box.innerHTML = `<div class="qhead"><span class="eyebrow">${esc(opt.title||"Soal")} · ${i+1}/${items.length}</span></div>
      <div class="qtext">${i+1}. ${esc(q.q)}</div>
      ${q.num ? `<div class="row" style="margin-top:12px"><input class="qin" id="q-num" inputmode="decimal" placeholder="Jawaban angka…">
          <button class="btn" id="q-chk">Periksa</button></div><div id="q-fb" class="qfb"></div>`
        : `<div class="qopts">${q.o.map((t,k)=>`<button class="qopt" data-k="${k}">${String.fromCharCode(65+k)}. ${esc(t)}</button>`).join("")}</div>
           <div id="q-fb" class="qfb"></div>`}
      <div class="row" style="margin-top:14px"><button class="btn ghost" id="q-next" disabled>${i===items.length-1?"Lihat hasil":"Soal berikutnya →"}</button></div>`;
    const next = box.querySelector("#q-next");
    if(q.num){
      const check = () => {
        if(answered) return; answered = true;
        const v = parseFloat(box.querySelector("#q-num").value.replace(",", "."));
        const ok = !isNaN(v) && Math.abs(v - q.ans) < 0.011;
        if(ok) correct++;
        box.querySelector("#q-fb").innerHTML = `<span class="${ok?"ok":"no"}">${ok?"✔ Benar!":"✘ Salah"} — jawaban: ${q.ans}</span>`
          + (q.w?`<div class="small muted" style="margin-top:6px">${esc(q.w)}</div>`:"");
        play(ok?"benar":"salah"); next.disabled = false;
      };
      box.querySelector("#q-chk").onclick = check;
      box.querySelector("#q-num").addEventListener("keydown", e => { if(e.key==="Enter") check(); });
    } else {
      box.querySelectorAll(".qopt").forEach(b => b.onclick = () => {
        if(answered) return; answered = true;
        const k = +b.dataset.k, ok = k === q.a;
        if(ok) correct++;
        box.querySelectorAll(".qopt").forEach((x,xi) => {
          if(xi === q.a) x.classList.add("ok");
          else if(xi === k) x.classList.add("no");
          else x.classList.add("dim");
          x.disabled = true;
        });
        play(ok?"benar":"salah");
        box.querySelector("#q-fb").innerHTML = `<span class="${ok?"ok":"no"}">${ok?"✔ Benar!":"✘ Salah"}</span>`
          + (q.w?`<div class="small muted" style="margin-top:6px">${esc(q.w)}</div>`:"");
        next.disabled = false;
      });
    }
    next.onclick = () => { i++; picked = null; answered = false; draw(); };
  }
  draw();
}
/* ================= ASESMEN (quiz menu) ================= */
let quizTab = "diag", quizUnit = 1;
VIEWS.quiz = (sub) => {
  sub = sub || quizTab;
  if(sub === "diag" || sub === "form"){ quizTab = sub; return quizPick(sub); }
  if(sub === "sum"){ quizTab = "sum"; return quizSum(); }
  if(sub === "rem"){ quizTab = "rem"; return quizRem(); }
  return quizPick("diag");
};
function quizPick(kind){
  const isDiag = kind === "diag";
  const u = UNITS[quizUnit-1], st = U(quizUnit);
  const cur = isDiag ? st.diag : st.form;
  return `<div class="stack">
    <div class="sec-h"><span class="ic">✅</span><h2>Asesmen — ${isDiag?"Diagnostik":"Formatif"}</h2></div>
    <div class="tabs">${[["diag","🩺 Diagnostik"],["form","✍️ Formatif"],["sum","🏁 Sumatif (UTS/UAS)"],["rem","🩹 Remedial"]]
      .map(([id,lb])=>`<button class="${quizTab===id||(id===kind&&quizTab===kind)?"on":""}" data-qt="${id}">${lb}</button>`).join("")}</div>
    <div class="card pad"><div class="row" style="justify-content:space-between">
      <div><span class="eyebrow">PILIH UNIT</span>
        <h3 style="font-size:18px">${u.emoji} Unit ${u.n} — ${esc(u.title)}</h3></div>
      <span class="pill ${cur?"good":""}">${cur?`Skor ${cur}`:"Belum"}</span></div>
      <div class="unitpick">${UNITS.map(x=>`<button class="${x.n===quizUnit?"on":""}" data-up="${x.n}">${x.n}</button>`).join("")}</div>
      <div id="qbox" style="margin-top:14px"></div></div>
    <div class="card pad"><b class="small">${isDiag?"Diagnostik tidak menurunkan nilai — dipakai untuk pemetaan awal & rekomendasi belajar."
      :`Formatif berisi ${FORM(quizUnit).length} soal representatif; skor ≥ ${KKTP} menandai tuntas.`}</b></div></div>`;
}
BIND.quiz = (sub) => {
  document.querySelectorAll("[data-qt]").forEach(b => b.onclick = () => { play("klik"); go("quiz", b.dataset.qt); });
  if(sub === "sum" || sub === "rem"){
    if(sub === "sum"){
      document.querySelectorAll("[data-ex]").forEach(b => b.onclick = () => {
        const kind = b.dataset.ex;
        startQuiz($("qbox"), kind === "uts" ? EXAM.uts.q : EXAM.uas.q, {
          title: kind === "uts" ? "Ujian Tengah Semester" : "Ujian Akhir Semester",
          onScore: s => { D.ex[kind] = Math.max(D.ex[kind], s); save(); },
          onDone: s => { toast(`Skor ${kind.toUpperCase()}: ${s}`); render(); } });
      });
    }
    if(sub === "rem"){
      document.querySelector("#rem-start")?.addEventListener("click", () => {
        startQuiz($("qbox"), EXAM.rem, { title:"Latihan Remedial",
          onScore: s => { D.ex.rem = Math.max(D.ex.rem, s); save(); },
          onDone: s => { toast(s >= KKTP ? `Remedial tuntas: ${s} 🎉` : `Skor ${s} — pelajari lagi`); render(); } }); });
    }
    return;
  }
  document.querySelectorAll("[data-up]").forEach(b => b.onclick = () => { quizUnit = +b.dataset.up; render(); });
  const kind = sub || "diag", st = U(quizUnit);
  const items = kind === "diag" ? DIAG(quizUnit) : FORM(quizUnit);
  mountQuiz("qbox", items, { title: kind === "diag" ? "Diagnostik" : "Formatif",
    unit: quizUnit,
    done: (kind === "diag" ? st.diag : st.form) > 0,
    onScore: s => { if(kind === "diag") st.diag = s; else st.form = Math.max(st.form, s); save(); },
    onDone: s => { toast(`Skor: ${s}`); render(); } });
};
function quizSum(){
  const needRem = [U(quizUnit).diag, U(quizUnit).form, D.ex.uts, D.ex.uas].some(x => x > 0 && x < KKTP);
  return `<div class="stack">
    <div class="sec-h"><span class="ic">🏁</span><h2>Asesmen Sumatif</h2>
      <span class="right pill">${EXAM.uts.q.length} soal · ${EXAM.uts.time} menit</span></div>
    <div class="tabs">${[["diag","🩺 Diagnostik"],["form","✍️ Formatif"],["sum","🏁 Sumatif (UTS/UAS)"],["rem","🩹 Remedial"]]
      .map(([id,lb])=>`<button class="${id==="sum"?"on":""}" data-qt="${id}">${lb}</button>`).join("")}</div>
    <div class="grid2">
      <div class="card pad"><span class="eyebrow">UTS · SEMESTER GANJIL</span><h3>Ujian Tengah Semester</h3>
        <p class="small muted" style="margin-top:6px">${esc(EXAM.uts.desc)}</p>
        <div class="row" style="margin-top:10px"><span class="pill ${D.ex.uts?"good":""}">${D.ex.uts?`Skor ${D.ex.uts}`:"Belum"}</span>
          <button class="btn sm" data-ex="uts">Mulai UTS</button></div></div>
      <div class="card pad"><span class="eyebrow">UAS · SEMESTER GENAP</span><h3>Ujian Akhir Semester</h3>
        <p class="small muted" style="margin-top:6px">${esc(EXAM.uas.desc)}</p>
        <div class="row" style="margin-top:10px"><span class="pill ${D.ex.uas?"good":""}">${D.ex.uas?`Skor ${D.ex.uas}`:"Belum"}</span>
          <button class="btn sm" data-ex="uas">Mulai UAS</button></div></div>
    </div>
    <div class="card pad"><div id="qbox"></div></div>
    ${needRem?`<div class="card pad" style="background:var(--badbg);border-color:var(--bad)">
      <b>⚠️ Ada skor &lt; ${KKTP}.</b> <span class="small">Ikuti remedial untuk memperbaiki capaianmu.</span></div>`:""}</div>`;
}
function quizRem(){
  const pass = D.ex.rem >= KKTP && D.ex.rem > 0;
  return `<div class="stack">
    <div class="sec-h"><span class="ic">🩹</span><h2>Remedial &amp; Pengayaan</h2>
      <span class="right pill ${pass?"good":"bad"}">${pass?`Tuntas (${D.ex.rem})`:`KKTP ${KKTP}`}</span></div>
    <div class="tabs">${[["diag","🩺 Diagnostik"],["form","✍️ Formatif"],["sum","🏁 Sumatif (UTS/UAS)"],["rem","🩹 Remedial"]]
      .map(([id,lb])=>`<button class="${id==="rem"?"on":""}" data-qt="${id}">${lb}</button>`).join("")}</div>
    <div class="card pad"><p class="muted small">${EXAM.rem.length} soal campuran dari seluruh elemen. Skor ≥ ${KKTP} menandai remedial tuntas.</p>
      <div class="row" style="margin-top:10px"><button class="btn" id="rem-start">${D.ex.rem?"↻ Ulangi remedial":"Mulai remedial"}</button></div>
      <div id="qbox" style="margin-top:14px"></div></div></div>`;
}

/* ================= GRADES ================= */
VIEWS.grades = () => {
  const rows = UNITS.map(u => { const s = U(u.n), a = avgUnit(u.n);
    const ok = a >= KKTP;
    return `<tr><td class="num">${u.n}</td><td>${u.emoji} ${esc(u.title)}</td>
      <td class="num">${s.diag||"—"}</td><td class="num">${s.form||"—"}</td><td class="num">${s.quiz||"—"}</td>
      <td class="num"><b>${a||"—"}</b></td>
      <td><span class="pill ${a?(ok?"good":"bad"):""}">${a?(ok?"Tuntas":"Remedial"):"—"}</span></td></tr>`; }).join("");
  const examRow = (lb, v) => `<tr><td colspan="4"><b>${lb}</b></td><td class="num" colspan="2"><b>${v||"—"}</b></td>
    <td><span class="pill ${v?(v>=KKTP?"good":"bad"):""}">${v?(v>=KKTP?"Tuntas":"Remedial"):"—"}</span></td></tr>`;
  const bars = UNITS.map(u => { const a = avgUnit(u.n);
    return `<div class="r"><span>U${u.n}</span><span class="tr"><span class="b" style="width:${a}%;background:var(--e${u.el})"></span></span><span class="v">${a||"—"}</span></div>`; }).join("");
  const best = Math.max(0, ...UNITS.map(u=>avgUnit(u.n)));
  return `<div class="stack">
    <div class="sec-h"><span class="ic">📈</span><h2>Nilai Kamu</h2>
      <span class="right pill">KKTP ${KKTP}</span></div>
    <div class="grid3">
      <div class="card stat"><span class="eyebrow">RERATA UNIT</span><b>${avgAll()}</b></div>
      <div class="card stat"><span class="eyebrow">UNIT TUNTAS</span><b>${UNITS.filter(u=>avgUnit(u.n)>=KKTP).length}/${NU}</b></div>
      <div class="card stat"><span class="eyebrow">SKOR TERTINGGI</span><b>${best||"—"}</b></div>
    </div>
    <div class="card tbl-wrap"><table>
      <thead><tr><th>Unit</th><th>Judul</th><th>Diag</th><th>Form</th><th>Kuis</th><th>Rata</th><th>Status</th></tr></thead>
      <tbody>${rows}${examRow("UTS", D.ex.uts)}${examRow("UAS", D.ex.uas)}${examRow("Remedial", D.ex.rem)}</tbody></table></div>
    <div class="card pad"><div class="sec-h" style="margin-bottom:8px"><span class="ic">📊</span><h2 style="font-size:18px">Perbandingan rata-rata</h2></div>
      <div class="chart">${bars}</div></div></div>`;
};
BIND.grades = () => {};

/* ================= ASSIGNMENTS ================= */
VIEWS.assign = () => {
  const cards = UNITS.map(u => { const s = U(u.n);
    const done = s.task || s.proj;
    return `<div class="card pad" style="border-left:5px solid var(--e${u.el})">
      <div class="row" style="justify-content:space-between">
        <div><span class="eyebrow">UNIT ${u.n} · SEMESTER ${u.sem}</span>
          <h3 style="font-size:17px">${u.emoji} ${esc(u.title)}</h3></div>
        <span class="pill ${done?"good":""}">${done?"Selesai":"Aktif"}</span></div>
      <div class="task" style="margin-top:8px"><b>1. Tugas</b><p class="small">${esc(u.task)}</p>
        <label class="chk"><input type="checkbox" data-as="${u.n}:task" ${s.task?"checked":""}> Selesai dikerjakan</label></div>
      <div class="task"><b>2. ${esc(u.proj.title)}</b>
        <ol class="steps">${u.proj.steps.map(x=>`<li>${esc(x)}</li>`).join("")}</ol>
        <label class="chk"><input type="checkbox" data-as="${u.n}:proj" ${s.proj?"checked":""}> Proyek dikumpulkan</label></div>
      <button class="btn ghost sm" style="margin-top:8px" data-open-u="${u.n}">Buka detail unit →</button></div>`; }).join("");
  const total = UNITS.reduce((a,u)=>a+(U(u.n).task?1:0)+(U(u.n).proj?1:0),0);
  return `<div class="stack">
    <div class="sec-h"><span class="ic">📌</span><h2>Tugas &amp; Proyek</h2>
      <span class="right pill ${total===NU*2?"good":""}">${total}/${NU*2} selesai</span></div>
    <div class="grid2">${cards}</div></div>`;
};
BIND.assign = () => {
  document.querySelectorAll("[data-as]").forEach(c => c.onchange = () => {
    const [n,k] = c.dataset.as.split(":"); const s = U(+n);
    s[k] = c.checked; if(k === "proj") s.proj = c.checked; save();
    toast(c.checked ? "Ditandai selesai ✅" : "Dibatalkan"); render(); });
  document.querySelectorAll("[data-open-u]").forEach(b => b.onclick = () => go("unit", +b.dataset.openU, "proj"));
};

/* ================= GAME (offline, per data GAMES) ================= */
function starsOf(gid, li){ return (D.g[gid] && D.g[gid].stars && D.g[gid].stars[li]) || 0; }
function totalStars(){ return GAMES.reduce((a,g)=> a + g.levels.reduce((b,_,li)=> b + starsOf(g.id, li), 0), 0); }
function unlocked(g, li){ return li === 0 || starsOf(g.id, li-1) > 0; }
function gameCard(g){
  const done = g.levels.filter((_,li)=>starsOf(g.id,li)>0).length;
  const stars = g.levels.reduce((b,_,li)=> b + starsOf(g.id, li), 0);
  const max = g.levels.length*3;
  const pct = Math.round(done / g.levels.length * 100);
  return `<button class="gcard" data-game="${g.id}">
    <span class="gicon">${g.emoji}</span>
    <span><b>${esc(g.name)}</b><small>${esc(g.desc)}</small>
      <span class="gstars">${[0,1,2].map(i=>i < Math.round(stars/3) ? "★" : '<i>★</i>').join("")}
      <em>${done}/${g.levels.length} tingkat · ${stars}/${max}★${done===g.levels.length?" · ✅ tamat":""}</em></span>
      <span class="gprogline"><i style="width:${pct}%"></i></span></span></button>`;
}
VIEWS.game = (id) => {
  if(!id){
    const total = GAMES.reduce((a,g)=> a + g.levels.length*3, 0);
    const tpct = total ? Math.round(totalStars()/total*100) : 0;
    return `<div class="stack">
      <div class="ghero"><span class="gh-ic">🎮</span>
        <div><h2>Gim Edukatif ${esc(META.short)}</h2>
          <p>${GAMES.length} gim · 3 tingkat tiap gim · soal selaras unit &amp; elemen CP.</p></div>
        <div class="gh-total"><b>${totalStars()}</b><span class="small">bintang dari ${total}</span>
          <span class="gprogline" style="margin-top:6px"><i style="width:${tpct}%"></i></span></div></div>
      <div class="ggrid">${GAMES.map(g => gameCard(g)).join("")}</div></div>`;
  }
  const g = GAMES.find(x => x.id === id) || GAMES[0];
  const stars = g.levels.reduce((b,_,li)=> b + starsOf(g.id, li), 0);
  const levels = g.levels.map((l,li) => {
    const s = starsOf(g.id, li), on = unlocked(g, li);
    return `<button class="ucard ${s===3?"best":""}" ${on?`data-lv="${li}"`:'disabled style="opacity:.5"'}>
      <span class="th"><span class="no">${li+1}</span>${g.emoji}</span>
      <span><h4>${esc(l.name)}</h4><p>${l.q.length} soal${on?"":" · selesaikan tingkat sebelumnya"}</p>
        <span class="gstars">${[0,1,2].map(k=>k<s?"★":'<i>★</i>').join("")}</span></span>
      ${li===g.levels.length-1?'<span class="boss">TANTANGAN</span>':""}
      <span class="chev">${s?"✅":on?"▶":"🔒"}</span></button>`; }).join("");
  return `<div class="stack">
    <div class="ghead" style="background:var(--labbg)">
      <span class="gh-ic" style="font-size:44px">${g.emoji}</span>
      <div><button class="btn ghost sm" data-gback="1">← Semua gim</button>
        <h2 style="margin-top:6px">${esc(g.name)} <span class="pill e${g.el}">E${g.el}</span></h2>
        <p class="muted small">${esc(g.desc)} · bintang: ${stars}/${g.levels.length*3}</p></div></div>
    ${levels}
    <div class="gbox" id="gbox" hidden></div></div>`;
};
BIND.game = (id) => {
  document.querySelectorAll("[data-game]").forEach(b => b.onclick = () => { play("klik"); go("game", b.dataset.game); });
  document.querySelector("[data-gback]")?.addEventListener("click", () => go("game"));
  document.querySelectorAll("[data-lv]").forEach(b => b.onclick = () => {
    play("klik");
    const box = $("gbox"); box.hidden = false;
    mountGame(box, GAMES.find(x => x.id === id), +b.dataset.lv);
    if(box.scrollIntoView) try{ box.scrollIntoView({ behavior:"smooth", block:"nearest" }); }catch(e){}
  });
};
function mountGame(box, g, li){
  const lvl = g.levels[li];
  let i = 0, correct = 0, combo = 0, bestCombo = 0, answered = false;
  const pct = () => Math.round(i / lvl.q.length * 100);
  const shipPct = () => Math.min(92, 8 + (i / lvl.q.length) * 84);
  const hud = () => `<div class="ghud">
      <div class="ghud-l"><span>${g.emoji} ${esc(lvl.name)} · Tingkat ${li+1}</span>
        <span class="gprog"><i style="width:${pct()}%"></i></span></div>
      <span>Sisa ${lvl.q.length - i} · Benar ${correct}</span>
      ${combo > 1 ? `<span class="gcombo">🔥 Beruntun ×${combo}</span>` : ""}
    </div>`;
  const confetti = () => {
    const cols = ["#d4a017","#b85c38","#c92a2a","#7a8b3c","#f5e6c8"];
    return `<div class="gconfetti">${Array.from({length:28},(_,k)=>`<i style="left:${Math.round(Math.random()*100)}%;background:${cols[k%cols.length]};animation-delay:${(Math.random()*0.6).toFixed(2)}s"></i>`).join("")}</div>`;
  };
  const clearKey = () => { if(gameKey){ document.removeEventListener("keydown", gameKey); gameKey = null; } };
  function draw(){
    clearKey();
    if(i >= lvl.q.length){
      const s = Math.round(correct / lvl.q.length * 100);
      const st = s >= 100 ? 3 : s >= 80 ? 2 : s >= 50 ? 1 : 0;
      const prev = starsOf(g.id, li);
      if(st > prev){ D.g[g.id] = D.g[g.id] || {}; D.g[g.id].stars = D.g[g.id].stars || {}; D.g[g.id].stars[li] = st; save(); }
      const hasNext = li + 1 < g.levels.length;
      box.innerHTML = hud() + `<div class="gend">${st >= 2 ? confetti() : ""}
        <span class="gend-ic">${st >= 2 ? "🏆" : st >= 1 ? "🎖️" : "🚀"}</span>
        <div class="gend-stars">${[0,1,2].map(k=>k<st?`<span class="pop" style="animation-delay:${(k*0.14).toFixed(2)}s">★</span>`:`<i>★</i>`).join("")}</div>
        <h3>${s} · ${correct}/${lvl.q.length} benar</h3>
        <p class="small" style="color:#e8d4a8">${st > prev ? "Bintang baru tersimpan! 🌟" : st ? `Bintang terbaik tingkat ini: ${Math.max(st, prev)}` : "Coba lagi — kamu pasti bisa!"}${bestCombo > 1 ? ` · Beruntun terbaik ×${bestCombo}` : ""}</p>
        <div class="row" style="justify-content:center;margin-top:8px">
          <button class="btn g-again" id="g-again">↻ Ulangi</button>
          ${hasNext ? `<button class="btn" id="g-next" style="background:#a0602e">Tingkat berikutnya →</button>` : ""}
          <button class="btn" id="g-close" style="background:rgba(255,255,255,.14);color:#fff">← Semua gim</button>
        </div></div>`;
      $("g-again").onclick = () => { i = 0; correct = 0; combo = 0; bestCombo = 0; draw(); };
      $("g-close").onclick = () => { clearKey(); go("game"); };
      const nx = $("g-next"); if(nx) nx.onclick = () => { play("klik"); clearKey(); mountGame(box, g, li + 1); };
      return;
    }
    const q = lvl.q[i];
    box.innerHTML = hud() + `<div class="garena" id="garena">
      <div class="g-rocket">
        <div class="g-track"><span class="g-moon">🌙</span>
          <span class="g-ship" id="gship" style="bottom:${shipPct()}%">${g.emoji}</span></div>
        <div style="min-width:0">
          <span class="g-kicker">Soal ${i+1}/${lvl.q.length} · ${esc(g.name)}</span>
          <div class="g-prompt">${esc(q.p)}</div>
          <div class="g-opts">${q.o.map((t,k)=>`<button data-gk="${k}"><b style="opacity:.55;margin-right:6px">${String.fromCharCode(65+k)}</b>${esc(t)}</button>`).join("")}</div>
          <div id="g-fb"></div>
        </div></div></div>`;
    box.querySelectorAll("[data-gk]").forEach(b => b.onclick = () => {
      if(answered) return; answered = true;
      const k = +b.dataset.gk, ok = k === q.a;
      if(ok){ correct++; combo++; bestCombo = Math.max(bestCombo, combo); } else combo = 0;
      box.querySelectorAll("[data-gk]").forEach((x, xi) => {
        x.disabled = true;
        if(xi === q.a){ x.style.background = "#5b7f3a"; x.style.borderColor = "#5b7f3a"; }
        else if(xi === k) x.classList.add("no");
      });
      const fb = $("g-fb");
      if(fb) fb.innerHTML = `<div class="gfb ${ok ? "ok" : "no"}">${ok ? `✅ Tepat!${combo > 1 ? ` Beruntun ×${combo}` : ""}` : `❌ Belum tepat — jawaban benar: ${String.fromCharCode(65 + q.a)}`}</div>`;
      const ar = $("garena"); ar.classList.add(ok ? "g-ok" : "g-bad");
      play(ok ? "benar" : "salah");
      const sh = $("gship"); if(sh) sh.style.bottom = Math.min(92, 8 + (i + (ok?1:0)) / lvl.q.length * 84) + "%";
      setTimeout(() => { i++; answered = false; draw(); }, ok ? 900 : 1500);
    });
    gameKey = e => {
      if(document.body && document.body.contains && !document.body.contains(box)){ clearKey(); return; }
      let idx = -1;
      if(/^[1-4]$/.test(e.key)) idx = +e.key - 1;
      else if(/^[a-dA-D]$/.test(e.key)) idx = e.key.toLowerCase().charCodeAt(0) - 97;
      if(idx >= 0 && idx < q.o.length && !answered){ const btn = box.querySelector(`[data-gk="${idx}"]`); if(btn) btn.click(); }
    };
    document.addEventListener("keydown", gameKey);
  }
  draw();
}

/* ================= LAB ================= */
VIEWS.lab = (id) => {
  if(!id){
    return `<div class="stack">
      <div class="labhero"><span style="font-size:52px">🧪</span>
        <div><h2>Lab Maya</h2>
          <p class="muted" style="font-weight:600">${esc(META.labHero || "Belajar dengan mencoba: susun, geser, dan jelajahi — temukan sendiri pola di balik capaian. Tandai selesai setelah tantangannya kamu tuntaskan.")}</p></div></div>
      <div class="labgrid">${LABS.map(l => `<button class="labcard" data-lab="${l.id}">
        <span class="li">${l.emoji}</span>
        <span><span class="eyebrow">ELEMEN ${l.el} ${D.lab[l.id]?"· ✅ SELESAI":""}</span>
          <h3>${esc(l.name)}</h3><p class="small muted">${esc(l.desc)}</p></span></button>`).join("")}</div>
</div>`;
  }
  const l = LABS.find(x => x.id === id) || LABS[0];
  const top = `<div class="labhero" style="padding:16px">
    <button class="btn ghost sm" data-lback="1">← Semua lab</button>
    <div><h2 style="font-size:26px">${l.emoji} ${esc(l.name)}</h2>
      <p class="small muted" style="margin-top:4px">${esc(l.hint)}</p></div></div>`;
  const done = D.lab[l.id] ? `<div class="res ok">✅ Lab ini sudah kamu tandai selesai.</div>` : "";
  const LTYPE = l.type || (["labgraf","labtrigo","labstat"].includes(l.id) ? "sim" : l.id === "labseq" ? "seq" : "info");
  const stepsOf = () => (Array.isArray(l.steps) && l.steps.length ? l.steps : SEQ_STEPS);
  if(LTYPE === "seq"){
    const steps = stepsOf().map((t, i) => ({ t, k: i }));
    if(!mountSeqOrder || mountSeqOrder.seed !== l.id){
      mountSeqOrder = { seed: l.id, order: shuffle(steps.map((_,i)=>i)) };
    }
    const draw = () => mountSeqOrder.order.map((k, pos) =>
      `<li data-pos="${pos}"><span class="n">${pos+1}</span><span class="tx">${esc(steps[k].t)}</span>
        <span class="mv"><button data-mv="${pos}:-1">▲</button><button data-mv="${pos}:1">▼</button></span></li>`).join("");
    return `<div class="stack">${top}
      <div class="card pad"><div class="sec-h" style="margin-bottom:8px"><span class="ic">🧮</span>
        <h2 style="font-size:18px">Susun langkah penyelesaian</h2></div>
        <p class="small muted">Urutkan langkah di bawah ini sesuai urutan yang benar, lalu klik Periksa urutan.</p>
        <ul class="seq" id="seq-list" style="margin-top:12px">${draw()}</ul>
        <div class="row" style="margin-top:12px"><button class="btn" id="seq-check">Periksa urutan</button>
          <button class="btn ghost" id="seq-shuffle">↻ Acak ulang</button></div>
        <div id="seq-fb" style="margin-top:10px"></div>${done}</div></div>`;
  }
  if(LTYPE === "match"){
    const pairs = (l.pairs || []).map((p,i) => ({ i, k:p[0], v:p[1] }));
    const rk = shuffle(pairs), rv = shuffle(pairs);
    return `<div class="stack">${top}
      <div class="card pad"><div class="sec-h" style="margin-bottom:8px"><span class="ic">🔗</span>
        <h2 style="font-size:18px">Pasangkan istilah &amp; arti</h2></div>
        <p class="small muted">Klik satu istilah di kiri, lalu pasangannya di kanan. Semua pasangan benar = lab selesai.</p>
        <div class="grid2 match2" style="margin-top:12px">
          <div class="ml">${rk.map(p => `<button class="mrow" data-mk="${p.i}">${esc(p.k)}</button>`).join("")}</div>
          <div class="ml">${rv.map(p => `<button class="mrow" data-mv2="${p.i}">${esc(p.v)}</button>`).join("")}</div>
        </div>
        <div id="m-fb" style="margin-top:10px"></div>${done}</div></div>`;
  }
  if(LTYPE === "timeline"){
    const evs = l.events || [];
    if(!mountTL || mountTL.seed !== l.id){
      mountTL = { seed:l.id, pool: shuffle(evs.map((_,i)=>i)), slots: Array(evs.length).fill(null) };
    }
    const slotHtml = (v, pos) => `<div class="tlslot" data-slot="${pos}" ${v!==null?'draggable="true"':""}>
        <span class="yr">${pos+1}</span>
        ${v===null?'<span class="ph">Letakkan peristiwa di sini…</span>':`<span class="tx">${esc(evs[v].t)}</span><span class="tlx">✕</span>`}
      </div>`;
    return `<div class="stack">${top}
      <div class="card pad"><div class="sec-h" style="margin-bottom:8px"><span class="ic">⏳</span>
        <h2 style="font-size:18px">Susun garis waktu</h2></div>
        <p class="small muted">Seret kartu (atau klik kartu lalu klik slot) ke urutan waktu yang benar — dari paling awal ke paling akhir.</p>
        <div class="tlwrap" style="margin-top:12px">
          <div class="tlpool" id="tl-pool">${mountTL.pool.map(i => `<button class="tlchip" draggable="true" data-tl="${i}">${esc(evs[i].t)}</button>`).join("")}</div>
          <div class="tlrail" id="tl-rail">${mountTL.slots.map((v,pos)=>slotHtml(v,pos)).join("")}</div>
          <div class="row"><button class="btn" id="tl-check">Periksa urutan</button>
            <button class="btn ghost" id="tl-reset">↻ Acak ulang</button></div>
          <div id="tl-fb"></div>
        </div>${done}</div></div>`;
  }
  if(LTYPE === "sortbin"){
    const items = l.items || [], bins = l.bins || [];
    if(!mountBin || mountBin.seed !== l.id){
      mountBin = { seed:l.id, pool: shuffle(items.map((_,i)=>i)), placed:{} };
    }
    const inBin = b => Object.keys(mountBin.placed).filter(k => mountBin.placed[k] === b).map(Number);
    return `<div class="stack">${top}
      <div class="card pad"><div class="sec-h" style="margin-bottom:8px"><span class="ic">🏺</span>
        <h2 style="font-size:18px">Bedah sumber: primer atau sekunder?</h2></div>
        <p class="small muted">Klik satu sumber, lalu klik kotak yang tepat. Sumber yang benar akan terkunci di kotaknya.</p>
        <div class="binpool" id="bin-pool" style="margin-top:12px">${mountBin.pool.length ? mountBin.pool.map(i => `<button class="schip" data-si="${i}">${esc(items[i].t)}</button>`).join("") : '<span class="small muted">Semua sumber sudah dikelompokkan ✅</span>'}</div>
        <div class="binwrap" style="margin-top:12px">${bins.map(b => `<div class="bin" data-bin="${b.id}">
          <h4>${b.emoji || ""} ${esc(b.name)}<span class="cnt" id="cnt-${b.id}">${inBin(b.id).length}</span></h4>
          <div class="bitems">${inBin(b.id).map(i => `<span class="schip ok">${esc(items[i].t)}</span>`).join("")}</div>
        </div>`).join("")}</div>
        <div id="bin-fb" style="margin-top:10px"></div>${done}</div></div>`;
  }
  if(LTYPE === "map"){
    const ports = l.ports || [];
    if(!mountMap || mountMap.seed !== l.id) mountMap = { seed:l.id, visited:new Set(), cur:null };
    const cur = ports.find(p => p.id === mountMap.cur) || null;
    return `<div class="stack">${top}
      <div class="card pad"><div class="sec-h" style="margin-bottom:8px"><span class="ic">🗺️</span>
        <h2 style="font-size:18px">Jelajahi jalur rempah</h2></div>
        <p class="small muted">Klik setiap pelabuhan pada peta untuk membuka kisahnya. Kunjungi semua pelabuhan untuk menyelesaikan lab.</p>
        <div class="mapwrap" style="margin-top:12px">${mapSvg(ports, mountMap.visited)}</div>
        <div class="mapinfo" id="map-info">${cur ? `<span class="mi-em">${cur.emoji || "⚓"}</span><div><span class="yr">${esc(cur.year || "")}</span><h4>${esc(cur.name)}</h4><p>${esc(cur.info || "")}</p></div>` : '<span class="mi-em">🧭</span><div><h4>Pilih pelabuhan</h4><p>Klik titik pada peta untuk membaca perannya dalam jaringan rempah Nusantara.</p></div>'}</div>
        <div class="mapcheck" id="map-check">${ports.map(p => `<span class="mapdot ${mountMap.visited.has(p.id)?"on":""}" title="${esc(p.name)}"></span>`).join("")}<span id="map-count">${mountMap.visited.size}/${ports.length} pelabuhan</span></div>
        ${done}</div></div>`;
  }
  if(LTYPE === "timeslider"){
    if(!mountTS || mountTS.seed !== l.id) mountTS = { seed:l.id, y: l.start || 400 };
    return `<div class="stack">${top}
      <div class="card pad"><div class="sec-h" style="margin-bottom:8px"><span class="ic">🕰️</span>
        <h2 style="font-size:18px">Mesin waktu Nusantara</h2></div>
        <p class="small muted">Geser tahun dan lihat era serta peristiwa yang hidup pada masa itu.</p>
        <div class="tswrap" style="margin-top:12px">
          <input type="range" class="tsrange" id="ts-range" min="${l.min}" max="${l.max}" step="${l.step || 10}" value="${mountTS.y}" aria-label="Tahun">
          <div class="tsyear"><span>${l.min} M</span><span id="ts-now" style="color:var(--sj-accent);font-size:15px">${mountTS.y} M</span><span>${l.max} M</span></div>
          <div id="ts-era"></div>
          <div class="tscards" id="ts-cards"></div>
        </div>
        <div class="row" style="margin-top:12px"><button class="btn" id="ldone">${D.lab[l.id]?"↻ Tandai ulang":"Tandai selesai"}</button></div>
      </div></div>`;
  }
  if(LTYPE === "info"){
    return `<div class="stack">${top}
      <div class="card pad"><div class="sec-h" style="margin-bottom:8px"><span class="ic">${l.emoji}</span>
        <h2 style="font-size:18px">${esc(l.name)}</h2></div>
        <div class="model" style="margin-top:8px">${hl(l.body || l.desc || "")}</div>
        <div class="row" style="margin-top:14px"><button class="btn ${D.lab[l.id]?"ghost":""}" id="ldone">${D.lab[l.id]?"↻ Tandai ulang":"Tandai selesai"}</button></div>
      </div></div>`;
  }
  const ctl = {
    labgraf: `<div class="labctl">
        <label>a <input type="range" id="la" min="-4" max="4" step="1" value="1"><output id="oa">1</output></label>
        <label>b <input type="range" id="lb" min="-8" max="8" step="1" value="-2"><output id="ob">-2</output></label>
        <label>c <input type="range" id="lc" min="-8" max="8" step="1" value="-3"><output id="oc">-3</output></label></div>`,
    labtrigo: `<div class="labctl">
        <label>sudut α <input type="range" id="lt" min="10" max="80" step="1" value="37"><output id="ot">37</output>°</label></div>`,
    labstat: `<div class="labctl" style="width:100%">
        <label style="flex:1">data (pisahkan koma) <input type="text" id="lds" value="4,7,9,10,12,14,18,21,25,30" style="flex:1;min-width:200px"></label>
        <button class="btn sm" id="ldraw">Hitung &amp; gambar</button>
        <button class="btn ghost sm" id="lout">Tambah pencilan 99</button></div>`,
    labukur: `<div class="labctl" style="width:100%">
        <button class="btn sm" id="lacak">🎲 Objek acak</button>
        <label style="flex:1">Hasil ukur (cm) <input type="text" id="lrep" inputmode="decimal" style="width:110px" placeholder="0,0"></label>
        <button class="btn" id="lok">Periksa</button></div>`,
    labgerak: `<div class="labctl">
        <label>v₀ <input type="range" id="lv0" min="-4" max="10" step="1" value="2"><output id="ov0">2</output></label>
        <label>a <input type="range" id="la2" min="-6" max="10" step="1" value="2"><output id="oa2">2</output></label>
        <label>t <input type="range" id="lt2" min="1" max="10" step="1" value="3"><output id="ot2">3</output></label>
        <div class="row" style="width:100%;margin-top:6px">
          <button class="btn ghost sm" data-gp="0,2">GLB</button>
          <button class="btn ghost sm" data-gp="2,2">Dipercepat</button>
          <button class="btn ghost sm" data-gp="8,-2">Diperlambat</button>
          <button class="btn ghost sm" data-gp="0,10">Jatuh bebas</button></div></div>`,
    labenergi: `<div class="labctl">
        <label>m (kg) <input type="range" id="lm" min="1" max="10" step="1" value="4"><output id="om">4</output></label>
        <label>h (m) <input type="range" id="lh" min="0" max="20" step="1" value="15"><output id="oh">15</output></label>
        <div class="row" style="width:100%;margin-top:6px">
          <button class="btn ghost sm" data-gp="10">g Bumi</button>
          <button class="btn ghost sm" data-gp="1.6">g Bulan</button>
          <button class="btn ghost sm" data-gp="3.7">g Mars</button></div></div>`
  }[l.id] || "";
  return `<div class="stack">${top}
    <div class="card pad">
      <div class="sec-h" style="margin-bottom:10px"><span class="ic">${l.emoji}</span>
        <h2 style="font-size:18px">Ruang eksperimen</h2><span class="right pill labpill">${D.lab[l.id]?"✅":"aktif"}</span></div>
      ${ctl}
      <canvas class="lab" id="lcv" width="640" height="360" style="margin-top:12px"></canvas>
      <div class="labout" id="labout" style="margin-top:12px"></div>
      <div class="labout" id="lquiz" style="margin-top:12px"></div>
      <div class="row" style="margin-top:12px"><button class="btn" id="ldone">${D.lab[l.id]?"↻ Tandai ulang":"Tandai selesai"}</button></div>
      <p class="small muted" style="margin-top:8px">${esc(l.desc)}</p></div></div>`;
};
let mountSeqOrder = null;
let mountTL = null, mountBin = null, mountMap = null, mountTS = null, gameKey = null;
function mapSvg(ports, visited){
  const route = ports.map(p => `${p.x},${p.y}`).join(" ");
  return `<svg viewBox="0 0 720 340" role="img" aria-label="Peta jalur rempah Nusantara">
    <defs>
      <linearGradient id="sea" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#efe0bd"/><stop offset="1" stop-color="#e6d3a8"/>
      </linearGradient>
      <pattern id="waves" width="46" height="22" patternUnits="userSpaceOnUse">
        <path d="M0 11 q11 -7 23 0 t23 0" fill="none" stroke="#c9b184" stroke-width="1.2" opacity=".45"/>
      </pattern>
    </defs>
    <rect width="720" height="340" fill="url(#sea)"/>
    <rect width="720" height="340" fill="url(#waves)"/>
    <path d="M78 62 L120 54 L156 96 L150 150 L124 212 L96 246 L78 190 L64 120 Z" fill="#b9a06a" stroke="#8b7348" stroke-width="1.5"/>
    <path d="M150 88 L182 82 L196 122 L178 156 L160 138 L146 112 Z" fill="#c2ab74" stroke="#8b7348" stroke-width="1.5"/>
    <path d="M232 258 Q300 244 382 258 L378 276 Q300 266 236 276 Z" fill="#b9a06a" stroke="#8b7348" stroke-width="1.5"/>
    <path d="M330 118 L396 108 L430 160 L414 222 L356 214 L326 164 Z" fill="#b9a06a" stroke="#8b7348" stroke-width="1.5"/>
    <path d="M462 138 L492 128 L508 166 L492 212 L470 200 L482 168 Z" fill="#c2ab74" stroke="#8b7348" stroke-width="1.5"/>
    <path d="M604 150 L684 140 L704 188 L652 224 L612 198 Z" fill="#b9a06a" stroke="#8b7348" stroke-width="1.5"/>
    <ellipse cx="566" cy="174" rx="12" ry="8" fill="#a9a06a" stroke="#7f7648" stroke-width="1.2"/>
    <ellipse cx="590" cy="194" rx="10" ry="6.5" fill="#b3a874" stroke="#7f7648" stroke-width="1.2"/>
    <ellipse cx="608" cy="208" rx="7" ry="5" fill="#b3a874" stroke="#7f7648" stroke-width="1.1"/>
    <ellipse cx="632" cy="230" rx="11" ry="7" fill="#a9a06a" stroke="#7f7648" stroke-width="1.2"/>
    <polyline points="${route}" fill="none" stroke="#b8860b" stroke-width="2.5" stroke-dasharray="7 6" stroke-linecap="round" opacity=".75"/>
    <text x="52" y="34" font-family="Georgia,serif" font-style="italic" font-size="15" fill="#8b7348">Samudra Hindia</text>
    <text x="520" y="316" font-family="Georgia,serif" font-style="italic" font-size="15" fill="#8b7348">Laut Banda</text>
    <text x="600" y="42" font-family="Georgia,serif" font-style="italic" font-size="15" fill="#8b7348">Papua</text>
    ${ports.map(p => `<g class="mport ${visited.has(p.id)?"visited":""}" data-port="${p.id}" transform="translate(${p.x},${p.y})">
      <circle r="9" fill="#c92a2a" stroke="#fdf6e6" stroke-width="2.5"/>
      <text x="${p.lx || 0}" y="${p.ly || -15}" text-anchor="middle">${esc(p.name)}</text>
    </g>`).join("")}
  </svg>`;
}
function shuffle(a){ const r = a.slice(); for(let i=r.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [r[i],r[j]] = [r[j],r[i]]; } return r; }
function shuffleQ(q){
  if(q.num || !Array.isArray(q.o) || q.o.length < 2) return q;
  const ord = shuffle(q.o.map((_, k) => k));
  return Object.assign({}, q, { o: ord.map(k => q.o[k]), a: ord.indexOf(q.a) });
}
function ctxOf(c){ try{ return c && c.getContext ? c.getContext("2d") : null; }catch(e){ return null; } }
BIND.lab = (id) => {
  document.querySelectorAll("[data-lab]").forEach(b => b.onclick = () => { play("klik"); go("lab", b.dataset.lab); });
  document.querySelector("[data-lback]")?.addEventListener("click", () => go("lab"));
  if(!id) return;
  const l = LABS.find(x => x.id === id) || LABS[0];
  const LTYPE = l.type || (["labgraf","labtrigo","labstat"].includes(l.id) ? "sim" : l.id === "labseq" ? "seq" : "info");
  const stepsOf = () => (Array.isArray(l.steps) && l.steps.length ? l.steps : SEQ_STEPS);
  const mark = () => { D.lab[id] = 1; save(); toast("Lab ditandai selesai ✅"); const p = document.querySelector(".labpill"); if(p) p.textContent = "✅"; };
  if(LTYPE === "seq"){
    const rerender = () => { const ul = $("seq-list");
      ul.innerHTML = mountSeqOrder.order.map((k,pos) =>
        `<li data-pos="${pos}"><span class="n">${pos+1}</span><span class="tx">${esc(stepsOf()[k])}</span>
          <span class="mv"><button data-mv="${pos}:-1">▲</button><button data-mv="${pos}:1">▼</button></span></li>`).join("");
      wire(); };
    const wire = () => {
      $("seq-list").querySelectorAll("[data-mv]").forEach(b => b.onclick = () => {
        const [p,d] = b.dataset.mv.split(":").map(Number), o = mountSeqOrder.order, np = p + d;
        if(np < 0 || np >= o.length) return;
        [o[p], o[np]] = [o[np], o[p]]; play("klik"); rerender(); });
    };
    wire();
    document.querySelector("#seq-shuffle").onclick = () => { mountSeqOrder.order = shuffle(stepsOf().map((_,i)=>i)); rerender(); };
    document.querySelector("#seq-check").onclick = () => {
      const ok = mountSeqOrder.order.every((v,i) => v === i);
      const ul = $("seq-list");
      ul.querySelectorAll("li").forEach((li,i) => { li.classList.remove("ok","no"); li.classList.add(mountSeqOrder.order[i] === i ? "ok" : "no"); });
      $("seq-fb").innerHTML = ok ? `<div class="res ok">Tepat sekali! Urutan benar. ✅</div>`
        : `<div class="res warn">Belum tepat — coba susun ulang langkahnya.</div>`;
      if(ok){ D.lab[id] = 1; save(); play("benar"); toast("Lab ditandai selesai ✅"); }
      else play("salah");
    };
    return;
  }
  if(LTYPE === "match"){
    let sel = null; const solved = new Set();
    const total = (l.pairs || []).length;
    const fb = $("m-fb");
    document.querySelectorAll("[data-mk]").forEach(b => b.onclick = () => {
      const k = +b.dataset.mk; if(solved.has(k)) return;
      document.querySelectorAll("[data-mk]").forEach(x => x.classList.remove("on"));
      sel = k; b.classList.add("on"); play("klik"); });
    document.querySelectorAll("[data-mv2]").forEach(b => b.onclick = () => {
      const v = +b.dataset.mv2; if(sel === null || solved.has(v)) return;
      const wk = document.querySelector(`[data-mk="${sel}"]`), wv = document.querySelector(`[data-mv2="${v}"]`);
      if(v === sel){
        solved.add(sel); wk.classList.add("ok"); wv.classList.add("ok");
        wk.disabled = wv.disabled = true; wk.classList.remove("on"); sel = null; play("benar");
        if(fb) fb.innerHTML = solved.size === total ? `<div class="res ok">Semua pasangan benar! ✅</div>` : "";
        if(solved.size === total) mark();
      } else {
        play("salah"); if(fb) fb.innerHTML = `<div class="res warn">Belum cocok — coba lagi.</div>`;
        if(wk) wk.classList.remove("on"); sel = null;
      }
    });
    return;
  }
  if(LTYPE === "timeline"){
    const evs = l.events || [];
    let sel = null;
    const paintPool = () => { const el = $("tl-pool"); if(!el) return;
      el.innerHTML = mountTL.pool.map(i => `<button class="tlchip" draggable="true" data-tl="${i}">${esc(evs[i].t)}</button>`).join("");
      wirePool(); };
    const paintRail = () => { const el = $("tl-rail"); if(!el) return;
      el.innerHTML = mountTL.slots.map((v,pos) => `<div class="tlslot" data-slot="${pos}" ${v!==null?'draggable="true"':""}>
        <span class="yr">${pos+1}</span>
        ${v===null?'<span class="ph">Letakkan peristiwa di sini…</span>':`<span class="tx">${esc(evs[v].t)}</span><span class="tlx">✕</span>`}
      </div>`).join("");
      wireRail(); };
    const place = (v, pos) => {
      if(v === null || isNaN(v)) return;
      const prev = mountTL.slots[pos];
      mountTL.slots[pos] = v;
      mountTL.pool = mountTL.pool.filter(x => x !== v);
      if(prev !== null) mountTL.pool.push(prev);
      sel = null; paintPool(); paintRail();
    };
    const wirePool = () => {
      document.querySelectorAll("#tl-pool [data-tl]").forEach(b => {
        b.onclick = () => { sel = +b.dataset.tl; document.querySelectorAll(".tlchip").forEach(x => x.classList.remove("sel")); b.classList.add("sel"); play("klik"); };
        b.ondragstart = e => { sel = +b.dataset.tl; try{ e.dataTransfer.setData("text/plain", String(sel)); e.dataTransfer.effectAllowed = "move"; }catch(_){} };
      });
    };
    const wireRail = () => {
      document.querySelectorAll("#tl-rail [data-slot]").forEach(sl => {
        const pos = +sl.dataset.slot;
        sl.onclick = () => {
          if(sel !== null){ place(sel, pos); play("klik"); return; }
          if(mountTL.slots[pos] !== null){ mountTL.pool.push(mountTL.slots[pos]); mountTL.slots[pos] = null; play("klik"); paintPool(); paintRail(); }
        };
        sl.ondragstart = e => { const v = mountTL.slots[pos]; if(v === null) return; sel = v; try{ e.dataTransfer.setData("text/plain", String(v)); }catch(_){} };
        sl.ondragover = e => { e.preventDefault(); sl.classList.add("over"); };
        sl.ondragleave = () => sl.classList.remove("over");
        sl.ondrop = e => { e.preventDefault(); sl.classList.remove("over"); const raw = e.dataTransfer.getData("text/plain"); const v = raw === "" ? sel : +raw; place(v, pos); };
      });
    };
    paintPool(); paintRail();
    document.querySelector("#tl-reset").onclick = () => { mountTL = { seed:l.id, pool: shuffle(evs.map((_,i)=>i)), slots: Array(evs.length).fill(null) }; sel = null; paintPool(); paintRail(); $("tl-fb").innerHTML = ""; };
    document.querySelector("#tl-check").onclick = () => {
      if(mountTL.slots.some(v => v === null)){ $("tl-fb").innerHTML = `<div class="res warn">Masih ada slot kosong — isi semua dulu.</div>`; play("salah"); return; }
      const ok = mountTL.slots.every((v,i) => v === i);
      document.querySelectorAll("#tl-rail [data-slot]").forEach((sl,pos) => {
        sl.classList.remove("ok","no"); sl.classList.add(mountTL.slots[pos] === pos ? "ok" : "no");
        const y = sl.querySelector(".yr"); const v = mountTL.slots[pos];
        if(y && v !== null && evs[v].y) y.textContent = evs[v].y;
      });
      $("tl-fb").innerHTML = ok ? `<div class="res ok">Tepat! Garis waktu tersusun benar. ✅</div>`
        : `<div class="res warn">Belum tepat — perhatikan tahun tiap peristiwa lalu tukar posisinya.</div>`;
      if(ok){ play("benar"); mark(); } else play("salah");
    };
    return;
  }
  if(LTYPE === "sortbin"){
    const items = l.items || [], bins = l.bins || [];
    let sel = null;
    const paint = () => {
      const pool = $("bin-pool"); if(!pool) return;
      pool.innerHTML = mountBin.pool.length ? mountBin.pool.map(i => `<button class="schip" data-si="${i}">${esc(items[i].t)}</button>`).join("") : '<span class="small muted">Semua sumber sudah dikelompokkan ✅</span>';
      bins.forEach(b => {
        const inBin = Object.keys(mountBin.placed).filter(k => mountBin.placed[k] === b.id).map(Number);
        const cnt = $("cnt-" + b.id); if(cnt) cnt.textContent = inBin.length;
        const box = document.querySelector(`[data-bin="${b.id}"] .bitems`);
        if(box) box.innerHTML = inBin.map(i => `<span class="schip ok">${esc(items[i].t)}</span>`).join("");
      });
      pool.querySelectorAll("[data-si]").forEach(ch => {
        ch.onclick = () => { sel = +ch.dataset.si; pool.querySelectorAll(".schip").forEach(x => x.classList.remove("sel")); ch.classList.add("sel"); play("klik"); };
      });
    };
    document.querySelectorAll("[data-bin]").forEach(bin => {
      bin.onclick = () => {
        if(sel === null) return;
        const bid = bin.dataset.bin, it = items[sel];
        if(it && it.bin === bid){
          mountBin.placed[sel] = bid;
          mountBin.pool = mountBin.pool.filter(x => x !== sel);
          play("benar");
          $("bin-fb").innerHTML = `<div class="res ok">Tepat! ${esc(it.t)} = ${it.bin === "primer" ? "sumber primer" : "sumber sekunder"}.</div>`;
          sel = null; paint();
          if(!mountBin.pool.length) mark();
        } else {
          play("salah");
          const ch = document.querySelector(`[data-si="${sel}"]`);
          if(ch){ ch.classList.add("no"); setTimeout(() => ch.classList.remove("no"), 500); }
          $("bin-fb").innerHTML = `<div class="res warn">Belum tepat — pikirkan lagi: apakah sumber ini lahir pada masa peristiwa?</div>`;
        }
      };
    });
    paint();
    return;
  }
  if(LTYPE === "map"){
    const ports = l.ports || [];
    const info = $("map-info");
    const show = p => { if(info) info.innerHTML = `<span class="mi-em">${p.emoji || "⚓"}</span><div><span class="yr">${esc(p.year || "")}</span><h4>${esc(p.name)}</h4><p>${esc(p.info || "")}</p></div>`; };
    document.querySelectorAll("[data-port]").forEach(el => el.onclick = () => {
      const p = ports.find(x => x.id === el.dataset.port); if(!p) return;
      mountMap.visited.add(p.id); mountMap.cur = p.id;
      el.classList.add("visited"); show(p); play("klik");
      document.querySelectorAll("#map-check .mapdot").forEach((d,k) => d.classList.toggle("on", mountMap.visited.has(ports[k].id)));
      const c = $("map-count"); if(c) c.textContent = mountMap.visited.size + "/" + ports.length + " pelabuhan";
      if(mountMap.visited.size === ports.length) mark();
    });
    if(mountMap.cur){ const p = ports.find(x => x.id === mountMap.cur); if(p) show(p); }
    return;
  }
  if(LTYPE === "timeslider"){
    const eras = l.eras || [], evs = l.events || [];
    const paint = () => {
      const y = +$("ts-range").value; mountTS.y = y;
      $("ts-now").textContent = y + " M";
      const era = eras.find(e => y >= e.from && y <= e.to) || eras[eras.length - 1] || { name:"—", desc:"" };
      $("ts-era").innerHTML = `<div class="tsera"><span class="tsbig">${y} <span style="font-size:18px">M</span></span><div><h4>${esc(era.name)}</h4><p>${esc(era.desc || "")}</p></div></div>`;
      const near = evs.filter(e => Math.abs(e.y - y) <= 60);
      $("ts-cards").innerHTML = near.length
        ? near.map(e => `<div class="tscard"><span class="yr">${e.y} M</span><b>${esc(e.t)}</b><small>${esc(e.d || "")}</small></div>`).join("")
        : `<div class="tsempty">Tidak ada peristiwa besar dalam ±60 tahun di sekitar tahun ${y}. Geser lagi untuk menemukan jejak kerajaan.</div>`;
    };
    $("ts-range").addEventListener("input", paint);
    $("ldone").onclick = mark;
    paint();
    return;
  }
  if(LTYPE === "info"){ $("ldone").onclick = mark; return; }
  const out = $("labout"), cv = $("lcv");
  $("ldone").onclick = mark;
  if(Array.isArray(l.quiz) && l.quiz.length){ mountLabQuiz($("lquiz"), l); }
  if(id === "labukur"){
    let cur = 0;
    const objekAcak = () => { cur = Math.round(80 + Math.random()*190)/10; };
    const hintUkur = () => `<div class="res warn" style="margin:0">Baca panjang objek dari mistar (ketelitian 0,1 cm). Masukkan hasil ukurmu lalu klik Periksa — usahakan di dalam toleransi ± 0,1 cm.</div>`;
    const simpan = (v) => {
      if(isNaN(v)){ out.innerHTML = `<div class="res warn" style="margin:0">Isi dulu hasil ukurmu dengan angka (contoh: <b>13,6</b>).</div>`; play("salah"); return; }
      const selisih = Math.abs(v - cur), ok = selisih <= 0.1001;
      out.innerHTML = ok
        ? `<div class="res ok" style="margin:0">✔ Tepat! Hasil ukurmu <b>${v} cm</b> selisih ${selisih.toFixed(2)} cm dari objek ${cur} cm — masih dalam toleransi 0,1 cm. Klik "🎲 Objek acak" untuk pengukuran baru, atau kerjakan mini kuis di bawah.</div>`
        : `<div class="res warn" style="margin:0">Belum pas. Hasilmu <b>${v} cm</b>, selisih ${selisih.toFixed(2)} cm dari objek sebenarnya. Perhatikan tepi depan objek — mulai dari angka ${Math.floor(cur)} cm lalu tambah ×0,1 per garis kecil.</div>`;
      play(ok?"benar":"salah");
    };
    objekAcak();
    const drawUkur = () => {
      const g = ctxOf(cv);
      if(!g){ out.innerHTML = `<div class="res ok" style="margin:0">Objek acak terpasang pada posisi ${cur} cm.</div>`; return; }
      const W = 640, H = 360, ppc = 19, x0 = 24, ybar = 150, hb = 54;
      g.clearRect(0,0,W,H);
      g.fillStyle = "#0d1230"; g.fillRect(0,0,W,H);
      g.fillStyle = "#10214f"; g.fillRect(x0-4, ybar, 30*ppc+8, hb);
      g.strokeStyle = "#cfe0ff"; g.lineWidth = 2; g.strokeRect(x0-4, ybar, 30*ppc+8, hb);
      g.fillStyle = "rgba(255,255,255,.10)"; g.fillRect(x0-4, ybar, (30*ppc+8)/3, hb);
      for(let cm = 0; cm <= 300; cm++){
        const x = x0 + cm/10*ppc, mayor = cm % 10 === 0, half = cm % 5 === 0;
        g.strokeStyle = mayor ? "#8ea2c9" : half ? "rgba(142,162,201,.7)" : "rgba(142,162,201,.4)";
        g.lineWidth = mayor ? 2 : 1.2;
        g.beginPath(); g.moveTo(x, ybar); g.lineTo(x, ybar + (mayor ? 24 : half ? 17 : 11)); g.stroke();
        if(mayor){ g.fillStyle = "#cfe0ff"; g.font = "12px monospace"; g.fillText(String(cm/10), x - 4, ybar + 40); }
      }
      g.fillStyle = "#cfe0ff"; g.font = "13px sans-serif"; g.fillText("cm", x0 + 30*ppc + 10, ybar + 42);
      const xo = x0 + cur*ppc, yobj = ybar - 64;
      g.fillStyle = "#0d9488"; g.fillRect(xo, yobj, 34, 64);
      g.fillStyle = "rgba(255,255,255,.25)"; g.fillRect(xo + 26, yobj, 8, 64);
      g.strokeStyle = "#9fe0b6"; g.lineWidth = 2; g.strokeRect(xo, yobj, 34, 64);
      g.fillStyle = "#9fe0b6"; g.font = "14px sans-serif"; g.fillText("objek", xo - 4, yobj - 10);
      g.strokeStyle = "#ffd84d"; g.lineWidth = 2; g.setLineDash([5,4]);
      g.beginPath(); g.moveTo(xo, yobj + 64); g.lineTo(xo, ybar + 58); g.stroke(); g.setLineDash([]);
      g.fillStyle = "#ffd84d"; g.font = "13px sans-serif"; g.fillText("tepi depan ↓", xo + 6, ybar + 72);
      out.innerHTML = hintUkur();
    };
    $("lacak").onclick = () => { play("klik"); objekAcak(); drawUkur(); };
    const cek = () => { const v = parseFloat(String($("lrep").value).replace(",", ".")); simpan(v); };
    $("lok").onclick = cek;
    $("lrep").addEventListener("keydown", e => { if(e.key === "Enter") cek(); });
    drawUkur();
  }
  if(id === "labgerak"){
    const read = () => {
      const v0 = +$("lv0").value, a = +$("la2").value, t = +$("lt2").value;
      $("ov0").textContent = v0; $("oa2").textContent = a; $("ot2").textContent = t;
      fxGerak(v0, a, t);
    };
    ["lv0","la2","lt2"].forEach(x => $(x).addEventListener("input", read));
    document.querySelectorAll("[data-gp]").forEach(b => b.onclick = () => {
      const parts = String(b.dataset.gp).split(",").map(Number);
      $("lv0").value = parts[0]; $("la2").value = parts[1];
      play("klik"); read();
    });
    read();
  }
  if(id === "labenergi"){
    let gCur = 10;
    const read = () => {
      const m = +$("lm").value, h = +$("lh").value;
      $("om").textContent = m; $("oh").textContent = h;
      fxEnergi(m, h, gCur);
    };
    ["lm","lh"].forEach(x => $(x).addEventListener("input", read));
    document.querySelectorAll("[data-gp]").forEach(b => b.onclick = () => { gCur = +b.dataset.gp; play("klik"); read(); });
    read();
  }
  function mountLabQuiz(box, L){
    if(!box) return;
    const items = L.quiz.map(shuffleQ);
    let i = 0, correct = 0, answered = false;
    const draw = () => {
      if(i >= items.length){
        box.innerHTML = `<div class="res ${correct === items.length ? "ok" : "warn"}" style="margin:0">Mini kuis ${L.emoji}: ${correct} dari ${items.length} benar. <button class="btn ghost sm" id="lq-retry">↻ Ulangi</button></div>`;
        box.querySelector("#lq-retry").onclick = () => { i = 0; correct = 0; answered = false; draw(); };
        return;
      }
      const q = items[i];
      box.innerHTML = `<div class="sec-h" style="margin-bottom:8px"><span class="ic">🧩</span>
          <h2 style="font-size:16px">${esc(L.name)} · mini kuis ${i+1}/${items.length}</h2></div>
        <div class="qtext">${i+1}. ${esc(q.q)}</div>
        ${q.num ? `<div class="row" style="margin-top:10px"><input class="qin" id="lq-num" inputmode="decimal" placeholder="Jawaban angka…">
            <button class="btn" id="lq-chk">Periksa</button></div>`
          : `<div class="qopts">${q.o.map((t,k) => `<button class="qopt" data-k="${k}">${String.fromCharCode(65+k)}. ${esc(t)}</button>`).join("")}</div>`}
        <div id="lq-fb" class="qfb"></div>
        <div class="row" style="margin-top:10px"><button class="btn ghost" id="lq-next" disabled>${i === items.length-1 ? "Lihat hasil" : "Soal berikutnya →"}</button></div>`;
      const next = box.querySelector("#lq-next");
      if(q.num){
        const cek = () => {
          if(answered) return; answered = true;
          const v = parseFloat(box.querySelector("#lq-num").value.replace(",", "."));
          const ok = !isNaN(v) && Math.abs(v - q.ans) < 0.011;
          if(ok) correct++;
          box.querySelector("#lq-fb").innerHTML = `<span class="${ok?"ok":"no"}">${ok?"✔ Benar!":"✘ Salah"} — jawaban: ${q.ans}</span>`
            + (q.w ? `<div class="small muted" style="margin-top:6px">${esc(q.w)}</div>` : "");
          play(ok?"benar":"salah"); next.disabled = false;
        };
        box.querySelector("#lq-chk").onclick = cek;
        box.querySelector("#lq-num").addEventListener("keydown", e => { if(e.key === "Enter") cek(); });
      } else {
        box.querySelectorAll(".qopt").forEach(b => b.onclick = () => {
          if(answered) return; answered = true;
          const k = +b.dataset.k, ok = k === q.a;
          if(ok) correct++;
          box.querySelectorAll(".qopt").forEach((x,xi) => {
            if(xi === q.a) x.classList.add("ok"); else if(xi === k) x.classList.add("no"); else x.classList.add("dim");
            x.disabled = true;
          });
          play(ok?"benar":"salah");
          box.querySelector("#lq-fb").innerHTML = `<span class="${ok?"ok":"no"}">${ok?"✔ Benar!":"✘ Salah"}</span>`
            + (q.w ? `<div class="small muted" style="margin-top:6px">${esc(q.w)}</div>` : "");
          next.disabled = false;
        });
      }
      next.onclick = () => { i++; answered = false; draw(); };
    };
    draw();
  }
  function fxGerak(v0, a, tt){
    const g = ctxOf(cv); if(!g) return;
    const W = 640, H = 360;
    const sT = v0*tt + 0.5*a*tt*tt, vT = v0 + a*tt;
    const sMax = Math.max(Math.abs(v0*10 + 0.5*a*100), Math.abs(v0*-4 + 0.5*a*16), 10, Math.abs(sT));
    const sy = v => 168 - v * (120 / sMax), sx = k => 60 + k/10 * (W-90);
    g.clearRect(0,0,W,H); grid(g,W,H);
    g.strokeStyle = "#8ea2c9"; g.lineWidth = 2;
    g.beginPath(); g.moveTo(40, sy(0)); g.lineTo(W-40, sy(0)); g.moveTo(sx(0), 30); g.lineTo(sx(0), H-40); g.stroke();
    g.fillStyle = "#8ea2c9"; g.font = "12px monospace";
    g.fillText("s (m)", 8, 46); g.fillText("t (s)", W-58, sy(0)+18);
    for(let k = 1; k <= 10; k++){ g.strokeStyle = "rgba(255,255,255,.14)"; g.beginPath(); g.moveTo(sx(k), sy(0)-4); g.lineTo(sx(k), sy(0)+4); g.stroke(); if(k % 2 === 0){ g.fillStyle = "#5c6b8a"; g.fillText(String(k), sx(k)-4, sy(0)+18); } }
    g.strokeStyle = "#46c97c"; g.lineWidth = 3; g.beginPath(); let mv = true;
    for(let k = -2; k <= 10; k += .1){ const yy = sy(v0*k + 0.5*a*k*k); if(yy < 24 || yy > H-30){ mv = true; continue; } const px = sx(Math.max(k,0)); if(mv){ g.moveTo(px, yy); mv = false; } else g.lineTo(px, yy); }
    g.stroke();
    g.strokeStyle = "#6aa3ff"; g.lineWidth = 2.5; g.setLineDash([7,5]); g.beginPath(); mv = true;
    const vMax = Math.max(Math.abs(v0 + a*10), Math.abs(v0), Math.abs(a), 1);
    for(let k = 0; k <= 10; k += .1){ const vy = 92 - (v0 + a*k) * (52/vMax) ; if(mv){ g.moveTo(sx(k), vy); mv = false; } else g.lineTo(sx(k), vy); }
    g.stroke(); g.setLineDash([]);
    const yu = sy(0);
    if(tt >= 0){ g.fillStyle = "#ffd84d"; g.beginPath(); g.arc(sx(Math.max(tt,0)), sy(sT), 7, 0, 7); g.fill(); }
    g.fillStyle = "#cfe0ff"; g.font = "13px sans-serif";
    g.fillText("— s vs t (hijau) · -- v vs t (biru)", 60, 26);
    const konsep = a === 0 ? "GLB — v konstan" : (a > 0 ? "GLBB dipercepat" : "GLBB diperlambat");
    out.innerHTML = `<div><span class="eyebrow">v akhir</span><b>${vT.toFixed(1)} m/s</b></div>
      <div><span class="eyebrow">posisi (t = ${tt} s)</span><b>${sT.toFixed(1)} m</b></div>
      <div><span class="eyebrow">jenis gerak</span><b>${konsep}</b></div>
      <div><span class="eyebrow">model</span><b>s = v₀·t + ½·a·t²</b></div>`;
  }
  function fxEnergi(m, h, gval){
    const g = ctxOf(cv); if(!g) return;
    const W = 640, H = 360;
    g.clearRect(0,0,W,H); grid(g,W,H);
    const total = m * gval * 20, EP = m * gval * h, EK = m * gval * (20 - h);
    const bw = 74, gap = 46, x0 = 340, base = H - 60, ux = 220 / Math.max(total, 1);
    g.fillStyle = "#0d1230"; g.fillRect(0,0,W,H);
    g.strokeStyle = "rgba(255,255,255,.08)"; g.lineWidth = 1;
    for(let x = 0; x <= W; x += 32){ g.beginPath(); g.moveTo(x,0); g.lineTo(x,H); g.stroke(); }
    for(let y = 0; y <= H; y += 32){ g.beginPath(); g.moveTo(0,y); g.lineTo(W,y); g.stroke(); }
    const lvl = base - h * 12;
    g.strokeStyle = "#5c6b8a"; g.lineWidth = 2;
    g.beginPath(); g.moveTo(60, base + 2); g.lineTo(280, base + 2); g.stroke();
    g.fillStyle = "#5c6b8a"; g.font = "12px sans-serif"; g.fillText("tanah", 62, base + 18);
    g.fillStyle = "rgba(159,224,182,.15)"; g.fillRect(90, 78, 160, base - 78);
    g.strokeStyle = "#9fe0b6"; g.setLineDash([6,5]); g.strokeRect(90, 78, 160, base - 78); g.setLineDash([]);
    g.fillStyle = "#9fe0b6"; g.font = "12px sans-serif"; g.fillText("20 m", 250, 84);
    const yb = base - h*12;
    g.fillStyle = "#46c97c"; g.beginPath(); g.arc(170, Math.max(yb - 12, 88), 15, 0, 7); g.fill();
    g.fillStyle = "#ffd84d"; g.font = "13px sans-serif"; g.fillText("bola (m=" + m + " kg)", 130, yb - 34);
    const bar = (x, val, col, lab) => {
      const bh = val * ux;
      g.fillStyle = col; g.fillRect(x, base - bh, bw, bh);
      g.strokeStyle = "#ffffff22"; g.strokeRect(x, base - bh, bw, bh);
      g.fillStyle = col; g.font = "bold 13px sans-serif"; g.fillText(lab, x + 8, base - bh - 8);
    };
    bar(x0, EP, "#0d9488", "EP");
    bar(x0 + bw + gap, EK, "#6aa3ff", "EK");
    bar(x0 + 2*(bw + gap), Math.max(total, EP + EK), "#ffd84d", "TOTAL");
    g.fillStyle = "#cfe0ff"; g.font = "12px sans-serif";
    out.innerHTML = `<div><span class="eyebrow">EP (pada h)</span><b>${EP.toFixed(1)} J</b></div>
      <div><span class="eyebrow">EK (menjelang tanah)</span><b>${EK.toFixed(1)} J</b></div>
      <div><span class="eyebrow">Total energi</span><b>${total.toFixed(1)} J</b></div>
      <div><span class="eyebrow">g</span><b>${gval} m/s²</b></div>
      <div><span class="eyebrow">v saat di tanah</span><b>${Math.sqrt(2*gval*20).toFixed(1)} m/s</b> <span class="eyebrow">(jatuh dari 20 m)</span></div>`;
  }
  if(id === "labgraf"){
    const read = () => { const a = +$("la").value, b = +$("lb").value, c = +$("lc").value;
      $("oa").value = a; $("ob").value = b; $("oc").value = c; drawGraf(a,b,c); };
    ["la","lb","lc"].forEach(x => $(x).addEventListener("input", read));
    read();
  }
  if(id === "labtrigo"){
    const read = () => { const t = +$("lt").value; $("ot").value = t; drawTrigo(t); };
    $("lt").addEventListener("input", read); read();
  }
  if(id === "labstat"){
    const run = () => drawStat($("lds").value);
    $("ldraw").onclick = run;
    $("lout").onclick = () => { $("lds").value = $("lds").value + ",99"; run(); };
    run();
  }
  function grid(g, W, H){
    g.fillStyle = "#0d1230"; g.fillRect(0,0,W,H);
    g.strokeStyle = "rgba(255,255,255,.08)"; g.lineWidth = 1;
    for(let x=0;x<=W;x+=32){ g.beginPath(); g.moveTo(x,0); g.lineTo(x,H); g.stroke(); }
    for(let y=0;y<=H;y+=32){ g.beginPath(); g.moveTo(0,y); g.lineTo(W,y); g.stroke(); }
  }
  function drawGraf(a,b,c){
    const g = ctxOf(cv); if(!g){ out.innerHTML = fallbackStats(a,b,c); return; }
    const W = 640, H = 360, sx = x => W/2 + x*(W/24), sy = y => H/2 - y*(H/24);
    grid(g,W,H);
    g.strokeStyle = "#8ea2c9"; g.lineWidth = 2;
    g.beginPath(); g.moveTo(0,sy(0)); g.lineTo(W,sy(0)); g.moveTo(sx(0),0); g.lineTo(sx(0),H); g.stroke();
    g.fillStyle = "#8ea2c9"; g.font = "12px monospace";
    g.fillText("x", W-16, sy(0)-8); g.fillText("y", sx(0)+8, 14);
    const D2 = b*b - 4*a*c;
    g.strokeStyle = a === 0 ? "#ffb054" : "#6aa3ff"; g.lineWidth = 3; g.beginPath();
    let started = false;
    for(let px = 0; px <= W; px += 2){
      const x = (px - W/2) / (W/24);
      const y = a*x*x + b*x + c;
      const py = sy(y);
      if(py < -50 || py > H+50){ started = false; continue; }
      if(!started){ g.moveTo(px, py); started = true; } else g.lineTo(px, py);
    }
    g.stroke();
    const vx = -b/(2*a || 1), vy = a*vx*vx + b*vx + c;
    if(a !== 0){ g.fillStyle = "#ffd84d"; g.beginPath(); g.arc(sx(vx), sy(vy), 6, 0, 7); g.fill(); }
    if(a !== 0 && D2 >= 0){ const r1 = (-b + Math.sqrt(D2))/(2*a), r2 = (-b - Math.sqrt(D2))/(2*a);
      g.fillStyle = "#46c97c";
      [r1,r2].forEach(r => { g.beginPath(); g.arc(sx(r), sy(0), 6, 0, 7); g.fill(); }); }
    out.innerHTML = `<div><span class="eyebrow">Diskriminan</span><b>${D2}</b></div>
      <div><span class="eyebrow">Puncak</span><b>${a===0?"—":`(${vx.toFixed(2)}, ${vy.toFixed(2)})`}</b></div>
      <div><span class="eyebrow">Sumbu simetri</span><b>${a===0?"—":`x = ${vx.toFixed(2)}`}</b></div>
      <div><span class="eyebrow">Akar</span><b>${a===0?"—":D2>0?`${((-b+Math.sqrt(D2))/(2*a)).toFixed(2)}, ${((-b-Math.sqrt(D2))/(2*a)).toFixed(2)}`:D2===0?"kembar":"imajiner"}</b></div>
      <div><span class="eyebrow">Arah buka</span><b>${a===0?"garis":a>0?"ke atas ↑":"ke bawah ↓"}</b></div>`;
  }
  function fallbackStats(a,b,c){ const D2=b*b-4*a*c;
    return `<div><span class="eyebrow">Diskriminan</span><b>${D2}</b></div>
      <div><span class="eyebrow">Puncak</span><b>${a?`x=${(-b/(2*a)).toFixed(2)}`:"—"}</b></div>`; }
  function drawTrigo(t){
    const g = ctxOf(cv); if(!g){ out.innerHTML = trigOut(t); return; }
    const W = 640, H = 360; grid(g,W,H);
    const rad = t * Math.PI/180;
    const base = 420, x0 = 90, y0 = 300;
    const opp = base * Math.tan(rad);
    const scale = Math.min(1, 240 / Math.max(opp, 1));
    const x1 = x0 + base, y1 = y0 - opp*scale;
    g.strokeStyle = "#46c97c"; g.lineWidth = 4;
    g.beginPath(); g.moveTo(x0,y0); g.lineTo(x1,y0); g.lineTo(x1,y1); g.closePath(); g.stroke();
    g.strokeStyle = "#8ea2c9"; g.lineWidth = 3;
    g.beginPath(); g.moveTo(x0,y0); g.lineTo(x1,y1); g.stroke();
    g.strokeStyle = "#ffd84d"; g.lineWidth = 2;
    g.beginPath(); g.arc(x0, y0, 34, -rad, 0); g.stroke();
    g.fillStyle = "#ffd84d"; g.font = "bold 16px sans-serif"; g.fillText(t + "°", x0 + 40, y0 - 10);
    g.fillStyle = "#cfe0ff"; g.font = "14px sans-serif";
    g.fillText("samping = " + base, (x0+x1)/2 - 40, y0 + 24);
    g.save(); g.translate(x1 + 16, (y0+y1)/2); g.fillText("depan ≈ " + (opp*scale/ (scale||1)).toFixed(1), 0, 0); g.restore();
    g.fillText("hipotenusa", (x0+x1)/2, (y0+y1)/2 - 10);
    out.innerHTML = trigOut(t);
  }
  function trigOut(t){
    const r = t*Math.PI/180, s = Math.sin(r), c = Math.cos(r), tn = Math.tan(r);
    const d = (v) => (Math.round(v*1000)/1000).toFixed(3);
    return `<div><span class="eyebrow">sin ${t}°</span><b>${d(s)}</b></div>
      <div><span class="eyebrow">cos ${t}°</span><b>${d(c)}</b></div>
      <div><span class="eyebrow">tan ${t}°</span><b>${d(tn)}</b></div>
      <div><span class="eyebrow">sin²+cos²</span><b>${d(s*s+c*c)}</b></div>`;
  }
  function drawStat(str){
    const data = str.split(/[,;\s]+/).map(x => parseFloat(x.replace(",", "."))).filter(x => !isNaN(x)).sort((a,b)=>a-b);
    const g = ctxOf(cv);
    if(!data.length){ out.innerHTML = `<div><span class="eyebrow">Data</span><b>masukkan angka</b></div>`; return; }
    const q = p => { const pos = (data.length-1)*p, lo = Math.floor(pos), hi = Math.ceil(pos);
      return data[lo] + (data[hi]-data[lo])*(pos-lo); };
    const q1 = q(.25), q2 = q(.5), q3 = q(.75), iqr = q3-q1;
    const lo = q1 - 1.5*iqr, hi = q3 + 1.5*iqr;
    const inl = data.filter(x => x >= lo && x <= hi);
    const outs = data.filter(x => x < lo || x > hi);
    const min = inl[0], max = inl[inl.length-1];
    const mean = data.reduce((s,x)=>s+x,0)/data.length;
    if(g){
      const W = 640, H = 360; grid(g,W,H);
      const dmin = Math.min(...data), dmax = Math.max(...data);
      const sx = v => 60 + (v - dmin) / ((dmax - dmin) || 1) * (W - 120);
      g.strokeStyle = "#8ea2c9"; g.lineWidth = 2;
      g.beginPath(); g.moveTo(40, 130); g.lineTo(W-40, 130); g.stroke();
      g.fillStyle = "#6aa3ff"; g.strokeStyle = "#cfe0ff"; g.lineWidth = 2;
      const bx1 = sx(q1), bx2 = sx(q3);
      g.fillRect(bx1, 80, bx2-bx1, 100); g.strokeRect(bx1, 80, bx2-bx1, 100);
      g.fillStyle = "#ffd84d"; g.fillRect(sx(q2)-2, 80, 4, 100);
      g.strokeStyle = "#46c97c"; g.lineWidth = 3;
      g.beginPath(); g.moveTo(sx(min), 130); g.lineTo(bx1, 130); g.moveTo(bx2, 130); g.lineTo(sx(max), 130); g.stroke();
      g.fillStyle = "#ff8a5c";
      outs.forEach(v => { g.beginPath(); g.arc(sx(v), 130, 6, 0, 7); g.fill(); });
      g.fillStyle = "#cfe0ff"; g.font = "13px sans-serif";
      g.fillText("Box plot — garis kuning = median", 46, 66);
      const bins = 6, lo2 = dmin, span = (dmax - dmin) || 1;
      const counts = new Array(bins).fill(0);
      data.forEach(v => { let bi = Math.floor((v - lo2)/span*bins); if(bi >= bins) bi = bins-1; counts[bi]++; });
      const mx = Math.max(...counts), bw = (W-120)/bins, base = H-40;
      counts.forEach((c2,i) => { const h = c2/mx*(H-240);
        g.fillStyle = i%2 ? "#a789ff" : "#c084fc";
        g.fillRect(60 + i*bw, base - h, bw, h);
        g.strokeStyle = "#140d33"; g.strokeRect(60 + i*bw, base - h, bw, h); });
      g.fillStyle = "#cfe0ff"; g.fillText("Histogram (batang rapat)", 66, H - 18);
    }
    out.innerHTML = `<div><span class="eyebrow">n / min / maks</span><b>${data.length} · ${min} · ${max}</b></div>
      <div><span class="eyebrow">Q1 / Q2 / Q3</span><b>${q1} · ${q2} · ${q3}</b></div>
      <div><span class="eyebrow">IQR</span><b>${iqr}</b></div>
      <div><span class="eyebrow">Rerata</span><b>${(Math.round(mean*100)/100)}</b></div>
      <div><span class="eyebrow">Batas pencilan</span><b>${lo} – ${hi}</b></div>
      <div><span class="eyebrow">Pencilan</span><b>${outs.length?outs.join(", "):"tidak ada"}</b></div>`;
  }
};
const SEQ_STEPS = [
  "Baca soal berkali-kali dan gambar ulang situasinya.",
  "Identifikasi data yang diketahui dan yang ditanyakan.",
  "Pilih model/rumus yang paling tepat.",
  "Kerjakan langkah demi langkah dengan rapi.",
  "Uji ulang hasilnya: masuk akal tidak?"];

/* ================= E-BOOK ================= */
let ebPage = 0;
VIEWS.ebook = (id) => {
  if(!id){
    return `<div class="stack">
      <div class="sec-h"><span class="ic">📗</span><h2>Buku Digital &amp; Ringkasan Materi</h2>
        <span class="right pill">${EBOOKS.length} buku</span></div>
      <div class="labgrid">${EBOOKS.map(bk => `<button class="labcard" data-eb="${bk.id}">
        <span class="li">${bk.emoji}</span>
        <span><span class="eyebrow">${bk.pages.length} halaman</span>
          <h3>${esc(bk.title)}</h3>
          <p class="small muted">${esc(bk.pages[0].h)} · ${esc(bk.pages[1] ? bk.pages[1].h : "")}</p></span></button>`).join("")}</div>
      <div class="card pad"><div class="sec-h" style="margin-bottom:8px"><span class="ic">📚</span><h2 style="font-size:18px">Glosarium cepat</h2></div>
        <div class="chips">${GLOS.map(([k,v])=>`<span class="chip" title="${esc(v)}"><b>${esc(k)}</b></span>`).join("")}</div>
        <p class="small muted" style="margin-top:8px">Arahkan kursor ke istilah untuk definisi singkat.</p></div></div>`;
  }
  const bk = EBOOKS.find(x => x.id === id) || EBOOKS[0];
  if(ebPage >= bk.pages.length) ebPage = 0;
  const pg = bk.pages[ebPage];
  const paras = pg.t.split("\n\n").map(p => `<p style="margin-bottom:10px">${esc(p).replace(/\n/g,"<br>")}</p>`).join("");
  return `<div class="stack">
    <div class="sec-h"><span class="ic">${bk.emoji}</span><h2>${esc(bk.title)}</h2>
      <span class="right pill">Hal. ${ebPage+1}/${bk.pages.length}</span></div>
    <div class="card tbl-wrap"><table><tbody>
      <tr><td style="width:180px"><b>Daftar isi</b></td><td>${bk.pages.map((p,i)=>
        `<button class="btn ghost sm" data-ebp="${i}" style="margin:2px">${i+1}. ${esc(p.h)}</button>`).join("")}</td></tr>
    </tbody></table></div>
    <div class="card pad"><span class="eyebrow">${esc(bk.title)} · ${ebPage+1}/${bk.pages.length}</span>
      <h2 style="margin-top:4px">${esc(pg.h)}</h2>
      <div class="model" style="margin-top:12px">${paras}</div>
      <div class="row" style="margin-top:14px">
        <button class="btn ghost" id="eb-prev" ${ebPage===0?"disabled":""}>← Sebelumnya</button>
        <button class="btn ghost" id="eb-next" ${ebPage===bk.pages.length-1?"disabled":""}>Berikutnya →</button>
        <button class="btn sm" id="eb-done">✅ Tandai dibaca</button></div></div></div>`;
};
BIND.ebook = (id) => {
  document.querySelectorAll("[data-eb]").forEach(b => b.onclick = () => { ebPage = 0; play("klik"); go("ebook", b.dataset.eb); });
  document.querySelectorAll("[data-ebp]").forEach(b => b.onclick = () => { ebPage = +b.dataset.ebp; render(); });
  if(!id) return;
  $("eb-prev") && ($("eb-prev").onclick = () => { ebPage--; play("klik"); render(); });
  $("eb-done") && ($("eb-done").onclick = () => toast("Halaman ditandai dibaca 📗"));
  const nx = $("eb-next"); if(nx) nx.onclick = () => { ebPage++; play("klik"); render(); };
};
/* ================= FORUM ================= */
function initials(name){
  const p = String(name || "Murid Kelas X").trim().split(/\s+/);
  const a = (p[0] || "M")[0] || "M", b = (p[1] || "")[0] || "";
  return (a + b).toUpperCase();
}
function threads(){
  if(!D.forum){ D.forum = JSON.parse(JSON.stringify(FORUM_SEED)); save(); }
  return D.forum;
}
VIEWS.forum = (id) => {
  const list = threads();
  if(id){
    const t = list.find(x => x.id === +id);
    if(!t) return VIEWS.forum();
    return `<div class="stack">
      <button class="back" data-fback="1">← Semua diskusi</button>
      <div class="card pad">
        <span class="eyebrow">${esc(t.time)} · ${t.replies.length} balasan</span>
        <h2 style="margin-top:4px">${esc(t.title)}</h2>
        <div class="row" style="margin-top:10px"><span class="ava ${t.role==="guru"?"guru":""}">${esc(t.av)}</span>
          <b>${esc(t.who)}</b>${t.role==="guru"?'<span class="pill e1">Guru</span>':""}</div>
        <p style="margin-top:12px">${esc(t.body)}</p></div>
      ${t.replies.map(r => `<div class="card pad" style="background:var(--soft)">
        <div class="row"><span class="ava ${r.role==="guru"?"guru":""}">${esc(r.av)}</span>
          <b>${esc(r.who)}</b>${r.role==="guru"?'<span class="pill e1">Guru</span>':""}
          <span class="small muted" style="margin-left:auto">${esc(r.time)}</span></div>
        <p style="margin-top:8px">${esc(r.body)}</p></div>`).join("")}
      <div class="card pad">
        <div class="sec-h" style="margin-bottom:8px"><span class="ic">💬</span><h2 style="font-size:18px">Tulis balasan</h2></div>
        <textarea id="f-reply" rows="3" placeholder="Jelaskan dengan bahasamu sendiri — boleh pakai contoh angka..."></textarea>
        <button class="btn" id="f-send" style="margin-top:10px">Kirim balasan</button></div></div>`;
  }
  return `<div class="stack">
    <div class="sec-h"><span class="ic">💬</span><h2>Diskusi Kelas ${META.short} X</h2>
      <span class="right pill">${list.length} diskusi</span></div>
    <div class="card pad">
      <div class="sec-h" style="margin-bottom:8px"><span class="ic">✍️</span><h2 style="font-size:18px">Buat diskusi baru</h2></div>
      <label class="f">Judul<input type="text" id="f-title" placeholder="mis. Saya belum paham bagian ini, bisa dibantu?"></label>
      <label class="f" style="margin-top:10px">Pertanyaan<textarea id="f-body" rows="3" placeholder="Tulis pertanyaanmu..."></textarea></label>
      <button class="btn" id="f-new" style="margin-top:10px">Tulis diskusi</button></div>
    ${list.map(t => `<div class="forum-row" data-ft="${t.id}">
      <span class="ava ${t.role==="guru"?"guru":""}">${esc(t.av)}</span>
      <span style="min-width:0"><b>${esc(t.title)}</b>
        <div class="small muted">${esc(t.who)} · ${esc(t.time)} · ${t.replies.length} balasan</div></span>
      <span class="chev" style="margin-left:auto;color:var(--muted)">›</span></div>`).join("")}</div>`;
};
BIND.forum = (id) => {
  document.querySelectorAll("[data-ft]").forEach(r => r.onclick = () => { play("klik"); go("forum", r.dataset.ft); });
  document.querySelector("[data-fback]")?.addEventListener("click", () => go("forum"));
  document.querySelector("#f-new")?.addEventListener("click", () => {
    const ti = $("f-title").value.trim(), bo = $("f-body").value.trim();
    if(!ti || !bo) return toast("Isi judul dan pertanyaan dulu 🙂");
    const list = threads();
    list.unshift({ id: Date.now(), av: initials(D.nama), who: D.nama || "Murid Kelas X", role:"",
      time:"baru saja", title: ti, body: bo, replies: [] });
    save(); toast("Diskusi diposting 💬"); go("forum"); });
  document.querySelector("#f-send")?.addEventListener("click", () => {
    const ta = $("f-reply"), v = ta.value.trim();
    if(!v) return toast("Tulis balasanmu dulu 🙂");
    const t = threads().find(x => x.id === +id);
    t.replies.push({ av: initials(D.nama), who: D.nama || "Murid Kelas X", role:"", time:"baru saja", body: v });
    save(); toast("Balasan terkirim ✅"); render(); });
};

/* ================= RESOURCES ================= */
VIEWS.res = () => {
  const jumps = [["📘","Buku Digital","ebook"],["🧪","Lab","lab"],["🎮","Gim","game"],["🗺️","ATP","path"],
    ["✅","Asesmen","quiz"],["📈","Nilai","grades"],["💬","Diskusi","forum"],["🤖","Teman Sejarah","bot"]];
  return `<div class="stack">
    <div class="sec-h"><span class="ic">📎</span><h2>Sumber Belajar</h2>
      <span class="right pill">pintasan &amp; referensi</span></div>
    <div class="card pad"><div class="res-ic">${jumps.map(([ic,lb,v])=>
      `<button data-jump="${v}"><span class="c">${ic}</span>${lb}</button>`).join("")}</div></div>
    <div class="card pad"><div class="sec-h" style="margin-bottom:10px"><span class="ic">📚</span><h2 style="font-size:18px">Sumber belajar</h2></div>
      ${SUMBER.map(([t,d])=>`<div class="task" style="margin-top:8px"><b>${esc(t)}</b><p class="small muted">${esc(d)}</p></div>`).join("")}</div>
    <div class="card pad"><div class="sec-h" style="margin-bottom:10px"><span class="ic">🔎</span><h2 style="font-size:18px">Glosarium</h2>
      <span class="right pill">${GLOS.length} istilah</span></div>
      <div class="tbl-wrap"><table><tbody>${GLOS.map(([k,v])=>
        `<tr><td style="width:180px"><b>${esc(k)}</b></td><td>${esc(v)}</td></tr>`).join("")}</tbody></table></div></div>
    <div class="card pad" style="background:var(--e2bg);border-color:var(--e2line)">
      <b>📌 Referensi resmi:</b> <span class="small">${esc(META.refText || "")}</span></div></div>`;
};
BIND.res = () => {
  document.querySelectorAll("[data-jump]").forEach(b => b.onclick = () => { play("klik"); go(b.dataset.jump); });
};

/* ================= BOT CHAT ================= */
function botReply(t){
  for(const [re, ans] of BOT_RULES) if(re.test(t)) return ans;
  return BOT_FALLBACK;
}
VIEWS.bot = () => {
  const msgs = D.chat.map(m => `<div class="msg ${m.who==="me"?"me":"bot"}">${esc(m.t)}</div>`).join("");
  const quick = QUICK;
  return `<div class="stack">
    <div class="sec-h"><span class="ic">🤖</span><h2>${BOT_NAME}</h2>
      <span class="right row"><button class="btn ghost sm" id="b-clear">Bersihkan obrolan</button></span></div>
    <div class="card pad">
      <div class="chat" id="chat">${msgs}</div>
      <div class="row" style="margin-top:12px"><input type="text" id="b-in" placeholder="Tanya apa saja…" style="flex:1;min-width:200px">
        <button class="btn" id="b-send">Kirim</button></div>
      <div class="row" style="margin-top:10px">${quick.map(q=>`<button class="btn ghost sm" data-bq="${q}">${q}</button>`).join("")}</div>
      <p class="small muted" style="margin-top:10px">Aturan jawaban luring — cocokkan dengan kata kunci konsep &amp; kiat belajar.</p></div></div>`;
};
BIND.bot = () => {
  const chat = $("chat"); chat.scrollTop = chat.scrollHeight;
  const send = (v) => {
    v = (v || "").trim(); if(!v) return;
    D.chat.push({ who:"me", t:v });
    D.chat.push({ who:"bot", t:botReply(v) });
    if(D.chat.length > 40) D.chat = D.chat.slice(-40);
    save(); play("klik"); render(); $("b-in")?.focus();
  };
  $("b-send").onclick = () => send($("b-in").value);
  $("b-in").addEventListener("keydown", e => { if(e.key === "Enter") send($("b-in").value); });
  document.querySelectorAll("[data-bq]").forEach(b => b.onclick = () => send(b.dataset.bq));
  $("b-clear").onclick = () => { D.chat = [{ who:"bot", t:BOT_INTRO }]; save(); render(); };
};

/* ================= GOOGLE SHEETS (opsional) ================= */
function gsUrl(){ return `https://script.google.com/macros/s/${D.gs}/exec`; }
function gsNilai(opt, s){
  try{
    if(!D.gs) return;
    if(typeof fetch !== "function") return;
    fetch(gsUrl(), { method:"POST",
      body: JSON.stringify({ t:"skor", siswa:D.nama, kelas:D.kelas, mapel:META.name,
        unit:(opt && opt.unit) || 0, jenis:(opt && opt.title) || "", skor:s, kktp:KKTP,
        waktu:new Date().toISOString() })
    }).catch(() => {});
  }catch(e){}
}

/* ================= SETTINGS ================= */
VIEWS.set = () => {
  const temas = [["","Otomatis"],["light","Terang"],["dark","Gelap"]];
  return `<div class="stack">
    <div class="sec-h"><span class="ic">⚙️</span><h2>Pengaturan</h2>
      <span class="right pill">LMS ${META.short} X v1</span></div>
    <div class="card pad">
      <div class="sec-h" style="margin-bottom:10px"><span class="ic">👤</span><h2 style="font-size:18px">Profil</h2></div>
      <div class="grid3">
        <label class="f">Nama lengkap<input type="text" id="s-nama" value="${esc(D.nama)}" placeholder="mis. Nadia Rahma"></label>
        <label class="f">Kelas<input type="text" id="s-kelas" value="${esc(D.kelas)}" placeholder="mis. X-1"></label>
        <label class="f">Sekolah<input type="text" id="s-sekolah" value="${esc(D.sekolah)}"></label>
      </div>
      <button class="btn" id="s-save" style="margin-top:12px">Simpan profil</button></div>
    <div class="grid2">
      <div class="card pad"><div class="sec-h" style="margin-bottom:10px"><span class="ic">🎨</span><h2 style="font-size:18px">Tema</h2></div>
        <div class="grade-pick">${temas.map(([v,lb])=>
          `<button class="${D.tema===v?"on":""}" data-tema="${v}">${lb}</button>`).join("")}</div>
        <label class="chk"><input type="checkbox" id="s-snd" ${soundOn?"checked":""}> Efek suara saat menjawab</label></div>
      <div class="card pad"><div class="sec-h" style="margin-bottom:10px"><span class="ic">💾</span><h2 style="font-size:18px">Penyimpanan</h2></div>
        <p class="small muted">Progres disimpan otomatis di perangkat ini (<code class="formula">${LS_KEY}</code>).</p>
        <div class="row" style="margin-top:10px">
          <button class="btn ghost" id="s-export">Salin cadangan progres</button>
          <button class="btn ${resetArmed?"orange":""}" id="s-reset">${resetArmed?"⚠️ Klik lagi untuk hapus":"Atur ulang progres"}</button></div></div>
    </div>
    <div class="card pad">
      <div class="sec-h" style="margin-bottom:10px"><span class="ic">🔗</span><h2 style="font-size:18px">Integrasi Google Sheets (opsional)</h2></div>
      <p class="small muted">Pengiriman skor otomatis ke Google Sheets guru. Kode aplikasi web dikunci permanen oleh pengaturan sekolah.</p>
      <label class="f" style="margin-top:10px">Kode Aplikasi Web<input type="text" id="s-gs" value="${esc(D.gs)}" placeholder="AKfycb..." ${SHEET_URL_DEFAULT?'readonly title="Dikunci oleh pengaturan guru (permanen)"':""}></label>
      <div class="sendbox ${D.gs?"":"off"}" style="margin-top:10px">
        <span>${D.gs?"🟢 Terhubung"+(SHEET_URL_DEFAULT?" (permanen)":"")+": siap mengirim skor":"⚪ Belum diatur — skor tersimpan lokal"}</span>
        <button class="btn sm ghost" id="s-gstest">Uji koneksi</button></div></div>
    <div class="card pad"><div class="sec-h" style="margin-bottom:8px"><span class="ic">ℹ️</span><h2 style="font-size:18px">Tentang</h2></div>
      <p class="small muted">${esc(META.about || "")} ${NU} unit · ${NU*JP_U} JP · KKTP ${KKTP}.</p></div></div>`;
};
let resetArmed = false;
BIND.set = () => {
  $("s-save").onclick = () => {
    D.nama = $("s-nama").value.trim();
    D.kelas = $("s-kelas").value.trim();
    D.sekolah = $("s-sekolah").value.trim() || D.sekolah;
    save(); updateUser(); toast("Profil tersimpan ✅"); render(); };
  document.querySelectorAll("[data-tema]").forEach(b => b.onclick = () => {
    D.tema = b.dataset.tema; save(); theme(); render(); });
  $("s-snd").onchange = e => { soundOn = e.target.checked; D.snd = soundOn; save(); if(soundOn) play("benar"); };
  $("s-export").onclick = () => {
    const txt = localStorage.getItem(LS_KEY) || "{}";
    if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).catch(()=>{});
    toast("Progres disalin ke papan klip 📋"); };
  $("s-gs").addEventListener("change", e => { D.gs = gsNorm(e.target.value); save(); render(); });
  $("s-gstest").onclick = () => {
    if(!D.gs) return toast("Isi kode aplikasi web dulu");
    if(typeof fetch !== "function") return toast("Peramban ini tidak mendukung pengiriman data");
    toast("Mengirim uji…");
    fetch(gsUrl(), { method:"POST", body: JSON.stringify({ t:"uji", siswa:D.nama || "", mapel:META.name || "" }) })
      .then(r => r.json())
      .then(d => toast(d && d.ok ? `Terhubung ✅ ${d.msg || ""}` : `Gagal: ${(d && d.error) || "respons tidak valid"}`))
      .catch(() => toast("Gagal terhubung — cek kode & akses (Siapa saja)")) };
  const rb = $("s-reset");
  rb.onclick = () => {
    if(!resetArmed){ resetArmed = true; rb.textContent = "⚠️ Klik lagi untuk hapus"; rb.classList.add("orange");
      setTimeout(() => { resetArmed = false; if($("s-reset")){ $("s-reset").textContent = "Atur ulang progres"; $("s-reset").classList.remove("orange"); } }, 4000);
      return; }
    D.u = {}; D.ex = { uts:0, uas:0, rem:0 }; D.g = {}; D.lab = {}; D.seq = {}; D.forum = null;
    D.chat = [{ who:"bot", t:BOT_INTRO }];
    resetArmed = false; save(); toast("Progres diatur ulang"); go("home"); };
};

/* ================= INIT (shell runtime) ================= */
function fillShell(){
  const set = (id, html) => { const el = $(id); if(el) el.innerHTML = html; };
  set("brandTitle", `${esc(META.name || "LMS")} <b>LMS</b>`);
  set("brandSub", `Kelas ${META.kelas || "X"} · ${META.fase || ""} · ${META.sekolah || ""}`);
  set("brandMoto", MOTOS.map(m => esc(String(m))).join("<i>•</i>"));
  const lt = $("brandLogoText"); if(lt) lt.textContent = META.logoText || "LMS";
  set("sideMoto", `${esc(String(SIDE_MOTOS[0] || ""))}<span>${esc(String(SIDE_MOTOS[1] || ""))}</span>${esc(String(SIDE_MOTOS[2] || ""))}`);
  set("sideNote", META.note || "");
  const slots = [[716,46,26],[880,150,30],[470,60,34],[352,140,22]];
  const labels = (META.scene || []).slice(0,4).map((t,i) => {
    const s = slots[i];
    return `<text x="${s[0]}" y="${s[1]}" fill="#dfe8ff" font-size="${s[2]}" font-family="Georgia" font-style="italic">${esc(String(t))}</text>`;
  }).join("");
  set("sceneBox", (META.sceneExtra || "") + labels);
}
function updateUser(){
  const nm = D.nama || "Murid Kelas X";
  $("userName").textContent = nm;
  $("userAv").textContent = initials(D.nama);
  $("userMeta").textContent = `${META.fase || "Fase E"}${D.kelas ? " · " + D.kelas : ""}`;
}
function boot(){
  load();
  try{
    const q = new URLSearchParams(location.search).get("gs");
    if(q && q.trim()){ D.gs = gsNorm(q); save(); }
  }catch(e){}
  theme();
  fillShell();
  soundOn = D.snd !== false;
  updateUser();
  document.querySelectorAll('[data-act="go"]').forEach(b => b.onclick = () => { play("klik"); go(b.dataset.v); });
  setupSearch();
  render();
}

/* ================= PENCARIAN ISI ================= */
function setupSearch(){
  const btn = document.createElement("button");
  btn.className = "btn ghost sm";
  btn.id = "global-search-btn";
  btn.innerHTML = "🔍 Cari";
  btn.style.marginLeft = "8px";
  btn.setAttribute("aria-label", "Cari materi");
  const user = document.querySelector(".top-in .user");
  if(user && user.parentNode) user.parentNode.insertBefore(btn, user);
  btn.onclick = openSearch;
}
function openSearch(){
  const root = $("modalRoot");
  root.innerHTML = `<div class="sheet-wrap" style="position:fixed;inset:0;z-index:80;display:grid;place-items:center;padding:16px">
    <div class="sheet-backdrop" data-close style="position:absolute;inset:0;background:rgba(0,0,0,.45)"></div>
    <div class="sheet" style="position:relative;width:100%;max-width:560px;max-height:80vh;overflow:auto;background:var(--card);border:1.5px solid var(--line);border-radius:16px;padding:16px;box-shadow:0 20px 50px rgba(0,0,0,.3)">
      <div class="sec-h" style="margin-bottom:10px"><span class="ic">🔍</span><h2 style="font-size:18px">Cari di ${esc(META.name || "LMS")}</h2></div>
      <input type="text" id="gs-input" placeholder="Cari judul unit, TP, kata kunci…" style="width:100%;margin-bottom:12px" autocomplete="off">
      <div id="gs-results"></div>
      <div style="margin-top:12px;text-align:right"><button class="btn ghost sm" data-close>Tutup</button></div>
    </div></div>`;
  root.querySelectorAll("[data-close]").forEach(el => el.onclick = () => { root.innerHTML = ""; });
  const inp = $("gs-input");
  inp.focus();
  const doSearch = () => {
    const term = inp.value.trim().toLowerCase();
    const box = $("gs-results");
    if(term.length < 2){ box.innerHTML = `<p class="small muted">Ketik minimal 2 huruf.</p>`; return; }
    const hits = [];
    UNITS.forEach(u => {
      const hay = [u.title, u.desc, ...(u.tp||[]).map(t => t.t + " " + t.c)].join(" ").toLowerCase();
      if(hay.includes(term)){
        const tpHit = (u.tp||[]).find(t => (t.t + " " + t.c).toLowerCase().includes(term));
        hits.push(`<button class="ucard" data-goto="${u.n}" style="width:100%;margin-bottom:8px">
          <span class="th" style="background:var(--soft)">${u.emoji || "📘"}</span>
          <span><b>Unit ${u.n} · ${esc(u.title)}</b><br><span class="small muted">${esc(u.desc || "")}</span>${tpHit ? `<br><span class="small" style="color:var(--blue)">${esc(tpHit.c)}: ${esc(tpHit.t)}</span>` : ""}</span>
          <span></span></button>`);
      }
    });
    box.innerHTML = hits.length ? hits.join("") : `<p class="small muted">Tidak ada hasil untuk “${esc(term)}”.</p>`;
    box.querySelectorAll("[data-goto]").forEach(b => b.onclick = () => {
      root.innerHTML = "";
      go("unit", parseInt(b.dataset.goto, 10), "materi");
    });
  };
  inp.addEventListener("input", doSearch);
}
boot();
