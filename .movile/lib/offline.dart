import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';

import 'api.dart';

/// Que hacer con una respuesta del servidor al enviar una operacion encolada.
enum Resolucion {
  /// 2xx: listo, se saca de la cola.
  hecho,

  /// Problema transitorio (sin sesion, servidor ocupado o caido): se conserva y se reintenta.
  reintentar,

  /// El servidor la entendio y la rechazo (datos o estado invalidos): reintentar no sirve.
  rechazada,
}

/// Regla unica de clasificacion. 401 es transitorio (la sesion se renueva al volver a entrar);
/// 408/429 y los 5xx tambien; cualquier otro 4xx es un rechazo definitivo.
Resolucion clasificarRespuesta(int status) {
  if (status >= 200 && status < 300) return Resolucion.hecho;
  if (status == 401 || status == 408 || status == 429 || status >= 500) return Resolucion.reintentar;
  return Resolucion.rechazada;
}

/// Falla de red (sin conexion, tiempo agotado, servidor inalcanzable): se encola.
bool esFalloDeRed(Object e) =>
    e is SocketException || e is TimeoutException || e is http.ClientException || e is HandshakeException;

/// Una escritura pendiente de enviar. Al encolarse guarda la hora real del hecho
/// ([cuerpo]['ocurridoEn']): el servidor la usa (acotada) en vez de la hora de llegada.
class Operacion {
  final String id;
  final String metodo;
  final String ruta;
  final Map<String, dynamic> cuerpo;
  final String descripcion;
  final String creadaEn;

  /// Si no es null, la operacion sube este archivo (copia propia, dentro de la carpeta de la app).
  final String? archivo;

  Operacion({
    required this.id,
    required this.metodo,
    required this.ruta,
    required this.cuerpo,
    required this.descripcion,
    required this.creadaEn,
    this.archivo,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'metodo': metodo,
        'ruta': ruta,
        'cuerpo': cuerpo,
        'descripcion': descripcion,
        'creadaEn': creadaEn,
        'archivo': archivo,
      };

  factory Operacion.fromJson(Map<String, dynamic> j) => Operacion(
        id: (j['id'] ?? '').toString(),
        metodo: (j['metodo'] ?? 'POST').toString(),
        ruta: (j['ruta'] ?? '').toString(),
        cuerpo: Map<String, dynamic>.from((j['cuerpo'] as Map?) ?? {}),
        descripcion: (j['descripcion'] ?? '').toString(),
        creadaEn: (j['creadaEn'] ?? '').toString(),
        archivo: j['archivo']?.toString(),
      );
}

/// Una operacion que el servidor rechazo al enviarla: se le muestra al usuario.
class Rechazo {
  final String descripcion;
  final String motivo;
  final String cuando;
  Rechazo(this.descripcion, this.motivo, this.cuando);

  Map<String, dynamic> toJson() => {'descripcion': descripcion, 'motivo': motivo, 'cuando': cuando};
  factory Rechazo.fromJson(Map<String, dynamic> j) =>
      Rechazo((j['descripcion'] ?? '').toString(), (j['motivo'] ?? '').toString(), (j['cuando'] ?? '').toString());
}

class ResultadoEnvio {
  final int enviadas;
  final int restantes;
  final int rechazadas;
  const ResultadoEnvio(this.enviadas, this.restantes, this.rechazadas);
}

/// Resultado de ejecutar una escritura: llego al servidor, o quedo en cola.
enum Destino { enviado, encolado }

class Lectura {
  final dynamic datos;
  final bool desdeCache;
  final int guardadoMs;
  const Lectura(this.datos, this.desdeCache, this.guardadoMs);
}

const _uuid = Uuid();

/// Lo minimo que la cola necesita del cliente HTTP (SigboApi lo implementa; las pruebas usan uno falso).
abstract class ClienteSigbo {
  Future<http.Response> llamar(String metodo, String ruta, {Map<String, dynamic>? body});
  String mensajeDe(http.Response res, String defecto);

  /// Sube un archivo (multipart, campo "archivo") junto con campos de texto.
  Future<http.Response> subir(String ruta, Map<String, String> campos, String archivoPath);
}

/// Nueva clave de idempotencia para una operacion que podria reintentarse.
String claveNueva() => _uuid.v4();

/// Funcionamiento sin conexion: lecturas con copia local y escrituras en cola.
class Offline {
  static const _kCola = 'offline_cola';
  static const _kRechazos = 'offline_rechazos';
  static const _kCache = 'offline_cache_';
  static const maxRechazos = 30;
  static bool _vaciando = false;

  /// Carpeta donde se guardan las copias de los archivos que esperan conexion.
  /// Se puede reemplazar en las pruebas (donde no existe el plugin de carpetas).
  static Future<Directory> Function() carpetaArchivos = () async {
    final base = await getApplicationDocumentsDirectory();
    return Directory('${base.path}/sigbo_pendientes');
  };

