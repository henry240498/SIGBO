import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;
import 'package:uuid/uuid.dart';

import 'models.dart';
import 'offline.dart';
import 'store.dart';

/// Cliente del backend SIGBO existente. Reutiliza:
/// - POST /auth/login y /auth/refresh con `X-SIGBO-Dispositivo: movil`
///   (devuelve tokens en JSON para apps nativas).
/// - GET/POST/PATCH /alertas con `Authorization: Bearer`.
/// - GET /alertas/stream (SSE) para tiempo real en red local.
class SigboApi implements ClienteSigbo {
  static const _movil = {'X-SIGBO-Dispositivo': 'movil'};
  final _uuid = const Uuid();

  Future<Usuario> login(String usuario, String clave,
      {bool? mantenerSesion}) async {
    final base = await SigboConfig.baseUrl();
    final res = await http
        .post(Uri.parse('$base/auth/login'),
            headers: {'Content-Type': 'application/json', ..._movil},
            body: jsonEncode({
              'usernameOrEmail': usuario,
              'password': clave,
              if (mantenerSesion != null) 'mantenerSesion': mantenerSesion,
              'dispositivo': _equipo(),
            }))
        .timeout(const Duration(seconds: 20));
    if (res.statusCode != 200 && res.statusCode != 201) {
      throw ApiException(_mensaje(res, 'No se pudo iniciar sesión'),
          codigo: res.statusCode);
    }
    final j = jsonDecode(res.body) as Map<String, dynamic>;
    final access = (j['accessToken'] ?? '').toString();
    if (access.isEmpty) {
      throw ApiException('El servidor no devolvió token de acceso');
    }
    final u = Usuario.fromJson(j['usuario'] as Map<String, dynamic>);
    // Otro usuario en el mismo celular no debe ver datos guardados ni enviar operaciones ajenas.
    final anterior = await Prefs.ultimoUsuario();
    if (anterior.isNotEmpty && anterior != u.username)
      await Offline.borrarTodo();
    await Prefs.setUltimoUsuario(u.username);
    await TokenStore.guardar(
        access, j['refreshToken']?.toString(), u.username, u.permisos);
    return u;
  }

  /// Sistema del celular, solo para que la auditoría sepa desde qué equipo se inició sesión.
  static String _equipo() {
    final v = Platform.operatingSystemVersion;
    return 'Android ${v.length > 80 ? v.substring(0, 80) : v}';
  }

  /// Llamada autenticada generica (con renovacion de sesion). No lanza por codigos HTTP:
  /// el llamador decide (ver offline.dart). Si no hay red, lanza la excepcion de red.
  @override
  Future<http.Response> llamar(String metodo, String ruta,
          {Map<String, dynamic>? body}) =>
      _authed(metodo, ruta, body: body);

