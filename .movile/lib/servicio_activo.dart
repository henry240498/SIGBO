import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';

import 'api.dart';
import 'mapa_servicio.dart';

const _azulServicio = Color(0xFF1767A8);

class PantallaServicioActivoMovil extends StatefulWidget {
  final String servicioId;
  const PantallaServicioActivoMovil({super.key, required this.servicioId});

  @override
  State<PantallaServicioActivoMovil> createState() =>
      _PantallaServicioActivoMovilState();
}

class _PantallaServicioActivoMovilState
    extends State<PantallaServicioActivoMovil> {
  final _api = SigboApi();
  final _mensaje = TextEditingController();
  Timer? _timer;
  Timer? _timerMapa;
  Map<String, dynamic>? _servicio;
  Map<String, dynamic>? _mapa;
  List<Map<String, dynamic>> _mensajes = [];
  List<Map<String, dynamic>> _formularios = [];
  bool _online = true;
  bool _trabajando = false;
  bool _cargandoMapa = false;
  String? _error;
  String? _errorMapa;

  @override
  void initState() {
    super.initState();
    _cargar();
    _timer = Timer.periodic(
        const Duration(seconds: 5), (_) => _cargar(silencioso: true));
    _timerMapa = Timer.periodic(
        const Duration(seconds: 10), (_) => _cargarMapa(silencioso: true));
  }

  @override
  void dispose() {
    _timer?.cancel();
    _timerMapa?.cancel();
    _mensaje.dispose();
    super.dispose();
  }

  Future<dynamic> _llamar(String metodo, String ruta,
      {Map<String, dynamic>? body}) async {
    final r = await _api.llamar(metodo, ruta, body: body);
    if (r.statusCode < 200 || r.statusCode >= 300) {
      throw ApiException(_api.mensajeDe(r, 'No se pudo actualizar el servicio'),
          codigo: r.statusCode);
    }
    return r.body.isEmpty ? null : jsonDecode(r.body);
  }

  Future<void> _cargar({bool silencioso = false}) async {
    if (_trabajando) return;
    try {
      final servicio = Map<String, dynamic>.from(
          await _llamar('GET', '/despacho/servicios/${widget.servicioId}')
              as Map);
      // Chat y formularios son solo de participantes: quien todavía no se
      // incorporó ve el servicio y el botón para hacerlo, no un error.
      var mensajes = <Map<String, dynamic>>[];
      var formularios = <Map<String, dynamic>>[];
      if (servicio['soyParticipante'] == true) {
        final values = await Future.wait([
          _llamar('GET', '/despacho/servicios/${widget.servicioId}/mensajes'),
          _llamar(
              'GET', '/despacho/servicios/${widget.servicioId}/formularios'),
        ]);
        mensajes = List<Map<String, dynamic>>.from((values[0] as List)
            .map((e) => Map<String, dynamic>.from(e as Map)));
        formularios = List<Map<String, dynamic>>.from((values[1] as List)
            .map((e) => Map<String, dynamic>.from(e as Map)));
      }
      if (!mounted) return;
      setState(() {
        _servicio = servicio;
        _mensajes = mensajes;
        _formularios = formularios;
        _online = true;
        _error = null;
      });
      unawaited(_cargarMapa(silencioso: true));
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _online = false;
        if (!silencioso) _error = e.toString();
      });
    }
  }

  Future<void> _cargarMapa({bool silencioso = false}) async {
    if (_cargandoMapa) return;
    if (_servicio?['soyParticipante'] != true) {
      if (mounted && _mapa != null) setState(() => _mapa = null);
      return;
    }
    _cargandoMapa = true;
    try {
      final datos = Map<String, dynamic>.from(
          await _llamar('GET', '/despacho/servicios/${widget.servicioId}/mapa')
              as Map);
      if (!mounted) return;
      setState(() {
        _mapa = datos;
        _errorMapa = null;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMapa = e.toString();
        // No conservar coordenadas autorizadas previamente si cambian los
        // permisos o falla la actualización: podrían mostrarse como actuales.
        _mapa = null;
      });
    } finally {
      _cargandoMapa = false;
    }
  }

  Future<void> _accion(Future<dynamic> Function() accion, String ok) async {
    if (!_online || _trabajando) return;
    setState(() => _trabajando = true);
    try {
      await accion();
      if (mounted)
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(ok)));
      if (mounted) setState(() => _trabajando = false);
      await _cargar(silencioso: true);
    } catch (e) {
      if (mounted) {
        setState(() => _trabajando = false);
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(e.toString())));
      }
    }
  }

  Future<void> _enviarMensaje() async {
    final texto = _mensaje.text.trim();
    if (texto.isEmpty) return;
    _mensaje.clear();
    await _accion(
        () => _llamar(
                'POST', '/despacho/servicios/${widget.servicioId}/mensajes',
                body: {
                  'texto': texto,
                  'clave': DateTime.now().microsecondsSinceEpoch.toString(),
                }),
        'Mensaje enviado');
  }

  Future<void> _participar() async {
    final s = _servicio;
    if (s == null) return;
    if (s['soyParticipante'] != true) {
      await _accion(
          () => _llamar(
              'POST', '/despacho/servicios/${widget.servicioId}/unirme'),
          'Te incorporaste al servicio');
      return;
    }
    final llego = s['miEstado'] == 'EN_SITIO';
    await _accion(
        () => _llamar(
            'PATCH', '/despacho/servicios/${widget.servicioId}/mi-estado',
            body: {'estado': llego ? 'RETIRADO' : 'EN_SITIO'}),
        llego ? 'Salida registrada' : 'Llegada registrada');
  }

  Future<void> _editarFormulario(Map<String, dynamic> item) async {
    final definicion = Map<String, dynamic>.from(item['definicion'] as Map);
    final actual = item['respuesta'] == null
        ? null
        : Map<String, dynamic>.from(item['respuesta'] as Map);
    final campos = List<Map<String, dynamic>>.from(
        (definicion['campos'] as List? ?? const [])
            .map((e) => Map<String, dynamic>.from(e as Map)));
    final datosActuales =
        Map<String, dynamic>.from(actual?['datos'] as Map? ?? const {});
    final controllers = <String, TextEditingController>{};
    for (final c in campos.where((c) =>
        c['tipo'] == 'texto' ||
        c['tipo'] == 'texto_largo' ||
        c['tipo'] == 'numero' ||
        c['tipo'] == 'fecha_hora')) {
      controllers['${c['clave']}'] =
          TextEditingController(text: '${datosActuales[c['clave']] ?? ''}');
    }
    final datos = Map<String, dynamic>.from(datosActuales);
    final completa = await showDialog<bool>(
      context: context,
      builder: (ctx) => StatefulBuilder(
          builder: (ctx, refrescar) => AlertDialog(
                title: Text('${definicion['nombre']}'),
                content: SizedBox(
                    width: 520,
                    child: SingleChildScrollView(
                        child:
                            Column(mainAxisSize: MainAxisSize.min, children: [
                      for (final c in campos)
                        _campoFormulario(c, controllers, datos, refrescar),
                    ]))),
                actions: [
                  TextButton(
                      onPressed: () => Navigator.pop(ctx),
                      child: const Text('Volver')),
                  OutlinedButton(
                      onPressed: () => Navigator.pop(ctx, false),
                      child: const Text('Guardar borrador')),
                  FilledButton(
                      onPressed: () => Navigator.pop(ctx, true),
                      child: const Text('Completar')),
                ],
              )),
    );
    for (final c in controllers.values) {
      c.dispose();
    }
    if (completa == null) return;
    final claveId = actual?['id']?.toString();
    await _accion(
        () => claveId == null
            ? _llamar(
                'POST', '/despacho/servicios/${widget.servicioId}/formularios',
                body: {
                    'definicionId': definicion['id'],
                    'datos': datos,
                    'completar': completa
                  })
            : _llamar('PATCH', '/despacho/formularios/$claveId', body: {
                'version': actual?['version'],
                'datos': datos,
                'completar': completa
              }),
        completa ? 'Formulario completado' : 'Borrador guardado');
  }

  Widget _campoFormulario(
      Map<String, dynamic> c,
      Map<String, TextEditingController> controllers,
      Map<String, dynamic> datos,
      StateSetter refrescar) {
    final key = '${c['clave']}';
    final tipo = '${c['tipo']}';
    final label = '${c['etiqueta']}${c['requerido'] == true ? ' *' : ''}';
    if (tipo == 'si_no')
      return SwitchListTile(
          title: Text(label),
          value: datos[key] == true,
          onChanged: (v) => refrescar(() => datos[key] = v));
    if (tipo == 'opcion') {
      final opciones = List<String>.from(c['opciones'] as List? ?? const []);
      final actual = datos[key]?.toString();
      return DropdownButtonFormField<String>(
          initialValue: opciones.contains(actual) ? actual : null,
          decoration: InputDecoration(labelText: label),
          items: opciones
              .map((x) => DropdownMenuItem(value: x, child: Text(x)))
              .toList(),
          onChanged: (v) => refrescar(() {
                if (v != null) datos[key] = v;
              }));
    }
    final ctl = controllers[key]!;
    return Padding(
        padding: const EdgeInsets.only(bottom: 9),
        child: TextField(
          controller: ctl,
          keyboardType: tipo == 'numero'
              ? const TextInputType.numberWithOptions(decimal: true)
              : TextInputType.text,
          maxLines: tipo == 'texto_largo' ? 4 : 1,
          decoration: InputDecoration(
              labelText: label, border: const OutlineInputBorder()),
          onChanged: (v) {
            if (tipo == 'numero') {
              final n = num.tryParse(v);
              if (n != null)
                datos[key] = n;
              else {
                datos.remove(key);
              }
            } else if (v.trim().isEmpty) {
              datos.remove(key);
            } else {
              datos[key] = v;
            }
          },
        ));
  }

  String _hora(dynamic v) {
    final d = DateTime.tryParse('$v')?.toLocal();
    return d == null
        ? ''
        : '${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final s = _servicio;
    return Scaffold(
      appBar: AppBar(
          title: Text(s == null
              ? 'Servicio activo'
              : '${s['tipo']} · ${s['numeroServicio']}'),
          actions: [
            IconButton(onPressed: _cargar, icon: const Icon(Icons.refresh))
          ]),
      body: s == null
          ? (_error == null
              ? const Center(child: CircularProgressIndicator())
              : Center(child: Text(_error!)))
          : RefreshIndicator(
              onRefresh: _cargar,
              child: ListView(padding: const EdgeInsets.all(14), children: [
                if (!_online)
                  Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFF2D8),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Row(children: [
                      Icon(Icons.cloud_off, color: Color(0xFF9C5D00)),
                      SizedBox(width: 8),
                      Expanded(
                        child: Text(
                            'Sin conexión: la información puede estar desactualizada. No se enviarán acciones.'),
                      ),
                    ]),
                  ),
                Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                        color: const Color(0xFFEAF2FA),
                        borderRadius: BorderRadius.circular(14)),
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(children: [
                            const Icon(Icons.local_fire_department,
                                color: _azulServicio),
                            const SizedBox(width: 8),
                            Text('${s['estado']}',
                                style: const TextStyle(
                                    fontWeight: FontWeight.w800,
                                    color: _azulServicio))
                          ]),
                          if (s['direccion'] != null)
                            Padding(
                                padding: const EdgeInsets.only(top: 8),
                                child: Text('${s['direccion']}',
                                    style: const TextStyle(
                                        fontWeight: FontWeight.w700))),
                          if (s['descripcion'] != null)
                            Padding(
                                padding: const EdgeInsets.only(top: 4),
                                child: Text('${s['descripcion']}')),
                          const SizedBox(height: 10),
                          Wrap(spacing: 8, children: [
                            Text(
                                '${(s['participantes'] as List? ?? const []).length} personas'),
                            Text('·'),
                            Text(
                                '${(s['moviles'] as List? ?? const []).length} móviles')
                          ]),
                          const SizedBox(height: 10),
                          FilledButton.icon(
                              onPressed:
                                  _online && !_trabajando ? _participar : null,
                              icon: Icon(s['soyParticipante'] == true
                                  ? Icons.place
                                  : Icons.add),
                              label: Text(s['soyParticipante'] == true
                                  ? 'Registrar llegada o salida'
                                  : 'Unirme al servicio')),
                        ])),
                const SizedBox(height: 16),
                const Text('PERSONAL Y MÓVILES',
                    style: TextStyle(fontWeight: FontWeight.w800)),
                if (s['soyParticipante'] == true) ...[
                  const SizedBox(height: 8),
                  const Text('MAPA OPERATIVO',
                      style: TextStyle(fontWeight: FontWeight.w800)),
                  const SizedBox(height: 8),
                  if (_mapa != null)
                    MapaServicioMovil(datos: _mapa!)
                  else if (_errorMapa != null)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFF7E6),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(_errorMapa!.contains('403')
                          ? 'El mapa no está disponible para este perfil.'
                          : 'No se pudo actualizar el mapa. Se conserva la información del servicio.'),
                    )
                  else
                    const SizedBox(
                        height: 110,
                        child: Center(child: CircularProgressIndicator())),
                  const SizedBox(height: 12),
                ],
                for (final p in (s['participantes'] as List? ?? const []))
                  ListTile(
                      dense: true,
                      leading: CircleAvatar(
                          radius: 17,
                          child: Icon(
                              p['estado'] == 'EN_SITIO'
                                  ? Icons.place
                                  : Icons.directions_run,
                              size: 18)),
                      title: Text('${p['nombre']}'),
                      subtitle: Text(
                          '${p['rol'] ?? 'Personal'} · ${p['estado'] == 'EN_SITIO' ? 'En el lugar' : p['estado'] == 'RETIRADO' ? 'Retirado' : 'En camino'}')),
                for (final m in (s['moviles'] as List? ?? const []))
                  ListTile(
                      dense: true,
                      leading: const CircleAvatar(
                          radius: 17,
                          child: Icon(Icons.local_shipping, size: 18)),
                      title: Text('Móvil asociado'),
                      subtitle: Text('${m['estado']}')),
                const SizedBox(height: 12),
                _chat(),
                const SizedBox(height: 14),
                const Text('FORMULARIOS',
                    style: TextStyle(fontWeight: FontWeight.w800)),
                if (_formularios.isEmpty)
                  const Padding(
                      padding: EdgeInsets.all(12),
                      child: Text(
                          'No hay formularios habilitados para tu rol y esta etapa.')),
                for (final f in _formularios) _formularioCard(f),
                if (!_online)
                  const Padding(
                    padding: EdgeInsets.all(12),
                    child: Text(
                        'Sin conexión. No se enviaron mensajes ni cambios.',
                        style: TextStyle(color: Color(0xFF9C5D00))),
                  ),
              ]),
            ),
    );
  }

  Widget _chat() => Card(
      child: Padding(
          padding: const EdgeInsets.all(12),
          child:
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Row(children: [
              Icon(Icons.forum_outlined, color: _azulServicio),
              SizedBox(width: 8),
              Text('COMUNICACIÓN DEL SERVICIO',
                  style: TextStyle(fontWeight: FontWeight.w800))
            ]),
            const SizedBox(height: 8),
            if (_mensajes.isEmpty) const Text('Canal operativo listo.'),
            for (final m in _mensajes.take(50))
              Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4),
                  child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('${_hora(m['ocurridoEn'])} ',
                            style: const TextStyle(
                                fontSize: 11, color: Colors.black54)),
                        Expanded(
                            child: Text('${m['usuarioNombre']}: ${m['texto']}'))
                      ])),
            const SizedBox(height: 6),
            Row(children: [
              Expanded(
                  child: TextField(
                      controller: _mensaje,
                      enabled: _online && !_trabajando,
                      minLines: 1,
                      maxLines: 3,
                      maxLength: 500,
                      decoration: const InputDecoration(
                          hintText: 'Mensaje corto para el equipo',
                          border: OutlineInputBorder(),
                          counterText: ''))),
              const SizedBox(width: 8),
              IconButton.filled(
                  onPressed: _online && !_trabajando ? _enviarMensaje : null,
                  icon: const Icon(Icons.send),
                  tooltip: 'Enviar')
            ]),
          ])));

  Widget _formularioCard(Map<String, dynamic> f) {
    final d = Map<String, dynamic>.from(f['definicion'] as Map);
    final r = f['respuesta'] == null
        ? null
        : Map<String, dynamic>.from(f['respuesta'] as Map);
    return Card(
        child: ListTile(
      leading: const CircleAvatar(
          backgroundColor: Color(0xFFEAF2FA),
          child: Icon(Icons.assignment_outlined, color: _azulServicio)),
      title: Text('${d['nombre']}'),
      subtitle: Text(r == null
          ? '${d['descripcion'] ?? 'Formulario disponible'}'
          : '${r['estado']} · versión ${r['version']}'),
      trailing: const Icon(Icons.chevron_right),
      onTap: _online && !_trabajando ? () => _editarFormulario(f) : null,
    ));
  }
}
