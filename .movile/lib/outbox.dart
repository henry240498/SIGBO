import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import 'api.dart';
import 'models.dart';
import 'store.dart';

/// Solicitud guardada localmente por falta de conexion. Conserva su
/// [clave] de idempotencia: al reintentarse, el servidor la reconoce y
/// NO la duplica aunque el primer intento haya llegado a medias.
class SolicitudEncolada {
  final String tipo;
  final String? detalle;
  final double? lat;
  final double? lng;
  final String clave;
  final String creadaEn;

  SolicitudEncolada({
    required this.tipo,
    this.detalle,
    this.lat,
    this.lng,
    required this.clave,
    required this.creadaEn,
  });

  Map<String, dynamic> toJson() => {
        'tipo': tipo,
        'detalle': detalle,
        'lat': lat,
        'lng': lng,
        'clave': clave,
        'creadaEn': creadaEn,
      };

  factory SolicitudEncolada.fromJson(Map<String, dynamic> j) =>
      SolicitudEncolada(
        tipo: (j['tipo'] ?? '').toString(),
        detalle: j['detalle']?.toString(),
        lat: (j['lat'] as num?)?.toDouble(),
        lng: (j['lng'] as num?)?.toDouble(),
        clave: (j['clave'] ?? '').toString(),
        creadaEn: (j['creadaEn'] ?? '').toString(),
      );
}

class FlushResult {
  final int enviadas;
  final int restantes;
  FlushResult(this.enviadas, this.restantes);
}

/// Cola offline + ultima lista vista (para consultar sin conexion).
class Outbox {
  static const _kCola = 'outbox_cola';
  static const _kCache = 'outbox_cache_alertas';
  static const _kCacheTs = 'outbox_cache_ts';

  static Future<List<SolicitudEncolada>> leerCola() async {
    final p = await SharedPreferences.getInstance();
    final raw = p.getString(_kCola);
    if (raw == null || raw.isEmpty) return [];
    try {
      final arr = jsonDecode(raw) as List;
      return arr
          .map((e) => SolicitudEncolada.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (_) {
      return [];
    }
  }

  static Future<void> encolar(SolicitudEncolada s) async {
    final cola = await leerCola();
    cola.add(s);
    final p = await SharedPreferences.getInstance();
    await p.setString(
        _kCola, jsonEncode(cola.map((e) => e.toJson()).toList()));
  }

  static Future<FlushResult> enviarPendientes() async {
    final cola = await leerCola();
    if (cola.isEmpty) return FlushResult(0, 0);
    if (!await TokenStore.haySesion()) {
      return FlushResult(0, cola.length);
    }
    final api = SigboApi();
    var ok = 0;
    final restantes = <SolicitudEncolada>[];
    for (final s in cola) {
      try {
        await api.crearAlerta(s.tipo,
            detalle: s.detalle, lat: s.lat, lng: s.lng, clave: s.clave);
        ok++;
      } catch (_) {
        restantes.add(s);
      }
    }
    final p = await SharedPreferences.getInstance();
    await p.setString(
        _kCola, jsonEncode(restantes.map((e) => e.toJson()).toList()));
    return FlushResult(ok, restantes.length);
  }

  static Future<void> guardarCache(List<Alerta> alertas) async {
    final p = await SharedPreferences.getInstance();
    await p.setString(_kCache,
        jsonEncode(alertas.map((a) => _alertaJson(a)).toList()));
    await p.setInt(_kCacheTs, DateTime.now().millisecondsSinceEpoch);
  }

  static Future<List<Alerta>> leerCache() async {
    final p = await SharedPreferences.getInstance();
    final raw = p.getString(_kCache);
    if (raw == null || raw.isEmpty) return [];
    try {
      final arr = jsonDecode(raw) as List;
      return arr.map((e) => Alerta.fromJson(e as Map<String, dynamic>)).toList();
    } catch (_) {
      return [];
    }
  }

  static Future<int> cacheTs() async {
    final p = await SharedPreferences.getInstance();
    return p.getInt(_kCacheTs) ?? 0;
  }

  static Map<String, dynamic> _alertaJson(Alerta a) => {
        'id': a.id,
        'tipo': a.tipo,
        'estado': a.estado,
        'solicitanteId': a.solicitanteId,
        'solicitanteNombre': a.solicitanteNombre,
        'detalle': a.detalle,
        'creadoEn': a.creadoEn,
        'atendidaPorNombre': a.atendidaPorNombre,
        'atendidaEn': a.atendidaEn,
        'motivoEstado': a.motivoEstado,
      };
}
