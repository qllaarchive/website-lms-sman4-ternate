/* API serverless untuk Vercel (satu fungsi, semua /api/* diarahkan ke sini
   lewat vercel.json). Untuk Docker/VPS/Render dipakai api/src/index.js.

   Aturan akses:
   - Publik  : GET /api/lms, GET /api/sliders, POST /api/auth/login, GET /api/auth/me
   - Admin   : semua perubahan data (LMS & slider) + daftar lengkap (/all).
               Wajib cookie sesi lms_session + header X-CSRF-Token. */
import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { z } from "zod";
import busboy from "busboy";
import { csrfFor, csrfValid } from "./src/csrf.js";

const prisma = globalThis.__lmsPrisma || new PrismaClient({
  datasourceUrl: (process.env.DATABASE_URL || "") + (process.env.DATABASE_URL?.includes("?") ? "&" : "?") + "connect_timeout=10&pool_timeout=10",
});
globalThis.__lmsPrisma = prisma;

const COOKIE = "lms_session";
const MAX_IMAGE = 3 * 1024 * 1024; /* batas Vercel 4,5 MB per permintaan */
const IMG_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

/* ---------------- utilitas ---------------- */
function send(res, status, body) { return res.status(status).json(body); }

function fail(res, e) {
  console.error("[api]", e);
  return send(res, 500, { error: "server_error" }); /* detail error hanya di log */
}

function getCookie(req, name) {
  const cookie = req.headers?.cookie || "";
  const match = cookie.match(new RegExp("(^|;\\s*)" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function pathOf(req) { return (req.url || "").split("?")[0].replace(/\/+$/, ""); }

function jsonBody(req) {
  const b = req.body;
  if (b && typeof b === "object" && !Buffer.isBuffer(b)) return b;
  if (typeof b === "string") { try { return JSON.parse(b); } catch { return {}; } }
  return {};
}

async function sessionUser(req) {
  const token = getCookie(req, COOKIE);
  if (!token || !process.env.JWT_SECRET) return null;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    return user ? { user, token } : null;
  } catch { return null; }
}

/* Cek login admin; untuk metode yang mengubah data juga cek CSRF. */
async function requireAdmin(req, res) {
  const s = await sessionUser(req);
  if (!s) { send(res, 401, { error: "unauthorized" }); return null; }
  if ((s.user.role || "ADMIN") !== "ADMIN") { send(res, 403, { error: "admin_required" }); return null; }
  if (req.method !== "GET" && !csrfValid(s.token, req.headers["x-csrf-token"])) {
    send(res, 403, { error: "csrf_required" }); return null;
  }
  return s.user;
}

function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    let bb;
    try { bb = busboy({ headers: req.headers, limits: { files: 1, fileSize: MAX_IMAGE, fields: 10 } }); }
    catch (e) { return reject(e); }
    const fields = {};
    let file = null;
    bb.on("field", (name, val) => { fields[name] = val; });
    bb.on("file", (_name, stream, info) => {
      const chunks = [];
      let tooBig = false;
      stream.on("limit", () => { tooBig = true; });
      stream.on("data", (d) => chunks.push(d));
      stream.on("end", () => { file = { buffer: Buffer.concat(chunks), mime: info.mimeType, tooBig }; });
    });
    bb.on("finish", () => resolve({ fields, file }));
    bb.on("error", reject);
    req.pipe(bb);
  });
}

