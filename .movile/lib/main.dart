import 'dart:async';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_foreground_task/flutter_foreground_task.dart';
import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:uuid/uuid.dart';

import 'api.dart';
import 'background.dart';
import 'models.dart';
import 'notifier.dart';
import 'outbox.dart';
import 'siren.dart';
import 'store.dart';

final _navKey = GlobalKey<NavigatorState>();

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await AlertaNotifier.inicializar();
  await programarSondeo();
  FlutterForegroundTask.initCommunicationPort();
  // Al tocar un aviso (o full-screen) se abre la pantalla de alerta.
  AlertaNotifier.alTocar = (id) {
    _navKey.currentState
        ?.pushNamedAndRemoveUntil('/alerta', (_) => false, arguments: id);
  };
  runApp(const SigboApp());
}

class SigboApp extends StatelessWidget {
  const SigboApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SIGBO Alertas',
      navigatorKey: _navKey,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF0F3B70)),
        useMaterial3: true,
      ),
      routes: {
        '/': (_) => const Raiz(),
        '/alerta': (_) => const PantallaAlerta(),
        '/ajustes': (_) => const PantallaAjustes(),
      },
      initialRoute: '/',
    );
  }
}

class Raiz extends StatefulWidget {
  const Raiz({super.key});
  @override
  State<Raiz> createState() => _RaizState();
}

class _RaizState extends State<Raiz> {
  bool? _sesion;

  @override
  void initState() {
    super.initState();
    TokenStore.haySesion().then((v) => setState(() => _sesion = v));
    _pedirPermisoAvisos();
  }

  Future<void> _pedirPermisoAvisos() async {
    final p = await Permission.notification.status;
    if (!p.isGranted) await Permission.notification.request();
  }

  @override
  Widget build(BuildContext context) {
    if (_sesion == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    return _sesion! ? const PantallaPrincipal() : const PantallaLogin();
  }
}

// ---------------- LOGIN ----------------

class PantallaLogin extends StatefulWidget {
  const PantallaLogin({super.key});
  @override
  State<PantallaLogin> createState() => _LoginState();
}

class _LoginState extends State<PantallaLogin> {
  final _api = SigboApi();
  final _usu = TextEditingController();
  final _cla = TextEditingController();
  String _msg = '';
  bool _cargando = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('SIGBO-CBVC · Bomberos')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            TextField(controller: _usu, decoration: const InputDecoration(labelText: 'Usuario o correo')),
            TextField(controller: _cla, decoration: const InputDecoration(labelText: 'Contrasena'), obscureText: true),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _cargando
                  ? null
                  : () async {
                      setState(() {
                        _cargando = true;
                        _msg = 'Conectando...';
                      });
                      try {
                        final u = await _api.login(
                            _usu.text.trim(), _cla.text);
                        if (!mounted) return;
                        Navigator.pushReplacement(
                            context,
                            MaterialPageRoute(
                                builder: (_) =>
                                    const PantallaPrincipal()));
                        ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Hola, ${u.username}')));
                      } catch (e) {
                        setState(() => _msg = 'Error: $e');
                      } finally {
                        if (mounted) setState(() => _cargando = false);
                      }
                    },
              child: const Text('Ingresar'),
            ),
            const SizedBox(height: 8),
            Text(_msg, style: const TextStyle(color: Colors.red)),
          ],
        ),
      ),
    );
  }
}

// ---------------- PRINCIPAL ----------------

class PantallaPrincipal extends StatefulWidget {
  const PantallaPrincipal({super.key});
  @override
  State<PantallaPrincipal> createState() => _PrincipalState();
}

class _PrincipalState extends State<PantallaPrincipal> {
  final _api = SigboApi();
  List<Alerta> _pendientes = [];
  String _estado = '';
  String _usuario = '';
  Set<String> _permisos = {};
  bool _bloqueado = false;
  Timer? _temporizador;
  StreamSubscription<Alerta>? _sse;
  final _vistos = <String>{};
  bool _primera = true;
  // Cola offline: solicitudes que se enviaran solas al volver la señal.
  List<SolicitudEncolada> _cola = [];
  bool _sinConexion = false;
  String _datosHora = '';

  bool get _puedeAtender => _permisos.contains('servicios:editar');

  @override
  void initState() {
    super.initState();
    _cargarSesion();
    _refrescar();
    // Tiempo real: SSE del backend; respaldo: sondeo cada 15 s.
    _sse = _api.escucharSse((a) {
      if (a.estado == 'PENDIENTE') _refrescar();
    });
    _temporizador = Timer.periodic(const Duration(seconds: 15), (_) => _refrescar());
  }

