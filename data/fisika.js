/* =============================================================
   DATA LMS FISIKA KELAS X — SMAN 4 Ternate (portal, data/fisika.js)
   window.LMS_CONTENT — dibaca assets/lms.js (shell fisika.html)
   CP: CP_SMA/14_CP_SMA_ILMU_PENGETAHUAN_ALAM_(IPA).pdf · Fase E
   lsKey WAJIB sama dengan data/registry.js (fisika)
   ============================================================= */
window.LMS_CONTENT = {
meta:{
  id:"fisika", name:"Fisika", short:"Fisika", emoji:"⚛️",
  color:"#5f3dc4",
  kelas:"X", fase:"Fase E", sekolah:"SMAN 4 Ternate",
  lsKey:"lms_fisika_x_v1",
  sheetId:"", /* isi kode Web App Apps Script fisika setelah deploy */
  moto:["Bernalar","Berkonsep","Bermakna"],
  sideMoto:["Ukur,","Analisis,","Selidiki."],
  quote:"\u201cAlam semesta ditulis dalam bahasa matematika.\u201d",
  note:"CP Fase E — 4 fokus: Pengukuran \u00b7 Gerak & Kinematika \u00b7 Dinamika & Energi \u00b7 Energi & Iklim",
  rasional:"CP IPA Fase E (elemen fisika) mengorganisasikan materi dalam 4 fokus: Pengukuran; Gerak & Kinematika; Dinamika & Energi; Energi & Perubahan Iklim. Setiap unit memuat TP turunan, asesmen diagnostik\u2013formatif\u2013sumatif, proyek, dan refleksi.",
  refText:"Capaian Pembelajaran IPA Fase E \u2014 elemen fisika (CP_SMA/14_CP_SMA_ILMU_PENGETAHUAN_ALAM_(IPA).pdf). Komponen ATP/modul ajar mengikuti 12 unit pada menu Jalur Belajar.",
  botName:"Teman Fisika",
  botIntro:"Halo! \ud83d\udc4b Saya Teman Fisika Kelas X. Tanyakan rumus, satuan & gerak, energi & iklim, atau minta contoh soal.",
  botQuick:["rumus glbb","satuan SI","hukum newton","energi kinetik","perubahan iklim"],
  about:"LMS Fisika Kelas X \u00b7 Fase E (CP via IPA) \u00b7 dibangun selaras 4 fokus capaian: Pengukuran, Gerak & Kinematika, Dinamika & Energi, Energi & Perubahan Iklim.",
  labHero:"Eksplorasi langsung: geser parameter, amati hasil ukur & grafiknya berubah. Tandai selesai setelah kamu menemukan polanya.",
  logoText:"F = ma",
  scene:["x(t) = v\u2080t + \u00bdat\u00b2","g \u2248 9,8 m/s\u00b2","EK = \u00bdmv\u00b2","\u03b1"],
  sceneExtra:'<path d="M470 140 L700 140 M700 140 L700 40" stroke="#7fd1ff" stroke-width="4" stroke-linecap="round" opacity=".8"/><circle cx="700" cy="40" r="7" fill="#7fd1ff"/><polygon points="330,150 410,150 410,86" fill="none" stroke="#9fe0b6" stroke-width="3"/>'
},
KKTP:70,
ELEMENTS : [
  {
    id: 1,
    name: "Pengukuran",
    emoji: "🧰",
    desc: "Sistem pengukuran, alat ukur, dan ketidakpastian dalam kerja ilmiah."
  },
  {
    id: 2,
    name: "Gerak & Kinematika",
    emoji: "🚀",
    desc: "Gerak lurus beraturan, gerak lurus berubah beraturan, dan gerak dua dimensi."
  },
  {
    id: 3,
    name: "Dinamika & Energi",
    emoji: "⚡",
    desc: "Hukum Newton, usaha–energi, momentum–impuls, dan penerapannya."
  },
  {
    id: 4,
    name: "Energi & Iklim",
    emoji: "🌿",
    desc: "Pemanfaatan energi alternatif dan penerapan konsep IPA untuk perubahan iklim."
  }
],

UNITS : [


/* ---------- UNIT 1 ---------- */
{
    n: 1,
    el: 1,
    sem: 1,
    title: "Besaran & Satuan SI",
    emoji: "📏",
    desc: "Membedakan besaran pokok dan turunan, menuliskan satuan SI dengan benar, serta mengonversi satuan untuk kerja ilmiah.",
    tp: [
{
        c: "F.1.1",
        t: "Membedakan besaran pokok dan besaran turunan serta menuliskan satuan SI setiap besaran.",
        e: "Menyusun tabel besaran–satuan–simbol dan menggunakannya saat pengukuran di lab."
      },
    {
        c: "F.1.2",
        t: "Mengonversi satuan (km–m, jam–sekon) dan menulis bilangan dalam notasi ilmiah.",
        e: "Mengonversi 72 km/jam ke m/s dan 45 mm ke cm dengan langkah bertahap."
      }
    ],
    focus: [
      [ "Besaran pokok", "7 besaran: panjang (m), massa (kg), waktu (s), arus (A), suhu (K), cahaya (cd), zat (mol)" ],
      [ "Besaran turunan", "Dibentuk dari besaran pokok; mis. kecepatan = m/s" ],
      [ "Konversi & notasi ilmiah", "km/jam ke m/s : bagi 3,6 ; 4,5 × 10⁸ = 450.000.000" ]
    ],
    model: "Mobil melaju 72 km/jam. Konversi kecepatan: [[72 ÷ 3,6 = 20]] m/s. Contoh panjang: 45 mm = [[45 ÷ 10 = 4,5]] cm. Notasi ilmiah menulis angka besar/kecil ringkas: 0,00052 m = [[5,2 × 10⁻⁴]] m. Kuncinya: [[pahami faktor dasar]], kemudian geser koma atau bagi dengan faktor yang tepat.",
    diag: [
{
        q: "Satuan SI untuk besaran panjang adalah …",
        o: [ "kilometer", "meter", "sentimeter", "milimeter" ],
        a: 1,
        w: "Panjang: satuan dasar SI adalah meter (m)."
      },
    {
        q: "Yang termasuk besaran pokok adalah …",
        o: [ "kecepatan", "massa", "gaya", "energi" ],
        a: 1,
        w: "Massa salah satu dari 7 besaran pokok; kecepatan, gaya, energi adalah turunan."
      },
    {
        q: "72 km/jam = … m/s",
        o: [ "2", "20", "72", "720" ],
        a: 1,
        w: "72 ÷ 3,6 = 20 m/s."
      }
    ],
    form: [
{
        q: "Satuan SI untuk waktu adalah …",
        o: [ "menit", "jam", "sekon", "hari" ],
        a: 2,
        w: "Waktu: sekon (s) — satuan dasar SI."
      },
    {
        q: "Besaran yang hanya memiliki nilai besar (tanpa arah) disebut …",
        o: [ "skalar", "vektor", "pokok", "turunan" ],
        a: 0,
        w: "Skalar hanya punya besar (mis. massa, suhu); vektor punya arah."
      },
    {
        q: "1 jam = … sekon",
        o: [ "60", "360", "3600", "600" ],
        a: 2,
        w: "1 jam = 60 menit × 60 sekon = 3600 s."
      },
    {
        q: "45 mm = … cm",
        o: [ "0,45", "4,5", "45", "450" ],
        a: 1,
        w: "mm ke cm: 45 ÷ 10 = 4,5 cm."
      },
    {
        num: true,
        q: "12 km = … m (isi angka)",
        ans: 12000,
        w: "km ke m: × 1000 = 12.000 m."
      },
    {
        num: true,
        q: "0,5 m = … cm (isi angka)",
        ans: 50,
        w: "m ke cm: × 100 = 50 cm."
      }
    ],
    quiz: [
{
        q: "Yang termasuk besaran turunan adalah …",
        o: [ "panjang", "massa", "kecepatan", "suhu" ],
        a: 2,
        w: "Kecepatan = panjang/waktu → besaran turunan."
      },
    {
        q: "Notasi ilmiah dari 0,00052 adalah …",
        o: [ "5,2 × 10⁻⁴", "52 × 10⁻⁵", "5,2 × 10⁴", "0,52 × 10⁻³" ],
        a: 0,
        w: "Koma digeser 4 tempat ke kanan → pangkat −4."
      },
    {
        q: "Satuan SI untuk suhu adalah …",
        o: [ "°C", "kelvin", "fahrenheit", "joule" ],
        a: 1,
        w: "Suhu: kelvin (K) — satuan SI resmi."
      },
    {
        q: "Alat paling tepat mengukur diameter kelereng adalah …",
        o: [ "mistar", "jangka sorong", "meteran", "termometer" ],
        a: 1,
        w: "Jangka sorong ketelitian 0,1 mm — tepat untuk diameter kecil."
      },
    {
        num: true,
        q: "Sepeda melaju 5 m/s = … km/jam (isi angka)",
        ans: 18,
        w: "m/s ke km/jam: × 3,6 = 18."
      }
    ],
    task: "Ukur 5 benda di rumah (panjang/tinggi/lebar) dengan mistar. Tuliskan hasil dalam cm dan mm, lalu jelaskan perbedaan pembacaan dan sumber kesalahanmu.",
    disc: "Mengapa para ilmuwan sepakat memakai satu satuan baku (SI) daripada satuan lokal seperti hasta, kaki, atau jengkal?",
    proj: {
      title: "Katalog Besaran & Satuan Mini",
      steps: [ "Susun daftar 10 besaran fisika yang sering dipakai.", "Klasifikasikan pokok/turunan + satuan SI dan alat ukurnya.", "Desain poster A4 berisi katalog beserta contoh nyata di kelas.", "Presentasi singkat dan uji tanya antar kelompok." ],
      rub: [
        [ "Ketepatan konsep", "40" ],
        [ "Kreativitas & kerapian", "30" ],
        [ "Keunggulan presentasi", "30" ]
      ]
    },
    refl: [ "Besaran pokok mana yang paling sering kamu pakai sehari-hari?", "Kesulitan apa yang kamu alami saat mengonversi satuan? Bagaimana mengatasinya?", "Apa manfaat satuan baku saat semua anggota kelompok mengukur benda yang sama?" ],
    meet: [
{
        jp: "4 JP",
        topic: "Besaran pokok vs turunan",
        act: "Sortir kartu besaran ke 2 kelompok + diskusi kelas."
      },
    {
        jp: "4 JP",
        topic: "Konversi satuan & angka penting",
        act: "Latihan tangga konversi + kuis kilat berpasangan."
      },
    {
        jp: "4 JP",
        topic: "Notasi ilmiah & aplikasi",
        act: "Praktik mengukur benda kelas + presentasi poster mini."
      }
    ]
  },


/* ---------- UNIT 2 ---------- */
{
    n: 2,
    el: 1,
    sem: 1,
    title: "Alat Ukur & Ketidakpastian",
    emoji: "🔬",
    desc: "Memilih alat ukur yang tepat, membaca skala dengan benar, dan menuliskan hasil pengukuran lengkap dengan ketidakpastiannya.",
    tp: [
{
        c: "F.2.1",
        t: "Membedakan alat ukur baku (mistar, jangka sorong, mikrometer, neraca) dan memilih sesuai kebutuhan.",
        e: "Menjelaskan alasan memilih jangka sorong ketimbang mistar untuk mengukur diameter koin."
      },
    {
        c: "F.2.2",
        t: "Menentukan ketidakpastian pengukuran berulang dan menuliskan laporan hasil ukur.",
        e: "Menghitung rerata dan NAB dari 3 kali pengukuran panjang meja lalu menulis hasil ± NAB."
      }
    ],
    focus: [
      [ "Alat ukur baku", "Mistar (1 mm), jangka sorong (0,1 mm), mikrometer (0,01 mm)" ],
      [ "Ketidakpastian (NAB)", "½ × skala terkecil alat" ],
      [ "Pengukuran berulang", "Hasil = rerata ± NAB ; rerata = Σx/n" ]
    ],
    model: "Kelas mengukur panjang buku 3 kali: 15,2 cm; 15,4 cm; 15,3 cm. Rerata = [[15,3]] cm. NAB = [[½ × (15,4 − 15,2) = 0,1]] cm. Laporan yang benar: [[15,3 ± 0,1]] cm. Dengan menuliskan NAB, pembaca tahu [[seberapa yakin angka itu]] — kerja ilmiah selalu jujur pada ketidakpastiannya.",
    diag: [
{
        q: "Alat yang tepat untuk mengukur tebal koin (ketelitian 0,1 mm) adalah …",
        o: [ "mistar", "jangka sorong", "neraca", "gelas ukur" ],
        a: 1,
        w: "Jangka sorong ketelitian 0,1 mm — tepat untuk tebal kecil."
      },
    {
        q: "Ketidakpastian alat (NAB) mistar dengan skala terkecil 1 mm adalah …",
        o: [ "1 mm", "0,5 mm", "0,1 mm", "5 mm" ],
        a: 1,
        w: "NAB = ½ × skala terkecil = 0,5 mm."
      },
    {
        q: "Pengukuran berulang dilakukan untuk …",
        o: [ "mengurangi pengaruh kecerobosan", "memperberat laporan", "memakai banyak alat", "membuang waktu" ],
        a: 0,
        w: "Berulang mengurangi kecerobosan dan membuat hasil lebih dapat diandalkan."
      }
    ],
    form: [
{
        q: "Skala nonius (vernier) jangka sorong membaca hingga pecahan …",
        o: [ "1 mm", "0,5 mm", "0,1 mm", "0,01 mm" ],
        a: 2,
        w: "Nonius jangka sorong = 0,1 mm."
      },
    {
        q: "Alat untuk benda sangat kecil (tebal kertas, diameter kawat) adalah …",
        o: [ "mikrometer sekrup", "meteran", "jam dinding", "gelas ukur" ],
        a: 0,
        w: "Mikrometer ketelitian 0,01 mm."
      },
    {
        q: "Hasil pengukuran yang baik ditulis dengan …",
        o: [ "tanda ± NAB", "tanpa satuan", "angka bulat saja", "desimal sesuka hati" ],
        a: 0,
        w: "Laporan ilmiah: hasil ± ketidakpastian + satuan."
      },
    {
        num: true,
        q: "NAB dari alat berskala terkecil 0,2 cm = … cm (isi angka)",
        ans: 0.1,
        w: "½ × 0,2 = 0,1 cm."
      },
    {
        q: "Pengukuran 3 kali: 10,1; 10,2; 10,3 cm → rerata = …",
        o: [ "10,1", "10,2", "10,3", "10,6" ],
        a: 1,
        w: "(10,1+10,2+10,3) ÷ 3 = 10,2."
      },
    {
        num: true,
        q: "Pengukuran 2 kali: 20 cm dan 22 cm. NAB = … cm (isi angka)",
        ans: 1,
        w: "½ × (22 − 20) = 1 cm."
      }
    ],
    quiz: [
{
        q: "Pengukuran tinggi meja (± 75 cm) paling praktis dengan …",
        o: [ "mistar 30 cm berulang", "mikrometer", "meteran gulung", "jangka sorong" ],
        a: 2,
        w: "Meteran rentangnya besar dan mudah dipakai untuk jarak sedang."
      },
    {
        q: "Tiga kali penimbangan penghasilan angka sama: 120 g, 120 g, 120 g — laporan yang tepat: …",
        o: [ "120 ± 0 g", "120 ± 1 g", "120 g salah", "120 g sesekali" ],
        a: 0,
        w: "Semua penetapan sama → ketidakpastian 0 (idealnya)."
      },
    {
        q: "Nonius (vernier) membuat alat ukur mampu membaca …",
        o: [ "pecahan kecil di bawah skala utama", "suhu", "waktu", "berat" ],
        a: 0,
        w: "Nonius menambah ketelitian di bawah skala utama."
      },
    {
        q: "Satuan SI untuk massa adalah …",
        o: [ "gram", "kilogram", "ton", "pound" ],
        a: 1,
        w: "Massa: kilogram (kg) — satuan dasar SI."
      },
    {
        q: "Saat membaca gelas ukur, posisi mata yang benar adalah …",
        o: [ "sejajar permukaan cairan", "dari atas bebas", "samping", "tidak penting" ],
        a: 0,
        w: "Mata sejajar batas cairan (meniskus) agar tidak bias parallax."
      }
    ],
    task: "Ukur lebar meja 3 kali dengan alat berbeda (mistar, jangka sorong, jengkal). Susun tabel perbandingan, lalu tulis setiap hasil dalam bentuk rerata ± NAB.",
    disc: "Buku diukur 15 cm dengan mistar dan 15,24 cm dengan jangka sorong — mana yang lebih baik? Kaitkan jawabanmu dengan skala terkecil dan kebutuhan pengukuran.",
    proj: {
      title: "Kartu Alat Ukur & Ketidakpastian",
      steps: [ "Pilih 4 alat ukur di lab/rumah (mistar, gelas ukur, timbangan, jam).", "Ukur benda yang sama 3 kali dengan tiap alat.", "Hitung rerata ± NAB dan tulis skala terkecil alat.", "Susun kartu A5 tiap alat dan pajangkan di papan kelas." ],
      rub: [
        [ "Ketelitian laporan", "40" ],
        [ "Pemahaman NAB", "30" ],
        [ "Kerapian kartu", "30" ]
      ]
    },
    refl: [ "Alat ukur apa yang paling sulit kamu gunakan dan mengapa?", "Bisakah ketidakpastian menjadi 0? Kapan hal itu mungkin?", "Apa makna 'ketelitian' menurutmu dalam kerja ilmiah?" ],
    meet: [
{
        jp: "4 JP",
        topic: "Alat ukur & skala terkecil",
        act: "Eksplorasi 4 alat ukur di meja lab + membaca nonius."
      },
    {
        jp: "4 JP",
        topic: "Ketidakpastian & pengukuran berulang",
        act: "Praktik menulis laporan hasil ± NAB."
      },
    {
        jp: "4 JP",
        topic: "Proyek kartu alat ukur",
        act: "Gallery walk kartu + kuis mini alat ukur."
      }
    ]
  },


/* ---------- UNIT 3 ---------- */
{
    n: 3,
    el: 2,
    sem: 1,
    title: "Gerak Lurus: Jarak & Perpindahan",
    emoji: "🏃",
    desc: "Membedakan jarak dan perpindahan serta menghitung kelajuan/kecepatan benda bergerak lurus beraturan (GLB) lewat grafik dan rumus.",
    tp: [
{
        c: "F.3.1",
        t: "Membedakan jarak (skalar) dan perpindahan (vektor) serta menyusun grafik posisi–waktu.",
        e: "Menghitung jarak dan perpindahan siswa berjalan keliling lapangan."
      },
    {
        c: "F.3.2",
        t: "Menghitung kelajuan dan kecepatan rata-rata GLB serta menginterpretasi grafik x–t dan v–t.",
        e: "Menghitung s = v·t untuk berbagai kasus dan membaca grafik v–t."
      }
    ],
    focus: [
      [ "Jarak vs perpindahan", "Jarak: panjang lintasan; Δx: beda posisi (punya arah)" ],
      [ "GLB", "v konstan; x = v·t; grafik x–t garis lurus miring" ],
      [ "Konversi kecepatan", "km/jam ÷ 3,6 = m/s ; m/s × 3,6 = km/jam" ]
    ],
    model: "Atlet berjalan keliling lapangan 400 m lalu kembali ke titik awal: jarak = [[400 m]], perpindahan = [[0 m]] karena posisi akhir = posisi awal. Jika berjalan lurus terus 100 m selama 20 s → kelajuan [[100 ÷ 20 = 5]] m/s dan jarak [[v × t = 5 × 20 = 100]] m. Grafik x–t-nya [[garis lurus miring]] karena posisi bertambah rata setiap detik.",
    diag: [
{
        q: "Besaran yang punya besar DAN arah disebut …",
        o: [ "skalar", "vektor", "pokok", "turunan" ],
        a: 1,
        w: "Vektor: besar + arah (mis. perpindahan, gaya)."
      },
    {
        q: "Benda bergerak GLB memiliki …",
        o: [ "kecepatan tetap", "percepatan tetap", "jarak menurun", "waktu tetap" ],
        a: 0,
        w: "GLB = gerak lurus beraturan; v konstan."
      },
    {
        q: "Rumus jarak GLB adalah s = …",
        o: [ "v·t", "½·a·t²", "v₀ + a·t", "v ÷ t" ],
        a: 0,
        w: "GLB: s = v × t."
      }
    ],
    form: [
{
        q: "Perpindahan bisa bernilai nol ketika benda …",
        o: [ "kembali ke titik awal", "pergi terus", "berhenti di tengah", "melaju pelan" ],
        a: 0,
        w: "Kembali ke posisi awal → Δx = 0 meski jarak > 0."
      },
    {
        q: "Grafik x–t untuk GLB berbentuk …",
        o: [ "garis lurus miring", "parabola", "gelombang", "garis mendatar" ],
        a: 0,
        w: "Posisi bertambah linier terhadap waktu → garis lurus miring."
      },
    {
        q: "3 m/s = … km/jam",
        o: [ "3", "10,8", "30", "108" ],
        a: 1,
        w: "m/s ke km/jam: × 3,6 = 10,8."
      },
    {
        num: true,
        q: "Mobil melaju 20 m/s selama 4 s → jarak = … m (isi angka)",
        ans: 80,
        w: "s = v×t = 20 × 4 = 80 m."
      },
    {
        num: true,
        q: "Jalan 60 m dalam 12 s → kelajuan = … m/s (isi angka)",
        ans: 5,
        w: "v = s/t = 60/12 = 5 m/s."
      },
    {
        q: "Kelajuan tanpa menyebut arah disebut …",
        o: [ "kelajuan (speed)", "kecepatan (velocity)", "akselerasi", "posisi" ],
        a: 0,
        w: "Kelajuan = skalar; kecepatan = vektor (dengan arah)."
      }
    ],
    quiz: [
{
        q: "Sepeda 10 m/s selama 1 menit → jarak = … m",
        o: [ "60", "100", "600", "6000" ],
        a: 2,
        w: "60 s × 10 = 600 m."
      },
    {
        q: "Berjalan 5 km ke timur lalu 5 km ke barat: jarak = …, perpindahan = …",
        o: [ "10 km; 0", "0; 10", "5; 5", "10; 10" ],
        a: 0,
        w: "Jarak total 10 km; kembali ke awal → Δx = 0."
      },
    {
        q: "Bus melaju 72 km/jam = … m/s",
        o: [ "7,2", "20", "36", "72" ],
        a: 1,
        w: "72 ÷ 3,6 = 20 m/s."
      },
    {
        q: "Grafik v–t untuk GLB berbentuk …",
        o: [ "garis horizontal", "garis miring naik", "parabola", "tak beraturan" ],
        a: 0,
        w: "v konstan → garis horizontal."
      },
    {
        num: true,
        q: "Lari 100 m selama 20 s → kelajuan = … m/s (isi angka)",
        ans: 5,
        w: "100 ÷ 20 = 5 m/s."
      }
    ],
    task: "Catat rute pulang–pergi ke sekolah (langkah/aplikasi peta). Hitung jarak total dan perpindahan; jelaskan mengapa keduanya berbeda (atau sama) dengan 3 kalimat.",
    disc: "Selalu perhatikan apakah masalahmu menanyakan jarak atau perpindahan! Kapan keduanya bernilai sama — dan kapan berbeda?",
    proj: {
      title: "Denah Perpindahan Sekolah",
      steps: [ "Gambar denah rute dari kelas ke kantin perpustakaan.", "Ukur panjang setiap ruas (langkah/mistar) dalam skala.", "Hitung jarak total dan perpindahan (garis lurus awal → akhir).", "Presentasi denah dengan panah, skala, dan nilai jarak/Δx." ],
      rub: [
        [ "Ketepatan pengukuran", "40" ],
        [ "Kualitas denah", "30" ],
        [ "Penjelasan perpindahan", "30" ]
      ]
    },
    refl: [ "Kapan jarak dan perpindahan bernilai sama?", "Grafik x–t atau v–t mana yang menurutmu lebih informatif? Jelaskan bentuknya.", "Selain gerak, apa lagi yang bisa direpresentasikan sebagai vektor?" ],
    meet: [
{
        jp: "4 JP",
        topic: "Jarak & perpindahan",
        act: "Permainan langkah skala di lapangan + diskusi Δx."
      },
    {
        jp: "4 JP",
        topic: "Kelajuan & kecepatan",
        act: "Tebak-cepat kelajuan sepeda/motor berpasangan."
      },
    {
        jp: "4 JP",
        topic: "Grafik x–t & v–t",
        act: "Praktik menggambar grafik dari data tabel waktu."
      }
    ]
  },


/* ---------- UNIT 4 ---------- */
{
    n: 4,
    el: 2,
    sem: 1,
    title: "GLBB & Jatuh Bebas",
    emoji: "🚀",
    desc: "Menganalisis gerak lurus berubah beraturan (GLBB) dan jatuh bebas melalui persamaan dan grafik kecepatan–waktu.",
    tp: [
{
        c: "F.4.1",
        t: "Menganalisis GLBB (dipercepat/diperlambat) dengan persamaan v = v₀ + a·t dan s = v₀·t + ½·a·t², termasuk grafik v–t.",
        e: "Menghitung kecepatan akhir dan jarak kereta yang dipercepat dari keadaan diam."
      },
    {
        c: "F.4.2",
        t: "Menerapkan GLBB dengan percepatan gravitasi untuk gerak jatuh bebas (v₀ = 0).",
        e: "Menghitung kecepatan benda yang jatuh dari ketinggian tertentu (g = 10 m/s²)."
      }
    ],
    focus: [
      [ "GLBB", "v = v₀ + a·t ; s = v₀·t + ½·a·t² ; v² = v₀² + 2a·s" ],
      [ "Grafik v–t", "garis lurus miring; kemiringan (slope) = percepatan a" ],
      [ "Jatuh bebas", "v₀ = 0 ; a = g ≈ 10 m/s² ; v = g·t ; h = ½·g·t²" ]
    ],
    model: "Kereta dipercepat dari diam dengan a = 2 m/s² selama 4 s: v = [[0 + 2×4 = 8]] m/s dan jarak = [[½×2×4² = 16]] m. Grafik v–t-nya garis lurus naik; kemiringannya [[2 m/s tiap detik]]. Benda jatuh bebas dari 5 m (g = 10): kecepatan saat menyentuh tanah = [[√(2gh) = √100 = 10]] m/s. Semakin kuat percepatan, [[semakin curam]] grafik v–t.",
    diag: [
{
        q: "GLBB berbeda dari GLB karena memiliki …",
        o: [ "percepatan tetap", "kelajuan tetap", "jarak tetap", "waktu berhenti" ],
        a: 0,
        w: "GLBB: kecepatan berubah teratur karena percepatan konstan."
      },
    {
        q: "Satuan percepatan adalah …",
        o: [ "m/s", "m/s²", "kg", "N" ],
        a: 1,
        w: "Percepatan: perubahan kecepatan per detik → m/s²."
      },
    {
        q: "Percepatan gravitasi di permukaan bumi ≈ …",
        o: [ "9,8 m/s²", "1 m/s²", "98 m/s²", "0,98 m/s²" ],
        a: 0,
        w: "g ≈ 9,8 m/s², biasanya dibulatkan 10 m/s² dalam soal."
      }
    ],
    form: [
{
        q: "Mobil dipercepat a = 3 m/s² artinya …",
        o: [ "kecepatan bertambah 3 m/s tiap detik", "jarak benda bertambah 3 m/s", "waktu bertambah 3 s", "arah berubah tiap 3 s" ],
        a: 0,
        w: "a = 3 m/s²: Δv = 3 m/s setiap 1 detik."
      },
    {
        q: "Mobil bergerak 20 m/s lalu direm dengan a = −4 m/s² selama 4 s → kecepatan akhirnya …",
        o: [ "0", "4", "16", "20" ],
        a: 0,
        w: "v = 20 + (−4)(4) = 20 − 16 = 0 m/s (berhenti)."
      },
    {
        q: "Grafik jarak–waktu untuk benda yang jatuh bebas berbentuk …",
        o: [ "parabola (cekung)", "garis lurus", "garis mendatar", "tak beraturan" ],
        a: 0,
        w: "s = ½gt² ∝ t² → parabola."
      },
    {
        num: true,
        q: "Motor dari diam a = 2 m/s², t = 3 s → v = … m/s (isi angka)",
        ans: 6,
        w: "v = 0 + 2×3 = 6 m/s."
      },
    {
        num: true,
        q: "Kereta dipercepat a = 1 m/s² dari diam selama 5 s → s = … m (isi angka)",
        ans: 12.5,
        w: "s = ½ × 1 × 25 = 12,5 m."
      },
    {
        q: "Jatuh bebas 'ideal' mengabaikan …",
        o: [ "hambatan udara", "massa benda", "gravitasi", "waktu" ],
        a: 0,
        w: "Mode ideal tanpa hambatan udara; semua benda jatuh sama cepat."
      }
    ],
    quiz: [
{
        q: "Benda jatuh bebas; kecepatan setelah 2 s (g = 10 m/s²) adalah …",
        o: [ "5", "10", "20", "40" ],
        a: 2,
        w: "v = g×t = 10 × 2 = 20 m/s."
      },
    {
        q: "Mobil berhenti dalam 5 s dari 25 m/s → percepatannya …",
        o: [ "5 m/s²", "−5 m/s²", "−125 m/s²", "−0,2 m/s²" ],
        a: 1,
        w: "a = (0 − 25)/5 = −5 m/s² (diperlambat)."
      },
    {
        q: "Jarak benda jatuh bebas setelah 3 s (g = 10) = … m",
        o: [ "30", "45", "15", "90" ],
        a: 1,
        w: "s = ½ × 10 × 9 = 45 m."
      },
    {
        q: "Kemiringan (slope) garis pada grafik v–t mewakili …",
        o: [ "percepatan", "jarak", "massa", "waktu" ],
        a: 0,
        w: "slope = Δv/Δt = percepatan."
      },
    {
        num: true,
        q: "Kecepatan benda jatuh dari 20 m (g = 10): v = √(2gh) = … m/s (isi angka)",
        ans: 20,
        w: "√(2 × 10 × 20) = √400 = 20 m/s."
      }
    ],
    task: "Lakukan 'percobaan jatuh bola' dari ketinggian 2 m (stopwatch). Ulangi 3 kali, hitung rata-rata waktu, lalu hitung g eksperimental dan bandingkan dengan 10 m/s².",
    disc: "Mengapa bulu dan koin jatuh bersamaan di tabung vakum tapi tidak di udara biasa? Apa peran hambatan udara?",
    proj: {
      title: "Galeri Grafik GLBB",
      steps: [ "Susun tabel waktu–kecepatan–jarak untuk 3 kasus (dipercepat, diperlambat, jatuh bebas).", "Gambar grafik x–t dan v–t di kertas milimeter.", "Kelas menandai kesalahan-prakiraan grafik teman (peer review).", "Presentasi 1 grafik terbaik + penjelasan 2 menit." ],
      rub: [
        [ "Ketepatan grafik", "40" ],
        [ "Ketepatan hitung", "30" ],
        [ "Peer review & presentasi", "30" ]
      ]
    },
    refl: [ "Bagaimana kamu membedakan gerak dipercepat dan diperlambat hanya dari grafik v–t?", "Apa yang berubah jika benda jatuh di Bulan yang g-nya 6× lebih kecil?", "Pernahkah kamu merasakan efek inersia/gravitasi saat kendaraan bergerak? Ceritakan." ],
    meet: [
{
        jp: "4 JP",
        topic: "GLBB & percepatan",
        act: "Analogi kendaraan rem–gas + latihan pertama."
      },
    {
        jp: "4 JP",
        topic: "Grafik v–t & persamaan GLBB",
        act: "Praktik menggambar & menghitung bertingkat."
      },
    {
        jp: "4 JP",
        topic: "Jatuh bebas & g",
        act: "Percobaan jatuh bola + kuis mini."
      }
    ]
  },


/* ---------- UNIT 5 ---------- */
{
    n: 5,
    el: 2,
    sem: 1,
    title: "Gerak Parabola",
    emoji: "🎯",
    desc: "Menganalisis gerak dua dimensi (lemparan parabola) sebagai gabungan GLB horizontal dan GLBB vertikal di bawah gravitasi.",
    tp: [
{
        c: "F.5.1",
        t: "Menganalisis gerak parabola sebagai perpaduan gerak horizontal (GLB) dan gerak vertikal (GLBB).",
        e: "Menentukan komponen kecepatan bola yang ditendang dengan sudut elevasi tertentu."
      },
    {
        c: "F.5.2",
        t: "Menghitung waktu terbang, tinggi maksimum (vy²/2g), dan jarak lemparan parabola (g = 10 m/s²).",
        e: "Menghitung tinggi maksimum lemparan vertikal dan waktu di udara bola."
      }
    ],
    focus: [
      [ "Komponen kecepatan", "vx = v·cos α (tetap) ; vy = v·sin α (berubah oleh g)" ],
      [ "Tinggi maksimum", "h_maks = vy²/(2g), terjadi saat vy = 0" ],
      [ "Waktu & jarak", "t_terbang = 2·vy/g ; jarak = vx × t_terbang" ]
    ],
    model: "Bola ditendang 20 m/s dengan sudut elevasi 30°: vx = [[20 × cos30° ≈ 17,3]] m/s (komponen horizontal tetap), vy = [[20 × sin30° = 10]] m/s. Waktu naik = vy/g = [[1 s]], waktu terbang = [[2 s]]. Tinggi maksimum = [[vy²/(2g) = 100/20 = 5]] m dan jarak horizontal = [[17,3 × 2 ≈ 35]] m. Kunci: pada puncak, [[vy = 0]] tetapi vx tetap bergerak.",
    diag: [
{
        q: "Gerak parabola adalah gabungan gerak …",
        o: [ "GLB (horizontal) + GLBB (vertikal)", "dua GLB sekaligus", "dua GLBB sekaligus", "putar + lurus" ],
        a: 0,
        w: "Sumbu x: tanpa gaya → GLB; sumbu y: ada g → GLBB."
      },
    {
        q: "Pada puncak lintasan parabola, kecepatan vertikal (vy) bernilai …",
        o: [ "nol", "maksimum", "negatif terbesar", "konstan" ],
        a: 0,
        w: "Puncak: vy nol sesaat; vx tetap berjalan."
      },
    {
        q: "Komponen kecepatan yang tetap konstan sepanjang lintasan adalah …",
        o: [ "horizontal (vx)", "vertikal (vy)", "keduanya", "tidak ada" ],
        a: 0,
        w: "Tidak ada gaya mendatar → vx konstan; vy berubah karena gravitasi."
      }
    ],
    form: [
{
        q: "Arah percepatan benda pada lemparan parabola selalu …",
        o: [ "ke bawah (g)", "mendatar", "ke atas", "memutar" ],
        a: 0,
        w: "Gravitasi mengarah ke bawah sepanjang lintasan."
      },
    {
        q: "Untuk kecepatan awal sama, menjulurkan sudut elevasi akan membuat tinggi maksimum …",
        o: [ "naik", "turun", "tetap", "nol" ],
        a: 0,
        w: "vy = v·sin α bertumbuh → h_maks naik."
      },
    {
        q: "Lintasan bola lempar (tanpa hambatan) didekati oleh bentuk …",
        o: [ "parabola", "lingkaran", "garis lurus", "zig-zag" ],
        a: 0,
        w: "Gerak dua dimensi → berbentuk parabola."
      },
    {
        num: true,
        q: "Bola dilempar vertikal dari tanah v₀ = 20 m/s (g = 10) → tinggi maksimum = … m (isi angka)",
        ans: 20,
        w: "h = v₀²/(2g) = 400/20 = 20 m."
      },
    {
        num: true,
        q: "Lemparan v = 10 m/s, sudut 30° → vy = v·sin30° = … m/s (isi angka)",
        ans: 5,
        w: "10 × 0,5 = 5 m/s."
      },
    {
        q: "Benda dilempar horizontal dari tebing. Komponen geraknya adalah …",
        o: [ "GLB (x) + GLBB (y)", "GLB dua sumbu", "GLBB dua sumbu", "lurus konstan" ],
        a: 0,
        w: "Lempar horizontal: x GLB, y jatuh bebas."
      }
    ],
    quiz: [
{
        q: "Bola dilempar vertikal v₀ = 30 m/s (g = 10) → tinggi maksimum = … m",
        o: [ "30", "45", "15", "90" ],
        a: 1,
        w: "h = 900/20 = 45 m."
      },
    {
        q: "Sudut elevasi 45° memberikan jarak optimal di kondisi …",
        o: [ "tanpa hambatan udara (ideal)", "angin kencang", "di dalam air", "di atas kereta" ],
        a: 0,
        w: "Ideal (tanpa gesekan) → 45° memberi rentang maksimal."
      },
    {
        q: "Benda dilempar vertikal ke atas v₀ = 10 m/s; waktu jatuh kembali (g = 10) = …",
        o: [ "1 s", "2 s", "3 s", "4 s" ],
        a: 1,
        w: "t = 2v₀/g = 2 × 10/10 = 2 s."
      },
    {
        q: "Waktu di udara lemparan vertikal v₀ = 15 m/s (g = 10) adalah …",
        o: [ "1,5 s", "3 s", "1 s", "3,5 s" ],
        a: 1,
        w: "t = 2×15/10 = 3 s."
      },
    {
        num: true,
        q: "Bola ditendang v = 10 m/s, sudut 60° → vx = v·cos60° = … m/s (isi angka)",
        ans: 5,
        w: "10 × 0,5 = 5 m/s."
      }
    ],
    task: "Di lapangan, tendang bola ke udara dengan estimasi sudut 30°–45°. Ukur jarak (meteran) dan perkirakan v₀ dari waktu di udara; bandingkan dengan jarak yang terukur.",
    disc: "Mengapa lemparan di Bulan (g ≈ 1,6 m/s²) makin lama di udara dan makin jauh? Kaitkan jawaban dengan rumus t terbang dan h maks.",
    proj: {
      title: "Playground Parabola",
      steps: [ "Kumpulkan data 3 aktivitas lempar (bola, kertas, selongsong).", "Ukur waktu di udara (stopwatch) dan jarak tiap lemparan.", "Hitung vy, waktu di udara, dan h maksimum dengan asumsi g = 10 m/s².", "Presentasi tabel lengkap + penjelasan pilihan sudut." ],
      rub: [
        [ "Ketepatan pengukuran", "40" ],
        [ "Analisis & hitung", "30" ],
        [ "Presentasi", "30" ]
      ]
    },
    refl: [ "Sebutkan 2 aktivitas harianmu di mana lintasan parabola muncul.", "Sudut 30° vs 60° mana yang lebih menarik bagimu dan kenapa (tinggi vs jarak)?", "Jika g di lokasi berubah, bagian mana dari gerak yang langsung terpengaruh?" ],
    meet: [
{
        jp: "4 JP",
        topic: "Dekomposisi vektor vx & vy",
        act: "Praktik merinci lempar dengan kartu sudut dan kata wakil."
      },
    {
        jp: "4 JP",
        topic: "Waktu terbang & tinggi maks",
        act: "Praktik hitung + kuis cepat."
      },
    {
        jp: "4 JP",
        topic: "Playground parabola",
        act: "Praktik lapangan + galeri tabel."
      }
    ]
  },


/* ---------- UNIT 6 ---------- */
{
    n: 6,
    el: 2,
    sem: 1,
    title: "Gerak Lingkaran",
    emoji: "🎡",
    desc: "Menganalisis gerak melingkar — periode, frekuensi, kecepatan anguler, kecepatan linear, dan percepatan sentripetal.",
    tp: [
{
        c: "F.6.1",
        t: "Menentukan besaran gerak melingkar: periode, frekuensi, kecepatan anguler (ω = 2π/T), dan kecepatan linear (v = ω·r).",
        e: "Menghitung kecepatan linear tebing roda dari periode dan radiusnya."
      },
    {
        c: "F.6.2",
        t: "Menjelaskan dan menghitung percepatan sentripetal (a = v²/r) yang berarah ke pusat lingkaran.",
        e: "Menghitung percepatan sentripetal mobil yang berbelok memiliki radius tertentu."
      }
    ],
    focus: [
      [ "Periode & frekuensi", "T = sekon/putaran ; f = 1/T (Hz)" ],
      [ "Kecepatan anguler", "ω = 2π/T ; v = ω·r" ],
      [ "Percepatan sentripetal", "a_s = v²/r, berarah ke pusat" ]
    ],
    model: "Roda raksasa radius 20 m satu putaran 60 s: T = [[60 s]], f = [[1/T = 1/60 Hz]], kecepatan linear v = [[2πr/T ≈ 2×3,14×20/60 ≈ 2,1]] m/s dan percepatan sentripetal a = [[v²/r ≈ 0,2]] m/s². Percepatan sentripetal [[selalu menuju pusat]] inilah gaya yang membuat benda tetap di lintasan melingkar.",
    diag: [
{
        q: "Hubungan frekuensi dan periode adalah …",
        o: [ "f = 1/T", "f = T", "f = 2T", "f = T²" ],
        a: 0,
        w: "f = 1/T; satuan Hz (hertz)."
      },
    {
        q: "Kecepatan linear pada gerak melingkar adalah v = …",
        o: [ "ω·r", "ω/r", "r/ω", "ω²·r" ],
        a: 0,
        w: "v = ω × r."
      },
    {
        q: "Percepatan sentripetal selalu berarah ke …",
        o: [ "pusat lingkaran", "atas", "luar lingkaran", "tengen" ],
        a: 0,
        w: "Sentripetal = menuju pusat perputaran."
      }
    ],
    form: [
{
        q: "Satuan kecepatan anguler (ω) adalah …",
        o: [ "rad/s", "rad", "m/s", "Hz" ],
        a: 0,
        w: "Kecepatan anguler: radian per sekon."
      },
    {
        q: "Satu putaran penuh menyapu sudut sebesar …",
        o: [ "2π rad", "π rad", "4π rad", "90°" ],
        a: 0,
        w: "1 putaran = 360° = 2π rad."
      },
    {
        q: "Jika ω bertambah (r tetap), v menjadi …",
        o: [ "naik", "turun", "tetap", "nol" ],
        a: 0,
        w: "v = ω·r → naik bersama dalam ω."
      },
    {
        num: true,
        q: "Roda radius 0,5 m berputar 60 putaran/t (f = 1 Hz) → v = 2πr·f = 2 × 3,14 × 0,5 × 1 = … m/s (isi angka)",
        ans: 3.14,
        w: "2 × 3,14 × 0,5 × 1 = 3,14 m/s."
      },
    {
        q: "Contoh gerak melingkar di kehidupan adalah …",
        o: [ "kipas & roda kendaraan", "jalan lurus", "air mengalir", "layang terbang" ],
        a: 0,
        w: "Roda/kipas: gerak melingkar harian."
      },
    {
        num: true,
        q: "Benda v = 10 m/s pada radius 2 m → a sentripetal = v²/r = … m/s² (isi angka)",
        ans: 50,
        w: "100/2 = 50 m/s²."
      }
    ],
    quiz: [
{
        q: "Laju 10 m/s pada radius 1 m → a_s = … m/s²",
        o: [ "10", "100", "1", "20" ],
        a: 1,
        w: "v²/r = 100/1 = 100."
      },
    {
        q: "1 menit = 60 putaran → f = … Hz",
        o: [ "1", "60", "1/60", "360" ],
        a: 0,
        w: "f = 60 putaran / 60 s = 1 Hz."
      },
    {
        q: "Benda ω = 4 rad/s pada r = 2 m → v = … m/s",
        o: [ "2", "8", "16", "6" ],
        a: 1,
        w: "v = 4 × 2 = 8 m/s."
      },
    {
        q: "Jika T menjadi 2× lebih lama (r sama), kecepatan linear menjadi …",
        o: [ "½ ×", "2 ×", "4 ×", "tetap" ],
        a: 0,
        w: "v = 2πr/T → T naik 2× → v turun ½."
      },
    {
        num: true,
        q: "Roda radius 0,5 m berputar 2 Hz → v = 2 × 3,14 × 0,5 × 2 = … m/s (isi angka 2 desimal)",
        ans: 6.28,
        w: "2 × 3,14 × 2 × 0,5 = 6,28 m/s."
      }
    ],
    task: "Ukur radius roda sepeda. Ketika bersepeda charger ditahan, hitung kecepatan linear dari periode roda dan bandingkan dengan kecepatan sebenarnya (meteran).",
    disc: "Mengapa penumpang terasa 'terlempar keluar' saat mobil membelok tajam? Bagaimana kaitannya dengan sendiri/inersia vs sentripetal?",
    proj: {
      title: "Katalog Gerak Melingkar Mini",
      steps: [ "Kumpulkan 4 contoh gerak melingkar di sekitar (kipas, roda, gelung).", "Ukur/estimasi periode tiap objek.", "Hitung f, ω, dan v di tepi objek.", "Susun kartu A5 berisi skema + hasil hitung tiap objek." ],
      rub: [
        [ "Ketepatan hitung", "40" ],
        [ "Variatif contoh", "30" ],
        [ "Rapi & menarik", "30" ]
      ]
    },
    refl: [ "Contoh gerak melingkar sehari-hari yang paling sering kamu lihat dan berapa kira-kira periodenya?", "Apa bedanya kecepatan linear dan anguler (menurut pemahamanmu)?", "Tentang mobil yang berbelok tajam: gaya apa yang membuatnya melengkung?" ],
    meet: [
{
        jp: "4 JP",
        topic: "Periode, frekuensi & ω",
        act: "Praktik menghitung periode kipas/roda + eksperimen mini."
      },
    {
        jp: "4 JP",
        topic: "Kecepatan linear & radius",
        act: "Praktik hitung variasi r dengan waktu tetap."
      },
    {
        jp: "4 JP",
        topic: "Sentripetal & berita belok",
        act: "Analisis kasus berita + kuis mini."
      }
    ]
  },


/* ---------- UNIT 7 ---------- */
{
    n: 7,
    el: 3,
    sem: 2,
    title: "Hukum Newton",
    emoji: "⚙️",
    desc: "Menganalisis hubungan gaya, massa, dan percepatan (Hukum I, II, III Newton) serta menerapkannya pada fenomena sehari-hari.",
    tp: [
{
        c: "F.7.1",
        t: "Menerapkan Hukum I & II Newton (inersia, F = m·a) untuk menjelaskan fenomena sehari-hari.",
        e: "Menghitung percepatan balok yang didorong gaya tertentu pada permukaan licin."
      },
    {
        c: "F.7.2",
        t: "Mengidentifikasi Hukum III (aksi–reaksi) dan menghitung resultan gaya searah/berlawanan.",
        e: "Menganalisis pasangan aksi–reaksi pada kasus nyata dan menghitung resultan dua gaya."
      }
    ],
    focus: [
      [ "Hukum I (inersia)", "Tanpa gaya bersih, benda diam tetap diam / bergerak lurus beraturan" ],
      [ "Hukum II", "a = F/m ; 1 N = 1 kg·m/s²" ],
      [ "Hukum III", "F aksi = − F reaksi (pasangan pada benda berbeda)" ]
    ],
    model: "Peti 4 kg didorong 20 N pada lantai licin: a = [[F/m = 20/4 = 5]] m/s². Saat mendorong dinding dengan tangan, dinding [[mendorong kembali]] tanganmu dengan gaya sama besar — itulah Hukum III. Saat bus rem mendadak, penumpang terdorong ke depan karena [[inersia (Hukum I)]] — tubuh 'ingat' kecepatan lamanya.",
    diag: [
{
        q: "Hukum Newton I menyatakan benda cenderung …",
        o: [ "menjaga keadaan geraknya (inersia)", "berhenti sendiri", "mempercepat sendiri", "berbalik arah" ],
        a: 0,
        w: "Inersia: tanpa gaya bersih, keadaan gerak tak berubah."
      },
    {
        q: "Rumus Hukum II Newton adalah …",
        o: [ "F = m·a", "F = m/a", "F = a/m", "a = F·m" ],
        a: 0,
        w: "a = F/m; F dalam newton."
      },
    {
        q: "Pasangan aksi–reaksi selalu …",
        o: [ "sama besar, arah berlawanan", "sama arah", "berbeda besar", "saling meniadakan" ],
        a: 0,
        w: "Hukum III: sama besar, berlawanan arah, pada benda berbeda."
      }
    ],
    form: [
{
        q: "Satuan gaya SI adalah …",
        o: [ "newton (N)", "joule", "watt", "pascal" ],
        a: 0,
        w: "Gaya dalam newton; 1 N mempercepat 1 kg sebesar 1 m/s²."
      },
    {
        q: "Jika massa diperbesar (F tetap), percepatan benda …",
        o: [ "berkurang", "bertambah", "tetap", "nol" ],
        a: 0,
        w: "a = F/m — berbanding terbalik dengan massa."
      },
    {
        q: "Contoh pasangan aksi–reaksi adalah …",
        o: [ "kaki menendang bola — bola mendorong kaki", "benda jatuh — benda berhenti", "lampu menyala — lampu mati", "sepeda bergerak — sepeda berhenti" ],
        a: 0,
        w: "Aksi pada bola, reaksi bola pada kaki — dua benda berbeda."
      },
    {
        num: true,
        q: "F = 40 N pada massa 8 kg (licin) → a = … m/s² (isi angka)",
        ans: 5,
        w: "40 ÷ 8 = 5 m/s²."
      },
    {
        num: true,
        q: "m = 5 kg, a = 3 m/s² → F = … N (isi angka)",
        ans: 15,
        w: "5 × 3 = 15 N."
      },
    {
        q: "Resultan gaya 5 N dan 3 N yang berlawanan arah adalah …",
        o: [ "8 N", "2 N", "15 N", "5 N" ],
        a: 1,
        w: "Berlawanan: dikurangkan → 5 − 3 = 2 N."
      }
    ],
    quiz: [
{
        q: "Resultan dua gaya 12 N dan 8 N yang searah adalah …",
        o: [ "20 N", "4 N", "10 N", "2 N" ],
        a: 0,
        w: "Searah → dijumlahkan: 20 N."
      },
    {
        q: "F = 100 N pada massa 20 kg (licin) → a = … m/s²",
        o: [ "5", "2000", "0,2", "500" ],
        a: 0,
        w: "100/20 = 5 m/s²."
      },
    {
        q: "Pensil diam di meja karena …",
        o: [ "resultan gaya padanya nol", "tidak dipengaruhi gaya sama sekali", "massanya sangat kecil", "gravitasinya nol" ],
        a: 0,
        w: "Hukum I: gaya berat seimbang dengan gaya normal meja."
      },
    {
        q: "Saat bus rem mendadak, penumpang terdorong ke …",
        o: [ "depan (inersia)", "belakang", "samping", "atas" ],
        a: 0,
        w: "Inersia menjaga gerak: tubuh cenderung melanjutkan kecepatan."
      },
    {
        q: "Dengan gaya sama, jika massa dibagi dua, percepatan menjadi …",
        o: [ "2× lebih besar", "½ lebih besar", "½ lebih kecil", "tetap" ],
        a: 0,
        w: "a terbalik proporsional terhadap massa."
      }
    ],
    task: "Tulis 4 kejadian sehari-hari (bus mengerem, bola dipukul, kotak didorong, kursi digeser). Tandai tiap kejadian dengan Hukum Newton mana yang bekerja dan alasannya.",
    disc: "Bisakah pasangan aksi–reaksi terjadi pada SATU benda saja? Jelaskan mengapa tidak (ingat: pasangan selalu pada dua benda berbeda).",
    proj: {
      title: "Teater Inersia",
      steps: [ "Rancang 3 skenario Hukum Newton (bus mengerem, pantulan bola, kotak berat).", "Rekam video pendek 2 menit / komik foto beruntun.", "Sertakan keterangan fisika (F, m, a, aksi–reaksi) di tiap adegan.", "Pemutaran + diskusi kelas." ],
      rub: [
        [ "Akurasi konsep", "40" ],
        [ "Kreativitas", "30" ],
        [ "Kejelasan pesan", "30" ]
      ]
    },
    refl: [ "Hukum Newton mana yang paling sulit dipahami dan mengapa?", "Kapan kamu menyadari inersia bekerja pada tubuhmu?", "Jika semua gaya hilang sesaat, apa yang terjadi pada benda di sekitarmu?" ],
    meet: [
{
        jp: "4 JP",
        topic: "Hukum I & inersia",
        act: "Studi kasus kendaraan + demo koin di kartu."
      },
    {
        jp: "4 JP",
        topic: "Hukum II: F = m·a",
        act: "Latihan problem berjenjang + kuis cepat."
      },
    {
        jp: "4 JP",
        topic: "Hukum III & proyek",
        act: "Teater inersia + presentasi skenario."
      }
    ]
  },


/* ---------- UNIT 8 ---------- */
{
    n: 8,
    el: 3,
    sem: 2,
    title: "Usaha, Energi & Daya",
    emoji: "💡",
    desc: "Menghitung usaha, energi kinetik/potensial, kekekalan energi mekanik, dan daya dalam kegiatan sehari-hari.",
    tp: [
{
        c: "F.8.1",
        t: "Menghitung usaha (W = F·s), energi kinetik (EK = ½mv²), dan energi potensial (EP = m·g·h).",
        e: "Menghitung usaha mengangkat beban dan EK pelari dengan massa dan kecepatan tertentu."
      },
    {
        c: "F.8.2",
        t: "Menerapkan prinsip kekekalan energi mekanik dan menghitung daya (P = W/t).",
        e: "Menentukan daya naik tangga dan menafsirkan perubahan EP menjadi EK."
      }
    ],
    focus: [
      [ "Usaha", "W = F·s (gaya & lintasan searah); satuan joule (J)" ],
      [ "EK & EP", "EK = ½mv² ; EP = m·g·h (g = 10 m/s² dalam soal)" ],
      [ "Kekekalan energi", "EP awal = EK akhir (tanpa gesekan); v = √(2gh)" ]
    ],
    model: "Batang bata 2 kg diangkat 1,5 m (g = 10): usaha = W = [[mgh = 2×10×1,5 = 30]] J yang juga tersimpan sebagai EP. Saat jatuh, EP berubah menjadi EK: di tanah [[EK = 30 J]] → v = [[√(2gh) ≈ 5,5]] m/s. Naik tangga 3 m selama 6 s dengan massa 60 kg (g = 10): daya = [[P = mgh/t = 60×10×3/6 = 300]] watt.",
    diag: [
{
        q: "Satuan usaha dan energi adalah …",
        o: [ "joule (J)", "newton (N)", "watt", "meter" ],
        a: 0,
        w: "Usaha & energi: joule."
      },
    {
        q: "Rumus energi kinetik adalah …",
        o: [ "½mv²", "mgh", "m·a", "F·s" ],
        a: 0,
        w: "EK = ½ × m × v²."
      },
    {
        q: "Daya adalah …",
        o: [ "usaha/waktu", "energi × waktu", "gaya × massa", "massa × jarak" ],
        a: 0,
        w: "P = W/t; satuan watt."
      }
    ],
    form: [
{
        q: "Mengangkat beban 2 kg setinggi 3 m (g = 10) → W = …",
        o: [ "6 J", "60 J", "600 J", "15 J" ],
        a: 1,
        w: "W = mgh = 2×10×3 = 60 J."
      },
    {
        q: "EP bernilai nol ketika benda berada di …",
        o: [ "titik acuan (mis. tanah)", "puncak lintasan", "saat kecepatan maksimum", "di seluruh titik" ],
        a: 0,
        w: "Acuan h = 0 → EP = 0 (konvensi)."
      },
    {
        q: "Energi kinetik meningkat ketika …",
        o: [ "kecepatan bertambah", "massa turun", "kecepatan nol", "tinggi naik" ],
        a: 0,
        w: "EK ∝ v² — kecepatan berdampak besar."
      },
    {
        num: true,
        q: "W = 300 J dikerjakan selama 15 s → P = … W (isi angka)",
        ans: 20,
        w: "P = 300/15 = 20 W."
      },
    {
        num: true,
        q: "Pelari m = 40 kg, v = 5 m/s → EK = ½×40×25 = … J (isi angka)",
        ans: 500,
        w: "½ × 40 × 25 = 500 J."
      },
    {
        q: "Prinsip kekekalan energi mekanik menyatakan …",
        o: [ "EP + EK tetap (tanpa gesekan)", "EK terus naik", "EP terus naik", "massa berubah" ],
        a: 0,
        w: "Σ EP + EK konstan kecuali ada gaya luar/hambatan."
      }
    ],
    quiz: [
{
        q: "Beban 15 kg diangkat 2 m (g = 10): W = … J",
        o: [ "30", "300", "3000", "7,5" ],
        a: 1,
        w: "mgh = 15×10×2 = 300 J."
      },
    {
        q: "EP bendun 10 kg pada tinggi 20 m (g = 10): EP = … J",
        o: [ "200", "2000", "20000", "2" ],
        a: 1,
        w: "10×10×20 = 2.000 J."
      },
    {
        q: "Naik tangga massa 50 kg, tinggi 3 m, waktu 6 s (g = 10): P = … watt",
        o: [ "15", "150", "250", "2500" ],
        a: 2,
        w: "P = mgh/t = 50×10×3/6 = 250 W."
      },
    {
        q: "Satuan daya adalah …",
        o: [ "watt", "joule", "newton", "sekon" ],
        a: 0,
        w: "P dalam watt; 1 W = 1 J/s."
      },
    {
        num: true,
        q: "Benda m = 4 kg, v = 10 m/s → EK = … J (isi angka)",
        ans: 200,
        w: "½ × 4 × 100 = 200 J."
      }
    ],
    task: "Ukur waktu naik 1 lantai (tinggi ≈ 3 m), catat massa (timbangan), selisih tipis waktu kembali → hitung dayamu. Bandingkan deskriptor dekat dengan teman.",
    disc: "Mengapa dua mesin yang kerjanya sama tetap bisa punya daya berbeda? Apa peran waktu dalam konsep daya?",
    proj: {
      title: "Komik Energi 4 Panel",
      steps: [ "Rancang kisah 4 panel (naik bukit, ayun galah, kelapa jatuh, sepeda).", "Tulis rumus & hitungan fisika di tiap panel.", "Warnai + label besaran dan satuan.", "Galeri kelas: penjelasan 2 panel favorit." ],
      rub: [
        [ "Ketepatan fisika", "40" ],
        [ "Narasi & visual", "30" ],
        [ "Penyampaian", "30" ]
      ]
    },
    refl: [ "Kegiatan apa yang paling banyak melakukan usaha menurut pengalamanmu?", "Apa yang terjadi pada energi saat benda berhenti di tanah (gesekan)?", "Bagaimana konsep daya membantumu memilih alat listrik di rumah?" ],
    meet: [
{
        jp: "4 JP",
        topic: "Usaha & energi",
        act: "Eksplorasi mengangkat barang di kelas + hitung."
      },
    {
        jp: "4 JP",
        topic: "EK–EP & kekekalan",
        act: "Demonstrasi bandul/bola miring + analisis."
      },
    {
        jp: "4 JP",
        topic: "Daya & proyek komik",
        act: "Praktik naik tangga + galeri komik."
      }
    ]
  },


/* ---------- UNIT 9 ---------- */
{
    n: 9,
    el: 3,
    sem: 2,
    title: "Momentum & Impuls",
    emoji: "🎾",
    desc: "Menganalisis momentum (p = m·v), impuls (I = F·Δt), dan kekekalan momentum pada tumbukan dan desain pengaman.",
    tp: [
{
        c: "F.9.1",
        t: "Menghitung momentum benda dan menerapkan kekekalan momentum pada tumbukan searah.",
        e: "Menghitung momentum sebelum dan sesudah dua benda bertumbukan."
      },
    {
        c: "F.9.2",
        t: "Menjelaskan impuls (I = F·Δt = Δp) dan mengaitkannya dengan desain pengaman (helm, airbag).",
        e: "Meneliti mengapa airbag memperpanjang waktu tumbukan untuk menurunkan gaya."
      }
    ],
    focus: [
      [ "Momentum", "p = m·v (kg·m/s) — vektor, mengikuti arah v" ],
      [ "Impuls", "I = F·Δt = Δp (perubahan momentum)" ],
      [ "Kekekalan momentum", "Σp sebelum = Σp sesudah (tanpa gaya luar)" ]
    ],
    model: "Bola A 2 kg bergerak 3 m/s menumbuk bola B diam 1 kg (keduanya menempel setelahnya): p awal = [[2×3 = 6]] kg·m/s. Kecepatan bersama: v' = [[p/(m total) = 6/3 = 2]] m/s. Saat tumbukan, perubahan momentum tetap; jika waktu kontak diperpanjang (bantalan, airbag), [[F = Δp/Δt menjadi lebih kecil]] — inilah alasan [[sabuk & bantalan menyelamatkan]].",
    diag: [
{
        q: "Momentum didefinisikan sebagai p = …",
        o: [ "m·v", "m/v", "½mv²", "m·a" ],
        a: 0,
        w: "p = m × v (vektor)."
      },
    {
        q: "Satuan momentum adalah …",
        o: [ "kg·m/s", "kg/s", "N", "J" ],
        a: 0,
        w: "massa × kecepatan = kg·m/s."
      },
    {
        q: "Impuls dipengaruhi oleh …",
        o: [ "gaya dan waktu kontak", "massa saja", "kecepatan saja", "arah balik" ],
        a: 0,
        w: "I = F × Δt = Δp."
      }
    ],
    form: [
{
        q: "Bola 3 kg melaju 2 m/s → p = … kg·m/s",
        o: [ "5", "6", "1,5", "0,67" ],
        a: 1,
        w: "3 × 2 = 6."
      },
    {
        q: "Momentum selalu berarah …",
        o: [ "searah kecepatan", "berlawanan kecepatan", "melengkung", "tanpa arah" ],
        a: 0,
        w: "p vektor — mengikuti arah v."
      },
    {
        q: "Memanjang waktu kontak dalam tumbukan bertujuan untuk …",
        o: [ "mengurangi gaya rata-rata", "mengurangi momentum", "membalik arah bola", "menghentikan bola" ],
        a: 0,
        w: "Δp tetap; F = Δp/Δt turun saat Δt naik."
      },
    {
        num: true,
        q: "Impuls gaya 5 N selama 3 s → I = … N·s (isi angka)",
        ans: 15,
        w: "5 × 3 = 15 N·s."
      },
    {
        q: "Pada tumbukan tanpa gaya luar, total momentum …",
        o: [ "kekal", "naik", "turun", "selalu nol" ],
        a: 0,
        w: "Σp konstan (kekekalan momentum)."
      },
    {
        num: true,
        q: "Bola bisbol 0,5 kg melaju 20 m/s → p = … kg·m/s (isi angka)",
        ans: 10,
        w: "0,5 × 20 = 10."
      }
    ],
    quiz: [
{
        q: "Truk 4.000 kg melaju 2 m/s: p = … kg·m/s",
        o: [ "2.000", "8.000", "4.000", "500" ],
        a: 1,
        w: "4.000 × 2 = 8.000."
      },
    {
        q: "Bola 2 kg, v 10 m/s berhenti dalam 0,2 s → gaya rata-rata tumbuk = …",
        o: [ "100 N", "50 N", "20 N", "4 N" ],
        a: 0,
        w: "I = Δp = 20 N·s; F = 20/0,2 = 100 N."
      },
    {
        q: "Bola A 2 kg v 5 m/s menembus Bola B diam 2 kg (menempel) → v' = … m/s",
        o: [ "2,5", "5", "10", "0" ],
        a: 0,
        w: "p = 10; m total = 4 → v' = 2,5."
      },
    {
        q: "Airbag membantu karena memperpanjang …",
        o: [ "waktu tumbukan", "massa kendaraan", "tidur sopir", "kecepatan tumbukan" ],
        a: 0,
        w: "F = Δp/Δt — Δt besar → F kecil."
      },
    {
        num: true,
        q: "Impuls 200 N·s pada m = 10 kg → kecepatan benda = … m/s (isi angka)",
        ans: 20,
        w: "Δv = I/m = 200/10 = 20 m/s."
      }
    ],
    task: "Kumpulkan 3 bukti foto/video penerapan impuls di kehidupan (helm, pelindung kolom jalan). Tulis penjelasan fisika I = FΔt di tiap bukti.",
    disc: "Bola karet memantul (Δv besar) vs kertas hancur (Δv kecil) saat jatuh — bagaimana impuls dikaitkan dengan perubahan arah/bentuk benda?",
    proj: {
      title: "Poster Desain Pengaman",
      steps: [ "Pilih 3 alat Keselamatan (helm, airbag, pelindung kolom).", "Modelkan fisika: Δp tetap, Δt panjang → F kecil (angka ilustratif).", "Gambar diagram panah + keterangan lab", "Paparan 3 menit antar kelompok." ],
      rub: [
        [ "Akurasi fisika", "40" ],
        [ "Visual & struktur", "30" ],
        [ "Kejelasan paparan", "30" ]
      ]
    },
    refl: [ "Apa yang 'kekal' dalam tumbukan — massa, kecepatan, atau momentum total?", "Kapan kamu perlu dua rumus impuls (F·Δt dan Δp) sekaligus?", "Alat keselamatan apa di lingkunganmu yang prinsip impulsnya paling keren?" ],
    meet: [
{
        jp: "4 JP",
        topic: "Momentum p = m·v",
        act: "Praktik problem + kuis cepat."
      },
    {
        jp: "4 JP",
        topic: "Impuls & alat keselamatan",
        act: "Analisis helm/airbag dengan 'kartu waktu'."
      },
    {
        jp: "4 JP",
        topic: "Kekekalan momentum",
        act: "Praktik bola & rangkaian + poster."
      }
    ]
  },


/* ---------- UNIT 10 ---------- */
{
    n: 10,
    el: 4,
    sem: 2,
    title: "Energi Alternatif",
    emoji: "☀️",
    desc: "Menganalisis pemanfaatan energi alternatif (surya, angin, air, biomassa) untuk mengatasi permasalahan ketersediaan energi.",
    tp: [
{
        c: "F.10.1",
        t: "Mengidentifikasi sumber energi terbarukan dan membandingkan karakteristiknya.",
        e: "Menyusun tabel kelebihan–keterbatasan tiap jenis energi alternatif di Indonesia."
      },
    {
        c: "F.10.2",
        t: "Menganalisis pemanfaatan energi alternatif untuk masalah energi (lampu taman, pemanasan air).",
        e: "Merancang konsep panel surya mini untuk kebutuhan lampu kantin sekolah."
      }
    ],
    focus: [
      [ "Energi terbarukan", "Surya, angin, air, biomassa, panas bumi" ],
      [ "Hitungan energi", "E = P × t ; 1 kWh = 1000 Wh = 3.600.000 J" ],
      [ "Kelebihan & tantangan", "Bersih & tidak habis; tergantung cuaca + perlu penyimpanan" ]
    ],
    model: "Panel surya 100 W dengan cahaya efektif 5 jam/hari: energi = [[P × t = 100 × 5 = 500]] Wh = [[0,5 kWh]] per hari. Lampu taman 10 W bisa menyala [[500 ÷ 10 = 50]] jam dari cadangan itu. Tantangan utama: malam dan cuaca mendung → sistem perlu [[penyimpanan (baterai)]] agar catu listrik tetap tersedia.",
    diag: [
{
        q: "Yang merupakan energi terbarukan adalah …",
        o: [ "angin", "batu bara", "minyak bumi", "gas alam" ],
        a: 0,
        w: "Angin diperbarui terus oleh alam; fosil tidak."
      },
    {
        q: "Panel surya mengubah …",
        o: [ "radiasi matahari menjadi listrik", "panas menjadi angin", "air menjadi CO₂", "kayu menjadi asap" ],
        a: 0,
        w: "Fotovoltaik: cahaya → listrik."
      },
    {
        q: "Keterbatasan utama energi surya/angin adalah …",
        o: [ "tergantung cuaca", "emisi CO₂ tinggi", "cadangan cepat habis", "berbahaya radioaktif" ],
        a: 0,
        w: "Intensitas bervariasi → perlu cadangan."
      }
    ],
    form: [
{
        q: "Turbin angin mengubah …",
        o: [ "energi kinetik angin menjadi listrik", "panas menjadi kimia", "masa menjadi energi", "udara menjadi cahaya" ],
        a: 0,
        w: "Angin memutar baling-baling → generator."
      },
    {
        q: "Contoh biomassa adalah …",
        o: [ "kayu, jerami, kotoran ternak", "gas alam", "baterai", "parafin" ],
        a: 0,
        w: "Biomassa = bahan organik yang dibakar/difermentasi."
      },
    {
        num: true,
        q: "Panel 200 W menyala 4 jam → energi = P × t = … Wh (isi angka)",
        ans: 800,
        w: "200 × 4 = 800 Wh = 0,8 kWh."
      },
    {
        q: "Masalah utama pembangkit termal berbahan bakar batu bara adalah …",
        o: [ "emisi CO₂ yang tinggi", "terlalu murah", "tidak pernah bekerja", "menyimpan mineral" ],
        a: 0,
        w: "Batu bara menghasilkan emisi karbon besar."
      },
    {
        q: "Untuk kebutuhan malam hujan berhari-hari, sistem surya membutuhkan …",
        o: [ "cadangan baterai", "panas ekstra", "listrik dari matahari malam", "catu listrik mati" ],
        a: 0,
        w: "Tanpa matahari: sistem bergantung pada baterai cadangan."
      },
    {
        q: "Sumber energi panas bumi di Indonesia banyak terdapat di daerah …",
        o: [ "sekitar gunung api", "tepi pantai dalam", "kutub utara", "area perkotaan" ],
        a: 0,
        w: "Indonesia berada di jalur cincin api — panas bumi melimpah."
      }
    ],
    quiz: [
{
        q: "Panel surya 50 W bekerja 6 jam → energi = … Wh",
        o: [ "300", "30", "500", "3000" ],
        a: 0,
        w: "50 × 6 = 300 Wh = 0,3 kWh."
      },
    {
        q: "Panel surya mengubah energi …",
        o: [ "cahaya matahari", "angin", "air", "biomassa" ],
        a: 0,
        w: "Fotovoltaik: cahaya → listrik."
      },
    {
        q: "Pembangkit hidro memanfaatkan …",
        o: [ "aliran air memutar turbin", "angin", "gas alam", "panas bumi" ],
        a: 0,
        w: "Aliran air memutar turbin — energi kinetik/potensial air."
      },
    {
        q: "Yang termasuk sumber energi TAK terbarukan adalah …",
        o: [ "batu bara", "angin", "cahaya matahari", "aliran air" ],
        a: 0,
        w: "Batu bara sumbernya terbatas — terbarukan = tidak."
      },
    {
        num: true,
        q: "Kebutuhan 4 kWh/hari dan panel 100 W × 5 jam cahaya: panel yang dibutuhkan = 4.000 / 500 = … panel (isi angka)",
        ans: 8,
        w: "1 panel menghasilkan 500 Wh/hari → 4.000/500 = 8."
      }
    ],
    task: "Susun rencana 'sistem surya mini' untuk lampu senter atau charger HP: tentukan daya, jam penggunaan, lalu hitung total Wh — tulis langkah-langkahnnya.",
    disc: "Manakah faktor paling dominan yang memperlambat pergantian batu bara menjadi energi terbarukan: biaya, teknologi, atau kebiasaan? Beri alasan.",
    proj: {
      title: "Konsep Kampung Surya",
      steps: [ "Rancang 5 rumah dengan panel surya + baterai.", "Hitung kebutuhan harian (lampu, charger, kipas).", "Hitung jumlah panel & kapasitas baterai kasar.", "Gambar denah + presentasi rute catu daya." ],
      rub: [
        [ "Ketepatan perhitungan", "40" ],
        [ "Desain & kelayakan", "30" ],
        [ "Kolaborasi tim", "30" ]
      ]
    },
    refl: [ "Jenis energi alternatif mana yang paling cocok di daerahmu? Mengapa?", "Bagaimana peran pelajar dalam mendukung penghematan energi?", "Apakah biaya panel surya setimpal dengan hasil jangka panjang? Sudut pandangmu?" ],
    meet: [
{
        jp: "4 JP",
        topic: "Peta energi terbarukan",
        act: "Peta potensi energi Indonesia + cakupan lokal."
      },
    {
        jp: "4 JP",
        topic: "Perhitungan energi E = P·t",
        act: "Praktik problem kWh dan perhitungan murid."
      },
    {
        jp: "4 JP",
        topic: "Proyek kampung surya",
        act: "Presentasi konsep + saran panel."
      }
    ]
  },


/* ---------- UNIT 11 ---------- */
{
    n: 11,
    el: 4,
    sem: 2,
    title: "Perubahan Iklim & Mitigasi",
    emoji: "🌍",
    desc: "Menganalisis penyebab dan dampak perubahan iklim (efek rumah kaca, GRK) serta mengusulkan strategi mitigasi dan adaptasi.",
    tp: [
{
        c: "F.11.1",
        t: "Menjelaskan mekanisme efek rumah kaca dan mengidentifikasi gas rumah kaca (GRK) utama.",
        e: "Menganalisis grafik suhu global dan CO₂; menyebutkan sumber GRK dari aktivitas manusia."
      },
    {
        c: "F.11.2",
        t: "Menganalisis dampak perubahan iklim dan mengusulkan strategi mitigasi/adaptasi di tingkat lokal.",
        e: "Menyusun laporan mitigasi kecil untuk sekolah/rumah (hemat listrik, transportasi, sampah)."
      }
    ],
    focus: [
      [ "Efek rumah kaca", "GRK (CO₂, CH₄) memerangkap radiasi inframerah → suhu naik" ],
      [ "Sumber emisi", "Pembakaran bahan bakar, deforestasi, industri & transportasi" ],
      [ "Mitigasi vs Adaptasi", "Mitigasi: menekan penyebab; adaptasi: menyesuaikan dampak" ]
    ],
    model: "Efek rumah kaca: GRK seperti CO₂ dan CH₄ menangkap [[radiasi inframerah]] dari permukaan bumi → panas tak lolos keluar. Akibat pembakaran fosil dan deforestasi, konsentrasi CO₂ naik → [[pemanasan global]] (suhu global naik ≈ 1,1 °C sejak era pra-industri). Mitigasi di kelas: [[hemat listrik + transportasi massal + kurangi pembakaran]] — adaptasi: [[siaga banjir, mangrove, jadwal panen]].",
    diag: [
{
        q: "Gas rumah kaca yang paling banyak dihasilkan manusia adalah …",
        o: [ "CO₂", "O₂", "N₂", "Ar" ],
        a: 0,
        w: "CO₂ dari pembakaran fosil & deforestasi."
      },
    {
        q: "Efek rumah kaca membuat …",
        o: [ "panas terjebak di atmosfer", "suhu turun terus", "seluruh panas loloskeluar", "atmosfer hilang" ],
        a: 0,
        w: "GRK memerangkap radiasi inframerah."
      },
    {
        q: "Adaptasi terhadap perubahan iklim berarti …",
        o: [ "menyesuaikan diri dengan dampak", "mengurangi emisi langsung", "memomonopoli listrik", "membaca berita saja" ],
        a: 0,
        w: "Mitigasi menekan penyebab; adaptasi menyesuaikan dampak."
      }
    ],
    form: [
{
        q: "Contoh aktivitas yang menghasilkan CO₂ adalah …",
        o: [ "pembakaran bensin", "fotosintesis", "penguapan air", "magnet stok" ],
        a: 0,
        w: "Pembakaran fosil melepas CO₂."
      },
    {
        q: "Dampak nyata perubahan iklim saat ini adalah …",
        o: [ "kutub mencair & cuaca ekstrem", "suhu laut konstan", "hujan selalu seimbang", "musim tetap di semestanya" ],
        a: 0,
        w: "Mencairnya es kutub, banjir, kekeringan, badai."
      },
    {
        q: "Contoh mitigasi di sekolah adalah …",
        o: [ "matikan lampu & AC saat keluar", "ganti lampu berwatt besar", "menambah konsumsi plastik", "biarkan tanpa tindakan" ],
        a: 0,
        w: "Hemat listrik menurunkan emisi tak langsung."
      },
    {
        q: "Utama metana (CH₄) banyak berasal dari …",
        o: [ "peternakan & sawah", "tanah liat", "permukaan laut", "pabrik besi" ],
        a: 0,
        w: "Metana dari pencernaan ternak dan sawah berpengaruh besar."
      },
    {
        num: true,
        q: "Satu sepeda mengurangi 0,4 kg CO₂ per hari; selama 30 hari total = 0,4 × 30 = … kg (isi angka)",
        ans: 12,
        w: "0,4 × 30 = 12 kg CO₂."
      },
    {
        q: "Fenomena 'kota panas' (urban heat island) disebabkan oleh …",
        o: [ "beton & aspal menyerap panas", "tanah basah", "kutub salju", "bintang jauh" ],
        a: 0,
        w: "Permukaan beton + minimnya tanaman hijau."
      }
    ],
    quiz: [
{
        q: "GRK yang paling berpengaruh pada pemanasan global dari fosil adalah …",
        o: [ "CO₂", "O₂", "N₂", "H₂" ],
        a: 0,
        w: "CO₂ utama — banyak dan hidup lama."
      },
    {
        q: "Deforestasi mempercepat pemanasan karena …",
        o: [ "tumbuhan menyerap CO₂ mengurang", "pohon memancarkan CO₂ sendiri", "kayu memantulkan cahaya", "semua salah" ],
        a: 0,
        w: "Pohon menyerap CO₂; ditebang → serapan turun."
      },
    {
        q: "Contoh mitigasi yang tepat adalah …",
        o: [ "hemat listrik & transportasi massal", "menaikkan emisi industri", "membakar hutan", "lebih banyak mobil pribadi" ],
        a: 0,
        w: "Mitigasi menekan penyebab emisi."
      },
    {
        q: "Dampak langsung pencairan es kutub adalah …",
        o: [ "naiknya permukaan laut", "turunnya permukaan laut", "matahari lebih terang", "semua ikan bertambah" ],
        a: 0,
        w: "Es mencair → volume laut naik → banjir pesisir."
      },
    {
        q: "Perbedaan utama mitigasi–adaptasi adalah …",
        o: [ "mitigasi utk sebab, adaptasi utk dampak", "kedua sama saja", "hanya di kota", "hanya nelayan" ],
        a: 0,
        w: "Mitigasi mencegah; adaptasi menyesuaikan."
      }
    ],
    task: "Lakukan 'audit listrik' rumah: daftar alat + daya (watt) + jam pakai → hitung kWh/hari, lalu usulkan cara menghemat 20%.",
    disc: "Banyak berita & iklan mengklaim 'produk hijau'. Bagaimana sikap berpikir kritis terhadap klaim dan grafik iklim yang kamu lihat di media?",
    proj: {
      title: "Kampanye Iklim Kelas",
      steps: [ "Kumpulkan data pemakaian listrik/sampah kelas satu minggu.", "Rancang kampanye poster/video 3 pesan hemat.", "Tetapkan target penghematan (mis. 10–20%).", "Uji selama 2 minggu, bandingkan data sebelum–sesudah." ],
      rub: [
        [ "Ketepatan data & hitung", "40" ],
        [ "Kreativitas kampanye", "30" ],
        [ "Efek perubahan perilaku", "30" ]
      ]
    },
    refl: [ "Dampak perubahan iklim mana yang paling dekat dengan kehidupanmu (banjir, panas, badai)?", "Apa yang mendorongmu terlibat menjaga iklim?", "Satu komitmen pribadi dari hari ini: apa?" ],
    meet: [
{
        jp: "4 JP",
        topic: "Mekanisme efek rumah kaca",
        act: "Demo efek rumah kaca sederhana (botol + lampu belajar) + diskusi."
      },
    {
        jp: "4 JP",
        topic: "Data iklim & emisi",
        act: "Membaca grafik CO₂ + laporan sederhana."
      },
    {
        jp: "4 JP",
        topic: "Proyek kampanye",
        act: "Rencana kampanye + evaluasi mingguan."
      }
    ]
  },


/* ---------- UNIT 12 ---------- */
{
    n: 12,
    el: 4,
    sem: 2,
    title: "Proyek Teknologi Energi Lestari",
    emoji: "🏆",
    desc: "Proyek terpadu: merancang alat sederhana berbasis energi alternatif (lampu surya mini, kincir angin) dengan menggabungkan seluruh konsep fisika.",
    tp: [
{
        c: "F.12.1",
        t: "Merancang dan membangun alat sederhana berbasis energi alternatif (lampu surya mini/kincir angin).",
        e: "Prototipe lampu surya mini atau kincir angin mini yang berfungsi."
      },
    {
        c: "F.12.2",
        t: "Mempresentasikan proyek dan merefleksikan proses perancangan berbasis fisika.",
        e: "Presentasi 5 menit + demo + refleksi kelompok."
      }
    ],
    focus: [
      [ "Desain berkelanjutan", "Bahan lokal, biaya rendah, hasil terukur" ],
      [ "Fisika dalam proyek", "E = P×t, EP↔EK, konversi energi" ],
      [ "Laporan & presentasi", "Skema, data uji, refleksi tim" ]
    ],
    model: "Rencana lampu 5 W menyala 3 jam tiap malam: energi = [[5 × 3 = 15]] Wh/hari → [[15 × 30 = 450]] Wh/bulan. Panel 20 W dengan 4 jam cahaya menghasilkan [[80 Wh/hari]] — cukup dengan cadangan baterai kecil. Proyek kecil ini [[menghubungkan pengukuran, gerak, energi, dan iklim]] — seluruh elemen Fisika kelas X bekerja bersama.",
    diag: [
{
        q: "Langkah pertama proyek teknik adalah …",
        o: [ "mendifinisikan masalah & kebutuhan", "langsung membeli bahan", "video dulu", "menyusun presentasi" ],
        a: 0,
        w: "Definisi masalah → rancang → uji → presentasi."
      },
    {
        q: "Kriteria proyek yang baik adalah …",
        o: [ "terukur, murah, aman", "mahal & rumit", "sulit dipahami guru", "tanpa target" ],
        a: 0,
        w: "Desain harus terukur dan layak (feasible)."
      },
    {
        q: "Keberhasilan proyek dievaluasi dengan membandingkan …",
        o: [ "target vs hasil uji", "banyak halaman laporan", "jumlah fitur", "jumlah bahasa" ],
        a: 0,
        w: "Target vs hasil uji — data, bukan opini."
      }
    ],
    form: [
{
        q: "Panel surya mengubah energi …",
        o: [ "cahaya ke listrik", "listrik ke cahaya", "panas ke jarak", "udara ke air" ],
        a: 0,
        w: "Fotovoltaik."
      },
    {
        q: "Satuan energi listrik pada tagihan rumah adalah …",
        o: [ "kWh", "N", "Hz", "m²" ],
        a: 0,
        w: "kWh = 1000 Wh."
      },
    {
        num: true,
        q: "Lampu 10 W menyala 5 jam → energi = … Wh (isi angka)",
        ans: 50,
        w: "10 × 5 = 50 Wh."
      },
    {
        q: "Fungsi baterai dalam sistem surya adalah …",
        o: [ "menyimpan listrik untuk malam hari", "membuat listrik tanpa panel", "mengurangi listrik", "menyalakan tanpa panel" ],
        a: 0,
        w: "Simpan–lepas energi kimia → listrik."
      },
    {
        num: true,
        q: "Prototype menyala 4 dari 5 percobaan uji → persentase keberhasilan = …%",
        ans: 80,
        w: "4/5 × 100 = 80%."
      },
    {
        q: "Refleksi proyek menilai …",
        o: [ "proses, hasil, dan tanggung jawab tim", "nilai rapor", "kecepatan mengetik", "banyaknya tema" ],
        a: 0,
        w: "Proses + hasil + kerja tim."
      }
    ],
    quiz: [
{
        q: "Material utama sel surya (panel) adalah …",
        o: [ "silikon", "plastik", "tumbuhan", "kayu" ],
        a: 0,
        w: "Sel fotovoltaik berbahan dasar silikon."
      },
    {
        num: true,
        q: "Kincir 30 W bekerja 6 jam → energi = P × t = … Wh (isi angka)",
        ans: 180,
        w: "30 × 6 = 180 Wh."
      },
    {
        q: "Alat untuk mengukur arus listrik adalah …",
        o: [ "amperemeter", "termometer", "barometer", "higrometer" ],
        a: 0,
        w: "Amperemeter mengukur arus (ampere)."
      },
    {
        q: "Alat untuk mengukur tegangan panel surya adalah …",
        o: [ "voltmeter", "termometer", "barometer", "timer jam dinding" ],
        a: 0,
        w: "Voltmeter mengukur tegangan (volt)."
      },
    {
        num: true,
        q: "Panel 25 W dengan 4 jam cahaya → energi harian = … Wh (isi angka)",
        ans: 100,
        w: "25 × 4 = 100 Wh."
      }
    ],
    task: "Susun logbook proyek: tanggal, langkah, hasil, kendala, rencana. Isi minimal 5 entri dalam 2 minggu produksi prototipe.",
    disc: "Alat energi mana yang paling layak diimplementasikan di lingkungan sekolah? Susun rencana singkat implementasinya.",
    proj: {
      title: "Prototipe Energi Lestari (Proyek Besar)",
      steps: [ "Bentuk kelompok 3–5 orang; pilih alat (lampu surya mini, kincir angin, bank baterai kecil).", "Daftar bahan + estimasi biaya dengan bahan lokal yang murah.", "Bangun + uji prototype, catat skema & data uji.", "Presentasi demo + refleksi kelompok." ],
      rub: [
        [ "Fungsional & aman", "40" ],
        [ "Fisika & data", "30" ],
        [ "Presentasi", "30" ]
      ]
    },
    refl: [ "Kendala terbesar dan bagaimana kelompokmu mengatasinya?", "Konsep fisika mana yang paling berguna dalam proyek ini?", "Jika prototype dipasang nyata di sekolah/rumah, apa yang perlu disiapkan?" ],
    meet: [
{
        jp: "4 JP",
        topic: "Perencanaan & rancangan",
        act: "WBS + daftar bahan + hipotesis uji."
      },
    {
        jp: "4 JP",
        topic: "Bangun & uji",
        act: "Workshop iterasi + catat data uji."
      },
    {
        jp: "4 JP",
        topic: "Presentasi proyek",
        act: "Demo + refleksi + kuis unit terakhir."
      }
    ]
  }

],

/* ================= BANK ASESMEN SUMATIF ================= */
EXAM : {
  uts: {
    title: "UTS — Semester Ganjil",
    min: 60,
    time: 45,
    desc: "10 soal campuran Unit 1–6 (Pengukuran & Gerak).",
    q: [
{
        q: "Satuan SI untuk waktu adalah …",
        o: [ "sekon", "menit", "jam", "hari" ],
        a: 0,
        w: "Waktu: sekon (s)."
      },
    {
        q: "Yang termasuk besaran turunan adalah …",
        o: [ "kecepatan", "massa", "panjang", "suhu" ],
        a: 0,
        w: "Kecepatan = panjang/waktu → turunan."
      },
    {
        q: "12 km = … m",
        o: [ "1.200", "12.000", "0,012", "120" ],
        a: 1,
        w: "× 1000 → 12.000 m."
      },
    {
        q: "0,5 m = … cm",
        o: [ "0,005", "5", "50", "500" ],
        a: 2,
        w: "× 100 → 50 cm."
      },
    {
        q: "Alat paling tepat mengukur diameter telur adalah …",
        o: [ "jangka sorong", "mistar", "gelas ukur", "termometer" ],
        a: 0,
        w: "Ketelitian 0,1 mm — cocok untuk diameter."
      },
    {
        q: "Ketidakpastian alat (NAB) berasal dari …",
        o: [ "½ × skala terkecil", "1 × skala terkecil", "2 × skala terkecil", "skala terbesar" ],
        a: 0,
        w: "NAB = ½ skala terkecil."
      },
    {
        q: "v = 20 m/s selama t = 5 s → s = … m",
        o: [ "4", "100", "25", "200" ],
        a: 1,
        w: "s = v·t = 100 m."
      },
    {
        q: "Mobil v₀ = 0, a = 2 m/s², t = 4 s → v = … m/s",
        o: [ "6", "8", "16", "32" ],
        a: 1,
        w: "v = 0 + 2×4 = 8 m/s."
      },
    {
        q: "Benda jatuh bebas (g = 10 m/s²) setelah 3 s → v = … m/s",
        o: [ "30", "10", "20", "90" ],
        a: 0,
        w: "v = g·t = 30 m/s."
      },
    {
        q: "Pada lempar parabola, komponen yang tetap konstan adalah …",
        o: [ "vx (horizontal)", "vy (vertikal)", "keduanya", "waktu" ],
        a: 0,
        w: "Tanpa gaya mendatar → vx konstan."
      }
    ]
  },
  uas: {
    title: "UAS — Semester Genap",
    min: 60,
    time: 45,
    desc: "10 soal campuran Unit 7–12 (Dinamika, Energi & Iklim).",
    q: [
{
        q: "Bus mengerem dan penumpang terdorong ke depan — fenomena Hukum Newton I (…)",
        o: [ "inersia", "akselerasi", "aksi–reaksi", "gravitasi" ],
        a: 0,
        w: "Hukum I = inersia."
      },
    {
        q: "Resultan gaya 12 N dan 8 N yang searah adalah …",
        o: [ "20 N", "4 N", "10 N", "2 N" ],
        a: 0,
        w: "Searah → 12 + 8 = 20 N."
      },
    {
        q: "m = 4 kg, a = 2 m/s² → F = … N",
        o: [ "2", "8", "6", "16" ],
        a: 1,
        w: "F = m·a = 8 N."
      },
    {
        q: "Gaya 15 N memindahkan beban 10 m searah → W = … J",
        o: [ "150", "1,5", "25", "600" ],
        a: 0,
        w: "W = F·s = 150 J."
      },
    {
        q: "EK benda m = 3 kg dengan v = 4 m/s adalah …",
        o: [ "24 J", "12 J", "48 J", "6 J" ],
        a: 0,
        w: "½ × 3 × 16 = 24 J."
      },
    {
        q: "W = 60 J dikerjakan dalam 10 s → P = …",
        o: [ "6 W", "600 W", "0,6 W", "50 W" ],
        a: 0,
        w: "P = 60/10 = 6 W."
      },
    {
        q: "m = 2 kg dan v = 5 m/s → p = …",
        o: [ "10 kg·m/s", "2,5 kg·m/s", "7 kg·m/s", "0,4 kg·m/s" ],
        a: 0,
        w: "p = m·v = 10 kg·m/s."
      },
    {
        q: "Yang BUKAN energi alternatif adalah …",
        o: [ "batu bara", "angin", "surya", "air" ],
        a: 0,
        w: "Batu bara fosil — tidak terbarukan."
      },
    {
        q: "Gas utama penyebab pemanasan global adalah …",
        o: [ "CO₂", "O₂", "N₂", "Ar" ],
        a: 0,
        w: "CO₂ dari fosil & deforestasi."
      },
    {
        q: "Contoh mitigasi perubahan iklim yang tepat adalah …",
        o: [ "hemat listrik & transportasi massal", "menaikkan emisi industri", "membakar hutan", "lebih banyak mobil pribadi" ],
        a: 0,
        w: "Mitigasi menekan penyebab emisi."
      }
    ]
  },
  rem: [
{
      q: "Pasangan besaran pokok yang benar adalah …",
      o: [ "massa & panjang", "kecepatan & waktu", "gaya & massa", "energi & suhu" ],
      a: 0,
      w: "Massa & panjang = besaran pokok SI."
    },
  {
      q: "1 jam = … sekon",
      o: [ "3600", "360", "60", "600" ],
      a: 0,
      w: "60 × 60 = 3600 s."
    },
  {
      q: "72 km/jam = … m/s",
      o: [ "20", "72", "36", "7,2" ],
      a: 0,
      w: "72 ÷ 3,6 = 20 m/s."
    },
  {
      q: "Menempuh 60 m dalam 12 s → kelajuan rata-rata = …",
      o: [ "5 m/s", "0,2 m/s", "72 m/s", "720 m/s" ],
      a: 0,
      w: "60/12 = 5 m/s."
    },
  {
      q: "s = ½·a·t² dengan a = 3 m/s², t = 2 s → s = …",
      o: [ "6 m", "12 m", "3 m", "24 m" ],
      a: 0,
      w: "½ × 3 × 4 = 6 m."
    },
  {
      q: "m = 4 kg, F = 20 N → a = …",
      o: [ "5 m/s²", "80 m/s²", "0,2 m/s²", "16 m/s²" ],
      a: 0,
      w: "a = 20/4 = 5 m/s²."
    },
  {
      q: "m = 5 kg di ketinggian 4 m (g = 10) → EP = …",
      o: [ "200 J", "20 J", "40 J", "100 J" ],
      a: 0,
      w: "EP = mgh = 5×10×4 = 200 J."
    },
  {
      q: "Panel surya mengubah … menjadi listrik",
      o: [ "radiasi matahari", "angin", "air", "batu bara" ],
      a: 0,
      w: "Fotovoltaik: cahaya → listrik."
    }
  ]
},

/* ================= LAB (tipe 'sim' — engine assets/lms.js) ================= */
LABS : [
  { id:"labukur", name:"Lab Pengukuran", emoji:"📐", el:1, type:"sim",
    desc:"Mistar interaktif: baca posisi objek acak pada skala 0–30 cm (ketelitian mm), lalu kerjakan kuis konversi & NAB yang berganti terus.",
    hint:"Tuliskan pembacaan dalam cm, satu angka di belakang koma (mis. 13,6). Tekan 'Objek acak' untuk pengukuran baru.",
    quiz:[
      { q:"45 mm = … cm", o:["4,5","0,45","45","450"], a:0, w:"mm → cm: bagi 10 → 4,5 cm." },
      { q:"1,2 m = … cm", o:["120","12","1.200","0,012"], a:0, w:"m → cm: × 100 → 120 cm." },
      { q:"54 km/jam = … m/s", o:["15","54","5,4","150"], a:0, w:"km/jam → m/s: bagi 3,6 → 15 m/s." },
      { q:"NAB dari skala terkecil 0,5", o:["0,25","0,5","1","0,1"], a:0, w:"NAB = ½ × skala terkecil = 0,25." },
      { num:true, q:"2,5 m = … cm (isi angka)", ans:250, w:"× 100 = 250 cm." } ] },
  { id:"labgerak", name:"Lab Gerak", emoji:"🏃", el:2, type:"sim",
    desc:"Simulasi GLB–GLBB: geser v₀, a, t dan lihat grafik x–t & v–t berubah serta posisi bola bergerak — plus kuis hitung kecepatan akhir.",
    hint:"Perhatikan: kemiringan grafik v–t = percepatan. Coba preset GLB, Dipercepat, Diperlambat, dan Jatuh Bebas.",
    quiz:[
      { q:"72 km/jam = … m/s", o:["20","72","7,2","36"], a:0, w:"bagi 3,6 → 20 m/s." },
      { num:true, q:"v₀ = 4 m/s, a = 2 m/s², t = 3 s → v akhir = … m/s (isi angka)", ans:10, w:"v = v₀ + a·t = 4 + 6 = 10 m/s." },
      { q:"Grafik v–t berbentuk garis miring menunjukkan gerak …", o:["GLBB","GLB","diam","melintir"], a:0, w:"v berubah beraturan = GLBB; kemiringan garis = a." },
      { num:true, q:"Bola jatuh bebas (v₀ = 0): v setelah t = 2 s = … m/s (isi angka, g = 10)", ans:20, w:"v = g·t = 10 × 2 = 20 m/s." },
      { q:"Pada GLB, kemiringan grafik x–t sama dengan …", o:["kecepatan","percepatan","energi","massa"], a:0, w:"garis x–t lurus miring → s = v·t, kemiringan = v." } ] },
  { id:"labenergi", name:"Lab Energi", emoji:"💡", el:3, type:"sim",
    desc:"Kotak EK–EP: geser massa & tinggi, lihat bar energi potensial/kinetik/total berubah; pilih preset g (Bumi, Bulan, Mars) dan amati efeknya.",
    hint:"Bandingkan g Bumi 10, Bulan 1,6, Mars 3,7 — EP berubah besar padahal m & h sama.",
    quiz:[
      { q:"Satuan energi dalam SI adalah …", o:["joule","watt","newton","kelvin"], a:0, w:"Energi = joule (J); daya = watt." },
      { num:true, q:"Benda 2 kg pada tinggi 5 m (g = 10) → EP = … J (isi angka)", ans:100, w:"EP = m·g·h = 2 × 10 × 5 = 100 J." },
      { num:true, q:"Benda jatuh dari h = 20 m (g = 10): v saat menyentuh tanah = … m/s (isi angka)", ans:20, w:"v = √(2gh) = √400 = 20 m/s." },
      { q:"Tanpa gesekan, EP di ketinggian berubah menjadi … saat di tanah", o:["EK dengan besaran sama","nol","dua kali EP","tidak ada angkanya"], a:0, w:"kekekalan energi: EP → EK penuh." },
      { num:true, q:"Benda 4 kg bergerak v = 10 m/s → EK = … J (isi angka)", ans:200, w:"EK = ½·m·v² = ½ × 4 × 100 = 200 J." } ] }
],

/* ================= E-BOOK ================= */
EBOOKS : [
  {
    id: "eb1",
    title: "Rumus Wajib Fisika X",
    emoji: "📘",
    pages: [
{
        h: "Satuan & Pengukuran",
        t: "7 besaran pokok SI: m, kg, s, A, K, mol, cd\n\nNAB = ½ × skala terkecil\nPengukuran berulang:\n• Rerata = Σx / n\n• NAB = ½ × (maks − min)\n\nKonversi kilat:\n• km/jam → m/s : ÷ 3,6\n• 1 jam = 3600 s ; 1 kWh = 3,6 × 10⁶ J"
      },
    {
        h: "GLB, GLBB & Jatuh Bebas",
        t: "GLB (v konstan): s = v·t\n\nGLBB (a konstan):\n• v = v₀ + a·t\n• s = v₀·t + ½·a·t²\n• v² = v₀² + 2·a·s\n\nJatuh bebas (v₀ = 0, a = g = 10 m/s²):\n• v = g·t   • h = ½·g·t²\n• v di tanah = √(2gh)"
      },
    {
        h: "Parabola & Lingkaran",
        t: "Parabola:\n• vx = v·cos α (TETAP)\n• vy = v·sin α (berubah oleh g)\n• h maks = vy²/(2g)\n• t terbang = 2·vy/g\n• jarak = vx × t terbang\n\nLingkaran:\n• T = 1/f ; ω = 2π/T\n• v = ω·r ; a sentripetal = v²/r (ke pusat)"
      },
    {
        h: "Dinamika, Energi, Momentum",
        t: "Hukum Newton:\n• I: inersia (v tetap tanpa gaya bersih)\n• II: F = m·a (1 N = 1 kg·m/s²)\n• III: F aksi = − F reaksi\n\nEnergi:\n• W = F·s ; EK = ½mv² ; EP = m·g·h ; P = W/t\n\nMomentum & Impuls:\n• p = m·v ; I = F·Δt = Δp\n• Tumbukan tanpa gaya luar → Σp kekal"
      }
    ]
  },
  {
    id: "eb2",
    title: "Energi & Iklim Lestari",
    emoji: "🌍",
    pages: [
{
        h: "Energi Alternatif",
        t: "Terbarukan: surya, angin, air, biomassa, panas bumi\n\nHitungan energi:\n• E = P × t (Wh = W × jam)\n• 1 kWh = 1000 Wh\n\nTantangan:\n• Bergantung cuaca/lokasi\n• Perlu penyimpanan (baterai)\n• Biaya awal tinggi"
      },
    {
        h: "Iklim & Gas Rumah Kaca",
        t: "Efek rumah kaca:\nGRK (CO₂, CH₄, N₂O) memerangkap radiasi inframerah → suhu global naik.\n\nSumber utama CO₂:\n• Pembakaran fosil\n• Deforestasi\n• Industri & transport\n\nMitigasi: menekan emisi (hemat energi, transport massal).\nAdaptasi: menyesuaikan diri (siaga banjir, mangrove)."
      },
    {
        h: "Hitungan Rumah Tangga",
        t: "Konsumsi listrik:\nkWh = P(W) × jam ÷ 1000\nLampu 10 W × 5 jam = 50 Wh/hari ≈ 1,5 kWh/bulan\n\nJejak karbon harian:\n• Motor: ± rendah–sedang per km\n• Sepeda & transport massal: rendah per penumpang\n• Hemat 20% listrik = turunkan emisi listrik"
      },
    {
        h: "Proyek Energi Kecil",
        t: "Lampu 5 W × 3 jam = 15 Wh/hari → × 30 = 450 Wh/bulan\nPanel 20 W × 4 jam cahaya = 80 Wh/hari\n\nRancangan mini:\n1. Tentukan kebutuhan harian (Wh).\n2. Hitung panel = kebutuhan ÷ (W panel × jam cahaya).\n3. Tambahkan baterai cadangan utk malam.\n4. Uji & catat data uji harian."
      }
    ]
  },
  {
    id: "eb3",
    title: "Cara Belajar Fisika",
    emoji: "📙",
    pages: [
{
        h: "Strategi Belajar Fisika",
        t: "1. Pahami konsep dulu, hafal rumus belakangan.\n2. Tulis satuan di setiap langkah hitung.\n3. Konsisten: g = 10 kecuali soal menyebut lain.\n4. Kerjakan soal berjenjang: mudah → sedang → pengayaan.\n5. Jelaskan konsep ke teman (efek Feynman)."
      },
    {
        h: "Rutinitas Anti-Lupa",
        t: "• Ulangi konsep H+1, H+7, H+30 (spaced repetition).\n• Satu sesi = soal campuran (satuan + gerak + energi), bukan satu topik terus.\n• Buat 'buku salah': catat kesalahan + penyebabnya, koreksi tiap akhir pekan.\n• Terapkan fisika: ukur sesuatu nyata (lapangan, massa, waktu) tiap minggu."
      },
    {
        h: "Ujian & Manajemen Waktu",
        t: "• Soal mudah dulu (± 1 menit/soal); sisihkan soal berat.\n• Tulis langkah sistematis; hasil akhir 1–2 desimal + satuan.\n• Sisakan 5 menit untuk membaca ulang jawaban.\n• KKTP = 70. Nilai < 70? Menu Asesmen menyediakan Remedial."
      }
    ]
  }
],

/* ================= GLOSARIUM & SUMBER ================= */
GLOS : [
  ["Besaran pokok", "7 besaran dasar SI: panjang, massa, waktu, kuat arus, suhu, intensitas cahaya, jumlah zat."],
  ["Besaran turunan", "Berhasil dari kombinasi besaran pokok — kecepatan (m/s), gaya (N), energi (J)."],
  ["Pengukuran", "Membandingkan besaran dengan satuan baku; dilaporkan lengkap dengan ketidakpastian."],
  ["Ketidakpastian (NAB)", "Tanda ± hasil ukur = ½ × skala terkecil alat."],
  ["Perpindahan", "Vektor beda posisi akhir dan awal; Δx bisa 0 meski jarak besar."],
  ["GLB", "Gerak Lurus Beraturan: kecepatan konstan; s = v·t."],
  ["GLBB", "Percepatan konstan; v = v₀ + a·t ; s = v₀·t + ½·a·t²."],
  ["Jatuh bebas", "GLBB dengan a = g ≈ 10 m/s² dan v₀ = 0."],
  ["Parabola", "Lintasan lemparan: GLB (horizontal) + GLBB (vertikal)."],
  ["Sentripetal", "Percepatan menuju pusat lingkaran; a = v²/r."],
  ["Newton", "Satuan gaya SI; 1 N memberi 1 kg percepatan 1 m/s²."],
  ["Energi kinetik", "EK = ½mv² — energi karena gerak."],
  ["Momentum", "p = m·v; kekal pada tumbukan tanpa gaya luar."],
  ["Impuls", "I = F·Δt = perubahan momentum (Δp)."],
  ["KWh", "Kilowatt-jam = 1000 Wh; satuan energi listrik di tagihan."],
  ["Gas rumah kaca", "Gas penangkap radiasi inframerah: CO₂, CH₄, N₂O — pemicu pemanasan global."]
],
SUMBER : [
  ["📄 CP Fisika Fase E–F", "Capaian Pembelajaran resmi: CP_SMA/15_CP_SMA_FISIKA.pdf (Fase F) + CP IPA Fase E (CP_SMA/14_CP_SMA_ILMU_PENGETAHUAN_ALAM_(IPA).pdf) untuk kelas X."],
  ["📘 Modul Ajar & ATP", "Alur Tujuan Pembelajaran 12 unit fisika tersedia pada menu Jalur Belajar LMS ini."],
  ["🧮 Lab Maya", "Lab Pengukuran, Lab Gerak, Lab Energi — simulasi interaktif + kuis cepat dengan umpan balik langsung."],
  ["🎮 Gim Edukatif", "3 gim buatan LMS: Ekspedisi Pengukuran, Detektif Gerak & Gaya, Kotak Satuan SI — 3 level tiap gim, 27 bintang total."],
  ["📊 Data iklim & energi", "Gunakan menu E-Book: Energi & Iklim Lestari — referensi hitungan energi serta campaign iklim Campaign."],
  ["🧠 Teman Fisika", "Robot pertanyaan (menu 🤖) menjawab rumus, konsep, dan tips belajar fisika secara offline."]
],

/* ================= SEED FORUM ================= */
FORUM_SEED : [
  {
    id: 1,
    av: "AU",
    who: "Ayla U.",
    role: "",
    time: "2 hari lalu",
    title: "Kenapa perpindahan bisa 0 padahal jarak tidak?",
    body: "Di unit 3 soalnya: lari keliling lapangan lalu kembali ke titik awal — jarak 400 m tetapi perpindahan 0. Kok bisa?",
    replies: [
{
        av: "GR",
        who: "Bu Guru",
        role: "guru",
        time: "1 hari lalu",
        body: "Jarak = panjang seluruh lintasan (skalar), perpindahan = beda posisi akhir–awal (vektor). Karena posisi akhir = titik awal, Δx = 0 meski kakimu berjalan 400 m. Arahnya! Perpindahan selalu 'meluruskan' dua titik."
      }
    ]
  },
  {
    id: 2,
    av: "RP",
    who: "Rangga P.",
    role: "",
    time: "3 hari lalu",
    title: "Cara cepat konversi km/jam → m/s?",
    body: "Selalu salah mengalikan/bagi saat konversi kecepatan. Ada jembatan hafalan yang gampang?",
    replies: [
{
        av: "SV",
        who: "Sarah V.",
        role: "",
        time: "2 hari lalu",
        body: "Bagi saja dengan 3,6! 72 km/jam ÷ 3,6 = 20 m/s. Kebalikannya: m/s × 3,6 = km/jam. Triknya: 3,6 = 3600 s ÷ 1000 m."
      }
    ]
  },
  {
    id: 3,
    av: "TM",
    who: "Tio M.",
    role: "",
    time: "5 hari lalu",
    title: "Aksi–reaksi beneran beda benda ya?",
    body: "Kalau saya dorong dinding, katanya dinding juga mendorong saya — tapi kok dinding tidak bergerak?",
    replies: [
{
        av: "GR",
        who: "Bu Guru",
        role: "guru",
        time: "4 hari lalu",
        body: "Pasangan aksi–reaksi selalu bekerja pada dua benda berbeda. Dinding mendorong balik sama besar (reaksi), tetapi gaya itu menahan tanganmu — bukan memindahkan dinding karena resultan pada dinding tetap nol (meja/lantai menjaganya)."
      }
    ]
  }
],

/* ================= PERTANYAAN BOT (regex → jawaban) ================= */
BOT_RULES : [
  [/halo|hai|assalam|pagi|siang|sore|malam/i, "Halo! 👋 Saya Teman Fisika. Tanyakan rumus (mis. 'rumus glbb'), konsep gerak & energi, iklim, atau minta tips belajar."],
  [/satuan|besaran|pengukur/i, "7 besaran pokok SI:\n• Panjang: meter (m)\n• Massa: kilogram (kg)\n• Waktu: sekon (s)\n• Kuat arus: ampere (A)\n• Suhu: kelvin (K)\n• Intensitas cahaya: kandela (cd)\n• Jumlah zat: mol"],
  [/glb|glbb|kinematik|kecepatan|jarak/i, "GLB: v konstan → s = v·t\nGLBB:\n• v = v₀ + a·t\n• s = v₀·t + ½·a·t²\n• v² = v₀² + 2·a·s\n\nJatuh bebas (v₀ = 0, g = 10): v = g·t ; h = ½·g·t²\n\nKonversi: km/jam ÷ 3,6 = m/s"],
  [/parabola|lempar|elevasi/i, "Lemparan parabola:\n• vx = v·cos α (tetap)\n• vy = v·sin α (berubah oleh g)\n• h maks = vy²/(2g) — saat vy = 0\n• t terbang = 2·vy/g\n• jarak = vx × t terbang"],
  [/newton|gaya|inersia/i, "Hukum Newton:\n• I (inersia): tanpa gaya bersih, keadaan gerak tetap.\n• II: F = m·a (1 N = 1 kg·m/s²)\n• III: F aksi = − F reaksi (dua benda berbeda!)"],
  [/energi|usaha|daya|kinetik|potensial/i, "Energi:\n• W = F·s (joule)\n• EK = ½·m·v²\n• EP = m·g·h\n• P = W/t (watt)\n\nKekekalan energi mekanik: EP + EK tetap (tanpa gesekan) → v = √(2gh)."],
  [/momentum|impuls/i, "Momentum & impuls:\n• p = m·v (kg·m/s)\n• I = F·Δt = Δp\n• Tumbukan tanpa gaya luar → total momentum kekal\n\nAirbag/helm: memperpanjang Δt → gaya rata-rata menurun."],
  [/iklim|grk|co2|rumah kaca/i, "Perubahan iklim:\n• GRK (CO₂, CH₄) memerangkap radiasi inframerah.\n• Sumber utama: fosil & deforestasi.\n• Mitigasi: hemat listrik + transportasi massal + kurangi pembakaran.\n• Adaptasi: siaga banjir, mangrove, penyesuaian jadwal."],
  [/belajar|cara belajar|tips|strategi/i, "Tips belajar fisika:\n1. Pahami konsep, jangan hanya hafal rumus.\n2. Tulis satuan di setiap langkah.\n3. Gunakan g = 10 m/s² kecuali disebut lain.\n4. Catat kesalahan di 'buku salah' — koreksi mingguan.\n5. Ulangi H+1, H+7, H+30."],
  [/nilai|skor|kktp|remedial/i, "KKTP = 70. Jika nilai asesmenmu < 70, menu Asesmen menyediakan Remedial untuk pemulihan skor."],
  [/proyek|tugas/i, "Tiap unit punya proyek di tab 📝 Proyek. Proyek besar Unit 12: 🏆 Prototipe Energi Lestari — lampu surya mini atau kincir angin."],
  [/terima kasih|makasih|thanks/i, "Sama-sama! Semangat menjelajahi alam semesta. 🚀"]
],
BOT_FALLBACK : "Maaf, saya belum punya jawaban untuk itu. Coba tanyakan: 'rumus glbb', 'satuan SI', 'hukum newton', 'energi kinetik', atau 'perubahan iklim'.",
/* ================= GIM (format engine: levels[].q = {p,o,a}) ================= */
GAMES : [
  { id:"ekspedisi", name:"Ekspedisi Pengukuran", emoji:"🏕️", el:1,
    desc:"Ekspedisi 7 pos: satuan SI, alat ukur, dan gerak dasar — jawab tiap gerbang untuk mencapai Puncak Gerak.",
    levels:[
      { name:"Pantai Satuan", q:[{   p: "Satuan SI waktu?",   o: [ "menit", "sekon", "jam" ],   a: 1 },
        {   p: "Satuan SI panjang?",   o: [ "meter", "yard", "kaki" ],   a: 0 },
        {   p: "Yang termasuk besaran pokok?",   o: [ "gaya", "massa", "energi" ],   a: 1 },
        {   p: "Yang termasuk besaran turunan?",   o: [ "suhu", "kecepatan", "masa" ],   a: 1 },
        {   p: "1 km = ? m",   o: [ "10", "100", "1000" ],   a: 2 },
        {   p: "1 kg = ? gram",   o: [ "10", "100", "1000" ],   a: 2 },
        {   p: "Satuan SI suhu?",   o: [ "kelvin", "celcius", "fahrenheit" ],   a: 0 },
        {   p: "1 menit = ? sekon",   o: [ "6", "60", "600" ],   a: 1 },
        {   p: "Gaya diukur dengan satuan …",   o: [ "newton (N)", "joule (J)", "watt (W)" ],   a: 0 },
        {   p: "Kecepatan punya satuan SI …",   o: [ "km/jam", "m/s", "mil/jam" ],   a: 1 } ] },
      { name:"Teluk Alat Ukur", q:[{   p: "Alat ukur ketelitian 0,1 mm?",   o: [ "mistar", "jangka sorong", "meteran" ],   a: 1 },
        {   p: "Mikrometer dipakai untuk …",   o: [ "benda sangat kecil", "gedung tinggi", "kolam renang" ],   a: 0 },
        {   p: "45 mm = ? cm",   o: [ "4,5", "0,45", "45" ],   a: 0 },
        {   p: "120 cm = ? m",   o: [ "0,12", "1,2", "12" ],   a: 1 },
        {   p: "72 km/jam = ? m/s",   o: [ "7,2", "36", "20" ],   a: 2 },
        {   p: "3 m/s = ? km/jam",   o: [ "0,3", "10,8", "30" ],   a: 1 },
        {   p: "Ketelitian mistar umum?",   o: [ "1 mm", "0,1 mm", "0,01 mm" ],   a: 0 },
        {   p: "½ × skala terkecil = ?",   o: [ "NAB", "massa", "frekuensi" ],   a: 0 },
        {   p: "1,5 m = ? mm",   o: [ "150", "1500", "15" ],   a: 1 },
        {   p: "Alat ukur massa?",   o: [ "neraca", "termometer", "amperemeter" ],   a: 0 } ] },
      { name:"Puncak Gerak", q:[{   p: "GLB: s = ?",   o: [ "v·t", "½·a·t²", "v ÷ t" ],   a: 0 },
        {   p: "20 m/s selama 5 s → s = ?",   o: [ "25 m", "100 m", "40 m" ],   a: 1 },
        {   p: "Lari 100 m dalam 20 s → v = ?",   o: [ "5 m/s", "2 m/s", "10 m/s" ],   a: 0 },
        {   p: "v₀ = 0, a = 2, t = 4 → v = ?",   o: [ "2 m/s", "6 m/s", "8 m/s" ],   a: 2 },
        {   p: "Gerak parabola = gabungan ?",   o: [ "GLB + GLBB", "2× GLB", "2× GLBB" ],   a: 0 },
        {   p: "Di puncak parabola, vy = ?",   o: [ "maksimum", "nol", "maksimal negatif" ],   a: 1 },
        {   p: "g bumi ≈ ?",   o: [ "10 m/s²", "1 m/s²", "100 m/s²" ],   a: 0 },
        {   p: "Jatuh bebas 2 s (g = 10) → v = ?",   o: [ "10 m/s", "20 m/s", "40 m/s" ],   a: 1 },
        {   p: "Satuan percepatan si?",   o: [ "m/s", "m/s²", "N/kg" ],   a: 1 },
        {   p: "Grafik x–t untuk GLB berbentuk …",   o: [ "garis lurus", "parabola", "gelombang" ],   a: 0 } ] } ] },
  { id:"kinematika", name:"Detektif Gerak & Gaya", emoji:"🕵️", el:3,
    desc:"Tiga kasus di kota: kecepatan sepeda, gaya dua tangan, dan peti gudang — ubah petunjuk menjadi dua persamaan, temukan dua nilai.",
    levels:[
      { name:"Kasus Sepeda Ayu & Bimo", q:[
        {   p: "Dua persamaan kasus ini: x − y = 20 dan x + y = 100. Dijumlahkan: 2x = …",   o: [ "120", "100", "60", "20" ],   a: 0 },
        {   p: "Dari kasus sama, nilai x (variabel pertama) = …",   o: [ "60", "40", "120", "80" ],   a: 0 },
        {   p: "Nilai y dari kasus itu = …",   o: [ "40", "60", "50", "30" ],   a: 0 },
        {   p: "Uji jawaban: selisih dan jumlah x, y harus cocok dengan kedua persamaan. Kombinasi yang benar:",   o: [ "60 dan 40", "40 dan 120", "120 dan 40", "60 dan -20" ],   a: 0 },
        {   p: "Dua persamaan linear dengan dua variabel seperti kasus ini disebut …",   o: [ "sistem persamaan linear dua variabel", "fungsi kuadrat", "barisan bilangan", "hitung pecahan campuran" ],   a: 0 },
        {   p: "Strategi cepat pasangan 'jumlah & selisih' adalah …",   o: [ "jumlahkan kedua persamaan, lalu bagi akibatnya", "kalikan kedua persamaan secara langsung", "kuadratkan kedua persamaan", "pilih salah satu angka lalu tebak yang lain" ],   a: 0 } ] },
      { name:"Kasus Gaya Dua Tangan", q:[
        {   p: "Dua persamaan kasus ini: x + y = 120 dan x − y = 40. Dijumlahkan: 2x = …",   o: [ "160", "120", "80", "40" ],   a: 0 },
        {   p: "Dari kasus sama, nilai x (variabel pertama) = …",   o: [ "80", "40", "160", "80" ],   a: 0 },
        {   p: "Nilai y dari kasus itu = …",   o: [ "40", "80", "50", "40" ],   a: 0 },
        {   p: "Uji jawaban: selisih dan jumlah x, y harus cocok dengan kedua persamaan. Kombinasi yang benar:",   o: [ "80 dan 40", "40 dan 160", "160 dan 40", "80 dan 0" ],   a: 0 },
        {   p: "Dua persamaan linear dengan dua variabel seperti kasus ini disebut …",   o: [ "sistem persamaan linear dua variabel", "fungsi kuadrat", "barisan bilangan", "hitung pecahan campuran" ],   a: 0 },
        {   p: "Strategi cepat pasangan 'jumlah & selisih' adalah …",   o: [ "jumlahkan kedua persamaan, lalu bagi akibatnya", "kalikan kedua persamaan secara langsung", "kuadratkan kedua persamaan", "pilih salah satu angka lalu tebak yang lain" ],   a: 0 } ] },
      { name:"Kasus Dua Peti Gudang", q:[
        {   p: "Dua persamaan kasus ini: x + y = 320 dan x − y = 80. Dijumlahkan: 2x = …",   o: [ "400", "320", "200", "80" ],   a: 0 },
        {   p: "Dari kasus sama, nilai x (variabel pertama) = …",   o: [ "200", "120", "400", "240" ],   a: 0 },
        {   p: "Nilai y dari kasus itu = …",   o: [ "120", "200", "130", "100" ],   a: 0 },
        {   p: "Uji jawaban: selisih dan jumlah x, y harus cocok dengan kedua persamaan. Kombinasi yang benar:",   o: [ "200 dan 120", "120 dan 400", "400 dan 120", "200 dan -40" ],   a: 0 },
        {   p: "Dua persamaan linear dengan dua variabel seperti kasus ini disebut …",   o: [ "sistem persamaan linear dua variabel", "fungsi kuadrat", "barisan bilangan", "hitung pecahan campuran" ],   a: 0 },
        {   p: "Strategi cepat pasangan 'jumlah & selisih' adalah …",   o: [ "jumlahkan kedua persamaan, lalu bagi akibatnya", "kalikan kedua persamaan secara langsung", "kuadratkan kedua persamaan", "pilih salah satu angka lalu tebak yang lain" ],   a: 0 } ] } ] },
  { id:"satuan", name:"Kotak Satuan SI", emoji:"🧩", el:1,
    desc:"Jawab cepat besaran ↔ satuan SI dan alat ukur ↔ besaran — hindari kaitan yang salah (kartu umpan jadi pilihan).",
    levels:[
      { name:"Besaran Pokok JSI", q:[
        {   p: "Satuan SI untuk massa adalah …",   o: [ "kg", "J", "s", "m" ],   a: 0 },
        {   p: "Satuan SI untuk panjang adalah …",   o: [ "m", "kg", "N", "K" ],   a: 0 },
        {   p: "Sekon/aliran waktu (s) adalah satuan besaran …",   o: [ "waktu", "suhu", "massa", "gaya" ],   a: 0 },
        {   p: "Kelvin (K) adalah satuan …",   o: [ "suhu", "panjang", "waktu", "energi" ],   a: 0 },
        {   p: "Newton (N) adalah satuan …",   o: [ "gaya", "daya", "energi", "massa" ],   a: 0 },
        {   p: "Joule (J) bukan satuan besaran pokok — ia satuan …",   o: [ "energi", "massa", "waktu", "suhu" ],   a: 0 } ] },
      { name:"Besaran Turunan", q:[
        {   p: "Satuan kecepatan adalah …",   o: [ "m/s", "kg", "J", "Hz" ],   a: 0 },
        {   p: "Joule (J) adalah satuan dari besaran …",   o: [ "energi", "daya", "tekanan", "frekuensi" ],   a: 0 },
        {   p: "Watt (W) adalah satuan …",   o: [ "daya", "energi", "kecepatan", "waktu" ],   a: 0 },
        {   p: "Pascal (Pa) adalah satuan …",   o: [ "tekanan", "massa", "gaya", "kecepatan" ],   a: 0 },
        {   p: "Hertz (Hz) adalah satuan …",   o: [ "frekuensi", "daya", "tekanan", "energi" ],   a: 0 },
        {   p: "1 Pa = 1 …",   o: [ "N/m²", "kg·m", "J/s", "Hz·s" ],   a: 0 } ] },
      { name:"Alat Ukur", q:[
        {   p: "Mistar dipakai untuk mengukur …",   o: [ "panjang", "massa", "suhu", "waktu" ],   a: 0 },
        {   p: "Termometer mengukur …",   o: [ "suhu", "panjang", "massa", "kecepatan" ],   a: 0 },
        {   p: "Neraca mengukur …",   o: [ "massa", "panjang", "suhu", "volume" ],   a: 0 },
        {   p: "Stopwatch mengukur …",   o: [ "waktu", "suhu", "massa", "volume" ],   a: 0 },
        {   p: "Gelas ukur mengukur …",   o: [ "volume", "waktu", "massa", "suhu" ],   a: 0 },
        {   p: "Alat yang paling tepat mengukur diameter tutup botol kecil (ketelitian tinggi) adalah …",   o: [ "mikrometer", "meteran", "stopwatch", "neraca" ],   a: 0 } ] } ] }
]
};