import 'package:flutter/material.dart';
import '../models/subject.dart';
import '../services/data_service.dart';
import '../theme.dart';
import '../widgets/panel_card.dart';
import '../widgets/badge.dart';

/// Detail mapel: info + units + labs + ebooks + glossary + forum.
class SubjectDetailScreen extends StatelessWidget {
  final String subjectId;

  const SubjectDetailScreen({super.key, required this.subjectId});

  @override
  Widget build(BuildContext context) {
    final subject = DataService.getSubject(subjectId);
    if (subject == null) {
      return _notFound(context);
    }
    return Scaffold(
      appBar: AppBar(
        title: Text(subject.name, style: displayFont(size: 18, weight: FontWeight.w700)),
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: LMSPalette.ink),
          onPressed: () => Navigator.of(context).pop(),
        ),
        backgroundColor: Colors.transparent,
        surfaceTintColor: Colors.transparent,
        iconTheme: IconThemeData(color: LMSPalette.ink),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Banner info
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [subject.color, subject.color.withValues(alpha: 0.6)],
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.15),
                          shape: BoxShape.circle,
                        ),
                        child: Center(
                          child: Text(
                            subject.emoji,
                            style: bodyFont(size: 24, weight: FontWeight.w800, color: Colors.white),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              subject.name,
                              style: displayFont(size: 22, weight: FontWeight.w800, color: Colors.white),
                            ),
                            Row(
                              children: [
                                LMSChip(label: 'Kelas ${subject.kelas}', bg: Colors.white.withValues(alpha: 0.2), text: Colors.white),
                                const SizedBox(width: 8),
                                LMSChip(label: subject.short, bg: Colors.white.withValues(alpha: 0.15), text: Colors.white),
                              ],
                            ),
                          ],
                        ),
                      ),
                      Icon(Icons.chevron_right, color: Colors.white, size: 32),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    subject.quote,
                    style: bodyFont(size: 14, weight: FontWeight.w600, color: Colors.white),
                  ),
                  if (subject.note != null) ...[
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        subject.note!,
                        style: bodyFont(size: 12, weight: FontWeight.w600, color: Colors.white),
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 12),
            // Tabs: Ringkasan | Unit | Lab | Buku | Glosarium
            _tabBar(subject),
            const SizedBox(height: 10),
            // Konten
            _tabView(subject: subject),
          ],
        ),
      ),
    );
  }

  Widget _tabBar(Subject subject) {
    return DefaultTabController(
      length: 5,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 4),
        child: TabBar(
          indicatorColor: LMSPalette.sun,
          labelColor: LMSPalette.sun,
          unselectedLabelColor: LMSPalette.mutedBrightness(false),
          labelStyle: bodyFont(size: 13, weight: FontWeight.w700),
          dividerColor: Colors.transparent,
          tabs: const [
            Tab(text: 'Ringkasan'),
            Tab(text: 'Unit'),
            Tab(text: 'Lab'),
            Tab(text: 'Buku'),
            Tab(text: 'Glosarium'),
          ],
        ),
      ),
    );
  }

  Widget _tabView({required Subject subject}) {
    return TabBarView(
      children: [
        _SummaryTab(subject: subject),
        _UnitsTab(subject: subject),
        _LabsTab(subject: subject),
        _EbooksTab(subject: subject),
        _GlossaryTab(subject: subject),
      ],
    );
  }
}

class _SummaryTab extends StatelessWidget {
  final Subject subject;
  const _SummaryTab({required this.subject});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _konten('Moto', subject.moto, Icons.emoji_emotions),
          _konten('Side Motto', subject.sideMoto, Icons.emoji_objects),
          if (subject.botIntro.isNotEmpty)
            _konten('Bot', [subject.botIntro], Icons.psychology),
          if (subject.units.isNotEmpty)
            _konten('Unit', [subject.units.first.desc ?? ''], Icons.book),
        ],
      ),
    );
  }

  Widget _konten(String label, List<String> items, IconData icon) {
    if (items.isEmpty) return const SizedBox.shrink();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, size: 18, color: LMSPalette.e2),
            const SizedBox(width: 6),
            Text(
              label,
              style: displayFont(size: 14, weight: FontWeight.w700, color: LMSPalette.navy),
            ),
          ],
        ),
        const SizedBox(height: 6),
        ...items.map((t) => Padding(
          padding: const EdgeInsets.symmetric(vertical: 3),
          child: Text(
            '• $t',
            style: bodyFont(size: 13, weight: FontWeight.w500),
          ),
        )),
      ],
    );
  }
}

