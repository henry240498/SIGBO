SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

/* =============================================================
   SIGBO-CBVC | Migracion 020 - Modulo Asistencia

   Reutiliza y extiende las tablas de operaciones/academia que ya
   existian sin modulo de backend (operaciones.eventos_asistencia,
   operaciones.marcaciones_asistencia, operaciones.guardias,
   operaciones.asignacion_guardias, operaciones.cambios_guardias),
   en vez de crear tablas paralelas. Todas verificadas vacias (0
   filas) antes de escribir esta migracion, por lo que los cambios
   estructurales no pierden datos.

   Multi-institucion: se agrega institucion_id NULLABLE (sin FK, no
   existe todavia una tabla instituciones) a las tablas de este
   modulo como campo preparado para una futura iniciativa transversal
   de multi-tenant en SIGBO -- no se implementa scoping real ahora.
   ============================================================= */

/* --- 1) Tipos de evento de asistencia parametrizables ---------- */
ALTER TABLE organizacion.parametros DROP CONSTRAINT CK_param_tipo;
GO
ALTER TABLE organizacion.parametros ADD CONSTRAINT CK_param_tipo CHECK (tipo IN (
    'PAIS','DEPARTAMENTO','CIUDAD','BARRIO','PROFESION','IDIOMA','NIVEL_IDIOMA',
    'GRUPO_SANGUINEO','FACTOR_RH','TIPO_SEGURO','ASEGURADORA','TIPO_EVENTO_ASISTENCIA'
));
GO

INSERT INTO organizacion.parametros (tipo, nombre, nombre_normalizado, orden)
SELECT v.tipo, v.nombre, v.nombre_normalizado, v.orden FROM (VALUES
    (N'TIPO_EVENTO_ASISTENCIA', N'Guardia',                 N'guardia',                 1),
    (N'TIPO_EVENTO_ASISTENCIA', N'Reunion',                 N'reunion',                 2),
    (N'TIPO_EVENTO_ASISTENCIA', N'Capacitacion',             N'capacitacion',            3),
    (N'TIPO_EVENTO_ASISTENCIA', N'Academia Basica',          N'academia basica',         4),
    (N'TIPO_EVENTO_ASISTENCIA', N'Academia Intermedia',      N'academia intermedia',     5),
    (N'TIPO_EVENTO_ASISTENCIA', N'Academia Avanzada',        N'academia avanzada',       6),
    (N'TIPO_EVENTO_ASISTENCIA', N'Actividad Institucional',  N'actividad institucional', 7),
    (N'TIPO_EVENTO_ASISTENCIA', N'Evento Especial',          N'evento especial',         8),
    (N'TIPO_EVENTO_ASISTENCIA', N'Otro',                     N'otro',                    9)
) AS v(tipo, nombre, nombre_normalizado, orden)
WHERE NOT EXISTS (SELECT 1 FROM organizacion.parametros p WHERE p.tipo = v.tipo AND p.nombre_normalizado = v.nombre_normalizado AND p.padre_id IS NULL);
GO

/* --- 2) eventos_asistencia: tipo parametrizado + institucion --- */
ALTER TABLE operaciones.eventos_asistencia DROP CONSTRAINT CK_evasis_tipo;
GO
ALTER TABLE operaciones.eventos_asistencia DROP COLUMN tipo;
GO
ALTER TABLE operaciones.eventos_asistencia ADD
    tipo_evento_id  UNIQUEIDENTIFIER NULL,
    institucion_id  UNIQUEIDENTIFIER NULL;
GO
ALTER TABLE operaciones.eventos_asistencia
    ADD CONSTRAINT FK_evasis_tipoevento FOREIGN KEY (tipo_evento_id) REFERENCES organizacion.parametros(id);
GO

