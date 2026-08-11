SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

/* =============================================================
   SIGBO-CBVC | Migracion 025 - Modulo Guardias (Fase 3)

   operaciones.guardias / asignacion_guardias ya existian (roster real
   de guardias, construido como parte de Asistencia). Esta migracion
   los expande con todo lo que pedia la especificacion funcional de
   Guardias: grupos predefinidos, refuerzos/reemplazos con motivo y
   horarios reales, pernoctantes (explicitamente NO parte de la
   asignacion -- pernoctar != estar de guardia), checklist de condicion
   de estacion, novedades manuales (la bitacora completa se arma en la
   Fase 4 combinando esto con lecturas de otras tablas, sin duplicar
   datos), reglas configurables de elegibilidad de rol, y el cierre de
   guardia con snapshot inmutable del resumen.

   El modulo backend pasa de OperacionesModule (permisos
   asistencia:guardias_*) a un GuardiasModule dedicado usando el
   namespace guardias:* -- ya sembrado por seed-data.ts y ya asignado a
   roles (Comandante, Jefe de Guardia) desde el diseno original de
   roles, confirmando que ese era el namespace previsto para este
   modulo. Verificado que operaciones.guardias/asignacion_guardias
   siguen sin datos reales de produccion.
   ============================================================= */

/* --- 1) Nuevos tipos parametrizables --- */
ALTER TABLE organizacion.parametros DROP CONSTRAINT CK_param_tipo;
GO
ALTER TABLE organizacion.parametros ADD CONSTRAINT CK_param_tipo CHECK (tipo IN (
    'PAIS','DEPARTAMENTO','CIUDAD','BARRIO','PROFESION','IDIOMA','NIVEL_IDIOMA',
    'GRUPO_SANGUINEO','FACTOR_RH','TIPO_SEGURO','ASEGURADORA','TIPO_EVENTO_ASISTENCIA',
    'UBICACION_EQUIPO','ESTADO_PRESENCIA_GUARDIA','SECTOR_ESTACION'
));
GO

INSERT INTO organizacion.parametros (tipo, nombre, nombre_normalizado, orden)
SELECT v.tipo, v.nombre, v.nombre_normalizado, v.orden FROM (VALUES
    (N'ESTADO_PRESENCIA_GUARDIA', N'Presente',          N'presente',          1),
    (N'ESTADO_PRESENCIA_GUARDIA', N'Ausente',           N'ausente',           2),
    (N'ESTADO_PRESENCIA_GUARDIA', N'Permiso',           N'permiso',           3),
    (N'ESTADO_PRESENCIA_GUARDIA', N'Llegada tardia',    N'llegada tardia',    4),
    (N'ESTADO_PRESENCIA_GUARDIA', N'Retiro anticipado', N'retiro anticipado', 5),
    (N'ESTADO_PRESENCIA_GUARDIA', N'Reemplazado',       N'reemplazado',       6),
    (N'ESTADO_PRESENCIA_GUARDIA', N'Otro',              N'otro',              7),
    (N'SECTOR_ESTACION', N'Aseo y orden',  N'aseo y orden',  1),
    (N'SECTOR_ESTACION', N'Sanitarios',    N'sanitarios',    2),
    (N'SECTOR_ESTACION', N'Dormitorios',   N'dormitorios',   3),
    (N'SECTOR_ESTACION', N'Cocina',        N'cocina',        4),
    (N'SECTOR_ESTACION', N'Salon',         N'salon',         5),
    (N'SECTOR_ESTACION', N'Sala RO',       N'sala ro',       6)
) AS v(tipo, nombre, nombre_normalizado, orden)
WHERE NOT EXISTS (SELECT 1 FROM organizacion.parametros p WHERE p.tipo = v.tipo AND p.nombre_normalizado = v.nombre_normalizado AND p.padre_id IS NULL);
GO

/* --- 2) Grupos de guardia (composicion predefinida, seccion 3) --- */
CREATE TABLE operaciones.grupos_guardia (
    id                  UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_grpguard_id DEFAULT NEWSEQUENTIALID(),
    nombre              NVARCHAR(150) NOT NULL,
    oficial_a_cargo_id  UNIQUEIDENTIFIER NULL,
    estado              NVARCHAR(20)  NOT NULL CONSTRAINT DF_grpguard_estado DEFAULT 'ACTIVO',
    observaciones       NVARCHAR(MAX) NULL,
    creado_en           DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_grpguard_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en      DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_grpguard_act DEFAULT SYSDATETIMEOFFSET(),
    creado_por          UNIQUEIDENTIFIER NULL,
    CONSTRAINT PK_grupos_guardia PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_grpguard_estado CHECK (estado IN ('ACTIVO','INACTIVO')),
    CONSTRAINT FK_grpguard_oficial FOREIGN KEY (oficial_a_cargo_id) REFERENCES personal.bomberos(id)
);
GO

