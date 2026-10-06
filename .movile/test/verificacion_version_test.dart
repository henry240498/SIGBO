import 'package:flutter_test/flutter_test.dart';
import 'package:sigbo_alertas/verificacion_version.dart';

// Vector generado con scripts/firmar-version.mjs (Node, Ed25519) usando una
// clave descartable: prueba que Dart y Node firman/verifican el MISMO mensaje.
const _clavePublica = 'gMGLtNXNdfzTL+4qTinTnwWDWI9m59We4Tlu8Z2IY5w=';
const _firma =
    'ZgV8oVCqWlsTTh/zui65TrQw0GPQVCBBd//io+kx300uzmLGLdfDPKj001OEXXNfr+SoMHhNJtQe2nHHnxhmBw==';

DatosVersion _datos({
  int codigo = 7,
  String nombre = '2.3.4',
  bool obligatoria = true,
  String notas = 'Corrige el envío de posición ✓',
  int tamanio = 123456,
  String? sha,
}) =>
    DatosVersion(
      codigo: codigo,
      nombre: nombre,
      obligatoria: obligatoria,
      notas: notas,
      tamanioBytes: tamanio,
      sha256: sha ?? 'a' * 64,
    );

void main() {
  test('acepta la firma hecha por el publicador (Node)', () async {
    expect(await firmaValida(_datos(), _firma, _clavePublica), isTrue);
  });

  test('rechaza si cambia el hash del APK', () async {
    expect(await firmaValida(_datos(sha: 'b' * 64), _firma, _clavePublica), isFalse);
  });

  test('rechaza si cambia la version, el tamaño, la obligatoriedad o las notas', () async {
    expect(await firmaValida(_datos(codigo: 8), _firma, _clavePublica), isFalse);
    expect(await firmaValida(_datos(tamanio: 1), _firma, _clavePublica), isFalse);
    expect(await firmaValida(_datos(obligatoria: false), _firma, _clavePublica), isFalse);
    expect(await firmaValida(_datos(notas: 'otra cosa'), _firma, _clavePublica), isFalse);
  });

  test('rechaza una clave publica ajena', () async {
    const otra = 'BnlTPP20mZIQnmsJW6FFSQeWayICHeSW9Okc0deGKDk=';
    expect(await firmaValida(_datos(), _firma, otra), isFalse);
  });

  test('rechaza datos mal formados sin lanzar', () async {
    expect(await firmaValida(_datos(), '', _clavePublica), isFalse);
    expect(await firmaValida(_datos(), 'no-es-base64!!', _clavePublica), isFalse);
    expect(await firmaValida(_datos(), _firma, 'corta'), isFalse);
  });
}
