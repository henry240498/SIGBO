import 'dart:convert';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:permission_handler/permission_handler.dart';

import 'models.dart';
import 'store.dart';

/// Aviso de emergencia: prioridad maxima, pantalla completa, sonido y
/// vibracion segun preferencia del usuario, color y texto configurables.
/// Funciona con la app cerrada (lo publica el monitoreo en 2do plano).
/// [alTocar] se invoca con el id de la alerta al abrir el aviso.
class AlertaNotifier {
  static const canalId = 'sigbo_alerta_emergencia';
  static const canalMonitorId = 'sigbo_monitor';
  static final _plug = FlutterLocalNotificationsPlugin();
  static void Function(String alertaId)? alTocar;

  static String fechaHora(String iso) {
    try {
      final dt = DateTime.parse(iso).toLocal();
      final p = (int n) => n.toString().padLeft(2, '0');
      return '${p(dt.day)}/${p(dt.month)}/${dt.year} ${p(dt.hour)}:${p(dt.minute)}:${p(dt.second)}';
    } catch (_) {
      return iso;
    }
  }

  static int tsDe(Alerta a) {
    try {
      return DateTime.parse(a.creadoEn).millisecondsSinceEpoch;
    } catch (_) {
      return 0;
    }
  }

  static Future<void> inicializar() async {
    const init = InitializationSettings(
      android: AndroidInitializationSettings('@mipmap/ic_launcher'),
      iOS: DarwinInitializationSettings(),
    );
    await _plug.initialize(init, onDidReceiveNotificationResponse: (r) {
      final id = _idDePayload(r.payload);
      if (id != null && id.isNotEmpty) alTocar?.call(id);
    });
    await asegurarCanales();
  }

  static String? _idDePayload(String? payload) {
    if (payload == null || payload.isEmpty) return null;
    try {
      return (jsonDecode(payload) as Map)['id']?.toString();
    } catch (_) {
      return null;
    }
  }

  /// Android no permite mutar el sonido de un canal creado: se elimina y
  /// recrea para aplicar tono/vibracion/color del usuario.
  static Future<void> asegurarCanales() async {
    final and = _plug.resolvePlatformSpecificImplementation<
        AndroidFlutterLocalNotificationsPlugin>();
    if (and == null) return;
    final sonido = await Prefs.sonido();
    final vibrar = await Prefs.vibracion();
    final tono = await Prefs.tonoUri();
    final color = Color(await Prefs.color());
    await and.deleteNotificationChannel(canalId);
    await and.createNotificationChannel(AndroidNotificationChannel(
      canalId,
      'Alertas de emergencia',
      description: 'Solicitudes de apoyo y chofer de bomberos',
      importance: Importance.max,
      playSound: sonido,
      // Tono elegido por el usuario (content://...); null = sonido del
      // sistema. (Android no permite mutar el canal: se recrea arriba.)
      sound:
          sonido && tono.isNotEmpty ? UriAndroidNotificationSound(tono) : null,
      enableVibration: vibrar,
      vibrationPattern: vibrar
          ? Int64List.fromList([0, 800, 400, 800, 400, 800])
          : Int64List(0),
      ledColor: color,
      enableLights: true,
    ));
    await and.createNotificationChannel(const AndroidNotificationChannel(
      canalMonitorId,
      'Monitoreo en segundo plano',
      importance: Importance.low,
    ));
  }