/* --- 3) marcaciones_asistencia: evento opcional + fuente + trazabilidad de importacion --- */
ALTER TABLE operaciones.marcaciones_asistencia DROP CONSTRAINT FK_marc_evento;
GO
ALTER TABLE operaciones.marcaciones_asistencia ALTER COLUMN evento_id UNIQUEIDENTIFIER NULL;
GO
ALTER TABLE operaciones.marcaciones_asistencia
    ADD CONSTRAINT FK_marc_evento FOREIGN KEY (evento_id) REFERENCES operaciones.eventos_asistencia(id) ON DELETE CASCADE;
GO

ALTER TABLE operaciones.marcaciones_asistencia ADD
    fuente                 NVARCHAR(30) NOT NULL CONSTRAINT DF_marc_fuente DEFAULT 'MANUAL',
    registrado_por         UNIQUEIDENTIFIER NULL,
    motivo                 NVARCHAR(MAX) NULL,
    importacion_id         UNIQUEIDENTIFIER NULL,
    dato_original          NVARCHAR(MAX) NULL,
    codigo_original_excel  NVARCHAR(50) NULL,
    fila_excel             INT NULL;
GO
ALTER TABLE operaciones.marcaciones_asistencia
    ADD CONSTRAINT CK_marc_fuente CHECK (fuente IN
        ('MARCADOR_DIGITAL','MANUAL','IMPORTACION_EXCEL','EVENTO','GUARDIA','OTRO'));
GO

/* --- 4) participantes_externos (personas no pertenecientes a Personal) --- */
CREATE TABLE operaciones.participantes_externos (
    id                       UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_extasis_id DEFAULT NEWSEQUENTIALID(),
    cedula                   NVARCHAR(20)  NULL,
    nombre                   NVARCHAR(100) NOT NULL,
    apellido                 NVARCHAR(100) NULL,
    celular                  NVARCHAR(20)  NULL,
    institucion_procedencia  NVARCHAR(150) NULL,
    observacion              NVARCHAR(MAX) NULL,
    institucion_id           UNIQUEIDENTIFIER NULL,
    creado_en                DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_extasis_creado DEFAULT SYSDATETIMEOFFSET(),
    creado_por               UNIQUEIDENTIFIER NULL,
    CONSTRAINT PK_participantes_externos PRIMARY KEY CLUSTERED (id)
);
GO

/* --- 5) participantes_evento (asistencia A un evento, distinta de la marcacion fisica) --- */
CREATE TABLE operaciones.participantes_evento (
    id                      UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_partev_id DEFAULT NEWSEQUENTIALID(),
    evento_id               UNIQUEIDENTIFIER NOT NULL,
    bombero_id              UNIQUEIDENTIFIER NULL,
    participante_externo_id UNIQUEIDENTIFIER NULL,
    participante_id         AS (COALESCE(bombero_id, participante_externo_id)) PERSISTED,
    hora_real_inicio        DATETIMEOFFSET(3) NULL,
    hora_real_fin           DATETIMEOFFSET(3) NULL,
    duracion_minutos        AS (CASE WHEN hora_real_inicio IS NOT NULL AND hora_real_fin IS NOT NULL
                                      THEN DATEDIFF(MINUTE, hora_real_inicio, hora_real_fin) END) PERSISTED,
    porcentaje_participacion DECIMAL(5,2) NULL,
    estado_participacion    NVARCHAR(20)  NOT NULL CONSTRAINT DF_partev_estado DEFAULT 'NO_REGISTRADA',
    fuente                  NVARCHAR(30)  NOT NULL CONSTRAINT DF_partev_fuente DEFAULT 'MANUAL',
    registrado_por          UNIQUEIDENTIFIER NULL,
    observacion             NVARCHAR(MAX) NULL,
    institucion_id          UNIQUEIDENTIFIER NULL,
    creado_en               DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_partev_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en          DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_partev_act DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_participantes_evento PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_participantes_evento UNIQUE (evento_id, participante_id),
    CONSTRAINT CK_partev_estado CHECK (estado_participacion IN
        ('COMPLETA','PARCIAL','NO_REGISTRADA','AUSENTE_CONFIRMADO')),
    CONSTRAINT CK_partev_fuente CHECK (fuente IN
        ('MARCADOR_DIGITAL','MANUAL','IMPORTACION_EXCEL','EVENTO','GUARDIA','OTRO')),
    CONSTRAINT CK_partev_participante CHECK (
        (bombero_id IS NOT NULL AND participante_externo_id IS NULL) OR
        (bombero_id IS NULL AND participante_externo_id IS NOT NULL)
    ),
    CONSTRAINT FK_partev_evento   FOREIGN KEY (evento_id)               REFERENCES operaciones.eventos_asistencia(id) ON DELETE CASCADE,
    CONSTRAINT FK_partev_bombero  FOREIGN KEY (bombero_id)              REFERENCES personal.bomberos(id),
    CONSTRAINT FK_partev_externo  FOREIGN KEY (participante_externo_id) REFERENCES operaciones.participantes_externos(id)
);
GO
CREATE INDEX IX_partev_evento ON operaciones.participantes_evento(evento_id);
CREATE INDEX IX_partev_bombero ON operaciones.participantes_evento(bombero_id);
GO

