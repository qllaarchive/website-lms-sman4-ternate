/* API Client — jembatan portal.js ke backend API. Semua data LMS (tautan),
   akun admin, dan profil sekolah tersimpan di database melalui API ini.
   Autentikasi lewat cookie JWT httpOnly (SameSite=None, Secure) yang dikirim
   otomatis browser dengan credentials: include. Token JWT disimpan hanya di
   cookie httpOnly — tidak di sessionStorage agar tidak bisa dicuri lewat XSS. */
(function(){
  "use strict";
  var API_BASE = String(window.LMS_API_BASE || "/api").replace(/\/+$/, "");
  var _probe = null;
  var TIMEOUT = 6000;

  /* CSRF token disimpan hanya di memori (variabel), tidak di sessionStorage.
     Diperoleh dari response body login dan dikirim kembali sebagai header
     X-CSRF-Token pada setiap permintaan state-changing. */
  var _csrf = null;
  function storeCsrf(c){ _csrf = c || null; }
  function authHeaders(){
    var h = {};
    if (_csrf) h["X-CSRF-Token"] = _csrf;
    return h;
  }

  function apiFetch(path, opts) {
    opts = opts || {};
    opts.credentials = "include";
    opts.headers = Object.assign({ "Content-Type": "application/json" }, authHeaders(), opts.headers || {});
    return apiRaw(path, opts);
  }

  /* Kiriman FormData (unggah foto) — tanpa header Content-Type supaya
     browser men set boundary multipart secara otomatis. */
  function apiUpload(path, formData, method) {
    return apiRaw(path, { method: method || "POST", body: formData, timeout: 30000 });
  }

  function apiRaw(path, opts) {
    opts = opts || {};
    opts.credentials = "include";
    opts.headers = Object.assign({}, opts.headers || {}, authHeaders());
    var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timer = null;
    if (ctrl) {
      opts.signal = ctrl.signal;
      timer = setTimeout(function(){ ctrl.abort(); }, opts.timeout || TIMEOUT);
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

  function formSlider(fields, file){
    var fd = new FormData();
    Object.keys(fields || {}).forEach(function(k){
      if (fields[k] !== undefined && fields[k] !== null) fd.append(k, fields[k]);
    });
    if (file) fd.append("image", file);
    return fd;
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

    /* Auth (cookie JWT httpOnly + CSRF token di memori) */
    login: function(username, password){
      return apiFetch("/auth/login", { method: "POST", body: JSON.stringify({ username: username, password: password }) })
        .then(function(r){
          if (r.ok && r.data && r.data.csrf) storeCsrf(r.data.csrf);
          return r;
        });
    },
    logout: function(){
      return apiFetch("/auth/logout", { method: "POST" }).then(function(r){
        storeCsrf(null);
        return r;
      });
    },
    me: function(){
      return apiFetch("/auth/me");
    },

    /* Daftar LMS (tautan) */
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

    /* Slider foto beranda */
    getSliders: function(){
      return apiFetch("/sliders");
    },
    getAllSliders: function(){
      return apiFetch("/sliders/all");
    },
    createSlider: function(fields, file){
      return apiUpload("/sliders", formSlider(fields, file), "POST");
    },
    updateSlider: function(id, fields, file){
      return apiUpload("/sliders/" + encodeURIComponent(id), formSlider(fields, file), "PUT");
    },
    deleteSlider: function(id){
      return apiFetch("/sliders/" + encodeURIComponent(id), { method: "DELETE" });
    }
  };
})();
