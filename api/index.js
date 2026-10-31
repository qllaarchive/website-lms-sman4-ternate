import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { z } from "zod";

const prisma = new PrismaClient({
  datasourceUrl: (process.env.DATABASE_URL || "") + (process.env.DATABASE_URL?.includes("?") ? "&" : "?") + "connect_timeout=10&pool_timeout=10",
});

function getCookie(req, name) {
  const cookie = req.headers?.cookie || "";
  const match = cookie.match(new RegExp("(^|;\\s*)" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function pathOf(req) {
  // req.url like /api/lms?klass=X
  return (req.url || "").split("?")[0];
}

export default async function handler(req, res) {
  try {
    const p = pathOf(req);

  // /api/lms
  if (p === "/api/lms" || p === "/api/lms/") {
    try {
      const klass = req.query?.klass;
      const where = klass ? { klass, pub: true } : { pub: true };
      const entries = await prisma.lmsEntry.findMany({ where, orderBy: { createdAt: "asc" } });
      return res.status(200).json({ entries });
    } catch (e) {
      return res.status(500).json({ error: String(e && e.message) });
    }
  }

  // /api/sliders
  if (p === "/api/sliders" || p === "/api/sliders/") {
    try {
      const sliders = await prisma.slider.findMany({ where: { pub: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
      return res.status(200).json({ sliders });
    } catch (e) {
      return res.status(500).json({ error: String(e && e.message) });
    }
  }

  // /api/auth/login
  if (p === "/api/auth/login" || p === "/api/auth/login/") {
    if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
    const Schema = z.object({ username: z.string().min(1).max(64), password: z.string().min(1).max(128) });
    const parsed = Schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "invalid_input" });
    const { username, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(401).json({ error: "invalid_credentials" });
    const ok = await argon2.verify(user.passwordHash, password);
    if (!ok) return res.status(401).json({ error: "invalid_credentials" });
    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    const csrf = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    res.setHeader("Set-Cookie", `lms_session=${token}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=604800`);
    return res.status(200).json({ user: { id: user.id, username: user.username }, csrf });
  }

  // /api/auth/logout
  if (p === "/api/auth/logout" || p === "/api/auth/logout/") {
    if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
    res.setHeader("Set-Cookie", "lms_session=; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=0");
    return res.status(200).json({ ok: true });
  }

  // /api/auth/me
  if (p === "/api/auth/me" || p === "/api/auth/me/") {
    if (req.method !== "GET") return res.status(405).json({ error: "method_not_allowed" });
    const token = getCookie(req, "lms_session");
    if (!token) return res.status(200).json({ user: null });
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) return res.status(200).json({ user: null });
      return res.status(200).json({ user: { id: user.id, username: user.username } });
    } catch {
      return res.status(200).json({ user: null });
    }
  }

  // /api/seed (one-time admin creation)
  if (p === "/api/seed" || p === "/api/seed/") {
    const username = process.env.ADMIN_USER;
    const password = process.env.ADMIN_PASS;
    if (!username || !password) return res.status(400).json({ error: "ADMIN_USER/ADMIN_PASS not set" });
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
      await prisma.user.update({ where: { username }, data: { passwordHash } });
      return res.status(200).json({ ok: true, message: "password updated" });
    }
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    await prisma.user.create({ data: { username, passwordHash } });
    return res.status(200).json({ ok: true, message: "created" });
  }

  return res.status(404).json({ error: "not_found" });
  } catch (e) {
    return res.status(500).json({ error: String(e && e.message), stack: e?.stack });
  }
}
