import 'package:flutter/material.dart';
import '../theme.dart';

/// Segmented control (kelas X / XI / XII) seperti website.
class ClassFilter extends StatelessWidget {
  final int selected;
  final ValueChanged<int> onChanged;
  final List<String> labels;
  final List<IconData> icons;

  const ClassFilter({
    super.key,
    required this.selected,
    required this.onChanged,
    this.labels = const ['X', 'XI', 'XII'],
    this.icons = const [Icons.school, Icons.school, Icons.school],
  });

  @override
  Widget build(BuildContext context) {
    final dark = Theme.of(context).brightness == Brightness.dark;
        return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8),
      child: Row(
        children: List.generate(labels.length, (i) {
          final isSelected = selected == i;
          return Expanded(
            child: Material(
              color: isSelected
                  ? (dark ? LMSPalette.navyBrightness(dark) : LMSPalette.blue)
                  : (dark ? LMSPalette.dbgSoft : LMSPalette.soft),
              borderRadius: BorderRadius.circular(12),
              child: InkWell(
                onTap: () => onChanged(i),
                borderRadius: BorderRadius.circular(12),
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        icons[i],
                        size: 22,
                        color: isSelected
                            ? Colors.white
                            : LMSPalette.mutedBrightness(dark),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        labels[i],
                        style: bodyFont(
                          size: 13,
                          weight: FontWeight.w700,
                          color: isSelected
                              ? Colors.white
                              : LMSPalette.mutedBrightness(dark),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          );
        }),
      ),
    );
  }
}
