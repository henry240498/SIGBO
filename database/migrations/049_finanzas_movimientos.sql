/* =============================================================
   SIGBO-CBVC | Migracion 049 - Finanzas: movimientos, documentos, cuotas
   =============================================================
   Etapa 2. `finanzas.movimientos_financieros` es el ledger central
   (seccion 2 del pedido: saldo = inicial + ingresos - egresos +/-
   ajustes, siempre reconstruible desde el historial, nunca un numero
   suelto). Nunca se edita el importe de un movimiento ya registrado:
   se anula (estado + motivo + usuario + fecha) y se carga uno nuevo
   si corresponde -- igual criterio que deposito.movimientos.

   `deposito_entrada_id` (FK a deposito.entradas) es el punto de
   integracion de compras/donaciones (secciones 16-17): un egreso de
   Finanzas puede *referenciar* la entrada de Deposito que le dio
   origen en vez de reingresar los items -- ver
   IntegracionFinanzasService. No se duplica informacion.
   ============================================================= */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'finanzas.movimientos_financieros', N'U') IS NULL
BEGIN
    CREATE TABLE finanzas.movimientos_financieros (
        id                     UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_movf_id DEFAULT NEWSEQUENTIALID(),
        tipo                   NVARCHAR(10)  NOT NULL,
        fecha                  DATE          NOT NULL,
        tipo_ingreso_id        UNIQUEIDENTIFIER NULL,
        categoria_egreso_id    UNIQUEIDENTIFIER NULL,
        concepto               NVARCHAR(300) NOT NULL,
        importe                DECIMAL(15,2) NOT NULL,
        moneda                 NVARCHAR(3)   NOT NULL CONSTRAINT DF_movf_moneda DEFAULT N'PYG',
        caja_id                UNIQUEIDENTIFIER NULL,
        cuenta_bancaria_id     UNIQUEIDENTIFIER NULL,
        turno_caja_id          UNIQUEIDENTIFIER NULL,
        proveedor_id           UNIQUEIDENTIFIER NULL,
        bombero_id             UNIQUEIDENTIFIER NULL,
        entidad_externa        NVARCHAR(300) NULL,
        responsable_id         UNIQUEIDENTIFIER NULL,
        cuota_id               UNIQUEIDENTIFIER NULL,
        orden_pago_id          UNIQUEIDENTIFIER NULL,
        deposito_entrada_id    UNIQUEIDENTIFIER NULL,
        ejercicio_id           UNIQUEIDENTIFIER NOT NULL,
        observacion            NVARCHAR(MAX) NULL,
        estado                 NVARCHAR(20)  NOT NULL CONSTRAINT DF_movf_estado DEFAULT N'REGISTRADO',
        anulado_por            UNIQUEIDENTIFIER NULL,
        fecha_anulacion        DATETIMEOFFSET(3) NULL,
        motivo_anulacion_id    UNIQUEIDENTIFIER NULL,
        motivo_anulacion_detalle NVARCHAR(MAX) NULL,
        institucion_id         UNIQUEIDENTIFIER NULL,
        creado_en              DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_movf_creado DEFAULT SYSDATETIMEOFFSET(),
        creado_por             UNIQUEIDENTIFIER NULL,
        CONSTRAINT PK_movimientos_financieros PRIMARY KEY CLUSTERED (id),
        CONSTRAINT CK_movf_tipo CHECK (tipo IN (N'INGRESO', N'EGRESO')),
        CONSTRAINT CK_movf_estado CHECK (estado IN (N'REGISTRADO', N'ANULADO')),
        CONSTRAINT CK_movf_importe CHECK (importe > 0),
        CONSTRAINT CK_movf_origen CHECK (
            (caja_id IS NOT NULL AND cuenta_bancaria_id IS NULL) OR
            (caja_id IS NULL AND cuenta_bancaria_id IS NOT NULL)
        ),
        CONSTRAINT CK_movf_clasificacion CHECK (
            (tipo = N'INGRESO' AND tipo_ingreso_id IS NOT NULL AND categoria_egreso_id IS NULL) OR
            (tipo = N'EGRESO' AND categoria_egreso_id IS NOT NULL AND tipo_ingreso_id IS NULL)
        ),
        CONSTRAINT FK_movf_tipoingreso FOREIGN KEY (tipo_ingreso_id) REFERENCES organizacion.parametros(id),
        CONSTRAINT FK_movf_categoriaegreso FOREIGN KEY (categoria_egreso_id) REFERENCES organizacion.parametros(id),
        CONSTRAINT FK_movf_caja FOREIGN KEY (caja_id) REFERENCES finanzas.cajas(id),
        CONSTRAINT FK_movf_cuentabancaria FOREIGN KEY (cuenta_bancaria_id) REFERENCES finanzas.cuentas_bancarias(id),
        CONSTRAINT FK_movf_turnocaja FOREIGN KEY (turno_caja_id) REFERENCES finanzas.turnos_caja(id),
        CONSTRAINT FK_movf_proveedor FOREIGN KEY (proveedor_id) REFERENCES deposito.proveedores(id),
        CONSTRAINT FK_movf_bombero FOREIGN KEY (bombero_id) REFERENCES personal.bomberos(id),
        CONSTRAINT FK_movf_responsable FOREIGN KEY (responsable_id) REFERENCES personal.bomberos(id),
        CONSTRAINT FK_movf_deposito_entrada FOREIGN KEY (deposito_entrada_id) REFERENCES deposito.entradas(id),
        CONSTRAINT FK_movf_ejercicio FOREIGN KEY (ejercicio_id) REFERENCES finanzas.ejercicios_fiscales(id),
        CONSTRAINT FK_movf_motivoanulacion FOREIGN KEY (motivo_anulacion_id) REFERENCES organizacion.parametros(id),
        CONSTRAINT FK_movf_anuladopor FOREIGN KEY (anulado_por) REFERENCES seguridad.usuarios(id),
        CONSTRAINT FK_movf_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_movf_fecha' AND object_id = OBJECT_ID('finanzas.movimientos_financieros'))
    CREATE INDEX IX_movf_fecha ON finanzas.movimientos_financieros(fecha);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_movf_caja' AND object_id = OBJECT_ID('finanzas.movimientos_financieros'))
    CREATE INDEX IX_movf_caja ON finanzas.movimientos_financieros(caja_id);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_movf_cuentabancaria' AND object_id = OBJECT_ID('finanzas.movimientos_financieros'))
    CREATE INDEX IX_movf_cuentabancaria ON finanzas.movimientos_financieros(cuenta_bancaria_id);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_movf_ejercicio' AND object_id = OBJECT_ID('finanzas.movimientos_financieros'))
    CREATE INDEX IX_movf_ejercicio ON finanzas.movimientos_financieros(ejercicio_id);
GO

/* --- finanzas.documentos_respaldo (seccion 10 del pedido) --- */

IF OBJECT_ID(N'finanzas.documentos_respaldo', N'U') IS NULL
BEGIN
    CREATE TABLE finanzas.documentos_respaldo (
        id                UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_docf_id DEFAULT NEWSEQUENTIALID(),
        movimiento_id     UNIQUEIDENTIFIER NULL,
        orden_pago_id     UNIQUEIDENTIFIER NULL,
        tipo_documento_id UNIQUEIDENTIFIER NOT NULL,
        numero            NVARCHAR(100) NULL,
        timbrado          NVARCHAR(50)  NULL,
        fecha             DATE          NULL,
        proveedor_id      UNIQUEIDENTIFIER NULL,
        importe           DECIMAL(15,2) NULL,
        archivo_url       NVARCHAR(MAX) NULL,
        observacion       NVARCHAR(MAX) NULL,
        creado_en         DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_docf_creado DEFAULT SYSDATETIMEOFFSET(),
        creado_por        UNIQUEIDENTIFIER NULL,
        CONSTRAINT PK_documentos_respaldo PRIMARY KEY CLUSTERED (id),
        CONSTRAINT FK_docf_movimiento FOREIGN KEY (movimiento_id) REFERENCES finanzas.movimientos_financieros(id),
        CONSTRAINT FK_docf_tipodocumento FOREIGN KEY (tipo_documento_id) REFERENCES organizacion.parametros(id),
        CONSTRAINT FK_docf_proveedor FOREIGN KEY (proveedor_id) REFERENCES deposito.proveedores(id),
        CONSTRAINT FK_docf_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id)
    );
