/* Lokasi folder penyimpanan foto slider. File disimpan di api/uploads dan
   dilayani oleh API di jalur /api/uploads/* sehingga URL absorbs aman dipakai
   dev proxy, nginx, maupun deploy serverless. */
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const isVercel = !!process.env.VERCEL;
export const UPLOAD_DIR = isVercel
  ? "/tmp/uploads"
  : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../uploads");

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
