import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { z } from "zod";

const prisma = new PrismaClient({
  datasourceUrl: (process.env.DATABASE_URL || "") + (process.env.DATABASE_URL?.includes("?") ? "&" : "?") + "connect_timeout=10&pool_timeout=10",
});

const Schema = z.object({
  username: z.string().min(1).max(64),
  password: z.string().min(1).max(128),
});

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  const parsed = Schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_input" });

  const { username, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return res.status(401).json({ error: "invalid_credentials" });

  const ok = await argon2.verify(user.passwordHash, password);
  if (!ok) return res.status(401).json({ error: "invalid_credentials" });

  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  const csrf = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);

  res.setHeader("Set-Cookie", `lms_session=${token}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=604800`);
  res.status(200).json({ user: { id: user.id, username: user.username }, csrf });
}
