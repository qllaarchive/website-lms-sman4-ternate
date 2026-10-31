/* LMS shell guard — dimuat oleh halaman shell mapel yang belum punya data.
   Kalau file data dapat dimuat, injeksikan engine lms.js; kalau tidak,
   tampilkan pesan "belum terbit" yang rapi, bukan halaman kosong/error. */
(function(){
  "use strict";
  var me = document.currentScript || (function(){
    var s = document.scripts; return s[s.length - 1];
  })();
  var slug = me.getAttribute("data-mapel") || "";
  var name = me.getAttribute("data-name") || slug;

  function esc(s){
    return String(s).replace(/[&<>"']/g, function(c){
      return ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[c];
    });
  }
  function title(s){
    var el = document.getElementById("brandTitle");
    if(el){ el.textContent = s; }
  }
  function soon(){
    title("LMS Kelas X");
    var main = document.getElementById("main");
    if(!main) return;
    var side = document.getElementById("sideNote");
    if(side) side.textContent = "";
    var moto = document.getElementById("brandMoto");
    if(moto) moto.textContent = "";
    main.innerHTML =
      '<div class="soon" role="status">' +
        '<span class="soon-ic" aria-hidden="true">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
            '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v6"/><path d="M12 16.5h.01"/>' +
          "</svg>" +
        "</span>" +
        "<h2>LMS " + esc(name) + " belum terbit</h2>" +
        "<p>Materi, latihan, dan gim untuk mata pelajaran ini sedang disiapkan guru. " +
        "Silakan kembali lagi nanti, atau buka mata pelajaran lain dari <a href=\"../index.html\">portal</a>.</p>" +
      "</div>";
  }
  function loadEngine(){
    var e = document.createElement("script");
    e.src = "../assets/lms.js";
    document.body.appendChild(e);
  }

  if(!slug || slug !== String(slug).replace(/[^a-z0-9_-]+/g, "")){ soon(); return; }
  var s = document.createElement("script");
  s.src = "../data/" + slug + ".js";
  s.onload = loadEngine;
  s.onerror = soon;
  document.body.appendChild(s);
})();
