import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

dotenv.config();

/* Secret JWT lemah? berhenti — jangan sampai token bisa dipalsukan di production. */
const SECRET = String(process.env.JWT_SECRET || "");
const WEAK_SECRET = !SECRET || SECRET.length < 24 || /ganti|change-me|placeholder|secret/i.test(SECRET);
if (WEAK_SECRET && process.env.NODE_ENV === "production") {
  console.error("JWT_SECRET harus acak (openssl rand -hex 32) saat NODE_ENV=production. Server berhenti.");
  process.exit(1);
} else if (WEAK_SECRET) {
  console.warn("Peringatan: JWT_SECRET lemah — aman hanya untuk pengembangan lokal.");
}

import authRoutes from "./routes/auth.js";
import lmsRoutes from "./routes/lms.js";
import schoolRoutes from "./routes/school.js";
import sliderRoutes from "./routes/sliders.js";
import { UPLOAD_DIR } from "./uploads.js";

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(helmet({
  contentSecurityPolicy: false,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
}));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowed = (process.env.ALLOWED_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);
    if (allowed.includes(origin)) {
      return callback(null, true);
    }
    callback(null, false);
  },
  credentials: true,
}));

app.use(express.json({ limit: "50kb" }));
app.use(cookieParser());

app.get("/health", (_req, res) => res.json({ ok: true }));

/* Foto slider — dilayani API sendiri dengan header keamanan. */
app.use("/api/uploads", (_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Content-Security-Policy", "default-src 'none'");
  next();
}, express.static(UPLOAD_DIR, { maxAge: "7d", fallthrough: false }));

app.use("/api/auth", rateLimit({ windowMs: 60_000, max: 10, standardHeaders: true, legacyHeaders: false }), authRoutes);
app.use("/api/lms", rateLimit({ windowMs: 60_000, max: 100, standardHeaders: true, legacyHeaders: false }), lmsRoutes);
app.use("/api/school", rateLimit({ windowMs: 60_000, max: 100, standardHeaders: true, legacyHeaders: false }), schoolRoutes);
app.use("/api/sliders", rateLimit({ windowMs: 60_000, max: 100, standardHeaders: true, legacyHeaders: false }), sliderRoutes);

app.use((req, res) => res.status(404).json({ error: "not_found" }));
app.use((err, _req, res, _next) => {
  const code = Number(err && (err.statusCode || err.status)) || 500;
  if (code >= 500) console.error(err);
  res.status(code).json({ error: code === 404 ? "not_found" : "internal_error" });
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => console.log(`LMS API listening on :${PORT}`));
