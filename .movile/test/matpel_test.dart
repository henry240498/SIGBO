import 'dart:convert';
import 'dart:typed_data';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:sigbo_alertas/matpel.dart';
import 'package:sigbo_alertas/matpel_documento.dart';

// La biblioteca con E/S real se prueba arriba; este adaptador separa el widget del reloj de archivos.
class _BibliotecaVerificada extends BibliotecaGre {
  final DocumentoGre documento;
  _BibliotecaVerificada(super.carpeta, this.documento);
  @override
  Future<DocumentoGre?> actual() async => documento;
}

// Aísla el protocolo del widget; las escrituras y recuperación real se comprueban en los casos de biblioteca.
class _BibliotecaRecepcionPartes extends _BibliotecaVerificada {
  final DocumentoGre descargado;
  Map<String, dynamic>? recibido;
  _BibliotecaRecepcionPartes(super.carpeta, super.documento, this.descargado);
  @override
  Future<DocumentoGre> guardarPartes(
      Map<String, dynamic> m, Uint8List c, Uint8List pdf, Uint8List i) async {
    recibido = {'manifest': m, 'catalogo': c, 'pdf': pdf, 'interpretacion': i};
    return descargado;
  }
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  test('normalización editorial española preserva guion y letras del nombre',
      () {
    expect(normalizarGre('Ácido'), 'ACIDO');
    expect(normalizarGre('ÁCIDO CLO-\nROACÉTICO'), 'ACIDO CLO-ROACETICO');
    expect(normalizarGre('Ácido\ncloroacético'), 'ACIDO CLOROACETICO');
  });
  final compilado =
      File('../backend/dist/modules/gre/matpel-paquete.js').existsSync();
  group('Interoperabilidad API/Flutter con recorte literal y PDF real', () {
    late Map<String, dynamic> p;
    late DocumentoGre d;
    late Map<String, dynamic> partes;
    late DocumentoGre documentoModular;
    late Directory temporal;
    late BibliotecaGre biblioteca;
    setUpAll(() async {
      final proceso = await Process.run(
          'node', ['../scripts/matpel/paquete_prueba_movil.cjs'],
          stdoutEncoding: utf8, stderrEncoding: utf8);
      expect(proceso.exitCode, 0, reason: '${proceso.stderr}');
      p = jsonDecode(proceso.stdout as String) as Map<String, dynamic>;
      d = await DocumentoGre.verificar(p);
      final modular = await Process.run(
          'node', ['../scripts/matpel/paquete_prueba_movil.cjs', '--partes'],
          stdoutEncoding: utf8, stderrEncoding: utf8);
      expect(modular.exitCode, 0, reason: '${modular.stderr}');
      partes = jsonDecode(modular.stdout as String) as Map<String, dynamic>;
      documentoModular = await DocumentoGre.verificarPartes(
          Map<String, dynamic>.from(partes['manifest'] as Map),
          base64Decode(partes['catalogoBase64']),
          base64Decode(partes['pdfBase64']),
          base64Decode(partes['interpretacionBase64']));
    });
    setUp(() async {
      SharedPreferences.setMockInitialValues({});
      temporal = await Directory.systemTemp.createTemp('sigbo-gre-flutter-');
      biblioteca = BibliotecaGre(temporal);
    });
    tearDown(() async {
      final resuelta = await temporal.resolveSymbolicLinks();
      final raizTemporal = await Directory.systemTemp.resolveSymbolicLinks();
      if (!resuelta.startsWith(
          '$raizTemporal${Platform.pathSeparator}sigbo-gre-flutter-'))
        throw StateError(
            'Directorio temporal de prueba fuera del destino esperado.');
      await temporal.delete(recursive: true);
    });
    test(
        'verifica exportación real y conserva todas las páginas, guías, fuentes y varias identidades',
        () {
      expect(d.registros('paginas').length, 392);
      expect(d.registros('secciones').length, 42);
      expect(d.buscar('3171').length, greaterThan(1));
      expect(d.buscar('amoniaco').any((e) => e['identificador'] == '1005'),
          isTrue);
      expect(
          d.bloquesGuia(d.buscar('125').single['id']).length, greaterThan(0));
      expect(d.manifest['documentoSha256'],
          'bfc8b663259528dadd81a499afac2d5fd417467786ac616fb31625680f4ea4af');
    });
    test(
        'admite el candidato completo del exportador real dentro del límite de tamaño',
        () async {
      final proceso = await Process.run(
          'node',
          [
            '../scripts/matpel/paquete_prueba_movil.cjs',
            '--completo',
            '--partes'
          ],
          stdoutEncoding: utf8,
          stderrEncoding: utf8);
      expect(proceso.exitCode, 0, reason: '${proceso.stderr}');
      final exportado =
          jsonDecode(proceso.stdout as String) as Map<String, dynamic>;
      final completo = await DocumentoGre.verificarPartes(
          Map<String, dynamic>.from(exportado['manifest'] as Map),
          base64Decode(exportado['catalogoBase64']),
          base64Decode(exportado['pdfBase64']),
          base64Decode(exportado['interpretacionBase64']));
      expect(completo.registros('entradas').length, 2665);
      expect(completo.registros('referencias').length, 38810);
      expect(completo.registros('celdas').length, 5533);
      expect(completo.pdf.length, 8182725);
    },
        skip: File('../backend/private_uploads/gre/bfc8b663259528dadd81a499afac2d5fd417467786ac616fb31625680f4ea4af.catalogo-1-busqueda-1-pymupdf1.28.2.json')
                .existsSync()
            ? false
            : 'Requiere candidato original congelado local; no descarga ni activa datos.');
    test(
        'partes reales verificadas en otro isolate conservan fuente y ediciones anteriores',
        () async {
      await biblioteca.guardar(p);
      final m = Map<String, dynamic>.from(partes['manifest'] as Map);
      final c = base64Decode(partes['catalogoBase64']);
      final pdf = base64Decode(partes['pdfBase64']);
      final interpretacion = base64Decode(partes['interpretacionBase64']);
      final modular = await biblioteca.guardarPartes(m, c, pdf, interpretacion);
      expect(modular.interpretacion!['cantidadesTabla3'].length, 5);
      expect(modular.interpretacion!['reglasDocumentales'].length, 54);
      expect((await biblioteca.ediciones()).length, 2);
      expect((await biblioteca.actual())!.manifest['versionPaquete'], 2);
      expect(
          (await biblioteca.actual())!.buscar('3171').length, greaterThan(1));
      final alterada = base64Decode(partes['interpretacionBase64']);
      alterada[alterada.length - 10] ^= 1;
      await expectLater(
          biblioteca.guardarPartes(m, c, pdf, alterada), throwsFormatException);
      expect((await biblioteca.actual())!.manifest['interpretacionSha256'],
          m['interpretacionSha256']);
      final nombre =
          (await biblioteca.ediciones()).singleWhere((n) => n.endsWith('.gre'));
      await File('${temporal.path}/$nombre/interpretacion.json')
          .writeAsString('alterado');
      await expectLater(biblioteca.actual(), throwsFormatException);
      await biblioteca.guardarPartes(m, c, pdf, interpretacion);
      expect((await biblioteca.actual())!.manifest['interpretacionSha256'],
          m['interpretacionSha256']);
      await File('${temporal.path}/$nombre/interpretacion.json').delete();
      await expectLater(
          biblioteca.actual(), throwsA(isA<FileSystemException>()));
      await biblioteca.guardarPartes(m, c, pdf, interpretacion);
      expect((await biblioteca.actual())!.manifest['interpretacionSha256'],
          m['interpretacionSha256']);
      await biblioteca.elegir((await biblioteca.ediciones())
          .singleWhere((n) => n.endsWith('.json')));
      expect((await biblioteca.actual())!.manifest['versionPaquete'], 1);
    });
    test('cada parte y su manifiesto están vinculados a la misma fuente',
        () async {
      final m = Map<String, dynamic>.from(partes['manifest'] as Map);
      final c = base64Decode(partes['catalogoBase64']);
      final pdf = base64Decode(partes['pdfBase64']);
      final i = base64Decode(partes['interpretacionBase64']);
      await expectLater(
          DocumentoGre.verificarPartes(
              {...m, 'catalogoBytes': c.length + 1}, c, pdf, i),
          throwsFormatException);
      final otro = base64Decode(partes['pdfBase64']);
      otro[otro.length - 10] ^= 1;
      await expectLater(
          DocumentoGre.verificarPartes(m, c, otro, i), throwsFormatException);
      expect((await DocumentoGre.verificarPartes(m, c, pdf, i)).pdf.length,
          8182725);
    });
    test('no admite catálogo alterado ni PDF alterado', () async {
      await expectLater(
          DocumentoGre.verificar(
              {...p, 'catalogoJson': '${p['catalogoJson']} '}),
          throwsFormatException);
      final pdf = base64Decode(p['pdfBase64']);
      pdf[pdf.length - 10] ^= 1;
      await expectLater(
          DocumentoGre.verificar({...p, 'pdfBase64': base64Encode(pdf)}),
          throwsFormatException);
    });
    test(
        'descarga inválida no sustituye la edición guardada; mantiene recuperación histórica',
        () async {
      expect(await biblioteca.actual(), isNull);
      await biblioteca.guardar(p);
      await expectLater(biblioteca.guardar({...p, 'catalogoJson': 'alterado'}),
          throwsFormatException);
      expect((await biblioteca.actual())!.versionId, d.versionId);
      final nuevo = {
        ...p,
        'manifest': {
          ...Map<String, dynamic>.from(p['manifest'] as Map),
          'versionGreId': '00000000-0000-4000-8000-000000000002'
        }
      };
      await biblioteca.guardar(nuevo);
      expect((await biblioteca.actual())!.versionId.endsWith('2'), isTrue);
      final ns = await biblioteca.ediciones();
      expect(ns.length, 2);
      final anterior = ns.firstWhere((n) => n.startsWith(d.versionId));
      expect((await biblioteca.elegir(anterior)).versionId, d.versionId);
      await expectLater(
          biblioteca.leer('../ajeno.json'), throwsFormatException);
    });
    test(
        'corrupción en disco bloquea lectura y permite reparar con nueva descarga verificada',
        () async {
      await biblioteca.guardar(p);
      final n = (await biblioteca.ediciones()).single;
      await File('${temporal.path}/$n').writeAsString('alterado');
      await expectLater(biblioteca.actual(), throwsFormatException);
      await biblioteca.guardar(p);
      expect((await biblioteca.actual())!.versionId, d.versionId);
    });
    testWidgets(
        'descarga del widget entrega catálogo, PDF e interpretación a la biblioteca',
        (tester) async {
      final receptor =
          _BibliotecaRecepcionPartes(temporal, d, documentoModular);
      final solicitudes = <String>[];
      await tester.pumpWidget(MaterialApp(
          home: PantallaMatpel(
        biblioteca: receptor,
        tienePermiso: () async => true,
        consultarEstado: () async => http.Response(
            jsonEncode({
              'estado': 'DISPONIBLE',
              'versionGreId': d.versionId,
              'documentoSha256': d.manifest['documentoSha256']
            }),
            200),
        descargarParte: (id, parte) async {
          expect(id, d.versionId);
          solicitudes.add(parte);
          return parte == 'manifest'
              ? http.Response(jsonEncode({'manifest': partes['manifest']}), 200)
              : http.Response.bytes(
                  base64Decode(partes[
                      '${parte == 'catalogo' ? 'catalogo' : parte == 'pdf' ? 'pdf' : 'interpretacion'}Base64']),
                  200);
        },
      )));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Descargar edición vigente'));
      await tester.pumpAndSettle();
      expect(receptor.recibido, isNotNull);
      final descargado = receptor.recibido!;
      expect(solicitudes, ['manifest', 'catalogo', 'pdf', 'interpretacion']);
      expect(descargado['manifest']['interpretacionSha256'],
          partes['manifest']['interpretacionSha256']);
      expect(descargado['pdf'], base64Decode(partes['pdfBase64']));
      expect(descargado['catalogo'], base64Decode(partes['catalogoBase64']));
      expect(descargado['interpretacion'],
          base64Decode(partes['interpretacionBase64']));
      expect(tester.takeException(), isNull);
    });
    testWidgets(
        'primera apertura sin descarga comunica indisponibilidad; sin permiso no abre biblioteca',
        (tester) async {
      await tester.pumpWidget(MaterialApp(
          home: PantallaMatpel(
              biblioteca: biblioteca, tienePermiso: () async => true)));
      await tester.pumpAndSettle();
      expect(find.textContaining('Todavía no hay copia local'), findsOneWidget);
      expect(find.text('Buscar'), findsNothing);
      await tester.pumpWidget(const SizedBox());
      await tester.pumpWidget(MaterialApp(
          home: PantallaMatpel(
              biblioteca: biblioteca, tienePermiso: () async => false)));
      await tester.pumpAndSettle();
      expect(find.text('Tu usuario no tiene permiso de consulta MATPEL.'),
          findsOneWidget);
      expect(find.text('Descargar edición vigente'), findsNothing);
    });
    testWidgets('tablas verdes y perfil completo se leen sin consultar la red',
        (tester) async {
      await tester.pumpWidget(MaterialApp(
          home: PantallaMatpel(
        biblioteca: _BibliotecaVerificada(temporal, documentoModular),
        tienePermiso: () async => true,
        consultarEstado: () async =>
            throw StateError('No debe llamar a la red'),
      )));
      await tester.pumpAndSettle();
      await tester.ensureVisible(find.text('Tablas verdes'));
      await tester.tap(find.text('Tablas verdes'));
      await tester.pumpAndSettle();
      final tabla = documentoModular.registros('tablas').first;
      await tester.tap(find.text(tabla['tituloOriginal']));
      await tester.pumpAndSettle();
      expect(find.textContaining('filas publicadas'), findsOneWidget);
      await tester.pageBack();
      await tester.pumpAndSettle();
      await tester.ensureVisible(find.text('Condiciones documentadas'));
      await tester.tap(find.text('Condiciones documentadas'));
      await tester.pumpAndSettle();
      expect(find.textContaining('No es un inventario exhaustivo'),
          findsOneWidget);
      expect(tester.takeException(), isNull);
    });
    testWidgets(
        'lectura guardada no llama red, exige elegir nombre y conserva fuente;403 no borra la edición',
        (tester) async {
      await tester.runAsync(() => biblioteca.guardar(p));
      var red = 0;
      await tester.pumpWidget(MaterialApp(
          home: PantallaMatpel(
              biblioteca: _BibliotecaVerificada(temporal, d),
              tienePermiso: () async => true,
              consultarEstado: () async {
                red++;
                return http.Response(
                    '{"message":"Acceso de consulta denegado."}', 403);
              },
              descargar: (_) async =>
                  throw StateError('No corresponde descargar'))));
      await tester.runAsync(() async {
        await Future<void>.delayed(const Duration(milliseconds: 200));
      });
      await tester.pumpAndSettle();
      expect(red, 0);
      expect(find.textContaining('Integridad comprobada'), findsOneWidget);
      await tester.enterText(find.byType(TextField), '3171');
      await tester.ensureVisible(find.text('Buscar'));
      await tester.tap(find.text('Buscar'));
      await tester.pumpAndSettle();
      expect(find.textContaining('Leer guía'), findsNothing);
      final primero = d.buscar('3171').first['nombreOriginal'] as String;
      await tester.scrollUntilVisible(find.text(primero), 250,
          scrollable: find.byType(Scrollable).first);
      await tester.pumpAndSettle();
      await tester.tap(find.text(primero));
      await tester.pumpAndSettle();
      expect(find.textContaining('Leer guía'), findsOneWidget);
      await tester.ensureVisible(find.text('Ver fuente').first);
      await tester.tap(find.text('Ver fuente').first);
      await tester.pumpAndSettle();
      expect(find.textContaining('Página PDF'), findsOneWidget);
      expect(find.textContaining('Página impresa:'), findsOneWidget);
      await tester.tap(find.text('Cerrar y volver'));
      await tester.pumpAndSettle();
      await tester.pageBack();
      await tester.pumpAndSettle();
      await tester.scrollUntilVisible(
          find.text('Descargar edición vigente'), -350,
          scrollable: find.byType(Scrollable).first);
      await tester.tap(find.text('Descargar edición vigente'));
      await tester.pumpAndSettle();
      expect(red, 1);
      await tester.scrollUntilVisible(
          find.text('Acceso de consulta denegado.'), -250,
          scrollable: find.byType(Scrollable).first);
      await tester.pumpAndSettle();
      expect(find.text('Acceso de consulta denegado.'), findsOneWidget);
      expect((await tester.runAsync(() => biblioteca.actual()))!.versionId,
          d.versionId);
      expect(tester.takeException(), isNull);
    });
  },
      skip: compilado
          ? false
          : 'Requiere npm run build en backend para probar el exportador real.');
}
