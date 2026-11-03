/**
 * ============================================================================
 * LMS SMAN 4 TERNATE — BACKEND GOOGLE SHEETS (Apps Script Web App)
 * ============================================================================
 * Menerima kiriman skor/progres dari halaman LMS (assets/lms.js) lalu
 * menulisnya ke spreadsheet Excel/Google Sheets.
 *
 * ===== INTEGRASI LIBRARY GOOGLE APPS SCRIPT =====
 * Library ID : 1uYEcb34o95CACmyusZlM4hpTED61JAheMoRZ7s_gPoK345dH9wPQjJbt
 * Versi      : 2
 *
 * CARA MENAMBAHKAN LIBRARY (harus lewat editor web, tidak bisa lewat file ini):
 *  1. Buka https://script.google.com → buka project Apps Script Anda.
 *  2. Di sidebar kiri, klik ikon "⊕" di sebelah tulisan "Libraries".
 *  3. Tempel Script ID di atas ke kotak "Add a script as a library".
 *  4. Klik Look → pilih Versi 2 → klik Add.
 *  5. Simpan project (ikon disket / Ctrl+S).
 *
 * Setelah ditambahkan, ganti "NamaLibrary" di bawah ini dengan nama
 * library yang muncul di editor (biasanya nama default dari project library),
 * lalu isi fungsi-fungsi yang sesuai dengan yang diekspor library.
 * ============================================================================
 * Menerima kiriman skor/progres dari halaman LMS (assets/lms.js) lalu
 * menulisnya ke spreadsheet Excel/Google Sheets.
 *
 * CARA PAKAI:
 * 1. Buka spreadsheet Anda → menu Ekstensi → Apps Script.
 * 2. Ganti seluruh isi Code.gs dengan file ini → Simpan (Ctrl/Cmd+S).
 * 3. Jalankan fungsi `siapkanSheet` sekali (beri izin akses saat diminta).
 * 4. Deploy → New deployment → pilih tipe **Web app**:
 *      - Execute as        : Me
 *      - Who has access     : Anyone
 *    lalu klik Deploy dan salin URL yang muncul.
 * 5. Ambil KODE dari URL, yaitu bagian setelah "/macros/s/" dan sebelum "/exec"
 *    contoh URL : https://script.google.com/macros/s/AKfycbXXXXXX/exec
 *                 \___________________ kode Anda = AKfycbXXXXXX __________/
 * 6. Tempel kode itu di LMS:
 *      - Portal → Kelola mapel → kolom "Kode Apps Script", ATAU
 *      - Di dalam mapel → ⚙️ Settings → "Kode Web App" → Uji koneksi.
 *
 * CATATAN TEKNIS:
 * - Kiriman dari LMS memakai Content-Type text/plain (bukan application/json)
 *   agar tidak kena preflight CORS yang tidak didukung Apps Script.
 * - Satu spreadsheet bisa dipakai semua mapel (ada kolom "Mapel").
 * ============================================================================
 */

/* ========================= KONFIGURASI ========================= */
/** Opsional: isi ID spreadsheet (bagian /d/ pada URL spreadsheet) HANYA bila
 *  skrip ini dibuat standalone (tidak menempel pada spreadsheet).
 *  Bila kosong, skrip memakai spreadsheet tempat skrip ini menempel. */
var SPREADSHEET_ID = "";

/** KKTP dipakai bila LMS tidak mengirim nilai kktp. */
var KKTP_DEFAULT = 70;

/** Nama mapel pengganti bila LMS tidak mengirim kolom "mapel"
 *  (mis. Matematika). Kosongkan ("") agar ditulis "-". */
var MAPOL_DEFAULT = "";

/** Definisi sheet + judul kolomnya. */
var TABEL = {
  nilai: {
    name: "Nilai",
    head: ["Waktu", "Nama", "Kelas", "Absen", "Mapel", "Unit", "Jenis", "Skor", "KKTP", "Status"]
  },
  progres: {
    name: "Progres",
    head: ["Waktu", "Nama", "Kelas", "Absen", "Mapel", "Selesai", "Total", "Persen"]
  },
  log: {
    name: "Log",
    head: ["Waktu", "Tipe", "Pesan"]
  }
};

