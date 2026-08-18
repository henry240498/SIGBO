/* =============================================================
   SIGBO-CBVC | Migracion 069 - Documentos: numeracion avanzada
   =============================================================
   Extiende documentos.numeraciones (creada en 052) con el detalle
   pedido para "Numeracion de Documentos" (Organizacion Institucional
   -> Configuracion de Documentos): rango declarado (desde/hasta en
   anio+mes+numero), mes de la posicion actual (anio+ultimo_numero ya
   existian y hacen de "anio actual"/"numero actual"), vigencia por
   fecha y auditoria de quien crea/modifica el numerador -- la
   numeracion institucional tiene valor legal, a diferencia de un
   contador tecnico cualquiera.

   No se toca el significado de `anio`/`ultimo_numero`: siguen siendo
   la posicion vigente (numeros_documento.service los sigue leyendo
   igual). Esta migracion solo agrega columnas nuevas, todas NULL-safe,
   y un indice unico filtrado para impedir numeracion institucional
   duplicada (numero_documental repetido dentro del mismo tipo) --
   hasta ahora esa unicidad no estaba garantizada por la base, solo
   por la buena fe del codigo que la generaba.
   ============================================================= */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF COL_LENGTH('documentos.numeraciones', 'mes_actual') IS NULL
    ALTER TABLE documentos.numeraciones ADD mes_actual INT NULL;
GO

IF COL_LENGTH('documentos.numeraciones', 'anio_desde') IS NULL
    ALTER TABLE documentos.numeraciones ADD anio_desde INT NULL;
GO
IF COL_LENGTH('documentos.numeraciones', 'mes_desde') IS NULL
    ALTER TABLE documentos.numeraciones ADD mes_desde INT NULL;
GO
IF COL_LENGTH('documentos.numeraciones', 'numero_desde') IS NULL
    ALTER TABLE documentos.numeraciones ADD numero_desde INT NULL;
GO

IF COL_LENGTH('documentos.numeraciones', 'anio_hasta') IS NULL
    ALTER TABLE documentos.numeraciones ADD anio_hasta INT NULL;
GO
IF COL_LENGTH('documentos.numeraciones', 'mes_hasta') IS NULL
    ALTER TABLE documentos.numeraciones ADD mes_hasta INT NULL;
GO
IF COL_LENGTH('documentos.numeraciones', 'numero_hasta') IS NULL
    ALTER TABLE documentos.numeraciones ADD numero_hasta INT NULL;
GO

IF COL_LENGTH('documentos.numeraciones', 'fecha_vigencia_desde') IS NULL
    ALTER TABLE documentos.numeraciones ADD fecha_vigencia_desde DATE NULL;
GO
IF COL_LENGTH('documentos.numeraciones', 'fecha_vigencia_hasta') IS NULL
    ALTER TABLE documentos.numeraciones ADD fecha_vigencia_hasta DATE NULL;
GO

IF COL_LENGTH('documentos.numeraciones', 'creado_en') IS NULL
    ALTER TABLE documentos.numeraciones ADD creado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_numd_creado DEFAULT SYSDATETIMEOFFSET();
GO
IF COL_LENGTH('documentos.numeraciones', 'creado_por') IS NULL
    ALTER TABLE documentos.numeraciones ADD creado_por UNIQUEIDENTIFIER NULL;
GO
IF COL_LENGTH('documentos.numeraciones', 'actualizado_en') IS NULL
    ALTER TABLE documentos.numeraciones ADD actualizado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_numd_act DEFAULT SYSDATETIMEOFFSET();
GO
IF COL_LENGTH('documentos.numeraciones', 'actualizado_por') IS NULL
    ALTER TABLE documentos.numeraciones ADD actualizado_por UNIQUEIDENTIFIER NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_numd_creadopor')
    ALTER TABLE documentos.numeraciones ADD CONSTRAINT FK_numd_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id);
GO
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_numd_actualizadopor')
    ALTER TABLE documentos.numeraciones ADD CONSTRAINT FK_numd_actualizadopor FOREIGN KEY (actualizado_por) REFERENCES seguridad.usuarios(id);
GO

/* Impide dos documentos del mismo tipo con igual numero institucional
   (seccion 8 del pedido: la validacion debe existir en base, no solo
   en frontend). Filtrado por NULL porque la mayoria de documentos
   fisicos/sin numerar tienen numero_documental NULL y SQL Server solo
   permite un NULL por indice unico no filtrado. */
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UQ_doci_tipo_numero' AND object_id = OBJECT_ID('documentos.documentos_institucionales'))
    CREATE UNIQUE INDEX UQ_doci_tipo_numero ON documentos.documentos_institucionales(tipo_documento_id, numero_documental)
        WHERE numero_documental IS NOT NULL;
GO
