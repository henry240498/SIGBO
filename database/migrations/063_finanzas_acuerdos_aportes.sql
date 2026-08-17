/* =============================================================
   SIGBO-CBVC | Migracion 063 - Finanzas: Acuerdos de Aporte y Aportes
   =============================================================
   Etapa 2. Separacion explicita SOCIO -> ACUERDO (que se
   comprometio a aportar) -> APORTE (que efectivamente pago, seccion
   4-5 del pedido): "el monto acordado NO es el monto real". Cada
   aporte registrado impacta finanzas.movimientos_financieros como
   cualquier otro ingreso -- no se crea un ledger paralelo (a esa
   tabla se le agregan aqui las columnas socio_protector_id/
   aporte_id, mismo patron que cuota_id/orden_pago_id).
   ============================================================= */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

/* --- finanzas.acuerdos_aporte --- */

IF OBJECT_ID(N'finanzas.acuerdos_aporte', N'U') IS NULL
BEGIN
    CREATE TABLE finanzas.acuerdos_aporte (
        id                       UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_acap_id DEFAULT NEWSEQUENTIALID(),
        socio_protector_id       UNIQUEIDENTIFIER NOT NULL,
        monto_acordado           DECIMAL(15,2) NOT NULL,
        moneda                   NVARCHAR(3)   NOT NULL CONSTRAINT DF_acap_moneda DEFAULT N'PYG',
        periodicidad_id          UNIQUEIDENTIFIER NOT NULL,
        fecha_inicio             DATE          NOT NULL,
        fecha_fin                DATE          NULL,
        estado                   NVARCHAR(20)  NOT NULL CONSTRAINT DF_acap_estado DEFAULT N'ACTIVO',
        medio_pago_preferido_id  UNIQUEIDENTIFIER NULL,
        observaciones            NVARCHAR(MAX) NULL,
        institucion_id           UNIQUEIDENTIFIER NULL,
        creado_en                DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_acap_creado DEFAULT SYSDATETIMEOFFSET(),
        actualizado_en           DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_acap_act DEFAULT SYSDATETIMEOFFSET(),
        creado_por               UNIQUEIDENTIFIER NULL,
        actualizado_por          UNIQUEIDENTIFIER NULL,
        CONSTRAINT PK_acuerdos_aporte PRIMARY KEY CLUSTERED (id),
        CONSTRAINT CK_acap_monto CHECK (monto_acordado > 0),
        CONSTRAINT CK_acap_estado CHECK (estado IN (N'ACTIVO', N'FINALIZADO', N'SUSPENDIDO', N'CANCELADO')),
        CONSTRAINT FK_acap_socio FOREIGN KEY (socio_protector_id) REFERENCES finanzas.socios_protectores(id),
        CONSTRAINT FK_acap_periodicidad FOREIGN KEY (periodicidad_id) REFERENCES organizacion.parametros(id),
        CONSTRAINT FK_acap_mediopago FOREIGN KEY (medio_pago_preferido_id) REFERENCES organizacion.parametros(id),
        CONSTRAINT FK_acap_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_acap_socio' AND object_id = OBJECT_ID('finanzas.acuerdos_aporte'))
    CREATE INDEX IX_acap_socio ON finanzas.acuerdos_aporte(socio_protector_id);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_acap_estado' AND object_id = OBJECT_ID('finanzas.acuerdos_aporte'))
    CREATE INDEX IX_acap_estado ON finanzas.acuerdos_aporte(estado);
GO

/* --- finanzas.aportes --- */

IF OBJECT_ID(N'finanzas.aportes', N'U') IS NULL
BEGIN
    CREATE TABLE finanzas.aportes (
        id                         UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_apo_id DEFAULT NEWSEQUENTIALID(),
        socio_protector_id         UNIQUEIDENTIFIER NOT NULL,
        acuerdo_aporte_id          UNIQUEIDENTIFIER NULL,
        es_extraordinario          BIT           NOT NULL CONSTRAINT DF_apo_extra DEFAULT 0,
        fecha                      DATE          NOT NULL,
        hora                       TIME(0)       NULL,
        monto                      DECIMAL(15,2) NOT NULL,
        moneda                     NVARCHAR(3)   NOT NULL CONSTRAINT DF_apo_moneda DEFAULT N'PYG',
        periodo_correspondiente    CHAR(7)       NULL, -- 'YYYY-MM', NULL para extraordinarios sin periodo
        concepto                   NVARCHAR(300) NULL,
        medio_pago_id              UNIQUEIDENTIFIER NULL,
        numero_comprobante         NVARCHAR(100) NULL,
        caja_id                    UNIQUEIDENTIFIER NULL,
        cuenta_bancaria_id         UNIQUEIDENTIFIER NULL,
        archivo_url                NVARCHAR(MAX) NULL,
        movimiento_financiero_id   UNIQUEIDENTIFIER NULL,
        estado                     NVARCHAR(20)  NOT NULL CONSTRAINT DF_apo_estado DEFAULT N'REGISTRADO',
        anulado_por                UNIQUEIDENTIFIER NULL,
        fecha_anulacion            DATETIMEOFFSET(3) NULL,
        motivo_anulacion           NVARCHAR(MAX) NULL,
        observaciones              NVARCHAR(MAX) NULL,
        institucion_id             UNIQUEIDENTIFIER NULL,
        creado_en                  DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_apo_creado DEFAULT SYSDATETIMEOFFSET(),
        creado_por                 UNIQUEIDENTIFIER NULL,
        CONSTRAINT PK_aportes PRIMARY KEY CLUSTERED (id),
        CONSTRAINT CK_apo_monto CHECK (monto > 0),
        CONSTRAINT CK_apo_estado CHECK (estado IN (N'REGISTRADO', N'ANULADO')),
        CONSTRAINT CK_apo_periodo CHECK (periodo_correspondiente IS NULL OR periodo_correspondiente LIKE '[0-9][0-9][0-9][0-9]-[0-9][0-9]'),
        CONSTRAINT FK_apo_socio FOREIGN KEY (socio_protector_id) REFERENCES finanzas.socios_protectores(id),
        CONSTRAINT FK_apo_acuerdo FOREIGN KEY (acuerdo_aporte_id) REFERENCES finanzas.acuerdos_aporte(id),
        CONSTRAINT FK_apo_mediopago FOREIGN KEY (medio_pago_id) REFERENCES organizacion.parametros(id),
        CONSTRAINT FK_apo_caja FOREIGN KEY (caja_id) REFERENCES finanzas.cajas(id),
        CONSTRAINT FK_apo_cuentabancaria FOREIGN KEY (cuenta_bancaria_id) REFERENCES finanzas.cuentas_bancarias(id),
        CONSTRAINT FK_apo_movimiento FOREIGN KEY (movimiento_financiero_id) REFERENCES finanzas.movimientos_financieros(id),
        CONSTRAINT FK_apo_anuladopor FOREIGN KEY (anulado_por) REFERENCES seguridad.usuarios(id),
        CONSTRAINT FK_apo_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_apo_socio' AND object_id = OBJECT_ID('finanzas.aportes'))
    CREATE INDEX IX_apo_socio ON finanzas.aportes(socio_protector_id);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_apo_acuerdo' AND object_id = OBJECT_ID('finanzas.aportes'))
    CREATE INDEX IX_apo_acuerdo ON finanzas.aportes(acuerdo_aporte_id);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_apo_fecha' AND object_id = OBJECT_ID('finanzas.aportes'))
    CREATE INDEX IX_apo_fecha ON finanzas.aportes(fecha);
GO

/* --- finanzas.movimientos_financieros: trazabilidad hacia el socio/aporte
   que origino el ingreso (seccion 5 y 26 del pedido). factura_id se agrega
   en la migracion 065, cuando exista finanzas.facturas. --- */

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('finanzas.movimientos_financieros') AND name = 'socio_protector_id')
    ALTER TABLE finanzas.movimientos_financieros ADD socio_protector_id UNIQUEIDENTIFIER NULL;
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('finanzas.movimientos_financieros') AND name = 'aporte_id')
    ALTER TABLE finanzas.movimientos_financieros ADD aporte_id UNIQUEIDENTIFIER NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_movf_socio')
    ALTER TABLE finanzas.movimientos_financieros
        ADD CONSTRAINT FK_movf_socio FOREIGN KEY (socio_protector_id) REFERENCES finanzas.socios_protectores(id);
GO
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_movf_aporte')
    ALTER TABLE finanzas.movimientos_financieros
        ADD CONSTRAINT FK_movf_aporte FOREIGN KEY (aporte_id) REFERENCES finanzas.aportes(id);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_movf_socio' AND object_id = OBJECT_ID('finanzas.movimientos_financieros'))
    CREATE INDEX IX_movf_socio ON finanzas.movimientos_financieros(socio_protector_id);
GO
