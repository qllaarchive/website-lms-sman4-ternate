import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient({
  datasourceUrl: (process.env.DATABASE_URL || "") + (process.env.DATABASE_URL?.includes("?") ? "&" : "?") + "connect_timeout=10&pool_timeout=10",
});

function getCookie(req, name) {
  const cookie = req.headers?.cookie || "";
  const match = cookie.match(new RegExp("(^|;\\s*)" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[2]) : null;
}

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "method_not_allowed" });
  const token = getCookie(req, "lms_session");
  if (!token) return res.status(200).json({ user: null });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return res.status(200).json({ user: null });
    res.status(200).json({ user: { id: user.id, username: user.username } });
  } catch {
    res.status(200).json({ user: null });
  }
}
