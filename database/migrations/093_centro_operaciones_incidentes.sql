/* =============================================================
   SIGBO-CBVC | Migracion 093 - Centro de Operaciones e Incidentes (corte 1)
   =============================================================
   Spec: docs/superpowers/specs/2026-10-06-centro-operaciones-incidentes-design.md
   - El incidente es el servicio: fase operativa (10 fases), resultado y fase_desde.
     El estado heredado se deriva de la fase en el codigo (incidente.logica.ts).
   - Despachos: hora_despacho; hora_salida admite NULL (movil asignado que aun no salio).
   - Bitacora unica e inmutable del incidente (incidente_eventos), con disparador.
   - Catalogos configurables: condiciones de situacion/riesgo y tipos de recurso.
   - Pedidos de recurso con ciclo SCI y tripulacion vigente por movil.
   - personal_servicio y adjuntos ampliados; parametro FUNCION_INCIDENTE.
   - Permisos servicios:operar, servicios:comandar, vehiculos:tripulacion. */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

/* --- 1) Servicio: fase operativa y resultado --- */
IF COL_LENGTH('servicios.servicios', 'fase_operativa') IS NULL
    ALTER TABLE servicios.servicios ADD fase_operativa NVARCHAR(20) NOT NULL
        CONSTRAINT DF_ser_fase DEFAULT 'RECIBIDO';
GO
IF COL_LENGTH('servicios.servicios', 'fase_desde') IS NULL
    ALTER TABLE servicios.servicios ADD fase_desde DATETIMEOFFSET(3) NULL;
GO
IF COL_LENGTH('servicios.servicios', 'resultado') IS NULL
    ALTER TABLE servicios.servicios ADD resultado NVARCHAR(20) NULL;
GO
/* Relleno de los servicios existentes. Un servicio REGISTRADO que tiene comunicacion es la
   documentacion de algo que ya paso (el formulario largo se carga despues): queda CERRADO para no
   aparecer como incidente vivo en el Centro de Operaciones. Uno REGISTRADO sin comunicacion vino de
   otro flujo y queda RECIBIDO. El estado heredado se mantiene coherente con la fase cerrada. */
UPDATE s
SET fase_operativa = CASE s.estado
        WHEN 'DESPACHADO' THEN 'DESPACHADO'
        WHEN 'EN_CURSO' THEN 'OPERANDO'
        WHEN 'FINALIZADO' THEN 'CERRADO'
        WHEN 'CANCELADO' THEN 'CERRADO'
        ELSE CASE WHEN EXISTS (SELECT 1 FROM servicios.comunicaciones_servicio c WHERE c.servicio_id = s.id)
                  THEN 'CERRADO' ELSE 'RECIBIDO' END END,
    resultado = CASE WHEN s.estado = 'CANCELADO' THEN 'CANCELADO' ELSE s.resultado END,
    estado = CASE WHEN s.estado = 'REGISTRADO' AND EXISTS (SELECT 1 FROM servicios.comunicaciones_servicio c WHERE c.servicio_id = s.id) THEN 'FINALIZADO' ELSE s.estado END,
    fase_desde = s.actualizado_en
FROM servicios.servicios s
WHERE s.fase_desde IS NULL;
GO
IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_ser_fase')
    ALTER TABLE servicios.servicios ADD CONSTRAINT CK_ser_fase CHECK (fase_operativa IN (
        'RECIBIDO', 'EVALUACION', 'DESPACHADO', 'EN_CAMINO', 'EN_LUGAR',
        'OPERANDO', 'CONTROLADO', 'RETORNO', 'DISPONIBLE', 'CERRADO'));
GO
IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_ser_resultado')
    ALTER TABLE servicios.servicios ADD CONSTRAINT CK_ser_resultado CHECK (resultado IS NULL OR resultado IN (
        'CONTROLADO', 'RESUELTO', 'FALSA_ALARMA', 'CANCELADO', 'DERIVADO',
        'NO_ATENDIDO', 'SIN_ACCESO', 'SIN_INTERVENCION'));
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ser_fase' AND object_id = OBJECT_ID('servicios.servicios'))
    CREATE INDEX IX_ser_fase ON servicios.servicios (fase_operativa, fase_desde);
