/* =============================================================
   SIGBO-CBVC | Migracion 080 - Cartografia operativa
   =============================================================
   Fase 2.5 y 2.6 de la hoja de ruta: hidrantes, puntos de riesgo y
   pre-planes de incendio (ficha por edificio, versionada: editar un
   pre-plan crea una version nueva; la anterior queda en el historial).
   Reutiliza los permisos servicios:ver / crear / editar. */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID('servicios.hidrantes', 'U') IS NULL
BEGIN
    CREATE TABLE servicios.hidrantes (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_hidr_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_hidrantes PRIMARY KEY,
        codigo NVARCHAR(30) NOT NULL,
        tipo NVARCHAR(40) NULL,
        direccion NVARCHAR(300) NOT NULL,
        referencia NVARCHAR(300) NULL,
        latitud DECIMAL(10,8) NOT NULL,
        longitud DECIMAL(11,8) NOT NULL,
        estado NVARCHAR(20) NOT NULL CONSTRAINT DF_hidr_estado DEFAULT 'SIN_VERIFICAR'
            CONSTRAINT CK_hidr_estado CHECK (estado IN ('OPERATIVO', 'FUERA_SERVICIO', 'SIN_VERIFICAR')),
        caudal_lpm INT NULL CONSTRAINT CK_hidr_caudal CHECK (caudal_lpm IS NULL OR caudal_lpm >= 0),
        ultima_inspeccion DATE NULL,
        observaciones NVARCHAR(500) NULL,
        activo BIT NOT NULL CONSTRAINT DF_hidr_activo DEFAULT 1,
        creado_por UNIQUEIDENTIFIER NULL,
        creado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_hidr_creado DEFAULT SYSDATETIMEOFFSET(),
        actualizado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_hidr_actualizado DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT UQ_hidr_codigo UNIQUE (codigo),
        CONSTRAINT CK_hidr_lat CHECK (latitud BETWEEN -90 AND 90),
        CONSTRAINT CK_hidr_lon CHECK (longitud BETWEEN -180 AND 180),
        CONSTRAINT FK_hidr_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id)
    );
END
GO

IF OBJECT_ID('servicios.puntos_riesgo', 'U') IS NULL
BEGIN
    CREATE TABLE servicios.puntos_riesgo (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_prie_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_puntos_riesgo PRIMARY KEY,
        nombre NVARCHAR(150) NOT NULL,
        categoria NVARCHAR(60) NULL,
        nivel_riesgo NVARCHAR(10) NOT NULL CONSTRAINT DF_prie_nivel DEFAULT 'MEDIO'
            CONSTRAINT CK_prie_nivel CHECK (nivel_riesgo IN ('BAJO', 'MEDIO', 'ALTO', 'CRITICO')),
        direccion NVARCHAR(300) NOT NULL,
        latitud DECIMAL(10,8) NOT NULL,
        longitud DECIMAL(11,8) NOT NULL,
        contacto_nombre NVARCHAR(150) NULL,
        contacto_telefono NVARCHAR(40) NULL,
        descripcion NVARCHAR(1000) NULL,
        activo BIT NOT NULL CONSTRAINT DF_prie_activo DEFAULT 1,
        creado_por UNIQUEIDENTIFIER NULL,
        creado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_prie_creado DEFAULT SYSDATETIMEOFFSET(),
        actualizado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_prie_actualizado DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT CK_prie_lat CHECK (latitud BETWEEN -90 AND 90),
        CONSTRAINT CK_prie_lon CHECK (longitud BETWEEN -180 AND 180),
        CONSTRAINT FK_prie_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id)
    );
END
GO

IF OBJECT_ID('servicios.preplanes', 'U') IS NULL
BEGIN
    CREATE TABLE servicios.preplanes (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_prep_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_preplanes PRIMARY KEY,
        punto_riesgo_id UNIQUEIDENTIFIER NOT NULL,
        version INT NOT NULL,
        titulo NVARCHAR(200) NOT NULL,
        contenido NVARCHAR(MAX) NOT NULL,
        vigente BIT NOT NULL CONSTRAINT DF_prep_vigente DEFAULT 1,
        creado_por UNIQUEIDENTIFIER NULL,
        creado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_prep_creado DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT UQ_prep_punto_version UNIQUE (punto_riesgo_id, version),
        CONSTRAINT FK_prep_punto FOREIGN KEY (punto_riesgo_id) REFERENCES servicios.puntos_riesgo(id),
        CONSTRAINT FK_prep_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id)
    );
END
GO

/* Un solo pre-plan vigente por punto de riesgo. */
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_prep_vigente' AND object_id = OBJECT_ID('servicios.preplanes'))
    CREATE UNIQUE INDEX UX_prep_vigente ON servicios.preplanes (punto_riesgo_id) WHERE vigente = 1;
GO
