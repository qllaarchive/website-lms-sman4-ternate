(function(){
  var intro = document.getElementById("intro");
  if(!intro) return;
  var root = document.documentElement;
  var btn = document.getElementById("intro-enter");
  if(root.classList.contains("intro-seen")) return;

  var forced = false;
  try { forced = /(?:^|[?&])pembuka=1(?:&|$)/.test(location.search); } catch(e){}

  var meta = document.getElementById("meta-theme");
  if(meta) meta.content = "#1a2b19";

  var site = Array.prototype.slice.call(document.querySelectorAll(".nav, main, footer, .to-top"));
  function setSiteInert(on){
    site.forEach(function(el){
      if(on) el.setAttribute("inert", "");
      else el.removeAttribute("inert");
    });
  }
  setSiteInert(true);

  function restoreMeta(){
    if(!meta) return;
    var t = root.getAttribute("data-theme");
    var dark = t === "dark" || (t === "auto" && window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
    meta.content = dark ? "#000000" : "#f5f5f7";
  }

  var entering = false;
  function enter(){
    if(entering) return;
    entering = true;
    if(btn) btn.disabled = true;
    try { sessionStorage.setItem("lms_intro_seen", "1"); } catch(e){}
    /* Portal "bangun" serentak dengan naiknya tirai pembuka. */
    document.body.classList.add("waking");
    intro.classList.add("is-leaving");
    var reduce = false; /* animasi lembut tetap jalan (lihat portal.js) */
    setTimeout(function(){
      root.classList.add("intro-seen");
      setSiteInert(false);
      restoreMeta();
      if(forced){
        try { history.replaceState(null, "", location.pathname + location.hash); } catch(e){}
      }
      try { window.scrollTo(0, 0); } catch(e){}
      var title = document.getElementById("portal-title");
      if(title){
        try { title.focus({ preventScroll: true }); }
        catch(e){ try { title.focus(); } catch(e2){} }
      }
    }, reduce ? 0 : 480);
  }

  if(btn) btn.addEventListener("click", enter);
})();
