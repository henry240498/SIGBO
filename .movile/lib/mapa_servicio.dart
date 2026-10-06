import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

const _azulMapa = Color(0xFF1767A8);

/// Ubicación del incidente y móviles del servicio. Las coordenadas llegan del
/// backend solo después de validar permisos; las teselas usan el servidor
/// cartográfico institucional configurado allí, nunca un proveedor público.
class MapaServicioMovil extends StatelessWidget {
  final Map<String, dynamic> datos;

  const MapaServicioMovil({super.key, required this.datos});

  @override
  Widget build(BuildContext context) {
    final servicio = Map<String, dynamic>.from(datos['servicio'] as Map);
    final base = Map<String, dynamic>.from(datos['mapaBase'] as Map);
    final ubicacion = servicio['ubicacion'] is Map
        ? Map<String, dynamic>.from(servicio['ubicacion'] as Map)
        : null;
    final moviles = (datos['moviles'] as List? ?? const [])
        .map((e) => Map<String, dynamic>.from(e as Map))
        .toList();
    final puntos = <_PuntoMapa>[];
    if (ubicacion != null) {
      final p = _punto(ubicacion['latitud'], ubicacion['longitud']);
      if (p != null)
        puntos.add(_PuntoMapa(p, 'Servicio', const Color(0xFFC62828),
            Icons.local_fire_department));
    }
    for (final movil in moviles) {
      final pos = movil['posicion'];
      if (pos is! Map) continue;
      final punto = _punto(pos['latitud'], pos['longitud']);
      if (punto == null) continue;
      puntos.add(_PuntoMapa(
        punto,
        '${movil['movil']} · ${_estado(movil['estado'])}',
        _colorEstado('${movil['estado']}'),
        Icons.local_shipping,
      ));
    }

    if (puntos.isEmpty) {
      return _sinUbicaciones(servicio['ubicacionRestringida'] == true);
    }

    final template = (base['urlTeselas'] as String?)?.trim();
    final attribution = (base['atribucion'] as String?)?.trim() ?? '';
    final bounds = puntos.length > 1
        ? LatLngBounds.fromPoints(puntos.map((p) => p.coordenada).toList())
        : null;
    final opciones = MapOptions(
      initialCenter: puntos.first.coordenada,
      initialZoom: 14,
      initialCameraFit: bounds == null
          ? null
          : CameraFit.bounds(bounds: bounds, padding: const EdgeInsets.all(38)),
      minZoom: 5,
      maxZoom: 19,
    );

    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      if (template == null || template.isEmpty)
        const Padding(
          padding: EdgeInsets.only(bottom: 8),
          child: Text(
            'Mapa vial institucional no configurado. Se muestran las posiciones relativas sin enviar ubicaciones a terceros.',
            style: TextStyle(fontSize: 12, color: Color(0xFF72520D)),
          ),
        ),
      SizedBox(
        height: 310,
        child: ClipRRect(
          borderRadius: BorderRadius.circular(12),
          child: FlutterMap(
            options: opciones,
            children: [
              if (template != null && template.isNotEmpty)
                TileLayer(
                  urlTemplate: template,
                  userAgentPackageName: 'org.cbvc.sigbo',
                  maxZoom: 19,
                ),
              MarkerLayer(
                markers: puntos
                    .map((p) => Marker(
                          point: p.coordenada,
                          width: 58,
                          height: 58,
                          child: Tooltip(
                            message: p.etiqueta,
                            child: CircleAvatar(
                              backgroundColor: p.color,
                              foregroundColor: Colors.white,
                              child: Icon(p.icono, size: 24),
                            ),
                          ),
                        ))
                    .toList(),
              ),
              if (template != null &&
                  template.isNotEmpty &&
                  attribution.isNotEmpty)
                RichAttributionWidget(
                  alignment: AttributionAlignment.bottomRight,
                  showFlutterMapAttribution: true,
                  attributions: [
                    TextSourceAttribution(attribution, prependCopyright: false)
                  ],
                ),
            ],
          ),
        ),
      ),
      const SizedBox(height: 8),
      Wrap(spacing: 12, runSpacing: 6, children: [
        for (final p in puntos) _leyenda(p.color, p.etiqueta),
      ]),
    ]);
  }

  Widget _sinUbicaciones(bool restringida) => Container(
        width: double.infinity,
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Icon(Icons.location_searching, color: _azulMapa),
          const SizedBox(width: 9),
          Expanded(
            child: Text(restringida
                ? 'La ubicación exacta está reservada a perfiles autorizados.'
                : 'Todavía no hay coordenadas del incidente ni de los móviles.'),
          ),
        ]),
      );

  Widget _leyenda(Color color, String texto) =>
      Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(Icons.circle, color: color, size: 11),
        const SizedBox(width: 5),
        Text(texto, style: const TextStyle(fontSize: 11)),
      ]);

  static LatLng? _punto(dynamic lat, dynamic lon) {
    final la = (lat as num?)?.toDouble();
    final lo = (lon as num?)?.toDouble();
    if (la == null ||
        lo == null ||
        !la.isFinite ||
        !lo.isFinite ||
        la.abs() > 90 ||
        lo.abs() > 180) return null;
    return LatLng(la, lo);
  }

  static String _estado(dynamic estado) =>
      '${estado ?? ''}'.replaceAll('_', ' ');

  static Color _colorEstado(String estado) => switch (estado) {
        'DESPACHADO' => const Color(0xFFDA7B10),
        'EN_SERVICIO' => const Color(0xFFC62828),
        'REGRESANDO' => const Color(0xFF1767A8),
        _ => const Color(0xFF64748B),
      };
}

class _PuntoMapa {
  final LatLng coordenada;
  final String etiqueta;
  final Color color;
  final IconData icono;

  const _PuntoMapa(this.coordenada, this.etiqueta, this.color, this.icono);
}
