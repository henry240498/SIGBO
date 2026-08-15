/* =============================================================
   SIGBO-CBVC | Migracion 048 - Modulo Finanzas, estructura base
   =============================================================
   Etapa 1: catalogos parametrizables nuevos, ejercicios fiscales,
   cajas, turnos de caja (apertura/cierre), cuentas bancarias.

   Reutiliza sin duplicar: deposito.proveedores (catalogo de
   proveedores ya completo con dedupe por RUC -- Finanzas NO crea un
   finanzas.proveedores propio), personal.bomberos (responsables),
   organizacion.parametros (catalogos), seguridad.usuarios (auditoria).

   El schema `finanzas` ya existe (001_schemas.sql) con tablas legadas
   `finanzas.cuentas_contables` y `finanzas.movimientos` (008_admin.sql)
   sin entidad TypeORM ni controller -- codigo muerto, igual que
   deposito.items_deposito/movimientos_deposito antes de la migracion
   041. Se dejan intactas; las tablas nuevas usan nombres distintos
   (`movimientos_financieros`, no `movimientos`) para no colisionar.
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
        N'TIPO_DOCUMENTO_FINANZAS', N'MOTIVO_ANULACION_FINANZAS'
    ));
GO

INSERT INTO organizacion.parametros (tipo, nombre, nombre_normalizado, orden)
SELECT v.tipo, v.nombre, v.nombre_normalizado, v.orden FROM (VALUES
    (N'TIPO_INGRESO_FINANZAS', N'Cuotas',         N'cuotas',         1),
    (N'TIPO_INGRESO_FINANZAS', N'Donaciones',     N'donaciones',     2),
    (N'TIPO_INGRESO_FINANZAS', N'Subsidios',      N'subsidios',      3),
    (N'TIPO_INGRESO_FINANZAS', N'Aportes',        N'aportes',        4),
    (N'TIPO_INGRESO_FINANZAS', N'Eventos',        N'eventos',        5),
    (N'TIPO_INGRESO_FINANZAS', N'Rifas',          N'rifas',          6),
    (N'TIPO_INGRESO_FINANZAS', N'Beneficios',     N'beneficios',     7),
    (N'TIPO_INGRESO_FINANZAS', N'Servicios',      N'servicios',      8),
    (N'TIPO_INGRESO_FINANZAS', N'Transferencias', N'transferencias', 9),
    (N'TIPO_INGRESO_FINANZAS', N'Otros',          N'otros',         10),

    (N'CATEGORIA_EGRESO_FINANZAS', N'Combustible',           N'combustible',            1),
    (N'CATEGORIA_EGRESO_FINANZAS', N'Mantenimiento',         N'mantenimiento',          2),
    (N'CATEGORIA_EGRESO_FINANZAS', N'Reparaciones',          N'reparaciones',           3),
    (N'CATEGORIA_EGRESO_FINANZAS', N'Equipamiento',          N'equipamiento',           4),
    (N'CATEGORIA_EGRESO_FINANZAS', N'Servicios publicos',    N'servicios publicos',     5),
    (N'CATEGORIA_EGRESO_FINANZAS', N'Telefonia',             N'telefonia',              6),
    (N'CATEGORIA_EGRESO_FINANZAS', N'Internet',               N'internet',               7),
    (N'CATEGORIA_EGRESO_FINANZAS', N'Alimentacion',          N'alimentacion',           8),
    (N'CATEGORIA_EGRESO_FINANZAS', N'Limpieza',              N'limpieza',               9),
    (N'CATEGORIA_EGRESO_FINANZAS', N'Papeleria',             N'papeleria',             10),
    (N'CATEGORIA_EGRESO_FINANZAS', N'Capacitacion',          N'capacitacion',          11),
    (N'CATEGORIA_EGRESO_FINANZAS', N'Seguros',               N'seguros',               12),
    (N'CATEGORIA_EGRESO_FINANZAS', N'Gastos administrativos',N'gastos administrativos',13),
    (N'CATEGORIA_EGRESO_FINANZAS', N'Otros',                 N'otros',                 14),

    (N'TIPO_CUENTA_BANCARIA_FINANZAS', N'Cuenta corriente',  N'cuenta corriente',  1),
    (N'TIPO_CUENTA_BANCARIA_FINANZAS', N'Caja de ahorro',    N'caja de ahorro',    2),
    (N'TIPO_CUENTA_BANCARIA_FINANZAS', N'Otra',              N'otra',              3),

    (N'TIPO_DOCUMENTO_FINANZAS', N'Factura',            N'factura',            1),
    (N'TIPO_DOCUMENTO_FINANZAS', N'Recibo',              N'recibo',             2),
    (N'TIPO_DOCUMENTO_FINANZAS', N'Comprobante',        N'comprobante',        3),
    (N'TIPO_DOCUMENTO_FINANZAS', N'Nota de credito',    N'nota de credito',    4),
    (N'TIPO_DOCUMENTO_FINANZAS', N'Nota de debito',     N'nota de debito',     5),
    (N'TIPO_DOCUMENTO_FINANZAS', N'Otro',               N'otro',               6),

    (N'MOTIVO_ANULACION_FINANZAS', N'Error de carga',         N'error de carga',         1),
    (N'MOTIVO_ANULACION_FINANZAS', N'Importe incorrecto',     N'importe incorrecto',     2),
    (N'MOTIVO_ANULACION_FINANZAS', N'Movimiento duplicado',   N'movimiento duplicado',   3),
    (N'MOTIVO_ANULACION_FINANZAS', N'Operacion no realizada', N'operacion no realizada', 4),
    (N'MOTIVO_ANULACION_FINANZAS', N'Otro',                   N'otro',                   5)
) AS v(tipo, nombre, nombre_normalizado, orden)
WHERE NOT EXISTS (SELECT 1 FROM organizacion.parametros p WHERE p.tipo = v.tipo AND p.nombre_normalizado = v.nombre_normalizado AND p.padre_id IS NULL);
GO

/* --- finanzas.ejercicios_fiscales --- */

