/* =============================================================
   SIGBO-CBVC | Migracion 088 - Despacho y coordinacion operativa (nucleo)
   =============================================================
   Fase A del modulo de Despacho (.context/DESPACHO.md):
   - disponibilidad declarada de cada persona (AL_LLAMADO, NO_DISPONIBLE, EN_BASE,
     EN_CAMINO, EN_SERVICIO), con horarios y excepciones;
   - solicitudes (CHOFER, PERSONAL, RAPIDA) con un destinatario por persona, donde
     "entrega" (se le pudo enviar o no, y por que) es un eje distinto de "estado"
     (que respondio);
   - linea de tiempo de cada solicitud, INMUTABLE: un disparador impide UPDATE y DELETE.

   Se EXTIENDE lo existente (llamados, convocatorias, despachos de flota), no se duplica:
   servicio_id y llamado_id enlazan con servicios.servicios y servicios.llamados.

   Permisos nuevos: despacho:responder (todos los roles: ver y responder solicitudes,
   declarar disponibilidad), despacho:solicitar y despacho:seguimiento (quien ya puede
   convocar o despachar, mas el Administrador General). */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

/* --- 1) Disponibilidad declarada --- */
IF OBJECT_ID('servicios.disponibilidad_personal', 'U') IS NULL
BEGIN
    CREATE TABLE servicios.disponibilidad_personal (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_disp_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_disponibilidad_personal PRIMARY KEY,
        usuario_id UNIQUEIDENTIFIER NOT NULL,
        estado NVARCHAR(20) NOT NULL CONSTRAINT DF_disp_estado DEFAULT 'NO_DISPONIBLE'
            CONSTRAINT CK_disp_estado CHECK (estado IN ('NO_DISPONIBLE', 'AL_LLAMADO', 'EN_BASE', 'EN_CAMINO', 'EN_SERVICIO')),
        desde DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_disp_desde DEFAULT SYSDATETIMEOFFSET(),
        solicitud_id UNIQUEIDENTIFIER NULL,
        usa_horario BIT NOT NULL CONSTRAINT DF_disp_usahorario DEFAULT 0,
        temporal_hasta DATETIMEOFFSET(3) NULL,
        ultima_actividad DATETIMEOFFSET(3) NULL,
        version INT NOT NULL CONSTRAINT DF_disp_version DEFAULT 0,
        actualizado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_disp_actualizado DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT UQ_disp_usuario UNIQUE (usuario_id),
        CONSTRAINT FK_disp_usuario FOREIGN KEY (usuario_id) REFERENCES seguridad.usuarios(id)
    );
END
GO

