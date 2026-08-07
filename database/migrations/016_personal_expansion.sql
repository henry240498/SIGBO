SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

/* =============================================================
   SIGBO-CBVC | Migracion 016 - Expansion del Modulo de Personal
   + Foja de Servicio Bomberil.

   Reutiliza tablas que ya existian sin modulo de backend
   (equipos.*, vehiculos.vehiculos, servicios.*, operaciones.*,
   academia.*) y agrega solo lo que genuinamente falta:
   condicion institucional, historial de trayectoria, codigo,
   idiomas, actividad profesional, vehiculos autorizados y
   fojas de servicio.
   ============================================================= */

/* --- 1) Normalizar datos existentes antes de ampliar el CHECK de estado --- */
ALTER TABLE personal.bomberos DROP CONSTRAINT CK_bomberos_estado;
GO

UPDATE personal.bomberos SET estado = 'LICENCIA'   WHERE estado = 'RESERVA';
UPDATE personal.bomberos SET estado = 'SUSPENDIDO' WHERE estado = 'INOPERATIVO';
GO

ALTER TABLE personal.bomberos
    ADD CONSTRAINT CK_bomberos_estado CHECK (estado IN
        ('ASPIRANTE','ACTIVO','SUSPENDIDO','LICENCIA','RETIRADO','FALLECIDO','HONORARIO'));
GO

/* --- 2) Nuevas columnas en bomberos --- */
ALTER TABLE personal.bomberos ADD
    condicion_institucional NVARCHAR(30)  NULL,
    brigada_id              UNIQUEIDENTIFIER NULL,
    departamento_id         UNIQUEIDENTIFIER NULL,
    unidad_id               UNIQUEIDENTIFIER NULL,
    pais                    NVARCHAR(50)  NULL CONSTRAINT DF_bomberos_pais DEFAULT 'Paraguay',
    barrio                  NVARCHAR(100) NULL,
    pasaporte               NVARCHAR(30)  NULL,
    fecha_incorporacion     DATE          NULL,
    fecha_juramento         DATE          NULL,
    firma_digital_url       NVARCHAR(MAX) NULL;
GO

ALTER TABLE personal.bomberos
    ADD CONSTRAINT CK_bomberos_condicion CHECK (condicion_institucional IS NULL OR condicion_institucional IN
        ('INCORPORADO','COMBATIENTE','APOYO_ECONOMICO','HONORARIO'));
GO

ALTER TABLE personal.bomberos
    ADD CONSTRAINT FK_bomberos_brigada      FOREIGN KEY (brigada_id)      REFERENCES organizacion.brigadas(id)      ON DELETE SET NULL,
        CONSTRAINT FK_bomberos_departamento FOREIGN KEY (departamento_id) REFERENCES organizacion.departamentos(id) ON DELETE SET NULL,
        CONSTRAINT FK_bomberos_unidad       FOREIGN KEY (unidad_id)       REFERENCES organizacion.unidades(id)      ON DELETE SET NULL;
GO

CREATE INDEX IX_bomberos_brigada_id      ON personal.bomberos(brigada_id);
CREATE INDEX IX_bomberos_departamento_id ON personal.bomberos(departamento_id);
CREATE INDEX IX_bomberos_unidad_id       ON personal.bomberos(unidad_id);
CREATE INDEX IX_bomberos_condicion       ON personal.bomberos(condicion_institucional);
GO

/* --- 3) Historial de codigo institucional (numero_bombero) --- */
CREATE TABLE personal.historial_codigo (
    id               UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_histcod_id DEFAULT NEWSEQUENTIALID(),
    bombero_id       UNIQUEIDENTIFIER NOT NULL,
    codigo_anterior  NVARCHAR(20)  NOT NULL,
    codigo_nuevo     NVARCHAR(20)  NOT NULL,
    motivo           NVARCHAR(MAX) NULL,
    fecha_cambio     DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_histcod_fecha DEFAULT SYSDATETIMEOFFSET(),
    cambiado_por     UNIQUEIDENTIFIER NULL,
    CONSTRAINT PK_historial_codigo PRIMARY KEY CLUSTERED (id),
    CONSTRAINT FK_histcod_bombero FOREIGN KEY (bombero_id) REFERENCES personal.bomberos(id) ON DELETE CASCADE
);
GO

