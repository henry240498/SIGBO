import 'dart:convert';
import 'dart:io';
import 'dart:async';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

import 'api.dart';
import 'mapa_matpel.dart';
import 'matpel_documento.dart';
import 'matpel_parametros.dart';
import 'matpel_motor_local.dart';
import 'matpel_foto.dart';
import 'store.dart';

typedef LlamadaConsultaGre = Future<http.Response>
    Function(String metodo, String ruta, {Map<String, dynamic>? body});

/// Consulta transitoria del motor institucional, sin escrituras ni cola de incidentes.
class PantallaConsultaGre extends StatefulWidget {
  final LlamadaConsultaGre? llamar;
  final Future<bool> Function()? tienePermiso;
  final DocumentoGre? documentoLocal;
  const PantallaConsultaGre(
      {super.key, this.llamar, this.tienePermiso, this.documentoLocal});
  @override
  State<PantallaConsultaGre> createState() => _ConsultaState();
}

class _ConsultaState extends State<PantallaConsultaGre> {
  final _api = SigboApi();
  MotorGreLocal? _motorLocal;
  bool get _sinRed => widget.documentoLocal != null;
  final _q = TextEditingController();
  final _observacion = TextEditingController();
  final _campos = {
    for (final k in CapturaMatpel.nombres.keys) k: TextEditingController()
  };
  var _captura = CapturaMatpel();
  Map<String, dynamic>? _estado, _ficha, _evaluacion;
  List<Map<String, dynamic>> _items = [], _guias = [], _solicitudes = [];
  String? _cursor, _error;
  String _consulta = '';
  bool _ocupado = false, _autorizado = false, _buscado = false;
  int _revision = 0;
  LecturaFotoGre? _foto;
  String? get _version => _estado?['versionGreId'] as String?;
  String _etiqueta(Object? v) => '$v'.replaceAll('_', ' ').toLowerCase();
  List<Map<String, dynamic>> _lista(Object? v) => (v as List? ?? [])
      .map((e) => Map<String, dynamic>.from(e as Map))
      .toList();

  @override
  void initState() {
    super.initState();
    if (_sinRed) _motorLocal = MotorGreLocal(widget.documentoLocal!);
    _iniciar();
  }

  @override
  void dispose() {
    ++_revision;
    final motor = _motorLocal;
    if (motor != null) unawaited(motor.cerrar().catchError((Object _) {}));
    _q.dispose();
    _observacion.dispose();
    for (final c in _campos.values) {
      c.dispose();
    }
    super.dispose();
  }

  Future<http.Response> _llamar(String metodo, String ruta,
          {Map<String, dynamic>? body}) =>
      (widget.llamar ?? _motorLocal?.llamar ?? _api.llamar)(metodo, ruta,
          body: body);
  void _limpiarCaptura() {
    _ficha = null;
    _evaluacion = null;
    _items = [];
    _guias = [];
    _solicitudes = [];
    _cursor = null;
    _buscado = false;
    _consulta = '';
    _captura = CapturaMatpel();
    _foto = null;
    _q.clear();
    _observacion.clear();
    for (final c in _campos.values) {
      c.clear();
    }
  }

  Future<Map<String, dynamic>> _json(String ruta,
      {Map<String, dynamic>? body}) async {
    final r = await _llamar(body == null ? 'GET' : 'POST', ruta, body: body);
    if (r.statusCode < 200 || r.statusCode >= 300) {
      if ((r.statusCode == 401 || r.statusCode == 403) && mounted) {
        setState(() {
          _limpiarCaptura();
          _estado = null;
          _autorizado = false;
        });
      }
      throw StateError(
          _api.mensajeDe(r, 'No se pudo consultar GRE (${r.statusCode}).'));
    }
    return jsonDecode(utf8.decode(r.bodyBytes)) as Map<String, dynamic>;
  }

