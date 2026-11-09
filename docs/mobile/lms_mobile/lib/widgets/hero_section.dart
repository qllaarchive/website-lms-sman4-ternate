import 'package:flutter/material.dart';
import '../theme.dart';

/// Hero section seperti di website (globe + welcome + quote).
class HeroSection extends StatelessWidget {
  final String title;
  final String subtitle;
  final String quote;
  final String emoji;
  final Color accent;

  const HeroSection({
    super.key,
    required this.title,
    required this.subtitle,
    required this.quote,
    required this.emoji,
    this.accent = Colors.blue,
  });

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
        return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: LMSPalette.cardBrightness(dark),
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        border: Border.all(color: LMSPalette.lineBrightness(dark), width: 1),
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 20, 16, 16),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Ikon globe berbayang
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  color: accent.withValues(alpha: 0.15),
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: accent.withValues(alpha: 0.3),
                      blurRadius: 14,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                child: Center(
                  child: Text(
                    emoji,
                    style: bodyFont(
                      size: 42,
                      weight: FontWeight.w800,
                      color: accent,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              // Teks
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: displayFont(
                        size: 24,
                        weight: FontWeight.w800,
                        color: LMSPalette.textBrightness(dark),
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 6),
                    Text(
                      subtitle,
                      style: bodyFont(
                        size: 14,
                        weight: FontWeight.w600,
                        color: LMSPalette.mutedBrightness(dark),
                      ),
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Icon(
                          Icons.quiz,
                          size: 16,
                          color: LMSPalette.mutedBrightness(dark),
                        ),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            quote,
                            style: bodyFont(
                              size: 13,
                              weight: FontWeight.w500,
                              color: LMSPalette.mutedBrightness(dark),
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
