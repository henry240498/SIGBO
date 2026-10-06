import 'dart:async';
import 'dart:convert';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_foreground_task/flutter_foreground_task.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:uuid/uuid.dart';

import 'actualizador.dart';
import 'api.dart';
import 'background.dart';
import 'convocatorias.dart';
import 'despacho_movil.dart';
import 'models.dart';
import 'navegacion.dart';
import 'notifier.dart';
import 'offline.dart';
import 'operacion.dart';
import 'reportes.dart';
import 'servidor.dart';
import 'outbox.dart';
import 'siren.dart';
import 'store.dart';

final _navKey = GlobalKey<NavigatorState>();

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await NavegacionAuditoria.instancia.inicializar();
  await AlertaNotifier.inicializar();
  await programarSondeo();
  FlutterForegroundTask.initCommunicationPort();
  // Al tocar un aviso (o full-screen) se abre la pantalla de alerta.
  AlertaNotifier.alTocar = (id) {
    // Una convocatoria se responde en la pantalla principal, no en la de alerta.
    if (id.startsWith('conv:')) {
      _navKey.currentState?.popUntil((r) => r.isFirst);
      return;
    }
    if (id.startsWith('despacho:')) {
      _navKey.currentState?.popUntil((r) => r.isFirst);
      _navKey.currentState?.push(MaterialPageRoute<void>(
          settings: const RouteSettings(name: '0xA00C'),
          builder: (_) => const PantallaDespachoMovil()));
      return;
    }
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
      title: 'SIGBO',
      navigatorKey: _navKey,
      navigatorObservers: [NavegacionAuditoria.instancia],
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0F3B70),
        ).copyWith(
          primary: const Color(0xFF0F3B70),
          secondary: const Color(0xFF008F87),
          tertiary: const Color(0xFFE48717),
        ),
        useMaterial3: true,
        scaffoldBackgroundColor: const Color(0xFFF3F6FA),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFFF3F6FA),
          foregroundColor: Color(0xFF0F3B70),
          elevation: 0,
          scrolledUnderElevation: 0,
          centerTitle: false,
        ),
        cardTheme: CardThemeData(
          elevation: 0,
          color: Colors.white,
          margin: const EdgeInsets.symmetric(vertical: 6),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(18),
            side: const BorderSide(color: Color(0xFFE3EAF2)),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.white,
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 15, vertical: 15),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: const BorderSide(color: Color(0xFFD8E1EB)),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: const BorderSide(color: Color(0xFFD8E1EB)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: const BorderSide(color: Color(0xFF1767A8), width: 1.5),
          ),
        ),
        filledButtonTheme: FilledButtonThemeData(
          style: FilledButton.styleFrom(
            minimumSize: const Size(0, 48),
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          ),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            minimumSize: const Size(0, 48),
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          ),
        ),
        outlinedButtonTheme: OutlinedButtonThemeData(
          style: OutlinedButton.styleFrom(
            minimumSize: const Size(0, 46),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 11),
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          ),
        ),
        listTileTheme: const ListTileThemeData(
          contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 4),
          minVerticalPadding: 10,
        ),
        dividerTheme: const DividerThemeData(
          color: Color(0xFFE5EBF2),
          space: 20,
          thickness: 1,
        ),
        floatingActionButtonTheme: const FloatingActionButtonThemeData(
          backgroundColor: Color(0xFF0F3B70),
          foregroundColor: Colors.white,
        ),
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
    TokenStore.haySesion().then((v) {
      if (!mounted) return;
      setState(() => _sesion = v);
      if (v) NavegacionAuditoria.instancia.iniciarPantalla('0xA001');
    });
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
  bool _configurado = true;
  bool _mantener = false;

  @override
  void initState() {
    super.initState();
    SigboConfig.estaConfigurado().then((v) {
      if (mounted) setState(() => _configurado = v);
    });
    Prefs.mantenerSesion().then((v) {
      if (mounted) setState(() => _mantener = v);
    });
  }

  Future<void> _irAServidor() async {
    await Navigator.push<void>(
        context,
        MaterialPageRoute(
            settings: const RouteSettings(name: '0xA015'),
            builder: (_) => const PantallaServidor()));
    final v = await SigboConfig.estaConfigurado();
    if (mounted) setState(() => _configurado = v);
  }

  @override
  Widget build(BuildContext context) {
    final colores = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: AppBar(title: const Text('SIGBO · CBVC')),
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) => SingleChildScrollView(
            padding: const EdgeInsets.all(22),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 460),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const SizedBox(height: 24),
                    Container(
                      width: 76,
                      height: 76,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F3B70),
                        borderRadius: BorderRadius.circular(24),
                      ),
                      child: const Icon(Icons.local_fire_department,
                          color: Colors.white, size: 42),
                    ),
                    const SizedBox(height: 22),
                    const Text('Bienvenido a SIGBO',
                        style: TextStyle(
                            fontSize: 26, fontWeight: FontWeight.w800)),
                    const SizedBox(height: 5),
                    Text('Ingresa con tu cuenta institucional.',
                        style: TextStyle(color: colores.onSurfaceVariant)),
                    const SizedBox(height: 22),
                    if (!_configurado)
                      Card(
                        color: const Color(0xFFFFF4DC),
                        child: ListTile(
                          leading: const Icon(Icons.wifi_off,
                              color: Color(0xFF9C5D00)),
                          title: const Text('Falta conectar el servidor'),
                          subtitle: const Text(
                              'Configura el servidor del cuartel para ingresar.'),
                          trailing: const Icon(Icons.chevron_right),
                          onTap: _irAServidor,
                        ),
                      ),
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(18),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            TextField(
                              controller: _usu,
                              textInputAction: TextInputAction.next,
                              decoration: const InputDecoration(
                                labelText: 'Usuario o correo',
                                prefixIcon: Icon(Icons.person_outline),
                              ),
                            ),
                            const SizedBox(height: 12),
                            TextField(
                              controller: _cla,
                              obscureText: true,
                              textInputAction: TextInputAction.done,
                              onSubmitted: (_) =>
                                  _cargando ? null : _ingresar(),
                              decoration: const InputDecoration(
                                labelText: 'Contraseña',
                                prefixIcon: Icon(Icons.lock_outline),
                              ),
                            ),
                            CheckboxListTile(
                              value: _mantener,
                              onChanged: _cargando
                                  ? null
                                  : (v) =>
                                      setState(() => _mantener = v ?? false),
                              contentPadding: EdgeInsets.zero,
                              controlAffinity: ListTileControlAffinity.leading,
                              dense: true,
                              title: const Text('Mantener sesión iniciada'),
                              subtitle: Text(_mantener
                                  ? 'Se renueva mientras uses la app.'
                                  : 'Volverá a pedir tu contraseña en unas horas.'),
                            ),
                            if (_msg.isNotEmpty) ...[
                              const SizedBox(height: 10),
                              Text(_msg,
                                  style: TextStyle(color: colores.error)),
                            ],
                            const SizedBox(height: 18),
                            FilledButton.icon(
                              onPressed: _cargando ? null : _ingresar,
                              icon: _cargando
                                  ? const SizedBox(
                                      width: 18,
                                      height: 18,
                                      child: CircularProgressIndicator(
                                          strokeWidth: 2, color: Colors.white),
                                    )
                                  : const Icon(Icons.login),
                              label:
                                  Text(_cargando ? 'Conectando…' : 'Ingresar'),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Center(
                      child: TextButton.icon(
                        onPressed: _irAServidor,
                        icon: const Icon(Icons.dns_outlined),
                        label: const Text('Conectar o cambiar servidor'),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Center(
                      child: Text('Cuerpo de Bomberos Voluntarios de Carapeguá',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                              color: colores.onSurfaceVariant, fontSize: 12)),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _ingresar() async {
    setState(() {
      _cargando = true;
      _msg = '';
    });
    try {
      final u = await _api.login(_usu.text.trim(), _cla.text,
          mantenerSesion: _mantener);
      await Prefs.setMantenerSesion(_mantener);
      if (!mounted) return;
      Navigator.pushReplacement(
          context,
          MaterialPageRoute(
              settings: const RouteSettings(name: '0xA001'),
              builder: (_) => const PantallaPrincipal()));
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text('Hola, ${u.username}')));
    } catch (e) {
      if (mounted) setState(() => _msg = 'No se pudo ingresar: $e');
    } finally {
      if (mounted) setState(() => _cargando = false);
    }
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
  List<ConvocatoriaApp> _convocatorias = [];
  List<Map<String, dynamic>> _solicitudesDespacho = [];
  final Set<String> _solicitudesDespachoVistas = {};
  int _serviciosActivos = 0;
  String _estado = '';
  String _usuario = '';
  Set<String> _permisos = {};
  bool _bloqueado = false;
  Timer? _temporizador;
  StreamSubscription<Alerta>? _sse;
  StreamSubscription<Map<String, dynamic>>? _sseDespacho;
  final _vistos = <String>{};
  bool _primera = true;
  // Cola offline: solicitudes que se enviaran solas al volver la señal.
  List<SolicitudEncolada> _cola = [];
  bool _sinConexion = false;
  bool _conexionComprobada = false;
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
    _temporizador =
        Timer.periodic(const Duration(seconds: 15), (_) => _refrescar());
    // Actualizacion: se consulta al abrir, ya con la pantalla dibujada.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) Actualizador.comprobarAlAbrir(context);
    });
  }

  @override
  void dispose() {
    _temporizador?.cancel();
    _sse?.cancel();
    _sseDespacho?.cancel();
    super.dispose();
  }

  Future<void> _cargarSesion() async {
    _usuario = await TokenStore.username();
    _permisos = await TokenStore.permisos();
    unawaited(Monitor.asegurarIniciado().catchError((_) {}));
    if (_permisos.contains('despacho:responder')) {
      _sseDespacho ??= _api.escucharSseDespacho((evento) {
        final tipo = evento['tipo']?.toString();
        if (tipo == 'solicitud_nueva' ||
            tipo == 'solicitud_actualizada' ||
            tipo == 'solicitud_cerrada') {
          unawaited(_refrescar());
        }
      });
    }
    if (mounted) setState(() {});
  }

  Future<void> _refrescar() async {
    // 0) Operaciones generales (despacho, llamados, fichaje) que esperaban conexion.
    try {
      await Offline.vaciar(_api);
    } catch (_) {}
    // 1) Enviar lo que quedo en cola offline (misma clave: sin duplicar).
    try {
      final f = await Outbox.enviarPendientes();
      if (f.enviadas > 0 && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text(
                'Conexión recuperada: ${f.enviadas} solicitud(es) enviada(s).')));
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
      final convs = await Convocatorias.revisarYAvisar();
      final permisos = await TokenStore.permisos();
      var solicitudesDespacho = _solicitudesDespacho;
      var serviciosActivos = _serviciosActivos;
      if (permisos.contains('despacho:responder')) {
        try {
          await _api.llamar('POST', '/despacho/presencia');
          final r = await _api.llamar('GET', '/despacho/solicitudes/mias');
          if (r.statusCode == 200) {
            solicitudesDespacho = List<Map<String, dynamic>>.from(
              (jsonDecode(r.body) as List)
                  .map((x) => Map<String, dynamic>.from(x as Map)),
            );
            for (final s in solicitudesDespacho) {
              final id = '${s['solicitudId']}';
              if (s['miEstado'] == 'PENDIENTE' &&
                  s['entrega'] == 'ENVIADA' &&
                  s['recibidaEn'] == null) {
                var notificada = _solicitudesDespachoVistas.contains(id);
                if (!notificada) {
                  notificada = await AlertaNotifier.notificarSolicitudDespacho(
                      id, '${s['tipo']}');
                  if (notificada) _solicitudesDespachoVistas.add(id);
                }
                if (notificada) {
                  await _api.llamar(
                      'POST', '/despacho/solicitudes/$id/recibida');
                }
              }
            }
          }
        } catch (_) {
          // Se conserva la última vista si la red cambia durante el sondeo.
        }
      }
      if (permisos.contains('servicios:ver')) {
        try {
          final r = await _api.llamar('GET', '/flota/servicios-abiertos');
          if (r.statusCode == 200)
            serviciosActivos = (jsonDecode(r.body) as List).length;
        } catch (_) {}
      }
      if (mounted) {
        setState(() {
          _pendientes = lista;
          _convocatorias = convs;
          _solicitudesDespacho = solicitudesDespacho;
          _serviciosActivos = serviciosActivos;
          _permisos = permisos.toSet();
          _sinConexion = false;
          _conexionComprobada = true;
          _datosHora = '';
          if (_estado.startsWith('Sin conexión')) _estado = '';
        });
      }
    } catch (e) {
      final cache = await Outbox.leerCache();
      final ts = await Outbox.cacheTs();
      if (mounted) {
        setState(() {
          _pendientes = cache;
          _sinConexion = true;
          _conexionComprobada = true;
          _datosHora = ts > 0
              ? 'Últimos datos: ${AlertaNotifier.fechaHora(DateTime.fromMillisecondsSinceEpoch(ts).toUtc().toIso8601String())}'
              : 'Sin datos guardados todavía.';
          _estado = 'Sin conexión: $e';
        });
      }
    }
  }

  Future<void> _solicitudRapida() async {
    if (_bloqueado || !_permisos.contains('despacho:solicitar')) return;
    setState(() {
      _bloqueado = true;
      _estado = 'Enviando solicitud rápida…';
    });
    try {
      final r = await _api.llamar('POST', '/despacho/solicitudes', body: {
        'tipo': 'RAPIDA',
        'claveIdempotencia': const Uuid().v4(),
      });
      if (r.statusCode != 200 && r.statusCode != 201) {
        throw ApiException(_api.mensajeDe(r, 'No se pudo enviar el llamado'),
            codigo: r.statusCode);
      }
      if (!mounted) return;
      setState(() =>
          _estado = 'Solicitud rápida enviada a los destinatarios elegibles.');
      await _refrescar();
    } catch (e) {
      if (mounted)
        setState(() => _estado =
            'No se confirmó el envío. Verifica la conexión y vuelve a intentar.');
    } finally {
      if (mounted) setState(() => _bloqueado = false);
    }
  }

  Future<void> _responderConvocatoria(
      ConvocatoriaApp c, String respuesta) async {
    int? eta;
    String? motivo;
    if (respuesta == 'VOY') {
      eta = await showDialog<int>(
        context: context,
        builder: (ctx) => SimpleDialog(
          title: const Text('¿En cuántos minutos llega?'),
          children: [
            for (final m in const [5, 10, 15, 20, 30, 45, 60])
              SimpleDialogOption(
                  onPressed: () => Navigator.pop(ctx, m),
                  child: Text('$m minutos')),
          ],
        ),
      );
      if (eta == null) return; // cancelo: no se envia nada
    } else {
      motivo = await showDialog<String>(
        context: context,
        builder: (ctx) => SimpleDialog(
          title: const Text('Motivo (opcional)'),
          children: [
            for (final m in const [
              'Estoy trabajando',
              'Fuera de la zona',
              'Estoy ocupado',
              'Problema personal',
              'Sin transporte',
              'Otro'
            ])
              SimpleDialogOption(
                  onPressed: () => Navigator.pop(ctx, m), child: Text(m)),
            SimpleDialogOption(
                onPressed: () => Navigator.pop(ctx),
                child: const Text('Ahora no')),
          ],
        ),
      );
    }
    try {
      await _api.responderConvocatoria(c.id, respuesta,
          etaMinutos: eta, motivo: motivo);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(respuesta == 'VOY'
              ? 'Respuesta enviada: va en $eta min.'
              : 'Respuesta enviada: no puede ir.')));
      await _refrescar();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  Future<void> _actualizarEstadoConvocatoria(ConvocatoriaApp c,
      {required bool cancelar}) async {
    String? motivo;
    if (cancelar) {
      motivo = await showDialog<String>(
        context: context,
        builder: (ctx) => SimpleDialog(
          title: const Text('Cancelar asistencia'),
          children: [
            for (final m in const [
              'Cambio de planes',
              'Estoy trabajando',
              'Problema de transporte',
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
    try {
      if (cancelar) {
        await _api.cancelarAsistenciaConvocatoria(c.id, motivo: motivo);
      } else {
        await _api.marcarConvocatoriaEnCamino(c.id);
      }
      await _refrescar();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(e.toString())));
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
            Text('Solicitó: ${a.solicitanteNombre}'),
            TextField(
                controller: motivo,
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
    final enLinea = _disponibleAhora;
    return Theme(
      data: Theme.of(context).copyWith(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0F3B70),
          primary: const Color(0xFF0F3B70),
          secondary: const Color(0xFF00A6A6),
          tertiary: const Color(0xFFFF9F1C),
        ),
        scaffoldBackgroundColor: const Color(0xFFF3F6FA),
        cardTheme: CardThemeData(
          elevation: 0,
          color: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
            side: const BorderSide(color: Color(0xFFE5EBF2)),
          ),
        ),
      ),
      child: Scaffold(
        appBar: AppBar(
          title: Row(children: [
            Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primary,
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.local_fire_department,
                  color: Colors.white, size: 23),
            ),
            const SizedBox(width: 10),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text('SIGBO', style: TextStyle(fontWeight: FontWeight.w800)),
                Text('Centro de operaciones',
                    style: TextStyle(fontSize: 11, color: Colors.black54)),
              ],
            ),
          ]),
          actions: [
            IconButton(
              tooltip: 'Actualizar resumen',
              icon: const Icon(Icons.refresh),
              onPressed: _refrescar,
            ),
            const SizedBox(width: 4),
          ],
        ),
        body: ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF0F3B70), Color(0xFF1767A8)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(24),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Hola${_usuario.isEmpty ? '' : ', $_usuario'}',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                          color: Colors.white,
                          fontSize: 22,
                          fontWeight: FontWeight.w800)),
                  const SizedBox(height: 5),
                  const Text('Este es el resumen de actividad del cuartel.',
                      style: TextStyle(color: Colors.white70)),
                  const SizedBox(height: 16),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    children: [
                      _EstadoConexion(
                        conectado: enLinea,
                        verificando: !_conexionComprobada,
                      ),
                      if (_sinConexion && _datosHora.isNotEmpty)
                        Text(_datosHora,
                            style: const TextStyle(
                                color: Colors.white70, fontSize: 12)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Row(children: [
              Expanded(
                child: _ResumenDato(
                  icono: Icons.local_fire_department_outlined,
                  color: const Color(0xFFC83737),
                  valor: '$_serviciosActivos',
                  etiqueta: 'Servicios activos',
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _ResumenDato(
                  icono: Icons.campaign_outlined,
                  color: const Color(0xFF1767A8),
                  valor: '${_solicitudesDespacho.length}',
                  etiqueta: 'Llamados para mí',
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _ResumenDato(
                  icono: _cola.isEmpty ? Icons.cloud_done : Icons.cloud_upload,
                  color: _cola.isEmpty
                      ? const Color(0xFF438A55)
                      : const Color(0xFFE18A17),
                  valor: '${_cola.length}',
                  etiqueta: 'Por enviar',
                ),
              ),
            ]),
            const SizedBox(height: 24),
            const _TituloSeccion(
                titulo: 'Accesos rápidos',
                detalle: 'Las tareas principales, listas para usar'),
            const SizedBox(height: 12),
            Row(children: [
              Expanded(
                child: _AccionRapida(
                  icono: Icons.directions_car_filled,
                  titulo: 'Solicitar chofer',
                  detalle: enLinea
                      ? 'Elegir uno o varios móviles'
                      : 'Necesita conexión al servidor',
                  color: const Color(0xFF1767A8),
                  habilitado: enLinea &&
                      !_bloqueado &&
                      _permisos.contains('despacho:responder'),
                  cargando: _bloqueado,
                  alTocar: () => Navigator.push(
                      context,
                      MaterialPageRoute<void>(
                          settings: const RouteSettings(name: '0xA00C'),
                          builder: (_) => const PantallaDespachoMovil())),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _AccionRapida(
                  icono: Icons.assignment_add,
                  titulo: 'Reportar servicio',
                  detalle: !enLinea
                      ? 'Necesita conexión al servidor'
                      : _permisos.contains('servicios:crear')
                          ? 'Registrar un llamado'
                          : 'Tu usuario no tiene permiso para registrar',
                  color: const Color(0xFFE48717),
                  habilitado: enLinea && _permisos.contains('servicios:crear'),
                  alTocar: () => Navigator.push(
                    context,
                    MaterialPageRoute<void>(
                        settings: const RouteSettings(name: '0xA002'),
                        builder: (_) => const PantallaLlamados()),
                  ),
                ),
              ),
            ]),
            const SizedBox(height: 12),
            _AccionEmergencia(
              habilitado: enLinea &&
                  !_bloqueado &&
                  _permisos.contains('despacho:solicitar'),
              cargando: _bloqueado,
              alTocar: _solicitudRapida,
            ),
            if (_permisos.contains('despacho:responder')) ...[
              const SizedBox(height: 10),
              Card(
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: const Color(0xFFEAF2FA),
                    child: const Icon(Icons.support_agent,
                        color: Color(0xFF1767A8)),
                  ),
                  title: Text(_permisos.contains('despacho:solicitar')
                      ? 'Despacho y disponibilidad'
                      : 'Mis llamados y disponibilidad'),
                  subtitle: Text(_solicitudesDespacho.isEmpty
                      ? 'Consulta los llamados y declara si estás al llamado.'
                      : '${_solicitudesDespacho.length} llamado(s) pendiente(s) · responde en un toque'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute<void>(
                          settings: const RouteSettings(name: '0xA00C'),
                          builder: (_) => const PantallaDespachoMovil())),
                ),
              ),
            ],
            if (_estado.isNotEmpty) ...[
              const SizedBox(height: 8),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 13, vertical: 10),
                decoration: BoxDecoration(
                  color: _estado.startsWith('Sin conexión')
                      ? const Color(0xFFFFF4DC)
                      : const Color(0xFFEAF5ED),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Row(children: [
                  Icon(
                    _estado.startsWith('Sin conexión')
                        ? Icons.info_outline
                        : Icons.check_circle_outline,
                    size: 19,
                    color: _estado.startsWith('Sin conexión')
                        ? const Color(0xFF9C5D00)
                        : const Color(0xFF438A55),
                  ),
                  const SizedBox(width: 9),
                  Expanded(
                      child:
                          Text(_estado, style: const TextStyle(fontSize: 12))),
                ]),
              ),
            ],
            if (_cola.isNotEmpty) ...[
              const SizedBox(height: 12),
              Card(
                color: const Color(0xFFFFF4DC),
                child: ListTile(
                  leading: const Icon(Icons.cloud_upload_outlined,
                      color: Color(0xFF9C5D00)),
                  title: Text('${_cola.length} solicitud(es) esperando envío'),
                  subtitle: const Text('Se enviarán al recuperar la conexión.'),
                  trailing: IconButton(
                    tooltip: 'Reintentar ahora',
                    icon: const Icon(Icons.refresh),
                    onPressed: _refrescar,
                  ),
                ),
              ),
            ],
            for (final c in _convocatorias)
              Card(
                color: const Color(0xFFFFF8E8),
                margin: const EdgeInsets.only(top: 14),
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(children: [
                        Icon(Icons.campaign, color: Color(0xFFB96B00)),
                        SizedBox(width: 8),
                        Text('CONVOCATORIA',
                            style: TextStyle(fontWeight: FontWeight.bold)),
                      ]),
                      const SizedBox(height: 8),
                      Text(c.mensaje),
                      const SizedBox(height: 4),
                      Text(AlertaNotifier.fechaHora(c.creadoEn),
                          style: const TextStyle(fontSize: 12)),
                      if (c.miRespuesta != null) ...[
                        const SizedBox(height: 8),
                        Text(
                            c.miRespuesta == 'VOY'
                                ? c.miCanceladaEn != null
                                    ? 'Cancelaste tu asistencia'
                                    : c.miEnCaminoEn != null
                                        ? 'EN CAMINO desde ${AlertaNotifier.fechaHora(c.miEnCaminoEn!)}'
                                        : 'Aceptaste · ${c.miEtaMinutos ?? '?'} min estimados'
                                : 'No puedes asistir${c.miMotivo == null ? '' : ' · ${c.miMotivo}'}',
                            style:
                                const TextStyle(fontWeight: FontWeight.bold)),
                        if (c.miRespuesta == 'VOY' &&
                            c.miCanceladaEn == null) ...[
                          const SizedBox(height: 8),
                          Wrap(spacing: 8, runSpacing: 8, children: [
                            if (c.miEnCaminoEn == null)
                              FilledButton.tonalIcon(
                                  onPressed: enLinea
                                      ? () => _actualizarEstadoConvocatoria(c,
                                          cancelar: false)
                                      : null,
                                  icon: const Icon(Icons.directions_run),
                                  label: const Text('Estoy en camino')),
                            OutlinedButton.icon(
                                onPressed: enLinea
                                    ? () => _actualizarEstadoConvocatoria(c,
                                        cancelar: true)
                                    : null,
                                icon: const Icon(Icons.undo),
                                label: const Text('Cancelar asistencia')),
                          ]),
                        ],
                      ],
                      const SizedBox(height: 10),
                      Row(children: [
                        Expanded(
                          child: FilledButton.icon(
                            style: FilledButton.styleFrom(
                                backgroundColor: const Color(0xFF26834A)),
                            onPressed: enLinea
                                ? () => _responderConvocatoria(c, 'VOY')
                                : null,
                            icon: const Icon(Icons.check),
                            label:
                                Text(c.miRespuesta == null ? 'Voy' : 'Cambiar'),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: enLinea
                                ? () => _responderConvocatoria(c, 'NO_PUEDO')
                                : null,
                            icon: const Icon(Icons.close),
                            label: const Text('No puedo'),
                          ),
                        ),
                      ]),
                    ],
                  ),
                ),
              ),
            const SizedBox(height: 24),
            const _TituloSeccion(
                titulo: 'Alertas activas',
                detalle: 'Solicitudes que necesitan seguimiento'),
            const SizedBox(height: 8),
            if (_pendientes.isEmpty)
              const Card(
                child: Padding(
                  padding: EdgeInsets.all(18),
                  child: Row(children: [
                    Icon(Icons.check_circle_outline, color: Color(0xFF438A55)),
                    SizedBox(width: 12),
                    Expanded(child: Text('No hay alertas pendientes.')),
                  ]),
                ),
              ),
            for (final a in _pendientes)
              Card(
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: a.tipo == 'SOLICITUD_CHOFER'
                        ? const Color(0xFFE8F1FA)
                        : const Color(0xFFFFE9E7),
                    child: Icon(
                      a.tipo == 'SOLICITUD_CHOFER'
                          ? Icons.directions_car
                          : Icons.campaign,
                      color: a.tipo == 'SOLICITUD_CHOFER'
                          ? const Color(0xFF1767A8)
                          : const Color(0xFFC63737),
                    ),
                  ),
                  title: Text(a.tituloTipo(),
                      style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text(
                      '${a.solicitanteNombre} · ${AlertaNotifier.fechaHora(a.creadoEn)}'
                      '${(a.detalle ?? '').isNotEmpty ? '\n${a.detalle}' : ''}'),
                  isThreeLine: (a.detalle ?? '').isNotEmpty,
                  trailing: _puedeAtender
                      ? PopupMenuButton<String>(
                          tooltip: 'Acciones de alerta',
                          onSelected: (v) => _cambiarEstado(a, v),
                          itemBuilder: (_) => const [
                            PopupMenuItem(
                                value: 'ATENDIDA',
                                child: Text('Marcar atendida')),
                            PopupMenuItem(
                                value: 'CANCELADA', child: Text('Cancelar')),
                          ],
                        )
                      : const Icon(Icons.chevron_right),
                  onTap: () =>
                      Navigator.pushNamed(context, '/alerta', arguments: a.id),
                ),
              ),
            const SizedBox(height: 22),
            const _TituloSeccion(
                titulo: 'Operaciones',
                detalle: 'Herramientas disponibles para tu usuario'),
            const SizedBox(height: 8),
            Card(
              child: ListTile(
                leading: const CircleAvatar(
                  backgroundColor: Color(0xFFE5F4F2),
                  child: Icon(Icons.grid_view, color: Color(0xFF008F87)),
                ),
                title: const Text('Más herramientas operativas'),
                subtitle: const Text('Flota, fichaje, hidrantes y gestión'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute<void>(
                        settings: const RouteSettings(name: '0xA012'),
                        builder: (_) => const PantallaOperacion())),
              ),
            ),
            const SizedBox(height: 22),
            const _TituloSeccion(
                titulo: 'Administración', detalle: 'Configuración y cuenta'),
            const SizedBox(height: 8),
            Card(
              child: Column(children: [
                ListTile(
                  leading: const CircleAvatar(
                    backgroundColor: Color(0xFFEEF1F6),
                    child: Icon(Icons.settings, color: Color(0xFF53657A)),
                  ),
                  title: const Text('Ajustes de la aplicación'),
                  subtitle: const Text('Servidor, avisos y preferencias'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => Navigator.pushNamed(context, '/ajustes'),
                ),
                const Divider(height: 1, indent: 16, endIndent: 16),
                ListTile(
                  leading: const CircleAvatar(
                    backgroundColor: Color(0xFFEEF1F6),
                    child: Icon(Icons.rate_review, color: Color(0xFF53657A)),
                  ),
                  title: const Text('Reportar un problema'),
                  subtitle:
                      const Text('Errores y sugerencias para mejorar la app'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute(
                          settings: const RouteSettings(name: '0xA011'),
                          builder: (_) =>
                              const PantallaReportar(pantalla: 'Inicio'))),
                ),
                const Divider(height: 1, indent: 16, endIndent: 16),
                ListTile(
                  leading: const CircleAvatar(
                    backgroundColor: Color(0xFFFFEEEE),
                    child: Icon(Icons.logout, color: Color(0xFFB93838)),
                  ),
                  title: const Text('Cerrar sesión'),
                  onTap: () async {
                    await NavegacionAuditoria.instancia.cerrarSesion();
                    await _api.logout();
                    await Sirena.detener();
                    if (!mounted) return;
                    Navigator.pushAndRemoveUntil(
                        context,
                        MaterialPageRoute(
                            settings: const RouteSettings(
                                name: '__cerrar_auditoria__'),
                            builder: (_) => const PantallaLogin()),
                        (_) => false);
                  },
                ),
              ]),
            ),
            const SizedBox(height: 12),
            Center(
              child: Text('SIGBO · CBVC',
                  style: TextStyle(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                      fontSize: 12)),
            ),
          ],
        ),
      ),
    );
  }

  bool get _disponibleAhora => _conexionComprobada && !_sinConexion;
}

