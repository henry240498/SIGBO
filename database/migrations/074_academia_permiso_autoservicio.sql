/* =============================================================
   SIGBO-CBVC | Migracion 074 - Academia: permiso de autoservicio
   =============================================================
   Fase de cierre de Snoopy: un bombero sin `academia:ver` (el permiso
   general del modulo completo) debia poder seguir preguntandole a
   Snoopy por SUS PROPIOS cursos/certificaciones sin que eso implique
   darle acceso al modulo Academia entero. La arquitectura de permisos
   de Snoopy verifica UN permiso por herramienta antes de ejecutar
   cualquier consulta (`IaToolsService.tieneAcceso()`) -- no existe (ni
   se crea aca) ningun mecanismo de "salteo" o excepcion condicional:
   este es un permiso NUEVO, chequeado exactamente igual que cualquier
   otro, para una herramienta NUEVA (`get_mis_cursos_academia`) que por
   diseno nunca acepta un identificador de otra persona como argumento
   -- solo puede consultar al bombero vinculado al usuario autenticado.

   Se asigna a los 7 roles reales (los 6 no administrativos + el
   administrador, que no lo hereda automaticamente de ningun otro
   permiso -- verificado contra la base antes de escribir esto: los
   permisos de un rol son asignaciones explicitas, no un comodin). El
   permiso `academia:ver` (modulo completo) no se toca. */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

INSERT INTO seguridad.permisos (nombre, recurso, accion, categoria)
SELECT v.nombre, v.recurso, v.accion, v.categoria FROM (VALUES
    (N'academia:ver_propio', N'academia', N'ver_propio', N'Academia')
) AS v(nombre, recurso, accion, categoria)
WHERE NOT EXISTS (SELECT 1 FROM seguridad.permisos p WHERE p.nombre = v.nombre);
GO

/* academia:ver_propio -- cualquier persona con una cuenta en SIGBO
   puede preguntar por su propia formacion, independientemente de su
   rol o de si tiene acceso al modulo Academia completo. */
INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id
FROM seguridad.roles r
CROSS JOIN seguridad.permisos p
WHERE r.nombre IN (N'Administrador General', N'Comandante', N'Jefe de Guardia', N'Instructor', N'Bombero Operativo', N'Tesorero', N'Encargado de Deposito')
  AND p.nombre = N'academia:ver_propio'
  AND NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol apr WHERE apr.rol_id = r.id AND apr.permiso_id = p.id);
GO
