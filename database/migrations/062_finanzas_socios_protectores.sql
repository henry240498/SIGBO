/* =============================================================
   SIGBO-CBVC | Migracion 062 - Finanzas: Socios Protectores
   =============================================================
   Etapa 1 de la extension "Socios Protectores, Ingresos y
   Facturacion". Identificacion del socio (persona fisica o
   juridica, o vinculo explicito a personal.bomberos -- nunca se
   duplica el registro de Personal), con codigo visible/editable
   separado del PK interno y su historial de cambios (mismo patron
   que personal.historial_codigo para numeroBombero).
   ============================================================= */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

/* --- Catalogos parametrizables nuevos --- */

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
        N'NIVEL_CONFIDENCIALIDAD_DOCUMENTO', N'MOTIVO_ANULACION_DOCUMENTO', N'ARCHIVO_FISICO_DOCUMENTO',
        N'ESTADO_SOCIO_PROTECTOR', N'PERIODICIDAD_APORTE', N'MEDIO_PAGO_FINANZAS',
        N'TIPO_BENEFICIO_SOCIO', N'MOTIVO_NOTA_CREDITO_FINANZAS'
    ));
GO

INSERT INTO organizacion.parametros (tipo, nombre, nombre_normalizado, orden)
SELECT v.tipo, v.nombre, v.nombre_normalizado, v.orden FROM (VALUES
    (N'ESTADO_SOCIO_PROTECTOR', N'Activo',      N'activo',      1),
    (N'ESTADO_SOCIO_PROTECTOR', N'Suspendido',  N'suspendido',  2),
    (N'ESTADO_SOCIO_PROTECTOR', N'Inactivo',    N'inactivo',    3),
    (N'ESTADO_SOCIO_PROTECTOR', N'Baja',        N'baja',        4),

    (N'PERIODICIDAD_APORTE', N'Diario',      N'diario',      1),
    (N'PERIODICIDAD_APORTE', N'Semanal',     N'semanal',     2),
    (N'PERIODICIDAD_APORTE', N'Quincenal',   N'quincenal',   3),
    (N'PERIODICIDAD_APORTE', N'Mensual',     N'mensual',     4),
    (N'PERIODICIDAD_APORTE', N'Bimestral',   N'bimestral',   5),
    (N'PERIODICIDAD_APORTE', N'Trimestral',  N'trimestral',  6),
    (N'PERIODICIDAD_APORTE', N'Semestral',   N'semestral',   7),
    (N'PERIODICIDAD_APORTE', N'Anual',       N'anual',       8),
    (N'PERIODICIDAD_APORTE', N'Otra',        N'otra',        9),

    (N'MEDIO_PAGO_FINANZAS', N'Efectivo',            N'efectivo',            1),
    (N'MEDIO_PAGO_FINANZAS', N'Transferencia',       N'transferencia',       2),
    (N'MEDIO_PAGO_FINANZAS', N'Deposito bancario',   N'deposito bancario',   3),
    (N'MEDIO_PAGO_FINANZAS', N'Cheque',              N'cheque',              4),
    (N'MEDIO_PAGO_FINANZAS', N'Tarjeta de credito',  N'tarjeta de credito',  5),
    (N'MEDIO_PAGO_FINANZAS', N'Tarjeta de debito',   N'tarjeta de debito',   6),
    (N'MEDIO_PAGO_FINANZAS', N'Billetera electronica', N'billetera electronica', 7),
    (N'MEDIO_PAGO_FINANZAS', N'Otro',                N'otro',                8),

    (N'TIPO_BENEFICIO_SOCIO', N'Descuento en Academia',  N'descuento en academia',  1),
    (N'TIPO_BENEFICIO_SOCIO', N'Descuento en Servicios', N'descuento en servicios', 2),
    (N'TIPO_BENEFICIO_SOCIO', N'Otro',                   N'otro',                   3),

    (N'MOTIVO_NOTA_CREDITO_FINANZAS', N'Error de facturacion',   N'error de facturacion',   1),
    (N'MOTIVO_NOTA_CREDITO_FINANZAS', N'Descuento posterior',    N'descuento posterior',    2),
    (N'MOTIVO_NOTA_CREDITO_FINANZAS', N'Anulacion parcial',      N'anulacion parcial',      3),
    (N'MOTIVO_NOTA_CREDITO_FINANZAS', N'Devolucion',             N'devolucion',             4),
    (N'MOTIVO_NOTA_CREDITO_FINANZAS', N'Otro',                   N'otro',                   5)
) AS v(tipo, nombre, nombre_normalizado, orden)
WHERE NOT EXISTS (SELECT 1 FROM organizacion.parametros p WHERE p.tipo = v.tipo AND p.nombre_normalizado = v.nombre_normalizado AND p.padre_id IS NULL);
GO

/* TIPO_INGRESO_FINANZAS ya existe (048) con 'Aportes' -- se agrega
   'Academia' para poder distinguir el origen de un ingreso (seccion
   26 del pedido: Socio Protector / Servicio / Academia / Otros). */
INSERT INTO organizacion.parametros (tipo, nombre, nombre_normalizado, orden)
SELECT N'TIPO_INGRESO_FINANZAS', N'Academia', N'academia', 11
WHERE NOT EXISTS (SELECT 1 FROM organizacion.parametros p WHERE p.tipo = N'TIPO_INGRESO_FINANZAS' AND p.nombre_normalizado = N'academia' AND p.padre_id IS NULL);
GO

/* --- finanzas.socios_protectores --- */

