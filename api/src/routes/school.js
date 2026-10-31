import express from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { requireAuth, requireCsrf, requireAdmin } from "../middleware/auth.js";

const prisma = new PrismaClient();
const router = express.Router();

const ProfileSchema = z.object({
  name: z.string().min(1).max(120),
  npsn: z.string().max(20).optional(),
  addr: z.string().max(400).optional(),
  telp: z.string().max(40).optional(),
  email: z.string().max(120).optional(),
  ppdb: z.string().max(1000).optional(),
});

/* GET /api/school — publik, data profil tampil di footer/modal profil */
router.get("/", async (_req, res) => {
  const profile = await prisma.schoolProfile.findUnique({ where: { id: "default" } });
  res.json({ profile });
});

/* PUT /api/school — admin only, satu baris profil (upsert) */
router.put("/", requireAuth, requireCsrf, requireAdmin, async (req, res) => {
  const parsed = ProfileSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });
  const profile = await prisma.schoolProfile.upsert({
    where: { id: "default" },
    update: parsed.data,
    create: { id: "default", ...parsed.data },
  });
  res.json({ profile });
});

export default router;
