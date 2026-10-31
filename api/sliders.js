import { PrismaClient } from "@prisma/client";

export default async function handler(req, res) {
  const url = (process.env.DATABASE_URL || "") + (process.env.DATABASE_URL?.includes("?") ? "&" : "?") + "connect_timeout=10&pool_timeout=10";
  const prisma = new PrismaClient({ datasourceUrl: url });
  try {
    const sliders = await prisma.slider.findMany({ where: { pub: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
    res.status(200).json({ sliders });
  } catch (e) {
    res.status(500).json({ error: String(e && e.message) });
  } finally {
    await prisma.$disconnect();
  }
}
