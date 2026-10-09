/* SIGBO — 094: base documental GRE. Preparada, no aplicada por esta tarea.
   Sin materiales, distancias, permisos concedidos ni activación automática.
   Las relaciones de catálogo conservan versión; valores originales nunca se redondean. */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET XACT_ABORT ON;
GO
IF SCHEMA_ID('matpel') IS NULL EXEC(N'CREATE SCHEMA matpel');
GO
IF OBJECT_ID('matpel.gre_documentos', 'U') IS NULL
BEGIN
    CREATE TABLE matpel.gre_documentos (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_gre_documentos_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_gre_documentos PRIMARY KEY,
        sha256 CHAR(64) NOT NULL,
        referencia_privada NVARCHAR(100) NOT NULL,
        tamano_bytes INT NOT NULL,
        paginas INT NOT NULL,
        titulo NVARCHAR(400) NOT NULL,
        edicion NVARCHAR(20) NOT NULL,
        idioma NVARCHAR(10) NOT NULL,
        identificacion_json NVARCHAR(MAX) NOT NULL,
        incorporada_por UNIQUEIDENTIFIER NOT NULL,
        creado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_gre_documentos_creado_en DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT UQ_gre_documentos_0 UNIQUE (sha256),
        CONSTRAINT CK_gre_documentos_identificacion CHECK (ISJSON(identificacion_json) = 1),
        CONSTRAINT FK_gre_documentos_actor FOREIGN KEY (incorporada_por) REFERENCES seguridad.usuarios (id),
        CONSTRAINT CK_gre_documentos_0 CHECK (tamano_bytes > 0 AND tamano_bytes <= 67108864),
        CONSTRAINT CK_gre_documentos_1 CHECK (paginas > 0 AND paginas <= 3000),
        CONSTRAINT CK_gre_documentos_2 CHECK (sha256 NOT LIKE '%[^0-9a-f]%' COLLATE Latin1_General_100_BIN2),
        CONSTRAINT CK_gre_documentos_3 CHECK (referencia_privada = N'privado:gre:' + sha256 + N'.pdf')
    );
END
GO
IF OBJECT_ID('matpel.gre_versiones', 'U') IS NULL
BEGIN
    CREATE TABLE matpel.gre_versiones (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_gre_versiones_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_gre_versiones PRIMARY KEY,
        documento_id UNIQUEIDENTIFIER NOT NULL,
        version_parser NVARCHAR(80) NOT NULL,
        version_normalizador NVARCHAR(80) NOT NULL,
        version_esquema NVARCHAR(30) NOT NULL,
        revision_correcciones INT NOT NULL CONSTRAINT DF_gre_versiones_revision_correcciones DEFAULT 0,
        derivada_de_id UNIQUEIDENTIFIER NULL,
        sha256_contenido CHAR(64) NULL,
        estado NVARCHAR(24) NOT NULL CONSTRAINT DF_gre_versiones_estado DEFAULT N'IMPORTANDO',
        reporte_json NVARCHAR(MAX) NULL,
        creado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_gre_versiones_creado_en DEFAULT SYSDATETIMEOFFSET(),
        validada_en DATETIMEOFFSET(3) NULL,
        validada_por UNIQUEIDENTIFIER NULL,
        CONSTRAINT UQ_gre_versiones_0 UNIQUE (documento_id, version_parser, version_normalizador, version_esquema, revision_correcciones),
        CONSTRAINT UQ_gre_versiones_id_documento UNIQUE (id, documento_id),
        CONSTRAINT CK_gre_versiones_correcciones CHECK ((revision_correcciones = 0 AND derivada_de_id IS NULL) OR (revision_correcciones > 0 AND derivada_de_id IS NOT NULL AND derivada_de_id <> id)),
        CONSTRAINT FK_gre_versiones_derivada FOREIGN KEY (derivada_de_id, documento_id) REFERENCES matpel.gre_versiones (id, documento_id),
        CONSTRAINT CK_gre_versiones_0 CHECK (estado IN ('IMPORTANDO','VALIDANDO','REQUIERE_REVISION','VALIDADA','ERROR')),
        CONSTRAINT CK_gre_versiones_1 CHECK (reporte_json IS NULL OR ISJSON(reporte_json) = 1),
        CONSTRAINT CK_gre_versiones_2 CHECK (estado <> 'VALIDADA' OR (sha256_contenido IS NOT NULL AND validada_en IS NOT NULL AND validada_por IS NOT NULL)),
        CONSTRAINT CK_gre_versiones_3 CHECK (sha256_contenido IS NULL OR sha256_contenido NOT LIKE '%[^0-9a-f]%' COLLATE Latin1_General_100_BIN2),
        CONSTRAINT FK_gre_versiones_0 FOREIGN KEY (documento_id) REFERENCES matpel.gre_documentos (id),
        CONSTRAINT FK_gre_versiones_1 FOREIGN KEY (validada_por) REFERENCES seguridad.usuarios (id)
    );
END
GO
IF OBJECT_ID('matpel.gre_paginas', 'U') IS NULL
BEGIN
    CREATE TABLE matpel.gre_paginas (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_gre_paginas_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_gre_paginas PRIMARY KEY,
        version_id UNIQUEIDENTIFIER NOT NULL,
        pagina_pdf INT NOT NULL,
        etiqueta_pdf NVARCHAR(80) NOT NULL,
        etiquetas_impresas_json NVARCHAR(MAX) NOT NULL,
        ancho_pt FLOAT NOT NULL,
        alto_pt FLOAT NOT NULL,
        rotacion INT NOT NULL,
        sha256_texto_nativo CHAR(64) NOT NULL,
        caracteres_texto INT NOT NULL,
        numeracion_ambigua BIT NOT NULL,
        CONSTRAINT UQ_gre_paginas_id_version UNIQUE (id, version_id),
        CONSTRAINT UQ_gre_paginas_0 UNIQUE (version_id, pagina_pdf),
        CONSTRAINT CK_gre_paginas_0 CHECK (pagina_pdf > 0),
        CONSTRAINT CK_gre_paginas_1 CHECK (ancho_pt > 0 AND alto_pt > 0),
        CONSTRAINT CK_gre_paginas_2 CHECK (rotacion IN (0,90,180,270)),
        CONSTRAINT CK_gre_paginas_3 CHECK (caracteres_texto >= 0),
        CONSTRAINT CK_gre_paginas_4 CHECK (ISJSON(etiquetas_impresas_json) = 1),
        CONSTRAINT FK_gre_paginas_0 FOREIGN KEY (version_id) REFERENCES matpel.gre_versiones (id)
    );
