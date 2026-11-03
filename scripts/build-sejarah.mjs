#!/usr/bin/env node
/* Integrasi Google Apps Script ke mapel sejarah:
   - Memastikan public/data/sejarah.js memiliki META.sheetId yang benar
   - Memverifikasi public/mapel/sejarah.html (shell + tema tetap utuh)
   Pakai: node scripts/build-sejarah.mjs
*/

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "public");
const DATA = path.join(ROOT, "data/sejarah.js");
const SHELL = path.join(ROOT, "mapel/sejarah.html");
const GS_ID = "AKfycbwyb4YHCCYQ2OY-uj_fO5TOsE9OoFU5JTKoq5PG7Rd40bz8-jzMXy5iGvgRMc8ImjRMVw";

// 1) Perbarui sheetId di data/sejarah.js
let data = fs.readFileSync(DATA, "utf8");
const sheetIdRe = /sheetId:"(AKfycb[^\"]*)"/;
if (!sheetIdRe.test(data)) throw new Error("field sheetId tidak ditemukan di data/sejarah.js");
if (data.match(sheetIdRe)[1] !== GS_ID) {
  data = data.replace(sheetIdRe, `sheetId:"${GS_ID}"`);
  fs.writeFileSync(DATA, data);
  console.log("sheetId diperbarui →", GS_ID);
} else {
  console.log("sheetId sudah benar ✓");
}

// 2) Verifikasi shell sejarah.html
const html = fs.readFileSync(SHELL, "utf8");
const checks = [
  ["lms-boot.js", /script src="\.\.\/assets\/lms-boot\.js" data-mapel="sejarah"/],
  ["lms.css", /<link rel="stylesheet" href="\.\.\/assets\/lms\.css">/],
  ["judul", /<title>Sejarah LMS Kelas X[\s\S]*?<\/title>/],
  ["mobile.css", /<link rel="stylesheet" href="\.\.\/assets\/mobile\.css">/]
];
for (const [name, re] of checks) {
  if (!re.test(html)) throw new Error(`shell sejarah.html kehilangan: ${name}`);
}
if (/<script>\s*window\.LMS_CONTENT/.test(html)) throw new Error("shell masih membawa data inline lama");
console.log(`OK → mapel/sejarah.html (${(html.length / 1024).toFixed(0)} KB, shell + data dengan sheetId valid)`);
