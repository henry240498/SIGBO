/* =============================================================
   SIGBO-CBVC | Migracion 003 - Esquema personal
   ============================================================= */

/* TABLA: bomberos (expediente completo) */
CREATE TABLE personal.bomberos (
    id                    UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_bomberos_id DEFAULT NEWSEQUENTIALID(),
    /* --- Datos personales --- */
    cedula                NVARCHAR(20)  NOT NULL,
    nombre                NVARCHAR(100) NOT NULL,
    apellido              NVARCHAR(100) NOT NULL,
    fecha_nacimiento      DATE          NOT NULL,
    sexo                  NVARCHAR(1)   NULL,
    nacionalidad          NVARCHAR(50)  NOT NULL CONSTRAINT DF_bomberos_nac DEFAULT 'Paraguaya',
    estado_civil          NVARCHAR(20)  NULL,
    lugar_nacimiento      NVARCHAR(100) NULL,
    /* --- Contacto --- */
    telefono_principal    NVARCHAR(20)  NOT NULL,
    telefono_secundario   NVARCHAR(20)  NULL,
    email                 NVARCHAR(255) NULL,
    direccion             NVARCHAR(MAX) NULL,
    ciudad                NVARCHAR(100) NULL,
    departamento          NVARCHAR(100) NULL,
    codigo_postal         NVARCHAR(20)  NULL,
    domicilio_lat         DECIMAL(10,8) NULL,   -- reemplaza POINT de PostgreSQL
    domicilio_lon         DECIMAL(11,8) NULL,
    /* --- Datos bomberiles --- */
    numero_bombero        NVARCHAR(20)  NOT NULL,
    rango                 NVARCHAR(50)  NOT NULL,
    cargo                 NVARCHAR(100) NULL,
    estado                NVARCHAR(20)  NOT NULL,
    fecha_ingreso         DATE          NOT NULL,
    fecha_ascenso         DATE          NULL,
    /* Columna calculada: no puede ser PERSISTED porque depende de la fecha actual */
    antiguedad AS (
        DATEDIFF(YEAR, fecha_ingreso, SYSDATETIME())
        - CASE WHEN (MONTH(fecha_ingreso) > MONTH(SYSDATETIME()))
                 OR (MONTH(fecha_ingreso) = MONTH(SYSDATETIME()) AND DAY(fecha_ingreso) > DAY(SYSDATETIME()))
               THEN 1 ELSE 0 END
    ),
    grupo_sanguineo       NVARCHAR(5)   NULL,
    factor_rh             NVARCHAR(2)   NULL,
    /* --- Medico --- */
    alergias              NVARCHAR(MAX) NULL,
    condiciones_medicas   NVARCHAR(MAX) NULL,
    medicamentos          NVARCHAR(MAX) NULL,
    tipo_seguro           NVARCHAR(50)  NULL,
    numero_seguro         NVARCHAR(50)  NULL,
    vigencia_seguro       DATE          NULL,
    /* --- Contactos de emergencia (JSON) --- */
    contactos_emergencia  NVARCHAR(MAX) NOT NULL CONSTRAINT DF_bomberos_contactos DEFAULT N'[]',
    /* --- Fotografia --- */
    foto_url              NVARCHAR(MAX) NULL,
    foto_thumb_url        NVARCHAR(MAX) NULL,
    /* --- Metadatos --- */
    fecha_baja            DATE          NULL,
    motivo_baja           NVARCHAR(MAX) NULL,
    metadata              NVARCHAR(MAX) NULL,
    creado_en             DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_bomberos_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en        DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_bomberos_act DEFAULT SYSDATETIMEOFFSET(),
    creado_por            UNIQUEIDENTIFIER NULL,
    actualizado_por       UNIQUEIDENTIFIER NULL,
    CONSTRAINT PK_bomberos PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_bomberos_cedula UNIQUE (cedula),
    CONSTRAINT UQ_bomberos_numero UNIQUE (numero_bombero),
    CONSTRAINT CK_bomberos_sexo   CHECK (sexo IS NULL OR sexo IN ('M','F')),
    CONSTRAINT CK_bomberos_estado CHECK (estado IN ('ACTIVO','RESERVA','INOPERATIVO','RETIRADO','SUSPENDIDO')),
    CONSTRAINT CK_bomberos_contactos CHECK (ISJSON(contactos_emergencia) = 1),
    CONSTRAINT CK_bomberos_metadata  CHECK (metadata IS NULL OR ISJSON(metadata) = 1)
);
GO

