import 'package:flutter_test/flutter_test.dart';
import 'package:sigbo_alertas/geo.dart';

void main() {
  test('distancia: nula entre el mismo punto, ~111 km por grado, simetrica', () {
    expect(distanciaMetros(-25.3, -57.6, -25.3, -57.6), 0);
    expect(distanciaMetros(0, 0, 1, 0), inInclusiveRange(111000, 111400));
    expect(distanciaMetros(-25.3, -57.6, -25.31, -57.62), closeTo(distanciaMetros(-25.31, -57.62, -25.3, -57.6), 1e-6));
  });

  test('formato de distancia', () {
    expect(formatoDistancia(85.4), '85 m');
    expect(formatoDistancia(1340), '1,3 km');
  });

  test('ordena por cercania y descarta lo sin coordenadas', () {
    final r = ordenarPorCercania([
      {'id': 'lejos', 'latitud': -25.4, 'longitud': -57.6},
      {'id': 'cerca', 'latitud': -25.3005, 'longitud': -57.6},
      {'id': 'sin', 'latitud': null, 'longitud': null},
      'basura',
      {'id': 'medio', 'latitud': -25.31, 'longitud': -57.6},
    ], -25.3, -57.6);
    expect(r.map((e) => e.key['id']), ['cerca', 'medio', 'lejos']);
    expect(r.first.value, lessThan(100));
  });

  test('token del QR: direccion completa, token solo, y entradas invalidas', () {
    const t = 'abcdefghij0123456789_-XYZ';
    expect(tokenDeQr('https://192.168.1.10:3002/fichar?t=$t'), t);
    expect(tokenDeQr('  $t  '), t);
    expect(tokenDeQr('https://sitio.com/otra'), isNull);
    expect(tokenDeQr('corto'), isNull);
    expect(tokenDeQr(''), isNull);
    expect(tokenDeQr('https://x.com/fichar?t=con espacios y simbolos!!'), isNull);
  });
}
