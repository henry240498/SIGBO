/* =============================================================
   SIGBO-CBVC | Migracion 066 - Finanzas: permisos de Socios Protectores
   =============================================================
   Etapa 5 (ultima). Permisos granulares (seccion 22 del pedido) bajo
   el recurso 'finanzas' ya existente -- mismo patron de nombres
   compuestos que finanzas:administrar_cajas/cerrar_caja (048). Se
   reutiliza finanzas:reportes para los reportes nuevos (ya existe).

   Asignacion deliberada, no automatica (seccion 22: "no otorgar
   permisos automaticamente a todos los administradores"): lo
   operativo (registrar socios/aportes/facturas) va a Tesorero, igual
   que el resto de Finanzas; anular facturacion y administrar
   beneficios (impacto economico/comercial mas sensible) va a
   Comandante, mismo criterio de separacion de funciones que
   finanzas:autorizar.
   ============================================================= */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

INSERT INTO seguridad.permisos (nombre, recurso, accion, categoria)
SELECT v.nombre, v.recurso, v.accion, v.categoria FROM (VALUES
    (N'finanzas:socios_ver',           N'finanzas', N'socios_ver',           N'Finanzas'),
    (N'finanzas:socios_crear',         N'finanzas', N'socios_crear',         N'Finanzas'),
    (N'finanzas:socios_editar',        N'finanzas', N'socios_editar',        N'Finanzas'),
    (N'finanzas:aportes_registrar',    N'finanzas', N'aportes_registrar',    N'Finanzas'),
    (N'finanzas:aportes_editar',       N'finanzas', N'aportes_editar',       N'Finanzas'),
    (N'finanzas:beneficios_administrar', N'finanzas', N'beneficios_administrar', N'Finanzas'),
    (N'finanzas:facturacion_ver',      N'finanzas', N'facturacion_ver',      N'Finanzas'),
    (N'finanzas:facturacion_crear',    N'finanzas', N'facturacion_crear',    N'Finanzas'),
    (N'finanzas:facturacion_editar',   N'finanzas', N'facturacion_editar',   N'Finanzas'),
    (N'finanzas:facturacion_anular',   N'finanzas', N'facturacion_anular',   N'Finanzas'),
    (N'finanzas:notas_credito_crear',  N'finanzas', N'notas_credito_crear',  N'Finanzas')
) AS v(nombre, recurso, accion, categoria)
WHERE NOT EXISTS (SELECT 1 FROM seguridad.permisos p WHERE p.nombre = v.nombre);
GO

INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id
FROM seguridad.roles r
CROSS JOIN seguridad.permisos p
WHERE r.nombre = N'Tesorero'
  AND p.nombre IN (
      N'finanzas:socios_ver', N'finanzas:socios_crear', N'finanzas:socios_editar',
      N'finanzas:aportes_registrar', N'finanzas:aportes_editar',
      N'finanzas:facturacion_ver', N'finanzas:facturacion_crear', N'finanzas:facturacion_editar',
      N'finanzas:notas_credito_crear'
  )
  AND NOT EXISTS (
      SELECT 1 FROM seguridad.asignacion_permisos_rol apr
      WHERE apr.rol_id = r.id AND apr.permiso_id = p.id
  );
GO

INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id
FROM seguridad.roles r
CROSS JOIN seguridad.permisos p
WHERE r.nombre = N'Comandante'
  AND p.nombre IN (N'finanzas:socios_ver', N'finanzas:facturacion_ver', N'finanzas:facturacion_anular', N'finanzas:beneficios_administrar')
  AND NOT EXISTS (
      SELECT 1 FROM seguridad.asignacion_permisos_rol apr
      WHERE apr.rol_id = r.id AND apr.permiso_id = p.id
  );
GO
