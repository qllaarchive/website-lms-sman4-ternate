/* API Client — bridge antara portal.js (localStorage) dan backend API.
   Jika API tersedia, data disinkronkan. Jika tidak, fallback ke localStorage. */
(function(){
  "use strict";
  var API_BASE = "http://localhost:3000/api";
  var _cached = null;

  function apiFetch(path, opts) {
    opts = opts || {};
    opts.credentials = "include";
    opts.headers = Object.assign({ "Content-Type": "application/json" }, opts.headers || {});
    return fetch(API_BASE + path, opts)
      .then(function(r){ return r.json().then(function(d){ return { ok: r.ok, data: d }; }); })
      .catch(function(){ return { ok: false, data: null }; });
  }

  window.LMS_API = {
    available: function(){
      if (_cached !== null) return Promise.resolve(_cached);
      return apiFetch("/health").then(function(r){
        _cached = r.ok;
        return _cached;
      });
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
      var q = klass ? "?klass=" + klass : "";
      return apiFetch("/lms" + q);
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