/* =============================================================
   SIGBO-CBVC | Migracion 009 - Claves foraneas
   Nota: SQL Server prohibe múltiples rutas de cascada hacia la misma
   tabla. Por eso casi todas las FK de auditoria/referencia usan
   NO ACTION; solo se usa CASCADE en relaciones de propiedad directa
   sin rutas alternativas (ej: bombero -> sus certificaciones).
   Los borrados de personas/recursos maestros se hacen con soft delete
   (columna estado) en la capa de aplicacion, nunca DELETE fisico.
   ============================================================= */

/* ================= SEGURIDAD ================= */
ALTER TABLE seguridad.usuarios
    ADD CONSTRAINT FK_usuarios_creado_por FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id);
GO

ALTER TABLE seguridad.asignacion_roles
    ADD CONSTRAINT FK_asigrol_usuario FOREIGN KEY (usuario_id) REFERENCES seguridad.usuarios(id) ON DELETE CASCADE,
        CONSTRAINT FK_asigrol_rol     FOREIGN KEY (rol_id)     REFERENCES seguridad.roles(id) ON DELETE CASCADE,
        CONSTRAINT FK_asigrol_asignadopor FOREIGN KEY (asignado_por) REFERENCES seguridad.usuarios(id);
GO

ALTER TABLE seguridad.asignacion_permisos_directos
    ADD CONSTRAINT FK_asigpermdir_usuario FOREIGN KEY (usuario_id) REFERENCES seguridad.usuarios(id) ON DELETE CASCADE,
        CONSTRAINT FK_asigpermdir_permiso FOREIGN KEY (permiso_id) REFERENCES seguridad.permisos(id) ON DELETE CASCADE,
        CONSTRAINT FK_asigpermdir_asignadopor FOREIGN KEY (asignado_por) REFERENCES seguridad.usuarios(id);
GO

ALTER TABLE seguridad.asignacion_permisos_rol
    ADD CONSTRAINT FK_asigpermrol_rol     FOREIGN KEY (rol_id)     REFERENCES seguridad.roles(id) ON DELETE CASCADE,
        CONSTRAINT FK_asigpermrol_permiso FOREIGN KEY (permiso_id) REFERENCES seguridad.permisos(id) ON DELETE CASCADE,
        CONSTRAINT FK_asigpermrol_asignadopor FOREIGN KEY (asignado_por) REFERENCES seguridad.usuarios(id);
GO

ALTER TABLE seguridad.restricciones
    ADD CONSTRAINT FK_restric_permiso FOREIGN KEY (permiso_id) REFERENCES seguridad.permisos(id) ON DELETE CASCADE;
GO

ALTER TABLE seguridad.sesiones
    ADD CONSTRAINT FK_sesiones_usuario FOREIGN KEY (usuario_id) REFERENCES seguridad.usuarios(id) ON DELETE CASCADE;
GO

ALTER TABLE seguridad.logs_auditoria
    ADD CONSTRAINT FK_logs_usuario FOREIGN KEY (usuario_id) REFERENCES seguridad.usuarios(id) ON DELETE SET NULL;
GO

ALTER TABLE seguridad.roles
    ADD CONSTRAINT FK_roles_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id);
GO

/* ================= PERSONAL ================= */
ALTER TABLE seguridad.usuarios
    ADD CONSTRAINT FK_usuarios_bombero FOREIGN KEY (bombero_id) REFERENCES personal.bomberos(id) ON DELETE SET NULL;
GO

ALTER TABLE personal.bomberos
    ADD CONSTRAINT FK_bomberos_creadopor    FOREIGN KEY (creado_por)      REFERENCES seguridad.usuarios(id),
        CONSTRAINT FK_bomberos_actualizadopor FOREIGN KEY (actualizado_por) REFERENCES seguridad.usuarios(id);
GO

ALTER TABLE personal.certificaciones
    ADD CONSTRAINT FK_cert_bombero FOREIGN KEY (bombero_id) REFERENCES personal.bomberos(id) ON DELETE CASCADE;
GO

ALTER TABLE personal.licencias
    ADD CONSTRAINT FK_lic_bombero FOREIGN KEY (bombero_id) REFERENCES personal.bomberos(id) ON DELETE CASCADE;
GO

ALTER TABLE personal.historial_medico
    ADD CONSTRAINT FK_hmed_bombero  FOREIGN KEY (bombero_id) REFERENCES personal.bomberos(id) ON DELETE CASCADE,
        CONSTRAINT FK_hmed_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id);
GO

ALTER TABLE personal.historial_disciplinario
    ADD CONSTRAINT FK_hdisc_bombero  FOREIGN KEY (bombero_id) REFERENCES personal.bomberos(id) ON DELETE CASCADE,
        CONSTRAINT FK_hdisc_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id);
GO

/* ================= ACADEMIA ================= */
ALTER TABLE academia.cursos
    ADD CONSTRAINT FK_cursos_materia    FOREIGN KEY (materia_id)    REFERENCES academia.materias(id) ON DELETE CASCADE,
        CONSTRAINT FK_cursos_instructor FOREIGN KEY (instructor_id) REFERENCES personal.bomberos(id) ON DELETE SET NULL;
