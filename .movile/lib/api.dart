import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:uuid/uuid.dart';

import 'models.dart';
import 'store.dart';

/// Cliente del backend SIGBO existente. Reutiliza:
/// - POST /auth/login y /auth/refresh con `X-SIGBO-Dispositivo: movil`
///   (devuelve tokens en JSON para apps nativas).
/// - GET/POST/PATCH /alertas con `Authorization: Bearer`.
/// - GET /alertas/stream (SSE) para tiempo real en red local.
class SigboApi {
  static const _movil = {'X-SIGBO-Dispositivo': 'movil'};
  final _uuid = const Uuid();

  Future<Usuario> login(String usuario, String clave) async {
    final base = await SigboConfig.baseUrl();
    final res = await http
        .post(Uri.parse('$base/auth/login'),
            headers: {'Content-Type': 'application/json', ..._movil},
            body: jsonEncode(
                {'usernameOrEmail': usuario, 'password': clave}))
        .timeout(const Duration(seconds: 20));
    if (res.statusCode != 200 && res.statusCode != 201) {
      throw ApiException(_mensaje(res, 'No se pudo iniciar sesion'),
          codigo: res.statusCode);
    }
    final j = jsonDecode(res.body) as Map<String, dynamic>;
    final access = (j['accessToken'] ?? '').toString();
    if (access.isEmpty) {
      throw ApiException('El servidor no devolvio token de acceso');
    }
    final u = Usuario.fromJson(j['usuario'] as Map<String, dynamic>);
    await TokenStore.guardar(
        access, j['refreshToken']?.toString(), u.username, u.permisos);
    return u;
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
  }) async {
    // Clave de idempotencia por pulsacion intencional: reintentos de red
    // con la misma clave devuelven la alerta original (sin duplicar).
    final body = <String, dynamic>{
      'tipo': tipo,
      'claveIdempotencia': _uuid.v4(),
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