GO

/* --- 2) Despachos: asignar sin salir --- */
IF COL_LENGTH('servicios.despachos', 'hora_despacho') IS NULL
    ALTER TABLE servicios.despachos ADD hora_despacho DATETIMEOFFSET(3) NULL;
GO
UPDATE servicios.despachos SET hora_despacho = hora_salida WHERE hora_despacho IS NULL;
GO
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('servicios.despachos') AND name = 'hora_despacho' AND is_nullable = 1)
    ALTER TABLE servicios.despachos ALTER COLUMN hora_despacho DATETIMEOFFSET(3) NOT NULL;
GO
IF NOT EXISTS (SELECT 1 FROM sys.default_constraints WHERE name = 'DF_desp_despacho')
    ALTER TABLE servicios.despachos ADD CONSTRAINT DF_desp_despacho DEFAULT SYSDATETIMEOFFSET() FOR hora_despacho;
GO
/* hora_salida pasa a admitir NULL: antes hay que soltar el indice y el valor por defecto que la usan. */
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_desp_servicio' AND object_id = OBJECT_ID('servicios.despachos'))
    DROP INDEX IX_desp_servicio ON servicios.despachos;
GO
IF EXISTS (SELECT 1 FROM sys.default_constraints WHERE name = 'DF_desp_salida')
    ALTER TABLE servicios.despachos DROP CONSTRAINT DF_desp_salida;
GO
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('servicios.despachos') AND name = 'hora_salida' AND is_nullable = 0)
    ALTER TABLE servicios.despachos ALTER COLUMN hora_salida DATETIMEOFFSET(3) NULL;
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_desp_servicio' AND object_id = OBJECT_ID('servicios.despachos'))
    CREATE INDEX IX_desp_servicio ON servicios.despachos (servicio_id, hora_despacho DESC);
GO

/* --- 3) Bitacora del incidente: solo se agrega --- */
IF OBJECT_ID('servicios.incidente_eventos', 'U') IS NULL
BEGIN
    CREATE TABLE servicios.incidente_eventos (
        id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_incidente_eventos PRIMARY KEY,
        servicio_id UNIQUEIDENTIFIER NOT NULL,
        tipo NVARCHAR(40) NOT NULL,
        titulo NVARCHAR(200) NOT NULL,
        ocurrido_en DATETIMEOFFSET(3) NOT NULL,
        registrado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_inev_registrado DEFAULT SYSDATETIMEOFFSET(),
        usuario_id UNIQUEIDENTIFIER NULL,
        usuario_nombre NVARCHAR(120) NULL,
        vehiculo_id UNIQUEIDENTIFIER NULL,
        despacho_id UNIQUEIDENTIFIER NULL,
        latitud DECIMAL(10, 8) NULL,
        longitud DECIMAL(11, 8) NULL,
        precision_m DECIMAL(7, 1) NULL,
        fase_anterior NVARCHAR(20) NULL,
        fase_nueva NVARCHAR(20) NULL,
        fuente NVARCHAR(30) NULL,
        fuente_id NVARCHAR(64) NULL,
        datos NVARCHAR(MAX) NULL CONSTRAINT CK_inev_datos CHECK (datos IS NULL OR ISJSON(datos) = 1),
        critico BIT NOT NULL CONSTRAINT DF_inev_critico DEFAULT 0,
        origen NVARCHAR(10) NOT NULL CONSTRAINT CK_inev_origen CHECK (origen IN ('WEB', 'APP', 'SISTEMA')),
        dispositivo NVARCHAR(200) NULL,
        clave_idempotencia NVARCHAR(64) NULL,
        CONSTRAINT CK_inev_tipo CHECK (tipo IN (
            'SERVICIO_RECIBIDO', 'LLAMADO_VINCULADO', 'FASE_CAMBIADA', 'PRIORIDAD_CAMBIADA',
            'MOVIL_DESPACHADO', 'MOVIL_SALIO', 'MOVIL_LLEGO', 'MOVIL_RETORNA', 'MOVIL_DISPONIBLE',
            'DESPACHO_CANCELADO', 'TRIPULACION_AJUSTADA', 'PERSONAL_SUMADO', 'COMANDO_ASUMIDO',
            'SITUACION_MARCADA', 'SITUACION_RESUELTA', 'RECURSO_SOLICITADO', 'RECURSO_ACTUALIZADO',
            'VICTIMA_REGISTRADA', 'FOTO_TOMADA', 'MENSAJE', 'COMUNICACION', 'EMERGENCIA',
            'EMERGENCIA_ATENDIDA', 'RESULTADO_DECLARADO', 'INCIDENTE_CERRADO',
            'PERSONAL_ENTRA_ZONA', 'PERSONAL_SALE_ZONA', 'RECUENTO_PERSONAL')),
        CONSTRAINT FK_inev_servicio FOREIGN KEY (servicio_id) REFERENCES servicios.servicios(id),
        CONSTRAINT FK_inev_usuario FOREIGN KEY (usuario_id) REFERENCES seguridad.usuarios(id),
        CONSTRAINT FK_inev_vehiculo FOREIGN KEY (vehiculo_id) REFERENCES vehiculos.vehiculos(id)
    );
