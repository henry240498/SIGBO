SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO
INSERT INTO seguridad.permisos(nombre,recurso,accion,categoria)
SELECT N'publicaciones:administrar',N'publicaciones',N'administrar',N'Publicaciones'
WHERE NOT EXISTS(SELECT 1 FROM seguridad.permisos WHERE nombre=N'publicaciones:administrar');
GO
INSERT INTO seguridad.asignacion_permisos_rol(rol_id,permiso_id)
SELECT r.id,p.id FROM seguridad.roles r CROSS JOIN seguridad.permisos p
WHERE r.nombre=N'Administrador General' AND p.nombre=N'publicaciones:administrar'
AND NOT EXISTS(SELECT 1 FROM seguridad.asignacion_permisos_rol a WHERE a.rol_id=r.id AND a.permiso_id=p.id);
GO
