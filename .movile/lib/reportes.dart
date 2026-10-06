import 'dart:io';

import 'package:flutter/material.dart';
import 'package:package_info_plus/package_info_plus.dart';

import 'api.dart';
import 'offline.dart';

/// Buzón de errores y sugerencias. El texto llega al servidor como archivo de texto plano
/// (backend/storage/reportes). Funciona sin conexión: si no hay red queda en la cola y se
/// envía solo; el id se genera acá, así que un reenvío no duplica el reporte.
class PantallaReportar extends StatefulWidget {
  const PantallaReportar({super.key, this.pantalla});

  /// Pantalla desde la que se abrió (opcional): va prellenada.
  final String? pantalla;

  @override
  State<PantallaReportar> createState() => _ReportarState();
}

const _tipos = {
  'ERROR': 'Algo no funciona (error)',
  'SUGERENCIA': 'Una idea o mejora (sugerencia)',
  'OTRO': 'Otro comentario',
};

const maxMensaje = 4000;

/// Cuerpo que se envía a POST /reportes. Aparte del widget para poder probarlo.
Map<String, dynamic> cuerpoDeReporte({
  required String tipo,
  required String mensaje,
  String titulo = '',
  String pantalla = '',
  String version = '',
  String dispositivo = '',
  String? id,
}) {
  String? sinVacio(String s) => s.trim().isEmpty ? null : s.trim();
  return {
    'tipo': tipo,
    'origen': 'APP_MOVIL',
    'mensaje': mensaje.trim().length > maxMensaje ? mensaje.trim().substring(0, maxMensaje) : mensaje.trim(),
    if (sinVacio(titulo) != null) 'titulo': sinVacio(titulo),
    if (sinVacio(pantalla) != null) 'pantalla': sinVacio(pantalla),
    if (sinVacio(version) != null) 'version': sinVacio(version),
    if (sinVacio(dispositivo) != null) 'dispositivo': sinVacio(dispositivo),
    'id': id ?? claveNueva(),
  };
}

class _ReportarState extends State<PantallaReportar> {
  final _api = SigboApi();
  final _titulo = TextEditingController();
  final _mensaje = TextEditingController();
  late final TextEditingController _pantalla;
  String _tipo = 'ERROR';
  String _version = '';
  bool _enviando = false;
  String? _error;
  String? _resultado;

  @override
  void initState() {
    super.initState();
    _pantalla = TextEditingController(text: widget.pantalla ?? '');
    PackageInfo.fromPlatform().then((p) {
      if (mounted) setState(() => _version = '${p.version}+${p.buildNumber}');
    }).catchError((_) {});
  }

  @override
  void dispose() {
    _titulo.dispose();
    _mensaje.dispose();
    _pantalla.dispose();
    super.dispose();
  }

  Future<void> _enviar() async {
    final texto = _mensaje.text.trim();
    if (texto.length < 5) {
      setState(() => _error = 'Contanos un poco más: el mensaje necesita al menos 5 caracteres.');
      return;
    }
    setState(() {
      _enviando = true;
      _error = null;
      _resultado = null;
    });
    try {
      final cuerpo = cuerpoDeReporte(
        tipo: _tipo,
        mensaje: texto,
        titulo: _titulo.text,
        pantalla: _pantalla.text,
        version: _version,
        dispositivo: 'Android ${Platform.operatingSystemVersion}',
      );
      final destino = await Offline.ejecutar(_api, 'POST', '/reportes', cuerpo, 'Reporte: ${_tipos[_tipo]}');
      if (!mounted) return;
      setState(() {
        _resultado = destino == Destino.enviado
            ? '¡Gracias! Tu reporte quedó guardado en el servidor.'
            : 'Sin conexión: tu reporte quedó guardado en el celular y se envía solo cuando vuelva la red.';
        _titulo.clear();
        _mensaje.clear();
      });
    } on ApiException catch (e) {
      if (mounted) setState(() => _error = e.mensaje);
    } catch (_) {
      if (mounted) setState(() => _error = 'No se pudo enviar el reporte. Intentá de nuevo.');
    } finally {
      if (mounted) setState(() => _enviando = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Reportar')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text(
            'Avisanos de un error o proponé una mejora de la app o del sistema. Queda guardado como texto en el servidor.',
            style: TextStyle(fontSize: 14),
          ),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
            initialValue: _tipo,
            decoration: const InputDecoration(labelText: '¿Qué querés contarnos?'),
            items: [for (final e in _tipos.entries) DropdownMenuItem(value: e.key, child: Text(e.value))],
            onChanged: (v) => setState(() => _tipo = v ?? 'ERROR'),
          ),
          const SizedBox(height: 8),
          TextField(controller: _titulo, maxLength: 120, decoration: const InputDecoration(labelText: 'Título (opcional)')),
          TextField(controller: _pantalla, maxLength: 120, decoration: const InputDecoration(labelText: '¿En qué pantalla pasó? (opcional)')),
          TextField(
            controller: _mensaje,
            maxLength: maxMensaje,
            minLines: 5,
            maxLines: 10,
            textCapitalization: TextCapitalization.sentences,
            decoration: const InputDecoration(labelText: 'Mensaje', alignLabelWithHint: true),
          ),
          if (_error != null)
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error), semanticsLabel: 'Error: $_error'),
            ),
          if (_resultado != null) Padding(padding: const EdgeInsets.only(top: 8), child: Text(_resultado!)),
          const SizedBox(height: 12),
          FilledButton.icon(
            onPressed: _enviando ? null : _enviar,
            icon: const Icon(Icons.send),
            label: Text(_enviando ? 'Enviando…' : 'Enviar reporte'),
          ),
        ],
      ),
    );
  }
}
