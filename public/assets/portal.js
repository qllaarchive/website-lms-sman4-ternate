/* Portal LMS — kartu mapel, kelas X/XI/XII, tema terang/gelap/sistem,
   login admin (API + cookie JWT), CRUD tautan, pantau progres.
   Semua data (tautan LMS, akun admin) tersimpan di database melalui API. */
(function(){
  "use strict";
  var I = window.LMS_I || function(){ return ""; };
  var $ = function(id){ return document.getElementById(id); };
  var grid = $("grid"), empty = $("empty"), emptyText = $("empty-text"), q = $("q");
  var seg = $("seg"), segThumb = $("seg-thumb");
  var metaTheme = $("meta-theme");
  var THEME_KEY = "lms_theme";
  var CLASS_KEY = "lms_class";
  var reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var mqDark = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  var DRIVE = "";
  var CLASSES = ["X", "XI", "XII"];

  if($("s-ic")) $("s-ic").innerHTML = I("search");
  if($("e-ic")) $("e-ic").innerHTML = I("search");
  if($("btn-login-ic")) $("btn-login-ic").innerHTML = I("log-in");
  if($("k-add-ic")) $("k-add-ic").innerHTML = I("plus");
  if($("k-back-ic")) $("k-back-ic").innerHTML = I("chevron-left");
  if($("brand-home-ic")) $("brand-home-ic").innerHTML = I("home");
  if($("drive-ic")) $("drive-ic").innerHTML = I("external-link");
  if($("ab-kelola-ic")) $("ab-kelola-ic").innerHTML = I("settings");
  if($("ab-sheet-ic")) $("ab-sheet-ic").innerHTML = I("table");
  if($("ab-logout-ic")) $("ab-logout-ic").innerHTML = I("log-out");
  if($("pantau-csv-ic")) $("pantau-csv-ic").innerHTML = I("save");
  if($("pantau-drive-ic")) $("pantau-drive-ic").innerHTML = I("external-link");
  if($("q-clear-ic")) $("q-clear-ic").innerHTML = I("x");
  if($("to-top-ic")) $("to-top-ic").innerHTML = I("chevron-up");
  if($("sk-add-ic")) $("sk-add-ic").innerHTML = I("plus");
  if($("sk-add-head-ic")) $("sk-add-head-ic").innerHTML = I("plus");
  if($("slider-prev-ic")) $("slider-prev-ic").innerHTML = I("chevron-left");
  if($("slider-next-ic")) $("slider-next-ic").innerHTML = I("chevron-right");
  if($("login-mail-ic")) $("login-mail-ic").innerHTML = I("mail");
  if($("nb-ic")) $("nb-ic").innerHTML = I("alert-triangle");
  document.querySelectorAll(".sheet-wrap .x").forEach(function(b){
    if(!b.innerHTML) b.innerHTML = I("x");
  });
  var abSheet = $("ab-sheet");
  if(abSheet && !abSheet.getAttribute("href")) abSheet.href = DRIVE;

  /* ---------- sumber data LMS (database via API; tanpa API: bawaan registry, baca-saja) ---------- */
  var state = {
    entries: { X: [], XI: [], XII: [] }
  };
  var reg = window.LMS_REGISTRY || [];
  function registryEntries(){
    return reg.map(function(e){
      return {
        id: e.id, name: e.name, short: e.short, teacher: e.teacher || "", icon: e.icon,
        color: e.color, lsKey: e.lsKey, file: e.file, pub: true, seed: true,
        scriptId: e.scriptId || ""
      };
    });
  }
  state.entries.X = registryEntries();
  function fromServer(e){
    if(!e || CLASSES.indexOf(e.klass) < 0) return null;
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
      lsKey: (r && r.lsKey) || ("lms_" + slug + "_" + String(e.klass).toLowerCase() + "_v1"),
      file: e.file || "#",
      pub: e.pub !== false,
      seed: !!r,
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
    state.entries = grouped;
    var nb = $("noback");
    if(nb) nb.hidden = true;
    apiAvailable = true;
    render(true);
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

  /* ---------- pesan error API yang mudah dipahami ---------- */
  var API_ERR = {
    unauthorized: "Sesi berakhir. Masuk lagi.",
    csrf_required: "Sesi keamanan kedaluwarsa. Muat ulang halaman, lalu coba lagi.",
    admin_required: "Akun ini tidak punya hak admin.",
    invalid_input: "Isian belum valid. Periksa kembali nama dan tautan.",
    duplicate_id: "Entri dengan ID yang sama sudah ada.",
    not_found: "Data tidak ditemukan (mungkin sudah dihapus). Muat ulang halaman.",
    file_too_large: "Ukuran foto masih terlalu besar. Coba foto lain atau perkecil dulu.",
    unsupported_image_type: "Jenis berkas harus JPG, PNG, atau WebP.",
    image_required: "Pilih berkas foto terlebih dahulu.",
    server_error: "Terjadi kesalahan di server. Coba lagi sebentar lagi."
  };
  function apiErrMsg(r, fallback){
    if(!r || r.status === 0) return "Tidak bisa terhubung ke server. Periksa internet, lalu coba lagi.";
    if(r.status === 401) return API_ERR.unauthorized;
    if(r.status === 413) return API_ERR.file_too_large;
    var code = r.data && r.data.error;
    return (code && API_ERR[code]) || fallback;
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
  }

  /* ---------- auth (API + cookie JWT; tanpa akun tersimpan di perangkat) ---------- */
  var apiAvailable = false;
  if(window.LMS_API){
    LMS_API.available().then(function(ok){
      apiAvailable = !!ok;
      var nb = $("noback");
      if(nb && !apiAvailable) nb.hidden = false;
      if(!apiAvailable) return;
      return LMS_API.me().then(function(r){
        if(r && r.ok && r.data && r.data.user) window._apiUser = r.data.user;
        syncAuthUI();
        return loadServerEntries();
      }).then(function(){ return loadSliders(); });
    }).then(function(){ syncAuthUI(); });
  }

  function isAdmin(){ return apiAvailable && !!window._apiUser; }
  function endSession(){
    window._apiUser = null;
    if(apiAvailable && window.LMS_API){
      LMS_API.logout().then(function(){ return loadServerEntries(); })
        .then(function(){ return loadSliders(); })
        .then(function(){ syncAuthUI(); });
    }
  }

  /* ---------- identitas admin (nav + bar) ---------- */
  var btnLogin = $("btn-login"), who = $("who"), avatar = $("avatar"), whoName = $("who-name");
  var adminBar = $("admin-bar");
  function syncAuthUI(){
    var on = isAdmin();
    var user = window._apiUser || null;
    if(btnLogin) btnLogin.hidden = on;
    if(who) who.hidden = !on;
    if(whoName) whoName.textContent = user ? user.username || user.user || "" : "";
    if(avatar) avatar.textContent = (user ? (user.username || user.user || "A")[0] : "A").toUpperCase();
    if(adminBar) adminBar.hidden = !on;
    var logoutBtn = $("ab-logout");
    if(logoutBtn) logoutBtn.hidden = !on;
  }
  if(btnLogin) btnLogin.addEventListener("click", function(){ openModal("modal-login"); });
  /* Tombol rumah di header: balik ke halaman pembuka */
  var brandHome = $("brand-home");
  if(brandHome) brandHome.addEventListener("click", function(){
    try { sessionStorage.removeItem("lms_intro_seen"); } catch(e){}
    try {
      var u = new URL(location.href);
      u.searchParams.set("pembuka", "1");
      u.hash = "";
      location.href = u.toString();
    } catch(e){
      location.href = "index.html?pembuka=1";
    }
  });
  var abLogout = $("ab-logout");
  if(abLogout) abLogout.addEventListener("click", function(){
    endSession();
    syncAuthUI();
    toast("Anda telah keluar dari mode admin.");
  });
  var abKelola = $("ab-kelola");
  if(abKelola) abKelola.addEventListener("click", function(){
    kelolaClass = klass;
    resetKForm();
    resetSkForm();
    syncKelolaUI();
    syncSkUI();
    setKelolaView("lms");
    openModal("modal-kelola");
  });

  /* ---------- tab tengah di header kelola: teks "Kelola LMS" / "Kelola Foto" ----------
     Dua tampilan di satu halaman (panel bergantian), judul aktif warna tinta + garis kecil. */
  var kelolaView = "lms";
  function setKelolaView(v){
    if(v !== "lms" && v !== "foto") v = "lms";
    kelolaView = v;
    var lmsV = $("k-view-lms"), fotoV = $("k-view-foto");
    if(lmsV) lmsV.hidden = v !== "lms";
    if(fotoV) fotoV.hidden = v !== "foto";
    var tabs = document.querySelectorAll("#modal-kelola .page-switch-item");
    Array.prototype.forEach.call(tabs, function(t){
      var on = t.dataset && t.dataset.view === v;
      if(t.classList && t.classList.toggle) t.classList.toggle("is-on", on);
      if(t.setAttribute) t.setAttribute("aria-selected", on ? "true" : "false");
    });
    var sc = document.querySelector("#modal-kelola .page-scroll");
    if(sc) sc.scrollTop = 0;
  }
  var pageSwitch = document.querySelector("#modal-kelola .page-switch");
  if(pageSwitch){
    pageSwitch.addEventListener("click", function(ev){
      var b = ev.target.closest && ev.target.closest(".page-switch-item");
      if(b) setKelolaView(b.dataset.view);
    });
    pageSwitch.addEventListener("keydown", function(ev){
      if(ev.key !== "ArrowLeft" && ev.key !== "ArrowRight") return;
      setKelolaView(kelolaView === "lms" ? "foto" : "lms");
      var t = $(kelolaView === "lms" ? "tab-kelola-lms" : "tab-kelola-foto");
      if(t) try{ t.focus(); }catch(e){}
      ev.preventDefault();
    });
  }
  var fYear = $("f-year");
  if(fYear) fYear.textContent = new Date().getFullYear();
  if(abSheet) abSheet.href = DRIVE;

  /* ---------- header mobile: menu hamburger admin + tema pindah ke footer ---------- */
  var adminCluster = $("admin-cluster"), btnMenu = $("btn-menu"), menuPop = $("menu-pop");
  var segEl = $("seg"), fThemeCol = $("f-theme-col"), segSlot = $("seg-footer-slot");
  var abGroup = document.querySelector(".admin-bar .ab-group");
  var navRight = document.querySelector(".nav-right");
  var mqNarrow = window.matchMedia ? window.matchMedia("(max-width: 700px)") : null;
  var mqReduce = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  function menuCloseAdmin(instant){
    if(!menuPop || menuPop.hidden) return;
    function fin(){
      menuPop.hidden = true;
      if(adminCluster) adminCluster.classList.remove("is-open", "is-closing");
      if(btnMenu) btnMenu.setAttribute("aria-expanded", "false");
    }
    if(instant || (mqReduce && mqReduce.matches)){ fin(); return; }
    if(adminCluster) adminCluster.classList.add("is-closing");
    setTimeout(fin, 160);
  }
  function menuOpenAdmin(){
    if(!menuPop || !adminCluster || adminCluster.hidden || !menuPop.hidden) return;
    menuPop.hidden = false;
    adminCluster.classList.add("is-open");
    if(btnMenu) btnMenu.setAttribute("aria-expanded", "true");
  }
  function placeAdminUI(){
    var m = mqNarrow ? mqNarrow.matches : false;
    var kelola = $("ab-kelola"), sheet = $("ab-sheet"), out = $("ab-logout");
    if(m){
      if(menuPop && kelola) menuPop.appendChild(kelola);
      if(menuPop && sheet) menuPop.appendChild(sheet);
      if(menuPop && out) menuPop.appendChild(out);
      if(segEl && segSlot){ segSlot.appendChild(segEl); segEl.classList.add("seg--footer"); }
    } else {
      menuCloseAdmin(true);
      if(abGroup && kelola) abGroup.appendChild(kelola);
      if(abGroup && sheet) abGroup.appendChild(sheet);
      if(out && navRight) navRight.appendChild(out);
      if(segEl){
        segEl.classList.remove("seg--footer");
        if(navRight && btnLogin) navRight.insertBefore(segEl, btnLogin);
      }
    }
    if(fThemeCol) fThemeCol.hidden = !(m && segEl);
  }
  if(btnMenu && menuPop){
    btnMenu.addEventListener("click", function(e){
      e.stopPropagation();
      if(menuPop.hidden) menuOpenAdmin(); else menuCloseAdmin();
    });
    document.addEventListener("click", function(e){
      if(menuPop.hidden) return;
      if(e.target.closest && e.target.closest("#admin-cluster")) return;
      menuCloseAdmin();
    });
    document.addEventListener("keydown", function(e){
      if(e.key === "Escape" && menuPop && !menuPop.hidden){
        menuCloseAdmin();
        if(btnMenu) btnMenu.focus();
      }
    });
    menuPop.addEventListener("click", function(e){
      if(e.target.closest && e.target.closest("button, a")) menuCloseAdmin();
    });
  }
  if(mqNarrow){
    if(mqNarrow.addEventListener) mqNarrow.addEventListener("change", placeAdminUI);
    else if(mqNarrow.addListener) mqNarrow.addListener(placeAdminUI);
  }
  placeAdminUI();

  /* ---------- modals ---------- */
  var finePointer = window.matchMedia ? window.matchMedia("(hover: hover) and (pointer: fine)").matches : true;
  var lastFocus = null;
  var closeTimers = new WeakMap();
  function openModal(id){
    var m = $(id);
    if(!m) return;
    lastFocus = document.activeElement;
    var pend = closeTimers.get(m);
    if(pend){ clearTimeout(pend); closeTimers.delete(m); }
    delete m.dataset.closing;
    m.classList.remove("is-closing");
    var wasVisible = !m.hidden;
    m.hidden = false;
    document.body.classList.add("modal-open");
    var sheetEl = m.querySelector(":scope > .sheet");
    if(sheetEl && sheetEl.classList.contains("login-sheet") && wasVisible){
      /* masih terbuka/animasi keluar — paksa ulang animasi masuk */
      sheetEl.classList.remove("is-out");
      void sheetEl.offsetWidth;
    }
    var sheet = m.querySelector(".sheet");
    if(sheet) sheet.setAttribute("tabindex", "-1");
    if(m.classList.contains("page-wrap")){
      var sc = m.querySelector(".page-scroll");
      if(sc) sc.scrollTop = 0;
      var pageTitle = m.querySelector(".page-heading h2");
      if(pageTitle){
        try{ pageTitle.focus({ preventScroll: true }); }catch(e){ try{ pageTitle.focus(); }catch(e2){} }
        return;
      }
      /* header tanpa judul (pakai tab tengah): fokus ke tombol kembali */
      var af = m.querySelector("[data-autofocus]");
      if(af){
        try{ af.focus({ preventScroll: true }); }catch(e){ try{ af.focus(); }catch(e2){} }
        return;
      }
    }
    var f = finePointer ? m.querySelector("input:not([type=hidden]), button.btn.primary") : null;
    if(f) try{ f.focus(); }catch(e){}
    else if(sheet) try{ sheet.focus(); }catch(e){}
  }
  function closeModal(m){
    if(!m || m.hidden) return;
    var sheetEl = m.querySelector(":scope > .sheet");
    var animated = !!(sheetEl && sheetEl.classList.contains("login-sheet")) && !reduce;
    if(animated){
      if(m.dataset.closing) return;
      m.dataset.closing = "1";
      m.classList.add("is-closing");
      sheetEl.classList.add("is-out");
      var t = setTimeout(function(){
        closeTimers.delete(m);
        finishClose(m);
      }, 300);
      closeTimers.set(m, t);
      return;
    }
    finishClose(m);
  }
  function finishClose(m){
    m.hidden = true;
    delete m.dataset.closing;
    m.classList.remove("is-closing");
    /* jangan lepas kunci scroll bila masih ada modal lain terbuka (tingkat×tingkat) */
    var anyOpen = null;
    document.querySelectorAll(".sheet-wrap").forEach(function(x){
      if(!x.hidden) anyOpen = x;
    });
    if(!anyOpen) document.body.classList.remove("modal-open");
    var sheetEl = m.querySelector(":scope > .sheet");
    if(sheetEl && sheetEl.classList.contains("login-sheet")) sheetEl.classList.remove("is-out");
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
    /* pilih modal paling atas (terakhir terbukti dalam urutan DOM) — penting
       saat modal bertingkat, mis. halaman kelola foto di atas halaman kelola */
    document.querySelectorAll(".sheet-wrap").forEach(function(m){
      if(!m.hidden) open = m;
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
  function backendErr(){
    if(location.protocol === "file:")
      return "Portal dibuka lewat file:// — buka lewat http:// (localhost) dan nyalakan backend terlebih dahulu.";
    return "Backend tidak tersedia. Hubungi admin sekolah.";
  }
  var loginForm = $("login-form"), loginErr = $("login-err");
  var passIn = $("login-pass"), eyeBtn = $("login-eye");
  if(eyeBtn && passIn){
    eyeBtn.innerHTML = I("eye");
    eyeBtn.addEventListener("click", function(){
      var show = passIn.type === "password";
      passIn.type = show ? "text" : "password";
      eyeBtn.innerHTML = I(show ? "eye-off" : "eye");
    });
  }
  function syncLoginUI(){
    if(loginErr) loginErr.hidden = true;
  }
  if(loginForm) loginForm.addEventListener("submit", function(ev){
    ev.preventDefault();
    var u = ($("login-user") && $("login-user").value || "").trim();
    /* Sandi diberes: baris baru tertempel saat tempel hasil tempelan sering membuat
       "salah" palsu — buang spasi/baris kosong di tepi. */
    var p = ($("login-pass") && $("login-pass").value || "").trim();
    function fail(msg){
      if(!loginErr) return;
      loginErr.textContent = msg;
      loginErr.hidden = false;
    }
    if(!u || !p) return fail("Isi email dan kata sandi.");

    if(!apiAvailable || !window.LMS_API){
      return fail(backendErr());
    }
    LMS_API.login(u.toLowerCase(), p).then(function(r){
      if(r.ok){
        window._apiUser = r.data.user;
        syncAuthUI();
        closeModal($("modal-login"));
        toast("Berhasil masuk. Selamat bekerja.");
        loadServerEntries();
        loadSliders();
      }else if(r.status === 0){
        fail(backendErr());
      }else if(r.status === 429){
        fail("Terlalu banyak percobaan. Tunggu satu menit lalu coba lagi.");
      }else{
        fail("Email atau kata sandi salah.");
      }
    });
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

  /* ---------- micro-motion ala anime.js.com ----------
     Dua tanda tangan gerak dramatis dipindah ke sini: kaskade kata pada judul
     beranda (delay stagger per kata, berakhir overshoot pegun) dan riak
     dot-grid murni CSS di belakang hero. Semua transform/opacity saja. */
  var portalTitle = $("portal-title");
  if(portalTitle && !reduce){
    var words = (portalTitle.textContent || "").trim().split(/\s+/).filter(Boolean);
    if(words.length > 1){
      portalTitle.setAttribute("aria-label", words.join(" "));
      var frag = document.createDocumentFragment();
      words.forEach(function(w, i){
        var s = document.createElement("span");
        s.className = "w";
        s.setAttribute("aria-hidden", "true");
        s.textContent = w;
        s.style.setProperty("--w", i);
        frag.appendChild(s);
        frag.appendChild(document.createTextNode(" "));
      });
      portalTitle.textContent = "";
      portalTitle.appendChild(frag);
    }
  }
  (function heroDotWave(){
    var heroEl = document.querySelector(".hero");
    if(!heroEl || reduce) return;
    var dots = document.createElement("div");
    dots.className = "hero-dots";
    dots.setAttribute("aria-hidden", "true");
    var count = 150, frag = document.createDocumentFragment();
    /* delay negatif & tumpang tindih agar gelombang berjalan diagonal lalu
       ketemu smooth saat loop; ala stagger anime.js tapi tanpa JS per-frame. */
    for(var i = 0; i < count; i++){
      var d = document.createElement("span");
      d.style.setProperty("--d", Math.round((i * 97) % 2400) + "ms");
      frag.appendChild(d);
    }
    dots.appendChild(frag);
    document.querySelector("main.gut").appendChild(dots);
  })();

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
  function entries(){ return state.entries[klass] || []; }

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
    var href = esc(entryHref(e));
    var name = String(e.name || "Tanpa nama");
    return '<a class="card" href="' + href + '" data-id="' + esc(e.id) + '" style="--c:' + esc(e.color || "#0d9488") + ';--i:' + i + '"' +
      (ext ? ' target="_blank" rel="noopener noreferrer"' : "") + '>' +
      '<span class="tile" style="background:' + rgba(e.color, .13) + '">' + I(e.icon || "book") + '</span>' +
      '<span class="txt"><h3>' + esc(name) + '</h3><p class="cap">Kelas ' + esc(klass) + ' · ' + phaseOf(klass) + (e.teacher ? " · " + esc(e.teacher) : "") + '</p></span>' +
      '<span class="chev" aria-hidden="true">' + I(ext ? "external-link" : "chevron-right") + '</span>' +
    '</a>';
  }
  function esc(s){
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
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

  /* ---------- statistik ringan (count-up; dipakai ring pantau) ---------- */
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
    return state.entries[kelolaClass] || [];
  }
  function setKFormMode(mode){
    var editing = mode === "edit";
    var title = $("k-form-title"), sub = $("k-form-sub"), save = $("k-save");
    if(title) title.textContent = (editing ? "Ubah LMS" : "Tambah LMS") + " · Kelas " + kelolaClass;
    if(sub) sub.textContent = editing
      ? "Perbarui data LMS untuk kelas " + kelolaClass + "."
      : "Lengkapi data LMS untuk kelas " + kelolaClass + ".";
    if(save) save.textContent = editing ? "Simpan perubahan" : "Simpan LMS";
  }
  function syncKelolaUI(){
    var idx = CLASSES.indexOf(kelolaClass);
    if(kelolaThumb) kelolaThumb.style.setProperty("--seg-i", Math.max(0, idx));
    if(kelolaSeg) kelolaSeg.querySelectorAll("button").forEach(function(b){
      var on = b.dataset.k === kelolaClass;
      b.setAttribute("aria-checked", on ? "true" : "false");
      b.tabIndex = on ? 0 : -1;
    });
    var entries = kelolaEntries();
    var shown = entries.filter(function(e){ return e.pub !== false; }).length;
    var off = entries.length - shown;
    var pageSub = document.querySelector("#modal-kelola .page-sub");
    if(pageSub) pageSub.textContent = "Atur tautan LMS untuk kelas " + kelolaClass + ".";
    if($("k-count")) $("k-count").textContent = entries.length + " LMS · " + shown + " tampil" + (off ? " · " + off + " arsip" : "");
    if(kList) kList.innerHTML = entries.map(function(e, i){
      return '<div class="k-row" data-id="' + esc(e.id) + '" data-i="' + i + '" style="--i:' + i + '">' +
        '<span class="k-mark" style="color:' + esc(e.color || "#0d9488") + '">' + I(e.icon || "book") + "</span>" +
        '<span class="k-info"><b>' + esc(e.name || "Tanpa nama") + "</b>" +
        "<small>" + esc(e.file || "—") + (e.teacher ? " · " + esc(e.teacher) : "") + "</small></span>" +
        (e.pub === false ? '<span class="k-off" title="Tidak tampil di daftar siswa">arsip — tak tampil</span>' : "") +
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
    setKFormMode("add");
  }
  var kAdd = $("k-add");
  if(kAdd) kAdd.addEventListener("click", function(){
    resetKForm();
    setKFormMode("add");
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
      if(!apiAvailable || !window.LMS_API){ toast(backendErr(), "err"); return; }
      var removed = arr[i];
      var rowEl = kList.querySelector('.k-row[data-id="' + removed.id + '"]');
      var finishDel = function(){
        var ref = kelolaEntries();
        var idx = ref.indexOf(removed);
        if(idx >= 0){ ref.splice(idx, 1); }
        syncKelolaUI();
        render();
        toast("LMS dihapus dari daftar.");
      };
      if(!reduce && rowEl){
        /* keluar animasi dulu (180ms), baru dihapus dari state & render */
        rowEl.classList.add("is-out");
        setTimeout(finishDel, 180);
      }else{
        finishDel();
      }
      LMS_API.deleteEntry(removed.id).then(function(r){
        if(!(r && r.ok)){
          if(rowEl) rowEl.classList.remove("is-out");
          loadServerEntries(); /* kembalikan entri yang gagal dihapus ke layar */
          toast(apiErrMsg(r, "Gagal menghapus di server."), "err");
        }
      });
      return;
    }
    if(b.dataset.act === "edit"){
      resetKForm();
      editingId = arr[i].id;
      setKFormMode("edit");
      if($("k-name")) $("k-name").value = arr[i].name || "";
      if($("k-short")) $("k-short").value = arr[i].short || "";
      if($("k-url")) $("k-url").value = arr[i].file || "";
      if($("k-teacher")) $("k-teacher").value = arr[i].teacher || "";
      if($("k-script")) $("k-script").value = arr[i].scriptId || "";
      if(kIconSel){
        var v = arr[i].icon || "book";
        var has = Array.prototype.some.call(kIconSel.options, function(o){ return o.value === v; });
        if(!has){
          var opt = document.createElement("option");
          opt.value = v; opt.textContent = v;
          kIconSel.appendChild(opt);
        }
        kIconSel.value = v;
      }
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
    var isWeb = /^https?:\/\/\S+$/i.test(url);
    var isLocal = /^[\w./-]+\.html?(#\S*)?$/i.test(url) && url.indexOf("..") < 0;
    if(!isWeb && !isLocal) return fail("Tautan harus diawali http:// atau https:// (atau halaman situs ini, mis. mapel/matematika.html).");
    if(!apiAvailable || !window.LMS_API){ return fail("Backend tidak tersedia. Hubungi admin sekolah."); }
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
      lsKey: (same && same.lsKey) || ("lms_" + slug + "_" + kelolaClass.toLowerCase() + "_v" + Date.now().toString(36)),
      file: url,
      pub: pub,
      seed: !!(same && same.seed),
      scriptId: scriptId
    };

    var msg = same ? "Perubahan LMS disimpan." : "LMS baru ditambahkan.";
    /* Pengaman: kotak centang bisa tak sengaja terklik (label ikut toggle).
       Konfirmasi dulu bila entri akan disimpan tidak tampil di daftar siswa. */
    if(!pub && !confirm(
      (name || "LMS") + " akan disimpan sebagai ARSIP — tidak akan tampil di daftar siswa.\n" +
      "Lanjutkan (OK) untuk arsip, atau Batal (Cancel) lalu centang \"Tampilkan di daftar siswa\".")){
      return fail("Belum disimpan — centang \"Tampilkan di daftar siswa\" agar muncul di portal.");
    }
    var apiPayload = { klass: kelolaClass, name: name, short: short || name, teacher: teacher, icon: icon, color: color, file: url, pub: pub, scriptId: scriptId };
    var apiReq;
    if(same){
      apiReq = LMS_API.updateEntry(same.id, apiPayload);
    }else{
      apiPayload.id = rec.id;
      apiReq = LMS_API.createEntry(apiPayload);
    }
    apiReq.then(function(r){
      if(r && r.ok && r.data && r.data.entry){
        rec.id = r.data.entry.id || rec.id;
        rec.server = true;
        var ref = kelolaEntries();
        if(same && ref.indexOf(same) >= 0){ ref[ref.indexOf(same)] = rec; }
        else{ ref.push(rec); }
        syncKelolaUI();
        render();
        toast(pub === false ? "LMS tersimpan sebagai arsip (tak tampil di daftar siswa)." : msg);
        resetKForm();
      }else{
        fail(apiErrMsg(r, "Gagal menyimpan ke server."));
      }
    });
  });

  /* ---------- slider foto beranda + kelola foto slider ---------- */
  var state2 = {
    sliders: []            /* daftar mentah dari API (urutan server) */
  };
  var sliderEl = $("slider"), sliderStage = $("slider-stage"),
      sliderDots = $("slider-dots"), sliderPrev = $("slider-prev"),
      sliderNext = $("slider-next"), sliderLive = $("slider-live");
  var skList = $("sk-list"), skForm = $("sk-form"), skErr = $("sk-err");
  var skInput = $("sk-input"), skTitle = $("sk-title"),
      skPub = $("sk-pub"), skPreview = $("sk-preview"),
      skPreviewImg = $("sk-preview-img"), skSave = $("sk-save");
  var skIdx = 0, slTimer = null, skFileURL = null, skEditingId = null, skHover = false;
  var SLIDE_MS = 7000;
  var skFileOK = /^image\/(jpe?g|png|webp)$/i;
  var skFileMax = 8 * 1024 * 1024;

  /* Foto dari HP sering 4–10 MB. Perkecil di browser (sisi terpanjang 1920 px,
     JPEG mutu 0,85) agar unggahan cepat dan lolos batas server 3 MB. */
  var SK_SHRINK_OVER = 1.5 * 1024 * 1024;
  function shrinkImage(file){
    return new Promise(function(resolve){
      if(!file || file.size <= SK_SHRINK_OVER || !window.URL || !document.createElement("canvas").toBlob) return resolve(file);
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function(){
        try{
          var max = 1920, w = img.naturalWidth, h = img.naturalHeight;
          var k = Math.min(1, max / Math.max(w, h));
          var c = document.createElement("canvas");
          c.width = Math.round(w * k); c.height = Math.round(h * k);
          var g = c.getContext("2d");
          g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height);
          g.drawImage(img, 0, 0, c.width, c.height);
          c.toBlob(function(b){
            URL.revokeObjectURL(url);
            if(!b || b.size >= file.size) return resolve(file);
            var name = String(file.name || "foto").replace(/\.[^.]+$/, "") + ".jpg";
            try{ resolve(new File([b], name, { type: "image/jpeg" })); }
            catch(e){ b.name = name; resolve(b); }
          }, "image/jpeg", 0.85);
        }catch(e){ URL.revokeObjectURL(url); resolve(file); }
      };
      img.onerror = function(){ URL.revokeObjectURL(url); resolve(file); };
      img.src = url;
    });
  }

  function slVisible(){
    return state2.sliders.filter(function(s){ return s.pub !== false; });
  }
  function loadSliders(){
    if(!apiAvailable || !window.LMS_API) return Promise.resolve(false);
    var req = window._apiUser && LMS_API.getAllSliders ? LMS_API.getAllSliders() : LMS_API.getSliders();
    return req.then(function(r){
      if(!r || !r.ok || !r.data || !Array.isArray(r.data.sliders)) return false;
      state2.sliders = r.data.sliders;
      syncSliderUI();
      syncSkUI();
      return true;
    });
  }

  /* — pemutar di beranda — */
  function setSlide(i){
    var items = slVisible();
    if(!sliderStage || !items.length) return;
    skIdx = (i + items.length) % items.length;
    Array.prototype.forEach.call(sliderStage.children, function(fig, k){
      var on = k === skIdx;
      fig.classList.toggle("is-on", on);
      fig.setAttribute("aria-hidden", on ? "false" : "true");
    });
    if(sliderDots) Array.prototype.forEach.call(sliderDots.children, function(d, k){
      d.classList.toggle("is-on", k === skIdx);
      d.setAttribute("aria-pressed", k === skIdx ? "true" : "false");
    });
    if(sliderLive && items[skIdx]) sliderLive.textContent =
      "Foto " + (skIdx + 1) + " dari " + items.length + (items[skIdx].title ? " — " + items[skIdx].title : "");
  }
  function slTick(){
    slTimer = null;
    if(document.hidden || skHover || document.body.classList.contains("modal-open")) { armSlider(); return; }
    setSlide(skIdx + 1);
    armSlider();
  }
  function armSlider(){
    if(slTimer || reduce || slVisible().length < 2) return;
    slTimer = setTimeout(slTick, SLIDE_MS);
  }
  function syncSliderUI(){
    if(!sliderStage) return;
    var items = slVisible();
    /* slider beranda selalu terlihat (menampung teks sambutan); tanpa foto
       ia berjaga dengan latar gradien dan menyembunyikan kontrol navigasi */
    if(sliderEl) sliderEl.classList.toggle("no-slides", !items.length);
    if(!items.length){ if(slTimer){ clearTimeout(slTimer); slTimer = null; } return; }
    sliderStage.innerHTML = items.map(function(s, i){
      return '<figure class="slider-slide' + (i === skIdx ? " is-on" : "") + '"' +
        (i === skIdx ? ' aria-hidden="false"' : ' aria-hidden="true"') + '>' +
        '<img src="' + esc(s.imageUrl) + '" alt="' + esc(s.title || "Foto kegiatan sekolah") + '"' +
        (i === 0 ? ' fetchpriority="high"' : ' loading="lazy"') +         ' decoding="async">' +
        "</figure>";
    }).join("");
    if(sliderDots) sliderDots.innerHTML = items.map(function(s, i){
      return '<button type="button" data-sl="' + i + '" class="' + (i === skIdx ? "is-on" : "") + '"' +
        ' aria-pressed="' + (i === skIdx ? "true" : "false") + '"' +
        ' aria-label="Foto ' + (i + 1) + (s.title ? ": " + esc(s.title) : "") + '"></button>';
    }).join("");
    if(sliderDots) Array.prototype.forEach.call(sliderDots.children, function(d, k){
      d.tabIndex = k === skIdx ? 0 : -1;
    });
    setSlide(Math.min(skIdx, items.length - 1));
    armSlider();
  }
  if(sliderStage){
    sliderPrev && sliderPrev.addEventListener("click", function(){ setSlide(skIdx - 1); armSlider(); });
    sliderNext && sliderNext.addEventListener("click", function(){ setSlide(skIdx + 1); armSlider(); });
    if(sliderDots) sliderDots.addEventListener("click", function(ev){
      var b = ev.target.closest("button[data-sl]");
      if(!b) return;
      setSlide(parseInt(b.dataset.sl, 10));
      armSlider();
    });
    if(finePointer && sliderEl){
      sliderEl.addEventListener("pointerenter", function(){ skHover = true; });
      sliderEl.addEventListener("pointerleave", function(){ skHover = false; });
    }
    /* geser sentuh/pointer: kiri-kanan ganti foto, atas-bawah biarkan scroll */
    var swX = null, swY = null;
    sliderStage.addEventListener("pointerdown", function(ev){
      if(ev.pointerType === "mouse" && ev.button !== 0) return;
      swX = ev.clientX; swY = ev.clientY;
    });
    sliderStage.addEventListener("pointerup", function(ev){
      if(swX === null) return;
      var dx = ev.clientX - swX, dy = ev.clientY - swY;
      swX = swY = null;
      if(Math.abs(dx) < 40 || Math.abs(dx) <= Math.abs(dy)) return;
      setSlide(skIdx + (dx < 0 ? 1 : -1));
      armSlider();
    });
    document.addEventListener("keydown", function(ev){
      var open = document.querySelector(".sheet-wrap:not([hidden])");
      if(open || ev.metaKey || ev.ctrlKey || ev.altKey) return;
      if(!sliderEl || sliderEl.hidden) return;
      if(ev.target && (ev.target.tagName === "INPUT" || ev.target.tagName === "TEXTAREA" || ev.target.tagName === "SELECT")) return;
      var r = sliderEl && sliderEl.getBoundingClientRect();
      if(!r || r.bottom < 0 || r.top > (window.innerHeight || 0)) return;
      if(ev.key === "ArrowLeft"){ setSlide(skIdx - 1); armSlider(); ev.preventDefault(); }
      else if(ev.key === "ArrowRight"){ setSlide(skIdx + 1); armSlider(); ev.preventDefault(); }
    });
    document.addEventListener("visibilitychange", function(){ if(!document.hidden) armSlider(); });
    armSlider();
  }

  /* — kelola: daftar & formulir foto — */
  function resetSkForm(){
    skEditingId = null;
    if(skInput) skInput.value = "";
    if(skTitle) skTitle.value = "";
    if(skPub) skPub.checked = true;
    if(skPreview){ skPreview.hidden = true; skPreviewImg.removeAttribute("src"); }
    if(skErr) skErr.hidden = true;
    if(skFileURL){ URL.revokeObjectURL(skFileURL); skFileURL = null; }
    var t = $("sk-form-title"), sub = $("sk-form-sub");
    if(t) t.textContent = "Tambah Foto";
    if(sub) sub.textContent = "Unggah foto kegiatan yang akan berputar di beranda (JPG/PNG/WebP, maks 8\u00A0MB).";
    if(skForm) skForm.hidden = true;
  }
  function setSkSaving(on, editing){
    if(!skSave) return;
    skSave.disabled = !!on;
    skSave.textContent = on ? "Menyimpan…" : (editing ? "Simpan perubahan" : "Simpan Foto");
  }
  function syncSkUI(){
    var items = state2.sliders;
    if($("sk-count")) $("sk-count").textContent =
      items.length + " foto · " + slVisible().length + " tampil di beranda";
    if(!skList) return;
    skList.innerHTML = items.map(function(s, i){
      var off = s.pub === false;
      return '<div class="k-row sk-row" data-id="' + esc(s.id) + '" data-i="' + i + '" style="--i:' + i + '">' +
        '<span class="sk-thumb"><img src="' + esc(s.imageUrl) + '" alt="" loading="lazy" decoding="async">' +
        (off ? '<i class="sk-off-ic" title="Tidak tampil di beranda" aria-hidden="true">' + I("eye-off") + "</i>" : "") + "</span>" +
        '<span class="k-info"><b>' + esc(s.title || "Tanpa judul") + "</b>" +
        "<small>" + (off ? "arsip — tak tampil" : "tampil di beranda") + " · urutan " + (i + 1) + "</small></span>" +
        '<span class="k-actions">' +
        '<button type="button" class="btn ghost k-updown" data-act="up" title="Naikkan urutan" aria-label="Naikkan urutan foto" ' + (i === 0 ? "disabled" : "") + '><span aria-hidden="true">' + I("chevron-up") + "</span></button>" +
        '<button type="button" class="btn ghost k-updown" data-act="down" title="Turunkan urutan" aria-label="Turunkan urutan foto" ' + (i === items.length - 1 ? "disabled" : "") + '><span aria-hidden="true">' + I("chevron-down") + "</span></button>" +
        '<button type="button" class="btn ghost" data-act="edit">Ubah</button>' +
        '<button type="button" class="btn danger" data-act="del">Hapus</button>' +
        "</span></div>";
    }).join("") || '<p class="p-empty">Belum ada foto slider. Tambahkan foto pertama untuk memunculkan slider di beranda.</p>';
  }
  function reorderSliders(){
    var arr = state2.sliders;
    arr.forEach(function(s, k){ s.sortOrder = k; });
    syncSliderUI();
    syncSkUI();
    Promise.all(arr.map(function(s, k){
      return LMS_API.updateSlider(s.id, { sortOrder: String(k) });
    })).then(function(rs){
      var bad = rs && rs.some(function(r){ return !(r && r.ok); });
      if(bad){ toast(apiErrMsg(rs.filter(function(r){ return !(r && r.ok); })[0], "Gagal menyimpan urutan di server."), "err"); loadSliders(); }
    });
  }
  var skAdd = $("sk-add");
  var skAddHead = $("sk-add-head");
  var openSkForm = function(){
    resetSkForm();
    if(skForm) skForm.hidden = false;
    var n = $("sk-input");
    if(n) try{ n.focus(); }catch(e){}
  };
  if(skAdd) skAdd.addEventListener("click", openSkForm);
  if(skAddHead) skAddHead.addEventListener("click", openSkForm);
  var skCancel = $("sk-cancel");
  if(skCancel) skCancel.addEventListener("click", resetSkForm);
  if(skInput) skInput.addEventListener("change", function(){
    var f = this.files && this.files[0];
    if(skPreview) skPreview.hidden = !f;
    if(!f) return;
    if(skFileURL){ URL.revokeObjectURL(skFileURL); skFileURL = null; }
    try{ skFileURL = URL.createObjectURL(f); }catch(e){}
    if(skPreviewImg && skFileURL) skPreviewImg.src = skFileURL;
  });
  if(skList) skList.addEventListener("click", function(ev){
    var b = ev.target.closest("button[data-act]");
    if(!b) return;
    var row = b.closest(".sk-row");
    var i = row && parseInt(row.dataset.i, 10);
    var arr = state2.sliders;
    if(isNaN(i) || !arr[i]) return;
    var item = arr[i];
    if(b.dataset.act === "up" || b.dataset.act === "down"){
      var j = b.dataset.act === "up" ? i - 1 : i + 1;
      if(j < 0 || j >= arr.length) return;
      var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
      reorderSliders();
      return;
    }
    if(b.dataset.act === "del"){
      if(!confirm("Hapus foto " + (item.title ? "\u201C" + item.title + "\u201D" : "ini") + " dari slider beranda?")) return;
      var finishDel = function(){
        var idx = state2.sliders.indexOf(item);
        if(idx >= 0){ state2.sliders.splice(idx, 1); }
        syncSliderUI();
        syncSkUI();
        toast("Foto dihapus dari slider.");
      };
      if(!reduce && row){
        row.classList.add("is-out");
        setTimeout(finishDel, 180);
      }else{
        finishDel();
      }
      LMS_API.deleteSlider(item.id).then(function(r){
        if(!(r && r.ok)){
          loadSliders();
          toast(apiErrMsg(r, "Gagal menghapus di server."), "err");
        }
      });
      return;
    }
    if(b.dataset.act === "edit"){
      resetSkForm();
      skEditingId = item.id;
      var t = $("sk-form-title"), sub = $("sk-form-sub");
      if(t) t.textContent = "Ubah Foto";
      if(sub) sub.textContent = "Biarkan berkas kosong bila ingin mempertahankan foto lama.";
      if(skTitle) skTitle.value = item.title || "";
      if(skPub) skPub.checked = item.pub !== false;
      if(/^(\/api\/|https:\/\/)/.test(item.imageUrl || "")){
        if(skPreviewImg) skPreviewImg.src = item.imageUrl;
        if(skPreview) skPreview.hidden = false;
      }
      if(skForm) skForm.hidden = false;
      var n = $("sk-title");
      if(n) try{ n.focus(); }catch(e){}
    }
  });
  if(skForm) skForm.addEventListener("submit", function(ev){
    ev.preventDefault();
    function fail(msg){
      setSkSaving(false, !!skEditingId);
      if(!skErr) return;
      skErr.textContent = msg;
      skErr.hidden = false;
    }
    var f = skInput && skInput.files && skInput.files[0] || null;
    var title = ((skTitle && skTitle.value) || "").trim();
    var pub = skPub ? skPub.checked : true;
    if(!apiAvailable || !window.LMS_API) return fail(backendErr());
    if(f && !skFileOK.test(f.type)) return fail("Jenis berkas harus JPG, PNG, atau WebP.");
    if(f && f.size > skFileMax) return fail("Ukuran foto terlalu besar — maksimal 8 MB.");
    if(!f){
      if(!skEditingId) return fail("Pilih berkas foto dari perangkat terlebih dahulu.");
    }
    var fields = { title: title, pub: String(pub) };
    setSkSaving(true, !!skEditingId);
    var wasEditing = !!skEditingId;
    var editId = skEditingId;
    var apiReq = shrinkImage(f).then(function(img){
      return wasEditing ? LMS_API.updateSlider(editId, fields, img) : LMS_API.createSlider(fields, img);
    });
    apiReq.then(function(r){
      setSkSaving(false, wasEditing);
      if(r && r.ok){
        resetSkForm();
        syncSkUI();
        toast(wasEditing ? "Perubahan foto disimpan." : "Foto ditambahkan ke slider.");
        loadSliders();
      }else{
        fail(apiErrMsg(r, "Gagal menyimpan foto ke server."));
      }
    });
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
      (state.entries[k] || []).forEach(function(e){
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
      var list = (state.entries[k] || []);
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
      (state.entries[k] || []).forEach(function(e){
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
  syncClassUI();
  syncPhaseUI();
  syncPantauUI();
  renderPantau();
  syncAuthUI();
  syncLoginUI();
  syncKelolaUI();
  render();
  syncScrollUI();
})();