END
GO
IF OBJECT_ID('matpel.gre_secciones', 'U') IS NULL
BEGIN
    CREATE TABLE matpel.gre_secciones (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_gre_secciones_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_gre_secciones PRIMARY KEY,
        version_id UNIQUEIDENTIFIER NOT NULL,
        titulo_original NVARCHAR(500) NOT NULL,
        orden INT NOT NULL,
        pagina_desde INT NOT NULL,
        pagina_hasta INT NOT NULL,
        tratamiento NVARCHAR(80) NOT NULL,
        CONSTRAINT UQ_gre_secciones_id_version UNIQUE (id, version_id),
        CONSTRAINT UQ_gre_secciones_0 UNIQUE (version_id, orden),
        CONSTRAINT CK_gre_secciones_0 CHECK (orden >= 0),
        CONSTRAINT CK_gre_secciones_1 CHECK (pagina_desde > 0 AND pagina_hasta >= pagina_desde),
        CONSTRAINT FK_gre_secciones_0 FOREIGN KEY (version_id) REFERENCES matpel.gre_versiones (id),
        CONSTRAINT FK_gre_secciones_1 FOREIGN KEY (version_id, pagina_desde) REFERENCES matpel.gre_paginas (version_id, pagina_pdf),
        CONSTRAINT FK_gre_secciones_2 FOREIGN KEY (version_id, pagina_hasta) REFERENCES matpel.gre_paginas (version_id, pagina_pdf)
    );
END
GO
IF OBJECT_ID('matpel.gre_referencias', 'U') IS NULL
BEGIN
    CREATE TABLE matpel.gre_referencias (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_gre_referencias_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_gre_referencias PRIMARY KEY,
        version_id UNIQUEIDENTIFIER NOT NULL,
        pagina_pdf INT NOT NULL,
        seccion_id UNIQUEIDENTIFIER NULL,
        texto_original NVARCHAR(MAX) NOT NULL,
        metodo NVARCHAR(30) NOT NULL,
        caja_pt_json NVARCHAR(MAX) NULL,
        sistema_coordenadas NVARCHAR(30) NOT NULL CONSTRAINT CK_gre_referencias_coordenadas CHECK (sistema_coordenadas = N'PYMUPDF_SIN_ROTAR_PT'),
        orientacion INT NULL,
        confianza FLOAT NULL,
        estado_revision NVARCHAR(15) NOT NULL CONSTRAINT DF_gre_referencias_estado_revision DEFAULT N'PENDIENTE',
        CONSTRAINT UQ_gre_referencias_id_version UNIQUE (id, version_id),
        CONSTRAINT CK_gre_referencias_0 CHECK (metodo IN ('NATIVO','GEOMETRIA','OCR','REVISION_HUMANA')),
        CONSTRAINT CK_gre_referencias_1 CHECK (caja_pt_json IS NULL OR ISJSON(caja_pt_json) = 1),
        CONSTRAINT CK_gre_referencias_2 CHECK (confianza IS NULL OR (confianza >= 0 AND confianza <= 1)),
        CONSTRAINT CK_gre_referencias_orientacion CHECK (orientacion IS NULL OR orientacion IN (0,90,180,270)),
        CONSTRAINT CK_gre_referencias_3 CHECK (estado_revision IN ('PENDIENTE','VERIFICADA','RECHAZADA')),
        CONSTRAINT FK_gre_referencias_0 FOREIGN KEY (version_id) REFERENCES matpel.gre_versiones (id),
        CONSTRAINT FK_gre_referencias_1 FOREIGN KEY (version_id, pagina_pdf) REFERENCES matpel.gre_paginas (version_id, pagina_pdf),
        CONSTRAINT FK_gre_referencias_2 FOREIGN KEY (seccion_id, version_id) REFERENCES matpel.gre_secciones (id, version_id)
    );
END
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_gre_referencias_0' AND object_id = OBJECT_ID('matpel.gre_referencias'))
    CREATE INDEX IX_gre_referencias_0 ON matpel.gre_referencias (version_id, pagina_pdf);
GO
IF OBJECT_ID('matpel.gre_guias', 'U') IS NULL
BEGIN
    CREATE TABLE matpel.gre_guias (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_gre_guias_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_gre_guias PRIMARY KEY,
        version_id UNIQUEIDENTIFIER NOT NULL,
        numero CHAR(3) NOT NULL,
        titulo_original NVARCHAR(500) NULL,
        estado_contenido NVARCHAR(24) NOT NULL,
        referencia_id UNIQUEIDENTIFIER NOT NULL,
        CONSTRAINT UQ_gre_guias_id_version UNIQUE (id, version_id),
        CONSTRAINT UQ_gre_guias_0 UNIQUE (version_id, numero),
        CONSTRAINT CK_gre_guias_0 CHECK (numero NOT LIKE '%[^0-9]%' COLLATE Latin1_General_100_BIN2),
        CONSTRAINT CK_gre_guias_1 CHECK (estado_contenido IN ('CON_CONTENIDO','INTENCIONALMENTE_VACIA')),
        CONSTRAINT FK_gre_guias_0 FOREIGN KEY (version_id) REFERENCES matpel.gre_versiones (id),
        CONSTRAINT FK_gre_guias_1 FOREIGN KEY (referencia_id, version_id) REFERENCES matpel.gre_referencias (id, version_id)
    );
