import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

/// Dibuja exclusivamente la geometría recibida del motor. Sin teselas ni cálculo GRE local.
class MapaMatpelMovil extends StatelessWidget {
  final Map<String, dynamic> datos;
  const MapaMatpelMovil({super.key, required this.datos});

  @override
  Widget build(BuildContext context) {
    final a = datos['aislamiento'] as Map?;
    final p = datos['proteccion'] as Map?;
    LatLng punto(List v) =>
        LatLng((v[1] as num).toDouble(), (v[0] as num).toDouble());
    final centro = a == null ? null : punto(a['centro'] as List);
    final puntos = p == null
        ? <LatLng>[]
        : ((p['coordinates'] as List).first as List)
            .map((v) => punto(v as List))
            .toList();
    final limites = <LatLng>[...puntos];
    if (centro != null) {
      // Solo encuadre cartográfico; las distancias recibidas no se reinterpretan.
      final radio = (a!['radioM'] as num).toDouble();
      for (final rumbo in [0.0, 90.0, 180.0, 270.0]) {
        limites
            .add(const Distance().offset(centro, radio > 0 ? radio : 1, rumbo));
      }
    }
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      const Text(
          'Zonas iniciales · norte arriba. Círculo: aislamiento; cuadrado: protección a favor del viento. No es un modelo de dispersión.'),
      if (limites.isNotEmpty)
        Semantics(
            label:
                'Zonas de aislamiento y acción protectora. Detalle equivalente en texto.',
            child: SizedBox(
                height: 320,
                child: FlutterMap(
                  key: ValueKey(datos.toString()),
                  options: MapOptions(
                    initialCenter: centro ?? puntos.first,
                    initialCameraFit: CameraFit.bounds(
                        bounds: LatLngBounds.fromPoints(limites),
                        padding: const EdgeInsets.all(30),
                        maxZoom: 18),
                    backgroundColor: const Color(0xFFEDF3F9),
                  ),
                  children: [
                    if (centro != null)
                      CircleLayer(circles: [
                        CircleMarker(
                          point: centro,
                          radius: (a!['radioM'] as num).toDouble(),
                          useRadiusInMeter: true,
                          color: const Color(0x22154E85),
                          borderColor: const Color(0xFF154E85),
                          borderStrokeWidth: 2,
                        )
                      ]),
                    if (puntos.isNotEmpty)
                      PolygonLayer(polygons: [
                        Polygon(
                          points: puntos,
                          color: const Color(0x22146B78),
                          borderColor: const Color(0xFF146B78),
                          borderStrokeWidth: 2,
                        )
                      ]),
                  ],
                ))),
      if (a != null)
        Text(
            'Aislamiento inicial: ${a['radioM']} m · Centro: ${a['centro']} (longitud, latitud).'),
      if (p != null)
        Text(
            'Acción protectora: longitud ${p['distanciaM']} m · ancho ${p['anchoM']} m · Viento desde ${p['vientoDesdeGrados']}°.'),
      Text(
          'Ubicación: ${datos['calidadUbicacion']} · Viento: ${datos['calidadViento']} · Precisión: ${datos['precisionM'] ?? 'desconocida'} m.'),
      for (final m in datos['motivos'] as List? ?? []) Text('$m'),
    ]);
  }
}
