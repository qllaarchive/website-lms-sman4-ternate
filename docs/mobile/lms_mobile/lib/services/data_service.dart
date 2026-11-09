import 'package:flutter/material.dart';
import '../models/panel.dart';
import '../models/subject.dart';

/// Data terikat (embedded) yang sesuai public/data/*.js di website.
/// Mapel terdaftar: matematika, fisika, sejarah, pendidikan agama islam.
class DataService {
  static final List<Subject> _subjects = _loadAll();

  static List<Subject> _loadAll() {
    return [
      _math(),
      _fisika(),
      _sejarah(),
      _pendais(),
    ];
  }

  static Subject _math() {
    return Subject(
      id: 'matematika',
      name: 'Matematika',
      short: 'MTK',
      emoji: '📐',
      color: const Color(0xFF1F6FE5),
      kelas: 'X',
      fase: 'Fase E',
      sekolah: 'SMAN 4 Ternate',
      lsKey: 'mtklms_x_sman4ternate_v1',
      sheetId: 'AKfycbwyb4YHCCYQ2OY-uj_fO5TOsE9OoFU5JTKoq5PG7Rd40bz8-jzMXy5iGvgRMc8ImjRMVw',
      moto: ['Bernalar', 'Berkonsep', 'Bermakna'],
      sideMoto: ['Hitung,', 'Pahami,', 'Selidiki.'],
      quote: 'Matematika adalah alat berpikir.',
      note: 'CP Fase E — 4 elemen: Bilangan · Aljabar & Fungsi · Geometri · Analisis Data & Peluang',
      botName: 'Teman Matematika',
      botIntro: 'Halo! Saya Teman Matematika Kelas X. Tanyakan rumus, tips belajar, atau minta contoh soal.',
      botQuick: ['rumus kuadrat', 'kuartil', 'cara belajar', 'eksponen', 'trigonometri'],
      about: 'LMS Matematika Kelas X · Fase E · dibangun selaras CP 4 elemen: Bilangan, Aljabar & Fungsi, Geometri, Analisis Data & Peluang.',
      logoText: '∑x',
      scene: ['y = ax²+bx+c', 'π ≈ 3,14159', 'sin²α + cos²α = 1', 'α'],
      kkTp: 70,
      units: [
        Unit(
          no: 1, el: 1, sem: 1, title: 'Eksponen & Sifat Pangkat',
          desc: 'Menggeneralisasi sifat bilangan berpangkat bulat dan menerapkannya pada masalah sehari-hari.',
          emoji: '🔢',
          focus: [
            ['Sifat perkalian', 'aᵐ · aⁿ = aᵐ⁺ⁿ'],
            ['Pangkat nol & negatif', 'a⁰ = 1 ; a⁻ⁿ = 1/aⁿ'],
            ['Notasi ilmiah', '4,5 × 10⁸ = 450.000.000'],
          ],
          model: [
            ['Model bakteri', 'Sebuah bakteri membelah diri setiap 20 menit. Jika awalnya 1 bakteri, setelah 2 jam jumlahnya [[2⁶ = 64]] bakteri.'],
          ],
          diag: [
            {'q': 'Nilai dari 2⁵ adalah …', 'o': ['16', '32', '64', '128'], 'a': 1, 'w': '2⁵ = 2×2×2×2×2 = 32.'},
            {'q': 'Hasil dari a³ · a⁴ adalah …', 'o': ['a⁷', 'a¹²', 'a¹', 'a⁻¹'], 'a': 0, 'w': 'Sifat: aᵐ · aⁿ = aᵐ⁺ⁿ, maka 3+4 = 7.'},
            {'q': 'Nilai dari (-3)² adalah …', 'o': ['-9', '9', '6', '-6'], 'a': 1, 'w': '(-3)² = (-3)×(-3) = 9.'},
          ],
          form: [
            {'q': 'Hasil dari 5³ adalah …', 'o': ['25', '75', '125', '150'], 'a': 2, 'w': '5³ = 5×5×5 = 125.'},
            {'q': 'Sifat pangkat dari (2⁴)³ adalah …', 'o': ['2⁷', '2¹²', '2⁶', '2¹'], 'a': 1, 'w': '(aᵐ)ⁿ = aᵐˣⁿ, maka 4×3 = 12.'},
            {'q': 'Nilai dari 10⁻² adalah …', 'o': ['-100', '0,01', '100', '-0,01'], 'a': 1, 'w': 'a⁻ⁿ = 1/aⁿ, maka 10⁻² = 1/100 = 0,01.'},
            {'q': 'Jika 2ˣ = 32, maka nilai x adalah …', 'o': ['4', '5', '6', '8'], 'a': 1, 'w': '32 = 2⁵, jadi x = 5.'},
          ],
          quiz: [
            {'q': 'Bilangan 64.000.000 dalam notasi ilmiah adalah …', 'o': ['6,4 × 10⁷', '64 × 10⁶', '0,64 × 10⁸', '6,4 × 10⁸'], 'a': 0, 'w': 'Diperkecil sampai koma berada di belakang satu digit, 6,4, lalu pangkatnya 7.'},
            {'q': 'Hasil dari (3² · 3³) / 3⁴ adalah …', 'o': ['3', '9', '3⁵', '1/3'], 'a': 0, 'w': 'Pangkat atas: 2+3 = 5, lalu 5−4 = 1, jadi 3¹ = 3.'},
          ],
          task: 'Temukan 3 contoh notasi ilmiah dalam kehidupan (mis. berita sains, iklan teknologi). Tuliskan bilangannya dan ubah ke notasi ilmiah, lalu jelaskan alasan angka pangkatnya.',
          disc: 'Mengapa a⁰ = 1, bukan 0? Jelaskan dengan pola pembagian berturut-turut (mis. 2³ : 2 = 2², 2² : 2 = 2¹, 2¹ : 2 = …).',
          proj: {
            'title': 'Poster Fakta Eksponen',
            'steps': ['Pilih 4 fakta berbasis eksponen (mis. pertumbuhan bakteri, teknologi komputasi).', 'Hitung dan buktikan tiap fakta menggunakan sifat pangkat.', 'Susun poster A4: fakta → perhitungan → kesimpulan.', 'Presentasikan 2 menit di depan kelas.'],
            'rub': [['Ketepatan hitung', '40'], ['Kelengkapan fakta', '30'], ['Kejelasan presentasi', '30']],
          },
          refl: ['Sifat pangkat mana yang paling sering kamu lupakan?', 'Apa kesalahan paling umum saat mengerjakan soal eksponen?', 'Bagaimana eksponen membantu kamu menghemat waktu berhitung?'],
          meet: [
            {'jp': '4 JP', 'topic': 'Pola bilangan berpangkat', 'act': 'Menemukan sifat pangkat dari deret bilangan (Discovery Learning).'},
            {'jp': '4 JP', 'topic': 'Sifat-sifat eksponen', 'act': 'Latihan bertingkat: dasar → penguasaan → pengayaan.'},
            {'jp': '4 JP', 'topic': 'Notasi ilmiah & masalah nyata', 'act': 'Proyek mini notasi ilmiah dan kuis kelas.'},
          ],
        ),
        Unit(
          no: 2, el: 2, sem: 1, title: 'Akar & Bilangan Pangkat Pecahan',
          desc: 'Menggeneralisasi sifat bilangan berpangkat termasuk pangkat pecahan (akar) untuk menyelesaikan masalah.',
          emoji: '√',
          focus: [
            ['Pangkat pecahan', 'a^(m/n) = ⁿ√(aᵐ)'],
            ['Sifat akar', '√a · √b = √(ab)'],
            ['Akar dari pecahan', '√(a/b) = √a / √b'],
          ],
          diag: [
            {'q': 'Nilai dari √144 adalah …', 'o': ['10', '11', '12', '14'], 'a': 2, 'w': '12 × 12 = 144.'},
            {'q': '8^(2/3) sama dengan …', 'o': ['4', '6', '8', '16'], 'a': 0, 'w': '∛8 = 2, lalu 2² = 4.'},
            {'q': '√50 disederhanakan menjadi …', 'o': ['5√2', '25√2', '10√5', '5√5'], 'a': 0, 'w': '50 = 25 × 2, maka √50 = 5√2.'},
          ],
          form: [
            {'q': 'Hasil dari √72 adalah …', 'o': ['6√2', '8√3', '3√8', '2√18'], 'a': 0, 'w': '72 = 36 × 2, maka √72 = 6√2.'},
            {'q': 'Nilai dari ∛27 adalah …', 'o': ['3', '9', '27', '6'], 'a': 0, 'w': '3 × 3 × 3 = 27.'},
            {'q': 'Jika 5^(2x) = 25, maka nilai x adalah …', 'o': ['1/2', '1', '2', '5'], 'a': 1, 'w': '25 = 5², maka 2x = 2 → x = 1.'},
          ],
          quiz: [
            {'q': 'Bentuk lain dari ³√64 adalah …', 'o': ['64^(1/3)', '64^(1/2)', '64³', '64^(-1/3)'], 'a': 0, 'w': 'ⁿ√a = a^(1/n).'},
            {'q': 'Hasil dari (27)^(2/3) adalah …', 'o': ['9', '6', '81', '3'], 'a': 0, 'w': '∛27 = 3, lalu 3² = 9.'},
            {'q': '√18 + √8 disederhanakan menjadi …', 'o': ['5√2', '7√2', '√26', '4√2'], 'a': 0, 'w': '3√2 + 2√2 = 5√2.'},
          ],
          task: 'Buatlah 2 soal cerita bertema lingkungan (mis. luas lahan hijau, volume air) yang melibatkan akar, kerjakan dengan langkah jelas, dan tukar dengan teman untuk dikoreksi.',
          disc: 'Mengapa luas persegi 4 kali membuat sisi hanya 2 kali? Jelaskan hubungannya dengan akar.',
          proj: {
            'title': 'Kalender Interaktif Pangkat & Akar',
            'steps': ['Kumpulkan 12 fakta bilangan berpangkat/akar berbeda.', 'Verifikasi setiap fakta dengan perhitungan.', 'Desain kalender bulanan (digital/cetak).', 'Refleksikan keterkaitan pola yang ditemukan.'],
            'rub': [['Ketepatan konsep', '40'], ['Kreativitas desain', '30'], ['Lengkap & rapi', '30']],
          },
          refl: ['Apa bedanya √a² dengan (√a)²?', 'Kapan akar muncul dalam masalah nyata sekitarmu?', 'Bagian mana dari penyederhanaan akar yang masih membuatmu ragu?'],
          meet: [
            {'jp': '4 JP', 'topic': 'Pangkat pecahan', 'act': 'Menghubungkan akar dengan pangkat melalui aktivitas kartu.'},
            {'jp': '4 JP', 'topic': 'Operasi akar', 'act': 'Laboratorium sederhana menyederhanakan bentuk akar.'},
            {'jp': '4 JP', 'topic': 'Masalah luas & volume', 'act': 'Pemecahan masalah kontekstual + kuis.'},
          ],
        ),
      ],
      labs: [
        Panel(
          id: 'labpangkat', title: 'Lab Sifat Pangkat', type: 'timeline',
          emoji: '🧪', rows: [
            ['aᵐ · aⁿ', 'aᵐ⁺ⁿ', 'Tulis 3 contoh sendiri.'],
            ['(aᵐ)ⁿ', 'aᵐ⁽ⁿ⁾', 'Hitung (2³)² secara langsung.'],
            ['a⁰', '1', 'Menjelaskan kenapa 5⁰ = 1.'],
          ],
        ),
        Panel(
          id: 'labdotplot', title: 'Lab Distribusi Data', type: 'match',
          emoji: '📊', rows: [
            ['Dot plot', 'Grafik sederhana titik di garis bilangan.'],
            ['Histogram', 'Batang berdekatan dari rentang data.'],
            ['Box plot', 'Menampilkan kuartil & nilai ekstrim.'],
          ],
        ),
      ],
      ebooks: [
        Panel(
          id: 'eb1', title: 'Ringkasan Elemen Bilangan', type: 'ebook',
          emoji: '📘', rows: [
            ['Bilangan bulat', 'Positif, negatif, nol, dan garis bilangan.'],
            ['Pangkat', 'Pembasis, eksponen, dan bentuk baku.'],
            ['Notasi ilmiah', 'a × 10ⁿ dengan 1 ≤ a < 10.'],
          ],
        ),
      ],
      glos: ['Pangkat bulat', 'Bilangan hasil perkalian berulang dengan pangkat bilangan asli.'],
      forums: [],
    );
  }