class _EstadoConexion extends StatelessWidget {
  final bool conectado;
  final bool verificando;
  const _EstadoConexion({required this.conectado, required this.verificando});

  @override
  Widget build(BuildContext context) {
    final color = verificando
        ? const Color(0xFF607D9B)
        : conectado
            ? const Color(0xFF36A76B)
            : const Color(0xFFE65D5D);
    final texto = verificando
        ? 'Verificando conexión'
        : conectado
            ? 'Conectado al servidor'
            : 'Sin conexión';
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 7),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.16),
        borderRadius: BorderRadius.circular(30),
      ),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(
            verificando
                ? Icons.sync
                : conectado
                    ? Icons.wifi
                    : Icons.wifi_off,
            size: 16,
            color: Colors.white),
        const SizedBox(width: 7),
        Text(texto,
            style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w600,
                fontSize: 12)),
        const SizedBox(width: 7),
        Container(
            width: 7,
            height: 7,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
      ]),
    );
  }
}

class _ResumenDato extends StatelessWidget {
  final IconData icono;
  final Color color;
  final String valor;
  final String etiqueta;
  const _ResumenDato({
    required this.icono,
    required this.color,
    required this.valor,
    required this.etiqueta,
  });

  @override
  Widget build(BuildContext context) => Card(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 13),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(icono, color: color, size: 19),
              const SizedBox(height: 8),
              Text(valor,
                  style: const TextStyle(
                      fontSize: 21, fontWeight: FontWeight.w800)),
              const SizedBox(height: 2),
              Text(etiqueta,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontSize: 11, height: 1.15)),
            ],
          ),
        ),
      );
}

