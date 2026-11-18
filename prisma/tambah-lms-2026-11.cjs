/* Sekali jalan: menambahkan kartu LMS baru (salinan LMS lengkap berlabel SMAN 4) ke portal.
   Ditandai baris SchoolProfile id "migrasi-lms-2026-11" agar tidak berjalan dua kali,
   sehingga kartu yang nanti dihapus admin tidak muncul lagi. Gagal koneksi tidak menggagalkan build. */
const { PrismaClient } = require("@prisma/client");
const MARK = "migrasi-lms-2026-11";
const ENTRIES = [
  { id:"matematika-labmaya",       name:"Matematika (Lab Maya)",       short:"Matematika",   icon:"calculator", color:"#1f6fe5", file:"mapel/matematika.html" },
  { id:"sejarah-labmaya",          name:"Sejarah (Lab Maya)",          short:"Sejarah",      icon:"scroll",     color:"#c92a2a", file:"mapel/sejarah.html" },
  { id:"bahasa-indonesia-labmaya", name:"Bahasa Indonesia (Lab Maya)", short:"B. Indonesia", icon:"book-open",  color:"#c2410c", file:"mapel/bahasa-indonesia.html" },
  { id:"bahasa-inggris-labmaya",   name:"Bahasa Inggris (Lab Maya)",   short:"B. Inggris",   icon:"globe",      color:"#0b7285", file:"mapel/bahasa-inggris.html" },
  { id:"biologi",     name:"Biologi",               short:"Biologi",     icon:"dna",      color:"#2f9e44", file:"mapel/biologi.html" },
  { id:"kimia",       name:"Kimia",                 short:"Kimia",       icon:"flask",    color:"#e8590c", file:"mapel/kimia.html" },
  { id:"geografi",    name:"Geografi",              short:"Geografi",    icon:"map",      color:"#1971c2", file:"mapel/geografi.html" },
  { id:"ekonomi",     name:"Ekonomi",               short:"Ekonomi",     icon:"coins",    color:"#ca8a04", file:"mapel/ekonomi.html" },
  { id:"sosiologi",   name:"Sosiologi",             short:"Sosiologi",   icon:"users",    color:"#c2255c", file:"mapel/sosiologi.html" },
  { id:"pkn",         name:"Pendidikan Pancasila",  short:"Pancasila",   icon:"landmark", color:"#9c36b5", file:"mapel/pkn.html" },
  { id:"pjok",        name:"PJOK",                  short:"PJOK",        icon:"activity", color:"#0c8599", file:"mapel/pjok.html" },
  { id:"informatika", name:"Informatika",           short:"Informatika", icon:"laptop",   color:"#364fc7", file:"mapel/informatika.html" },
  { id:"prakarya",    name:"Prakarya (Pengolahan)", short:"Prakarya",    icon:"wrench",   color:"#9c6644", file:"mapel/prakarya.html" },
];
(async () => {
  if (!process.env.DATABASE_URL) { console.log("tambah-lms: DATABASE_URL kosong, dilewati."); return; }
  const prisma = new PrismaClient();
  try {
    if (await prisma.schoolProfile.findUnique({ where: { id: MARK } })) { console.log("tambah-lms: sudah pernah dijalankan."); return; }
    const existing = await prisma.lmsEntry.findMany({ select: { id: true, file: true } });
    const added = [];
    for (const e of ENTRIES) {
      if (existing.some((x) => x.id === e.id || x.file === e.file)) continue;
      await prisma.lmsEntry.create({ data: { ...e, klass: "X", pub: true } });
      added.push(e.name);
    }
    await prisma.schoolProfile.create({ data: { id: MARK, name: "Penanda: kartu LMS November 2026 sudah ditambahkan" } });
    console.log("tambah-lms: ditambahkan " + added.length + " kartu: " + added.join(", "));
  } catch (err) {
    console.log("tambah-lms: dilewati karena galat:", err.message);
  } finally { await prisma.$disconnect(); }
})();
