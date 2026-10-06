import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:sigbo_alertas/api.dart';
import 'package:sigbo_alertas/offline.dart';

/// Servidor falso: cada llamada consume la siguiente respuesta programada (o lanza).
class Falso implements ClienteSigbo {
  final List<Object> respuestas;
  final List<String> vistas = [];
  final List<Map<String, dynamic>> cuerpos = [];
  Falso(this.respuestas);

  @override
  Future<http.Response> llamar(String metodo, String ruta, {Map<String, dynamic>? body}) async {
    vistas.add('$metodo $ruta');
    cuerpos.add(Map<String, dynamic>.from(body ?? {}));
    final r = respuestas.removeAt(0);
    if (r is Exception) throw r;
    return r as http.Response;
  }

  final List<String> subidas = [];

  @override
  Future<http.Response> subir(String ruta, Map<String, String> campos, String archivoPath) async {
    subidas.add('$ruta ${campos['claveIdempotencia'] ?? ''} ${campos['tomadoEn'] != null ? 'con-hora' : 'sin-hora'}');
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

http.Response ok([Object cuerpo = const {}]) => http.Response(jsonEncode(cuerpo), 200);
http.Response err(int c, [String m = 'mal']) => http.Response(jsonEncode({'message': m}), c);
const sinRed = SocketException('sin red');

void main() {
  setUp(() => SharedPreferences.setMockInitialValues({}));

  group('clasificarRespuesta', () {
    test('2xx hecho; transitorios se reintentan; el resto de 4xx se rechaza', () {
      expect(clasificarRespuesta(200), Resolucion.hecho);
      expect(clasificarRespuesta(201), Resolucion.hecho);
      for (final c in [401, 408, 429, 500, 502, 503]) {
        expect(clasificarRespuesta(c), Resolucion.reintentar, reason: '$c');
      }
      for (final c in [400, 403, 404, 409, 422]) {
        expect(clasificarRespuesta(c), Resolucion.rechazada, reason: '$c');
      }
    });
    test('reconoce fallos de red', () {
      expect(esFalloDeRed(sinRed), isTrue);
      expect(esFalloDeRed(TimeoutException('x')), isTrue);
      expect(esFalloDeRed(http.ClientException('x')), isTrue);
      expect(esFalloDeRed(ArgumentError('x')), isFalse);
    });
  });

  group('ejecutar', () {
    test('con conexion se envia y no queda nada en cola', () async {
      final api = Falso([ok()]);
      expect(await Offline.ejecutar(api, 'POST', '/flota/despachos', {'a': 1}, 'Despacho'), Destino.enviado);
      expect(await Offline.pendientes(), 0);
      expect(api.cuerpos.single.containsKey('ocurridoEn'), isFalse); // online: manda la hora del servidor
    });
    test('sin conexion queda en cola con la hora real del hecho', () async {
      expect(await Offline.ejecutar(Falso([sinRed]), 'POST', '/flota/despachos', {'a': 1}, 'Despacho'), Destino.encolado);
      final cola = await Offline.cola();
      expect(cola, hasLength(1));
      expect(DateTime.parse(cola.single.cuerpo['ocurridoEn'] as String).isUtc, isTrue);
      expect(cola.single.descripcion, 'Despacho');
    });
    test('un 5xx tambien se encola; un rechazo del servidor se informa y NO se encola', () async {
      await Offline.ejecutar(Falso([err(503)]), 'POST', '/x', {}, 'a');
      expect(await Offline.pendientes(), 1);
      await expectLater(
        Offline.ejecutar(Falso([err(409, 'El movil ya salio')]), 'POST', '/y', {}, 'b'),
        throwsA(isA<ApiException>().having((e) => e.mensaje, 'mensaje', 'El movil ya salio')),
      );
      expect(await Offline.pendientes(), 1);
    });
  });

  group('vaciar', () {
    Future<void> sembrar() async {
      await Offline.ejecutar(Falso([sinRed]), 'POST', '/1', {}, 'uno');
      await Offline.ejecutar(Falso([sinRed]), 'PATCH', '/2', {}, 'dos');
      await Offline.ejecutar(Falso([sinRed]), 'POST', '/3', {}, 'tres');
    }

    test('envia todo en orden y deja la cola vacia', () async {
      await sembrar();
      final api = Falso([ok(), ok(), ok()]);
      final r = await Offline.vaciar(api);
      expect([r.enviadas, r.restantes, r.rechazadas], [3, 0, 0]);
      expect(api.vistas, ['POST /1', 'PATCH /2', 'POST /3']);
      expect(await Offline.pendientes(), 0);
    });
    test('al primer fallo de red se detiene y conserva el orden del resto', () async {
      await sembrar();
      final api = Falso([ok(), sinRed]);
      final r = await Offline.vaciar(api);
      expect([r.enviadas, r.restantes], [1, 2]);
      expect((await Offline.cola()).map((o) => o.descripcion), ['dos', 'tres']);
      expect(api.vistas, hasLength(2)); // no intento la tercera
    });
    test('un rechazo definitivo se anota y sigue con las demas', () async {
      await sembrar();
      final r = await Offline.vaciar(Falso([ok(), err(409, 'ya estaba despachado'), ok()]));
      expect([r.enviadas, r.rechazadas, r.restantes], [2, 1, 0]);
      final rech = await Offline.rechazos();
      expect(rech.single.descripcion, 'dos');
      expect(rech.single.motivo, 'ya estaba despachado');
      await Offline.limpiarRechazos();
      expect(await Offline.rechazos(), isEmpty);
    });
    test('un 401 (sesion vencida) no pierde nada: queda para reintentar', () async {
      await sembrar();
      final r = await Offline.vaciar(Falso([err(401)]));
      expect([r.enviadas, r.restantes, r.rechazadas], [0, 3, 0]);
    });
    test('reenvia con la hora real guardada', () async {
      await Offline.ejecutar(Falso([sinRed]), 'POST', '/1', {'k': 'v'}, 'uno');
      final guardada = (await Offline.cola()).single.cuerpo['ocurridoEn'];
      final api = Falso([ok()]);
      await Offline.vaciar(api);
      expect(api.cuerpos.single, {'k': 'v', 'ocurridoEn': guardada});
    });
    test('sin nada pendiente no llama al servidor', () async {
      final api = Falso([]);
      final r = await Offline.vaciar(api);
      expect([r.enviadas, r.restantes], [0, 0]);
      expect(api.vistas, isEmpty);
    });
  });

  group('leer con copia local', () {
    test('con conexion guarda; sin conexion devuelve lo ultimo guardado', () async {
      final nuevo = await Offline.leer(Falso([ok([1, 2, 3])]), '/lista');
      expect([nuevo.desdeCache, nuevo.datos], [false, [1, 2, 3]]);
      final viejo = await Offline.leer(Falso([sinRed]), '/lista');
      expect([viejo.desdeCache, viejo.datos], [true, [1, 2, 3]]);
      expect(viejo.guardadoMs, nuevo.guardadoMs);
    });
    test('sin conexion y sin copia avisa con claridad', () async {
      await expectLater(Offline.leer(Falso([sinRed]), '/nunca'), throwsA(isA<ApiException>()));
    });
    test('un error del servidor (403) no se disfraza de copia vieja', () async {
      await Offline.leer(Falso([ok([1])]), '/lista');
      await expectLater(Offline.leer(Falso([err(403, 'sin permiso')]), '/lista'), throwsA(isA<ApiException>()));
    });
  });

  test('borrarTodo elimina cola, rechazos y copias (cambio de usuario)', () async {
    await Offline.ejecutar(Falso([sinRed]), 'POST', '/1', {}, 'uno');
    await Offline.leer(Falso([ok([1])]), '/lista');
    await Offline.borrarTodo();
    expect(await Offline.pendientes(), 0);
    await expectLater(Offline.leer(Falso([sinRed]), '/lista'), throwsA(isA<ApiException>()));
  });
}
