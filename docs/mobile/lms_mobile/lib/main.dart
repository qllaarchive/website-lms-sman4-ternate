import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'theme.dart';
import 'screens/home_screen.dart';
import 'screens/subject_detail_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final prefs = await SharedPreferences.getInstance();
  final saved = prefs.getString('lms_theme');
  // Default: ikuti sistem, override kalau ada preferensi tersimpan
  final systemDark = false; // cannot read system brightness without window
  final resolved = saved == 'dark' ? true : (saved == 'light' ? false : systemDark);
  runApp(LmsApp(dark: resolved));
}

class LmsApp extends StatelessWidget {
  final bool dark;
  const LmsApp({super.key, required this.dark});

  @override
  Widget build(BuildContext context) {
    final theme = lmsTheme(dark);
    return MaterialApp(
      title: 'LMS SMAN 4 Ternate',
      theme: theme,
      darkTheme: lmsTheme(true),
      themeMode: dark ? ThemeMode.dark : ThemeMode.light,
      initialRoute: '/',
      onGenerateRoute: _routeFactory,
      debugShowCheckedModeBanner: false,
    );
  }
}

Route<dynamic> _routeFactory(RouteSettings settings) {
  final String? name = settings.name;
  if (name == '/') {
    final args = settings.arguments;
    if (args is String) return MaterialPageRoute(builder: (_) => SubjectDetailScreen(subjectId: args));
    return MaterialPageRoute(builder: (_) => const HomeScreen());
  }
  if (name != null && name.startsWith('/mapel/') && name.length > 7) {
    final id = name.substring(7);
    return MaterialPageRoute(builder: (_) => SubjectDetailScreen(subjectId: id));
  }
  return MaterialPageRoute(
    builder: (_) => Scaffold(
      appBar: AppBar(title: Text('LMS SMAN 4 Ternate')),
      body: Center(child: Text('Halaman tidak ditemukan.')),
    ),
  );
}