/* ========================= WRAPPER LIBRARY =========================
 * Ganti "NamaLibrary" dengan nama library yang muncul di editor Apps Script
 * setelah Anda menambahkan library (Script ID:
 * 1uYEcb34o95CACmyusZlM4hpTED61JAheMoRZ7s_gPoK345dH9wPQjJbt, versi 2).
 *
 * Contoh struktur (sesuaikan dengan fungsi yang diekspor library):
 *
 * var Lib = {
 *   sinkronNilai: function(row) { return NamaLibrary.simpanNilai(row); },
 *   backupProgres: function() { return NamaLibrary.exportProgres(); },
 *   notifikasi: function(pesan) { return NamaLibrary.kirimNotif(pesan); }
 * };
 *
 * Jika library tidak memiliki fungsi apa-apa yang perlu dipanggil,
 * biarkan variabel Lib ini kosong atau hapus bagian ini.
 * ========================= WRAPPER LIBRARY ========================= */
var Lib = {};
/* Contoh (hapus komentar dan isi nama fungsi asli library):
var Lib = {
  simpanNilai: function(nama, kelas, mapel, unit, jenis, skor, kktp, waktu) {
    return NamaLibrary.simpanNilai(nama, kelas, mapel, unit, jenis, skor, kktp, waktu);
  }
};
*/

/* ========================= UTILITAS ========================= */
function ss_() {
  if (SPREADSHEET_ID) return SpreadsheetApp.openById(SPREADSHEET_ID);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error("SPREADSHEET_ID belum diisi dan skrip tidak menempel pada spreadsheet.");
  return ss;
}

function sheet_(key) {
  var cfg = TABEL[key];
  if (!cfg) throw new Error("Tabel tidak dikenal: " + key);
  var sh = ss_().getSheetByName(cfg.name);
  if (!sh) {
    sh = ss_().insertSheet(cfg.name);
    sh.appendRow(cfg.head);
    sh.setFrozenRows(1);
    styleHeader_(sh, cfg.head.length);
  } else {
    ensureHead_(sh, cfg.head);
  }
  return sh;
}

/** Perbarui baris judul bila daftar kolom berubah (mis. kolom "Absen" baru),
 *  agar sheet lama otomatis mengikuti format Code.gs terbaru. */
function ensureHead_(sh, head) {
  var cols = Math.max(sh.getLastColumn(), head.length);
  var have = cols > 0 ? (sh.getRange(1, 1, 1, cols).getValues()[0] || []) : [];
  if (have.join("!") !== head.join("!")) {
    sh.getRange(1, 1, 1, head.length).setValues([head]);
    styleHeader_(sh, head.length);
  }
}

function styleHeader_(sh, cols) {
  var rng = sh.getRange(1, 1, 1, cols);
  rng.setFontWeight("bold");
  rng.setBackground("#3d2914");
  rng.setFontColor("#f5e6c8");
  sh.setFrozenRows(1);
  for (var c = 1; c <= cols; c++) sh.autoResizeColumn(c);
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function withLock_(fn) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    return fn();
  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }
}

function now_() { return new Date().toISOString(); }

function log_(tipe, pesan) {
  try { sheet_("log").appendRow([now_(), tipe, String(pesan).slice(0, 500)]); } catch (e) {}
}

function str_(v) { return v === undefined || v === null ? "" : String(v); }

/* ========================= ENDPOINT UTAMA ========================= */

