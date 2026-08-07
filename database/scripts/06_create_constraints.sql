/*
============================================================================
 06_create_constraints.sql
 SIGBO-CBVC — Claves foraneas (FOREIGN KEY)
============================================================================
 Ejecutar DESPUES de 04_create_tables.sql (con las 59 tablas ya creadas).
 Replica el patron real documentado: FKs agregadas via ALTER TABLE
 posterior a la creacion de todas las tablas (evidencia: "009_foreign_keys.sql:
 NO crea tablas ni columnas nuevas; unicamente agrega restricciones
 FOREIGN KEY... sobre tablas ya creadas en migraciones previas").

 Regla de ON DELETE documentada explicitamente (migracion 009): SQL Server
 prohibe multiples rutas de cascada hacia la misma tabla, por lo que casi
 todas las FK de auditoria/referencia (creado_por, actualizado_por,
 asignado_por, aprobado_por, verificado_por, marcado_por) usan NO ACTION
 (comportamiento por defecto si se omite ON DELETE), y solo se usa
 ON DELETE CASCADE en relaciones de propiedad directa sin rutas
 alternativas. El borrado de personas/recursos maestros se hace via soft
 delete (columna estado/eliminado_en), nunca DELETE fisico.

 ============================================================================
 PARTE A — FOREIGN KEY con evidencia EXPLICITA de constraint fisico
 (nombre y/o comportamiento ON DELETE documentados literalmente en el
 diccionario de datos o en las notas de migracion del documento fuente).
 ============================================================================
*/

USE sigbo_cbvc;
GO

-- ---- seguridad ----
ALTER TABLE seguridad.configuracion_sistema ADD CONSTRAINT FK_configap_actpor FOREIGN KEY (actualizado_por) REFERENCES seguridad.usuarios(id);
ALTER TABLE seguridad.historial_contrasenas ADD CONSTRAINT FK_histpass_usuario FOREIGN KEY (usuario_id) REFERENCES seguridad.usuarios(id);
ALTER TABLE seguridad.usuario_correos ADD CONSTRAINT FK_usercorreo_usuario FOREIGN KEY (usuario_id) REFERENCES seguridad.usuarios(id) ON DELETE CASCADE;
ALTER TABLE seguridad.usuario_telefonos ADD CONSTRAINT FK_usertel_usuario FOREIGN KEY (usuario_id) REFERENCES seguridad.usuarios(id) ON DELETE CASCADE;
GO

-- ---- organizacion: relaciones funcionales ----
ALTER TABLE organizacion.cargos       ADD CONSTRAINT FK_cargos_dependencia    FOREIGN KEY (dependencia_cargo_id)   REFERENCES organizacion.cargos(id);
ALTER TABLE organizacion.cuarteles    ADD CONSTRAINT FK_cuartel_compania      FOREIGN KEY (compania_id)            REFERENCES organizacion.companias(id);
ALTER TABLE organizacion.cuarteles    ADD CONSTRAINT FK_cuartel_responsable   FOREIGN KEY (responsable_bombero_id) REFERENCES personal.bomberos(id) ON DELETE SET NULL;
ALTER TABLE organizacion.turnos       ADD CONSTRAINT FK_turno_responsable     FOREIGN KEY (responsable_bombero_id) REFERENCES personal.bomberos(id) ON DELETE SET NULL;
ALTER TABLE organizacion.unidades     ADD CONSTRAINT FK_unidades_brigada      FOREIGN KEY (brigada_id)             REFERENCES organizacion.brigadas(id);
ALTER TABLE organizacion.designaciones ADD CONSTRAINT FK_desig_bombero        FOREIGN KEY (bombero_id)             REFERENCES personal.bomberos(id);
ALTER TABLE organizacion.designaciones ADD CONSTRAINT FK_desig_cargo          FOREIGN KEY (cargo_id)               REFERENCES organizacion.cargos(id);
ALTER TABLE organizacion.designaciones ADD CONSTRAINT FK_desig_compania       FOREIGN KEY (compania_id)            REFERENCES organizacion.companias(id);
ALTER TABLE organizacion.designaciones ADD CONSTRAINT FK_desig_cuartel        FOREIGN KEY (cuartel_id)             REFERENCES organizacion.cuarteles(id);
ALTER TABLE organizacion.ascensos     ADD CONSTRAINT FK_ascenso_bombero        FOREIGN KEY (bombero_id)             REFERENCES personal.bomberos(id);
ALTER TABLE organizacion.ascensos     ADD CONSTRAINT FK_ascenso_rango_anterior FOREIGN KEY (rango_anterior_id)      REFERENCES organizacion.rangos(id) ON DELETE SET NULL;
ALTER TABLE organizacion.ascensos     ADD CONSTRAINT FK_ascenso_rango_nuevo    FOREIGN KEY (rango_nuevo_id)         REFERENCES organizacion.rangos(id);
GO

