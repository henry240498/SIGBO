/* =============================================================
   SIGBO-CBVC | Migracion 057 - Modulo Inteligencia Artificial, estructura base
   =============================================================
   Asistente institucional configurable (Snoopy es la configuracion actual
   de ESTA institucion, no una condicion fija del sistema -- seccion 1-2
   del pedido). Arquitectura: usuario -> permisos -> herramienta controlada
   -> datos autorizados -> IA -> respuesta (seccion 9/73). La IA nunca
   tiene acceso propio a la base de datos.

   Reutiliza sin duplicar: seguridad.usuarios (autoria/auditoria),
   seguridad.log_auditoria (via AuditoriaService para cambios
   administrativos de configuracion), documentos.documentos_institucionales
   (fuente documental, ver migracion 059 -- flag disponible_para_ia en vez
   de una tabla de "conocimiento" separada). No existe institucion_id
   real en SIGBO todavia (ver identidad_institucional.entity.ts): se deja
   la columna nullable/sin FK en cada tabla, mismo patron ya usado en
   Documentos/Finanzas, para no romper cuando se implemente multi-institucion.
   ============================================================= */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF SCHEMA_ID('ia') IS NULL EXEC('CREATE SCHEMA ia');
GO

/* --- ia.configuraciones (fila unica por institucion, patron
   IdentidadInstitucional/ConfiguracionSistema: hoy una sola fila) --- */

IF OBJECT_ID(N'ia.configuraciones', N'U') IS NULL
BEGIN
    CREATE TABLE ia.configuraciones (
        id                             UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_iacfg_id DEFAULT NEWSEQUENTIALID(),
        institucion_id                 UNIQUEIDENTIFIER NULL,
        nombre                         NVARCHAR(100) NOT NULL CONSTRAINT DF_iacfg_nombre DEFAULT N'Snoopy',
        personaje                      NVARCHAR(150) NULL,
        descripcion                    NVARCHAR(500) NULL,
        avatar_url                     NVARCHAR(500) NULL,
        personalidad                   NVARCHAR(MAX) NULL,
        saludo                         NVARCHAR(500) NULL,
        formalidad                     NVARCHAR(10)  NOT NULL CONSTRAINT DF_iacfg_formalidad DEFAULT N'MEDIA',
        permite_emojis                 BIT           NOT NULL CONSTRAINT DF_iacfg_emojis DEFAULT 1,
        instrucciones_institucionales  NVARCHAR(MAX) NULL,
        proveedor                      NVARCHAR(30)  NOT NULL CONSTRAINT DF_iacfg_proveedor DEFAULT N'ANTHROPIC',
        modelo                         NVARCHAR(100) NOT NULL CONSTRAINT DF_iacfg_modelo DEFAULT N'claude-sonnet-5',
        estado                         NVARCHAR(20)  NOT NULL CONSTRAINT DF_iacfg_estado DEFAULT N'ACTIVA',
        motivo_desactivacion           NVARCHAR(500) NULL,
        mensaje_mantenimiento          NVARCHAR(300) NULL,
        limite_consultas_minuto        INT           NOT NULL CONSTRAINT DF_iacfg_limmin DEFAULT 8,
        limite_consultas_hora          INT           NOT NULL CONSTRAINT DF_iacfg_limhora DEFAULT 60,
        modulos_habilitados_json       NVARCHAR(MAX) NOT NULL CONSTRAINT DF_iacfg_modulos DEFAULT N'["personal","organizacion","guardias","asistencia","servicios","vehiculos","equipos","academia","deposito","finanzas","documentos"]',
        creado_en                      DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_iacfg_creado DEFAULT SYSDATETIMEOFFSET(),
        actualizado_en                 DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_iacfg_act DEFAULT SYSDATETIMEOFFSET(),
        actualizado_por                UNIQUEIDENTIFIER NULL,
        CONSTRAINT PK_ia_configuraciones PRIMARY KEY CLUSTERED (id),
        CONSTRAINT CK_iacfg_formalidad CHECK (formalidad IN (N'BAJA', N'MEDIA', N'ALTA')),
        CONSTRAINT CK_iacfg_estado CHECK (estado IN (N'ACTIVA', N'INACTIVA', N'MANTENIMIENTO')),
        CONSTRAINT FK_iacfg_actualizadopor FOREIGN KEY (actualizado_por) REFERENCES seguridad.usuarios(id)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM ia.configuraciones)
    INSERT INTO ia.configuraciones (nombre, personaje, descripcion, personalidad, saludo, formalidad, permite_emojis)
    VALUES (
        N'Snoopy',
        N'Mascota y asistente virtual del Cuerpo de Bomberos',
        N'Asistente institucional de SIGBO: consulta, explica, orienta y conversa. No tiene autoridad administrativa.',
        N'Amable, cercana, respetuosa, institucional, servicial, motivadora, clara y prudente. Nunca arrogante ni autoritaria. Nunca finge tener autoridad que no posee.',
        N'¡Hola! 🐶 ¿En qué puedo ayudarte?',
        N'MEDIA',
        1
    );