/* TABLA: certificaciones */
CREATE TABLE personal.certificaciones (
    id                  UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_cert_id DEFAULT NEWSEQUENTIALID(),
    bombero_id          UNIQUEIDENTIFIER NOT NULL,
    tipo                NVARCHAR(50)  NOT NULL,
    nombre              NVARCHAR(200) NOT NULL,
    institucion         NVARCHAR(200) NULL,
    fecha_obtencion     DATE          NOT NULL,
    fecha_vencimiento   DATE          NULL,
    numero_certificado  NVARCHAR(100) NULL,
    archivo_url         NVARCHAR(MAX) NULL,
    estado              NVARCHAR(20)  NOT NULL CONSTRAINT DF_cert_estado DEFAULT 'VIGENTE',
    creado_en           DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_cert_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en      DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_cert_act DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_certificaciones PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_cert_tipo   CHECK (tipo IN ('BASICO','INTERMEDIO','AVANZADO','ESPECIALIDAD')),
    CONSTRAINT CK_cert_estado CHECK (estado IN ('VIGENTE','VENCIDO','EN_PROCESO'))
);
GO

/* TABLA: licencias */
CREATE TABLE personal.licencias (
    id                UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_lic_id DEFAULT NEWSEQUENTIALID(),
    bombero_id        UNIQUEIDENTIFIER NOT NULL,
    tipo              NVARCHAR(50)  NOT NULL,
    numero            NVARCHAR(50)  NULL,
    fecha_emision     DATE          NOT NULL,
    fecha_vencimiento DATE          NOT NULL,
    estado            NVARCHAR(20)  NOT NULL CONSTRAINT DF_lic_estado DEFAULT 'VIGENTE',
    archivo_url       NVARCHAR(MAX) NULL,
    creado_en         DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_lic_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en    DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_lic_act DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_licencias PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_lic_estado CHECK (estado IN ('VIGENTE','VENCIDA','SUSPENDIDA'))
);
GO

/* TABLA: historial_medico */
CREATE TABLE personal.historial_medico (
    id            UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_hmed_id DEFAULT NEWSEQUENTIALID(),
    bombero_id    UNIQUEIDENTIFIER NOT NULL,
    fecha         DATE          NOT NULL,
    tipo          NVARCHAR(50)  NOT NULL,
    diagnostico   NVARCHAR(MAX) NULL,
    tratamiento   NVARCHAR(MAX) NULL,
    medico        NVARCHAR(100) NULL,
    institucion   NVARCHAR(200) NULL,
    archivo_url   NVARCHAR(MAX) NULL,
    observaciones NVARCHAR(MAX) NULL,
    creado_en     DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_hmed_creado DEFAULT SYSDATETIMEOFFSET(),
    creado_por    UNIQUEIDENTIFIER NULL,
    CONSTRAINT PK_historial_medico PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_hmed_tipo CHECK (tipo IN ('CONSULTA','EXAMEN','ACCIDENTE','VACUNA'))
);
GO

/* TABLA: historial_disciplinario */
CREATE TABLE personal.historial_disciplinario (
    id                    UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_hdisc_id DEFAULT NEWSEQUENTIALID(),
    bombero_id            UNIQUEIDENTIFIER NOT NULL,
    fecha                 DATE          NOT NULL,
    tipo                  NVARCHAR(50)  NOT NULL,
    descripcion           NVARCHAR(MAX) NOT NULL,
    articulo_reglamento   NVARCHAR(50)  NULL,
    resolucion            NVARCHAR(100) NULL,
    sancion               NVARCHAR(MAX) NULL,
    duracion_dias         INT           NULL,
    fecha_fin_sancion     DATE          NULL,
    estado                NVARCHAR(20)  NOT NULL CONSTRAINT DF_hdisc_estado DEFAULT 'ACTIVO',
    recurso_presentado    BIT           NOT NULL CONSTRAINT DF_hdisc_recurso DEFAULT 0,
    resultado_recurso     NVARCHAR(MAX) NULL,
    creado_en             DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_hdisc_creado DEFAULT SYSDATETIMEOFFSET(),
    creado_por            UNIQUEIDENTIFIER NULL,
    CONSTRAINT PK_historial_disciplinario PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_hdisc_tipo   CHECK (tipo IN ('APERCIBIMIENTO','SUSPENSION','MULTA','BAJA')),
    CONSTRAINT CK_hdisc_estado CHECK (estado IN ('ACTIVO','CUMPLIDO','ANULADO'))
);
GO