class _TituloSeccion extends StatelessWidget {
  final String titulo;
  final String detalle;
  const _TituloSeccion({required this.titulo, required this.detalle});

  @override
  Widget build(BuildContext context) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(titulo,
              style:
                  const TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
          const SizedBox(height: 2),
          Text(detalle,
              style: TextStyle(
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                  fontSize: 12)),
        ],
      );
}

class _AccionRapida extends StatelessWidget {
  final IconData icono;
  final String titulo;
  final String detalle;
  final Color color;
  final bool habilitado;
  final bool cargando;
  final VoidCallback alTocar;
  const _AccionRapida({
    required this.icono,
    required this.titulo,
    required this.detalle,
    required this.color,
    required this.habilitado,
    this.cargando = false,
    required this.alTocar,
  });

  @override
  Widget build(BuildContext context) {
    final tono = habilitado ? color : const Color(0xFF9AA4AF);
    return Opacity(
      opacity: habilitado ? 1 : 0.58,
      child: Material(
        color: habilitado
            ? color.withValues(alpha: 0.09)
            : const Color(0xFFE9EDF1),
        borderRadius: BorderRadius.circular(20),
        child: InkWell(
          onTap: habilitado ? alTocar : null,
          borderRadius: BorderRadius.circular(20),
          child: Container(
            constraints: const BoxConstraints(minHeight: 142),
            padding: const EdgeInsets.all(15),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                  color: habilitado
                      ? color.withValues(alpha: 0.22)
                      : const Color(0xFFD8DEE5)),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                      color: habilitado
                          ? color.withValues(alpha: 0.14)
                          : const Color(0xFFDDE2E7),
                      borderRadius: BorderRadius.circular(14)),
                  child: cargando && habilitado
                      ? Padding(
                          padding: const EdgeInsets.all(11),
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: tono),
                        )
                      : Icon(icono, color: tono, size: 23),
                ),
                const SizedBox(height: 14),
                Text(titulo,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                        color: tono,
                        fontSize: 14,
                        fontWeight: FontWeight.w800)),
                const SizedBox(height: 4),
                Text(detalle,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                        color: habilitado ? const Color(0xFF546170) : tono,
                        fontSize: 11,
                        height: 1.2)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _AccionEmergencia extends StatelessWidget {
  final bool habilitado;
  final bool cargando;
  final VoidCallback alTocar;
  const _AccionEmergencia({
    required this.habilitado,
    required this.cargando,
    required this.alTocar,
  });

  @override
  Widget build(BuildContext context) => Opacity(
        opacity: habilitado ? 1 : 0.56,
        child: SizedBox(
          height: 62,
          child: FilledButton.icon(
            style: FilledButton.styleFrom(
              backgroundColor: const Color(0xFFC83737),
              foregroundColor: Colors.white,
              disabledBackgroundColor: const Color(0xFFD8DEE5),
              disabledForegroundColor: const Color(0xFF707B87),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(18)),
            ),
            onPressed: habilitado ? alTocar : null,
            icon: cargando && habilitado
                ? const SizedBox(
                    width: 19,
                    height: 19,
                    child: CircularProgressIndicator(
                        strokeWidth: 2, color: Colors.white),
                  )
                : const Icon(Icons.campaign_outlined),
            label: const Text('Solicitar apoyo',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
          ),
        ),
      );
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
          motivo: 'Resuelto desde pantalla de alerta móvil');
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
      backgroundColor: const Color(0xFF9E252A),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(18, 16, 18, 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(children: [
                Container(
                  width: 46,
                  height: 46,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(15),
                  ),
                  child:
                      const Icon(Icons.campaign, color: Colors.white, size: 26),
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('AVISO DE EMERGENCIA',
                          style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.4)),
                      SizedBox(height: 3),
                      Text('Revisa la solicitud recibida',
                          style: TextStyle(color: Colors.white70)),
                    ],
                  ),
                ),
              ]),
              const SizedBox(height: 18),
              Expanded(
                child: SingleChildScrollView(
                  child: Card(
                    margin: EdgeInsets.zero,
                    color: Colors.white,
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 11, vertical: 7),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFFECEC),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: const Text('PENDIENTE',
                                style: TextStyle(
                                    color: Color(0xFFAE282E),
                                    fontWeight: FontWeight.w800,
                                    fontSize: 12)),
                          ),
                          const SizedBox(height: 16),
                          Text(a?.tituloTipo() ?? 'Cargando aviso…',
                              style: const TextStyle(
                                  color: Color(0xFF15273A),
                                  fontSize: 28,
                                  height: 1.1,
                                  fontWeight: FontWeight.w800)),
                          const SizedBox(height: 18),
                          const Divider(height: 1),
                          const SizedBox(height: 15),
                          _DatoAlerta(
                            icono: Icons.person_outline,
                            titulo: 'Solicitó',
                            valor: a?.solicitanteNombre ?? 'Cargando…',
                          ),
                          const SizedBox(height: 15),
                          _DatoAlerta(
                            icono: Icons.schedule,
                            titulo: 'Fecha y hora',
                            valor: a == null
                                ? 'Cargando…'
                                : AlertaNotifier.fechaHora(a.creadoEn),
                          ),
                          if ((a?.detalle ?? '').isNotEmpty) ...[
                            const SizedBox(height: 15),
                            _DatoAlerta(
                              icono: Icons.notes,
                              titulo: 'Detalle',
                              valor: a!.detalle!,
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                ),
              ),
              if (_puede) ...[
                const SizedBox(height: 14),
                FilledButton.icon(
                  style: FilledButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: const Color(0xFF20663A),
                    minimumSize: const Size.fromHeight(54),
                  ),
                  onPressed: () => _resolver('ATENDIDA'),
                  icon: const Icon(Icons.check_circle_outline),
                  label: const Text('Marcar atendida'),
                ),
                const SizedBox(height: 8),
                OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.white,
                    side: const BorderSide(color: Colors.white70),
                    minimumSize: const Size.fromHeight(50),
                  ),
                  onPressed: () => _resolver('CANCELADA'),
                  icon: const Icon(Icons.cancel_outlined),
                  label: const Text('Cancelar solicitud'),
                ),
                const SizedBox(height: 7),
              ],
              TextButton.icon(
                style: TextButton.styleFrom(foregroundColor: Colors.white),
                onPressed: () async {
                  await Sirena.detener();
                  if (mounted) Navigator.pop(context);
                },
                icon: const Icon(Icons.volume_off_outlined),
                label: const Text('Enterado (silenciar aviso)'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _DatoAlerta extends StatelessWidget {
  final IconData icono;
  final String titulo;
  final String valor;
  const _DatoAlerta({
    required this.icono,
    required this.titulo,
    required this.valor,
  });

  @override
  Widget build(BuildContext context) => Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icono, color: const Color(0xFF64758A), size: 20),
          const SizedBox(width: 11),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(titulo,
                    style: const TextStyle(
                        color: Color(0xFF68778A), fontSize: 12)),
                const SizedBox(height: 3),
                Text(valor,
                    style: const TextStyle(
                        color: Color(0xFF17283B),
                        fontSize: 15,
                        fontWeight: FontWeight.w600)),
              ],
            ),
          ),
        ],
      );
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
  String _movilNombre = '';
  String _version = '';

  Future<void> _elegirMovil() async {
    try {
      final moviles = await SigboApi().listarMoviles();
      if (!mounted) return;
      final elegido = await showDialog<MovilBasico?>(
        context: context,
        builder: (ctx) => SimpleDialog(
          title: const Text('Móvil de este celular'),
          children: [
            SimpleDialogOption(
                onPressed: () => Navigator.pop(ctx, null),
                child: const Text('Ninguno')),
            ...moviles.map((m) => SimpleDialogOption(
                onPressed: () => Navigator.pop(ctx, m), child: Text(m.nombre))),
          ],
        ),
      );
      if (!mounted) return;
      await Prefs.setMovil(elegido?.id ?? '', elegido?.nombre ?? '');
      setState(() => _movilNombre = elegido?.nombre ?? '');
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  @override
  void initState() {
    super.initState();
    _cargar();
  }

  Future<void> _cargar() async {
    _url.text = await SigboConfig.baseUrl();
    _texto.text = await Prefs.encabezado();
    _movilNombre = await Prefs.movilNombre();
    _version = await Actualizador.versionInstalada();
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
          Container(
            padding: const EdgeInsets.all(17),
            decoration: BoxDecoration(
              color: const Color(0xFFE8F1FA),
              borderRadius: BorderRadius.circular(18),
            ),
            child: const Row(children: [
              CircleAvatar(
                backgroundColor: Colors.white,
                child: Icon(Icons.tune, color: Color(0xFF1767A8)),
              ),
              SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Personaliza SIGBO',
                        style: TextStyle(fontWeight: FontWeight.w800)),
                    SizedBox(height: 3),
                    Text('Conexión, avisos y funciones del celular.',
                        style: TextStyle(fontSize: 12)),
                  ],
                ),
              ),
            ]),
          ),
          const SizedBox(height: 8),
          ListTile(
            leading: const Icon(Icons.qr_code_scanner),
            title: const Text('Conectar con el servidor (QR)'),
            subtitle:
                const Text('Escanear el código de la PC y probar la conexión'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => Navigator.push<void>(
                context,
                MaterialPageRoute(
                    settings: const RouteSettings(name: '0xA015'),
                    builder: (_) => const PantallaServidor())),
          ),
          const Divider(),
          Padding(
            padding: const EdgeInsets.only(top: 18, bottom: 8),
            child: Text('Servidor',
                style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: Theme.of(context).colorScheme.primary)),
          ),
          TextField(
              controller: _url,
              decoration:
                  const InputDecoration(hintText: 'https://servidor/api/v1')),
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
                        ScaffoldMessenger.of(context)
                            .showSnackBar(SnackBar(content: Text('$e')));
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
              'Local Henry: http://IP-DE-SU-PC:3001/api/v1 · Emulador: http://10.0.2.2:3001/api/v1 · Túnel: la https de cloudflared + /api/v1',
              style: TextStyle(fontSize: 12)),
          const Divider(),
          Padding(
            padding: const EdgeInsets.only(top: 18, bottom: 8),
            child: Text('Aviso de emergencia',
                style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: Theme.of(context).colorScheme.primary)),
          ),
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
              final r =
                  await FilePicker.platform.pickFiles(type: FileType.audio);
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
              title: const Text('Vibración'),
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
              'Ámbar': 0xFFEF6C00,
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
          TextField(
              controller: _texto,
              decoration: const InputDecoration(labelText: 'Texto del aviso')),
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
          Padding(
            padding: const EdgeInsets.only(top: 18, bottom: 8),
            child: Text('Segundo plano',
                style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: Theme.of(context).colorScheme.primary)),
          ),
          SwitchListTile(
              title:
                  const Text('Monitoreo continuo (tiempo real en red local)'),
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
                      const SnackBar(content: Text('Intervalo guardado')));
                }
              },
              child: const Text('Guardar intervalo')),
          ListTile(
            title: const Text('Permitir siempre en 2do plano (batería)'),
            trailing: const Icon(Icons.battery_saver),
            onTap: () async {
              final s = await Permission.ignoreBatteryOptimizations.status;
              if (!s.isGranted) {
                await Permission.ignoreBatteryOptimizations.request();
              }
            },
          ),
          const Divider(),
          Padding(
            padding: const EdgeInsets.only(top: 18, bottom: 8),
            child: Text('Aplicación',
                style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: Theme.of(context).colorScheme.primary)),
          ),
          ListTile(
            title: Text('Versión instalada: $_version'),
            subtitle: const Text(
                'Se busca una versión nueva al abrir la aplicación. Pulse para buscar ahora.'),
            trailing: const Icon(Icons.system_update),
            onTap: () => Actualizador.comprobarManual(context),
          ),
          const Divider(),
          Padding(
            padding: const EdgeInsets.only(top: 18, bottom: 8),
            child: Text('Móvil de este celular',
                style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: Theme.of(context).colorScheme.primary)),
          ),
          ListTile(
            title: Text(_movilNombre.isEmpty
                ? 'Ninguno (no se informa la posición)'
                : _movilNombre),
            subtitle: const Text(
                'Con el monitoreo continuo activo, la posición se informa en cada sondeo.'),
            trailing: const Icon(Icons.local_shipping),
            onTap: _elegirMovil,
          ),
          const Divider(),
          Padding(
            padding: const EdgeInsets.only(top: 18, bottom: 8),
            child: Text('Solicitud',
                style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: Theme.of(context).colorScheme.primary)),
          ),
          SwitchListTile(
              title: const Text('Enviar ubicación con la solicitud'),
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
                        'Aviso de prueba: verifique sonido, vibración y color.'));
              },
              child: const Text('Probar aviso (sin servidor)')),
        ],
      ),
    );
  }
}
