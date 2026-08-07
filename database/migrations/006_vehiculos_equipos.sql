/* =============================================================
   SIGBO-CBVC | Migracion 006 - Esquemas vehiculos y equipos
   ============================================================= */

/* TABLA: vehiculos.vehiculos */
CREATE TABLE vehiculos.vehiculos (
    id                       UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_veh_id DEFAULT NEWSEQUENTIALID(),
    numero_interno           NVARCHAR(20)  NOT NULL,
    tipo                     NVARCHAR(50)  NOT NULL,
    marca                    NVARCHAR(50)  NULL,
    modelo                   NVARCHAR(50)  NULL,
    anio                     INT           NULL,
    patente                  NVARCHAR(20)  NULL,
    color                    NVARCHAR(30)  NULL,
    numero_chasis            NVARCHAR(50)  NULL,
    numero_motor             NVARCHAR(50)  NULL,
    capacidad_carga          INT           NULL,
    capacidad_pasajeros      INT           NULL,
    kilometraje_actual       INT           NOT NULL CONSTRAINT DF_veh_km DEFAULT 0,
    combustible_actual       DECIMAL(10,2) NOT NULL CONSTRAINT DF_veh_comb DEFAULT 0,
    estado                   NVARCHAR(20)  NOT NULL CONSTRAINT DF_veh_estado DEFAULT 'OPERATIVO',
    ubicacion_actual         NVARCHAR(100) NULL,
    itv_fecha                DATE          NULL,
    itv_vencimiento          DATE          NULL,
    seguro_fecha             DATE          NULL,
    seguro_vencimiento       DATE          NULL,
    seguro_empresa           NVARCHAR(100) NULL,
    seguro_poliza            NVARCHAR(50)  NULL,
    ultimo_mantenimiento     DATE          NULL,
    proximo_mantenimiento    DATE          NULL,
    ultimo_cambio_aceite     DATE          NULL,
    ultimo_cambio_cubiertas  DATE          NULL,
    ultima_revision_bateria  DATE          NULL,
    qr_code                  NVARCHAR(200) NULL,
    fotos                    NVARCHAR(MAX) NOT NULL CONSTRAINT DF_veh_fotos DEFAULT N'[]',
    documentos               NVARCHAR(MAX) NOT NULL CONSTRAINT DF_veh_docs DEFAULT N'[]',
    metadata                 NVARCHAR(MAX) NULL,
    creado_en                DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_veh_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en           DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_veh_act DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_vehiculos PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_vehiculos_numero  UNIQUE (numero_interno),
    CONSTRAINT UQ_vehiculos_patente UNIQUE (patente),
    CONSTRAINT CK_veh_estado CHECK (estado IN ('OPERATIVO','EN_MANTENIMIENTO','FUERA_SERVICIO','BAJA')),
    CONSTRAINT CK_veh_fotos CHECK (ISJSON(fotos) = 1),
    CONSTRAINT CK_veh_docs  CHECK (ISJSON(documentos) = 1),
    CONSTRAINT CK_veh_meta  CHECK (metadata IS NULL OR ISJSON(metadata) = 1)
);
GO

/* TABLA: vehiculos.mantenimientos_vehiculos */
CREATE TABLE vehiculos.mantenimientos_vehiculos (
    id                    UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_mveh_id DEFAULT NEWSEQUENTIALID(),
    vehiculo_id           UNIQUEIDENTIFIER NOT NULL,
    tipo                  NVARCHAR(30)  NOT NULL,
    fecha                 DATE          NOT NULL,
    descripcion           NVARCHAR(MAX) NOT NULL,
    costo                 DECIMAL(15,2) NULL,
    kilometraje           INT           NULL,
    taller                NVARCHAR(100) NULL,
    responsable           NVARCHAR(100) NULL,
    proximo_mantenimiento DATE          NULL,
    archivo_url           NVARCHAR(MAX) NULL,
    creado_en             DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_mveh_creado DEFAULT SYSDATETIMEOFFSET(),
    creado_por            UNIQUEIDENTIFIER NULL,
    CONSTRAINT PK_mantenimientos_vehiculos PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_mveh_tipo CHECK (tipo IN ('PREVENTIVO','CORRECTIVO','EMERGENCIA','ITV','REPARACION'))
);
GO

/* TABLA: vehiculos.consumos_combustible */
CREATE TABLE vehiculos.consumos_combustible (
    id                  UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_comb_id DEFAULT NEWSEQUENTIALID(),
    vehiculo_id         UNIQUEIDENTIFIER NOT NULL,
    fecha               DATE          NOT NULL,
    galones             DECIMAL(10,2) NOT NULL,
    kilometraje_actual  INT           NOT NULL,
    tipo_combustible    NVARCHAR(20)  NOT NULL CONSTRAINT DF_comb_tipo DEFAULT 'DIESEL',
    costo               DECIMAL(15,2) NULL,
    proveedor           NVARCHAR(100) NULL,
    factura             NVARCHAR(50)  NULL,
    creado_en           DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_comb_creado DEFAULT SYSDATETIMEOFFSET(),
    creado_por          UNIQUEIDENTIFIER NULL,
    CONSTRAINT PK_consumos_combustible PRIMARY KEY CLUSTERED (id)
);
GO