END
GO
IF OBJECT_ID('matpel.gre_entradas', 'U') IS NULL
BEGIN
    CREATE TABLE matpel.gre_entradas (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_gre_entradas_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_gre_entradas PRIMARY KEY,
        version_id UNIQUEIDENTIFIER NOT NULL,
        nombre_original NVARCHAR(1000) NOT NULL,
        nombre_normalizado NVARCHAR(400) NOT NULL,
        identificador CHAR(4) NULL,
        tipo_identificador NVARCHAR(20) NULL,
        guia_id UNIQUEIDENTIFIER NULL,
        polimerizable BIT NULL,
        resaltado_verde BIT NULL,
        referencia_id UNIQUEIDENTIFIER NOT NULL,
        CONSTRAINT UQ_gre_entradas_id_version UNIQUE (id, version_id),
        CONSTRAINT CK_gre_entradas_0 CHECK (identificador IS NULL OR identificador NOT LIKE '%[^0-9]%' COLLATE Latin1_General_100_BIN2),
        CONSTRAINT CK_gre_entradas_1 CHECK (identificador IS NOT NULL OR tipo_identificador IS NULL),
        CONSTRAINT FK_gre_entradas_0 FOREIGN KEY (version_id) REFERENCES matpel.gre_versiones (id),
        CONSTRAINT FK_gre_entradas_1 FOREIGN KEY (guia_id, version_id) REFERENCES matpel.gre_guias (id, version_id),
        CONSTRAINT FK_gre_entradas_2 FOREIGN KEY (referencia_id, version_id) REFERENCES matpel.gre_referencias (id, version_id)
    );
END
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_gre_entradas_0' AND object_id = OBJECT_ID('matpel.gre_entradas'))
    CREATE INDEX IX_gre_entradas_0 ON matpel.gre_entradas (version_id, identificador);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_gre_entradas_1' AND object_id = OBJECT_ID('matpel.gre_entradas'))
    CREATE INDEX IX_gre_entradas_1 ON matpel.gre_entradas (version_id, nombre_normalizado);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_gre_entradas_2' AND object_id = OBJECT_ID('matpel.gre_entradas'))
    CREATE INDEX IX_gre_entradas_2 ON matpel.gre_entradas (version_id, guia_id);
GO
IF OBJECT_ID('matpel.gre_aliases', 'U') IS NULL
BEGIN
    CREATE TABLE matpel.gre_aliases (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_gre_aliases_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_gre_aliases PRIMARY KEY,
        version_id UNIQUEIDENTIFIER NOT NULL,
        entrada_id UNIQUEIDENTIFIER NOT NULL,
        nombre_original NVARCHAR(1000) NOT NULL,
        nombre_normalizado NVARCHAR(400) NOT NULL,
        referencia_id UNIQUEIDENTIFIER NOT NULL,
        CONSTRAINT UQ_gre_aliases_id_version UNIQUE (id, version_id),
        CONSTRAINT FK_gre_aliases_0 FOREIGN KEY (version_id) REFERENCES matpel.gre_versiones (id),
        CONSTRAINT FK_gre_aliases_1 FOREIGN KEY (entrada_id, version_id) REFERENCES matpel.gre_entradas (id, version_id),
        CONSTRAINT FK_gre_aliases_2 FOREIGN KEY (referencia_id, version_id) REFERENCES matpel.gre_referencias (id, version_id)
    );
END
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_gre_aliases_0' AND object_id = OBJECT_ID('matpel.gre_aliases'))
    CREATE INDEX IX_gre_aliases_0 ON matpel.gre_aliases (version_id, nombre_normalizado);
GO
IF OBJECT_ID('matpel.gre_bloques', 'U') IS NULL
BEGIN
    CREATE TABLE matpel.gre_bloques (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_gre_bloques_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_gre_bloques PRIMARY KEY,
        version_id UNIQUEIDENTIFIER NOT NULL,
        seccion_id UNIQUEIDENTIFIER NOT NULL,
        guia_id UNIQUEIDENTIFIER NULL,
        padre_id UNIQUEIDENTIFIER NULL,
        orden INT NOT NULL,
        encabezado_original NVARCHAR(500) NULL,
        texto_original NVARCHAR(MAX) NOT NULL,
        referencia_id UNIQUEIDENTIFIER NOT NULL,
        CONSTRAINT UQ_gre_bloques_id_version UNIQUE (id, version_id),
        CONSTRAINT CK_gre_bloques_0 CHECK (orden >= 0),
        CONSTRAINT CK_gre_bloques_1 CHECK (padre_id IS NULL OR padre_id <> id),
        CONSTRAINT FK_gre_bloques_0 FOREIGN KEY (version_id) REFERENCES matpel.gre_versiones (id),
        CONSTRAINT FK_gre_bloques_1 FOREIGN KEY (seccion_id, version_id) REFERENCES matpel.gre_secciones (id, version_id),
        CONSTRAINT FK_gre_bloques_2 FOREIGN KEY (guia_id, version_id) REFERENCES matpel.gre_guias (id, version_id),
        CONSTRAINT FK_gre_bloques_3 FOREIGN KEY (padre_id, version_id) REFERENCES matpel.gre_bloques (id, version_id),
        CONSTRAINT FK_gre_bloques_4 FOREIGN KEY (referencia_id, version_id) REFERENCES matpel.gre_referencias (id, version_id)
    );
END
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_gre_bloques_0' AND object_id = OBJECT_ID('matpel.gre_bloques'))
    CREATE INDEX IX_gre_bloques_0 ON matpel.gre_bloques (version_id, seccion_id, orden);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_gre_bloques_1' AND object_id = OBJECT_ID('matpel.gre_bloques'))
    CREATE INDEX IX_gre_bloques_1 ON matpel.gre_bloques (version_id, guia_id, orden);
