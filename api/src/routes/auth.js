import express from "express";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { requireAuth, issueCsrfToken } from "../middleware/auth.js";

const prisma = new PrismaClient({ datasourceUrl: (process.env.DATABASE_URL||"") + (process.env.DATABASE_URL?.includes("?") ? "&" : "?") + "connect_timeout=10&pool_timeout=10" });
const router = express.Router();

const LoginSchema = z.object({
  username: z.string().min(1).max(64),
  password: z.string().min(1).max(128),
});

const COOKIE = "lms_session";
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

function setSessionCookie(req, res, token) {
  res.cookie(COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: SEVEN_DAYS,
    path: "/",
  });
}

router.post("/login", async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });

  const { username, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return res.status(401).json({ error: "invalid_credentials" });

  const ok = await argon2.verify(user.passwordHash, password);
  if (!ok) return res.status(401).json({ error: "invalid_credentials" });

  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  setSessionCookie(req, res, token);
  const csrf = issueCsrfToken(user.id);
  res.json({ user: { id: user.id, username: user.username }, csrf });
});

router.post("/logout", (_req, res) => {
  res.clearCookie(COOKIE, { path: "/" });
  res.json({ ok: true });
});

router.get("/me", async (req, res) => {
  const token = req.cookies?.[COOKIE] || bearerToken(req);
  if (!token) return res.json({ user: null });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return res.json({ user: null });
    res.json({ user: { id: user.id, username: user.username } });
  } catch {
    res.json({ user: null });
  }
});

function bearerToken(req) {
  const h = req.headers?.authorization;
  return h && h.startsWith("Bearer ") ? h.slice(7) : null;
}

export default router;
