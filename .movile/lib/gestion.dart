import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';

import 'api.dart';
import 'offline.dart';
import 'operacion.dart';
import 'store.dart';
import 'terreno.dart';

// ======================= piezas comunes =======================

String _dur(dynamic seg) {
  if (seg is! num) return '—';
  final s = seg.round();
  if (s >= 3600) return '${s ~/ 3600} h ${(s % 3600) ~/ 60} min';
  if (s >= 60) return '${s ~/ 60} min${s % 60 > 0 ? ' ${s % 60} s' : ''}';
  return '$s s';
}

String _fecha(DateTime d) => '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';

String _fechaHora(dynamic iso) {
  final d = DateTime.tryParse('$iso')?.toLocal();
  if (d == null) return '';
  String p(int n) => n.toString().padLeft(2, '0');
  return '${p(d.day)}/${p(d.month)} ${p(d.hour)}:${p(d.minute)}';
}

void _msg(BuildContext c, String t) => ScaffoldMessenger.of(c).showSnackBar(SnackBar(content: Text(t)));

/// Pantalla de solo lectura con copia local: con red muestra lo nuevo y lo guarda;
/// sin red muestra lo ultimo guardado, avisando de cuando es.
class VistaCacheada extends StatefulWidget {
  final String titulo;
  final String ruta;
  final Widget Function(BuildContext context, dynamic datos) construir;
  const VistaCacheada({super.key, required this.titulo, required this.ruta, required this.construir});
  @override
  State<VistaCacheada> createState() => _VistaCacheadaState();
}

class _VistaCacheadaState extends State<VistaCacheada> {
  final _api = SigboApi();
  dynamic _datos;
  int? _desdeMs;
  String _error = '';
  bool _cargando = true;

  @override
  void initState() {
    super.initState();
    _cargar();
  }

  Future<void> _cargar() async {
    setState(() => _cargando = true);
    try {
      final r = await Offline.leer(_api, widget.ruta);
      if (!mounted) return;
      setState(() {
        _datos = r.datos;
        _desdeMs = r.desdeCache ? r.guardadoMs : null;
        _error = '';
        _cargando = false;
      });
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _cargando = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.titulo), actions: [IconButton(icon: const Icon(Icons.refresh), onPressed: _cargar)]),
      body: Column(children: [
        EstadoSync(datosDesdeMs: _desdeMs, alCambiar: _cargar),
        Expanded(
          child: _cargando
              ? const Center(child: CircularProgressIndicator())
              : _error.isNotEmpty
                  ? Center(child: Padding(padding: const EdgeInsets.all(24), child: Text(_error)))
                  : widget.construir(context, _datos),
        ),
      ]),
    );
  }
}

Widget _vacio(String t) => Padding(padding: const EdgeInsets.all(24), child: Text(t));

// ======================= vencimientos del personal =======================

class PantallaVencimientos extends StatelessWidget {
  const PantallaVencimientos({super.key});
  @override
  Widget build(BuildContext context) => VistaCacheada(
        titulo: 'Vencimientos',
        ruta: '/aptitudes/vencimientos?dias=60',
        construir: (c, datos) {
          final l = (datos as List).cast<Map>();
          if (l.isEmpty) return _vacio('Nada vence en los próximos 60 días.');
          return ListView(padding: const EdgeInsets.all(12), children: [
            for (final v in l)
              Card(
                child: ListTile(
                  leading: Icon(v['vencido'] == true ? Icons.error : Icons.schedule, color: v['vencido'] == true ? Colors.red : Colors.orange),
                  title: Text('${v['bombero']}'),
                  subtitle: Text('${v['descripcion']}\n${v['vencido'] == true ? 'Vencio hace ${-(v['diasRestantes'] as num)} dias' : 'Vence en ${v['diasRestantes']} dias'} (${v['fecha']})'),
                  isThreeLine: true,
                ),
              ),
          ]);
        },
      );
}

// ======================= horas de servicio =======================

