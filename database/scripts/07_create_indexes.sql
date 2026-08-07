/*
============================================================================
 07_create_indexes.sql
 SIGBO-CBVC — Indices no clusterizados
============================================================================
 No incluye: indices UNIQUE ni PRIMARY KEY (esos ya se crearon de forma
 automatica al declarar CONSTRAINT PK_x / UQ_x en 04_create_tables.sql;
 SQL Server crea un indice unico implicito para cada uno).

 Fuente: notas de migracion 010_indices.sql, 012_organizacion.sql y
 015_perfil_usuario.sql del documento fuente.

 *** INCONSISTENCIA DETECTADA EN LA FUENTE (ver REPORTE_REPLICACION.md
 seccion 10): el documento afirma textualmente que "010_indices.sql...
 crea 30 indices no clusterizados", pero el listado detallado que da a
 continuacion, agrupado por esquema, enumera 42 indices, no 30. Este
 script implementa el LISTADO DETALLADO (42 indices), por ser la evidencia
 mas especifica y verificable, y dejamos constancia de que el numero
 resumen (30) no coincide y no pudo conciliarse con la informacion
 disponible. ***
============================================================================
*/

USE sigbo_cbvc;
GO

/* ---- Migracion 010_indices.sql (documentado como "30", listado real: 42) ---- */

-- seguridad (8)
CREATE INDEX IX_usuarios_estado            ON seguridad.usuarios (estado);
CREATE INDEX IX_roles_nombre               ON seguridad.roles (nombre);
CREATE INDEX IX_permisos_recurso_accion    ON seguridad.permisos (recurso, accion);
CREATE INDEX IX_asigrol_usuario            ON seguridad.asignacion_roles (usuario_id);
CREATE INDEX IX_asigpermdir_usuario        ON seguridad.asignacion_permisos_directos (usuario_id);
CREATE INDEX IX_sesiones_usuario           ON seguridad.sesiones (usuario_id);
CREATE INDEX IX_logs_fecha                 ON seguridad.logs_auditoria (fecha DESC);
CREATE INDEX IX_logs_usuario               ON seguridad.logs_auditoria (usuario_id);
GO

-- personal (7)
CREATE INDEX IX_bomberos_estado                    ON personal.bomberos (estado);
CREATE INDEX IX_bomberos_rango                      ON personal.bomberos (rango);
CREATE INDEX IX_bomberos_fecha_ingreso               ON personal.bomberos (fecha_ingreso);
CREATE INDEX IX_certificaciones_bombero             ON personal.certificaciones (bombero_id);
CREATE INDEX IX_licencias_bombero                   ON personal.licencias (bombero_id);
CREATE INDEX IX_historial_medico_bombero            ON personal.historial_medico (bombero_id);
CREATE INDEX IX_historial_disciplinario_bombero     ON personal.historial_disciplinario (bombero_id);
GO

-- academia (5)
CREATE INDEX IX_materias_nivel               ON academia.materias (nivel);
CREATE INDEX IX_cursos_fechas                ON academia.cursos (fecha_inicio, fecha_fin);
CREATE INDEX IX_inscripciones_curso          ON academia.inscripciones_cursos (curso_id);
CREATE INDEX IX_examenes_curso               ON academia.examenes (curso_id);
CREATE INDEX IX_asistencia_academia_fecha    ON academia.asistencia_academia (fecha);
GO

-- operaciones (6)
CREATE INDEX IX_eventos_fechas               ON operaciones.eventos_asistencia (fecha_inicio, fecha_fin);
CREATE INDEX IX_marcaciones_bombero          ON operaciones.marcaciones_asistencia (bombero_id);
CREATE INDEX IX_marcaciones_evento           ON operaciones.marcaciones_asistencia (evento_id);
CREATE INDEX IX_marcaciones_timestamp        ON operaciones.marcaciones_asistencia (timestamp_marcacion DESC);
CREATE INDEX IX_guardias_fecha               ON operaciones.guardias (fecha);
CREATE INDEX IX_asignacion_guardias_bombero  ON operaciones.asignacion_guardias (bombero_id);
GO

-- vehiculos y equipos (5)
CREATE INDEX IX_vehiculos_estado          ON vehiculos.vehiculos (estado);
CREATE INDEX IX_mantenimientos_vehiculo   ON vehiculos.mantenimientos_vehiculos (vehiculo_id);
CREATE INDEX IX_equipos_categoria         ON equipos.equipos (categoria_id);
CREATE INDEX IX_equipos_estado            ON equipos.equipos (estado);
CREATE INDEX IX_equipos_qr                ON equipos.equipos (qr_code);
GO

-- servicios (5)
CREATE INDEX IX_servicios_fecha              ON servicios.servicios (fecha_hora_aviso DESC);
CREATE INDEX IX_servicios_estado             ON servicios.servicios (estado);
CREATE INDEX IX_servicios_tipo               ON servicios.servicios (tipo_servicio_id);
CREATE INDEX IX_personal_servicio_bombero    ON servicios.personal_servicio (bombero_id);
CREATE INDEX IX_historial_servicio           ON servicios.historial_servicios (servicio_id, timestamp_evento);
GO

-- deposito (2)
CREATE INDEX IX_items_deposito_categoria     ON deposito.items_deposito (categoria);
CREATE INDEX IX_movimientos_deposito_item    ON deposito.movimientos_deposito (item_id);
GO

-- documentos (2)
CREATE INDEX IX_documentos_tipo      ON documentos.documentos (tipo);
CREATE INDEX IX_documentos_bombero   ON documentos.documentos (bombero_id);
GO

-- finanzas (2)
CREATE INDEX IX_movimientos_fecha    ON finanzas.movimientos (fecha DESC);
CREATE INDEX IX_movimientos_cuenta   ON finanzas.movimientos (cuenta_id);
GO


/* ---- Migracion 012_organizacion.sql (12 indices) ---- */

CREATE INDEX IX_cargos_dependencia        ON organizacion.cargos (dependencia_cargo_id);
CREATE INDEX IX_cuarteles_compania        ON organizacion.cuarteles (compania_id);
CREATE INDEX IX_unidades_brigada          ON organizacion.unidades (brigada_id);
CREATE INDEX IX_designaciones_bombero     ON organizacion.designaciones (bombero_id);
CREATE INDEX IX_designaciones_cargo       ON organizacion.designaciones (cargo_id);
CREATE INDEX IX_designaciones_estado      ON organizacion.designaciones (estado);
CREATE INDEX IX_ascensos_bombero          ON organizacion.ascensos (bombero_id);
CREATE INDEX IX_bombero_especialidades_b  ON personal.bombero_especialidades (bombero_id);
CREATE INDEX IX_bombero_especialidades_e  ON personal.bombero_especialidades (especialidad_id);
CREATE INDEX IX_bomberos_rango_id         ON personal.bomberos (rango_id);
CREATE INDEX IX_bomberos_compania_id      ON personal.bomberos (compania_id);
CREATE INDEX IX_bomberos_cuartel_id       ON personal.bomberos (cuartel_id);
GO
-- Nota documentada explicitamente: cargo_principal_id, turno_id y
-- tipo_guardia_id de personal.bomberos NO tienen indice dedicado segun la
-- fuente (a diferencia de rango_id/compania_id/cuartel_id).


/* ---- Migracion 015_perfil_usuario.sql (2 indices) ---- */

CREATE INDEX IX_usuario_telefonos_usuario ON seguridad.usuario_telefonos (usuario_id);
CREATE INDEX IX_usuario_correos_usuario   ON seguridad.usuario_correos (usuario_id);
GO

/* Fin de 07_create_indexes.sql */
