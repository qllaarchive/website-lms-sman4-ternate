import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

const LMS_ENTRIES = [
  { id:"matematika", klass:"X", name:"Matematika", short:"Matematika", icon:"calculator", color:"#1f6fe5", file:"mapel/matematika.html", pub:true },
  { id:"fisika",     klass:"X", name:"Fisika",     short:"Fisika",     icon:"atom",       color:"#5f3dc4", file:"mapel/fisika.html",     pub:true },
  { id:"sejarah", klass:"X", name:"Sejarah", short:"Sejarah", icon:"scroll", color:"#c92a2a", file:"mapel/sejarah.html", pub:true,
    scriptId:"AKfycbyp7tmtjjulW3rMhBN3h6nQnTtW2mxdqESfnDwrDtuVjfEgHjCBbvB5NBAinROsj_Lr" },
  { id:"pendais",          klass:"X", name:"Pendidikan Agama Islam", short:"PAI",  icon:"book",       color:"#0f766e", file:"mapel/pendais.html",          pub:true,
    scriptId:"AKfycbwyb4YHCCYQ2OY-uj_fO5TOsE9OoFU5JTKoq5PG7Rd40bz8-jzMXy5iGvgRMc8ImjRMVw" },
];

const SCHOOL_PROFILE = {
  id: "default",
  name: "SMA Negeri 4 Ternate",
  npsn: "",
  addr: "Ternate, Maluku Utara",
  telp: "",
  email: "",
  ppdb: "",
};

async function main() {
  /* Akun admin dibuat dari environment — tidak ada kredensial bawaan di kode. */
  const username = process.env.ADMIN_USER;
  const password = process.env.ADMIN_PASS;
  if (!username || !password) {
    console.error("ADMIN_USER dan ADMIN_PASS wajib di-set di environment sebelum seed.");
    process.exit(1);
  }

  /* Akun hanya dibuat sekali — sandi TIDAK di-reset tiap restart container.
     Untuk mengganti sandi: hapus baris User ini di database, lalu seed ulang. */
  const existing = await prisma.user.findUnique({ where: { username } });
  if (!existing) {
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    await prisma.user.create({ data: { username, passwordHash } });
    console.log(`Akun admin dibuat: "${username}"`);
  } else {
    console.log(`Akun admin sudah ada: "${username}" (sandi tidak diubah)`);
  }
  const others = await prisma.user.deleteMany({ where: { username: { not: username } } });
  if (others.count) console.log(`${others.count} akun lama dihapus — hanya akun admin tetap yang berlaku.`);

  /* Entri LMS di-seed hanya pada boot pertama (profil belum ada).
     Setelah itu entri yang dihapus admin tidak dikembalikan lagi. */
  const prof = await prisma.schoolProfile.findUnique({ where: { id: "default" } });
  if (!prof) {
    const count = await prisma.lmsEntry.count();
    if (count === 0) {
      await prisma.lmsEntry.createMany({ data: LMS_ENTRIES });
      console.log(`${LMS_ENTRIES.length} entri LMS dibuat.`);
    }
    await prisma.schoolProfile.upsert({
      where: { id: "default" },
      update: {},
      create: SCHOOL_PROFILE,
    });
    console.log("Profil sekolah siap.");
  } else {
    console.log("Data sudah pernah di-seed — entri LMS tidak disentuh.");
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