  /// Envía las visitas de pantalla acumuladas por el observador de navegación.
  /// El servidor deduplica cada evento por su clave de idempotencia.
  Future<void> registrarNavegacion(List<Map<String, dynamic>> eventos,
      {required String dispositivo}) async {
    if (eventos.isEmpty) return;
    final res = await _authed('POST', '/navegacion', body: {
      'dispositivo': dispositivo,
      'eventos': eventos,
    });
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw ApiException(
          _mensaje(res, 'No se pudo sincronizar la auditoría de navegación'),
          codigo: res.statusCode);
    }
  }

  @override
  String mensajeDe(http.Response res, String defecto) => _mensaje(res, defecto);

  /// Sube un archivo con renovacion de sesion. Las peticiones multipart no se pueden reutilizar:
  /// si hay que renovar el token, se arma una nueva.
  @override
  Future<http.Response> subir(
      String ruta, Map<String, String> campos, String archivoPath) async {
    final base = await SigboConfig.baseUrl();
    Future<http.Response> intento(String? token) async {
      final req = http.MultipartRequest('POST', Uri.parse('$base$ruta'))
        ..headers.addAll(
            {..._movil, if (token != null) 'Authorization': 'Bearer $token'})
        ..fields.addAll(campos)
        ..files.add(await http.MultipartFile.fromPath('archivo', archivoPath));
      return http.Response.fromStream(
          await req.send().timeout(const Duration(seconds: 60)));
    }

    var res = await intento(await TokenStore.access());
    if (res.statusCode == 401 && await _intentarRefresh())
      res = await intento(await TokenStore.access());
    return res;
  }

  /// Descarga el contenido (por ejemplo una foto) con sesion.
  Future<List<int>> descargar(String ruta) async {
    final res = await _authed('GET', ruta);
    if (res.statusCode != 200)
      throw ApiException(_mensaje(res, 'No se pudo descargar'),
          codigo: res.statusCode);
    return res.bodyBytes;
  }

  /// Moviles entre los que un celular puede elegir (requiere vehiculos:posicion).
  Future<List<MovilBasico>> listarMoviles() async {
    final res = await _authed('GET', '/flota/moviles-reporte');
    if (res.statusCode != 200) {
      throw ApiException(
          _mensaje(res, 'No se pudo obtener la lista de móviles'),
          codigo: res.statusCode);
    }
    final arr = jsonDecode(res.body) as List;
    return arr
        .map((e) => MovilBasico.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  /// Informa la posicion del movil. El servidor ignora lecturas mas viejas.
  Future<void> reportarPosicion(String movilId, double lat, double lng,
      {double? velocidadKmh, double? precisionM, DateTime? cuando}) async {
    final res =
        await _authed('POST', '/flota/moviles/$movilId/posicion', body: {
      'latitud': lat,
      'longitud': lng,
      if (velocidadKmh != null) 'velocidadKmh': velocidadKmh,
      if (precisionM != null) 'precisionM': precisionM,
      if (cuando != null) 'registradoEn': cuando.toUtc().toIso8601String(),
    });
    if (res.statusCode != 200 && res.statusCode != 201) {
      throw ApiException(_mensaje(res, 'No se pudo informar la posición'),
          codigo: res.statusCode);
    }
  }

  /// Convocatorias abiertas con la respuesta propia (requiere servicios:ver).
  Future<List<ConvocatoriaApp>> convocatoriasAbiertas() async {
    final res = await _authed('GET', '/convocatorias/abiertas');
    if (res.statusCode != 200) {
      throw ApiException(_mensaje(res, 'No se pudo obtener las convocatorias'),
          codigo: res.statusCode);
    }
    final arr = jsonDecode(res.body) as List;
    return arr
        .map((e) => ConvocatoriaApp.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  /// Responde VOY (con minutos estimados) o NO_PUEDO.
  Future<void> responderConvocatoria(String id, String respuesta,
      {int? etaMinutos, String? motivo}) async {
    final res = await _authed('POST', '/convocatorias/$id/respuesta', body: {
      'respuesta': respuesta,
      if (etaMinutos != null) 'etaMinutos': etaMinutos,
      if (motivo != null && motivo.isNotEmpty) 'motivo': motivo,
    });
    if (res.statusCode != 200 && res.statusCode != 201) {
      throw ApiException(_mensaje(res, 'No se pudo enviar la respuesta'),
          codigo: res.statusCode);
    }
  }

  Future<void> marcarConvocatoriaEnCamino(String id) async {
    final res = await _authed('POST', '/convocatorias/$id/en-camino');
    if (res.statusCode != 200 && res.statusCode != 201) {
      throw ApiException(_mensaje(res, 'No se pudo actualizar el estado'),
          codigo: res.statusCode);
    }
  }

  Future<void> cancelarAsistenciaConvocatoria(String id,
      {String? motivo}) async {
    final res =
        await _authed('POST', '/convocatorias/$id/cancelar-asistencia', body: {
      if (motivo != null && motivo.isNotEmpty) 'motivo': motivo,
    });
    if (res.statusCode != 200 && res.statusCode != 201) {
      throw ApiException(_mensaje(res, 'No se pudo cancelar la asistencia'),
          codigo: res.statusCode);
    }
  }

  /// Canal de eventos operativos filtrado por el backend según usuario y permiso.
  StreamSubscription<Map<String, dynamic>> escucharSseDespacho(
      void Function(Map<String, dynamic>) alEvento) {
    final ctrl = StreamController<Map<String, dynamic>>();
    final sub = ctrl.stream.listen(alEvento);
    ctrl.onCancel = () => ctrl.close();
    _bucleSseDespacho(ctrl);
    return sub;
  }

  Future<void> _bucleSseDespacho(
      StreamController<Map<String, dynamic>> ctrl) async {
    final client = http.Client();
    try {
      while (!ctrl.isClosed) {
        try {
          final base = await SigboConfig.baseUrl();
          final access = await TokenStore.access();
          if (access == null || access.isEmpty) {
            await Future.delayed(const Duration(seconds: 15));
            continue;
          }
          final req = http.Request('GET', Uri.parse('$base/despacho/stream'));
          req.headers['Authorization'] = 'Bearer $access';
          req.headers['Accept'] = 'text/event-stream';
          final res = await client.send(req);
          if (res.statusCode != 200) {
            await Future.delayed(const Duration(seconds: 10));
            continue;
          }
          var buffer = '';
          await for (final chunk in res.stream.transform(utf8.decoder)) {
            if (ctrl.isClosed) break;
            buffer += chunk;
            final partes = buffer.split('\n\n');
            buffer = partes.removeLast();
            for (final evento in partes) {
              for (final linea in evento.split('\n')) {
                final l = linea.trim();
                if (!l.startsWith('data:')) continue;
                final dato = l.substring(5).trim();
                if (dato.isEmpty || dato == '[DONE]') continue;
                try {
                  ctrl.add(Map<String, dynamic>.from(jsonDecode(dato) as Map));
                } catch (_) {}
              }
            }
          }
        } catch (_) {
          if (!ctrl.isClosed) await Future.delayed(const Duration(seconds: 10));
        }
      }
    } finally {
      client.close();
    }
  }

  Future<void> logout() async {
    try {
      final base = await SigboConfig.baseUrl();
      final rt = await TokenStore.refresh();
      final at = await TokenStore.access();
      if (rt != null && at != null) {
        await http
            .post(Uri.parse('$base/auth/logout'),
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer $at',
                  ..._movil
                },
                body: jsonEncode({'refreshToken': rt}))
            .timeout(const Duration(seconds: 15));
      }
    } catch (_) {
      // Salir local aunque falle la red.
    }
    await TokenStore.limpiar();
  }

  Future<ResultadoAlerta> crearAlerta(
    String tipo, {
    String? detalle,
    double? lat,
    double? lng,
    // Clave propia para reintentos offline: la cola la reutiliza y el
    // servidor responde la alerta original en vez de duplicar.
    String? clave,
  }) async {
    // Clave de idempotencia por pulsacion intencional: reintentos de red
    // con la misma clave devuelven la alerta original (sin duplicar).
    final body = <String, dynamic>{
      'tipo': tipo,
      'claveIdempotencia': clave ?? _uuid.v4(),
      if (detalle != null && detalle.trim().isNotEmpty)
        'detalle': detalle.trim(),
      if (lat != null) 'latitud': lat,
      if (lng != null) 'longitud': lng,
    };
    final res = await _authed('POST', '/alertas', body: body);
    if (res.statusCode != 200 && res.statusCode != 201) {
      throw ApiException(_mensaje(res, 'No se pudo registrar la solicitud'),
          codigo: res.statusCode);
    }
    final j = jsonDecode(res.body) as Map<String, dynamic>;
    return ResultadoAlerta(
      alerta: Alerta.fromJson(j['alerta'] as Map<String, dynamic>),
      duplicada: j['duplicada'] == true,
    );
  }

  Future<List<Alerta>> listar({String? estado, int limite = 50}) async {
    var ruta = '/alertas?limite=$limite';
    if (estado != null && estado.isNotEmpty) ruta += '&estado=$estado';
    final res = await _authed('GET', ruta);
    if (res.statusCode != 200) {
      throw ApiException(_mensaje(res, 'No se pudo obtener alertas'),
          codigo: res.statusCode);
    }
    final arr = jsonDecode(res.body) as List;
    return arr.map((e) => Alerta.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<List<Alerta>> pendientes() => listar(estado: 'PENDIENTE');

  Future<Alerta> cambiarEstado(String id, String estado,
      {String? motivo}) async {
    final body = <String, dynamic>{
      'estado': estado,
      if (motivo != null && motivo.trim().isNotEmpty) 'motivo': motivo.trim(),
    };
    final res = await _authed('PATCH', '/alertas/$id/estado', body: body);
    if (res.statusCode != 200) {
      throw ApiException(_mensaje(res, 'No se pudo cambiar el estado'),
          codigo: res.statusCode);
    }
    return Alerta.fromJson(jsonDecode(res.body) as Map<String, dynamic>);
  }

  /// Stream SSE del backend. Emite alertas creadas/atendidas en tiempo real.
  /// Se reconecta solo con [controller] abierto; llamar `cancelar()`.
  StreamSubscription<Alerta> escucharSse(void Function(Alerta) alEvento) {
    late StreamSubscription<Alerta> sub;
    final ctrl = StreamController<Alerta>();
    sub = ctrl.stream.listen(alEvento);
    _bucleSse(ctrl);
    return sub;
  }

  Future<void> _bucleSse(StreamController<Alerta> ctrl) async {
    final client = http.Client();
    try {
      while (!ctrl.isClosed) {
        try {
          final base = await SigboConfig.baseUrl();
          final at = await TokenStore.access();
          if (at == null || at.isEmpty) {
            await Future.delayed(const Duration(seconds: 30));
            continue;
          }
          final req = http.Request('GET', Uri.parse('$base/alertas/stream'));
          req.headers['Authorization'] = 'Bearer $at';
          req.headers['Accept'] = 'text/event-stream';
          final res = await client.send(req);
          if (res.statusCode != 200) {
            await Future.delayed(const Duration(seconds: 15));
            continue;
          }
          var buffer = '';
          await for (final chunk in res.stream.transform(utf8.decoder)) {
            if (ctrl.isClosed) break;
            buffer += chunk;
            final partes = buffer.split('\n\n');
            buffer = partes.removeLast();
            for (final evento in partes) {
              for (final linea in evento.split('\n')) {
                final l = linea.trim();
                if (l.startsWith('data:')) {
                  final dato = l.substring(5).trim();
                  if (dato.isNotEmpty && dato != '[DONE]') {
                    try {
                      ctrl.add(Alerta.fromJson(
                          jsonDecode(dato) as Map<String, dynamic>));
                    } catch (_) {}
                  }
                }
              }
            }
          }
        } catch (_) {
          if (!ctrl.isClosed) {
            await Future.delayed(const Duration(seconds: 15));
          }
        }
      }
    } finally {
      client.close();
    }
  }

  // ---- HTTP interno con refresh automatico ----

  Future<http.Response> _authed(String metodo, String ruta,
      {Map<String, dynamic>? body}) async {
    final base = await SigboConfig.baseUrl();
    Future<http.Response> llamada(String? token) {
      final h = {
        'Content-Type': 'application/json',
        ..._movil,
        if (token != null) 'Authorization': 'Bearer $token',
      };
      final uri = Uri.parse('$base$ruta');
      switch (metodo) {
        case 'POST':
          return http
              .post(uri, headers: h, body: jsonEncode(body ?? {}))
              .timeout(const Duration(seconds: 20));
        case 'PATCH':
          return http
              .patch(uri, headers: h, body: jsonEncode(body ?? {}))
              .timeout(const Duration(seconds: 20));
        default:
          return http.get(uri, headers: h).timeout(const Duration(seconds: 20));
      }
    }

    var res = await llamada(await TokenStore.access());
    if (res.statusCode == 401 && await _intentarRefresh()) {
      res = await llamada(await TokenStore.access());
    }
    return res;
  }

  Future<bool> _intentarRefresh() async {
    try {
      final base = await SigboConfig.baseUrl();
      final rt = await TokenStore.refresh();
      if (rt == null || rt.isEmpty) return false;
      final res = await http
          .post(Uri.parse('$base/auth/refresh'),
              headers: {'Content-Type': 'application/json', ..._movil},
              body: jsonEncode({'refreshToken': rt}))
          .timeout(const Duration(seconds: 20));
      if (res.statusCode != 200 && res.statusCode != 201) return false;
      final j = jsonDecode(res.body) as Map<String, dynamic>;
      final access = (j['accessToken'] ?? '').toString();
      if (access.isEmpty) return false;
      final u = Usuario.fromJson(j['usuario'] as Map<String, dynamic>);
      await TokenStore.guardar(
          access, j['refreshToken']?.toString(), u.username, u.permisos);
      return true;
    } catch (_) {
      return false;
    }
  }

  String _mensaje(http.Response res, String defecto) {
    try {
      final j = jsonDecode(res.body);
      if (j is Map && j['message'] != null) {
        final m = j['message'];
        if (m is List) return m.join('; ');
        return m.toString();
      }
    } catch (_) {}
    return defecto;
  }
}

class ApiException implements Exception {
  final String mensaje;
  final int codigo;
  ApiException(this.mensaje, {this.codigo = -1});
  @override
  String toString() => mensaje;
}