/* TABLA: equipos.categorias_equipo */
CREATE TABLE equipos.categorias_equipo (
    id          UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_cateq_id DEFAULT NEWSEQUENTIALID(),
    nombre      NVARCHAR(100) NOT NULL,
    descripcion NVARCHAR(MAX) NULL,
    padre_id    UNIQUEIDENTIFIER NULL,
    activo      BIT           NOT NULL CONSTRAINT DF_cateq_activo DEFAULT 1,
    creado_en   DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_cateq_creado DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_categorias_equipo PRIMARY KEY CLUSTERED (id)
);
GO

/* TABLA: equipos.equipos (inventario completo) */
CREATE TABLE equipos.equipos (
    id               UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_eq_id DEFAULT NEWSEQUENTIALID(),
    categoria_id     UNIQUEIDENTIFIER NOT NULL,
    codigo_interno   NVARCHAR(50)  NOT NULL,
    nombre           NVARCHAR(200) NOT NULL,
    descripcion      NVARCHAR(MAX) NULL,
    marca            NVARCHAR(100) NULL,
    modelo           NVARCHAR(100) NULL,
    numero_serie     NVARCHAR(100) NULL,
    estado           NVARCHAR(20)  NOT NULL CONSTRAINT DF_eq_estado DEFAULT 'OPERATIVO',
    ubicacion        NVARCHAR(200) NULL,
    responsable_id   UNIQUEIDENTIFIER NULL,
    fecha_compra     DATE          NULL,
    fecha_vencimiento DATE         NULL,
    vida_util_meses  INT           NULL,
    qr_code          NVARCHAR(200) NULL,
    fotos            NVARCHAR(MAX) NOT NULL CONSTRAINT DF_eq_fotos DEFAULT N'[]',
    documentos       NVARCHAR(MAX) NOT NULL CONSTRAINT DF_eq_docs DEFAULT N'[]',
    metadata         NVARCHAR(MAX) NULL,
    creado_en        DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_eq_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en   DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_eq_act DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_equipos PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_equipos_codigo UNIQUE (codigo_interno),
    CONSTRAINT CK_eq_estado CHECK (estado IN ('OPERATIVO','EN_MANTENIMIENTO','DANIADO','BAJA','PRESTADO')),
    CONSTRAINT CK_eq_fotos CHECK (ISJSON(fotos) = 1),
    CONSTRAINT CK_eq_docs  CHECK (ISJSON(documentos) = 1),
    CONSTRAINT CK_eq_meta  CHECK (metadata IS NULL OR ISJSON(metadata) = 1)
);
GO

/* TABLA: equipos.mantenimientos_equipos */
CREATE TABLE equipos.mantenimientos_equipos (
    id                    UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_meq_id DEFAULT NEWSEQUENTIALID(),
    equipo_id             UNIQUEIDENTIFIER NOT NULL,
    fecha                 DATE          NOT NULL,
    tipo                  NVARCHAR(30)  NOT NULL,
    descripcion           NVARCHAR(MAX) NOT NULL,
    costo                 DECIMAL(15,2) NULL,
    proveedor             NVARCHAR(100) NULL,
    tecnico               NVARCHAR(100) NULL,
    proximo_mantenimiento DATE          NULL,
    archivo_url           NVARCHAR(MAX) NULL,
    creado_en             DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_meq_creado DEFAULT SYSDATETIMEOFFSET(),
    creado_por            UNIQUEIDENTIFIER NULL,
    CONSTRAINT PK_mantenimientos_equipos PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_meq_tipo CHECK (tipo IN ('PREVENTIVO','CORRECTIVO','CALIBRACION'))
);
GO

/* TABLA: equipos.prestamos_equipos */
CREATE TABLE equipos.prestamos_equipos (
    id              UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_preq_id DEFAULT NEWSEQUENTIALID(),
    equipo_id       UNIQUEIDENTIFIER NOT NULL,
    bombero_id      UNIQUEIDENTIFIER NULL,
    servicio_id     UNIQUEIDENTIFIER NULL,
    fecha_prestamo  DATE          NOT NULL,
    fecha_devolucion DATE         NULL,
    estado          NVARCHAR(20)  NOT NULL CONSTRAINT DF_preq_estado DEFAULT 'PRESTADO',
    observaciones   NVARCHAR(MAX) NULL,
    creado_en       DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_preq_creado DEFAULT SYSDATETIMEOFFSET(),
    creado_por      UNIQUEIDENTIFIER NULL,
    CONSTRAINT PK_prestamos_equipos PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_preq_estado CHECK (estado IN ('PRESTADO','DEVUELTO','EXTRAVIADO','DANIADO'))
);
GO
