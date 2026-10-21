import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  const username = process.env.ADMIN_USER || "admin";
  const password = process.env.ADMIN_PASS || "ChangeMeNow123!";

  const exists = await prisma.user.findUnique({ where: { username } });
  if (exists) {
    console.log(`Admin "${username}" sudah ada — skip.`);
    return;
  }

  const hash = await argon2.hash(password, { type: argon2.argon2id });
  await prisma.user.create({ data: { username, passwordHash: hash, role: "admin" } });
  console.log(`Admin "${username}" dibuat.`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());