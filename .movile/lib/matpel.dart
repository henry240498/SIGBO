import 'dart:convert';
import 'dart:io';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

import 'api.dart';
import 'matpel_documento.dart';
import 'matpel_consulta.dart';
import 'store.dart';

/// Consulta documental independiente dentro de Herramientas operativas.
/// Las descargas conservan el guard C y las restricciones de la matriz web del servidor.
class PantallaMatpel extends StatefulWidget {
  final BibliotecaGre? biblioteca;
  final Future<http.Response> Function()? consultarEstado;
  final Future<http.Response> Function(String)? descargar;
  final Future<bool> Function()? tienePermiso;
  final Future<http.Response> Function(String, String)? descargarParte;
  const PantallaMatpel({
    super.key,
    this.biblioteca,
    this.consultarEstado,
    this.descargar,
    this.tienePermiso,
    this.descargarParte,
  });
  @override
  State<PantallaMatpel> createState() => _MatpelState();
}

class _MatpelState extends State<PantallaMatpel> {
  final _q = TextEditingController();
  final _api = SigboApi();
  BibliotecaGre? _biblioteca;
  DocumentoGre? _doc;
  List<Map<String, dynamic>>? _resultados;
  bool _cargando = true, _autorizado = false;
  int _mostrados = 20;
  String? _error;
  @override
  void initState() {
    super.initState();
    _cargar();
  }

  @override
  void dispose() {
    _q.dispose();
    super.dispose();
  }

  Future<void> _cargar() async {
    try {
      final permiso = await (widget.tienePermiso?.call() ??
          TokenStore.permisos().then(
            (p) => p.contains('matpel:consultar'),
          ));
      if (!permiso)
        throw StateError('Tu usuario no tiene permiso de consulta MATPEL.');
      _autorizado = true;
      _biblioteca = widget.biblioteca ?? await BibliotecaGre.abrir();
      final d = await _biblioteca!.actual();
      if (mounted) setState(() => _doc = d);
    } catch (e) {
      if (mounted) setState(() => _error = _mensaje(e));
    } finally {
      if (mounted) setState(() => _cargando = false);
    }
  }

  String _mensaje(Object e) => e is FormatException
      ? e.message
      : e is StateError
          ? '${e.message}'
          : 'No se pudo leer o descargar la edición GRE. La copia anterior se conserva; volver a intentar con conexión.';
  Future<void> _descargar() async {
    if (!_autorizado || _cargando) return;
    setState(() {
      _cargando = true;
      _error = null;
    });
    try {
      final estado = await (widget.consultarEstado?.call() ??
          _api.llamar('GET', '/matpel/estado'));
      if (estado.statusCode != 200)
        throw StateError(
          _api.mensajeDe(estado, 'No se pudo consultar la edición.'),
        );
      final s =
          jsonDecode(utf8.decode(estado.bodyBytes)) as Map<String, dynamic>;
      if (s['estado'] != 'DISPONIBLE' || s['versionGreId'] is! String)
        throw StateError(
          'No hay edición GRE activa disponible. La copia guardada no se reemplaza.',
        );
      final id = s['versionGreId'] as String;
      if (!RegExp(r'^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$').hasMatch(id))
        throw const FormatException('Versión GRE inválida.');
      final DocumentoGre d;
      if (widget.descargar != null) {
        final res = await widget.descargar!(id);
        if (res.statusCode != 200)
          throw StateError(
              _api.mensajeDe(res, 'No se pudo descargar la edición.'));
        if (res.bodyBytes.length > 75000000)
          throw const FormatException('Paquete GRE demasiado grande.');
        final p =
            jsonDecode(utf8.decode(res.bodyBytes)) as Map<String, dynamic>;
        _comprobarEdicion(p['manifest'] as Map, id, s['documentoSha256']);
        d = await _biblioteca!.guardar(p);
      } else {
        d = await _descargarPartes(id, s['documentoSha256']);
      }
      if (mounted)
        setState(() {
          _doc = d;
          _resultados = null;
        });
    } catch (e) {
      if (mounted) setState(() => _error = _mensaje(e));
    } finally {
      if (mounted) setState(() => _cargando = false);
    }
  }