  String _mensaje(Object e) => e is FormatException
      ? e.message
      : e is StateError
          ? '${e.message}'
          : 'No se pudo conectar al servidor. La consulta del motor requiere conexión; podés volver al lector de la edición guardada.';
  Future<void> _ejecutar(Future<void> Function(bool Function()) accion) async {
    final actual = ++_revision;
    bool vigente() => mounted && actual == _revision;
    setState(() {
      _ocupado = true;
      _error = null;
    });
    try {
      await accion(vigente);
    } catch (e) {
      if (vigente()) setState(() => _error = _mensaje(e));
    } finally {
      if (vigente()) setState(() => _ocupado = false);
    }
  }

  Future<void> _iniciar() async {
    await _ejecutar((vigente) async {
      final permiso = await (widget.tienePermiso?.call() ??
          TokenStore.permisos().then((p) => p.contains('matpel:consultar')));
      if (!permiso) {
        if (vigente())
          setState(() {
            _limpiarCaptura();
            _estado = null;
            _autorizado = false;
          });
        throw StateError('Tu usuario no tiene permiso de consulta MATPEL.');
      }
      final e = await _json('/matpel/estado');
      if (vigente())
        setState(() {
          if (e['versionGreId'] != _version ||
              e['documentoSha256'] != _estado?['documentoSha256'])
            _limpiarCaptura();
          _estado = e;
          _autorizado = true;
        });
    });
  }

  void _cambiar(VoidCallback cambio) {
    ++_revision;
    setState(() {
      cambio();
      _evaluacion = null;
      _ocupado = false;
      _error = null;
    });
  }

  Future<void> _buscar({bool siguiente = false}) async {
    if (_version == null || !_autorizado) return;
    final texto = siguiente ? _consulta : _q.text.trim();
    if (texto.length < 2) {
      setState(() => _error =
          'Ingresar ONU/NA, nombre de al menos dos caracteres o número de guía.');
      return;
    }
    await _ejecutar((vigente) async {
      if (!siguiente)
        setState(() {
          _items = [];
          _guias = [];
          _ficha = null;
          _evaluacion = null;
          _solicitudes = [];
          _buscado = false;
        });
      final params = {
        'q': texto,
        'versionGreId': _version!,
        'limite': '20',
        if (siguiente && _cursor != null) 'cursor': _cursor!
      };
      final r =
          await _json('/matpel/buscar?${Uri(queryParameters: params).query}');
      if (vigente())
        setState(() {
          _consulta = texto;
          _items = [if (siguiente) ..._items, ..._lista(r['items'])];
          _guias = _lista(r['guias']);
          _cursor = r['cursor'] as String?;
          _buscado = true;
        });
    });
  }

  Future<void> _elegir(Map<String, dynamic> entrada) async {
    await _ejecutar((vigente) async {
      setState(() {
        _ficha = null;
        _evaluacion = null;
        _solicitudes = [];
      });
      final r = await _json(
          '/matpel/materiales/${entrada['id']}?versionGreId=$_version');
      if (vigente())
        setState(() {
          _ficha = r;
          _solicitudes = _lista(r['solicitudes']);
          final foto = _foto;
          final original = foto?.textoOriginal ?? '';
          _observacion.text =
              original.length > 2000 ? original.substring(0, 2000) : original;
          _captura.observacion = _observacion.text;
          _captura.certezaIdentificacion = 'NO_CONFIRMADO';
          _captura.metodoIdentificacion = foto == null ? 'MANUAL' : 'OCR';
          for (final k in ['contenedor', 'capacidad', 'numero']) {
            _campos[k]!.clear();
            _captura.valores[k] = '';
            _captura.certezas[k] = 'NO_CONFIRMADO';
          }
        });
    });
  }

  Future<void> _leerFoto() async {
    final r = await Navigator.push<LecturaFotoGre>(
        context, MaterialPageRoute(builder: (_) => const PantallaFotoGre()));
    if (!mounted || r == null) return;
    _cambiar(() {
      _foto = r;
      _q.text = r.identificador;
      _ficha = null;
    });
    await _buscar();
  }

