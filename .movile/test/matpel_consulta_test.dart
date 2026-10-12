import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:sigbo_alertas/matpel_consulta.dart';
import 'package:sigbo_alertas/matpel_parametros.dart';
import 'package:sigbo_alertas/mapa_matpel.dart';

http.Response _respuesta(Object? datos, {int codigo = 200}) =>
    http.Response.bytes(utf8.encode(jsonEncode(datos)), codigo,
        headers: {'content-type': 'application/json; charset=utf-8'});

void main() {
  test(
      'desconocido, falso y cero permanecen distintos; cantidades no se convierten',
      () {
    final c = CapturaMatpel();
    c.valores['incendio'] = 'NO';
    c.valores['cantidad'] = '0.00001';
    c.valores['capacidad'] = '25000';
    c.unidades['capacidad'] = 'kg';
    c.valores['numero'] = '2';
    c.valores['direccion'] = '0';
    final p = c.consulta('edicion', 'material')['parametros'] as Map;
    expect(p['incendio']['valor'], false);
    expect(p['cantidad']['valor']['valorDecimal'], '0.00001');
    expect(p['cantidadContenedor']['valor']['unidad'], 'kg');
    expect(p['numeroContenedores']['valor'], 2);
    expect(p['viento']['valor']['direccionDesdeGrados'], 0);
    expect(p['viento']['valor']['velocidadDecimal'], isNull);
    expect(p['ubicacion']['certeza'], 'DESCONOCIDO');
    expect(c.consulta('edicion', 'material')['identificaciones'][0]['certeza'],
        'NO_CONFIRMADO');
  });
  test(
      'rechaza datos contradictorios, ubicaciones incompletas y rangos inválidos',
      () {
    for (final valores in [
      {'evento': 'INCENDIO', 'incendio': 'NO'},
      {'latitud': '-25'},
      {'precision': '5'},
      {'numero': '0'},
      {'numero': '1.5'},
      {'cantidad': '-1'},
      {'direccion': '360'},
      {'viento': '1,5'},
      {'latitud': '91', 'longitud': '0'},
    ]) {
      final c = CapturaMatpel()..valores.addAll(valores);
      expect(() => c.consulta('edicion', null), throwsFormatException,
          reason: '$valores');
    }
  });
  test(
      'calidad compuesta usa el dato menos cierto; no inventa evidencia ni fecha',
      () {
    final c = CapturaMatpel();
    c.valores.addAll({
      'latitud': '-25.3',
      'longitud': '-57.5',
      'viento': '12',
      'direccion': '90'
    });
    c.certezas.addAll({
      'latitud': 'CONFIRMADO',
      'longitud': 'ESTIMADO',
      'viento': 'CONFIRMADO',
      'direccion': 'NO_CONFIRMADO'
    });
    final p = c.consulta('edicion', null)['parametros'] as Map;
    expect(p['ubicacion']['certeza'], 'ESTIMADO');
    expect(p['viento']['certeza'], 'NO_CONFIRMADO');
    expect(p['ubicacion']['evidenciaId'], isNull);
    expect(p['viento']['observadoEn'], isNull);
  });

  final compilado =
      File('../backend/dist/modules/gre/motor-matpel.service.js').existsSync();
  group('consulta móvil con fuente literal y motor real', () {
    late Map<String, dynamic> f;
    setUpAll(() async {
      final r = await Process.run('node',
          ['../scripts/matpel/evaluacion_prueba_movil.cjs', '--fixture'],
          stdoutEncoding: utf8, stderrEncoding: utf8);
      expect(r.exitCode, 0, reason: '${r.stderr}');
      f = jsonDecode(r.stdout as String) as Map<String, dynamic>;
    });
    Future<Map<String, dynamic>> motor(Map<String, dynamic> body) async {
      final proceso = await Process.start(
          'node', ['../scripts/matpel/evaluacion_prueba_movil.cjs']);
      final salida = proceso.stdout.transform(utf8.decoder).join();
      final error = proceso.stderr.transform(utf8.decoder).join();
      proceso.stdin.write(jsonEncode(body));
      await proceso.stdin.close();
      expect(await proceso.exitCode, 0, reason: await error);
      return jsonDecode(await salida) as Map<String, dynamic>;
    }

    test('Dart produce contrato válido y zonas trazables con el motor único',
        () async {
      final c = CapturaMatpel();
      c.valores.addAll({
        'evento': 'DERRAME',
        'incendio': 'NO',
        'cantidad': '100',
        'agua': 'TIERRA',
        'periodo': 'DIA',
        'viento': '12',
        'direccion': '90',
        'latitud': '-25.3',
        'longitud': '-57.5'
      });
      c.certezaIdentificacion = 'CONFIRMADO';
      c.ambito = 'TRANSPORTE_TERRESTRE';
      final e = await motor(
          c.consulta(f['estado']['versionGreId'], f['entrada']['id']));
      expect(e['versionContrato'], 2);
      expect(e['versionMotor'], 'gre2024-matpel-2');
      expect(e['tabla1']['estado'], 'APLICABLE');
      expect(e['geometria']['aislamiento']['centro'], [-57.5, -25.3]);
      expect(e['geometria']['proteccion']['type'], 'Polygon');
      expect(e['geometria']['proteccion']['coordinates'][0].length, 5);
      expect(e['inputsHash'], matches(RegExp(r'^[0-9a-f]{64}$')));
    });
    testWidgets('permiso negativo impide toda llamada', (tester) async {
      var llamadas = 0;
      await tester.pumpWidget(MaterialApp(
          home: PantallaConsultaGre(
              tienePermiso: () async => false,
              llamar: (m, r, {body}) async {
                ++llamadas;
                return http.Response('{}', 200);
              })));
      await tester.pumpAndSettle();
      expect(llamadas, 0);
      expect(find.textContaining('no tiene permiso'), findsOneWidget);
    });
    testWidgets('edición no activa permite volver sin inventar contenido',
        (tester) async {
      await tester.pumpWidget(MaterialApp(
          home: PantallaConsultaGre(
              tienePermiso: () async => true,
              llamar: (m, r, {body}) async => _respuesta(
                  {'estado': 'NO_DISPONIBLE', 'versionGreId': null}))));
      await tester.pumpAndSettle();
      expect(find.textContaining('No hay edición GRE activa'), findsOneWidget);
      expect(find.text('Buscar en servidor'), findsNothing);
    });
    testWidgets(
        'selección explícita, consulta, fuente y edición invalidan un resultado',
        (tester) async {
      tester.view.physicalSize = const Size(390, 844);
      tester.view.devicePixelRatio = 1;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);
      Map<String, dynamic>? enviado;
      await tester.pumpWidget(MaterialApp(
          home: PantallaConsultaGre(
              tienePermiso: () async => true,
              llamar: (m, ruta, {body}) async {
                if (ruta == '/matpel/estado') return _respuesta(f['estado']);
                if (ruta.startsWith('/matpel/buscar'))
                  return _respuesta({
                    'items': [f['entrada']],
                    'guias': [],
                    'cursor': null
                  });
                if (ruta.startsWith('/matpel/materiales'))
                  return _respuesta(f['ficha']);
                if (ruta == '/matpel/evaluaciones/consulta-v2') {
                  enviado = body;
                  return _respuesta(f['evaluacion']);
                }
                if (ruta.startsWith('/matpel/fuentes')) {
                  final id = Uri.parse(ruta).pathSegments.last;
                  final ref = (f['referencias'] as List)
                      .cast<Map>()
                      .firstWhere((r) => r['id'] == id);
                  return _respuesta({
                    'paginaPdf': ref['paginaPdf'],
                    'etiquetasImpresas': [],
                    'textoOriginal': ref['textoOriginal']
                  });
                }
                return http.Response('{}', 404);
              })));
      await tester.pumpAndSettle();
      await tester.enterText(
          find.widgetWithText(TextField, 'Identificador ONU/NA, nombre o guía'),
          '1005');
      await tester.tap(find.text('Buscar en servidor'));
      await tester.pumpAndSettle();
      expect(find.text('Calidad de identificación'), findsNothing);
      await tester.tap(find.text(f['entrada']['nombreOriginal']));
      await tester.pumpAndSettle();
      await tester.scrollUntilVisible(
          find.text('Calidad de identificación'), 300,
          scrollable: find.byType(Scrollable).first);
      expect(find.text('Calidad de identificación'), findsOneWidget);
      final boton = find.text('Consultar condiciones y distancias');
      await tester.scrollUntilVisible(boton, 500,
          scrollable: find.byType(Scrollable).first);
      await tester.tap(boton);
      await tester.pumpAndSettle();
      expect(enviado!['identificaciones'][0]['certeza'], 'NO_CONFIRMADO');
      expect(find.textContaining('Resultado ·'), findsOneWidget);
      await tester.scrollUntilVisible(
          find.text('Calidad de identificación'), -500,
          scrollable: find.byType(Scrollable).first);
      await tester.enterText(
          find.widgetWithText(
              TextField, 'Observación original de identificación'),
          'Placa observada');
      await tester.pump();
      expect(find.textContaining('Resultado ·'), findsNothing);
      expect(tester.takeException(), isNull);
    });
    testWidgets('respuesta tardía no reemplaza una captura nueva',
        (tester) async {
      final pendiente = Completer<http.Response>();
      await tester.pumpWidget(MaterialApp(
          home: PantallaConsultaGre(
              tienePermiso: () async => true,
              llamar: (m, ruta, {body}) async {
                if (ruta == '/matpel/estado') return _respuesta(f['estado']);
                return pendiente.future;
              })));
      await tester.pumpAndSettle();
      final boton = find.text('Consultar condiciones y distancias');
      await tester.scrollUntilVisible(boton, 500,
          scrollable: find.byType(Scrollable).first);
      await tester.tap(boton);
      await tester.pump();
      await tester.scrollUntilVisible(find.text('Cantidad liberada'), -300,
          scrollable: find.byType(Scrollable).first);
      await tester.enterText(
          find.widgetWithText(TextField, 'Cantidad liberada'), '100');
      await tester.pump();
      pendiente.complete(_respuesta(f['evaluacion']));
      await tester.pumpAndSettle();
      expect(find.textContaining('Resultado ·'), findsNothing);
      expect(tester.takeException(), isNull);
    });
    testWidgets('fuente original se abre;403 elimina captura y resultados',
        (tester) async {
      var fuenteConsultada = false;
      await tester.pumpWidget(MaterialApp(
          home: PantallaConsultaGre(
              tienePermiso: () async => true,
              llamar: (m, ruta, {body}) async {
                if (ruta == '/matpel/estado') return _respuesta(f['estado']);
                if (ruta.startsWith('/matpel/buscar'))
                  return _respuesta({
                    'items': [f['entrada']],
                    'guias': [],
                    'cursor': null
                  });
                if (ruta.startsWith('/matpel/materiales'))
                  return _respuesta(f['ficha']);
                if (ruta.startsWith('/matpel/fuentes')) {
                  fuenteConsultada = true;
                  final id = Uri.parse(ruta).pathSegments.last;
                  final ref = (f['referencias'] as List)
                      .cast<Map>()
                      .firstWhere((r) => r['id'] == id);
                  return _respuesta({
                    'paginaPdf': ref['paginaPdf'],
                    'etiquetasImpresas': [],
                    'textoOriginal': ref['textoOriginal']
                  });
                }
                return _respuesta({'message': 'Acceso de consulta denegado.'},
                    codigo: 403);
              })));
      await tester.pumpAndSettle();
      await tester.enterText(
          find.widgetWithText(TextField, 'Identificador ONU/NA, nombre o guía'),
          '1005');
      await tester.tap(find.text('Buscar en servidor'));
      await tester.pumpAndSettle();
      await tester.tap(find.text(f['entrada']['nombreOriginal']));
      await tester.pumpAndSettle();
      await tester.scrollUntilVisible(find.text('Ver fuente').first, 300,
          scrollable: find.byType(Scrollable).first);
      await tester.tap(find.text('Ver fuente').first);
      await tester.pumpAndSettle();
      expect(fuenteConsultada, isTrue);
      expect(find.textContaining('Página PDF'), findsOneWidget);
      await tester.tap(find.text('Volver'));
      await tester.pumpAndSettle();
      await tester.scrollUntilVisible(
          find.text('Consultar condiciones y distancias'), 500,
          scrollable: find.byType(Scrollable).first);
      await tester.tap(find.text('Consultar condiciones y distancias'));
      await tester.pumpAndSettle();
      expect(find.text('Acceso de consulta denegado.'), findsOneWidget);
      expect(find.text('Consultar condiciones y distancias'), findsNothing);
      expect(find.textContaining('Resultado ·'), findsNothing);
      expect(tester.takeException(), isNull);
    });
    testWidgets('mapa usa geometría del servidor sin descargar teselas',
        (tester) async {
      final c = CapturaMatpel()..certezaIdentificacion = 'CONFIRMADO';
      c.valores.addAll({
        'incendio': 'NO',
        'cantidad': '100',
        'agua': 'TIERRA',
        'periodo': 'DIA',
        'viento': '12',
        'direccion': '90',
        'latitud': '-25.3',
        'longitud': '-57.5'
      });
      final e = await tester.runAsync(() =>
          motor(c.consulta(f['estado']['versionGreId'], f['entrada']['id'])));
      await tester.pumpWidget(MaterialApp(
          home: Scaffold(
              body: SingleChildScrollView(
                  child: MapaMatpelMovil(
                      datos: Map<String, dynamic>.from(e!['geometria']))))));
      await tester.pumpAndSettle();
      expect(find.textContaining('Aislamiento inicial:'), findsOneWidget);
      expect(find.textContaining('Acción protectora:'), findsOneWidget);
      expect(tester.takeException(), isNull);
    });
  },
      skip: compilado
          ? false
          : 'Requiere motor backend compilado; no activa SQL ni publica datos.');
}