GO

/* --- ia.historial_configuracion (seccion 38: valor anterior/nuevo/
   usuario/fecha/ip/motivo de cada cambio de configuracion) --- */

IF OBJECT_ID(N'ia.historial_configuracion', N'U') IS NULL
BEGIN
    CREATE TABLE ia.historial_configuracion (
        id                    UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_iahc_id DEFAULT NEWSEQUENTIALID(),
        configuracion_id      UNIQUEIDENTIFIER NOT NULL,
        valor_anterior_json   NVARCHAR(MAX) NOT NULL,
        valor_nuevo_json      NVARCHAR(MAX) NOT NULL,
        motivo                NVARCHAR(500) NULL,
        usuario_id            UNIQUEIDENTIFIER NOT NULL,
        ip                    NVARCHAR(64) NULL,
        creado_en             DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_iahc_creado DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT PK_ia_historial_configuracion PRIMARY KEY CLUSTERED (id),
        CONSTRAINT FK_iahc_config FOREIGN KEY (configuracion_id) REFERENCES ia.configuraciones(id),
        CONSTRAINT FK_iahc_usuario FOREIGN KEY (usuario_id) REFERENCES seguridad.usuarios(id)
    );
END
GO

/* --- ia.conversaciones / ia.mensajes (secciones 6-7: no solo la ultima
   pregunta, estructura consultable de mensajes usuario/IA/sistema/
   herramienta, no un texto gigante) --- */