class PantallaHoras extends StatelessWidget {
  const PantallaHoras({super.key});
  @override
  Widget build(BuildContext context) {
    final hoy = DateTime.now();
    return VistaCacheada(
      titulo: 'Horas (30 días)',
      ruta: '/horas-servicio?desde=${_fecha(hoy.subtract(const Duration(days: 30)))}&hasta=${_fecha(hoy)}',
      construir: (c, datos) {
        final m = datos as Map;
        final l = (m['bomberos'] as List).cast<Map>();
        final lim = m['limites'] as Map?;
        return ListView(padding: const EdgeInsets.all(12), children: [
          Text(lim == null ? 'No hay límites configurados: solo se muestran las horas.' : 'Límite: ${lim['horasMaximasPeriodo']} h cada ${lim['periodoDias']} días, descanso mínimo ${lim['descansoMinimoHoras']} h. Con alertas: ${m['conAlertas']}'),
          const SizedBox(height: 8),
          if (l.isEmpty) _vacio('No hay guardias con personal asignado en ese período.'),
          for (final b in l)
            Card(
              child: ListTile(
                title: Text('${b['nombre']}'),
                subtitle: Text('${b['guardias']} guardias · ${b['totalHoras']} h${b['maximoEnPeriodo'] != null ? ' · max ${b['maximoEnPeriodo']} h en el periodo' : ''}'),
                trailing: (b['excedeLimite'] == true || (b['violacionesDescanso'] as List).isNotEmpty)
                    ? Tooltip(message: b['excedeLimite'] == true ? 'Excede horas' : 'Descanso corto', child: const Icon(Icons.warning_amber, color: Colors.orange))
                    : null,
              ),
            ),
        ]);
      },
    );
  }
}

// ======================= indicadores =======================

class PantallaIndicadores extends StatelessWidget {
  const PantallaIndicadores({super.key});
  @override
  Widget build(BuildContext context) {
    final hoy = DateTime.now();
    return VistaCacheada(
      titulo: 'Indicadores (90 días)',
      ruta: '/indicadores/operativos?desde=${_fecha(hoy.subtract(const Duration(days: 90)))}&hasta=${_fecha(hoy)}',
      construir: (c, datos) {
        final m = datos as Map;
        Widget tiempo(String t, dynamic e) {
          final x = e as Map;
          return Card(child: ListTile(title: Text(t), subtitle: Text((x['n'] ?? 0) == 0 ? 'Sin datos todavía' : 'Mediana ${_dur(x['mediana'])} · 9 de cada 10 en ${_dur(x['p90'])} · ${x['n']} dato(s)')));
        }

        List<Widget> conteo(String t, dynamic lista) {
          final l = (lista as List).cast<Map>();
          return [
            Padding(padding: const EdgeInsets.only(top: 12, bottom: 4), child: Text(t, style: const TextStyle(fontWeight: FontWeight.bold))),
            if (l.isEmpty) const Text('Sin datos'),
            for (final x in l) Text('${x['clave']}: ${x['cantidad']}'),
          ];
        }

        return ListView(padding: const EdgeInsets.all(12), children: [
          Card(child: ListTile(title: Text('Servicios del período: ${m['totalServicios']}'), subtitle: Text('${m['sinDespacho']} sin móvil despachado'))),
          tiempo('Del aviso a la salida', m['tiempoDeSalida']),
          tiempo('Del aviso a la llegada', m['tiempoDeRespuesta']),
          tiempo('Viaje de cada móvil', m['tiempoDeViaje']),
          ...conteo('Por tipo', m['porTipo']),
          ...conteo('Por franja horaria', m['porFranja']),
        ]);
      },
    );
  }
}

// ======================= prevencion =======================

class PantallaPrevencion extends StatefulWidget {
  const PantallaPrevencion({super.key});
  @override
  State<PantallaPrevencion> createState() => _PrevencionState();
}

class _PrevencionState extends State<PantallaPrevencion> {
  final _api = SigboApi();
  final _sync = GlobalKey<EstadoSyncState>();
  Key _recarga = UniqueKey();
  Set<String> _permisos = {};

  @override
  void initState() {
    super.initState();
    TokenStore.permisos().then((p) {
      if (mounted) setState(() => _permisos = p);
    });
  }

