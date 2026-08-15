/* =============================================================
   SIGBO-CBVC | Migracion 041 - Modulo Deposito, estructura base
   =============================================================
   Etapa 1: schema deposito, catalogos parametrizables nuevos,
   categorias/articulos/lotes/ubicaciones/tenencias/movimientos.

   Reutiliza sin duplicar: equipos.equipos (ficha de elementos con
   trazabilidad individual -- ERA, radios, generadores, herramientas),
   organizacion.cuarteles (ancla de la jerarquia de ubicaciones),
   personal.bomberos, vehiculos.vehiculos, servicios.servicios,
   organizacion.parametros (catalogos), seguridad.usuarios (auditoria).

   Deposito NO crea una segunda tabla de items individuales: un
   elemento individualmente trazable sigue siendo un
   equipos.equipos.id; Deposito solo agrega su ubicacion/tenencia/
   historial de movimientos sobre ese mismo id.
   ============================================================= */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'deposito')
    EXEC('CREATE SCHEMA deposito');
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
        N'TIPO_MOVIMIENTO_DEPOSITO', N'UNIDAD_MEDIDA_DEPOSITO'
    ));
GO

INSERT INTO organizacion.parametros (tipo, nombre, nombre_normalizado, orden)
SELECT v.tipo, v.nombre, v.nombre_normalizado, v.orden FROM (VALUES
    (N'TIPO_UBICACION_DEPOSITO', N'Cuartel',            N'cuartel',            1),
    (N'TIPO_UBICACION_DEPOSITO', N'Deposito',           N'deposito',           2),
    (N'TIPO_UBICACION_DEPOSITO', N'Sector',             N'sector',             3),
    (N'TIPO_UBICACION_DEPOSITO', N'Estanteria',         N'estanteria',         4),
    (N'TIPO_UBICACION_DEPOSITO', N'Ubicacion',          N'ubicacion',          5),
    (N'TIPO_UBICACION_DEPOSITO', N'Otro',               N'otro',               6),

    (N'TIPO_TENENCIA_DEPOSITO', N'En deposito',         N'en deposito',        1),
    (N'TIPO_TENENCIA_DEPOSITO', N'En vehiculo',         N'en vehiculo',        2),
    (N'TIPO_TENENCIA_DEPOSITO', N'Con personal',        N'con personal',       3),
    (N'TIPO_TENENCIA_DEPOSITO', N'En servicio',         N'en servicio',        4),
    (N'TIPO_TENENCIA_DEPOSITO', N'En taller',           N'en taller',          5),
    (N'TIPO_TENENCIA_DEPOSITO', N'Prestado',            N'prestado',           6),
    (N'TIPO_TENENCIA_DEPOSITO', N'Otra institucion',    N'otra institucion',   7),

    (N'ESTADO_ELEMENTO_DEPOSITO', N'Disponible',        N'disponible',         1),
    (N'ESTADO_ELEMENTO_DEPOSITO', N'Asignado',          N'asignado',           2),
    (N'ESTADO_ELEMENTO_DEPOSITO', N'Prestado',          N'prestado',           3),
    (N'ESTADO_ELEMENTO_DEPOSITO', N'En mantenimiento',  N'en mantenimiento',   4),
    (N'ESTADO_ELEMENTO_DEPOSITO', N'Danado',            N'danado',             5),
    (N'ESTADO_ELEMENTO_DEPOSITO', N'Fuera de servicio', N'fuera de servicio',  6),
    (N'ESTADO_ELEMENTO_DEPOSITO', N'Perdido',           N'perdido',            7),
    (N'ESTADO_ELEMENTO_DEPOSITO', N'Baja',              N'baja',               8),

    (N'TIPO_MOVIMIENTO_DEPOSITO', N'Entrada',           N'entrada',            1),
    (N'TIPO_MOVIMIENTO_DEPOSITO', N'Salida',            N'salida',             2),
    (N'TIPO_MOVIMIENTO_DEPOSITO', N'Prestamo',          N'prestamo',           3),
    (N'TIPO_MOVIMIENTO_DEPOSITO', N'Devolucion',        N'devolucion',         4),
    (N'TIPO_MOVIMIENTO_DEPOSITO', N'Asignacion',        N'asignacion',         5),
    (N'TIPO_MOVIMIENTO_DEPOSITO', N'Transferencia',     N'transferencia',      6),
    (N'TIPO_MOVIMIENTO_DEPOSITO', N'Consumo',           N'consumo',            7),
    (N'TIPO_MOVIMIENTO_DEPOSITO', N'Mantenimiento',     N'mantenimiento',      8),
    (N'TIPO_MOVIMIENTO_DEPOSITO', N'Baja',              N'baja',               9),
    (N'TIPO_MOVIMIENTO_DEPOSITO', N'Recuperacion',      N'recuperacion',      10),
    (N'TIPO_MOVIMIENTO_DEPOSITO', N'Donacion',          N'donacion',          11),
    (N'TIPO_MOVIMIENTO_DEPOSITO', N'Compra',            N'compra',            12),
    (N'TIPO_MOVIMIENTO_DEPOSITO', N'Ajuste de inventario', N'ajuste de inventario', 13),
    (N'TIPO_MOVIMIENTO_DEPOSITO', N'Otro',              N'otro',              14),

    (N'UNIDAD_MEDIDA_DEPOSITO', N'Unidad',              N'unidad',             1),
    (N'UNIDAD_MEDIDA_DEPOSITO', N'Caja',                N'caja',               2),
    (N'UNIDAD_MEDIDA_DEPOSITO', N'Paquete',             N'paquete',            3),
    (N'UNIDAD_MEDIDA_DEPOSITO', N'Litro',               N'litro',              4),
    (N'UNIDAD_MEDIDA_DEPOSITO', N'Kilogramo',           N'kilogramo',          5),
    (N'UNIDAD_MEDIDA_DEPOSITO', N'Metro',               N'metro',              6),
    (N'UNIDAD_MEDIDA_DEPOSITO', N'Par',                 N'par',                7),
    (N'UNIDAD_MEDIDA_DEPOSITO', N'Otro',                N'otro',               8)
) AS v(tipo, nombre, nombre_normalizado, orden)
WHERE NOT EXISTS (SELECT 1 FROM organizacion.parametros p WHERE p.tipo = v.tipo AND p.nombre_normalizado = v.nombre_normalizado AND p.padre_id IS NULL);
GO

