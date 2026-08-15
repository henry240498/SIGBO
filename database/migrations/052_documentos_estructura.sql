/* =============================================================
   SIGBO-CBVC | Migracion 052 - Modulo Documentos, estructura base
   =============================================================
   Etapa 1: catalogos parametrizables nuevos, tabla central de
   documentos institucionales, numeracion documental configurable.

   El schema `documentos` ya existe (001_schemas.sql) con la tabla
   legada `documentos.documentos` (008_admin.sql): sin entidad
   TypeORM, sin controller, referenciada solo por
   personal.bomberos_service.ts como chequeo de dependencia -- mismo
   patron de codigo muerto que deposito.items_deposito antes de la
   migracion 041. Se deja intacta; la tabla nueva usa otro nombre
   (`documentos_institucionales`) para no colisionar.

   Reutiliza sin duplicar: organizacion.identidad_institucional
   (membrete), organizacion.cargos/designaciones + Bombero.firmaDigitalUrl
   /autorizadoFirmaDigital (firmantes, via firmantes-institucionales.ts),
   organizacion.parametros (catalogos), seguridad.usuarios (auditoria),
   shared/utils/almacenamiento.ts (guardarImagen/guardarBuffer, sin
   cambios -- ya es generico para cualquier extension).
   ============================================================= */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

/* --- Catalogos parametrizables nuevos (organizacion.parametros) --- */

IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_param_tipo')
    ALTER TABLE organizacion.parametros DROP CONSTRAINT CK_param_tipo;
GO
IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_param_tipo')
    ALTER TABLE organizacion.parametros ADD CONSTRAINT CK_param_tipo CHECK (tipo IN (
        N'PAIS', N'DEPARTAMENTO', N'CIUDAD', N'BARRIO', N'PROFESION', N'IDIOMA', N'NIVEL_IDIOMA',
        N'GRUPO_SANGUINEO', N'FACTOR_RH', N'TIPO_SEGURO', N'ASEGURADORA', N'TIPO_EVENTO_ASISTENCIA',
        N'UBICACION_EQUIPO', N'ESTADO_PRESENCIA_GUARDIA', N'SECTOR_ESTACION',
        N'TIPO_ACTIVIDAD_ACADEMICA', N'MODALIDAD_ACADEMICA', N'TIPO_EVALUACION_ACADEMICA', N'RESULTADO_ACADEMICO',
        N'TIPO_UBICACION_DEPOSITO', N'TIPO_TENENCIA_DEPOSITO', N'ESTADO_ELEMENTO_DEPOSITO',
        N'TIPO_MOVIMIENTO_DEPOSITO', N'UNIDAD_MEDIDA_DEPOSITO', N'MOTIVO_BAJA_DEPOSITO', N'TIPO_PRESTAMO_DEPOSITO',
        N'TIPO_INGRESO_FINANZAS', N'CATEGORIA_EGRESO_FINANZAS', N'TIPO_CUENTA_BANCARIA_FINANZAS',
        N'TIPO_DOCUMENTO_FINANZAS', N'MOTIVO_ANULACION_FINANZAS',
        N'TIPO_DOCUMENTO', N'CATEGORIA_DOCUMENTO', N'ESTADO_DOCUMENTO',
        N'NIVEL_CONFIDENCIALIDAD_DOCUMENTO', N'MOTIVO_ANULACION_DOCUMENTO', N'ARCHIVO_FISICO_DOCUMENTO'
    ));
GO

