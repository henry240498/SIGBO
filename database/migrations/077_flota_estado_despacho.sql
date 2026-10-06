/* =============================================================
   SIGBO-CBVC | Migracion 077 - Flota: estado operativo y despacho
   =============================================================
   Fase 1 de la hoja de ruta (docs/HOJA-DE-RUTA-FUNCIONALIDADES.md):
   1.1 estado operativo del movil y 1.2 despacho de unidades.

   - vehiculos.vehiculos.estado (OPERATIVO/EN_MANTENIMIENTO/...) sigue
     siendo el estado ADMINISTRATIVO. El estado operativo es otro eje:
     donde esta el movil respecto de un servicio.
   - servicios.despachos registra cada salida de un movil a un servicio y
     sus tiempos (salida, llegada, fin, regreso).
   - Los eventos tambien se reflejan en servicios.historial_servicios
     (linea de tiempo existente desde la migracion 071); no se duplica.
   El permiso servicios:despachar ya existia; solo se agrega
   vehiculos:estado. */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

/* --- 1) Estado operativo vigente del movil --- */
IF COL_LENGTH('vehiculos.vehiculos', 'estado_operativo') IS NULL
    ALTER TABLE vehiculos.vehiculos ADD
        estado_operativo NVARCHAR(20) NOT NULL CONSTRAINT DF_veh_estado_operativo DEFAULT 'EN_CUARTEL'
            CONSTRAINT CK_veh_estado_operativo CHECK (estado_operativo IN ('EN_CUARTEL', 'DESPACHADO', 'EN_SERVICIO', 'REGRESANDO')),
        estado_operativo_desde DATETIMEOFFSET(3) NULL;
GO

/* --- 2) Historial de cambios de estado operativo --- */
IF OBJECT_ID('vehiculos.movil_estado_historial', 'U') IS NULL
BEGIN
    CREATE TABLE vehiculos.movil_estado_historial (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_movest_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_movil_estado_historial PRIMARY KEY,
        vehiculo_id UNIQUEIDENTIFIER NOT NULL,
        estado_anterior NVARCHAR(20) NULL,
        estado_nuevo NVARCHAR(20) NOT NULL,
        servicio_id UNIQUEIDENTIFIER NULL,
        despacho_id UNIQUEIDENTIFIER NULL,
        motivo NVARCHAR(500) NULL,
        usuario_id UNIQUEIDENTIFIER NULL,
        creado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_movest_creado DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT FK_movest_vehiculo FOREIGN KEY (vehiculo_id) REFERENCES vehiculos.vehiculos(id),
        CONSTRAINT FK_movest_servicio FOREIGN KEY (servicio_id) REFERENCES servicios.servicios(id),
        CONSTRAINT FK_movest_usuario FOREIGN KEY (usuario_id) REFERENCES seguridad.usuarios(id)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_movest_vehiculo_creado' AND object_id = OBJECT_ID('vehiculos.movil_estado_historial'))
    CREATE INDEX IX_movest_vehiculo_creado ON vehiculos.movil_estado_historial (vehiculo_id, creado_en DESC);
GO

/* --- 3) Despachos --- */
IF OBJECT_ID('servicios.despachos', 'U') IS NULL
BEGIN
    CREATE TABLE servicios.despachos (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_desp_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_despachos PRIMARY KEY,
        servicio_id UNIQUEIDENTIFIER NOT NULL,
        vehiculo_id UNIQUEIDENTIFIER NOT NULL,
        conductor_id UNIQUEIDENTIFIER NULL,
        estado NVARCHAR(20) NOT NULL CONSTRAINT DF_desp_estado DEFAULT 'DESPACHADO'
            CONSTRAINT CK_desp_estado CHECK (estado IN ('DESPACHADO', 'EN_SERVICIO', 'REGRESANDO', 'CERRADO', 'CANCELADO')),
        hora_salida DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_desp_salida DEFAULT SYSDATETIMEOFFSET(),
        hora_llegada DATETIMEOFFSET(3) NULL,
        hora_fin DATETIMEOFFSET(3) NULL,
        hora_regreso DATETIMEOFFSET(3) NULL,
        observaciones NVARCHAR(500) NULL,
        motivo_cancelacion NVARCHAR(500) NULL,
        creado_por UNIQUEIDENTIFIER NULL,
        creado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_desp_creado DEFAULT SYSDATETIMEOFFSET(),
        actualizado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_desp_actualizado DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT FK_desp_servicio FOREIGN KEY (servicio_id) REFERENCES servicios.servicios(id),
        CONSTRAINT FK_desp_vehiculo FOREIGN KEY (vehiculo_id) REFERENCES vehiculos.vehiculos(id),
        CONSTRAINT FK_desp_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_desp_servicio' AND object_id = OBJECT_ID('servicios.despachos'))
    CREATE INDEX IX_desp_servicio ON servicios.despachos (servicio_id, hora_salida DESC);
GO

/* Un movil no puede tener dos despachos activos a la vez (defensa ante
   dos operadores despachando el mismo movil en simultaneo). */
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_desp_vehiculo_activo' AND object_id = OBJECT_ID('servicios.despachos'))
    CREATE UNIQUE INDEX UX_desp_vehiculo_activo ON servicios.despachos (vehiculo_id)
        WHERE estado IN ('DESPACHADO', 'EN_SERVICIO', 'REGRESANDO');
GO

/* --- 4) Permiso nuevo: vehiculos:estado --- */
INSERT INTO seguridad.permisos (nombre, recurso, accion, categoria)
SELECT N'vehiculos:estado', N'vehiculos', N'estado', N'Vehiculos'
WHERE NOT EXISTS (SELECT 1 FROM seguridad.permisos WHERE nombre = N'vehiculos:estado');
GO

/* Lo reciben el Administrador General y todo rol que ya puede despachar. */
INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT DISTINCT a.rol_id, nuevo.id
FROM seguridad.asignacion_permisos_rol a
JOIN seguridad.permisos origen ON origen.id = a.permiso_id AND origen.nombre = N'servicios:despachar'
CROSS JOIN (SELECT id FROM seguridad.permisos WHERE nombre = N'vehiculos:estado') nuevo
WHERE NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol x WHERE x.rol_id = a.rol_id AND x.permiso_id = nuevo.id);
GO

INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id FROM seguridad.roles r CROSS JOIN seguridad.permisos p
WHERE r.nombre = N'Administrador General' AND p.nombre = N'vehiculos:estado'
    AND NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol a WHERE a.rol_id = r.id AND a.permiso_id = p.id);
GO
