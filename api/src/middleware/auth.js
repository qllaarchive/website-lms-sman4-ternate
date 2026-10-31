import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { csrfFor, csrfValid } from "../csrf.js";

const prisma = new PrismaClient({ datasourceUrl: (process.env.DATABASE_URL||"") + (process.env.DATABASE_URL?.includes("?") ? "&" : "?") + "connect_timeout=10&pool_timeout=10" });

/* Token CSRF diturunkan dari token sesi (lihat ../csrf.js) sehingga tetap
   berlaku setelah server restart. Fungsi lama dipertahankan agar import
   yang ada tidak rusak. */
function issueCsrfToken(_userId, sessionToken) {
  return csrfFor(sessionToken);
}

function validateCsrfToken(sessionToken, clientToken) {
  return csrfValid(sessionToken, clientToken);
}

function sessionToken(req) {
  const bearer = req.headers?.authorization;
  if (bearer && bearer.startsWith("Bearer ")) return bearer.slice(7) || null;
  return req.cookies?.lms_session || null;
}

export async function requireAuth(req, res, next) {
  const token = sessionToken(req);
  if (!token) return res.status(401).json({ error: "unauthorized" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return res.status(401).json({ error: "unauthorized" });
    req.user = { id: user.id, username: user.username, role: user.role || "ADMIN" };
    req.sessionToken = token;
    next();
  } catch {
    res.status(401).json({ error: "unauthorized" });
  }
}

export function requireCsrf(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "unauthorized" });
  if (!validateCsrfToken(req.sessionToken, req.headers["x-csrf-token"])) {
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
