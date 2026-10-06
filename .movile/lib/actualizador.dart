import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:ota_update/ota_update.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:permission_handler/permission_handler.dart';

import 'clave_publica.dart';
import 'store.dart';
import 'verificacion_version.dart';

/// Version publicada en el servidor (GET /app-movil/version).
class VersionPublicada {
  final int codigo;
  final String nombre;
  final bool obligatoria;
  final String notas;
  final int tamanioBytes;
  final String sha256;

  VersionPublicada({
    required this.codigo,
    required this.nombre,
    required this.obligatoria,
    required this.notas,
    required this.tamanioBytes,
    required this.sha256,
  });

  String get tamanioLegible => '${(tamanioBytes / (1024 * 1024)).toStringAsFixed(1)} MB';
}

/// Resultado de consultar al servidor: una version utilizable, o el motivo por el
/// que una version publicada fue rechazada (firma invalida).
class ResultadoConsulta {
  final VersionPublicada? version;
  final String? problema;
  const ResultadoConsulta({this.version, this.problema});
}

/// Actualizacion propia de la app: consulta al servidor SIGBO, descarga el APK
/// (con verificacion SHA-256) y abre el instalador de Android. Sin tiendas ni
/// servicios de terceros. Android exige que el usuario confirme la instalacion
/// y, la primera vez, permita "instalar apps desconocidas" a esta aplicacion:
/// por eso se lo explicamos paso a paso antes de pedirlo.
class Actualizador {
  static const _minEntreConsultasMs = 6 * 60 * 60 * 1000; // 6 h
  static const _posponerMs = 24 * 60 * 60 * 1000; // 24 h

  /// Devuelve la version publicada SOLO si es mayor que la instalada Y su firma
  /// digital es valida. Una version con firma ausente o invalida se rechaza y se
  /// informa en `problema`: nunca se ofrece ni se descarga.
  static Future<ResultadoConsulta> consultar() async {
    if (!Platform.isAndroid) return const ResultadoConsulta();
    try {
      final base = await SigboConfig.baseUrl();
      final res = await http
          .get(Uri.parse('$base/app-movil/version'))
          .timeout(const Duration(seconds: 12));
      if (res.statusCode != 200) return const ResultadoConsulta();
      final j = jsonDecode(res.body) as Map<String, dynamic>;
      if (j['disponible'] != true) return const ResultadoConsulta();
      final instalada =
          int.tryParse((await PackageInfo.fromPlatform()).buildNumber) ?? 0;
      final codigo = (j['versionCodigo'] as num).toInt();
      if (codigo <= instalada) return const ResultadoConsulta();

      final datos = DatosVersion(
        codigo: codigo,
        nombre: (j['versionNombre'] ?? '').toString(),
        obligatoria: j['obligatoria'] == true,
        notas: (j['notas'] ?? '').toString(),
        tamanioBytes: (j['tamanioBytes'] as num?)?.toInt() ?? 0,
        sha256: (j['sha256'] ?? '').toString(),
      );
      final firmada = datos.sha256.length == 64 &&
          await firmaValida(
              datos, (j['firma'] ?? '').toString(), kClavePublicaActualizaciones);
      if (!firmada) {
        return const ResultadoConsulta(
            problema:
                'El servidor público una versión sin firma válida del cuartel. Por seguridad no se instalará. Avise al administrador.');
      }
      return ResultadoConsulta(
        version: VersionPublicada(
          codigo: datos.codigo,
          nombre: datos.nombre,
          obligatoria: datos.obligatoria,
          notas: datos.notas,
          tamanioBytes: datos.tamanioBytes,
          sha256: datos.sha256,
        ),
      );
    } catch (_) {
      return const ResultadoConsulta();
    }
  }

  static Future<String> versionInstalada() async {
    final p = await PackageInfo.fromPlatform();
    return '${p.version} (${p.buildNumber})';
  }

