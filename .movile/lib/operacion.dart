import 'dart:async';
import 'dart:convert' as conv;

import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:qr_code_scanner_plus/qr_code_scanner_plus.dart';

import 'api.dart';
import 'geo.dart';
import 'gestion.dart';
import 'offline.dart';
import 'store.dart';
import 'terreno.dart';

// ======================= piezas comunes =======================

String _hora(int ms) {
  final d = DateTime.fromMillisecondsSinceEpoch(ms);
  String p(int n) => n.toString().padLeft(2, '0');
  return '${p(d.day)}/${p(d.month)} ${p(d.hour)}:${p(d.minute)}';
}

String _local(dynamic iso) {
  final d = DateTime.tryParse('$iso')?.toLocal();
  if (d == null) return '';
  String p(int n) => n.toString().padLeft(2, '0');
  return '${p(d.day)}/${p(d.month)} ${p(d.hour)}:${p(d.minute)}';
}

void _aviso(BuildContext c, String texto) =>
    ScaffoldMessenger.of(c).showSnackBar(SnackBar(content: Text(texto)));

/// Franja superior: operaciones esperando conexion, rechazos del servidor y datos guardados.
class EstadoSync extends StatefulWidget {
  final VoidCallback? alCambiar;
  final int? datosDesdeMs;
  const EstadoSync({super.key, this.alCambiar, this.datosDesdeMs});
  @override
  State<EstadoSync> createState() => EstadoSyncState();
}

class EstadoSyncState extends State<EstadoSync> {
  int _pend = 0;
  List<Rechazo> _rech = [];
  bool _enviando = false;
  Timer? _t;

  @override
  void initState() {
    super.initState();
    refrescar();
    _t = Timer.periodic(
        const Duration(seconds: 20), (_) => enviar(silencioso: true));
  }

  @override
  void dispose() {
    _t?.cancel();
    super.dispose();
  }

  Future<void> refrescar() async {
    final p = await Offline.pendientes();
    final r = await Offline.rechazos();
    if (mounted)
      setState(() {
        _pend = p;
        _rech = r;
      });
  }

  Future<void> enviar({bool silencioso = false}) async {
    if (_enviando) return;
    if (await Offline.pendientes() == 0) {
      await refrescar();
      return;
    }
    setState(() => _enviando = true);
    String? error;
    ResultadoEnvio? r;
    try {
      r = await Offline.vaciar(SigboApi());
    } catch (e) {
      error = e.toString();
    }
    if (!mounted) return;
    setState(() => _enviando = false);
    await refrescar();
    if (r != null && (r.enviadas > 0 || r.rechazadas > 0)) {
      widget.alCambiar?.call();
      if (mounted)
        _aviso(context,
            'Enviadas: ${r.enviadas}${r.rechazadas > 0 ? ' · rechazadas: ${r.rechazadas}' : ''}');
    } else if (!silencioso) {
      _aviso(
          context,
          error ??
              (r != null && r.restantes > 0
                  ? 'Sin conexión con el servidor: se reintentará solo.'
                  : 'Nada para enviar.'));
    }
  }

  @override
  Widget build(BuildContext context) {
    final filas = <Widget>[];
    if (widget.datosDesdeMs != null) {
      filas.add(Text(
          'Sin conexión · datos guardados de ${_hora(widget.datosDesdeMs!)}',
          style: const TextStyle(fontStyle: FontStyle.italic)));
    }
    if (_pend > 0) {
      filas.add(Row(children: [
        Expanded(
            child: Text('$_pend operación(es) esperando conexión',
                style: const TextStyle(fontWeight: FontWeight.bold))),
        TextButton(
            onPressed: _enviando ? null : () => enviar(),
            child: Text(_enviando ? 'Enviando…' : 'Enviar ahora')),
      ]));
    }
    if (_rech.isNotEmpty) {
      filas.add(Row(children: [
        Expanded(
            child: Text(
                '${_rech.length} operación(es) rechazadas por el servidor',
                style: const TextStyle(color: Colors.red))),
        TextButton(
          onPressed: () async {
            await showDialog<void>(
              context: context,
              builder: (ctx) => AlertDialog(
                title: const Text('Rechazadas'),
                content: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      for (final r in _rech)
                        Padding(
                            padding: const EdgeInsets.only(bottom: 8),
                            child: Text('${r.descripcion}\n${r.motivo}'))
                    ],
                  ),
                ),
                actions: [
                  TextButton(
                      onPressed: () => Navigator.pop(ctx),
                      child: const Text('Cerrar'))
                ],
              ),
            );
            await Offline.limpiarRechazos();
            await refrescar();
          },
          child: const Text('Ver'),
        ),
      ]));
    }
    if (filas.isEmpty) return const SizedBox.shrink();
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.fromLTRB(12, 8, 12, 4),
      padding: const EdgeInsets.all(13),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF4DC),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFF0D9A8)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.cloud_sync, color: Color(0xFF9C5D00), size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
                crossAxisAlignment: CrossAxisAlignment.start, children: filas),
          ),
        ],
      ),
    );
  }
}

// ======================= menu de operacion =======================

class PantallaOperacion extends StatefulWidget {
  const PantallaOperacion({super.key});
  @override
  State<PantallaOperacion> createState() => _OperacionState();
}

class _OperacionState extends State<PantallaOperacion> {
  Set<String> _permisos = {};
  final _sync = GlobalKey<EstadoSyncState>();

  @override
  void initState() {
    super.initState();
    TokenStore.permisos().then((p) {
      if (mounted) setState(() => _permisos = p);
    });
    WidgetsBinding.instance.addPostFrameCallback(
        (_) => _sync.currentState?.enviar(silencioso: true));
  }

