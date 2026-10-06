import 'dart:convert';

import 'package:cryptography/cryptography.dart';

/// Datos de una version publicada que van firmados (ver scripts/firmar-version.mjs).
class DatosVersion {
  final int codigo;
  final String nombre;
  final bool obligatoria;
  final String notas;
  final int tamanioBytes;
  final String sha256;

  const DatosVersion({
    required this.codigo,
    required this.nombre,
    required this.obligatoria,
    required this.notas,
    required this.tamanioBytes,
    required this.sha256,
  });
}

/// Mensaje exacto que se firma. Debe ser identico al de firmar-version.mjs:
/// los campos van separados por salto de linea y las notas entran como su
/// SHA-256 (asi no depende de como cada lenguaje escape el texto).
Future<String> mensajeFirmado(DatosVersion d) async {
  final hashNotas = await Sha256().hash(utf8.encode(d.notas));
  final hex = hashNotas.bytes.map((b) => b.toRadixString(16).padLeft(2, '0')).join();
  return [
    'sigbo-apk-v1',
    d.codigo.toString(),
    d.nombre,
    d.obligatoria ? 'true' : 'false',
    hex,
    d.tamanioBytes.toString(),
    d.sha256,
  ].join('\n');
}

/// `true` solo si [firmaBase64] es una firma Ed25519 valida de [datos] hecha con
/// la clave privada que corresponde a [clavePublicaBase64]. Ante cualquier dato
/// mal formado devuelve `false` (nunca lanza): lo dudoso se rechaza.
Future<bool> firmaValida(
  DatosVersion datos,
  String firmaBase64,
  String clavePublicaBase64,
) async {
  try {
    final clave = base64.decode(clavePublicaBase64);
    final firma = base64.decode(firmaBase64);
    if (clave.length != 32 || firma.length != 64) return false;
    return await Ed25519().verify(
      utf8.encode(await mensajeFirmado(datos)),
      signature: Signature(
        firma,
        publicKey: SimplePublicKey(clave, type: KeyPairType.ed25519),
      ),
    );
  } catch (_) {
    return false;
  }
}
