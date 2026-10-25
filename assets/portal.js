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
  if($("ab-ic")) $("ab-ic").innerHTML = I("shield");
  if($("k-add-ic")) $("k-add-ic").innerHTML = I("plus");
  if($("drive-ic")) $("drive-ic").innerHTML = I("external-link");
  if($("ab-pantau-ic")) $("ab-pantau-ic").innerHTML = I("bar-chart");
  if($("ab-kelola-ic")) $("ab-kelola-ic").innerHTML = I("settings");
  if($("ab-peng-ic")) $("ab-peng-ic").innerHTML = I("message-circle");
  if($("ab-drive-ic")) $("ab-drive-ic").innerHTML = I("external-link");
  if($("ab-backup-ic")) $("ab-backup-ic").innerHTML = I("save");
  if($("ab-logout-ic")) $("ab-logout-ic").innerHTML = I("log-out");
  if($("pantau-csv-ic")) $("pantau-csv-ic").innerHTML = I("save");
  if($("pantau-drive-ic")) $("pantau-drive-ic").innerHTML = I("external-link");
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
      announcements: [],
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
    render();
    stats();
  }

  /* ---------- auth (hybrid: API jika tersedia, fallback ke localStorage) ---------- */
  var apiAvailable = false;
  if(window.LMS_API) LMS_API.available().then(function(ok){ apiAvailable = ok; });

  function hash(pw, salt){
    var s = String(pw || ""), out = 0;
    var seed = String(salt || "") + "::" + s;
    for(var i = 0; i < seed.length; i++){
      out = (out * 131 + seed.charCodeAt(i)) >>> 0;
    }
    return "h" + out.toString(16);
  }
  function makeSalt(){
    return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  }
  function isAdmin(){
    if(apiAvailable && window._apiUser) return true;
    return !!(store.admin && store.session && store.session.exp > Date.now());
  }
  function loginOK(user, pass){
    if(!store.admin) return false;
    if(String(user) !== store.admin.user) return false;
    return hash(pass, store.admin.salt) === store.admin.hash;
  }
  function startSession(){
    store.session = { user: store.admin.user, exp: Date.now() + SESSION_MS };
    saveStore();
  }
  function endSession(){
    store.session = null;
    window._apiUser = null;
    if(apiAvailable && window.LMS_API) LMS_API.logout();
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
  var abPengumuman = $("ab-pengumuman");
  if(abPengumuman) abPengumuman.addEventListener("click", function(){
    renderPengumuman();
    openModal("modal-pengumuman");
  });
  var abBackup = $("ab-backup");
  if(abBackup) abBackup.addEventListener("click", function(){ openModal("modal-backup"); });
  var fProfil = $("f-profil");
  if(fProfil) fProfil.addEventListener("click", function(){
    renderProfil();
    openModal("modal-profil");
  });
  var fPengumuman = $("f-pengumuman");
  if(fPengumuman) fPengumuman.addEventListener("click", function(){
    renderPengumuman();
    openModal("modal-pengumuman");
  });
  if(abDrive) abDrive.href = DRIVE;

  /* ---------- modals ---------- */
  function openModal(id){
    var m = $(id);
    if(!m) return;
    m.hidden = false;
    var f = m.querySelector("input, button.btn.primary");
    if(f) try{ f.focus(); }catch(e){}
  }
  function closeModal(m){
    if(m) m.hidden = true;
  }
  document.querySelectorAll(".sheet-wrap").forEach(function(m){
    m.addEventListener("click", function(ev){
      if(ev.target.closest("[data-close]")) closeModal(m);
    });
    m.addEventListener("keydown", function(ev){
      if(ev.key === "Escape") closeModal(m);
    });
  });

  /* ---------- form masuk / buat akun ---------- */
  var loginForm = $("login-form"), loginErr = $("login-err");
  var loginPass2Wrap = $("login-pass2-wrap"), loginTitle = $("login-title"), loginSub = $("login-sub");
  var loginSubmit = $("login-submit");
  function syncLoginUI(){
    var first = !store.admin;
    if(loginTitle) loginTitle.textContent = first ? "Buat Admin" : "Masuk Admin";
    if(loginSub) loginSub.textContent = first
      ? "Pertama kali — buat akun untuk kepala sekolah & admin."
      : "Akun untuk kepala sekolah & admin sekolah.";
    if(loginPass2Wrap) loginPass2Wrap.hidden = !first;
    if(loginSubmit) loginSubmit.textContent = first ? "Buat Akun" : "Masuk";
    if(loginErr) loginErr.hidden = true;
  }
  if(loginForm) loginForm.addEventListener("submit", function(ev){
    ev.preventDefault();
    var u = ($("login-user") && $("login-user").value || "").trim();
    var p = $("login-pass") && $("login-pass").value || "";
    var p2 = $("login-pass2") && $("login-pass2").value || "";
    function fail(msg){
      if(!loginErr) return;
      loginErr.textContent = msg;
      loginErr.hidden = false;
    }
    if(!u || !p) return fail("Isi nama pengguna dan kata sandi.");

    // Coba API dulu
    if(apiAvailable && window.LMS_API){
      if(!store.admin){
        LMS_API.register(u, p).then(function(r){
          if(r.ok){ window._apiUser = r.data.user; closeModal($("modal-login")); syncAuthUI(); }
          else fail(r.data && r.data.error === "username_taken" ? "Username sudah dipakai." : "Gagal membuat akun.");
        });
        return;
      }
      LMS_API.login(u, p).then(function(r){
        if(r.ok){ window._apiUser = r.data.user; closeModal($("modal-login")); syncAuthUI(); }
        else fail("Username atau kata sandi salah.");
      });
      return;
    }

    // Fallback localStorage
    if(!store.admin){
      if(p.length < 4) return fail("Kata sandi minimal 4 karakter.");
      if(p !== p2) return fail("Konfirmasi kata sandi tidak sama.");
      var salt = makeSalt();
      store.admin = { user: u, salt: salt, hash: hash(p, salt) };
      startSession();
      saveStore();
      closeModal($("modal-login"));
      if(loginForm.reset) loginForm.reset();
      syncAuthUI();
      return;
    }
    if(!loginOK(u, p)) return fail("Nama pengguna atau kata sandi salah.");
    startSession();
    closeModal($("modal-login"));
    if(loginForm.reset) loginForm.reset();
    syncAuthUI();
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
  function progOf(e){
    try{
      var raw = localStorage.getItem(e.lsKey);
      if(!raw) return null;
      var d = JSON.parse(raw), s = d && d.sum;
      if(!s || typeof s.pct !== "number" || isNaN(s.pct)) return null;
      return Math.max(0, Math.min(100, Math.round(s.pct)));
    }catch(_){ return null; }
  }
  function lastAt(e){
    try{
      var raw = localStorage.getItem(e.lsKey);
      if(!raw) return 0;
      var d = JSON.parse(raw);
      return (d && d.at) || (d && d.sum && d.sum.at) || 0;
    }catch(_){ return 0; }
  }

  function entries(){ return store.entries[klass] || []; }

  function card(e, i){
    var ext = /^https?:\/\//i.test(e.file || "");
    var href = e.file || "#";
    if(e.scriptId){
      var hi = href.indexOf("#");
      var hash = hi >= 0 ? href.slice(hi) : "";
      if(hi >= 0) href = href.slice(0, hi);
      href += (href.indexOf("?") >= 0 ? "&" : "?") + "gs=" + encodeURIComponent(e.scriptId);
      href += hash;
    }
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
  function render(){
    var term = (q && q.value || "").trim().toLowerCase();
    var list = entries().filter(function(e){
      if(e.pub === false) return false;
      return !term || (String(e.name || "") + " " + String(e.short || "") + " " + String(e.id || "")).toLowerCase().indexOf(term) >= 0;
    });
    if(grid){
      grid.innerHTML = list.map(card).join("");
      if(!first) grid.classList.remove("is-first");
      first = false;
    }
    if(empty) empty.hidden = list.length > 0;
    if(emptyText){
      if(term) emptyText.innerHTML = 'Tidak ada mapel cocok dengan “' + esc(q.value) + '”.';
      else if(klass === "X") emptyText.textContent = "Belum ada mapel terbit untuk kelas ini.";
      else emptyText.textContent = "Belum ada mapel terbit untuk Kelas " + klass + ".";
    }
  }
  if(grid) grid.addEventListener("click", function(ev){
    var a = ev.target.closest(".card[data-id]");
    if(!a) return;
    if(/^https?:\/\//i.test(a.getAttribute("href") || "")) return;
    setTimeout(stats, 350);
  });
  if(q) q.addEventListener("input", render);

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
      arr.splice(i, 1);
      saveStore();
      syncKelolaUI();
      render();
      stats();
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
      arr[arr.indexOf(same)] = rec;
    }else{
      arr.push(rec);
    }
    saveStore();

    if(apiAvailable && window.LMS_API){
      var apiPayload = { klass: kelolaClass, name: name, short: short || name, teacher: teacher, icon: icon, color: color, file: url, pub: pub };
      if(same) LMS_API.updateEntry(same.id || rec.id, apiPayload);
      else LMS_API.createEntry(apiPayload);
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
  function pantauStats(keys){
    var total = 0, open = 0, sum = 0, done = 0, none = 0;
    keys.forEach(function(k){
      (store.entries[k] || []).forEach(function(e){
        total++;
        var pct = progOf(e);
        if(pct === null){ none++; return; }
        open++; sum += pct;
        if(pct >= 100) done++;
      });
    });
    return {
      total: total, open: open, done: done, none: none,
      active: open - done,
      avg: open ? Math.round(sum / open) : null
    };
  }
  function pctPill(pct){
    if(pct === null) return '<span class="pill none">Belum dibuka</span>';
    if(pct >= 100) return '<span class="pill done">Selesai</span>';
    return '<span class="pill active">Aktif</span>';
  }
  function fmtDate(at){
    if(!at) return "—";
    try{
      return new Date(at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
    }catch(e){ return "—"; }
  }
  function fmtDateTime(at){
    if(!at) return "—";
    try{
      return new Date(at).toLocaleString("id-ID", {
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit"
      });
    }catch(e){ return fmtDate(at); }
  }

  function plItem(color, lbl, n, pct){
    return '<div class="pl">' +
      '<span class="pl-top"><span class="pl-dot" style="--c:' + color + '"></span>' +
      '<span class="pl-lbl">' + lbl + "</span></span>" +
      "<b>" + n + "</b><small>" + pct + "% dari total</small></div>";
  }

  function renderPantau(){
    var sumEl = $("pantau-summary");
    var body = $("pantau-body");
    var keys = pantauClasses();
    var s = pantauStats(keys);
    var scope = pantauFilter === "all" ? "Semua kelas" : "Kelas " + pantauFilter;
    var share = function(n){ return s.total ? Math.round(n / s.total * 100) : 0; };
    if(sumEl){
      var avg = s.avg === null ? 0 : s.avg;
      sumEl.innerHTML =
        '<div class="p-ring" style="--p:' + (avg / 100) + '">' +
          '<svg viewBox="0 0 100 100" aria-hidden="true">' +
            '<circle class="pr-track" cx="50" cy="50" r="42"></circle>' +
            '<circle class="pr-val" cx="50" cy="50" r="42"></circle>' +
          "</svg>" +
          '<span class="p-ring-mid"><b>' + (s.avg === null ? "—" : s.avg + "%") + "</b><small>rerata</small></span>" +
        "</div>" +
        '<div class="p-hero-side">' +
          '<p class="p-hero-cap"><b>' + scope + "</b> · " + s.open + " dari " + s.total + " LMS dibuka</p>" +
          '<div class="p-legend">' +
            plItem("var(--good)", "Selesai", s.done, share(s.done)) +
            plItem("var(--accent)", "Aktif", s.active, share(s.active)) +
            plItem("var(--ink3)", "Belum dibuka", s.none, share(s.none)) +
          "</div>" +
        "</div>";
    }
    if(!body) return;
    if(!s.total){
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
      html += '<div class="p-section"><h3>Kelas ' + k + ' <span class="cnt">' + list.length + "</span></h3>";
      html += '<table class="p-table"><thead><tr>' +
        "<th>Mata Pelajaran</th><th>Progres</th><th>Status</th>" +
        "<th class=\"th-when\">Terakhir dibuka</th><th></th>" +
        "</tr></thead><tbody>";
      list.forEach(function(e){
        var pct = progOf(e);
        var at = lastAt(e);
        var col = esc(e.color || "#0d9488");
        html += "<tr>" +
          '<td class="p-subj"><span class="p-subj-in">' +
            '<span class="p-dot" style="background:' + col + '"></span>' +
            '<span class="p-subj-txt"><b>' + esc(e.name || "—") + "</b>" +
            (e.teacher ? "<small>" + esc(e.teacher) + "</small>" : "") +
            "</span></span></td>" +
          '<td class="p-prog"><span class="p-prog-row">' +
            '<span class="prog"><span class="bar" style="--c:' + col + ";--p:" + ((pct || 0) / 100) + '"></span></span>' +
            '<span class="p-pct">' + (pct === null ? 0 : pct) + "%</span>" +
          "</span></td>" +
          '<td class="p-status">' + pctPill(pct) + "</td>" +
          '<td class="p-when">' + fmtDateTime(at) + "</td>" +
          '<td class="p-open"><a href="' + esc(e.file || "#") + '" target="_blank" rel="noopener noreferrer">Buka ' + I("external-link") + "</a></td>" +
          "</tr>";
      });
      html += "</tbody></table></div>";
    });
    body.innerHTML = html;
  }
  var pantauCsv = $("pantau-csv");
  if(pantauCsv) pantauCsv.addEventListener("click", function(){
    var keys = pantauClasses();
    var rows = [["Kelas","Mapel","Guru","Tautan","Progres (%)","Status","Terakhir dibuka"]];
    keys.forEach(function(k){
      (store.entries[k] || []).forEach(function(e){
        var pct = progOf(e);
        var at = lastAt(e);
        rows.push([
          k, e.name || "", e.teacher || "", e.file || "",
          pct === null ? 0 : pct,
          pct === null ? "Belum dibuka" : (pct >= 100 ? "Selesai" : "Aktif"),
          at ? new Date(at).toISOString().slice(0, 10) : ""
        ]);
      });
    });
    var csv = rows.map(function(r){
      return r.map(function(c){ return '"' + String(c).replace(/"/g, '""') + '"'; }).join(",");
    }).join("\n");
    var suffix = pantauFilter === "all" ? "semua-kelas" : "kelas-" + pantauFilter.toLowerCase();
    downloadBlob("pantau-progres-" + suffix + ".csv", csv, "text/csv;charset=utf-8");
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

  /* ---------- pengumuman ---------- */
  function renderPengumuman(){
    var body = $("pengumuman-body");
    if(!body) return;
    var items = (store.announcements || []);
    var html = "";
    if(!items.length){
      html = '<p class="p-empty">Belum ada pengumuman.</p>';
    }else{
      html = '<div class="k-list">' + items.map(function(a, i){
        return '<div class="k-row"><span class="k-info"><b>' + esc(a.title) + "</b>" +
          "<small>" + esc(a.date || "") + "</small>" +
          "<small>" + esc(a.body || "") + "</small></span>" +
          (isAdmin() ? '<span class="k-actions"><button type="button" class="btn danger" data-act="del-ann" data-i="' + i + '">Hapus</button></span>' : "") +
          "</div>";
      }).join("") + "</div>";
    }
    if(isAdmin()){
      html += '<form id="ann-form" style="margin-top:14px;display:flex;flex-direction:column;gap:10px">' +
        '<label>Judul<input id="ann-title" required placeholder="cth. Jadwal PTS"></label>' +
        '<label>Tanggal<input id="ann-date" type="date" required></label>' +
        '<label>Isi<input id="ann-body" required placeholder="Ringkasan pengumuman"></label>' +
        '<button type="submit" class="btn primary">Tambah Pengumuman</button></form>';
    }
    body.innerHTML = html;
    var form = $("ann-form");
    if(form) form.addEventListener("submit", function(ev){
      ev.preventDefault();
      if(!store.announcements) store.announcements = [];
      store.announcements.unshift({
        title: ($("ann-title").value || "").trim(),
        date: $("ann-date").value,
        body: ($("ann-body").value || "").trim()
      });
      saveStore();
      renderPengumuman();
    });
    body.querySelectorAll('[data-act="del-ann"]').forEach(function(b){
      b.addEventListener("click", function(){
        var i = parseInt(b.dataset.i, 10);
        if(store.announcements && store.announcements[i]){
          store.announcements.splice(i, 1);
          saveStore();
          renderPengumuman();
        }
      });
    });
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
        alert("Data berhasil dipulihkan.");
      }catch(e){
        alert("File tidak valid. Pilih file JSON hasil unduhan dari LMS ini.");
      }
      backupImport.value = "";
    };
    r.readAsText(f);
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
})();