  static Future<void> notificar(Alerta a) async {
    await asegurarCanales();
    final enc = await Prefs.encabezado();
    final color = Color(await Prefs.color());
    final cuerpo =
        '${a.tituloTipo()}\nSolicita: ${a.solicitanteNombre}\nFecha/hora: ${fechaHora(a.creadoEn)}'
        '${(a.detalle ?? '').isNotEmpty ? '\nDetalle: ${a.detalle}' : ''}';
    final det = NotificationDetails(
      android: AndroidNotificationDetails(
        canalId,
        'Alertas de emergencia',
        channelDescription: 'Solicitudes de apoyo y chofer de bomberos',
        importance: Importance.max,
        priority: Priority.max,
        category: AndroidNotificationCategory.alarm,
        visibility: NotificationVisibility.public,
        color: color,
        colorized: true,
        ongoing: true,
        autoCancel: false,
        fullScreenIntent: true,
        ticker: '$enc · ${a.tituloTipo()}',
        styleInformation: BigTextStyleInformation(cuerpo),
      ),
      iOS: const DarwinNotificationDetails(
        presentAlert: true,
        presentSound: true,
        presentBadge: true,
        interruptionLevel: InterruptionLevel.critical,
      ),
    );
    await _plug.show(
      1001 + (a.id.hashCode % 100),
      '$enc · ${a.tituloTipo()}',
      'Solicita: ${a.solicitanteNombre} · ${fechaHora(a.creadoEn)}',
      det,
      payload: jsonEncode({'id': a.id}),
    );
    // iOS no admite fullScreenIntent: la pantalla de alerta se abre al tocar.
    if (alTocar != null) alTocar!(a.id);
  }

  /// Aviso de convocatoria: mismo canal de maxima prioridad que una alerta, pero
  /// sin pantalla completa ni alarma persistente (se responde desde la app).
  static Future<void> notificarConvocatoria(ConvocatoriaApp c) async {
    await asegurarCanales();
    final enc = await Prefs.encabezado();
    final color = Color(await Prefs.color());
    final det = NotificationDetails(
      android: AndroidNotificationDetails(
        canalId,
        'Alertas de emergencia',
        channelDescription: 'Solicitudes de apoyo y chofer de bomberos',
        importance: Importance.max,
        priority: Priority.max,
        category: AndroidNotificationCategory.message,
        visibility: NotificationVisibility.public,
        color: color,
        colorized: true,
        styleInformation: BigTextStyleInformation(c.mensaje),
      ),
      iOS: const DarwinNotificationDetails(
        presentAlert: true,
        presentSound: true,
        interruptionLevel: InterruptionLevel.timeSensitive,
      ),
    );
    await _plug.show(
      2001 + (c.id.hashCode % 100),
      '$enc · CONVOCATORIA',
      c.mensaje,
      det,
      payload: jsonEncode({'id': 'conv:${c.id}'}),
    );
  }

  /// Aviso breve para una solicitud del nuevo flujo de despacho. No incluye
  /// dirección ni detalle del incidente en la pantalla bloqueada.
  static Future<bool> notificarSolicitudDespacho(String id, String tipo) async {
    if (!await Permission.notification.isGranted) return false;
    await asegurarCanales();
    final enc = await Prefs.encabezado();
    final color = Color(await Prefs.color());
    final etiqueta = switch (tipo) {
      'CHOFER' => 'Solicitud de chofer',
      'PERSONAL' => 'Solicitud de personal',
      _ => 'Solicitud rápida',
    };
    final det = NotificationDetails(
      android: AndroidNotificationDetails(
        canalId,
        'Alertas de emergencia',
        channelDescription: 'Llamados operativos de despacho',
        importance: Importance.max,
        priority: Priority.max,
        category: AndroidNotificationCategory.message,
        visibility: NotificationVisibility.private,
        color: color,
        colorized: true,
      ),
      iOS: const DarwinNotificationDetails(
        presentAlert: true,
        presentSound: true,
        interruptionLevel: InterruptionLevel.timeSensitive,
      ),
    );
    await _plug.show(
      3001 + (id.hashCode % 100),
      '$enc · LLAMADO OPERATIVO',
      '$etiqueta. Abre SIGBO para responder.',
      det,
      payload: jsonEncode({'id': 'despacho:$id'}),
    );
    return true;
  }

  static Future<void> limpiar() => _plug.cancelAll();
}
