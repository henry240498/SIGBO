import 'package:flutter_foreground_task/flutter_foreground_task.dart';
import 'package:workmanager/workmanager.dart';

import 'api.dart';
import 'notifier.dart';
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
      final pendientes = await api.pendientes();
      var ultima = await Prefs.ultimaVistaMs();
      final nuevas = pendientes
          .where((a) => AlertaNotifier.tsDe(a) > ultima)
          .toList()
        ..sort((a, b) =>
            AlertaNotifier.tsDe(a).compareTo(AlertaNotifier.tsDe(b)));
      for (final a in nuevas) {
        await AlertaNotifier.notificar(a);
        final ts = AlertaNotifier.tsDe(a);
        if (ts > ultima) ultima = ts;
      }
      await Prefs.setUltimaVistaMs(ultima);
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
  Future<void> onStart(DateTime timestamp, TaskStarter starter) async {}

  @override
  Future<void> onRepeatEvent(DateTime timestamp) async {
    try {
      if (!await TokenStore.haySesion()) return;
      final api = SigboApi();
      final pendientes = await api.pendientes();
      var ultima = await Prefs.ultimaVistaMs();
      final nuevas = pendientes
          .where((a) => AlertaNotifier.tsDe(a) > ultima)
          .toList()
        ..sort((a, b) =>
            AlertaNotifier.tsDe(a).compareTo(AlertaNotifier.tsDe(b)));
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

class Monitor {
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
      notificationTitle: 'SIGBO Alertas: monitoreo activo',
      notificationText: 'Recibiendo solicitudes de apoyo y chofer',
      callback: iniciarMonitorCallback,
    );
  }

  static Future<void> detener() async {
    await FlutterForegroundTask.stopService();
  }
}
