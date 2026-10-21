# Laporan Mobile (Flutter) — LMS SMA N 4 Ternate

**Mahasiswa:** [NAMA]  
**NIM:** [NIM]  
**Tanggal:** [TANGGAL]

---

## 1. Rencana Aplikasi Mobile

### Fase 1: WebView Wrapper (Minggu 1-2)
```dart
// main.dart
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

void main() => runApp(const LmsApp());

class LmsApp extends StatelessWidget {
  const LmsApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'LMS SMAN 4 Ternate',
      theme: ThemeData(useMaterial3: true),
      home: const LmsWebView(),
    );
  }
}

class LmsWebView extends StatefulWidget {
  const LmsWebView({super.key});

  @override
  State<LmsWebView> createState() => _LmsWebViewState();
}

class _LmsWebViewState extends State<LmsWebView> {
  late final WebViewController _controller;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..loadRequest(Uri.parse('https://lms.sman4.sch.id'));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('LMS SMAN 4 Ternate')),
      body: WebViewWidget(controller: _controller),
    );
  }
}
```

### Fase 2: Native Port (Minggu 3-6)
- Kartu mapel (ListView.builder)
- Detail unit + materi
- Kuis interaktif
- Lab virtual (canvas)
- Login admin + pantau progres

### Fase 3: Offline-First (Minggu 7-8)
- Local cache: `sqflite` / `hive`
- Background sync: `workmanager`
- Conflict resolution: last-write-wins

### Fase 4: Fitur Lanjutan (Minggu 9-10)
- Biometric auth: `local_auth`
- Push notification: `firebase_messaging`
- Deep link: `app_links`
- Splash screen: `flutter_native_splash`

---

## 2. Dependensi Flutter

```yaml
dependencies:
  webview_flutter: ^4.7.0
  sqflite: ^2.3.0
  path: ^1.9.0
  workmanager: ^0.5.2
  local_auth: ^2.2.0
  firebase_messaging: ^15.1.0
  http: ^1.2.0
  shared_preferences: ^2.2.0
  flutter_secure_storage: ^9.2.2
```

---

## 3. Struktur Project

```
mobile/
├── lib/
│   ├── main.dart
│   ├── screens/
│   │   ├── home_screen.dart
│   │   ├── lms_list_screen.dart
│   │   ├── lms_detail_screen.dart
│   │   └── admin_screen.dart
│   ├── widgets/
│   │   ├── lms_card.dart
│   │   └── progress_bar.dart
│   ├── services/
│   │   ├── api_service.dart
│   │   ├── auth_service.dart
│   │   └── sync_service.dart
│   └── models/
│       └── lms_entry.dart
├── assets/
├── pubspec.yaml
└── android/ ios/
```

---

## 4. Build & Deploy

```bash
# Debug
flutter run

# Build APK
flutter build apk --release

# Build IPA (iOS)
flutter build ipa --release

# Upload ke Play Store
flutter pub global activate flutter_oss_licenses
flutter pub global run flutter_oss_licenses:generate
```

---

## 5. Hasil Pengujian
| Fitur | Android | iOS |
|-------|---------|-----|
| WebView load | ⬜ | ⬜ |
| Offline mode | ⬜ | ⬜ |
| Push notif | ⬜ | ⬜ |
| Biometric | ⬜ | ⬜ |
| APK size < 20MB | ⬜ | — |