-- ---- organizacion: auditoria (creado_por / actualizado_por -> seguridad.usuarios) ----
ALTER TABLE organizacion.rangos        ADD CONSTRAINT FK_rangos_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id);
ALTER TABLE organizacion.rangos        ADD CONSTRAINT FK_rangos_actpor    FOREIGN KEY (actualizado_por) REFERENCES seguridad.usuarios(id);
ALTER TABLE organizacion.cargos        ADD CONSTRAINT FK_cargos_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id);
ALTER TABLE organizacion.cargos        ADD CONSTRAINT FK_cargos_actpor    FOREIGN KEY (actualizado_por) REFERENCES seguridad.usuarios(id);
ALTER TABLE organizacion.especialidades ADD CONSTRAINT FK_espec_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id);
ALTER TABLE organizacion.especialidades ADD CONSTRAINT FK_espec_actpor    FOREIGN KEY (actualizado_por) REFERENCES seguridad.usuarios(id);
ALTER TABLE organizacion.companias      ADD CONSTRAINT FK_comp_creadopor  FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id);
ALTER TABLE organizacion.companias      ADD CONSTRAINT FK_comp_actpor     FOREIGN KEY (actualizado_por) REFERENCES seguridad.usuarios(id);
ALTER TABLE organizacion.cuarteles      ADD CONSTRAINT FK_cuartel_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id);
ALTER TABLE organizacion.cuarteles      ADD CONSTRAINT FK_cuartel_actpor    FOREIGN KEY (actualizado_por) REFERENCES seguridad.usuarios(id);
ALTER TABLE organizacion.brigadas       ADD CONSTRAINT FK_brig_creadopor  FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id);
ALTER TABLE organizacion.brigadas       ADD CONSTRAINT FK_brig_actpor     FOREIGN KEY (actualizado_por) REFERENCES seguridad.usuarios(id);
ALTER TABLE organizacion.departamentos  ADD CONSTRAINT FK_depto_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id);
ALTER TABLE organizacion.departamentos  ADD CONSTRAINT FK_depto_actpor    FOREIGN KEY (actualizado_por) REFERENCES seguridad.usuarios(id);
ALTER TABLE organizacion.unidades       ADD CONSTRAINT FK_unid_creadopor  FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id);
ALTER TABLE organizacion.unidades       ADD CONSTRAINT FK_unid_actpor     FOREIGN KEY (actualizado_por) REFERENCES seguridad.usuarios(id);
ALTER TABLE organizacion.turnos         ADD CONSTRAINT FK_turno_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id);
ALTER TABLE organizacion.turnos         ADD CONSTRAINT FK_turno_actpor    FOREIGN KEY (actualizado_por) REFERENCES seguridad.usuarios(id);
ALTER TABLE organizacion.tipos_guardia  ADD CONSTRAINT FK_tguard_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id);
ALTER TABLE organizacion.tipos_guardia  ADD CONSTRAINT FK_tguard_actpor    FOREIGN KEY (actualizado_por) REFERENCES seguridad.usuarios(id);
ALTER TABLE organizacion.designaciones  ADD CONSTRAINT FK_desig_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id);
ALTER TABLE organizacion.designaciones  ADD CONSTRAINT FK_desig_actpor    FOREIGN KEY (actualizado_por) REFERENCES seguridad.usuarios(id);
ALTER TABLE organizacion.ascensos       ADD CONSTRAINT FK_ascenso_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id);
ALTER TABLE organizacion.ascensos       ADD CONSTRAINT FK_ascenso_actpor    FOREIGN KEY (actualizado_por) REFERENCES seguridad.usuarios(id);
GO

