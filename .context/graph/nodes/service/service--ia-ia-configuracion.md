---
id: service--ia-ia-configuracion
tipo: SERVICE
nombre: IaConfiguracionService
nivel: L2
dominio: inteligencia
resumen: "Configuracion del asistente (fila unica, patron ya usado por AparienciaService/OrdenGuardiaConfiguracionService): nunca inserta, siempre actualiza la fila existente. Cada cambio deja rastro completo antes/despues en HistorialConfiguracionIa (seccion 38 del pedido) via AuditoriaService ademas, para que aparezca junto al resto de la actividad de Seguridad (seccion 55)."
capa: backend
archivos:
  - backend/src/modules/ia/ia-configuracion.service.ts
edges:
  - [belongs_to, domain--inteligencia]
  - [uses, component--modulo-ia]
  - [uses, entity--ia-configuracion]
  - [reads, table--ia-configuraciones]
  - [uses, entity--ia-historial-configuracion]
  - [reads, table--ia-historial-configuracion]
  - [uses, entity--ia-conversacion]
  - [reads, table--ia-conversaciones]
  - [uses, entity--ia-mensaje]
  - [reads, table--ia-mensajes]
  - [uses, entity--ia-ejecucion-herramienta]
  - [reads, table--ia-ejecuciones-herramientas]
  - [uses, entity--ia-propuesta-mejora]
  - [reads, table--ia-propuestas-mejora]
  - [uses, service--seguridad-auditoria]
terminos: [configuracion, historial, conversacion, mensaje, ejecucion, herramienta, propuesta, mejora]
---

# IaConfiguracionService

Configuracion del asistente (fila unica, patron ya usado por AparienciaService/OrdenGuardiaConfiguracionService): nunca inserta, siempre actualiza la fila existente. Cada cambio deja rastro completo antes/despues en HistorialConfiguracionIa (seccion 38 del pedido) via AuditoriaService ademas, para que aparezca junto al resto de la actividad de Seguridad (seccion 55).


## Metodos

`obtener()` · `modulosHabilitados()` · `historial()` · `actualizar()` · `cambiarEstado()` · `eliminarDefinitivamente()` · `actualizarAvatar()` · `seleccionarAvatarPredefinido()`

## Archivos

- `backend/src/modules/ia/ia-configuracion.service.ts`

## Relaciones

- `belongs_to` → [[domain--inteligencia|Inteligencia Artificial]]
- `uses` → [[component--modulo-ia|ia (modulo NestJS)]]
- `uses` → [[entity--ia-configuracion|ConfiguracionIa]]
- `reads` → [[table--ia-configuraciones|ia.configuraciones]]
- `uses` → [[entity--ia-historial-configuracion|HistorialConfiguracionIa]]
- `reads` → [[table--ia-historial-configuracion|ia.historial_configuracion]]
- `uses` → [[entity--ia-conversacion|ConversacionIa]]
- `reads` → [[table--ia-conversaciones|ia.conversaciones]]
- `uses` → [[entity--ia-mensaje|MensajeIa]]
- `reads` → [[table--ia-mensajes|ia.mensajes]]
- `uses` → [[entity--ia-ejecucion-herramienta|EjecucionHerramientaIa]]
- `reads` → [[table--ia-ejecuciones-herramientas|ia.ejecuciones_herramientas]]
- `uses` → [[entity--ia-propuesta-mejora|PropuestaMejoraIa]]
- `reads` → [[table--ia-propuestas-mejora|ia.propuestas_mejora]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[service--ia-ia-chat|IaChatService]] `uses` →
- [[api--ia-ia-chat|IaChatController]] `exposes` →
- [[api--ia-ia-configuracion|IaConfiguracionController]] `exposes` →
- [[api--ia-ia-configuracion|IaConfiguracionController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
