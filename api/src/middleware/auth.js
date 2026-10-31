import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const prisma = new PrismaClient();

const csrfTokens = new Map();

function issueCsrfToken(userId) {
  const csrf = crypto.randomBytes(16).toString("hex");
  csrfTokens.set(userId, csrf);
  setTimeout(() => csrfTokens.delete(userId), 7 * 24 * 60 * 60 * 1000);
  return csrf;
}

function validateCsrfToken(userId, token) {
  if (!token || !userId) return false;
  const expected = csrfTokens.get(userId);
  if (!expected) return false;
  return expected === token;
}

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

export function requireCsrf(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "unauthorized" });
  const clientToken = req.headers["x-csrf-token"];
  if (!validateCsrfToken(req.user.id, clientToken)) {
    return res.status(403).json({ error: "csrf_required" });
  }
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "unauthorized" });
  if (req.user.role !== "ADMIN") return res.status(403).json({ error: "admin_required" });
  next();
}

export { issueCsrfToken, validateCsrfToken };

export default requireAuth;
