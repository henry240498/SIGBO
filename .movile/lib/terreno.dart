import 'dart:io';
import 'dart:typed_data';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:url_launcher/url_launcher.dart';

import 'api.dart';
import 'gestion.dart';
import 'offline.dart';
import 'operacion.dart';
import 'store.dart';

void _msg(BuildContext c, String t) => ScaffoldMessenger.of(c).showSnackBar(SnackBar(content: Text(t)));

String _fecha(DateTime d) => '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';

String _fechaHora(dynamic iso) {
  final d = DateTime.tryParse('$iso')?.toLocal();
  if (d == null) return '';
  String p(int n) => n.toString().padLeft(2, '0');
  return '${p(d.day)}/${p(d.month)} ${p(d.hour)}:${p(d.minute)}';
}

// ======================= fotos y firmas =======================

/// Saca una foto con la camara y la sube (o la deja en cola si no hay conexion).
Future<void> adjuntarFoto(BuildContext context, String entidad, String entidadId, String descripcion) async {
  final api = SigboApi();
  XFile? foto;
  try {
    foto = await ImagePicker().pickImage(source: ImageSource.camera, maxWidth: 1600, imageQuality: 80);
  } catch (_) {
    if (context.mounted) _msg(context, 'No se pudo abrir la cámara. Revisa el permiso en Ajustes del celular.');
    return;
  }
  if (foto == null || !context.mounted) return;
  await _subir(context, api, entidad, entidadId, 'FOTO', descripcion, foto.path);
}

Future<void> _subir(BuildContext context, ClienteSigbo api, String entidad, String entidadId, String tipo, String descripcion, String ruta) async {
  try {
    final d = await Offline.ejecutarArchivo(
      api,
      '/adjuntos',
      {'entidad': entidad, 'entidadId': entidadId, 'tipo': tipo, 'descripcion': descripcion, 'claveIdempotencia': claveNueva()},
      ruta,
      '${tipo == 'FIRMA' ? 'Firma' : 'Foto'}: $descripcion',
    );
    if (context.mounted) _msg(context, d == Destino.enviado ? 'Guardada' : 'Sin conexión: queda guardada en el celular y se sube sola.');
  } on ApiException catch (e) {
    if (context.mounted) _msg(context, e.mensaje);
  }
}

/// Pizarra para firmar con el dedo. Devuelve la firma como imagen PNG o null si se cancela.
class PantallaFirma extends StatefulWidget {
  final String titulo;
  const PantallaFirma({super.key, required this.titulo});
  @override
  State<PantallaFirma> createState() => _FirmaState();
}

class _FirmaState extends State<PantallaFirma> {
  final List<List<Offset>> _trazos = [];

  Future<void> _aceptar() async {
    if (_trazos.every((t) => t.length < 2)) return _msg(context, 'Firma primero en el recuadro.');
    const w = 600.0, h = 300.0;
    final caja = context.findRenderObject() as RenderBox?;
    final ancho = (caja?.size.width ?? 300) - 32;
    final k = w / (ancho <= 0 ? 300 : ancho);
    final grabador = ui.PictureRecorder();
    final lienzo = Canvas(grabador, const Rect.fromLTWH(0, 0, w, h));
    lienzo.drawRect(const Rect.fromLTWH(0, 0, w, h), Paint()..color = Colors.white);
    final pincel = Paint()
      ..color = Colors.black
      ..strokeWidth = 3.5
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;
    for (final t in _trazos) {
      for (var i = 1; i < t.length; i++) {
        lienzo.drawLine(t[i - 1] * k, t[i] * k, pincel);
      }
    }
    final img = await grabador.endRecording().toImage(w.toInt(), h.toInt());
    final bytes = (await img.toByteData(format: ui.ImageByteFormat.png))!.buffer.asUint8List();
    final f = File('${Directory.systemTemp.path}/firma_${claveNueva()}.png');
    await f.writeAsBytes(bytes);
    if (mounted) Navigator.pop(context, f.path);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.titulo)),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(children: [
          const Text('Firme con el dedo dentro del recuadro.'),
          const SizedBox(height: 8),
          AspectRatio(
            aspectRatio: 2,
            child: Container(
              decoration: BoxDecoration(color: Colors.white, border: Border.all(color: Colors.black54)),
              child: GestureDetector(
                onPanStart: (d) => setState(() => _trazos.add([d.localPosition])),
                onPanUpdate: (d) => setState(() => _trazos.last.add(d.localPosition)),
                child: ClipRect(child: CustomPaint(painter: _Pintor(_trazos), size: Size.infinite)),
              ),
            ),
          ),
          const SizedBox(height: 12),
          Row(children: [
            Expanded(child: OutlinedButton(onPressed: () => setState(_trazos.clear), child: const Text('Borrar'))),
            const SizedBox(width: 8),
            Expanded(child: FilledButton(onPressed: _aceptar, child: const Text('Aceptar'))),
          ]),
        ]),
      ),
    );
  }
}

