/* =============================================================
   SIGBO-CBVC | Migracion 044 - Deposito: prestamos
   =============================================================
   Etapa 5. Prestamo amplio de Deposito (personal, otra institucion,
   servicio, capacitacion, mantenimiento, otro), distinto de
   equipos.prestamos_equipos (que sigue funcionando tal cual, sin
   tocar, para no romper las 2 pantallas que ya lo usan).
   ============================================================= */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

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
        N'TIPO_MOVIMIENTO_DEPOSITO', N'UNIDAD_MEDIDA_DEPOSITO', N'MOTIVO_BAJA_DEPOSITO', N'TIPO_PRESTAMO_DEPOSITO'
    ));
GO

INSERT INTO organizacion.parametros (tipo, nombre, nombre_normalizado, orden)
SELECT v.tipo, v.nombre, v.nombre_normalizado, v.orden FROM (VALUES
    (N'TIPO_PRESTAMO_DEPOSITO', N'A personal',           N'a personal',           1),
    (N'TIPO_PRESTAMO_DEPOSITO', N'A otra institucion',   N'a otra institucion',   2),
    (N'TIPO_PRESTAMO_DEPOSITO', N'Para un servicio',     N'para un servicio',     3),
    (N'TIPO_PRESTAMO_DEPOSITO', N'Para una capacitacion',N'para una capacitacion',4),
    (N'TIPO_PRESTAMO_DEPOSITO', N'Para mantenimiento',   N'para mantenimiento',   5),
    (N'TIPO_PRESTAMO_DEPOSITO', N'Otro',                 N'otro',                 6)
) AS v(tipo, nombre, nombre_normalizado, orden)
WHERE NOT EXISTS (SELECT 1 FROM organizacion.parametros p WHERE p.tipo = v.tipo AND p.nombre_normalizado = v.nombre_normalizado AND p.padre_id IS NULL);
GO

IF OBJECT_ID(N'deposito.prestamos', N'U') IS NULL
BEGIN
    CREATE TABLE deposito.prestamos (
        id                          UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_pre_id DEFAULT NEWSEQUENTIALID(),
        tipo_prestamo_id            UNIQUEIDENTIFIER NOT NULL,
        solicitante_bombero_id      UNIQUEIDENTIFIER NULL,
        solicitante_externo         NVARCHAR(300) NULL,
        servicio_destino_id         UNIQUEIDENTIFIER NULL,
        autorizado_por              UNIQUEIDENTIFIER NULL,
        fecha_entrega               DATETIMEOFFSET(3) NOT NULL,
        fecha_devolucion_comprometida DATETIMEOFFSET(3) NULL,
        fecha_devolucion_real       DATETIMEOFFSET(3) NULL,
        estado                      NVARCHAR(20)  NOT NULL CONSTRAINT DF_pre_estado DEFAULT N'ACTIVO',
        observaciones               NVARCHAR(MAX) NULL,
        institucion_id              UNIQUEIDENTIFIER NULL,
        creado_en                   DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_pre_creado DEFAULT SYSDATETIMEOFFSET(),
        creado_por                  UNIQUEIDENTIFIER NULL,
        CONSTRAINT PK_prestamos_dep PRIMARY KEY CLUSTERED (id),
        CONSTRAINT FK_pre_tipo FOREIGN KEY (tipo_prestamo_id) REFERENCES organizacion.parametros(id),
        CONSTRAINT FK_pre_solicitante FOREIGN KEY (solicitante_bombero_id) REFERENCES personal.bomberos(id),
        CONSTRAINT FK_pre_servicio FOREIGN KEY (servicio_destino_id) REFERENCES servicios.servicios(id),
        CONSTRAINT FK_pre_autoriza FOREIGN KEY (autorizado_por) REFERENCES personal.bomberos(id),
        CONSTRAINT CK_pre_estado CHECK (estado IN (N'ACTIVO', N'DEVUELTO_PARCIAL', N'DEVUELTO', N'EXTRAVIADO'))
    );
END
GO

IF OBJECT_ID(N'deposito.prestamo_items', N'U') IS NULL
BEGIN
    CREATE TABLE deposito.prestamo_items (
        id                     UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_prei_id DEFAULT NEWSEQUENTIALID(),
        prestamo_id            UNIQUEIDENTIFIER NOT NULL,
        tipo_elemento          NVARCHAR(10)  NOT NULL,
        articulo_id            UNIQUEIDENTIFIER NULL,
        equipo_id              UNIQUEIDENTIFIER NULL,
        cantidad               DECIMAL(15,2) NULL,
        estado_item            NVARCHAR(20)  NOT NULL CONSTRAINT DF_prei_estado DEFAULT N'PENDIENTE',
        observacion            NVARCHAR(MAX) NULL,
        movimiento_entrega_id  UNIQUEIDENTIFIER NULL,
        movimiento_devolucion_id UNIQUEIDENTIFIER NULL,
        CONSTRAINT PK_prestamo_items PRIMARY KEY CLUSTERED (id),
        CONSTRAINT FK_prei_prestamo FOREIGN KEY (prestamo_id) REFERENCES deposito.prestamos(id) ON DELETE CASCADE,
        CONSTRAINT FK_prei_articulo FOREIGN KEY (articulo_id) REFERENCES deposito.articulos(id),
        CONSTRAINT FK_prei_equipo FOREIGN KEY (equipo_id) REFERENCES equipos.equipos(id),
        CONSTRAINT FK_prei_moventrega FOREIGN KEY (movimiento_entrega_id) REFERENCES deposito.movimientos(id),
        CONSTRAINT FK_prei_movdevolucion FOREIGN KEY (movimiento_devolucion_id) REFERENCES deposito.movimientos(id),
        CONSTRAINT CK_prei_tipoelemento CHECK (tipo_elemento IN (N'EQUIPO', N'ARTICULO')),
        CONSTRAINT CK_prei_estaditem CHECK (estado_item IN (N'PENDIENTE', N'DEVUELTO', N'EXTRAVIADO', N'DANIADO'))
    );
END
GO
