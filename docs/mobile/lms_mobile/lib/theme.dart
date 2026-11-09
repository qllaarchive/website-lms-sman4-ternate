import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Warna dari lms.css (CSS variables).
///
/// Light: --bg:#eef3fb --card:#fff --ink:#18213d --muted:#5a6683 --line:#d9e2f1 --soft:#f5f8fe
///            --navy:#0e2a6e --navy2:#163a8f --sun:#ffc531
///            --e1:#e0532e --e2:#1f6fe5 --e3:#1f9d55 --e4:#9333ea --lab:#7446e8
///
/// Dark (prefers-color-scheme:dark, tanpa data-theme="light"):
///            --bg:#0b1222 --card:#131d33 --ink:#e7edf9 --muted:#9eabc8 --line:#24314f --soft:#18233c
///            --navy:#0a1d4d --navy2:#122d70 --sun:#fcd34d
///            --e1:#ff8a5c --e2:#6aa3ff --e3:#46c97c --e4:#c084fc --lab:#a789ff
class LMSPalette {
  static const Color bg = Color(0xFFEEF3FB);
  static const Color card = Color(0xFFFFFFFF);
  static const Color ink = Color(0xFF18213D);
  static const Color muted = Color(0xFF5A6683);
  static const Color line = Color(0xFFD9E2F1);
  static const Color soft = Color(0xFFF5F8FE);
  static const Color navy = Color(0xFF0E2A6E);
  static const Color navy2 = Color(0xFF163A8F);
  static const Color navyInk = Color(0xFFE4ECFF);
  static const Color blue = Color(0xFF1F6FE5);
  static const Color sun = Color(0xFFFFC531);
  static const Color e1 = Color(0xFFE0532E);
  static const Color e2 = Color(0xFF1F6FE5);
  static const Color e3 = Color(0xFF1F9D55);
  static const Color e4 = Color(0xFF9333EA);
  static const Color lab = Color(0xFF7446E8);
  static const Color good = Color(0xFF15803D);
  static const Color bad = Color(0xFFD92D2D);

  // dark theme
  static const Color dbgBg = Color(0xFF0B1222);
  static const Color dbgCard = Color(0xFF131D33);
  static const Color dbgInk = Color(0xFFE7EDF9);
  static const Color dbgMuted = Color(0xFF9EABC8);
  static const Color dbgLine = Color(0xFF24314F);
  static const Color dbgSoft = Color(0xFF18233C);
  static const Color dbgNavy = Color(0xFF0A1D4D);
  static const Color dbgNavy2 = Color(0xFF122D70);
  static const Color dbgSun = Color(0xFFFCD34D);
  static const Color dbgE1 = Color(0xFFFF8A5C);
  static const Color dbgE2 = Color(0xFF6AA3FF);
  static const Color dbgE3 = Color(0xFF46C97C);
  static const Color dbgE4 = Color(0xFFC084FC);
  static const Color dbgLab = Color(0xFFA789FF);

  static Color textBrightness(bool dark) =>
      dark ? dbgInk : ink;
  static Color mutedBrightness(bool dark) =>
      dark ? dbgMuted : muted;
  static Color lineBrightness(bool dark) =>
      dark ? dbgLine : line;
  static Color softBrightness(bool dark) =>
      dark ? dbgSoft : soft;
  static Color navyBrightness(bool dark) =>
      dark ? dbgNavy : navy;
  static Color blueBrightness(bool dark) =>
      dark ? dbgE2 : blue;
  static Color sunBrightness(bool dark) =>
      dark ? dbgSun : sun;
  static Color e1Brightness(bool dark) =>
      dark ? dbgE1 : e1;
  static Color e2Brightness(bool dark) =>
      dark ? dbgE2 : e2;
  static Color e3Brightness(bool dark) =>
      dark ? dbgE3 : e3;
  static Color e4Brightness(bool dark) =>
      dark ? dbgE4 : e4;
  static Color labBrightness(bool dark) =>
      dark ? dbgLab : lab;
  static Color cardBrightness(bool dark) =>
      dark ? dbgCard : card;
  static Color bgBrightness(bool dark) =>
      dark ? dbgBg : bg;
}

/// ThemeData yang mencerminkan desain website LMS.
/// Gunakan Theme.of(context).brightness untuk terang/gelap.
ThemeData lmsTheme(bool dark) {
    final base = dark ? ThemeData.dark() : ThemeData.light();

  return ThemeData(
    useMaterial3: true,
    brightness: dark ? Brightness.dark : Brightness.light,
    colorScheme: ColorScheme.fromSeed(
      seedColor: LMSPalette.navy,
      brightness: dark ? Brightness.dark : Brightness.light,
    ),
    scaffoldBackgroundColor: LMSPalette.bgBrightness(dark),
    appBarTheme: AppBarTheme(
      backgroundColor: LMSPalette.cardBrightness(dark),
      elevation: 0,
      iconTheme: IconThemeData(color: LMSPalette.textBrightness(dark)),
      titleTextStyle: GoogleFonts.baloo2(
        color: LMSPalette.textBrightness(dark),
        fontSize: 20,
        fontWeight: FontWeight.w700,
      ),
      surfaceTintColor: Colors.transparent,
    ),
    cardTheme: CardThemeData(
      color: LMSPalette.cardBrightness(dark),
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
    ),
    dividerColor: LMSPalette.lineBrightness(dark),
    popupMenuTheme: PopupMenuThemeData(
      color: LMSPalette.cardBrightness(dark),
      elevation: 16,
    ),
    textTheme: GoogleFonts.nunitoTextTheme(
      base.textTheme.apply(
        bodyColor: LMSPalette.textBrightness(dark),
        displayColor: LMSPalette.textBrightness(dark),
      ),
    ).apply(
      displayColor: LMSPalette.textBrightness(dark),
      bodyColor: LMSPalette.textBrightness(dark),
    ),
    // custom: placeholder agar mudah diambil
  );
}

/// Helper untuk mengambil font display (Baloo 2) / body (Nunito) sesuai tema.
TextStyle displayFont({double? size, FontWeight weight = FontWeight.w700, Color? color}) {
  return GoogleFonts.baloo2(
    fontSize: size, fontWeight: weight, color: color ?? LMSPalette.ink,
  );
}

TextStyle bodyFont({double? size, FontWeight weight = FontWeight.normal, Color? color}) {
  return GoogleFonts.nunito(
    fontSize: size, fontWeight: weight, color: color ?? LMSPalette.ink,
  );
}

/// Semua warna halus (gradient, bg card, dll.) sesuai lms.css
class LMSColors {
  static const Color background = LMSPalette.bg;
  static const Color card = LMSPalette.card;
  static const Color ink = LMSPalette.ink;
  static const Color muted = LMSPalette.muted;
  static const Color line = LMSPalette.line;
  static const Color soft = LMSPalette.soft;
  static const Color navy = LMSPalette.navy;
  static const Color blue = LMSPalette.blue;
  static const Color sun = LMSPalette.sun;
  static const Color e1 = LMSPalette.e1;
  static const Color e2 = LMSPalette.e2;
  static const Color e3 = LMSPalette.e3;
  static const Color e4 = LMSPalette.e4;
  static const Color lab = LMSPalette.lab;
  static const Color good = LMSPalette.good;
  static const Color bad = LMSPalette.bad;
}
