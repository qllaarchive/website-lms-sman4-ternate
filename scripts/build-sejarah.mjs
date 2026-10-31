#!/usr/bin/env node
/* Build mapel/sejarah.html menjadi file mandiri:
   - blok <style> pertama  ← assets/lms.css
   - blok <script> data    ← data/sejarah.js
   - blok <script> engine  ← assets/lms.js
   Tema krem (blok <style> kedua) dan kerangka HTML tetap dipertahankan. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/* Situs (portal, mapel, data, assets) ada di folder public/ */
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "public");
const ART = path.join(ROOT, "mapel/sejarah.html");
let html = fs.readFileSync(ART, "utf8");

const css = fs.readFileSync(path.join(ROOT, "assets/lms.css"), "utf8").trim();
const data = fs.readFileSync(path.join(ROOT, "data/sejarah.js"), "utf8").trim();
const eng = fs.readFileSync(path.join(ROOT, "assets/lms.js"), "utf8").trim();

const styleRe = /<style>[\s\S]*?<\/style>/;
if (!styleRe.test(html)) throw new Error("blok <style> dasar tidak ditemukan");
html = html.replace(styleRe, `<style>\n${css}\n</style>`);

const dataRe = /<script>\s*window\.LMS_CONTENT = \{[\s\S]*?\n\};?\s*<\/script>/;
if (!dataRe.test(html)) throw new Error("blok data LMS_CONTENT tidak ditemukan");
html = html.replace(dataRe, `<script>\n${data}\n</script>`);

const engRe = /<script>\s*"use strict";[\s\S]*?<\/script>\s*<\/body>/;
if (!engRe.test(html)) throw new Error("blok engine tidak ditemukan");
html = html.replace(engRe, `<script>\n${eng}\n</script>\n</body>`);

fs.writeFileSync(ART, html);
console.log(`OK → mapel/sejarah.html (${(html.length / 1024).toFixed(0)} KB)`);