-- ---- personal.bomberos: integracion con organizacion (migracion 012) ----
ALTER TABLE personal.bomberos ADD CONSTRAINT FK_bomberos_rango           FOREIGN KEY (rango_id)            REFERENCES organizacion.rangos(id) ON DELETE SET NULL;
ALTER TABLE personal.bomberos ADD CONSTRAINT FK_bomberos_cargo_principal FOREIGN KEY (cargo_principal_id)  REFERENCES organizacion.cargos(id) ON DELETE SET NULL;
ALTER TABLE personal.bomberos ADD CONSTRAINT FK_bomberos_compania        FOREIGN KEY (compania_id)         REFERENCES organizacion.companias(id) ON DELETE SET NULL;
ALTER TABLE personal.bomberos ADD CONSTRAINT FK_bomberos_cuartel         FOREIGN KEY (cuartel_id)          REFERENCES organizacion.cuarteles(id) ON DELETE SET NULL;
ALTER TABLE personal.bomberos ADD CONSTRAINT FK_bomberos_turno           FOREIGN KEY (turno_id)            REFERENCES organizacion.turnos(id) ON DELETE SET NULL;
ALTER TABLE personal.bomberos ADD CONSTRAINT FK_bomberos_tipo_guardia    FOREIGN KEY (tipo_guardia_id)     REFERENCES organizacion.tipos_guardia(id) ON DELETE SET NULL;
GO

-- ---- personal.bombero_especialidades ----
ALTER TABLE personal.bombero_especialidades ADD CONSTRAINT FK_bomesp_bombero FOREIGN KEY (bombero_id) REFERENCES personal.bomberos(id) ON DELETE CASCADE;
ALTER TABLE personal.bombero_especialidades ADD CONSTRAINT FK_bomesp_especialidad FOREIGN KEY (especialidad_id) REFERENCES organizacion.especialidades(id);
GO

-- ---- servicios ----
ALTER TABLE servicios.servicios ADD CONSTRAINT FK_ser_tiposervicio FOREIGN KEY (tipo_servicio_id) REFERENCES servicios.tipos_servicio(id);
ALTER TABLE servicios.servicios ADD CONSTRAINT FK_ser_vehiculo     FOREIGN KEY (vehiculo_principal_id) REFERENCES vehiculos.vehiculos(id) ON DELETE SET NULL;
ALTER TABLE servicios.servicios ADD CONSTRAINT FK_ser_oficialro    FOREIGN KEY (oficial_ro_id) REFERENCES personal.bomberos(id) ON DELETE NO ACTION; -- evita rutas multiples de cascada junto con jefe_servicio_id
ALTER TABLE servicios.servicios ADD CONSTRAINT FK_ser_jefeservicio FOREIGN KEY (jefe_servicio_id) REFERENCES personal.bomberos(id) ON DELETE NO ACTION;
ALTER TABLE servicios.servicios ADD CONSTRAINT FK_ser_creadopor    FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id);
ALTER TABLE servicios.personal_servicio ADD CONSTRAINT FK_perser_servicio FOREIGN KEY (servicio_id) REFERENCES servicios.servicios(id) ON DELETE CASCADE;
ALTER TABLE servicios.personal_servicio ADD CONSTRAINT FK_perser_bombero  FOREIGN KEY (bombero_id) REFERENCES personal.bomberos(id);
ALTER TABLE servicios.historial_servicios ADD CONSTRAINT FK_hser_servicio  FOREIGN KEY (servicio_id) REFERENCES servicios.servicios(id) ON DELETE CASCADE;
ALTER TABLE servicios.historial_servicios ADD CONSTRAINT FK_hser_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id);
GO

-- ---- finanzas ----
ALTER TABLE finanzas.movimientos ADD CONSTRAINT FK_mov_cuenta    FOREIGN KEY (cuenta_id) REFERENCES finanzas.cuentas_contables(id);
ALTER TABLE finanzas.movimientos ADD CONSTRAINT FK_mov_donante   FOREIGN KEY (donante_id) REFERENCES personal.bomberos(id) ON DELETE SET NULL;
ALTER TABLE finanzas.movimientos ADD CONSTRAINT FK_mov_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id);
GO

-- ---- deposito ----
ALTER TABLE deposito.movimientos_deposito ADD CONSTRAINT FK_movdep_item      FOREIGN KEY (item_id) REFERENCES deposito.items_deposito(id) ON DELETE CASCADE;
ALTER TABLE deposito.movimientos_deposito ADD CONSTRAINT FK_movdep_servicio  FOREIGN KEY (servicio_id) REFERENCES servicios.servicios(id) ON DELETE SET NULL;
ALTER TABLE deposito.movimientos_deposito ADD CONSTRAINT FK_movdep_bombero   FOREIGN KEY (bombero_id) REFERENCES personal.bomberos(id) ON DELETE SET NULL;
ALTER TABLE deposito.movimientos_deposito ADD CONSTRAINT FK_movdep_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id);
GO

