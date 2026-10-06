import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:qr_code_scanner_plus/qr_code_scanner_plus.dart';

import 'conexion.dart';
import 'offline.dart';
import 'store.dart';

/// Conectar el celular con el servidor SIGBO: escanear el QR que muestra la PC
/// (conectar-celulares.bat) o escribir la direccion; se comprueba antes de guardar.
class PantallaServidor extends StatefulWidget {
  const PantallaServidor({super.key});
  @override
  State<PantallaServidor> createState() => _ServidorState();
}

class _ServidorState extends State<PantallaServidor> {
  final _campo = TextEditingController();
  String _actual = '';
  bool _configurado = false;
  ResultadoPrueba? _resultado;
  bool _probando = false;
  bool _escaneando = false;
  bool _camara = false;

  @override
  void initState() {
    super.initState();
    () async {
      _actual = await SigboConfig.baseUrl();
      _configurado = await SigboConfig.estaConfigurado();
      if (_configurado) _campo.text = _actual;
      if (mounted) setState(() {});
    }();
  }

  Future<void> _probar() async {
    final url = normalizarUrlServidor(_campo.text);
    if (url == null) {
      setState(() => _resultado = const ResultadoPrueba(false, 'Escribe la dirección de la PC, por ejemplo 192.168.1.10:3001'));
      return;
    }
    setState(() {
      _probando = true;
      _resultado = null;
      _campo.text = url;
    });
    final r = await probarServidor(url);
    if (mounted) {
      setState(() {
        _resultado = r;
        _probando = false;
      });
    }
  }

  Future<void> _guardar() async {
    final url = normalizarUrlServidor(_campo.text);
    if (url == null) return _probar();
    final cambia = url != _actual;
    if (cambia) {
      final pend = await Offline.pendientes();
      if (pend > 0 && mounted) {
        final seguir = await showDialog<bool>(
          context: context,
          builder: (ctx) => AlertDialog(
            title: const Text('Hay operaciones sin enviar'),
            content: Text('Tenés $pend operación(es) guardadas que todavía no llegaron al servidor actual. Si cambias de servidor se descartan. ¿Cambiar igual?'),
            actions: [
              TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('No, conservarlas')),
              FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Cambiar y descartar')),
            ],
          ),
        );
        if (seguir != true) return;
      }
      // Otro servidor = otras cuentas y otros datos: la sesion y las copias locales no sirven.
      await Offline.borrarTodo();
      await TokenStore.limpiar();
    }
    await SigboConfig.setBaseUrl(url);
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(cambia ? 'Servidor guardado. Inicia sesión de nuevo.' : 'Servidor guardado.')));
    Navigator.of(context).popUntil((r) => r.isFirst);
    // la raiz decide si muestra el login o la pantalla principal
    Navigator.of(context).pushReplacementNamed('/');
  }

  Future<void> _abrirCamara() async {
    final s = await Permission.camera.request();
    if (!mounted) return;
    if (!s.isGranted) {
      setState(() => _resultado = const ResultadoPrueba(false, 'Falta el permiso de la cámara. Activalo en Ajustes del celular o escribe la dirección.'));
      return;
    }
    setState(() {
      _camara = true;
      _escaneando = true;
    });
  }

  void _leido(String texto) {
    if (!_escaneando) return;
    final url = urlDeQrServidor(texto);
    if (url == null) {
      setState(() => _resultado = const ResultadoPrueba(false, 'Ese QR no es el de conexión de SIGBO. Usa el que muestra la PC (conectar-celulares.bat).'));
      return;
    }
    setState(() {
      _escaneando = false;
      _campo.text = url;
    });
    _probar();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Conectar con el servidor')),
      body: ListView(padding: const EdgeInsets.all(16), children: [
        Text(_configurado ? 'Servidor actual: $_actual' : 'Todavía no hay un servidor configurado.', style: const TextStyle(fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        const Text('1. En la PC del cuartel abre «conectar-celulares.bat»: muestra un código QR.\n2. Con el celular en el mismo WiFi, toca «Escanear QR».\n3. Toca «Guardar» e inicia sesión.', style: TextStyle(fontSize: 13)),
        const SizedBox(height: 12),
        if (_escaneando && _camara)
          SizedBox(
            height: 280,
            child: QRView(
              key: GlobalKey(debugLabel: 'qr-servidor'),
              onQRViewCreated: (c) => c.scannedDataStream.listen((d) {
                final t = d.code;
                if (t != null) _leido(t);
              }),
              overlay: QrScannerOverlayShape(borderColor: Colors.red, borderRadius: 8, borderLength: 28, borderWidth: 8, cutOutSize: 220),
            ),
          )
        else
          FilledButton.icon(onPressed: _abrirCamara, icon: const Icon(Icons.qr_code_scanner), label: const Text('Escanear QR')),
        const SizedBox(height: 16),
        TextField(
          controller: _campo,
          keyboardType: TextInputType.url,
          decoration: const InputDecoration(labelText: 'O escribe la dirección de la PC', hintText: '192.168.1.10:3001'),
          onChanged: (_) => setState(() => _resultado = null),
        ),
        const SizedBox(height: 8),
        Row(children: [
          Expanded(child: OutlinedButton(onPressed: _probando ? null : _probar, child: Text(_probando ? 'Probando…' : 'Probar conexión'))),
          const SizedBox(width: 8),
          Expanded(child: FilledButton(onPressed: _resultado?.ok == true ? _guardar : null, child: const Text('Guardar'))),
        ]),
        if (_resultado != null)
          Padding(
            padding: const EdgeInsets.only(top: 12),
            child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Icon(_resultado!.ok ? Icons.check_circle : Icons.error, color: _resultado!.ok ? Colors.green : Colors.red),
              const SizedBox(width: 8),
              Expanded(child: Text(_resultado!.mensaje)),
            ]),
          ),
        const SizedBox(height: 12),
        const Text('Solo se puede guardar un servidor que respondió a la prueba.', style: TextStyle(fontSize: 12)),
      ]),
    );
  }
}
