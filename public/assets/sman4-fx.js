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
