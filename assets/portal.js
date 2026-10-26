/* Portal LMS — kartu mapel, kelas X/XI/XII, tema terang/gelap/sistem,
   login admin (perangkat), CRUD tautan Netlify, pantau progres. Offline, localStorage. */
(function(){
  "use strict";
  var I = window.LMS_I || function(){ return ""; };
  var $ = function(id){ return document.getElementById(id); };
  var grid = $("grid"), empty = $("empty"), emptyText = $("empty-text"), q = $("q");
  var stOpen = $("st-open"), stAvg = $("st-avg"), stDone = $("st-done");
  var seg = $("seg"), segThumb = $("seg-thumb");
  var metaTheme = $("meta-theme");
  var THEME_KEY = "lms_theme", PORTAL_KEY = "lms_portal_v1";
  var CLASS_KEY = "lms_class";
  var reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var mqDark = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  var DRIVE = "https://drive.google.com/drive/folders/1Bs190ZCurEjyAfIUVcZ3u91eh6r3J_FA";
  var SESSION_MS = 12 * 60 * 60 * 1000;
  var CLASSES = ["X", "XI", "XII"];

  if($("s-ic")) $("s-ic").innerHTML = I("search");
  if($("e-ic")) $("e-ic").innerHTML = I("search");
  if($("btn-login-ic")) $("btn-login-ic").innerHTML = I("log-in");
  if($("k-add-ic")) $("k-add-ic").innerHTML = I("plus");
  if($("drive-ic")) $("drive-ic").innerHTML = I("external-link");
  if($("ab-pantau-ic")) $("ab-pantau-ic").innerHTML = I("bar-chart");
  if($("ab-kelola-ic")) $("ab-kelola-ic").innerHTML = I("settings");
  if($("ab-drive-ic")) $("ab-drive-ic").innerHTML = I("external-link");
  if($("ab-backup-ic")) $("ab-backup-ic").innerHTML = I("save");
  if($("ab-logout-ic")) $("ab-logout-ic").innerHTML = I("log-out");
  if($("pantau-csv-ic")) $("pantau-csv-ic").innerHTML = I("save");
  if($("pantau-drive-ic")) $("pantau-drive-ic").innerHTML = I("external-link");
  if($("q-clear-ic")) $("q-clear-ic").innerHTML = I("x");
  if($("to-top-ic")) $("to-top-ic").innerHTML = I("chevron-up");
  document.querySelectorAll(".sheet-wrap .x").forEach(function(b){
    if(!b.innerHTML) b.innerHTML = I("x");
  });
  var abDrive = $("ab-drive");
  if(abDrive && !abDrive.getAttribute("href")) abDrive.href = DRIVE;

  /* ---------- store portal ---------- */
  function emptyStore(){
    return {
      entries: { X: [], XI: [], XII: [] },
      admin: null,
      session: null,
      school: null
    };
  }
  function loadStore(){
    var s = null;
    try{ s = JSON.parse(localStorage.getItem(PORTAL_KEY) || "null"); }catch(e){}
    if(!s || typeof s !== "object") s = emptyStore();
    if(!s.entries || typeof s.entries !== "object") s.entries = emptyStore().entries;
    CLASSES.forEach(function(k){
      if(!Array.isArray(s.entries[k])) s.entries[k] = [];
    });
    return s;
  }
  var store = loadStore();
  var reg = window.LMS_REGISTRY || [];
  if(store.entries.X.length === 0){
    store.entries.X = reg.map(function(e){
      return {
        id: e.id, name: e.name, short: e.short, teacher: e.teacher || "", icon: e.icon,
        color: e.color, lsKey: e.lsKey, file: e.file, pub: true, seed: true,
        scriptId: e.scriptId || ""
      };
    });
    saveStore();
  } else {
    // sinkronkan scriptId/file/lsKey dari registry untuk entri bawaan (seed) yang tersimpan lama
    var byId = {};
    reg.forEach(function(e){ byId[e.id] = e; });
    var changed = false;
    store.entries.X.forEach(function(en){
      var r = byId[en.id];
      if(!en.seed || !r) return;
      if(en.scriptId !== (r.scriptId || "")){ en.scriptId = r.scriptId || ""; changed = true; }
      var localFile = !/^[a-z]+:\/\//i.test(en.file || "");
      if(localFile && en.file !== r.file){ en.file = r.file; changed = true; }
      if(en.lsKey !== r.lsKey){ en.lsKey = r.lsKey; changed = true; }
    });
    if(changed) saveStore();
  }
  function saveStore(){
    try{ localStorage.setItem(PORTAL_KEY, JSON.stringify(store)); }catch(e){}
  }

  /* ---------- sinkronisasi daftar LMS dari API ---------- */
  function findLocalEntry(id){
    for(var i = 0; i < CLASSES.length; i++){
      var arr = store.entries[CLASSES[i]] || [];
      for(var j = 0; j < arr.length; j++){
        if(arr[j].id === id) return arr[j];
      }
    }
    return null;
  }
  function fromServer(e){
    if(!e || CLASSES.indexOf(e.klass) < 0) return null;
    var local = findLocalEntry(e.id);
    var r = null;
    for(var i = 0; i < reg.length; i++){ if(reg[i].id === e.id){ r = reg[i]; break; } }
    var slug = String(e.id).toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-|-$/g, "") || "mapel";
    return {
      id: e.id,
      name: e.name || "Tanpa nama",
      short: e.short || e.name || "",
      teacher: e.teacher || "",
      icon: e.icon || "book",
      color: e.color || "#0d9488",
      lsKey: (local && local.lsKey) || (r && r.lsKey) || ("lms_" + slug + "_" + String(e.klass).toLowerCase() + "_v1"),
      file: e.file || "#",
      pub: e.pub !== false,
      seed: !!r || !!(local && local.seed),
      scriptId: e.scriptId || (r && r.scriptId) || "",
      server: true
    };
  }
  function applyServerEntries(list){
    if(!Array.isArray(list)) return false;
    var grouped = { X: [], XI: [], XII: [] };
    list.forEach(function(e){
      var rec = fromServer(e);
      if(rec) grouped[e.klass].push(rec);
    });
    CLASSES.forEach(function(k){ store.entries[k] = grouped[k]; });
    saveStore();
    render(true);
    stats();
    syncKelolaUI();
    return true;
  }
  function loadServerEntries(){
    if(!apiAvailable || !window.LMS_API) return Promise.resolve(false);
    var req = (window._apiUser && LMS_API.getAllEntries) ? LMS_API.getAllEntries() : LMS_API.getEntries();
    return req.then(function(r){
      if(!r || !r.ok || !r.data || !Array.isArray(r.data.entries)) return false;
      return applyServerEntries(r.data.entries);
    });
  }

  /* ---------- umpan balik sementara ---------- */
  function toast(msg, kind){
    var wrap = $("toasts");
    if(!wrap) return;
    if(wrap.children.length >= 3) wrap.removeChild(wrap.firstChild);
    var t = document.createElement("div");
    t.className = "toast" + (kind === "err" ? " is-err" : "");
    var dot = document.createElement("span");
    dot.className = "t-dot";
    dot.setAttribute("aria-hidden", "true");
    var txt = document.createElement("span");
    txt.textContent = msg;
    t.appendChild(dot);
    t.appendChild(txt);
    wrap.appendChild(t);
    requestAnimationFrame(function(){ t.classList.add("is-in"); });
    setTimeout(function(){
      t.classList.remove("is-in");
      setTimeout(function(){ if(t.parentNode) t.parentNode.removeChild(t); }, 220);
    }, 3200);
  }

  /* ---------- kelas aktif ---------- */
  var klass = "X";
  try{
    var ck = localStorage.getItem(CLASS_KEY);
    if(CLASSES.indexOf(ck) >= 0) klass = ck;
  }catch(e){}

  function phaseOf(k){ return k === "X" ? "Fase E" : "Fase F"; }
  function syncPhaseUI(){
    var el = $("hero-eyebrow");
    if(el) el.textContent = phaseOf(klass);
  }

  function setClass(k){
    if(CLASSES.indexOf(k) < 0) return;
    klass = k;
    try{ localStorage.setItem(CLASS_KEY, k); }catch(e){}
    syncClassUI();
    syncPhaseUI();
    render(true);
    stats();
  }

  /* ---------- auth (akun admin tetap; API jika tersedia) ---------- */
  var apiAvailable = false;
  if(window.LMS_API){
    LMS_API.available().then(function(ok){
      apiAvailable = !!ok;
      if(!apiAvailable) return;
      return LMS_API.me().then(function(r){
        if(r && r.ok && r.data && r.data.user) window._apiUser = r.data.user;
        syncAuthUI();
        return loadServerEntries();
      });
    }).then(function(){ syncAuthUI(); });
  }

  var ADMIN_USER = "smanfourtte26@gmail.com";
  var ADMIN_PASS = "smanfour#4";

  function isAdmin(){
    if(apiAvailable) return !!window._apiUser;
    return !!(store.session && store.session.user === ADMIN_USER && store.session.exp > Date.now());
  }
  function loginOK(user, pass){
    return String(user || "").trim().toLowerCase() === ADMIN_USER && String(pass || "") === ADMIN_PASS;
  }
  function startSession(){
    store.session = { user: ADMIN_USER, exp: Date.now() + SESSION_MS };
    saveStore();
  }
  function endSession(){
    store.session = null;
    window._apiUser = null;
    if(apiAvailable && window.LMS_API){
      LMS_API.logout().then(function(){ return loadServerEntries(); }).then(function(){ syncAuthUI(); });
    }
    saveStore();
  }

  /* ---------- identitas admin (nav + bar) ---------- */
  var btnLogin = $("btn-login"), who = $("who"), avatar = $("avatar"), whoName = $("who-name");
  var adminBar = $("admin-bar");
  function syncAuthUI(){
    var on = isAdmin();
    var user = (apiAvailable && window._apiUser) ? window._apiUser : (on && store.session ? store.session : null);
    if(btnLogin) btnLogin.hidden = on;
    if(who) who.hidden = !on;
    if(whoName) whoName.textContent = user ? user.username || user.user || "" : "";
    if(avatar) avatar.textContent = (user ? (user.username || user.user || "A")[0] : "A").toUpperCase();
    if(adminBar) adminBar.hidden = !on;
  }
  if(btnLogin) btnLogin.addEventListener("click", function(){ openModal("modal-login"); });
  var abLogout = $("ab-logout");
  if(abLogout) abLogout.addEventListener("click", function(){
    endSession();
    syncAuthUI();
    toast("Anda telah keluar dari mode admin.");
  });
  var abKelola = $("ab-kelola");
  if(abKelola) abKelola.addEventListener("click", function(){
    kelolaClass = klass;
    syncKelolaUI();
    openModal("modal-kelola");
  });
  var abPantau = $("ab-pantau");
  if(abPantau) abPantau.addEventListener("click", function(){
    syncPantauUI();
    renderPantau();
    openModal("modal-pantau");
  });
  var abBackup = $("ab-backup");
  if(abBackup) abBackup.addEventListener("click", function(){ openModal("modal-backup"); });
  var fYear = $("f-year");
  if(fYear) fYear.textContent = new Date().getFullYear();
  if(abDrive) abDrive.href = DRIVE;

  /* ---------- modals ---------- */
  var finePointer = window.matchMedia ? window.matchMedia("(hover: hover) and (pointer: fine)").matches : true;
  var lastFocus = null;
  function openModal(id){
    var m = $(id);
    if(!m) return;
    lastFocus = document.activeElement;
    m.hidden = false;
    document.body.classList.add("modal-open");
    var sheet = m.querySelector(".sheet");
    if(sheet) sheet.setAttribute("tabindex", "-1");
    var f = finePointer ? m.querySelector("input:not([type=hidden]), button.btn.primary") : null;
    if(f) try{ f.focus(); }catch(e){}
    else if(sheet) try{ sheet.focus(); }catch(e){}
  }
  function closeModal(m){
    if(!m || m.hidden) return;
    m.hidden = true;
    document.body.classList.remove("modal-open");
    var back = lastFocus;
    lastFocus = null;
    if(back && document.contains(back) && back.offsetParent !== null){
      try{ back.focus(); return; }catch(e){}
    }
    var brand = document.querySelector(".brand");
    if(brand) try{ brand.focus(); }catch(e){}
  }
  document.addEventListener("keydown", function(ev){
    var open = null;
    document.querySelectorAll(".sheet-wrap").forEach(function(m){
      if(!m.hidden && !open) open = m;
    });
    if(!open) return;
    if(ev.key === "Escape"){ closeModal(open); return; }
    if(ev.key !== "Tab") return;
    var nodes = open.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
    var list = [];
    nodes.forEach(function(el){ if(el.getClientRects().length) list.push(el); });
    if(!list.length){ ev.preventDefault(); return; }
    var firstEl = list[0], lastEl = list[list.length - 1];
    var active = document.activeElement;
    if(list.indexOf(active) < 0){
      ev.preventDefault();
      (ev.shiftKey ? lastEl : firstEl).focus();
      return;
    }
    if(ev.shiftKey && active === firstEl){ ev.preventDefault(); lastEl.focus(); }
    else if(!ev.shiftKey && active === lastEl){ ev.preventDefault(); firstEl.focus(); }
  });
  document.querySelectorAll(".sheet-wrap").forEach(function(m){
    m.addEventListener("click", function(ev){
      if(ev.target.closest("[data-close]")) closeModal(m);
    });
  });

  /* ---------- form masuk admin ---------- */
  var loginForm = $("login-form"), loginErr = $("login-err");
  function syncLoginUI(){
    if(loginErr) loginErr.hidden = true;
  }
  if(loginForm) loginForm.addEventListener("submit", function(ev){
    ev.preventDefault();
    var u = ($("login-user") && $("login-user").value || "").trim();
    var p = $("login-pass") && $("login-pass").value || "";
    function fail(msg){
      if(!loginErr) return;
      loginErr.textContent = msg;
      loginErr.hidden = false;
    }
    if(!u || !p) return fail("Isi email dan kata sandi.");

    // Coba API dulu
    if(apiAvailable && window.LMS_API){
      LMS_API.login(u.toLowerCase(), p).then(function(r){
        if(r.ok){
          window._apiUser = r.data.user;
          syncAuthUI();
          closeModal($("modal-login"));
          toast("Berhasil masuk. Selamat bekerja.");
          loadServerEntries();
        }else fail("Email atau kata sandi salah.");
      });
      return;
    }

    // Mode offline: akun admin tetap
    if(!loginOK(u, p)) return fail("Email atau kata sandi salah.");
    startSession();
    if(loginForm.reset) loginForm.reset();
    syncAuthUI();
    closeModal($("modal-login"));
    toast("Berhasil masuk. Selamat bekerja.");
  });

  /* ---------- tema ---------- */
  function theme(){ return document.documentElement.getAttribute("data-theme") || "auto"; }
  function effective(){
    var t = theme();
    return t === "dark" ? "dark" : t === "light" ? "light"
      : (mqDark && mqDark.matches ? "dark" : "light");
  }
  function syncThemeUI(){
    var t = theme();
    var idx = t === "light" ? 0 : t === "dark" ? 2 : 1;
    if(segThumb) segThumb.style.setProperty("--seg-i", idx);
    if(seg) seg.querySelectorAll("button").forEach(function(b){
      var on = b.dataset.t === t;
      b.setAttribute("aria-checked", on ? "true" : "false");
      b.tabIndex = on ? 0 : -1;
    });
    if(metaTheme) metaTheme.content = effective() === "dark" ? "#000000" : "#f5f5f7";
  }
  function setTheme(t){
    document.documentElement.setAttribute("data-theme", t);
    try{ localStorage.setItem(THEME_KEY, t); }catch(e){}
    syncThemeUI();
  }
  var segIcons = { light: "sun", auto: "monitor", dark: "moon" };
  if(seg){
    seg.querySelectorAll("button").forEach(function(b){
      b.innerHTML = I(segIcons[b.dataset.t] || "circle");
    });
    seg.addEventListener("click", function(ev){
      var b = ev.target.closest("button[data-t]");
      if(b) setTheme(b.dataset.t);
    });
    seg.addEventListener("keydown", function(ev){
      if(ev.key !== "ArrowLeft" && ev.key !== "ArrowRight") return;
      var order = ["light", "auto", "dark"];
      var i = order.indexOf(theme());
      i = ev.key === "ArrowLeft" ? (i + 2) % 3 : (i + 1) % 3;
      setTheme(order[i]);
      ev.preventDefault();
    });
  }
  if(mqDark && mqDark.addEventListener) mqDark.addEventListener("change", syncThemeUI);
  try{
    var t0 = localStorage.getItem(THEME_KEY);
    if(t0 === "light" || t0 === "dark" || t0 === "auto") document.documentElement.setAttribute("data-theme", t0);
  }catch(e){}
  syncThemeUI();

  /* ---------- seg kelas ---------- */
  var classSeg = $("class-seg"), classThumb = $("class-thumb");
  function syncClassUI(){
    var idx = CLASSES.indexOf(klass);
    if(classThumb) classThumb.style.setProperty("--seg-i", Math.max(0, idx));
    if(classSeg) classSeg.querySelectorAll("button").forEach(function(b){
      var on = b.dataset.k === klass;
      b.setAttribute("aria-checked", on ? "true" : "false");
      b.tabIndex = on ? 0 : -1;
    });
  }
  if(classSeg){
    classSeg.addEventListener("click", function(ev){
      var b = ev.target.closest("button[data-k]");
      if(b) setClass(b.dataset.k);
    });
    classSeg.addEventListener("keydown", function(ev){
      if(ev.key !== "ArrowLeft" && ev.key !== "ArrowRight") return;
      var i = CLASSES.indexOf(klass);
      i = ev.key === "ArrowLeft" ? (i + 2) % 3 : (i + 1) % 3;
      setClass(CLASSES[i]);
      ev.preventDefault();
    });
  }

  /* ---------- progres ---------- */
  function rgba(hex, a){
    var h = String(hex || "").replace("#", "");
    if(h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    var n = parseInt(h, 16);
    if(isNaN(n)) return "rgba(0,0,0," + a + ")";
    return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
  }
  function progInfo(e){
    try{
      var raw = localStorage.getItem(e.lsKey);
      if(!raw) return null;
      var d = JSON.parse(raw), s = d && d.sum;
      if(!s || typeof s.pct !== "number" || isNaN(s.pct)) return null;
      return {
        pct: Math.max(0, Math.min(100, Math.round(s.pct))),
        d: typeof s.d === "number" ? s.d : null,
        t: typeof s.t === "number" ? s.t : null
      };
    }catch(_){ return null; }
  }
  function progOf(e){
    var info = progInfo(e);
    return info ? info.pct : null;
  }

  function entries(){ return store.entries[klass] || []; }

  function entryHref(e){
    var href = e.file || "#";
    if(e.scriptId){
      var hi = href.indexOf("#");
      var hash = hi >= 0 ? href.slice(hi) : "";
      if(hi >= 0) href = href.slice(0, hi);
      href += (href.indexOf("?") >= 0 ? "&" : "?") + "gs=" + encodeURIComponent(e.scriptId);
      href += hash;
    }
    return href;
  }
  function card(e, i){
    var ext = /^https?:\/\//i.test(e.file || "");
    var href = entryHref(e);
    var name = String(e.name || "Tanpa nama");
    return '<a class="card" href="' + href + '" data-id="' + esc(e.id) + '" style="--c:' + esc(e.color || "#0d9488") + ';--i:' + i + '"' +
      (ext ? ' target="_blank" rel="noopener noreferrer"' : "") + '>' +
      '<span class="tile" style="background:' + rgba(e.color, .13) + '">' + I(e.icon || "book") + '</span>' +
      '<span class="txt"><h3>' + esc(name) + '</h3><p class="cap">Kelas ' + esc(klass) + ' · ' + phaseOf(klass) + (e.teacher ? " · " + esc(e.teacher) : "") + '</p></span>' +
      '<span class="chev" aria-hidden="true">' + I(ext ? "external-link" : "chevron-right") + '</span>' +
    '</a>';
  }
  function esc(s){
    return String(s).replace(/[&<>"']/g, function(c){
      return ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[c];
    });
  }

  var first = true;
  var qClear = $("q-clear"), searchMeta = $("search-meta"), emptyReset = $("empty-reset");
  var metaTimer = null;
  function syncSearchUI(count, term){
    if(qClear) qClear.hidden = !term;
    if(emptyReset) emptyReset.hidden = !term;
    if(!searchMeta) return;
    clearTimeout(metaTimer);
    if(!term){
      searchMeta.hidden = true;
      searchMeta.textContent = "";
      return;
    }
    metaTimer = setTimeout(function(){
      if(!q) return;
      var live = q.value.trim();
      if(!live) return;
      searchMeta.hidden = count === 0;
      if(count) searchMeta.textContent = count + " hasil untuk “" + live + "”";
    }, 220);
  }
  function render(animate){
    var term = (q && q.value || "").trim().toLowerCase();
    var list = entries().filter(function(e){
      if(e.pub === false) return false;
      return !term || (String(e.name || "") + " " + String(e.short || "") + " " + String(e.id || "")).toLowerCase().indexOf(term) >= 0;
    });
    if(grid){
      grid.classList.remove("is-swap");
      grid.innerHTML = list.map(card).join("");
      if(!first) grid.classList.remove("is-first");
      first = false;
      if(animate && !reduce){
        void grid.offsetWidth;
        grid.classList.add("is-swap");
      }
    }
    if(empty) empty.hidden = list.length > 0;
    if(emptyText){
      if(term) emptyText.innerHTML = 'Tidak ada mapel cocok dengan “' + esc(q.value) + '”.';
      else if(klass === "X") emptyText.textContent = "Belum ada mapel terbit untuk kelas ini.";
      else emptyText.textContent = "Belum ada mapel terbit untuk Kelas " + klass + ".";
    }
    syncSearchUI(list.length, term);
  }
  function clearSearch(focus){
    if(!q) return;
    q.value = "";
    render();
    if(focus) try{ q.focus(); }catch(e){}
  }
  if(grid) grid.addEventListener("click", function(ev){
    var a = ev.target.closest(".card[data-id]");
    if(!a) return;
    if(/^https?:\/\//i.test(a.getAttribute("href") || "")) return;
    setTimeout(stats, 350);
  });
  if(q) q.addEventListener("input", render);
  if(qClear) qClear.addEventListener("click", function(){ clearSearch(true); });
  if(emptyReset) emptyReset.addEventListener("click", function(){ clearSearch(true); });
  if(q) q.addEventListener("keydown", function(ev){
    if(ev.key !== "Escape") return;
    if(q.value){
      clearSearch(true);
      ev.preventDefault();
    }else{
      q.blur();
    }
  });
  document.addEventListener("keydown", function(ev){
    if(ev.key !== "/" || ev.metaKey || ev.ctrlKey || ev.altKey) return;
    var t = ev.target;
    if(t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
    if(document.querySelector(".sheet-wrap:not([hidden])")) return;
    if(!q) return;
    ev.preventDefault();
    q.focus();
  });

  /* ---------- stat ---------- */
  function countUp(el, target, suffix){
    if(!el) return;
    suffix = suffix || "";
    if(reduce || !target || typeof requestAnimationFrame !== "function"){
      el.textContent = target + suffix; return;
    }
    var t0 = null;
    function step(ts){
      if(t0 === null) t0 = ts;
      var k = Math.min(1, (ts - t0) / 500);
      var e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(target * e) + suffix;
      if(k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  function stats(){
    if(!stOpen && !stAvg && !stDone) return;
    var open = 0, sum = 0, done = 0;
    entries().forEach(function(e){
      var pct = progOf(e);
      if(pct !== null){ open++; sum += pct; if(pct >= 100) done++; }
    });
    countUp(stOpen, open);
    countUp(stDone, done);
    if(open) countUp(stAvg, Math.round(sum / open), "%");
    else if(stAvg) stAvg.textContent = "—";
  }

  /* ---------- kelola (CRUD) ---------- */
  var kelolaClass = "X";
  var kelolaSeg = $("kelola-seg"), kelolaThumb = $("kelola-thumb");
  var kList = $("k-list"), kForm = $("kelola-form"), kErr = $("k-err");
  var ICON_CHOICES = [
    "book", "book-open", "calculator", "globe", "dna", "coins", "atom",
    "flask", "laptop", "activity", "landmark", "wrench", "scroll",
    "users", "monitor", "pencil"
  ];
  var COLOR_CHOICES = [
    "#0d9488", "#e8590c", "#7048e8", "#2b8a3e", "#0c8599", "#5f3dc4",
    "#c2255c", "#d6336c", "#1098ad", "#862e9c", "#f76707", "#495057",
    "#9c6644", "#c92a2a", "#364fc7", "#66a80f"
  ];
  var editingId = null;
  var kIconSel = $("k-icon");
  if(kIconSel){
    kIconSel.innerHTML = ICON_CHOICES.map(function(n){
      return '<option value="' + n + '">' + n + "</option>";
    }).join("");
  }

  function kelolaEntries(){
    return store.entries[kelolaClass] || [];
  }
  function syncKelolaUI(){
    var idx = CLASSES.indexOf(kelolaClass);
    if(kelolaThumb) kelolaThumb.style.setProperty("--seg-i", Math.max(0, idx));
    if(kelolaSeg) kelolaSeg.querySelectorAll("button").forEach(function(b){
      var on = b.dataset.k === kelolaClass;
      b.setAttribute("aria-checked", on ? "true" : "false");
      b.tabIndex = on ? 0 : -1;
    });
    if(kList) kList.innerHTML = kelolaEntries().map(function(e, i){
      return '<div class="k-row" data-id="' + esc(e.id) + '" data-i="' + i + '">' +
        '<span class="k-dot" style="background:' + esc(e.color || "#0d9488") + '"></span>' +
        '<span class="k-info"><b>' + esc(e.name || "Tanpa nama") + "</b>" +
        "<small>" + esc(e.file || "—") + (e.teacher ? " · " + esc(e.teacher) : "") + "</small></span>" +
        (e.pub === false ? '<span class="k-off">arsip</span>' : "") +
        '<span class="k-actions">' +
        '<button type="button" class="btn ghost" data-act="edit">Ubah</button>' +
        '<button type="button" class="btn danger" data-act="del">Hapus</button>' +
        "</span></div>";
    }).join("") || '<p class="p-empty">Belum ada LMS di kelas ini.</p>';
  }
  function resetKForm(){
    editingId = null;
    if(kForm){
      kForm.reset();
      var c = $("k-color");
      if(c) c.value = COLOR_CHOICES[0];
      var p = $("k-pub");
      if(p) p.checked = true;
      kForm.hidden = true;
    }
    if(kErr) kErr.hidden = true;
  }
  var kAdd = $("k-add");
  if(kAdd) kAdd.addEventListener("click", function(){
    resetKForm();
    if(kForm) kForm.hidden = false;
    var n = $("k-name");
    if(n) try{ n.focus(); }catch(e){}
  });
  var kCancel = $("k-cancel");
  if(kCancel) kCancel.addEventListener("click", resetKForm);
  if(kelolaSeg){
    kelolaSeg.addEventListener("click", function(ev){
      var b = ev.target.closest("button[data-k]");
      if(!b) return;
      kelolaClass = b.dataset.k;
      resetKForm();
      syncKelolaUI();
    });
    kelolaSeg.addEventListener("keydown", function(ev){
      if(ev.key !== "ArrowLeft" && ev.key !== "ArrowRight") return;
      var i = CLASSES.indexOf(kelolaClass);
      i = ev.key === "ArrowLeft" ? (i + 2) % 3 : (i + 1) % 3;
      kelolaClass = CLASSES[i];
      resetKForm();
      syncKelolaUI();
      ev.preventDefault();
    });
  }
  if(kList) kList.addEventListener("click", function(ev){
    var b = ev.target.closest("button[data-act]");
    if(!b) return;
    var row = b.closest(".k-row");
    var i = row && parseInt(row.dataset.i, 10);
    var arr = kelolaEntries();
    if(isNaN(i) || !arr[i]) return;
    if(b.dataset.act === "del"){
      if(!confirm("Hapus " + (arr[i].name || "entri ini") + " dari daftar kelas " + kelolaClass + "?")) return;
      var removed = arr[i];
      arr.splice(i, 1);
      saveStore();
      syncKelolaUI();
      render();
      stats();
      var delMsg = "LMS dihapus dari daftar.";
      if(apiAvailable && window.LMS_API && removed.server){
        LMS_API.deleteEntry(removed.id).then(function(r){
          toast(r && r.ok ? delMsg : "Terhapus di perangkat, tetapi gagal di server.", r && r.ok ? "" : "err");
        });
      }else{
        toast(delMsg);
      }
      return;
    }
    if(b.dataset.act === "edit"){
      resetKForm();
      editingId = arr[i].id;
      if($("k-name")) $("k-name").value = arr[i].name || "";
      if($("k-short")) $("k-short").value = arr[i].short || "";
      if($("k-url")) $("k-url").value = arr[i].file || "";
      if($("k-teacher")) $("k-teacher").value = arr[i].teacher || "";
      if($("k-script")) $("k-script").value = arr[i].scriptId || "";
      if(kIconSel) kIconSel.value = arr[i].icon || "book";
      if($("k-color")) $("k-color").value = arr[i].color || COLOR_CHOICES[0];
      if($("k-pub")) $("k-pub").checked = arr[i].pub !== false;
      if(kForm) kForm.hidden = false;
      var n = $("k-name");
      if(n) try{ n.focus(); }catch(e){}
    }
  });
  if(kForm) kForm.addEventListener("submit", function(ev){
    ev.preventDefault();
    var name = ($("k-name") && $("k-name").value || "").trim();
    var short = ($("k-short") && $("k-short").value || "").trim();
    var url = ($("k-url") && $("k-url").value || "").trim();
    var teacher = ($("k-teacher") && $("k-teacher").value || "").trim();
    var scriptId = ($("k-script") && $("k-script").value || "").trim();
    var icon = kIconSel ? kIconSel.value : "book";
    var color = $("k-color") ? $("k-color").value : COLOR_CHOICES[0];
    var pub = $("k-pub") ? $("k-pub").checked : true;
    function fail(msg){
      if(!kErr) return;
      kErr.textContent = msg;
      kErr.hidden = false;
    }
    if(!name) return fail("Nama mata pelajaran wajib diisi.");
    if(!/^https?:\/\/\S+$/i.test(url)) return fail("Tautan harus diawali http:// atau https://.");
    var arr = kelolaEntries();
    var slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "mapel";
    var id = editingId || slug + "-" + Date.now().toString(36);
    var same = arr.filter(function(e){ return e.id === id; })[0];
    var rec = {
      id: id,
      name: name,
      short: short || name,
      teacher: teacher,
      icon: icon,
      color: color,
      lsKey: "lms_" + slug + "_" + klass.toLowerCase() + "_v" + Date.now().toString(36),
      file: url,
      pub: pub,
      seed: false,
      scriptId: scriptId
    };
    if(same){
      rec.lsKey = same.lsKey;
      rec.file = url;
      rec.name = name;
      rec.short = short || name;
      rec.teacher = teacher;
      rec.icon = icon;
      rec.color = color;
      rec.pub = pub;
      rec.scriptId = scriptId;
      rec.server = !!same.server;
      arr[arr.indexOf(same)] = rec;
    }else{
      arr.push(rec);
    }
    saveStore();

    var msg = same ? "Perubahan LMS disimpan." : "LMS baru ditambahkan.";
    var apiOn = apiAvailable && window.LMS_API;
    if(apiOn){
      var apiPayload = { klass: kelolaClass, name: name, short: short || name, teacher: teacher, icon: icon, color: color, file: url, pub: pub, scriptId: scriptId };
      var apiReq;
      if(same && same.server){
        apiReq = LMS_API.updateEntry(same.id, apiPayload);
      }else{
        apiPayload.id = rec.id;
        apiReq = LMS_API.createEntry(apiPayload);
      }
      apiReq.then(function(r){
        if(r && r.ok && r.data && r.data.entry){
          rec.id = r.data.entry.id || rec.id;
          rec.server = true;
          saveStore();
          syncKelolaUI();
          render();
          stats();
          toast(msg);
        }else{
          toast("Tersimpan di perangkat, tetapi gagal sinkron ke server.", "err");
        }
      });
    }else{
      toast(msg);
    }

    resetKForm();
    syncKelolaUI();
    render();
    stats();
  });

  /* ---------- pantau ---------- */
  var pantauFilter = "all";
  var pantauSeg = $("pantau-seg"), pantauThumb = $("pantau-thumb");
  var PANTAU_ORDER = ["all", "X", "XI", "XII"];
  function syncPantauUI(){
    var idx = Math.max(0, PANTAU_ORDER.indexOf(pantauFilter));
    if(pantauThumb) pantauThumb.style.setProperty("--seg-i", idx);
    if(pantauSeg) pantauSeg.querySelectorAll("button").forEach(function(b){
      var on = b.dataset.k === pantauFilter;
      b.setAttribute("aria-checked", on ? "true" : "false");
      b.tabIndex = on ? 0 : -1;
    });
  }
  if(pantauSeg){
    pantauSeg.addEventListener("click", function(ev){
      var b = ev.target.closest("button[data-k]");
      if(!b) return;
      pantauFilter = b.dataset.k;
      syncPantauUI();
      renderPantau();
    });
    pantauSeg.addEventListener("keydown", function(ev){
      if(ev.key !== "ArrowLeft" && ev.key !== "ArrowRight") return;
      var i = PANTAU_ORDER.indexOf(pantauFilter);
      i = ev.key === "ArrowLeft" ? (i + PANTAU_ORDER.length - 1) % PANTAU_ORDER.length
        : (i + 1) % PANTAU_ORDER.length;
      pantauFilter = PANTAU_ORDER[i];
      syncPantauUI();
      renderPantau();
      ev.preventDefault();
    });
  }
  var pantauDrive = $("pantau-drive");
  if(pantauDrive) pantauDrive.href = DRIVE;

  function pantauClasses(){
    return pantauFilter === "all" ? CLASSES : [pantauFilter];
  }
  function pantauRows(keys){
    var rows = [];
    keys.forEach(function(k){
      (store.entries[k] || []).forEach(function(e){
        rows.push({ klass: k, entry: e, info: progInfo(e) });
      });
    });
    return rows;
  }
  function pantauStats(rows){
    var open = 0, sum = 0, done = 0, modules = 0;
    rows.forEach(function(r){
      if(!r.info) return;
      open++;
      sum += r.info.pct;
      if(r.info.pct >= 100) done++;
      if(r.info.d) modules += r.info.d;
    });
    return {
      total: rows.length, open: open, done: done, modules: modules,
      avg: open ? Math.round(sum / open) : null
    };
  }
  function pantauFocus(rows){
    var active = [], fresh = [];
    rows.forEach(function(r){
      if(!r.info) fresh.push(r);
      else if(r.info.pct < 100) active.push(r);
    });
    if(active.length){
      active.sort(function(a, b){
        return b.info.pct - a.info.pct || (b.info.d || 0) - (a.info.d || 0);
      });
      return { row: active[0], label: active[0].info.pct > 0 ? "Lanjutkan" : "Mulai" };
    }
    if(fresh.length) return { row: fresh[0], label: "Mulai" };
    return null;
  }
  function moduleLabel(info){
    if(!info) return "0 modul";
    var d = info.d == null ? 0 : info.d;
    if(info.t) return d + " dari " + info.t + " modul";
    return "progres " + info.pct + "%";
  }

  function renderPantau(){
    var sumEl = $("pantau-summary");
    var body = $("pantau-body");
    var keys = pantauClasses();
    var rows = pantauRows(keys);
    var s = pantauStats(rows);
    var scope = pantauFilter === "all" ? "Semua kelas" : "Kelas " + pantauFilter;
    if(sumEl){
      var avg = s.avg === null ? 0 : s.avg;
      var focus = pantauFocus(rows);
      var focusHTML = "";
      if(focus){
        var fe = focus.row.entry;
        var ext = /^https?:\/\//i.test(fe.file || "");
        focusHTML = '<a class="p-next" href="' + esc(entryHref(fe)) + '" style="--c:' + esc(fe.color || "#0d9488") + '"' +
          (ext ? ' target="_blank" rel="noopener noreferrer"' : "") + '>' +
          '<span class="p-next-tile" aria-hidden="true">' + I(fe.icon || "book") + "</span>" +
          '<span class="p-next-txt"><span class="p-kicker">Fokus belajar</span>' +
          "<b>" + esc(fe.name || "Tanpa nama") + "</b><small>" + moduleLabel(focus.row.info) + "</small></span>" +
          '<span class="p-next-go">' + focus.label + I(ext ? "external-link" : "chevron-right") + "</span></a>";
      }else if(!s.total){
        focusHTML = '<div class="p-next is-done"><span class="p-next-tile" aria-hidden="true">' + I("flag") + "</span>" +
          '<span class="p-next-txt"><span class="p-kicker">Fokus belajar</span>' +
          "<b>Belum ada LMS</b><small>Tambahkan LMS untuk mulai memantau.</small></span></div>";
      }else{
        focusHTML = '<div class="p-next is-done"><span class="p-next-tile" aria-hidden="true">' + I("check-circle") + "</span>" +
          '<span class="p-next-txt"><span class="p-kicker">Fokus belajar</span>' +
          "<b>Semua sudah tuntas</b><small>Tidak ada yang tertinggal. Kerja bagus.</small></span></div>";
      }
      sumEl.innerHTML =
        '<div class="p-ring" style="--p:' + (avg / 100) + '" role="img" aria-label="Rata-rata progres ' +
          (s.avg === null ? "belum ada" : s.avg + " persen") + '">' +
          '<svg viewBox="0 0 100 100" aria-hidden="true">' +
            '<circle class="pr-track" cx="50" cy="50" r="42"></circle>' +
            '<circle class="pr-val" cx="50" cy="50" r="42"></circle>' +
          "</svg>" +
          '<span class="p-ring-mid"><b>' + (s.avg === null ? "—" : s.avg + "%") + "</b><small>rerata</small></span>" +
        "</div>" +
        '<div class="p-hero-side">' +
          '<p class="p-kicker">' + scope + " · " + s.total + " LMS</p>" +
          '<div class="p-metrics">' +
            '<div class="p-metric"><b>' + s.modules + '</b><span>modul tuntas</span></div>' +
            '<div class="p-metric"><b>' + s.open + '<i>/' + s.total + '</i></b><span>LMS dibuka</span></div>' +
          "</div>" +
        "</div>" +
        focusHTML;
      var ringVal = sumEl.querySelector(".p-ring-mid b");
      if(ringVal){
        if(s.avg === null) ringVal.textContent = "—";
        else countUp(ringVal, s.avg, "%");
      }
    }
    if(!body) return;
    if(!rows.length){
      body.innerHTML = '<p class="p-empty">Belum ada LMS terbit untuk filter ini.</p>';
      return;
    }
    var html = "";
    keys.forEach(function(k){
      var list = (store.entries[k] || []);
      if(!list.length){
        html += '<div class="p-section"><h3>Kelas ' + k + ' <span class="cnt">0</span></h3>' +
          '<p class="p-empty">Belum ada LMS terbit.</p></div>';
        return;
      }
      html += '<div class="p-section"><h3>Kelas ' + k + ' <span class="cnt">' + list.length + '</span></h3><div class="p-list">';
      list.forEach(function(e, i){
        var info = progInfo(e);
        var ext = /^https?:\/\//i.test(e.file || "");
        var d = info && info.d != null ? info.d : 0;
        var t = info && info.t != null ? info.t : 0;
        html += '<a class="p-item" href="' + esc(entryHref(e)) + '" style="--c:' + esc(e.color || "#0d9488") +
          ";--p:" + (info ? info.pct / 100 : 0) + ";--i:" + i + '"' +
          (ext ? ' target="_blank" rel="noopener noreferrer"' : "") + '>' +
          '<span class="p-item-tile" aria-hidden="true">' + I(e.icon || "book") + "</span>" +
          '<span class="p-item-main">' +
            '<span class="p-item-name">' + esc(e.name || "—") + "</span>" +
            (e.teacher ? '<span class="p-item-sub">' + esc(e.teacher) + "</span>" : "") +
            '<span class="p-item-bar" aria-hidden="true"><i></i></span>' +
          "</span>" +
          '<span class="p-item-score"><b>' + (info ? info.pct + "%" : "—") + "</b><small>" +
            (info ? (t ? d + "/" + t : "—") : "0 modul") + "</small></span>" +
          '<span class="p-item-go" aria-hidden="true">' + I(ext ? "external-link" : "chevron-right") + "</span>" +
        "</a>";
      });
      html += "</div></div>";
    });
    body.innerHTML = html;
  }
  var pantauCsv = $("pantau-csv");
  if(pantauCsv) pantauCsv.addEventListener("click", function(){
    var keys = pantauClasses();
    var rows = [["Kelas","Mapel","Guru","Tautan","Modul selesai","Total modul","Progres (%)"]];
    keys.forEach(function(k){
      (store.entries[k] || []).forEach(function(e){
        var info = progInfo(e);
        rows.push([
          k, e.name || "", e.teacher || "", e.file || "",
          info && info.d != null ? info.d : 0,
          info && info.t != null ? info.t : 0,
          info ? info.pct : 0
        ]);
      });
    });
    var csv = rows.map(function(r){
      return r.map(function(c){ return '"' + String(c).replace(/"/g, '""') + '"'; }).join(",");
    }).join("\n");
    var suffix = pantauFilter === "all" ? "semua-kelas" : "kelas-" + pantauFilter.toLowerCase();
    downloadBlob("pantau-progres-" + suffix + ".csv", csv, "text/csv;charset=utf-8");
    toast("CSV progres diunduh.");
  });

  function downloadBlob(filename, text, mime){
    var blob = new Blob(["﻿" + text], { type: mime || "application/octet-stream" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 0);
  }

  /* ---------- profil sekolah ---------- */
  function renderProfil(){
    var body = $("profil-body");
    if(!body) return;
    var p = store.school || {};
    if(isAdmin()){
      body.innerHTML = '<form id="profil-form" style="display:flex;flex-direction:column;gap:10px">' +
        '<label>Nama sekolah<input id="pf-name" value="' + esc(p.name || "SMA Negeri 4 Ternate") + '"></label>' +
        '<label>NPSN<input id="pf-npsn" value="' + esc(p.npsn || "") + '" placeholder="cth. 10400000"></label>' +
        '<label>Alamat<textarea id="pf-addr" rows="2">' + esc(p.addr || "Ternate, Maluku Utara") + '</textarea></label>' +
        '<label>Telepon<input id="pf-telp" value="' + esc(p.telp || "") + '"></label>' +
        '<label>Email<input id="pf-email" type="email" value="' + esc(p.email || "") + '"></label>' +
        '<label>PPDB (tautan/info)<textarea id="pf-ppdb" rows="2">' + esc(p.ppdb || "") + '</textarea></label>' +
        '<button type="submit" class="btn primary">Simpan Profil</button></form>';
      var form = $("profil-form");
      form.addEventListener("submit", function(ev){
        ev.preventDefault();
        store.school = {
          name: ($("pf-name").value || "").trim(),
          npsn: ($("pf-npsn").value || "").trim(),
          addr: ($("pf-addr").value || "").trim(),
          telp: ($("pf-telp").value || "").trim(),
          email: ($("pf-email").value || "").trim(),
          ppdb: ($("pf-ppdb").value || "").trim()
        };
        saveStore();
        renderProfil();
      });
    }else{
      body.innerHTML =
        '<div class="p-section"><h3>Identitas</h3><table class="p-table"><tbody>' +
        "<tr><td class=\"p-name\">Nama</td><td>" + esc(p.name || "SMA Negeri 4 Ternate") + "</td></tr>" +
        "<tr><td class=\"p-name\">NPSN</td><td>" + esc(p.npsn || "—") + "</td></tr>" +
        "<tr><td class=\"p-name\">Alamat</td><td>" + esc(p.addr || "Ternate, Maluku Utara") + "</td></tr>" +
        "<tr><td class=\"p-name\">Telepon</td><td>" + esc(p.telp || "—") + "</td></tr>" +
        "<tr><td class=\"p-name\">Email</td><td>" + esc(p.email || "—") + "</td></tr>" +
        "</tbody></table></div>" +
        '<div class="p-section"><h3>PPDB</h3><p class="p-empty">' + esc(p.ppdb || "Informasi PPDB akan diumumkan.") + "</p></div>";
    }
  }

  /* ---------- cadangkan / pulihkan ---------- */
  var backupExport = $("backup-export");
  if(backupExport) backupExport.addEventListener("click", function(){
    downloadBlob("lms-backup-" + new Date().toISOString().slice(0, 10) + ".json",
      JSON.stringify(store, null, 2), "application/json");
    toast("File backup diunduh.");
  });
  var backupImport = $("backup-import");
  if(backupImport) backupImport.addEventListener("change", function(){
    var f = backupImport.files && backupImport.files[0];
    if(!f) return;
    var r = new FileReader();
    r.onload = function(){
      try{
        var s = JSON.parse(r.result);
        if(!s || typeof s !== "object" || !s.entries) throw new Error("format");
        store = s;
        if(!store.entries) store.entries = emptyStore().entries;
        CLASSES.forEach(function(k){ if(!Array.isArray(store.entries[k])) store.entries[k] = []; });
        saveStore();
        closeModal($("modal-backup"));
        syncAuthUI();
        syncClassUI();
        render();
        stats();
        toast("Data berhasil dipulihkan.");
      }catch(e){
        toast("File tidak valid. Pilih file JSON hasil unduhan dari LMS ini.", "err");
      }
      backupImport.value = "";
    };
    r.readAsText(f);
  });

  /* ---------- gulir: bayangan header + kembali ke atas ---------- */
  var navEl = document.querySelector(".nav");
  var toTop = $("to-top");
  var toTopOn = false;
  function syncScrollUI(){
    var y = window.pageYOffset || document.documentElement.scrollTop || 0;
    if(navEl) navEl.classList.toggle("is-scrolled", y > 6);
    if(!toTop) return;
    var on = y > 520;
    if(on === toTopOn) return;
    toTopOn = on;
    toTop.classList.toggle("is-on", on);
    toTop.setAttribute("aria-hidden", on ? "false" : "true");
    toTop.tabIndex = on ? 0 : -1;
  }
  var scrollTick = false;
  window.addEventListener("scroll", function(){
    if(scrollTick) return;
    scrollTick = true;
    requestAnimationFrame(function(){ scrollTick = false; syncScrollUI(); });
  }, { passive: true });
  if(toTop) toTop.addEventListener("click", function(){
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  });

  /* ---------- init ---------- */
  if("serviceWorker" in navigator){
    window.addEventListener("load", function(){
      navigator.serviceWorker.register("sw.js").catch(function(){});
    });
  }
  syncClassUI();
  syncPhaseUI();
  syncPantauUI();
  renderPantau();
  syncAuthUI();
  syncLoginUI();
  syncKelolaUI();
  stats();
  render();
  syncScrollUI();
})();
