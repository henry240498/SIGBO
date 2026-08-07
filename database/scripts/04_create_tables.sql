/*
============================================================================
 04_create_tables.sql
 SIGBO-CBVC — Creacion de tablas (59 tablas / 11 esquemas)
============================================================================
 Fuente unica de esta reconstruccion: "SIGBO-CBVC_Documentacion_Sistema_
 2026-08-04.docx", seccion 6 "Diccionario de Datos". NO se tuvo acceso a
 los archivos .sql de migracion originales (000..015) ni a las entidades
 TypeORM; todo tipo/longitud/default/constraint de este script proviene
 de lo documentado en ese diccionario de datos. Ver REPORTE_REPLICACION.md
 seccion 10 "Informacion faltante" para las limitaciones de esta fuente.

 Convenciones aplicadas de forma consistente en TODO el sistema (evidencia
 documental, seccion 2.2 "Patrones de Diseno Clave"):
   - PK = UNIQUEIDENTIFIER DEFAULT NEWSEQUENTIALID(), excepto
     seguridad.logs_auditoria (BIGINT IDENTITY(1,1), tabla de alto volumen).
   - Fechas/horas = DATETIMEOFFSET(3) DEFAULT SYSDATETIMEOFFSET().
   - JSON almacenado como NVARCHAR(MAX) + CHECK (ISJSON(col) = 1) (SQL
     Server no tiene tipo JSON nativo).
   - Baja logica: columnas estado + eliminado_en; el sistema NUNCA hace
     DELETE fisico sobre catalogos (documentado explicitamente en
     organizacion.* y patron general del sistema).
   - Auditoria: creado_en/actualizado_en/creado_por/actualizado_por.

 Este script define columnas, PRIMARY KEY, DEFAULT, CHECK y UNIQUE de
 forma INLINE (replicando el patron observado en las migraciones
 002_seguridad.sql .. 008_admin.sql, 012_organizacion.sql). Las FOREIGN
 KEY se agregan por separado en 06_create_constraints.sql (replicando el
 patron observado de 009_foreign_keys.sql: FKs agregadas via ALTER TABLE
 posterior a la creacion de todas las tablas).

 IMPORTANTE sobre nombres de constraint: se usan los nombres EXACTOS
 documentados en el diccionario de datos cuando estan explicitados
 (ej. CONSTRAINT PK_ascensos, DF_ascenso_id). Donde el documento no da un
 nombre literal (esto ocurre sobre todo en varias tablas del esquema
 seguridad, documentadas de forma mas resumida que organizacion/personal),
 se generó un nombre siguiendo la MISMA convencion que el documento
 describe explicitamente como usada en todo el proyecto ("Convencion de
 nombres de constraints: DF_ para DEFAULT, CK_ para CHECK, UQ_ para
 UNIQUE, PK_ para PRIMARY KEY") — estos casos son una INFERENCIA por
 convencion, no un nombre verificado literalmente, y se marcan con el
 comentario "-- nombre inferido por convencion" junto a la linea.
============================================================================
*/

USE sigbo_cbvc;
GO

/* ==========================================================================
   ESQUEMA: seguridad  (13 tablas)
   Fuente de la mayoria de estas tablas: 002_seguridad.sql (documentado
   como creador del nucleo RBAC), con columnas agregadas posteriormente por
   ALTER TABLE en 011 (roles.activo, usuarios.debe_cambiar_password,
   usuarios.password_expira_en), 013/014 (configuracion_sistema) y 015
   (usuarios.whatsapp/facebook_url/instagram_url/x_url,
   usuario_telefonos, usuario_correos). Este script construye el ESTADO
   FINAL de cada tabla (no repite los pasos intermedios de rename/ALTER).
   ========================================================================== */

-- seguridad.usuarios
-- NOTA: tabla documentada como preexistente respecto de las migraciones
-- 011-015 revisadas; el diccionario de datos (seccion 6) enumera 26
-- columnas que se toman aqui como el set completo conocido. No se
-- descarta que existan columnas adicionales no relevadas (ver seccion 10
-- "Informacion faltante").
CREATE TABLE seguridad.usuarios (
    id                      UNIQUEIDENTIFIER   NOT NULL CONSTRAINT DF_usuarios_id DEFAULT NEWSEQUENTIALID(),
    bombero_id              UNIQUEIDENTIFIER   NULL,
    email                   NVARCHAR(255)      NOT NULL,
    username                NVARCHAR(100)      NOT NULL,
    password_hash           NVARCHAR(255)      NOT NULL,
    salt                    NVARCHAR(64)       NOT NULL,
    two_factor_secret       NVARCHAR(255)      NULL,
    two_factor_enabled      BIT                NOT NULL CONSTRAINT DF_usuarios_2fa DEFAULT 0,
    avatar_url              NVARCHAR(MAX)      NULL,
    idioma                  NVARCHAR(10)       NOT NULL CONSTRAINT DF_usuarios_idioma DEFAULT N'es',
    zona_horaria            NVARCHAR(50)       NOT NULL CONSTRAINT DF_usuarios_zonahoraria DEFAULT N'America/Asuncion',
    ultimo_acceso           DATETIMEOFFSET(3)  NULL,
    ip_ultimo_acceso        VARCHAR(45)        NULL,
    user_agent              NVARCHAR(MAX)      NULL,
    intentos_fallidos       INT                NOT NULL CONSTRAINT DF_usuarios_intentos DEFAULT 0,
    bloqueado_hasta         DATETIMEOFFSET(3)  NULL,
    estado                  NVARCHAR(30)       NOT NULL CONSTRAINT DF_usuarios_estado DEFAULT N'ACTIVO',
    creado_en               DATETIMEOFFSET(3)  NOT NULL CONSTRAINT DF_usuarios_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en          DATETIMEOFFSET(3)  NOT NULL CONSTRAINT DF_usuarios_act DEFAULT SYSDATETIMEOFFSET(),
    creado_por              UNIQUEIDENTIFIER   NULL,
    debe_cambiar_password   BIT                NOT NULL CONSTRAINT DF_usuarios_debe_cambiar DEFAULT 0,
    password_expira_en      DATETIMEOFFSET(3)  NULL,
    whatsapp                NVARCHAR(30)       NULL,
    facebook_url            NVARCHAR(500)      NULL,
    instagram_url           NVARCHAR(500)      NULL,
    x_url                   NVARCHAR(500)      NULL,
    CONSTRAINT PK_usuarios PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_usuarios_email UNIQUE (email),
    CONSTRAINT UQ_usuarios_username UNIQUE (username),
    CONSTRAINT CK_usuarios_estado CHECK (estado IN ('ACTIVO','INACTIVO','BLOQUEADO','PENDIENTE_VERIFICACION'))
);
GO

-- seguridad.roles
CREATE TABLE seguridad.roles (
    id                  UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_roles_id DEFAULT NEWSEQUENTIALID(),
    nombre              NVARCHAR(100)     NOT NULL,
    descripcion         NVARCHAR(MAX)     NULL,
    color               NVARCHAR(7)       NOT NULL CONSTRAINT DF_roles_color DEFAULT N'#6B7280',
    icono               NVARCHAR(50)      NULL,
    prioridad           INT               NOT NULL CONSTRAINT DF_roles_prioridad DEFAULT 0,
    jerarquia           INT               NOT NULL CONSTRAINT DF_roles_jerarquia DEFAULT 0,
    es_administrativo   BIT               NOT NULL CONSTRAINT DF_roles_esadmin DEFAULT 0,
    es_operativo        BIT               NOT NULL CONSTRAINT DF_roles_esoperativo DEFAULT 1,
    es_predeterminado   BIT               NOT NULL CONSTRAINT DF_roles_espredet DEFAULT 0,
    es_sistema          BIT               NOT NULL CONSTRAINT DF_roles_essistema DEFAULT 0,
    metadata            NVARCHAR(MAX)     NULL,
    creado_en           DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_roles_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en      DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_roles_act DEFAULT SYSDATETIMEOFFSET(),
    creado_por          UNIQUEIDENTIFIER  NULL,
    activo              BIT               NOT NULL CONSTRAINT DF_roles_activo DEFAULT 1, -- agregada por ALTER TABLE en migracion 011
    CONSTRAINT PK_roles PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_roles_nombre UNIQUE (nombre),
    CONSTRAINT CK_roles_metadata CHECK (metadata IS NULL OR ISJSON(metadata) = 1)
);
GO

-- seguridad.permisos
CREATE TABLE seguridad.permisos (
    id             UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_permisos_id DEFAULT NEWSEQUENTIALID(),
    nombre         NVARCHAR(100)     NOT NULL,
    descripcion    NVARCHAR(MAX)     NULL,
    recurso        NVARCHAR(50)      NOT NULL,
    accion         NVARCHAR(50)      NOT NULL,
    categoria      NVARCHAR(50)      NULL,
    es_sistema     BIT               NOT NULL CONSTRAINT DF_permisos_essistema DEFAULT 0,
    metadata       NVARCHAR(MAX)     NULL,
    creado_en      DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_permisos_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_permisos_act DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_permisos PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_permisos_nombre UNIQUE (nombre), -- formato tipico 'recurso:accion'
    CONSTRAINT CK_permisos_metadata CHECK (metadata IS NULL OR ISJSON(metadata) = 1)
);
GO

-- seguridad.restricciones (reglas ABAC adicionales sobre un permiso)
CREATE TABLE seguridad.restricciones (
    id           UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_restricciones_id DEFAULT NEWSEQUENTIALID(),
    permiso_id   UNIQUEIDENTIFIER  NOT NULL,
    nombre       NVARCHAR(100)     NOT NULL,
    descripcion  NVARCHAR(MAX)     NULL,
    tipo         NVARCHAR(50)      NOT NULL,
    condicion    NVARCHAR(MAX)     NOT NULL,
    prioridad    INT               NOT NULL CONSTRAINT DF_restricciones_prioridad DEFAULT 0,
    activo       BIT               NOT NULL CONSTRAINT DF_restricciones_activo DEFAULT 1,
    creado_en    DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_restricciones_creado DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_restricciones PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_restricciones_tipo CHECK (tipo IN ('campo','recurso','tiempo','ubicacion','custom')),
    CONSTRAINT CK_restricciones_condicion CHECK (ISJSON(condicion) = 1)
);
GO