IF OBJECT_ID(N'ia.conversaciones', N'U') IS NULL
BEGIN
    CREATE TABLE ia.conversaciones (
        id                    UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_iaconv_id DEFAULT NEWSEQUENTIALID(),
        institucion_id        UNIQUEIDENTIFIER NULL,
        usuario_id            UNIQUEIDENTIFIER NOT NULL,
        titulo                NVARCHAR(200) NULL,
        estado                NVARCHAR(20)  NOT NULL CONSTRAINT DF_iaconv_estado DEFAULT N'ACTIVA',
        ip                    NVARCHAR(64) NULL,
        user_agent            NVARCHAR(300) NULL,
        iniciada_en           DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_iaconv_inicio DEFAULT SYSDATETIMEOFFSET(),
        ultima_actividad_en   DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_iaconv_act DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT PK_ia_conversaciones PRIMARY KEY CLUSTERED (id),
        CONSTRAINT CK_iaconv_estado CHECK (estado IN (N'ACTIVA', N'CERRADA')),
        CONSTRAINT FK_iaconv_usuario FOREIGN KEY (usuario_id) REFERENCES seguridad.usuarios(id)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_iaconv_usuario' AND object_id = OBJECT_ID('ia.conversaciones'))
    CREATE INDEX IX_iaconv_usuario ON ia.conversaciones(usuario_id);
GO

IF OBJECT_ID(N'ia.mensajes', N'U') IS NULL
BEGIN
    CREATE TABLE ia.mensajes (
        id                UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_iamsg_id DEFAULT NEWSEQUENTIALID(),
        conversacion_id   UNIQUEIDENTIFIER NOT NULL,
        rol               NVARCHAR(20)  NOT NULL,
        contenido         NVARCHAR(MAX) NOT NULL,
        modelo_utilizado  NVARCHAR(100) NULL,
        tokens_entrada    INT NULL,
        tokens_salida     INT NULL,
        duracion_ms       INT NULL,
        fuentes_json      NVARCHAR(MAX) NULL,
        resultado         NVARCHAR(20)  NOT NULL CONSTRAINT DF_iamsg_resultado DEFAULT N'OK',
        error_detalle     NVARCHAR(500) NULL,
        creado_en         DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_iamsg_creado DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT PK_ia_mensajes PRIMARY KEY CLUSTERED (id),
        CONSTRAINT CK_iamsg_rol CHECK (rol IN (N'USUARIO', N'IA', N'SISTEMA', N'HERRAMIENTA')),
        CONSTRAINT CK_iamsg_resultado CHECK (resultado IN (N'OK', N'DENEGADO', N'ERROR', N'BLOQUEADO')),
        CONSTRAINT FK_iamsg_conversacion FOREIGN KEY (conversacion_id) REFERENCES ia.conversaciones(id) ON DELETE CASCADE
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_iamsg_conversacion' AND object_id = OBJECT_ID('ia.mensajes'))
    CREATE INDEX IX_iamsg_conversacion ON ia.mensajes(conversacion_id);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_iamsg_creado' AND object_id = OBJECT_ID('ia.mensajes'))
    CREATE INDEX IX_iamsg_creado ON ia.mensajes(creado_en);
GO

/* --- ia.ejecuciones_herramientas (secciones 8/12/45: cada llamada a una
   herramienta controlada queda auditada -- lista blanca, nunca SQL libre) --- */

IF OBJECT_ID(N'ia.ejecuciones_herramientas', N'U') IS NULL
BEGIN
    CREATE TABLE ia.ejecuciones_herramientas (
        id                          UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_iaeh_id DEFAULT NEWSEQUENTIALID(),
        mensaje_id                  UNIQUEIDENTIFIER NULL,
        conversacion_id             UNIQUEIDENTIFIER NOT NULL,
        usuario_id                  UNIQUEIDENTIFIER NOT NULL,
        herramienta                 NVARCHAR(60) NOT NULL,
        argumentos_json             NVARCHAR(MAX) NULL,
        permiso_evaluado            NVARCHAR(60) NULL,
        resultado                   NVARCHAR(20) NOT NULL,
        datos_consultados_resumen   NVARCHAR(300) NULL,
        error_detalle               NVARCHAR(500) NULL,
        duracion_ms                 INT NULL,
        creado_en                   DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_iaeh_creado DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT PK_ia_ejecuciones_herramientas PRIMARY KEY CLUSTERED (id),
        CONSTRAINT CK_iaeh_resultado CHECK (resultado IN (N'PERMITIDO', N'DENEGADO', N'ERROR')),
        CONSTRAINT FK_iaeh_mensaje FOREIGN KEY (mensaje_id) REFERENCES ia.mensajes(id) ON DELETE CASCADE,
        CONSTRAINT FK_iaeh_conversacion FOREIGN KEY (conversacion_id) REFERENCES ia.conversaciones(id),
        CONSTRAINT FK_iaeh_usuario FOREIGN KEY (usuario_id) REFERENCES seguridad.usuarios(id)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_iaeh_conversacion' AND object_id = OBJECT_ID('ia.ejecuciones_herramientas'))
    CREATE INDEX IX_iaeh_conversacion ON ia.ejecuciones_herramientas(conversacion_id);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_iaeh_resultado' AND object_id = OBJECT_ID('ia.ejecuciones_herramientas'))
    CREATE INDEX IX_iaeh_resultado ON ia.ejecuciones_herramientas(resultado);
GO

/* --- ia.propuestas_mejora (secciones 36-39: BORRADOR->PROPUESTA->REVISION
   ->APROBADO->PUBLICADO, la IA nunca se modifica a si misma) --- */

IF OBJECT_ID(N'ia.propuestas_mejora', N'U') IS NULL
BEGIN
    CREATE TABLE ia.propuestas_mejora (
        id                    UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_iaprop_id DEFAULT NEWSEQUENTIALID(),
        institucion_id        UNIQUEIDENTIFIER NULL,
        origen                NVARCHAR(10)  NOT NULL,
        problema_detectado    NVARCHAR(MAX) NOT NULL,
        propuesta_texto       NVARCHAR(MAX) NOT NULL,
        estado                NVARCHAR(20)  NOT NULL CONSTRAINT DF_iaprop_estado DEFAULT N'BORRADOR',
        creado_por            UNIQUEIDENTIFIER NULL,
        revisado_por          UNIQUEIDENTIFIER NULL,
        fecha_revision        DATETIMEOFFSET(3) NULL,
        motivo_decision       NVARCHAR(500) NULL,
        creado_en             DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_iaprop_creado DEFAULT SYSDATETIMEOFFSET(),
        actualizado_en        DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_iaprop_act DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT PK_ia_propuestas_mejora PRIMARY KEY CLUSTERED (id),
        CONSTRAINT CK_iaprop_origen CHECK (origen IN (N'IA', N'USUARIO')),
        CONSTRAINT CK_iaprop_estado CHECK (estado IN (N'BORRADOR', N'PROPUESTA', N'REVISION', N'APROBADO', N'RECHAZADO', N'PUBLICADO')),
        CONSTRAINT FK_iaprop_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id),
        CONSTRAINT FK_iaprop_revisadopor FOREIGN KEY (revisado_por) REFERENCES seguridad.usuarios(id)
    );
END
GO
