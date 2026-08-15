/* =============================================================
   SIGBO-CBVC | Migracion 047 - Deposito: permiso de parametros
   =============================================================
   Bug real encontrado probando el modulo con el usuario 'deposito':
   TODOS los combos de Deposito (tipo de ubicacion, tipo de movimiento,
   tipo de tenencia, estado de elemento, motivo de baja, tipo de
   prestamo, unidad de medida) se resuelven via GET
   organizacion.parametros, que exige 'organizacion:parametros_ver'
   (organizacion/parametros.controller.ts). Ese permiso no estaba
   sembrado para ningun rol no-ADMIN en todo el proyecto (ADMIN lo
   tiene por 'all'). Sin el, el rol "Encargado de Deposito" ve 403 en
   cada combo -- el modulo queda inutilizable para su propio usuario
   objetivo. Se otorga aca solo para ese rol (el mismo gap
   probablemente afecta a otros roles no-admin de otros modulos, pero
   eso queda fuera del alcance de esta migracion).
   ============================================================= */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id
FROM seguridad.roles r
CROSS JOIN seguridad.permisos p
WHERE r.nombre = N'Encargado de Deposito'
  AND p.nombre = N'organizacion:parametros_ver'
  AND NOT EXISTS (
      SELECT 1 FROM seguridad.asignacion_permisos_rol apr
      WHERE apr.rol_id = r.id AND apr.permiso_id = p.id
  );
GO