  void _comprobarEdicion(Map m, String id, Object? sha) {
    if (m['versionGreId'] != id || m['documentoSha256'] != sha) {
      throw const FormatException(
          'La descarga no corresponde a la edición solicitada.');
    }
  }

  Future<DocumentoGre> _descargarPartes(String id, Object? sha) async {
    Future<http.Response> parte(String nombre) async {
      final r = await (widget.descargarParte?.call(id, nombre) ??
          _api.parteGre(id, nombre));
      if (r.statusCode != 200)
        throw StateError(_api.mensajeDe(r, 'No se pudo descargar la edición.'));
      return r;
    }

    final respuesta = await parte('manifest');
    if (respuesta.bodyBytes.length > 65536)
      throw const FormatException('Manifiesto GRE demasiado grande.');
    final m = (jsonDecode(utf8.decode(respuesta.bodyBytes))
        as Map<String, dynamic>)['manifest'] as Map<String, dynamic>;
    _comprobarEdicion(m, id, sha);
    final tamanos = ['catalogoBytes', 'documentoBytes', 'interpretacionBytes']
        .map((k) => m[k])
        .toList();
    if (m['versionPaquete'] != 2 ||
        tamanos.any((n) => n is! int || n < 0) ||
        tamanos.cast<int>().fold<int>(0, (a, b) => a + b) > 50000000) {
      throw const FormatException(
          'Tamaño o formato de edición GRE no admitido.');
    }
    final catalogo = (await parte('catalogo')).bodyBytes;
    if (catalogo.length != m['catalogoBytes'])
      throw const FormatException('Catálogo GRE incompleto.');
    final pdf = (await parte('pdf')).bodyBytes;
    if (pdf.length != m['documentoBytes'])
      throw const FormatException('PDF GRE incompleto.');
    final interpretacion = (await parte('interpretacion')).bodyBytes;
    return _biblioteca!.guardarPartes(m, catalogo, pdf, interpretacion);
  }

  Future<void> _ediciones() async {
    final ns = await _biblioteca!.ediciones();
    if (!mounted) return;
    final elegido = await showModalBottomSheet<String>(
      context: context,
      builder: (c) => SafeArea(
        child: ListView(
          shrinkWrap: true,
          children: [
            const ListTile(
              title: Text('Ediciones guardadas'),
              subtitle: Text(
                'Se verifica la integridad antes de abrir. La elección es documental y no cambia la edición de un incidente.',
              ),
            ),
            if (ns.isEmpty)
              const ListTile(
                title: Text('Todavía no hay ediciones guardadas.'),
              ),
            for (final n in ns)
              ListTile(
                title: Text('Versión ${n.substring(0, 8)}'),
                subtitle: Text('Catálogo ${n.substring(37, 49)}'),
                onTap: () => Navigator.pop(c, n),
              ),
          ],
        ),
      ),
    );
    if (elegido == null) return;
    setState(() => _cargando = true);
    try {
      final d = await _biblioteca!.elegir(elegido);
      if (mounted)
        setState(() {
          _doc = d;
          _resultados = null;
          _error = null;
        });
    } catch (e) {
      if (mounted) setState(() => _error = _mensaje(e));
    } finally {
      if (mounted) setState(() => _cargando = false);
    }
  }

  void _buscar() {
    setState(() {
      _resultados = _doc!.buscar(_q.text);
      _mostrados = 20;
    });
  }