class _UnitsTab extends StatelessWidget {
  final Subject subject;
  const _UnitsTab({required this.subject});

  @override
  Widget build(BuildContext context) {
    if (subject.units.isEmpty) return _empty();
    return Column(
      children: [
        for (final u in subject.units)
          Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: LMSPalette.e2.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Center(
                        child: Text(
                          '${u.no}',
                          style: bodyFont(size: 16, weight: FontWeight.w800, color: LMSPalette.e2),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        u.title,
                        style: displayFont(size: 16, weight: FontWeight.w800, color: LMSPalette.navy),
                      ),
                    ),
                  ],
                ),
                if (u.desc!.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Text(
                    u.desc!,
                    style: bodyFont(size: 12, weight: FontWeight.w500, color: LMSPalette.muted),
                  ),
                ],
                if (u.focus.isNotEmpty) ...[
                  const SizedBox(height: 6),
                  ...u.focus.map((f) => Padding(
                    padding: const EdgeInsets.symmetric(vertical: 2),
                    child: Text(
                      '▸ ${f[0] ?? ''}: ${f[1] ?? ''}',
                      style: bodyFont(size: 11, weight: FontWeight.w500, color: LMSPalette.muted),
                    ),
                  )),
                ],
              ],
            ),
          ),
      ],
    );
  }

  Widget _empty() {
    return Center(child: Text('Belum ada unit.', style: bodyFont(color: LMSPalette.muted)));
  }
}

class _LabsTab extends StatelessWidget {
  final Subject subject;
  const _LabsTab({required this.subject});

  @override
  Widget build(BuildContext context) {
    if (subject.labs.isEmpty) return _empty();
    return Column(
      children: [
        for (final p in subject.labs)
          Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: PanelCard(panel: p),
          ),
      ],
    );
  }

  Widget _empty() => Center(child: Text('Belum ada lab.', style: bodyFont(color: LMSPalette.muted)));
}

class _EbooksTab extends StatelessWidget {
  final Subject subject;
  const _EbooksTab({required this.subject});

  @override
  Widget build(BuildContext context) {
    if (subject.ebooks.isEmpty) return _empty();
    return Column(
      children: [
        for (final p in subject.ebooks)
          Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: PanelCard(panel: p),
          ),
      ],
    );
  }

  Widget _empty() => Center(child: Text('Belum ada buku.', style: bodyFont(color: LMSPalette.muted)));
}

class _GlossaryTab extends StatelessWidget {
  final Subject subject;
  const _GlossaryTab({required this.subject});

  @override
  Widget build(BuildContext context) {
    if (subject.glos.isEmpty) return _empty();
    return Column(
      children: [
        for (final g in subject.glos)
          Padding(
            padding: const EdgeInsets.only(bottom: 6),
            child: Row(
              children: [
                Container(
                  width: 24,
                  height: 24,
                  decoration: BoxDecoration(
                    color: LMSPalette.softBrightness(false),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Center(
                    child: Text(
                      '•',
                      style: bodyFont(size: 12, weight: FontWeight.w800, color: LMSPalette.e2),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    g,
                    style: bodyFont(size: 13, weight: FontWeight.w600),
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }

  Widget _empty() => Center(child: Text('Belum ada glosarium.', style: bodyFont(color: LMSPalette.muted)));
}

Widget _notFound(BuildContext context) {
  return Scaffold(
    appBar: AppBar(),
    body: Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.search_off, size: 64, color: LMSPalette.muted),
          const SizedBox(height: 12),
          Text('Mapel tidak ditemukan.', style: displayFont(size: 18, weight: FontWeight.w800)),
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: Text('Kembali', style: bodyFont()),
          ),
        ],
      ),
    ),
  );
}