  @override
  Widget build(BuildContext context) {
    final p = _permisos;
    final items = <Widget>[];

    Widget acceso(
      IconData icono,
      String titulo,
      String detalle,
      Color color,
      Widget Function() destino,
    ) =>
        Card(
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: color.withValues(alpha: 0.12),
              child: Icon(icono, color: color),
            ),
            title: Text(titulo,
                style: const TextStyle(fontWeight: FontWeight.w700)),
            subtitle: Text(detalle),
            trailing: const Icon(Icons.arrow_forward_ios, size: 15),
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute<void>(builder: (_) => destino()),
            ).then((_) => _sync.currentState?.refrescar()),
          ),
        );

    void grupo(String titulo, Color color, List<Widget> accesos) {
      if (accesos.isEmpty) return;
      items.add(Padding(
        padding: const EdgeInsets.only(left: 4, top: 20, bottom: 5),
        child: Row(children: [
          Container(
            width: 4,
            height: 22,
            decoration: BoxDecoration(
                color: color, borderRadius: BorderRadius.circular(4)),
          ),
          const SizedBox(width: 10),
          Text(titulo,
              style:
                  const TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
        ]),
      ));
      items.addAll(accesos);
    }

    grupo('Respuesta y terreno', const Color(0xFF1767A8), [
      if (p.contains('vehiculos:ver'))
        acceso(
            Icons.local_shipping,
            'Flota y despacho',
            'Ver móviles y registrar salidas y regresos',
            const Color(0xFF1767A8),
            () => const PantallaFlota()),
      if (p.contains('servicios:ver'))
        acceso(Icons.call, 'Llamados', 'Registrar y seguir llamadas recibidas',
            const Color(0xFF008F87), () => const PantallaLlamados()),
      if (p.contains('servicios:ver'))
        acceso(
            Icons.water_drop,
            'Hidrantes y riesgos',
            'Consultar puntos cercanos, riesgos y preplanes',
            const Color(0xFF25845A),
            () => const PantallaCartografia()),
    ]);

    grupo('Guardia y personal', const Color(0xFF7355A3), [
      if (p.contains('asistencia:marcar'))
        acceso(
            Icons.qr_code_scanner,
            'Fichar entrada o salida',
            'Escanear el código de la puerta del cuartel',
            const Color(0xFF7355A3),
            () => const PantallaFichar()),
      if (p.contains('servicios:convocar'))
        acceso(
            Icons.campaign,
            'Convocar al personal',
            'Avisar al personal y consultar sus respuestas',
            const Color(0xFFE48717),
            () => const PantallaConvocar()),
      if (p.contains('personal:ver'))
        acceso(
            Icons.people,
            'Directorio del personal',
            'Buscar por nombre, número o rango',
            const Color(0xFF1767A8),
            () => const PantallaPersonal()),
      if (p.contains('personal:ver'))
        acceso(
            Icons.event_busy,
            'Vencimientos',
            'Consultar aptitudes, licencias y certificaciones',
            const Color(0xFFC77719),
            () => const PantallaVencimientos()),
      if (p.contains('guardias:ver'))
        acceso(
            Icons.timer,
            'Horas de servicio',
            'Ver horas y descansos registrados',
            const Color(0xFF008F87),
            () => const PantallaHoras()),
      if (p.contains('ausencias:solicitar'))
        acceso(
            Icons.event_available,
            'Ausencias',
            'Solicitar o revisar permisos',
            const Color(0xFF7355A3),
            () => const PantallaAusencias()),
    ]);

    grupo('Recursos del cuartel', const Color(0xFF438A55), [
      if (p.contains('vehiculos:ver'))
        acceso(
            Icons.inventory_2,
            'Dotación de móviles',
            'Controlar materiales y faltantes',
            const Color(0xFF438A55),
            () => const PantallaDotacion()),
      if (p.contains('reservas:ver'))
        acceso(
            Icons.meeting_room,
            'Reservas',
            'Consultar y gestionar instalaciones',
            const Color(0xFF008F87),
            () => const PantallaReservas()),
    ]);

    grupo('Gestión e informes', const Color(0xFF63748A), [
      if (p.contains('servicios:ver'))
        acceso(Icons.fact_check, 'Prevención', 'Inspecciones y certificados',
            const Color(0xFF63748A), () => const PantallaPrevencion()),
      if (p.contains('servicios:ver'))
        acceso(
            Icons.bar_chart,
            'Indicadores',
            'Tiempos de respuesta y actividad',
            const Color(0xFF1767A8),
            () => const PantallaIndicadores()),
      if (p.contains('seguridad:ver_logs'))
        acceso(
            Icons.history,
            'Auditoría',
            'Consultar quién registró cada cambio',
            const Color(0xFF63748A),
            () => const PantallaAuditoria()),
    ]);

    return Scaffold(
      appBar: AppBar(title: const Text('Operaciones')),
      body: Column(children: [
        EstadoSync(key: _sync),
        Expanded(
          child: ListView(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
            children: [
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: const Color(0xFFE8F1FA),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Row(
                  children: [
                    CircleAvatar(
                      radius: 23,
                      backgroundColor: Colors.white,
                      child: Icon(Icons.grid_view, color: Color(0xFF1767A8)),
                    ),
                    SizedBox(width: 13),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('¿Qué necesitas hacer?',
                              style: TextStyle(
                                  fontSize: 16, fontWeight: FontWeight.w800)),
                          SizedBox(height: 3),
                          Text('Elige una tarea para continuar.',
                              style: TextStyle(fontSize: 12)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              if (items.isEmpty)
                const Padding(
                  padding: EdgeInsets.all(24),
                  child: Text(
                      'Tu usuario no tiene permisos para estas funciones.'),
                )
              else
                ...items,
              const SizedBox(height: 18),
              const Card(
                color: Color(0xFFFFF4DC),
                child: ListTile(
                  leading: Icon(Icons.cloud_sync, color: Color(0xFF9C5D00)),
                  title: Text('Trabajo sin conexión'),
                  subtitle: Text(
                      'Las tareas compatibles se guardan y se envían cuando vuelve la red.'),
                ),
              ),
            ],
          ),
        ),
      ]),
    );
  }
}

// ======================= flota y despacho =======================

class PantallaFlota extends StatefulWidget {
  const PantallaFlota({super.key});
  @override
  State<PantallaFlota> createState() => _FlotaState();
}

class _FlotaState extends State<PantallaFlota> {
  static const _rTablero = '/flota/tablero';
  final _api = SigboApi();
  final _sync = GlobalKey<EstadoSyncState>();
  List<dynamic> _moviles = [];
  List<dynamic> _servicios = [];
  Map<String, dynamic>? _disp;
  String _servicioId = '';
  int? _desdeMs;
  String _error = '';
  bool _cargando = true;
  Set<String> _permisos = {};

  bool get _puedeDespachar => _permisos.contains('servicios:despachar');

  @override
  void initState() {
    super.initState();
    _cargar();
  }

  Future<void> _cargar() async {
    _permisos = await TokenStore.permisos();
    try {
      final t = await Offline.leer(_api, _rTablero);
      List<dynamic> s = _servicios;
      Map<String, dynamic>? d = _disp;
      bool cache = t.desdeCache;
      int ms = t.guardadoMs;
      if (_permisos.contains('servicios:despachar')) {
        try {
          final x = await Offline.leer(_api, '/flota/servicios-abiertos');
          s = x.datos as List;
          cache = cache || x.desdeCache;
        } catch (_) {}
      }
      try {
        final x = await Offline.leer(_api, '/flota/disponibilidad');
        d = Map<String, dynamic>.from(x.datos as Map);
      } catch (_) {}
      if (!mounted) return;
      setState(() {
        _moviles = t.datos as List;
        _servicios = s;
        _disp = d;
        if (!_servicios.any((e) => e['id'] == _servicioId))
          _servicioId = _servicios.isEmpty ? '' : '${_servicios.first['id']}';
        _desdeMs = cache ? ms : null;
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

  /// Ejecuta una escritura (se envia o queda en cola) y refleja el cambio de inmediato en pantalla.
  Future<void> _hacer(
      String metodo,
      String ruta,
      Map<String, dynamic> cuerpo,
      String descripcion,
      void Function(Map<String, dynamic> movil) optimista,
      Map<String, dynamic> movil) async {
    try {
      final d = await Offline.ejecutar(_api, metodo, ruta, cuerpo, descripcion);
      // actualizacion optimista de la copia local: el siguiente paso ya puede hacerse sin conexion
      optimista(movil);
      await Offline.guardarLocal(_rTablero, _moviles);
      if (!mounted) return;
      setState(() {});
      _aviso(
          context,
          d == Destino.enviado
              ? 'Hecho'
              : 'Sin conexión: queda guardado y se envía solo.');
      await _sync.currentState?.refrescar();
      if (d == Destino.enviado) await _cargar();
    } on ApiException catch (e) {
      if (mounted) _aviso(context, e.mensaje);
    }
  }

  Future<void> _despachar(Map<String, dynamic> m) async {
    final id =
        claveNueva(); // el id lo genera el celular: permite encadenar los pasos siguientes sin conexion
    final srv = _servicios
        .cast<Map>()
        .firstWhere((s) => s['id'] == _servicioId, orElse: () => {});
    await _hacer(
      'POST',
      '/flota/despachos',
      {'id': id, 'servicioId': _servicioId, 'vehiculoId': m['id']},
      'Despachar móvil ${m['numeroInterno']} al servicio ${srv['numeroServicio'] ?? ''}',
      (x) {
        x['estadoOperativo'] = 'DESPACHADO';
        x['despachoActivo'] = {
          'id': id,
          'servicioId': _servicioId,
          'estado': 'DESPACHADO',
          'numeroServicio': srv['numeroServicio'],
          'direccion': srv['direccion']
        };
      },
      m,
    );
  }

  Future<void> _avanzar(Map<String, dynamic> m, String paso) async {
    final d = Map<String, dynamic>.from(m['despachoActivo'] as Map);
    final cuerpo = <String, dynamic>{};
    if (paso == 'regreso') {
      final km = await _pedirTexto(
          'Kilometraje al volver', 'Kilometraje (puede dejarlo vacío)',
          numero: true);
      if (km == null) return;
      if (km.isNotEmpty) {
        final n = int.tryParse(km);
        if (n == null || n < 0)
          return _aviso(context, 'El kilometraje debe ser un número entero.');
        cuerpo['kmRegreso'] = n;
      }
    }
    const siguiente = {
      'llegada': ['EN_SERVICIO', 'EN_SERVICIO'],
      'fin': ['REGRESANDO', 'REGRESANDO'],
      'regreso': ['EN_CUARTEL', null]
    };
    await _hacer('PATCH', '/flota/despachos/${d['id']}/$paso', cuerpo,
        'Móvil ${m['numeroInterno']}: $paso', (x) {
      final s = siguiente[paso]!;
      x['estadoOperativo'] = s[0];
      if (s[1] == null) {
        x['despachoActivo'] = null;
      } else {
        x['despachoActivo'] = {...d, 'estado': s[1]};
      }
    }, m);
  }

  Future<void> _cancelar(Map<String, dynamic> m) async {
    final d = Map<String, dynamic>.from(m['despachoActivo'] as Map);
    final motivo =
        await _pedirTexto('Cancelar despacho', 'Motivo (obligatorio)');
    if (motivo == null || motivo.isEmpty) return;
    await _hacer(
        'PATCH',
        '/flota/despachos/${d['id']}/cancelar',
        {'motivo': motivo},
        'Cancelar despacho del móvil ${m['numeroInterno']}', (x) {
      x['estadoOperativo'] = 'EN_CUARTEL';
      x['despachoActivo'] = null;
    }, m);
  }

  Future<String?> _pedirTexto(String titulo, String etiqueta,
      {bool numero = false}) {
    final c = TextEditingController();
    return showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(titulo),
        content: TextField(
            controller: c,
            autofocus: true,
            keyboardType: numero ? TextInputType.number : TextInputType.text,
            decoration: InputDecoration(labelText: etiqueta)),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancelar')),
          FilledButton(
              onPressed: () => Navigator.pop(ctx, c.text.trim()),
              child: const Text('Aceptar')),
        ],
      ),
    );
  }

  static const _etq = {
    'EN_CUARTEL': 'En cuartel',
    'DESPACHADO': 'Despachado',
    'EN_SERVICIO': 'En servicio',
    'REGRESANDO': 'Regresando'
  };
  static const _paso = {
    'DESPACHADO': ['llegada', 'Llegó al lugar'],
    'EN_SERVICIO': ['fin', 'Sale del lugar'],
    'REGRESANDO': ['regreso', 'Llegó al cuartel']
  };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Flota y despacho'), actions: [
        IconButton(icon: const Icon(Icons.refresh), onPressed: _cargar)
      ]),
      body: Column(children: [
        EstadoSync(key: _sync, datosDesdeMs: _desdeMs, alCambiar: _cargar),
        Expanded(
          child: _cargando
              ? const Center(child: CircularProgressIndicator())
              : _error.isNotEmpty
                  ? Center(
                      child: Padding(
                          padding: const EdgeInsets.all(24),
                          child: Text(_error)))
                  : ListView(padding: const EdgeInsets.all(12), children: [
                      if (_disp != null) _tarjetaDisponibilidad(),
                      if (_puedeDespachar)
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          child: DropdownButtonFormField<String>(
                            initialValue:
                                _servicios.any((s) => s['id'] == _servicioId)
                                    ? _servicioId
                                    : null,
                            isExpanded: true,
                            decoration: const InputDecoration(
                                labelText: 'Servicio al que se envía el móvil'),
                            items: [
                              for (final s in _servicios)
                                DropdownMenuItem(
                                    value: '${s['id']}',
                                    child: Text(
                                        '${s['numeroServicio']} · ${s['direccion']}',
                                        overflow: TextOverflow.ellipsis))
                            ],
                            onChanged: (v) =>
                                setState(() => _servicioId = v ?? ''),
                          ),
                        ),
                      for (final raw in _moviles)
                        _tarjetaMovil(raw as Map<String, dynamic>),
                    ]),
        ),
      ]),
    );
  }

  Widget _tarjetaDisponibilidad() {
    final m = _disp!['moviles'] as Map? ?? {};
    final listos = (m['disponibles'] as List? ?? []).length;
    final total = m['total'] ?? 0;
    final pers =
        (_disp!['personalDeGuardia'] as Map?)?['personal'] as List? ?? [];
    return Card(
      color: const Color(0xFFE8F1FA),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('Resumen de disponibilidad',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
          const SizedBox(height: 12),
          Row(children: [
            Expanded(
              child: _DatoFlota(
                icono: Icons.local_shipping_outlined,
                valor: '$listos de $total',
                etiqueta: 'móviles listos',
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _DatoFlota(
                icono: Icons.people_outline,
                valor: '${pers.length}',
                etiqueta: 'personal de guardia',
              ),
            ),
          ]),
        ]),
      ),
    );
  }

  Widget _tarjetaMovil(Map<String, dynamic> m) {
    final estado = '${m['estadoOperativo']}';
    final activo = m['despachoActivo'] as Map?;
    final disponible = m['estado'] == 'OPERATIVO' && estado == 'EN_CUARTEL';
    final paso = activo == null ? null : _paso['${activo['estado']}'];
    final unidadOperativa = m['estado'] == 'OPERATIVO';
    final etiqueta = !unidadOperativa
        ? '${m['estado']}'.replaceAll('_', ' ')
        : disponible
            ? 'Disponible'
            : _etq[estado] ?? estado.replaceAll('_', ' ');
    final colorEstado = disponible
        ? const Color(0xFF34834B)
        : activo != null
            ? const Color(0xFF1767A8)
            : const Color(0xFF9C6500);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(15),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const CircleAvatar(
              backgroundColor: Color(0xFFE8F1FA),
              child: Icon(Icons.local_shipping, color: Color(0xFF1767A8)),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                      'Móvil ${m['numeroInterno']}${m['alias'] != null ? ' · ${m['alias']}' : ''}',
                      style: const TextStyle(
                          fontWeight: FontWeight.w800, fontSize: 16)),
                  const SizedBox(height: 7),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: colorEstado.withValues(alpha: 0.11),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(etiqueta,
                        style: TextStyle(
                            color: colorEstado,
                            fontSize: 12,
                            fontWeight: FontWeight.w700)),
                  ),
                ],
              ),
            ),
          ]),
          if (activo != null) ...[
            const SizedBox(height: 13),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFF2F6FA),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Servicio ${activo['numeroServicio'] ?? ''}',
                      style: const TextStyle(fontWeight: FontWeight.w700)),
                  if ('${activo['direccion'] ?? ''}'.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(top: 3),
                      child: Text('${activo['direccion']}'),
                    ),
                ],
              ),
            ),
          ],
          if (_puedeDespachar) ...[
            const SizedBox(height: 12),
            Wrap(spacing: 8, runSpacing: 4, children: [
              if (disponible)
                FilledButton.icon(
                  onPressed: _servicioId.isEmpty ? null : () => _despachar(m),
                  icon: const Icon(Icons.near_me),
                  label: const Text('Despachar'),
                ),
              if (paso != null)
                FilledButton.icon(
                  onPressed: () => _avanzar(m, paso[0]),
                  icon: const Icon(Icons.arrow_forward),
                  label: Text(paso[1]),
                ),
              if (activo != null)
                OutlinedButton.icon(
                  onPressed: () => _cancelar(m),
                  icon: const Icon(Icons.cancel_outlined),
                  label: const Text('Cancelar despacho'),
                ),
            ]),
          ],
          if (m['alerta'] == 'FUERA_DEL_CUARTEL_SIN_DESPACHO') ...[
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(11),
              decoration: BoxDecoration(
                color: const Color(0xFFFFF0E2),
                borderRadius: BorderRadius.circular(13),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.warning_amber, color: Color(0xFFB45B00)),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                        'El GPS ubica al móvil a ${m['distanciaCuartelM']} m del cuartel sin un despacho activo. Revisa el estado.'),
                  ),
                ],
              ),
            ),
          ],
          if (activo != null) ...[
            const Divider(height: 20),
            Wrap(spacing: 2, runSpacing: 2, children: [
              if (_permisos.contains('adjuntos:subir'))
                TextButton.icon(
                    icon: const Icon(Icons.photo_camera),
                    label: const Text('Agregar foto'),
                    onPressed: () => adjuntarFoto(context, 'DESPACHO',
                        '${activo['id']}', 'Móvil ${m['numeroInterno']}')),
              if (_permisos.contains('adjuntos:ver'))
                TextButton.icon(
                    icon: const Icon(Icons.photo_library),
                    label: const Text('Ver fotos'),
                    onPressed: () => Navigator.push(
                        context,
                        MaterialPageRoute<void>(
                            builder: (_) => PantallaAdjuntos(
                                entidad: 'DESPACHO',
                                entidadId: '${activo['id']}',
                                titulo:
                                    'Fotos del móvil ${m['numeroInterno']}')))),
              if (_permisos.contains('servicios:editar'))
                TextButton.icon(
                    icon: const Icon(Icons.personal_injury),
                    label: const Text('Afectados'),
                    onPressed: () =>
                        registrarVictimas(context, '${activo['servicioId']}')),
              if ('${activo['direccion'] ?? ''}'.isNotEmpty)
                TextButton.icon(
                    icon: const Icon(Icons.directions),
                    label: const Text('Abrir ruta'),
                    onPressed: () =>
                        abrirRuta(context, '${activo['direccion']}')),
            ]),
          ],
        ]),
      ),
    );
  }
}