-- ---- documentos ----
ALTER TABLE documentos.documentos ADD CONSTRAINT FK_doc_bombero   FOREIGN KEY (bombero_id) REFERENCES personal.bomberos(id) ON DELETE SET NULL;
ALTER TABLE documentos.documentos ADD CONSTRAINT FK_doc_servicio  FOREIGN KEY (servicio_id) REFERENCES servicios.servicios(id) ON DELETE SET NULL;
ALTER TABLE documentos.documentos ADD CONSTRAINT FK_doc_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id);
GO

-- ---- equipos.prestamos_equipos.servicio_id ----
-- Confirmado explicitamente en las "Notas Adicionales de Migraciones" del
-- documento fuente (migracion 009): "cierra una FK pendiente ... hacia
-- servicios.servicios(id) ON DELETE SET NULL". El nombre del constraint NO
-- se documenta literalmente; se usa aqui por convencion del proyecto
-- (nombre inferido por convencion, no verificado textualmente).
ALTER TABLE equipos.prestamos_equipos ADD CONSTRAINT FK_preq_servicio FOREIGN KEY (servicio_id) REFERENCES servicios.servicios(id) ON DELETE SET NULL;
GO


/*
 ============================================================================
 PARTE B — Relaciones documentadas como "logicas" / "implicitas" en el
 diccionario de datos (columna "Clave/Restricciones" = "FK logica" o
 "FK implicita, sin constraint declarado" o "Referencia inferida").

 Para estas relaciones la fuente documental indica EXPLICITAMENTE que no
 se observo (o no se pudo confirmar) un constraint FOREIGN KEY fisico en
 el motor. Se listan aqui COMENTADAS, no ejecutadas, para:
   (a) dejar constancia de la relacion para el modelo entidad-relacion
       (ver REPORTE_REPLICACION.md seccion 5 "Relaciones"), y
   (b) permitir habilitarlas con un simple find&replace si al validar
       contra el servidor origen (ver 14_validation.sql) se confirma que
       SI existen fisicamente.
 NO se activan por defecto para no inventar constraints que la evidencia
 disponible no confirma. Ver REPORTE_REPLICACION.md seccion 10
 "Informacion faltante" para el detalle de esta ambiguedad, en particular
 la posible reconciliacion parcial via 009_foreign_keys.sql que el propio
 documento fuente deja abierta.
 ============================================================================
*/

-- seguridad (relaciones internas RBAC / usuarios)
-- ALTER TABLE seguridad.usuarios ADD CONSTRAINT FK_usuarios_bombero FOREIGN KEY (bombero_id) REFERENCES personal.bomberos(id);
-- ALTER TABLE seguridad.usuarios ADD CONSTRAINT FK_usuarios_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id);
-- ALTER TABLE seguridad.roles ADD CONSTRAINT FK_roles_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id);
-- ALTER TABLE seguridad.asignacion_roles ADD CONSTRAINT FK_asigrol_usuario FOREIGN KEY (usuario_id) REFERENCES seguridad.usuarios(id);
-- ALTER TABLE seguridad.asignacion_roles ADD CONSTRAINT FK_asigrol_rol FOREIGN KEY (rol_id) REFERENCES seguridad.roles(id);
-- ALTER TABLE seguridad.asignacion_roles ADD CONSTRAINT FK_asigrol_asignadopor FOREIGN KEY (asignado_por) REFERENCES seguridad.usuarios(id);
-- ALTER TABLE seguridad.asignacion_permisos_rol ADD CONSTRAINT FK_asigpermrol_rol FOREIGN KEY (rol_id) REFERENCES seguridad.roles(id);
-- ALTER TABLE seguridad.asignacion_permisos_rol ADD CONSTRAINT FK_asigpermrol_permiso FOREIGN KEY (permiso_id) REFERENCES seguridad.permisos(id);
-- ALTER TABLE seguridad.asignacion_permisos_rol ADD CONSTRAINT FK_asigpermrol_asignadopor FOREIGN KEY (asignado_por) REFERENCES seguridad.usuarios(id);
-- ALTER TABLE seguridad.asignacion_permisos_directos ADD CONSTRAINT FK_asigpermdir_usuario FOREIGN KEY (usuario_id) REFERENCES seguridad.usuarios(id);
-- ALTER TABLE seguridad.asignacion_permisos_directos ADD CONSTRAINT FK_asigpermdir_permiso FOREIGN KEY (permiso_id) REFERENCES seguridad.permisos(id);
-- ALTER TABLE seguridad.asignacion_permisos_directos ADD CONSTRAINT FK_asigpermdir_asignadopor FOREIGN KEY (asignado_por) REFERENCES seguridad.usuarios(id);
-- ALTER TABLE seguridad.restricciones ADD CONSTRAINT FK_restricciones_permiso FOREIGN KEY (permiso_id) REFERENCES seguridad.permisos(id);
-- ALTER TABLE seguridad.sesiones ADD CONSTRAINT FK_sesiones_usuario FOREIGN KEY (usuario_id) REFERENCES seguridad.usuarios(id);
-- ALTER TABLE seguridad.logs_auditoria ADD CONSTRAINT FK_logs_usuario FOREIGN KEY (usuario_id) REFERENCES seguridad.usuarios(id);