IF OBJECT_ID(N'finanzas.socios_protectores', N'U') IS NULL
BEGIN
    CREATE TABLE finanzas.socios_protectores (
        id                     UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_socio_id DEFAULT NEWSEQUENTIALID(),
        codigo                 NVARCHAR(20)  NOT NULL,
        tipo_persona           NVARCHAR(10)  NOT NULL,
        bombero_id             UNIQUEIDENTIFIER NULL,
        -- Persona fisica (NULL cuando bombero_id IS NOT NULL: se resuelve por join, nunca se duplica)
        nombre                 NVARCHAR(100) NULL,
        apellido               NVARCHAR(100) NULL,
        ci                     NVARCHAR(20)  NULL,
        fecha_nacimiento       DATE          NULL,
        -- Persona juridica
        razon_social           NVARCHAR(200) NULL,
        ruc                    NVARCHAR(30)  NULL,
        nombre_comercial       NVARCHAR(200) NULL,
        representante_nombre   NVARCHAR(150) NULL,
        representante_ci       NVARCHAR(20)  NULL,
        -- Contacto y ubicacion (comunes; ubicacion via catalogos existentes, nunca texto libre)
        telefono               NVARCHAR(20)  NULL,
        celular                NVARCHAR(20)  NULL,
        email                  NVARCHAR(255) NULL,
        direccion              NVARCHAR(300) NULL,
        pais_id                UNIQUEIDENTIFIER NULL,
        departamento_id        UNIQUEIDENTIFIER NULL,
        ciudad_id              UNIQUEIDENTIFIER NULL,
        barrio_id              UNIQUEIDENTIFIER NULL,
        estado_id              UNIQUEIDENTIFIER NOT NULL,
        observaciones          NVARCHAR(MAX) NULL,
        institucion_id         UNIQUEIDENTIFIER NULL,
        creado_en              DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_socio_creado DEFAULT SYSDATETIMEOFFSET(),
        actualizado_en         DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_socio_act DEFAULT SYSDATETIMEOFFSET(),
        creado_por             UNIQUEIDENTIFIER NULL,
        actualizado_por        UNIQUEIDENTIFIER NULL,
        CONSTRAINT PK_socios_protectores PRIMARY KEY CLUSTERED (id),
        CONSTRAINT UQ_socios_protectores_codigo UNIQUE (codigo),
        CONSTRAINT CK_socio_tipo_persona CHECK (tipo_persona IN (N'FISICA', N'JURIDICA')),
        CONSTRAINT FK_socio_bombero FOREIGN KEY (bombero_id) REFERENCES personal.bomberos(id),
        CONSTRAINT FK_socio_pais FOREIGN KEY (pais_id) REFERENCES organizacion.parametros(id),
        CONSTRAINT FK_socio_departamento FOREIGN KEY (departamento_id) REFERENCES organizacion.parametros(id),
        CONSTRAINT FK_socio_ciudad FOREIGN KEY (ciudad_id) REFERENCES organizacion.parametros(id),
        CONSTRAINT FK_socio_barrio FOREIGN KEY (barrio_id) REFERENCES organizacion.parametros(id),
        CONSTRAINT FK_socio_estado FOREIGN KEY (estado_id) REFERENCES organizacion.parametros(id),
        CONSTRAINT FK_socio_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id),
        CONSTRAINT FK_socio_actualizadopor FOREIGN KEY (actualizado_por) REFERENCES seguridad.usuarios(id)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_socio_estado' AND object_id = OBJECT_ID('finanzas.socios_protectores'))
    CREATE INDEX IX_socio_estado ON finanzas.socios_protectores(estado_id);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_socio_bombero' AND object_id = OBJECT_ID('finanzas.socios_protectores'))
    CREATE INDEX IX_socio_bombero ON finanzas.socios_protectores(bombero_id);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_socio_ruc' AND object_id = OBJECT_ID('finanzas.socios_protectores'))
    CREATE INDEX IX_socio_ruc ON finanzas.socios_protectores(ruc);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_socio_ci' AND object_id = OBJECT_ID('finanzas.socios_protectores'))
    CREATE INDEX IX_socio_ci ON finanzas.socios_protectores(ci);
GO

/* --- finanzas.socios_historial_codigo (seccion 3 del pedido: SC001 ->
   SC125 debe dejar rastro -- mismo shape que personal.historial_codigo) --- */

IF OBJECT_ID(N'finanzas.socios_historial_codigo', N'U') IS NULL
BEGIN
    CREATE TABLE finanzas.socios_historial_codigo (
        id                UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_shc_id DEFAULT NEWSEQUENTIALID(),
        socio_protector_id UNIQUEIDENTIFIER NOT NULL,
        codigo_anterior   NVARCHAR(20)  NOT NULL,
        codigo_nuevo      NVARCHAR(20)  NOT NULL,
        motivo            NVARCHAR(MAX) NULL,
        fecha_cambio      DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_shc_fecha DEFAULT SYSDATETIMEOFFSET(),
        cambiado_por      UNIQUEIDENTIFIER NULL,
        CONSTRAINT PK_socios_historial_codigo PRIMARY KEY CLUSTERED (id),
        CONSTRAINT FK_shc_socio FOREIGN KEY (socio_protector_id) REFERENCES finanzas.socios_protectores(id),
        CONSTRAINT FK_shc_cambiadopor FOREIGN KEY (cambiado_por) REFERENCES seguridad.usuarios(id)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_shc_socio' AND object_id = OBJECT_ID('finanzas.socios_historial_codigo'))
    CREATE INDEX IX_shc_socio ON finanzas.socios_historial_codigo(socio_protector_id);
GO