  Future<void> _registrar() async {
    final est = TextEditingController();
    final dir = TextEditingController();
    final obs = TextEditingController();
    final cert = TextEditingController();
    String resultado = 'APROBADO';
    DateTime? vence;
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, set) => AlertDialog(
          title: const Text('Registrar inspección'),
          content: SingleChildScrollView(
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              TextField(controller: est, decoration: const InputDecoration(labelText: 'Establecimiento')),
              TextField(controller: dir, decoration: const InputDecoration(labelText: 'Dirección')),
              DropdownButtonFormField<String>(
                initialValue: resultado,
                decoration: const InputDecoration(labelText: 'Resultado'),
                items: const [
                  DropdownMenuItem(value: 'APROBADO', child: Text('Aprobado')),
                  DropdownMenuItem(value: 'CON_OBSERVACIONES', child: Text('Con observaciones')),
                  DropdownMenuItem(value: 'RECHAZADO', child: Text('Rechazado')),
                ],
                onChanged: (v) => set(() => resultado = v ?? 'APROBADO'),
              ),
              if (resultado == 'APROBADO') ...[
                TextField(controller: cert, decoration: const InputDecoration(labelText: 'N.º de certificado')),
                TextButton(
                  onPressed: () async {
                    final d = await showDatePicker(context: ctx, initialDate: DateTime.now().add(const Duration(days: 365)), firstDate: DateTime.now(), lastDate: DateTime.now().add(const Duration(days: 3650)));
                    if (d != null) set(() => vence = d);
                  },
                  child: Text(vence == null ? 'Elegir vencimiento del certificado' : 'Vence: ${_fecha(vence!)}'),
                ),
              ],
              TextField(controller: obs, decoration: const InputDecoration(labelText: 'Observaciones'), maxLines: 2),
            ]),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancelar')),
            FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Registrar')),
          ],
        ),
      ),
    );
    if (ok != true) return;
    if (est.text.trim().length < 2 || dir.text.trim().length < 3) return _msg(context, 'Completa el establecimiento y la dirección.');
    if (resultado == 'APROBADO' && (cert.text.trim().isEmpty || vence == null)) return _msg(context, 'Una inspección aprobada lleva número y vencimiento del certificado.');
    final cuerpo = <String, dynamic>{
      'establecimiento': est.text.trim(),
      'direccion': dir.text.trim(),
      'fecha': _fecha(DateTime.now()),
      'resultado': resultado,
      if (obs.text.trim().isNotEmpty) 'observaciones': obs.text.trim(),
      if (resultado == 'APROBADO') 'certificadoNumero': cert.text.trim(),
      if (resultado == 'APROBADO') 'certificadoVence': _fecha(vence!),
    };
    try {
      final d = await Offline.ejecutar(_api, 'POST', '/prevencion/inspecciones', cuerpo, 'Inspección de ${est.text.trim()}');
      if (!mounted) return;
      _msg(context, d == Destino.enviado ? 'Inspección registrada' : 'Sin conexión: queda guardada y se envía sola.');
      await _sync.currentState?.refrescar();
      setState(() => _recarga = UniqueKey());
    } on ApiException catch (e) {
      if (mounted) _msg(context, e.mensaje);
    }
  }

  @override
  Widget build(BuildContext context) {
    final puede = _permisos.contains('servicios:crear');
    return Stack(children: [
      VistaCacheada(
        key: _recarga,
        titulo: 'Prevención',
        ruta: '/prevencion/estado?dias=30',
        construir: (c, datos) {
          final l = (datos as List).cast<Map>();
          const etq = {'VIGENTE': 'Certificado vigente', 'POR_VENCER': 'Por vencer', 'VENCIDO': 'Vencido', 'PENDIENTE': 'Pendiente de regularizar'};
          return ListView(padding: const EdgeInsets.fromLTRB(12, 12, 12, 88), children: [
            if (l.isEmpty) _vacio('Todavía no hay inspecciones registradas.'),
            for (final e in l)
              Card(
                child: ListTile(
                  leading: Icon(e['estado'] == 'VIGENTE' ? Icons.verified : Icons.report_problem, color: e['estado'] == 'VIGENTE' ? Colors.green : (e['estado'] == 'POR_VENCER' ? Colors.orange : Colors.red)),
                  title: Text('${e['establecimiento']}'),
                  subtitle: Text('${e['direccion']}\n${etq[e['estado']] ?? e['estado']}${e['certificadoVence'] != null ? ' · vence ${e['certificadoVence']}' : ''}'),
                  isThreeLine: true,
                ),
              ),
          ]);
        },
      ),
      if (puede) Positioned(right: 16, bottom: 16, child: FloatingActionButton.extended(onPressed: _registrar, icon: const Icon(Icons.add), label: const Text('Inspección'))),
    ]);
  }
}

// ======================= reservas =======================

class PantallaReservas extends StatefulWidget {
  const PantallaReservas({super.key});
  @override
  State<PantallaReservas> createState() => _ReservasState();
}

class _ReservasState extends State<PantallaReservas> {
  final _api = SigboApi();
  final _sync = GlobalKey<EstadoSyncState>();
  Key _recarga = UniqueKey();
  Set<String> _permisos = {};
  List<Map> _instalaciones = [];

