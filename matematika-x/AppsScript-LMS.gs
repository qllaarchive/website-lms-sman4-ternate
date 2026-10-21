/*************************************************************
 * BACKEND GOOGLE SHEETS — LMS MATEMATIKA KELAS X
 * AppsScript-LMS.gs — menerima data dari LMS (index.html)
 *
 * CARA PAKAI:
 * 1. Buka Google Spreadsheet (baru atau yang sudah dipakai).
 * 2. Menu  Ekstensi ▸ Apps Script.
 * 3. Hapus isi Code.gs bawaan, tempel SELURUH isi file ini, simpan.
 * 4. Deploy ▸ New deployment ▸ Type: Web app
 *      Execute as : Me
 *      Who has access : Anyone
 *    lalu klik Deploy dan salin URL yang berakhiran /exec
 * 5. Di LMS: menu Settings ▸ "Integrasi Google Sheets" ▸
 *    tempel URL tadi (cukup bagian setelah /macros/s/), klik
 *    "Uji koneksi" sampai muncul "Terhubung".
 *
 * SPREADSHEET OTOMATIS:
 * - Jika script ini dibuka dari spreadsheet (bound script),
 *   data masuk ke spreadsheet tersebut.
 * - Jika script standalone, spreadsheet dibuat otomatis dan ID-nya
 *   disimpan di Script Properties.
 *
 * SHEET YANG DIPAKAI (dibuat otomatis):
 * - "Nilai Murid"   : riwayat skor tiap latihan/kuis/ujian
 * - "Progres Murid" : ringkasan progres (1 baris per murid, di-update)
 *************************************************************/

const SHEET_NILAI   = 'Nilai Murid';
const SHEET_PROGRES = 'Progres Murid';

/* ---------------- ENTRY POINT ---------------- */

function doGet() {
  return json_({ ok: true, app: 'LMS Matematika X', waktu: new Date().toISOString() });
}

function doPost(e) {
  try {
    const p = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (p.t === 'uji') {
      return json_({ ok: true, msg: 'Terhubung ke spreadsheet' });
    }
    if (p.t === 'nilai') {
      simpanNilai_(p);
      return json_({ ok: true, msg: 'Nilai tersimpan' });
    }
    if (p.t === 'progres') {
      simpanProgres_(p);
      return json_({ ok: true, msg: 'Progres tersimpan' });
    }
    return json_({ ok: false, msg: 'Tipe data tidak dikenal: ' + p.t });
  } catch (err) {
    return json_({ ok: false, msg: String((err && err.message) || err) });
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ---------------- SIMPAN NILAI (append riwayat) ---------------- */

function simpanNilai_(p) {
  const sh = sheet_(SHEET_NILAI, [
    'Waktu', 'Nama', 'Kelas', 'Sekolah', 'Jenis', 'Unit', 'Skor', 'KKTP', 'Status'
  ]);
  const waktu = new Date();
  const skor = Number(p.skor) || 0;
  const kktp = Number(p.kktp) || 70;
  sh.appendRow([
    waktu,
    String(p.nama || 'Murid'),
    String(p.kelas || '-'),
    String(p.sekolah || '-'),
    String(p.jenis || 'Latihan'),
    p.unit && p.unit !== '-' ? 'Unit ' + p.unit : '-',
    skor,
    kktp,
    skor >= kktp ? 'Tuntas' : 'Remedial'
  ]);
}

/* ---------------- SIMPAN PROGRES (upsert per murid) ---------------- */

function simpanProgres_(p) {
  const sh = sheet_(SHEET_PROGRES, [
    'Waktu', 'Nama', 'Kelas', 'Sekolah', 'Progres %', 'Unit Selesai',
    'UTS', 'UAS', 'Remedial', 'Lab Selesai', 'Detail Unit (JSON)'
  ]);
  const waktu = new Date();
  const nama  = String(p.nama || 'Murid');
  const kelas = String(p.kelas || '-');

  const total = (p.total && Number(p.total.d)) || 0;
  const cap   = (p.total && Number(p.total.t)) || 0;
  const pct   = cap ? Math.round(total / cap * 100) : 0;
  const ujian = p.ujian || {};
  const units = p.units || {};
  let unitSelesai = 0;
  for (let n = 1; n <= 12; n++) {
    const u = units[n];
    if (u && u.materi && u.diag && u.form && u.quiz && u.refl && u.proj && u.meet) unitSelesai++;
  }

  const baris = [
    waktu, nama, kelas, String(p.sekolah || '-'),
    pct, unitSelesai,
    Number(ujian.uts) || 0, Number(ujian.uas) || 0, Number(ujian.rem) || 0,
    Number(p.labs) || 0,
    JSON.stringify(units)
  ];

  const barisLama = cariBaris_(sh, nama, kelas);
  if (barisLama > 0) sh.getRange(barisLama, 1, 1, baris.length).setValues([baris]);
  else sh.appendRow(baris);
}

/* Cari baris berdasarkan kolom B (Nama) + C (Kelas). 0 = tidak ada. */
function cariBaris_(sh, nama, kelas) {
  const akhir = sh.getLastRow();
  if (akhir < 2) return 0;
  const data = sh.getRange(2, 2, akhir - 1, 2).getValues(); // kolom B:C
  for (let i = 0; i < data.length; i++) {
    if (String(data[i][0]) === nama && String(data[i][1]) === kelas) return i + 2;
  }
  return 0;
}

/* ---------------- HELPER SHEET ---------------- */

function sheet_(name, header) {
  const props = PropertiesService.getScriptProperties();
  let ss = null;
  const id = props.getProperty('SPREADSHEET_ID');
  if (id) {
    try { ss = SpreadsheetApp.openById(id); } catch (e) { ss = null; }
  }
  if (!ss) {
    // Bound script (dibuka dari spreadsheet) → pakai spreadsheet itu.
    try { ss = SpreadsheetApp.getActiveSpreadsheet(); } catch (e) { ss = null; }
  }
  if (!ss) {
    ss = SpreadsheetApp.create('LMS Matematika X — Rekap Nilai & Progres');
  }
  props.setProperty('SPREADSHEET_ID', ss.getId());

  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(header);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, header.length)
      .setFontWeight('bold').setBackground('#0f3d75').setFontColor('#ffffff');
    sh.setColumnWidths(1, header.length, 150);
  }
  return sh;
}