/* --- 4) Condicion institucional: 4 tablas de detalle 1:1 --- */
CREATE TABLE personal.condicion_incorporado (
    id                    UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_condinc_id DEFAULT NEWSEQUENTIALID(),
    bombero_id            UNIQUEIDENTIFIER NOT NULL,
    fecha_incorporacion   DATE          NULL,
    formacion_inicial     NVARCHAR(MAX) NULL,
    cursos_realizados     NVARCHAR(MAX) NULL,
    evaluaciones          NVARCHAR(MAX) NULL,
    estado_preparacion    NVARCHAR(50)  NULL,
    fecha_habilitacion    DATE          NULL,
    actualizado_en        DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_condinc_act DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_condicion_incorporado PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_condicion_incorporado_bombero UNIQUE (bombero_id),
    CONSTRAINT FK_condinc_bombero FOREIGN KEY (bombero_id) REFERENCES personal.bomberos(id) ON DELETE CASCADE
);
GO

CREATE TABLE personal.condicion_combatiente (
    id                     UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_condcomb_id DEFAULT NEWSEQUENTIALID(),
    bombero_id             UNIQUEIDENTIFIER NOT NULL,
    disponibilidad_operativa BIT         NOT NULL CONSTRAINT DF_condcomb_disp DEFAULT 1,
    nivel_entrenamiento    NVARCHAR(50)  NULL,
    horas_operativas       INT           NULL,
    actualizado_en         DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_condcomb_act DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_condicion_combatiente PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_condicion_combatiente_bombero UNIQUE (bombero_id),
    CONSTRAINT FK_condcomb_bombero FOREIGN KEY (bombero_id) REFERENCES personal.bomberos(id) ON DELETE CASCADE
);
GO

CREATE TABLE personal.condicion_apoyo_economico (
    id             UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_condape_id DEFAULT NEWSEQUENTIALID(),
    bombero_id     UNIQUEIDENTIFIER NOT NULL,
    comision       NVARCHAR(200) NULL,
    funcion        NVARCHAR(200) NULL,
    responsabilidades NVARCHAR(MAX) NULL,
    actividades    NVARCHAR(MAX) NULL,
    periodo_inicio DATE          NULL,
    periodo_fin    DATE          NULL,
    actualizado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_condape_act DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_condicion_apoyo_economico PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_condicion_apoyo_economico_bombero UNIQUE (bombero_id),
    CONSTRAINT FK_condape_bombero FOREIGN KEY (bombero_id) REFERENCES personal.bomberos(id) ON DELETE CASCADE
);
GO

CREATE TABLE personal.condicion_honorario (
    id                UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_condhon_id DEFAULT NEWSEQUENTIALID(),
    bombero_id        UNIQUEIDENTIFIER NOT NULL,
    fecha_nombramiento DATE         NULL,
    motivo            NVARCHAR(MAX) NULL,
    resolucion        NVARCHAR(100) NULL,
    documento_url     NVARCHAR(MAX) NULL,
    observaciones     NVARCHAR(MAX) NULL,
    actualizado_en    DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_condhon_act DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_condicion_honorario PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_condicion_honorario_bombero UNIQUE (bombero_id),
    CONSTRAINT FK_condhon_bombero FOREIGN KEY (bombero_id) REFERENCES personal.bomberos(id) ON DELETE CASCADE
);
GO

