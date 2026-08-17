/* =============================================================
   SIGBO-CBVC | Migracion 065 - Finanzas: Facturacion y Notas de Credito
   =============================================================
   Etapa 4. finanzas.facturas cubre facturas manuales (ya emitidas en
   papel, solo se registran) y deja preparado (columna `origen`) el
   caso SIGBO-generadas sin integracion fiscal real todavia (seccion
   15-17 del pedido: "no implementar integracion fiscal especifica si
   todavia no corresponde"). Reutiliza organizacion.parametros
   TIPO_DOCUMENTO_FINANZAS (Factura/Recibo/Comprobante/Nota de
   credito/Nota de debito/Otro, ya creado en 048) como tipo de
   comprobante -- no se duplica el catalogo.

   Las notas de credito NUNCA modifican ni eliminan la factura
   original (seccion 17: correccion no destructiva) -- son una fila
   adicional enlazada por factura_id.

   finanzas.numeraciones_comprobantes replica el patron ya probado de
   documentos.numeraciones (contador tipo+anio) pero con los campos
   propios de la numeracion de comprobantes en Paraguay
   (establecimiento/punto de expedicion/serie/timbrado/vigencia).

   organizacion.identidad_institucional gana `ruc` -- el unico dato
   fiscal que le faltaba; el resto (nombre, direccion, logos) ya
   existe y se reutiliza sin duplicar (seccion 19 del pedido).
   ============================================================= */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

/* --- organizacion.identidad_institucional: RUC --- */

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('organizacion.identidad_institucional') AND name = 'ruc')
    ALTER TABLE organizacion.identidad_institucional ADD ruc NVARCHAR(30) NULL;
GO

/* --- finanzas.numeraciones_comprobantes --- */

IF OBJECT_ID(N'finanzas.numeraciones_comprobantes', N'U') IS NULL
BEGIN
    CREATE TABLE finanzas.numeraciones_comprobantes (
        id                    UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_numc_id DEFAULT NEWSEQUENTIALID(),
        tipo_comprobante_id   UNIQUEIDENTIFIER NOT NULL,
        establecimiento       NVARCHAR(3)   NOT NULL,
        punto_expedicion      NVARCHAR(3)   NOT NULL,
        serie                 NVARCHAR(10)  NULL,
        timbrado              NVARCHAR(20)  NOT NULL,
        numeracion_desde      INT           NOT NULL,
        numeracion_hasta      INT           NOT NULL,
        ultimo_numero         INT           NOT NULL CONSTRAINT DF_numc_ultimo DEFAULT 0,
        vigencia_desde        DATE          NOT NULL,
        vigencia_hasta        DATE          NULL,
        estado                NVARCHAR(20)  NOT NULL CONSTRAINT DF_numc_estado DEFAULT N'ACTIVA',
        institucion_id        UNIQUEIDENTIFIER NULL,
        creado_en             DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_numc_creado DEFAULT SYSDATETIMEOFFSET(),
        creado_por            UNIQUEIDENTIFIER NULL,
        CONSTRAINT PK_numeraciones_comprobantes PRIMARY KEY CLUSTERED (id),
        CONSTRAINT CK_numc_estado CHECK (estado IN (N'ACTIVA', N'INACTIVA', N'AGOTADA')),
        CONSTRAINT CK_numc_rango CHECK (numeracion_hasta >= numeracion_desde),
        CONSTRAINT FK_numc_tipo FOREIGN KEY (tipo_comprobante_id) REFERENCES organizacion.parametros(id),
        CONSTRAINT FK_numc_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id)
    );
END
GO

/* --- finanzas.facturas --- */

