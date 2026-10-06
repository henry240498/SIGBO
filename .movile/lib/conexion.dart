import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;

/// Direccion del servidor SIGBO que se guarda en el celular: `http(s)://anfitrion[:puerto]/api/v1`.
/// Acepta lo que escribe una persona ("192.168.1.10:3001", "http://miservidor") y lo deja en forma canonica.
/// Devuelve null si no se puede interpretar como una direccion de servidor.
String? normalizarUrlServidor(String entrada) {
  var t = entrada.trim();
  if (t.isEmpty || t.contains(RegExp(r'\s'))) return null;
  if (!RegExp(r'^[a-zA-Z][a-zA-Z0-9+.-]*://').hasMatch(t)) t = 'http://$t';
  final uri = Uri.tryParse(t);
  if (uri == null || (uri.scheme != 'http' && uri.scheme != 'https') || uri.host.isEmpty) return null;
  if (uri.hasQuery || uri.hasFragment || uri.userInfo.isNotEmpty) return null;
  var ruta = uri.path.replaceAll(RegExp(r'/+$'), '');
  if (ruta.isEmpty) ruta = '/api/v1';
  return Uri(scheme: uri.scheme, host: uri.host, port: uri.hasPort ? uri.port : null, path: ruta).toString();
}

/// Lo que dice el QR de conexion: `sigbo://servidor?url=<direccion>` o, por comodidad, la direccion sola.
String? urlDeQrServidor(String leido) {
  final texto = leido.trim();
  final uri = Uri.tryParse(texto);
  if (uri != null && uri.scheme == 'sigbo') {
    if (uri.host != 'servidor') return null;
    final u = uri.queryParameters['url'];
    return u == null ? null : normalizarUrlServidor(u);
  }
  if (uri != null && (uri.scheme == 'http' || uri.scheme == 'https')) return normalizarUrlServidor(texto);
  return null;
}

/// Contenido que debe llevar el QR (lo genera conectar-celulares.mjs con este mismo formato).
String contenidoQrServidor(String url) => 'sigbo://servidor?url=${Uri.encodeQueryComponent(url)}';

class ResultadoPrueba {
  final bool ok;
  final String mensaje;
  const ResultadoPrueba(this.ok, this.mensaje);
}

/// Comprueba que en [url] responde un servidor SIGBO (GET /salud, publico).
Future<ResultadoPrueba> probarServidor(String url, {http.Client? cliente, Duration espera = const Duration(seconds: 6)}) async {
  final c = cliente ?? http.Client();
  try {
    final res = await c.get(Uri.parse('$url/salud')).timeout(espera);
    if (res.statusCode == 200) {
      try {
        final j = jsonDecode(res.body);
        if (j is Map && j['estado'] == 'disponible') return const ResultadoPrueba(true, 'Conectado: el servidor SIGBO responde.');
      } catch (_) {}
      return const ResultadoPrueba(false, 'Hay algo en esa dirección, pero no parece ser SIGBO.');
    }
    if (res.statusCode == 503) return const ResultadoPrueba(false, 'El servidor responde pero su base de datos no está disponible.');
    return ResultadoPrueba(false, 'La dirección responde con un error (${res.statusCode}). Revisa que termine en /api/v1.');
  } on TimeoutException {
    return const ResultadoPrueba(false, 'No responde. Revisa que el celular esté en el mismo WiFi que la PC y que el servidor esté encendido.');
  } on SocketException {
    return const ResultadoPrueba(false, 'No se pudo conectar. Revisa la dirección, el WiFi y que el servidor esté encendido.');
  } on http.ClientException {
    return const ResultadoPrueba(false, 'No se pudo conectar. Revisa la dirección, el WiFi y que el servidor esté encendido.');
  } catch (_) {
    return const ResultadoPrueba(false, 'No se pudo comprobar la conexión.');
  } finally {
    if (cliente == null) c.close();
  }
}