/* --- 5) Historial institucional (log de movimientos, append-only) --- */
CREATE TABLE personal.historial_institucional (
    id                    UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_histinst_id DEFAULT NEWSEQUENTIALID(),
    bombero_id            UNIQUEIDENTIFIER NOT NULL,
    tipo_movimiento       NVARCHAR(30)  NOT NULL,
    fecha                 DATE          NOT NULL,
    usuario_responsable_id UNIQUEIDENTIFIER NULL,
    motivo                NVARCHAR(MAX) NULL,
    observacion           NVARCHAR(MAX) NULL,
    documento_url         NVARCHAR(MAX) NULL,
    referencia_tabla      NVARCHAR(100) NULL,
    referencia_id         UNIQUEIDENTIFIER NULL,
    creado_en             DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_histinst_creado DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_historial_institucional PRIMARY KEY CLUSTERED (id),
    CONSTRAINT FK_histinst_bombero FOREIGN KEY (bombero_id) REFERENCES personal.bomberos(id) ON DELETE CASCADE,
    CONSTRAINT CK_histinst_tipo CHECK (tipo_movimiento IN
        ('INGRESO','ASCENSO','CAMBIO_RANGO','CAMBIO_CARGO','CAMBIO_COMPANIA','CAMBIO_CONDICION',
         'CAMBIO_CODIGO','LICENCIA','SUSPENSION','RECONOCIMIENTO','SANCION','RETIRO'))
);
GO
CREATE INDEX IX_historial_institucional_bombero ON personal.historial_institucional(bombero_id, fecha DESC);
GO

/* --- 6) Actividad profesional (1:1) --- */
CREATE TABLE personal.actividad_profesional (
    id                       UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_actprof_id DEFAULT NEWSEQUENTIALID(),
    bombero_id               UNIQUEIDENTIFIER NOT NULL,
    profesion                NVARCHAR(150) NULL,
    empresa                  NVARCHAR(150) NULL,
    cargo_laboral             NVARCHAR(150) NULL,
    experiencia               NVARCHAR(MAX) NULL,
    actividades_relacionadas NVARCHAR(MAX) NULL,
    actualizado_en           DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_actprof_act DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_actividad_profesional PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_actividad_profesional_bombero UNIQUE (bombero_id),
    CONSTRAINT FK_actprof_bombero FOREIGN KEY (bombero_id) REFERENCES personal.bomberos(id) ON DELETE CASCADE
);
GO

/* --- 7) Idiomas (lista) --- */
CREATE TABLE personal.idiomas_bombero (
    id            UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_idioma_id DEFAULT NEWSEQUENTIALID(),
    bombero_id    UNIQUEIDENTIFIER NOT NULL,
    idioma        NVARCHAR(50) NOT NULL,
    nivel         NVARCHAR(30) NULL,
    certificacion NVARCHAR(150) NULL,
    creado_en     DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_idioma_creado DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_idiomas_bombero PRIMARY KEY CLUSTERED (id),
    CONSTRAINT FK_idioma_bombero FOREIGN KEY (bombero_id) REFERENCES personal.bomberos(id) ON DELETE CASCADE
);
GO
CREATE INDEX IX_idiomas_bombero_bombero ON personal.idiomas_bombero(bombero_id);
GO

/* --- 8) Vehiculos autorizados (lista, referencia el catalogo ya existente) --- */
CREATE TABLE personal.vehiculos_autorizados (
    id                   UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_vehaut_id DEFAULT NEWSEQUENTIALID(),
    bombero_id           UNIQUEIDENTIFIER NOT NULL,
    vehiculo_id          UNIQUEIDENTIFIER NOT NULL,
    categoria            NVARCHAR(50)  NULL,
    fecha_autorizacion   DATE          NULL,
    vigencia             DATE          NULL,
    capacitaciones       NVARCHAR(MAX) NULL,
    creado_en            DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_vehaut_creado DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_vehiculos_autorizados PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_vehiculos_autorizados UNIQUE (bombero_id, vehiculo_id),
    CONSTRAINT FK_vehaut_bombero  FOREIGN KEY (bombero_id)  REFERENCES personal.bomberos(id)   ON DELETE CASCADE,
    CONSTRAINT FK_vehaut_vehiculo FOREIGN KEY (vehiculo_id) REFERENCES vehiculos.vehiculos(id)  ON DELETE CASCADE
);
GO
CREATE INDEX IX_vehiculos_autorizados_bombero ON personal.vehiculos_autorizados(bombero_id);
GO