  @override
  void initState() {
    super.initState();
    TokenStore.permisos().then((p) {
      if (mounted) setState(() => _permisos = p);
    });
    Offline.leer(_api, '/reservas/instalaciones').then((r) {
      if (mounted) setState(() => _instalaciones = (r.datos as List).cast<Map>());
    }).catchError((_) {});
  }

  Future<DateTime?> _pedirFechaHora(String ayuda) async {
    final d = await showDatePicker(context: context, helpText: ayuda, initialDate: DateTime.now().add(const Duration(days: 1)), firstDate: DateTime.now(), lastDate: DateTime.now().add(const Duration(days: 730)));
    if (d == null || !mounted) return null;
    final t = await showTimePicker(context: context, helpText: ayuda, initialTime: const TimeOfDay(hour: 9, minute: 0));
    if (t == null) return null;
    return DateTime(d.year, d.month, d.day, t.hour, t.minute);
  }

  Future<void> _solicitar() async {
    if (_instalaciones.isEmpty) return _msg(context, 'No hay instalaciones cargadas.');
    final titulo = TextEditingController();
    final quien = TextEditingController();
    String inst = '${_instalaciones.first['id']}';
    DateTime? ini;
    DateTime? fin;
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, set) => AlertDialog(
          title: const Text('Solicitar reserva'),
          content: SingleChildScrollView(
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              DropdownButtonFormField<String>(
                initialValue: inst,
                decoration: const InputDecoration(labelText: 'Instalación'),
                items: [for (final i in _instalaciones) DropdownMenuItem(value: '${i['id']}', child: Text('${i['nombre']}'))],
                onChanged: (v) => set(() => inst = v ?? inst),
              ),
              TextField(controller: titulo, decoration: const InputDecoration(labelText: 'Para qué')),
              TextField(controller: quien, decoration: const InputDecoration(labelText: 'Quién la pide')),
              TextButton(
                onPressed: () async {
                  final d = await _pedirFechaHora('Desde');
                  if (d != null) set(() => ini = d);
                },
                child: Text(ini == null ? 'Elegir inicio' : 'Desde: ${_fechaHora(ini!.toIso8601String())}'),
              ),
              TextButton(
                onPressed: () async {
                  final d = await _pedirFechaHora('Hasta');
                  if (d != null) set(() => fin = d);
                },
                child: Text(fin == null ? 'Elegir fin' : 'Hasta: ${_fechaHora(fin!.toIso8601String())}'),
              ),
            ]),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancelar')),
            FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Enviar')),
          ],
        ),
      ),
    );
    if (ok != true) return;
    if (titulo.text.trim().length < 3 || quien.text.trim().length < 2 || ini == null || fin == null) return _msg(context, 'Completa todos los datos.');
    if (!fin!.isAfter(ini!)) return _msg(context, 'El fin debe ser posterior al inicio.');
    try {
      final d = await Offline.ejecutar(
        _api,
        'POST',
        '/reservas',
        {'instalacionId': inst, 'titulo': titulo.text.trim(), 'solicitanteNombre': quien.text.trim(), 'inicio': ini!.toUtc().toIso8601String(), 'fin': fin!.toUtc().toIso8601String()},
        'Reserva: ${titulo.text.trim()}',
      );
      if (!mounted) return;
      _msg(context, d == Destino.enviado ? 'Solicitud enviada' : 'Sin conexión: queda guardada y se envía sola.');
      await _sync.currentState?.refrescar();
      setState(() => _recarga = UniqueKey());
    } on ApiException catch (e) {
      if (mounted) _msg(context, e.mensaje);
    }
  }

  Future<void> _accion(Map r, String que) async {
    String? motivo;
    if (que == 'RECHAZAR') {
      final c = TextEditingController();
      motivo = await showDialog<String>(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('Rechazar reserva'),
          content: TextField(controller: c, autofocus: true, decoration: const InputDecoration(labelText: 'Motivo (obligatorio)')),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancelar')),
            FilledButton(onPressed: () => Navigator.pop(ctx, c.text.trim()), child: const Text('Rechazar')),
          ],
        ),
      );
      if (motivo == null || motivo.isEmpty) return;
    }
    try {
      final cancelar = que == 'CANCELAR';
      final d = await Offline.ejecutar(_api, 'PATCH', '/reservas/${r['id']}/${cancelar ? 'cancelar' : 'decision'}', cancelar ? {} : {'decision': que, if (motivo != null) 'motivo': motivo}, '${cancelar ? 'Cancelar' : que == 'APROBAR' ? 'Aprobar' : 'Rechazar'} reserva ${r['titulo']}');
      if (!mounted) return;
      _msg(context, d == Destino.enviado ? 'Hecho' : 'Sin conexión: queda guardado y se envía solo.');
      await _sync.currentState?.refrescar();
      setState(() => _recarga = UniqueKey());
    } on ApiException catch (e) {
      if (mounted) _msg(context, e.mensaje);
    }
  }

  @override
  Widget build(BuildContext context) {
    final solicita = _permisos.contains('reservas:solicitar');
    final decide = _permisos.contains('reservas:decidir');
    const etq = {'SOLICITADA': 'Pendiente de decisión', 'APROBADA': 'Aprobada', 'RECHAZADA': 'Rechazada', 'CANCELADA': 'Cancelada'};
    String nombreDe(dynamic id) => _instalaciones.cast<Map>().firstWhere((i) => i['id'] == id, orElse: () => {'nombre': '?'})['nombre'] as String;
    return Stack(children: [
      VistaCacheada(
        key: _recarga,
        titulo: 'Reservas',
        ruta: '/reservas',
        construir: (c, datos) {
          final l = (datos as List).cast<Map>();
          return ListView(padding: const EdgeInsets.fromLTRB(12, 12, 12, 88), children: [
            if (l.isEmpty) _vacio('No hay reservas.'),
            for (final r in l)
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('${r['titulo']}', style: const TextStyle(fontWeight: FontWeight.bold)),
                    Text('${nombreDe(r['instalacionId'])} · ${r['solicitanteNombre']}'),
                    Text('${_fechaHora(r['inicio'])} a ${_fechaHora(r['fin'])}'),
                    Text(etq['${r['estado']}'] ?? '${r['estado']}'),
                    if (r['motivoDecision'] != null) Text('Motivo: ${r['motivoDecision']}', style: const TextStyle(fontSize: 12)),
                    Wrap(spacing: 8, children: [
                      if (decide && r['estado'] == 'SOLICITADA') FilledButton(onPressed: () => _accion(r, 'APROBAR'), child: const Text('Aprobar')),
                      if (decide && r['estado'] == 'SOLICITADA') OutlinedButton(onPressed: () => _accion(r, 'RECHAZAR'), child: const Text('Rechazar')),
                      if ((r['estado'] == 'SOLICITADA' || r['estado'] == 'APROBADA') && (decide || solicita)) TextButton(onPressed: () => _accion(r, 'CANCELAR'), child: const Text('Cancelar')),
                    ]),
                  ]),
                ),
              ),
          ]);
        },
      ),
      if (solicita) Positioned(right: 16, bottom: 16, child: FloatingActionButton.extended(onPressed: _solicitar, icon: const Icon(Icons.add), label: const Text('Reserva'))),
    ]);
  }
}