END
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_inev_servicio' AND object_id = OBJECT_ID('servicios.incidente_eventos'))
    CREATE INDEX IX_inev_servicio ON servicios.incidente_eventos (servicio_id, id);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_inev_idempotencia' AND object_id = OBJECT_ID('servicios.incidente_eventos'))
    CREATE UNIQUE INDEX UX_inev_idempotencia ON servicios.incidente_eventos (servicio_id, clave_idempotencia)
        WHERE clave_idempotencia IS NOT NULL;
GO
IF OBJECT_ID('servicios.TR_incidente_eventos_inmutable', 'TR') IS NULL
    EXEC('CREATE TRIGGER servicios.TR_incidente_eventos_inmutable ON servicios.incidente_eventos
          INSTEAD OF UPDATE, DELETE
          AS
          BEGIN
              THROW 51093, N''La bitacora del incidente es inmutable: no se puede modificar ni borrar.'', 1;
          END');
GO

/* --- 4) Catalogo de condiciones (situacion y riesgo). Lista del pedido, sin repetir. --- */
IF OBJECT_ID('servicios.condiciones_situacion', 'U') IS NULL
BEGIN
    CREATE TABLE servicios.condiciones_situacion (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_condsit_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_condiciones_situacion PRIMARY KEY,
        codigo NVARCHAR(40) NOT NULL CONSTRAINT UQ_condsit_codigo UNIQUE,
        nombre NVARCHAR(80) NOT NULL,
        grupo NVARCHAR(12) NOT NULL CONSTRAINT CK_condsit_grupo CHECK (grupo IN ('SITUACION', 'RIESGO')),
        critica BIT NOT NULL CONSTRAINT DF_condsit_critica DEFAULT 0,
        grupo_excluyente NVARCHAR(30) NULL,
        orden INT NOT NULL CONSTRAINT DF_condsit_orden DEFAULT 0,
        activo BIT NOT NULL CONSTRAINT DF_condsit_activo DEFAULT 1
    );
END
GO
INSERT INTO servicios.condiciones_situacion (codigo, nombre, grupo, critica, grupo_excluyente, orden)
SELECT v.codigo, v.nombre, v.grupo, v.critica, v.excluyente, v.orden FROM (VALUES
    (N'INCENDIO_ACTIVO',        N'Incendio activo',           N'SITUACION', 0, N'INCENDIO', 10),
    (N'INCENDIO_FUERA_CONTROL', N'Incendio fuera de control', N'SITUACION', 1, N'INCENDIO', 20),
    (N'INCENDIO_CONTROLADO',    N'Incendio controlado',       N'SITUACION', 0, N'INCENDIO', 30),
    (N'PROPAGACION',            N'Propagación',               N'SITUACION', 0, NULL, 40),
    (N'VICTIMA',                N'Víctima',                   N'SITUACION', 1, NULL, 50),
    (N'VICTIMA_ATRAPADA',       N'Víctima atrapada',          N'SITUACION', 1, NULL, 60),
    (N'PERSONA_DESAPARECIDA',   N'Persona desaparecida',      N'SITUACION', 1, NULL, 70),
    (N'EVACUACION',             N'Evacuación',                N'SITUACION', 0, NULL, 80),
    (N'INUNDACION',             N'Inundación',                N'SITUACION', 0, NULL, 90),
    (N'DERRUMBE',               N'Derrumbe',                  N'SITUACION', 1, NULL, 100),
    (N'ACCIDENTE_VEHICULAR',    N'Accidente vehicular',       N'SITUACION', 0, NULL, 110),
    (N'OTRA_SITUACION',         N'Otra situación',            N'SITUACION', 0, NULL, 120),
    (N'RIESGO_ESTRUCTURAL',     N'Riesgo estructural',        N'RIESGO',    1, NULL, 210),
    (N'RIESGO_ELECTRICO',       N'Riesgo eléctrico',          N'RIESGO',    0, NULL, 220),
    (N'MATERIAL_PELIGROSO',     N'Material peligroso',        N'RIESGO',    1, NULL, 230),
    (N'RIESGO_EXPLOSION',       N'Riesgo de explosión',       N'RIESGO',    1, NULL, 240),
    (N'RIESGO_QUIMICO',         N'Riesgo químico',            N'RIESGO',    1, NULL, 250),
    (N'RIESGO_BIOLOGICO',       N'Riesgo biológico',          N'RIESGO',    1, NULL, 260),
    (N'TRAFICO',                N'Tráfico',                   N'RIESGO',    0, NULL, 270),
    (N'CONDICIONES_CLIMATICAS', N'Condiciones climáticas',    N'RIESGO',    0, NULL, 280),
    (N'EPP_OBLIGATORIO',        N'EPP obligatorio',           N'RIESGO',    0, NULL, 290),
    (N'OTRO_RIESGO',            N'Otro riesgo',               N'RIESGO',    0, NULL, 300)
) AS v(codigo, nombre, grupo, critica, excluyente, orden)
WHERE NOT EXISTS (SELECT 1 FROM servicios.condiciones_situacion c WHERE c.codigo = v.codigo);
GO

/* --- 5) Catalogo de tipos de recurso de la SOLICITUD RAPIDA --- */
IF OBJECT_ID('servicios.tipos_recurso', 'U') IS NULL
BEGIN
    CREATE TABLE servicios.tipos_recurso (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_tiporec_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_tipos_recurso PRIMARY KEY,
        codigo NVARCHAR(30) NOT NULL CONSTRAINT UQ_tiporec_codigo UNIQUE,
        nombre NVARCHAR(80) NOT NULL,
        categoria NVARCHAR(10) NOT NULL CONSTRAINT CK_tiporec_categoria CHECK (categoria IN ('MOVIL', 'PERSONAL', 'INSUMO', 'EXTERNO', 'OTRO')),
        orden INT NOT NULL CONSTRAINT DF_tiporec_orden DEFAULT 0,
        activo BIT NOT NULL CONSTRAINT DF_tiporec_activo DEFAULT 1
    );
END
GO
INSERT INTO servicios.tipos_recurso (codigo, nombre, categoria, orden)
SELECT v.codigo, v.nombre, v.categoria, v.orden FROM (VALUES
    (N'AUTOBOMBA',     N'Autobomba',     N'MOVIL',    10),
    (N'RESCATE',       N'Rescate',       N'MOVIL',    20),
    (N'CISTERNA',      N'Cisterna',      N'MOVIL',    30),
    (N'AMBULANCIA',    N'Ambulancia',    N'EXTERNO',  40),
    (N'PERSONAL',      N'Personal',      N'PERSONAL', 50),
    (N'HERRAMIENTAS',  N'Herramientas',  N'INSUMO',   60),
    (N'ESPUMA',        N'Espuma',        N'INSUMO',   70),
    (N'AGUA',          N'Agua',          N'INSUMO',   80),
    (N'POLICIA',       N'Policía',       N'EXTERNO',  90),
    (N'HOSPITAL',      N'Hospital',      N'EXTERNO', 100),
    (N'OTRA_COMPANIA', N'Otra compañía', N'EXTERNO', 110),
    (N'OTRO',          N'Otro recurso',  N'OTRO',    120)
) AS v(codigo, nombre, categoria, orden)
WHERE NOT EXISTS (SELECT 1 FROM servicios.tipos_recurso t WHERE t.codigo = v.codigo);
GO

/* --- 6) Pedidos de recurso del incidente (ciclo SCI) --- */
IF OBJECT_ID('servicios.incidente_solicitudes', 'U') IS NULL
BEGIN
    CREATE TABLE servicios.incidente_solicitudes (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_insol_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_incidente_solicitudes PRIMARY KEY,
        servicio_id UNIQUEIDENTIFIER NOT NULL,
        tipo_recurso_id UNIQUEIDENTIFIER NOT NULL,
        cantidad INT NOT NULL CONSTRAINT DF_insol_cantidad DEFAULT 1 CONSTRAINT CK_insol_cantidad CHECK (cantidad > 0),
        prioridad NVARCHAR(10) NOT NULL CONSTRAINT CK_insol_prioridad CHECK (prioridad IN ('NORMAL', 'URGENTE')),
        estado NVARCHAR(12) NOT NULL CONSTRAINT DF_insol_estado DEFAULT 'SOLICITADO'
            CONSTRAINT CK_insol_estado CHECK (estado IN ('SOLICITADO', 'APROBADO', 'DESPACHADO', 'EN_CAMINO', 'EN_USO', 'LIBERADO', 'RECHAZADO', 'CANCELADO')),
        observacion NVARCHAR(300) NULL,
        solicitado_por UNIQUEIDENTIFIER NOT NULL,
        solicitado_en DATETIMEOFFSET(3) NOT NULL,
        actualizado_por UNIQUEIDENTIFIER NULL,
        actualizado_en DATETIMEOFFSET(3) NOT NULL,
        version INT NOT NULL CONSTRAINT DF_insol_version DEFAULT 0,
        clave_idempotencia NVARCHAR(64) NULL,
        CONSTRAINT FK_insol_servicio FOREIGN KEY (servicio_id) REFERENCES servicios.servicios(id),
        CONSTRAINT FK_insol_tipo FOREIGN KEY (tipo_recurso_id) REFERENCES servicios.tipos_recurso(id),
        CONSTRAINT FK_insol_solicitado FOREIGN KEY (solicitado_por) REFERENCES seguridad.usuarios(id),
        CONSTRAINT FK_insol_actualizado FOREIGN KEY (actualizado_por) REFERENCES seguridad.usuarios(id)
    );
END
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_insol_servicio' AND object_id = OBJECT_ID('servicios.incidente_solicitudes'))
    CREATE INDEX IX_insol_servicio ON servicios.incidente_solicitudes (servicio_id, estado);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_insol_idempotencia' AND object_id = OBJECT_ID('servicios.incidente_solicitudes'))
    CREATE UNIQUE INDEX UX_insol_idempotencia ON servicios.incidente_solicitudes (servicio_id, clave_idempotencia)
        WHERE clave_idempotencia IS NOT NULL;
GO

/* --- 7) Tripulacion vigente de cada movil (se carga al tomar la guardia) --- */
IF OBJECT_ID('vehiculos.tripulacion_movil', 'U') IS NULL
BEGIN
    CREATE TABLE vehiculos.tripulacion_movil (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_tripm_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_tripulacion_movil PRIMARY KEY,
        vehiculo_id UNIQUEIDENTIFIER NOT NULL,
        bombero_id UNIQUEIDENTIFIER NOT NULL,
        funcion NVARCHAR(40) NOT NULL,
        asignado_por UNIQUEIDENTIFIER NOT NULL,
        asignado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_tripm_asignado DEFAULT SYSDATETIMEOFFSET(),
        /* Una persona va en un solo movil a la vez. */
        CONSTRAINT UQ_tripm_bombero UNIQUE (bombero_id),
        CONSTRAINT FK_tripm_vehiculo FOREIGN KEY (vehiculo_id) REFERENCES vehiculos.vehiculos(id),
        CONSTRAINT FK_tripm_bombero FOREIGN KEY (bombero_id) REFERENCES personal.bomberos(id),
        CONSTRAINT FK_tripm_usuario FOREIGN KEY (asignado_por) REFERENCES seguridad.usuarios(id)
    );
END
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_tripm_vehiculo' AND object_id = OBJECT_ID('vehiculos.tripulacion_movil'))
    CREATE INDEX IX_tripm_vehiculo ON vehiculos.tripulacion_movil (vehiculo_id);
GO

/* --- 8) personal_servicio: de que movil y despacho viene cada persona --- */
IF COL_LENGTH('servicios.personal_servicio', 'vehiculo_id') IS NULL
    ALTER TABLE servicios.personal_servicio ADD
        vehiculo_id UNIQUEIDENTIFIER NULL,
        despacho_id UNIQUEIDENTIFIER NULL,
        origen NVARCHAR(12) NULL,
        /* Codigo del parametro FUNCION_INCIDENTE (rol guarda el nombre legible). */
        funcion NVARCHAR(40) NULL,
        /* Control de personal: dentro de la zona de trabajo y desde cuando. Nunca se libera solo. */
        en_zona BIT NOT NULL CONSTRAINT DF_perser_enzona DEFAULT 0,
        zona_desde DATETIMEOFFSET(3) NULL,
        /* Minutos exactos de servicio; horas_servicio queda como el valor redondeado (DEC-4). */
        minutos_servicio INT NULL;
GO
IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_perser_origen')
    ALTER TABLE servicios.personal_servicio ADD CONSTRAINT CK_perser_origen
        CHECK (origen IS NULL OR origen IN ('TRIPULACION', 'AJUSTE', 'SOLICITUD'));
GO
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_perser_vehiculo')
    ALTER TABLE servicios.personal_servicio ADD CONSTRAINT FK_perser_vehiculo FOREIGN KEY (vehiculo_id) REFERENCES vehiculos.vehiculos(id);
GO
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_perser_despacho')
    ALTER TABLE servicios.personal_servicio ADD CONSTRAINT FK_perser_despacho FOREIGN KEY (despacho_id) REFERENCES servicios.despachos(id);
GO

/* --- 9) adjuntos: posicion y categoria de la foto --- */
IF COL_LENGTH('servicios.adjuntos', 'latitud') IS NULL
    ALTER TABLE servicios.adjuntos ADD
        latitud DECIMAL(10, 8) NULL,
        longitud DECIMAL(11, 8) NULL,
        categoria NVARCHAR(12) NULL;
GO
IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_adj_categoria')
    ALTER TABLE servicios.adjuntos ADD CONSTRAINT CK_adj_categoria CHECK (categoria IS NULL OR categoria IN (
        'DANO', 'VICTIMA', 'RIESGO', 'VEHICULO', 'ESTRUCTURA', 'EQUIPAMIENTO', 'EVIDENCIA', 'OTRO'));
GO

/* --- 10) Funciones del personal en un incidente (configurables) --- */
IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_param_tipo')
    ALTER TABLE organizacion.parametros DROP CONSTRAINT CK_param_tipo;
GO
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
    N'TIPO_BENEFICIO_SOCIO', N'MOTIVO_NOTA_CREDITO_FINANZAS',
    N'FUNCION_INCIDENTE', N'POLITICA_INCIDENTE'
));
GO
INSERT INTO organizacion.parametros (tipo, nombre, nombre_normalizado, codigo, orden)
SELECT N'FUNCION_INCIDENTE', v.nombre, v.normalizado, v.codigo, v.orden FROM (VALUES
    (N'Comandante',       N'comandante',       N'COMANDANTE',      10),
    (N'Jefe de dotación', N'jefe de dotacion', N'JEFE_DOTACION',   20),
    (N'Conductor',        N'conductor',        N'CONDUCTOR',       30),
    (N'Bombero',          N'bombero',          N'BOMBERO',         40),
    (N'Rescatista',       N'rescatista',       N'RESCATISTA',      50),
    (N'Paramédico',       N'paramedico',       N'PARAMEDICO',      60),
    (N'Operador',         N'operador',         N'OPERADOR',        70),
    (N'Seguridad',        N'seguridad',        N'SEGURIDAD',       80),
    (N'Comunicaciones',   N'comunicaciones',   N'COMUNICACIONES',  90),
    (N'Logística',        N'logistica',        N'LOGISTICA',      100)
) AS v(nombre, normalizado, codigo, orden)
WHERE NOT EXISTS (SELECT 1 FROM organizacion.parametros p WHERE p.tipo = N'FUNCION_INCIDENTE' AND p.codigo = v.codigo);
GO