-- seguridad.asignacion_roles (usuario <-> rol, con vigencia opcional)
CREATE TABLE seguridad.asignacion_roles (
    id                UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_asigrol_id DEFAULT NEWSEQUENTIALID(),
    usuario_id        UNIQUEIDENTIFIER  NOT NULL,
    rol_id            UNIQUEIDENTIFIER  NOT NULL,
    fecha_asignacion  DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_asigrol_fecha DEFAULT SYSDATETIMEOFFSET(),
    fecha_expiracion  DATETIMEOFFSET(3) NULL, -- NULL = asignacion permanente
    asignado_por      UNIQUEIDENTIFIER  NULL,
    motivo            NVARCHAR(MAX)     NULL,
    CONSTRAINT PK_asignacion_roles PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_asignacion_roles UNIQUE (usuario_id, rol_id)
);
GO

-- seguridad.asignacion_permisos_rol (rol <-> permiso)
CREATE TABLE seguridad.asignacion_permisos_rol (
    id                UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_asigpermrol_id DEFAULT NEWSEQUENTIALID(),
    rol_id            UNIQUEIDENTIFIER  NOT NULL,
    permiso_id        UNIQUEIDENTIFIER  NOT NULL,
    fecha_asignacion  DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_asigpermrol_fecha DEFAULT SYSDATETIMEOFFSET(),
    asignado_por      UNIQUEIDENTIFIER  NULL,
    CONSTRAINT PK_asignacion_permisos_rol PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_asignacion_permisos_rol UNIQUE (rol_id, permiso_id)
);
GO

-- seguridad.asignacion_permisos_directos (usuario <-> permiso, con prioridad sobre el rol)
CREATE TABLE seguridad.asignacion_permisos_directos (
    id                UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_asigpermdir_id DEFAULT NEWSEQUENTIALID(),
    usuario_id        UNIQUEIDENTIFIER  NOT NULL,
    permiso_id        UNIQUEIDENTIFIER  NOT NULL,
    concedido         BIT               NOT NULL CONSTRAINT DF_asigpermdir_concedido DEFAULT 1, -- 0 = denegacion explicita (override negativo)
    fecha_asignacion  DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_asigpermdir_fecha DEFAULT SYSDATETIMEOFFSET(),
    asignado_por      UNIQUEIDENTIFIER  NULL,
    motivo            NVARCHAR(MAX)     NULL,
    CONSTRAINT PK_asignacion_permisos_directos PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_asignacion_permisos_directos UNIQUE (usuario_id, permiso_id)
);
GO

-- seguridad.sesiones (refresh tokens activos/historicos)
CREATE TABLE seguridad.sesiones (
    id                       UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_sesiones_id DEFAULT NEWSEQUENTIALID(),
    usuario_id               UNIQUEIDENTIFIER  NOT NULL,
    refresh_token_hash       NVARCHAR(255)     NOT NULL,
    ip                       VARCHAR(45)       NULL, -- longitud 45 soporta IPv6
    user_agent               NVARCHAR(MAX)     NULL,
    dispositivo              NVARCHAR(100)     NULL,
    fecha_inicio             DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_sesiones_inicio DEFAULT SYSDATETIMEOFFSET(),
    fecha_expiracion         DATETIMEOFFSET(3) NULL,
    fecha_ultima_actividad   DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_sesiones_ultact DEFAULT SYSDATETIMEOFFSET(),
    activa                   BIT               NOT NULL CONSTRAINT DF_sesiones_activa DEFAULT 1,
    session_data             NVARCHAR(MAX)     NULL,
    CONSTRAINT PK_sesiones PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_sesiones_data CHECK (session_data IS NULL OR ISJSON(session_data) = 1)
);
GO

-- seguridad.logs_auditoria (bitacora de alto volumen; PK numerica en vez de GUID)
CREATE TABLE seguridad.logs_auditoria (
    id             BIGINT             NOT NULL IDENTITY(1,1),
    usuario_id     UNIQUEIDENTIFIER   NULL, -- NULL posible para acciones del sistema sin usuario
    accion         NVARCHAR(100)      NOT NULL,
    recurso        NVARCHAR(100)      NOT NULL, -- nombre de la entidad/tabla afectada
    recurso_id     UNIQUEIDENTIFIER   NULL, -- referencia polimorfica, sin FK fisica
    ip             VARCHAR(45)        NULL,
    user_agent     NVARCHAR(MAX)      NULL,
    datos_antes    NVARCHAR(MAX)      NULL, -- snapshot JSON previo al cambio
    datos_despues  NVARCHAR(MAX)      NULL, -- snapshot JSON posterior al cambio
    metadata       NVARCHAR(MAX)      NULL,
    fecha          DATETIMEOFFSET(3)  NOT NULL CONSTRAINT DF_logs_fecha DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_logs_auditoria PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_logs_antes CHECK (datos_antes IS NULL OR ISJSON(datos_antes) = 1),
    CONSTRAINT CK_logs_despues CHECK (datos_despues IS NULL OR ISJSON(datos_despues) = 1),
    CONSTRAINT CK_logs_metadata CHECK (metadata IS NULL OR ISJSON(metadata) = 1)
);
GO

-- seguridad.historial_contrasenas
CREATE TABLE seguridad.historial_contrasenas (
    id             UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_histpass_id DEFAULT NEWSEQUENTIALID(),
    usuario_id     UNIQUEIDENTIFIER  NOT NULL,
    password_hash  NVARCHAR(255)     NOT NULL,
    creado_en      DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_histpass_creado DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_historial_contrasenas PRIMARY KEY CLUSTERED (id)
);
GO

-- seguridad.configuracion_sistema (fila UNICA / singleton; nunca se hace INSERT nuevo, solo UPDATE)
-- Nombre de tabla y de constraints conserva el nombre original de la
-- migracion 013 (configuracion_apariencia); fue renombrada a
-- configuracion_sistema en la migracion 014 via sp_rename, que NO renombra
-- los constraints existentes (documentado explicitamente en la fuente).
CREATE TABLE seguridad.configuracion_sistema (
    id                     UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_configap_id DEFAULT NEWSEQUENTIALID(),
    logo_login             NVARCHAR(MAX)     NULL, -- antes 'logo_url', sembrado con '/logo-cbvc.png'
    fondo_login            NVARCHAR(MAX)     NULL, -- antes 'fondo_url'
    texto_bajo_logo        NVARCHAR(200)     NULL, -- antes 'texto_debajo_logo'; reemplaza al booleano 'mostrar_texto' (eliminado en 014)
    actualizado_en         DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_configap_act DEFAULT SYSDATETIMEOFFSET(),
    actualizado_por        UNIQUEIDENTIFIER  NULL,
    nombre_sistema_menu    NVARCHAR(100)     NULL, -- agregada en 014, sembrada con 'SIGBO-CBVC'
    subtitulo_menu         NVARCHAR(200)     NULL, -- agregada en 014, sembrada con 'Panel principal'
    logo_menu              NVARCHAR(500)     NULL, -- agregada en 014
    perfil_edicion_libre   BIT               NOT NULL CONSTRAINT DF_configsis_perfillibre DEFAULT 1, -- agregada en 015
    CONSTRAINT PK_configuracion_apariencia PRIMARY KEY CLUSTERED (id)
);
GO

-- seguridad.usuario_correos (lista dinamica 1-a-muchos; introducida en migracion 015)
CREATE TABLE seguridad.usuario_correos (
    id          UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_usercorreo_id DEFAULT NEWSEQUENTIALID(),
    usuario_id  UNIQUEIDENTIFIER  NOT NULL,
    correo      NVARCHAR(255)     NOT NULL,
    etiqueta    NVARCHAR(50)      NULL,
    creado_en   DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_usercorreo_creado DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_usuario_correos PRIMARY KEY CLUSTERED (id)
);
GO

-- seguridad.usuario_telefonos (lista dinamica 1-a-muchos; introducida en migracion 015)
CREATE TABLE seguridad.usuario_telefonos (
    id          UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_usertel_id DEFAULT NEWSEQUENTIALID(),
    usuario_id  UNIQUEIDENTIFIER  NOT NULL,
    numero      NVARCHAR(30)      NOT NULL,
    etiqueta    NVARCHAR(50)      NULL, -- ej. 'Personal', 'Trabajo'
    creado_en   DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_usertel_creado DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_usuario_telefonos PRIMARY KEY CLUSTERED (id)
);
GO


/* ==========================================================================
   ESQUEMA: organizacion  (12 tablas) — creado en 012_organizacion.sql
   ========================================================================== */

CREATE TABLE organizacion.rangos (
    id                 UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_rangos_id DEFAULT NEWSEQUENTIALID(),
    codigo             NVARCHAR(20)      NOT NULL,
    nombre             NVARCHAR(100)     NOT NULL,
    nivel_jerarquico   INT               NOT NULL CONSTRAINT DF_rangos_nivel DEFAULT 0,
    descripcion        NVARCHAR(MAX)     NULL,
    insignia_url       NVARCHAR(MAX)     NULL,
    color              NVARCHAR(7)       NOT NULL CONSTRAINT DF_rangos_color DEFAULT N'#6B7280',
    orden_jerarquico   INT               NOT NULL CONSTRAINT DF_rangos_orden DEFAULT 0,
    estado             NVARCHAR(20)      NOT NULL CONSTRAINT DF_rangos_estado DEFAULT N'ACTIVO',
    observaciones      NVARCHAR(MAX)     NULL,
    creado_en          DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_rangos_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en     DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_rangos_act DEFAULT SYSDATETIMEOFFSET(),
    eliminado_en       DATETIMEOFFSET(3) NULL, -- baja logica; el sistema nunca hace DELETE fisico
    creado_por         UNIQUEIDENTIFIER  NULL,
    actualizado_por    UNIQUEIDENTIFIER  NULL,
    CONSTRAINT PK_rangos PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_rangos_codigo UNIQUE (codigo),
    CONSTRAINT UQ_rangos_nombre UNIQUE (nombre),
    CONSTRAINT CK_rangos_estado CHECK (estado IN ('ACTIVO','INACTIVO'))
);
GO