GO
IF OBJECT_ID('matpel.gre_tablas', 'U') IS NULL
BEGIN
    CREATE TABLE matpel.gre_tablas (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_gre_tablas_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_gre_tablas PRIMARY KEY,
        version_id UNIQUEIDENTIFIER NOT NULL,
        seccion_id UNIQUEIDENTIFIER NOT NULL,
        codigo NVARCHAR(80) NOT NULL,
        titulo_original NVARCHAR(500) NOT NULL,
        estructura_json NVARCHAR(MAX) NOT NULL,
        referencia_id UNIQUEIDENTIFIER NOT NULL,
        CONSTRAINT UQ_gre_tablas_id_version UNIQUE (id, version_id),
        CONSTRAINT UQ_gre_tablas_0 UNIQUE (version_id, codigo),
        CONSTRAINT CK_gre_tablas_0 CHECK (ISJSON(estructura_json) = 1),
        CONSTRAINT FK_gre_tablas_0 FOREIGN KEY (version_id) REFERENCES matpel.gre_versiones (id),
        CONSTRAINT FK_gre_tablas_1 FOREIGN KEY (seccion_id, version_id) REFERENCES matpel.gre_secciones (id, version_id),
        CONSTRAINT FK_gre_tablas_2 FOREIGN KEY (referencia_id, version_id) REFERENCES matpel.gre_referencias (id, version_id)
    );
END
GO
IF OBJECT_ID('matpel.gre_filas', 'U') IS NULL
BEGIN
    CREATE TABLE matpel.gre_filas (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_gre_filas_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_gre_filas PRIMARY KEY,
        version_id UNIQUEIDENTIFIER NOT NULL,
        tabla_id UNIQUEIDENTIFIER NOT NULL,
        orden INT NOT NULL,
        entrada_id UNIQUEIDENTIFIER NULL,
        etiqueta_original NVARCHAR(1000) NULL,
        condiciones_json NVARCHAR(MAX) NULL,
        referencia_id UNIQUEIDENTIFIER NOT NULL,
        CONSTRAINT UQ_gre_filas_id_version UNIQUE (id, version_id),
        CONSTRAINT UQ_gre_filas_0 UNIQUE (version_id, tabla_id, orden),
        CONSTRAINT CK_gre_filas_0 CHECK (orden >= 0),
        CONSTRAINT CK_gre_filas_1 CHECK (condiciones_json IS NULL OR ISJSON(condiciones_json) = 1),
        CONSTRAINT FK_gre_filas_0 FOREIGN KEY (version_id) REFERENCES matpel.gre_versiones (id),
        CONSTRAINT FK_gre_filas_1 FOREIGN KEY (tabla_id, version_id) REFERENCES matpel.gre_tablas (id, version_id),
        CONSTRAINT FK_gre_filas_2 FOREIGN KEY (entrada_id, version_id) REFERENCES matpel.gre_entradas (id, version_id),
        CONSTRAINT FK_gre_filas_3 FOREIGN KEY (referencia_id, version_id) REFERENCES matpel.gre_referencias (id, version_id)
    );
END
GO
IF OBJECT_ID('matpel.gre_celdas', 'U') IS NULL
BEGIN
    CREATE TABLE matpel.gre_celdas (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_gre_celdas_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_gre_celdas PRIMARY KEY,
        version_id UNIQUEIDENTIFIER NOT NULL,
        fila_id UNIQUEIDENTIFIER NOT NULL,
        columna_codigo NVARCHAR(80) NOT NULL,
        orden INT NOT NULL,
        texto_original NVARCHAR(MAX) NOT NULL,
        valor_decimal NVARCHAR(120) NULL,
        unidad_original NVARCHAR(80) NULL,
        modificador NVARCHAR(40) NULL,
        estado_dato NVARCHAR(20) NOT NULL,
        condiciones_json NVARCHAR(MAX) NULL,
        referencia_id UNIQUEIDENTIFIER NOT NULL,
        CONSTRAINT UQ_gre_celdas_id_version UNIQUE (id, version_id),
        CONSTRAINT UQ_gre_celdas_0 UNIQUE (version_id, fila_id, columna_codigo),
        CONSTRAINT CK_gre_celdas_0 CHECK (orden >= 0),
        CONSTRAINT CK_gre_celdas_1 CHECK (estado_dato IN ('DATO','REFERENCIA','VACIO_EXPLICITO','NO_VALIDADO')),
        CONSTRAINT CK_gre_celdas_2 CHECK (estado_dato <> 'VACIO_EXPLICITO' OR valor_decimal IS NULL),
        CONSTRAINT CK_gre_celdas_3 CHECK (condiciones_json IS NULL OR ISJSON(condiciones_json) = 1),
        CONSTRAINT FK_gre_celdas_0 FOREIGN KEY (version_id) REFERENCES matpel.gre_versiones (id),
        CONSTRAINT FK_gre_celdas_1 FOREIGN KEY (fila_id, version_id) REFERENCES matpel.gre_filas (id, version_id),
        CONSTRAINT FK_gre_celdas_2 FOREIGN KEY (referencia_id, version_id) REFERENCES matpel.gre_referencias (id, version_id)
    );
