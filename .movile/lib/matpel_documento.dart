import 'dart:convert';
import 'dart:io';

import 'package:cryptography/cryptography.dart';
import 'package:flutter/foundation.dart';
import 'package:path_provider/path_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

const _partesGre = [
  'entradas',
  'guias',
  'bloques',
  'tablas',
  'filas',
  'celdas',
  'referencias',
  'paginas',
  'secciones',
  'reglas',
  'camposFuente',
];
final _uuidGre = RegExp(r'^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$');
final _shaGre = RegExp(r'^[0-9a-f]{64}$');
Future<String> huellaGre(List<int> bytes) async => (await Sha256().hash(bytes))
    .bytes
    .map((b) => b.toRadixString(16).padLeft(2, '0'))
    .join();

/// Solo fuente documental. No guarda incidentes ni ejecuta el motor del servidor.
class DocumentoGre {
  final Map<String, dynamic> manifest;
  final Map<String, dynamic> contenido;
  final Uint8List pdf;
  final Map<String, dynamic>? interpretacion;
  final Map<String, Map<Object?, Map<String, dynamic>>> _indices = {};
  DocumentoGre._(this.manifest, this.contenido, this.pdf,
      [this.interpretacion]);

  String get versionId => manifest['versionGreId'] as String;
  List<Map<String, dynamic>> registros(String parte) =>
      (contenido[parte] as List).cast<Map<String, dynamic>>();
  Map<String, dynamic>? porId(String parte, Object? id) {
    return (_indices[parte] ??= {
      for (final r in registros(parte)) r['id']: r
    })[id];
  }

  List<Map<String, dynamic>> buscar(String q) {
    final n = normalizarGre(q);
    if (RegExp(r'^\d{3}$').hasMatch(n))
      return registros('guias').where((g) => g['numero'] == n).toList();
    if (n.length < 2 || n.length > 120) return [];
    final es = registros('entradas')
        .where(
          (e) => RegExp(r'^\d{4}$').hasMatch(n)
              ? e['identificador'] == n
              : normalizarGre('${e['nombreOriginal']}').contains(n),
        )
        .toList();
    es.sort(
      (a, b) =>
          '${a['nombreNormalizado']}'.compareTo('${b['nombreNormalizado']}'),
    );
    return es;
  }

  List<Map<String, dynamic>> bloquesGuia(Object id) =>
      registros('bloques').where((b) => b['guiaId'] == id).toList()
        ..sort((a, b) => (a['orden'] as num).compareTo(b['orden'] as num));

  static Future<DocumentoGre> verificar(Map<String, dynamic> p) async {
    final m = p['manifest'];
    if (m is! Map<String, dynamic> ||
        m['versionPaquete'] != 1 ||
        m['finalidad'] != 'CONSULTA_DOCUMENTAL_GRE_SIN_DATOS_DE_INCIDENTES' ||
        m['motorDisponibleOffline'] != false ||
        !_uuidGre.hasMatch('${m['versionGreId']}') ||
        !_shaGre.hasMatch('${m['catalogoSha256']}') ||
        !_shaGre.hasMatch('${m['documentoSha256']}')) {
      throw const FormatException('Formato de paquete GRE no admitido.');
    }
    final json = p['catalogoJson'];
    final base64 = p['pdfBase64'];
    if (json is! String ||
        base64 is! String ||
        json.length > 50000000 ||
        base64.length > 66666668)
      throw const FormatException('Paquete GRE inválido o demasiado grande.');
    final bytes = utf8.encode(json);
    final pdf = base64Decode(base64);
    if (bytes.length + pdf.length > 50000000)
      throw const FormatException('La edición excede el tamaño admitido.');
    if (bytes.length != m['catalogoBytes'] ||
        await huellaGre(bytes) != m['catalogoSha256'])
      throw const FormatException('El catálogo GRE perdió integridad.');
    if (pdf.length != m['documentoBytes'] ||
        await huellaGre(pdf) != m['documentoSha256'] ||
        pdf.length < 5 ||
        ascii.decode(pdf.sublist(0, 5), allowInvalid: true) != '%PDF-')
      throw const FormatException('El PDF GRE perdió integridad.');
    final c = jsonDecode(json);
    if (c is! Map<String, dynamic> ||
        _partesGre.any(
          (k) =>
              c[k] is! List ||
              (c[k] as List).any((r) => r is! Map<String, dynamic>),
        )) throw const FormatException('Contenido documental GRE incompleto.');
    return DocumentoGre._(m, c, pdf);
  }

