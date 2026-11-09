import 'package:flutter/material.dart';
import '../models/panel.dart';

class Subject {
  final String id;
  final String name;
  final String short;
  final String emoji;
  final Color color;
  final String kelas;
  final String fase;
  final String sekolah;
  final String lsKey;
  final String? scriptId;
  final String? sheetId;
  final List<String> moto;
  final List<String> sideMoto;
  final String quote;
  final String? note;
  final List<String> botQuick;
  final String botIntro;
  final String botName;
  final String about;
  final String logoText;
  final List<String> scene;
  final int kkTp;
  final List<Unit> units;
  final List<Panel> labs;
  final List<Panel> ebooks;
  final List<String> glos; // [term, definition]
  final List<Panel> forums;

  Subject({
    required this.id,
    required this.name,
    required this.short,
    required this.emoji,
    required this.color,
    required this.kelas,
    required this.fase,
    required this.sekolah,
    required this.lsKey,
    this.scriptId,
    this.sheetId,
    this.moto = const [],
    this.sideMoto = const [],
    required this.quote,
    this.note,
    this.botQuick = const [],
    required this.botIntro,
    required this.botName,
    required this.about,
    required this.logoText,
    this.scene = const [],
    required this.kkTp,
    required this.units,
    this.labs = const [],
    this.ebooks = const [],
    this.glos = const [],
    this.forums = const [],
  });

  factory Subject.fromJson(Map<String, dynamic> json) {
    // handle meta + KKTP
    var meta = json['meta'] ?? json;
    var kkTp = json['KKTP'] ?? meta['KKTP'] ?? 70;
    var unitsList = meta['UNITS'] ?? json['UNITS'] ?? [];
    var labs = meta['LABS'] ?? [];
    var ebooks = meta['EBOOKS'] ?? [];
    var glos = meta['GLOS'] ?? [];
    var forums = meta['FORUM_SEED'] ?? [];
    return Subject(
      id: meta['id'] ?? '',
      name: meta['name'] ?? '',
      short: meta['short'] ?? meta['name'] ?? '',
      emoji: meta['emoji'] ?? '📚',
      color: Color(int.parse(meta['color']!.replaceFirst('#', '0x'))),
      kelas: meta['kelas'] ?? '',
      fase: meta['fase'] ?? '',
      sekolah: meta['sekolah'] ?? '',
      lsKey: meta['lsKey'] ?? '',
      scriptId: meta['scriptId'],
      sheetId: meta['sheetId'],
      moto: List.from(meta['moto'] ?? []),
      sideMoto: List.from(meta['sideMoto'] ?? []),
      quote: meta['quote'] ?? '',
      note: meta['note'],
      botQuick: List.from(meta['botQuick'] ?? []),
      botIntro: meta['botIntro'] ?? '',
      botName: meta['botName'] ?? '',
      about: meta['about'] ?? '',
      logoText: meta['logoText'] ?? '',
      scene: List.from(meta['scene'] ?? []),
      kkTp: kkTp,
      units: unitsList.map((u) => Unit.fromJson(u)).toList(),
      labs: labs.map((l) => Panel.fromJson(l)).toList(),
      ebooks: ebooks.map((e) => Panel.fromJson(e)).toList(),
      glos: glos.map((g) => g[0] as String).toList(),
      forums: forums.map((f) => Panel.fromJson(f)).toList(),
    );
  }

  /// Cek apakah panel bisa ditampilkan (bukan tambahan internal)
  bool get hasUnits => units.isNotEmpty;
}