/* Politicas institucionales DEC-2 y DEC-4: configurables. */
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_param_politica_incidente' AND object_id = OBJECT_ID('organizacion.parametros'))
    CREATE UNIQUE INDEX UX_param_politica_incidente ON organizacion.parametros (codigo)
        WHERE tipo = N'POLITICA_INCIDENTE' AND estado = N'ACTIVO' AND eliminado_en IS NULL AND codigo IS NOT NULL;
GO
INSERT INTO organizacion.parametros (tipo, nombre, nombre_normalizado, codigo, descripcion, orden, estado)
SELECT N'POLITICA_INCIDENTE', v.nombre, v.normalizado, v.codigo, v.descripcion, v.orden, N'ACTIVO'
FROM (VALUES
    (N'Horas de servicio', N'horas de servicio', N'HORAS_SERVICIO', N'MAS_CERCANA', 10),
    (N'Participación en incidentes', N'participacion en incidentes', N'PARTICIPACION', N'MARCAR_NO_ASIGNADO', 20)
) AS v(nombre, normalizado, codigo, descripcion, orden)
WHERE NOT EXISTS (SELECT 1 FROM organizacion.parametros p WHERE p.tipo = N'POLITICA_INCIDENTE' AND p.codigo = v.codigo AND p.estado = N'ACTIVO' AND p.eliminado_en IS NULL);
GO

