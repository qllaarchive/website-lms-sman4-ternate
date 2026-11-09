import 'package:flutter/material.dart';
import '../models/subject.dart';
import '../services/data_service.dart';
import '../theme.dart';
import '../widgets/hero_section.dart';
import '../widgets/subject_card.dart';
import '../widgets/filter_segmented.dart';

/// Halaman utama: hero + filter kelas + grid mapel.
class HomeScreen extends StatefulWidget {
  final Subject? selectedSubject; // kalau ada, langsung ke detail

  const HomeScreen({super.key, this.selectedSubject});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _classIndex = 0; // 0=X, 1=XI, 2=XII
  String _query = '';

  List<Subject> get _filtered {
    var list = DataService.subjects;
    if (_classIndex >= 0 && _classIndex < 3) {
      list = list.where((s) => s.kelas == ['X', 'XI', 'XII'][_classIndex]).toList();
    }
    if (_query.isNotEmpty) {
      list = DataService.search(_query);
    }
    return list;
  }

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;

    return SafeArea(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          HeroSection(
            title: 'One Site SMANFOURTTE',
            subtitle: 'SMA Negeri 4 Ternate · ${['X', 'XI', 'XII'][_classIndex]}',
            quote: 'Rumah belajar digital siswa Kelas X–XII.',
            emoji: '🏫',
            accent: LMSPalette.blue,
          ),
          // Pencarian
          Padding(
            padding: const EdgeInsets.all(12),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Cari mata pelajaran…',
                prefixIcon: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: LMSPalette.softBrightness(dark),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(Icons.search, size: 20, color: LMSPalette.mutedBrightness(dark)),
                ),
                suffixIcon: _query.isNotEmpty
                    ? IconButton(
                        icon: Icon(Icons.clear, size: 20, color: LMSPalette.mutedBrightness(dark)),
                        onPressed: () { setState(() { _query = ''; }); },
                      )
                    : null,
                filled: true,
                fillColor: LMSPalette.softBrightness(dark),
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              ),
              onChanged: (v) { setState(() { _query = v; }); },
            ),
          ),
          // Filter kelas
          if (_filtered.length > 1) ...[
            ClassFilter(
              selected: _classIndex,
              onChanged: (i) { setState(() { _classIndex = i; }); },
            ),
            const SizedBox(height: 12),
          ],
          // Grid
          Expanded(
            child: _filtered.isEmpty
                ? _empty(dark)
                : GridView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 14,
                      mainAxisSpacing: 16,
                      childAspectRatio: 0.78,
                    ),
                    itemCount: _filtered.length,
                    itemBuilder: (ctx, i) {
                      final s = _filtered[i];
                      return SubjectCard(subject: s, onTap: () {
                        if (mounted) Navigator.of(ctx).pushNamed('/mapel/${s.id}');
                      });
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _empty(bool dark) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.search_off,
            size: 48,
            color: LMSPalette.mutedBrightness(dark),
          ),
          const SizedBox(height: 12),
          Text(
            'Tidak ada mapel ditemukan',
            style: bodyFont(size: 15, weight: FontWeight.w600, color: LMSPalette.mutedBrightness(dark)),
          ),
        ],
      ),
    );
  }
}
