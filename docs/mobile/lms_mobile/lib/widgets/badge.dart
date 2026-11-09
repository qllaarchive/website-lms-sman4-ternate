import 'package:flutter/material.dart';
import '../theme.dart';

/// Badge kecil (kelas, status, kontributor, dll.)
class LMSChip extends StatelessWidget {
  final String label;
  final Color? bg;
  final Color? text;
  final IconData? icon;
  final bool circular;

  const LMSChip({
    super.key,
    required this.label,
    this.bg,
    this.text,
    this.icon,
    this.circular = false,
  });

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
        final bgColor = bg ?? (dark ? LMSPalette.dbgNavy : LMSPalette.navy);
    final txt = text ?? Colors.white;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(circular ? 999 : 99),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null)
            Icon(icon, size: 14, color: txt,),
          if (icon != null) const SizedBox(width: 6),
          Text(
            label,
            style: bodyFont(
              size: 12,
              weight: FontWeight.w700,
              color: txt,
            ),
          ),
        ],
      ),
    );
  }
}
