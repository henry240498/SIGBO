/* =============================================================
   SIGBO-CBVC | Migracion 055 - Documentos: firmas requeridas
   =============================================================
   Etapa 4. `documentos.firmas_documento` registra QUIENES deben
   firmar un documento (uno o varios, seccion 9-10) y si ya lo
   hicieron. El firmante se define por cargo (auto-resuelto via
   designacion activa, firmantes-institucionales.ts) o por una persona
   puntual -- nunca las dos cosas a la vez. La firma parcial (ejemplo
   del pedido: Comandante autorizado + Encargado de Personal sin
   autorizar) se resuelve fila por fila: cada firmante que no tiene
   firma digital autorizada queda con `firmado=0` y el documento
   generado deja el renglon en blanco para esa persona.
   ============================================================= */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'documentos.firmas_documento', N'U') IS NULL
BEGIN
    CREATE TABLE documentos.firmas_documento (
        id                 UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_docf_id DEFAULT NEWSEQUENTIALID(),
        documento_id       UNIQUEIDENTIFIER NOT NULL,
        orden              INT           NOT NULL CONSTRAINT DF_docf_orden DEFAULT 1,
        cargo_firmante_id  UNIQUEIDENTIFIER NULL,
        bombero_firmante_id UNIQUEIDENTIFIER NULL,
        etiqueta_rol       NVARCHAR(150) NULL,
        firmado            BIT           NOT NULL CONSTRAINT DF_docf_firmado DEFAULT 0,
        firma_url          NVARCHAR(MAX) NULL,
        fecha_firma        DATETIMEOFFSET(3) NULL,
        firmado_por        UNIQUEIDENTIFIER NULL,
        observacion        NVARCHAR(MAX) NULL,
        creado_en          DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_docf_creado DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT PK_documentos_firmas PRIMARY KEY CLUSTERED (id),
        CONSTRAINT CK_docf_firmante CHECK (
            (cargo_firmante_id IS NOT NULL AND bombero_firmante_id IS NULL) OR
            (cargo_firmante_id IS NULL AND bombero_firmante_id IS NOT NULL)
        ),
        CONSTRAINT FK_docf_documento FOREIGN KEY (documento_id) REFERENCES documentos.documentos_institucionales(id) ON DELETE CASCADE,
        CONSTRAINT FK_docf_cargo FOREIGN KEY (cargo_firmante_id) REFERENCES organizacion.cargos(id),
        CONSTRAINT FK_docf_bombero FOREIGN KEY (bombero_firmante_id) REFERENCES personal.bomberos(id),
        CONSTRAINT FK_docf_firmadopor FOREIGN KEY (firmado_por) REFERENCES seguridad.usuarios(id)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_docf_documento' AND object_id = OBJECT_ID('documentos.firmas_documento'))
    CREATE INDEX IX_docf_documento ON documentos.firmas_documento(documento_id);
GO