  /// Comprobacion automatica al abrir la app: no molesta mas de una vez cada
  /// 6 h, y "Mas tarde" la silencia 24 h (salvo que sea obligatoria).
  static Future<void> comprobarAlAbrir(BuildContext context) async {
    final ahora = DateTime.now().millisecondsSinceEpoch;
    if (ahora - await Prefs.ultimaConsultaActualizacionMs() < _minEntreConsultasMs) {
      return;
    }
    await Prefs.setUltimaConsultaActualizacionMs(ahora);
    final v = (await consultar()).version;
    if (v == null || !context.mounted) return;
    if (!v.obligatoria && ahora < await Prefs.posponerActualizacionHastaMs()) {
      return;
    }
    await _ofrecer(context, v);
  }

  /// Boton "Buscar actualizaciones" de Ajustes: siempre responde algo.
  static Future<void> comprobarManual(BuildContext context) async {
    final mensajes = ScaffoldMessenger.of(context);
    mensajes.showSnackBar(const SnackBar(content: Text('Buscando actualizaciones…')));
    final r = await consultar();
    final v = r.version;
    mensajes.hideCurrentSnackBar();
    if (!context.mounted) return;
    if (r.problema != null) {
      await showDialog<void>(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('Actualización rechazada'),
          content: Text(r.problema!),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cerrar')),
          ],
        ),
      );
      return;
    }
    if (v == null) {
      mensajes.showSnackBar(const SnackBar(
          content: Text('La aplicación está al día (o no se pudo consultar el servidor).')));
      return;
    }
    await _ofrecer(context, v);
  }

  static Future<void> _ofrecer(BuildContext context, VersionPublicada v) async {
    final aceptar = await showDialog<bool>(
      context: context,
      barrierDismissible: !v.obligatoria,
      builder: (ctx) => PopScope(
        canPop: !v.obligatoria,
        child: AlertDialog(
          title: Text('Nueva versión ${v.nombre}'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (v.notas.isNotEmpty) Text(v.notas),
                if (v.notas.isNotEmpty) const SizedBox(height: 12),
                Text('Tamaño de la descarga: ${v.tamanioLegible}.'),
                const SizedBox(height: 8),
                const Text(
                    'Se descargará y Android le pedirá confirmar la instalación. '
                    'Sus ajustes y su sesión se conservan.'),
                if (v.obligatoria) ...[
                  const SizedBox(height: 8),
                  const Text(
                      'Esta actualización es obligatoria para seguir usando la aplicación.',
                      style: TextStyle(fontWeight: FontWeight.bold)),
                ],
              ],
            ),
          ),
          actions: [
            if (!v.obligatoria)
              TextButton(
                  onPressed: () => Navigator.pop(ctx, false),
                  child: const Text('Más tarde')),
            FilledButton(
                onPressed: () => Navigator.pop(ctx, true),
                child: const Text('Actualizar ahora')),
          ],
        ),
      ),
    );
    if (aceptar != true) {
      await Prefs.setPosponerActualizacionHastaMs(
          DateTime.now().millisecondsSinceEpoch + _posponerMs);
      return;
    }
    if (!context.mounted) return;
    if (!await _asegurarPermisoInstalar(context)) return;
    if (!context.mounted) return;
    await _descargarEInstalar(context, v);
  }

  /// Android pide, una sola vez, "Permitir desde esta fuente" para esta app.
  /// No se puede conceder por codigo: se abre la pantalla y se guia al usuario.
  static Future<bool> _asegurarPermisoInstalar(BuildContext context) async {
    if (await Permission.requestInstallPackages.isGranted) return true;
    for (var intento = 0; intento < 3; intento++) {
      if (!context.mounted) return false;
      final abrir = await showDialog<bool>(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('Falta un permiso'),
          content: const Text(
              'Para instalar la actualización, Android necesita que usted '
              'permita a esta aplicación instalar aplicaciones.\n\n'
              '1. Pulse «Abrir ajustes».\n'
              '2. Active «Permitir desde esta fuente».\n'
              '3. Vuelva con la flecha atrás de Android.\n\n'
              'Solo se pide una vez.'),
          actions: [
            TextButton(
                onPressed: () => Navigator.pop(ctx, false),
                child: const Text('Cancelar')),
            FilledButton(
                onPressed: () => Navigator.pop(ctx, true),
                child: const Text('Abrir ajustes')),
          ],
        ),
      );
      if (abrir != true) return false;
      final estado = await Permission.requestInstallPackages.request();
      if (estado.isGranted) return true;
      if (await Permission.requestInstallPackages.isGranted) return true;
    }
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('No se concedió el permiso. Puede reintentar desde Ajustes > Buscar actualizaciones.')));
    }
    return false;
  }

  static Future<void> _descargarEInstalar(BuildContext context, VersionPublicada v) async {
    final base = await SigboConfig.baseUrl();
    final progreso = ValueNotifier<String>('Preparando descarga…');
    final ota = OtaUpdate();
    StreamSubscription<OtaEvent>? sub;
    var terminado = false;

    if (!context.mounted) return;
    unawaited(showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => PopScope(
        canPop: false,
        child: AlertDialog(
          title: const Text('Actualizando'),
          content: ValueListenableBuilder<String>(
            valueListenable: progreso,
            builder: (_, texto, __) => Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const LinearProgressIndicator(),
                const SizedBox(height: 12),
                Text(texto),
              ],
            ),
          ),
        ),
      ),
    ));

    void cerrarDialogo() {
      if (context.mounted) Navigator.of(context, rootNavigator: true).pop();
    }

    final fin = Completer<void>();
    try {
      sub = ota
          .execute(
            '$base/app-movil/descargar',
            destinationFilename: 'sigbo-alertas-${v.codigo}.apk',
            sha256checksum: v.sha256,
          )
          .listen((e) {
        switch (e.status) {
          case OtaStatus.DOWNLOADING:
            progreso.value = 'Descargando… ${e.value ?? '0'} %';
            break;
          case OtaStatus.INSTALLING:
            terminado = true;
            progreso.value = 'Abriendo el instalador de Android…';
            // Android muestra su propia pantalla: aqui basta cerrar la nuestra.
            Future.delayed(const Duration(seconds: 2), () {
              cerrarDialogo();
              if (!fin.isCompleted) fin.complete();
            });
            break;
          case OtaStatus.INSTALLATION_DONE:
            if (!fin.isCompleted) fin.complete();
            break;
          default:
            if (!terminado) {
              terminado = true;
              cerrarDialogo();
              _avisarError(context, e);
            }
            if (!fin.isCompleted) fin.complete();
        }
      }, onError: (Object _) {
        if (!terminado) {
          terminado = true;
          cerrarDialogo();
          _avisarError(context, OtaEvent(OtaStatus.INTERNAL_ERROR, null));
        }
        if (!fin.isCompleted) fin.complete();
      }, onDone: () {
        if (!fin.isCompleted) fin.complete();
      });
      await fin.future;
    } finally {
      await sub?.cancel();
      progreso.dispose();
    }

    if (terminado && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          duration: Duration(seconds: 8),
          content: Text('En la pantalla de Android pulse «Instalar». La aplicación se reiniciará sola.')));
    }
  }

  static void _avisarError(BuildContext context, OtaEvent e) {
    if (!context.mounted) return;
    final texto = switch (e.status) {
      OtaStatus.PERMISSION_NOT_GRANTED_ERROR =>
        'Falta el permiso para instalar aplicaciones. Intente de nuevo y siga los pasos.',
      OtaStatus.CHECKSUM_ERROR =>
        'El archivo descargado no coincide con el publicado. No se instalo. Intente de nuevo.',
      OtaStatus.DOWNLOAD_ERROR =>
        'No se pudo descargar. Revise la conexión con el servidor e intente de nuevo.',
      OtaStatus.CANCELED => 'Descarga cancelada.',
      OtaStatus.ALREADY_RUNNING_ERROR => 'Ya hay una descarga en curso.',
      _ => 'No se pudo completar la actualización (${e.value ?? e.status.name}).',
    };
    showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('No se pudo actualizar'),
        content: Text(texto),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cerrar')),
        ],
      ),
    );
  }
}