class _DatoFlota extends StatelessWidget {
  final IconData icono;
  final String valor;
  final String etiqueta;
  const _DatoFlota(
      {required this.icono, required this.valor, required this.etiqueta});

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(15),
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Icon(icono, color: const Color(0xFF1767A8), size: 20),
          const SizedBox(height: 7),
          Text(valor,
              style:
                  const TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
          Text(etiqueta, style: const TextStyle(fontSize: 11), maxLines: 2),
        ]),
      );
}

// ======================= llamados =======================

class PantallaLlamados extends StatefulWidget {
  const PantallaLlamados({super.key});
  @override
  State<PantallaLlamados> createState() => _LlamadosState();
}

class _LlamadosState extends State<PantallaLlamados> {
  static const _ruta = '/llamados';
  final _api = SigboApi();
  final _sync = GlobalKey<EstadoSyncState>();
  List<dynamic> _lista = [];
  List<Operacion> _pend = [];
  int? _desdeMs;
  String _error = '';
  bool _cargando = true;
  Set<String> _permisos = {};
  String _medio = 'Radio';
  final _dir = TextEditingController();
  final _desc = TextEditingController();
  final _llamante = TextEditingController();
  final _tel = TextEditingController();

  @override
  void initState() {
    super.initState();
    _cargar();
  }

