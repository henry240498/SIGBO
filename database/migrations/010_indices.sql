/* =============================================================
   SIGBO-CBVC | Migracion 010 - Indices no clusterizados
   ============================================================= */

/* --- SEGURIDAD --- */
CREATE INDEX IX_usuarios_estado ON seguridad.usuarios(estado);
CREATE INDEX IX_roles_nombre ON seguridad.roles(nombre);
CREATE INDEX IX_permisos_recurso_accion ON seguridad.permisos(recurso, accion);
CREATE INDEX IX_asigrol_usuario ON seguridad.asignacion_roles(usuario_id);
CREATE INDEX IX_asigpermdir_usuario ON seguridad.asignacion_permisos_directos(usuario_id);
CREATE INDEX IX_sesiones_usuario ON seguridad.sesiones(usuario_id);
CREATE INDEX IX_logs_fecha ON seguridad.logs_auditoria(fecha DESC);
CREATE INDEX IX_logs_usuario ON seguridad.logs_auditoria(usuario_id);

/* --- PERSONAL --- */
CREATE INDEX IX_bomberos_estado ON personal.bomberos(estado);
CREATE INDEX IX_bomberos_rango ON personal.bomberos(rango);
CREATE INDEX IX_bomberos_fecha_ingreso ON personal.bomberos(fecha_ingreso);
CREATE INDEX IX_certificaciones_bombero ON personal.certificaciones(bombero_id);
CREATE INDEX IX_licencias_bombero ON personal.licencias(bombero_id);
CREATE INDEX IX_historial_medico_bombero ON personal.historial_medico(bombero_id);
CREATE INDEX IX_historial_disciplinario_bombero ON personal.historial_disciplinario(bombero_id);

/* --- ACADEMIA --- */
CREATE INDEX IX_materias_nivel ON academia.materias(nivel);
CREATE INDEX IX_cursos_fechas ON academia.cursos(fecha_inicio, fecha_fin);
CREATE INDEX IX_inscripciones_curso ON academia.inscripciones_cursos(curso_id);
CREATE INDEX IX_examenes_curso ON academia.examenes(curso_id);
CREATE INDEX IX_asistencia_academia_fecha ON academia.asistencia_academia(fecha);

/* --- OPERACIONES --- */
CREATE INDEX IX_eventos_fechas ON operaciones.eventos_asistencia(fecha_inicio, fecha_fin);
CREATE INDEX IX_marcaciones_bombero ON operaciones.marcaciones_asistencia(bombero_id);
CREATE INDEX IX_marcaciones_evento ON operaciones.marcaciones_asistencia(evento_id);
CREATE INDEX IX_marcaciones_timestamp ON operaciones.marcaciones_asistencia(timestamp_marcacion DESC);
CREATE INDEX IX_guardias_fecha ON operaciones.guardias(fecha);
CREATE INDEX IX_asignacion_guardias_bombero ON operaciones.asignacion_guardias(bombero_id);

/* --- VEHICULOS Y EQUIPOS --- */
CREATE INDEX IX_vehiculos_estado ON vehiculos.vehiculos(estado);
CREATE INDEX IX_mantenimientos_vehiculo ON vehiculos.mantenimientos_vehiculos(vehiculo_id);
CREATE INDEX IX_equipos_categoria ON equipos.equipos(categoria_id);
CREATE INDEX IX_equipos_estado ON equipos.equipos(estado);
CREATE INDEX IX_equipos_qr ON equipos.equipos(qr_code);

/* --- SERVICIOS --- */
CREATE INDEX IX_servicios_fecha ON servicios.servicios(fecha_hora_aviso DESC);
CREATE INDEX IX_servicios_estado ON servicios.servicios(estado);
CREATE INDEX IX_servicios_tipo ON servicios.servicios(tipo_servicio_id);
CREATE INDEX IX_personal_servicio_bombero ON servicios.personal_servicio(bombero_id);
CREATE INDEX IX_historial_servicio ON servicios.historial_servicios(servicio_id, timestamp_evento);

/* --- DEPOSITO --- */
CREATE INDEX IX_items_deposito_categoria ON deposito.items_deposito(categoria);
CREATE INDEX IX_movimientos_deposito_item ON deposito.movimientos_deposito(item_id);

/* --- DOCUMENTOS --- */
CREATE INDEX IX_documentos_tipo ON documentos.documentos(tipo);
CREATE INDEX IX_documentos_bombero ON documentos.documentos(bombero_id);

/* --- FINANZAS --- */
CREATE INDEX IX_movimientos_fecha ON finanzas.movimientos(fecha DESC);
CREATE INDEX IX_movimientos_cuenta ON finanzas.movimientos(cuenta_id);
GO
