import 'dart:convert';

import 'package:flutter_foreground_task/flutter_foreground_task.dart';
import 'package:geolocator/geolocator.dart';
import 'package:workmanager/workmanager.dart';

import 'api.dart';
import 'convocatorias.dart';
import 'notifier.dart';
import 'offline.dart';
import 'outbox.dart';
import 'store.dart';

/// Sondeo de respaldo con la app cerrada (WorkManager, minimo 15 min en
/// Android; en iOS con las limitaciones de BGTask del sistema).
/// Punto futuro FCM: publicar el mismo [AlertaNotifier.notificar] desde un
/// FirebaseMessagingService sin tocar la API ni la base.
@pragma('vm:entry-point')
void workerCallback() {
  Workmanager().executeTask((tarea, datos) async {
    try {
      if (!await TokenStore.haySesion()) return true;
      // Primero: enviar lo encolado offline (misma clave, sin duplicar).
      await Outbox.enviarPendientes();
      final api = SigboApi();
      await Offline.vaciar(api);
      final pendientes = await api.pendientes();
      var ultima = await Prefs.ultimaVistaMs();
      final nuevas = pendientes
          .where((a) => AlertaNotifier.tsDe(a) > ultima)
          .toList()
        ..sort(
            (a, b) => AlertaNotifier.tsDe(a).compareTo(AlertaNotifier.tsDe(b)));
      for (final a in nuevas) {
        await AlertaNotifier.notificar(a);
        final ts = AlertaNotifier.tsDe(a);
        if (ts > ultima) ultima = ts;
      }
      await Prefs.setUltimaVistaMs(ultima);
      await Convocatorias.revisarYAvisar();
      return true;
    } catch (_) {
      return false;
    }
  });
}

Future<void> programarSondeo() async {
  await Workmanager().initialize(workerCallback);
  await Workmanager().registerPeriodicTask(
    'sigbo-alerta-poll',
    'sigboAlertaPoll',
    frequency: const Duration(minutes: 15),
    constraints: Constraints(networkType: NetworkType.connected),
  );
}

/// Monitoreo continuo en primer plano (Android): sondea cada N segundos con
/// aviso persistente discreto. Da tiempo real en red local sin FCM.
@pragma('vm:entry-point')
void iniciarMonitorCallback() {
  FlutterForegroundTask.setTaskHandler(MonitorHandler());
}

class MonitorHandler extends TaskHandler {
  @override
  Future<void> onStart(DateTime timestamp, TaskStarter starter) async {
    await AlertaNotifier.inicializar();
  }

  @override
  Future<void> onRepeatEvent(DateTime timestamp) async {
    // Posicion del movil: independiente de las alertas; un fallo no frena el sondeo.
    await ReporteMovil.enviar();
    try {
      if (await TokenStore.haySesion()) await Offline.vaciar(SigboApi());
    } catch (_) {}
    await Convocatorias.revisarYAvisar();
    try {
      if (!await TokenStore.haySesion()) return;
      final api = SigboApi();
      await _revisarDespacho(api);
      final pendientes = await api.pendientes();
      var ultima = await Prefs.ultimaVistaMs();
      final nuevas = pendientes
          .where((a) => AlertaNotifier.tsDe(a) > ultima)
          .toList()
        ..sort(
            (a, b) => AlertaNotifier.tsDe(a).compareTo(AlertaNotifier.tsDe(b)));
      for (final a in nuevas) {
        await AlertaNotifier.notificar(a);
        final ts = AlertaNotifier.tsDe(a);
        if (ts > ultima) ultima = ts;
      }
      await Prefs.setUltimaVistaMs(ultima);
    } catch (_) {}
  }

  @override
  Future<void> onDestroy(DateTime timestamp) async {}
}