class _Pintor extends CustomPainter {
  final List<List<Offset>> trazos;
  _Pintor(this.trazos);
  @override
  void paint(Canvas canvas, Size size) {
    final p = Paint()
      ..color = Colors.black
      ..strokeWidth = 3.5
      ..strokeCap = StrokeCap.round;
    for (final t in trazos) {
      for (var i = 1; i < t.length; i++) {
        canvas.drawLine(t[i - 1], t[i], p);
      }
    }
  }

  @override
  bool shouldRepaint(covariant _Pintor old) => true;
}

Future<void> tomarFirma(BuildContext context, String entidad, String entidadId, String descripcion) async {
  final ruta = await Navigator.push<String>(context, MaterialPageRoute(builder: (_) => PantallaFirma(titulo: descripcion)));
  if (ruta == null || !context.mounted) return;
  await _subir(context, SigboApi(), entidad, entidadId, 'FIRMA', descripcion, ruta);
  try {
    await File(ruta).delete();
  } catch (_) {}
}

/// Fotos y firmas ya subidas de un registro. Ver la imagen requiere conexion (la lista queda guardada).
class PantallaAdjuntos extends StatelessWidget {
  final String entidad;
  final String entidadId;
  final String titulo;
  const PantallaAdjuntos({super.key, required this.entidad, required this.entidadId, required this.titulo});

  Future<void> _ver(BuildContext context, Map a) async {
    try {
      final bytes = await SigboApi().descargar('/adjuntos/${a['id']}/archivo');
      if (!context.mounted) return;
      await showDialog<void>(
        context: context,
        builder: (ctx) => AlertDialog(
          title: Text('${a['tipo'] == 'FIRMA' ? 'Firma' : 'Foto'} · ${_fechaHora(a['tomadoEn'])}'),
          content: InteractiveViewer(child: Image.memory(Uint8List.fromList(bytes))),
          actions: [TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cerrar'))],
        ),
      );
    } catch (e) {
      if (context.mounted) _msg(context, 'Para ver la imagen hace falta conexión con el servidor.');
    }
  }

  @override
  Widget build(BuildContext context) => VistaCacheada(
        titulo: titulo,
        ruta: '/adjuntos?entidad=$entidad&entidadId=$entidadId',
        construir: (c, datos) {
          final l = (datos as List).cast<Map>();
          if (l.isEmpty) return const Padding(padding: EdgeInsets.all(24), child: Text('Todavía no hay fotos ni firmas.'));
          return ListView(padding: const EdgeInsets.all(12), children: [
            for (final a in l)
              Card(
                child: ListTile(
                  leading: Icon(a['tipo'] == 'FIRMA' ? Icons.draw : Icons.photo),
                  title: Text('${a['descripcion'] ?? (a['tipo'] == 'FIRMA' ? 'Firma' : 'Foto')}'),
                  subtitle: Text(_fechaHora(a['tomadoEn'])),
                  onTap: () => _ver(c, a),
                ),
              ),
          ]);
        },
      );
}

// ======================= ruta y victimas =======================

/// Abre la aplicacion de mapas del celular con la direccion (sin enviar nada a ningun servicio propio).
Future<void> abrirRuta(BuildContext context, String direccion) async {
  final q = Uri.encodeComponent(direccion);
  for (final u in [Uri.parse('geo:0,0?q=$q'), Uri.parse('https://www.openstreetmap.org/search?query=$q')]) {
    try {
      if (await launchUrl(u, mode: LaunchMode.externalApplication)) return;
    } catch (_) {}
  }
  if (context.mounted) _msg(context, 'No hay una aplicación de mapas para abrir la dirección.');
}

Future<void> registrarVictimas(BuildContext context, String servicioId) async {
  final cant = TextEditingController(text: '1');
  final obs = TextEditingController();
  String categoria = 'RESCATADA';
  final ok = await showDialog<bool>(
    context: context,
    builder: (ctx) => StatefulBuilder(
      builder: (ctx, set) => AlertDialog(
        title: const Text('Personas afectadas'),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          DropdownButtonFormField<String>(
            initialValue: categoria,
            decoration: const InputDecoration(labelText: 'Categoría'),
            items: const [
              DropdownMenuItem(value: 'RESCATADA', child: Text('Rescatadas')),
              DropdownMenuItem(value: 'HERIDA', child: Text('Heridas')),
              DropdownMenuItem(value: 'FALLECIDA', child: Text('Fallecidas')),
              DropdownMenuItem(value: 'EVACUADA', child: Text('Evacuadas')),
            ],
            onChanged: (v) => set(() => categoria = v ?? categoria),
          ),
          TextField(controller: cant, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Cantidad')),
          TextField(controller: obs, decoration: const InputDecoration(labelText: 'Observación (opcional)')),
        ]),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancelar')),
          FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Registrar')),
        ],
      ),
    ),
  );
  if (ok != true || !context.mounted) return;
  final n = int.tryParse(cant.text.trim());
  if (n == null || n < 1 || n > 500) return _msg(context, 'La cantidad debe ser un número entre 1 y 500.');
  try {
    final d = await Offline.ejecutar(SigboApi(), 'POST', '/siniestros/victimas', {'servicioId': servicioId, 'categoria': categoria, 'cantidad': n, if (obs.text.trim().isNotEmpty) 'observacion': obs.text.trim()}, 'Personas afectadas ($categoria: $n)');
    if (context.mounted) _msg(context, d == Destino.enviado ? 'Registrado' : 'Sin conexión: queda guardado y se envía solo.');
  } on ApiException catch (e) {
    if (context.mounted) _msg(context, e.mensaje);
  }
}

