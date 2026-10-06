import 'dart:math' as math;

/// Distancia en metros entre dos puntos (haversine). Mismo calculo que el servidor.
double distanciaMetros(double lat1, double lon1, double lat2, double lon2) {
  const radio = 6371008.8;
  double rad(double g) => g * math.pi / 180;
  final dLat = rad(lat2 - lat1);
  final dLon = rad(lon2 - lon1);
  final a = math.pow(math.sin(dLat / 2), 2) + math.cos(rad(lat1)) * math.cos(rad(lat2)) * math.pow(math.sin(dLon / 2), 2);
  return 2 * radio * math.asin(math.min(1.0, math.sqrt(a)));
}

/// Texto corto: "85 m" o "1,3 km".
String formatoDistancia(double metros) {
  if (metros < 1000) return '${metros.round()} m';
  return '${(metros / 1000).toStringAsFixed(1).replaceAll('.', ',')} km';
}

/// Devuelve [items] ordenados por cercania a ([lat],[lon]); cada uno con su distancia.
/// Los que no tienen coordenadas validas se descartan.
List<MapEntry<Map<String, dynamic>, double>> ordenarPorCercania(List<dynamic> items, double lat, double lon) {
  final salida = <MapEntry<Map<String, dynamic>, double>>[];
  for (final e in items) {
    if (e is! Map) continue;
    final la = (e['latitud'] as num?)?.toDouble();
    final lo = (e['longitud'] as num?)?.toDouble();
    if (la == null || lo == null) continue;
    salida.add(MapEntry(Map<String, dynamic>.from(e), distanciaMetros(lat, lon, la, lo)));
  }
  salida.sort((a, b) => a.value.compareTo(b.value));
  return salida;
}

/// Extrae el token de fichaje de lo que lee el QR: la direccion completa
/// (https://.../fichar?t=TOKEN) o el token solo. null si no parece valido.
String? tokenDeQr(String leido) {
  final texto = leido.trim();
  if (texto.isEmpty) return null;
  String candidato = texto;
  final uri = Uri.tryParse(texto);
  if (uri != null && uri.hasScheme) {
    final t = uri.queryParameters['t'];
    if (t == null) return null;
    candidato = t;
  }
  return RegExp(r'^[A-Za-z0-9_-]{16,128}$').hasMatch(candidato) ? candidato : null;
}