END
GO
IF OBJECT_ID('matpel.gre_reglas', 'U') IS NULL
BEGIN
    CREATE TABLE matpel.gre_reglas (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_gre_reglas_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_gre_reglas PRIMARY KEY,
        version_id UNIQUEIDENTIFIER NOT NULL,
        codigo NVARCHAR(80) NOT NULL,
        tipo_uso NVARCHAR(20) NOT NULL,
        texto_original NVARCHAR(MAX) NOT NULL,
        condiciones_json NVARCHAR(MAX) NULL,
        parametros_json NVARCHAR(MAX) NULL,
        version_interpretacion NVARCHAR(80) NULL,
        ejecutable BIT NOT NULL CONSTRAINT DF_gre_reglas_ejecutable DEFAULT 0,
        referencia_id UNIQUEIDENTIFIER NOT NULL,
        CONSTRAINT UQ_gre_reglas_id_version UNIQUE (id, version_id),
        CONSTRAINT UQ_gre_reglas_0 UNIQUE (version_id, codigo),
        CONSTRAINT CK_gre_reglas_0 CHECK (tipo_uso IN ('SELECCION','ADVERTENCIA','DECISION_HUMANA')),
        CONSTRAINT CK_gre_reglas_1 CHECK (condiciones_json IS NULL OR ISJSON(condiciones_json) = 1),
        CONSTRAINT CK_gre_reglas_2 CHECK (parametros_json IS NULL OR ISJSON(parametros_json) = 1),
        CONSTRAINT CK_gre_reglas_3 CHECK (ejecutable = 0 OR (tipo_uso = 'SELECCION' AND version_interpretacion IS NOT NULL)),
        CONSTRAINT FK_gre_reglas_0 FOREIGN KEY (version_id) REFERENCES matpel.gre_versiones (id),
        CONSTRAINT FK_gre_reglas_1 FOREIGN KEY (referencia_id, version_id) REFERENCES matpel.gre_referencias (id, version_id)
    );
END
GO
IF OBJECT_ID('matpel.gre_campos_fuente', 'U') IS NULL
BEGIN
    CREATE TABLE matpel.gre_campos_fuente (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_gre_campos_fuente_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_gre_campos_fuente PRIMARY KEY,
        version_id UNIQUEIDENTIFIER NOT NULL,
        campo NVARCHAR(80) NOT NULL,
        referencia_id UNIQUEIDENTIFIER NOT NULL,
        seccion_id UNIQUEIDENTIFIER NULL,
        entrada_id UNIQUEIDENTIFIER NULL,
        alias_id UNIQUEIDENTIFIER NULL,
        guia_id UNIQUEIDENTIFIER NULL,
        bloque_id UNIQUEIDENTIFIER NULL,
        tabla_id UNIQUEIDENTIFIER NULL,
        fila_id UNIQUEIDENTIFIER NULL,
        celda_id UNIQUEIDENTIFIER NULL,
        regla_id UNIQUEIDENTIFIER NULL,
        CONSTRAINT UQ_gre_campos_fuente_id_version UNIQUE (id, version_id),
        CONSTRAINT CK_gre_campos_fuente_0 CHECK (CASE WHEN seccion_id IS NULL THEN 0 ELSE 1 END + CASE WHEN entrada_id IS NULL THEN 0 ELSE 1 END + CASE WHEN alias_id IS NULL THEN 0 ELSE 1 END + CASE WHEN guia_id IS NULL THEN 0 ELSE 1 END + CASE WHEN bloque_id IS NULL THEN 0 ELSE 1 END + CASE WHEN tabla_id IS NULL THEN 0 ELSE 1 END + CASE WHEN fila_id IS NULL THEN 0 ELSE 1 END + CASE WHEN celda_id IS NULL THEN 0 ELSE 1 END + CASE WHEN regla_id IS NULL THEN 0 ELSE 1 END = 1),
        CONSTRAINT FK_gre_campos_fuente_0 FOREIGN KEY (version_id) REFERENCES matpel.gre_versiones (id),
        CONSTRAINT FK_gre_campos_fuente_1 FOREIGN KEY (referencia_id, version_id) REFERENCES matpel.gre_referencias (id, version_id),
        CONSTRAINT FK_gre_campos_fuente_2 FOREIGN KEY (seccion_id, version_id) REFERENCES matpel.gre_secciones (id, version_id),
        CONSTRAINT FK_gre_campos_fuente_3 FOREIGN KEY (entrada_id, version_id) REFERENCES matpel.gre_entradas (id, version_id),
        CONSTRAINT FK_gre_campos_fuente_4 FOREIGN KEY (alias_id, version_id) REFERENCES matpel.gre_aliases (id, version_id),
        CONSTRAINT FK_gre_campos_fuente_5 FOREIGN KEY (guia_id, version_id) REFERENCES matpel.gre_guias (id, version_id),
        CONSTRAINT FK_gre_campos_fuente_6 FOREIGN KEY (bloque_id, version_id) REFERENCES matpel.gre_bloques (id, version_id),
        CONSTRAINT FK_gre_campos_fuente_7 FOREIGN KEY (tabla_id, version_id) REFERENCES matpel.gre_tablas (id, version_id),
        CONSTRAINT FK_gre_campos_fuente_8 FOREIGN KEY (fila_id, version_id) REFERENCES matpel.gre_filas (id, version_id),
        CONSTRAINT FK_gre_campos_fuente_9 FOREIGN KEY (celda_id, version_id) REFERENCES matpel.gre_celdas (id, version_id),
        CONSTRAINT FK_gre_campos_fuente_10 FOREIGN KEY (regla_id, version_id) REFERENCES matpel.gre_reglas (id, version_id)
    );
END
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_gre_campos_fuente_0' AND object_id = OBJECT_ID('matpel.gre_campos_fuente'))
    CREATE INDEX IX_gre_campos_fuente_0 ON matpel.gre_campos_fuente (version_id, referencia_id);