// ======================= ausencias =======================

class PantallaAusencias extends StatefulWidget {
  const PantallaAusencias({super.key});
  @override
  State<PantallaAusencias> createState() => _AusenciasState();
}

class _AusenciasState extends State<PantallaAusencias> {
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

  Future<void> _pedir() async {
    final motivo = TextEditingController();
    DateTime? desde;
    DateTime? hasta;
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, set) => AlertDialog(
          title: const Text('Pedir ausencia'),
          content: Column(mainAxisSize: MainAxisSize.min, children: [
            TextField(controller: motivo, decoration: const InputDecoration(labelText: 'Motivo')),
            TextButton(
              onPressed: () async {
                final d = await showDatePicker(context: ctx, initialDate: DateTime.now().add(const Duration(days: 1)), firstDate: DateTime.now(), lastDate: DateTime.now().add(const Duration(days: 365)));
                if (d != null) set(() => desde = d);
              },
              child: Text(desde == null ? 'Elegir desde' : 'Desde: ${_fecha(desde!)}'),
            ),
            TextButton(
              onPressed: () async {
                final d = await showDatePicker(context: ctx, initialDate: desde ?? DateTime.now().add(const Duration(days: 1)), firstDate: desde ?? DateTime.now(), lastDate: DateTime.now().add(const Duration(days: 365)));
                if (d != null) set(() => hasta = d);
              },
              child: Text(hasta == null ? 'Elegir hasta' : 'Hasta: ${_fecha(hasta!)}'),
            ),
          ]),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancelar')),
            FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Enviar')),
          ],
        ),
      ),
    );
    if (ok != true) return;
    if (motivo.text.trim().length < 3 || desde == null || hasta == null) return _msg(context, 'Completa el motivo y las fechas.');
    if (hasta!.isBefore(desde!)) return _msg(context, 'La fecha final no puede ser anterior a la inicial.');
    await _enviar('POST', '/ausencias', {'desde': _fecha(desde!), 'hasta': _fecha(hasta!), 'motivo': motivo.text.trim()}, 'Ausencia ${_fecha(desde!)} a ${_fecha(hasta!)}');
  }

  Future<void> _enviar(String metodo, String ruta, Map<String, dynamic> cuerpo, String desc) async {
    try {
      final d = await Offline.ejecutar(_api, metodo, ruta, cuerpo, desc);
      if (!mounted) return;
      _msg(context, d == Destino.enviado ? 'Hecho' : 'Sin conexión: queda guardado y se envía solo.');
      await _sync.currentState?.refrescar();
      setState(() => _recarga = UniqueKey());
    } on ApiException catch (e) {
      if (mounted) _msg(context, e.mensaje);
    }
  }

  Future<void> _decidir(Map a, String decision) async {
    String? motivo;
    if (decision == 'RECHAZAR') {
      final c = TextEditingController();
      motivo = await showDialog<String>(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('Rechazar ausencia'),
          content: TextField(controller: c, autofocus: true, decoration: const InputDecoration(labelText: 'Motivo (obligatorio)')),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancelar')),
            FilledButton(onPressed: () => Navigator.pop(ctx, c.text.trim()), child: const Text('Rechazar')),
          ],
        ),
      );
      if (motivo == null || motivo.isEmpty) return;
    }
    await _enviar('PATCH', '/ausencias/${a['id']}/decision', {'decision': decision, if (motivo != null) 'motivo': motivo}, '${decision == 'APROBAR' ? 'Aprobar' : 'Rechazar'} ausencia de ${a['bombero']}');
  }

  @override
  Widget build(BuildContext context) {
    final decide = _permisos.contains('ausencias:decidir');
    const etq = {'SOLICITADA': 'Pendiente', 'APROBADA': 'Aprobada', 'RECHAZADA': 'Rechazada', 'CANCELADA': 'Cancelada'};
    return Stack(children: [
      VistaCacheada(
        key: _recarga,
        titulo: 'Ausencias',
        ruta: '/ausencias',
        construir: (c, datos) {
          final l = (datos as List).cast<Map>();
          return ListView(padding: const EdgeInsets.fromLTRB(12, 12, 12, 88), children: [
            if (l.isEmpty) const Padding(padding: EdgeInsets.all(24), child: Text('No hay ausencias.')),
            for (final a in l)
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('${a['bombero']}', style: const TextStyle(fontWeight: FontWeight.bold)),
                    Text('${a['desde']} al ${a['hasta']} · ${etq['${a['estado']}'] ?? a['estado']}'),
                    Text('${a['motivo']}'),
                    if (a['motivoDecision'] != null) Text('Motivo de la decisión: ${a['motivoDecision']}', style: const TextStyle(fontSize: 12)),
                    Wrap(spacing: 8, children: [
                      if (decide && a['estado'] == 'SOLICITADA') FilledButton(onPressed: () => _decidir(a, 'APROBAR'), child: const Text('Aprobar')),
                      if (decide && a['estado'] == 'SOLICITADA') OutlinedButton(onPressed: () => _decidir(a, 'RECHAZAR'), child: const Text('Rechazar')),
                      if (a['estado'] == 'SOLICITADA' || a['estado'] == 'APROBADA') TextButton(onPressed: () => _enviar('PATCH', '/ausencias/${a['id']}/cancelar', {}, 'Cancelar ausencia de ${a['bombero']}'), child: const Text('Cancelar')),
                    ]),
                  ]),
                ),
              ),
          ]);
        },
      ),
      Positioned(right: 16, bottom: 16, child: FloatingActionButton.extended(onPressed: _pedir, icon: const Icon(Icons.add), label: const Text('Pedir ausencia'))),
      Positioned(left: 0, right: 0, bottom: 0, child: EstadoSync(key: _sync)),
    ]);
  }
}

// ======================= auditoria =======================

class PantallaAuditoria extends StatelessWidget {
  const PantallaAuditoria({super.key});
  @override
  Widget build(BuildContext context) => VistaCacheada(
        titulo: 'Auditoría',
        ruta: '/seguridad/auditoria?pageSize=60',
        construir: (c, datos) {
          final l = ((datos as Map)['items'] as List).cast<Map>();
          if (l.isEmpty) return const Padding(padding: EdgeInsets.all(24), child: Text('Sin registros.'));
          return ListView(children: [
            for (final x in l)
              ListTile(
                dense: true,
                leading: const Icon(Icons.history),
                title: Text('${x['accion']} · ${x['recurso']}'),
                subtitle: Text('${_fechaHora(x['fecha'])}${x['usuarioId'] != null ? ' · usuario ${'${x['usuarioId']}'.substring(0, 8)}' : ''}'),
              ),
          ]);
        },
      );
}