  static Subject _fisika() {
    return Subject(
      id: 'fisika',
      name: 'Fisika',
      short: 'FIS',
      emoji: '⚛️',
      color: const Color(0xFF5F3DC4),
      kelas: 'X',
      fase: 'Fase E',
      sekolah: 'SMAN 4 Ternate',
      lsKey: 'lms_fisika_x_v1',
      botName: 'Pacar Fisika',
      botIntro: 'Halo! Saya Pacar Fisika. Tanyakan about gerak, gaya, energi, atau listrik.',
      about: 'LMS Fisika Kelas X · Fase E · gerak, gaya, energi, dan kekekalan momentum.',
      logoText: 'F',
      scene: ['v = v₀ + at', 'F = ma', 'Eₖ = ½mv²', 'λ'],
      quote: 'Ilmu alam untuk memahami alam, dan untuk memahami alam kita harus beramal.' ,
      botQuick: ['gerak lurus', 'gaya', 'energi', 'listrik', 'gelombang'],
      kkTp: 70,
      units: [
        Unit(
          no: 1, el: 1, sem: 1, title: 'Besaran & Satuan',
          desc: 'Memahami besaran pokok, turunan, dan satuan SI serta alat ukur.',
          emoji: '📏',
          focus: [
            ['Besaran pokok', 'Panjang, massa, waktu, suhu, muatan, kuat arus, lumens.'],
            ['Satuan SI', 'm, kg, s, K, A, cd, mol.'],
            ['Kelas ketelitian', 'Angka penting & notasi ilmiah.'],
          ],
          diag: [
            {'q': 'Satuan panjang SI adalah …', 'o': ['kg', 'm', 's', 'A'], 'a': 1, 'w': 'Meter (m) adalah satuan dasar panjang.'},
            {'q': 'Berat benda diukur dalam …', 'o': ['kg', 'N', 'J', 'W'], 'a': 1, 'w': 'Berat = gaya gravitasi, satuan Newton (N).'},
          ],
          form: [
            {'q': 'Tulis 5000 m dalam km.', 'o': ['0,5 km', '5 km', '50 km', '500 km'], 'a': 0, 'w': '1 km = 1000 m, jadi 5000/1000 = 5 km.'},
          ],
          quiz: [
            {'q': 'Simbol satuan kuat arus listrik adalah …', 'o': ['V', 'A', 'Ω', 'W'], 'a': 1, 'w': 'Ampere (A).'},
          ],
          task: 'Lengkapi tabel besaran & satuan berikut, lalu catat 3 alat ukur di rumah.',
          disc: 'Mengapa satuan harus disamakan saat melakukan operasi hitung? Berikan contoh.',
          proj: {
            'title': 'Buku Small Lab Ukur',
            'steps': ['Ukur 5 benda di rumah dengan meteran.', 'Tuliskan dalam m, cm, mm.', 'Buat tabel & simpulkan.', 'Presentasikan 1 benda.'],
            'rub': [['Ketelitian ukur', '40'], ['Kejelasan tabel', '30'], ['Presentasi', '30']],
          },
          refl: ['Apa perbedaan antara besaran skalar dan vektor?', 'Ketelitian berapa yang kamu lakukan saat membaca angka?'],
          meet: [
            {'jp': '2 JP', 'topic': 'Satuan & alat ukur', 'act': 'Praktik mengukur benda di sekitar rumah.'},
          ],
        ),
      ],
      labs: [
        Panel(id: 'labukur', title: 'Lab Ukur & Ketelitian', type: 'info', emoji: '🧪', rows: [
          ['Mistar', '0,1 cm / 1 mm.', 'Catat bacaan dari 2 sudut pandang.'],
          ['Timbangan', '100 g.', 'Nolkan sebelum mengukur.'],
          ['Termometer', '°C.', 'Baca pada ketinggian mata cairan.'],
        ]),
      ],
      ebooks: [
        Panel(id: 'ebfis', title: 'Ringkasan Satuan & Alat Ukur', type: 'ebook', emoji: '📕', rows: [
          ['Satuan pokok', 'List 7 besaran pokok & satuan SI.'],
          ['Alat ukur', 'Fungsi & cara baca setiap alat.'],
          ['Ketelitian', 'Angka penting & pembulatan.'],
        ]),
      ],
      glos: ['Satuan', 'Pereduksi standar untuk mengukur besaran.'],
      forums: [],
    );
  }