CREATE TABLE organizacion.cargos (
    id                    UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_cargos_id DEFAULT NEWSEQUENTIALID(),
    codigo                NVARCHAR(20)      NOT NULL,
    nombre                NVARCHAR(100)     NOT NULL,
    descripcion           NVARCHAR(MAX)     NULL,
    area                  NVARCHAR(100)     NULL,
    nivel                 INT               NULL,
    dependencia_cargo_id  UNIQUEIDENTIFIER  NULL, -- auto-referencia (jerarquia de cargos)
    estado                NVARCHAR(20)      NOT NULL CONSTRAINT DF_cargos_estado DEFAULT N'ACTIVO',
    creado_en             DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_cargos_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en        DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_cargos_act DEFAULT SYSDATETIMEOFFSET(),
    eliminado_en          DATETIMEOFFSET(3) NULL,
    creado_por            UNIQUEIDENTIFIER  NULL,
    actualizado_por       UNIQUEIDENTIFIER  NULL,
    CONSTRAINT PK_cargos PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_cargos_codigo UNIQUE (codigo),
    CONSTRAINT UQ_cargos_nombre UNIQUE (nombre),
    CONSTRAINT CK_cargos_estado CHECK (estado IN ('ACTIVO','INACTIVO'))
);
GO

CREATE TABLE organizacion.especialidades (
    id               UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_espec_id DEFAULT NEWSEQUENTIALID(),
    codigo           NVARCHAR(20)      NOT NULL,
    nombre           NVARCHAR(100)     NOT NULL,
    descripcion      NVARCHAR(MAX)     NULL,
    requisitos       NVARCHAR(MAX)     NULL,
    estado           NVARCHAR(20)      NOT NULL CONSTRAINT DF_espec_estado DEFAULT N'ACTIVO',
    creado_en        DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_espec_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en   DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_espec_act DEFAULT SYSDATETIMEOFFSET(),
    eliminado_en     DATETIMEOFFSET(3) NULL,
    creado_por       UNIQUEIDENTIFIER  NULL,
    actualizado_por  UNIQUEIDENTIFIER  NULL,
    CONSTRAINT PK_especialidades PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_especialidades_codigo UNIQUE (codigo),
    CONSTRAINT UQ_especialidades_nombre UNIQUE (nombre),
    CONSTRAINT CK_espec_estado CHECK (estado IN ('ACTIVO','INACTIVO'))
);
GO

CREATE TABLE organizacion.companias (
    id               UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_comp_id DEFAULT NEWSEQUENTIALID(),
    codigo           NVARCHAR(20)      NOT NULL,
    nombre           NVARCHAR(100)     NOT NULL,
    ciudad           NVARCHAR(100)     NULL,
    direccion        NVARCHAR(MAX)     NULL,
    fecha_creacion   DATE              NULL,
    estado           NVARCHAR(20)      NOT NULL CONSTRAINT DF_comp_estado DEFAULT N'ACTIVO',
    creado_en        DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_comp_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en   DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_comp_act DEFAULT SYSDATETIMEOFFSET(),
    eliminado_en     DATETIMEOFFSET(3) NULL,
    creado_por       UNIQUEIDENTIFIER  NULL,
    actualizado_por  UNIQUEIDENTIFIER  NULL,
    CONSTRAINT PK_companias PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_companias_codigo UNIQUE (codigo),
    CONSTRAINT UQ_companias_nombre UNIQUE (nombre),
    CONSTRAINT CK_comp_estado CHECK (estado IN ('ACTIVO','INACTIVO'))
);
GO

CREATE TABLE organizacion.cuarteles (
    id                       UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_cuartel_id DEFAULT NEWSEQUENTIALID(),
    codigo                   NVARCHAR(20)      NOT NULL,
    nombre                   NVARCHAR(100)     NOT NULL, -- SIN UNIQUE (a diferencia de las demas tablas del modulo)
    compania_id              UNIQUEIDENTIFIER  NOT NULL,
    direccion                NVARCHAR(MAX)     NULL,
    telefono                 NVARCHAR(20)      NULL,
    responsable_bombero_id   UNIQUEIDENTIFIER  NULL,
    estado                   NVARCHAR(20)      NOT NULL CONSTRAINT DF_cuartel_estado DEFAULT N'ACTIVO',
    creado_en                DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_cuartel_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en           DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_cuartel_act DEFAULT SYSDATETIMEOFFSET(),
    eliminado_en             DATETIMEOFFSET(3) NULL,
    creado_por               UNIQUEIDENTIFIER  NULL,
    actualizado_por          UNIQUEIDENTIFIER  NULL,
    CONSTRAINT PK_cuarteles PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_cuarteles_codigo UNIQUE (codigo),
    CONSTRAINT CK_cuartel_estado CHECK (estado IN ('ACTIVO','INACTIVO'))
);
GO

CREATE TABLE organizacion.brigadas (
    id               UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_brig_id DEFAULT NEWSEQUENTIALID(),
    codigo           NVARCHAR(20)      NOT NULL,
    nombre           NVARCHAR(100)     NOT NULL,
    descripcion      NVARCHAR(MAX)     NULL,
    estado           NVARCHAR(20)      NOT NULL CONSTRAINT DF_brig_estado DEFAULT N'ACTIVO',
    creado_en        DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_brig_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en   DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_brig_act DEFAULT SYSDATETIMEOFFSET(),
    eliminado_en     DATETIMEOFFSET(3) NULL,
    creado_por       UNIQUEIDENTIFIER  NULL,
    actualizado_por  UNIQUEIDENTIFIER  NULL,
    CONSTRAINT PK_brigadas PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_brigadas_codigo UNIQUE (codigo),
    CONSTRAINT UQ_brigadas_nombre UNIQUE (nombre),
    CONSTRAINT CK_brig_estado CHECK (estado IN ('ACTIVO','INACTIVO'))
);
GO

CREATE TABLE organizacion.departamentos (
    id               UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_depto_id DEFAULT NEWSEQUENTIALID(),
    codigo           NVARCHAR(20)      NOT NULL,
    nombre           NVARCHAR(100)     NOT NULL,
    descripcion      NVARCHAR(MAX)     NULL,
    estado           NVARCHAR(20)      NOT NULL CONSTRAINT DF_depto_estado DEFAULT N'ACTIVO',
    creado_en        DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_depto_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en   DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_depto_act DEFAULT SYSDATETIMEOFFSET(),
    eliminado_en     DATETIMEOFFSET(3) NULL,
    creado_por       UNIQUEIDENTIFIER  NULL,
    actualizado_por  UNIQUEIDENTIFIER  NULL,
    CONSTRAINT PK_departamentos PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_departamentos_codigo UNIQUE (codigo),
    CONSTRAINT UQ_departamentos_nombre UNIQUE (nombre),
    CONSTRAINT CK_depto_estado CHECK (estado IN ('ACTIVO','INACTIVO'))
);
GO

CREATE TABLE organizacion.unidades (
    id               UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_unid_id DEFAULT NEWSEQUENTIALID(),
    codigo           NVARCHAR(20)      NOT NULL,
    nombre           NVARCHAR(100)     NOT NULL, -- SIN UNIQUE
    descripcion      NVARCHAR(MAX)     NULL,
    brigada_id       UNIQUEIDENTIFIER  NULL,
    estado           NVARCHAR(20)      NOT NULL CONSTRAINT DF_unid_estado DEFAULT N'ACTIVO',
    creado_en        DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_unid_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en   DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_unid_act DEFAULT SYSDATETIMEOFFSET(),
    eliminado_en     DATETIMEOFFSET(3) NULL,
    creado_por       UNIQUEIDENTIFIER  NULL,
    actualizado_por  UNIQUEIDENTIFIER  NULL,
    CONSTRAINT PK_unidades PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_unidades_codigo UNIQUE (codigo),
    CONSTRAINT CK_unid_estado CHECK (estado IN ('ACTIVO','INACTIVO'))
);
GO

CREATE TABLE organizacion.turnos (
    id                       UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_turno_id DEFAULT NEWSEQUENTIALID(),
    codigo                   NVARCHAR(20)      NOT NULL,
    nombre                   NVARCHAR(100)     NOT NULL,
    hora_inicio              TIME(0)           NULL,
    hora_fin                 TIME(0)           NULL,
    responsable_bombero_id   UNIQUEIDENTIFIER  NULL,
    estado                   NVARCHAR(20)      NOT NULL CONSTRAINT DF_turno_estado DEFAULT N'ACTIVO',
    creado_en                DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_turno_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en           DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_turno_act DEFAULT SYSDATETIMEOFFSET(),
    eliminado_en             DATETIMEOFFSET(3) NULL,
    creado_por               UNIQUEIDENTIFIER  NULL,
    actualizado_por          UNIQUEIDENTIFIER  NULL,
    CONSTRAINT PK_turnos PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_turnos_codigo UNIQUE (codigo),
    CONSTRAINT UQ_turnos_nombre UNIQUE (nombre),
    CONSTRAINT CK_turno_estado CHECK (estado IN ('ACTIVO','INACTIVO'))
);
GO

CREATE TABLE organizacion.tipos_guardia (
    id               UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_tguard_id DEFAULT NEWSEQUENTIALID(),
    codigo           NVARCHAR(20)      NOT NULL,
    nombre           NVARCHAR(100)     NOT NULL,
    duracion_horas   INT               NULL,
    descripcion      NVARCHAR(MAX)     NULL,
    estado           NVARCHAR(20)      NOT NULL CONSTRAINT DF_tguard_estado DEFAULT N'ACTIVO',
    creado_en        DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_tguard_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en   DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_tguard_act DEFAULT SYSDATETIMEOFFSET(),
    eliminado_en     DATETIMEOFFSET(3) NULL,
    creado_por       UNIQUEIDENTIFIER  NULL,
    actualizado_por  UNIQUEIDENTIFIER  NULL,
    CONSTRAINT PK_tipos_guardia PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_tipos_guardia_codigo UNIQUE (codigo),
    CONSTRAINT UQ_tipos_guardia_nombre UNIQUE (nombre),
    CONSTRAINT CK_tguard_estado CHECK (estado IN ('ACTIVO','INACTIVO'))
);
GO