  Future<void> _evaluar() async {
    if (_version == null || !_autorizado) return;
    await _ejecutar((vigente) async {
      setState(() => _evaluacion = null);
      final r = await _json('/matpel/evaluaciones/consulta-v2',
          body: _captura.consulta(
              _version!, _ficha?['entrada']?['id'] as String?));
      if (r['versionGreId'] != _version)
        throw const FormatException(
            'La respuesta no corresponde a la edición consultada.');
      if (vigente())
        setState(() {
          _evaluacion = r;
          _solicitudes = _lista(r['solicitudes']);
        });
    });
  }

  Future<void> _pdf() async {
    try {
      final version = _version;
      final sha = _estado?['documentoSha256'];
      if (version == null || sha is! String)
        throw const FormatException(
            'No se pudo verificar la identidad del PDF.');
      final local = widget.documentoLocal;
      final r = local == null
          ? await _api.parteGre(version, 'pdf')
          : http.Response.bytes(local.pdf, 200);
      if (r.statusCode != 200)
        throw StateError(_api.mensajeDe(r, 'No se pudo descargar el PDF.'));
      if (await huellaGre(r.bodyBytes) != sha)
        throw const FormatException(
            'El PDF descargado no coincide con la edición consultada.');
      final destino = await FilePicker.platform.saveFile(
          dialogTitle: 'Guardar PDF GRE original',
          fileName: 'GRE-${_estado?['edicion']}.pdf',
          type: FileType.custom,
          allowedExtensions: ['pdf'],
          bytes: r.bodyBytes);
      if (destino != null && !Platform.isAndroid && !Platform.isIOS)
        await File(destino).writeAsBytes(r.bodyBytes, flush: true);
    } catch (e) {
      if (mounted) setState(() => _error = _mensaje(e));
    }
  }

