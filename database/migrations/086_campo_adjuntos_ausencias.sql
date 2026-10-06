/* =============================================================
   SIGBO-CBVC | Migracion 086 - Adjuntos de terreno, victimas, ausencias y avisos
   =============================================================
   - servicios.adjuntos: fotos y firmas tomadas desde el celular (el archivo
     vive en private_uploads/adjuntos-campo; aqui solo la referencia).
   - servicios.victimas_servicio: personas rescatadas, heridas, fallecidas o
     evacuadas en un servicio (solo se registra el hecho; no es un diagnostico).
   - operaciones.ausencias: permisos de ausencia con aprobacion; una ausencia
     aprobada marca al bombero como no disponible en la disponibilidad en vivo.
   - personal.avisos_vencimiento: registro de lo ya avisado, para no repetir el
     mismo aviso de vencimiento cada vez que corre el control. */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID('servicios.adjuntos', 'U') IS NULL
BEGIN
    CREATE TABLE servicios.adjuntos (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_adj_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_adjuntos PRIMARY KEY,
        entidad NVARCHAR(20) NOT NULL
            CONSTRAINT CK_adj_entidad CHECK (entidad IN ('SERVICIO', 'DESPACHO', 'VEHICULO', 'HIDRANTE', 'PUNTO_RIESGO')),
        entidad_id UNIQUEIDENTIFIER NOT NULL,
        tipo NVARCHAR(10) NOT NULL CONSTRAINT CK_adj_tipo CHECK (tipo IN ('FOTO', 'FIRMA')),
        descripcion NVARCHAR(200) NULL,
        referencia NVARCHAR(200) NOT NULL,
        tamano_bytes INT NOT NULL,
        clave_idempotencia NVARCHAR(64) NULL,
        subido_por UNIQUEIDENTIFIER NOT NULL,
        tomado_en DATETIMEOFFSET(3) NOT NULL,
        creado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_adj_creado DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT FK_adj_subidopor FOREIGN KEY (subido_por) REFERENCES seguridad.usuarios(id)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_adj_entidad' AND object_id = OBJECT_ID('servicios.adjuntos'))
    CREATE INDEX IX_adj_entidad ON servicios.adjuntos (entidad, entidad_id, creado_en DESC);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_adj_clave' AND object_id = OBJECT_ID('servicios.adjuntos'))
    CREATE UNIQUE INDEX UX_adj_clave ON servicios.adjuntos (clave_idempotencia) WHERE clave_idempotencia IS NOT NULL;
GO

IF OBJECT_ID('servicios.victimas_servicio', 'U') IS NULL
BEGIN
    CREATE TABLE servicios.victimas_servicio (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_vic_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_victimas_servicio PRIMARY KEY,
        servicio_id UNIQUEIDENTIFIER NOT NULL,
        categoria NVARCHAR(10) NOT NULL
            CONSTRAINT CK_vic_categoria CHECK (categoria IN ('RESCATADA', 'HERIDA', 'FALLECIDA', 'EVACUADA')),
        cantidad INT NOT NULL CONSTRAINT CK_vic_cantidad CHECK (cantidad BETWEEN 1 AND 500),
        observacion NVARCHAR(500) NULL,
        registrado_por UNIQUEIDENTIFIER NOT NULL,
        creado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_vic_creado DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT FK_vic_servicio FOREIGN KEY (servicio_id) REFERENCES servicios.servicios(id),
        CONSTRAINT FK_vic_registradopor FOREIGN KEY (registrado_por) REFERENCES seguridad.usuarios(id)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_vic_servicio' AND object_id = OBJECT_ID('servicios.victimas_servicio'))
    CREATE INDEX IX_vic_servicio ON servicios.victimas_servicio (servicio_id);
GO

IF OBJECT_ID('operaciones.ausencias', 'U') IS NULL
BEGIN
    CREATE TABLE operaciones.ausencias (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_aus_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_ausencias PRIMARY KEY,
        bombero_id UNIQUEIDENTIFIER NOT NULL,
        desde DATE NOT NULL,
        hasta DATE NOT NULL,
        motivo NVARCHAR(300) NOT NULL,
        estado NVARCHAR(12) NOT NULL CONSTRAINT DF_aus_estado DEFAULT 'SOLICITADA'
            CONSTRAINT CK_aus_estado CHECK (estado IN ('SOLICITADA', 'APROBADA', 'RECHAZADA', 'CANCELADA')),
        motivo_decision NVARCHAR(300) NULL,
        solicitada_por UNIQUEIDENTIFIER NOT NULL,
        decidida_por UNIQUEIDENTIFIER NULL,
        decidida_en DATETIMEOFFSET(3) NULL,
        creado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_aus_creado DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT CK_aus_fechas CHECK (hasta >= desde),
        CONSTRAINT FK_aus_bombero FOREIGN KEY (bombero_id) REFERENCES personal.bomberos(id),
        CONSTRAINT FK_aus_solicitadapor FOREIGN KEY (solicitada_por) REFERENCES seguridad.usuarios(id),
        CONSTRAINT FK_aus_decididapor FOREIGN KEY (decidida_por) REFERENCES seguridad.usuarios(id)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_aus_bombero_fechas' AND object_id = OBJECT_ID('operaciones.ausencias'))
    CREATE INDEX IX_aus_bombero_fechas ON operaciones.ausencias (bombero_id, desde, hasta);
GO

IF OBJECT_ID('personal.avisos_vencimiento', 'U') IS NULL
BEGIN
    CREATE TABLE personal.avisos_vencimiento (
        clave NVARCHAR(200) NOT NULL CONSTRAINT PK_avisos_vencimiento PRIMARY KEY,
        avisado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_avv_en DEFAULT SYSDATETIMEOFFSET()
    );
END
GO

/* --- Permisos --- */
INSERT INTO seguridad.permisos (nombre, recurso, accion, categoria)
SELECT v.nombre, v.recurso, v.accion, v.categoria
FROM (VALUES
    (N'adjuntos:subir', N'adjuntos', N'subir', N'Servicios'),
    (N'adjuntos:ver', N'adjuntos', N'ver', N'Servicios'),
    (N'ausencias:solicitar', N'ausencias', N'solicitar', N'Asistencia'),
    (N'ausencias:decidir', N'ausencias', N'decidir', N'Asistencia')
) AS v(nombre, recurso, accion, categoria)
WHERE NOT EXISTS (SELECT 1 FROM seguridad.permisos p WHERE p.nombre = v.nombre);
GO

/* subir <- quien ya puede crear servicios; ver <- quien ya puede verlos; solicitar <- quien ya marca asistencia */
INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT DISTINCT a.rol_id, nuevo.id
FROM seguridad.asignacion_permisos_rol a
JOIN seguridad.permisos o ON o.id = a.permiso_id
JOIN (VALUES (N'servicios:crear', N'adjuntos:subir'), (N'servicios:ver', N'adjuntos:ver'), (N'asistencia:marcar', N'ausencias:solicitar')) AS m(origen, destino) ON m.origen = o.nombre
JOIN seguridad.permisos nuevo ON nuevo.nombre = m.destino
WHERE NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol x WHERE x.rol_id = a.rol_id AND x.permiso_id = nuevo.id);
GO

/* decidir ausencias: solo el Administrador General hasta que el cuartel defina quien aprueba */
INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id FROM seguridad.roles r CROSS JOIN seguridad.permisos p
WHERE r.nombre = N'Administrador General' AND p.nombre IN (N'adjuntos:subir', N'adjuntos:ver', N'ausencias:solicitar', N'ausencias:decidir')
    AND NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol a WHERE a.rol_id = r.id AND a.permiso_id = p.id);
GO