  Future<void> _cargar() async {
    _permisos = await TokenStore.permisos();
    _pend = (await Offline.cola()).where((o) => o.ruta == _ruta).toList();
    try {
      final r = await Offline.leer(_api, _ruta);
      if (!mounted) return;
      setState(() {
        _lista = r.datos as List;
        _desdeMs = r.desdeCache ? r.guardadoMs : null;
        _error = '';
        _cargando = false;
      });
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = _pend.isEmpty ? e.toString() : '';
          _cargando = false;
        });
      }
    }
  }

  Future<void> _registrar() async {
    if (_dir.text.trim().length < 3)
      return _aviso(context, 'Indica la dirección.');
    final cuerpo = <String, dynamic>{
      'claveIdempotencia': claveNueva(),
      'medio': _medio,
      'direccion': _dir.text.trim(),
      if (_desc.text.trim().isNotEmpty) 'descripcion': _desc.text.trim(),
      if (_llamante.text.trim().isNotEmpty)
        'llamanteNombre': _llamante.text.trim(),
      if (_tel.text.trim().isNotEmpty) 'llamanteTelefono': _tel.text.trim(),
    };
    try {
      final d = await Offline.ejecutar(
          _api, 'POST', _ruta, cuerpo, 'Llamado en ${_dir.text.trim()}');
      _dir.clear();
      _desc.clear();
      _llamante.clear();
      _tel.clear();
      if (!mounted) return;
      _aviso(
          context,
          d == Destino.enviado
              ? 'Llamado registrado'
              : 'Sin conexión: queda guardado y se envía solo.');
      await _cargar();
      await _sync.currentState?.refrescar();
    } on ApiException catch (e) {
      if (mounted) _aviso(context, e.mensaje);
    }
  }

  Future<void> _cambiar(Map l, String estado) async {
    String? motivo;
    if (estado == 'CERRADO' && l['estado'] == 'RECIBIDO') {
      final c = TextEditingController();
      motivo = await showDialog<String>(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('Cerrar sin atender'),
          content: TextField(
              controller: c,
              autofocus: true,
              decoration:
                  const InputDecoration(labelText: 'Motivo (obligatorio)')),
          actions: [
            TextButton(
                onPressed: () => Navigator.pop(ctx),
                child: const Text('Cancelar')),
            FilledButton(
                onPressed: () => Navigator.pop(ctx, c.text.trim()),
                child: const Text('Cerrar llamado')),
          ],
        ),
      );
      if (motivo == null || motivo.isEmpty) return;
    }
    try {
      final d = await Offline.ejecutar(
          _api,
          'PATCH',
          '/llamados/${l['id']}/estado',
          {'estado': estado, if (motivo != null) 'motivo': motivo},
          'Llamado ${l['direccion']}: $estado');
      if (!mounted) return;
      _aviso(
          context,
          d == Destino.enviado
              ? 'Hecho'
              : 'Sin conexión: queda guardado y se envía solo.');
      l['estado'] =
          estado; // reflejo inmediato; la proxima lectura trae lo real
      await Offline.guardarLocal(_ruta, _lista);
      await _cargar();
      await _sync.currentState?.refrescar();
    } on ApiException catch (e) {
      if (mounted) _aviso(context, e.mensaje);
    }
  }

  @override
  Widget build(BuildContext context) {
    final puedeCrear = _permisos.contains('servicios:crear');
    final puedeEditar = _permisos.contains('servicios:editar');
    final abiertos =
        _lista.cast<Map>().where((x) => x['estado'] != 'CERRADO').toList();
    return Scaffold(
      appBar: AppBar(title: const Text('Llamados'), actions: [
        IconButton(
            tooltip: 'Actualizar llamados',
            icon: const Icon(Icons.refresh),
            onPressed: _cargar)
      ]),
      body: Column(children: [
        EstadoSync(key: _sync, datosDesdeMs: _desdeMs, alCambiar: _cargar),
        Expanded(
          child: _cargando
              ? const Center(child: CircularProgressIndicator())
              : ListView(
                  padding: const EdgeInsets.fromLTRB(14, 8, 14, 24),
                  children: [
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: const Color(0xFFE8F1FA),
                          borderRadius: BorderRadius.circular(18),
                        ),
                        child: const Row(children: [
                          CircleAvatar(
                            backgroundColor: Colors.white,
                            child: Icon(Icons.call, color: Color(0xFF1767A8)),
                          ),
                          SizedBox(width: 11),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Registro de llamados',
                                    style:
                                        TextStyle(fontWeight: FontWeight.w800)),
                                SizedBox(height: 3),
                                Text(
                                    'Anota la ubicación y la información recibida.',
                                    style: TextStyle(fontSize: 12)),
                              ],
                            ),
                          ),
                        ]),
                      ),
                      const SizedBox(height: 10),
                      if (puedeCrear)
                        Card(
                          child: Padding(
                            padding: const EdgeInsets.all(12),
                            child: Column(children: [
                              const Align(
                                alignment: Alignment.centerLeft,
                                child: Padding(
                                  padding: EdgeInsets.only(bottom: 10),
                                  child: Text('Nuevo llamado',
                                      style: TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.w800)),
                                ),
                              ),
                              DropdownButtonFormField<String>(
                                initialValue: _medio,
                                decoration:
                                    const InputDecoration(labelText: 'Medio'),
                                items: [
                                  for (final m in const [
                                    'Radio',
                                    'Teléfono',
                                    'Presencial',
                                    '911 / Emergencias'
                                  ])
                                    DropdownMenuItem(value: m, child: Text(m))
                                ],
                                onChanged: (v) =>
                                    setState(() => _medio = v ?? 'Radio'),
                              ),
                              TextField(
                                  controller: _dir,
                                  decoration: const InputDecoration(
                                      labelText: 'Dirección')),
                              TextField(
                                  controller: _desc,
                                  decoration: const InputDecoration(
                                      labelText: 'Qué se informa'),
                                  maxLines: 2),
                              TextField(
                                  controller: _llamante,
                                  decoration: const InputDecoration(
                                      labelText: 'Quién llama')),
                              TextField(
                                  controller: _tel,
                                  decoration: const InputDecoration(
                                      labelText: 'Teléfono'),
                                  keyboardType: TextInputType.phone),
                              const SizedBox(height: 8),
                              SizedBox(
                                  width: double.infinity,
                                  child: FilledButton(
                                      onPressed: _registrar,
                                      child: const Text('Registrar llamado'))),
                            ]),
                          ),
                        ),
                      if (_error.isNotEmpty)
                        Padding(
                            padding: const EdgeInsets.all(12),
                            child: Text(_error)),
                      Padding(
                        padding: const EdgeInsets.fromLTRB(4, 12, 4, 4),
                        child: Text('Llamados abiertos (${abiertos.length})',
                            style: const TextStyle(
                                fontSize: 16, fontWeight: FontWeight.w800)),
                      ),
                      for (final o in _pend)
                        Card(
                          color: Colors.amber[50],
                          child: ListTile(
                            leading: const Icon(Icons.schedule),
                            title: Text(
                                '${o.cuerpo['direccion'] ?? o.descripcion}'),
                            subtitle: const Text('Pendiente de envío'),
                          ),
                        ),
                      for (final l in abiertos)
                        Card(
                          child: ListTile(
                            title: Text('${l['direccion']}'),
                            subtitle: Text(
                                '${_local(l['recibidoEn'])} · ${l['medio']}${l['descripcion'] != null ? '\n${l['descripcion']}' : ''}\nEstado: ${l['estado']}'
                                    .replaceAll('_', ' ')),
                            isThreeLine: true,
                            trailing: puedeEditar
                                ? PopupMenuButton<String>(
                                    onSelected: (v) => _cambiar(l, v),
                                    itemBuilder: (_) => [
                                      if (l['estado'] == 'RECIBIDO')
                                        const PopupMenuItem(
                                            value: 'EN_ATENCION',
                                            child: Text('Atender')),
                                      const PopupMenuItem(
                                          value: 'CERRADO',
                                          child: Text('Cerrar')),
                                    ],
                                  )
                                : null,
                          ),
                        ),
                      if (abiertos.isEmpty && _pend.isEmpty && _error.isEmpty)
                        const Card(
                          child: Padding(
                            padding: EdgeInsets.all(18),
                            child: Row(children: [
                              Icon(Icons.check_circle_outline,
                                  color: Color(0xFF438A55)),
                              SizedBox(width: 10),
                              Expanded(
                                  child: Text('No hay llamados abiertos.')),
                            ]),
                          ),
                        ),
                    ]),
        ),
      ]),
    );
  }
}