/* --- 6) guardias: institucion preparada --- */
ALTER TABLE operaciones.guardias ADD institucion_id UNIQUEIDENTIFIER NULL;
GO

/* --- 7) tolerancias_asistencia (parametrizable, NO codificado en el backend) --- */
CREATE TABLE operaciones.tolerancias_asistencia (
    id                          UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_tolasis_id DEFAULT NEWSEQUENTIALID(),
    tipo_evento_id              UNIQUEIDENTIFIER NULL,
    minutos_tolerancia_entrada  INT NOT NULL CONSTRAINT DF_tolasis_ent DEFAULT 0,
    minutos_tolerancia_salida   INT NOT NULL CONSTRAINT DF_tolasis_sal DEFAULT 0,
    estado                      NVARCHAR(20) NOT NULL CONSTRAINT DF_tolasis_estado DEFAULT 'ACTIVO',
    institucion_id              UNIQUEIDENTIFIER NULL,
    creado_en                   DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_tolasis_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en              DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_tolasis_act DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_tolerancias_asistencia PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_tolasis_estado CHECK (estado IN ('ACTIVO','INACTIVO')),
    CONSTRAINT FK_tolasis_tipoevento FOREIGN KEY (tipo_evento_id) REFERENCES organizacion.parametros(id)
);
GO

/* --- 8) importaciones_marcador (cabecera) + filas (staging/preview) --- */
CREATE TABLE operaciones.importaciones_marcador (
    id                            UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_impmarc_id DEFAULT NEWSEQUENTIALID(),
    archivo_nombre                NVARCHAR(255) NOT NULL,
    archivo_hash                  CHAR(64) NOT NULL,
    archivo_url                   NVARCHAR(MAX) NULL,
    usuario_id                    UNIQUEIDENTIFIER NOT NULL,
    fecha_importacion             DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_impmarc_fecha DEFAULT SYSDATETIMEOFFSET(),
    hojas_encontradas             INT NOT NULL CONSTRAINT DF_impmarc_hojas DEFAULT 0,
    registros_encontrados         INT NOT NULL CONSTRAINT DF_impmarc_enc DEFAULT 0,
    registros_reconocidos         INT NOT NULL CONSTRAINT DF_impmarc_reco DEFAULT 0,
    registros_no_identificados    INT NOT NULL CONSTRAINT DF_impmarc_noident DEFAULT 0,
    registros_duplicados          INT NOT NULL CONSTRAINT DF_impmarc_dup DEFAULT 0,
    registros_con_inconsistencias INT NOT NULL CONSTRAINT DF_impmarc_incons DEFAULT 0,
    registros_importados          INT NULL,
    estado                        NVARCHAR(20) NOT NULL CONSTRAINT DF_impmarc_estado DEFAULT 'ANALIZADO',
    institucion_id                UNIQUEIDENTIFIER NULL,
    CONSTRAINT PK_importaciones_marcador PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_impmarc_hash UNIQUE (archivo_hash),
    CONSTRAINT CK_impmarc_estado CHECK (estado IN ('ANALIZADO','CONFIRMADO','CANCELADO'))
);
GO