// ======================= control de dotacion del movil =======================

class PantallaDotacion extends StatefulWidget {
  const PantallaDotacion({super.key});
  @override
  State<PantallaDotacion> createState() => _DotacionState();
}

class _DotacionState extends State<PantallaDotacion> {
  final _api = SigboApi();
  final _sync = GlobalKey<EstadoSyncState>();
  List<Map> _moviles = [];
  List<Map> _items = [];
  List<Map> _faltantes = [];
  List<Map> _pendientes = [];
  String _movil = '';
  final Map<String, TextEditingController> _cant = {};
  int? _desdeMs;
  String _error = '';
  bool _puede = false;
  Set<String> _permisos = {};

  @override
  void initState() {
    super.initState();
    _inicio();
  }

  Future<void> _inicio() async {
    _permisos = await TokenStore.permisos();
    _puede = _permisos.contains('vehiculos:dotacion');
    try {
      final m = await Offline.leer(_api, '/flota/tablero');
      _moviles = (m.datos as List).cast<Map>();
      try {
        _faltantes = ((await Offline.leer(_api, '/flota/faltantes')).datos as List).cast<Map>();
        _pendientes = ((await Offline.leer(_api, '/flota/datos-pendientes')).datos as List).cast<Map>();
      } catch (_) {}
      if (_moviles.isNotEmpty) _movil = '${_moviles.first['id']}';
      if (mounted) setState(() => _desdeMs = m.desdeCache ? m.guardadoMs : null);
      await _cargarItems();
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    }
  }