CREATE TABLE organizacion.designaciones (
    id               UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_desig_id DEFAULT NEWSEQUENTIALID(),
    codigo           NVARCHAR(30)      NULL, -- folio, SIN restriccion UNIQUE
    bombero_id       UNIQUEIDENTIFIER  NOT NULL,
    cargo_id         UNIQUEIDENTIFIER  NOT NULL,
    compania_id      UNIQUEIDENTIFIER  NULL,
    cuartel_id       UNIQUEIDENTIFIER  NULL,
    fecha_desde      DATE              NOT NULL,
    fecha_hasta      DATE              NULL,
    estado           NVARCHAR(20)      NOT NULL CONSTRAINT DF_desig_estado DEFAULT N'ACTIVA',
    motivo           NVARCHAR(MAX)     NULL,
    observaciones    NVARCHAR(MAX)     NULL,
    creado_en        DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_desig_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en   DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_desig_act DEFAULT SYSDATETIMEOFFSET(),
    eliminado_en     DATETIMEOFFSET(3) NULL,
    creado_por       UNIQUEIDENTIFIER  NULL,
    actualizado_por  UNIQUEIDENTIFIER  NULL,
    CONSTRAINT PK_designaciones PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_desig_estado CHECK (estado IN ('ACTIVA','FINALIZADA','ANULADA')),
    CONSTRAINT CK_desig_fechas CHECK (fecha_hasta IS NULL OR fecha_hasta >= fecha_desde)
);
GO

CREATE TABLE organizacion.ascensos (
    id                   UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_ascenso_id DEFAULT NEWSEQUENTIALID(),
    codigo               NVARCHAR(30)      NULL, -- folio, SIN restriccion UNIQUE
    bombero_id           UNIQUEIDENTIFIER  NOT NULL,
    rango_anterior_id    UNIQUEIDENTIFIER  NULL,
    rango_nuevo_id       UNIQUEIDENTIFIER  NOT NULL,
    fecha                DATE              NOT NULL,
    resolucion           NVARCHAR(100)     NULL,
    motivo               NVARCHAR(MAX)     NULL,
    observaciones        NVARCHAR(MAX)     NULL,
    estado               NVARCHAR(20)      NOT NULL CONSTRAINT DF_ascenso_estado DEFAULT N'REGISTRADO',
    creado_en            DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_ascenso_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en       DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_ascenso_act DEFAULT SYSDATETIMEOFFSET(),
    eliminado_en         DATETIMEOFFSET(3) NULL,
    creado_por           UNIQUEIDENTIFIER  NULL,
    actualizado_por      UNIQUEIDENTIFIER  NULL,
    CONSTRAINT PK_ascensos PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_ascenso_estado CHECK (estado IN ('REGISTRADO','ANULADO'))
);
GO


/* ==========================================================================
   ESQUEMA: personal  (6 tablas)
   personal.bomberos: tabla preexistente (creada en 003_personal.sql segun
   notas de migracion); columnas rango_id/cargo_principal_id/compania_id/
   cuartel_id/turno_id/tipo_guardia_id agregadas por ALTER TABLE en
   migracion 012. Se construye aqui el estado final con todas las columnas.
   ========================================================================== */

CREATE TABLE personal.bomberos (
    id                      UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_bomberos_id DEFAULT NEWSEQUENTIALID(),
    cedula                  NVARCHAR(20)      NOT NULL,
    nombre                  NVARCHAR(100)     NOT NULL,
    apellido                NVARCHAR(100)     NOT NULL,
    fecha_nacimiento        DATE              NOT NULL,
    sexo                    NVARCHAR(1)       NULL,
    nacionalidad            NVARCHAR(50)      NOT NULL CONSTRAINT DF_bomberos_nacionalidad DEFAULT N'Paraguaya',
    estado_civil            NVARCHAR(20)      NULL,
    lugar_nacimiento        NVARCHAR(100)     NULL,
    telefono_principal      NVARCHAR(20)      NOT NULL,
    telefono_secundario     NVARCHAR(20)      NULL,
    email                   NVARCHAR(255)     NULL,
    direccion               NVARCHAR(MAX)     NULL,
    ciudad                  NVARCHAR(100)     NULL,
    departamento            NVARCHAR(100)     NULL, -- direccion/provincia; NO confundir con organizacion.departamentos
    codigo_postal           NVARCHAR(20)      NULL,
    domicilio_lat           DECIMAL(10,8)     NULL, -- reemplaza el tipo POINT de PostgreSQL (comentario del script original)
    domicilio_lon           DECIMAL(11,8)     NULL,
    numero_bombero          NVARCHAR(20)      NOT NULL,
    rango                   NVARCHAR(50)      NOT NULL, -- texto libre historico; ver tambien rango_id (FK a organizacion.rangos)
    cargo                   NVARCHAR(100)     NULL,     -- texto libre historico; ver tambien cargo_principal_id
    estado                  NVARCHAR(20)      NOT NULL,
    fecha_ingreso            DATE              NOT NULL,
    fecha_ascenso            DATE              NULL,
    -- antiguedad: columna CALCULADA (computed, NO PERSISTED porque depende de la fecha actual).
    -- APROXIMADO: el documento fuente describe la formula como
    -- "DATEDIFF(YEAR, fecha_ingreso, SYSDATETIME()) ajustado por CASE segun
    -- mes/dia" pero NO transcribe el CASE exacto. La expresion siguiente es
    -- una reconstruccion razonable del patron estandar de "anios completos",
    -- NO el texto verificado del script original. Ver seccion 10 del reporte.
    antiguedad AS (
        DATEDIFF(YEAR, fecha_ingreso, SYSDATETIME())
        - CASE
            WHEN (MONTH(SYSDATETIME()) < MONTH(fecha_ingreso))
              OR (MONTH(SYSDATETIME()) = MONTH(fecha_ingreso) AND DAY(SYSDATETIME()) < DAY(fecha_ingreso))
            THEN 1 ELSE 0
          END
    ),
    grupo_sanguineo         NVARCHAR(5)       NULL,
    factor_rh               NVARCHAR(2)       NULL,
    alergias                NVARCHAR(MAX)     NULL,
    condiciones_medicas     NVARCHAR(MAX)     NULL,
    medicamentos            NVARCHAR(MAX)     NULL,
    tipo_seguro              NVARCHAR(50)      NULL,
    numero_seguro            NVARCHAR(50)      NULL,
    vigencia_seguro          DATE              NULL,
    contactos_emergencia    NVARCHAR(MAX)     NOT NULL CONSTRAINT DF_bomberos_contactos DEFAULT N'[]',
    foto_url                NVARCHAR(MAX)     NULL,
    foto_thumb_url          NVARCHAR(MAX)     NULL,
    fecha_baja               DATE              NULL,
    motivo_baja              NVARCHAR(MAX)     NULL,
    metadata                NVARCHAR(MAX)     NULL,
    creado_en                DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_bomberos_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en           DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_bomberos_act DEFAULT SYSDATETIMEOFFSET(),
    creado_por               UNIQUEIDENTIFIER  NULL,
    actualizado_por          UNIQUEIDENTIFIER  NULL,
    rango_id                UNIQUEIDENTIFIER  NULL, -- agregada por ALTER TABLE en migracion 012
    cargo_principal_id      UNIQUEIDENTIFIER  NULL, -- agregada por ALTER TABLE en migracion 012
    compania_id             UNIQUEIDENTIFIER  NULL, -- agregada por ALTER TABLE en migracion 012
    cuartel_id               UNIQUEIDENTIFIER  NULL, -- agregada por ALTER TABLE en migracion 012
    turno_id                 UNIQUEIDENTIFIER  NULL, -- agregada por ALTER TABLE en migracion 012
    tipo_guardia_id          UNIQUEIDENTIFIER  NULL, -- agregada por ALTER TABLE en migracion 012
    CONSTRAINT PK_bomberos PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_bomberos_cedula UNIQUE (cedula),
    CONSTRAINT UQ_bomberos_numero UNIQUE (numero_bombero),
    CONSTRAINT CK_bomberos_sexo CHECK (sexo IS NULL OR sexo IN ('M','F')),
    CONSTRAINT CK_bomberos_estado CHECK (estado IN ('ACTIVO','RESERVA','INOPERATIVO','RETIRADO','SUSPENDIDO')),
    CONSTRAINT CK_bomberos_contactos CHECK (ISJSON(contactos_emergencia) = 1),
    CONSTRAINT CK_bomberos_metadata CHECK (metadata IS NULL OR ISJSON(metadata) = 1)
);
GO

CREATE TABLE personal.bombero_especialidades (
    id                UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_bomesp_id DEFAULT NEWSEQUENTIALID(),
    bombero_id        UNIQUEIDENTIFIER  NOT NULL,
    especialidad_id   UNIQUEIDENTIFIER  NOT NULL,
    fecha_obtencion   DATE              NULL,
    estado            NVARCHAR(20)      NOT NULL CONSTRAINT DF_bomesp_estado DEFAULT N'ACTIVA', -- sin CHECK asociado (documentado explicitamente)
    creado_en         DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_bomesp_creado DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_bombero_especialidades PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_bombero_especialidades UNIQUE (bombero_id, especialidad_id)
);
GO

CREATE TABLE personal.certificaciones (
    id                   UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_cert_id DEFAULT NEWSEQUENTIALID(),
    bombero_id           UNIQUEIDENTIFIER  NOT NULL,
    tipo                 NVARCHAR(50)      NOT NULL,
    nombre               NVARCHAR(200)     NOT NULL,
    institucion          NVARCHAR(200)     NULL,
    fecha_obtencion      DATE              NOT NULL,
    fecha_vencimiento    DATE              NULL,
    numero_certificado   NVARCHAR(100)     NULL,
    archivo_url          NVARCHAR(MAX)     NULL,
    estado               NVARCHAR(20)      NOT NULL CONSTRAINT DF_cert_estado DEFAULT N'VIGENTE',
    creado_en            DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_cert_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en       DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_cert_act DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_certificaciones PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_cert_tipo CHECK (tipo IN ('BASICO','INTERMEDIO','AVANZADO','ESPECIALIDAD')),
    CONSTRAINT CK_cert_estado CHECK (estado IN ('VIGENTE','VENCIDO','EN_PROCESO'))
);
GO

CREATE TABLE personal.historial_disciplinario (
    id                     UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_hdisc_id DEFAULT NEWSEQUENTIALID(),
    bombero_id             UNIQUEIDENTIFIER  NOT NULL,
    fecha                  DATE              NOT NULL,
    tipo                   NVARCHAR(50)      NOT NULL,
    descripcion            NVARCHAR(MAX)     NOT NULL,
    articulo_reglamento    NVARCHAR(50)      NULL,
    resolucion             NVARCHAR(100)     NULL,
    sancion                NVARCHAR(MAX)     NULL,
    duracion_dias          INT               NULL,
    fecha_fin_sancion      DATE              NULL,
    estado                 NVARCHAR(20)      NOT NULL CONSTRAINT DF_hdisc_estado DEFAULT N'ACTIVO',
    recurso_presentado     BIT               NOT NULL CONSTRAINT DF_hdisc_recurso DEFAULT 0,
    resultado_recurso      NVARCHAR(MAX)     NULL,
    creado_en              DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_hdisc_creado DEFAULT SYSDATETIMEOFFSET(),
    creado_por             UNIQUEIDENTIFIER  NULL,
    CONSTRAINT PK_historial_disciplinario PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_hdisc_tipo CHECK (tipo IN ('APERCIBIMIENTO','SUSPENSION','MULTA','BAJA')),
    CONSTRAINT CK_hdisc_estado CHECK (estado IN ('ACTIVO','CUMPLIDO','ANULADO'))
);
GO