  /// Copia el archivo a una carpeta propia: el original (por ejemplo la foto de la camara)
  /// puede ser borrado por el sistema antes de que haya conexion.
  static Future<String> _copiar(String origen) async {
    final dir = await carpetaArchivos();
    await dir.create(recursive: true);
    final nombre = '${claveNueva()}${origen.contains('.') ? origen.substring(origen.lastIndexOf('.')) : ''}';
    final destino = File('${dir.path}/$nombre');
    await File(origen).copy(destino.path);
    return destino.path;
  }

  static Future<void> _borrarArchivo(String? ruta) async {
    if (ruta == null) return;
    try {
      final f = File(ruta);
      if (await f.exists()) await f.delete();
    } catch (_) {}
  }

  /// Sube un archivo: ahora si hay conexion; si no, queda en cola (con su copia y la hora en que se tomo).
  /// [campos] lleva `claveIdempotencia`, asi un reintento nunca guarda dos veces lo mismo.
  static Future<Destino> ejecutarArchivo(ClienteSigbo api, String ruta, Map<String, String> campos, String archivoPath, String descripcion) async {
    try {
      final res = await api.subir(ruta, campos, archivoPath);
      switch (clasificarRespuesta(res.statusCode)) {
        case Resolucion.hecho:
          return Destino.enviado;
        case Resolucion.rechazada:
          throw ApiException(api.mensajeDe(res, 'El servidor rechazó el archivo'), codigo: res.statusCode);
        case Resolucion.reintentar:
          await _encolarArchivo(ruta, campos, archivoPath, descripcion);
          return Destino.encolado;
      }
    } on ApiException {
      rethrow;
    } catch (e) {
      if (!esFalloDeRed(e)) rethrow;
      await _encolarArchivo(ruta, campos, archivoPath, descripcion);
      return Destino.encolado;
    }
  }

  static Future<void> _encolarArchivo(String ruta, Map<String, String> campos, String archivoPath, String descripcion) async {
    final copia = await _copiar(archivoPath);
    final ahora = DateTime.now().toUtc().toIso8601String();
    final ops = await cola();
    ops.add(Operacion(
      id: claveNueva(),
      metodo: 'POST',
      ruta: ruta,
      cuerpo: {...campos, 'tomadoEn': ahora},
      descripcion: descripcion,
      creadaEn: ahora,
      archivo: copia,
    ));
    await _guardarCola(ops);
  }

  // ---------------- cola ----------------

  static Future<List<Operacion>> cola() async {
    final p = await SharedPreferences.getInstance();
    final raw = p.getString(_kCola);
    if (raw == null || raw.isEmpty) return [];
    try {
      return (jsonDecode(raw) as List).map((e) => Operacion.fromJson(e as Map<String, dynamic>)).toList();
    } catch (_) {
      return [];
    }
  }

  static Future<void> _guardarCola(List<Operacion> ops) async {
    final p = await SharedPreferences.getInstance();
    await p.setString(_kCola, jsonEncode(ops.map((o) => o.toJson()).toList()));
  }

  static Future<int> pendientes() async => (await cola()).length;

  static Future<void> encolar(String metodo, String ruta, Map<String, dynamic> cuerpo, String descripcion) async {
    final ahora = DateTime.now().toUtc().toIso8601String();
    final ops = await cola();
    ops.add(Operacion(
      id: claveNueva(),
      metodo: metodo,
      ruta: ruta,
      // la hora real del hecho viaja con la operacion
      cuerpo: {...cuerpo, 'ocurridoEn': ahora},
      descripcion: descripcion,
      creadaEn: ahora,
    ));
    await _guardarCola(ops);
  }

  /// Intenta enviar ya; si no hay conexion la deja en cola. Un rechazo del servidor
  /// (datos invalidos, estado que no corresponde) se informa como [ApiException].
  static Future<Destino> ejecutar(ClienteSigbo api, String metodo, String ruta, Map<String, dynamic> cuerpo, String descripcion) async {
    try {
      final res = await api.llamar(metodo, ruta, body: cuerpo);
      switch (clasificarRespuesta(res.statusCode)) {
        case Resolucion.hecho:
          return Destino.enviado;
        case Resolucion.rechazada:
          throw ApiException(api.mensajeDe(res, 'El servidor rechazó la operación'), codigo: res.statusCode);
        case Resolucion.reintentar:
          await encolar(metodo, ruta, cuerpo, descripcion);
          return Destino.encolado;
      }
    } on ApiException {
      rethrow;
    } catch (e) {
      if (!esFalloDeRed(e)) rethrow;
      await encolar(metodo, ruta, cuerpo, descripcion);
      return Destino.encolado;
    }
  }

