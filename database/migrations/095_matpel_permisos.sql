/* SIGBO — 095: permisos MATPEL/GRE. Aditiva y reejecutable.
   Consulta: copia de despacho:responder (todo el personal operativo del cuartel).
   Administrar, validar y activar la GRE: solo Administrador General; la institución
   reasigna desde Roles. Validar y activar son actos humanos auditados: este script no
   valida ni activa ninguna edición. */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET XACT_ABORT ON;
GO
INSERT INTO seguridad.permisos (nombre, recurso, accion, categoria)
SELECT v.nombre, v.recurso, v.accion, v.categoria
FROM (VALUES
    (N'matpel:consultar',       N'matpel', N'consultar',       N'MATPEL'),
    (N'matpel:administrar_gre', N'matpel', N'administrar_gre', N'MATPEL'),
    (N'matpel:validar_gre',     N'matpel', N'validar_gre',     N'MATPEL'),
    (N'matpel:activar_gre',     N'matpel', N'activar_gre',     N'MATPEL')
) AS v(nombre, recurso, accion, categoria)
WHERE NOT EXISTS (SELECT 1 FROM seguridad.permisos p WHERE p.nombre = v.nombre);
GO
INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT DISTINCT a.rol_id, nuevo.id
FROM seguridad.asignacion_permisos_rol a
JOIN seguridad.permisos o ON o.id = a.permiso_id AND o.nombre = N'despacho:responder'
JOIN seguridad.permisos nuevo ON nuevo.nombre = N'matpel:consultar'
WHERE NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol x WHERE x.rol_id = a.rol_id AND x.permiso_id = nuevo.id);
GO
INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id FROM seguridad.roles r CROSS JOIN seguridad.permisos p
WHERE r.nombre = N'Administrador General'
    AND p.nombre IN (N'matpel:consultar', N'matpel:administrar_gre', N'matpel:validar_gre', N'matpel:activar_gre')
    AND NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol a WHERE a.rol_id = r.id AND a.permiso_id = p.id);
GO