INSERT INTO organizacion.parametros (tipo, nombre, nombre_normalizado, orden)
SELECT v.tipo, v.nombre, v.nombre_normalizado, v.orden FROM (VALUES
    (N'TIPO_DOCUMENTO', N'Resolucion',            N'resolucion',            1),
    (N'TIPO_DOCUMENTO', N'Orden',                 N'orden',                 2),
    (N'TIPO_DOCUMENTO', N'Nota',                  N'nota',                  3),
    (N'TIPO_DOCUMENTO', N'Memorandum',            N'memorandum',            4),
    (N'TIPO_DOCUMENTO', N'Acta',                  N'acta',                  5),
    (N'TIPO_DOCUMENTO', N'Informe',                N'informe',               6),
    (N'TIPO_DOCUMENTO', N'Circular',              N'circular',              7),
    (N'TIPO_DOCUMENTO', N'Reglamento',             N'reglamento',            8),
    (N'TIPO_DOCUMENTO', N'Manual',                N'manual',                9),
    (N'TIPO_DOCUMENTO', N'Certificado',           N'certificado',          10),
    (N'TIPO_DOCUMENTO', N'Constancia',            N'constancia',           11),
    (N'TIPO_DOCUMENTO', N'Contrato',              N'contrato',             12),
    (N'TIPO_DOCUMENTO', N'Factura',               N'factura',              13),
    (N'TIPO_DOCUMENTO', N'Recibo',                N'recibo',               14),
    (N'TIPO_DOCUMENTO', N'Comprobante',           N'comprobante',          15),
    (N'TIPO_DOCUMENTO', N'Licencia',              N'licencia',             16),
    (N'TIPO_DOCUMENTO', N'Autorizacion',          N'autorizacion',         17),
    (N'TIPO_DOCUMENTO', N'Solicitud',             N'solicitud',            18),
    (N'TIPO_DOCUMENTO', N'Oficio',                N'oficio',               19),
    (N'TIPO_DOCUMENTO', N'Expediente',            N'expediente',           20),
    (N'TIPO_DOCUMENTO', N'Documento personal',    N'documento personal',   21),
    (N'TIPO_DOCUMENTO', N'Documento de vehiculo', N'documento de vehiculo',22),
    (N'TIPO_DOCUMENTO', N'Documento de equipo',   N'documento de equipo',  23),
    (N'TIPO_DOCUMENTO', N'Documento financiero',  N'documento financiero', 24),
    (N'TIPO_DOCUMENTO', N'Documento academico',   N'documento academico',  25),
    (N'TIPO_DOCUMENTO', N'Otro',                  N'otro',                 26),

    (N'CATEGORIA_DOCUMENTO', N'Personal',        N'personal',        1),
    (N'CATEGORIA_DOCUMENTO', N'Institucional',   N'institucional',   2),
    (N'CATEGORIA_DOCUMENTO', N'Administrativo',  N'administrativo',  3),
    (N'CATEGORIA_DOCUMENTO', N'Operativo',       N'operativo',       4),
    (N'CATEGORIA_DOCUMENTO', N'Financiero',      N'financiero',      5),
    (N'CATEGORIA_DOCUMENTO', N'Academia',        N'academia',        6),
    (N'CATEGORIA_DOCUMENTO', N'Servicios',       N'servicios',       7),
    (N'CATEGORIA_DOCUMENTO', N'Vehiculos',       N'vehiculos',       8),
    (N'CATEGORIA_DOCUMENTO', N'Equipos',         N'equipos',         9),
    (N'CATEGORIA_DOCUMENTO', N'Deposito',        N'deposito',       10),
    (N'CATEGORIA_DOCUMENTO', N'Legal',           N'legal',          11),
    (N'CATEGORIA_DOCUMENTO', N'Seguridad',       N'seguridad',      12),

    (N'ESTADO_DOCUMENTO', N'Borrador',       N'borrador',        1),
    (N'ESTADO_DOCUMENTO', N'Pendiente',      N'pendiente',       2),
    (N'ESTADO_DOCUMENTO', N'En revision',    N'en revision',     3),
    (N'ESTADO_DOCUMENTO', N'Aprobado',       N'aprobado',        4),
    (N'ESTADO_DOCUMENTO', N'Firmado',        N'firmado',         5),
    (N'ESTADO_DOCUMENTO', N'Publicado',      N'publicado',       6),
    (N'ESTADO_DOCUMENTO', N'Vigente',        N'vigente',         7),
    (N'ESTADO_DOCUMENTO', N'Vencido',        N'vencido',         8),
    (N'ESTADO_DOCUMENTO', N'Anulado',        N'anulado',         9),
    (N'ESTADO_DOCUMENTO', N'Archivado',      N'archivado',      10),

    (N'NIVEL_CONFIDENCIALIDAD_DOCUMENTO', N'Publico',       N'publico',       1),
    (N'NIVEL_CONFIDENCIALIDAD_DOCUMENTO', N'Institucional', N'institucional', 2),
    (N'NIVEL_CONFIDENCIALIDAD_DOCUMENTO', N'Restringido',   N'restringido',   3),
    (N'NIVEL_CONFIDENCIALIDAD_DOCUMENTO', N'Confidencial',  N'confidencial',  4),

    (N'MOTIVO_ANULACION_DOCUMENTO', N'Error de carga',      N'error de carga',      1),
    (N'MOTIVO_ANULACION_DOCUMENTO', N'Documento duplicado', N'documento duplicado', 2),
    (N'MOTIVO_ANULACION_DOCUMENTO', N'Documento incorrecto',N'documento incorrecto',3),
    (N'MOTIVO_ANULACION_DOCUMENTO', N'Reemplazado',         N'reemplazado',         4),
    (N'MOTIVO_ANULACION_DOCUMENTO', N'Otro',                N'otro',                5),

    (N'ARCHIVO_FISICO_DOCUMENTO', N'Archivo General', N'archivo general', 1)
) AS v(tipo, nombre, nombre_normalizado, orden)
WHERE NOT EXISTS (SELECT 1 FROM organizacion.parametros p WHERE p.tipo = v.tipo AND p.nombre_normalizado = v.nombre_normalizado AND p.padre_id IS NULL);
GO