  static Future<DocumentoGre> verificarPartes(Map<String, dynamic> m,
      Uint8List catalogo, Uint8List pdf, Uint8List interpretacion) async {
    if (m['versionPaquete'] != 2 ||
        m['finalidad'] != 'CONSULTA_DOCUMENTAL_GRE_SIN_DATOS_DE_INCIDENTES' ||
        m['motorDisponibleOffline'] != false ||
        !_uuidGre.hasMatch('${m['versionGreId']}') ||
        !_shaGre.hasMatch('${m['catalogoSha256']}') ||
        !_shaGre.hasMatch('${m['documentoSha256']}') ||
        !_shaGre.hasMatch('${m['interpretacionSha256']}') ||
        catalogo.length + pdf.length + interpretacion.length > 50000000 ||
        catalogo.length != m['catalogoBytes'] ||
        pdf.length != m['documentoBytes'] ||
        interpretacion.length != m['interpretacionBytes']) {
      throw const FormatException(
          'Manifiesto o tamaño de edición GRE inválidos.');
    }
    if (await huellaGre(catalogo) != m['catalogoSha256'] ||
        await huellaGre(pdf) != m['documentoSha256'] ||
        await huellaGre(interpretacion) != m['interpretacionSha256'] ||
        pdf.length < 5 ||
        ascii.decode(pdf.sublist(0, 5), allowInvalid: true) != '%PDF-') {
      throw const FormatException(
          'Alguna parte de la edición GRE perdió integridad.');
    }
    final c = jsonDecode(utf8.decode(catalogo));
    final i = jsonDecode(utf8.decode(interpretacion));
    if (c is! Map<String, dynamic> ||
        _partesGre.any((k) =>
            c[k] is! List ||
            (c[k] as List).any((r) => r is! Map<String, dynamic>)) ||
        i is! Map<String, dynamic> ||
        i['schemaVersion'] != 1 ||
        i['documentoSha256'] != m['documentoSha256'] ||
        i['versionInterpretacion'] != m['versionInterpretacion'] ||
        i['reglasDocumentales'] is! List ||
        i['cantidadesTabla3'] is! List) {
      throw const FormatException(
          'Contenido o interpretación GRE incompatibles.');
    }
    return DocumentoGre._(m, c, pdf, i);
  }
}

Future<DocumentoGre> _verificarPartesGre(Map<String, dynamic> p) =>
    DocumentoGre.verificarPartes(
        Map<String, dynamic>.from(p['manifest'] as Map),
        p['catalogo'] as Uint8List,
        p['pdf'] as Uint8List,
        p['interpretacion'] as Uint8List);

Future<DocumentoGre> _leerPartesGre(String ruta) async {
  if (await File('$ruta/manifest.json').length() > 65536)
    throw const FormatException('Manifiesto GRE demasiado grande.');
  final m = jsonDecode(await File('$ruta/manifest.json').readAsString());
  if (m is! Map<String, dynamic>)
    throw const FormatException('Manifiesto GRE inválido.');
  final nombres = ['catalogo.json', 'original.pdf', 'interpretacion.json'];
  var total = 0;
  for (final n in nombres) {
    total += await File('$ruta/$n').length();
  }
  if (total > 50000000)
    throw const FormatException('Edición GRE local demasiado grande.');
  return DocumentoGre.verificarPartes(
      m,
      await File('$ruta/${nombres[0]}').readAsBytes(),
      await File('$ruta/${nombres[1]}').readAsBytes(),
      await File('$ruta/${nombres[2]}').readAsBytes());
}

// Misma búsqueda editorial, con equivalencias españolas; conserva el literal mostrado.
String normalizarGre(String s) {
  const de = 'ÁÀÂÄÃÉÈÊËÍÌÎÏÓÒÔÖÕÚÙÛÜÇÑ';
  const a = 'AAAAAEEEEIIIIOOOOOUUUUCN';
  var n = s
      .toUpperCase()
      .replaceAllMapped(RegExp(r'(\S)-\r?\n'), (m) => '${m[1]}-')
      .replaceAll(RegExp(r'\r?\n'), ' ');
  for (var i = 0; i < de.length; i++) {
    n = n.replaceAll(de[i], a[i]);
  }
  return n
      .replaceAll(RegExp(r'[\u0300-\u036f]'), '')
      .replaceAll(RegExp(r'\s+'), ' ')
      .trim();
}