GO

ALTER TABLE academia.inscripciones_cursos
    ADD CONSTRAINT FK_insc_curso     FOREIGN KEY (curso_id)     REFERENCES academia.cursos(id) ON DELETE CASCADE,
        CONSTRAINT FK_insc_bombero   FOREIGN KEY (bombero_id)   REFERENCES personal.bomberos(id),
        CONSTRAINT FK_insc_aspirante FOREIGN KEY (aspirante_id) REFERENCES academia.aspirantes(id);
GO

ALTER TABLE academia.examenes
    ADD CONSTRAINT FK_exa_curso FOREIGN KEY (curso_id) REFERENCES academia.cursos(id) ON DELETE CASCADE;
GO

/* FK_nota_inscripcion usa NO ACTION: cursos ya cascadea a notas_examenes via examenes,
   una segunda ruta CASCADE via inscripciones_cursos generaria multiples rutas de cascada */
ALTER TABLE academia.notas_examenes
    ADD CONSTRAINT FK_nota_examen      FOREIGN KEY (examen_id)      REFERENCES academia.examenes(id) ON DELETE CASCADE,
        CONSTRAINT FK_nota_inscripcion FOREIGN KEY (inscripcion_id) REFERENCES academia.inscripciones_cursos(id) ON DELETE NO ACTION;
GO

ALTER TABLE academia.asistencia_academia
    ADD CONSTRAINT FK_asisac_inscripcion FOREIGN KEY (inscripcion_id) REFERENCES academia.inscripciones_cursos(id) ON DELETE CASCADE,
        CONSTRAINT FK_asisac_marcadopor  FOREIGN KEY (marcado_por)    REFERENCES seguridad.usuarios(id);
GO

/* ================= OPERACIONES ================= */
ALTER TABLE operaciones.eventos_asistencia
    ADD CONSTRAINT FK_evasis_responsable FOREIGN KEY (responsable_id) REFERENCES personal.bomberos(id) ON DELETE SET NULL;
GO

ALTER TABLE operaciones.marcaciones_asistencia
    ADD CONSTRAINT FK_marc_evento        FOREIGN KEY (evento_id)      REFERENCES operaciones.eventos_asistencia(id) ON DELETE CASCADE,
        CONSTRAINT FK_marc_bombero       FOREIGN KEY (bombero_id)     REFERENCES personal.bomberos(id),
        CONSTRAINT FK_marc_verificadopor FOREIGN KEY (verificado_por) REFERENCES seguridad.usuarios(id);
GO

ALTER TABLE operaciones.guardias
    ADD CONSTRAINT FK_guard_jefe FOREIGN KEY (jefe_guardia_id) REFERENCES personal.bomberos(id) ON DELETE SET NULL;
GO

ALTER TABLE operaciones.asignacion_guardias
    ADD CONSTRAINT FK_asigguard_guardia    FOREIGN KEY (guardia_id)   REFERENCES operaciones.guardias(id) ON DELETE CASCADE,
        CONSTRAINT FK_asigguard_bombero    FOREIGN KEY (bombero_id)   REFERENCES personal.bomberos(id),
        CONSTRAINT FK_asigguard_asignadopor FOREIGN KEY (asignado_por) REFERENCES seguridad.usuarios(id);
GO

ALTER TABLE operaciones.cambios_guardias
    ADD CONSTRAINT FK_cambguard_asignacion  FOREIGN KEY (asignacion_original_id) REFERENCES operaciones.asignacion_guardias(id) ON DELETE CASCADE,
        CONSTRAINT FK_cambguard_bomberonuevo FOREIGN KEY (bombero_nuevo_id)      REFERENCES personal.bomberos(id),
        CONSTRAINT FK_cambguard_solicitante   FOREIGN KEY (solicitante_id)       REFERENCES personal.bomberos(id),
        CONSTRAINT FK_cambguard_aprobadopor   FOREIGN KEY (aprobado_por)         REFERENCES seguridad.usuarios(id);
GO

/* ================= VEHICULOS Y EQUIPOS ================= */
ALTER TABLE vehiculos.mantenimientos_vehiculos
    ADD CONSTRAINT FK_mveh_vehiculo  FOREIGN KEY (vehiculo_id) REFERENCES vehiculos.vehiculos(id) ON DELETE CASCADE,
        CONSTRAINT FK_mveh_creadopor FOREIGN KEY (creado_por)  REFERENCES seguridad.usuarios(id);
GO

ALTER TABLE vehiculos.consumos_combustible
    ADD CONSTRAINT FK_comb_vehiculo  FOREIGN KEY (vehiculo_id) REFERENCES vehiculos.vehiculos(id) ON DELETE CASCADE,
        CONSTRAINT FK_comb_creadopor FOREIGN KEY (creado_por)  REFERENCES seguridad.usuarios(id);
GO

ALTER TABLE equipos.categorias_equipo
    ADD CONSTRAINT FK_cateq_padre FOREIGN KEY (padre_id) REFERENCES equipos.categorias_equipo(id);
GO

