import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

const LMS_ENTRIES = [
  { id:"matematika",       klass:"X", name:"Matematika",       short:"Matematika",  icon:"calculator", color:"#0d9488", file:"matematika.html",       pub:true },
  { id:"bahasa-indonesia", klass:"X", name:"Bahasa Indonesia", short:"B. Indonesia",icon:"book-open",  color:"#e8590c", file:"bahasa-indonesia.html", pub:true },
  { id:"bahasa-inggris",   klass:"X", name:"Bahasa Inggris",   short:"B. Inggris",  icon:"globe",      color:"#7048e8", file:"bahasa-inggris.html",   pub:true },
  { id:"biologi",          klass:"X", name:"Biologi",          short:"Biologi",     icon:"dna",        color:"#2b8a3e", file:"biologi.html",          pub:true },
  { id:"ekonomi",          klass:"X", name:"Ekonomi",          short:"Ekonomi",     icon:"coins",      color:"#0c8599", file:"ekonomi.html",          pub:true },
  { id:"fisika",           klass:"X", name:"Fisika",           short:"Fisika",      icon:"atom",       color:"#5f3dc4", file:"fisika.html",           pub:true },
  { id:"geografi",         klass:"X", name:"Geografi",         short:"Geografi",    icon:"globe",      color:"#c2255c", file:"geografi.html",         pub:true },
  { id:"kimia",            klass:"X", name:"Kimia",            short:"Kimia",       icon:"flask",      color:"#d6336c", file:"kimia.html",            pub:true },
  { id:"kka",              klass:"X", name:"KKA",              short:"KKA",         icon:"laptop",     color:"#1098ad", file:"kka.html",              pub:true },
  { id:"pendais",          klass:"X", name:"Pendidikan Agama Islam", short:"PAI",  icon:"book",       color:"#0f766e", file:"pendais.html",          pub:true },
  { id:"pjok",             klass:"X", name:"PJOK",             short:"PJOK",        icon:"activity",   color:"#f76707", file:"pjok.html",             pub:true },
  { id:"pkn",              klass:"X", name:"PKN",              short:"PKN",         icon:"landmark",   color:"#495057", file:"pkn.html",              pub:true },
  { id:"prakarya",         klass:"X", name:"Prakarya",         short:"Prakarya",    icon:"wrench",     color:"#9c6644", file:"prakarya.html",         pub:true },
  { id:"sejarah",          klass:"X", name:"Sejarah",          short:"Sejarah",     icon:"scroll",         color:"#c92a2a", file:"sejarah/sejarah.html",   pub:true },
  { id:"sosiologi",        klass:"X", name:"Sosiologi",        short:"Sosiologi",   icon:"users",      color:"#364fc7", file:"sosiologi.html",        pub:true },
  { id:"tik",              klass:"X", name:"TIK",              short:"TIK",         icon:"monitor",    color:"#66a80f", file:"tik.html",              pub:true },
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
