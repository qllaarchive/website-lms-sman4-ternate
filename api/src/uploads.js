/* Lokasi folder penyimpanan foto slider. File disimpan di api/uploads dan
   dilayani oleh API di jalur /api/uploads/* sehingga URL absorbs aman dipakai
   dev proxy, nginx, maupun deploy serverless. */
import path from "node:path";
import { fileURLToPath } from "node:url";

export const UPLOAD_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../uploads"
);
