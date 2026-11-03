#!/usr/bin/env node
/* Pemeliharaan halaman mapel matematika pada arsitektur shell terbaru:
   - Halaman mapel berupa shell (tema matematika) yang memuat ../data/<slug>.js dan ../assets/lms.js
     lewat lms-boot.js — tidak lagi satu file mandiri.
   - Integrasi Google Apps Script diatur lewat META.sheetId di data mapel
     (lms.js memakainya sebagai SHEET_URL_DEFAULT), dan masih bisa ditimpa ?gs=.
   Script ini:
   1) memaksa sheetId matematika pada public/data/matematika.js ke ID Web App yang benar;
   2) memeriksa shell public/mapel/matematika.html (lms-boot.js + data + tema matematika tetap ada). */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "public");
const DATA = path.join(ROOT, "data/matematika.js");
const SHELL = path.join(ROOT, "mapel/matematika.html");
const GS_ID = "AKfycbwyb4YHCCYQ2OY-uj_fO5TOsE9OoFU5JTKoq5PG7Rd40bz8-jzMXy5iGvgRMc8ImjRMVw";

let data = fs.readFileSync(DATA, "utf8");
const sheetIdRe = /sheetId:"(AKfycb[^\"]*)"/;
if (!sheetIdRe.test(data)) throw new Error("field sheetId tidak ditemukan di data/matematika.js");
if (data.match(sheetIdRe)[1] !== GS_ID) {
  data = data.replace(sheetIdRe, `sheetId:"${GS_ID}"`);
  fs.writeFileSync(DATA, data);
  console.log("sheetId diperbarui →", GS_ID);
} else {
  console.log("sheetId sudah benar ✓");
}

const html = fs.readFileSync(SHELL, "utf8");
const checks = [
  ["lms-boot.js", /script src="\.\.\/assets\/lms-boot\.js" data-mapel="matematika"/],
  ["lms.css", /<link rel="stylesheet" href="\.\.\/assets\/lms\.css">/],
  ["judul", /<title>Matematika LMS Kelas X[\s\S]*?<\/title>/],
  ["mobile.css", /<link rel="stylesheet" href="\.\.\/assets\/mobile\.css">/]
];
for (const [name, re] of checks) {
  if (!re.test(html)) throw new Error(`shell matematika.html kehilangan: ${name}`);
}
if (/<script>\s*window\.LMS_CONTENT/.test(html)) throw new Error("shell masih membawa data inline lama");
console.log(`OK → mapel/matematika.html (${(html.length / 1024).toFixed(0)} KB, shell + data dengan sheetId valid)`);
