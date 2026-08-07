/* =============================================================
   SIGBO-CBVC | Migracion 002 - Esquema seguridad (corazon del sistema)
   Las claves foraneas se declaran en 010_foreign_keys.sql
   ============================================================= */

/* TABLA: usuarios */
CREATE TABLE seguridad.usuarios (
    id                  UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_usuarios_id DEFAULT NEWSEQUENTIALID(),
    bombero_id          UNIQUEIDENTIFIER NULL,
    email               NVARCHAR(255)    NOT NULL,
    username            NVARCHAR(100)    NOT NULL,
    password_hash       NVARCHAR(255)    NOT NULL,
    salt                NVARCHAR(64)     NOT NULL,
    two_factor_secret   NVARCHAR(255)    NULL,
    two_factor_enabled  BIT              NOT NULL CONSTRAINT DF_usuarios_2fa DEFAULT 0,
    avatar_url          NVARCHAR(MAX)    NULL,
    idioma              NVARCHAR(10)     NOT NULL CONSTRAINT DF_usuarios_idioma DEFAULT 'es',
    zona_horaria        NVARCHAR(50)     NOT NULL CONSTRAINT DF_usuarios_tz DEFAULT 'America/Asuncion',
    ultimo_acceso       DATETIMEOFFSET(3) NULL,
    ip_ultimo_acceso    VARCHAR(45)      NULL,
    user_agent          NVARCHAR(MAX)    NULL,
    intentos_fallidos   INT              NOT NULL CONSTRAINT DF_usuarios_intentos DEFAULT 0,
    bloqueado_hasta     DATETIMEOFFSET(3) NULL,
    estado              NVARCHAR(30)     NOT NULL CONSTRAINT DF_usuarios_estado DEFAULT 'ACTIVO',
    creado_en           DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_usuarios_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en      DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_usuarios_actualizado DEFAULT SYSDATETIMEOFFSET(),
    creado_por          UNIQUEIDENTIFIER NULL,
    CONSTRAINT PK_usuarios PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_usuarios_email    UNIQUE (email),
    CONSTRAINT UQ_usuarios_username UNIQUE (username),
    CONSTRAINT CK_usuarios_estado CHECK (estado IN ('ACTIVO','INACTIVO','BLOQUEADO','PENDIENTE_VERIFICACION'))
);
GO

/* TABLA: roles (dinamicos, creados por administradores) */
CREATE TABLE seguridad.roles (
    id                UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_roles_id DEFAULT NEWSEQUENTIALID(),
    nombre            NVARCHAR(100)    NOT NULL,
    descripcion       NVARCHAR(MAX)    NULL,
    color             NVARCHAR(7)      NOT NULL CONSTRAINT DF_roles_color DEFAULT '#6B7280',
    icono             NVARCHAR(50)     NULL,
    prioridad         INT              NOT NULL CONSTRAINT DF_roles_prioridad DEFAULT 0,
    jerarquia         INT              NOT NULL CONSTRAINT DF_roles_jerarquia DEFAULT 0,
    es_administrativo BIT              NOT NULL CONSTRAINT DF_roles_admin DEFAULT 0,
    es_operativo      BIT              NOT NULL CONSTRAINT DF_roles_oper DEFAULT 1,
    es_predeterminado BIT              NOT NULL CONSTRAINT DF_roles_pred DEFAULT 0,
    es_sistema        BIT              NOT NULL CONSTRAINT DF_roles_sistema DEFAULT 0,
    metadata          NVARCHAR(MAX)    NULL,
    creado_en         DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_roles_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en    DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_roles_actualizado DEFAULT SYSDATETIMEOFFSET(),
    creado_por        UNIQUEIDENTIFIER NULL,
    CONSTRAINT PK_roles PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_roles_nombre UNIQUE (nombre),
    CONSTRAINT CK_roles_metadata CHECK (metadata IS NULL OR ISJSON(metadata) = 1)
);
GO

/* TABLA: permisos */
CREATE TABLE seguridad.permisos (
    id             UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_permisos_id DEFAULT NEWSEQUENTIALID(),
    nombre         NVARCHAR(100)    NOT NULL,   -- ej: personal:crear
    descripcion    NVARCHAR(MAX)    NULL,
    recurso        NVARCHAR(50)     NOT NULL,
    accion         NVARCHAR(50)     NOT NULL,
    categoria      NVARCHAR(50)     NULL,
    es_sistema     BIT              NOT NULL CONSTRAINT DF_permisos_sistema DEFAULT 0,
    metadata       NVARCHAR(MAX)    NULL,
    creado_en      DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_permisos_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_permisos_actualizado DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_permisos PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_permisos_nombre UNIQUE (nombre),
    CONSTRAINT CK_permisos_metadata CHECK (metadata IS NULL OR ISJSON(metadata) = 1)
);
GO

/* TABLA: asignacion_roles (usuario -> rol) */
CREATE TABLE seguridad.asignacion_roles (
    id                UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_asigrol_id DEFAULT NEWSEQUENTIALID(),
    usuario_id        UNIQUEIDENTIFIER NOT NULL,
    rol_id            UNIQUEIDENTIFIER NOT NULL,
    fecha_asignacion  DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_asigrol_fecha DEFAULT SYSDATETIMEOFFSET(),
    fecha_expiracion  DATETIMEOFFSET(3) NULL,   -- NULL = permanente
    asignado_por      UNIQUEIDENTIFIER NULL,
    motivo            NVARCHAR(MAX)    NULL,
    CONSTRAINT PK_asignacion_roles PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_asignacion_roles UNIQUE (usuario_id, rol_id)
);
GO