  Future<void> _cargarItems() async {
    if (_movil.isEmpty) return;
    try {
      final r = await Offline.leer(_api, '/flota/moviles/$_movil/dotacion');
      for (final c in _cant.values) {
        c.dispose();
      }
      _cant.clear();
      final l = (r.datos as List).cast<Map>();
      for (final i in l) {
        _cant['${i['id']}'] = TextEditingController();
      }
      if (mounted) {
        setState(() {
          _items = l;
          _error = '';
        });
      }
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    }
  }

  Future<void> _registrar() async {
    final lecturas = <Map<String, dynamic>>[];
    for (final e in _cant.entries) {
      final t = e.value.text.trim();
      if (t.isEmpty) continue;
      final n = int.tryParse(t);
      if (n == null || n < 0) return _msg(context, 'Las cantidades deben ser números enteros, 0 o más.');
      lecturas.add({'itemId': e.key, 'cantidadActual': n});
    }
    if (lecturas.isEmpty) return _msg(context, 'Carga la cantidad hallada de al menos un item.');
    final nombre = _moviles.firstWhere((m) => '${m['id']}' == _movil, orElse: () => {'numeroInterno': '?'})['numeroInterno'];
    try {
      final d = await Offline.ejecutar(_api, 'POST', '/flota/moviles/$_movil/dotacion/control', {'lecturas': lecturas}, 'Control de dotación del móvil $nombre');
      if (!mounted) return;
      _msg(context, d == Destino.enviado ? 'Control registrado' : 'Sin conexión: queda guardado y se envía solo.');
      await _sync.currentState?.refrescar();
      if (d == Destino.enviado) await _cargarItems();
    } on ApiException catch (e) {
      if (mounted) _msg(context, e.mensaje);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Dotación de los móviles')),
      body: Column(children: [
        EstadoSync(key: _sync, datosDesdeMs: _desdeMs),
        Expanded(
          child: ListView(padding: const EdgeInsets.all(12), children: [
            if (_error.isNotEmpty) Text(_error),
            if (_faltantes.isNotEmpty)
              Card(
                color: Colors.red[50],
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('Reposición pendiente (${_faltantes.length})', style: const TextStyle(fontWeight: FontWeight.bold)),
                    for (final f in _faltantes) Text('Móvil ${f['numeroInterno']}: faltan ${f['faltante']} de ${f['descripcion']}'),
                  ]),
                ),
              ),
            if (_pendientes.isNotEmpty)
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('Datos de móviles sin completar (${_pendientes.length})', style: const TextStyle(fontWeight: FontWeight.bold)),
                    for (final p in _pendientes) Text('Móvil ${p['numeroInterno']}: ${(p['faltantes'] as List).join(', ')}', style: const TextStyle(fontSize: 12)),
                  ]),
                ),
              ),
            if (_moviles.isNotEmpty)
              DropdownButtonFormField<String>(
                initialValue: _movil,
                decoration: const InputDecoration(labelText: 'Móvil'),
                items: [for (final m in _moviles) DropdownMenuItem(value: '${m['id']}', child: Text('${m['numeroInterno']}${m['alias'] != null ? ' · ${m['alias']}' : ''}'))],
                onChanged: (v) {
                  setState(() => _movil = v ?? _movil);
                  _cargarItems();
                },
              ),
            if (_movil.isNotEmpty)
              Wrap(children: [
                if (_permisos.contains('adjuntos:subir'))
                  TextButton.icon(icon: const Icon(Icons.photo_camera), label: const Text('Foto del móvil'), onPressed: () => adjuntarFoto(context, 'VEHICULO', _movil, 'Móvil ${_moviles.firstWhere((m) => '${m['id']}' == _movil, orElse: () => {'numeroInterno': '?'})['numeroInterno']}')),
                if (_permisos.contains('adjuntos:subir'))
                  TextButton.icon(icon: const Icon(Icons.draw), label: const Text('Firma del chofer'), onPressed: () => tomarFirma(context, 'VEHICULO', _movil, 'Checklist del chofer ${DateTime.now().day}/${DateTime.now().month}')),
                if (_permisos.contains('adjuntos:ver'))
                  TextButton.icon(icon: const Icon(Icons.photo_library), label: const Text('Ver fotos y firmas'), onPressed: () => Navigator.push(context, MaterialPageRoute<void>(builder: (_) => PantallaAdjuntos(entidad: 'VEHICULO', entidadId: _movil, titulo: 'Fotos y firmas del móvil')))),
              ]),
            if (_items.isEmpty && _error.isEmpty) _vacio('Este móvil todavía no tiene dotación definida (se define en la web).'),
            for (final i in _items)
              Card(
                child: ListTile(
                  title: Text('${i['descripcion']}'),
                  subtitle: Text('Debe haber ${i['cantidadObjetivo']} · ${i['cantidadActual'] == null ? 'sin controlar' : 'ultimo control: ${i['cantidadActual']}${(i['faltante'] ?? 0) > 0 ? ' (faltan ${i['faltante']})' : ''}'}'),
                  trailing: _puede ? SizedBox(width: 72, child: TextField(controller: _cant['${i['id']}'], keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Hay'))) : null,
                ),
              ),
            if (_puede && _items.isNotEmpty) FilledButton(onPressed: _registrar, child: const Text('Registrar control')),
          ]),
        ),
      ]),
    );
  }
}

