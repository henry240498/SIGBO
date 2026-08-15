/* =============================================================
   SIGBO-CBVC | Migracion 053 - Documentos: relaciones y versionado
   =============================================================
   Etapa 2. `documentos.relaciones` es la pieza arquitectonica central
   del pedido (secciones 14-15, 48): permite asociar UN documento con
   MUCHAS entidades de CUALQUIER modulo (personal, vehiculos, equipos,
   servicios, guardias, finanzas, deposito, academia, organizacion)
   sin FK tipada por modulo -- mismo patron polimorfico ya validado en
   produccion por seguridad.log_auditoria (columnas `recurso`/
   `recurso_id`), no una invencion nueva.

   `documentos.versiones_archivo` guarda cada reemplazo de archivo
   (seccion 12): nunca se sobrescribe silenciosamente, el archivo
   anterior queda consultable si el usuario tiene permiso.
   ============================================================= */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'documentos.relaciones', N'U') IS NULL
BEGIN
    CREATE TABLE documentos.relaciones (
        id           UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_docrel_id DEFAULT NEWSEQUENTIALID(),
        documento_id UNIQUEIDENTIFIER NOT NULL,
        modulo       NVARCHAR(50)  NOT NULL,
        entidad      NVARCHAR(50)  NOT NULL,
        registro_id  UNIQUEIDENTIFIER NOT NULL,
        etiqueta     NVARCHAR(200) NULL,
        creado_en    DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_docrel_creado DEFAULT SYSDATETIMEOFFSET(),
        creado_por   UNIQUEIDENTIFIER NULL,
        CONSTRAINT PK_documentos_relaciones PRIMARY KEY CLUSTERED (id),
        CONSTRAINT FK_docrel_documento FOREIGN KEY (documento_id) REFERENCES documentos.documentos_institucionales(id) ON DELETE CASCADE,
        CONSTRAINT FK_docrel_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id),
        CONSTRAINT UQ_docrel UNIQUE (documento_id, modulo, entidad, registro_id)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_docrel_entidad' AND object_id = OBJECT_ID('documentos.relaciones'))
    CREATE INDEX IX_docrel_entidad ON documentos.relaciones(modulo, entidad, registro_id);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_docrel_documento' AND object_id = OBJECT_ID('documentos.relaciones'))
    CREATE INDEX IX_docrel_documento ON documentos.relaciones(documento_id);
GO

IF OBJECT_ID(N'documentos.versiones_archivo', N'U') IS NULL
BEGIN
    CREATE TABLE documentos.versiones_archivo (
        id                      UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_docver_id DEFAULT NEWSEQUENTIALID(),
        documento_id            UNIQUEIDENTIFIER NOT NULL,
        numero_version          INT           NOT NULL,
        archivo_url             NVARCHAR(MAX) NOT NULL,
        archivo_nombre_original NVARCHAR(300) NULL,
        archivo_extension       NVARCHAR(10)  NULL,
        archivo_tamano_bytes    BIGINT        NULL,
        motivo                  NVARCHAR(MAX) NULL,
        creado_en               DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_docver_creado DEFAULT SYSDATETIMEOFFSET(),
        creado_por              UNIQUEIDENTIFIER NULL,
        CONSTRAINT PK_documentos_versiones PRIMARY KEY CLUSTERED (id),
        CONSTRAINT UQ_docver UNIQUE (documento_id, numero_version),
        CONSTRAINT FK_docver_documento FOREIGN KEY (documento_id) REFERENCES documentos.documentos_institucionales(id) ON DELETE CASCADE,
        CONSTRAINT FK_docver_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id)
    );
END
GO
