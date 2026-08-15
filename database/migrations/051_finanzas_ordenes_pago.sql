/* =============================================================
   SIGBO-CBVC | Migracion 051 - Finanzas: ordenes de pago
   =============================================================
   Etapa 4. Maquina de estados BORRADOR -> SOLICITADO ->
   PENDIENTE_AUTORIZACION -> AUTORIZADO -> PAGADO (seccion 18 del
   pedido), con ramas RECHAZADO/ANULADO. Mismo patron que
   servicios.comunicaciones_servicio (permiso distinto por transicion,
   motivo obligatorio en transiciones negativas, `version` para
   optimistic locking) -- ver OrdenesPagoService.

   Al llegar a PAGADO, la orden genera (o se le asocia) el egreso real
   en finanzas.movimientos_financieros via `movimiento_id` -- la orden
   de pago es la solicitud/autorizacion, el movimiento es el hecho
   economico consumado.
   ============================================================= */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'finanzas.ordenes_pago', N'U') IS NULL
BEGIN
    CREATE TABLE finanzas.ordenes_pago (
        id                   UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_ordp_id DEFAULT NEWSEQUENTIALID(),
        concepto             NVARCHAR(300) NOT NULL,
        importe              DECIMAL(15,2) NOT NULL,
        categoria_egreso_id  UNIQUEIDENTIFIER NOT NULL,
        proveedor_id         UNIQUEIDENTIFIER NULL,
        caja_id              UNIQUEIDENTIFIER NULL,
        cuenta_bancaria_id   UNIQUEIDENTIFIER NULL,
        ejercicio_id         UNIQUEIDENTIFIER NOT NULL,
        estado               NVARCHAR(30)  NOT NULL CONSTRAINT DF_ordp_estado DEFAULT N'BORRADOR',
        solicitado_por       UNIQUEIDENTIFIER NULL,
        fecha_solicitud      DATETIMEOFFSET(3) NULL,
        autorizado_por       UNIQUEIDENTIFIER NULL,
        fecha_autorizacion   DATETIMEOFFSET(3) NULL,
        rechazado_por        UNIQUEIDENTIFIER NULL,
        fecha_rechazo        DATETIMEOFFSET(3) NULL,
        motivo_rechazo       NVARCHAR(MAX) NULL,
        anulado_por          UNIQUEIDENTIFIER NULL,
        fecha_anulacion      DATETIMEOFFSET(3) NULL,
        motivo_anulacion     NVARCHAR(MAX) NULL,
        movimiento_id        UNIQUEIDENTIFIER NULL,
        version              INT           NOT NULL CONSTRAINT DF_ordp_version DEFAULT 1,
        institucion_id       UNIQUEIDENTIFIER NULL,
        observacion          NVARCHAR(MAX) NULL,
        creado_en            DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_ordp_creado DEFAULT SYSDATETIMEOFFSET(),
        actualizado_en       DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_ordp_act DEFAULT SYSDATETIMEOFFSET(),
        creado_por           UNIQUEIDENTIFIER NULL,
        CONSTRAINT PK_ordenes_pago PRIMARY KEY CLUSTERED (id),
        CONSTRAINT CK_ordp_estado CHECK (estado IN (N'BORRADOR', N'SOLICITADO', N'PENDIENTE_AUTORIZACION', N'AUTORIZADO', N'RECHAZADO', N'PAGADO', N'ANULADO')),
        CONSTRAINT CK_ordp_importe CHECK (importe > 0),
        CONSTRAINT FK_ordp_categoria FOREIGN KEY (categoria_egreso_id) REFERENCES organizacion.parametros(id),
        CONSTRAINT FK_ordp_proveedor FOREIGN KEY (proveedor_id) REFERENCES deposito.proveedores(id),
        CONSTRAINT FK_ordp_caja FOREIGN KEY (caja_id) REFERENCES finanzas.cajas(id),
        CONSTRAINT FK_ordp_cuentabancaria FOREIGN KEY (cuenta_bancaria_id) REFERENCES finanzas.cuentas_bancarias(id),
        CONSTRAINT FK_ordp_ejercicio FOREIGN KEY (ejercicio_id) REFERENCES finanzas.ejercicios_fiscales(id),
        CONSTRAINT FK_ordp_movimiento FOREIGN KEY (movimiento_id) REFERENCES finanzas.movimientos_financieros(id),
        CONSTRAINT FK_ordp_solicitadopor FOREIGN KEY (solicitado_por) REFERENCES seguridad.usuarios(id),
        CONSTRAINT FK_ordp_autorizadopor FOREIGN KEY (autorizado_por) REFERENCES seguridad.usuarios(id),
        CONSTRAINT FK_ordp_rechazadopor FOREIGN KEY (rechazado_por) REFERENCES seguridad.usuarios(id),
        CONSTRAINT FK_ordp_anuladopor FOREIGN KEY (anulado_por) REFERENCES seguridad.usuarios(id),
        CONSTRAINT FK_ordp_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ordp_estado' AND object_id = OBJECT_ID('finanzas.ordenes_pago'))
    CREATE INDEX IX_ordp_estado ON finanzas.ordenes_pago(estado);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_movf_ordenpago')
    ALTER TABLE finanzas.movimientos_financieros
        ADD CONSTRAINT FK_movf_ordenpago FOREIGN KEY (orden_pago_id) REFERENCES finanzas.ordenes_pago(id);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_docf_ordenpago')
    ALTER TABLE finanzas.documentos_respaldo
        ADD CONSTRAINT FK_docf_ordenpago FOREIGN KEY (orden_pago_id) REFERENCES finanzas.ordenes_pago(id);
GO
