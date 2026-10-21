import express from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";

const prisma = new PrismaClient();
const router = express.Router();

const EntrySchema = z.object({
  klass: z.enum(["X", "XI", "XII"]),
  name: z.string().min(1).max(120),
  short: z.string().max(40).optional(),
  teacher: z.string().max(80).optional(),
  icon: z.string().max(40),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  file: z.string().url().refine(u => /^https:\/\//.test(u), "harus https"),
  pub: z.boolean().optional(),
});

function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") return res.status(403).json({ error: "forbidden" });
  next();
}

router.get("/", async (req, res) => {
  const klass = req.query.klass;
  const where = klass ? { klass } : {};
  const entries = await prisma.lmsEntry.findMany({ where, orderBy: { createdAt: "asc" } });
  res.json({ entries });
});

router.post("/", requireAuth, requireAdmin, async (req, res) => {
  const parsed = EntrySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input", details: parsed.error.flatten() });
  const e = await prisma.lmsEntry.create({ data: parsed.data });
  res.status(201).json({ entry: e });
});

router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  const parsed = EntrySchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input", details: parsed.error.flatten() });
  const e = await prisma.lmsEntry.update({ where: { id: req.params.id }, data: parsed.data });
  res.json({ entry: e });
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  await prisma.lmsEntry.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;