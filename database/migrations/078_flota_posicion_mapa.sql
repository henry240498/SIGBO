/* =============================================================
   SIGBO-CBVC | Migracion 078 - Flota: posicion en vivo (mapa)
   =============================================================
   Fase 1.8 de la hoja de ruta. Guarda SOLO la ultima posicion conocida
   de cada movil (una fila por movil). Un historial de recorridos queda
   para cuando el cuartel defina cuanto tiempo conservarlo.
   El dispositivo que reporta es la app movil (.movile, geolocator); el
   mapa usa Leaflet + OpenStreetMap (sin claves ni costo). */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID('vehiculos.posicion_actual', 'U') IS NULL
BEGIN
    CREATE TABLE vehiculos.posicion_actual (
        vehiculo_id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_posicion_actual PRIMARY KEY,
        latitud DECIMAL(10,8) NOT NULL,
        longitud DECIMAL(11,8) NOT NULL,
        velocidad_kmh DECIMAL(5,1) NULL,
        precision_m DECIMAL(7,1) NULL,
        registrado_en DATETIMEOFFSET(3) NOT NULL,
        reportado_por UNIQUEIDENTIFIER NULL,
        actualizado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_posact_actualizado DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT CK_posact_latitud CHECK (latitud BETWEEN -90 AND 90),
        CONSTRAINT CK_posact_longitud CHECK (longitud BETWEEN -180 AND 180),
        CONSTRAINT FK_posact_vehiculo FOREIGN KEY (vehiculo_id) REFERENCES vehiculos.vehiculos(id),
        CONSTRAINT FK_posact_usuario FOREIGN KEY (reportado_por) REFERENCES seguridad.usuarios(id)
    );
END
GO

/* Permisos: ver el mapa y reportar posicion desde un dispositivo. */
INSERT INTO seguridad.permisos (nombre, recurso, accion, categoria)
SELECT v.nombre, N'vehiculos', v.accion, N'Vehiculos'
FROM (VALUES (N'vehiculos:ver_mapa', N'ver_mapa'), (N'vehiculos:posicion', N'posicion')) AS v(nombre, accion)
WHERE NOT EXISTS (SELECT 1 FROM seguridad.permisos p WHERE p.nombre = v.nombre);
GO

/* ver_mapa: Administrador General y roles que ya pueden despachar. */
INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT DISTINCT a.rol_id, nuevo.id
FROM seguridad.asignacion_permisos_rol a
JOIN seguridad.permisos origen ON origen.id = a.permiso_id AND origen.nombre = N'servicios:despachar'
CROSS JOIN (SELECT id FROM seguridad.permisos WHERE nombre = N'vehiculos:ver_mapa') nuevo
WHERE NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol x WHERE x.rol_id = a.rol_id AND x.permiso_id = nuevo.id);
GO

/* posicion: Administrador General y roles que usan la app movil (servicios:crear). */
INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT DISTINCT a.rol_id, nuevo.id
FROM seguridad.asignacion_permisos_rol a
JOIN seguridad.permisos origen ON origen.id = a.permiso_id AND origen.nombre = N'servicios:crear'
CROSS JOIN (SELECT id FROM seguridad.permisos WHERE nombre = N'vehiculos:posicion') nuevo
WHERE NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol x WHERE x.rol_id = a.rol_id AND x.permiso_id = nuevo.id);
GO

INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id FROM seguridad.roles r CROSS JOIN seguridad.permisos p
WHERE r.nombre = N'Administrador General' AND p.nombre IN (N'vehiculos:ver_mapa', N'vehiculos:posicion')
    AND NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol a WHERE a.rol_id = r.id AND a.permiso_id = p.id);
GO
