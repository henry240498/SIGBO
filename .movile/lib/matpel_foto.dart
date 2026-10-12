import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';
import 'package:path_provider/path_provider.dart';

/// Candidatos textuales exactos. No corrige I/1, O/0 ni confirma identidad química.
List<String> candidatosOcrGre(String texto) =>
    RegExp(r'(?<![\p{L}\p{N}])\d{4}(?![\p{L}\p{N}])', unicode: true)
        .allMatches(texto)
        .map((m) => m.group(0)!)
        .toSet()
        .toList();

class LecturaFotoGre {
  final String identificador, textoOriginal;
  const LecturaFotoGre(this.identificador, this.textoOriginal);
}

class PantallaFotoGre extends StatefulWidget {
  final Future<Map<String, dynamic>?> Function(ImageSource)? reconocer;
  const PantallaFotoGre({super.key, this.reconocer});
  @override
  State<PantallaFotoGre> createState() => _FotoState();
}

class _FotoState extends State<PantallaFotoGre> {
  String? _texto, _error;
  bool _ocupado = false;
  int _revision = 0;
  @override
  void dispose() {
    ++_revision;
    super.dispose();
  }

  Future<Map<String, dynamic>?> _reconocer(ImageSource source) async {
    final foto = await ImagePicker().pickImage(
        source: source, maxWidth: 2400, maxHeight: 2400, imageQuality: 95);
    if (foto == null) return null;
    final carpeta =
        await (await getTemporaryDirectory()).createTemp('gre-ocr-');
    try {
      final ruta = '${carpeta.path}/placa.jpg';
      await foto.saveTo(ruta);
      final r = await const MethodChannel('org.cbvc.sigbo/gre-ocr')
          .invokeMapMethod<String, dynamic>('reconocer', {'ruta': ruta});
      return r == null ? null : Map<String, dynamic>.from(r);
    } finally {
      await carpeta.delete(recursive: true);
    }
  }

  Future<void> _leer(ImageSource source) async {
    final actual = ++_revision;
    setState(() {
      _ocupado = true;
      _texto = null;
      _error = null;
    });
    try {
      final r = await (widget.reconocer ?? _reconocer)(source);
      if (!mounted || actual != _revision || r == null) return;
      final t = r['textoOriginal'];
      if (t is! String || t.length > 32000)
        throw const FormatException('Lectura de foto inválida.');
      setState(() => _texto = t);
    } on PlatformException catch (e) {
      if (mounted && actual == _revision)
        setState(() => _error = e.message ?? 'No se pudo leer la foto.');
    } catch (_) {
      if (mounted && actual == _revision)
        setState(() => _error =
            'No se pudo leer la foto. Podés ingresar el identificador manualmente.');
    } finally {
      if (mounted && actual == _revision) setState(() => _ocupado = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text('Leer texto de una placa')),
        body: ListView(padding: const EdgeInsets.all(16), children: [
          const Text(
              'Fotografiá únicamente la placa o etiqueta, desde una posición segura. El reconocimiento se hace en el teléfono; la foto no se sube ni se registra como evidencia del servicio.'),
          const SizedBox(height: 12),
          const Text(
              'Los números leídos son candidatos. Comprobá el texto en la placa y elegí el nombre específico en GRE. El OCR no confirma la sustancia.'),
          Wrap(spacing: 12, children: [
            FilledButton.icon(
                onPressed: _ocupado ? null : () => _leer(ImageSource.camera),
                icon: const Icon(Icons.camera_alt),
                label: const Text('Tomar foto')),
            OutlinedButton.icon(
                onPressed: _ocupado ? null : () => _leer(ImageSource.gallery),
                icon: const Icon(Icons.photo_library),
                label: const Text('Elegir foto')),
          ]),
          if (_ocupado)
            const Padding(
                padding: EdgeInsets.all(16), child: LinearProgressIndicator()),
          if (_error != null)
            Text(_error!,
                style: TextStyle(color: Theme.of(context).colorScheme.error)),
          if (_texto != null) ...[
            const SizedBox(height: 16),
            const Text('Texto original leído · no confirmado'),
            SelectableText(
                _texto!.isEmpty ? 'No se pudo reconocer texto.' : _texto!),
            const SizedBox(height: 16),
            if (candidatosOcrGre(_texto!).isEmpty)
              const Text(
                  'No se encontró un identificador de cuatro dígitos. Ingresalo manualmente en la consulta.'),
            for (final id in candidatosOcrGre(_texto!))
              ListTile(
                title: Text('Candidato $id'),
                subtitle: const Text(
                    'Buscar coincidencias; identidad todavía no confirmada'),
                trailing: const Icon(Icons.search),
                onTap: () =>
                    Navigator.pop(context, LecturaFotoGre(id, _texto!)),
              ),
          ],
        ]),
      );
}
