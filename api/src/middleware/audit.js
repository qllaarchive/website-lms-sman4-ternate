import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function audit(req, _res, next) {
  const start = Date.now();
  _res.on("finish", async () => {
    try {
      if (req.path.startsWith("/api/auth/login") || req.path.startsWith("/api/auth/register")) return;
      if (req.method === "GET") return;
      await prisma.auditLog.create({
        data: {
          userId: req.user?.id || null,
          action: `${req.method} ${req.path}`,
          ip: req.ip,
          userAgent: req.get("user-agent")?.slice(0, 200),
          detail: { status: _res.statusCode, ms: Date.now() - start },
        },
      });
    } catch (e) {
      // never break request on audit failure
    }
  });
  next();
}