  Future<void> _guardarPdf() async {
    try {
      final d = _doc!;
      final nombre =
          'GRE-${'${d.manifest['edicion']}'.replaceAll(RegExp(r'[^a-zA-Z0-9._-]'), '_')}-${d.versionId.substring(0, 8)}.pdf';
      final destino = await FilePicker.platform.saveFile(
        dialogTitle: 'Guardar fuente GRE original',
        fileName: nombre,
        type: FileType.custom,
        allowedExtensions: ['pdf'],
        bytes: d.pdf,
      );
      if (destino != null && !Platform.isAndroid && !Platform.isIOS)
        await File(destino).writeAsBytes(d.pdf, flush: true);
      if (destino != null && mounted)
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'PDF guardado. Abrir con un lector de PDF en la página indicada.',
            ),
          ),
        );
    } catch (_) {
      if (mounted)
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'No se pudo guardar el PDF. La fuente sigue en la copia local.',
            ),
          ),
        );
    }
  }

  void _fuente(Object? id, {int pagina = 1}) {
    final d = _doc!;
    final r = d.porId('referencias', id);
    final n = r?['paginaPdf'] ?? pagina;
    final ps = d.registros('paginas').where((p) => p['paginaPdf'] == n);
    final etiquetas = ps.isEmpty
        ? <dynamic>[]
        : jsonDecode(ps.first['etiquetasImpresasJson'] ?? '[]') as List;
    final impresas = etiquetas
        .map((e) => e is Map ? e['valor'] ?? e['textoOriginal'] ?? '' : e)
        .join(', ');
    showDialog<void>(
      context: context,
      builder: (c) => AlertDialog(
        title: const Text('Fuente GRE original'),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Página PDF $n · Página impresa: ${impresas.isEmpty ? 'sin numeración' : impresas}',
              ),
              const SizedBox(height: 12),
              SelectableText(r?['textoOriginal'] ?? ''),
              const SizedBox(height: 12),
              const Text(
                'El PDF completo incluye figuras, encabezados y notas. Guardarlo para abrirlo con el lector del dispositivo.',
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: _guardarPdf,
            child: const Text('Guardar PDF original'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(c),
            child: const Text('Cerrar y volver'),
          ),
        ],
      ),
    );
  }

  Widget _botonFuente(Object? id) =>
      TextButton(onPressed: () => _fuente(id), child: const Text('Ver fuente'));
  void _texto(String titulo, List<Map<String, dynamic>> bs,
      {String? aviso, Object? referenciaId, int pagina = 1}) {
    Navigator.push(
      context,
      MaterialPageRoute<void>(
        builder: (_) => Scaffold(
          appBar: AppBar(title: Text(titulo)),
          body: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: bs.length + 1,
            itemBuilder: (_, i) {
              if (i == 0)
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(aviso ??
                            (bs.isEmpty
                                ? 'Contenido vacío: consultar el PDF original.'
                                : 'Texto completo y fuente de cada bloque.')),
                        TextButton(
                            onPressed: () =>
                                _fuente(referenciaId, pagina: pagina),
                            child: const Text('Ver fuente del apartado'))
                      ]),
                );
              final b = bs[i - 1];
              return Card(
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (b['encabezadoOriginal'] != null)
                        Text(
                          b['encabezadoOriginal'],
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                      SelectableText(b['textoOriginal'] ?? ''),
                      _botonFuente(b['referenciaId']),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }

  void _guia(Map<String, dynamic> g) => _texto(
        'Guía ${g['numero']} · ${g['tituloOriginal'] ?? ''}',
        _doc!.bloquesGuia(g['id']),
        referenciaId: g['referenciaId'],
      );
  void _secciones() {
    final ss = _doc!.registros('secciones').toList()
      ..sort((a, b) => (a['orden'] as num).compareTo(b['orden'] as num));
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (c) => SafeArea(
        child: SizedBox(
          height: MediaQuery.sizeOf(c).height * .8,
          child: ListView(
            children: [
              const ListTile(title: Text('Secciones de la GRE')),
              for (final s in ss)
                ListTile(
                  title: Text(s['tituloOriginal']),
                  subtitle: Text('PDF ${s['paginaDesde']}–${s['paginaHasta']}'),
                  onTap: () {
                    Navigator.pop(c);
                    final bs = _doc!
                        .registros('bloques')
                        .where(
                          (b) =>
                              b['seccionId'] == s['id'] && b['guiaId'] == null,
                        )
                        .toList()
                      ..sort(
                        (a, b) => (a['orden'] as num).compareTo(
                          b['orden'] as num,
                        ),
                      );
                    if (bs.isEmpty) {
                      _fuente(null, pagina: s['paginaDesde']);
                    } else {
                      _texto(
                        s['tituloOriginal'],
                        bs,
                        pagina: s['paginaDesde'],
                        aviso:
                            'Texto de la sección. Figuras y tablas conservan el PDF original, página ${s['paginaDesde']}.',
                      );
                    }
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }

  void _abrirFicha(Map<String, dynamic> e) {
    Navigator.push(
        context,
        MaterialPageRoute<void>(
            builder: (_) => Scaffold(
                appBar: AppBar(title: const Text('Material GRE')),
                body: ListView(
                    padding: const EdgeInsets.all(16), children: _ficha(e)))));
  }

  void _tablas() {
    final d = _doc!;
    showModalBottomSheet<void>(
        context: context,
        builder: (c) => SafeArea(
              child: ListView(shrinkWrap: true, children: [
                const ListTile(title: Text('Tablas verdes · lectura manual')),
                for (final t in d.registros('tablas'))
                  ListTile(
                    title: Text(t['tituloOriginal'] ?? t['codigo']),
                    onTap: () {
                      Navigator.pop(c);
                      _tabla(t);
                    },
                  ),
              ]),
            ));
  }

  void _tabla(Map<String, dynamic> t) {
    final d = _doc!;
    final filas = d
        .registros('filas')
        .where((f) => f['tablaId'] == t['id'])
        .toList()
      ..sort((a, b) => (a['orden'] as num).compareTo(b['orden'] as num));
    final celdas = <Object?, List<Map<String, dynamic>>>{};
    for (final v in d.registros('celdas')) {
      (celdas[v['filaId']] ??= []).add(v);
    }
    var mostrados = 20;
    Navigator.push(
        context,
        MaterialPageRoute<void>(
            builder: (_) => Scaffold(
                  appBar:
                      AppBar(title: Text(t['tituloOriginal'] ?? t['codigo'])),
                  body: StatefulBuilder(
                      builder: (c, cambiar) => ListView(
                            padding: const EdgeInsets.all(16),
                            children: [
                              const Text(
                                  'Lectura manual. Comprobar cabeceras, condiciones y notas en el PDF antes de usar una fila. No se seleccionan distancias automáticamente.'),
                              _botonFuente(t['referenciaId']),
                              Text('${filas.length} filas publicadas'),
                              for (final f in filas.take(mostrados))
                                Card(
                                    child: ExpansionTile(
                                  title:
                                      Text(f['etiquetaOriginal'] ?? 'Fila GRE'),
                                  children: [
                                    _botonFuente(f['referenciaId']),
                                    for (final v in celdas[f['id']] ??
                                        <Map<String, dynamic>>[])
                                      ListTile(
                                        title: Text('${v['columnaCodigo']}'
                                            .replaceAll('_', ' ')
                                            .toLowerCase()),
                                        subtitle: Text(
                                            '${v['textoOriginal']} ${v['unidadOriginal'] ?? ''}'),
                                        trailing:
                                            _botonFuente(v['referenciaId']),
                                      ),
                                  ],
                                )),
                              if (mostrados < filas.length)
                                TextButton(
                                    onPressed: () =>
                                        cambiar(() => mostrados += 20),
                                    child: const Text('Más filas')),
                            ],
                          )),
                )));
  }

  void _reglas() {
    final reglas = (_doc!.interpretacion?['reglasDocumentales'] as List? ?? [])
        .cast<Map<String, dynamic>>();
    Navigator.push(
        context,
        MaterialPageRoute<void>(
            builder: (_) => Scaffold(
                  appBar:
                      AppBar(title: const Text('Condiciones documentadas GRE')),
                  body: ListView(padding: const EdgeInsets.all(16), children: [
                    const Text(
                        'Perfil documental estudiado. No es un inventario exhaustivo ni automatiza todas las cláusulas de las guías.'),
                    for (final r in reglas)
                      Card(
                          child: ExpansionTile(
                              title: Text(r['descripcion']),
                              subtitle: Text(r['id']),
                              children: [
                            for (final t in r['condicionesActivacion'] as List)
                              ListTile(title: Text('$t')),
                            for (final t
                                in r['entradasNecesarias'] as List? ?? [])
                              ListTile(title: Text('Dato necesario: $t')),
                            for (final t
                                in r['excepcionesYAlteraciones'] as List? ?? [])
                              ListTile(title: Text('$t')),
                            for (final f in (r['fuentes'] as List)
                                .cast<Map<String, dynamic>>())
                              ListTile(
                                title: Text(f['extractoLiteral'] ??
                                    'Consultar PDF original.'),
                                subtitle: Text(
                                    'PDF ${f['paginaPdf']} · impresa ${f['paginaImpresa']}'),
                                onTap: () => _fuente(
                                    (f['referenciaIds'] as List? ?? [])
                                        .firstOrNull,
                                    pagina: f['paginaPdf']),
                              ),
                            for (final t in r['limites'] as List)
                              ListTile(title: Text('$t')),
                          ])),
                  ]),
                )));
  }

  List<Widget> _ficha(Map<String, dynamic> e) {
    final d = _doc!;
    final g = d.porId('guias', e['guiaId']);
    final filas = d.registros('filas').where((f) {
      final p = jsonDecode(f['condicionesJson'] ?? '{}') as Map;
      return p['identificador'] == e['identificador'] ||
          (p['identificadores'] as List? ?? []).contains(e['identificador']);
    }).toList();
    return [
      Text(
        '${e['identificador'] ?? 'Sin identificador'} · ${e['nombreOriginal']}',
        style: Theme.of(context).textTheme.titleLarge,
      ),
      Text(
        'Resaltado verde: ${e['resaltadoVerde'] == null ? 'no determinado' : e['resaltadoVerde'] ? 'sí' : 'no'} · Sufijo P: ${e['polimerizable'] == null ? 'no determinado' : e['polimerizable'] ? 'sí, bajo ciertas condiciones' : 'no'}',
      ),
      _botonFuente(e['referenciaId']),
      if (g != null)
        FilledButton(
          onPressed: () => _guia(g),
          child: Text('Leer guía ${g['numero']} completa'),
        ),
      if (g != null)
        for (final b in d.bloquesGuia(g['id']).where((b) =>
            normalizarGre('${b['encabezadoOriginal']}').contains('EVACUACION')))
          Card(
              child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                            'Distancias de la guía: lectura del escenario completo'),
                        SelectableText(b['textoOriginal'] ?? ''),
                        _botonFuente(b['referenciaId']),
                      ]))),
      if (g != null && d.interpretacion != null)
        for (final r in (d.interpretacion!['reglasDocumentales'] as List)
            .cast<Map<String, dynamic>>()
            .where((r) => '${r['id']}'.startsWith('GRE24-G${g['numero']}-')))
          Card(
              child: ExpansionTile(title: Text(r['descripcion']), children: [
            for (final t in r['condicionesActivacion'] as List)
              ListTile(title: Text('$t')),
            for (final t in r['entradasNecesarias'] as List? ?? [])
              ListTile(title: Text('Dato necesario: $t')),
            for (final t in r['excepcionesYAlteraciones'] as List? ?? [])
              ListTile(title: Text('$t')),
            for (final f in (r['fuentes'] as List).cast<Map<String, dynamic>>())
              ListTile(
                  title: Text(f['extractoLiteral'] ??
                      'Consultar figura en el PDF original.'),
                  subtitle: Text(
                      'PDF ${f['paginaPdf']} · impresa ${f['paginaImpresa']}'),
                  trailing: TextButton(
                      onPressed: () => _fuente(null, pagina: f['paginaPdf']),
                      child: const Text('Ver fuente'))),
            for (final t in r['limites'] as List) ListTile(title: Text('$t')),
          ])),
      const SizedBox(height: 12),
      const Text(
        'Filas que mencionan este identificador. Comprobar nombre, condiciones y notas en el original. Lectura manual; no se selecciona automáticamente una distancia.',
      ),
      for (final f in filas)
        Card(
          child: ExpansionTile(
            title: Text(f['etiquetaOriginal'] ?? 'Fila GRE'),
            subtitle: Text(
              d.porId('tablas', f['tablaId'])?['tituloOriginal'] ?? '',
            ),
            children: [
              _botonFuente(f['referenciaId']),
              for (final v
                  in d.registros('celdas').where((v) => v['filaId'] == f['id']))
                ListTile(
                  title: Text(
                    '${v['columnaCodigo']}'.replaceAll('_', ' ').toLowerCase(),
                  ),
                  subtitle: Text(
                    '${v['textoOriginal']} ${v['unidadOriginal'] ?? ''}',
                  ),
                  trailing: _botonFuente(v['referenciaId']),
                ),
            ],
          ),
        ),
    ];
  }

  @override
  Widget build(BuildContext context) {
    final d = _doc;
    return Scaffold(
      appBar: AppBar(title: const Text('Consulta GRE · MATPEL')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text(
            'Elegir el nombre específico y leer todas las condiciones. La edición guardada se lee sin conexión; la consulta guiada usa el motor del servidor.',
          ),
          if (_cargando)
            const Padding(
              padding: EdgeInsets.all(16),
              child: LinearProgressIndicator(),
            ),
          if (_error != null)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 12),
              child: Text(
                _error!,
                style: TextStyle(color: Theme.of(context).colorScheme.error),
              ),
            ),
          if (_autorizado)
            FilledButton.icon(
              onPressed: _cargando
                  ? null
                  : () => Navigator.push(
                      context,
                      MaterialPageRoute<void>(
                          builder: (_) => const PantallaConsultaGre())),
              icon: const Icon(Icons.rule),
              label: const Text('Consulta guiada en servidor'),
            ),
          if (_autorizado && d?.interpretacion != null)
            FilledButton.icon(
              onPressed: _cargando
                  ? null
                  : () => Navigator.push(
                      context,
                      MaterialPageRoute<void>(
                          builder: (_) =>
                              PantallaConsultaGre(documentoLocal: d))),
              icon: const Icon(Icons.offline_bolt),
              label: const Text('Consultar sin conexión'),
            ),
          if (_autorizado)
            FilledButton.icon(
              onPressed: _cargando ? null : _descargar,
              icon: const Icon(Icons.download),
              label: const Text('Descargar edición vigente'),
            ),
          if (_autorizado && !_cargando)
            TextButton(
              onPressed: _ediciones,
              child: const Text('Ediciones guardadas'),
            ),
          if (d == null && !_cargando && _autorizado)
            const Text(
              'Todavía no hay copia local. Descargar con conexión antes de consultar sin red.',
            ),
          if (d != null && !_cargando) ...[
            const SizedBox(height: 12),
            Text(
              'GRE ${d.manifest['edicion']} · ${d.manifest['idioma']} · Descarga ${d.manifest['generadoEn']}',
            ),
            const Text(
              'Integridad comprobada. Edición descargada; sin conexión no se verifica si existe una edición posterior.',
            ),
            Wrap(
              spacing: 8,
              children: [
                TextButton(
                  onPressed: _guardarPdf,
                  child: const Text('Guardar PDF original'),
                ),
                TextButton(
                  onPressed: _secciones,
                  child: const Text('Secciones'),
                ),
                TextButton(
                    onPressed: _tablas, child: const Text('Tablas verdes')),
                if (d.interpretacion != null)
                  TextButton(
                      onPressed: _reglas,
                      child: const Text('Condiciones documentadas')),
              ],
            ),
            TextField(
              controller: _q,
              maxLength: 120,
              decoration: const InputDecoration(
                labelText: 'Identificador ONU/NA, nombre o guía',
              ),
              onSubmitted: (_) => _buscar(),
            ),
            FilledButton(onPressed: _buscar, child: const Text('Buscar')),
            if (_resultados != null) ...[
              const SizedBox(height: 16),
              Text('Resultados: ${_resultados!.length}'),
              if (_resultados!.isEmpty)
                const Text(
                  'Sin coincidencias. Material desconocido: consultar guía111.',
                ),
              if (_resultados!.isEmpty &&
                  d.registros('guias').any((g) => g['numero'] == '111'))
                TextButton(
                  onPressed: () => _guia(
                    d
                        .registros('guias')
                        .firstWhere((g) => g['numero'] == '111'),
                  ),
                  child: const Text('Leer guía111'),
                ),
              for (final r in _resultados!.take(_mostrados))
                Card(
                  child: ListTile(
                    title: Text(
                      r['nombreOriginal'] ??
                          'Guía ${r['numero']} · ${r['tituloOriginal'] ?? ''}',
                    ),
                    subtitle: r['identificador'] == null
                        ? null
                        : Text('ONU/NA ${r['identificador']}'),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () {
                      if (r.containsKey('numero')) {
                        _guia(r);
                      } else {
                        _abrirFicha(r);
                      }
                    },
                  ),
                ),
              if (_resultados!.length > _mostrados)
                TextButton(
                  onPressed: () => setState(() => _mostrados += 20),
                  child: const Text('Más resultados'),
                ),
            ],
          ],
        ],
      ),
    );
  }
}
