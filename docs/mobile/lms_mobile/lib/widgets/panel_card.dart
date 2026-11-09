import 'package:flutter/material.dart';
import '../models/panel.dart';
import '../theme.dart';

/// Card umum untuk panel (unit, lab, ebook, forum, glossary).
class PanelCard extends StatelessWidget {
  final Panel panel;
  final VoidCallback? onTap;

  const PanelCard({super.key, required this.panel, this.onTap});

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
        final rows = panel.rows;

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      color: LMSPalette.cardBrightness(dark),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                children: [
                  Container(
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      color: panel.color ?? LMSPalette.navy,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: panel.color ?? LMSPalette.e2,
                        width: 1.5,
                      ),
                    ),
                    child: Center(
                      child: Text(
                        panel.emoji,
                        style: bodyFont(
                          size: 20,
                          weight: FontWeight.w800,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          panel.title,
                          style: displayFont(
                            size: 17,
                            weight: FontWeight.w800,
                            color: LMSPalette.textBrightness(dark),
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        if (panel.subtitle != null &&
                            panel.subtitle!.isNotEmpty)
                          Text(
                            panel.subtitle!,
                            style: bodyFont(
                              size: 12,
                              weight: FontWeight.w500,
                              color: LMSPalette.mutedBrightness(dark),
                            ),
                          ),
                      ],
                    ),
                  ),
                  Icon(
                    Icons.chevron_right,
                    size: 24,
                    color: LMSPalette.mutedBrightness(dark),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              // Isi
              if (rows.isNotEmpty)
                SizedBox(
                  height: 120,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: rows.length,
                    itemBuilder: (ctx, i) {
                      final row = rows[i];
                      if (row is List) {
                        final text = (row.length >= 2) ? row[1] : (row[0] ?? '');
                        return Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: _MiniItem(text: text),
                        );
                      }
                      final text = row.toString();
                      return Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: _MiniItem(text: text),
                      );
                    },
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class _MiniItem extends StatelessWidget {
  final String text;
  const _MiniItem({required this.text});

  @override
  Widget build(BuildContext context) {
    final color = LMSPalette.e2;
    return Container(
      width: 150,
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Text(
        text,
        style: bodyFont(
          size: 11,
          weight: FontWeight.w600,
          color: color,
        ),
        maxLines: 2,
        overflow: TextOverflow.ellipsis,
      ),
    );
  }
}
