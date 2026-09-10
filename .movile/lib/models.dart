/// Modelos que reflejan EXACTAMENTE el JSON del backend SIGBO existente
/// (`GET/POST/PATCH /api/v1/alertas`, `POST /api/v1/auth/login|refresh`).
class Usuario {
  final String id;
  final String email;
  final String username;
  final List<String> roles;
  final List<String> permisos;

  Usuario({
    required this.id,
    required this.email,
    required this.username,
    required this.roles,
    required this.permisos,
  });

  factory Usuario.fromJson(Map<String, dynamic> j) => Usuario(
        id: (j['id'] ?? '').toString(),
        email: (j['email'] ?? '').toString(),
        username: (j['username'] ?? '').toString(),
        roles: ((j['roles'] as List?) ?? []).map((e) => e.toString()).toList(),
        permisos:
            ((j['permisos'] as List?) ?? []).map((e) => e.toString()).toList(),
      );
}

class Alerta {
  final String id;
  final String tipo;
  final String estado;
  final String? solicitanteId;
  final String solicitanteNombre;
  final String? detalle;
  final String creadoEn;
  final String? atendidaPorNombre;
  final String? atendidaEn;
  final String? motivoEstado;

  Alerta({
    required this.id,
    required this.tipo,
    required this.estado,
    this.solicitanteId,
    required this.solicitanteNombre,
    this.detalle,
    required this.creadoEn,
    this.atendidaPorNombre,
    this.atendidaEn,
    this.motivoEstado,
  });

  factory Alerta.fromJson(Map<String, dynamic> j) => Alerta(
        id: (j['id'] ?? '').toString(),
        tipo: (j['tipo'] ?? '').toString(),
        estado: (j['estado'] ?? '').toString(),
        solicitanteId: j['solicitanteId']?.toString(),
        solicitanteNombre: (j['solicitanteNombre'] ?? '').toString(),
        detalle: j['detalle']?.toString(),
        creadoEn: (j['creadoEn'] ?? '').toString(),
        atendidaPorNombre: j['atendidaPorNombre']?.toString(),
        atendidaEn: j['atendidaEn']?.toString(),
        motivoEstado: j['motivoEstado']?.toString(),
      );

  String tituloTipo() {
    switch (tipo) {
      case 'SOLICITUD_APOYO':
        return 'SOLICITUD DE APOYO';
      case 'SOLICITUD_CHOFER':
        return 'SOLICITUD DE CHOFER';
      default:
        return tipo;
    }
  }
}

class ResultadoAlerta {
  final Alerta alerta;
  final bool duplicada;
  ResultadoAlerta({required this.alerta, required this.duplicada});
}