  static Subject _sejarah() {
    return Subject(
      id: 'sejarah',
      name: 'Sejarah',
      short: 'SEJ',
      emoji: '📜',
      color: const Color(0xFFC92A2A),
      kelas: 'X',
      fase: 'Fase E',
      sekolah: 'SMAN 4 Ternate',
      lsKey: 'lms_sejarah_x_v1',
      botName: 'Sejarawan Ternate',
      botIntro: 'Halo! Saya Sejarawan Ternate. Tanyakan about Islam di Nusantara, Wali Songo, atau Ternate & Tidore.',
      botQuick: ['islam nusantara', 'wali songo', 'ternate', 'tidore', 'mahkota'],
      about: 'LMS Sejarah Kelas X · Fase E · jejak Islam di Nusantara & sejarah lokal Maluku Utara.',
      logoText: 'S',
      scene: ['RAMADAN', 'BAHAGIAMU', 'BESARKAN', 'MENKAJAR'],
      quote: 'Sejarah adalah kajian atas masa lampau, baik fakta maupun tafsir, untuk menjadikan masa kini lebih dewasa.' ,
      kkTp: 70,
      units: [
        Unit(
          no: 1, el: 1, sem: 1, title: 'Matriks & Transformatif',
          desc: 'Menentukan determinan matriks, invers, dan penerapan dalam sistem persamaan linear.',
          emoji: '🗺️',
          focus: [
            ['Matriks', 'Susunan bilangan berbentuk baris-kolom.'],
            ['Determinan', 'Nilai skalar dari matriks persegi.'],
            ['Invers matriks', 'Matriks sehingga hasil kali = I.'],
          ],
          diag: [
            {'q': 'Bentuk umum matriks 2×2 adalah …', 'o': ['2 baris, 2 kolom', '2 baris, 1 kolom', '1 baris, 2 kolom', '1 baris, 1 kolom'], 'a': 0, 'w': 'Baris → kotak, Kolom → vertikal.'},
            {'q': 'Invers matriks A ditulis …', 'o': ['A⁻¹', 'A²', 'Aᵀ', 'A'], 'a': 0, 'w': 'Tambahan -1 sebagai pangkat.'},
          ],
          form: [
            {'q': 'Tentukan determinan matriks [[2,3],[1,4]].', 'o': ['5', '8', '–5', '–8'], 'a': 0, 'w': 'ad − bc = 2×4 − 3×1 = 8−3 = 5.'},
            {'q': 'Invers dari [[2,1],[1,1]] adalah …', 'o': [['1,-1'],[-1,2]], 'a': 0, 'w': 'Determinan = 2x1-1x1 = 1; swap a,d, negatif b,c.'},
          ],
          quiz: [
            {'q': 'Determinan matriks [[1,2],[3,4]] = …', 'o': ['–2', '2', '5', '–5'], 'a': 0, 'w': '1×4 − 2×3 = 4−6 = −2.'},
          ],
          task: 'Buat 3 soal determinan & invers, selesaikan, tukar jawaban.',
          disc: 'Kapan determinan nol? Apa artinya untuk invers matriks.',
          proj: {
            'title': 'Peta Matriks Sekolah',
            'steps': ['Buat matriks 3×3 dari data guru.', 'Hitung determinan & invers.', 'Tafsirkan hasil dalam konteks jumlah guru.', 'Presentasikan hasilnya.'],
            'rub': [['Ketepatan perhitungan', '40'], ['Kejelasan peta', '30'], ['Kreativitas', '30']],
          },
          refl: ['Mengapa invers matriks hanya ada untuk matriks tertentu?', 'Bagaimana matriks membantu memodelkan masalah nyata?'],
          meet: [
            {'jp': '4 JP', 'topic': 'Matriks', 'act': 'Praktik menentukan determinan & invers.'},
          ],
        ),
      ],
      labs: [
        Panel(id: 'labmatrix', title: 'Lab Matriks', type: 'match', emoji: '🧮', rows: [
          ['Baris', 'Data tersusun horizontal.', 'Tulis baris 2 dari matriks berikut: [[1,2],[3,4]].'],
          ['Kolom', 'Data tersusun vertikal.', 'Kolom 1: [1, 3].'],
          ['Determinan', 'ad − bc.', 'Hitung det [[1,2],[3,4]].'],
        ]),
      ],
      ebooks: [
        Panel(id: 'ebsej', title: 'Peta Sejarah Lokal', type: 'ebook', emoji: '🗺️', rows: [
          ['Jejak Islam', 'Masuknya Islam ke Nusantara melalui perdagangan.'],
          ['Ternate & Tidore', 'Kesultanan Islam di Maluku Utara.'],
          ['Wali Songo', 'Sembilan ulama dakwah di Jawa.'],
        ]),
      ],
      glos: ['Sejarah', 'Kajian tentang masa lampau, fakta, tafsir, dan unsur cerita.'],
      forums: [],
    );
  }

