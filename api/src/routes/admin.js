import express from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "../middleware/auth.js";

const prisma = new PrismaClient();
const router = express.Router();

function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") return res.status(403).json({ error: "forbidden" });
  next();
}

router.get("/announcements", async (_req, res) => {
  const items = await prisma.announcement.findMany({ orderBy: { createdAt: "desc" } });
  res.json({ items });
});

router.post("/announcements", requireAuth, requireAdmin, async (req, res) => {
  const { title, date, body } = req.body || {};
  if (!title || !date || !body) return res.status(400).json({ error: "invalid_input" });
  const a = await prisma.announcement.create({ data: { title: String(title).slice(0, 120), date: String(date), body: String(body).slice(0, 2000) } });
  res.status(201).json({ announcement: a });
});

router.delete("/announcements/:id", requireAuth, requireAdmin, async (req, res) => {
  await prisma.announcement.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

router.get("/profile", async (_req, res) => {
  const p = await prisma.schoolProfile.findFirst();
  res.json({ profile: p });
});

router.put("/profile", requireAuth, requireAdmin, async (req, res) => {
  const data = req.body || {};
  const existing = await prisma.schoolProfile.findFirst();
  const payload = {
    name: String(data.name || "SMA Negeri 4 Ternate").slice(0, 120),
    npsn: data.npsn ? String(data.npsn).slice(0, 20) : null,
    addr: data.addr ? String(data.addr).slice(0, 240) : null,
    telp: data.telp ? String(data.telp).slice(0, 30) : null,
    email: data.email ? String(data.email).slice(0, 120) : null,
    ppdb: data.ppdb ? String(data.ppdb).slice(0, 2000) : null,
  };
  const p = existing
    ? await prisma.schoolProfile.update({ where: { id: existing.id }, data: payload })
    : await prisma.schoolProfile.create({ data: payload });
  res.json({ profile: p });
});

export default router;