-- personal (bombero_id / creado_por hacia tablas de detalle del legajo)
-- ALTER TABLE personal.certificaciones ADD CONSTRAINT FK_cert_bombero FOREIGN KEY (bombero_id) REFERENCES personal.bomberos(id);
-- ALTER TABLE personal.historial_disciplinario ADD CONSTRAINT FK_hdisc_bombero FOREIGN KEY (bombero_id) REFERENCES personal.bomberos(id);
-- ALTER TABLE personal.historial_disciplinario ADD CONSTRAINT FK_hdisc_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id);
-- ALTER TABLE personal.historial_medico ADD CONSTRAINT FK_hmed_bombero FOREIGN KEY (bombero_id) REFERENCES personal.bomberos(id);
-- ALTER TABLE personal.historial_medico ADD CONSTRAINT FK_hmed_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id);
-- ALTER TABLE personal.licencias ADD CONSTRAINT FK_lic_bombero FOREIGN KEY (bombero_id) REFERENCES personal.bomberos(id);

-- academia (documento fuente: "ninguna de las 19 tablas de 004-006 declara FOREIGN KEY explicita")
-- ALTER TABLE academia.cursos ADD CONSTRAINT FK_cursos_materia FOREIGN KEY (materia_id) REFERENCES academia.materias(id);
-- ALTER TABLE academia.cursos ADD CONSTRAINT FK_cursos_instructor FOREIGN KEY (instructor_id) REFERENCES personal.bomberos(id);
-- ALTER TABLE academia.examenes ADD CONSTRAINT FK_examenes_curso FOREIGN KEY (curso_id) REFERENCES academia.cursos(id);
-- ALTER TABLE academia.inscripciones_cursos ADD CONSTRAINT FK_insccur_curso FOREIGN KEY (curso_id) REFERENCES academia.cursos(id);
-- ALTER TABLE academia.inscripciones_cursos ADD CONSTRAINT FK_insccur_bombero FOREIGN KEY (bombero_id) REFERENCES personal.bomberos(id);
-- ALTER TABLE academia.inscripciones_cursos ADD CONSTRAINT FK_insccur_aspirante FOREIGN KEY (aspirante_id) REFERENCES academia.aspirantes(id);
-- ALTER TABLE academia.notas_examenes ADD CONSTRAINT FK_notaexa_examen FOREIGN KEY (examen_id) REFERENCES academia.examenes(id);
-- ALTER TABLE academia.notas_examenes ADD CONSTRAINT FK_notaexa_inscripcion FOREIGN KEY (inscripcion_id) REFERENCES academia.inscripciones_cursos(id) ON DELETE NO ACTION; -- documentado: NO ACTION porque cursos ya cascadea a notas_examenes via examenes
-- ALTER TABLE academia.asistencia_academia ADD CONSTRAINT FK_asisacad_inscripcion FOREIGN KEY (inscripcion_id) REFERENCES academia.inscripciones_cursos(id);
-- ALTER TABLE academia.asistencia_academia ADD CONSTRAINT FK_asisacad_marcadopor FOREIGN KEY (marcado_por) REFERENCES personal.bomberos(id);