CREATE TABLE operaciones.grupos_guardia_miembros (
    id         UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_grpmiembro_id DEFAULT NEWSEQUENTIALID(),
    grupo_id   UNIQUEIDENTIFIER NOT NULL,
    bombero_id UNIQUEIDENTIFIER NOT NULL,
    rol        NVARCHAR(20) NOT NULL CONSTRAINT DF_grpmiembro_rol DEFAULT 'TITULAR',
    orden      INT NOT NULL CONSTRAINT DF_grpmiembro_orden DEFAULT 0,
    creado_en  DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_grpmiembro_creado DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_grupos_guardia_miembros PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_grpmiembro UNIQUE (grupo_id, bombero_id),
    CONSTRAINT CK_grpmiembro_rol CHECK (rol IN ('TITULAR','CHOFER')),
    CONSTRAINT FK_grpmiembro_grupo FOREIGN KEY (grupo_id) REFERENCES operaciones.grupos_guardia(id) ON DELETE CASCADE,
    CONSTRAINT FK_grpmiembro_bombero FOREIGN KEY (bombero_id) REFERENCES personal.bomberos(id)
);
GO

/* --- 3) guardias: grupo de origen + cierre --- */
ALTER TABLE operaciones.guardias ADD
    grupo_guardia_id      UNIQUEIDENTIFIER NULL,
    cierre_responsable_id UNIQUEIDENTIFIER NULL,
    cierre_observacion    NVARCHAR(MAX) NULL,
    cierre_resumen        NVARCHAR(MAX) NULL,
    cerrada_en            DATETIMEOFFSET(3) NULL;
GO
ALTER TABLE operaciones.guardias
    ADD CONSTRAINT FK_guard_grupo FOREIGN KEY (grupo_guardia_id) REFERENCES operaciones.grupos_guardia(id);
GO
ALTER TABLE operaciones.guardias
    ADD CONSTRAINT FK_guard_cierreresp FOREIGN KEY (cierre_responsable_id) REFERENCES personal.bomberos(id);
GO
ALTER TABLE operaciones.guardias
    ADD CONSTRAINT CK_guard_cierreresumen CHECK (cierre_resumen IS NULL OR ISJSON(cierre_resumen) = 1);
GO

/* --- 4) asignacion_guardias: refuerzos/reemplazos + horarios reales + presencia --- */
ALTER TABLE operaciones.asignacion_guardias ADD
    tipo_participacion        NVARCHAR(20) NOT NULL CONSTRAINT DF_asigguard_tipopart DEFAULT 'TITULAR',
    reemplaza_asignacion_id   UNIQUEIDENTIFIER NULL,
    hora_entrada              DATETIMEOFFSET(3) NULL,
    hora_salida               DATETIMEOFFSET(3) NULL,
    estado_presencia          NVARCHAR(30) NULL,
    motivo                    NVARCHAR(MAX) NULL;
GO
ALTER TABLE operaciones.asignacion_guardias
    ADD CONSTRAINT CK_asigguard_tipopart CHECK (tipo_participacion IN ('TITULAR','REFUERZO','REEMPLAZO'));
GO
ALTER TABLE operaciones.asignacion_guardias
    ADD CONSTRAINT FK_asigguard_reemplaza FOREIGN KEY (reemplaza_asignacion_id) REFERENCES operaciones.asignacion_guardias(id);
GO

/* --- 5) Pernoctantes (seccion 8: pernoctar != estar de guardia) --- */
CREATE TABLE operaciones.pernoctes (
    id             UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_pernocte_id DEFAULT NEWSEQUENTIALID(),
    guardia_id     UNIQUEIDENTIFIER NULL,
    fecha          DATE NOT NULL,
    bombero_id     UNIQUEIDENTIFIER NOT NULL,
    hora_entrada   DATETIMEOFFSET(3) NULL,
    hora_salida    DATETIMEOFFSET(3) NULL,
    motivo         NVARCHAR(MAX) NULL,
    observacion    NVARCHAR(MAX) NULL,
    creado_en      DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_pernocte_creado DEFAULT SYSDATETIMEOFFSET(),
    creado_por     UNIQUEIDENTIFIER NULL,
    CONSTRAINT PK_pernoctes PRIMARY KEY CLUSTERED (id),
    CONSTRAINT FK_pernocte_guardia FOREIGN KEY (guardia_id) REFERENCES operaciones.guardias(id) ON DELETE SET NULL,
    CONSTRAINT FK_pernocte_bombero FOREIGN KEY (bombero_id) REFERENCES personal.bomberos(id)
);
GO
CREATE INDEX IX_pernoctes_fecha ON operaciones.pernoctes(fecha);
GO

