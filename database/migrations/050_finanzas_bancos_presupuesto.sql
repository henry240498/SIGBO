/* =============================================================
   SIGBO-CBVC | Migracion 050 - Finanzas: movimientos bancarios y presupuesto
   =============================================================
   Etapa 3. `movimientos_bancarios` cubre depositos/transferencias/
   debitos/creditos/comisiones (seccion 12) con conciliacion simple
   (seccion 13: marcar Conciliado/Pendiente/Diferencia -- nunca ajustar
   automaticamente). `presupuestos` es una fila por ejercicio+categoria
   con el monto presupuestado; el "ejecutado" NUNCA se guarda como
   columna -- se calcula en tiempo real sumando
   finanzas.movimientos_financieros (evita desincronizacion, igual
   criterio que Deposito con las cantidades derivadas de tenencias).
   ============================================================= */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'finanzas.movimientos_bancarios', N'U') IS NULL
BEGIN
    CREATE TABLE finanzas.movimientos_bancarios (
        id                      UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_movb_id DEFAULT NEWSEQUENTIALID(),
        cuenta_bancaria_id      UNIQUEIDENTIFIER NOT NULL,
        tipo                    NVARCHAR(20)  NOT NULL,
        fecha                   DATE          NOT NULL,
        importe                 DECIMAL(15,2) NOT NULL,
        descripcion             NVARCHAR(300) NOT NULL,
        movimiento_financiero_id UNIQUEIDENTIFIER NULL,
        estado_conciliacion     NVARCHAR(20)  NOT NULL CONSTRAINT DF_movb_estconc DEFAULT N'PENDIENTE',
        fecha_conciliacion      DATETIMEOFFSET(3) NULL,
        conciliado_por          UNIQUEIDENTIFIER NULL,
        observacion             NVARCHAR(MAX) NULL,
        creado_en               DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_movb_creado DEFAULT SYSDATETIMEOFFSET(),
        creado_por              UNIQUEIDENTIFIER NULL,
        CONSTRAINT PK_movimientos_bancarios PRIMARY KEY CLUSTERED (id),
        CONSTRAINT CK_movb_tipo CHECK (tipo IN (N'DEPOSITO', N'TRANSFERENCIA', N'DEBITO', N'CREDITO', N'COMISION', N'OTRO')),
        CONSTRAINT CK_movb_estconc CHECK (estado_conciliacion IN (N'PENDIENTE', N'CONCILIADO', N'DIFERENCIA')),
        CONSTRAINT FK_movb_cuenta FOREIGN KEY (cuenta_bancaria_id) REFERENCES finanzas.cuentas_bancarias(id),
        CONSTRAINT FK_movb_movfinanciero FOREIGN KEY (movimiento_financiero_id) REFERENCES finanzas.movimientos_financieros(id),
        CONSTRAINT FK_movb_conciliadopor FOREIGN KEY (conciliado_por) REFERENCES seguridad.usuarios(id),
        CONSTRAINT FK_movb_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_movb_cuenta' AND object_id = OBJECT_ID('finanzas.movimientos_bancarios'))
    CREATE INDEX IX_movb_cuenta ON finanzas.movimientos_bancarios(cuenta_bancaria_id);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_movb_estconc' AND object_id = OBJECT_ID('finanzas.movimientos_bancarios'))
    CREATE INDEX IX_movb_estconc ON finanzas.movimientos_bancarios(estado_conciliacion);
GO

/* --- finanzas.presupuestos (seccion 14 del pedido) --- */

IF OBJECT_ID(N'finanzas.presupuestos', N'U') IS NULL
BEGIN
    CREATE TABLE finanzas.presupuestos (
        id                   UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_pres_id DEFAULT NEWSEQUENTIALID(),
        ejercicio_id         UNIQUEIDENTIFIER NOT NULL,
        categoria_egreso_id  UNIQUEIDENTIFIER NOT NULL,
        monto_presupuestado  DECIMAL(15,2) NOT NULL,
        observacion          NVARCHAR(MAX) NULL,
        creado_en            DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_pres_creado DEFAULT SYSDATETIMEOFFSET(),
        actualizado_en       DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_pres_act DEFAULT SYSDATETIMEOFFSET(),
        creado_por           UNIQUEIDENTIFIER NULL,
        actualizado_por      UNIQUEIDENTIFIER NULL,
        CONSTRAINT PK_presupuestos PRIMARY KEY CLUSTERED (id),
        CONSTRAINT UQ_presupuestos_ejercicio_categoria UNIQUE (ejercicio_id, categoria_egreso_id),
        CONSTRAINT CK_pres_monto CHECK (monto_presupuestado >= 0),
        CONSTRAINT FK_pres_ejercicio FOREIGN KEY (ejercicio_id) REFERENCES finanzas.ejercicios_fiscales(id),
        CONSTRAINT FK_pres_categoria FOREIGN KEY (categoria_egreso_id) REFERENCES organizacion.parametros(id)
    );
END
GO
