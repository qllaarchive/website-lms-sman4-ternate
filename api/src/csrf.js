import crypto from "node:crypto";

/* Token CSRF tanpa penyimpanan (stateless): diturunkan dari token sesi
   dengan HMAC + JWT_SECRET. Tetap berlaku setelah server restart dan di
   lingkungan serverless (Vercel), tidak seperti Map di memori. */
export function csrfFor(sessionToken) {
  if (!sessionToken) return null;
  return crypto
    .createHmac("sha256", String(process.env.JWT_SECRET || ""))
    .update("csrf:" + sessionToken)
    .digest("hex")
    .slice(0, 40);
}

export function csrfValid(sessionToken, clientToken) {
  const expected = csrfFor(sessionToken);
  if (!expected || typeof clientToken !== "string" || clientToken.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(clientToken));
}