/// El monitor persistente mantiene la presencia del dispositivo y consulta el
/// despacho mientras Android conserva activo el servicio en primer plano.
/// Las entregas tardías se dejan visibles en la app, pero no se convierten en
/// alertas recibidas retrospectivamente.
Future<void> _revisarDespacho(SigboApi api) async {
  if (!(await TokenStore.permisos()).contains('despacho:responder')) return;
  final presencia = await api.llamar('POST', '/despacho/presencia');
  if (presencia.statusCode < 200 || presencia.statusCode >= 300) return;
  final respuesta = await api.llamar('GET', '/despacho/solicitudes/mias');
  if (respuesta.statusCode != 200) return;
  final solicitudes = jsonDecode(respuesta.body) as List;
  for (final item in solicitudes) {
    final solicitud = Map<String, dynamic>.from(item as Map);
    if (solicitud['miEstado'] != 'PENDIENTE' ||
        solicitud['entrega'] != 'ENVIADA' ||
        solicitud['recibidaEn'] != null) {
      continue;
    }
    final id = solicitud['solicitudId']?.toString();
    if (id == null || id.isEmpty) continue;
    try {
      final notificada = await AlertaNotifier.notificarSolicitudDespacho(
          id, '${solicitud['tipo']}');
      if (notificada) {
        await api.llamar('POST', '/despacho/solicitudes/$id/recibida');
      }
    } catch (_) {
      // Si no se pudo emitir el aviso, el backend conserva la entrega pendiente.
    }
  }
}

/// Informa la posicion del movil elegido en Ajustes, en cada ciclo del monitoreo.
class ReporteMovil {
  static Future<void> enviar() async {
    try {
      final id = await Prefs.movilId();
      if (id.isEmpty || !await TokenStore.haySesion()) return;
      final permiso = await Geolocator.checkPermission();
      if (permiso == LocationPermission.denied ||
          permiso == LocationPermission.deniedForever) {
        return;
      }
      final pos = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.high,
          timeLimit: const Duration(seconds: 15));
      // Position.speed viene en m/s y puede ser negativo si no hay dato.
      final kmh = pos.speed < 0 ? null : pos.speed * 3.6;
      await SigboApi().reportarPosicion(id, pos.latitude, pos.longitude,
          velocidadKmh: kmh == null ? null : kmh.clamp(0, 400).toDouble(),
          precisionM: pos.accuracy < 0 ? null : pos.accuracy,
          cuando: pos.timestamp);
    } catch (_) {
      // Sin red o sin GPS: se reintenta en el proximo ciclo.
    }
  }
}

class Monitor {
  /// Inicia el sondeo operativo después de autenticarse o recuperar una
  /// sesión. El usuario puede desactivarlo desde Ajustes.
  static Future<void> asegurarIniciado() async {
    if (!await Prefs.monitoreo() || !await TokenStore.haySesion()) return;
    if (!(await TokenStore.permisos()).contains('despacho:responder')) return;
    if (await FlutterForegroundTask.isRunningService) return;
    await iniciar();
  }

  static Future<void> iniciar() async {
    final intervalo = await Prefs.intervaloSeg();
    FlutterForegroundTask.init(
      androidNotificationOptions: AndroidNotificationOptions(
        channelId: AlertaNotifier.canalMonitorId,
        channelName: 'Monitoreo en segundo plano',
        channelImportance: NotificationChannelImportance.LOW,
      ),
      iosNotificationOptions:
          const IOSNotificationOptions(showNotification: false),
      foregroundTaskOptions: ForegroundTaskOptions(
        eventAction: ForegroundTaskEventAction.repeat(intervalo * 1000),
        autoRunOnBoot: true,
      ),
    );
    await FlutterForegroundTask.startService(
      notificationTitle: 'SIGBO: monitoreo activo',
      notificationText: 'Recibiendo solicitudes de apoyo y chofer',
      callback: iniciarMonitorCallback,
    );
  }

  static Future<void> detener() async {
    await FlutterForegroundTask.stopService();
  }
}
