import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';

import 'api.dart';
import 'store.dart';
import 'servicio_activo.dart';

const _azul = Color(0xFF1767A8);
const _verde = Color(0xFF26834A);
const _naranja = Color(0xFFE48717);

/// Vista operativa para responder y, cuando el permiso lo permite, emitir solicitudes.
/// La conectividad y la disponibilidad se presentan como estados independientes.
class PantallaDespachoMovil extends StatefulWidget {
  const PantallaDespachoMovil({super.key});

  @override
  State<PantallaDespachoMovil> createState() => _PantallaDespachoMovilState();
}

class _PantallaDespachoMovilState extends State<PantallaDespachoMovil> {
  final _api = SigboApi();
  Timer? _actualizador;
  Map<String, dynamic> _disponibilidad = {};
  List<Map<String, dynamic>> _solicitudes = [];
  List<Map<String, dynamic>> _moviles = [];
  List<Map<String, dynamic>> _servicios = [];
  Set<String> _permisos = {};
  bool _online = false;
  bool _cargando = true;
  bool _ocupado = false;
  String? _error;
  final Set<String> _recibosEnviados = {};

  bool get _puedeSolicitar => _permisos.contains('despacho:solicitar');
  @override
  void initState() {
    super.initState();
    _cargar();
    _actualizador = Timer.periodic(
        const Duration(seconds: 12), (_) => _cargar(silencioso: true));
  }

  @override
  void dispose() {
    _actualizador?.cancel();
    super.dispose();
  }