IF OBJECT_ID(N'finanzas.ejercicios_fiscales', N'U') IS NULL
BEGIN
    CREATE TABLE finanzas.ejercicios_fiscales (
        id             UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_ejf_id DEFAULT NEWSEQUENTIALID(),
        anio           INT           NOT NULL,
        fecha_inicio   DATE          NOT NULL,
        fecha_fin      DATE          NOT NULL,
        estado         NVARCHAR(20)  NOT NULL CONSTRAINT DF_ejf_estado DEFAULT N'ABIERTO',
        institucion_id UNIQUEIDENTIFIER NULL,
        creado_en      DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_ejf_creado DEFAULT SYSDATETIMEOFFSET(),
        creado_por     UNIQUEIDENTIFIER NULL,
        CONSTRAINT PK_ejercicios_fiscales PRIMARY KEY CLUSTERED (id),
        CONSTRAINT UQ_ejercicios_fiscales_anio UNIQUE (anio),
        CONSTRAINT CK_ejf_estado CHECK (estado IN (N'ABIERTO', N'CERRADO')),
        CONSTRAINT FK_ejf_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id)
    );
END
GO

/* --- finanzas.cajas --- */

IF OBJECT_ID(N'finanzas.cajas', N'U') IS NULL
BEGIN
    CREATE TABLE finanzas.cajas (
        id              UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_caja_id DEFAULT NEWSEQUENTIALID(),
        nombre          NVARCHAR(150) NOT NULL,
        responsable_id  UNIQUEIDENTIFIER NULL,
        estado          NVARCHAR(20)  NOT NULL CONSTRAINT DF_caja_estado DEFAULT N'ACTIVA',
        saldo_actual    DECIMAL(15,2) NOT NULL CONSTRAINT DF_caja_saldo DEFAULT 0,
        moneda          NVARCHAR(3)   NOT NULL CONSTRAINT DF_caja_moneda DEFAULT N'PYG',
        institucion_id  UNIQUEIDENTIFIER NULL,
        observacion     NVARCHAR(MAX) NULL,
        creado_en       DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_caja_creado DEFAULT SYSDATETIMEOFFSET(),
        actualizado_en  DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_caja_act DEFAULT SYSDATETIMEOFFSET(),
        creado_por      UNIQUEIDENTIFIER NULL,
        actualizado_por UNIQUEIDENTIFIER NULL,
        CONSTRAINT PK_cajas PRIMARY KEY CLUSTERED (id),
        CONSTRAINT CK_caja_estado CHECK (estado IN (N'ACTIVA', N'INACTIVA')),
        CONSTRAINT FK_caja_responsable FOREIGN KEY (responsable_id) REFERENCES personal.bomberos(id)
    );
