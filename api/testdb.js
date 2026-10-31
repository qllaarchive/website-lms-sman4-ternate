import { PrismaClient } from "@prisma/client";

export default async function handler(req, res) {
  const url = (process.env.DATABASE_URL || "") + "&connect_timeout=10&pool_timeout=10";
  const prisma = new PrismaClient({ datasourceUrl: url });
  try {
    const count = await prisma.lmsEntry.count();
    res.status(200).json({ count });
  } catch (e) {
    res.status(500).json({ error: String(e && e.message) });
  } finally {
    await prisma.$disconnect();
  }
}
