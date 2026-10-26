/* API Client — bridge antara portal.js (localStorage) dan backend API.
   Jika API tersedia, data disinkronkan. Jika tidak, fallback ke localStorage. */
(function(){
  "use strict";
  var API_BASE = String(window.LMS_API_BASE || "http://localhost:3000/api").replace(/\/+$/, "");
  var _probe = null;
  var TIMEOUT = 6000;

  function apiFetch(path, opts) {
    opts = opts || {};
    opts.credentials = "include";
    opts.headers = Object.assign({ "Content-Type": "application/json" }, opts.headers || {});
    var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timer = null;
    if (ctrl) {
      opts.signal = ctrl.signal;
      timer = setTimeout(function(){ ctrl.abort(); }, TIMEOUT);
    }
    return fetch(API_BASE + path, opts)
      .then(function(r){
        return r.text().then(function(txt){
          var d = null;
          try { d = JSON.parse(txt); } catch(e){}
          return { ok: r.ok, status: r.status, data: d };
        });
      })
      .catch(function(){ return { ok: false, status: 0, data: null }; })
      .then(function(res){
        if (timer) clearTimeout(timer);
        return res;
      });
  }

  window.LMS_API = {
    available: function(){
      if (_probe) return _probe;
      _probe = apiFetch("/lms?klass=X").then(function(r){
        if (!r.ok) _probe = null;
        return r.ok;
      });
      return _probe;
    },

    /* Auth */
    login: function(username, password){
      return apiFetch("/auth/login", { method: "POST", body: JSON.stringify({ username: username, password: password }) });
    },
    logout: function(){
      return apiFetch("/auth/logout", { method: "POST" });
    },
    me: function(){
      return apiFetch("/auth/me");
    },

    /* LMS entries */
    getEntries: function(klass){
      var q = klass ? "?klass=" + encodeURIComponent(klass) : "";
      return apiFetch("/lms" + q);
    },
    getAllEntries: function(klass){
      var q = klass ? "?klass=" + encodeURIComponent(klass) : "";
      return apiFetch("/lms/all" + q);
    },
    createEntry: function(entry){
      return apiFetch("/lms", { method: "POST", body: JSON.stringify(entry) });
    },
    updateEntry: function(id, entry){
      return apiFetch("/lms/" + id, { method: "PUT", body: JSON.stringify(entry) });
    },
    deleteEntry: function(id){
      return apiFetch("/lms/" + id, { method: "DELETE" });
    },

    /* Progress */
    saveProgress: function(lmsId, pct, source){
      return apiFetch("/progress", { method: "POST", body: JSON.stringify({ lmsId: lmsId, pct: pct, source: source }) });
    },
    getProgressSummary: function(){
      return apiFetch("/progress/summary");
    },

    /* School profile */
    getProfile: function(){
      return apiFetch("/admin/profile");
    },
    saveProfile: function(profile){
      return apiFetch("/admin/profile", { method: "PUT", body: JSON.stringify(profile) });
    },

    /* Backup / restore */
    exportAll: function(){
      return apiFetch("/admin/export");
    }
  };
})();