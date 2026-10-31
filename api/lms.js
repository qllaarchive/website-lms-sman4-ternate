import { PrismaClient } from "@prisma/client";

export default async function handler(req, res) {
  const url = (process.env.DATABASE_URL || "") + (process.env.DATABASE_URL?.includes("?") ? "&" : "?") + "connect_timeout=10&pool_timeout=10";
  const prisma = new PrismaClient({ datasourceUrl: url });
  try {
    const klass = req.query?.klass;
    const where = klass ? { klass, pub: true } : { pub: true };
    const entries = await prisma.lmsEntry.findMany({ where, orderBy: { createdAt: "asc" } });
    res.status(200).json({ entries });
  } catch (e) {
    res.status(500).json({ error: String(e && e.message) });
  } finally {
    await prisma.$disconnect();
  }
}