/// Paquetes inmutables y puntero pequeño. Se publica el puntero solo tras verificar y guardar.
class BibliotecaGre {
  final Directory carpeta;
  BibliotecaGre(this.carpeta);
  static Future<BibliotecaGre> abrir() async => BibliotecaGre(
        Directory(
            '${(await getApplicationDocumentsDirectory()).path}/sigbo_gre'),
      );
  static const _puntero = 'sigbo_gre_documento_v1';
  String _nombre(DocumentoGre d) =>
      '${d.versionId}-${d.manifest['catalogoSha256']}.json';
  String _nombrePartes(DocumentoGre d) =>
      '${d.versionId}-${d.manifest['catalogoSha256']}-${d.manifest['interpretacionSha256']}.gre';
  bool _nombreValido(String n) => RegExp(
          r'^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}-[0-9a-f]{64}(\.json|-[0-9a-f]{64}\.gre)$')
      .hasMatch(n);
  Future<DocumentoGre?> actual() async {
    final n = (await SharedPreferences.getInstance()).getString(_puntero);
    if (n == null) return null;
    if (!_nombreValido(n))
      throw const FormatException('Referencia local GRE inválida.');
    return leer(n);
  }

  Future<DocumentoGre> leer(String nombre) async {
    if (!_nombreValido(nombre))
      throw const FormatException('Nombre de archivo GRE inválido.');
    if (nombre.endsWith('.gre')) {
      final d = await compute(_leerPartesGre, '${carpeta.path}/$nombre');
      if (_nombrePartes(d) != nombre)
        throw const FormatException(
            'La edición guardada no corresponde al manifiesto.');
      return d;
    }
    final f = File('${carpeta.path}/$nombre');
    if (await f.length() > 75000000)
      throw const FormatException('Paquete local demasiado grande.');
    final d = await DocumentoGre.verificar(
      jsonDecode(await f.readAsString()) as Map<String, dynamic>,
    );
    if (_nombre(d) != nombre)
      throw const FormatException('El archivo GRE corresponde a otra edición.');
    return d;
  }

  Future<DocumentoGre> guardar(Map<String, dynamic> p) async {
    final d = await DocumentoGre.verificar(p);
    await carpeta.create(recursive: true);
    final nombre = _nombre(d);
    final destino = File('${carpeta.path}/$nombre');
    var guardarArchivo = !await destino.exists();
    if (!guardarArchivo) {
      try {
        await leer(nombre);
      } on FormatException {
        await destino.rename(
            '${destino.path}.rechazado-${DateTime.now().microsecondsSinceEpoch}');
        guardarArchivo = true;
      }
    }
    if (guardarArchivo) {
      final parcial = File('${destino.path}.parcial');
      await parcial.writeAsString(jsonEncode(p), flush: true);
      await parcial.rename(destino.path);
    }
    // Un error/descarga incompleta no reemplaza la copia anterior.
    await (await SharedPreferences.getInstance()).setString(_puntero, nombre);
    return d;
  }

  Future<List<String>> ediciones() async {
    if (!await carpeta.exists()) return [];
    return (await carpeta.list().toList())
        .map((f) => f.uri.pathSegments.where((s) => s.isNotEmpty).last)
        .where(_nombreValido)
        .toList()
      ..sort();
  }

  Future<DocumentoGre> guardarPartes(Map<String, dynamic> manifest,
      Uint8List catalogo, Uint8List pdf, Uint8List interpretacion) async {
    // Verificación/JSON fuera del hilo de interfaz; todos los bytes preceden al puntero.
    final d = await compute(_verificarPartesGre, {
      'manifest': manifest,
      'catalogo': catalogo,
      'pdf': pdf,
      'interpretacion': interpretacion
    });
    await carpeta.create(recursive: true);
    final nombre = _nombrePartes(d);
    final destino = Directory('${carpeta.path}/$nombre');
    if (await destino.exists()) {
      try {
        await leer(nombre);
        await (await SharedPreferences.getInstance())
            .setString(_puntero, nombre);
        return d;
      } on FileSystemException {
        await destino.rename(
            '${destino.path}.rechazado-${DateTime.now().microsecondsSinceEpoch}');
      } on FormatException {
        await destino.rename(
            '${destino.path}.rechazado-${DateTime.now().microsecondsSinceEpoch}');
      }
    }
    final parcial = await carpeta.createTemp('.$nombre-');
    await File('${parcial.path}/catalogo.json')
        .writeAsBytes(catalogo, flush: true);
    await File('${parcial.path}/original.pdf').writeAsBytes(pdf, flush: true);
    await File('${parcial.path}/interpretacion.json')
        .writeAsBytes(interpretacion, flush: true);
    await File('${parcial.path}/manifest.json')
        .writeAsString(jsonEncode(manifest), flush: true);
    await parcial.rename(destino.path);
    await (await SharedPreferences.getInstance()).setString(_puntero, nombre);
    return d;
  }

  Future<DocumentoGre> elegir(String nombre) async {
    final d = await leer(nombre);
    await (await SharedPreferences.getInstance()).setString(_puntero, nombre);
    return d;
  }
}