IF OBJECT_ID('servicios.disponibilidad_horarios', 'U') IS NULL
BEGIN
    CREATE TABLE servicios.disponibilidad_horarios (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_disph_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_disponibilidad_horarios PRIMARY KEY,
        usuario_id UNIQUEIDENTIFIER NOT NULL,
        dia_semana TINYINT NOT NULL CONSTRAINT CK_disph_dia CHECK (dia_semana BETWEEN 1 AND 7), /* 1 = lunes */
        hora_desde TIME(0) NOT NULL,
        hora_hasta TIME(0) NOT NULL,
        creado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_disph_creado DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT FK_disph_usuario FOREIGN KEY (usuario_id) REFERENCES seguridad.usuarios(id)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_disph_usuario' AND object_id = OBJECT_ID('servicios.disponibilidad_horarios'))
    CREATE INDEX IX_disph_usuario ON servicios.disponibilidad_horarios (usuario_id, dia_semana);
GO

IF OBJECT_ID('servicios.disponibilidad_excepciones', 'U') IS NULL
BEGIN
    CREATE TABLE servicios.disponibilidad_excepciones (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_dispe_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_disponibilidad_excepciones PRIMARY KEY,
        usuario_id UNIQUEIDENTIFIER NOT NULL,
        fecha_desde DATE NOT NULL,
        fecha_hasta DATE NOT NULL,
        disponible BIT NOT NULL,
        hora_desde TIME(0) NULL,
        hora_hasta TIME(0) NULL,
        motivo NVARCHAR(200) NULL,
        creado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_dispe_creado DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT CK_dispe_rango CHECK (fecha_hasta >= fecha_desde),
        CONSTRAINT FK_dispe_usuario FOREIGN KEY (usuario_id) REFERENCES seguridad.usuarios(id)
    );
END
GO

/* --- 2) Solicitudes de despacho --- */
IF OBJECT_ID('servicios.solicitudes_despacho', 'U') IS NULL
BEGIN
    CREATE TABLE servicios.solicitudes_despacho (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_sold_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_solicitudes_despacho PRIMARY KEY,
        tipo NVARCHAR(20) NOT NULL CONSTRAINT CK_sold_tipo CHECK (tipo IN ('CHOFER', 'PERSONAL', 'RAPIDA')),
        servicio_id UNIQUEIDENTIFIER NULL,
        llamado_id UNIQUEIDENTIFIER NULL,
        mensaje NVARCHAR(300) NULL,
        estado NVARCHAR(20) NOT NULL CONSTRAINT DF_sold_estado DEFAULT 'ABIERTA'
            CONSTRAINT CK_sold_estado CHECK (estado IN ('ABIERTA', 'CERRADA', 'CANCELADA')),
        requeridos INT NULL,
        creada_por UNIQUEIDENTIFIER NOT NULL,
        creada_por_nombre NVARCHAR(120) NOT NULL,
        creado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_sold_creado DEFAULT SYSDATETIMEOFFSET(),
        cerrada_en DATETIMEOFFSET(3) NULL,
        cerrada_por UNIQUEIDENTIFIER NULL,
        motivo_cierre NVARCHAR(300) NULL,
        clave_idempotencia NVARCHAR(64) NULL,
        CONSTRAINT FK_sold_servicio FOREIGN KEY (servicio_id) REFERENCES servicios.servicios(id),
        CONSTRAINT FK_sold_llamado FOREIGN KEY (llamado_id) REFERENCES servicios.llamados(id),
        CONSTRAINT FK_sold_creadapor FOREIGN KEY (creada_por) REFERENCES seguridad.usuarios(id)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_sold_estado_creado' AND object_id = OBJECT_ID('servicios.solicitudes_despacho'))
    CREATE INDEX IX_sold_estado_creado ON servicios.solicitudes_despacho (estado, creado_en DESC);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_sold_idempotencia' AND object_id = OBJECT_ID('servicios.solicitudes_despacho'))
    CREATE UNIQUE INDEX UX_sold_idempotencia ON servicios.solicitudes_despacho (clave_idempotencia) WHERE clave_idempotencia IS NOT NULL;
GO

IF OBJECT_ID('servicios.solicitud_moviles', 'U') IS NULL
BEGIN
    CREATE TABLE servicios.solicitud_moviles (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_solm_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_solicitud_moviles PRIMARY KEY,
        solicitud_id UNIQUEIDENTIFIER NOT NULL,
        vehiculo_id UNIQUEIDENTIFIER NOT NULL,
        CONSTRAINT UQ_solm UNIQUE (solicitud_id, vehiculo_id),
        CONSTRAINT FK_solm_solicitud FOREIGN KEY (solicitud_id) REFERENCES servicios.solicitudes_despacho(id),
        CONSTRAINT FK_solm_vehiculo FOREIGN KEY (vehiculo_id) REFERENCES vehiculos.vehiculos(id)
    );
END
GO

/* Un destinatario por persona. "entrega" y "estado" son ejes distintos y no se mezclan:
   entrega  = que paso al enviar (ENVIADA, SIN_CONEXION, NO_DISPONIBLE, FUERA_DE_HORARIO, EN_SERVICIO)
   estado   = que hizo la persona (PENDIENTE, ACEPTO, NO_PUEDE, CANCELO, EN_CAMINO, LLEGO) */
IF OBJECT_ID('servicios.solicitud_destinatarios', 'U') IS NULL
BEGIN
    CREATE TABLE servicios.solicitud_destinatarios (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_sold_dest_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_solicitud_destinatarios PRIMARY KEY,
        solicitud_id UNIQUEIDENTIFIER NOT NULL,
        usuario_id UNIQUEIDENTIFIER NOT NULL,
        usuario_nombre NVARCHAR(120) NOT NULL,
        entrega NVARCHAR(20) NOT NULL
            CONSTRAINT CK_dest_entrega CHECK (entrega IN ('ENVIADA', 'SIN_CONEXION', 'NO_DISPONIBLE', 'FUERA_DE_HORARIO', 'EN_SERVICIO')),
        enviada_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_dest_enviada DEFAULT SYSDATETIMEOFFSET(),
        recibida_en DATETIMEOFFSET(3) NULL,
        visto_tarde_en DATETIMEOFFSET(3) NULL,
        estado NVARCHAR(20) NOT NULL CONSTRAINT DF_dest_estado DEFAULT 'PENDIENTE'
            CONSTRAINT CK_dest_estado CHECK (estado IN ('PENDIENTE', 'ACEPTO', 'NO_PUEDE', 'CANCELO', 'EN_CAMINO', 'LLEGO')),
        respondido_en DATETIMEOFFSET(3) NULL,
        aceptada_en DATETIMEOFFSET(3) NULL,
        en_camino_en DATETIMEOFFSET(3) NULL,
        llego_en DATETIMEOFFSET(3) NULL,
        cancelada_en DATETIMEOFFSET(3) NULL,
        motivo NVARCHAR(200) NULL,
        ampliacion BIT NOT NULL CONSTRAINT DF_dest_ampliacion DEFAULT 0,
        version INT NOT NULL CONSTRAINT DF_dest_version DEFAULT 0,
        CONSTRAINT UQ_dest UNIQUE (solicitud_id, usuario_id),
        CONSTRAINT FK_dest_solicitud FOREIGN KEY (solicitud_id) REFERENCES servicios.solicitudes_despacho(id),
        CONSTRAINT FK_dest_usuario FOREIGN KEY (usuario_id) REFERENCES seguridad.usuarios(id)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_dest_usuario_estado' AND object_id = OBJECT_ID('servicios.solicitud_destinatarios'))
    CREATE INDEX IX_dest_usuario_estado ON servicios.solicitud_destinatarios (usuario_id, estado);
GO

/* --- 3) Linea de tiempo inmutable --- */
IF OBJECT_ID('servicios.solicitud_eventos', 'U') IS NULL
BEGIN
    CREATE TABLE servicios.solicitud_eventos (
        id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_solicitud_eventos PRIMARY KEY,
        solicitud_id UNIQUEIDENTIFIER NOT NULL,
        actor_id UNIQUEIDENTIFIER NULL,
        actor_nombre NVARCHAR(120) NULL,
        destinatario_id UNIQUEIDENTIFIER NULL,
        tipo NVARCHAR(40) NOT NULL,
        detalle NVARCHAR(MAX) NULL,
        ocurrido_en DATETIMEOFFSET(3) NOT NULL,
        registrado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_sole_registrado DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT FK_sole_solicitud FOREIGN KEY (solicitud_id) REFERENCES servicios.solicitudes_despacho(id)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_sole_solicitud' AND object_id = OBJECT_ID('servicios.solicitud_eventos'))
    CREATE INDEX IX_sole_solicitud ON servicios.solicitud_eventos (solicitud_id, ocurrido_en, id);
GO

/* La linea de tiempo es auditoria: nadie la edita ni la borra, tampoco por SQL ad hoc. */
IF NOT EXISTS (SELECT 1 FROM sys.triggers WHERE name = 'TR_solicitud_eventos_inmutable')
    EXEC('CREATE TRIGGER servicios.TR_solicitud_eventos_inmutable ON servicios.solicitud_eventos
          INSTEAD OF UPDATE, DELETE
          AS
          BEGIN
              THROW 51088, N''La linea de tiempo de una solicitud es inmutable: no se puede modificar ni borrar.'', 1;
          END');
GO

/* --- 4) Permisos --- */
INSERT INTO seguridad.permisos (nombre, recurso, accion, categoria)
SELECT v.nombre, v.recurso, v.accion, v.categoria
FROM (VALUES
    (N'despacho:responder', N'despacho', N'responder', N'Servicios'),
    (N'despacho:solicitar', N'despacho', N'solicitar', N'Servicios'),
    (N'despacho:seguimiento', N'despacho', N'seguimiento', N'Servicios')
) AS v(nombre, recurso, accion, categoria)
WHERE NOT EXISTS (SELECT 1 FROM seguridad.permisos p WHERE p.nombre = v.nombre);
GO

/* responder: todos los roles (cualquier persona del cuartel puede recibir y contestar) */
INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id
FROM seguridad.roles r
CROSS JOIN seguridad.permisos p
WHERE p.nombre = N'despacho:responder'
    AND NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol a WHERE a.rol_id = r.id AND a.permiso_id = p.id);
GO

/* solicitar y seguimiento: quien ya puede convocar o despachar, mas el Administrador General */
INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT DISTINCT a.rol_id, nuevo.id
FROM seguridad.asignacion_permisos_rol a
JOIN seguridad.permisos o ON o.id = a.permiso_id AND o.nombre IN (N'servicios:convocar', N'servicios:despachar')
CROSS JOIN seguridad.permisos nuevo
WHERE nuevo.nombre IN (N'despacho:solicitar', N'despacho:seguimiento')
    AND NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol x WHERE x.rol_id = a.rol_id AND x.permiso_id = nuevo.id);
GO

INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id FROM seguridad.roles r CROSS JOIN seguridad.permisos p
WHERE r.nombre = N'Administrador General' AND p.nombre IN (N'despacho:solicitar', N'despacho:seguimiento')
    AND NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol a WHERE a.rol_id = r.id AND a.permiso_id = p.id);
GO
