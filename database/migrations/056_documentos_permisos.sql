/* =============================================================
   SIGBO-CBVC | Migracion 056 - Documentos: permisos
   =============================================================
   Etapa 5. Ya existian 5 permisos `documentos:*` sembrados
   (ver/crear/editar/eliminar/firmar, ver seed-data.ts) pero sin
   controller que los usara -- se activan aca y se agregan los que
   faltan (subir/descargar/anular/aprobar/administrar/ver_auditoria).

   Asignacion por rol (decision tomada, ver informe final para
   revision): `documentos:descargar` se suma a todo rol que ya tenia
   `documentos:ver` (separarlos por rol especifico no estaba definido
   en el pedido); `administrar`/`ver_auditoria`/`eliminar`/`anular`
   quedan reservados a ADMIN (via 'all') salvo `ver_auditoria` para
   Comandante, que ya tiene perfil de supervision en otros modulos.
   ============================================================= */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

INSERT INTO seguridad.permisos (nombre, recurso, accion, categoria)
SELECT v.nombre, v.recurso, v.accion, v.categoria FROM (VALUES
    (N'documentos:subir',        N'documentos', N'subir',        N'Documentos'),
    (N'documentos:descargar',    N'documentos', N'descargar',    N'Documentos'),
    (N'documentos:anular',       N'documentos', N'anular',       N'Documentos'),
    (N'documentos:aprobar',      N'documentos', N'aprobar',      N'Documentos'),
    (N'documentos:administrar',  N'documentos', N'administrar',  N'Documentos'),
    (N'documentos:ver_auditoria',N'documentos', N'ver_auditoria',N'Documentos')
) AS v(nombre, recurso, accion, categoria)
WHERE NOT EXISTS (SELECT 1 FROM seguridad.permisos p WHERE p.nombre = v.nombre);
GO

/* Comandante: ya tenia ver/crear/firmar -- se agrega lo operativo de
   generar/consultar documentos propios mas supervision de auditoria. */
INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id
FROM seguridad.roles r
CROSS JOIN seguridad.permisos p
WHERE r.nombre = N'Comandante'
  AND p.nombre IN (N'documentos:subir', N'documentos:descargar', N'documentos:aprobar', N'documentos:ver_auditoria')
  AND NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol apr WHERE apr.rol_id = r.id AND apr.permiso_id = p.id);
GO

INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id
FROM seguridad.roles r
CROSS JOIN seguridad.permisos p
WHERE r.nombre = N'Instructor'
  AND p.nombre IN (N'documentos:subir', N'documentos:descargar')
  AND NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol apr WHERE apr.rol_id = r.id AND apr.permiso_id = p.id);
GO

INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id
FROM seguridad.roles r
CROSS JOIN seguridad.permisos p
WHERE r.nombre = N'Bombero Operativo'
  AND p.nombre = N'documentos:descargar'
  AND NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol apr WHERE apr.rol_id = r.id AND apr.permiso_id = p.id);
GO

INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id
FROM seguridad.roles r
CROSS JOIN seguridad.permisos p
WHERE r.nombre = N'Tesorero'
  AND p.nombre IN (N'documentos:subir', N'documentos:descargar')
  AND NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol apr WHERE apr.rol_id = r.id AND apr.permiso_id = p.id);
GO

INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id
FROM seguridad.roles r
CROSS JOIN seguridad.permisos p
WHERE r.nombre = N'Encargado de Deposito'
  AND p.nombre = N'documentos:descargar'
  AND NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol apr WHERE apr.rol_id = r.id AND apr.permiso_id = p.id);
GO