/* --- 9) Fojas de servicio (snapshot congelado por anio, append-only) --- */
CREATE TABLE personal.fojas_servicio (
    id               UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_foja_id DEFAULT NEWSEQUENTIALID(),
    bombero_id       UNIQUEIDENTIFIER NOT NULL,
    anio             INT           NOT NULL,
    generado_en      DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_foja_generado DEFAULT SYSDATETIMEOFFSET(),
    generado_por     UNIQUEIDENTIFIER NULL,
    contenido_json   NVARCHAR(MAX) NOT NULL,
    archivo_pdf_url  NVARCHAR(MAX) NULL,
    archivo_docx_url NVARCHAR(MAX) NULL,
    CONSTRAINT PK_fojas_servicio PRIMARY KEY CLUSTERED (id),
    CONSTRAINT FK_foja_bombero FOREIGN KEY (bombero_id) REFERENCES personal.bomberos(id) ON DELETE CASCADE,
    CONSTRAINT CK_foja_contenido CHECK (ISJSON(contenido_json) = 1)
);
GO
CREATE INDEX IX_fojas_servicio_bombero_anio ON personal.fojas_servicio(bombero_id, anio DESC, generado_en DESC);
GO

/* --- 10) Ampliar especialidades del bombero --- */
ALTER TABLE personal.bombero_especialidades ADD
    nivel                   NVARCHAR(30)  NULL,
    institucion_certificadora NVARCHAR(200) NULL,
    vigencia                DATE          NULL;
GO

/* --- 11) Ampliar certificaciones para cubrir Formacion (cursos/seminarios/talleres/entrenamientos) --- */
ALTER TABLE personal.certificaciones DROP CONSTRAINT CK_cert_tipo;
GO
ALTER TABLE personal.certificaciones
    ADD CONSTRAINT CK_cert_tipo CHECK (tipo IN
        ('BASICO','INTERMEDIO','AVANZADO','ESPECIALIDAD','CURSO','SEMINARIO','TALLER','ENTRENAMIENTO'));
GO
ALTER TABLE personal.certificaciones ADD
    duracion_horas INT NULL,
    instructor     NVARCHAR(150) NULL;
GO

/* --- 12) Permisos nuevos --- */
INSERT INTO seguridad.permisos (nombre, recurso, accion, categoria)
SELECT v.nombre, v.recurso, v.accion, v.categoria
FROM (VALUES
    ('equipos:ver',               'equipos',   'ver',               'Equipos'),
    ('equipos:crear',             'equipos',   'crear',             'Equipos'),
    ('equipos:editar',            'equipos',   'editar',            'Equipos'),
    ('equipos:eliminar',          'equipos',   'eliminar',          'Equipos'),
    ('vehiculos:ver',             'vehiculos', 'ver',               'Vehiculos'),
    ('vehiculos:crear',           'vehiculos', 'crear',             'Vehiculos'),
    ('vehiculos:editar',          'vehiculos', 'editar',            'Vehiculos'),
    ('vehiculos:eliminar',        'vehiculos', 'eliminar',          'Vehiculos'),
    ('personal:generar_foja',     'personal',  'generar_foja',      'Personal')
) AS v(nombre, recurso, accion, categoria)
WHERE NOT EXISTS (SELECT 1 FROM seguridad.permisos p WHERE p.nombre = v.nombre);
GO

INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id
FROM seguridad.roles r
CROSS JOIN seguridad.permisos p
WHERE r.nombre = 'Administrador General'
  AND p.nombre IN ('equipos:ver','equipos:crear','equipos:editar','equipos:eliminar',
                    'vehiculos:ver','vehiculos:crear','vehiculos:editar','vehiculos:eliminar',
                    'personal:generar_foja')
  AND NOT EXISTS (
    SELECT 1 FROM seguridad.asignacion_permisos_rol apr
    WHERE apr.rol_id = r.id AND apr.permiso_id = p.id
  );
GO
