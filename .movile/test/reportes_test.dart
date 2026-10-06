import 'package:flutter_test/flutter_test.dart';
import 'package:sigbo_alertas/reportes.dart';

void main() {
  test('el cuerpo lleva tipo, origen, mensaje e id, y omite lo vacío', () {
    final c = cuerpoDeReporte(tipo: 'ERROR', mensaje: '  El botón no responde ', titulo: '  ', pantalla: 'Llamados');
    expect(c['tipo'], 'ERROR');
    expect(c['origen'], 'APP_MOVIL');
    expect(c['mensaje'], 'El botón no responde');
    expect(c.containsKey('titulo'), isFalse);
    expect(c['pantalla'], 'Llamados');
    expect(c['id'], matches(RegExp(r'^[0-9a-f-]{36}$')));
  });

  test('el id es el que se indicó, para que un reenvío no duplique', () {
    final c = cuerpoDeReporte(tipo: 'SUGERENCIA', mensaje: 'Agregar modo oscuro', id: '11111111-2222-4333-8444-555555555555');
    expect(c['id'], '11111111-2222-4333-8444-555555555555');
  });

  test('un mensaje más largo que el máximo se recorta, no se rechaza', () {
    final c = cuerpoDeReporte(tipo: 'OTRO', mensaje: 'x' * (maxMensaje + 50));
    expect((c['mensaje'] as String).length, maxMensaje);
  });
}
