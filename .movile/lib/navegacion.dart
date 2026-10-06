import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';

import 'api.dart';
import 'store.dart';

/// Registra visitas a las pantallas institucionales y conserva la cola sin red.
/// Solo se envían códigos que existen en seguridad.pantallas.
class NavegacionAuditoria extends NavigatorObserver
    with WidgetsBindingObserver {
  NavegacionAuditoria._();

  static final instancia = NavegacionAuditoria._();
  static const _claveCola = 'sigbo_navegacion_pendiente_v1';
  static const _claveDispositivo = 'sigbo_dispositivo_auditoria_v1';
  static const _uuid = Uuid();
  static final _codigosValidos = RegExp(r'^0xA[0-9A-F]{3}$');
  final _api = SigboApi();
  final List<Map<String, dynamic>> _eventos = [];
  Future<void> _serie = Future<void>.value();
  bool _inicializada = false;
  bool _raizConSesion = false;
  String? _codigoActual;
  String? _servicioActual;
  String? _claveActual;

  Future<void> inicializar() async {
    if (_inicializada) return;
    _inicializada = true;
    WidgetsBinding.instance.addObserver(this);
    final preferencias = await SharedPreferences.getInstance();
    final crudo = preferencias.getString(_claveCola);
    if (crudo != null) {
      try {
        _eventos.addAll((jsonDecode(crudo) as List)
            .whereType<Map>()
            .map((e) => Map<String, dynamic>.from(e)));
        // Si el proceso terminó antes de capturar la salida, se conserva la
        // entrada sin inventar hora de salida ni duración.
        for (final evento in _eventos.where((e) => e['salida'] == null)) {
          evento['recuperado'] = true;
        }
      } catch (_) {
        await preferencias.remove(_claveCola);
      }
    }
    _encadenar(_enviarPendientes);
  }

  /// Da oportunidad al usuario actual de enviar sus visitas antes de revocar
  /// el token local al cerrar sesión.
  Future<void> cerrarSesion() async {
    await _serie;
    await _cerrarActual(DateTime.now().toUtc());
    _codigoActual = null;
    _servicioActual = null;
    _raizConSesion = false;
    await _enviarPendientes();
  }

  /// Registra el Inicio cuando una sesión segura ya restaurada se muestra en
  /// la ruta raíz (sin crear una navegación artificial para la interfaz).
  void iniciarPantalla(String codigo) {
    if (!_codigosValidos.hasMatch(codigo)) return;
    _raizConSesion = true;
    final instante = DateTime.now().toUtc();
    _encadenar(() async {
      await _cerrarActual(instante);
      await _abrir(codigo, null, instante);
      await _enviarPendientes();
    });
  }

  @override
  void didPush(Route<dynamic> route, Route<dynamic>? previousRoute) {
    super.didPush(route, previousRoute);
    _transicion(route);
  }

  @override
  void didPop(Route<dynamic> route, Route<dynamic>? previousRoute) {
    super.didPop(route, previousRoute);
    if (_pantalla(route) != null || _esCierre(route)) {
      if (_pantalla(previousRoute) != null || _esCierre(previousRoute)) {
        _transicion(previousRoute);
      } else {
        _cerrarSinDestino();
      }
    }
  }

  @override
  void didRemove(Route<dynamic> route, Route<dynamic>? previousRoute) {
    super.didRemove(route, previousRoute);
    if (_pantalla(route) != null || _esCierre(route)) {
      if (_pantalla(previousRoute) != null || _esCierre(previousRoute)) {
        _transicion(previousRoute);
      } else if (_codigoActual == _pantalla(route)) {
        _cerrarSinDestino();
      }
    }
  }

  @override
  void didReplace({Route<dynamic>? newRoute, Route<dynamic>? oldRoute}) {
    super.didReplace(newRoute: newRoute, oldRoute: oldRoute);
    if (_pantalla(oldRoute) != null ||
        _esCierre(oldRoute) ||
        _pantalla(newRoute) != null ||
        _esCierre(newRoute)) {
      _transicion(newRoute);
    }
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.paused ||
        state == AppLifecycleState.detached) {
      final instante = DateTime.now().toUtc();
      _encadenar(() async {
        await _cerrarActual(instante);
        await _enviarPendientes();
      });
    } else if (state == AppLifecycleState.resumed && _codigoActual != null) {
      final codigo = _codigoActual!;
      final servicio = _servicioActual;
      final instante = DateTime.now().toUtc();
      _encadenar(() async {
        await _cerrarActual(instante);
        await _enviarPendientes();
        await _abrir(codigo, servicio, instante);
      });
    }
  }

  void _transicion(Route<dynamic>? route) {
    final codigo = _pantalla(route);
    if (codigo == null && !_esCierre(route)) return;
    final argumentos = route?.settings.arguments;
    final servicio =
        argumentos is Map ? argumentos['servicioId']?.toString() : null;
    final instante = DateTime.now().toUtc();
    _encadenar(() async {
      await _cerrarActual(instante);
      if (codigo != null) {
        await _abrir(codigo, servicio, instante);
      } else {
        _codigoActual = null;
        _servicioActual = null;
        _raizConSesion = false;
      }
      await _enviarPendientes();
    });
  }

  String? _pantalla(Route<dynamic>? route) {
    final nombre = route?.settings.name;
    if (nombre == null) return null;
    if (_codigosValidos.hasMatch(nombre)) return nombre;
    if (nombre == '/' && _raizConSesion) return '0xA001';
    return const {
      '/alerta': '0xA013',
      '/ajustes': '0xA014',
      '/servidor': '0xA015',
    }[nombre];
  }

  bool _esCierre(Route<dynamic>? route) =>
      route?.settings.name == '__cerrar_auditoria__';

  void _cerrarSinDestino() {
    final instante = DateTime.now().toUtc();
    _encadenar(() async {
      await _cerrarActual(instante);
      _codigoActual = null;
      _servicioActual = null;
      await _enviarPendientes();
    });
  }

  Future<void> _abrir(
      String codigo, String? servicioId, DateTime entrada) async {
    _codigoActual = codigo;
    _servicioActual = servicioId;
    if (codigo == '0xA001') _raizConSesion = true;
    final usuario = await TokenStore.username();
    if (usuario.isEmpty) return;
    final servidor = await SigboConfig.baseUrl();
    final clave = _uuid.v4();
    _claveActual = clave;
    _eventos.add({
      'pantalla': codigo,
      'entrada': entrada.toIso8601String(),
      'salida': null,
      if (servicioId != null && servicioId.isNotEmpty) 'servicioId': servicioId,
      'conectado': false,
      'clave': clave,
      'usuarioLocal': usuario,
      'servidorLocal': servidor,
    });
    await _guardar();
  }

  Future<void> _cerrarActual(DateTime cuando) async {
    final clave = _claveActual;
    if (clave != null) {
      final indice = _eventos.indexWhere((e) => e['clave'] == clave);
      if (indice >= 0) _eventos[indice]['salida'] = cuando.toIso8601String();
    }
    _claveActual = null;
    await _guardar();
  }

  Future<void> _enviarPendientes() async {
    final usuario = await TokenStore.username();
    if (usuario.isEmpty) return;
    final servidor = await SigboConfig.baseUrl();

    // Eventos de otra cuenta o de otro servidor quedan en su cola, nunca se
    // atribuyen a la sesión que esté activa ahora.
    final listos = _eventos
        .where((e) =>
            e['usuarioLocal'] == usuario &&
            e['servidorLocal'] == servidor &&
            (e['salida'] is String || e['recuperado'] == true))
        .take(200)
        .toList();
    if (listos.isEmpty) {
      await _guardar();
      return;
    }

    final claves = listos.map((e) => e['clave']).toSet();
    for (final evento in listos) {
      evento['conectado'] = true;
    }
    await _guardar();
    try {
      await _api.registrarNavegacion(
        listos.map((e) {
          final visita = Map<String, dynamic>.from(e)
            ..remove('usuarioLocal')
            ..remove('servidorLocal')
            ..remove('recuperado');
          if (visita['salida'] == null) visita.remove('salida');
          return visita;
        }).toList(),
        dispositivo: 'SIGBO Android ${await _idDispositivo()}',
      );
      _eventos.removeWhere((e) => claves.contains(e['clave']));
      await _guardar();
    } catch (_) {
      for (final evento in listos) {
        evento['conectado'] = false;
      }
      await _guardar();
    }
  }

  Future<String> _idDispositivo() async {
    final preferencias = await SharedPreferences.getInstance();
    final existente = preferencias.getString(_claveDispositivo);
    if (existente != null && existente.isNotEmpty) return existente;
    final nuevo = _uuid.v4();
    await preferencias.setString(_claveDispositivo, nuevo);
    return nuevo;
  }

  Future<void> _guardar() async {
    // Nunca dejar crecer sin límite un registro local si el servidor pasa mucho
    // tiempo inaccesible. Los eventos activos recientes se conservan.
    if (_eventos.length > 1000) {
      final cerrados = _eventos.where((e) => e['salida'] != null).toList();
      final recientes = cerrados.length > 800
          ? cerrados.sublist(cerrados.length - 800)
          : cerrados;
      final todosAbiertos = _eventos.where((e) => e['salida'] == null).toList();
      final abiertos = todosAbiertos.length > 200
          ? todosAbiertos.sublist(todosAbiertos.length - 200)
          : todosAbiertos;
      _eventos
        ..clear()
        ..addAll(recientes)
        ..addAll(abiertos);
    }
    final preferencias = await SharedPreferences.getInstance();
    await preferencias.setString(_claveCola, jsonEncode(_eventos));
  }

  void _encadenar(Future<void> Function() accion) {
    _serie = _serie.then((_) => accion()).catchError((_) {});
  }
}