/** Web app: semua kiriman LMS masuk lewat sini (POST JSON). */
function doPost(e) {
  var data;
  try {
    data = JSON.parse((e && e.postData && e.postData.contents) || "{}");
  } catch (err) {
    return out_({ ok: false, error: "payload bukan JSON valid" });
  }

  try {
    var t = str_(data.t).toLowerCase();

    /* ---- Uji koneksi dari Settings LMS ---- */
    if (t === "uji") {
      var namaSs = ss_().getName();
      log_("uji", "Uji koneksi dari " + str_(data.mapel || "LMS") +
        (data.siswa ? " • siswa " + str_(data.siswa) : "") + " • sheet: " + namaSs);
      return out_({ ok: true, msg: "Terhubung ke \"" + namaSs + "\"", waktu: now_() });
    }

    /* ---- Skor asesmen (diagnostik, formatif, kuis, UTS/UAS, remedial) ----
     * Mendukung 2 format kiriman LMS:
     *   Sejarah/engine lms.js : { t:"skor",  siswa, kelas, mapel, unit, jenis, skor, kktp, waktu }
     *   Matematika (self-cont.): { t:"nilai", nama, kelas, sekolah, jenis, unit, skor, kktp }
     */
    if (t === "skor" || t === "nilai") {
      var skor = Number(data.skor);
      if (isNaN(skor)) return out_({ ok: false, error: "skor bukan angka" });
      var kktp = Number(data.kktp) || KKTP_DEFAULT;
      /* Format Matematika tidak mengirim "mapel" → tulis "-" (bisa juga diisi nama
         mapel statis di sini, mis. var MAPOL_SEJARAH = "Matematika";) */
      var mapel = str_(data.mapel) || MAPOL_DEFAULT || "-";
      var row = [
        str_(data.waktu) || now_(),
        str_(data.siswa || data.nama) || "-",
        str_(data.kelas) || "-",
        str_(data.absen) || "-",
        mapel,
        data.unit === undefined || data.unit === "" ? 0 : data.unit,
        str_(data.jenis) || "-",
        skor,
        kktp,
        skor >= kktp ? "Lulus" : "Belum"
      ];
      withLock_(function () { sheet_("nilai").appendRow(row); });
      log_("skor", row[1] + " • " + row[2] + " • " + row[4] + " unit " + row[5] + " • " + row[7]);
      /* ---- Panggilan library (diaktifkan bila Anda mengisi fungsi di Lib) ----
         Contoh: Lib.simpanNilai(...) — hapus komentar & isi nama fungsi asli library. */
      /* if (typeof Lib.simpanNilai === "function") {
          try { Lib.simpanNilai(row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[0]); }
          catch (e) { log_("lib", "Lib.simpanNilai gagal: " + String(e)); }
        } */
      return out_({ ok: true, msg: "Skor tersimpan", status: row[9] });
    }

    /* ---- Progres semester (opsional, upsert per Nama + Mapel) ----
     * lms.js    : { t:"progres", siswa, kelas, absen, mapel, total:{pct,d,t} }
     * matematika: { t:"progres", nama, kelas, sekolah, total:{pct,d,t}, ... }
     */
    if (t === "progres") {
      if (data.total && typeof data.total === "object") {
        data.d = data.total.d; data.t = data.total.t; data.pct = data.total.pct;
      }
      if (!data.siswa && data.nama) data.siswa = data.nama;
      if (!data.mapel && data.nama !== undefined) data.mapel = "-";
      var d2 = upsertProgres_(data);
      return out_({ ok: true, msg: d2 });
    }

    /* ---- Tipe lain (mis. forum/pesan) dicatat ke Log agar tidak hilang ---- */
    log_(t || "?", JSON.stringify(data));
    return out_({ ok: true, msg: "Tercatat di Log" });
  } catch (err) {
    log_("error", String(err));
    return out_({ ok: false, error: String(err) });
  }
}

/** Web app: GET dipakai untuk ping/status. */
function doGet(e) {
  return out_({
    ok: true,
    app: "LMS SMAN 4 Ternate",
    spreadsheet: ss_().getName(),
    barisNilai: Math.max(0, sheet_("nilai").getLastRow() - 1),
    waktu: now_()
  });
}

/** Simpan/ubah baris progres (per Nama + Mapel). */
function upsertProgres_(data) {
  var nama = str_(data.siswa) || "-", mapel = str_(data.mapel) || "-";
  var row = [
    now_(), nama, str_(data.kelas) || "-", str_(data.absen) || "-", mapel,
    Number(data.d) || 0, Number(data.t) || 0, Number(data.pct) || 0
  ];
  return withLock_(function () {
    var sh = sheet_("progres");
    var values = sh.getDataRange().getValues();
    for (var i = values.length - 1; i >= 1; i--) {
      if (values[i][1] === nama && values[i][3] === mapel) {
        sh.getRange(i + 1, 1, 1, row.length).setValues([row]);
        return "Diperbarui";
      }
    }
    sh.appendRow(row);
    return "Ditambahkan";
  });
}

/* ========================= UTIL ADMIN ========================= */

/** Jalankan sekali dari editor / menu LMS untuk membuat semua sheet. */
function siapkanSheet() {
  sheet_("nilai");
  sheet_("progres");
  sheet_("log");
  log_("setup", "Sheet LMS disiapkan");
  SpreadsheetApp.getUi().alert(
    "Sheet siap:\n• " + TABEL.nilai.name +
    "\n• " + TABEL.progres.name +
    "\n• " + TABEL.log.name +
    "\n\nSelanjutnya: Deploy → New deployment → Web app → Anyone."
  );
}

/** Menu bantuan di spreadsheet. */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("LMS")
    .addItem("Siapkan sheet", "siapkanSheet")
    .addItem("Isi data contoh", "isiContoh")
    .addToUi();
}

/** Data contoh agar tampilan sheet langsung terlihat. */
function isiContoh() {
  withLock_(function () {
    sheet_("nilai").appendRow([
      now_(), "Nadia Rahma", "X-3", "07", "Sejarah", 1, "Diagnostik Unit 1", 85, 70, "Lulus"
    ]);
    sheet_("progres").appendRow([now_(), "Nadia Rahma", "X-3", "07", "Sejarah", 1, 7, 14]);
  });
  log_("setup", "Data contoh ditambahkan");
}