// ======================= fichaje por QR =======================

class PantallaFichar extends StatefulWidget {
  const PantallaFichar({super.key});
  @override
  State<PantallaFichar> createState() => _FicharState();
}

class _FicharState extends State<PantallaFichar> {
  final _api = SigboApi();
  final _clave = GlobalKey(debugLabel: 'qr');
  String _resultado = 'Apunta la cámara al QR de la puerta del cuartel.';
  bool _ocupado = false;
  bool _camara = false;
  final _manual = TextEditingController();

  @override
  void initState() {
    super.initState();
    Permission.camera.request().then((s) {
      if (mounted) setState(() => _camara = s.isGranted);
    });
  }

  Future<void> _fichar(String leido) async {
    if (_ocupado) return;
    final token = tokenDeQr(leido);
    if (token == null) {
      setState(
          () => _resultado = 'Ese código no es un QR de fichaje de SIGBO.');
      return;
    }
    _ocupado = true;
    try {
      final res = await _api
          .llamar('POST', '/fichaje/escanear', body: {'token': token});
      switch (clasificarRespuesta(res.statusCode)) {
        case Resolucion.hecho:
          final j = _json(res.body);
          setState(() => _resultado =
              '${j['duplicado'] == true ? 'Ya estaba registrado: ' : 'Registrado: '}${j['tipo']}\n${j['punto']} · ${_local(j['registradoEn'])}');
          break;
        case Resolucion.rechazada:
          setState(() => _resultado = _api.mensajeDe(
              res, 'El código no es válido o fue dado de baja.'));
          break;
        case Resolucion.reintentar:
          await _guardar(token);
      }
    } catch (e) {
      if (!esFalloDeRed(e)) {
        setState(() => _resultado = e.toString());
      } else {
        await _guardar(token);
      }
    }
    // evita registrar dos veces seguidas por una lectura repetida de la camara
    await Future<void>.delayed(const Duration(seconds: 3));
    _ocupado = false;
  }