  Future<void> _fuente(Object? id, {int? pagina}) async {
    await _ejecutar((vigente) async {
      final f = id == null
          ? null
          : await _json('/matpel/fuentes/$id?versionGreId=$_version');
      if (!vigente()) return;
      final impresas = (f?['etiquetasImpresas'] as List? ?? [])
          .map((e) => e is Map ? e['valor'] ?? e['textoOriginal'] : e)
          .join(', ');
      await showDialog<void>(
          context: context,
          builder: (c) => AlertDialog(
                title: const Text('Fuente GRE original'),
                content: SingleChildScrollView(
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                      Text(
                          'Página PDF ${f?['paginaPdf'] ?? pagina ?? 'no disponible'} · Página impresa: ${impresas.isEmpty ? 'consultar PDF' : impresas}'),
                      const SizedBox(height: 12),
                      SelectableText(f?['textoOriginal'] ??
                          'Consultar la página indicada en el PDF original.'),
                    ])),
                actions: [
                  TextButton(
                      onPressed: _pdf,
                      child: const Text('Guardar PDF original')),
                  TextButton(
                      onPressed: () => Navigator.pop(c),
                      child: const Text('Volver'))
                ],
              ));
    });
  }

  Widget _fuenteBoton(Object? id) => id == null
      ? const SizedBox.shrink()
      : TextButton(
          onPressed: _ocupado ? null : () => _fuente(id),
          child: const Text('Ver fuente'));
  Future<void> _documento(String ruta, String titulo) async {
    await _ejecutar((vigente) async {
      final r = await _json('$ruta?versionGreId=$_version');
      if (!vigente()) return;
      final bloques = _lista(r['bloques']);
      // El lector permanece operativo mientras el panel de texto está abierto.
      setState(() => _ocupado = false);
      await Navigator.push(
          context,
          MaterialPageRoute<void>(
              builder: (_) => Scaffold(
                    appBar: AppBar(title: Text(titulo)),
                    body:
                        ListView(padding: const EdgeInsets.all(16), children: [
                      if (bloques.isEmpty)
                        const Text(
                            'Sin texto en esta sección. Consultar el PDF original.'),
                      _fuenteBoton(r['guia']?['referenciaId']),
                      for (final b in bloques)
                        Card(
                            child: Padding(
                                padding: const EdgeInsets.all(12),
                                child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      if (b['encabezadoOriginal'] != null)
                                        Text(b['encabezadoOriginal'],
                                            style: const TextStyle(
                                                fontWeight: FontWeight.bold)),
                                      SelectableText(b['textoOriginal'] ?? ''),
                                      _fuenteBoton(b['referenciaId']),
                                    ]))),
                    ]),
                  )));
    });
  }

  Future<void> _secciones() async {
    await _ejecutar((vigente) async {
      final r = await _json('/matpel/secciones?versionGreId=$_version');
      if (!vigente()) return;
      final secciones = _lista(r['secciones']);
      final s = await showModalBottomSheet<Map<String, dynamic>>(
          context: context,
          builder: (c) => SafeArea(
                  child: ListView(children: [
                const ListTile(title: Text('Secciones GRE')),
                for (final s in secciones)
                  ListTile(
                      title: Text(s['tituloOriginal']),
                      subtitle:
                          Text('PDF ${s['paginaDesde']}–${s['paginaHasta']}'),
                      onTap: () => Navigator.pop(c, s)),
              ])));
      if (s != null && mounted)
        await _documento('/matpel/secciones/${s['id']}', s['tituloOriginal']);
    });
  }

  Widget _seleccion(String nombre, String valor, Map<String, String> opciones,
          ValueChanged<String> cambiar) =>
      Padding(
          padding: const EdgeInsets.symmetric(vertical: 6),
          child: DropdownButtonFormField<String>(
            key: ValueKey('$nombre:$valor'),
            initialValue: valor,
            isExpanded: true,
            decoration: InputDecoration(
                labelText: nombre, border: const OutlineInputBorder()),
            items: opciones.entries
                .map(
                    (e) => DropdownMenuItem(value: e.key, child: Text(e.value)))
                .toList(),
            onChanged: (v) {
              if (v != null) cambiar(v);
            },
          ));
  Widget _campo(String k) {
    final opciones = <String, Map<String, String>>{
      'evento': {
        'DERRAME': 'Derrame',
        'FUGA': 'Fuga',
        'INCENDIO': 'Incendio',
        'EXPLOSION': 'Explosión',
        'OTRO': 'Otro'
      },
      'incendio': {'SI': 'Sí', 'NO': 'No'},
      'agua': {'TIERRA': 'Tierra', 'AGUA': 'Agua', 'AMBOS': 'Ambos'},
      'periodo': {'DIA': 'Día', 'NOCHE': 'Noche'},
      'contenedor': {
        for (final c in _lista(_ficha?['contenedoresTabla3']))
          '${c['nombre']}': '${c['nombre']}'
      },
    };
    return Card(
        key: ValueKey('campo-$k'),
        child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(children: [
              if (opciones.containsKey(k))
                _seleccion(
                    CapturaMatpel.nombres[k]!,
                    _captura.valores[k]!,
                    {'': 'Desconocido', ...opciones[k]!},
                    (v) => _cambiar(() => _captura.valores[k] = v))
              else
                TextField(
                    controller: _campos[k],
                    decoration: InputDecoration(
                        labelText: CapturaMatpel.nombres[k],
                        helperText:
                            'Vacío si se desconoce. Usar punto decimal.'),
                    keyboardType: const TextInputType.numberWithOptions(
                        decimal: true, signed: true),
                    onChanged: (v) => _cambiar(() => _captura.valores[k] = v)),
              if (_captura.unidades.containsKey(k))
                _seleccion(
                    'Unidad de ${CapturaMatpel.nombres[k]!.toLowerCase()}',
                    _captura.unidades[k]!,
                    k == 'viento'
                        ? {'km/h': 'km/h', 'mph': 'mph', 'm/s': 'm/s'}
                        : {'L': 'L', 'm3': 'm³', 'kg': 'kg', 't': 't'},
                    (v) => _cambiar(() => _captura.unidades[k] = v)),
              _seleccion(
                  'Calidad · ${CapturaMatpel.nombres[k]}',
                  _captura.certezas[k]!,
                  const {
                    'NO_CONFIRMADO': 'No confirmado',
                    'ESTIMADO': 'Estimado',
                    'CONFIRMADO': 'Confirmado por operador'
                  },
                  (v) => _cambiar(() => _captura.certezas[k] = v)),
            ])));
  }

  Widget _apartado(String titulo, Map a) => Card(
      child: Padding(
          padding: const EdgeInsets.all(12),
          child:
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('$titulo · ${_etiqueta(a['estado'])}',
                style: Theme.of(context).textTheme.titleMedium),
            if (a['fuenteResultado'] != null)
              Text('Fuente: ${_etiqueta(a['fuenteResultado'])}'),
            Text('${a['motivo']}'),
            if (a['validacionOperacional'] != null)
              Text(
                  'Validación operacional: ${_etiqueta(a['validacionOperacional'])}'),
            if ((a['faltantes'] as List? ?? []).isNotEmpty)
              Text('Falta: ${(a['faltantes'] as List).join(', ')}'),
            for (final c in _lista(a['celdas']))
              ListTile(
                  contentPadding: EdgeInsets.zero,
                  title: Text(
                      '${c['textoOriginal']} ${c['unidadOriginal'] ?? ''}'),
                  subtitle: Text(_etiqueta(c['columnaCodigo'])),
                  trailing: _fuenteBoton(c['referenciaId'])),
            Wrap(children: [
              for (final id in a['referenciaIds'] as List? ?? [])
                _fuenteBoton(id)
            ]),
          ])));
  Widget _lectura(Map g) => Card(
      child: Padding(
          padding: const EdgeInsets.all(12),
          child:
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Distancias y condiciones de la guía ${g['numero']}',
                style: Theme.of(context).textTheme.titleMedium),
            Text('${g['advertencia']}'),
            for (final b in _lista(g['distancias'])) ...[
              SelectableText('${b['textoOriginal']}'),
              _fuenteBoton(b['referenciaId'])
            ],
            TextButton(
                onPressed: () => _documento('/matpel/guias/${g['numero']}',
                    'Guía ${g['numero']} completa'),
                child: const Text('Leer guía completa')),
            for (final c in _lista(g['condiciones']))
              ExpansionTile(title: Text('${c['descripcion']}'), children: [
                for (final t in c['condicionesActivacion'] as List? ?? [])
                  ListTile(title: Text('$t')),
                for (final t in c['entradasNecesarias'] as List? ?? [])
                  ListTile(title: Text('Dato necesario: $t')),
                for (final t in c['excepcionesYAlteraciones'] as List? ?? [])
                  ListTile(title: Text('$t')),
                for (final f in _lista(c['fuentes']))
                  ListTile(
                      title: Text(
                          f['extractoLiteral'] ?? 'Consultar PDF original.'),
                      subtitle: Text(
                          'PDF ${f['paginaPdf']} · impresa ${f['paginaImpresa']}'),
                      onTap: () => _fuente(
                          (f['referenciaIds'] as List? ?? []).firstOrNull,
                          pagina: f['paginaPdf'] as int?)),
                for (final t in c['limites'] as List? ?? [])
                  ListTile(title: Text('$t')),
              ]),
          ])));

  @override
  Widget build(BuildContext context) {
    final e = _evaluacion;
    return Scaffold(
        appBar: AppBar(title: const Text('Consulta guiada GRE')),
        body: ListView(padding: const EdgeInsets.all(16), children: [
          Text(_sinRed
              ? 'Consulta sin conexión con la edición guardada y el mismo motor del servidor. Su vigencia y los permisos revocados no pueden comprobarse sin red. No registra decisiones del incidente.'
              : 'Elegí el material específico y conservá desconocidos los datos que no observaste. Los resultados consultan el motor del servidor y no registran decisiones del incidente.'),
          if (_ocupado) const LinearProgressIndicator(),
          if (_error != null)
            Padding(
                padding: const EdgeInsets.symmetric(vertical: 12),
                child: Text(_error!,
                    style:
                        TextStyle(color: Theme.of(context).colorScheme.error))),
          if (_estado != null && _estado!['estado'] != 'DISPONIBLE')
            const Text(
                'No hay edición GRE activa disponible en el servidor. Podés volver al lector de una copia guardada.'),
          TextButton(
              onPressed: _ocupado ? null : _iniciar,
              child: const Text('Comprobar disponibilidad')),
          if (_autorizado && _version != null) ...[
            Text(
                'GRE ${_estado?['edicion']} · ${_sinRed ? 'edición guardada, sin conexión' : 'edición consultada en servidor'}'),
            Wrap(children: [
              TextButton(
                  onPressed: _ocupado ? null : _secciones,
                  child: const Text('Secciones GRE')),
              TextButton(
                  onPressed: _ocupado ? null : _pdf,
                  child: const Text('Guardar PDF original'))
            ]),
            TextField(
                controller: _q,
                maxLength: 120,
                decoration: const InputDecoration(
                    labelText: 'Identificador ONU/NA, nombre o guía'),
                onChanged: (_) {
                  if (_foto != null) _cambiar(() => _foto = null);
                },
                onSubmitted: (_) => _buscar()),
            OutlinedButton.icon(
                onPressed: _ocupado ? null : _leerFoto,
                icon: const Icon(Icons.document_scanner),
                label: const Text('Leer placa por foto')),
            if (_foto != null)
              Text(
                  'Candidato leído por OCR, identidad no confirmada.${_foto!.textoOriginal.length > 2000 ? ' La observación conserva los primeros 2000 caracteres; revisá la placa completa.' : ''}'),
            FilledButton(
                onPressed: _ocupado ? null : _buscar,
                child: Text(_sinRed
                    ? 'Buscar en edición guardada'
                    : 'Buscar en servidor')),
            if (_buscado && _items.isEmpty && _guias.isEmpty)
              const Text(
                  'Sin coincidencias. Material desconocido: consultar guía 111.'),
            for (final g in _guias)
              ListTile(
                  title: Text(
                      'Guía ${g['numero']} · ${g['tituloOriginal'] ?? ''}'),
                  onTap: () => _documento(
                      '/matpel/guias/${g['numero']}', 'Guía ${g['numero']}')),
            for (final item in _items)
              ListTile(
                  title: Text('${item['nombreOriginal']}'),
                  subtitle: Text(
                      'ONU/NA ${item['identificador'] ?? 'sin identificador'}'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: _ocupado ? null : () => _elegir(item)),
            if (_cursor != null)
              TextButton(
                  onPressed: _ocupado ? null : () => _buscar(siguiente: true),
                  child: const Text('Más resultados')),
            if (_ficha != null) ...[
              Text('${_ficha!['entrada']['nombreOriginal']}',
                  style: Theme.of(context).textTheme.titleLarge),
              Text(
                  'Resaltado verde: ${_ficha!['entrada']['resaltadoVerde'] ?? 'no determinado'} · Sufijo P: ${_ficha!['entrada']['polimerizable'] ?? 'no determinado'}'),
              _fuenteBoton(_ficha!['entrada']['referenciaId']),
              if (_ficha!['guia'] != null)
                TextButton(
                    onPressed: () => _documento(
                        '/matpel/guias/${_ficha!['guia']['numero']}',
                        'Guía ${_ficha!['guia']['numero']} completa'),
                    child: const Text('Leer guía asignada completa')),
              TextField(
                  controller: _observacion,
                  maxLength: 2000,
                  decoration: const InputDecoration(
                      labelText: 'Observación original de identificación'),
                  onChanged: (v) => _cambiar(() => _captura.observacion = v)),
              _seleccion(
                  'Calidad de identificación',
                  _captura.certezaIdentificacion,
                  const {
                    'NO_CONFIRMADO': 'No confirmado',
                    'ESTIMADO': 'Estimado',
                    'CONFIRMADO': 'Confirmado por operador'
                  },
                  (v) => _cambiar(() => _captura.certezaIdentificacion = v)),
              _seleccion(
                  'Método observado',
                  _captura.metodoIdentificacion,
                  const {
                    'MANUAL': 'Manual',
                    'PLACA': 'Placa',
                    'DESCONOCIDO': 'Desconocido'
                  },
                  (v) => _cambiar(() => _captura.metodoIdentificacion = v)),
              for (final g in _lista(_ficha!['guiasLectura'])) _lectura(g),
            ],
            TextButton(
                onPressed: () => _documento(
                    '/matpel/guias/111', 'Guía 111 · material desconocido'),
                child: const Text('Leer guía 111')),
            _seleccion(
                'Ámbito observado',
                _captura.ambito,
                const {
                  'DESCONOCIDO': 'Desconocido',
                  'TRANSPORTE_TERRESTRE': 'Transporte terrestre',
                  'INSTALACION_FIJA': 'Instalación fija',
                  'AEREO_MARITIMO': 'Aéreo / marítimo'
                },
                (v) => _cambiar(() => _captura.ambito = v)),
            if (_solicitudes.isNotEmpty)
              Card(
                  child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Datos que solicita esta consulta',
                                style: TextStyle(fontWeight: FontWeight.bold)),
                            for (final s in _solicitudes) ...[
                              Text('${s['etiqueta']}: ${s['motivo']}'),
                              Wrap(children: [
                                for (final id
                                    in s['referenciaIds'] as List? ?? [])
                                  _fuenteBoton(id)
                              ])
                            ],
                          ]))),
            ExpansionTile(
                title: const Text('Evento y condiciones observadas'),
                initiallyExpanded: true,
                children: [
                  for (final k in [
                    'evento',
                    'incendio',
                    'cantidad',
                    'agua',
                    'periodo'
                  ])
                    _campo(k)
                ]),
            ExpansionTile(
                title: const Text('Recipiente y cantidad de referencia'),
                children: [
                  for (final k in ['contenedor', 'capacidad', 'numero'])
                    _campo(k)
                ]),
            ExpansionTile(
                title: const Text('Viento y ubicación del derrame'),
                children: [
                  for (final k in [
                    'viento',
                    'direccion',
                    'latitud',
                    'longitud',
                    'precision'
                  ])
                    _campo(k)
                ]),
            FilledButton(
                onPressed: _ocupado ? null : _evaluar,
                child: const Text('Consultar condiciones y distancias')),
            if (e != null) ...[
              Text(
                  'Resultado · ${e['versionMotor']} · ${e['versionInterpretacion'] ?? 'sin perfil'}'),
              for (final a in _lista(e['avisos']))
                Card(
                    child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('${a['motivo']}'),
                              Wrap(children: [
                                for (final id
                                    in a['referenciaIds'] as List? ?? [])
                                  _fuenteBoton(id)
                              ])
                            ]))),
              for (final par in {
                'aislamiento': 'Aislamiento inicial',
                'proteccion': 'Acción protectora',
                'tabla1': 'Tabla 1',
                'tabla2': 'Tabla 2 · gases producidos',
                'tabla3': 'Tabla 3'
              }.entries)
                if (e[par.key] is Map) _apartado(par.value, e[par.key] as Map),
              for (final g in _lista(e['guiasLectura'])) _lectura(g),
              if (e['geometria'] is Map)
                MapaMatpelMovil(
                    datos: Map<String, dynamic>.from(e['geometria'] as Map)),
              ExpansionTile(
                  title: const Text('Trazabilidad del resultado'),
                  children: [
                    ListTile(
                        title: SelectableText(
                            'Edición: ${e['versionGreId']}\nPDF: ${e['documentoSha256']}\nCatálogo: ${e['sha256Contenido']}\nInterpretación: ${e['sha256Interpretacion']}\nDatos consultados: ${e['inputsHash']}')),
                    for (final paso in _lista(e['traza']))
                      Padding(
                          padding: const EdgeInsets.all(12),
                          child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('${paso['paso']}: ${paso['resultado']}'),
                                Text(
                                    'Reglas: ${(paso['reglas'] as List? ?? []).join(', ')}'),
                                Wrap(children: [
                                  for (final id
                                      in paso['referenciaIds'] as List? ?? [])
                                    _fuenteBoton(id)
                                ]),
                              ])),
                  ]),
            ],
          ],
        ]));
  }
}
