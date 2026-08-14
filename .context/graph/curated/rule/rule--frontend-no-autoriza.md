---
id: rule--frontend-no-autoriza
tipo: RULE
nombre: El frontend oculta, el backend autoriza
nivel: L1
resumen: Los chequeos de permisos en React son cosmetica. La autorizacion real la aplica PermissionsGuard. Ocultar un boton nunca sustituye al permiso del endpoint.
severidad: CRITICA
dominio: seguridad
archivos: [frontend/src/lib/modulos.ts, backend/src/modules/seguridad/guards/permissions.guard.ts]
terminos: [permiso, frontend, ocultar, boton, guard, autorizacion, seguridad, cosmetica]
edges:
  - [affects, component--front-modulos]
---

## El invariante

<<<<<<< Updated upstream
`permisos.includes('guardias:asignar')` y `moduloVisible()` sirven para no mostrar
controles inutiles. **No protegen nada.** La lista de permisos vive en `localStorage`
bajo la clave `sigbo_sesion` y cualquiera puede editarla.
=======
`permisos.includes('asistencia:eventos_crear')` y `moduloVisible()` sirven para no
mostrar controles inutiles. **No protegen nada.** La lista de permisos vive en
`localStorage` bajo la clave `sigbo_sesion` y cualquiera puede editarla.
>>>>>>> Stashed changes

La proteccion real es `@RequirePermission` + `PermissionsGuard` en el backend, que
recalcula los permisos desde la base en cada request.

## Consecuencia practica

Si agregas una accion nueva a una pantalla, necesitas **las dos cosas**:

1. El chequeo en React, para que el boton no aparezca si no corresponde.
2. El `@RequirePermission` en el endpoint, para que la accion sea imposible sin
   permiso.

Hacer solo la 1 deja un agujero: la peticion sigue funcionando con `curl`.
Hacer solo la 2 no es un agujero, solo una interfaz que muestra botones que
devuelven 403.

## Como se propagan los permisos al cliente

El login devuelve `usuario.permisos` en el objeto `Sesion`. Ese arreglo se guarda en
`localStorage` y **no se refresca** hasta el proximo login o refresh de token: si un
administrador cambia permisos, la interfaz del usuario afectado sigue mostrando lo
viejo hasta que renueve sesion. El backend, en cambio, aplica el cambio de inmediato.
<<<<<<< Updated upstream

## Lo mismo vale para las reglas de negocio

La elegibilidad de rol de guardia se valida **en el backend**
(`ElegibilidadService`), con el comentario explicito de que estas reglas *"deben ser
configurables y no estar quemadas en el frontend"*. Filtrar la lista de candidatos en
React esta bien como ayuda visual; no reemplaza la validacion. Ver
[[rule--elegibilidad-de-rol-guardia]].
=======
>>>>>>> Stashed changes
