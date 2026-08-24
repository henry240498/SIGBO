---
id: service--ia-ia-conversaciones
tipo: SERVICE
nombre: IaConversacionesService
nivel: L2
dominio: inteligencia
resumen: "Lectura de conversaciones (seccion 6-7 del pedido): un usuario comun solo ve las suyas; ver conversaciones ajenas exige `inteligencia:ver_conversaciones` (seccion 53, \"no mostrar conversaciones privadas a usuarios comunes\"). El controller decide con que permisos llama a `deUsuario` vs `todas`, este servicio nunca decide autorizacion por su cuenta salvo el chequeo de propiedad en `mensajesDe`."
capa: backend
archivos:
  - backend/src/modules/ia/ia-conversaciones.service.ts
edges:
  - [belongs_to, domain--inteligencia]
  - [uses, component--modulo-ia]
  - [uses, entity--ia-conversacion]
  - [reads, table--ia-conversaciones]
  - [uses, entity--ia-mensaje]
  - [reads, table--ia-mensajes]
  - [uses, entity--ia-ejecucion-herramienta]
  - [reads, table--ia-ejecuciones-herramientas]
  - [uses, entity--usuario]
  - [reads, table--seguridad-usuarios]
  - [uses, service--seguridad-auditoria]
terminos: [conversaciones, conversacion, mensaje, ejecucion, herramienta, usuario]
---

# IaConversacionesService

Lectura de conversaciones (seccion 6-7 del pedido): un usuario comun solo ve las suyas; ver conversaciones ajenas exige `inteligencia:ver_conversaciones` (seccion 53, "no mostrar conversaciones privadas a usuarios comunes"). El controller decide con que permisos llama a `deUsuario` vs `todas`, este servicio nunca decide autorizacion por su cuenta salvo el chequeo de propiedad en `mensajesDe`.


## Metodos

`misConversaciones()` · `todasLasConversaciones()` · `eliminar()` · `mensajesDe()` · `ejecucionesDe()`

## Archivos

- `backend/src/modules/ia/ia-conversaciones.service.ts`

## Relaciones

- `belongs_to` → [[domain--inteligencia|Inteligencia Artificial]]
- `uses` → [[component--modulo-ia|ia (modulo NestJS)]]
- `uses` → [[entity--ia-conversacion|ConversacionIa]]
- `reads` → [[table--ia-conversaciones|ia.conversaciones]]
- `uses` → [[entity--ia-mensaje|MensajeIa]]
- `reads` → [[table--ia-mensajes|ia.mensajes]]
- `uses` → [[entity--ia-ejecucion-herramienta|EjecucionHerramientaIa]]
- `reads` → [[table--ia-ejecuciones-herramientas|ia.ejecuciones_herramientas]]
- `uses` → [[entity--usuario|Usuario]]
- `reads` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--ia-ia-admin-conversaciones|IaAdminConversacionesController]] `exposes` →
- [[api--ia-ia-chat|IaChatController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
