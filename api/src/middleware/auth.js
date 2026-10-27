import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function requireAuth(req, res, next) {
  let token = req.cookies?.lms_session || null;
  const bearer = req.headers?.authorization;
  if (bearer && bearer.startsWith("Bearer ")) token = bearer.slice(7) || token;
  if (!token) return res.status(401).json({ error: "unauthorized" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return res.status(401).json({ error: "unauthorized" });
    req.user = { id: user.id, username: user.username };
    next();
  } catch {
    res.status(401).json({ error: "unauthorized" });
  }
}

export default requireAuth;