// ======================= personal (directorio) =======================

class PantallaPersonal extends StatefulWidget {
  const PantallaPersonal({super.key});
  @override
  State<PantallaPersonal> createState() => _PersonalState();
}

class _PersonalState extends State<PantallaPersonal> {
  String _q = '';
  @override
  Widget build(BuildContext context) => VistaCacheada(
        titulo: 'Personal',
        ruta: '/personal/bomberos?estado=ACTIVO',
        construir: (c, datos) => StatefulBuilder(builder: (c, set) {
          String norm(String s) => s.toLowerCase().replaceAll(RegExp('[áàä]'), 'a').replaceAll(RegExp('[éèë]'), 'e').replaceAll(RegExp('[íìï]'), 'i').replaceAll(RegExp('[óòö]'), 'o').replaceAll(RegExp('[úùü]'), 'u');
          final todos = (datos as List).cast<Map>();
          final q = norm(_q.trim());
          final l = todos.where((b) => q.isEmpty || norm('${b['apellido']} ${b['nombre']} ${b['numeroBombero']} ${b['rango']} ${b['cedula']}').contains(q)).toList();
          return Column(children: [
            Padding(padding: const EdgeInsets.all(12), child: TextField(decoration: const InputDecoration(prefixIcon: Icon(Icons.search), labelText: 'Buscar por nombre, número o rango'), onChanged: (v) => set(() => _q = v))),
            Expanded(
              child: ListView(children: [
                for (final b in l)
                  ListTile(
                    leading: const Icon(Icons.person),
                    title: Text('${b['apellido']}, ${b['nombre']}'),
                    subtitle: Text('${b['numeroBombero']} · ${b['rango']}${b['cargo'] != null ? ' · ${b['cargo']}' : ''}'),
                  ),
                if (l.isEmpty) _vacio('Sin resultados.'),
              ]),
            ),
          ]);
        }),
      );
}

// ======================= convocatorias (para quien convoca) =======================

class PantallaConvocar extends StatefulWidget {
  const PantallaConvocar({super.key});
  @override
  State<PantallaConvocar> createState() => _ConvocarState();
}

class _ConvocarState extends State<PantallaConvocar> {
  final _api = SigboApi();
  final _sync = GlobalKey<EstadoSyncState>();
  final _texto = TextEditingController();
  Key _recarga = UniqueKey();

  Future<void> _convocar() async {
    final t = _texto.text.trim();
    if (t.length < 3) return _msg(context, 'Escribe el mensaje.');
    try {
      final d = await Offline.ejecutar(_api, 'POST', '/convocatorias', {'mensaje': t}, 'Convocatoria: $t');
      _texto.clear();
      if (!mounted) return;
      _msg(context, d == Destino.enviado ? 'Convocatoria enviada' : 'Sin conexión: queda guardada y se envía sola.');
      await _sync.currentState?.refrescar();
      setState(() => _recarga = UniqueKey());
    } on ApiException catch (e) {
      if (mounted) _msg(context, e.mensaje);
    }
  }

