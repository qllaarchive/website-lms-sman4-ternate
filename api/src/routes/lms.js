import { randomUUID } from "node:crypto";
import express from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth, requireCsrf, requireAdmin } from "../middleware/auth.js";
import { EntrySchema, parseKlass } from "../validation.js";

const prisma = new PrismaClient({ datasourceUrl: (process.env.DATABASE_URL||"") + (process.env.DATABASE_URL?.includes("?") ? "&" : "?") + "connect_timeout=10&pool_timeout=10" });
const router = express.Router();



/* GET /api/lms — publik, siapa saja boleh lihat daftar LMS */
router.get("/", async (req, res) => {
  const parsed = parseKlass(req.query.klass);
  if (!parsed.ok) return res.status(400).json({ error: "invalid_input" });
  const where = parsed.value ? { klass: parsed.value, pub: true } : { pub: true };
  const entries = await prisma.lmsEntry.findMany({ where, orderBy: { createdAt: "asc" } });
  res.json({ entries });
});

/* GET /api/lms/all — admin only, termasuk yang tidak publik */
router.get("/all", requireAuth, async (req, res) => {
  const parsed = parseKlass(req.query.klass);
  if (!parsed.ok) return res.status(400).json({ error: "invalid_input" });
  const where = parsed.value ? { klass: parsed.value } : {};
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
  const parsed = EntrySchema.partial().omit({ id: true }).safeParse(req.body);
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
