import jwt from "jsonwebtoken";

export const COOKIE = "lms_session";

export const SESSION_DAYS = Math.min(365, Math.max(1, Number(process.env.SESSION_DAYS) || 30));
export const SESSION_MS = SESSION_DAYS * 24 * 60 * 60 * 1000;

/* Sesi diperpanjang setiap kali /auth/me dipanggil, jadi admin yang aktif
   tidak perlu login ulang. Idle session tetap berakhir setelah SESSION_DAYS. */
export function signSession(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: `${SESSION_DAYS}d`,
  });
}

export function verifySession(token) {
  return jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
}

function requestIsSecure(req) {
  if (process.env.COOKIE_SECURE === "true") return true;
  if (process.env.COOKIE_SECURE === "false") return false;
  const proto = String(req.headers?.["x-forwarded-proto"] || "").split(",")[0].trim();
  return proto === "https" || !!req.secure || process.env.NODE_ENV === "production";
}

export function cookieOptions(req) {
  const requested = String(process.env.COOKIE_SAMESITE || "lax").toLowerCase();
  const sameSite = ["lax", "strict", "none"].includes(requested) ? requested : "lax";
  return {
    httpOnly: true,
    secure: sameSite === "none" || requestIsSecure(req),
    sameSite,
    maxAge: SESSION_MS,
    path: "/",
  };
}

export function setSessionCookie(req, res, token) {
  res.cookie(COOKIE, token, cookieOptions(req));
}

export function clearSessionCookie(req, res) {
  const options = cookieOptions(req);
  delete options.maxAge;
  res.clearCookie(COOKIE, options);
}

/* Dipakai backend serverless yang menulis header Set-Cookie sendiri. */
export function sessionCookieHeader(req, token) {
  const options = cookieOptions(req);
  const sameSite = options.sameSite.charAt(0).toUpperCase() + options.sameSite.slice(1);
  const secure = options.secure ? "Secure; " : "";
  return `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=${sameSite}; ${secure}Max-Age=${Math.floor(options.maxAge / 1000)}`;
}

export function clearSessionCookieHeader(req) {
  const options = cookieOptions(req);
  const sameSite = options.sameSite.charAt(0).toUpperCase() + options.sameSite.slice(1);
  const secure = options.secure ? "Secure; " : "";
  return `${COOKIE}=; Path=/; HttpOnly; SameSite=${sameSite}; ${secure}Max-Age=0`;
}