/* --- deposito.categorias_articulo --- */

IF OBJECT_ID(N'deposito.categorias_articulo', N'U') IS NULL
BEGIN
    CREATE TABLE deposito.categorias_articulo (
        id             UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_catart_id DEFAULT NEWSEQUENTIALID(),
        codigo         NVARCHAR(30)  NULL,
        nombre         NVARCHAR(150) NOT NULL,
        descripcion    NVARCHAR(MAX) NULL,
        padre_id       UNIQUEIDENTIFIER NULL,
        activo         BIT           NOT NULL CONSTRAINT DF_catart_activo DEFAULT 1,
        creado_en      DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_catart_creado DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT PK_categorias_articulo PRIMARY KEY CLUSTERED (id),
        CONSTRAINT FK_catart_padre FOREIGN KEY (padre_id) REFERENCES deposito.categorias_articulo(id)
    );
END
GO

/* --- deposito.articulos (inventario por cantidad) --- */

IF OBJECT_ID(N'deposito.articulos', N'U') IS NULL
BEGIN
    CREATE TABLE deposito.articulos (
        id                    UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_art_id DEFAULT NEWSEQUENTIALID(),
        codigo                NVARCHAR(50)  NOT NULL,
        nombre                NVARCHAR(200) NOT NULL,
        descripcion           NVARCHAR(MAX) NULL,
        categoria_articulo_id UNIQUEIDENTIFIER NOT NULL,
        unidad_medida_id      UNIQUEIDENTIFIER NULL,
        stock_actual          DECIMAL(15,2) NOT NULL CONSTRAINT DF_art_stockact DEFAULT 0,
        stock_minimo          DECIMAL(15,2) NOT NULL CONSTRAINT DF_art_stockmin DEFAULT 0,
        stock_maximo          DECIMAL(15,2) NULL,
        controla_lote         BIT           NOT NULL CONSTRAINT DF_art_lote DEFAULT 0,
        controla_vencimiento  BIT           NOT NULL CONSTRAINT DF_art_venc DEFAULT 0,
        estado                NVARCHAR(20)  NOT NULL CONSTRAINT DF_art_estado DEFAULT N'ACTIVO',
        institucion_id        UNIQUEIDENTIFIER NULL,
        creado_en             DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_art_creado DEFAULT SYSDATETIMEOFFSET(),
        actualizado_en        DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_art_act DEFAULT SYSDATETIMEOFFSET(),
        creado_por            UNIQUEIDENTIFIER NULL,
        actualizado_por       UNIQUEIDENTIFIER NULL,
        CONSTRAINT PK_articulos PRIMARY KEY CLUSTERED (id),
        CONSTRAINT UQ_articulos_codigo UNIQUE (codigo),
        CONSTRAINT FK_art_categoria FOREIGN KEY (categoria_articulo_id) REFERENCES deposito.categorias_articulo(id),
        CONSTRAINT FK_art_unidadmedida FOREIGN KEY (unidad_medida_id) REFERENCES organizacion.parametros(id),
        CONSTRAINT CK_art_estado CHECK (estado IN (N'ACTIVO', N'INACTIVO'))
    );