CREATE TABLE personal.historial_medico (
    id             UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_hmed_id DEFAULT NEWSEQUENTIALID(),
    bombero_id     UNIQUEIDENTIFIER  NOT NULL,
    fecha          DATE              NOT NULL,
    tipo           NVARCHAR(50)      NOT NULL,
    diagnostico    NVARCHAR(MAX)     NULL,
    tratamiento    NVARCHAR(MAX)     NULL,
    medico         NVARCHAR(100)     NULL,
    institucion    NVARCHAR(200)     NULL,
    archivo_url    NVARCHAR(MAX)     NULL,
    observaciones  NVARCHAR(MAX)     NULL,
    creado_en      DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_hmed_creado DEFAULT SYSDATETIMEOFFSET(),
    creado_por     UNIQUEIDENTIFIER  NULL,
    CONSTRAINT PK_historial_medico PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_hmed_tipo CHECK (tipo IN ('CONSULTA','EXAMEN','ACCIDENTE','VACUNA'))
);
GO

CREATE TABLE personal.licencias (
    id                   UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_lic_id DEFAULT NEWSEQUENTIALID(),
    bombero_id           UNIQUEIDENTIFIER  NOT NULL,
    tipo                 NVARCHAR(50)      NOT NULL,
    numero               NVARCHAR(50)      NULL,
    fecha_emision        DATE              NOT NULL,
    fecha_vencimiento    DATE              NOT NULL,
    estado               NVARCHAR(20)      NOT NULL CONSTRAINT DF_lic_estado DEFAULT N'VIGENTE',
    archivo_url          NVARCHAR(MAX)     NULL,
    creado_en            DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_lic_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en       DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_lic_act DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_licencias PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_lic_estado CHECK (estado IN ('VIGENTE','VENCIDA','SUSPENDIDA'))
);
GO


/* ==========================================================================
   ESQUEMA: academia  (7 tablas) — 004_academia.sql
   ========================================================================== */

CREATE TABLE academia.materias (
    id                    UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_materias_id DEFAULT NEWSEQUENTIALID(),
    codigo                NVARCHAR(20)      NOT NULL,
    nombre                NVARCHAR(200)     NOT NULL,
    descripcion           NVARCHAR(MAX)     NULL,
    nivel                 NVARCHAR(20)      NOT NULL,
    horas_teoricas        INT               NOT NULL CONSTRAINT DF_materias_hteo DEFAULT 0,
    horas_practicas       INT               NOT NULL CONSTRAINT DF_materias_hprac DEFAULT 0,
    horas_totales AS (horas_teoricas + horas_practicas) PERSISTED,
    requiere_practicas    BIT               NOT NULL CONSTRAINT DF_materias_reqprac DEFAULT 0,
    nota_aprobacion       DECIMAL(5,2)      NOT NULL CONSTRAINT DF_materias_notaap DEFAULT 60.00,
    creado_en             DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_materias_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en        DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_materias_act DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_materias PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_materias_codigo UNIQUE (codigo),
    CONSTRAINT CK_mat_nivel CHECK (nivel IN ('BASICO','INTERMEDIO','AVANZADO'))
);
GO

CREATE TABLE academia.cursos (
    id                UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_cursos_id DEFAULT NEWSEQUENTIALID(),
    materia_id        UNIQUEIDENTIFIER  NOT NULL, -- FK implicita, sin constraint fisico declarado en 004_academia.sql
    nombre            NVARCHAR(200)     NOT NULL,
    descripcion       NVARCHAR(MAX)     NULL,
    fecha_inicio      DATE              NOT NULL,
    fecha_fin         DATE              NOT NULL,
    horario           NVARCHAR(100)     NULL,
    instructor_id     UNIQUEIDENTIFIER  NULL, -- referencia inferida a personal.bomberos(id)
    cupo_maximo       INT               NOT NULL CONSTRAINT DF_cursos_cupomax DEFAULT 30,
    cupo_actual       INT               NOT NULL CONSTRAINT DF_cursos_cupoact DEFAULT 0,
    estado            NVARCHAR(20)      NOT NULL CONSTRAINT DF_cursos_estado DEFAULT N'PLANIFICADO',
    metadata          NVARCHAR(MAX)     NULL,
    creado_en         DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_cursos_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en    DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_cursos_act DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_cursos PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_cur_fechas CHECK (fecha_fin >= fecha_inicio),
    CONSTRAINT CK_cur_estado CHECK (estado IN ('PLANIFICADO','EN_CURSO','FINALIZADO','CANCELADO')),
    CONSTRAINT CK_cur_metadata CHECK (metadata IS NULL OR ISJSON(metadata) = 1)
);
GO

CREATE TABLE academia.examenes (
    id                        UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_examenes_id DEFAULT NEWSEQUENTIALID(),
    curso_id                  UNIQUEIDENTIFIER  NOT NULL, -- FK implicita, sin constraint fisico declarado
    tipo                      NVARCHAR(20)      NOT NULL,
    titulo                    NVARCHAR(200)     NOT NULL,
    descripcion               NVARCHAR(MAX)     NULL,
    fecha                     DATE              NOT NULL,
    hora                      TIME(0)           NOT NULL,
    duracion_minutos          INT               NULL,
    nota_maxima               DECIMAL(5,2)      NOT NULL CONSTRAINT DF_examenes_notamax DEFAULT 100.00,
    nota_minima_aprobacion    DECIMAL(5,2)      NOT NULL CONSTRAINT DF_examenes_notamin DEFAULT 60.00,
    creado_en                 DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_examenes_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en            DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_examenes_act DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_examenes PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_exa_tipo CHECK (tipo IN ('TEORICO','PRACTICO','RECUPERATORIO'))
);
GO

CREATE TABLE academia.inscripciones_cursos (
    id                    UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_insccur_id DEFAULT NEWSEQUENTIALID(),
    curso_id              UNIQUEIDENTIFIER  NOT NULL, -- FK implicita
    bombero_id            UNIQUEIDENTIFIER  NULL,     -- FK implicita
    aspirante_id          UNIQUEIDENTIFIER  NULL,     -- FK implicita
    -- participante_id: replica en SQL Server el UNIQUE(curso_id, COALESCE(...))
    -- que en PostgreSQL se hacia directo; SQL Server no admite expresiones en UNIQUE.
    participante_id AS (COALESCE(bombero_id, aspirante_id)) PERSISTED,
    fecha_inscripcion     DATE              NOT NULL CONSTRAINT DF_insccur_fecha DEFAULT (CAST(SYSDATETIME() AS DATE)),
    estado                NVARCHAR(20)      NOT NULL CONSTRAINT DF_insccur_estado DEFAULT N'INSCRITO',
    nota_final            DECIMAL(5,2)      NULL,
    asistencia_total      INT               NOT NULL CONSTRAINT DF_insccur_asis DEFAULT 0,
    observaciones         NVARCHAR(MAX)     NULL,
    creado_en             DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_insccur_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en        DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_insccur_act DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_inscripciones_cursos PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_insc_participante CHECK (
        (CASE WHEN bombero_id IS NULL THEN 0 ELSE 1 END)
      + (CASE WHEN aspirante_id IS NULL THEN 0 ELSE 1 END) = 1
    ),
    CONSTRAINT CK_insc_estado CHECK (estado IN ('INSCRITO','ACTIVO','RETIRADO','APROBADO','REPROBADO')),
    CONSTRAINT UQ_inscripciones_cursos UNIQUE (curso_id, participante_id)
);
GO

CREATE TABLE academia.notas_examenes (
    id                UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_notaexa_id DEFAULT NEWSEQUENTIALID(),
    examen_id         UNIQUEIDENTIFIER  NOT NULL, -- FK implicita; parte de UQ_notas_examenes
    inscripcion_id    UNIQUEIDENTIFIER  NOT NULL, -- FK implicita; parte de UQ_notas_examenes
    nota              DECIMAL(5,2)      NULL,
    observaciones     NVARCHAR(MAX)     NULL,
    estado            NVARCHAR(20)      NOT NULL CONSTRAINT DF_notaexa_estado DEFAULT N'PENDIENTE',
    creado_en         DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_notaexa_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en    DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_notaexa_act DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_notas_examenes PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_nota_estado CHECK (estado IN ('PENDIENTE','APROBADO','REPROBADO','RECUPERANDO')),
    CONSTRAINT UQ_notas_examenes UNIQUE (examen_id, inscripcion_id)
);
GO

CREATE TABLE academia.asistencia_academia (
    id                UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_asisacad_id DEFAULT NEWSEQUENTIALID(),
    inscripcion_id    UNIQUEIDENTIFIER  NOT NULL, -- FK implicita; parte de UQ_asistencia_academia
    fecha             DATE              NOT NULL, -- parte de UQ_asistencia_academia
    presente          BIT               NOT NULL CONSTRAINT DF_asisacad_presente DEFAULT 0,
    justificado       BIT               NOT NULL CONSTRAINT DF_asisacad_justif DEFAULT 0,
    motivo            NVARCHAR(MAX)     NULL,
    marcado_por       UNIQUEIDENTIFIER  NULL, -- referencia inferida; tabla de personal/usuarios no confirmada en este lote
    creado_en         DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_asisacad_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en    DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_asisacad_act DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_asistencia_academia PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_asistencia_academia UNIQUE (inscripcion_id, fecha)
);
GO