  /// Envia la cola EN ORDEN. Se detiene ante un fallo transitorio (para no desordenar:
  /// por ejemplo "llegada" antes que "despacho"); un rechazo definitivo se anota y sigue.
  static Future<ResultadoEnvio> vaciar(ClienteSigbo api) async {
    if (_vaciando) return ResultadoEnvio(0, (await cola()).length, 0);
    _vaciando = true;
    try {
      final ops = await cola();
      if (ops.isEmpty) return const ResultadoEnvio(0, 0, 0);
      var enviadas = 0;
      var rechazadas = 0;
      final restantes = <Operacion>[];
      var detenido = false;
      for (final op in ops) {
        if (detenido) {
          restantes.add(op);
          continue;
        }
        try {
          if (op.archivo != null && !await File(op.archivo!).exists()) {
            // La copia ya no esta (se borraron los datos de la app): no hay nada que enviar.
            rechazadas++;
            await _anotarRechazo(Rechazo(op.descripcion, 'El archivo guardado en el celular ya no existe.', DateTime.now().toIso8601String()));
            continue;
          }
          final res = op.archivo != null
              ? await api.subir(op.ruta, op.cuerpo.map((k, v) => MapEntry(k, '$v')), op.archivo!)
              : await api.llamar(op.metodo, op.ruta, body: op.cuerpo);
          switch (clasificarRespuesta(res.statusCode)) {
            case Resolucion.hecho:
              enviadas++;
              await _borrarArchivo(op.archivo);
              break;
            case Resolucion.rechazada:
              rechazadas++;
              await _borrarArchivo(op.archivo);
              await _anotarRechazo(Rechazo(op.descripcion, api.mensajeDe(res, 'Rechazada (${res.statusCode})'), DateTime.now().toIso8601String()));
              break;
            case Resolucion.reintentar:
              restantes.add(op);
              detenido = true;
              break;
          }
        } catch (e) {
          restantes.add(op);
          detenido = true;
          if (!esFalloDeRed(e)) rethrow;
        }
      }
      await _guardarCola(restantes);
      return ResultadoEnvio(enviadas, restantes.length, rechazadas);
    } finally {
      _vaciando = false;
    }
  }

  // ---------------- rechazos ----------------

  static Future<List<Rechazo>> rechazos() async {
    final p = await SharedPreferences.getInstance();
    final raw = p.getString(_kRechazos);
    if (raw == null || raw.isEmpty) return [];
    try {
      return (jsonDecode(raw) as List).map((e) => Rechazo.fromJson(e as Map<String, dynamic>)).toList();
    } catch (_) {
      return [];
    }
  }

  static Future<void> _anotarRechazo(Rechazo r) async {
    final lista = await rechazos();
    lista.add(r);
    final recortada = lista.length > maxRechazos ? lista.sublist(lista.length - maxRechazos) : lista;
    final p = await SharedPreferences.getInstance();
    await p.setString(_kRechazos, jsonEncode(recortada.map((x) => x.toJson()).toList()));
  }

  static Future<void> limpiarRechazos() async {
    final p = await SharedPreferences.getInstance();
    await p.remove(_kRechazos);
  }

  // ---------------- lecturas con copia local ----------------

  /// GET con copia local: con conexion devuelve lo nuevo y lo guarda; sin conexion, lo ultimo guardado.
  /// Si nunca se guardo nada y no hay conexion, lanza [ApiException].
  static Future<Lectura> leer(ClienteSigbo api, String ruta) async {
    final p = await SharedPreferences.getInstance();
    try {
      final res = await api.llamar('GET', ruta);
      if (res.statusCode == 200) {
        final datos = jsonDecode(res.body);
        final ahora = DateTime.now().millisecondsSinceEpoch;
        await p.setString('$_kCache$ruta', jsonEncode({'ts': ahora, 'datos': datos}));
        return Lectura(datos, false, ahora);
      }
      if (clasificarRespuesta(res.statusCode) != Resolucion.reintentar) {
        throw ApiException(api.mensajeDe(res, 'No se pudo obtener los datos'), codigo: res.statusCode);
      }
    } on ApiException {
      rethrow;
    } catch (e) {
      if (!esFalloDeRed(e)) rethrow;
    }
    final guardado = p.getString('$_kCache$ruta');
    if (guardado == null) {
      throw ApiException('Sin conexión y todavía no hay datos guardados en este celular.');
    }
    final j = jsonDecode(guardado) as Map<String, dynamic>;
    return Lectura(j['datos'], true, (j['ts'] as num?)?.toInt() ?? 0);
  }

  /// Actualiza la copia local de una lectura (actualizacion optimista: lo que el usuario acaba de
  /// hacer sin conexion se ve de inmediato; al sincronizar, la proxima lectura trae lo real).
  static Future<void> guardarLocal(String ruta, dynamic datos) async {
    final p = await SharedPreferences.getInstance();
    await p.setString('$_kCache$ruta', jsonEncode({'ts': DateTime.now().millisecondsSinceEpoch, 'datos': datos}));
  }

  /// Borra copias y cola al cerrar sesion: otro usuario no debe ver datos ni enviar operaciones ajenas.
  static Future<void> borrarTodo() async {
    for (final op in await cola()) {
      await _borrarArchivo(op.archivo);
    }
    final p = await SharedPreferences.getInstance();
    for (final k in p.getKeys().where((k) => k.startsWith(_kCache) || k == _kCola || k == _kRechazos).toList()) {
      await p.remove(k);
    }
  }
}
