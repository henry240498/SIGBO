/* =============================================================
   SIGBO-CBVC | Migracion 081 - Flota: dotacion por movil y bitacora de uso
   =============================================================
   Fase 1.6 y 1.7 de la hoja de ruta.
   - vehiculos.dotacion_movil: lo que cada movil DEBE llevar (cantidad
     objetivo) y lo hallado en el ultimo control (cantidad actual). El
     faltante se calcula; no se descuenta nada del deposito solo.
   - servicios.despachos: kilometraje de salida y de regreso, para la
     bitacora de uso (quien, que servicio, cuantos km). */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID('vehiculos.dotacion_movil', 'U') IS NULL
BEGIN
    CREATE TABLE vehiculos.dotacion_movil (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_dotmov_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_dotacion_movil PRIMARY KEY,
        vehiculo_id UNIQUEIDENTIFIER NOT NULL,
        descripcion NVARCHAR(200) NOT NULL,
        articulo_id UNIQUEIDENTIFIER NULL,
        cantidad_objetivo INT NOT NULL CONSTRAINT CK_dotmov_objetivo CHECK (cantidad_objetivo >= 1),
        cantidad_actual INT NULL CONSTRAINT CK_dotmov_actual CHECK (cantidad_actual IS NULL OR cantidad_actual >= 0),
        controlado_en DATETIMEOFFSET(3) NULL,
        controlado_por UNIQUEIDENTIFIER NULL,
        activo BIT NOT NULL CONSTRAINT DF_dotmov_activo DEFAULT 1,
        creado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_dotmov_creado DEFAULT SYSDATETIMEOFFSET(),
        actualizado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_dotmov_actualizado DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT FK_dotmov_vehiculo FOREIGN KEY (vehiculo_id) REFERENCES vehiculos.vehiculos(id),
        CONSTRAINT FK_dotmov_controladopor FOREIGN KEY (controlado_por) REFERENCES seguridad.usuarios(id)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_dotmov_vehiculo' AND object_id = OBJECT_ID('vehiculos.dotacion_movil'))
    CREATE INDEX IX_dotmov_vehiculo ON vehiculos.dotacion_movil (vehiculo_id, activo);
GO

IF COL_LENGTH('servicios.despachos', 'km_salida') IS NULL
    ALTER TABLE servicios.despachos ADD
        km_salida INT NULL CONSTRAINT CK_desp_km_salida CHECK (km_salida IS NULL OR km_salida >= 0),
        km_regreso INT NULL CONSTRAINT CK_desp_km_regreso CHECK (km_regreso IS NULL OR km_regreso >= 0);
GO

INSERT INTO seguridad.permisos (nombre, recurso, accion, categoria)
SELECT N'vehiculos:dotacion', N'vehiculos', N'dotacion', N'Vehiculos'
WHERE NOT EXISTS (SELECT 1 FROM seguridad.permisos WHERE nombre = N'vehiculos:dotacion');
GO

/* Lo reciben el Administrador General y todo rol que ya puede editar vehiculos. */
INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT DISTINCT a.rol_id, nuevo.id
FROM seguridad.asignacion_permisos_rol a
JOIN seguridad.permisos origen ON origen.id = a.permiso_id AND origen.nombre = N'vehiculos:editar'
CROSS JOIN (SELECT id FROM seguridad.permisos WHERE nombre = N'vehiculos:dotacion') nuevo
WHERE NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol x WHERE x.rol_id = a.rol_id AND x.permiso_id = nuevo.id);
GO

INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id FROM seguridad.roles r CROSS JOIN seguridad.permisos p
WHERE r.nombre = N'Administrador General' AND p.nombre = N'vehiculos:dotacion'
    AND NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol a WHERE a.rol_id = r.id AND a.permiso_id = p.id);
GO
