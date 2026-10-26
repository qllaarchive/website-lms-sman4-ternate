import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

const LMS_ENTRIES = [
  { id:"matematika", klass:"X", name:"Matematika", short:"Matematika", icon:"calculator", color:"#1f6fe5", file:"matematika.html", pub:true },
  { id:"sejarah", klass:"X", name:"Sejarah", short:"Sejarah", icon:"scroll", color:"#c92a2a", file:"sejarah/sejarah.html", pub:true,
    scriptId:"AKfycbyp7tmtjjulW3rMhBN3h6nQnTtW2mxdqESfnDwrDtuVjfEgHjCBbvB5NBAinROsj_Lr" },
  { id:"pendais", klass:"X", name:"Pendidikan Agama Islam", short:"PAI", icon:"book", color:"#0f766e", file:"pendais.html", pub:true },
];

async function main() {
  /* Akun admin tetap — tidak ada pendaftaran akun publik. */
  const username = process.env.ADMIN_USER || "smanfourtte26@gmail.com";
  const password = process.env.ADMIN_PASS || "smanfour#4";
  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

  await prisma.user.upsert({
    where: { username },
    update: { passwordHash },
    create: { username, passwordHash },
  });
  const others = await prisma.user.deleteMany({ where: { username: { not: username } } });
  if (others.count) console.log(`${others.count} akun lama dihapus — hanya akun admin tetap yang berlaku.`);
  console.log(`Akun admin tetap: "${username}"`);

  const count = await prisma.lmsEntry.count();
  if (count === 0) {
    await prisma.lmsEntry.createMany({ data: LMS_ENTRIES });
    console.log(`${LMS_ENTRIES.length} entri LMS dibuat.`);
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
