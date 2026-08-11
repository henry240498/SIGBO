SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

/* =============================================================
   SIGBO-CBVC | Migracion 023 - Modulo Moviles (Fase 1 de
   Guardias+Moviles+Equipos)

   vehiculos.vehiculos ya existia con CRUD backend completo pero sin
   fecha/motivo de baja (seccion 14 del pedido de Guardias). Las
   tablas vehiculos.mantenimientos_vehiculos y
   vehiculos.consumos_combustible ya existian desde la migracion 006
   (con sus FKs desde 009) pero nunca tuvieron entity/service/
   controller -- se activan en esta fase sin cambios de esquema.

   vehiculos.checklist_items es la unica tabla nueva: catalogo
   parametrizable de items de inspeccion por tipo de vehiculo
   (seccion 12), consumido por el checklist de Guardias en la Fase 4.
   ============================================================= */

/* --- 1) vehiculos.vehiculos: fecha y motivo de baja --- */
ALTER TABLE vehiculos.vehiculos ADD
    fecha_baja   DATE NULL,
    motivo_baja  NVARCHAR(MAX) NULL;
GO

/* --- 2) vehiculos.checklist_items (catalogo parametrizable) --- */
CREATE TABLE vehiculos.checklist_items (
    id           UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_chkveh_id DEFAULT NEWSEQUENTIALID(),
    tipo_vehiculo NVARCHAR(50)  NULL, -- NULL = aplica a todos los tipos
    nombre       NVARCHAR(150) NOT NULL,
    categoria    NVARCHAR(20)  NOT NULL CONSTRAINT DF_chkveh_categoria DEFAULT 'MECANICA',
    orden        INT           NOT NULL CONSTRAINT DF_chkveh_orden DEFAULT 0,
    activo       BIT           NOT NULL CONSTRAINT DF_chkveh_activo DEFAULT 1,
    creado_en    DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_chkveh_creado DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_checklist_items_vehiculo PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_chkveh_categoria CHECK (categoria IN ('MECANICA','EQUIPAMIENTO','OTRO'))
);
GO

INSERT INTO vehiculos.checklist_items (nombre, categoria, orden)
SELECT v.nombre, v.categoria, v.orden FROM (VALUES
    (N'Kilometraje entrada',    N'MECANICA', 1),
    (N'Kilometraje salida',     N'MECANICA', 2),
    (N'Aceite motor',           N'MECANICA', 3),
    (N'Combustible',            N'MECANICA', 4),
    (N'Frenos',                 N'MECANICA', 5),
    (N'Luces delanteras',       N'MECANICA', 6),
    (N'Luces traseras',         N'MECANICA', 7),
    (N'Balizas',                N'MECANICA', 8),
    (N'Sirena',                 N'MECANICA', 9),
    (N'Bocina / claxon',        N'MECANICA', 10),
    (N'Neumaticos',             N'MECANICA', 11),
    (N'Radiocomunicacion',      N'MECANICA', 12),
    (N'Agua',                   N'MECANICA', 13),
    (N'Equipamiento',           N'EQUIPAMIENTO', 14)
) AS v(nombre, categoria, orden)
WHERE NOT EXISTS (SELECT 1 FROM vehiculos.checklist_items c WHERE c.nombre = v.nombre AND c.tipo_vehiculo IS NULL);
GO

/* --- 3) Permisos (ya sembrados hoy via seed-data.ts/npm run seed, se
   dejan aqui de forma idempotente para que la migracion sea
   auto-contenida y reproducible desde un SQL limpio). --- */
INSERT INTO seguridad.permisos (nombre, recurso, accion, categoria)
SELECT v.nombre, v.recurso, v.accion, N'Vehiculos'
FROM (VALUES
    (N'vehiculos:mantenimiento', N'vehiculos', N'mantenimiento'),
    (N'vehiculos:combustible',   N'vehiculos', N'combustible')
) AS v(nombre, recurso, accion)
WHERE NOT EXISTS (SELECT 1 FROM seguridad.permisos p WHERE p.nombre = v.nombre);
GO

INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id FROM seguridad.roles r CROSS JOIN seguridad.permisos p
WHERE r.nombre = N'Administrador General' AND p.nombre IN ('vehiculos:mantenimiento','vehiculos:combustible')
    AND NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol a WHERE a.rol_id = r.id AND a.permiso_id = p.id);
GO