END
GO

/* --- deposito.lotes_articulo --- */

IF OBJECT_ID(N'deposito.lotes_articulo', N'U') IS NULL
BEGIN
    CREATE TABLE deposito.lotes_articulo (
        id                 UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_lote_id DEFAULT NEWSEQUENTIALID(),
        articulo_id        UNIQUEIDENTIFIER NOT NULL,
        numero_lote        NVARCHAR(50)  NOT NULL,
        fecha_fabricacion  DATE          NULL,
        fecha_vencimiento  DATE          NULL,
        cantidad           DECIMAL(15,2) NOT NULL CONSTRAINT DF_lote_cant DEFAULT 0,
        estado             NVARCHAR(20)  NOT NULL CONSTRAINT DF_lote_estado DEFAULT N'VIGENTE',
        creado_en          DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_lote_creado DEFAULT SYSDATETIMEOFFSET(),
        actualizado_en     DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_lote_act DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT PK_lotes_articulo PRIMARY KEY CLUSTERED (id),
        CONSTRAINT UQ_lotes_articulo UNIQUE (articulo_id, numero_lote),
        CONSTRAINT FK_lote_articulo FOREIGN KEY (articulo_id) REFERENCES deposito.articulos(id) ON DELETE CASCADE,
        CONSTRAINT CK_lote_estado CHECK (estado IN (N'VIGENTE', N'VENCIDO', N'AGOTADO'))
    );
END
GO

/* --- deposito.ubicaciones (jerarquia fisica) --- */

IF OBJECT_ID(N'deposito.ubicaciones', N'U') IS NULL
BEGIN
    CREATE TABLE deposito.ubicaciones (
        id               UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_ubi_id DEFAULT NEWSEQUENTIALID(),
        codigo           NVARCHAR(50)  NULL,
        nombre           NVARCHAR(150) NOT NULL,
        tipo_ubicacion_id UNIQUEIDENTIFIER NOT NULL,
        padre_id         UNIQUEIDENTIFIER NULL,
        cuartel_id       UNIQUEIDENTIFIER NULL,
        estado           NVARCHAR(20)  NOT NULL CONSTRAINT DF_ubi_estado DEFAULT N'ACTIVA',
        institucion_id   UNIQUEIDENTIFIER NULL,
        creado_en        DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_ubi_creado DEFAULT SYSDATETIMEOFFSET(),
        actualizado_en   DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_ubi_act DEFAULT SYSDATETIMEOFFSET(),
        creado_por       UNIQUEIDENTIFIER NULL,
        actualizado_por  UNIQUEIDENTIFIER NULL,
        CONSTRAINT PK_ubicaciones PRIMARY KEY CLUSTERED (id),
        CONSTRAINT FK_ubi_tipo FOREIGN KEY (tipo_ubicacion_id) REFERENCES organizacion.parametros(id),
        CONSTRAINT FK_ubi_padre FOREIGN KEY (padre_id) REFERENCES deposito.ubicaciones(id),
        CONSTRAINT FK_ubi_cuartel FOREIGN KEY (cuartel_id) REFERENCES organizacion.cuarteles(id),
        CONSTRAINT CK_ubi_estado CHECK (estado IN (N'ACTIVA', N'INACTIVA'))
    );
END
GO

/* --- deposito.tenencias (donde/con quien esta CADA ELEMENTO ahora mismo) --- */

