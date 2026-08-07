/* =============================================================
   SIGBO-CBVC | Migracion 007 - Esquema servicios
   ============================================================= */

/* TABLA: tipos_servicio (catalogo configurable) */
CREATE TABLE servicios.tipos_servicio (
    id                       UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_tser_id DEFAULT NEWSEQUENTIALID(),
    codigo                   NVARCHAR(20)  NOT NULL,
    nombre                   NVARCHAR(100) NOT NULL,
    descripcion              NVARCHAR(MAX) NULL,
    color                    NVARCHAR(7)   NOT NULL CONSTRAINT DF_tser_color DEFAULT '#3B82F6',
    icono                    NVARCHAR(50)  NULL,
    prioridad                INT           NOT NULL CONSTRAINT DF_tser_prio DEFAULT 0,
    requiere_ro              BIT           NOT NULL CONSTRAINT DF_tser_ro DEFAULT 0,
    requiere_vehiculo        BIT           NOT NULL CONSTRAINT DF_tser_veh DEFAULT 1,
    tiempo_estimado_minutos  INT           NULL,
    activo                   BIT           NOT NULL CONSTRAINT DF_tser_activo DEFAULT 1,
    metadata                 NVARCHAR(MAX) NULL,
    creado_en                DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_tser_creado DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_tipos_servicio PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_tipos_servicio_codigo UNIQUE (codigo),
    CONSTRAINT CK_tser_meta CHECK (metadata IS NULL OR ISJSON(metadata) = 1)
);
GO

/* TABLA: servicios (registro de cada servicio) */
CREATE TABLE servicios.servicios (
    id                     UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_ser_id DEFAULT NEWSEQUENTIALID(),
    tipo_servicio_id       UNIQUEIDENTIFIER NOT NULL,
    numero_servicio        NVARCHAR(20)  NOT NULL,
    fecha_hora_aviso       DATETIMEOFFSET(3) NOT NULL,
    fecha_hora_salida      DATETIMEOFFSET(3) NULL,
    fecha_hora_llegada     DATETIMEOFFSET(3) NULL,
    fecha_hora_fin         DATETIMEOFFSET(3) NULL,
    direccion              NVARCHAR(MAX) NOT NULL,
    ciudad                 NVARCHAR(100) NULL,
    coordenadas_lat        DECIMAL(10,8) NULL,
    coordenadas_lon        DECIMAL(11,8) NULL,
    descripcion            NVARCHAR(MAX) NULL,
    gravedad               NVARCHAR(20)  NULL,
    estado                 NVARCHAR(20)  NOT NULL CONSTRAINT DF_ser_estado DEFAULT 'REGISTRADO',
    vehiculo_principal_id  UNIQUEIDENTIFIER NULL,
    oficial_ro_id          UNIQUEIDENTIFIER NULL,
    jefe_servicio_id       UNIQUEIDENTIFIER NULL,
    kilometraje_salida     INT           NULL,
    kilometraje_llegada    INT           NULL,
    kilometraje_total      AS (kilometraje_llegada - kilometraje_salida) PERSISTED,
    combustible_usado      DECIMAL(10,2) NULL,
    tiempo_total_minutos   INT           NULL,
    informe                NVARCHAR(MAX) NULL,
    conclusiones           NVARCHAR(MAX) NULL,
    recomendaciones        NVARCHAR(MAX) NULL,
    fotos                  NVARCHAR(MAX) NOT NULL CONSTRAINT DF_ser_fotos DEFAULT N'[]',
    documentos              NVARCHAR(MAX) NOT NULL CONSTRAINT DF_ser_docs DEFAULT N'[]',
    creado_en              DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_ser_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en         DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_ser_act DEFAULT SYSDATETIMEOFFSET(),
    creado_por             UNIQUEIDENTIFIER NULL,
    CONSTRAINT PK_servicios PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_servicios_numero UNIQUE (numero_servicio),
    CONSTRAINT CK_ser_gravedad CHECK (gravedad IS NULL OR gravedad IN ('LEVE','MODERADA','GRAVE','CRITICA')),
    CONSTRAINT CK_ser_estado   CHECK (estado IN ('REGISTRADO','DESPACHADO','EN_CURSO','FINALIZADO','CANCELADO')),
    CONSTRAINT CK_ser_fotos CHECK (ISJSON(fotos) = 1),
    CONSTRAINT CK_ser_docs  CHECK (ISJSON(documentos) = 1)
);
GO

/* TABLA: personal_servicio (personal que participo en el servicio) */
CREATE TABLE servicios.personal_servicio (
    id              UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_perser_id DEFAULT NEWSEQUENTIALID(),
    servicio_id     UNIQUEIDENTIFIER NOT NULL,
    bombero_id      UNIQUEIDENTIFIER NOT NULL,
    rol             NVARCHAR(50)  NOT NULL,
    horas_servicio  INT           NOT NULL CONSTRAINT DF_perser_horas DEFAULT 0,
    observaciones   NVARCHAR(MAX) NULL,
    CONSTRAINT PK_personal_servicio PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_personal_servicio UNIQUE (servicio_id, bombero_id)
);
GO

/* TABLA: historial_servicios (GPS y eventos en tiempo real) */
CREATE TABLE servicios.historial_servicios (
    id                UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_hser_id DEFAULT NEWSEQUENTIALID(),
    servicio_id       UNIQUEIDENTIFIER NOT NULL,
    timestamp_evento  DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_hser_ts DEFAULT SYSDATETIMEOFFSET(),
    tipo_evento       NVARCHAR(30)  NOT NULL,
    latitud           DECIMAL(10,8) NULL,
    longitud          DECIMAL(11,8) NULL,
    velocidad_kmh     DECIMAL(5,2)  NULL,
    direccion         NVARCHAR(MAX) NULL,
    datos             NVARCHAR(MAX) NULL,
    creado_por        UNIQUEIDENTIFIER NULL,
    CONSTRAINT PK_historial_servicios PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_hser_tipo CHECK (tipo_evento IN ('SALIDA','LLEGADA','GPS','COMBUSTIBLE','INCIDENTE','FIN')),
    CONSTRAINT CK_hser_datos CHECK (datos IS NULL OR ISJSON(datos) = 1)
);
GO
