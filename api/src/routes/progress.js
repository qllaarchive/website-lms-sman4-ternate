import express from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";

const prisma = new PrismaClient();
const router = express.Router();

const ProgressSchema = z.object({
  lmsId: z.string(),
  pct: z.number().int().min(0).max(100),
  source: z.string().max(64).optional(),
});

router.post("/", requireAuth, async (req, res) => {
  const parsed = ProgressSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });
  const p = await prisma.progress.create({ data: parsed.data });
  res.status(201).json({ progress: p });
});

router.get("/summary", requireAuth, async (_req, res) => {
  const groups = await prisma.progress.groupBy({
    by: ["lmsId"],
    _max: { pct: true, at: true },
  });
  res.json({ summary: groups });
});

export default router;