CREATE TABLE academia.aspirantes (
    id                   UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_aspirantes_id DEFAULT NEWSEQUENTIALID(),
    cedula               NVARCHAR(20)      NOT NULL,
    nombre               NVARCHAR(100)     NOT NULL,
    apellido             NVARCHAR(100)     NOT NULL,
    fecha_nacimiento     DATE              NOT NULL,
    telefono             NVARCHAR(20)      NOT NULL,
    email                NVARCHAR(255)     NULL,
    direccion            NVARCHAR(MAX)     NULL,
    estado               NVARCHAR(20)      NOT NULL CONSTRAINT DF_aspirantes_estado DEFAULT N'INSCRITO',
    fecha_inscripcion    DATE              NOT NULL CONSTRAINT DF_aspirantes_fecha DEFAULT (CAST(SYSDATETIME() AS DATE)),
    fecha_inicio         DATE              NULL,
    fecha_fin            DATE              NULL,
    observaciones        NVARCHAR(MAX)     NULL,
    creado_en            DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_aspirantes_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en       DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_aspirantes_act DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_aspirantes PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_aspirantes_cedula UNIQUE (cedula),
    CONSTRAINT CK_asp_estado CHECK (estado IN ('INSCRITO','EN_CURSO','APROBADO','RECHAZADO','RETIRADO'))
);
GO


/* ==========================================================================
   ESQUEMA: operaciones  (5 tablas) — 005_operaciones.sql
   ========================================================================== */

CREATE TABLE operaciones.guardias (
    id                UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_guardias_id DEFAULT NEWSEQUENTIALID(),
    fecha             DATE              NOT NULL,
    turno             NVARCHAR(20)      NOT NULL,
    hora_inicio       TIME(0)           NOT NULL,
    hora_fin          TIME(0)           NOT NULL,
    tipo              NVARCHAR(20)      NOT NULL CONSTRAINT DF_guardias_tipo DEFAULT N'ORDINARIA',
    estado            NVARCHAR(20)      NOT NULL CONSTRAINT DF_guardias_estado DEFAULT N'PROGRAMADA',
    jefe_guardia_id   UNIQUEIDENTIFIER  NULL, -- referencia inferida a personal.bomberos(id)
    observaciones     NVARCHAR(MAX)     NULL,
    creado_en         DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_guardias_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en    DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_guardias_act DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_guardias PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_guard_turno CHECK (turno IN ('DIURNO','NOCTURNO','COMPLETO')),
    CONSTRAINT CK_guard_tipo CHECK (tipo IN ('ORDINARIA','ESPECIAL','EXTRAORDINARIA')),
    CONSTRAINT CK_guard_estado CHECK (estado IN ('PROGRAMADA','EN_CURSO','FINALIZADA','CANCELADA','REEMPLAZADA'))
);
GO

CREATE TABLE operaciones.asignacion_guardias (
    id                  UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_asigguard_id DEFAULT NEWSEQUENTIALID(),
    guardia_id          UNIQUEIDENTIFIER  NOT NULL, -- FK implicita; parte de UQ_asignacion_guardias
    bombero_id          UNIQUEIDENTIFIER  NOT NULL, -- referencia inferida; parte de UQ_asignacion_guardias
    rol                 NVARCHAR(50)      NULL,
    estado              NVARCHAR(20)      NOT NULL CONSTRAINT DF_asigguard_estado DEFAULT N'ASIGNADO',
    fecha_asignacion    DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_asigguard_fecha DEFAULT SYSDATETIMEOFFSET(),
    asignado_por        UNIQUEIDENTIFIER  NULL, -- referencia inferida
    observaciones       NVARCHAR(MAX)     NULL, -- tabla sin actualizado_en; usa fecha_asignacion como marca temporal
    CONSTRAINT PK_asignacion_guardias PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_asigguard_estado CHECK (estado IN ('ASIGNADO','CONFIRMADO','REEMPLAZADO','AUSENTE')),
    CONSTRAINT UQ_asignacion_guardias UNIQUE (guardia_id, bombero_id)
);
GO

CREATE TABLE operaciones.cambios_guardias (
    id                        UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_cambguard_id DEFAULT NEWSEQUENTIALID(),
    asignacion_original_id    UNIQUEIDENTIFIER  NOT NULL, -- FK implicita -> operaciones.asignacion_guardias(id)
    bombero_nuevo_id          UNIQUEIDENTIFIER  NOT NULL, -- referencia inferida
    solicitante_id            UNIQUEIDENTIFIER  NOT NULL, -- referencia inferida
    fecha_solicitud           DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_cambguard_fechasol DEFAULT SYSDATETIMEOFFSET(),
    fecha_cambio              DATE              NULL,
    motivo                    NVARCHAR(MAX)     NULL,
    estado                    NVARCHAR(20)      NOT NULL CONSTRAINT DF_cambguard_estado DEFAULT N'PENDIENTE',
    aprobado_por              UNIQUEIDENTIFIER  NULL, -- referencia inferida
    fecha_aprobacion          DATETIMEOFFSET(3) NULL,
    observaciones             NVARCHAR(MAX)     NULL, -- tabla sin creado_en/actualizado_en
    CONSTRAINT PK_cambios_guardias PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_cambguard_estado CHECK (estado IN ('PENDIENTE','APROBADO','RECHAZADO','CANCELADO'))
);
GO

CREATE TABLE operaciones.eventos_asistencia (
    id                UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_evasis_id DEFAULT NEWSEQUENTIALID(),
    tipo              NVARCHAR(30)      NOT NULL,
    nombre            NVARCHAR(200)     NOT NULL,
    descripcion       NVARCHAR(MAX)     NULL,
    fecha_inicio      DATETIMEOFFSET(3) NOT NULL,
    fecha_fin         DATETIMEOFFSET(3) NOT NULL,
    ubicacion         NVARCHAR(200)     NULL,
    responsable_id    UNIQUEIDENTIFIER  NULL, -- referencia inferida
    estado            NVARCHAR(20)      NOT NULL CONSTRAINT DF_evasis_estado DEFAULT N'PROGRAMADO',
    metadata          NVARCHAR(MAX)     NULL,
    creado_en         DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_evasis_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en    DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_evasis_act DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_eventos_asistencia PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_evasis_tipo CHECK (tipo IN ('GUARDIA','PRACTICA','CITACION','CURSO','ASAMBLEA','SERVICIO')),
    CONSTRAINT CK_evasis_fechas CHECK (fecha_fin >= fecha_inicio),
    CONSTRAINT CK_evasis_estado CHECK (estado IN ('PROGRAMADO','EN_CURSO','FINALIZADO','CANCELADO')),
    CONSTRAINT CK_evasis_meta CHECK (metadata IS NULL OR ISJSON(metadata) = 1)
);
GO

CREATE TABLE operaciones.marcaciones_asistencia (
    id                     UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_marc_id DEFAULT NEWSEQUENTIALID(),
    evento_id              UNIQUEIDENTIFIER  NOT NULL, -- FK implicita -> operaciones.eventos_asistencia(id)
    bombero_id             UNIQUEIDENTIFIER  NOT NULL, -- referencia inferida
    tipo_marcacion         NVARCHAR(20)      NOT NULL,
    metodo                 NVARCHAR(20)      NOT NULL,
    timestamp_marcacion    DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_marc_timestamp DEFAULT SYSDATETIMEOFFSET(),
    latitud                DECIMAL(10,8)     NULL,
    longitud               DECIMAL(11,8)     NULL,
    precision_metros       INT               NULL,
    dispositivo            NVARCHAR(100)     NULL,
    ip                     VARCHAR(45)       NULL,
    observaciones          NVARCHAR(MAX)     NULL,
    verificado             BIT               NOT NULL CONSTRAINT DF_marc_verificado DEFAULT 0,
    verificado_por         UNIQUEIDENTIFIER  NULL, -- referencia inferida
    creado_en              DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_marc_creado DEFAULT SYSDATETIMEOFFSET(), -- sin actualizado_en (bitacora)
    CONSTRAINT PK_marcaciones_asistencia PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_marc_tipo CHECK (tipo_marcacion IN ('ENTRADA','SALIDA')),
    CONSTRAINT CK_marc_metodo CHECK (metodo IN ('HUELLA','QR','PIN','RFID','MANUAL','APP'))
);
GO


/* ==========================================================================
   ESQUEMA: vehiculos  (3 tablas) — 006_vehiculos_equipos.sql
   ========================================================================== */

CREATE TABLE vehiculos.vehiculos (
    id                          UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_vehiculos_id DEFAULT NEWSEQUENTIALID(),
    numero_interno              NVARCHAR(20)      NOT NULL,
    tipo                        NVARCHAR(50)      NOT NULL, -- ej. autobomba, ambulancia, cisterna, escalera (valor libre, sin CHECK)
    marca                       NVARCHAR(50)      NULL,
    modelo                      NVARCHAR(50)      NULL,
    anio                        INT               NULL,
    patente                     NVARCHAR(20)      NULL,
    color                       NVARCHAR(30)      NULL,
    numero_chasis               NVARCHAR(50)      NULL,
    numero_motor                NVARCHAR(50)      NULL,
    capacidad_carga             INT               NULL,
    capacidad_pasajeros         INT               NULL,
    kilometraje_actual          INT               NOT NULL CONSTRAINT DF_vehiculos_km DEFAULT 0,
    combustible_actual          DECIMAL(10,2)     NOT NULL CONSTRAINT DF_vehiculos_combust DEFAULT 0,
    estado                      NVARCHAR(20)      NOT NULL CONSTRAINT DF_vehiculos_estado DEFAULT N'OPERATIVO',
    ubicacion_actual            NVARCHAR(100)     NULL,
    itv_fecha                   DATE              NULL,
    itv_vencimiento             DATE              NULL,
    seguro_fecha                DATE              NULL,
    seguro_vencimiento          DATE              NULL,
    seguro_empresa              NVARCHAR(100)     NULL,
    seguro_poliza               NVARCHAR(50)      NULL,
    ultimo_mantenimiento        DATE              NULL,
    proximo_mantenimiento       DATE              NULL,
    ultimo_cambio_aceite        DATE              NULL,
    ultimo_cambio_cubiertas     DATE              NULL,
    ultima_revision_bateria     DATE              NULL,
    qr_code                     NVARCHAR(200)     NULL,
    fotos                       NVARCHAR(MAX)     NOT NULL CONSTRAINT DF_vehiculos_fotos DEFAULT N'[]',
    documentos                  NVARCHAR(MAX)     NOT NULL CONSTRAINT DF_vehiculos_docs DEFAULT N'[]',
    metadata                    NVARCHAR(MAX)     NULL,
    creado_en                   DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_vehiculos_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en              DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_vehiculos_act DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_vehiculos PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_vehiculos_numero UNIQUE (numero_interno),
    CONSTRAINT UQ_vehiculos_patente UNIQUE (patente),
    CONSTRAINT CK_veh_estado CHECK (estado IN ('OPERATIVO','EN_MANTENIMIENTO','FUERA_SERVICIO','BAJA')),
    CONSTRAINT CK_veh_fotos CHECK (ISJSON(fotos) = 1),
    CONSTRAINT CK_veh_docs CHECK (ISJSON(documentos) = 1),
    CONSTRAINT CK_veh_meta CHECK (metadata IS NULL OR ISJSON(metadata) = 1)
);
GO