/* TABLA: asignacion_permisos_directos (usuario -> permiso, sobrescribe roles) */
CREATE TABLE seguridad.asignacion_permisos_directos (
    id               UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_asigpermdir_id DEFAULT NEWSEQUENTIALID(),
    usuario_id       UNIQUEIDENTIFIER NOT NULL,
    permiso_id       UNIQUEIDENTIFIER NOT NULL,
    concedido        BIT              NOT NULL CONSTRAINT DF_asigpermdir_conc DEFAULT 1, -- 0 = denegacion explicita
    fecha_asignacion DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_asigpermdir_fecha DEFAULT SYSDATETIMEOFFSET(),
    asignado_por     UNIQUEIDENTIFIER NULL,
    motivo           NVARCHAR(MAX)    NULL,
    CONSTRAINT PK_asignacion_permisos_directos PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_asignacion_permisos_directos UNIQUE (usuario_id, permiso_id)
);
GO

/* TABLA: asignacion_permisos_rol (rol -> permiso) */
CREATE TABLE seguridad.asignacion_permisos_rol (
    id               UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_asigpermrol_id DEFAULT NEWSEQUENTIALID(),
    rol_id           UNIQUEIDENTIFIER NOT NULL,
    permiso_id       UNIQUEIDENTIFIER NOT NULL,
    fecha_asignacion DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_asigpermrol_fecha DEFAULT SYSDATETIMEOFFSET(),
    asignado_por     UNIQUEIDENTIFIER NULL,
    CONSTRAINT PK_asignacion_permisos_rol PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_asignacion_permisos_rol UNIQUE (rol_id, permiso_id)
);
GO

/* TABLA: restricciones (reglas sobre permisos, ej: solo su cuartel) */
CREATE TABLE seguridad.restricciones (
    id          UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_restric_id DEFAULT NEWSEQUENTIALID(),
    permiso_id  UNIQUEIDENTIFIER NOT NULL,
    nombre      NVARCHAR(100)    NOT NULL,
    descripcion NVARCHAR(MAX)    NULL,
    tipo        NVARCHAR(50)     NOT NULL,
    condicion   NVARCHAR(MAX)    NOT NULL,
    prioridad   INT              NOT NULL CONSTRAINT DF_restric_prioridad DEFAULT 0,
    activo      BIT              NOT NULL CONSTRAINT DF_restric_activo DEFAULT 1,
    creado_en   DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_restric_creado DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_restricciones PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_restricciones_tipo CHECK (tipo IN ('campo','recurso','tiempo','ubicacion','custom')),
    CONSTRAINT CK_restricciones_condicion CHECK (ISJSON(condicion) = 1)
);
GO

/* TABLA: sesiones */
CREATE TABLE seguridad.sesiones (
    id                     UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_sesiones_id DEFAULT NEWSEQUENTIALID(),
    usuario_id             UNIQUEIDENTIFIER NOT NULL,
    refresh_token_hash     NVARCHAR(255)    NOT NULL,
    ip                     VARCHAR(45)      NULL,
    user_agent             NVARCHAR(MAX)    NULL,
    dispositivo            NVARCHAR(100)    NULL,
    fecha_inicio           DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_sesiones_inicio DEFAULT SYSDATETIMEOFFSET(),
    fecha_expiracion       DATETIMEOFFSET(3) NULL,
    fecha_ultima_actividad DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_sesiones_act DEFAULT SYSDATETIMEOFFSET(),
    activa                 BIT              NOT NULL CONSTRAINT DF_sesiones_activa DEFAULT 1,
    session_data           NVARCHAR(MAX)    NULL,
    CONSTRAINT PK_sesiones PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_sesiones_data CHECK (session_data IS NULL OR ISJSON(session_data) = 1)
);
GO

/* TABLA: logs_auditoria (trazabilidad completa) */
CREATE TABLE seguridad.logs_auditoria (
    id             BIGINT IDENTITY(1,1) NOT NULL,
    usuario_id     UNIQUEIDENTIFIER NULL,
    accion         NVARCHAR(100)    NOT NULL,
    recurso        NVARCHAR(100)    NOT NULL,
    recurso_id     UNIQUEIDENTIFIER NULL,
    ip             VARCHAR(45)      NULL,
    user_agent     NVARCHAR(MAX)    NULL,
    datos_antes    NVARCHAR(MAX)    NULL,
    datos_despues  NVARCHAR(MAX)    NULL,
    metadata       NVARCHAR(MAX)    NULL,
    fecha          DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_logs_fecha DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_logs_auditoria PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_logs_antes    CHECK (datos_antes   IS NULL OR ISJSON(datos_antes) = 1),
    CONSTRAINT CK_logs_despues  CHECK (datos_despues IS NULL OR ISJSON(datos_despues) = 1),
    CONSTRAINT CK_logs_metadata CHECK (metadata      IS NULL OR ISJSON(metadata) = 1)
);
GO