IF OBJECT_ID(N'deposito.tenencias', N'U') IS NULL
BEGIN
    CREATE TABLE deposito.tenencias (
        id                 UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_ten_id DEFAULT NEWSEQUENTIALID(),
        tipo_elemento      NVARCHAR(10)  NOT NULL,
        equipo_id          UNIQUEIDENTIFIER NULL,
        articulo_id        UNIQUEIDENTIFIER NULL,
        lote_id            UNIQUEIDENTIFIER NULL,
        cantidad           DECIMAL(15,2) NULL,
        tipo_tenencia_id   UNIQUEIDENTIFIER NOT NULL,
        ubicacion_id       UNIQUEIDENTIFIER NULL,
        vehiculo_id        UNIQUEIDENTIFIER NULL,
        bombero_id         UNIQUEIDENTIFIER NULL,
        servicio_id        UNIQUEIDENTIFIER NULL,
        estado_elemento_id UNIQUEIDENTIFIER NOT NULL,
        observacion        NVARCHAR(MAX) NULL,
        institucion_id     UNIQUEIDENTIFIER NULL,
        actualizado_en     DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_ten_act DEFAULT SYSDATETIMEOFFSET(),
        actualizado_por    UNIQUEIDENTIFIER NULL,
        CONSTRAINT PK_tenencias PRIMARY KEY CLUSTERED (id),
        CONSTRAINT FK_ten_equipo FOREIGN KEY (equipo_id) REFERENCES equipos.equipos(id) ON DELETE CASCADE,
        CONSTRAINT FK_ten_articulo FOREIGN KEY (articulo_id) REFERENCES deposito.articulos(id) ON DELETE CASCADE,
        CONSTRAINT FK_ten_lote FOREIGN KEY (lote_id) REFERENCES deposito.lotes_articulo(id),
        CONSTRAINT FK_ten_tipotenencia FOREIGN KEY (tipo_tenencia_id) REFERENCES organizacion.parametros(id),
        CONSTRAINT FK_ten_ubicacion FOREIGN KEY (ubicacion_id) REFERENCES deposito.ubicaciones(id),
        CONSTRAINT FK_ten_vehiculo FOREIGN KEY (vehiculo_id) REFERENCES vehiculos.vehiculos(id),
        CONSTRAINT FK_ten_bombero FOREIGN KEY (bombero_id) REFERENCES personal.bomberos(id),
        CONSTRAINT FK_ten_servicio FOREIGN KEY (servicio_id) REFERENCES servicios.servicios(id),
        CONSTRAINT FK_ten_estadoelemento FOREIGN KEY (estado_elemento_id) REFERENCES organizacion.parametros(id),
        CONSTRAINT CK_ten_tipoelemento CHECK (tipo_elemento IN (N'EQUIPO', N'ARTICULO')),
        CONSTRAINT CK_ten_elemento CHECK (
            (tipo_elemento = N'EQUIPO' AND equipo_id IS NOT NULL AND articulo_id IS NULL) OR
            (tipo_elemento = N'ARTICULO' AND articulo_id IS NOT NULL AND equipo_id IS NULL)
        )
    );
END
GO

/* --- deposito.movimientos (historial append-only, nunca se edita) --- */

IF OBJECT_ID(N'deposito.movimientos', N'U') IS NULL
BEGIN
    CREATE TABLE deposito.movimientos (
        id                    UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_movd_id DEFAULT NEWSEQUENTIALID(),
        tipo_movimiento_id    UNIQUEIDENTIFIER NOT NULL,
        tipo_elemento         NVARCHAR(10)  NOT NULL,
        equipo_id             UNIQUEIDENTIFIER NULL,
        articulo_id           UNIQUEIDENTIFIER NULL,
        lote_id               UNIQUEIDENTIFIER NULL,
        cantidad              DECIMAL(15,2) NULL,
        ubicacion_origen_id   UNIQUEIDENTIFIER NULL,
        ubicacion_destino_id  UNIQUEIDENTIFIER NULL,
        vehiculo_origen_id    UNIQUEIDENTIFIER NULL,
        vehiculo_destino_id   UNIQUEIDENTIFIER NULL,
        bombero_origen_id     UNIQUEIDENTIFIER NULL,
        bombero_destino_id    UNIQUEIDENTIFIER NULL,
        servicio_origen_id    UNIQUEIDENTIFIER NULL,
        servicio_destino_id   UNIQUEIDENTIFIER NULL,
        responsable_id        UNIQUEIDENTIFIER NULL,
        motivo                NVARCHAR(300) NULL,
        observacion           NVARCHAR(MAX) NULL,
        documento_url         NVARCHAR(MAX) NULL,
        institucion_id        UNIQUEIDENTIFIER NULL,
        creado_en             DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_movd_creado DEFAULT SYSDATETIMEOFFSET(),
        creado_por            UNIQUEIDENTIFIER NULL,
        CONSTRAINT PK_movimientos_dep PRIMARY KEY CLUSTERED (id),
        CONSTRAINT FK_movd_tipo FOREIGN KEY (tipo_movimiento_id) REFERENCES organizacion.parametros(id),
        CONSTRAINT FK_movd_equipo FOREIGN KEY (equipo_id) REFERENCES equipos.equipos(id),
        CONSTRAINT FK_movd_articulo FOREIGN KEY (articulo_id) REFERENCES deposito.articulos(id),
        CONSTRAINT FK_movd_lote FOREIGN KEY (lote_id) REFERENCES deposito.lotes_articulo(id),
        CONSTRAINT FK_movd_ubiorigen FOREIGN KEY (ubicacion_origen_id) REFERENCES deposito.ubicaciones(id),
        CONSTRAINT FK_movd_ubidestino FOREIGN KEY (ubicacion_destino_id) REFERENCES deposito.ubicaciones(id),
        CONSTRAINT FK_movd_vehorigen FOREIGN KEY (vehiculo_origen_id) REFERENCES vehiculos.vehiculos(id),
        CONSTRAINT FK_movd_vehdestino FOREIGN KEY (vehiculo_destino_id) REFERENCES vehiculos.vehiculos(id),
        CONSTRAINT FK_movd_bomorigen FOREIGN KEY (bombero_origen_id) REFERENCES personal.bomberos(id),
        CONSTRAINT FK_movd_bomdestino FOREIGN KEY (bombero_destino_id) REFERENCES personal.bomberos(id),
        CONSTRAINT FK_movd_servorigen FOREIGN KEY (servicio_origen_id) REFERENCES servicios.servicios(id),
        CONSTRAINT FK_movd_servdestino FOREIGN KEY (servicio_destino_id) REFERENCES servicios.servicios(id),
        CONSTRAINT FK_movd_responsable FOREIGN KEY (responsable_id) REFERENCES personal.bomberos(id),
        CONSTRAINT FK_movd_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id),
        CONSTRAINT CK_movd_tipoelemento CHECK (tipo_elemento IN (N'EQUIPO', N'ARTICULO'))
    );
