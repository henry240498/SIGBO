/* =============================================================
   SIGBO-CBVC | Migracion 083 - Reservas de instalaciones y prevencion
   =============================================================
   Fase 4.4 y 4.5 de la hoja de ruta.
   - Reservas: el salon, el patio de simulacros, etc. Una solicitud pasa
     por SOLICITADA -> APROBADA/RECHAZADA; solo decide quien tiene
     reservas:decidir, y no pueden aprobarse dos reservas que se pisan.
   - Prevencion: inspecciones a comercios y certificados con vencimiento.
     Reutiliza servicios:ver / crear / editar. El cobro del servicio, si el
     cuartel lo aplica, se registra en el modulo de finanzas (no se duplica). */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID('organizacion.instalaciones', 'U') IS NULL
BEGIN
    CREATE TABLE organizacion.instalaciones (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_inst_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_instalaciones PRIMARY KEY,
        nombre NVARCHAR(100) NOT NULL,
        capacidad INT NULL CONSTRAINT CK_inst_capacidad CHECK (capacidad IS NULL OR capacidad >= 1),
        descripcion NVARCHAR(500) NULL,
        activo BIT NOT NULL CONSTRAINT DF_inst_activo DEFAULT 1,
        creado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_inst_creado DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT UQ_inst_nombre UNIQUE (nombre)
    );
END
GO

IF OBJECT_ID('organizacion.reservas_instalacion', 'U') IS NULL
BEGIN
    CREATE TABLE organizacion.reservas_instalacion (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_resv_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_reservas_instalacion PRIMARY KEY,
        instalacion_id UNIQUEIDENTIFIER NOT NULL,
        titulo NVARCHAR(150) NOT NULL,
        solicitante_nombre NVARCHAR(150) NOT NULL,
        contacto NVARCHAR(100) NULL,
        personas INT NULL CONSTRAINT CK_resv_personas CHECK (personas IS NULL OR personas >= 1),
        inicio DATETIMEOFFSET(3) NOT NULL,
        fin DATETIMEOFFSET(3) NOT NULL,
        estado NVARCHAR(12) NOT NULL CONSTRAINT DF_resv_estado DEFAULT 'SOLICITADA'
            CONSTRAINT CK_resv_estado CHECK (estado IN ('SOLICITADA', 'APROBADA', 'RECHAZADA', 'CANCELADA')),
        motivo_decision NVARCHAR(500) NULL,
        creado_por UNIQUEIDENTIFIER NOT NULL,
        decidido_por UNIQUEIDENTIFIER NULL,
        decidido_en DATETIMEOFFSET(3) NULL,
        creado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_resv_creado DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT CK_resv_fechas CHECK (fin > inicio),
        CONSTRAINT FK_resv_instalacion FOREIGN KEY (instalacion_id) REFERENCES organizacion.instalaciones(id),
        CONSTRAINT FK_resv_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id),
        CONSTRAINT FK_resv_decididopor FOREIGN KEY (decidido_por) REFERENCES seguridad.usuarios(id)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_resv_instalacion_inicio' AND object_id = OBJECT_ID('organizacion.reservas_instalacion'))
    CREATE INDEX IX_resv_instalacion_inicio ON organizacion.reservas_instalacion (instalacion_id, inicio);
GO

IF OBJECT_ID('servicios.inspecciones_prevencion', 'U') IS NULL
BEGIN
    CREATE TABLE servicios.inspecciones_prevencion (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_insp_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_inspecciones_prevencion PRIMARY KEY,
        punto_riesgo_id UNIQUEIDENTIFIER NULL,
        establecimiento NVARCHAR(150) NOT NULL,
        direccion NVARCHAR(300) NOT NULL,
        fecha DATE NOT NULL,
        inspector_id UNIQUEIDENTIFIER NOT NULL,
        resultado NVARCHAR(20) NOT NULL
            CONSTRAINT CK_insp_resultado CHECK (resultado IN ('APROBADO', 'CON_OBSERVACIONES', 'RECHAZADO')),
        observaciones NVARCHAR(1000) NULL,
        certificado_numero NVARCHAR(40) NULL,
        certificado_vence DATE NULL,
        creado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_insp_creado DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT FK_insp_punto FOREIGN KEY (punto_riesgo_id) REFERENCES servicios.puntos_riesgo(id),
        CONSTRAINT FK_insp_inspector FOREIGN KEY (inspector_id) REFERENCES seguridad.usuarios(id),
        CONSTRAINT CK_insp_certificado CHECK (
            (certificado_numero IS NULL AND certificado_vence IS NULL)
            OR (certificado_numero IS NOT NULL AND certificado_vence IS NOT NULL))
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_insp_certificado' AND object_id = OBJECT_ID('servicios.inspecciones_prevencion'))
    CREATE UNIQUE INDEX UX_insp_certificado ON servicios.inspecciones_prevencion (certificado_numero) WHERE certificado_numero IS NOT NULL;
GO

/* --- Permisos de reservas --- */
INSERT INTO seguridad.permisos (nombre, recurso, accion, categoria)
SELECT v.nombre, N'reservas', v.accion, N'Organizacion'
FROM (VALUES
    (N'reservas:ver', N'ver'),
    (N'reservas:solicitar', N'solicitar'),
    (N'reservas:decidir', N'decidir')
) AS v(nombre, accion)
WHERE NOT EXISTS (SELECT 1 FROM seguridad.permisos p WHERE p.nombre = v.nombre);
GO

/* Ver y solicitar: Administrador General y roles que ya pueden crear servicios. */
INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT DISTINCT a.rol_id, nuevo.id
FROM seguridad.asignacion_permisos_rol a
JOIN seguridad.permisos origen ON origen.id = a.permiso_id AND origen.nombre = N'servicios:crear'
CROSS JOIN (SELECT id FROM seguridad.permisos WHERE nombre IN (N'reservas:ver', N'reservas:solicitar')) nuevo
WHERE NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol x WHERE x.rol_id = a.rol_id AND x.permiso_id = nuevo.id);
GO

/* Decidir: solo el Administrador General hasta que el cuartel defina quien aprueba. */
INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id FROM seguridad.roles r CROSS JOIN seguridad.permisos p
WHERE r.nombre = N'Administrador General' AND p.nombre IN (N'reservas:ver', N'reservas:solicitar', N'reservas:decidir')
    AND NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol a WHERE a.rol_id = r.id AND a.permiso_id = p.id);
GO
