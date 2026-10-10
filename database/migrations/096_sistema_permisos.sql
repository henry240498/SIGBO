/* SIGBO — 096: permisos del área Sistema del Centro de mando. Aditiva y reejecutable.
   sistema:ver            mirar estado, tareas, respaldos, migraciones y app móvil
   sistema:operar         respaldar ahora, verificar un respaldo, ejecutar avisos
   sistema:ver_registros  leer los registros del servidor (pueden traer datos personales)
   El Administrador General ya los recibe por acceso_total (mig. 035); se asignan
   también de forma explícita, como en la 095. Otros roles: desde Seguridad › Roles. */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET XACT_ABORT ON;
GO
INSERT INTO seguridad.permisos (nombre, recurso, accion, categoria)
SELECT v.nombre, v.recurso, v.accion, v.categoria
FROM (VALUES
    (N'sistema:ver',           N'sistema', N'ver',           N'Sistema'),
    (N'sistema:operar',        N'sistema', N'operar',        N'Sistema'),
    (N'sistema:ver_registros', N'sistema', N'ver_registros', N'Sistema')
) AS v(nombre, recurso, accion, categoria)
WHERE NOT EXISTS (SELECT 1 FROM seguridad.permisos p WHERE p.nombre = v.nombre);
GO
INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id FROM seguridad.roles r CROSS JOIN seguridad.permisos p
WHERE r.nombre = N'Administrador General'
    AND p.nombre IN (N'sistema:ver', N'sistema:operar', N'sistema:ver_registros')
    AND NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol a WHERE a.rol_id = r.id AND a.permiso_id = p.id);
GO