/* ---------------- LMS ---------------- */
const EntrySchema = z.object({
  id: z.string().min(1).max(80).regex(/^[A-Za-z0-9_-]+$/).optional(),
  klass: z.enum(["X", "XI", "XII"]),
  name: z.string().min(1).max(120),
  short: z.string().max(120).transform((v) => v.slice(0, 40)).optional(),
  teacher: z.string().max(80).optional().nullable(),
  icon: z.string().max(40),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  /* tautan http(s) atau path relatif di situs ini (mis. mapel/matematika.html) */
  file: z.string().trim().min(1).max(500).refine((v) => /^https?:\/\//i.test(v) || !/^[a-z][a-z0-9+.-]*:/i.test(v), "invalid_link"),
  pub: z.boolean().optional(),
  scriptId: z.string().max(200).optional().nullable(),
});

async function lmsRoutes(req, res, p) {
  const klass = typeof req.query?.klass === "string" ? req.query.klass : undefined;

  if (p === "/api/lms" && req.method === "GET") {
    const where = klass ? { klass, pub: true } : { pub: true };
    return send(res, 200, { entries: await prisma.lmsEntry.findMany({ where, orderBy: { createdAt: "asc" } }) });
  }
  if (p === "/api/lms/all" && req.method === "GET") {
    if (!(await requireAdmin(req, res))) return;
    const where = klass ? { klass } : {};
    return send(res, 200, { entries: await prisma.lmsEntry.findMany({ where, orderBy: { createdAt: "asc" } }) });
  }
  if (p === "/api/lms" && req.method === "POST") {
    if (!(await requireAdmin(req, res))) return;
    const parsed = EntrySchema.safeParse(jsonBody(req));
    if (!parsed.success) return send(res, 400, { error: "invalid_input" });
    const data = { ...parsed.data, id: parsed.data.id || crypto.randomUUID(), short: parsed.data.short || parsed.data.name.slice(0, 40) };
    try { return send(res, 201, { entry: await prisma.lmsEntry.create({ data }) }); }
    catch (e) { if (e?.code === "P2002") return send(res, 409, { error: "duplicate_id" }); throw e; }
  }
  const m = p.match(/^\/api\/lms\/([^/]+)$/);
  if (m && m[1] !== "all") {
    const id = decodeURIComponent(m[1]);
    if (req.method === "PUT") {
      if (!(await requireAdmin(req, res))) return;
      const parsed = EntrySchema.partial().omit({ id: true }).safeParse(jsonBody(req));
      if (!parsed.success) return send(res, 400, { error: "invalid_input" });
      try { return send(res, 200, { entry: await prisma.lmsEntry.update({ where: { id }, data: parsed.data }) }); }
      catch (e) { if (e?.code === "P2025") return send(res, 404, { error: "not_found" }); throw e; }
    }
    if (req.method === "DELETE") {
      if (!(await requireAdmin(req, res))) return;
      try { await prisma.lmsEntry.delete({ where: { id } }); return send(res, 200, { ok: true }); }
      catch (e) { if (e?.code === "P2025") return send(res, 404, { error: "not_found" }); throw e; }
    }
  }
  return false;
}

/* ---------------- Slider foto ----------------
   Foto unggahan disimpan sebagai data base64 di database. Supaya respons
   daftar slider tetap kecil (batas Vercel 4,5 MB) dan lolos CSP img-src
   'self', daftar hanya memuat alamat /api/sliders/:id/image. */
function publicSlider(s) {
  if (s && typeof s.imageUrl === "string" && s.imageUrl.startsWith("data:")) {
    const v = new Date(s.updatedAt || 0).getTime() || 0;
    return { ...s, imageUrl: `/api/sliders/${encodeURIComponent(s.id)}/image?v=${v}` };
  }
  return s;
}

async function sliderImage(req, res, id) {
  const s = await prisma.slider.findUnique({ where: { id } });
  if (!s || (!s.pub && !(await sessionUser(req)))) return send(res, 404, { error: "not_found" });
  const m = /^data:([^;,]+);base64,(.*)$/s.exec(s.imageUrl || "");
  if (!m) {
    if (/^(https:\/\/|\/)/.test(s.imageUrl || "")) { res.statusCode = 302; res.setHeader("Location", s.imageUrl); return res.end(); }
    return send(res, 404, { error: "not_found" });
  }
  const buf = Buffer.from(m[2], "base64");
  res.statusCode = 200;
  res.setHeader("Content-Type", IMG_TYPES.has(m[1]) ? m[1] : "application/octet-stream");
  res.setHeader("Content-Length", String(buf.length));
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Cache-Control", s.pub ? "public, max-age=604800, immutable" : "private, no-store");
  return res.end(buf);
}

async function sliderWrite(req, res, id) {
  if (!(await requireAdmin(req, res))) return;
  const ct = req.headers["content-type"] || "";
  let fields = {}, file = null;
  if (ct.includes("multipart/form-data")) ({ fields, file } = await parseMultipart(req));
  else fields = jsonBody(req);

  let imageUrl = null;
  if (file && file.buffer.length) {
    if (file.tooBig) return send(res, 413, { error: "file_too_large", maxBytes: MAX_IMAGE });
    if (!IMG_TYPES.has(file.mime)) return send(res, 415, { error: "unsupported_image_type" });
    imageUrl = `data:${file.mime};base64,${file.buffer.toString("base64")}`;
  } else if (typeof fields.imageUrl === "string" && /^(https:\/\/|\/)/.test(fields.imageUrl)) {
    imageUrl = fields.imageUrl.slice(0, 1000);
  }

  const data = {};
  if (typeof fields.title === "string") data.title = fields.title.slice(0, 120);
  if (fields.pub !== undefined) data.pub = fields.pub === true || fields.pub === "true";
  const order = Number(fields.sortOrder);
  if (fields.sortOrder !== undefined && Number.isFinite(order)) data.sortOrder = Math.trunc(order);
  if (imageUrl) data.imageUrl = imageUrl;

  if (id) {
    try { return send(res, 200, { slider: publicSlider(await prisma.slider.update({ where: { id }, data })) }); }
    catch (e) { if (e?.code === "P2025") return send(res, 404, { error: "not_found" }); throw e; }
  }
  if (!imageUrl) return send(res, 400, { error: "image_required" });
  const created = await prisma.slider.create({
    data: { title: data.title ?? null, pub: data.pub ?? true, imageUrl, sortOrder: data.sortOrder ?? 0 },
  });
  return send(res, 201, { slider: publicSlider(created) });
}

async function sliderRoutes(req, res, p) {
  const order = [{ sortOrder: "asc" }, { createdAt: "asc" }];
  if (p === "/api/sliders") {
    if (req.method === "GET") return send(res, 200, { sliders: (await prisma.slider.findMany({ where: { pub: true }, orderBy: order })).map(publicSlider) });
    if (req.method === "POST") return sliderWrite(req, res, null);
  }
  if (p === "/api/sliders/all" && req.method === "GET") {
    if (!(await requireAdmin(req, res))) return;
    return send(res, 200, { sliders: (await prisma.slider.findMany({ orderBy: order })).map(publicSlider) });
  }
  const img = p.match(/^\/api\/sliders\/([^/]+)\/image$/);
  if (img && req.method === "GET") return sliderImage(req, res, decodeURIComponent(img[1]));
  const m = p.match(/^\/api\/sliders\/([^/]+)$/);
  if (m && m[1] !== "all") {
    const id = decodeURIComponent(m[1]);
    if (req.method === "PUT") return sliderWrite(req, res, id);
    if (req.method === "DELETE") {
      if (!(await requireAdmin(req, res))) return;
      try { await prisma.slider.delete({ where: { id } }); return send(res, 200, { ok: true }); }
      catch (e) { if (e?.code === "P2025") return send(res, 404, { error: "not_found" }); throw e; }
    }
  }
  return false;
}

/* ---------------- Auth ---------------- */
const LoginSchema = z.object({ username: z.string().min(1).max(64), password: z.string().min(1).max(128) });
const COOKIE_OPTS = "HttpOnly; Secure; SameSite=None; Path=/";

async function authRoutes(req, res, p) {
  if (p === "/api/auth/login") {
    if (req.method !== "POST") return send(res, 405, { error: "method_not_allowed" });
    if (!process.env.JWT_SECRET) return send(res, 500, { error: "server_not_configured" });
    const parsed = LoginSchema.safeParse(jsonBody(req));
    if (!parsed.success) return send(res, 400, { error: "invalid_input" });
    const user = await prisma.user.findUnique({ where: { username: parsed.data.username } });
    const ok = user ? await argon2.verify(user.passwordHash, parsed.data.password).catch(() => false) : false;
    if (!ok) return send(res, 401, { error: "invalid_credentials" });
    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.setHeader("Set-Cookie", `${COOKIE}=${token}; ${COOKIE_OPTS}; Max-Age=604800`);
    return send(res, 200, { user: { id: user.id, username: user.username }, csrf: csrfFor(token) });
  }
  if (p === "/api/auth/logout") {
    if (req.method !== "POST") return send(res, 405, { error: "method_not_allowed" });
    res.setHeader("Set-Cookie", `${COOKIE}=; ${COOKIE_OPTS}; Max-Age=0`);
    return send(res, 200, { ok: true });
  }
  if (p === "/api/auth/me") {
    if (req.method !== "GET") return send(res, 405, { error: "method_not_allowed" });
    const s = await sessionUser(req);
    if (!s) return send(res, 200, { user: null });
    /* csrf ikut dikirim agar admin tetap bisa mengelola setelah halaman dimuat ulang */
    return send(res, 200, { user: { id: s.user.id, username: s.user.username }, csrf: csrfFor(s.token) });
  }
  return false;
}

/* /api/seed — membuat akun admin dari ADMIN_USER/ADMIN_PASS.
   Hanya boleh tanpa token saat BELUM ada akun sama sekali (pemasangan awal).
   Reset kata sandi setelahnya wajib header X-Seed-Token = env SEED_TOKEN. */
async function seedRoute(req, res) {
  if (req.method !== "POST") return send(res, 405, { error: "method_not_allowed" });
  const username = process.env.ADMIN_USER, password = process.env.ADMIN_PASS;
  if (!username || !password) return send(res, 400, { error: "admin_env_not_set" });
  const count = await prisma.user.count();
  const token = process.env.SEED_TOKEN;
  const given = req.headers["x-seed-token"];
  const authorized = count === 0 || (token && typeof given === "string" && given.length === token.length &&
    crypto.timingSafeEqual(Buffer.from(given), Buffer.from(token)));
  if (!authorized) return send(res, 403, { error: "forbidden" });
  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
  await prisma.user.upsert({ where: { username }, update: { passwordHash }, create: { username, passwordHash, role: "ADMIN" } });
  return send(res, 200, { ok: true });
}

export default async function handler(req, res) {
  try {
    const p = pathOf(req);
    if (p === "/api/health") return send(res, 200, { ok: true });
    if (p === "/api/seed") return await seedRoute(req, res);
    if (p.startsWith("/api/auth/")) { if ((await authRoutes(req, res, p)) !== false) return; }
    else if (p === "/api/lms" || p.startsWith("/api/lms/")) { if ((await lmsRoutes(req, res, p)) !== false) return; }
    else if (p === "/api/sliders" || p.startsWith("/api/sliders/")) { if ((await sliderRoutes(req, res, p)) !== false) return; }
    return send(res, 404, { error: "not_found" });
  } catch (e) {
    return fail(res, e);
  }
}