GO
IF OBJECT_ID('matpel.gre_revisiones', 'U') IS NULL
BEGIN
    CREATE TABLE matpel.gre_revisiones (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_gre_revisiones_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_gre_revisiones PRIMARY KEY,
        version_id UNIQUEIDENTIFIER NOT NULL,
        campo_fuente_id UNIQUEIDENTIFIER NOT NULL,
        resultado NVARCHAR(20) NOT NULL,
        valor_anterior_json NVARCHAR(MAX) NULL,
        valor_propuesto_json NVARCHAR(MAX) NULL,
        fundamento NVARCHAR(MAX) NOT NULL,
        revisada_por UNIQUEIDENTIFIER NOT NULL,
        creado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_gre_revisiones_creado_en DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT UQ_gre_revisiones_id_version UNIQUE (id, version_id),
        CONSTRAINT CK_gre_revisiones_0 CHECK (resultado IN ('VERIFICADO','CORRECCION_PROPUESTA','RECHAZADO')),
        CONSTRAINT CK_gre_revisiones_1 CHECK (valor_anterior_json IS NULL OR ISJSON(valor_anterior_json) = 1),
        CONSTRAINT CK_gre_revisiones_2 CHECK (valor_propuesto_json IS NULL OR ISJSON(valor_propuesto_json) = 1),
        CONSTRAINT FK_gre_revisiones_0 FOREIGN KEY (version_id) REFERENCES matpel.gre_versiones (id),
        CONSTRAINT FK_gre_revisiones_1 FOREIGN KEY (campo_fuente_id, version_id) REFERENCES matpel.gre_campos_fuente (id, version_id),
        CONSTRAINT FK_gre_revisiones_2 FOREIGN KEY (revisada_por) REFERENCES seguridad.usuarios (id)
    );
END
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_gre_revisiones_0' AND object_id = OBJECT_ID('matpel.gre_revisiones'))
    CREATE INDEX IX_gre_revisiones_0 ON matpel.gre_revisiones (version_id, creado_en);
GO
IF OBJECT_ID('matpel.gre_importaciones', 'U') IS NULL
BEGIN
    CREATE TABLE matpel.gre_importaciones (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_gre_importaciones_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_gre_importaciones PRIMARY KEY,
        version_id UNIQUEIDENTIFIER NOT NULL,
        estado NVARCHAR(20) NOT NULL,
        etapa NVARCHAR(80) NOT NULL,
        paginas_procesadas INT NOT NULL CONSTRAINT DF_gre_importaciones_paginas_procesadas DEFAULT 0,
        intento INT NOT NULL CONSTRAINT DF_gre_importaciones_intento DEFAULT 0,
        lease_token UNIQUEIDENTIFIER NULL,
        lease_hasta DATETIMEOFFSET(3) NULL,
        heartbeat_en DATETIMEOFFSET(3) NULL,
        errores_json NVARCHAR(MAX) NULL,
        solicitada_por UNIQUEIDENTIFIER NOT NULL,
        creado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_gre_importaciones_creado_en DEFAULT SYSDATETIMEOFFSET(),
        finalizada_en DATETIMEOFFSET(3) NULL,
        CONSTRAINT UQ_gre_importaciones_id_version UNIQUE (id, version_id),
        CONSTRAINT CK_gre_importaciones_0 CHECK (estado IN ('PENDIENTE','EN_PROCESO','COMPLETADA','ERROR')),
        CONSTRAINT CK_gre_importaciones_1 CHECK (paginas_procesadas >= 0 AND intento >= 0),
        CONSTRAINT CK_gre_importaciones_2 CHECK ((lease_token IS NULL AND lease_hasta IS NULL) OR (lease_token IS NOT NULL AND lease_hasta IS NOT NULL)),
        CONSTRAINT CK_gre_importaciones_3 CHECK (errores_json IS NULL OR ISJSON(errores_json) = 1),
        CONSTRAINT FK_gre_importaciones_0 FOREIGN KEY (version_id) REFERENCES matpel.gre_versiones (id),
        CONSTRAINT FK_gre_importaciones_1 FOREIGN KEY (solicitada_por) REFERENCES seguridad.usuarios (id)
    );
END
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_gre_importaciones_0' AND object_id = OBJECT_ID('matpel.gre_importaciones'))
    CREATE INDEX IX_gre_importaciones_0 ON matpel.gre_importaciones (estado, lease_hasta);
GO
IF OBJECT_ID('matpel.gre_activaciones', 'U') IS NULL
BEGIN
    CREATE TABLE matpel.gre_activaciones (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_gre_activaciones_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_gre_activaciones PRIMARY KEY,
        idioma NVARCHAR(10) NOT NULL,
        version_id UNIQUEIDENTIFIER NOT NULL,
        revision INT NOT NULL,
        activada_por UNIQUEIDENTIFIER NOT NULL,
        creado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_gre_activaciones_creado_en DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT UQ_gre_activaciones_id_version UNIQUE (id, version_id),
        CONSTRAINT UQ_gre_activaciones_0 UNIQUE (idioma),
        CONSTRAINT CK_gre_activaciones_0 CHECK (revision > 0),
        CONSTRAINT FK_gre_activaciones_0 FOREIGN KEY (version_id) REFERENCES matpel.gre_versiones (id),
        CONSTRAINT FK_gre_activaciones_1 FOREIGN KEY (activada_por) REFERENCES seguridad.usuarios (id)
    );
END
GO
IF OBJECT_ID('matpel.gre_activaciones_historial', 'U') IS NULL
BEGIN
    CREATE TABLE matpel.gre_activaciones_historial (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_gre_activaciones_historial_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_gre_activaciones_historial PRIMARY KEY,
        idioma NVARCHAR(10) NOT NULL,
        version_id UNIQUEIDENTIFIER NOT NULL,
        version_anterior_id UNIQUEIDENTIFIER NULL,
        revision INT NOT NULL,
        clave_idempotencia UNIQUEIDENTIFIER NOT NULL,
        activada_por UNIQUEIDENTIFIER NOT NULL,
        fundamento NVARCHAR(MAX) NOT NULL,
        creado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_gre_activaciones_historial_creado_en DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT UQ_gre_activaciones_historial_id_version UNIQUE (id, version_id),
        CONSTRAINT UQ_gre_activaciones_historial_0 UNIQUE (idioma, revision),
        CONSTRAINT UQ_gre_activaciones_historial_1 UNIQUE (clave_idempotencia),
        CONSTRAINT CK_gre_activaciones_historial_0 CHECK (revision > 0),
        CONSTRAINT FK_gre_activaciones_historial_0 FOREIGN KEY (version_id) REFERENCES matpel.gre_versiones (id),
        CONSTRAINT FK_gre_activaciones_historial_1 FOREIGN KEY (version_anterior_id) REFERENCES matpel.gre_versiones (id),
        CONSTRAINT FK_gre_activaciones_historial_2 FOREIGN KEY (activada_por) REFERENCES seguridad.usuarios (id)
    );
