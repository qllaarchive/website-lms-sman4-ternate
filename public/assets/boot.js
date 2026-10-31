/* Portal LMS — skrip awal yang harus jalan sebelum cat pertama.
   Dibuat sebagai file eksternal agar lolos CSP strict (script-src 'self'). */
(function(){
  /* — tema terang/gelap/ikuti perangkat — */
  var t;
  try{ t = localStorage.getItem("lms_theme"); }catch(e){}
  if(t !== "light" && t !== "dark") t = "auto";
  document.documentElement.setAttribute("data-theme", t);

  /* — sembunyikan halaman pembuka pada kunjungan berikutnya dalam sesi yang sama — */
  var seen = false, force = false;
  try{ seen = sessionStorage.getItem("lms_intro_seen") === "1"; }catch(e){}
  try{ force = /(?:^|[?&])pembuka=1(?:&|$)/.test(location.search); }catch(e){}
  if(seen && !force) document.documentElement.classList.add("intro-seen");
})();
