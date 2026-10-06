import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:sigbo_alertas/conexion.dart';

void main() {
  group('normalizarUrlServidor', () {
    test('completa lo que falta', () {
      expect(normalizarUrlServidor('192.168.100.18:3001'), 'http://192.168.100.18:3001/api/v1');
      expect(normalizarUrlServidor('http://192.168.100.18:3001'), 'http://192.168.100.18:3001/api/v1');
      expect(normalizarUrlServidor('  http://192.168.100.18:3001/  '), 'http://192.168.100.18:3001/api/v1');
      expect(normalizarUrlServidor('https://abc-def.trycloudflare.com'), 'https://abc-def.trycloudflare.com/api/v1');
    });
    test('respeta una ruta ya completa y quita barras finales', () {
      expect(normalizarUrlServidor('http://10.0.0.5:3001/api/v1'), 'http://10.0.0.5:3001/api/v1');
      expect(normalizarUrlServidor('http://10.0.0.5:3001/api/v1///'), 'http://10.0.0.5:3001/api/v1');
    });
    test('rechaza lo que no es una direccion de servidor', () {
      for (final malo in ['', '   ', 'con espacios', 'ftp://x.com', 'http://', 'javascript:alert(1)', 'http://u:p@x.com', 'http://x.com/?a=1', 'http://x.com/#f']) {
        expect(normalizarUrlServidor(malo), isNull, reason: malo);
      }
    });
  });

  group('QR de conexion', () {
    const url = 'http://192.168.100.18:3001/api/v1';
    test('el contenido que genera el servidor se lee de vuelta igual', () {
      expect(urlDeQrServidor(contenidoQrServidor(url)), url);
      expect(urlDeQrServidor(contenidoQrServidor('https://a-b.trycloudflare.com/api/v1')), 'https://a-b.trycloudflare.com/api/v1');
    });
    test('es identico a lo que genera la PC (conectar-celulares.mjs): una app y un servidor que no se entendieran serian inutiles', () {
      const delServidor = 'sigbo://servidor?url=http%3A%2F%2F192.168.100.18%3A3001%2Fapi%2Fv1';
      expect(contenidoQrServidor(url), delServidor);
      expect(urlDeQrServidor(delServidor), url);
    });
    test('acepta tambien la direccion sola, pero no cualquier cosa', () {
      expect(urlDeQrServidor(url), url);
      expect(urlDeQrServidor('sigbo://otra?url=$url'), isNull);
      expect(urlDeQrServidor('sigbo://servidor'), isNull);
      expect(urlDeQrServidor('sigbo://servidor?url=ftp://x'), isNull);
      expect(urlDeQrServidor('hola mundo'), isNull);
      expect(urlDeQrServidor('WIFI:T:WPA;S:red;P:clave;;'), isNull);
    });
  });

  group('probarServidor', () {
    Future<ResultadoPrueba> con(Future<http.Response> Function(http.Request) f) =>
        probarServidor('http://x/api/v1', cliente: MockClient(f), espera: const Duration(milliseconds: 200));

    test('un servidor SIGBO sano responde ok y se consulta /salud', () async {
      String? visto;
      final r = await con((req) async {
        visto = req.url.toString();
        return http.Response(jsonEncode({'estado': 'disponible'}), 200);
      });
      expect(r.ok, isTrue);
      expect(visto, 'http://x/api/v1/salud');
    });
    test('algo que responde 200 pero no es SIGBO no se acepta', () async {
      expect((await con((_) async => http.Response('<html>router</html>', 200))).ok, isFalse);
      expect((await con((_) async => http.Response('{"estado":"otra"}', 200))).ok, isFalse);
    });
    test('base de datos caida (503) y otros errores se explican', () async {
      expect((await con((_) async => http.Response('{}', 503))).mensaje, contains('base de datos'));
      expect((await con((_) async => http.Response('', 404))).mensaje, contains('/api/v1'));
    });
    test('sin red o sin respuesta: mensajes claros, nunca una excepcion', () async {
      expect((await con((_) async => throw const SocketException('x'))).ok, isFalse);
      expect((await con((_) async => throw http.ClientException('x'))).mensaje, contains('WiFi'));
      final lento = await con((_) async {
        await Future<void>.delayed(const Duration(seconds: 2));
        return http.Response('{}', 200);
      });
      expect(lento.ok, isFalse);
      expect(lento.mensaje, contains('No responde'));
      expect((await con((_) async => throw TimeoutException('x'))).ok, isFalse);
    });
  });
}
