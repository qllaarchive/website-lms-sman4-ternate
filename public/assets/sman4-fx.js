/* One Site SMANFOURTTE — lambang bercincin emas di halaman pembuka. */
(function(){
  var main = document.querySelector("#intro .intro-main");
  if(main && !main.querySelector(".s4-emblem")){
    var em = document.createElement("div");
    em.className = "s4-emblem"; em.setAttribute("aria-hidden", "true");
    var ticks = "";
    for(var i = 0; i < 12; i++){
      var a = i * Math.PI / 6, x1 = 100 + Math.cos(a) * 97, y1 = 100 + Math.sin(a) * 97, x2 = 100 + Math.cos(a) * 103, y2 = 100 + Math.sin(a) * 103;
      ticks += '<line class="tick" x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '"/>';
    }
    em.innerHTML = '<svg viewBox="0 0 200 200"><circle class="r2" cx="100" cy="100" r="99"/><circle class="r1" cx="100" cy="100" r="88" transform="rotate(-90 100 100)"/>' + ticks + '</svg>' +
                   '<img src="assets/logo-sma4.webp" alt="" width="120" height="120" decoding="async">';
    main.insertBefore(em, main.firstChild);
    var school = main.querySelector(".intro-school");
    if(school) school.textContent = "SMA Negeri 4 Kota Ternate, berdiri sejak 1991";
    var cta = main.querySelector(".intro-cta span:first-child");
    if(cta) cta.textContent = "Masuk ke portal";
  }
  var intro = document.getElementById("intro");
  if(intro && !intro.querySelector(".s4-region")){
    var r = document.createElement("div");
    r.className = "s4-region";
    r.innerHTML = '<img src="assets/logo-malut.svg" alt="" width="26" height="30"><span>Pemerintah Provinsi Maluku Utara</span>';
    intro.appendChild(r);
  }
})();

/* Video sinematik pembuka (±7,5 detik). Diputar sekali per sesi, bisa dilewati.
   Gagal autoplay / pengguna memilih gerak dikurangi → langsung tampilkan bingkai akhir. */
(function(){
  var root = document.documentElement;
  var intro = document.getElementById("intro");
  if(!intro || root.classList.contains("intro-seen")) return;
  var enterBtn = document.getElementById("intro-enter");
  var tall = (window.innerWidth || 1) / (window.innerHeight || 1) < 1;
  var base = "assets/pembuka-" + (tall ? "tall" : "wide");

  var v = document.createElement("video");
  v.className = "s4-film";
  v.muted = true; v.defaultMuted = true; v.playsInline = true;
  v.setAttribute("muted", ""); v.setAttribute("playsinline", ""); v.setAttribute("aria-hidden", "true");
  v.preload = "auto";
  v.poster = base + "-awal.webp"; /* bingkai pertama tampil selama video dimuat di jaringan lambat */
  var shade = intro.querySelector(".intro-shade");
  intro.insertBefore(v, shade || intro.firstChild);
  intro.classList.add("has-film");

  var skip = document.createElement("button");
  skip.type = "button"; skip.className = "s4-skip"; skip.textContent = "Lewati";
  skip.setAttribute("aria-label", "Lewati video pembuka dan masuk ke portal");
  intro.appendChild(skip);
  skip.addEventListener("click", function(){ if(enterBtn) enterBtn.click(); });

  var done = false;
  function finish(stillFrame){
    if(done) return; done = true;
    if(stillFrame){ v.removeAttribute("src"); v.poster = base + "-akhir.webp"; try{ v.load(); }catch(e){} intro.classList.add("film-still"); }
    intro.classList.add("film-done");
    if(stillFrame) orbit(); /* video berjalan: logo diputar ulang dari video itu sendiri (lihat "ended") */
    skip.hidden = true;
    if(enterBtn) setTimeout(function(){ try{ enterBtn.focus({ preventScroll:true }); }catch(e){} }, 350);
  }
  /* Busur emas yang terus mengitari lambang di bingkai akhir video.
     Posisi lambang (piksel video) diukur dari pembuka-*-akhir.webp: pusat & lebar lingkaran 200 satuan SVG. */
  var EMB = tall ? { w:720, h:1280, x:359, y:562.5, d:242 } : { w:1280, h:720, x:639.5, y:301.5, d:201 };
  function orbit(){
    if(intro.querySelector(".s4-orbit")) return;
    var o = document.createElement("div");
    o.className = "s4-orbit"; o.setAttribute("aria-hidden", "true");
    o.innerHTML = '<svg viewBox="0 0 200 200"><circle class="r3" cx="100" cy="100" r="88"/><circle class="r4" cx="100" cy="100" r="99"/></svg>';
    intro.insertBefore(o, v.nextSibling);
    function place(){ /* sama dengan object-fit:cover */
      var W = intro.clientWidth, H = intro.clientHeight, k = Math.max(W / EMB.w, H / EMB.h);
      var ox = (W - EMB.w * k) / 2, oy = (H - EMB.h * k) / 2, d = EMB.d * k;
      o.style.width = o.style.height = d + "px";
      o.style.left = (ox + EMB.x * k - d / 2) + "px";
      o.style.top = (oy + EMB.y * k - d / 2) + "px";
    }
    place(); window.addEventListener("resize", place);
  }
  /* Diputar juga saat "kurangi animasi" aktif: pemilik situs ingin efek zoom selalu tampil; tombol Lewati tetap ada. */

  v.src = base + ".mp4";
  /* Setelah selesai, bagian logo (detik 5,2 → akhir: lingkaran emas tergambar & logo muncul) diputar ulang terus. */
  var LOOP_FROM = 5.2;
  v.addEventListener("ended", function(){
    finish(false);
    if(intro.classList.contains("is-leaving")) return;
    try{ v.currentTime = LOOP_FROM; var q = v.play(); if(q && q.catch) q.catch(function(){}); }catch(e){}
  });
  v.addEventListener("error", function(){ finish(true); });
  var started = false;
  v.addEventListener("playing", function(){ started = true; intro.classList.add("film-on"); });
  var p = v.play();
  if(p && p.catch) p.catch(function(){ finish(true); });
  /* jaringan lambat: tunggu lebih lama (poster bingkai pertama sudah tampil), baru menyerah */
  setTimeout(function(){ if(!started) finish(true); }, 15000);
  /* hemat daya setelah pembuka ditutup */
  if(enterBtn) enterBtn.addEventListener("click", function(){ setTimeout(function(){ try{ v.pause(); }catch(e){} }, 700); });
})();

/* Petak waktu: jam & tanggal Ternate (WIT). */
(function(){
  var c = document.getElementById("tm-clock"), d = document.getElementById("tm-date"), g = document.getElementById("tm-greet");
  if(!c) return;
  var tz = "Asia/Jayapura";
  function fmt(opts){ try{ return new Intl.DateTimeFormat("id-ID", Object.assign({ timeZone:tz }, opts)).format(new Date()); }catch(e){ return ""; } }
  function tick(){
    var hm = fmt({ hour:"2-digit", minute:"2-digit", hour12:false }).replace(":", ".");
    if(hm) c.textContent = hm;
    if(d) d.textContent = fmt({ weekday:"long", day:"numeric", month:"long", year:"numeric" });
    var h = parseInt(fmt({ hour:"numeric", hour12:false }), 10);
    if(g && !isNaN(h)) g.textContent = h < 11 ? "Selamat pagi" : h < 15 ? "Selamat siang" : h < 18 ? "Selamat sore" : "Selamat malam";
  }
  tick();
  setInterval(tick, 15000);
})();
