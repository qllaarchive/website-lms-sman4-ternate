/* Peralihan kartu LMS ke versi baru (tampilan English LMS 2026), per mapel.
   Tiap mapel punya penanda SchoolProfile "lms-baru-<id>" sehingga hanya berjalan sekali;
   kartu yang kelak diubah/dihapus admin tidak dikembalikan. Galat tidak menggagalkan build. */
const { PrismaClient } = require("@prisma/client");
const STEPS = [
  {
    key: "bahasa-inggris",
    hapus: ["bahasa-inggris-mvwqu20f"],            // kartu Netlify lama
    hapusFile: [/lms-bahasa-inggris-x-2026-2027\.netlify\.app/],
    jadi: { id:"bahasa-inggris-labmaya", name:"Bahasa Inggris", short:"B. Inggris", icon:"globe", color:"#0b7285", file:"mapel/bahasa-inggris.html" },
  },
  {
    key: "matematika",
    hapus: ["matematika"],
    hapusFile: [/lms-matematika-x-2026\.netlify\.app/],
    jadi: { id:"matematika-labmaya", name:"Matematika", short:"Matematika", file:"mapel/matematika.html" },
  },
];
(async () => {
  if (!process.env.DATABASE_URL) { console.log("lms-versi-baru: DATABASE_URL kosong, dilewati."); return; }
  const prisma = new PrismaClient();
  try {
    for (const st of STEPS) {
      const mark = "lms-baru-" + st.key;
      if (await prisma.schoolProfile.findUnique({ where: { id: mark } })) continue;
      const all = await prisma.lmsEntry.findMany({ where: { klass: "X" }, select: { id: true, file: true } });
      const del = all.filter((e) => st.hapus.includes(e.id) || (st.hapusFile || []).some((re) => re.test(e.file || ""))).map((e) => e.id).filter((id) => id !== st.jadi.id);
      if (del.length) await prisma.lmsEntry.deleteMany({ where: { id: { in: del } } });
      const { id, ...data } = st.jadi;
      await prisma.lmsEntry.upsert({ where: { id }, update: data, create: { id, ...data, klass: "X", pub: true } });
      await prisma.schoolProfile.create({ data: { id: mark, name: "Penanda: LMS versi baru " + st.key } });
      console.log("lms-versi-baru: " + st.key + " → dihapus " + del.length + " kartu lama, kartu baru siap.");
    }
  } catch (err) {
    console.log("lms-versi-baru: dilewati karena galat:", err.message);
  } finally { await prisma.$disconnect(); }
})();
