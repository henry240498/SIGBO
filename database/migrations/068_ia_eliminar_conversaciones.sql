/* =============================================================
   SIGBO-CBVC | Migracion 068 - IA: eliminar conversaciones (panel admin)
   =============================================================
   Permiso dedicado, distinto de `inteligencia:eliminar` (ese es el
   borrado TOTAL e irreversible de la configuracion/historial de la
   IA, con confirmacion "DELETE" -- una accion mucho mas grave). Este
   es el equivalente destructivo de `inteligencia:ver_conversaciones`:
   limpiar conversaciones puntuales desde el panel de Seguridad.

   Sin asignacion a ningun rol por defecto (mismo criterio que
   ver_conversaciones en la migracion 058): el Administrador General
   ya lo tiene via el flag acceso_total; si otro rol lo necesita, se
   asigna deliberadamente desde Seguridad -> Roles.
   ============================================================= */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

INSERT INTO seguridad.permisos (nombre, recurso, accion, categoria)
SELECT v.nombre, v.recurso, v.accion, v.categoria FROM (VALUES
    (N'inteligencia:eliminar_conversaciones', N'inteligencia', N'eliminar_conversaciones', N'Inteligencia')
) AS v(nombre, recurso, accion, categoria)
WHERE NOT EXISTS (SELECT 1 FROM seguridad.permisos p WHERE p.nombre = v.nombre);
GO
