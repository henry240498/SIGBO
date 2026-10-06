/* =============================================================
   SIGBO-CBVC | Migracion 079 - Llamados y convocatorias
   =============================================================
   Fase 2 de la hoja de ruta (docs/HOJA-DE-RUTA-FUNCIONALIDADES.md):
   2.1 cuadro de llamados del radio operador y 2.2 convocatoria con
   confirmacion "voy en camino".

   Trazabilidad normativa (docs/REGLAMENTO_GENERAL_CBVC_TRAZABILIDAD.md):
   Radio y comunicaciones, Arts. 249-258: el radio operador registra la
   llamada, la direccion y el despacho. El llamado SOLO REGISTRA el hecho;
   convertirlo en servicio y despachar unidades sigue siendo decision del
   mando (servicios:crear / servicios:despachar). La convocatoria no
   obliga: cada bombero responde VOY o NO_PUEDO y queda registrado.
   La auditoria de cada accion vive en seguridad.logs_auditoria. */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

/* --- 1) Llamados --- */
IF OBJECT_ID('servicios.llamados', 'U') IS NULL
BEGIN
    CREATE TABLE servicios.llamados (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_llam_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_llamados PRIMARY KEY,
        recibido_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_llam_recibido DEFAULT SYSDATETIMEOFFSET(),
        medio NVARCHAR(40) NOT NULL,
        llamante_nombre NVARCHAR(150) NULL,
        llamante_telefono NVARCHAR(40) NULL,
        direccion NVARCHAR(300) NOT NULL,
        referencia NVARCHAR(300) NULL,
        descripcion NVARCHAR(1000) NULL,
        tipo_servicio_id UNIQUEIDENTIFIER NULL,
        estado NVARCHAR(20) NOT NULL CONSTRAINT DF_llam_estado DEFAULT 'RECIBIDO'
            CONSTRAINT CK_llam_estado CHECK (estado IN ('RECIBIDO', 'EN_ATENCION', 'CERRADO')),
        servicio_id UNIQUEIDENTIFIER NULL,
        motivo_cierre NVARCHAR(500) NULL,
        recibido_por UNIQUEIDENTIFIER NOT NULL,
        cerrado_por UNIQUEIDENTIFIER NULL,
        cerrado_en DATETIMEOFFSET(3) NULL,
        creado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_llam_creado DEFAULT SYSDATETIMEOFFSET(),
        actualizado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_llam_actualizado DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT FK_llam_tipo FOREIGN KEY (tipo_servicio_id) REFERENCES servicios.tipos_servicio(id),
        CONSTRAINT FK_llam_servicio FOREIGN KEY (servicio_id) REFERENCES servicios.servicios(id),
        CONSTRAINT FK_llam_recibidopor FOREIGN KEY (recibido_por) REFERENCES seguridad.usuarios(id),
        CONSTRAINT FK_llam_cerradopor FOREIGN KEY (cerrado_por) REFERENCES seguridad.usuarios(id)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_llam_estado_recibido' AND object_id = OBJECT_ID('servicios.llamados'))
    CREATE INDEX IX_llam_estado_recibido ON servicios.llamados (estado, recibido_en DESC);
GO

/* --- 2) Convocatorias --- */
IF OBJECT_ID('servicios.convocatorias', 'U') IS NULL
BEGIN
    CREATE TABLE servicios.convocatorias (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_conv_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_convocatorias PRIMARY KEY,
        llamado_id UNIQUEIDENTIFIER NULL,
        servicio_id UNIQUEIDENTIFIER NULL,
        mensaje NVARCHAR(500) NOT NULL,
        estado NVARCHAR(20) NOT NULL CONSTRAINT DF_conv_estado DEFAULT 'ABIERTA'
            CONSTRAINT CK_conv_estado CHECK (estado IN ('ABIERTA', 'CERRADA')),
        creada_por UNIQUEIDENTIFIER NOT NULL,
        creado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_conv_creado DEFAULT SYSDATETIMEOFFSET(),
        cerrada_en DATETIMEOFFSET(3) NULL,
        cerrada_por UNIQUEIDENTIFIER NULL,
        CONSTRAINT FK_conv_llamado FOREIGN KEY (llamado_id) REFERENCES servicios.llamados(id),
        CONSTRAINT FK_conv_servicio FOREIGN KEY (servicio_id) REFERENCES servicios.servicios(id),
        CONSTRAINT FK_conv_creadapor FOREIGN KEY (creada_por) REFERENCES seguridad.usuarios(id),
        CONSTRAINT FK_conv_cerradapor FOREIGN KEY (cerrada_por) REFERENCES seguridad.usuarios(id)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_conv_estado_creado' AND object_id = OBJECT_ID('servicios.convocatorias'))
    CREATE INDEX IX_conv_estado_creado ON servicios.convocatorias (estado, creado_en DESC);
GO

/* --- 3) Respuestas: una por bombero y convocatoria (cambiarla actualiza la fila) --- */
IF OBJECT_ID('servicios.convocatoria_respuestas', 'U') IS NULL
BEGIN
    CREATE TABLE servicios.convocatoria_respuestas (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_convresp_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_convocatoria_respuestas PRIMARY KEY,
        convocatoria_id UNIQUEIDENTIFIER NOT NULL,
        usuario_id UNIQUEIDENTIFIER NOT NULL,
        usuario_nombre NVARCHAR(200) NOT NULL,
        respuesta NVARCHAR(10) NOT NULL CONSTRAINT CK_convresp_respuesta CHECK (respuesta IN ('VOY', 'NO_PUEDO')),
        eta_minutos INT NULL CONSTRAINT CK_convresp_eta CHECK (eta_minutos IS NULL OR (eta_minutos BETWEEN 0 AND 600)),
        respondido_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_convresp_respondido DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT UQ_convresp_conv_usuario UNIQUE (convocatoria_id, usuario_id),
        CONSTRAINT FK_convresp_conv FOREIGN KEY (convocatoria_id) REFERENCES servicios.convocatorias(id) ON DELETE CASCADE,
        CONSTRAINT FK_convresp_usuario FOREIGN KEY (usuario_id) REFERENCES seguridad.usuarios(id)
    );
END
GO

/* --- 4) Permiso nuevo: servicios:convocar ---
   Llamados reutiliza servicios:ver/crear/editar; responder una convocatoria
   solo exige servicios:ver (lo que ya tienen los usuarios de la app). */
INSERT INTO seguridad.permisos (nombre, recurso, accion, categoria)
SELECT N'servicios:convocar', N'servicios', N'convocar', N'Servicios'
WHERE NOT EXISTS (SELECT 1 FROM seguridad.permisos WHERE nombre = N'servicios:convocar');
GO

INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT DISTINCT a.rol_id, nuevo.id
FROM seguridad.asignacion_permisos_rol a
JOIN seguridad.permisos origen ON origen.id = a.permiso_id AND origen.nombre = N'servicios:despachar'
CROSS JOIN (SELECT id FROM seguridad.permisos WHERE nombre = N'servicios:convocar') nuevo
WHERE NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol x WHERE x.rol_id = a.rol_id AND x.permiso_id = nuevo.id);
GO

INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id FROM seguridad.roles r CROSS JOIN seguridad.permisos p
WHERE r.nombre = N'Administrador General' AND p.nombre = N'servicios:convocar'
    AND NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol a WHERE a.rol_id = r.id AND a.permiso_id = p.id);
GO
