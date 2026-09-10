/* =============================================================
   SIGBO-CBVC | Migracion 076 - Alertas inmediatas (app movil)
   =============================================================
   Solicitudes de APOYO y CHOFER emitidas desde celulares de bomberos
   (carpeta .movile). Trazabilidad normativa:
   - Radio y comunicaciones Arts. 249-258 (apoyo solicitado / despacho).
   - Vehiculos y conductores Arts. 230-248 (conductor por guardia).
   - Servicios y mando Arts. 5-8, 220-227 (registro de hechos con
     autoridad, fecha y auditoria; sin decisiones automaticas).
   La auditoria de cambios vive en seguridad.logs_auditoria (servicio
   AuditoriaService); aqui solo se guarda el estado vigente. */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'servicios')
    EXEC('CREATE SCHEMA servicios');
GO

IF OBJECT_ID('servicios.alertas_emergencia', 'U') IS NULL
BEGIN
    CREATE TABLE servicios.alertas_emergencia (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_alertas_emergencia_id DEFAULT NEWID() CONSTRAINT PK_alertas_emergencia PRIMARY KEY,
        tipo NVARCHAR(20) NOT NULL CONSTRAINT CK_alertas_emergencia_tipo CHECK (tipo IN ('SOLICITUD_APOYO', 'SOLICITUD_CHOFER')),
        estado NVARCHAR(20) NOT NULL CONSTRAINT DF_alertas_emergencia_estado DEFAULT 'PENDIENTE'
            CONSTRAINT CK_alertas_emergencia_estado CHECK (estado IN ('PENDIENTE', 'ATENDIDA', 'CANCELADA')),
        solicitanteId UNIQUEIDENTIFIER NOT NULL,
        solicitanteNombre NVARCHAR(200) NOT NULL,
        detalle NVARCHAR(500) NULL,
        latitud FLOAT NULL,
        longitud FLOAT NULL,
        claveIdempotencia NVARCHAR(64) NOT NULL CONSTRAINT UQ_alertas_emergencia_clave UNIQUE,
        atendidaPor UNIQUEIDENTIFIER NULL,
        atendidaPorNombre NVARCHAR(200) NULL,
        atendidaEn DATETIMEOFFSET(3) NULL,
        motivoEstado NVARCHAR(500) NULL,
        creado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_alertas_emergencia_creado DEFAULT SYSDATETIMEOFFSET(),
        actualizado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_alertas_emergencia_actualizado DEFAULT SYSDATETIMEOFFSET()
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_alertas_emergencia_estado_creado' AND object_id = OBJECT_ID('servicios.alertas_emergencia'))
    CREATE INDEX IX_alertas_emergencia_estado_creado ON servicios.alertas_emergencia (estado, creado_en DESC);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_alertas_emergencia_solicitante' AND object_id = OBJECT_ID('servicios.alertas_emergencia'))
    CREATE INDEX IX_alertas_emergencia_solicitante ON servicios.alertas_emergencia (solicitanteId, creado_en DESC);
GO