END
GO

/* --- finanzas.turnos_caja (sesion de apertura/cierre -- seccion 5 del pedido) --- */

IF OBJECT_ID(N'finanzas.turnos_caja', N'U') IS NULL
BEGIN
    CREATE TABLE finanzas.turnos_caja (
        id                   UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_tcaja_id DEFAULT NEWSEQUENTIALID(),
        caja_id              UNIQUEIDENTIFIER NOT NULL,
        fecha_apertura       DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_tcaja_fapert DEFAULT SYSDATETIMEOFFSET(),
        usuario_apertura     UNIQUEIDENTIFIER NULL,
        saldo_inicial        DECIMAL(15,2) NOT NULL,
        fecha_cierre         DATETIMEOFFSET(3) NULL,
        usuario_cierre       UNIQUEIDENTIFIER NULL,
        saldo_teorico        DECIMAL(15,2) NULL,
        saldo_fisico         DECIMAL(15,2) NULL,
        diferencia           DECIMAL(15,2) NULL,
        observacion_cierre   NVARCHAR(MAX) NULL,
        estado               NVARCHAR(20)  NOT NULL CONSTRAINT DF_tcaja_estado DEFAULT N'ABIERTO',
        creado_en            DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_tcaja_creado DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT PK_turnos_caja PRIMARY KEY CLUSTERED (id),
        CONSTRAINT FK_tcaja_caja FOREIGN KEY (caja_id) REFERENCES finanzas.cajas(id),
        CONSTRAINT FK_tcaja_usrapertura FOREIGN KEY (usuario_apertura) REFERENCES seguridad.usuarios(id),
        CONSTRAINT FK_tcaja_usrcierre FOREIGN KEY (usuario_cierre) REFERENCES seguridad.usuarios(id),
        CONSTRAINT CK_tcaja_estado CHECK (estado IN (N'ABIERTO', N'CERRADO'))
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_tcaja_caja_estado' AND object_id = OBJECT_ID('finanzas.turnos_caja'))
    CREATE INDEX IX_tcaja_caja_estado ON finanzas.turnos_caja(caja_id, estado);
GO

/* Un solo turno ABIERTO por caja a la vez -- indice filtrado, no CHECK
   (SQL Server no permite subquery en CHECK). */
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UQ_tcaja_una_abierta_por_caja' AND object_id = OBJECT_ID('finanzas.turnos_caja'))
    CREATE UNIQUE INDEX UQ_tcaja_una_abierta_por_caja ON finanzas.turnos_caja(caja_id) WHERE estado = N'ABIERTO';
GO

/* --- finanzas.cuentas_bancarias --- */

IF OBJECT_ID(N'finanzas.cuentas_bancarias', N'U') IS NULL
BEGIN
    CREATE TABLE finanzas.cuentas_bancarias (
        id                 UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_ctab_id DEFAULT NEWSEQUENTIALID(),
        banco              NVARCHAR(150) NOT NULL,
        numero_cuenta      NVARCHAR(50)  NOT NULL,
        tipo_cuenta_id     UNIQUEIDENTIFIER NULL,
        moneda             NVARCHAR(3)   NOT NULL CONSTRAINT DF_ctab_moneda DEFAULT N'PYG',
        responsable_id     UNIQUEIDENTIFIER NULL,
        estado             NVARCHAR(20)  NOT NULL CONSTRAINT DF_ctab_estado DEFAULT N'ACTIVA',
        saldo_actual       DECIMAL(15,2) NOT NULL CONSTRAINT DF_ctab_saldo DEFAULT 0,
        institucion_id     UNIQUEIDENTIFIER NULL,
        observacion        NVARCHAR(MAX) NULL,
        creado_en          DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_ctab_creado DEFAULT SYSDATETIMEOFFSET(),
        actualizado_en     DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_ctab_act DEFAULT SYSDATETIMEOFFSET(),
        creado_por         UNIQUEIDENTIFIER NULL,
        actualizado_por    UNIQUEIDENTIFIER NULL,
        CONSTRAINT PK_cuentas_bancarias PRIMARY KEY CLUSTERED (id),
        CONSTRAINT UQ_cuentas_bancarias UNIQUE (banco, numero_cuenta),
        CONSTRAINT CK_ctab_estado CHECK (estado IN (N'ACTIVA', N'INACTIVA')),
        CONSTRAINT FK_ctab_tipocuenta FOREIGN KEY (tipo_cuenta_id) REFERENCES organizacion.parametros(id),
        CONSTRAINT FK_ctab_responsable FOREIGN KEY (responsable_id) REFERENCES personal.bomberos(id)
    );
END
GO

/* --- Permisos base (los 5 ya existian -- ver seed-data.ts; se agregan
   los que faltan directo por SQL, mismo patron que 041/046). --- */

INSERT INTO seguridad.permisos (nombre, recurso, accion, categoria)
SELECT v.nombre, v.recurso, v.accion, v.categoria FROM (VALUES
    (N'finanzas:anular',                N'finanzas', N'anular',                N'Finanzas'),
    (N'finanzas:autorizar',             N'finanzas', N'autorizar',             N'Finanzas'),
    (N'finanzas:cerrar_caja',           N'finanzas', N'cerrar_caja',           N'Finanzas'),
    (N'finanzas:administrar_cajas',     N'finanzas', N'administrar_cajas',     N'Finanzas'),
    (N'finanzas:administrar_presupuesto', N'finanzas', N'administrar_presupuesto', N'Finanzas'),
    (N'finanzas:conciliar',             N'finanzas', N'conciliar',             N'Finanzas'),
    (N'finanzas:reportes',              N'finanzas', N'reportes',              N'Finanzas')
) AS v(nombre, recurso, accion, categoria)
WHERE NOT EXISTS (SELECT 1 FROM seguridad.permisos p WHERE p.nombre = v.nombre);
GO

/* TESORERO: rol operativo -- ya tenia ver/crear/editar/eliminar/balance.
   Se agrega todo lo operativo salvo 'autorizar' (separacion de
   funciones: quien registra/paga no es quien autoriza -- ver informe
   final). */
INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id
FROM seguridad.roles r
CROSS JOIN seguridad.permisos p
WHERE r.nombre = N'Tesorero'
  AND p.nombre IN (N'finanzas:anular', N'finanzas:cerrar_caja', N'finanzas:administrar_cajas', N'finanzas:administrar_presupuesto', N'finanzas:conciliar', N'finanzas:reportes')
  AND NOT EXISTS (
      SELECT 1 FROM seguridad.asignacion_permisos_rol apr
      WHERE apr.rol_id = r.id AND apr.permiso_id = p.id
  );
GO

/* COMANDANTE: ya tenia finanzas:ver (oversight). Se agrega la
   autorizacion de gastos y el acceso a reportes -- es quien aprueba,
   no quien opera la caja dia a dia. */
INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id
FROM seguridad.roles r
CROSS JOIN seguridad.permisos p
WHERE r.nombre = N'Comandante'
  AND p.nombre IN (N'finanzas:autorizar', N'finanzas:reportes')
  AND NOT EXISTS (
      SELECT 1 FROM seguridad.asignacion_permisos_rol apr
      WHERE apr.rol_id = r.id AND apr.permiso_id = p.id
  );
GO