IF OBJECT_ID(N'finanzas.facturas', N'U') IS NULL
BEGIN
    CREATE TABLE finanzas.facturas (
        id                       UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_fact_id DEFAULT NEWSEQUENTIALID(),
        origen                   NVARCHAR(10)  NOT NULL CONSTRAINT DF_fact_origen DEFAULT N'MANUAL',
        tipo_comprobante_id      UNIQUEIDENTIFIER NOT NULL,
        numero                   NVARCHAR(50)  NOT NULL,
        establecimiento          NVARCHAR(3)   NULL,
        punto_expedicion         NVARCHAR(3)   NULL,
        serie                    NVARCHAR(10)  NULL,
        timbrado                 NVARCHAR(20)  NULL,
        fecha                    DATE          NOT NULL,
        socio_protector_id       UNIQUEIDENTIFIER NULL,
        cliente_nombre           NVARCHAR(200) NULL,
        cliente_ruc_ci           NVARCHAR(30)  NULL,
        concepto                 NVARCHAR(300) NOT NULL,
        detalle                  NVARCHAR(MAX) NULL,
        cantidad                 DECIMAL(10,2) NOT NULL CONSTRAINT DF_fact_cant DEFAULT 1,
        precio_unitario          DECIMAL(15,2) NOT NULL,
        descuento                DECIMAL(15,2) NOT NULL CONSTRAINT DF_fact_desc DEFAULT 0,
        impuestos                DECIMAL(15,2) NOT NULL CONSTRAINT DF_fact_imp DEFAULT 0,
        total                    DECIMAL(15,2) NOT NULL,
        moneda                   NVARCHAR(3)   NOT NULL CONSTRAINT DF_fact_moneda DEFAULT N'PYG',
        forma_pago_id            UNIQUEIDENTIFIER NULL,
        aporte_id                UNIQUEIDENTIFIER NULL,
        inscripcion_academia_id  UNIQUEIDENTIFIER NULL,
        archivo_url              NVARCHAR(MAX) NULL,
        estado                   NVARCHAR(20)  NOT NULL CONSTRAINT DF_fact_estado DEFAULT N'EMITIDA',
        anulado_por              UNIQUEIDENTIFIER NULL,
        fecha_anulacion          DATETIMEOFFSET(3) NULL,
        motivo_anulacion         NVARCHAR(MAX) NULL,
        movimiento_financiero_id UNIQUEIDENTIFIER NULL,
        institucion_id           UNIQUEIDENTIFIER NULL,
        creado_en                DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_fact_creado DEFAULT SYSDATETIMEOFFSET(),
        actualizado_en           DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_fact_act DEFAULT SYSDATETIMEOFFSET(),
        creado_por               UNIQUEIDENTIFIER NULL,
        actualizado_por          UNIQUEIDENTIFIER NULL,
        CONSTRAINT PK_facturas PRIMARY KEY CLUSTERED (id),
        CONSTRAINT CK_fact_origen CHECK (origen IN (N'MANUAL', N'SIGBO')),
        CONSTRAINT CK_fact_estado CHECK (estado IN (N'EMITIDA', N'ANULADA')),
        CONSTRAINT CK_fact_total CHECK (total >= 0),
        CONSTRAINT UQ_facturas_identificacion UNIQUE (numero, timbrado, establecimiento, punto_expedicion),
        CONSTRAINT FK_fact_tipocomprobante FOREIGN KEY (tipo_comprobante_id) REFERENCES organizacion.parametros(id),
        CONSTRAINT FK_fact_socio FOREIGN KEY (socio_protector_id) REFERENCES finanzas.socios_protectores(id),
        CONSTRAINT FK_fact_formapago FOREIGN KEY (forma_pago_id) REFERENCES organizacion.parametros(id),
        CONSTRAINT FK_fact_aporte FOREIGN KEY (aporte_id) REFERENCES finanzas.aportes(id),
        CONSTRAINT FK_fact_inscripcion FOREIGN KEY (inscripcion_academia_id) REFERENCES academia.inscripciones(id),
        CONSTRAINT FK_fact_movimiento FOREIGN KEY (movimiento_financiero_id) REFERENCES finanzas.movimientos_financieros(id),
        CONSTRAINT FK_fact_anuladopor FOREIGN KEY (anulado_por) REFERENCES seguridad.usuarios(id),
        CONSTRAINT FK_fact_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_fact_socio' AND object_id = OBJECT_ID('finanzas.facturas'))
    CREATE INDEX IX_fact_socio ON finanzas.facturas(socio_protector_id);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_fact_fecha' AND object_id = OBJECT_ID('finanzas.facturas'))
    CREATE INDEX IX_fact_fecha ON finanzas.facturas(fecha);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_fact_estado' AND object_id = OBJECT_ID('finanzas.facturas'))
    CREATE INDEX IX_fact_estado ON finanzas.facturas(estado);
GO

/* --- finanzas.notas_credito --- */

IF OBJECT_ID(N'finanzas.notas_credito', N'U') IS NULL
BEGIN
    CREATE TABLE finanzas.notas_credito (
        id             UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_ncred_id DEFAULT NEWSEQUENTIALID(),
        factura_id     UNIQUEIDENTIFIER NOT NULL,
        numero         NVARCHAR(50)  NOT NULL,
        fecha          DATE          NOT NULL,
        motivo_id      UNIQUEIDENTIFIER NOT NULL,
        concepto       NVARCHAR(300) NULL,
        importe        DECIMAL(15,2) NOT NULL,
        archivo_url    NVARCHAR(MAX) NULL,
        estado         NVARCHAR(20)  NOT NULL CONSTRAINT DF_ncred_estado DEFAULT N'EMITIDA',
        institucion_id UNIQUEIDENTIFIER NULL,
        creado_en      DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_ncred_creado DEFAULT SYSDATETIMEOFFSET(),
        creado_por     UNIQUEIDENTIFIER NULL,
        CONSTRAINT PK_notas_credito PRIMARY KEY CLUSTERED (id),
        CONSTRAINT CK_ncred_importe CHECK (importe > 0),
        CONSTRAINT CK_ncred_estado CHECK (estado IN (N'EMITIDA', N'ANULADA')),
        CONSTRAINT FK_ncred_factura FOREIGN KEY (factura_id) REFERENCES finanzas.facturas(id),
        CONSTRAINT FK_ncred_motivo FOREIGN KEY (motivo_id) REFERENCES organizacion.parametros(id),
        CONSTRAINT FK_ncred_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ncred_factura' AND object_id = OBJECT_ID('finanzas.notas_credito'))
    CREATE INDEX IX_ncred_factura ON finanzas.notas_credito(factura_id);
GO

/* --- finanzas.aportes: enlace a la factura (la tabla facturas recien
   existe desde esta migracion -- mismo patron que
   documentos_respaldo.orden_pago_id en 049/051). --- */

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('finanzas.aportes') AND name = 'factura_id')
    ALTER TABLE finanzas.aportes ADD factura_id UNIQUEIDENTIFIER NULL;
GO
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_apo_factura')
    ALTER TABLE finanzas.aportes
        ADD CONSTRAINT FK_apo_factura FOREIGN KEY (factura_id) REFERENCES finanzas.facturas(id);
GO

/* --- finanzas.movimientos_financieros: enlace a la factura, cuando la
   factura genera un ingreso propio distinto del aporte. --- */

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('finanzas.movimientos_financieros') AND name = 'factura_id')
    ALTER TABLE finanzas.movimientos_financieros ADD factura_id UNIQUEIDENTIFIER NULL;
GO
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_movf_factura')
    ALTER TABLE finanzas.movimientos_financieros
        ADD CONSTRAINT FK_movf_factura FOREIGN KEY (factura_id) REFERENCES finanzas.facturas(id);
GO
