import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:sigbo_alertas/api.dart';
import 'package:sigbo_alertas/offline.dart';

class Falso implements ClienteSigbo {
  final List<Object> respuestas;
  final List<String> subidas = [];
  Falso(this.respuestas);

  @override
  Future<http.Response> llamar(String metodo, String ruta, {Map<String, dynamic>? body}) async => throw StateError('no se esperaba llamar');

  @override
  Future<http.Response> subir(String ruta, Map<String, String> campos, String archivoPath) async {
    subidas.add('$ruta|${campos['claveIdempotencia']}|${campos['tomadoEn'] != null ? 'con-hora' : 'sin-hora'}|${archivoPath.split(RegExp(r'[\/]')).last}');
    final r = respuestas.removeAt(0);
    if (r is Exception) throw r;
    return r as http.Response;
  }

  @override
  String mensajeDe(http.Response res, String defecto) {
    try {
      final j = jsonDecode(res.body);
      if (j is Map && j['message'] != null) return j['message'].toString();
    } catch (_) {}
    return defecto;
  }
}

http.Response ok() => http.Response('{}', 201);
http.Response err(int c, [String m = 'mal']) => http.Response(jsonEncode({'message': m}), c);
const sinRed = SocketException('sin red');

void main() {
  late Directory tmp;
  late File foto;

  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    tmp = await Directory.systemTemp.createTemp('sigbo_test_');
    Offline.carpetaArchivos = () async => Directory('${tmp.path}/pendientes');
    foto = File('${tmp.path}/foto.jpg')..writeAsBytesSync([1, 2, 3, 4]);
  });

  tearDown(() async {
    if (await tmp.exists()) await tmp.delete(recursive: true);
  });

  Future<int> archivosGuardados() async {
    final d = Directory('${tmp.path}/pendientes');
    return await d.exists() ? d.list().length : 0;
  }

  const campos = {'entidad': 'VEHICULO', 'entidadId': 'V1', 'tipo': 'FOTO', 'claveIdempotencia': 'clave-1234567'};

  test('con conexion se sube y no se guarda ninguna copia', () async {
    final api = Falso([ok()]);
    expect(await Offline.ejecutarArchivo(api, '/adjuntos', campos, foto.path, 'Foto'), Destino.enviado);
    expect(await Offline.pendientes(), 0);
    expect(await archivosGuardados(), 0);
    expect(api.subidas.single, '/adjuntos|clave-1234567|sin-hora|foto.jpg');
  });

  test('sin conexion se guarda una copia propia y la hora en que se tomo', () async {
    expect(await Offline.ejecutarArchivo(Falso([sinRed]), '/adjuntos', campos, foto.path, 'Foto del movil 1'), Destino.encolado);
    final cola = await Offline.cola();
    expect(cola.single.archivo, isNotNull);
    expect(cola.single.archivo, isNot(foto.path)); // copia, no el original
    expect(File(cola.single.archivo!).readAsBytesSync(), [1, 2, 3, 4]);
    expect(cola.single.cuerpo['tomadoEn'], isNotNull);
    expect(await archivosGuardados(), 1);
  });

  test('aunque se borre el original, la copia sigue y se envia despues, con la misma clave', () async {
    await Offline.ejecutarArchivo(Falso([sinRed]), '/adjuntos', campos, foto.path, 'Foto');
    foto.deleteSync();
    final api = Falso([ok()]);
    final r = await Offline.vaciar(api);
    expect([r.enviadas, r.restantes, r.rechazadas], [1, 0, 0]);
    expect(api.subidas.single, startsWith('/adjuntos|clave-1234567|con-hora|'));
    expect(await archivosGuardados(), 0); // enviada: se borra la copia
  });

  test('un fallo de red conserva el archivo y el orden; un rechazo lo anota y borra la copia', () async {
    await Offline.ejecutarArchivo(Falso([sinRed]), '/adjuntos', campos, foto.path, 'Foto A');
    await Offline.ejecutarArchivo(Falso([sinRed]), '/adjuntos', {...campos, 'claveIdempotencia': 'clave-7654321'}, foto.path, 'Foto B');
    final cae = await Offline.vaciar(Falso([sinRed]));
    expect([cae.enviadas, cae.restantes], [0, 2]);
    expect(await archivosGuardados(), 2);
    final r = await Offline.vaciar(Falso([err(404, 'ya no existe el registro'), ok()]));
    expect([r.enviadas, r.rechazadas, r.restantes], [1, 1, 0]);
    expect((await Offline.rechazos()).single.motivo, 'ya no existe el registro');
    expect(await archivosGuardados(), 0);
  });

  test('si la copia desaparecio, se informa en vez de trabar la cola', () async {
    await Offline.ejecutarArchivo(Falso([sinRed]), '/adjuntos', campos, foto.path, 'Foto');
    for (final f in Directory('${tmp.path}/pendientes').listSync()) {
      f.deleteSync();
    }
    final r = await Offline.vaciar(Falso([]));
    expect([r.enviadas, r.rechazadas, r.restantes], [0, 1, 0]);
    expect((await Offline.rechazos()).single.motivo, contains('ya no existe'));
  });

  test('un rechazo inmediato no deja nada en cola ni copias', () async {
    await expectLater(
      Offline.ejecutarArchivo(Falso([err(400, 'no es una imagen')]), '/adjuntos', campos, foto.path, 'Foto'),
      throwsA(isA<ApiException>()),
    );
    expect(await Offline.pendientes(), 0);
    expect(await archivosGuardados(), 0);
  });

  test('borrarTodo (cambio de usuario) tambien borra las copias de archivos', () async {
    await Offline.ejecutarArchivo(Falso([sinRed]), '/adjuntos', campos, foto.path, 'Foto');
    expect(await archivosGuardados(), 1);
    await Offline.borrarTodo();
    expect(await archivosGuardados(), 0);
    expect(await Offline.pendientes(), 0);
  });
}
