/* =============================================================
   SIGBO-CBVC | Migracion 090 - Servicio activo, formularios, permisos por pantalla
   y auditoria de navegacion
   =============================================================
   Fases C, D y E del modulo de Despacho (.context/DESPACHO.md):
   - participantes de un servicio activo y chat operativo (inmutable);
   - formularios por servicio: definiciones configurables, respuestas e historial
     inmutable de cada modificacion;
   - catalogo de pantallas con codigo hexadecimal (0xA001...) y matriz de permisos por
     pantalla para ROL, USUARIO, RANGO o CARGO (ver, crear, editar, eliminar, confidencial);
   - auditoria de navegacion (que pantalla, cuando, cuanto tiempo).

   Se agregan disparadores INSTEAD OF UPDATE/DELETE en las tablas de evidencia
   (mensajes, historial de formularios, navegacion): la historia solo se agrega. */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

/* --- 1) Participantes de un servicio --- */
IF OBJECT_ID('servicios.servicio_participantes', 'U') IS NULL
BEGIN
    CREATE TABLE servicios.servicio_participantes (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_servp_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_servicio_participantes PRIMARY KEY,
        servicio_id UNIQUEIDENTIFIER NOT NULL,
        usuario_id UNIQUEIDENTIFIER NOT NULL,
        usuario_nombre NVARCHAR(120) NOT NULL,
        rol NVARCHAR(60) NULL,
        estado NVARCHAR(20) NOT NULL CONSTRAINT DF_servp_estado DEFAULT 'EN_CAMINO'
            CONSTRAINT CK_servp_estado CHECK (estado IN ('EN_CAMINO', 'EN_SITIO', 'RETIRADO')),
        solicitud_id UNIQUEIDENTIFIER NULL,
        desde DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_servp_desde DEFAULT SYSDATETIMEOFFSET(),
        llegada_en DATETIMEOFFSET(3) NULL,
        hasta DATETIMEOFFSET(3) NULL,
        version INT NOT NULL CONSTRAINT DF_servp_version DEFAULT 0,
        CONSTRAINT UQ_servp UNIQUE (servicio_id, usuario_id),
        CONSTRAINT FK_servp_servicio FOREIGN KEY (servicio_id) REFERENCES servicios.servicios(id),
        CONSTRAINT FK_servp_usuario FOREIGN KEY (usuario_id) REFERENCES seguridad.usuarios(id)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_servp_usuario' AND object_id = OBJECT_ID('servicios.servicio_participantes'))
    CREATE INDEX IX_servp_usuario ON servicios.servicio_participantes (usuario_id, estado);
GO

/* --- 2) Chat operativo del servicio --- */
IF OBJECT_ID('servicios.servicio_mensajes', 'U') IS NULL
BEGIN
    CREATE TABLE servicios.servicio_mensajes (
        id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_servicio_mensajes PRIMARY KEY,
        servicio_id UNIQUEIDENTIFIER NOT NULL,
        usuario_id UNIQUEIDENTIFIER NOT NULL,
        usuario_nombre NVARCHAR(120) NOT NULL,
        texto NVARCHAR(500) NOT NULL,
        ocurrido_en DATETIMEOFFSET(3) NOT NULL,
        registrado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_servm_registrado DEFAULT SYSDATETIMEOFFSET(),
        clave_idempotencia NVARCHAR(64) NULL,
        CONSTRAINT FK_servm_servicio FOREIGN KEY (servicio_id) REFERENCES servicios.servicios(id),
        CONSTRAINT FK_servm_usuario FOREIGN KEY (usuario_id) REFERENCES seguridad.usuarios(id)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_servm_servicio' AND object_id = OBJECT_ID('servicios.servicio_mensajes'))
    CREATE INDEX IX_servm_servicio ON servicios.servicio_mensajes (servicio_id, ocurrido_en, id);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_servm_idempotencia' AND object_id = OBJECT_ID('servicios.servicio_mensajes'))
    CREATE UNIQUE INDEX UX_servm_idempotencia ON servicios.servicio_mensajes (servicio_id, usuario_id, clave_idempotencia) WHERE clave_idempotencia IS NOT NULL;
GO

/* --- 3) Formularios del servicio --- */
IF OBJECT_ID('servicios.formulario_definiciones', 'U') IS NULL
BEGIN
    CREATE TABLE servicios.formulario_definiciones (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_formd_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_formulario_definiciones PRIMARY KEY,
        codigo NVARCHAR(40) NOT NULL,
        nombre NVARCHAR(120) NOT NULL,
        descripcion NVARCHAR(300) NULL,
        /* [{clave, etiqueta, tipo: texto|texto_largo|numero|si_no|opcion|fecha_hora, requerido, opciones, confidencial}] */
        campos NVARCHAR(MAX) NOT NULL,
        /* Filtros de disponibilidad (NULL = sin restriccion): ids de tipo de servicio, nombres de rol, permiso, etapa. */
        tipos_servicio NVARCHAR(MAX) NULL,
        roles NVARCHAR(MAX) NULL,
        permiso_requerido NVARCHAR(80) NULL,
        etapa NVARCHAR(20) NULL CONSTRAINT CK_formd_etapa CHECK (etapa IS NULL OR etapa IN ('EN_CURSO', 'CIERRE')),
        confidencial BIT NOT NULL CONSTRAINT DF_formd_conf DEFAULT 0,
        activo BIT NOT NULL CONSTRAINT DF_formd_activo DEFAULT 1,
        version INT NOT NULL CONSTRAINT DF_formd_version DEFAULT 1,
        creado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_formd_creado DEFAULT SYSDATETIMEOFFSET(),
        actualizado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_formd_actualizado DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT UQ_formd_codigo UNIQUE (codigo)
    );
END
GO

IF OBJECT_ID('servicios.formulario_respuestas', 'U') IS NULL
BEGIN
    CREATE TABLE servicios.formulario_respuestas (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_formr_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_formulario_respuestas PRIMARY KEY,
        servicio_id UNIQUEIDENTIFIER NOT NULL,
        definicion_id UNIQUEIDENTIFIER NOT NULL,
        definicion_version INT NOT NULL,
        estado NVARCHAR(20) NOT NULL CONSTRAINT DF_formr_estado DEFAULT 'BORRADOR'
            CONSTRAINT CK_formr_estado CHECK (estado IN ('BORRADOR', 'COMPLETADO', 'ANULADO')),
        datos NVARCHAR(MAX) NOT NULL,
        creado_por UNIQUEIDENTIFIER NOT NULL,
        creado_por_nombre NVARCHAR(120) NOT NULL,
        creado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_formr_creado DEFAULT SYSDATETIMEOFFSET(),
        actualizado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_formr_actualizado DEFAULT SYSDATETIMEOFFSET(),
        version INT NOT NULL CONSTRAINT DF_formr_version DEFAULT 0,
        CONSTRAINT FK_formr_servicio FOREIGN KEY (servicio_id) REFERENCES servicios.servicios(id),
        CONSTRAINT FK_formr_definicion FOREIGN KEY (definicion_id) REFERENCES servicios.formulario_definiciones(id)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_formr_servicio' AND object_id = OBJECT_ID('servicios.formulario_respuestas'))
    CREATE INDEX IX_formr_servicio ON servicios.formulario_respuestas (servicio_id, creado_en);
GO

/* Cada alta o modificacion deja una fila: nada se pisa sin quedar registrado. */
IF OBJECT_ID('servicios.formulario_historial', 'U') IS NULL
BEGIN
    CREATE TABLE servicios.formulario_historial (
        id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_formulario_historial PRIMARY KEY,
        respuesta_id UNIQUEIDENTIFIER NOT NULL,
        usuario_id UNIQUEIDENTIFIER NOT NULL,
        usuario_nombre NVARCHAR(120) NOT NULL,
        accion NVARCHAR(20) NOT NULL CONSTRAINT CK_formh_accion CHECK (accion IN ('CREAR', 'MODIFICAR', 'COMPLETAR', 'ANULAR')),
        datos_antes NVARCHAR(MAX) NULL,
        datos_despues NVARCHAR(MAX) NULL,
        estado_antes NVARCHAR(20) NULL,
        estado_despues NVARCHAR(20) NULL,
        ocurrido_en DATETIMEOFFSET(3) NOT NULL,
        registrado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_formh_registrado DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT FK_formh_respuesta FOREIGN KEY (respuesta_id) REFERENCES servicios.formulario_respuestas(id)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_formh_respuesta' AND object_id = OBJECT_ID('servicios.formulario_historial'))
    CREATE INDEX IX_formh_respuesta ON servicios.formulario_historial (respuesta_id, id);
GO

/* --- 4) Pantallas y matriz de permisos --- */
IF OBJECT_ID('seguridad.pantallas', 'U') IS NULL
BEGIN
    CREATE TABLE seguridad.pantallas (
        codigo NVARCHAR(10) NOT NULL CONSTRAINT PK_pantallas PRIMARY KEY,
        nombre NVARCHAR(80) NOT NULL,
        descripcion NVARCHAR(200) NULL,
        /* La pantalla puede mostrar informacion confidencial: la columna "Confidencial" de la matriz le aplica. */
        confidencial_aplica BIT NOT NULL CONSTRAINT DF_pant_conf DEFAULT 0,
        activa BIT NOT NULL CONSTRAINT DF_pant_activa DEFAULT 1,
        CONSTRAINT CK_pant_codigo CHECK (codigo LIKE '0x[0-9A-F][0-9A-F][0-9A-F][0-9A-F]')
    );
END
GO

IF OBJECT_ID('seguridad.pantalla_permisos', 'U') IS NULL
BEGIN
    CREATE TABLE seguridad.pantalla_permisos (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_pantp_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_pantalla_permisos PRIMARY KEY,
        pantalla_codigo NVARCHAR(10) NOT NULL,
        sujeto_tipo NVARCHAR(10) NOT NULL CONSTRAINT CK_pantp_sujeto CHECK (sujeto_tipo IN ('ROL', 'USUARIO', 'RANGO', 'CARGO')),
        sujeto_id NVARCHAR(100) NOT NULL,
        ver BIT NOT NULL CONSTRAINT DF_pantp_ver DEFAULT 0,
        crear BIT NOT NULL CONSTRAINT DF_pantp_crear DEFAULT 0,
        editar BIT NOT NULL CONSTRAINT DF_pantp_editar DEFAULT 0,
        eliminar BIT NOT NULL CONSTRAINT DF_pantp_eliminar DEFAULT 0,
        confidencial BIT NOT NULL CONSTRAINT DF_pantp_conf DEFAULT 0,
        /* La denegacion gana sobre cualquier concesion (mismo criterio que los permisos directos). */
        denegar BIT NOT NULL CONSTRAINT DF_pantp_denegar DEFAULT 0,
        creado_por UNIQUEIDENTIFIER NULL,
        creado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_pantp_creado DEFAULT SYSDATETIMEOFFSET(),
        actualizado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_pantp_actualizado DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT UQ_pantp UNIQUE (pantalla_codigo, sujeto_tipo, sujeto_id),
        CONSTRAINT FK_pantp_pantalla FOREIGN KEY (pantalla_codigo) REFERENCES seguridad.pantallas(codigo)
    );
END
GO

/* --- 5) Auditoria de navegacion --- */
IF OBJECT_ID('seguridad.navegacion_eventos', 'U') IS NULL
BEGIN
    CREATE TABLE seguridad.navegacion_eventos (
        id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_navegacion_eventos PRIMARY KEY,
        usuario_id UNIQUEIDENTIFIER NOT NULL,
        usuario_nombre NVARCHAR(120) NULL,
        pantalla_codigo NVARCHAR(10) NOT NULL,
        entrada DATETIMEOFFSET(3) NOT NULL,
        salida DATETIMEOFFSET(3) NULL,
        duracion_seg INT NULL,
        servicio_id UNIQUEIDENTIFIER NULL,
        accion NVARCHAR(120) NULL,
        dispositivo NVARCHAR(160) NULL,
        conectado BIT NOT NULL CONSTRAINT DF_nave_conectado DEFAULT 1,
        ip NVARCHAR(45) NULL,
        registrado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_nave_registrado DEFAULT SYSDATETIMEOFFSET(),
        clave_idempotencia NVARCHAR(64) NULL,
        CONSTRAINT FK_nave_usuario FOREIGN KEY (usuario_id) REFERENCES seguridad.usuarios(id),
        CONSTRAINT FK_nave_pantalla FOREIGN KEY (pantalla_codigo) REFERENCES seguridad.pantallas(codigo)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_nave_usuario_entrada' AND object_id = OBJECT_ID('seguridad.navegacion_eventos'))
    CREATE INDEX IX_nave_usuario_entrada ON seguridad.navegacion_eventos (usuario_id, entrada);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_nave_idempotencia' AND object_id = OBJECT_ID('seguridad.navegacion_eventos'))
    CREATE UNIQUE INDEX UX_nave_idempotencia ON seguridad.navegacion_eventos (usuario_id, clave_idempotencia) WHERE clave_idempotencia IS NOT NULL;
GO

/* --- 6) Tablas de evidencia: solo se agregan --- */
IF NOT EXISTS (SELECT 1 FROM sys.triggers WHERE name = 'TR_servicio_mensajes_inmutable')
    EXEC('CREATE TRIGGER servicios.TR_servicio_mensajes_inmutable ON servicios.servicio_mensajes
          INSTEAD OF UPDATE, DELETE
          AS BEGIN THROW 51090, N''Los mensajes del servicio son inmutables: no se pueden modificar ni borrar.'', 1; END');
GO
IF NOT EXISTS (SELECT 1 FROM sys.triggers WHERE name = 'TR_formulario_historial_inmutable')
    EXEC('CREATE TRIGGER servicios.TR_formulario_historial_inmutable ON servicios.formulario_historial
          INSTEAD OF UPDATE, DELETE
          AS BEGIN THROW 51091, N''El historial de formularios es inmutable: no se puede modificar ni borrar.'', 1; END');
GO
IF NOT EXISTS (SELECT 1 FROM sys.triggers WHERE name = 'TR_navegacion_eventos_inmutable')
    EXEC('CREATE TRIGGER seguridad.TR_navegacion_eventos_inmutable ON seguridad.navegacion_eventos
          INSTEAD OF UPDATE, DELETE
          AS BEGIN THROW 51092, N''La auditoria de navegacion es inmutable: no se puede modificar ni borrar.'', 1; END');
GO

/* --- 7) Catalogo de pantallas (codigos fijos: la auditoria los usa) --- */
INSERT INTO seguridad.pantallas (codigo, nombre, descripcion, confidencial_aplica)
SELECT v.codigo, v.nombre, v.descripcion, v.conf
FROM (VALUES
    (N'0xA001', N'Inicio', N'Resumen, servicios activos y accesos rapidos', 0),
    (N'0xA002', N'Servicios', N'Listado de servicios', 0),
    (N'0xA003', N'Solicitudes', N'Bandeja de solicitudes de despacho', 0),
    (N'0xA004', N'Solicitar chofer', N'Pedido de chofer para uno o varios moviles', 0),
    (N'0xA005', N'Solicitar personal', N'Llamado general al personal elegible', 0),
    (N'0xA006', N'Servicio activo', N'Estado operativo de un servicio en curso', 1),
    (N'0xA007', N'Chat', N'Chat operativo del servicio', 0),
    (N'0xA008', N'Formularios', N'Formularios del servicio', 1),
    (N'0xA009', N'Seguridad', N'Permisos por pantalla, rango, cargo, rol y usuario', 0),
    (N'0xA00A', N'Auditoria', N'Auditoria de actividad y navegacion', 1),
    (N'0xA00B', N'Solicitud rapida', N'Llamado inmediato sin detalles', 0),
    (N'0xA00C', N'Disponibilidad', N'Estado, horarios y excepciones propias', 0),
    (N'0xA00D', N'Seguimiento de solicitud', N'Quien respondio, quien viene en camino, linea de tiempo', 0),
    (N'0xA00E', N'Mapa del servicio', N'Ubicacion del servicio, moviles y personal', 1),
    (N'0xA00F', N'Informacion confidencial', N'Direccion exacta, victimas, datos medicos y documentos internos', 1),
    (N'0xA010', N'Mis permisos', N'Que puedo hacer en cada pantalla', 0),
    (N'0xA011', N'Reportar un problema', N'Buzon de errores y sugerencias', 0),
    (N'0xA012', N'Operacion', N'Menu de herramientas operativas', 0)
) AS v(codigo, nombre, descripcion, conf)
WHERE NOT EXISTS (SELECT 1 FROM seguridad.pantallas p WHERE p.codigo = v.codigo);
GO

/* --- 8) Formulario institucional por defecto (configuracion editable, no un dato de ejemplo) --- */
IF NOT EXISTS (SELECT 1 FROM servicios.formulario_definiciones WHERE codigo = N'NOVEDADES')
    INSERT INTO servicios.formulario_definiciones (codigo, nombre, descripcion, campos, etapa, confidencial)
    VALUES (
        N'NOVEDADES',
        N'Parte de novedades del servicio',
        N'Registro corto de lo que ocurre durante el servicio.',
        N'[{"clave":"novedad","etiqueta":"Novedad","tipo":"texto_largo","requerido":true},{"clave":"personal_en_lugar","etiqueta":"Personal en el lugar","tipo":"numero","requerido":false},{"clave":"requiere_apoyo","etiqueta":"Requiere apoyo","tipo":"si_no","requerido":false},{"clave":"observaciones_internas","etiqueta":"Observaciones internas","tipo":"texto_largo","requerido":false,"confidencial":true}]',
        NULL, 0);
GO

/* --- 9) Permisos --- */
INSERT INTO seguridad.permisos (nombre, recurso, accion, categoria)
SELECT v.nombre, v.recurso, v.accion, v.categoria
FROM (VALUES
    (N'despacho:servicio', N'despacho', N'servicio', N'Servicios'),
    (N'despacho:confidencial', N'despacho', N'confidencial', N'Servicios'),
    (N'despacho:formularios_admin', N'despacho', N'formularios_admin', N'Servicios'),
    (N'navegacion:registrar', N'navegacion', N'registrar', N'Seguridad'),
    (N'seguridad:ver_navegacion', N'seguridad', N'ver_navegacion', N'Seguridad'),
    (N'seguridad:gestionar_pantallas', N'seguridad', N'gestionar_pantallas', N'Seguridad')
) AS v(nombre, recurso, accion, categoria)
WHERE NOT EXISTS (SELECT 1 FROM seguridad.permisos p WHERE p.nombre = v.nombre);
GO

/* servicio activo y registrar la propia navegacion: todos los roles */
INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id FROM seguridad.roles r CROSS JOIN seguridad.permisos p
WHERE p.nombre IN (N'despacho:servicio', N'navegacion:registrar')
    AND NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol a WHERE a.rol_id = r.id AND a.permiso_id = p.id);
GO

/* informacion confidencial: quien ya coordina despachos */
INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT DISTINCT a.rol_id, nuevo.id
FROM seguridad.asignacion_permisos_rol a
JOIN seguridad.permisos o ON o.id = a.permiso_id AND o.nombre = N'despacho:solicitar'
CROSS JOIN seguridad.permisos nuevo
WHERE nuevo.nombre = N'despacho:confidencial'
    AND NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol x WHERE x.rol_id = a.rol_id AND x.permiso_id = nuevo.id);
GO

/* ver la auditoria de navegacion: quien ya puede ver los logs de auditoria */
INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT DISTINCT a.rol_id, nuevo.id
FROM seguridad.asignacion_permisos_rol a
JOIN seguridad.permisos o ON o.id = a.permiso_id AND o.nombre = N'seguridad:ver_logs'
CROSS JOIN seguridad.permisos nuevo
WHERE nuevo.nombre = N'seguridad:ver_navegacion'
    AND NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol x WHERE x.rol_id = a.rol_id AND x.permiso_id = nuevo.id);
GO

/* configurar la matriz y los formularios: solo el Administrador General */
INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id FROM seguridad.roles r CROSS JOIN seguridad.permisos p
WHERE r.nombre = N'Administrador General'
    AND p.nombre IN (N'despacho:formularios_admin', N'seguridad:gestionar_pantallas', N'seguridad:ver_navegacion', N'despacho:confidencial')
    AND NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol a WHERE a.rol_id = r.id AND a.permiso_id = p.id);
GO