CREATE TABLE vehiculos.mantenimientos_vehiculos (
    id                         UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_mveh_id DEFAULT NEWSEQUENTIALID(),
    vehiculo_id                UNIQUEIDENTIFIER  NOT NULL, -- FK implicita -> vehiculos.vehiculos(id)
    tipo                       NVARCHAR(30)      NOT NULL,
    fecha                      DATE              NOT NULL,
    descripcion                NVARCHAR(MAX)     NOT NULL,
    costo                      DECIMAL(15,2)     NULL,
    kilometraje                INT               NULL,
    taller                     NVARCHAR(100)     NULL,
    responsable                NVARCHAR(100)     NULL, -- texto libre, NO es FK
    proximo_mantenimiento      DATE              NULL,
    archivo_url                NVARCHAR(MAX)     NULL,
    creado_en                  DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_mveh_creado DEFAULT SYSDATETIMEOFFSET(), -- sin actualizado_en (bitacora)
    creado_por                 UNIQUEIDENTIFIER  NULL, -- referencia inferida
    CONSTRAINT PK_mantenimientos_vehiculos PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_mveh_tipo CHECK (tipo IN ('PREVENTIVO','CORRECTIVO','EMERGENCIA','ITV','REPARACION'))
);
GO

CREATE TABLE vehiculos.consumos_combustible (
    id                     UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_consumo_id DEFAULT NEWSEQUENTIALID(),
    vehiculo_id            UNIQUEIDENTIFIER  NOT NULL, -- FK implicita -> vehiculos.vehiculos(id)
    fecha                  DATE              NOT NULL,
    galones                DECIMAL(10,2)     NOT NULL,
    kilometraje_actual     INT               NOT NULL,
    tipo_combustible       NVARCHAR(20)      NOT NULL CONSTRAINT DF_consumo_tipocombust DEFAULT N'DIESEL', -- sin CHECK que restrinja valores
    costo                  DECIMAL(15,2)     NULL,
    proveedor              NVARCHAR(100)     NULL,
    factura                NVARCHAR(50)      NULL,
    creado_en              DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_consumo_creado DEFAULT SYSDATETIMEOFFSET(),
    creado_por             UNIQUEIDENTIFIER  NULL, -- referencia inferida
    CONSTRAINT PK_consumos_combustible PRIMARY KEY CLUSTERED (id)
);
GO


/* ==========================================================================
   ESQUEMA: equipos  (4 tablas) — 006_vehiculos_equipos.sql
   ========================================================================== */

CREATE TABLE equipos.categorias_equipo (
    id             UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_categq_id DEFAULT NEWSEQUENTIALID(),
    nombre         NVARCHAR(100)     NOT NULL,
    descripcion    NVARCHAR(MAX)     NULL,
    padre_id       UNIQUEIDENTIFIER  NULL, -- autorreferencia, FK implicita, arbol de categorias
    activo         BIT               NOT NULL CONSTRAINT DF_categq_activo DEFAULT 1,
    creado_en      DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_categq_creado DEFAULT SYSDATETIMEOFFSET(), -- sin actualizado_en
    CONSTRAINT PK_categorias_equipo PRIMARY KEY CLUSTERED (id)
);
GO

CREATE TABLE equipos.equipos (
    id                  UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_equipos_id DEFAULT NEWSEQUENTIALID(),
    categoria_id        UNIQUEIDENTIFIER  NOT NULL, -- FK implicita -> equipos.categorias_equipo(id)
    codigo_interno      NVARCHAR(50)      NOT NULL,
    nombre              NVARCHAR(200)     NOT NULL,
    descripcion         NVARCHAR(MAX)     NULL,
    marca               NVARCHAR(100)     NULL,
    modelo              NVARCHAR(100)     NULL,
    numero_serie        NVARCHAR(100)     NULL,
    estado              NVARCHAR(20)      NOT NULL CONSTRAINT DF_equipos_estado DEFAULT N'OPERATIVO',
    ubicacion           NVARCHAR(200)     NULL,
    responsable_id      UNIQUEIDENTIFIER  NULL, -- referencia inferida
    fecha_compra        DATE              NULL,
    fecha_vencimiento   DATE              NULL,
    vida_util_meses     INT               NULL,
    qr_code             NVARCHAR(200)     NULL,
    fotos               NVARCHAR(MAX)     NOT NULL CONSTRAINT DF_equipos_fotos DEFAULT N'[]',
    documentos          NVARCHAR(MAX)     NOT NULL CONSTRAINT DF_equipos_docs DEFAULT N'[]',
    metadata            NVARCHAR(MAX)     NULL,
    creado_en           DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_equipos_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en      DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_equipos_act DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_equipos PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_equipos_codigo UNIQUE (codigo_interno),
    CONSTRAINT CK_eq_estado CHECK (estado IN ('OPERATIVO','EN_MANTENIMIENTO','DANIADO','BAJA','PRESTADO')),
    CONSTRAINT CK_eq_fotos CHECK (ISJSON(fotos) = 1),
    CONSTRAINT CK_eq_docs CHECK (ISJSON(documentos) = 1),
    CONSTRAINT CK_eq_meta CHECK (metadata IS NULL OR ISJSON(metadata) = 1)
);
GO

CREATE TABLE equipos.mantenimientos_equipos (
    id                        UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_meq_id DEFAULT NEWSEQUENTIALID(),
    equipo_id                 UNIQUEIDENTIFIER  NOT NULL, -- FK implicita -> equipos.equipos(id)
    fecha                     DATE              NOT NULL,
    tipo                      NVARCHAR(30)      NOT NULL,
    descripcion               NVARCHAR(MAX)     NOT NULL,
    costo                     DECIMAL(15,2)     NULL,
    proveedor                 NVARCHAR(100)     NULL,
    tecnico                   NVARCHAR(100)     NULL, -- texto libre, NO es FK
    proximo_mantenimiento     DATE              NULL,
    archivo_url               NVARCHAR(MAX)     NULL,
    creado_en                 DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_meq_creado DEFAULT SYSDATETIMEOFFSET(), -- sin actualizado_en
    creado_por                UNIQUEIDENTIFIER  NULL, -- referencia inferida
    CONSTRAINT PK_mantenimientos_equipos PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_meq_tipo CHECK (tipo IN ('PREVENTIVO','CORRECTIVO','CALIBRACION'))
);
GO

CREATE TABLE equipos.prestamos_equipos (
    id                 UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_preq_id DEFAULT NEWSEQUENTIALID(),
    equipo_id          UNIQUEIDENTIFIER  NOT NULL, -- FK implicita -> equipos.equipos(id)
    bombero_id         UNIQUEIDENTIFIER  NULL, -- referencia inferida
    servicio_id        UNIQUEIDENTIFIER  NULL, -- referencia inferida -> servicios.servicios(id)
    fecha_prestamo     DATE              NOT NULL,
    fecha_devolucion   DATE              NULL,
    estado             NVARCHAR(20)      NOT NULL CONSTRAINT DF_preq_estado DEFAULT N'PRESTADO',
    observaciones      NVARCHAR(MAX)     NULL,
    creado_en          DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_preq_creado DEFAULT SYSDATETIMEOFFSET(), -- sin actualizado_en
    creado_por         UNIQUEIDENTIFIER  NULL, -- referencia inferida
    CONSTRAINT PK_prestamos_equipos PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_preq_estado CHECK (estado IN ('PRESTADO','DEVUELTO','EXTRAVIADO','DANIADO'))
);
GO


/* ==========================================================================
   ESQUEMA: servicios  (4 tablas) — 007_servicios.sql
   ========================================================================== */

CREATE TABLE servicios.tipos_servicio (
    id                          UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_tserv_id DEFAULT NEWSEQUENTIALID(),
    codigo                      NVARCHAR(20)      NOT NULL,
    nombre                      NVARCHAR(100)     NOT NULL,
    descripcion                 NVARCHAR(MAX)     NULL,
    color                       NVARCHAR(7)       NOT NULL CONSTRAINT DF_tserv_color DEFAULT N'#3B82F6',
    icono                       NVARCHAR(50)      NULL,
    prioridad                   INT               NOT NULL CONSTRAINT DF_tserv_prioridad DEFAULT 0,
    requiere_ro                 BIT               NOT NULL CONSTRAINT DF_tserv_reqro DEFAULT 0, -- RO = Responsable de Operacion
    requiere_vehiculo           BIT               NOT NULL CONSTRAINT DF_tserv_reqveh DEFAULT 1,
    tiempo_estimado_minutos     INT               NULL,
    activo                      BIT               NOT NULL CONSTRAINT DF_tserv_activo DEFAULT 1,
    metadata                    NVARCHAR(MAX)     NULL,
    creado_en                   DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_tserv_creado DEFAULT SYSDATETIMEOFFSET(), -- sin actualizado_en
    CONSTRAINT PK_tipos_servicio PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_tipos_servicio_codigo UNIQUE (codigo),
    CONSTRAINT CK_tser_meta CHECK (metadata IS NULL OR ISJSON(metadata) = 1)
);
GO

