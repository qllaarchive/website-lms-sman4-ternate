#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TPL = path.join(ROOT, "scripts/pendais.template.html");
const OUT = path.join(ROOT, "mapel/pendais.html");
const GS_ID = "AKfycbwyb4YHCCYQ2OY-uj_fO5TOsE9OoFU5JTKoq5PG7Rd40bz8-jzMXy5iGvgRMc8ImjRMVw";

let html = fs.readFileSync(TPL, "utf8");
const css = fs.readFileSync(path.join(ROOT, "assets/lms.css"), "utf8").trim();
const data = fs.readFileSync(path.join(ROOT, "data/pendais.js"), "utf8").trim();
let eng = fs.readFileSync(path.join(ROOT, "assets/lms.js"), "utf8").trim();

const gsRe = /const SHEET_URL_DEFAULT = "[^"]*";/;
if (!gsRe.test(eng)) throw new Error("konstanta SHEET_URL_DEFAULT tidak ditemukan");
eng = eng.replace(gsRe, `const SHEET_URL_DEFAULT = "${GS_ID}";`);

const styleRe = /<style>[\s\S]*?<\/style>/;
if (!styleRe.test(html)) throw new Error("blok <style> dasar tidak ditemukan");
html = html.replace(styleRe, `<style>\n${css}\n</style>`);

const dataRe = /<script>\s*window\.LMS_CONTENT = \{[\s\S]*?\n\};?\s*<\/script>/;
if (!dataRe.test(html)) throw new Error("blok data LMS_CONTENT tidak ditemukan");
html = html.replace(dataRe, `<script>\n${data}\n</script>`);

const engRe = /<script>\s*"use strict";[\s\S]*?<\/script>\s*<\/body>/;
if (!engRe.test(html)) throw new Error("blok engine tidak ditemukan");
html = html.replace(engRe, `<script>\n${eng}\n</script>\n</body>`);

if (/<link rel="stylesheet" href="assets\/lms\.css">/.test(html)) throw new Error("masih ada tautan CSS eksternal");
if (/<script src="assets\/lms\.js"><\/script>/.test(html)) throw new Error("masih ada tautan engine eksternal");

fs.writeFileSync(OUT, html);
console.log(`OK → mapel/pendais.html (${(html.length / 1024).toFixed(0)} KB)`);