END
GO
IF OBJECT_ID('matpel.TR_gre_documentos_inmutable', 'TR') IS NULL
    EXEC(N'CREATE TRIGGER matpel.TR_gre_documentos_inmutable ON matpel.gre_documentos INSTEAD OF UPDATE, DELETE AS BEGIN THROW 51094, N''La fuente GRE es inmutable.'', 1; END');
GO
IF OBJECT_ID('matpel.TR_gre_versiones_validada', 'TR') IS NULL
    EXEC(N'CREATE TRIGGER matpel.TR_gre_versiones_validada ON matpel.gre_versiones AFTER UPDATE, DELETE AS BEGIN SET NOCOUNT ON; IF EXISTS (SELECT 1 FROM deleted WHERE estado = N''VALIDADA'') THROW 51094, N''Una versión GRE validada es inmutable.'', 1; END');
GO
IF OBJECT_ID('matpel.TR_gre_paginas_version_validada', 'TR') IS NULL
    EXEC(N'CREATE TRIGGER matpel.TR_gre_paginas_version_validada ON matpel.gre_paginas AFTER INSERT, UPDATE, DELETE AS BEGIN SET NOCOUNT ON; IF EXISTS (SELECT 1 FROM (SELECT version_id FROM inserted UNION SELECT version_id FROM deleted) cambios JOIN matpel.gre_versiones v ON v.id = cambios.version_id WHERE v.estado = N''VALIDADA'') THROW 51094, N''El contenido de una versión GRE validada es inmutable.'', 1; END');
GO
IF OBJECT_ID('matpel.TR_gre_secciones_version_validada', 'TR') IS NULL
    EXEC(N'CREATE TRIGGER matpel.TR_gre_secciones_version_validada ON matpel.gre_secciones AFTER INSERT, UPDATE, DELETE AS BEGIN SET NOCOUNT ON; IF EXISTS (SELECT 1 FROM (SELECT version_id FROM inserted UNION SELECT version_id FROM deleted) cambios JOIN matpel.gre_versiones v ON v.id = cambios.version_id WHERE v.estado = N''VALIDADA'') THROW 51094, N''El contenido de una versión GRE validada es inmutable.'', 1; END');
GO
IF OBJECT_ID('matpel.TR_gre_referencias_version_validada', 'TR') IS NULL
    EXEC(N'CREATE TRIGGER matpel.TR_gre_referencias_version_validada ON matpel.gre_referencias AFTER INSERT, UPDATE, DELETE AS BEGIN SET NOCOUNT ON; IF EXISTS (SELECT 1 FROM (SELECT version_id FROM inserted UNION SELECT version_id FROM deleted) cambios JOIN matpel.gre_versiones v ON v.id = cambios.version_id WHERE v.estado = N''VALIDADA'') THROW 51094, N''El contenido de una versión GRE validada es inmutable.'', 1; END');
GO
IF OBJECT_ID('matpel.TR_gre_guias_version_validada', 'TR') IS NULL
    EXEC(N'CREATE TRIGGER matpel.TR_gre_guias_version_validada ON matpel.gre_guias AFTER INSERT, UPDATE, DELETE AS BEGIN SET NOCOUNT ON; IF EXISTS (SELECT 1 FROM (SELECT version_id FROM inserted UNION SELECT version_id FROM deleted) cambios JOIN matpel.gre_versiones v ON v.id = cambios.version_id WHERE v.estado = N''VALIDADA'') THROW 51094, N''El contenido de una versión GRE validada es inmutable.'', 1; END');
GO
IF OBJECT_ID('matpel.TR_gre_entradas_version_validada', 'TR') IS NULL
    EXEC(N'CREATE TRIGGER matpel.TR_gre_entradas_version_validada ON matpel.gre_entradas AFTER INSERT, UPDATE, DELETE AS BEGIN SET NOCOUNT ON; IF EXISTS (SELECT 1 FROM (SELECT version_id FROM inserted UNION SELECT version_id FROM deleted) cambios JOIN matpel.gre_versiones v ON v.id = cambios.version_id WHERE v.estado = N''VALIDADA'') THROW 51094, N''El contenido de una versión GRE validada es inmutable.'', 1; END');
GO
IF OBJECT_ID('matpel.TR_gre_aliases_version_validada', 'TR') IS NULL
    EXEC(N'CREATE TRIGGER matpel.TR_gre_aliases_version_validada ON matpel.gre_aliases AFTER INSERT, UPDATE, DELETE AS BEGIN SET NOCOUNT ON; IF EXISTS (SELECT 1 FROM (SELECT version_id FROM inserted UNION SELECT version_id FROM deleted) cambios JOIN matpel.gre_versiones v ON v.id = cambios.version_id WHERE v.estado = N''VALIDADA'') THROW 51094, N''El contenido de una versión GRE validada es inmutable.'', 1; END');