/* --- documentos.numeraciones (seccion 7 del pedido) --- */

IF OBJECT_ID(N'documentos.numeraciones', N'U') IS NULL
BEGIN
    CREATE TABLE documentos.numeraciones (
        id               UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_numd_id DEFAULT NEWSEQUENTIALID(),
        tipo_documento_id UNIQUEIDENTIFIER NOT NULL,
        anio             INT              NOT NULL,
        institucion_id   UNIQUEIDENTIFIER NULL,
        ultimo_numero    INT              NOT NULL CONSTRAINT DF_numd_ultimo DEFAULT 0,
        CONSTRAINT PK_numeraciones PRIMARY KEY CLUSTERED (id),
        CONSTRAINT UQ_numeraciones UNIQUE (tipo_documento_id, anio, institucion_id),
        CONSTRAINT FK_numd_tipo FOREIGN KEY (tipo_documento_id) REFERENCES organizacion.parametros(id)
    );
END
GO

/* --- documentos.documentos_institucionales (tabla central) --- */

IF OBJECT_ID(N'documentos.documentos_institucionales', N'U') IS NULL
BEGIN
    CREATE TABLE documentos.documentos_institucionales (
        id                        UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_doci_id DEFAULT NEWSEQUENTIALID(),
        numero_documental         NVARCHAR(50)  NULL,
        tipo_documento_id         UNIQUEIDENTIFIER NOT NULL,
        categoria_documento_id    UNIQUEIDENTIFIER NULL,
        titulo                    NVARCHAR(300) NOT NULL,
        descripcion               NVARCHAR(MAX) NULL,
        origen                    NVARCHAR(10)  NOT NULL CONSTRAINT DF_doci_origen DEFAULT N'INTERNO',
        fecha_emision             DATE          NOT NULL,
        fecha_inicio_vigencia     DATE          NULL,
        fecha_vencimiento         DATE          NULL,
        estado_id                 UNIQUEIDENTIFIER NOT NULL,
        version                   INT           NOT NULL CONSTRAINT DF_doci_version DEFAULT 1,
        nivel_confidencialidad_id UNIQUEIDENTIFIER NULL,
        es_fisico                 BIT           NOT NULL CONSTRAINT DF_doci_fisico DEFAULT 0,
        archivo_fisico_id         UNIQUEIDENTIFIER NULL,
        estante                   NVARCHAR(20)  NULL,
        caja                      NVARCHAR(20)  NULL,
        carpeta                   NVARCHAR(20)  NULL,
        archivo_url               NVARCHAR(MAX) NULL,
        archivo_nombre_original   NVARCHAR(300) NULL,
        archivo_extension         NVARCHAR(10)  NULL,
        archivo_tamano_bytes      BIGINT        NULL,
        expediente_id             UNIQUEIDENTIFIER NULL,
        orden_en_expediente       INT           NULL,
        plantilla_id              UNIQUEIDENTIFIER NULL,
        generado_por_modulo       NVARCHAR(50)  NULL,
        motivo_anulacion_id       UNIQUEIDENTIFIER NULL,
        anulado_por               UNIQUEIDENTIFIER NULL,
        fecha_anulacion           DATETIMEOFFSET(3) NULL,
        institucion_id            UNIQUEIDENTIFIER NULL,
        creado_en                 DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_doci_creado DEFAULT SYSDATETIMEOFFSET(),
        actualizado_en            DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_doci_act DEFAULT SYSDATETIMEOFFSET(),
        creado_por                UNIQUEIDENTIFIER NULL,
        actualizado_por           UNIQUEIDENTIFIER NULL,
        CONSTRAINT PK_documentos_institucionales PRIMARY KEY CLUSTERED (id),
        CONSTRAINT CK_doci_origen CHECK (origen IN (N'INTERNO', N'EXTERNO')),
        CONSTRAINT FK_doci_tipo FOREIGN KEY (tipo_documento_id) REFERENCES organizacion.parametros(id),
        CONSTRAINT FK_doci_categoria FOREIGN KEY (categoria_documento_id) REFERENCES organizacion.parametros(id),
        CONSTRAINT FK_doci_estado FOREIGN KEY (estado_id) REFERENCES organizacion.parametros(id),
        CONSTRAINT FK_doci_confidencialidad FOREIGN KEY (nivel_confidencialidad_id) REFERENCES organizacion.parametros(id),
        CONSTRAINT FK_doci_archivofisico FOREIGN KEY (archivo_fisico_id) REFERENCES organizacion.parametros(id),
        CONSTRAINT FK_doci_motivoanulacion FOREIGN KEY (motivo_anulacion_id) REFERENCES organizacion.parametros(id),
        CONSTRAINT FK_doci_anuladopor FOREIGN KEY (anulado_por) REFERENCES seguridad.usuarios(id),
        CONSTRAINT FK_doci_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id),
        CONSTRAINT FK_doci_actualizadopor FOREIGN KEY (actualizado_por) REFERENCES seguridad.usuarios(id)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_doci_tipo' AND object_id = OBJECT_ID('documentos.documentos_institucionales'))
    CREATE INDEX IX_doci_tipo ON documentos.documentos_institucionales(tipo_documento_id);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_doci_estado' AND object_id = OBJECT_ID('documentos.documentos_institucionales'))
    CREATE INDEX IX_doci_estado ON documentos.documentos_institucionales(estado_id);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_doci_vencimiento' AND object_id = OBJECT_ID('documentos.documentos_institucionales'))
    CREATE INDEX IX_doci_vencimiento ON documentos.documentos_institucionales(fecha_vencimiento);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_doci_expediente' AND object_id = OBJECT_ID('documentos.documentos_institucionales'))
    CREATE INDEX IX_doci_expediente ON documentos.documentos_institucionales(expediente_id);
GO
