export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  res.setHeader("Set-Cookie", "lms_session=; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=0");
  res.status(200).json({ ok: true });
}
