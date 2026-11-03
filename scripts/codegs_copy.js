/**
 * ============================================================================
 * LMS SMAN 4 TERNATE — BACKEND GOOGLE SHEETS (Apps Script Web App)
 * ============================================================================
 * Menerima kiriman skor/progres dari halaman LMS (lms.js) lalu
 * menulisnya ke spreadsheet Excel/Google Sheets.
 *
 * CARA PAKAI:
 * 1. Buka spreadsheet -> Ekstensi -> Apps Script.
 * 2. Ganti seluruh isi Code.gs dengan file ini -> Simpan.
 * 3. Jalankan fungsi siapkanSheet sekali (beri izin akses saat diminta).
 * 4. Deploy -> New deployment -> Web app:
 *      - Execute as: Me
 *      - Who has access: Anyone
 *    lalu klik Deploy dan salin URL.
 * 5. Tempel kode dari URL (bagian setelah /macros/s/ sampai /exec) ke LMS.
 * ============================================================================
 */

var SPREADSHEET_ID = "";
var KKTP_DEFAULT = 70;
var MAPOL_DEFAULT = "";

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

var Lib = {};

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

function doPost(e) {
  var data;
  try {
    data = JSON.parse((e && e.postData && e.postData.contents) || "{}");
  } catch (err) {
    return out_({ ok: false, error: "payload bukan JSON valid" });
  }

  try {
    var t = str_(data.t).toLowerCase();

    if (t === "uji") {
      var namaSs = ss_().getName();
      log_("uji", "Uji koneksi dari " + str_(data.mapel || "LMS") +
        (data.siswa ? " • siswa " + str_(data.siswa) : "") + " • sheet: " + namaSs);
      return out_({ ok: true, msg: "Terhubung ke \"" + namaSs + "\"", waktu: now_() });
    }

    if (t === "skor" || t === "nilai") {
      var skor = Number(data.skor);
      if (isNaN(skor)) return out_({ ok: false, error: "skor bukan angka" });
      var kktp = Number(data.kktp) || KKTP_DEFAULT;
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
      return out_({ ok: true, msg: "Skor tersimpan", status: row[9] });
    }

    if (t === "progres") {
      if (data.total && typeof data.total === "object") {
        data.d = data.total.d; data.t = data.total.t; data.pct = data.total.pct;
      }
      if (!data.siswa && data.nama) data.siswa = data.nama;
      if (!data.mapel && data.nama !== undefined) data.mapel = "-";
      var d2 = upsertProgres_(data);
      return out_({ ok: true, msg: d2 });
    }

    log_(t || "?", JSON.stringify(data));
    return out_({ ok: true, msg: "Tercatat di Log" });
  } catch (err) {
    log_("error", String(err));
    return out_({ ok: false, error: String(err) });
  }
}

function doGet(e) {
  return out_({
    ok: true,
    app: "LMS SMAN 4 Ternate",
    spreadsheet: ss_().getName(),
    barisNilai: Math.max(0, sheet_("nilai").getLastRow() - 1),
    waktu: now_()
  });
}

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

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("LMS")
    .addItem("Siapkan sheet", "siapkanSheet")
    .addItem("Isi data contoh", "isiContoh")
    .addToUi();
}

function isiContoh() {
  withLock_(function () {
    sheet_("nilai").appendRow([
      now_(), "Nadia Rahma", "X-3", "07", "Sejarah", 1, "Diagnostik Unit 1", 85, 70, "Lulus"
    ]);
    sheet_("progres").appendRow([now_(), "Nadia Rahma", "X-3", "07", "Sejarah", 1, 7, 14]);
  });
  log_("setup", "Data contoh ditambahkan");
}
