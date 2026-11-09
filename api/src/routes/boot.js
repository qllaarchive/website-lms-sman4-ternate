/* Endpoint gabungan untuk muat awal portal: satu permintaan mengembalikan
   sesi pengguna, daftar LMS, dan daftar slider. Mengurangi jumlah cold start
   serverless dan membuat beranda lebih cepat terbuka. */
import express from "express";
import { PrismaClient } from "@prisma/client";
import { COOKIE, verifySession, signSession, setSessionCookie } from "../session.js";
import { issueCsrfToken } from "../middleware/auth.js";

const prisma = new PrismaClient({ datasourceUrl: (process.env.DATABASE_URL||"") + (process.env.DATABASE_URL?.includes("?") ? "&" : "?") + "connect_timeout=10&pool_timeout=10" });
const router = express.Router();

router.use((_req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

router.get("/", async (req, res) => {
  let user = null;
  let csrf = null;
  let isAdmin = false;

  const token = req.cookies?.[COOKIE];
  if (token) {
    try {
      const payload = verifySession(token);
      const found = await prisma.user.findUnique({ where: { id: payload.sub } });
      if (found) {
        user = { id: found.id, username: found.username };
        isAdmin = (found.role || "ADMIN") === "ADMIN";
        const fresh = signSession(found.id);
        setSessionCookie(req, res, fresh);
        csrf = issueCsrfToken(found.id, fresh);
      }
    } catch {
      /* token kedaluwarsa/rusak — perlakukan sebagai tamu */
    }
  }

  const where = isAdmin ? {} : { pub: true };
  const [entries, sliders] = await Promise.all([
    prisma.lmsEntry.findMany({ where, orderBy: { createdAt: "asc" } }),
    prisma.slider.findMany({ where, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
  ]);

  res.json({ user, csrf, entries, sliders });
});

export default router;