  Future<dynamic> _llamar(String metodo, String ruta,
      {Map<String, dynamic>? body}) async {
    final res = await _api.llamar(metodo, ruta, body: body);
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw ApiException(_api.mensajeDe(res, 'No se pudo completar la acción'),
          codigo: res.statusCode);
    }
    return res.body.isEmpty ? null : jsonDecode(res.body);
  }

  Future<void> _cargar({bool silencioso = false}) async {
    if (_ocupado || !mounted) return;
    try {
      final permisos = await TokenStore.permisos();
      if (!permisos.contains('despacho:responder')) {
        setState(() {
          _permisos = permisos.toSet();
          _online = false;
          _cargando = false;
          _error = 'Tu usuario no tiene acceso al despacho operativo.';
        });
        return;
      }
      final disp = Map<String, dynamic>.from(
          await _llamar('GET', '/despacho/disponibilidad/mia') as Map);
      final solicitudes = List<Map<String, dynamic>>.from(
        (await _llamar('GET', '/despacho/solicitudes/mias') as List)
            .map((x) => Map<String, dynamic>.from(x as Map)),
      );
      List<Map<String, dynamic>> moviles = _moviles;
      List<Map<String, dynamic>> servicios = _servicios;
      if (permisos.contains('despacho:servicio')) {
        try {
          servicios = List<Map<String, dynamic>>.from(
            (await _llamar('GET', '/despacho/servicios-activos') as List)
                .map((x) => Map<String, dynamic>.from(x as Map)),
          );
        } catch (_) {}
      }
      if (permisos.contains('servicios:ver')) {
        try {
          final tablero = Map<String, dynamic>.from(
              await _llamar('GET', '/flota/disponibilidad') as Map);
          final m =
              Map<String, dynamic>.from(tablero['moviles'] as Map? ?? const {});
          moviles = List<Map<String, dynamic>>.from(
              (m['disponibles'] as List? ?? const [])
                  .map((x) => Map<String, dynamic>.from(x as Map)));
        } catch (_) {
          // No impide responder a solicitudes ya recibidas.
        }
      }
      if (!mounted) return;
      setState(() {
        _permisos = permisos.toSet();
        _disponibilidad = disp;
        _solicitudes = solicitudes;
        _moviles = moviles;
        _servicios = servicios;
        _online = true;
        _cargando = false;
        _error = null;
      });
      // La solicitud solo queda como RECIBIDA cuando la app la obtuvo y mostró.
      for (final s in solicitudes) {
        final id = '${s['solicitudId']}';
        if (((s['entrega'] == 'ENVIADA' && s['recibidaEn'] == null) ||
                (s['entrega'] == 'SIN_CONEXION' &&
                    s['vistoTardeEn'] == null)) &&
            _recibosEnviados.add(id)) {
          unawaited(_llamar('POST', '/despacho/solicitudes/$id/recibida')
              .catchError((_) => null));
        }
      }
      unawaited(_llamar('POST', '/despacho/presencia').catchError((_) => null));
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _online = false;
        _cargando = false;
        _error = e.toString();
      });
    }
  }

  Future<void> _cambiarDisponibilidad(String estado) async {
    try {
      await _llamar('PUT', '/despacho/disponibilidad/mia',
          body: {'estado': estado});
      await _cargar(silencioso: true);
    } catch (e) {
      _aviso(e.toString());
    }
  }

  Future<void> _editarHorario() async {
    final dias = <int, String>{
      1: 'Lunes',
      2: 'Martes',
      3: 'Miércoles',
      4: 'Jueves',
      5: 'Viernes',
      6: 'Sábado',
      7: 'Domingo'
    };
    final franjas = List<Map<String, dynamic>>.from(
        (_disponibilidad['horarios'] as List? ?? const [])
            .map((x) => Map<String, dynamic>.from(x as Map)));
    final seleccion =
        franjas.map((x) => (x['diaSemana'] as num).toInt()).toSet();
    TimeOfDay inicio = const TimeOfDay(hour: 18, minute: 0);
    TimeOfDay fin = const TimeOfDay(hour: 23, minute: 0);
    if (franjas.isNotEmpty) {
      final a = '${franjas.first['horaDesde']}'.split(':');
      final b = '${franjas.first['horaHasta']}'.split(':');
      inicio = TimeOfDay(
          hour: int.tryParse(a[0]) ?? 18,
          minute: int.tryParse(a.length > 1 ? a[1] : '0') ?? 0);
      fin = TimeOfDay(
          hour: int.tryParse(b[0]) ?? 23,
          minute: int.tryParse(b.length > 1 ? b[1] : '0') ?? 0);
    }
    final guardar = await showDialog<bool>(
      context: context,
      builder: (ctx) => StatefulBuilder(
          builder: (ctx, refrescar) => AlertDialog(
                title: const Text('Horario habitual'),
                content: SingleChildScrollView(
                    child: Column(mainAxisSize: MainAxisSize.min, children: [
                  for (final e in dias.entries)
                    CheckboxListTile(
                        dense: true,
                        contentPadding: EdgeInsets.zero,
                        title: Text(e.value),
                        value: seleccion.contains(e.key),
                        onChanged: (v) => refrescar(() {
                              if (v == true) {
                                seleccion.add(e.key);
                              } else {
                                seleccion.remove(e.key);
                              }
                            })),
                  const Divider(),
                  Row(children: [
                    Expanded(
                        child: TextButton.icon(
                            onPressed: () async {
                              final x = await showTimePicker(
                                  context: ctx, initialTime: inicio);
                              if (x != null) refrescar(() => inicio = x);
                            },
                            icon: const Icon(Icons.login),
                            label: Text('Desde ${inicio.format(ctx)}'))),
                    Expanded(
                        child: TextButton.icon(
                            onPressed: () async {
                              final x = await showTimePicker(
                                  context: ctx, initialTime: fin);
                              if (x != null) refrescar(() => fin = x);
                            },
                            icon: const Icon(Icons.logout),
                            label: Text('Hasta ${fin.format(ctx)}'))),
                  ]),
                  const Text(
                      'El mismo rango horario se aplicará a los días seleccionados.',
                      style: TextStyle(fontSize: 12)),
                ])),
                actions: [
                  TextButton(
                      onPressed: () => Navigator.pop(ctx, false),
                      child: const Text('Cancelar')),
                  FilledButton(
                      onPressed: seleccion.isEmpty
                          ? null
                          : () => Navigator.pop(ctx, true),
                      child: const Text('Guardar'))
                ],
              )),
    );
    if (guardar != true) return;
    String hhmm(TimeOfDay t) =>
        '${t.hour.toString().padLeft(2, '0')}:${t.minute.toString().padLeft(2, '0')}';
    await _ejecutar(
        () => _llamar('PUT', '/despacho/disponibilidad/horarios', body: {
              'usaHorario': true,
              'franjas': seleccion
                  .map((dia) => {
                        'diaSemana': dia,
                        'horaDesde': hhmm(inicio),
                        'horaHasta': hhmm(fin)
                      })
                  .toList(),
            }));
  }

  Future<void> _agregarExcepcion() async {
    final hoy = DateTime.now();
    final fecha = await showDatePicker(
        context: context,
        initialDate: hoy,
        firstDate: DateTime(hoy.year - 1),
        lastDate: DateTime(hoy.year + 2),
        helpText: 'Elegir día de excepción');
    if (fecha == null) return;
    final disponible = await showDialog<bool>(
        context: context,
        builder: (ctx) => AlertDialog(
              title: const Text('Excepción de disponibilidad'),
              content: Text(
                  '¿Estarás al llamado el ${fecha.day}/${fecha.month}/${fecha.year}?'),
              actions: [
                TextButton(
                    onPressed: () => Navigator.pop(ctx, false),
                    child: const Text('No estaré')),
                FilledButton(
                    onPressed: () => Navigator.pop(ctx, true),
                    child: const Text('Sí, estaré'))
              ],
            ));
    if (disponible == null) return;
    String ymd(DateTime d) =>
        '${d.year.toString().padLeft(4, '0')}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
    await _ejecutar(
        () => _llamar('POST', '/despacho/disponibilidad/excepciones', body: {
              'fechaDesde': ymd(fecha),
              'fechaHasta': ymd(fecha),
              'disponible': disponible,
            }));
  }

  Future<void> _quitarExcepcion(String id) async {
    await _ejecutar(
        () => _llamar('DELETE', '/despacho/disponibilidad/excepciones/$id'));
  }

  Future<void> _responder(Map<String, dynamic> s, String accion) async {
    String? motivo;
    if (accion == 'NO_PUEDO' || accion == 'CANCELAR') {
      motivo = await showDialog<String>(
        context: context,
        builder: (ctx) => SimpleDialog(
          title: Text(accion == 'NO_PUEDO'
              ? '¿Por qué no puedes asistir?'
              : 'Cancelar asistencia'),
          children: [
            for (final m in const [
              'Estoy trabajando',
              'Fuera de la zona',
              'Estoy ocupado',
              'Problema personal',
              'Sin transporte',
              'Cambio de planes',
              'Otro'
            ])
              SimpleDialogOption(
                  onPressed: () => Navigator.pop(ctx, m), child: Text(m)),
            SimpleDialogOption(
                onPressed: () => Navigator.pop(ctx),
                child: const Text('Volver')),
          ],
        ),
      );
      if (motivo == null) return;
    }
    await _ejecutar(() => _llamar(
            'POST', '/despacho/solicitudes/${s['solicitudId']}/responder',
            body: {
              'accion': accion,
              if (motivo != null) 'motivo': motivo,
            }));
  }

  Future<void> _nuevaSolicitud(String tipo) async {
    List<String> seleccionados = [];
    if (tipo == 'CHOFER') {
      if (_moviles.isEmpty) {
        _aviso('No hay móviles disponibles para seleccionar.');
        return;
      }
      final elegidos = await showDialog<List<String>>(
        context: context,
        builder: (ctx) {
          final seleccion = <String>{};
          return StatefulBuilder(
              builder: (ctx, refrescar) => AlertDialog(
                    title: const Text('¿Para qué móvil necesitas chofer?'),
                    content: SizedBox(
                      width: double.maxFinite,
                      child: ListView(shrinkWrap: true, children: [
                        for (final m in _moviles)
                          CheckboxListTile(
                            value: seleccion.contains('${m['id']}'),
                            title: Text('Móvil ${m['numeroInterno'] ?? ''}'),
                            subtitle: Text('${m['alias'] ?? m['tipo'] ?? ''}'),
                            onChanged: (v) => refrescar(() {
                              if (v == true) {
                                seleccion.add('${m['id']}');
                              } else {
                                seleccion.remove('${m['id']}');
                              }
                            }),
                          ),
                      ]),
                    ),
                    actions: [
                      TextButton(
                          onPressed: () => Navigator.pop(ctx),
                          child: const Text('Cancelar')),
                      FilledButton(
                          onPressed: seleccion.isEmpty
                              ? null
                              : () => Navigator.pop(ctx, seleccion.toList()),
                          child: const Text('Enviar solicitud')),
                    ],
                  ));
        },
      );
      if (elegidos == null || elegidos.isEmpty) return;
      seleccionados = elegidos;
    }
    await _ejecutar(() => _llamar('POST', '/despacho/solicitudes', body: {
          'tipo': tipo,
          if (seleccionados.isNotEmpty) 'moviles': seleccionados,
          'claveIdempotencia': DateTime.now().microsecondsSinceEpoch.toString(),
        }));
  }

  Future<void> _ampliar(String id) async {
    await _ejecutar(() => _llamar('POST', '/despacho/solicitudes/$id/ampliar'));
  }

  Future<void> _ejecutar(Future<dynamic> Function() accion) async {
    if (!_online || _ocupado) return;
    setState(() => _ocupado = true);
    try {
      await accion();
      if (mounted) setState(() => _ocupado = false);
      if (mounted) _aviso('Actualizado');
      await _cargar(silencioso: true);
    } catch (e) {
      _aviso(e.toString());
    } finally {
      if (mounted) setState(() => _ocupado = false);
    }
  }

  void _aviso(String s) {
    if (mounted)
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(s)));
  }

  String _hora(dynamic s) {
    final d = DateTime.tryParse('$s')?.toLocal();
    if (d == null) return '';
    return '${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final estado = '${_disponibilidad['estado'] ?? 'NO_DISPONIBLE'}';
    return Scaffold(
      appBar: AppBar(
        title: const Text('Despacho operativo'),
        actions: [
          IconButton(
              tooltip: 'Actualizar',
              onPressed: _cargar,
              icon: const Icon(Icons.refresh))
        ],
      ),
      body: _cargando
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _cargar,
              child: ListView(padding: const EdgeInsets.all(16), children: [
                _conexion(),
                const SizedBox(height: 14),
                _disponibilidadCard(estado),
                if (_permisos.contains('despacho:servicio')) ...[
                  const SizedBox(height: 16),
                  Row(children: [
                    const Expanded(
                        child: Text('SERVICIOS ACTIVOS',
                            style: TextStyle(
                                fontWeight: FontWeight.w800,
                                letterSpacing: 0.5))),
                    Text('${_servicios.length}',
                        style: const TextStyle(
                            color: _azul, fontWeight: FontWeight.w800)),
                  ]),
                  if (_servicios.isEmpty)
                    const Card(
                        child: Padding(
                            padding: EdgeInsets.all(14),
                            child: Text('No hay servicios activos.'))),
                  for (final s in _servicios)
                    Card(
                        child: ListTile(
                      leading: const CircleAvatar(
                          backgroundColor: Color(0xFFFFE9E7),
                          child: Icon(Icons.local_fire_department,
                              color: Color(0xFFC83737))),
                      title: Text('${s['tipo']} · ${s['numeroServicio']}',
                          style: const TextStyle(fontWeight: FontWeight.w800)),
                      subtitle: Text(
                          '${s['personal']} personas · ${s['moviles']} móviles · ${s['enCamino']} en camino'),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () => Navigator.push(
                              context,
                              MaterialPageRoute<void>(
                                  settings: RouteSettings(
                                      name: '0xA006',
                                      arguments: {'servicioId': '${s['id']}'}),
                                  builder: (_) => PantallaServicioActivoMovil(
                                      servicioId: '${s['id']}')))
                          .then((_) => _cargar(silencioso: true)),
                    )),
                ],
                if (_puedeSolicitar) ...[
                  const SizedBox(height: 18),
                  const Text('PEDIR APOYO',
                      style: TextStyle(
                          fontWeight: FontWeight.w800, letterSpacing: 0.5)),
                  const SizedBox(height: 8),
                  // A ancho completo: en dos columnas el texto se partía en sílabas.
                  _accion(
                      'Solicitud rápida',
                      'Llamar al personal ahora',
                      Icons.bolt,
                      _naranja,
                      () => _nuevaSolicitud('RAPIDA')),
                  const SizedBox(height: 8),
                  _accion(
                      'Solicitar personal',
                      'Convocatoria general',
                      Icons.groups,
                      _azul,
                      () => _nuevaSolicitud('PERSONAL')),
                  const SizedBox(height: 8),
                  _accion(
                      'Solicitar chofer',
                      'Selecciona uno o varios móviles',
                      Icons.local_shipping,
                      _verde,
                      () => _nuevaSolicitud('CHOFER')),
                ],
                const SizedBox(height: 20),
                Row(children: [
                  const Expanded(
                      child: Text('LLAMADOS PARA MÍ',
                          style: TextStyle(
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.5))),
                  if (_solicitudes.isNotEmpty)
                    CircleAvatar(
                        radius: 13,
                        backgroundColor: _azul,
                        child: Text('${_solicitudes.length}',
                            style: const TextStyle(
                                color: Colors.white, fontSize: 12))),
                ]),
                const SizedBox(height: 8),
                if (_solicitudes.isEmpty)
                  const Card(
                      child: Padding(
                          padding: EdgeInsets.all(18),
                          child: Row(children: [
                            Icon(Icons.check_circle_outline, color: _verde),
                            SizedBox(width: 10),
                            Expanded(
                                child: Text('No tienes llamados pendientes.'))
                          ])))
                else
                  for (final s in _solicitudes) _solicitudCard(s),
                if (_error != null)
                  Padding(
                      padding: const EdgeInsets.only(top: 16),
                      child: Text(_error!,
                          style: const TextStyle(color: Colors.red))),
                const SizedBox(height: 24),
              ]),
            ),
    );
  }

  Widget _conexion() => Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
            color: _online ? const Color(0xFFEAF5ED) : const Color(0xFFFFF1E8),
            borderRadius: BorderRadius.circular(12)),
        child: Row(children: [
          Icon(_online ? Icons.cloud_done : Icons.cloud_off,
              color: _online ? _verde : _naranja, size: 19),
          const SizedBox(width: 8),
          Text(
              _online
                  ? 'ONLINE · sincronizando'
                  : 'OFFLINE · sin entrega en tiempo real',
              style:
                  const TextStyle(fontWeight: FontWeight.w700, fontSize: 12)),
        ]),
      );

  Widget _disponibilidadCard(String estado) {
    const opciones = <String, String>{
      'AL_LLAMADO': 'Al llamado',
      'NO_DISPONIBLE': 'No disponible',
      'EN_BASE': 'En base'
    };
    return Card(
        color: const Color(0xFFEAF2FA),
        child: Padding(
            padding: const EdgeInsets.all(14),
            child:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('MI DISPONIBILIDAD',
                  style: TextStyle(
                      fontSize: 12, fontWeight: FontWeight.w800, color: _azul)),
              const SizedBox(height: 4),
              Text(opciones[estado] ?? estado.replaceAll('_', ' '),
                  style: const TextStyle(
                      fontSize: 20, fontWeight: FontWeight.w800)),
              const SizedBox(height: 10),
              Wrap(spacing: 8, runSpacing: 8, children: [
                for (final e in opciones.entries)
                  ChoiceChip(
                      label: Text(e.value),
                      selected: estado == e.key,
                      onSelected: _online
                          ? (_) => _cambiarDisponibilidad(e.key)
                          : null),
              ]),
              if (_disponibilidad['usaHorario'] == true &&
                  _disponibilidad['enHorarioAhora'] == false)
                const Padding(
                    padding: EdgeInsets.only(top: 7),
                    child: Text('Fuera de tu horario configurado',
                        style: TextStyle(fontSize: 12))),
              const Divider(height: 18),
              Wrap(spacing: 8, runSpacing: 4, children: [
                TextButton.icon(
                    onPressed: _online && !_ocupado ? _editarHorario : null,
                    icon: const Icon(Icons.schedule),
                    label: const Text('Programar horario')),
                TextButton.icon(
                    onPressed: _online && !_ocupado ? _agregarExcepcion : null,
                    icon: const Icon(Icons.event_available),
                    label: const Text('Excepción')),
              ]),
              for (final x
                  in (_disponibilidad['excepciones'] as List? ?? const []))
                ListTile(
                  dense: true,
                  contentPadding: EdgeInsets.zero,
                  leading: Icon(
                      (x['disponible'] == true)
                          ? Icons.check_circle
                          : Icons.block,
                      color: (x['disponible'] == true) ? _verde : _naranja),
                  title: Text(
                      '${x['fechaDesde']} – ${x['fechaHasta']} · ${(x['disponible'] == true) ? 'Disponible' : 'No disponible'}',
                      style: const TextStyle(fontSize: 12)),
                  trailing: IconButton(
                      tooltip: 'Quitar excepción',
                      onPressed: _online && !_ocupado
                          ? () => _quitarExcepcion('${x['id']}')
                          : null,
                      icon: const Icon(Icons.close, size: 18)),
                ),
            ])));
  }

  Widget _accion(String titulo, String detalle, IconData icono, Color color,
          VoidCallback onTap) =>
      Card(
          child: ListTile(
        enabled: _online && !_ocupado,
        onTap: _online && !_ocupado ? onTap : null,
        leading: CircleAvatar(
            backgroundColor: color.withValues(alpha: 0.13),
            child: Icon(icono, color: color)),
        title:
            Text(titulo, style: const TextStyle(fontWeight: FontWeight.w800)),
        subtitle: Text(detalle),
        trailing: Icon(Icons.arrow_forward_ios,
            color: _online ? color : Colors.grey, size: 16),
      ));

  Widget _solicitudCard(Map<String, dynamic> s) {
    final id = '${s['solicitudId']}';
    final entrega = '${s['entrega']}';
    final estado = '${s['miEstado']}';
    final tardia = s['tardia'] == true;
    final aceptada =
        estado == 'ACEPTO' || estado == 'EN_CAMINO' || estado == 'LLEGO';
    final espera = estado == 'PENDIENTE';
    return Card(
        margin: const EdgeInsets.only(bottom: 10),
        child: Padding(
            padding: const EdgeInsets.all(14),
            child:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Expanded(
                    child: Text('${s['texto'] ?? 'Solicitud de apoyo'}',
                        style: const TextStyle(
                            fontWeight: FontWeight.w800, fontSize: 16))),
                _badge(
                    tardia ? 'VISTA TARDE' : estado.replaceAll('_', ' '),
                    tardia
                        ? _naranja
                        : estado == 'EN_CAMINO'
                            ? _verde
                            : _azul)
              ]),
              const SizedBox(height: 5),
              Text(
                  'De ${s['creadaPor'] ?? 'Central'} · ${_hora(s['creadoEn'])}',
                  style: const TextStyle(fontSize: 12, color: Colors.black54)),
              if (s['tipo'] == 'CHOFER' &&
                  (s['misMovilesHabilitados'] as List? ?? const []).isNotEmpty)
                Padding(
                    padding: const EdgeInsets.only(top: 6),
                    child: Text(
                        'Autorizado para: ${(s['misMovilesHabilitados'] as List).join(', ')}',
                        style: const TextStyle(
                            color: _azul,
                            fontSize: 12,
                            fontWeight: FontWeight.w700))),
              if (entrega == 'SIN_CONEXION')
                const Padding(
                    padding: EdgeInsets.only(top: 6),
                    child: Text(
                        'No se entregó al emitirse; la estás viendo al reconectar.',
                        style:
                            TextStyle(color: Color(0xFF9C5D00), fontSize: 12))),
              if (s['motivo'] != null)
                Padding(
                    padding: const EdgeInsets.only(top: 6),
                    child: Text('Motivo: ${s['motivo']}')),
              const SizedBox(height: 10),
              if (espera)
                Wrap(spacing: 8, runSpacing: 8, children: [
                  FilledButton.icon(
                      onPressed: _online && !_ocupado
                          ? () => _responder(s, 'ACEPTAR')
                          : null,
                      icon: const Icon(Icons.check),
                      label: const Text('Puedo asistir')),
                  OutlinedButton.icon(
                      onPressed: _online && !_ocupado
                          ? () => _responder(s, 'NO_PUEDO')
                          : null,
                      icon: const Icon(Icons.close),
                      label: const Text('No puedo')),
                ])
              else if (aceptada && estado != 'LLEGO')
                Wrap(spacing: 8, runSpacing: 8, children: [
                  if (estado == 'ACEPTO')
                    FilledButton.tonalIcon(
                        onPressed: _online && !_ocupado
                            ? () => _responder(s, 'EN_CAMINO')
                            : null,
                        icon: const Icon(Icons.directions_run),
                        label: const Text('Estoy en camino')),
                  if (estado == 'EN_CAMINO')
                    FilledButton.tonalIcon(
                        onPressed: _online && !_ocupado
                            ? () => _responder(s, 'LLEGUE')
                            : null,
                        icon: const Icon(Icons.location_on),
                        label: const Text('Llegué')),
                  OutlinedButton.icon(
                      onPressed: _online && !_ocupado
                          ? () => _responder(s, 'CANCELAR')
                          : null,
                      icon: const Icon(Icons.undo),
                      label: const Text('Cancelar asistencia')),
                ])
              else if (estado == 'LLEGO')
                const Text('Registraste tu llegada al servicio.',
                    style: TextStyle(fontWeight: FontWeight.w700)),
              if (_puedeSolicitar && espera && _online)
                Align(
                    alignment: Alignment.centerRight,
                    child: TextButton.icon(
                        onPressed: () => _ampliar(id),
                        icon: const Icon(Icons.campaign_outlined),
                        label: const Text('Buscar más personal'))),
            ])));
  }

  Widget _badge(String text, Color color) => Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
      decoration: BoxDecoration(
          color: color.withValues(alpha: 0.13),
          borderRadius: BorderRadius.circular(20)),
      child: Text(text,
          style: TextStyle(
              color: color, fontSize: 10, fontWeight: FontWeight.w800)));
}