-- operaciones
-- ALTER TABLE operaciones.asignacion_guardias ADD CONSTRAINT FK_asigguard_guardia FOREIGN KEY (guardia_id) REFERENCES operaciones.guardias(id);
-- ALTER TABLE operaciones.asignacion_guardias ADD CONSTRAINT FK_asigguard_bombero FOREIGN KEY (bombero_id) REFERENCES personal.bomberos(id);
-- ALTER TABLE operaciones.asignacion_guardias ADD CONSTRAINT FK_asigguard_asignadopor FOREIGN KEY (asignado_por) REFERENCES personal.bomberos(id);
-- ALTER TABLE operaciones.cambios_guardias ADD CONSTRAINT FK_cambguard_asigorig FOREIGN KEY (asignacion_original_id) REFERENCES operaciones.asignacion_guardias(id);
-- ALTER TABLE operaciones.cambios_guardias ADD CONSTRAINT FK_cambguard_bomberonuevo FOREIGN KEY (bombero_nuevo_id) REFERENCES personal.bomberos(id);
-- ALTER TABLE operaciones.cambios_guardias ADD CONSTRAINT FK_cambguard_solicitante FOREIGN KEY (solicitante_id) REFERENCES personal.bomberos(id);
-- ALTER TABLE operaciones.cambios_guardias ADD CONSTRAINT FK_cambguard_aprobadopor FOREIGN KEY (aprobado_por) REFERENCES personal.bomberos(id);
-- ALTER TABLE operaciones.eventos_asistencia ADD CONSTRAINT FK_evasis_responsable FOREIGN KEY (responsable_id) REFERENCES personal.bomberos(id);
-- ALTER TABLE operaciones.guardias ADD CONSTRAINT FK_guardias_jefe FOREIGN KEY (jefe_guardia_id) REFERENCES personal.bomberos(id);
-- ALTER TABLE operaciones.marcaciones_asistencia ADD CONSTRAINT FK_marc_evento FOREIGN KEY (evento_id) REFERENCES operaciones.eventos_asistencia(id);
-- ALTER TABLE operaciones.marcaciones_asistencia ADD CONSTRAINT FK_marc_bombero FOREIGN KEY (bombero_id) REFERENCES personal.bomberos(id);
-- ALTER TABLE operaciones.marcaciones_asistencia ADD CONSTRAINT FK_marc_verificadopor FOREIGN KEY (verificado_por) REFERENCES personal.bomberos(id);

-- vehiculos
-- ALTER TABLE vehiculos.mantenimientos_vehiculos ADD CONSTRAINT FK_mveh_vehiculo FOREIGN KEY (vehiculo_id) REFERENCES vehiculos.vehiculos(id);
-- ALTER TABLE vehiculos.mantenimientos_vehiculos ADD CONSTRAINT FK_mveh_creadopor FOREIGN KEY (creado_por) REFERENCES personal.bomberos(id);
-- ALTER TABLE vehiculos.consumos_combustible ADD CONSTRAINT FK_consumo_vehiculo FOREIGN KEY (vehiculo_id) REFERENCES vehiculos.vehiculos(id);
-- ALTER TABLE vehiculos.consumos_combustible ADD CONSTRAINT FK_consumo_creadopor FOREIGN KEY (creado_por) REFERENCES personal.bomberos(id);

-- equipos
-- ALTER TABLE equipos.categorias_equipo ADD CONSTRAINT FK_categq_padre FOREIGN KEY (padre_id) REFERENCES equipos.categorias_equipo(id);
-- ALTER TABLE equipos.equipos ADD CONSTRAINT FK_equipos_categoria FOREIGN KEY (categoria_id) REFERENCES equipos.categorias_equipo(id);
-- ALTER TABLE equipos.equipos ADD CONSTRAINT FK_equipos_responsable FOREIGN KEY (responsable_id) REFERENCES personal.bomberos(id);
-- ALTER TABLE equipos.mantenimientos_equipos ADD CONSTRAINT FK_meq_equipo FOREIGN KEY (equipo_id) REFERENCES equipos.equipos(id);
-- ALTER TABLE equipos.mantenimientos_equipos ADD CONSTRAINT FK_meq_creadopor FOREIGN KEY (creado_por) REFERENCES personal.bomberos(id);
-- ALTER TABLE equipos.prestamos_equipos ADD CONSTRAINT FK_preq_equipo FOREIGN KEY (equipo_id) REFERENCES equipos.equipos(id);
-- ALTER TABLE equipos.prestamos_equipos ADD CONSTRAINT FK_preq_bombero FOREIGN KEY (bombero_id) REFERENCES personal.bomberos(id);
-- ALTER TABLE equipos.prestamos_equipos ADD CONSTRAINT FK_preq_creadopor FOREIGN KEY (creado_por) REFERENCES personal.bomberos(id);

/* Fin de 06_create_constraints.sql */
