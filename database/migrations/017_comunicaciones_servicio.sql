/* =============================================================
   SIGBO-CBVC | Migración 017 - Comunicaciones de servicios
   ============================================================= */

CREATE TABLE servicios.comunicaciones_servicio (
    id           UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_comser_id DEFAULT NEWSEQUENTIALID(),
    servicio_id  UNIQUEIDENTIFIER NOT NULL,
    tipo         NVARCHAR(30) NOT NULL,
    estado       NVARCHAR(30) NOT NULL CONSTRAINT DF_comser_estado DEFAULT 'BORRADOR',
    datos        NVARCHAR(MAX) NOT NULL CONSTRAINT DF_comser_datos DEFAULT N'{}',
    version      INT NOT NULL CONSTRAINT DF_comser_version DEFAULT 1,
    actualizado_por UNIQUEIDENTIFIER NULL,
    finalizado_por UNIQUEIDENTIFIER NULL,
    finalizado_en DATETIMEOFFSET(3) NULL,
    motivo_estado NVARCHAR(MAX) NULL,
    creado_en    DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_comser_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_comser_actualizado DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_comunicaciones_servicio PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_comunicaciones_servicio_servicio UNIQUE (servicio_id),
    CONSTRAINT CK_comser_tipo CHECK (tipo IN ('OTRAS_OCURRENCIAS', 'INCENDIO')),
    CONSTRAINT CK_comser_estado CHECK (estado IN ('BORRADOR', 'PENDIENTE_REVISION', 'OBSERVADO', 'FINALIZADA', 'ANULADO')),
    CONSTRAINT CK_comser_datos CHECK (ISJSON(datos) = 1),
    CONSTRAINT FK_comser_servicio FOREIGN KEY (servicio_id)
      REFERENCES servicios.servicios(id) ON DELETE CASCADE
);
GO

CREATE INDEX IX_comser_estado_actualizado
  ON servicios.comunicaciones_servicio (estado, actualizado_en DESC);
GO