ALTER TABLE equipos.equipos
    ADD CONSTRAINT FK_eq_categoria    FOREIGN KEY (categoria_id)   REFERENCES equipos.categorias_equipo(id),
        CONSTRAINT FK_eq_responsable  FOREIGN KEY (responsable_id) REFERENCES personal.bomberos(id) ON DELETE SET NULL;
GO

ALTER TABLE equipos.mantenimientos_equipos
    ADD CONSTRAINT FK_meq_equipo    FOREIGN KEY (equipo_id)  REFERENCES equipos.equipos(id) ON DELETE CASCADE,
        CONSTRAINT FK_meq_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id);
GO

ALTER TABLE equipos.prestamos_equipos
    ADD CONSTRAINT FK_preq_equipo    FOREIGN KEY (equipo_id)   REFERENCES equipos.equipos(id) ON DELETE CASCADE,
        CONSTRAINT FK_preq_bombero   FOREIGN KEY (bombero_id)  REFERENCES personal.bomberos(id) ON DELETE SET NULL,
        CONSTRAINT FK_preq_creadopor FOREIGN KEY (creado_por)  REFERENCES seguridad.usuarios(id);
GO

/* ================= SERVICIOS ================= */
/* oficial_ro_id y jefe_servicio_id quedan en NO ACTION: dos rutas SET NULL desde
   personal.bomberos hacia la misma tabla generan "multiple cascade paths" en SQL Server.
   Los bomberos se dan de baja con soft delete (columna estado), no se borran fisicamente. */
ALTER TABLE servicios.servicios
    ADD CONSTRAINT FK_ser_tiposervicio FOREIGN KEY (tipo_servicio_id)      REFERENCES servicios.tipos_servicio(id),
        CONSTRAINT FK_ser_vehiculo     FOREIGN KEY (vehiculo_principal_id) REFERENCES vehiculos.vehiculos(id) ON DELETE SET NULL,
        CONSTRAINT FK_ser_oficialro    FOREIGN KEY (oficial_ro_id)         REFERENCES personal.bomberos(id) ON DELETE NO ACTION,
        CONSTRAINT FK_ser_jefeservicio FOREIGN KEY (jefe_servicio_id)      REFERENCES personal.bomberos(id) ON DELETE NO ACTION,
        CONSTRAINT FK_ser_creadopor    FOREIGN KEY (creado_por)            REFERENCES seguridad.usuarios(id);
GO

ALTER TABLE servicios.personal_servicio
    ADD CONSTRAINT FK_perser_servicio FOREIGN KEY (servicio_id) REFERENCES servicios.servicios(id) ON DELETE CASCADE,
        CONSTRAINT FK_perser_bombero  FOREIGN KEY (bombero_id)  REFERENCES personal.bomberos(id);
GO

ALTER TABLE servicios.historial_servicios
    ADD CONSTRAINT FK_hser_servicio  FOREIGN KEY (servicio_id) REFERENCES servicios.servicios(id) ON DELETE CASCADE,
        CONSTRAINT FK_hser_creadopor FOREIGN KEY (creado_por)  REFERENCES seguridad.usuarios(id);
GO

/* Ahora que servicios.servicios existe, cerramos referencias pendientes */
ALTER TABLE equipos.prestamos_equipos
    ADD CONSTRAINT FK_preq_servicio FOREIGN KEY (servicio_id) REFERENCES servicios.servicios(id) ON DELETE SET NULL;
GO

/* ================= ADMINISTRATIVOS ================= */
ALTER TABLE finanzas.movimientos
    ADD CONSTRAINT FK_mov_cuenta    FOREIGN KEY (cuenta_id)   REFERENCES finanzas.cuentas_contables(id),
        CONSTRAINT FK_mov_donante   FOREIGN KEY (donante_id)  REFERENCES personal.bomberos(id) ON DELETE SET NULL,
        CONSTRAINT FK_mov_creadopor FOREIGN KEY (creado_por)  REFERENCES seguridad.usuarios(id);
GO

ALTER TABLE deposito.movimientos_deposito
    ADD CONSTRAINT FK_movdep_item      FOREIGN KEY (item_id)     REFERENCES deposito.items_deposito(id) ON DELETE CASCADE,
        CONSTRAINT FK_movdep_servicio  FOREIGN KEY (servicio_id) REFERENCES servicios.servicios(id) ON DELETE SET NULL,
        CONSTRAINT FK_movdep_bombero   FOREIGN KEY (bombero_id)  REFERENCES personal.bomberos(id) ON DELETE SET NULL,
        CONSTRAINT FK_movdep_creadopor FOREIGN KEY (creado_por)  REFERENCES seguridad.usuarios(id);
GO

ALTER TABLE documentos.documentos
    ADD CONSTRAINT FK_doc_bombero   FOREIGN KEY (bombero_id)  REFERENCES personal.bomberos(id) ON DELETE SET NULL,
        CONSTRAINT FK_doc_servicio  FOREIGN KEY (servicio_id) REFERENCES servicios.servicios(id) ON DELETE SET NULL,
        CONSTRAINT FK_doc_creadopor FOREIGN KEY (creado_por)  REFERENCES seguridad.usuarios(id);
GO
