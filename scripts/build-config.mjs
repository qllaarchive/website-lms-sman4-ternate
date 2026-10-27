#!/usr/bin/env node
/* Build script untuk Netlify — generate config.js dari environment variable.
   Jalankan: node scripts/build-config.mjs
   Netlify otomatis menjalankan ini saat deploy. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const apiBase = process.env.LMS_API_BASE || "/api";

const config = `/* Auto-generated oleh scripts/build-config.mjs — JANGAN edit manual */
window.LMS_API_BASE = ${JSON.stringify(apiBase)};
`;

fs.writeFileSync(path.join(ROOT, "config.js"), config);
console.log(`✓ config.js dibuat → LMS_API_BASE = "${apiBase}"`);