/* --- 6) Condicion de estacion (checklist, seccion 10) --- */
CREATE TABLE operaciones.inspecciones_estacion (
    id             UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_inspest_id DEFAULT NEWSEQUENTIALID(),
    guardia_id     UNIQUEIDENTIFIER NOT NULL,
    sector         UNIQUEIDENTIFIER NOT NULL,
    estado         NVARCHAR(10) NOT NULL,
    observacion    NVARCHAR(MAX) NULL,
    responsable_id UNIQUEIDENTIFIER NULL,
    creado_en      DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_inspest_creado DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_inspecciones_estacion PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_inspest_estado CHECK (estado IN ('OK','NO_OK')),
    CONSTRAINT FK_inspest_guardia FOREIGN KEY (guardia_id) REFERENCES operaciones.guardias(id) ON DELETE CASCADE,
    CONSTRAINT FK_inspest_sector FOREIGN KEY (sector) REFERENCES organizacion.parametros(id),
    CONSTRAINT FK_inspest_responsable FOREIGN KEY (responsable_id) REFERENCES personal.bomberos(id)
);
GO

/* --- 7) Novedades manuales (seccion 9 y 21 -- la bitacora completa se
   arma en la Fase 4 combinando esto con otras tablas, sin duplicar) --- */
CREATE TABLE operaciones.novedades_guardia (
    id               UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_novguard_id DEFAULT NEWSEQUENTIALID(),
    guardia_id       UNIQUEIDENTIFIER NOT NULL,
    fecha_hora       DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_novguard_fecha DEFAULT SYSDATETIMEOFFSET(),
    bombero_id       UNIQUEIDENTIFIER NULL,
    texto            NVARCHAR(MAX) NOT NULL,
    creado_en        DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_novguard_creado DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_novedades_guardia PRIMARY KEY CLUSTERED (id),
    CONSTRAINT FK_novguard_guardia FOREIGN KEY (guardia_id) REFERENCES operaciones.guardias(id) ON DELETE CASCADE,
    CONSTRAINT FK_novguard_bombero FOREIGN KEY (bombero_id) REFERENCES personal.bomberos(id)
);
GO

/* --- 8) Requisitos de rol (elegibilidad configurable, seccion 7 --
   "estas reglas deben ser configurables y no estar quemadas en el
   frontend"). Un bombero califica para un rol si coincide con
   ALGUNA fila configurada para ese rol (OR entre filas, AND entre
   las columnas no nulas de una fila). --- */
CREATE TABLE operaciones.requisitos_rol_guardia (
    id                        UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_reqrol_id DEFAULT NEWSEQUENTIALID(),
    rol                       NVARCHAR(30) NOT NULL,
    cargo_id_requerido        UNIQUEIDENTIFIER NULL,
    rango_id_requerido        UNIQUEIDENTIFIER NULL,
    tipo_bombero_id_requerido UNIQUEIDENTIFIER NULL,
    activo                    BIT NOT NULL CONSTRAINT DF_reqrol_activo DEFAULT 1,
    creado_en                 DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_reqrol_creado DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_requisitos_rol_guardia PRIMARY KEY CLUSTERED (id),
    CONSTRAINT FK_reqrol_cargo FOREIGN KEY (cargo_id_requerido) REFERENCES organizacion.cargos(id),
    CONSTRAINT FK_reqrol_rango FOREIGN KEY (rango_id_requerido) REFERENCES organizacion.rangos(id),
    CONSTRAINT FK_reqrol_tipobombero FOREIGN KEY (tipo_bombero_id_requerido) REFERENCES personal.tipos_bombero(id)
);
GO

/* --- 9) Permisos nuevos (cerrar/reabrir guardia, gestionar requisitos de
   rol). El resto de las acciones de Guardias reutiliza el namespace
   guardias:* ya sembrado por seed-data.ts (ver/crear/editar/eliminar/
   asignar/cambiar/reemplazar/calendario). --- */
INSERT INTO seguridad.permisos (nombre, recurso, accion, categoria)
SELECT v.nombre, v.recurso, v.accion, N'Guardias'
FROM (VALUES
    (N'guardias:cerrar',     N'guardias', N'cerrar'),
    (N'guardias:requisitos', N'guardias', N'requisitos')
) AS v(nombre, recurso, accion)
WHERE NOT EXISTS (SELECT 1 FROM seguridad.permisos p WHERE p.nombre = v.nombre);
GO

INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id FROM seguridad.roles r CROSS JOIN seguridad.permisos p
WHERE r.nombre = N'Administrador General' AND p.nombre IN ('guardias:cerrar','guardias:requisitos')
    AND NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol a WHERE a.rol_id = r.id AND a.permiso_id = p.id);
GO
