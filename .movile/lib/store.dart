import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// UNICO punto de configuracion de la URL del backend.
///
/// Prioridad: Ajustes de la app (usuario) > --dart-define=SIGBO_API_URL >
/// valor de fabrica. Cambiar de red local a tunel o a servidor publico NO
/// requiere recompilar.
class SigboConfig {
  static const _keyUrl = 'backend_url';
  static const fabrica = 'http://10.0.2.2:3001/api/v1';

  static Future<String> baseUrl() async {
    final SharedPreferences p = await SharedPreferences.getInstance();
    final String? crudo = p.getString(_keyUrl);
    final String guardada = (crudo ?? '').trim().replaceAll(RegExp(r'/+$'), '');
    if (guardada.isNotEmpty) {
      _validar(guardada);
      return guardada;
    }
    const definida =
        String.fromEnvironment('SIGBO_API_URL', defaultValue: fabrica);
    final base = definida.trim().replaceAll(RegExp(r'/+$'), '');
    _validar(base);
    return base;
  }

  /// true si alguien ya eligio un servidor (no se usa el valor de fabrica, que solo sirve para el emulador).
  static Future<bool> estaConfigurado() async {
    final p = await SharedPreferences.getInstance();
    return (p.getString(_keyUrl) ?? '').trim().isNotEmpty ||
        const String.fromEnvironment('SIGBO_API_URL').trim().isNotEmpty;
  }

  static Future<void> setBaseUrl(String url) async {
    final limpia = url.trim().replaceAll(RegExp(r'/+$'), '');
    _validar(limpia);
    final p = await SharedPreferences.getInstance();
    await p.setString(_keyUrl, limpia);
  }

  static Future<void> restablecer() async {
    final p = await SharedPreferences.getInstance();
    await p.remove(_keyUrl);
  }

  static void _validar(String url) {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      throw ArgumentError('URL inválida: debe empezar con http:// o https://');
    }
  }
}

/// Tokens en almacenamiento cifrado del equipo (Keychain/Keystore).
class TokenStore {
  static final _storage = FlutterSecureStorage();
  static const _kAccess = 'sigbo_access';
  static const _kRefresh = 'sigbo_refresh';
  static const _kUser = 'sigbo_username';
  static const _kPerms = 'sigbo_permisos';

  static Future<String?> access() => _storage.read(key: _kAccess);
  static Future<String?> refresh() => _storage.read(key: _kRefresh);
  static Future<void> guardar(String access, String? refresh, String username,
      List<String> permisos) async {
    await _storage.write(key: _kAccess, value: access);
    if (refresh != null) await _storage.write(key: _kRefresh, value: refresh);
    await _storage.write(key: _kUser, value: username);
    await _storage.write(key: _kPerms, value: permisos.join(','));
  }

  static Future<String> username() async =>
      (await _storage.read(key: _kUser)) ?? '';
  static Future<Set<String>> permisos() async {
    final raw = (await _storage.read(key: _kPerms)) ?? '';
    return raw.split(',').where((e) => e.isNotEmpty).toSet();
  }

  static Future<bool> haySesion() async =>
      (await _storage.read(key: _kAccess))?.isNotEmpty == true;
  static Future<void> limpiar() => _storage.deleteAll();
}

/// Preferencias de alerta del usuario. Todo configurable.
class Prefs {
  static Future<SharedPreferences> get _p => SharedPreferences.getInstance();

  /// "Mantener sesión iniciada": la última elección, para proponerla de nuevo en el login.
  static Future<bool> mantenerSesion() async =>
      (await _p).getBool('mantener_sesion') ?? false;
  static Future<void> setMantenerSesion(bool v) async =>
      (await _p).setBool('mantener_sesion', v);

  static Future<bool> sonido() async => (await _p).getBool('sonido') ?? true;
  static Future<void> setSonido(bool v) async =>
      (await _p).setBool('sonido', v);

  /// URI de tono (content://...). Vacio = alarma del sistema.
  static Future<String> tonoUri() async => (await _p).getString('tono') ?? '';
  static Future<void> setTonoUri(String v) async =>
      (await _p).setString('tono', v);

  static Future<bool> vibracion() async =>
      (await _p).getBool('vibracion') ?? true;
  static Future<void> setVibracion(bool v) async =>
      (await _p).setBool('vibracion', v);

  static Future<int> color() async => (await _p).getInt('color') ?? 0xFFC62828;
  static Future<void> setColor(int v) async => (await _p).setInt('color', v);

  static Future<String> encabezado() async =>
      (await _p).getString('encabezado') ?? 'EMERGENCIA · BOMBEROS';
  static Future<void> setEncabezado(String v) async =>
      (await _p).setString('encabezado', v);

  static Future<bool> monitoreo() async =>
      (await _p).getBool('monitoreo') ?? true;
  static Future<void> setMonitoreo(bool v) async =>
      (await _p).setBool('monitoreo', v);

  static Future<int> intervaloSeg() async {
    final v = (await _p).getInt('intervalo') ?? 20;
    return v.clamp(10, 300);
  }

  static Future<void> setIntervaloSeg(int v) async =>
      (await _p).setInt('intervalo', v.clamp(10, 300));

  static Future<bool> ubicacion() async =>
      (await _p).getBool('ubicacion') ?? false;
  static Future<void> setUbicacion(bool v) async =>
      (await _p).setBool('ubicacion', v);

  /// Movil (vehiculo) en el que viaja este celular. Vacio = no reporta posicion.
  static Future<String> movilId() async =>
      (await _p).getString('movil_id') ?? '';
  static Future<String> movilNombre() async =>
      (await _p).getString('movil_nombre') ?? '';
  static Future<void> setMovil(String id, String nombre) async {
    final p = await _p;
    await p.setString('movil_id', id);
    await p.setString('movil_nombre', nombre);
  }

  /// Control de la comprobacion de actualizaciones (ver actualizador.dart).
  static Future<int> ultimaConsultaActualizacionMs() async =>
      (await _p).getInt('upd_ultima_consulta') ?? 0;
  static Future<void> setUltimaConsultaActualizacionMs(int v) async =>
      (await _p).setInt('upd_ultima_consulta', v);
  static Future<int> posponerActualizacionHastaMs() async =>
      (await _p).getInt('upd_posponer_hasta') ?? 0;
  static Future<void> setPosponerActualizacionHastaMs(int v) async =>
      (await _p).setInt('upd_posponer_hasta', v);

  /// Convocatorias ya avisadas en este celular (para no repetir la notificacion).
  static Future<List<String>> convocatoriasVistas() async =>
      (await _p).getStringList('conv_vistas') ?? [];
  static Future<void> setConvocatoriasVistas(List<String> ids) async =>
      (await _p).setStringList(
          'conv_vistas', ids.length > 50 ? ids.sublist(ids.length - 50) : ids);

  /// Ultimo usuario que inicio sesion (para no mezclar datos guardados entre personas).
  static Future<String> ultimoUsuario() async =>
      (await _p).getString('ultimo_usuario') ?? '';
  static Future<void> setUltimoUsuario(String v) async =>
      (await _p).setString('ultimo_usuario', v);

  static Future<int> ultimaVistaMs() async =>
      (await _p).getInt('ultima_ts') ?? 0;
  static Future<void> setUltimaVistaMs(int v) async =>
      (await _p).setInt('ultima_ts', v);
}