  Future<void> _ver(Map c) async {
    String texto;
    try {
      final r = await Offline.leer(_api, '/convocatorias/${c['id']}');
      final m = r.datos as Map;
      final resp = (m['respuestas'] as List).cast<Map>();
      final t = m['totales'] as Map;
      texto = 'Van: ${t['voy']} · No pueden: ${t['noPuedo']}\n\n${resp.isEmpty ? 'Nadie respondio todavia.' : resp.map((x) => '${x['usuarioNombre']}: ${x['respuesta'] == 'VOY' ? 'voy${x['etaMinutos'] != null ? ' (${x['etaMinutos']} min)' : ''}' : 'no puedo'}').join('\n')}';
    } catch (e) {
      texto = e.toString();
    }
    if (!mounted) return;
    await showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(title: Text('${c['mensaje']}'), content: SingleChildScrollView(child: Text(texto)), actions: [TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cerrar'))]),
    );
  }

  Future<void> _cerrar(Map c) async {
    try {
      final d = await Offline.ejecutar(_api, 'PATCH', '/convocatorias/${c['id']}/cerrar', {}, 'Cerrar convocatoria ${c['mensaje']}');
      if (!mounted) return;
      _msg(context, d == Destino.enviado ? 'Convocatoria cerrada' : 'Sin conexión: queda guardado y se envía solo.');
      await _sync.currentState?.refrescar();
      setState(() => _recarga = UniqueKey());
    } on ApiException catch (e) {
      if (mounted) _msg(context, e.mensaje);
    }
  }

  @override
  Widget build(BuildContext context) => Column(children: [
        Expanded(
          child: VistaCacheada(
            key: _recarga,
            titulo: 'Convocar al personal',
            ruta: '/convocatorias',
            construir: (c, datos) {
              final l = (datos as List).cast<Map>();
              return ListView(padding: const EdgeInsets.all(12), children: [
                TextField(controller: _texto, maxLines: 2, decoration: const InputDecoration(labelText: 'Mensaje para el personal')),
                const SizedBox(height: 8),
                FilledButton(onPressed: _convocar, child: const Text('Convocar')),
                EstadoSync(key: _sync),
                for (final x in l.take(20))
                  Card(
                    child: ListTile(
                      title: Text('${x['mensaje']}'),
                      subtitle: Text('${_fechaHora(x['creadoEn'])} · ${x['estado'] == 'ABIERTA' ? 'Abierta' : 'Cerrada'}'),
                      onTap: () => _ver(x),
                      trailing: x['estado'] == 'ABIERTA' ? TextButton(onPressed: () => _cerrar(x), child: const Text('Cerrar')) : null,
                    ),
                  ),
              ]);
            },
          ),
        ),
      ]);
}

// ======================= alta de hidrante o punto de riesgo con el GPS =======================

/// Registra un hidrante en la posicion actual del celular (alta rapida en terreno).
Future<void> registrarHidranteAqui(BuildContext context) async {
  final api = SigboApi();
  final codigo = TextEditingController();
  final dir = TextEditingController();
  final caudal = TextEditingController();
  final ok = await showDialog<bool>(
    context: context,
    builder: (ctx) => AlertDialog(
      title: const Text('Registrar hidrante aquí'),
      content: SingleChildScrollView(
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          const Text('Se usa tu ubicación actual.', style: TextStyle(fontSize: 12)),
          TextField(controller: codigo, decoration: const InputDecoration(labelText: 'Código')),
          TextField(controller: dir, decoration: const InputDecoration(labelText: 'Dirección')),
          TextField(controller: caudal, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Caudal l/min (opcional)')),
        ]),
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancelar')),
        FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Registrar')),
      ],
    ),
  );
  if (ok != true || !context.mounted) return;
  if (codigo.text.trim().isEmpty || dir.text.trim().length < 3) return _msg(context, 'Completa código y dirección.');
  Position? pos;
  try {
    var perm = await Geolocator.checkPermission();
    if (perm == LocationPermission.denied) perm = await Geolocator.requestPermission();
    if (perm == LocationPermission.denied || perm == LocationPermission.deniedForever) {
      if (context.mounted) _msg(context, 'Falta el permiso de ubicación.');
      return;
    }
    pos = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high, timeLimit: const Duration(seconds: 20));
  } catch (_) {
    if (context.mounted) _msg(context, 'No se pudo obtener la ubicación. Sal a cielo abierto y reintenta.');
    return;
  }
  final cuerpo = <String, dynamic>{
    'codigo': codigo.text.trim(),
    'direccion': dir.text.trim(),
    'latitud': pos.latitude,
    'longitud': pos.longitude,
    if (int.tryParse(caudal.text.trim()) != null) 'caudalLpm': int.parse(caudal.text.trim()),
  };
  try {
    final d = await Offline.ejecutar(api, 'POST', '/cartografia/hidrantes', cuerpo, 'Hidrante ${codigo.text.trim()}');
    if (context.mounted) _msg(context, d == Destino.enviado ? 'Hidrante registrado' : 'Sin conexión: queda guardado y se envía solo.');
  } on ApiException catch (e) {
    if (context.mounted) _msg(context, e.mensaje);
  }
}
