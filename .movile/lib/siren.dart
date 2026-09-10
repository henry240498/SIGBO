import 'package:flutter_ringtone_player/flutter_ringtone_player.dart';
import 'package:vibration/vibration.dart';

import 'store.dart';

/// Sirena de la pantalla de alerta: tono del usuario (o alarma del sistema)
/// en bucle + vibracion, hasta que se atiende, cancela o silencia.
class Sirena {
  static bool _sonando = false;

  static Future<void> iniciar() async {
    await detener();
    _sonando = true;
    try {
      if (await Prefs.sonido()) {
        final tono = await Prefs.tonoUri();
        if (tono.isNotEmpty) {
          // Tono personalizado: se reproduce via notificacion del sistema.
          await FlutterRingtonePlayer().play(
            android: AndroidSounds.notification,
            ios: IosSounds.alarm,
            looping: true,
            asAlarm: true,
          );
        } else {
          await FlutterRingtonePlayer().play(
            android: AndroidSounds.alarm,
            ios: IosSounds.alarm,
            looping: true,
            asAlarm: true,
          );
        }
      }
    } catch (_) {}
    try {
      if (await Prefs.vibracion() && await Vibration.hasVibrator()) {
        _bucleVibracion();
      }
    } catch (_) {}
  }

  static Future<void> _bucleVibracion() async {
    while (_sonando) {
      try {
        await Vibration.vibrate(pattern: [0, 900, 300, 900, 300, 900]);
      } catch (_) {}
      await Future.delayed(const Duration(seconds: 4));
    }
  }

  static Future<void> detener() async {
    _sonando = false;
    try {
      await FlutterRingtonePlayer().stop();
    } catch (_) {}
    try {
      await Vibration.cancel();
    } catch (_) {}
  }
}