CREATE TABLE operaciones.importaciones_marcador_filas (
    id                       UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_impfila_id DEFAULT NEWSEQUENTIALID(),
    importacion_id           UNIQUEIDENTIFIER NOT NULL,
    hoja_excel               NVARCHAR(100) NULL,
    fila_excel               INT NULL,
    dato_original            NVARCHAR(MAX) NOT NULL,
    codigo_detectado         NVARCHAR(50) NULL,
    bombero_id_resuelto      UNIQUEIDENTIFIER NULL,
    tipo_marcacion_detectado NVARCHAR(20) NULL,
    timestamp_detectado      DATETIMEOFFSET(3) NULL,
    estado_fila              NVARCHAR(20) NOT NULL,
    motivo                   NVARCHAR(MAX) NULL,
    marcacion_id_generada    UNIQUEIDENTIFIER NULL,
    CONSTRAINT PK_importaciones_marcador_filas PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_impfila_estado CHECK (estado_fila IN
        ('RECONOCIDO','NO_IDENTIFICADO','DUPLICADO','YA_IMPORTADO','INCONSISTENTE')),
    CONSTRAINT FK_impfila_importacion FOREIGN KEY (importacion_id) REFERENCES operaciones.importaciones_marcador(id) ON DELETE CASCADE,
    CONSTRAINT FK_impfila_bombero     FOREIGN KEY (bombero_id_resuelto) REFERENCES personal.bomberos(id)
);
GO
CREATE INDEX IX_impfila_importacion ON operaciones.importaciones_marcador_filas(importacion_id);
GO

ALTER TABLE operaciones.marcaciones_asistencia
    ADD CONSTRAINT FK_marc_importacion FOREIGN KEY (importacion_id) REFERENCES operaciones.importaciones_marcador(id);
GO

/* --- 9) cambios_guardias: sin cambios estructurales, solo se registra
   la entidad TypeORM en backend (tabla ya definida en 005_operaciones.sql). --- */

/* --- 10) Permisos nuevos --- */
INSERT INTO seguridad.permisos (nombre, recurso, accion, categoria)
SELECT v.nombre, v.recurso, v.accion, N'Asistencia'
FROM (VALUES
    (N'operaciones:asistencia_ver',      N'operaciones', N'asistencia_ver'),
    (N'operaciones:asistencia_crear',    N'operaciones', N'asistencia_crear'),
    (N'operaciones:asistencia_editar',   N'operaciones', N'asistencia_editar'),
    (N'operaciones:asistencia_eliminar', N'operaciones', N'asistencia_eliminar'),
    (N'operaciones:eventos_ver',         N'operaciones', N'eventos_ver'),
    (N'operaciones:eventos_crear',       N'operaciones', N'eventos_crear'),
    (N'operaciones:eventos_editar',      N'operaciones', N'eventos_editar'),
    (N'operaciones:eventos_eliminar',    N'operaciones', N'eventos_eliminar'),
    (N'operaciones:guardias_ver',        N'operaciones', N'guardias_ver'),
    (N'operaciones:guardias_crear',      N'operaciones', N'guardias_crear'),
    (N'operaciones:guardias_editar',     N'operaciones', N'guardias_editar'),
    (N'operaciones:importar_marcador',   N'operaciones', N'importar_marcador'),
    (N'operaciones:externos_ver',        N'operaciones', N'externos_ver'),
    (N'operaciones:externos_crear',      N'operaciones', N'externos_crear'),
    (N'operaciones:externos_editar',     N'operaciones', N'externos_editar')
) AS v(nombre, recurso, accion)
WHERE NOT EXISTS (SELECT 1 FROM seguridad.permisos p WHERE p.nombre = v.nombre);
GO

INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id FROM seguridad.roles r CROSS JOIN seguridad.permisos p
WHERE r.nombre = N'Administrador General' AND p.recurso = N'operaciones'
    AND NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol a WHERE a.rol_id = r.id AND a.permiso_id = p.id);
GO