CREATE TABLE servicios.servicios (
    id                        UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_serv_id DEFAULT NEWSEQUENTIALID(),
    tipo_servicio_id          UNIQUEIDENTIFIER  NOT NULL,
    numero_servicio           NVARCHAR(20)      NOT NULL,
    fecha_hora_aviso          DATETIMEOFFSET(3) NOT NULL,
    fecha_hora_salida         DATETIMEOFFSET(3) NULL,
    fecha_hora_llegada        DATETIMEOFFSET(3) NULL,
    fecha_hora_fin            DATETIMEOFFSET(3) NULL,
    direccion                 NVARCHAR(MAX)     NOT NULL,
    ciudad                    NVARCHAR(100)     NULL,
    coordenadas_lat           DECIMAL(10,8)     NULL,
    coordenadas_lon           DECIMAL(11,8)     NULL,
    descripcion               NVARCHAR(MAX)     NULL,
    gravedad                  NVARCHAR(20)      NULL,
    estado                    NVARCHAR(20)      NOT NULL CONSTRAINT DF_serv_estado DEFAULT N'REGISTRADO',
    vehiculo_principal_id     UNIQUEIDENTIFIER  NULL,
    oficial_ro_id             UNIQUEIDENTIFIER  NULL,
    jefe_servicio_id          UNIQUEIDENTIFIER  NULL,
    kilometraje_salida        INT               NULL,
    kilometraje_llegada       INT               NULL,
    kilometraje_total AS (kilometraje_llegada - kilometraje_salida) PERSISTED,
    combustible_usado         DECIMAL(10,2)     NULL,
    tiempo_total_minutos      INT               NULL,
    informe                   NVARCHAR(MAX)     NULL,
    conclusiones              NVARCHAR(MAX)     NULL,
    recomendaciones           NVARCHAR(MAX)     NULL,
    fotos                     NVARCHAR(MAX)     NOT NULL CONSTRAINT DF_serv_fotos DEFAULT N'[]',
    documentos                NVARCHAR(MAX)     NOT NULL CONSTRAINT DF_serv_docs DEFAULT N'[]',
    creado_en                 DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_serv_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en            DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_serv_act DEFAULT SYSDATETIMEOFFSET(),
    creado_por                UNIQUEIDENTIFIER  NULL,
    CONSTRAINT PK_servicios PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_servicios_numero UNIQUE (numero_servicio),
    CONSTRAINT CK_ser_gravedad CHECK (gravedad IS NULL OR gravedad IN ('LEVE','MODERADA','GRAVE','CRITICA')),
    CONSTRAINT CK_ser_estado CHECK (estado IN ('REGISTRADO','DESPACHADO','EN_CURSO','FINALIZADO','CANCELADO')),
    CONSTRAINT CK_ser_fotos CHECK (ISJSON(fotos) = 1),
    CONSTRAINT CK_ser_docs CHECK (ISJSON(documentos) = 1)
);
GO

CREATE TABLE servicios.personal_servicio (
    id                UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_perser_id DEFAULT NEWSEQUENTIALID(),
    servicio_id       UNIQUEIDENTIFIER  NOT NULL,
    bombero_id        UNIQUEIDENTIFIER  NOT NULL,
    rol               NVARCHAR(50)      NOT NULL,
    horas_servicio    INT               NOT NULL CONSTRAINT DF_perser_horas DEFAULT 0,
    observaciones     NVARCHAR(MAX)     NULL,
    CONSTRAINT PK_personal_servicio PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_personal_servicio UNIQUE (servicio_id, bombero_id)
);
GO

CREATE TABLE servicios.historial_servicios (
    id                  UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_hser_id DEFAULT NEWSEQUENTIALID(),
    servicio_id         UNIQUEIDENTIFIER  NOT NULL,
    timestamp_evento    DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_hser_timestamp DEFAULT SYSDATETIMEOFFSET(),
    tipo_evento         NVARCHAR(30)      NOT NULL,
    latitud             DECIMAL(10,8)     NULL,
    longitud            DECIMAL(11,8)     NULL,
    velocidad_kmh       DECIMAL(5,2)      NULL,
    direccion           NVARCHAR(MAX)     NULL,
    datos               NVARCHAR(MAX)     NULL,
    creado_por          UNIQUEIDENTIFIER  NULL,
    CONSTRAINT PK_historial_servicios PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_hser_tipo CHECK (tipo_evento IN ('SALIDA','LLEGADA','GPS','COMBUSTIBLE','INCIDENTE','FIN')),
    CONSTRAINT CK_hser_datos CHECK (datos IS NULL OR ISJSON(datos) = 1)
);
GO


/* ==========================================================================
   ESQUEMA: finanzas  (2 tablas) — 008_admin.sql
   ========================================================================== */

CREATE TABLE finanzas.cuentas_contables (
    id             UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_cta_id DEFAULT NEWSEQUENTIALID(),
    codigo         NVARCHAR(20)      NOT NULL,
    nombre         NVARCHAR(200)     NOT NULL,
    tipo           NVARCHAR(20)      NOT NULL,
    descripcion    NVARCHAR(MAX)     NULL,
    activa         BIT               NOT NULL CONSTRAINT DF_cta_activa DEFAULT 1,
    creado_en      DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_cta_creado DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_cuentas_contables PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_cuentas_contables_codigo UNIQUE (codigo),
    CONSTRAINT CK_cta_tipo CHECK (tipo IN ('INGRESO','GASTO','ACTIVO','PASIVO'))
);
GO

CREATE TABLE finanzas.movimientos (
    id                UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_mov_id DEFAULT NEWSEQUENTIALID(),
    cuenta_id         UNIQUEIDENTIFIER  NOT NULL,
    tipo              NVARCHAR(10)      NOT NULL,
    fecha             DATE              NOT NULL,
    descripcion       NVARCHAR(MAX)     NOT NULL,
    monto             DECIMAL(15,2)     NOT NULL,
    categoria         NVARCHAR(50)      NULL,
    forma_pago        NVARCHAR(30)      NULL,
    referencia        NVARCHAR(100)     NULL,
    comprobante_url   NVARCHAR(MAX)     NULL,
    proyecto          NVARCHAR(100)     NULL,
    donante_id        UNIQUEIDENTIFIER  NULL, -- referencia opcional a un bombero que actua como donante
    proveedor         NVARCHAR(200)     NULL,
    creado_en         DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_mov_creado DEFAULT SYSDATETIMEOFFSET(),
    creado_por        UNIQUEIDENTIFIER  NULL,
    CONSTRAINT PK_movimientos PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_mov_tipo CHECK (tipo IN ('INGRESO','EGRESO'))
);
GO


/* ==========================================================================
   ESQUEMA: deposito  (2 tablas) — 008_admin.sql
   ========================================================================== */

CREATE TABLE deposito.items_deposito (
    id                    UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_item_id DEFAULT NEWSEQUENTIALID(),
    codigo                NVARCHAR(50)      NOT NULL,
    nombre                NVARCHAR(200)     NOT NULL,
    descripcion           NVARCHAR(MAX)     NULL,
    categoria             NVARCHAR(50)      NOT NULL,
    unidad_medida         NVARCHAR(20)      NOT NULL,
    stock_actual          DECIMAL(15,2)     NOT NULL CONSTRAINT DF_item_stockact DEFAULT 0,
    stock_minimo          DECIMAL(15,2)     NOT NULL CONSTRAINT DF_item_stockmin DEFAULT 0,
    stock_maximo          DECIMAL(15,2)     NULL,
    ubicacion             NVARCHAR(100)     NULL,
    proveedor             NVARCHAR(200)     NULL,
    fecha_vencimiento     DATE              NULL,
    lote                  NVARCHAR(50)      NULL,
    precio_unitario       DECIMAL(15,2)     NULL,
    alerta_stock_bajo     BIT               NOT NULL CONSTRAINT DF_item_alertastock DEFAULT 0,
    alerta_vencimiento    BIT               NOT NULL CONSTRAINT DF_item_alertavenc DEFAULT 0,
    qr_code               NVARCHAR(200)     NULL,
    creado_en             DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_item_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en        DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_item_act DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_items_deposito PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_items_deposito_codigo UNIQUE (codigo),
    CONSTRAINT CK_item_categoria CHECK (categoria IN ('ESPUMA','COMBUSTIBLE','GUANTES','GASAS','MEDICAMENTOS','PAPELERIA','LIMPIEZA','OTROS'))
);
GO

CREATE TABLE deposito.movimientos_deposito (
    id                 UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_movdep_id DEFAULT NEWSEQUENTIALID(),
    item_id            UNIQUEIDENTIFIER  NOT NULL,
    tipo               NVARCHAR(10)      NOT NULL,
    fecha              DATE              NOT NULL,
    cantidad           DECIMAL(15,2)     NOT NULL,
    motivo             NVARCHAR(100)     NOT NULL,
    servicio_id        UNIQUEIDENTIFIER  NULL,
    bombero_id         UNIQUEIDENTIFIER  NULL,
    comprobante_url    NVARCHAR(MAX)     NULL,
    observaciones      NVARCHAR(MAX)     NULL,
    creado_en          DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_movdep_creado DEFAULT SYSDATETIMEOFFSET(),
    creado_por         UNIQUEIDENTIFIER  NULL,
    CONSTRAINT PK_movimientos_deposito PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_movdep_tipo CHECK (tipo IN ('ENTRADA','SALIDA'))
);
GO


/* ==========================================================================
   ESQUEMA: documentos  (1 tabla) — 008_admin.sql
   ========================================================================== */

CREATE TABLE documentos.documentos (
    id                     UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_doc_id DEFAULT NEWSEQUENTIALID(),
    tipo                   NVARCHAR(50)      NOT NULL,
    titulo                 NVARCHAR(200)     NOT NULL,
    contenido              NVARCHAR(MAX)     NULL,
    fecha_emision          DATE              NOT NULL,
    fecha_vencimiento      DATE              NULL,
    numero_oficial         NVARCHAR(100)     NULL,
    bombero_id             UNIQUEIDENTIFIER  NULL,
    servicio_id            UNIQUEIDENTIFIER  NULL,
    estado                 NVARCHAR(20)      NOT NULL CONSTRAINT DF_doc_estado DEFAULT N'ACTIVO',
    archivo_url             NVARCHAR(MAX)     NULL,
    archivo_firmado_url     NVARCHAR(MAX)     NULL,
    firma_digital           BIT               NOT NULL CONSTRAINT DF_doc_firmadig DEFAULT 0,
    metadata                NVARCHAR(MAX)     NULL,
    creado_en                DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_doc_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en           DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_doc_act DEFAULT SYSDATETIMEOFFSET(),
    creado_por               UNIQUEIDENTIFIER  NULL,
    CONSTRAINT PK_documentos PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_doc_tipo CHECK (tipo IN ('RESOLUCION','CIRCULAR','CITACION','NOTA','PERMISO','JUSTIFICACION','ACTA','INFORME')),
    CONSTRAINT CK_doc_estado CHECK (estado IN ('ACTIVO','ARCHIVADO','VENCIDO')),
    CONSTRAINT CK_doc_meta CHECK (metadata IS NULL OR ISJSON(metadata) = 1)
);
GO

/* Fin de 04_create_tables.sql — 59 tablas creadas. */
