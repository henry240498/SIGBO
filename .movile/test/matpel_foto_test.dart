import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:sigbo_alertas/matpel_foto.dart';

void main() {
  test(
      'OCR conserva ceros, candidatos múltiples y no reinterpreta texto ambiguo',
      () {
    expect(candidatosOcrGre('UN 1005\nONU 1017\n1005\n0100'),
        ['1005', '1017', '0100']);
    expect(candidatosOcrGre('I005 O1O0 ABC1005 10050 123 12.34'), isEmpty);
    expect(candidatosOcrGre('UN: 1005, texto <script>1005</script>'), ['1005']);
  });
  testWidgets('foto muestra texto original y requiere elegir el candidato',
      (tester) async {
    await tester.pumpWidget(MaterialApp(
        home: PantallaFotoGre(
            reconocer: (_) async => {
                  'textoOriginal': 'UN 1005\nONU 1017',
                  'certeza': 'NO_CONFIRMADO',
                  'subido': false,
                })));
    await tester.tap(find.text('Elegir foto'));
    await tester.pumpAndSettle();
    expect(find.text('UN 1005\nONU 1017'), findsOneWidget);
    expect(find.text('Candidato 1005'), findsOneWidget);
    expect(find.text('Candidato 1017'), findsOneWidget);
    expect(find.textContaining('identidad todavía no confirmada'),
        findsNWidgets(2));
  });
  testWidgets(
      'cancelación no inventa texto y error de cámara no muestra coincidencias',
      (tester) async {
    await tester.pumpWidget(
        MaterialApp(home: PantallaFotoGre(reconocer: (_) async => null)));
    await tester.tap(find.text('Tomar foto'));
    await tester.pumpAndSettle();
    expect(find.textContaining('Candidato'), findsNothing);
    await tester.pumpWidget(MaterialApp(
        home: PantallaFotoGre(
            key: const ValueKey('error'),
            reconocer: (_) async => throw PlatformException(
                code: 'OCR_GRE', message: 'Cámara no disponible'))));
    await tester.tap(find.text('Tomar foto'));
    await tester.pumpAndSettle();
    expect(find.text('Cámara no disponible'), findsOneWidget);
    expect(find.textContaining('Candidato'), findsNothing);
  });
  testWidgets(
      'cerrar durante reconocimiento no actualiza una pantalla eliminada',
      (tester) async {
    final espera = Future<Map<String, dynamic>?>.delayed(
        const Duration(seconds: 1), () => {'textoOriginal': '1005'});
    await tester.pumpWidget(
        MaterialApp(home: PantallaFotoGre(reconocer: (_) => espera)));
    await tester.tap(find.text('Tomar foto'));
    await tester.pump();
    await tester.pumpWidget(const MaterialApp(home: SizedBox()));
    await tester.pump(const Duration(seconds: 2));
    expect(tester.takeException(), isNull);
  });
}
