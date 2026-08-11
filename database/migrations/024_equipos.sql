SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

/* =============================================================
   SIGBO-CBVC | Migracion 024 - Modulo Equipos (Fase 2 de
   Guardias+Moviles+Equipos)

   equipos.equipos ya tenia CRUD backend completo. Se agrega la
   asignacion estructurada a un movil (seccion 16-19 del pedido de
   Guardias: "Equipo -> Asignacion -> Movil") y una ubicacion
   parametrizada (seccion 18) separada del campo `ubicacion` libre
   existente, que se conserva como nota complementaria.
   equipos.mantenimientos_equipos ya existia desde la migracion 006
   sin entity/service/controller -- se activa sin cambios de esquema.
   ============================================================= */

/* --- 1) Nuevo tipo parametrizable UBICACION_EQUIPO --- */
ALTER TABLE organizacion.parametros DROP CONSTRAINT CK_param_tipo;
GO
ALTER TABLE organizacion.parametros ADD CONSTRAINT CK_param_tipo CHECK (tipo IN (
    'PAIS','DEPARTAMENTO','CIUDAD','BARRIO','PROFESION','IDIOMA','NIVEL_IDIOMA',
    'GRUPO_SANGUINEO','FACTOR_RH','TIPO_SEGURO','ASEGURADORA','TIPO_EVENTO_ASISTENCIA',
    'UBICACION_EQUIPO'
));
GO

INSERT INTO organizacion.parametros (tipo, nombre, nombre_normalizado, orden)
SELECT v.tipo, v.nombre, v.nombre_normalizado, v.orden FROM (VALUES
    (N'UBICACION_EQUIPO', N'Deposito',              N'deposito',              1),
    (N'UBICACION_EQUIPO', N'En movil',               N'en movil',              2),
    (N'UBICACION_EQUIPO', N'Mantenimiento',          N'mantenimiento',         3),
    (N'UBICACION_EQUIPO', N'Prestado',               N'prestado',              4),
    (N'UBICACION_EQUIPO', N'Reparacion',             N'reparacion',            5),
    (N'UBICACION_EQUIPO', N'Capacitacion',           N'capacitacion',          6),
    (N'UBICACION_EQUIPO', N'Fuera de la institucion', N'fuera de la institucion', 7),
    (N'UBICACION_EQUIPO', N'Baja',                   N'baja',                  8),
    (N'UBICACION_EQUIPO', N'Otra',                   N'otra',                  9)
) AS v(tipo, nombre, nombre_normalizado, orden)
WHERE NOT EXISTS (SELECT 1 FROM organizacion.parametros p WHERE p.tipo = v.tipo AND p.nombre_normalizado = v.nombre_normalizado AND p.padre_id IS NULL);
GO

/* --- 2) equipos.equipos: asignacion a movil + ubicacion parametrizada --- */
ALTER TABLE equipos.equipos ADD
    vehiculo_asignado_id  UNIQUEIDENTIFIER NULL,
    ubicacion_tipo        UNIQUEIDENTIFIER NULL;
GO
ALTER TABLE equipos.equipos
    ADD CONSTRAINT FK_eq_vehiculoasignado FOREIGN KEY (vehiculo_asignado_id) REFERENCES vehiculos.vehiculos(id) ON DELETE SET NULL;
GO
ALTER TABLE equipos.equipos
    ADD CONSTRAINT FK_eq_ubicaciontipo FOREIGN KEY (ubicacion_tipo) REFERENCES organizacion.parametros(id);
GO
CREATE INDEX IX_equipos_vehiculo_asignado ON equipos.equipos(vehiculo_asignado_id);
GO

/* --- 3) Permisos (ya sembrados hoy via seed-data.ts/npm run seed, se
   dejan aqui de forma idempotente para que la migracion sea
   auto-contenida). --- */
INSERT INTO seguridad.permisos (nombre, recurso, accion, categoria)
SELECT v.nombre, v.recurso, v.accion, N'Equipos'
FROM (VALUES
    (N'equipos:mantenimiento', N'equipos', N'mantenimiento'),
    (N'equipos:eliminar',      N'equipos', N'eliminar'),
    (N'equipos:prestar',       N'equipos', N'prestar')
) AS v(nombre, recurso, accion)
WHERE NOT EXISTS (SELECT 1 FROM seguridad.permisos p WHERE p.nombre = v.nombre);
GO

INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id FROM seguridad.roles r CROSS JOIN seguridad.permisos p
WHERE r.nombre = N'Administrador General' AND p.nombre IN ('equipos:mantenimiento','equipos:eliminar','equipos:prestar')
    AND NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol a WHERE a.rol_id = r.id AND a.permiso_id = p.id);
GO