  @override
  void dispose() {
    _temporizador?.cancel();
    _sse?.cancel();
    super.dispose();
  }

  Future<void> _cargarSesion() async {
    _usuario = await TokenStore.username();
    _permisos = await TokenStore.permisos();
    if (mounted) setState(() {});
  }

  Future<void> _refrescar() async {
    // 1) Enviar lo que quedo en cola offline (misma clave: sin duplicar).
    try {
      final f = await Outbox.enviarPendientes();
      if (f.enviadas > 0 && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text(
                'Conexion recuperada: ${f.enviadas} solicitud(es) enviada(s).')));
      }
    } catch (_) {}
    if (mounted) {
      setState(() {});
      _cola = await Outbox.leerCola();
      if (mounted) setState(() {});
    }
    // 2) Lista actual (o cache si no hay red).
    try {
      final lista = await _api.pendientes();
      await Outbox.guardarCache(lista);
      final nuevas = lista.where((a) => !_vistos.contains(a.id)).toList();
      if (_primera) {
        _vistos.addAll(lista.map((a) => a.id));
        _primera = false;
      } else {
        for (final a in nuevas) {
          await AlertaNotifier.notificar(a);
          _vistos.add(a.id);
        }
      }
      if (mounted) {
        setState(() {
          _pendientes = lista;
          _sinConexion = false;
          _datosHora = '';
          if (_estado.startsWith('Sin conexion')) _estado = '';
        });
      }
    } catch (e) {
      final cache = await Outbox.leerCache();
      final ts = await Outbox.cacheTs();
      if (mounted) {
        setState(() {
          _pendientes = cache;
          _sinConexion = true;
          _datosHora = ts > 0
              ? 'Ultimos datos: ${AlertaNotifier.fechaHora(DateTime.fromMillisecondsSinceEpoch(ts).toUtc().toIso8601String())}'
              : 'Sin datos guardados todavia.';
          _estado = 'Sin conexion: $e';
        });
      }
    }
  }

  Future<void> _enviar(String tipo) async {
    // Anti-doble-tap local (3 s) + idempotencia del servidor.
    if (_bloqueado) return;
    setState(() {
      _bloqueado = true;
      _estado = 'Enviando solicitud...';
    });
    double? lat, lng;
    if (await Prefs.ubicacion()) {
      final pos = await _ubicacion();
      lat = pos?.latitude;
      lng = pos?.longitude;
    }
    // La clave se genera ANTES de enviar: si no hay red, la solicitud
    // queda en cola con la misma clave y no se duplica al reintentar.
    final s = SolicitudEncolada(
      tipo: tipo,
      lat: lat,
      lng: lng,
      clave: const Uuid().v4(),
      creadaEn: DateTime.now().toIso8601String(),
    );
    try {
      final r = await _api.crearAlerta(tipo,
          lat: lat, lng: lng, clave: s.clave);
      if (!mounted) return;
      setState(() => _estado = r.duplicada
          ? 'Ya existe una solicitud igual (no se duplico).'
          : 'Solicitud registrada: ${r.alerta.tituloTipo()} · ${AlertaNotifier.fechaHora(r.alerta.creadoEn)}');
      if (!r.duplicada) await AlertaNotifier.notificar(r.alerta);
      await _refrescar();
    } catch (e) {
      if (mounted) {
        // Sin red: se guarda en cola y se envia sola al volver la señal.
        await Outbox.encolar(s);
        final cola = await Outbox.leerCola();
        setState(() {
          _cola = cola;
          _estado =
              'Sin conexion: la solicitud quedo en cola (${cola.length}) y se enviara automaticamente.';
        });
      }
    } finally {
      await Future.delayed(const Duration(seconds: 3));
      if (mounted) setState(() => _bloqueado = false);
    }
  }

  Future<Position?> _ubicacion() async {
    try {
      var p = await Geolocator.checkPermission();
      if (p == LocationPermission.denied) {
        p = await Geolocator.requestPermission();
      }
      if (p == LocationPermission.denied ||
          p == LocationPermission.deniedForever) {
        return null;
      }
      return await Geolocator.getLastKnownPosition() ??
          await Geolocator.getCurrentPosition(
              desiredAccuracy: LocationAccuracy.low);
    } catch (_) {
      return null;
    }
  }

  Future<void> _cambiarEstado(Alerta a, String estado) async {
    final motivo = TextEditingController();
    final ok = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: Text('$estado: ${a.tituloTipo()}'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Solicito: ${a.solicitanteNombre}'),
            TextField(controller: motivo,
                decoration:
                    const InputDecoration(labelText: 'Motivo (opcional)')),
          ],
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Volver')),
          ElevatedButton(
              onPressed: () => Navigator.pop(context, true),
              child: const Text('Confirmar')),
        ],
      ),
    );
    if (ok != true) return;
    try {
      await _api.cambiarEstado(a.id, estado, motivo: motivo.text);
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('Alerta $estado')));
      }
      await _refrescar();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('SIGBO Alertas'),
        actions: [
          IconButton(
              icon: const Icon(Icons.settings),
              onPressed: () => Navigator.pushNamed(context, '/ajustes')),
          IconButton(
              icon: const Icon(Icons.logout),
              onPressed: () async {
                await _api.logout();
                await Sirena.detener();
                if (!mounted) return;
                Navigator.pushAndRemoveUntil(
                    context,
                    MaterialPageRoute(builder: (_) => const PantallaLogin()),
                    (_) => false);
              }),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text('Conectado como $_usuario'),
          if (_estado.isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(_estado),
          ],
          if (_cola.isNotEmpty) ...[
            const SizedBox(height: 8),
            Card(
              color: Colors.amber[100],
              child: ListTile(
                leading:
                    const Icon(Icons.cloud_off, color: Colors.black87),
                title: Text(
                    'Pendientes de envio: ${_cola.length} (se enviaran solas al volver la señal)'),
                trailing: IconButton(
                  icon: const Icon(Icons.refresh),
                  tooltip: 'Reintentar ahora',
                  onPressed: () => _refrescar(),
                ),
              ),
            ),
          ],
          if (_sinConexion && _datosHora.isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(_datosHora,
                style: const TextStyle(fontStyle: FontStyle.italic)),
          ],
          const SizedBox(height: 12),
          SizedBox(
            height: 72,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red[800],
                  foregroundColor: Colors.white,
                  textStyle: const TextStyle(fontSize: 20)),
              onPressed: _bloqueado ? null : () => _enviar('SOLICITUD_APOYO'),
              child: const Text('SOLICITAR APOYO'),
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 72,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1565C0),
                  foregroundColor: Colors.white,
                  textStyle: const TextStyle(fontSize: 20)),
              onPressed: _bloqueado ? null : () => _enviar('SOLICITUD_CHOFER'),
              child: const Text('SOLICITAR CHOFER'),
            ),
          ),
          const SizedBox(height: 16),
          Text('Pendientes (${_pendientes.length})',
              style: Theme.of(context).textTheme.titleMedium),
          for (final a in _pendientes)
            Card(
              child: ListTile(
                title: Text(a.tituloTipo(),
                    style: const TextStyle(fontWeight: FontWeight.bold)),
                subtitle: Text(
                    'Solicita: ${a.solicitanteNombre}\nFecha/hora: ${AlertaNotifier.fechaHora(a.creadoEn)}'
                    '${(a.detalle ?? '').isNotEmpty ? '\nDetalle: ${a.detalle}' : ''}'),
                isThreeLine: true,
                trailing: _puedeAtender
                    ? Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          IconButton(
                              icon: const Icon(Icons.check,
                                  color: Colors.green),
                              tooltip: 'Atendida',
                              onPressed: () =>
                                  _cambiarEstado(a, 'ATENDIDA')),
                          IconButton(
                              icon:
                                  const Icon(Icons.close, color: Colors.red),
                              tooltip: 'Cancelar',
                              onPressed: () =>
                                  _cambiarEstado(a, 'CANCELADA')),
                        ],
                      )
                    : null,
                onTap: () => Navigator.pushNamed(context, '/alerta',
                    arguments: a.id),
              ),
            ),
        ],
      ),
    );
  }
}