/* --- 11) Permisos: se usan en incidentes/flota y se siembran aca --- */
INSERT INTO seguridad.permisos (nombre, recurso, accion, categoria)
SELECT v.nombre, v.recurso, v.accion, v.categoria
FROM (VALUES
    (N'servicios:operar',      N'servicios', N'operar',      N'Servicios'),
    (N'servicios:comandar',    N'servicios', N'comandar',    N'Servicios'),
    (N'servicios:finalizar',   N'servicios', N'finalizar',   N'Servicios'),
    (N'vehiculos:tripulacion', N'vehiculos', N'tripulacion', N'Vehiculos')
) AS v(nombre, recurso, accion, categoria)
WHERE NOT EXISTS (SELECT 1 FROM seguridad.permisos p WHERE p.nombre = v.nombre);
GO
/* Se copian desde permisos existentes: no depende de como se llamen los roles en cada cuartel. */
INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT DISTINCT a.rol_id, nuevo.id
FROM seguridad.asignacion_permisos_rol a
JOIN seguridad.permisos o ON o.id = a.permiso_id
JOIN (VALUES
    (N'despacho:responder',  N'servicios:operar'),
    (N'servicios:finalizar', N'servicios:comandar'),
    (N'servicios:despachar', N'vehiculos:tripulacion')
) AS m(origen, destino) ON m.origen = o.nombre
JOIN seguridad.permisos nuevo ON nuevo.nombre = m.destino
WHERE NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol x WHERE x.rol_id = a.rol_id AND x.permiso_id = nuevo.id);
GO
INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id FROM seguridad.roles r CROSS JOIN seguridad.permisos p
WHERE r.nombre = N'Administrador General'
    AND p.nombre IN (N'servicios:operar', N'servicios:comandar', N'servicios:finalizar', N'vehiculos:tripulacion')
    AND NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol a WHERE a.rol_id = r.id AND a.permiso_id = p.id);
GO
/* FOTO del Modo Incidente: quien opera en el lugar tiene que poder subir la foto (POST /adjuntos). */
INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT DISTINCT a.rol_id, nuevo.id
FROM seguridad.asignacion_permisos_rol a
JOIN seguridad.permisos o ON o.id = a.permiso_id AND o.nombre = N'servicios:operar'
JOIN seguridad.permisos nuevo ON nuevo.nombre = N'adjuntos:subir'
WHERE NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol x WHERE x.rol_id = a.rol_id AND x.permiso_id = nuevo.id);
GO
