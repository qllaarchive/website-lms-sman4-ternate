import { randomUUID } from "node:crypto";
import express from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { requireAuth, requireCsrf, requireAdmin } from "../middleware/auth.js";

const prisma = new PrismaClient();
const router = express.Router();

const EntrySchema = z.object({
  id: z.string().min(1).max(80).regex(/^[A-Za-z0-9_-]+$/).optional(),
  klass: z.enum(["X", "XI", "XII"]),
  name: z.string().min(1).max(120),
  short: z.string().max(40).optional(),
  teacher: z.string().max(80).optional(),
  icon: z.string().max(40),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  file: z.string().min(1).max(500),
  pub: z.boolean().optional(),
  scriptId: z.string().max(200).optional(),
});

/* GET /api/lms — publik, siapa saja boleh lihat daftar LMS */
router.get("/", async (req, res) => {
  const klass = req.query.klass;
  const where = klass ? { klass, pub: true } : { pub: true };
  const entries = await prisma.lmsEntry.findMany({ where, orderBy: { createdAt: "asc" } });
  res.json({ entries });
});

/* GET /api/lms/all — admin only, termasuk yang tidak publik */
router.get("/all", requireAuth, async (req, res) => {
  const klass = req.query.klass;
  const where = klass ? { klass } : {};
  const entries = await prisma.lmsEntry.findMany({ where, orderBy: { createdAt: "asc" } });
  res.json({ entries });
});

/* POST /api/lms — admin only */
router.post("/", requireAuth, requireCsrf, requireAdmin, async (req, res) => {
  const parsed = EntrySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });
  const data = Object.assign({}, parsed.data, {
    id: parsed.data.id || randomUUID(),
    short: parsed.data.short || parsed.data.name.slice(0, 40),
  });
  try {
    const entry = await prisma.lmsEntry.create({ data });
    res.status(201).json({ entry });
  } catch (e) {
    if (e && e.code === "P2002") return res.status(409).json({ error: "duplicate_id" });
    throw e;
  }
});

/* PUT /api/lms/:id — admin only */
router.put("/:id", requireAuth, requireCsrf, requireAdmin, async (req, res) => {
  const parsed = EntrySchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });
  try {
    const entry = await prisma.lmsEntry.update({ where: { id: req.params.id }, data: parsed.data });
    res.json({ entry });
  } catch (e) {
    if (e && e.code === "P2025") return res.status(404).json({ error: "not_found" });
    throw e;
  }
});

/* DELETE /api/lms/:id — admin only */
router.delete("/:id", requireAuth, requireCsrf, requireAdmin, async (req, res) => {
  try {
    await prisma.lmsEntry.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (e) {
    if (e && e.code === "P2025") return res.status(404).json({ error: "not_found" });
    throw e;
  }
});

export default router;