END
GO

/* orden_pago_id se agrega recien en la migracion 051 (ahi se crea la
   tabla finanzas.ordenes_pago) -- el FK se agrega en esa migracion
   para no reordenar la creacion de tablas. */

/* --- finanzas.cuotas (seccion 7 del pedido) --- */

IF OBJECT_ID(N'finanzas.cuotas', N'U') IS NULL
BEGIN
    CREATE TABLE finanzas.cuotas (
        id               UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_cuota_id DEFAULT NEWSEQUENTIALID(),
        bombero_id       UNIQUEIDENTIFIER NOT NULL,
        periodo          CHAR(7)       NOT NULL, -- 'YYYY-MM'
        importe          DECIMAL(15,2) NOT NULL,
        importe_pagado   DECIMAL(15,2) NOT NULL CONSTRAINT DF_cuota_pagado DEFAULT 0,
        estado           NVARCHAR(20)  NOT NULL CONSTRAINT DF_cuota_estado DEFAULT N'PENDIENTE',
        fecha_vencimiento DATE         NULL,
        movimiento_id    UNIQUEIDENTIFIER NULL,
        observacion      NVARCHAR(MAX) NULL,
        institucion_id   UNIQUEIDENTIFIER NULL,
        creado_en        DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_cuota_creado DEFAULT SYSDATETIMEOFFSET(),
        creado_por       UNIQUEIDENTIFIER NULL,
        CONSTRAINT PK_cuotas PRIMARY KEY CLUSTERED (id),
        CONSTRAINT UQ_cuotas_bombero_periodo UNIQUE (bombero_id, periodo),
        CONSTRAINT CK_cuota_estado CHECK (estado IN (N'PENDIENTE', N'PAGADA', N'PARCIAL', N'ANULADA', N'EXONERADA')),
        CONSTRAINT CK_cuota_periodo CHECK (periodo LIKE '[0-9][0-9][0-9][0-9]-[0-9][0-9]'),
        CONSTRAINT FK_cuota_bombero FOREIGN KEY (bombero_id) REFERENCES personal.bomberos(id),
        CONSTRAINT FK_cuota_movimiento FOREIGN KEY (movimiento_id) REFERENCES finanzas.movimientos_financieros(id)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_cuota_estado' AND object_id = OBJECT_ID('finanzas.cuotas'))
    CREATE INDEX IX_cuota_estado ON finanzas.cuotas(estado);
GO

/* movimientos_financieros.cuota_id / orden_pago_id se dejaron sin FK en
   la migracion 049 (a cuota_id le falta la tabla hasta esta misma
   migracion, y orden_pago_id hasta la 051). Se agregan aca las que ya
   pueden resolverse. */
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_movf_cuota')
    ALTER TABLE finanzas.movimientos_financieros
        ADD CONSTRAINT FK_movf_cuota FOREIGN KEY (cuota_id) REFERENCES finanzas.cuotas(id);
GO