  static Subject _pendais() {
    return Subject(
      id: 'pendais',
      name: 'Pendidikan Agama Islam',
      short: 'PAI',
      emoji: '🕌',
      color: const Color(0xFF0F766E),
      kelas: 'X',
      fase: 'Fase E',
      sekolah: 'SMAN 4 Ternate',
      lsKey: 'lms_pai_x_sman4ternate_v1',
      scriptId: 'AKfycbwyb4YHCCYQ2OY-uj_fO5TOsE9OoFU5JTKoq5PG7Rd40bz8-jzMXy5iGvgRMc8ImjRMVw',
      sheetId: '', // optional
      moto: ['Tilawah', 'Amal', 'Akhlak'],
      sideMoto: ['Ilmu yang benar,', 'amal yang ikhlas,', 'akhlak yang mulia.'],
      quote: 'Berlomba-lombalah kamu dalam kebaikan. — Q.S. al-Mā’idah/5:48',
      note: 'CP Fase E PAI dan Budi Pekerti: Al-Qur’an Hadis, Akidah, Akhlak, Fikih, serta Sejarah Peradaban Islam.',
      botName: 'Teman PAI',
      botIntro: 'Assalamu\'alaikum! Saya Teman PAI Kelas X. Tanyakan materi, dalil, istilah, atau tips belajar.',
      botQuick: ['fastabiqul khairat', 'syu\'ab al-iman', 'sumber hukum Islam', 'al-kulliyat al-khamsah', 'cara belajar'],
      about: 'LMS Pendidikan Agama Islam Kelas X · Fase E · selaras CP PAI: Al-Qur\'an Hadis, Akidah, Akhlak, Fikih, dan Sejarah Peradaban Islam.',
      logoText: 'PAI',
      scene: ['Tilawah', 'Iman', 'Akhlak', 'Peradaban'],
      kkTp: 70,
      units: [
        Unit(
          no: 1, el: 1, sem: 1, title: 'Al-Qur\'an Hadis',
          desc: 'Memahami ayat dan hadis pilihan tentang fastabiqul khairat, larangan pergaulan bebas, dan zina.',
          emoji: '📖',
          focus: [
            ['Fastabiqul khairat', 'Berlomba dalam kebaikan.'],
            ['Tabayyun', 'Memeriksa kebenaran sebelum menyebarkan.'],
            ['Pergaulan bebas', 'Larangan mendekati zina.'],
          ],
          diag: [
            {'q': 'Fastabiqul khairat berarti …', 'o': ['berlomba dalam kebaikan', 'berlomba dalam harta', 'berlomba dalam paglur', 'berlomba dalam popularitas'], 'a': 0, 'w': 'Q.S. al-Baqarah/2:148 — berlomba-lomba dalam kebaikan.'},
            {'q': 'Tabayyun adalah …', 'o': ['memeriksa kebenaran informasi', 'berjudi', 'bermain', 'menghalalkan varies'], 'a': 0, 'w': 'Q.S. al-Hujurat/49:6 — memeriksa kebenaran sebelum menyebarkan.'},
          ],
          form: [
            {'q': 'Larangan mendekati zina disebut …', 'o': ['hunafa', 'falah', 'haya', 'zina'], 'a': 1, 'w': 'Q.S. al-Isra/17:32 — larangan mendekati zina.'},
          ],
          quiz: [
            {'q': 'Syllabus PAI Fase E berjumlah …', 'o': ['5 elemen', '4 elemen', '7 elemen', '3 elemen'], 'a': 0, 'w': 'Al-Qur\'an Hadis, Akidah, Akhlak, Fikih, Sejarah Peradaban Islam.'},
          ],
          task: 'Bacalah Q.S. al-Māidah/5:48, kemudian tulis 3 pelajaran yang dapat kamu ambil.',
          disc: 'Mengapa tabayyun menjadi pintu masuk untuk menyebarkan berita yang benar?',
          proj: {
            'title': 'Peta Jejak Imam',
            'steps': ['Pilih 1 nahwu/sarf dari Al-Qur\'an.', 'Temukan 3 ayat yang menggunakan aturan itu.', 'Jelaskan penggunaannya.', 'Sajikan 3 menit.'],
            'rub': [['Ketepatan penjelasan', '40'], ['Ketelitian dalil', '30'], ['Kreativitas', '30']],
          },
          refl: ['Apa perbedaan iman dan amal?', 'Bagaimana sikapmu terhadap berita yang belum terbukti?'],
          meet: [
            {'jp': '4 JP', 'topic': 'Fastabiqul khairat', 'act': 'Diskusi tentang perlombaan kebaikan.'},
          ],
        ),
      ],
      labs: [
        Panel(id: 'labsrc', title: 'Lab Sumber Hukum', type: 'match', emoji: '⚖️', rows: [
          ['Al-Qur\'an', 'Sumber tertinggi.'],
          ['Sunnah', 'Penjelas Al-Qur\'an.'],
          ['Ijma', 'Kesepakatan ulama.'],
          ['Qiyas', 'Analogi hukum.'],
        ]),
      ],
      ebooks: [
        Panel(id: 'ebpai', title: 'Ringkasan 5 Elemen PAI', type: 'ebook', emoji: '📗', rows: [
          ['Al-Qur\'an Hadis', 'Ayat & hadis pilihan.'],
          ['Akidah', 'Syu\'ab al-īmān.'],
          ['Akhlak', 'Penyakit hati & obatnya.'],
          ['Fikih', 'Sumber hukum & al-kulliyat.'],
          ['Sejarah', 'Jejak Islam di Nusantara.'],
        ]),
      ],
      glos: ['Tilawah', 'Membaca Al-Qur\'an dengan bacaan yang benar.'],
      forums: [],
    );
  }

  /// Pengembalian daftar semua mapel terdaftar.
  static List<Subject> get subjects => List.unmodifiable(_subjects);

  /// Cari mapel berdasarkan id.
  static Subject? getSubject(String id) {
    try {
      return _subjects.firstWhere((s) => s.id == id);
    } catch (_) {
      return null;
    }
  }

  /// Pencarian sederhana berdasarkan nama/emoji/short.
  static List<Subject> search(String query) {
    if (query.trim().isEmpty) return List.unmodifiable(_subjects);
    final q = query.toLowerCase();
    return _subjects.where((s) {
      return s.name.toLowerCase().contains(q) ||
          s.short.toLowerCase().contains(q) ||
          s.emoji.contains(q) ||
          s.id.toLowerCase().contains(q);
    }).toList();
  }
}
