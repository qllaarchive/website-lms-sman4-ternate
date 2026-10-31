/* Slider foto beranda — CRUD khusus admin. Foto diunggah ke folder uploads
   dan diberi nama acak agar aman dari path injection & istirahat cache. */
import { randomUUID } from "node:crypto";
import path from "node:path";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import express from "express";
import multer from "multer";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { requireAuth, requireCsrf, requireAdmin } from "../middleware/auth.js";
import { UPLOAD_DIR } from "../uploads.js";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const prisma = new PrismaClient({ datasourceUrl: (process.env.DATABASE_URL||"") + (process.env.DATABASE_URL?.includes("?") ? "&" : "?") + "connect_timeout=10&pool_timeout=10" });
const router = express.Router();

const IMG_EXT = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };

const R2_ENDPOINT = process.env.R2_ENDPOINT;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = (process.env.R2_PUBLIC_URL || "").replace(/\/+$/, "");
const R2_ENABLED = !!(R2_ENDPOINT && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET_NAME && R2_PUBLIC_URL);

const s3 = R2_ENABLED ? new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
}) : null;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 1, fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, !!IMG_EXT[file.mimetype]),
});

async function storeFile(file) {
  const ext = IMG_EXT[file.mimetype] || ".jpg";
  const name = "sl-" + Date.now().toString(36) + "-" + randomUUID().slice(0, 8) + ext;
  if (R2_ENABLED) {
    const key = name;
    await s3.send(new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }));
    return R2_PUBLIC_URL + "/" + key;
  }
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  fs.writeFileSync(path.join(UPLOAD_DIR, name), file.buffer);
  return "/api/uploads/" + name;
}

async function removeFile(url) {
  if (!url) return;
  if (R2_ENABLED && url.startsWith(R2_PUBLIC_URL + "/")) {
    const key = url.slice(R2_PUBLIC_URL.length + 1);
    try { await s3.send(new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key })); } catch {}
    return;
  }
  const m = /^\/api\/uploads\/[A-Za-z0-9._-]+$/.exec(String(url));
  if (m) {
    fsPromises.unlink(path.join(UPLOAD_DIR, path.basename(m[0]))).catch(() => {});
  }
}

/* Kode multer (ukuran terlalu besar, field salah) jadi 400 yang rapi. */
router.use((e, _req, res, _next) => {
  if (e instanceof multer.MulterError) return res.status(400).json({ error: "invalid_file" });
  console.error(e);
  res.status(500).json({ error: "internal_error" });
});

/* ——— validasi input ———
   imageUrl boleh lokal (/api/uploads/…), R2 public URL, maupun tautan eksternal http(s). */
const LOCAL_URL = /^\/api\/uploads\/[A-Za-z0-9._-]+$/;
const R2_URL = R2_ENABLED ? new RegExp("^" + R2_PUBLIC_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "/[A-Za-z0-9._-]+$") : null;
const Schema = z.object({
  imageUrl: z.string().min(1).max(500).refine(
    (u) => LOCAL_URL.test(u) || (R2_URL && R2_URL.test(u)) || /^https?:\/\/\S+$/i.test(u),
    "bad_image_url"
  ),
  title: z.string().max(80).nullish(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
  pub: z.boolean().optional(),
}).partial();

/* Nilai multipart tiba sebagai string — dibenahkan sebelum zod */
function coerce(body, uploadedUrl) {
  const out = {};
  if (uploadedUrl) out.imageUrl = uploadedUrl;
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
router.post("/", requireAuth, requireCsrf, requireAdmin, upload.single("image"), async (req, res) => {
  if (!req.file && !req.body.imageUrl) return res.status(400).json({ error: "invalid_input" });
  let uploadedUrl = null;
  if (req.file) {
    try { uploadedUrl = await storeFile(req.file); }
    catch (e) { console.error(e); return res.status(500).json({ error: "upload_failed" }); }
  }
  const parsed = Schema.safeParse(coerce(req.body, uploadedUrl));
  if (!parsed.success) {
    if (uploadedUrl) await removeFile(uploadedUrl);
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
router.put("/:id", requireAuth, requireCsrf, requireAdmin, upload.single("image"), async (req, res) => {
  let uploadedUrl = null;
  if (req.file) {
    try { uploadedUrl = await storeFile(req.file); }
    catch (e) { console.error(e); return res.status(500).json({ error: "upload_failed" }); }
  }
  const parsed = Schema.safeParse(coerce(req.body, uploadedUrl));
  if (!parsed.success) {
    if (uploadedUrl) await removeFile(uploadedUrl);
    return res.status(400).json({ error: "invalid_input" });
  }
  try {
    const old = await prisma.slider.findUnique({ where: { id: req.params.id } });
    if (!old) {
      if (uploadedUrl) await removeFile(uploadedUrl);
      return res.status(404).json({ error: "not_found" });
    }
    const slider = await prisma.slider.update({ where: { id: old.id }, data: parsed.data });
    if (uploadedUrl) await removeFile(old.imageUrl);
    res.json({ slider });
  } catch (e) {
    if (e && e.code === "P2025") return res.status(404).json({ error: "not_found" });
    throw e;
  }
});

/* DELETE /api/sliders/:id — admin only */
router.delete("/:id", requireAuth, requireCsrf, requireAdmin, async (req, res) => {
  try {
    const old = await prisma.slider.delete({ where: { id: req.params.id } });
    await removeFile(old.imageUrl);
    res.json({ ok: true });
  } catch (e) {
    if (e && e.code === "P2025") return res.status(404).json({ error: "not_found" });
    throw e;
  }
});

export default router;
