import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:sigbo_alertas/matpel_documento.dart';
import 'package:sigbo_alertas/matpel_motor_local.dart';
import 'package:sigbo_alertas/matpel_parametros.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  const canal = MethodChannel('org.cbvc.sigbo/gre-local');
  late DocumentoGre doc;
  late Process proceso;
  late StreamIterator<String> respuestas;
  late List<MethodCall> llamadas;
  late MotorGreLocal motor;
  setUpAll(() async {
    final r = await Process.run(
        'node', ['../scripts/matpel/paquete_prueba_movil.cjs', '--partes'],
        stdoutEncoding: utf8);
    expect(r.exitCode, 0, reason: '${r.stderr}');
    final p = jsonDecode(r.stdout as String) as Map<String, dynamic>;
    doc = await DocumentoGre.verificarPartes(
        Map<String, dynamic>.from(p['manifest']),
        base64Decode(p['catalogoBase64']),
        base64Decode(p['pdfBase64']),
        base64Decode(p['interpretacionBase64']));
  });
  setUp(() async {
    llamadas = [];
    proceso = await Process.start(
        'node', ['../scripts/matpel/prueba_motor_local.cjs']);
    respuestas = StreamIterator(
        proceso.stdout.transform(utf8.decoder).transform(const LineSplitter()));
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(canal, (c) async {
      llamadas.add(c);
      if (c.method == 'cerrar') return null;
      proceso.stdin.writeln(c.arguments['json']);
      await proceso.stdin.flush();
      expect(await respuestas.moveNext(), isTrue);
      return respuestas.current;
    });
    motor = MotorGreLocal(doc);
  });
  tearDown(() async {
    await motor.cerrar();
    await respuestas.cancel();
    proceso.kill();
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(canal, null);
  });
  test(
      'edición verificada inicia una vez y búsqueda local preserva selección explícita',
      () async {
    final e = jsonDecode((await motor.llamar('GET', '/matpel/estado')).body);
    expect(e['modo'], 'LOCAL_SIN_CONEXION');
    final r = jsonDecode(utf8.decode(
        (await motor.llamar('GET', '/matpel/buscar?q=1005')).bodyBytes));
    expect(r['items'], isNotEmpty);
    expect(r.containsKey('entradaElegida'), isFalse);
    expect(llamadas.where((c) => c.method == 'inicializar'), hasLength(1));
  });
  test(
      'consulta real sin red conserva distancias y fuentes del motor compartido',
      () async {
    final e = doc
        .registros('entradas')
        .firstWhere((e) => e['identificador'] == '1005');
    final captura = CapturaMatpel()
      ..valores.addAll({
        'evento': 'DERRAME',
        'incendio': 'NO',
        'cantidad': '208',
        'agua': 'TIERRA',
        'periodo': 'DIA',
        'latitud': '-25.8',
        'longitud': '-57.2',
        'viento': '5',
        'direccion': '0'
      });
    final r = await motor.llamar('POST', '/matpel/evaluaciones/consulta-v2',
        body: captura.consulta(doc.versionId, e['id']));
    expect(r.statusCode, 200);
    final resultado = jsonDecode(utf8.decode(r.bodyBytes));
    expect(resultado['aislamiento']['celdas'][0]['valorDecimal'], '30');
    expect(resultado['proteccion']['celdas'][0]['valorDecimal'], '0.1');
    expect(resultado['geometria']['proteccion']['distanciaM'], 100);
    expect(resultado['inputsHash'], matches(RegExp(r'^[a-f0-9]{64}$')));
    expect(resultado['modoConsulta'], 'LOCAL_SIN_CONEXION');
    expect(
        resultado['avisos']
            .any((a) => a['codigo'] == 'IDENTIFICACION_PROVISIONAL'),
        isTrue);
  });
  test('fuente, guía y secciones se leen de la misma edición sin red',
      () async {
    final g = doc.registros('guias').first;
    final guia = jsonDecode(utf8.decode(
        (await motor.llamar('GET', '/matpel/guias/${g['numero']}')).bodyBytes));
    expect(guia['bloques'], doc.bloquesGuia(g['id']));
    final ref = doc.registros('referencias').first;
    final fuente = jsonDecode(utf8.decode(
        (await motor.llamar('GET', '/matpel/fuentes/${ref['id']}')).bodyBytes));
    expect(fuente['textoOriginal'], ref['textoOriginal']);
    expect(fuente['paginaPdf'], ref['paginaPdf']);
    expect(fuente['etiquetasImpresas'], isA<List>());
    expect((await motor.llamar('GET', '/matpel/secciones')).statusCode, 200);
  });
  test('no admite otra edición, escritura ni acción arbitraria', () async {
    expect(
        (await motor.llamar('GET', '/matpel/buscar?q=1005&versionGreId=otra'))
            .statusCode,
        422);
    expect(
        (await motor.llamar('PUT', '/servicios/otro/matpel')).statusCode, 422);
    expect((await motor.llamar('GET', '/matpel/exec')).statusCode, 404);
  });
  test('desconocidos no generan distancia y contradicciones se rechazan',
      () async {
    final e = doc
        .registros('entradas')
        .firstWhere((e) => e['identificador'] == '1005');
    final captura = CapturaMatpel();
    var body = captura.consulta(doc.versionId, e['id']);
    final r = jsonDecode(utf8.decode((await motor
            .llamar('POST', '/matpel/evaluaciones/consulta-v2', body: body))
        .bodyBytes));
    expect(r['aislamiento']['estado'], 'INDETERMINADO');
    body['parametros']['eventos']['valor'] = ['INCENDIO'];
    body['parametros']['eventos']['certeza'] = 'CONFIRMADO';
    body['parametros']['incendio']['valor'] = false;
    body['parametros']['incendio']['certeza'] = 'CONFIRMADO';
    expect(
        (await motor.llamar('POST', '/matpel/evaluaciones/consulta-v2',
                body: body))
            .statusCode,
        422);
  });
  test('cerrar impide volver a consultar con la captura anterior', () async {
    await motor.iniciar();
    await motor.cerrar();
    expect((await motor.llamar('GET', '/matpel/estado')).statusCode, 422);
  });
}
