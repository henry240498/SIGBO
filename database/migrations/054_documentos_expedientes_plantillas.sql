/* =============================================================
   SIGBO-CBVC | Migracion 054 - Documentos: expedientes y plantillas
   =============================================================
   Etapa 3. `documentos.expedientes` agrupa documentos ordenados
   cronologicamente (seccion 23). `documentos.plantillas` guarda el
   contenido con placeholders {{CAMPO}} (seccion 40); el firmante por
   defecto de una plantilla se resuelve por Cargo (reutiliza
   organizacion.cargos + firmantes-institucionales.ts, nunca guarda el
   nombre de una persona fija -- seccion 41).
   ============================================================= */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'documentos.expedientes', N'U') IS NULL
BEGIN
    CREATE TABLE documentos.expedientes (
        id             UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_exp_id DEFAULT NEWSEQUENTIALID(),
        numero         NVARCHAR(50)  NOT NULL,
        titulo         NVARCHAR(300) NOT NULL,
        descripcion    NVARCHAR(MAX) NULL,
        estado         NVARCHAR(20)  NOT NULL CONSTRAINT DF_exp_estado DEFAULT N'ABIERTO',
        institucion_id UNIQUEIDENTIFIER NULL,
        creado_en      DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_exp_creado DEFAULT SYSDATETIMEOFFSET(),
        creado_por     UNIQUEIDENTIFIER NULL,
        CONSTRAINT PK_expedientes PRIMARY KEY CLUSTERED (id),
        CONSTRAINT UQ_expedientes_numero UNIQUE (numero),
        CONSTRAINT CK_exp_estado CHECK (estado IN (N'ABIERTO', N'CERRADO')),
        CONSTRAINT FK_exp_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_doci_expediente')
    ALTER TABLE documentos.documentos_institucionales
        ADD CONSTRAINT FK_doci_expediente FOREIGN KEY (expediente_id) REFERENCES documentos.expedientes(id);
GO

IF OBJECT_ID(N'documentos.plantillas', N'U') IS NULL
BEGIN
    CREATE TABLE documentos.plantillas (
        id                 UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_plant_id DEFAULT NEWSEQUENTIALID(),
        nombre             NVARCHAR(200) NOT NULL,
        tipo_documento_id  UNIQUEIDENTIFIER NULL,
        contenido          NVARCHAR(MAX) NOT NULL,
        cargo_firmante_id  UNIQUEIDENTIFIER NULL,
        activa             BIT           NOT NULL CONSTRAINT DF_plant_activa DEFAULT 1,
        creado_en          DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_plant_creado DEFAULT SYSDATETIMEOFFSET(),
        actualizado_en     DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_plant_act DEFAULT SYSDATETIMEOFFSET(),
        creado_por         UNIQUEIDENTIFIER NULL,
        actualizado_por    UNIQUEIDENTIFIER NULL,
        CONSTRAINT PK_plantillas PRIMARY KEY CLUSTERED (id),
        CONSTRAINT FK_plant_tipo FOREIGN KEY (tipo_documento_id) REFERENCES organizacion.parametros(id),
        CONSTRAINT FK_plant_cargo FOREIGN KEY (cargo_firmante_id) REFERENCES organizacion.cargos(id)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_doci_plantilla')
    ALTER TABLE documentos.documentos_institucionales
        ADD CONSTRAINT FK_doci_plantilla FOREIGN KEY (plantilla_id) REFERENCES documentos.plantillas(id);
GO
