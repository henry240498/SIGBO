/* =============================================================
   SIGBO-CBVC | Migracion 058 - Inteligencia Artificial: permisos
   =============================================================
   Ya existian 4 permisos `inteligencia:*` sembrados desde el
   seed-data.ts original (ver_alertas/configurar/ver_dashboard/
   exportar_reportes) para un modulo "Inteligencia" declarado pero
   nunca construido -- se reutilizan tal cual para el panel de
   administracion (Seguridad -> Inteligencia Artificial, seccion 34
   del pedido) en vez de crear equivalentes nuevos. Se agregan solo
   los que faltan: `usar` (acceso al chat), `ver_conversaciones`
   (ver conversaciones ajenas -- sensible, seccion 53),
   `ver_auditoria`, `gestionar_mejoras` (aprobar/rechazar propuestas,
   seccion 39) y `desactivar` (apagado de emergencia, seccion 57).

   "Roles habilitados" (seccion 35) se resuelve con el sistema de
   permisos existente (`inteligencia:usar` por rol), no con una lista
   redundante en ia.configuraciones -- evita mantener dos fuentes de
   verdad para lo mismo.
   ============================================================= */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

INSERT INTO seguridad.permisos (nombre, recurso, accion, categoria)
SELECT v.nombre, v.recurso, v.accion, v.categoria FROM (VALUES
    (N'inteligencia:usar',              N'inteligencia', N'usar',              N'Inteligencia'),
    (N'inteligencia:ver_conversaciones',N'inteligencia', N'ver_conversaciones',N'Inteligencia'),
    (N'inteligencia:ver_auditoria',     N'inteligencia', N'ver_auditoria',     N'Inteligencia'),
    (N'inteligencia:gestionar_mejoras', N'inteligencia', N'gestionar_mejoras', N'Inteligencia'),
    (N'inteligencia:desactivar',        N'inteligencia', N'desactivar',        N'Inteligencia')
) AS v(nombre, recurso, accion, categoria)
WHERE NOT EXISTS (SELECT 1 FROM seguridad.permisos p WHERE p.nombre = v.nombre);
GO

/* inteligencia:usar -- acceso basico al chat de Snoopy, mismo criterio
   amplio que documentos:ver: los 6 roles no-administrativos lo reciben. */
INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id
FROM seguridad.roles r
CROSS JOIN seguridad.permisos p
WHERE r.nombre IN (N'Comandante', N'Jefe de Guardia', N'Instructor', N'Bombero Operativo', N'Tesorero', N'Encargado de Deposito')
  AND p.nombre = N'inteligencia:usar'
  AND NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol apr WHERE apr.rol_id = r.id AND apr.permiso_id = p.id);
GO

/* Comandante ya tenia ver_alertas/ver_dashboard -- se suma ver_auditoria,
   mismo perfil de supervision que ya tiene en Documentos (migracion 056). */
INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id
FROM seguridad.roles r
CROSS JOIN seguridad.permisos p
WHERE r.nombre = N'Comandante'
  AND p.nombre = N'inteligencia:ver_auditoria'
  AND NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol apr WHERE apr.rol_id = r.id AND apr.permiso_id = p.id);
GO
