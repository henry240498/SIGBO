import 'dart:convert';

import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;
import 'package:uuid/uuid.dart';

import 'matpel_documento.dart';

/// Adaptador al mismo motor del servidor, compilado dentro del APK.
/// La edición solo aporta datos verificados; no se ejecuta código descargado.
class MotorGreLocal {
  final DocumentoGre documento;
  final MethodChannel canal;
  final String _sesion = const Uuid().v4();
  Future<Map<String, dynamic>>? _inicio;
  bool _cerrado = false;
  MotorGreLocal(this.documento,
      {this.canal = const MethodChannel('org.cbvc.sigbo/gre-local')});

  Future<Map<String, dynamic>> _invocar(String metodo,
      {String? accion, Object? datos}) async {
    if (_cerrado) throw StateError('La consulta local se cerró.');
    final raw = await canal.invokeMethod<String>(metodo, {
      'sesion': _sesion,
      if (accion != null)
        'json': jsonEncode({'accion': accion, 'datos': datos}),
    }).timeout(const Duration(seconds: 50));
    if (_cerrado) throw StateError('La consulta local se cerró.');
    final r = jsonDecode(raw ?? '') as Map<String, dynamic>;
    if (r['ok'] != true)
      throw StateError(r['mensaje'] ?? 'Motor local no disponible.');
    return Map<String, dynamic>.from(r['data'] as Map);
  }

  Future<Map<String, dynamic>> iniciar() => _inicio ??= _preparar();
  Future<Map<String, dynamic>> _preparar() async {
    final raw = await rootBundle.loadString('assets/gre/motor.json');
    final m = jsonDecode(raw) as Map<String, dynamic>;
    if (documento.interpretacion == null ||
        documento.manifest['documentoSha256'] != m['documentoSha256'] ||
        documento.manifest['versionInterpretacion'] !=
            m['versionInterpretacion']) {
      throw const FormatException(
          'La edición guardada no es compatible con el motor de este APK. Descargá una edición compatible con conexión.');
    }
    return _invocar('inicializar', accion: 'inicializar', datos: {
      'manifest': documento.manifest,
      'contenido': documento.contenido,
      'interpretacion': documento.interpretacion,
    });
  }

  Future<void> cerrar() async {
    _cerrado = true;
    await canal.invokeMethod<void>('cerrar', {'sesion': _sesion});
  }

  http.Response _respuesta(Object datos, [int codigo = 200]) =>
      http.Response.bytes(utf8.encode(jsonEncode(datos)), codigo,
          headers: {'content-type': 'application/json; charset=utf-8'});

  /// Conserva el contrato de lectura de la pantalla guiada; jamás llama a la red.
  Future<http.Response> llamar(String metodo, String ruta,
      {Map<String, dynamic>? body}) async {
    try {
      if (_cerrado) throw StateError('La consulta local se cerró.');
      final estado = await iniciar();
      final u = Uri.parse(ruta);
      final segmentos = u.pathSegments;
      if (u.queryParameters['versionGreId'] != null &&
          u.queryParameters['versionGreId'] != documento.versionId) {
        throw const FormatException(
            'La petición no corresponde a la edición guardada.');
      }
      if (metodo == 'GET' && u.path == '/matpel/estado')
        return _respuesta(estado);
      if (metodo == 'POST' && u.path == '/matpel/evaluaciones/consulta-v2') {
        return _respuesta(
            await _invocar('consultar', accion: 'evaluar', datos: body));
      }
      if (metodo != 'GET')
        throw const FormatException('Operación local no admitida.');
      if (u.path == '/matpel/buscar') {
        final q = normalizarGre(u.queryParameters['q'] ?? '');
        if (q.length < 2 || q.length > 120)
          throw const FormatException('Consulta local inválida.');
        final guia = RegExp(r'^\d{3}$').hasMatch(q);
        final guias = guia ? documento.buscar(q) : <Map<String, dynamic>>[];
        final items = guia
            ? documento
                .registros('entradas')
                .where((e) => guias.any((g) => g['id'] == e['guiaId']))
                .toList()
            : documento.buscar(q);
        final desde = int.tryParse(u.queryParameters['cursor'] ?? '0');
        if (desde == null || desde < 0 || desde > items.length)
          throw const FormatException('Página local inválida.');
        return _respuesta({
          'versionGreId': documento.versionId,
          'items': items.skip(desde).take(20).toList(),
          'guias': guias,
          'cursor': desde + 20 < items.length ? '${desde + 20}' : null
        });
      }
      if (segmentos.length == 3 && segmentos[1] == 'materiales') {
        return _respuesta(await _invocar('consultar',
            accion: 'ficha', datos: segmentos.last));
      }
      if (segmentos.length == 3 && segmentos[1] == 'fuentes') {
        final f = documento.porId('referencias', segmentos.last);
        if (f == null)
          throw const FormatException('Fuente no disponible en esta edición.');
        final p = documento
            .registros('paginas')
            .firstWhere((p) => p['paginaPdf'] == f['paginaPdf']);
        return _respuesta({
          ...f,
          'etiquetasImpresas': jsonDecode(p['etiquetasImpresasJson'] ?? '[]')
        });
      }
      if (segmentos.length == 3 && segmentos[1] == 'guias') {
        final g = documento
            .registros('guias')
            .firstWhere((g) => g['numero'] == segmentos.last);
        return _respuesta(
            {'guia': g, 'bloques': documento.bloquesGuia(g['id'])});
      }
      if (segmentos.length >= 2 && segmentos[1] == 'secciones') {
        final id = segmentos.length == 3 ? segmentos.last : null;
        return _respuesta({
          'secciones': documento
              .registros('secciones')
              .where((s) => id == null || s['id'] == id)
              .toList(),
          'bloques': id == null
              ? []
              : documento
                  .registros('bloques')
                  .where((b) => b['seccionId'] == id && b['guiaId'] == null)
                  .toList()
        });
      }
      return _respuesta({'message': 'Lectura local no disponible.'}, 404);
    } on FormatException catch (e) {
      return _respuesta({'message': e.message}, 422);
    } on StateError catch (e) {
      return _respuesta({'message': '${e.message}'}, 422);
    } on PlatformException catch (e) {
      return _respuesta(
          {'message': e.message ?? 'Motor Android no disponible.'}, 503);
    }
  }
}
