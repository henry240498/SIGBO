/* =============================================================
   SIGBO-CBVC | Migracion 005 - Esquema operaciones (asistencia y guardias)
   ============================================================= */

/* TABLA: eventos_asistencia (registro maestro de eventos) */
CREATE TABLE operaciones.eventos_asistencia (
    id             UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_evasis_id DEFAULT NEWSEQUENTIALID(),
    tipo           NVARCHAR(30)  NOT NULL,
    nombre         NVARCHAR(200) NOT NULL,
    descripcion    NVARCHAR(MAX) NULL,
    fecha_inicio   DATETIMEOFFSET(3) NOT NULL,
    fecha_fin      DATETIMEOFFSET(3) NOT NULL,
    ubicacion      NVARCHAR(200) NULL,
    responsable_id UNIQUEIDENTIFIER NULL,
    estado         NVARCHAR(20)  NOT NULL CONSTRAINT DF_evasis_estado DEFAULT 'PROGRAMADO',
    metadata       NVARCHAR(MAX) NULL,
    creado_en      DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_evasis_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_evasis_act DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_eventos_asistencia PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_evasis_tipo   CHECK (tipo IN ('GUARDIA','PRACTICA','CITACION','CURSO','ASAMBLEA','SERVICIO')),
    CONSTRAINT CK_evasis_estado CHECK (estado IN ('PROGRAMADO','EN_CURSO','FINALIZADO','CANCELADO')),
    CONSTRAINT CK_evasis_fechas CHECK (fecha_fin >= fecha_inicio),
    CONSTRAINT CK_evasis_meta   CHECK (metadata IS NULL OR ISJSON(metadata) = 1)
);
GO

/* TABLA: marcaciones_asistencia */
CREATE TABLE operaciones.marcaciones_asistencia (
    id                  UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_marc_id DEFAULT NEWSEQUENTIALID(),
    evento_id           UNIQUEIDENTIFIER NOT NULL,
    bombero_id          UNIQUEIDENTIFIER NOT NULL,
    tipo_marcacion      NVARCHAR(20)  NOT NULL,
    metodo              NVARCHAR(20)  NOT NULL,
    timestamp_marcacion DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_marc_ts DEFAULT SYSDATETIMEOFFSET(),
    latitud             DECIMAL(10,8) NULL,
    longitud            DECIMAL(11,8) NULL,
    precision_metros    INT           NULL,
    dispositivo         NVARCHAR(100) NULL,
    ip                  VARCHAR(45)   NULL,
    observaciones       NVARCHAR(MAX) NULL,
    verificado          BIT           NOT NULL CONSTRAINT DF_marc_verif DEFAULT 0,
    verificado_por      UNIQUEIDENTIFIER NULL,
    creado_en           DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_marc_creado DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_marcaciones_asistencia PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_marc_tipo   CHECK (tipo_marcacion IN ('ENTRADA','SALIDA')),
    CONSTRAINT CK_marc_metodo CHECK (metodo IN ('HUELLA','QR','PIN','RFID','MANUAL','APP'))
);
GO

/* TABLA: guardias */
CREATE TABLE operaciones.guardias (
    id              UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_guard_id DEFAULT NEWSEQUENTIALID(),
    fecha           DATE          NOT NULL,
    turno           NVARCHAR(20)  NOT NULL,
    hora_inicio     TIME(0)       NOT NULL,
    hora_fin        TIME(0)       NOT NULL,
    tipo            NVARCHAR(20)  NOT NULL CONSTRAINT DF_guard_tipo DEFAULT 'ORDINARIA',
    estado          NVARCHAR(20)  NOT NULL CONSTRAINT DF_guard_estado DEFAULT 'PROGRAMADA',
    jefe_guardia_id UNIQUEIDENTIFIER NULL,
    observaciones   NVARCHAR(MAX) NULL,
    creado_en       DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_guard_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en  DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_guard_act DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_guardias PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_guard_turno  CHECK (turno IN ('DIURNO','NOCTURNO','COMPLETO')),
    CONSTRAINT CK_guard_tipo   CHECK (tipo IN ('ORDINARIA','ESPECIAL','EXTRAORDINARIA')),
    CONSTRAINT CK_guard_estado CHECK (estado IN ('PROGRAMADA','EN_CURSO','FINALIZADA','CANCELADA','REEMPLAZADA'))
);
GO

/* TABLA: asignacion_guardias (bomberos en cada guardia) */
CREATE TABLE operaciones.asignacion_guardias (
    id               UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_asigguard_id DEFAULT NEWSEQUENTIALID(),
    guardia_id       UNIQUEIDENTIFIER NOT NULL,
    bombero_id       UNIQUEIDENTIFIER NOT NULL,
    rol              NVARCHAR(50)  NULL,
    estado           NVARCHAR(20)  NOT NULL CONSTRAINT DF_asigguard_estado DEFAULT 'ASIGNADO',
    fecha_asignacion DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_asigguard_fecha DEFAULT SYSDATETIMEOFFSET(),
    asignado_por     UNIQUEIDENTIFIER NULL,
    observaciones    NVARCHAR(MAX) NULL,
    CONSTRAINT PK_asignacion_guardias PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_asignacion_guardias UNIQUE (guardia_id, bombero_id),
    CONSTRAINT CK_asigguard_estado CHECK (estado IN ('ASIGNADO','CONFIRMADO','REEMPLAZADO','AUSENTE'))
);
GO

/* TABLA: cambios_guardias (solicitudes de cambio/reemplazo) */
CREATE TABLE operaciones.cambios_guardias (
    id                     UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_cambguard_id DEFAULT NEWSEQUENTIALID(),
    asignacion_original_id UNIQUEIDENTIFIER NOT NULL,
    bombero_nuevo_id       UNIQUEIDENTIFIER NOT NULL,
    solicitante_id         UNIQUEIDENTIFIER NOT NULL,
    fecha_solicitud        DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_cambguard_fsol DEFAULT SYSDATETIMEOFFSET(),
    fecha_cambio           DATE          NULL,
    motivo                 NVARCHAR(MAX) NULL,
    estado                 NVARCHAR(20)  NOT NULL CONSTRAINT DF_cambguard_estado DEFAULT 'PENDIENTE',
    aprobado_por           UNIQUEIDENTIFIER NULL,
    fecha_aprobacion       DATETIMEOFFSET(3) NULL,
    observaciones          NVARCHAR(MAX) NULL,
    CONSTRAINT PK_cambios_guardias PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_cambguard_estado CHECK (estado IN ('PENDIENTE','APROBADO','RECHAZADO','CANCELADO'))
);
GO