  Future<void> _guardar(String token) async {
    await Offline.encolar(
        'POST', '/fichaje/escanear', {'token': token}, 'Fichaje por QR');
    if (mounted)
      setState(() => _resultado =
          'Sin conexión: el fichaje quedó guardado con la hora de ahora y se registra al volver la red.');
  }

  Map<String, dynamic> _json(String s) {
    try {
      return Map<String, dynamic>.from(conv.jsonDecode(s) as Map);
    } catch (_) {
      return {};
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Fichar')),
      body: Column(children: [
        const EstadoSync(),
        Container(
          width: double.infinity,
          margin: const EdgeInsets.fromLTRB(14, 8, 14, 8),
          padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 12),
          decoration: BoxDecoration(
            color: const Color(0xFFE8F1FA),
            borderRadius: BorderRadius.circular(16),
          ),
          child: const Row(children: [
            Icon(Icons.qr_code_scanner, color: Color(0xFF1767A8)),
            SizedBox(width: 10),
            Expanded(
              child: Text('Escanea el QR de la entrada para fichar.',
                  style: TextStyle(fontWeight: FontWeight.w600)),
            ),
          ]),
        ),
        if (_camara)
          Expanded(
            flex: 3,
            child: QRView(
              key: _clave,
              onQRViewCreated: (c) {
                c.scannedDataStream.listen((d) {
                  final t = d.code;
                  if (t != null) _fichar(t);
                });
              },
              overlay: QrScannerOverlayShape(
                  borderColor: Colors.red,
                  borderRadius: 8,
                  borderLength: 28,
                  borderWidth: 8,
                  cutOutSize: 240),
            ),
          )
        else
          const Expanded(
              flex: 3,
              child: Center(
                  child: Padding(
                      padding: EdgeInsets.all(24),
                      child: Text(
                          'Falta el permiso de la cámara. Activalo en Ajustes del celular, o pega el código abajo.',
                          textAlign: TextAlign.center)))),
        Expanded(
          flex: 2,
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(children: [
              if (_resultado.isNotEmpty)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: _resultado.startsWith('Sin conexión')
                        ? const Color(0xFFFFF4DC)
                        : const Color(0xFFEAF5ED),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Text(_resultado, textAlign: TextAlign.center),
                ),
              const Spacer(),
              Row(children: [
                Expanded(
                    child: TextField(
                        controller: _manual,
                        decoration: const InputDecoration(
                            labelText: 'Ingresar código manualmente',
                            prefixIcon: Icon(Icons.link)))),
                const SizedBox(width: 8),
                FilledButton(
                    onPressed: () => _fichar(_manual.text),
                    child: const Text('Fichar')),
              ]),
            ]),
          ),
        ),
      ]),
    );
  }
}