END
GO

/* --- Indices --- */

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_tenencias_equipo' AND object_id = OBJECT_ID('deposito.tenencias'))
    CREATE INDEX IX_tenencias_equipo ON deposito.tenencias(equipo_id);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_tenencias_articulo' AND object_id = OBJECT_ID('deposito.tenencias'))
    CREATE INDEX IX_tenencias_articulo ON deposito.tenencias(articulo_id);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_movd_equipo' AND object_id = OBJECT_ID('deposito.movimientos'))
    CREATE INDEX IX_movd_equipo ON deposito.movimientos(equipo_id);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_movd_articulo' AND object_id = OBJECT_ID('deposito.movimientos'))
    CREATE INDEX IX_movd_articulo ON deposito.movimientos(articulo_id);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_movd_fecha' AND object_id = OBJECT_ID('deposito.movimientos'))
    CREATE INDEX IX_movd_fecha ON deposito.movimientos(creado_en);
GO

/* --- Permisos: deposito:ver/crear/editar/movimiento ya estaban sembrados
   (seed-data.ts) pero sin controller que los use -- se activan aqui.
   Se agregan los que faltan para cubrir el resto del modulo. --- */

INSERT INTO seguridad.permisos (nombre, recurso, accion, categoria)
SELECT v.nombre, v.recurso, v.accion, v.categoria FROM (VALUES
    (N'deposito:eliminar',    N'deposito', N'eliminar',    N'Deposito'),
    (N'deposito:prestar',     N'deposito', N'prestar',     N'Deposito'),
    (N'deposito:baja',        N'deposito', N'baja',        N'Deposito'),
    (N'deposito:inventario_fisico', N'deposito', N'inventario_fisico', N'Deposito'),
    (N'deposito:configurar',  N'deposito', N'configurar',  N'Deposito')
) AS v(nombre, recurso, accion, categoria)
WHERE NOT EXISTS (SELECT 1 FROM seguridad.permisos p WHERE p.nombre = v.nombre);
GO

/* Asigna los permisos nuevos al rol DEPOSITO (Encargado de Deposito),
   que ya tenia los 4 originales (ver/crear/editar/movimiento). */
INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id
FROM seguridad.roles r
CROSS JOIN seguridad.permisos p
WHERE r.nombre = N'Encargado de Deposito'
  AND p.nombre IN (N'deposito:eliminar', N'deposito:prestar', N'deposito:baja', N'deposito:inventario_fisico', N'deposito:configurar')
  AND NOT EXISTS (
      SELECT 1 FROM seguridad.asignacion_permisos_rol apr
      WHERE apr.rol_id = r.id AND apr.permiso_id = p.id
  );
GO
