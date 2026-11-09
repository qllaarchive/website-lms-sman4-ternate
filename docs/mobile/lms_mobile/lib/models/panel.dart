import 'package:flutter/material.dart';

/// Data panel (unit, lab, ebook, forum, dll.) yang dipakai di SubjectDetail.
class Panel {
  final String id;
  final Color? color;
  final String title;
  final String? subtitle;
  final String emoji;
  final String type; // 'unit' | 'lab' | 'ebook' | 'forum' | 'glossary'
  final List<dynamic> rows; // tergantung type

  Panel({
    required this.id,
    this.color,
    required this.title,
    this.subtitle,
    required this.emoji,
    required this.type,
    this.rows = const [],
  });

  factory Panel.fromJson(Map<String, dynamic> json) {
    String type = json['type'] ?? 'unit';
    List rows = json['rows'] ?? json['items'] ?? json['events'] ?? [];
    if (type == 'unit' && json['focus'] != null) {
      rows = json['focus'];
    }
    Color? color;
    if (json['color'] != null) {
      color = Color(int.parse(json['color'].toString().replaceFirst('#', '0x')));
    }
    return Panel(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      subtitle: json['desc'] ?? '',
      emoji: json['emoji'] ?? '📌',
      type: type,
      rows: rows,
      color: color,
    );
  }
}

/// Ringkasan materi satu unit (dari UNITS).
class Unit {
  final int no;
  final int el;
  final int sem;
  final String title;
  final String? desc;
  final String emoji;
  final List<dynamic> focus;   // [[term, rumus], ...]
  final List<dynamic> model;   // [[kalimat, rumus], ...]
  final List diag;             // soal diagnostik
  final List form;             // latihan formatif
  final List quiz;             // kuis
  final String? task;
  final String? disc;
  final Map proj;              // {title, steps, rub: [[n,a],[n,a]]}
  final List refl;             // pertanyaan refleksi
  final List meet;             // [[jp, topic, act], ...]

  Unit({required this.no, required this.el, required this.sem, required this.title,
    this.desc, required this.emoji, this.focus = const [], this.model = const [],
    this.diag = const [], this.form = const [], this.quiz = const [],
    this.task, this.disc, this.proj = const {}, this.refl = const [], this.meet = const []});

  factory Unit.fromJson(Map<String, dynamic> json) {
    return Unit(
      no: json['n'] ?? 0,
      el: json['el'] ?? 0,
      sem: json['sem'] ?? 0,
      title: json['title'] ?? '',
      desc: json['desc'],
      emoji: json['emoji'] ?? '📌',
      focus: json['focus'] ?? [],
      model: json['model'] ?? [],
      diag: json['diag'] ?? [],
      form: json['form'] ?? [],
      quiz: json['quiz'] ?? [],
      task: json['task'],
      disc: json['disc'],
      proj: json['proj'] ?? {},
      refl: json['refl'] ?? [],
      meet: json['meet'] ?? [],
    );
  }
}
