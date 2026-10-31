/* Slider foto beranda — CRUD khusus admin. Foto diunggah ke folder uploads
   dan diberi nama acak agar aman dari path injection & istirahat cache. */
import { randomUUID } from "node:crypto";
import path from "node:path";
import fs from "node:fs/promises";
import express from "express";
import multer from "multer";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { UPLOAD_DIR } from "../uploads.js";

const prisma = new PrismaClient();
const router = express.Router();

/* ——— unggahan (multipart/form-data, field "image") ——— */
const IMG_EXT = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const stamp = Date.now().toString(36);
    cb(null, "sl-" + stamp + "-" + randomUUID().slice(0, 8) + (IMG_EXT[file.mimetype] || ".jpg"));
  },
});
const upload = multer({
  storage,
  limits: { files: 1, fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, !!IMG_EXT[file.mimetype]),
});

/* Kode multer (ukuran terlalu besar, field salah) jadi 400 yang rapi. */
router.use((e, _req, res, _next) => {
  if (e instanceof multer.MulterError) return res.status(400).json({ error: "invalid_file" });
  console.error(e);
  res.status(500).json({ error: "internal_error" });
});

/* ——— validasi input ———
   imageUrl boleh lokal (/api/uploads/…) maupun tautan eksternal http(s). */
const LOCAL_URL = /^\/api\/uploads\/[A-Za-z0-9._-]+$/;
const Schema = z.object({
  imageUrl: z.string().min(1).max(500).refine(
    (u) => LOCAL_URL.test(u) || /^https?:\/\/\S+$/i.test(u),
    "bad_image_url"
  ),
  title: z.string().max(80).nullish(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
  pub: z.boolean().optional(),
}).partial();

/* Nilai multipart tiba sebagai string — dibenahkan sebelum zod */
function coerce(body, hasFile) {
  const out = {};
  if (hasFile) out.imageUrl = "/api/uploads/" + body._fileName;
  else if (typeof body.imageUrl === "string" && body.imageUrl.trim()) out.imageUrl = body.imageUrl.trim();
  if (typeof body.title === "string") {
    const t = body.title.trim().slice(0, 80);
    out.title = t || null;   /* kosong = bersihkan judul */
  }
  if (body.sortOrder !== undefined && body.sortOrder !== "") {
    const n = Number(body.sortOrder);
    if (Number.isInteger(n)) out.sortOrder = n;
  }
  if (body.pub !== undefined) out.pub = body.pub === true || body.pub === "true";
  return out;
}

/* Hapus berkas lokal yang menempel pada foto lama (aman diabaikan bila gagal) */
function removeLocal(url) {
  const m = LOCAL_URL.exec(String(url || ""));
  if (!m) return; // tautan eksternal — bukan berkas kita
  fs.unlink(path.join(UPLOAD_DIR, path.basename(m[0]))).catch(() => {});
}

function orderArgs() {
  return [{ sortOrder: "asc" }, { createdAt: "asc" }];
}

/* GET /api/sliders — publik */
router.get("/", async (_req, res) => {
  const sliders = await prisma.slider.findMany({ where: { pub: true }, orderBy: orderArgs() });
  res.json({ sliders });
});

/* GET /api/sliders/all — admin only, termasuk yang tidak publik */
router.get("/all", requireAuth, async (_req, res) => {
  const sliders = await prisma.slider.findMany({ orderBy: orderArgs() });
  res.json({ sliders });
});

/* POST /api/sliders — admin only; unggah "image" atau kirim imageUrl tautan */
router.post("/", requireAuth, upload.single("image"), async (req, res) => {
  if (!req.file && !req.body.imageUrl) return res.status(400).json({ error: "invalid_input" });
  if (req.file) req.body._fileName = req.file.filename;
  const parsed = Schema.safeParse(coerce(req.body, !!req.file));
  if (!parsed.success) {
    if (req.file) fs.unlink(req.file.path).catch(() => {});
    return res.status(400).json({ error: "invalid_input" });
  }
  const agg = await prisma.slider.aggregate({ _max: { sortOrder: true } });
  const data = Object.assign(
    { title: null, sortOrder: (agg._max.sortOrder ?? -1) + 1 },
    parsed.data
  );
  const slider = await prisma.slider.create({ data });
  res.status(201).json({ slider });
});

/* PUT /api/sliders/:id — admin only; unggah baru opsional untuk ganti foto */
router.put("/:id", requireAuth, upload.single("image"), async (req, res) => {
  if (req.file) req.body._fileName = req.file.filename;
  const parsed = Schema.safeParse(coerce(req.body, !!req.file));
  if (!parsed.success) {
    if (req.file) fs.unlink(req.file.path).catch(() => {});
    return res.status(400).json({ error: "invalid_input" });
  }
  try {
    const old = await prisma.slider.findUnique({ where: { id: req.params.id } });
    if (!old) {
      if (req.file) fs.unlink(req.file.path).catch(() => {});
      return res.status(404).json({ error: "not_found" });
    }
    const slider = await prisma.slider.update({ where: { id: old.id }, data: parsed.data });
    if (req.file) removeLocal(old.imageUrl);
    res.json({ slider });
  } catch (e) {
    if (e && e.code === "P2025") return res.status(404).json({ error: "not_found" });
    throw e;
  }
});

/* DELETE /api/sliders/:id — admin only */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const old = await prisma.slider.delete({ where: { id: req.params.id } });
    removeLocal(old.imageUrl);
    res.json({ ok: true });
  } catch (e) {
    if (e && e.code === "P2025") return res.status(404).json({ error: "not_found" });
    throw e;
  }
});

export default router;