// ======================= hidrantes y puntos de riesgo =======================

class PantallaCartografia extends StatefulWidget {
  const PantallaCartografia({super.key});
  @override
  State<PantallaCartografia> createState() => _CartoState();
}

class _CartoState extends State<PantallaCartografia> {
  final _api = SigboApi();
  List<dynamic> _hidrantes = [];
  List<dynamic> _puntos = [];
  Position? _pos;
  int? _desdeMs;
  String _error = '';
  bool _cargando = true;
  Set<String> _permisos = {};

  @override
  void initState() {
    super.initState();
    _cargar();
  }

  Future<void> _cargar() async {
    _permisos = await TokenStore.permisos();
    try {
      final h = await Offline.leer(_api, '/cartografia/hidrantes');
      final p = await Offline.leer(_api, '/cartografia/puntos-riesgo');
      // los pre-planes se guardan de antemano: hay que poder leerlos sin conexion en plena emergencia
      for (final pt in (p.datos as List).take(60)) {
        try {
          await Offline.leer(
              _api, '/cartografia/puntos-riesgo/${pt['id']}/preplan');
        } catch (_) {}
      }
      Position? pos;
      try {
        var perm = await Geolocator.checkPermission();
        if (perm == LocationPermission.denied)
          perm = await Geolocator.requestPermission();
        if (perm != LocationPermission.denied &&
            perm != LocationPermission.deniedForever) {
          pos = await Geolocator.getLastKnownPosition() ??
              await Geolocator.getCurrentPosition(
                  desiredAccuracy: LocationAccuracy.low);
        }
      } catch (_) {}
      if (!mounted) return;
      setState(() {
        _hidrantes = h.datos as List;
        _puntos = p.datos as List;
        _pos = pos;
        _desdeMs = (h.desdeCache || p.desdeCache) ? h.guardadoMs : null;
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

  Future<void> _verPreplan(Map punto) async {
    String texto;
    try {
      final r = await Offline.leer(
          _api, '/cartografia/puntos-riesgo/${punto['id']}/preplan');
      final plan = r.datos;
      texto = plan is Map
          ? '${plan['titulo']} (v${plan['version']})\n\n${plan['contenido']}'
          : 'Este punto todavía no tiene pre-plan.';
    } catch (e) {
      texto = e.toString();
    }
    if (!mounted) return;
    await showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('${punto['nombre']}'),
        content: SingleChildScrollView(
          child:
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('${punto['direccion']}'),
            if (punto['contactoNombre'] != null ||
                punto['contactoTelefono'] != null)
              Text('Contacto: ${[
                punto['contactoNombre'],
                punto['contactoTelefono']
              ].whereType<String>().join(' · ')}'),
            const Divider(),
            Text(texto),
          ]),
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx), child: const Text('Cerrar'))
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final pos = _pos;
    final hid = pos == null
        ? _hidrantes
            .map((e) => MapEntry(Map<String, dynamic>.from(e as Map), -1.0))
            .toList()
        : ordenarPorCercania(_hidrantes, pos.latitude, pos.longitude);
    final pun = pos == null
        ? _puntos
            .map((e) => MapEntry(Map<String, dynamic>.from(e as Map), -1.0))
            .toList()
        : ordenarPorCercania(_puntos, pos.latitude, pos.longitude);
    String dist(double d) => d < 0 ? '' : ' · ${formatoDistancia(d)}';
    return Scaffold(
      appBar: AppBar(title: const Text('Hidrantes y riesgos'), actions: [
        IconButton(
            icon: const Icon(Icons.add_location_alt),
            tooltip: 'Registrar hidrante aquí',
            onPressed: () async {
              await registrarHidranteAqui(context);
              await _cargar();
            }),
        IconButton(icon: const Icon(Icons.refresh), onPressed: _cargar),
      ]),
      body: Column(children: [
        EstadoSync(datosDesdeMs: _desdeMs),
        Expanded(
          child: _cargando
              ? const Center(child: CircularProgressIndicator())
              : _error.isNotEmpty
                  ? Center(
                      child: Padding(
                          padding: const EdgeInsets.all(24),
                          child: Text(_error)))
                  : ListView(padding: const EdgeInsets.all(12), children: [
                      if (pos == null)
                        const Text(
                            'Sin ubicación: se muestran sin ordenar por cercanía.',
                            style: TextStyle(fontSize: 12)),
                      Padding(
                          padding: const EdgeInsets.only(top: 8, bottom: 4),
                          child: Text('Puntos de riesgo (${pun.length})',
                              style: const TextStyle(
                                  fontWeight: FontWeight.bold))),
                      for (final e in pun.take(30))
                        Card(
                          child: ListTile(
                            leading: Icon(Icons.warning_amber,
                                color: e.key['nivelRiesgo'] == 'CRITICO'
                                    ? Colors.red
                                    : (e.key['nivelRiesgo'] == 'ALTO'
                                        ? Colors.orange
                                        : Colors.grey)),
                            title: Text('${e.key['nombre']}'),
                            subtitle: Text(
                                '${e.key['direccion']}\nRiesgo ${'${e.key['nivelRiesgo']}'.toLowerCase()}${dist(e.value)}'),
                            isThreeLine: true,
                            onTap: () => _verPreplan(e.key),
                            trailing: _permisos.contains('adjuntos:subir')
                                ? IconButton(
                                    icon: const Icon(Icons.photo_camera),
                                    tooltip: 'Sacar foto',
                                    onPressed: () => adjuntarFoto(
                                        context,
                                        'PUNTO_RIESGO',
                                        '${e.key['id']}',
                                        '${e.key['nombre']}'))
                                : null,
                          ),
                        ),
                      Padding(
                          padding: const EdgeInsets.only(top: 12, bottom: 4),
                          child: Text('Hidrantes (${hid.length})',
                              style: const TextStyle(
                                  fontWeight: FontWeight.bold))),
                      for (final e in hid.take(30))
                        Card(
                          child: ListTile(
                            leading: Icon(Icons.water_drop,
                                color: e.key['estado'] == 'OPERATIVO'
                                    ? Colors.green
                                    : (e.key['estado'] == 'FUERA_SERVICIO'
                                        ? Colors.red
                                        : Colors.grey)),
                            title: Text(
                                '${e.key['codigo']} · ${'${e.key['estado']}'.replaceAll('_', ' ')}'),
                            subtitle: Text(
                                '${e.key['direccion']}${e.key['caudalLpm'] != null ? ' · ${e.key['caudalLpm']} l/min' : ''}${dist(e.value)}'),
                            trailing: _permisos.contains('adjuntos:subir')
                                ? IconButton(
                                    icon: const Icon(Icons.photo_camera),
                                    tooltip: 'Sacar foto',
                                    onPressed: () => adjuntarFoto(
                                        context,
                                        'HIDRANTE',
                                        '${e.key['id']}',
                                        'Hidrante ${e.key['codigo']}'))
                                : null,
                          ),
                        ),
                    ]),
        ),
      ]),
    );
  }
}