GO
IF OBJECT_ID('matpel.TR_gre_bloques_version_validada', 'TR') IS NULL
    EXEC(N'CREATE TRIGGER matpel.TR_gre_bloques_version_validada ON matpel.gre_bloques AFTER INSERT, UPDATE, DELETE AS BEGIN SET NOCOUNT ON; IF EXISTS (SELECT 1 FROM (SELECT version_id FROM inserted UNION SELECT version_id FROM deleted) cambios JOIN matpel.gre_versiones v ON v.id = cambios.version_id WHERE v.estado = N''VALIDADA'') THROW 51094, N''El contenido de una versión GRE validada es inmutable.'', 1; END');
GO
IF OBJECT_ID('matpel.TR_gre_tablas_version_validada', 'TR') IS NULL
    EXEC(N'CREATE TRIGGER matpel.TR_gre_tablas_version_validada ON matpel.gre_tablas AFTER INSERT, UPDATE, DELETE AS BEGIN SET NOCOUNT ON; IF EXISTS (SELECT 1 FROM (SELECT version_id FROM inserted UNION SELECT version_id FROM deleted) cambios JOIN matpel.gre_versiones v ON v.id = cambios.version_id WHERE v.estado = N''VALIDADA'') THROW 51094, N''El contenido de una versión GRE validada es inmutable.'', 1; END');
GO
IF OBJECT_ID('matpel.TR_gre_filas_version_validada', 'TR') IS NULL
    EXEC(N'CREATE TRIGGER matpel.TR_gre_filas_version_validada ON matpel.gre_filas AFTER INSERT, UPDATE, DELETE AS BEGIN SET NOCOUNT ON; IF EXISTS (SELECT 1 FROM (SELECT version_id FROM inserted UNION SELECT version_id FROM deleted) cambios JOIN matpel.gre_versiones v ON v.id = cambios.version_id WHERE v.estado = N''VALIDADA'') THROW 51094, N''El contenido de una versión GRE validada es inmutable.'', 1; END');
GO
IF OBJECT_ID('matpel.TR_gre_celdas_version_validada', 'TR') IS NULL
    EXEC(N'CREATE TRIGGER matpel.TR_gre_celdas_version_validada ON matpel.gre_celdas AFTER INSERT, UPDATE, DELETE AS BEGIN SET NOCOUNT ON; IF EXISTS (SELECT 1 FROM (SELECT version_id FROM inserted UNION SELECT version_id FROM deleted) cambios JOIN matpel.gre_versiones v ON v.id = cambios.version_id WHERE v.estado = N''VALIDADA'') THROW 51094, N''El contenido de una versión GRE validada es inmutable.'', 1; END');
GO
IF OBJECT_ID('matpel.TR_gre_reglas_version_validada', 'TR') IS NULL
    EXEC(N'CREATE TRIGGER matpel.TR_gre_reglas_version_validada ON matpel.gre_reglas AFTER INSERT, UPDATE, DELETE AS BEGIN SET NOCOUNT ON; IF EXISTS (SELECT 1 FROM (SELECT version_id FROM inserted UNION SELECT version_id FROM deleted) cambios JOIN matpel.gre_versiones v ON v.id = cambios.version_id WHERE v.estado = N''VALIDADA'') THROW 51094, N''El contenido de una versión GRE validada es inmutable.'', 1; END');
GO
IF OBJECT_ID('matpel.TR_gre_campos_fuente_version_validada', 'TR') IS NULL
    EXEC(N'CREATE TRIGGER matpel.TR_gre_campos_fuente_version_validada ON matpel.gre_campos_fuente AFTER INSERT, UPDATE, DELETE AS BEGIN SET NOCOUNT ON; IF EXISTS (SELECT 1 FROM (SELECT version_id FROM inserted UNION SELECT version_id FROM deleted) cambios JOIN matpel.gre_versiones v ON v.id = cambios.version_id WHERE v.estado = N''VALIDADA'') THROW 51094, N''El contenido de una versión GRE validada es inmutable.'', 1; END');
GO
IF OBJECT_ID('matpel.TR_gre_revisiones_inmutable', 'TR') IS NULL
    EXEC(N'CREATE TRIGGER matpel.TR_gre_revisiones_inmutable ON matpel.gre_revisiones INSTEAD OF UPDATE, DELETE AS BEGIN THROW 51094, N''El historial GRE es inmutable.'', 1; END');
GO
IF OBJECT_ID('matpel.TR_gre_activaciones_historial_inmutable', 'TR') IS NULL
    EXEC(N'CREATE TRIGGER matpel.TR_gre_activaciones_historial_inmutable ON matpel.gre_activaciones_historial INSTEAD OF UPDATE, DELETE AS BEGIN THROW 51094, N''El historial GRE es inmutable.'', 1; END');
GO
IF OBJECT_ID('matpel.TR_gre_activaciones_validada', 'TR') IS NULL
    EXEC(N'CREATE TRIGGER matpel.TR_gre_activaciones_validada ON matpel.gre_activaciones AFTER INSERT, UPDATE AS BEGIN SET NOCOUNT ON; IF EXISTS (SELECT 1 FROM inserted i JOIN matpel.gre_versiones v ON v.id = i.version_id JOIN matpel.gre_documentos d ON d.id = v.documento_id WHERE v.estado <> N''VALIDADA'' OR d.idioma <> i.idioma) THROW 51094, N''Solo se activa una versión validada del mismo idioma.'', 1; END');
GO
IF OBJECT_ID('matpel.TR_gre_activaciones_historial_validada', 'TR') IS NULL
    EXEC(N'CREATE TRIGGER matpel.TR_gre_activaciones_historial_validada ON matpel.gre_activaciones_historial AFTER INSERT, UPDATE AS BEGIN SET NOCOUNT ON; IF EXISTS (SELECT 1 FROM inserted i JOIN matpel.gre_versiones v ON v.id = i.version_id JOIN matpel.gre_documentos d ON d.id = v.documento_id WHERE v.estado <> N''VALIDADA'' OR d.idioma <> i.idioma) THROW 51094, N''Solo se activa una versión validada del mismo idioma.'', 1; END');
GO