// ---------------- PANTALLA DE ALERTA ----------------

class PantallaAlerta extends StatefulWidget {
  const PantallaAlerta({super.key});
  @override
  State<PantallaAlerta> createState() => _AlertaState();
}

class _AlertaState extends State<PantallaAlerta> {
  final _api = SigboApi();
  Alerta? _alerta;
  bool _puede = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final id = ModalRoute.of(context)?.settings.arguments as String?;
    if (id != null && _alerta == null) _cargar(id);
  }

  Future<void> _cargar(String id) async {
    try {
      final perms = await TokenStore.permisos();
      final lista = await _api.pendientes();
      final a = lista.firstWhere((e) => e.id == id,
          orElse: () => Alerta(
              id: id,
              tipo: 'ALERTA',
              estado: 'PENDIENTE',
              solicitanteNombre: 'Bombero',
              creadoEn: DateTime.now().toIso8601String()));
      if (mounted) {
        setState(() {
          _alerta = a;
          _puede = perms.contains('servicios:editar');
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() => _alerta = Alerta(
            id: id,
            tipo: 'ALERTA',
            estado: 'PENDIENTE',
            solicitanteNombre: 'Bombero',
            creadoEn: DateTime.now().toIso8601String()));
      }
    }
    await Sirena.iniciar();
  }

  Future<void> _resolver(String estado) async {
    final id = _alerta?.id;
    if (id == null) return;
    try {
      await _api.cambiarEstado(id, estado,
          motivo: 'Resuelto desde pantalla de alerta movil');
      await AlertaNotifier.limpiar();
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('Alerta $estado')));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    } finally {
      await Sirena.detener();
      if (mounted) Navigator.pop(context);
    }
  }

  @override
  void dispose() {
    Sirena.detener();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final a = _alerta;
    return Scaffold(
      backgroundColor: Colors.red[800],
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text('EMERGENCIA · BOMBEROS',
                  style: TextStyle(color: Colors.white, fontSize: 22)),
              const SizedBox(height: 8),
              Text(a?.tituloTipo() ?? 'ALERTA',
                  style: const TextStyle(
                      color: Colors.white,
                      fontSize: 32,
                      fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Text(
                  'Solicita: ${a?.solicitanteNombre ?? '...'}\nFecha/hora: ${a == null ? '...' : AlertaNotifier.fechaHora(a.creadoEn)}'
                  '${((a?.detalle ?? '').isNotEmpty) ? '\nDetalle: ${a!.detalle}' : ''}',
                  style: const TextStyle(color: Colors.white, fontSize: 18)),
              const Spacer(),
              if (_puede) ...[
                ElevatedButton(
                    onPressed: () => _resolver('ATENDIDA'),
                    child: const Text('MARCAR ATENDIDA')),
                const SizedBox(height: 8),
                ElevatedButton(
                    onPressed: () => _resolver('CANCELADA'),
                    child: const Text('CANCELAR ALERTA')),
                const SizedBox(height: 8),
              ],
              OutlinedButton(
                style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.white,
                    side: const BorderSide(color: Colors.white)),
                onPressed: () async {
                  await Sirena.detener();
                  if (mounted) Navigator.pop(context);
                },
                child: const Text('Enterado (silenciar)'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ---------------- AJUSTES ----------------

class PantallaAjustes extends StatefulWidget {
  const PantallaAjustes({super.key});
  @override
  State<PantallaAjustes> createState() => _AjustesState();
}

class _AjustesState extends State<PantallaAjustes> {
  final _url = TextEditingController();
  final _texto = TextEditingController();
  final _intervalo = TextEditingController();
  bool _sonido = true;
  bool _vibrar = true;
  bool _monitoreo = false;
  bool _ubi = false;
  int _color = 0xFFC62828;

  @override
  void initState() {
    super.initState();
    _cargar();
  }

  Future<void> _cargar() async {
    _url.text = await SigboConfig.baseUrl();
    _texto.text = await Prefs.encabezado();
    _intervalo.text = (await Prefs.intervaloSeg()).toString();
    _sonido = await Prefs.sonido();
    _vibrar = await Prefs.vibracion();
    _monitoreo = await Prefs.monitoreo();
    _ubi = await Prefs.ubicacion();
    _color = await Prefs.color();
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Ajustes')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('Servidor', style: TextStyle(fontWeight: FontWeight.bold)),
          TextField(controller: _url,
              decoration: const InputDecoration(
                  hintText: 'https://servidor/api/v1')),
          Row(
            children: [
              Expanded(
                child: ElevatedButton(
                    onPressed: () async {
                      try {
                        await SigboConfig.setBaseUrl(_url.text);
                        if (!mounted) return;
                        ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                                content: Text(
                                    'URL guardada. Reinicie el monitoreo.')));
                      } catch (e) {
                        if (!mounted) return;
                        ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('$e')));
                      }
                    },
                    child: const Text('Guardar URL')),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: OutlinedButton(
                    onPressed: () async {
                      await SigboConfig.restablecer();
                      _url.text = await SigboConfig.baseUrl();
                      setState(() {});
                    },
                    child: const Text('Restablecer')),
              ),
            ],
          ),
          const Text(
              'Local Henry: http://IP-DE-SU-PC:3001/api/v1 · Emulador: http://10.0.2.2:3001/api/v1 · Tunel: la https de cloudflared + /api/v1',
              style: TextStyle(fontSize: 12)),
          const Divider(),
          const Text('Aviso de emergencia',
              style: TextStyle(fontWeight: FontWeight.bold)),
          SwitchListTile(
              title: const Text('Sonido fuerte'),
              value: _sonido,
              onChanged: (v) async {
                await Prefs.setSonido(v);
                await AlertaNotifier.asegurarCanales();
                setState(() => _sonido = v);
              }),
          ListTile(
            title: const Text('Elegir tono de alarma'),
            trailing: const Icon(Icons.music_note),
            onTap: () async {
              final r = await FilePicker.platform.pickFiles(type: FileType.audio);
              final uri = r?.files.single.path;
              if (uri != null && uri.isNotEmpty) {
                // En Android el canal usa la URI del archivo elegido.
                await Prefs.setTonoUri(Uri.file(uri).toString());
                await AlertaNotifier.asegurarCanales();
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Tono guardado')));
                }
              }
            },
          ),
          SwitchListTile(
              title: const Text('Vibracion'),
              value: _vibrar,
              onChanged: (v) async {
                await Prefs.setVibracion(v);
                await AlertaNotifier.asegurarCanales();
                setState(() => _vibrar = v);
              }),
          const Text('Color del aviso'),
          Wrap(
            spacing: 8,
            children: {
              'Rojo': 0xFFC62828,
              'Azul': 0xFF0F3B70,
              'Ambar': 0xFFEF6C00,
              'Verde': 0xFF2E7D32,
              'Violeta': 0xFF6A1B9A,
            }
                .entries
                .map((e) => ChoiceChip(
                      label: Text(e.key,
                          style: const TextStyle(color: Colors.white)),
                      selected: _color == e.value,
                      selectedColor: Color(e.value),
                      backgroundColor: Color(e.value).withValues(alpha: 0.5),
                      onSelected: (_) async {
                        await Prefs.setColor(e.value);
                        await AlertaNotifier.asegurarCanales();
                        setState(() => _color = e.value);
                      },
                    ))
                .toList(),
          ),
          TextField(controller: _texto,
              decoration:
                  const InputDecoration(labelText: 'Texto del aviso')),
          ElevatedButton(
              onPressed: () async {
                await Prefs.setEncabezado(_texto.text.trim().isEmpty
                    ? 'EMERGENCIA · BOMBEROS'
                    : _texto.text.trim());
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Texto guardado')));
                }
              },
              child: const Text('Guardar texto')),
          const Divider(),
          const Text('Segundo plano',
              style: TextStyle(fontWeight: FontWeight.bold)),
          SwitchListTile(
              title: const Text('Monitoreo continuo (tiempo real en red local)'),
              value: _monitoreo,
              onChanged: (v) async {
                await Prefs.setMonitoreo(v);
                if (v) {
                  await Monitor.iniciar();
                } else {
                  await Monitor.detener();
                }
                setState(() => _monitoreo = v);
              }),
          TextField(
              controller: _intervalo,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                  labelText: 'Sondeo de respaldo (seg, 10-300)')),
          ElevatedButton(
              onPressed: () async {
                await Prefs.setIntervaloSeg(
                    int.tryParse(_intervalo.text) ?? 20);
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                          content: Text('Intervalo guardado')));
                }
              },
              child: const Text('Guardar intervalo')),
          ListTile(
            title: const Text('Permitir siempre en 2do plano (bateria)'),
            trailing: const Icon(Icons.battery_saver),
            onTap: () async {
              final s = await Permission.ignoreBatteryOptimizations.status;
              if (!s.isGranted) {
                await Permission.ignoreBatteryOptimizations.request();
              }
            },
          ),
          const Divider(),
          const Text('Solicitud',
              style: TextStyle(fontWeight: FontWeight.bold)),
          SwitchListTile(
              title: const Text('Enviar ubicacion con la solicitud'),
              value: _ubi,
              onChanged: (v) async {
                await Prefs.setUbicacion(v);
                setState(() => _ubi = v);
              }),
          const Divider(),
          ElevatedButton(
              onPressed: () async {
                await AlertaNotifier.notificar(Alerta(
                    id: 'prueba-local',
                    tipo: 'SOLICITUD_APOYO',
                    estado: 'PENDIENTE',
                    solicitanteNombre: 'Prueba local',
                    creadoEn: DateTime.now().toIso8601String(),
                    detalle:
                        'Aviso de prueba: verifique sonido, vibracion y color.'));
              },
              child: const Text('Probar aviso (sin servidor)')),
        ],
      ),
    );
  }
}
