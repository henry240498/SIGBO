import 'package:flutter_test/flutter_test.dart';
import 'package:sigbo_alertas/models.dart';

void main() {
  group('ConvocatoriaApp', () {
    test('sin respuesta propia', () {
      final c = ConvocatoriaApp.fromJson({
        'id': 'c1',
        'mensaje': 'Incendio en Av. Principal',
        'creadoEn': '2026-01-01T10:00:00.000Z',
        'miRespuesta': null,
      });
      expect(c.id, 'c1');
      expect(c.miRespuesta, isNull);
      expect(c.miEtaMinutos, isNull);
    });

    test('con respuesta VOY y minutos', () {
      final c = ConvocatoriaApp.fromJson({
        'id': 'c1',
        'mensaje': 'x',
        'creadoEn': '2026-01-01T10:00:00.000Z',
        'miRespuesta': {'respuesta': 'VOY', 'etaMinutos': 12},
      });
      expect(c.miRespuesta, 'VOY');
      expect(c.miEtaMinutos, 12);
    });

    test('NO_PUEDO llega sin minutos', () {
      final c = ConvocatoriaApp.fromJson({
        'id': 'c1',
        'mensaje': 'x',
        'creadoEn': '',
        'miRespuesta': {'respuesta': 'NO_PUEDO', 'etaMinutos': null},
      });
      expect(c.miRespuesta, 'NO_PUEDO');
      expect(c.miEtaMinutos, isNull);
    });
  });

  group('MovilBasico', () {
    test('el nombre incluye el alias solo si existe', () {
      expect(MovilBasico.fromJson({'id': '1', 'numeroInterno': '10', 'alias': 'Murita'}).nombre, '10 · Murita');
      expect(MovilBasico.fromJson({'id': '1', 'numeroInterno': '10', 'alias': null}).nombre, '10');
      expect(MovilBasico.fromJson({'id': '1', 'numeroInterno': '10', 'alias': ''}).nombre, '10');
    });
  });
}
