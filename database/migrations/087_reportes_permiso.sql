/*
   087 - Reportes de problemas y sugerencias.

   Cualquier persona con sesion puede reportar un error o proponer una mejora desde la app
   o desde la web. El texto se guarda en el servidor como archivo de texto plano
   (backend/storage/reportes), no en la base; esta migracion solo siembra el permiso.

   Permiso nuevo: reportes:enviar  -> se asigna a todos los roles existentes.
   Un rol creado despues debe recibirlo desde Seguridad.
*/
SET QUOTED_IDENTIFIER ON;
GO

INSERT INTO seguridad.permisos (nombre, recurso, accion, categoria)
SELECT v.nombre, v.recurso, v.accion, v.categoria
FROM (VALUES
    (N'reportes:enviar', N'reportes', N'enviar', N'Sistema')
) AS v(nombre, recurso, accion, categoria)
WHERE NOT EXISTS (SELECT 1 FROM seguridad.permisos p WHERE p.nombre = v.nombre);
GO

INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id
FROM seguridad.roles r
CROSS JOIN seguridad.permisos p
WHERE p.nombre = N'reportes:enviar'
    AND NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol a WHERE a.rol_id = r.id AND a.permiso_id = p.id);
GO
