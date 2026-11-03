import express from "express";
import rateLimit from "express-rate-limit";
import argon2 from "argon2";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { issueCsrfToken } from "../middleware/auth.js";
import {
  COOKIE,
  signSession,
  verifySession,
  setSessionCookie,
  clearSessionCookie,
} from "../session.js";

const prisma = new PrismaClient({ datasourceUrl: (process.env.DATABASE_URL||"") + (process.env.DATABASE_URL?.includes("?") ? "&" : "?") + "connect_timeout=10&pool_timeout=10" });
const router = express.Router();

const LoginSchema = z.object({
  username: z.string().min(1).max(64),
  password: z.string().min(1).max(128),
});

/* Verifikasi tetap dijalankan untuk username yang tidak ada supaya waktu
   respons tidak membocorkan akun mana yang terdaftar. */
const DUMMY_HASH = "$argon2id$v=19$m=65536,t=3,p=4$torDi32IkVn29EA/mlUxTA$595oL4GQbwVyHaRmGbVBZYecIN1ZkQKKKu8MCPywPuQ";

const loginLimiter = rateLimit({
  windowMs: 15 * 60_000,
  max: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => res.status(429).json({ error: "too_many_requests" }),
});

router.use((_req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

router.post("/login", loginLimiter, async (req, res) => {
  if (!process.env.JWT_SECRET) return res.status(500).json({ error: "server_not_configured" });
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });

  const { username, password } = parsed.data;
  const name = username.trim();
  const user = (await prisma.user.findUnique({ where: { username: name } })) ||
    (await prisma.user.findFirst({ where: { username: { equals: name, mode: "insensitive" } } }));
  const ok = await argon2.verify(user ? user.passwordHash : DUMMY_HASH, password).catch(() => false);
  if (!user || !ok) return res.status(401).json({ error: "invalid_credentials" });

  const token = signSession(user.id);
  setSessionCookie(req, res, token);
  res.json({ user: { id: user.id, username: user.username }, csrf: issueCsrfToken(user.id, token) });
});

router.post("/logout", (req, res) => {
  clearSessionCookie(req, res);
  res.json({ ok: true });
});

router.get("/me", async (req, res) => {
  const token = req.cookies?.[COOKIE] || bearerToken(req);
  if (!token) return res.json({ user: null });
  try {
    const payload = verifySession(token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      clearSessionCookie(req, res);
      return res.json({ user: null });
    }
    /* Rotasi token + perpanjang cookie: sesi aktif tidak habis saat admin
       membuka portal lagi, tetapi sesi yang ditinggalkan tetap kedaluwarsa. */
    const fresh = signSession(user.id);
    setSessionCookie(req, res, fresh);
    res.json({ user: { id: user.id, username: user.username }, csrf: issueCsrfToken(user.id, fresh) });
  } catch {
    clearSessionCookie(req, res);
    res.json({ user: null });
  }
});

function bearerToken(req) {
  const h = req.headers?.authorization;
  return h && h.startsWith("Bearer ") ? h.slice(7) : null;
}

export default router;
