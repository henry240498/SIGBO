---
id: service--ia-ia-chat
tipo: SERVICE
nombre: IaChatService
nivel: L2
dominio: inteligencia
resumen: "Orquestador del chat (secciones 3-4/9/49-51 del pedido). Sin proveedor externo: delega en IaMotorService (motor de razonamiento local, sin llamadas salientes) y se encarga de persistir la conversacion/mensajes/ejecuciones de herramientas y de aplicar el apagado de emergencia / modo mantenimiento."
capa: backend
archivos:
  - backend/src/modules/ia/ia-chat.service.ts
edges:
  - [belongs_to, domain--inteligencia]
  - [uses, component--modulo-ia]
  - [uses, entity--ia-conversacion]
  - [reads, table--ia-conversaciones]
  - [uses, entity--ia-mensaje]
  - [reads, table--ia-mensajes]
  - [uses, entity--ia-ejecucion-herramienta]
  - [reads, table--ia-ejecuciones-herramientas]
  - [uses, service--ia-ia-configuracion]
  - [uses, service--ia-ia-motor]
  - [uses, service--ia-ia-tools]
terminos: [chat, conversacion, mensaje, ejecucion, herramienta]
---

# IaChatService

Orquestador del chat (secciones 3-4/9/49-51 del pedido). Sin proveedor externo: delega en IaMotorService (motor de razonamiento local, sin llamadas salientes) y se encarga de persistir la conversacion/mensajes/ejecuciones de herramientas y de aplicar el apagado de emergencia / modo mantenimiento.


## Metodos

`chat()`

## Archivos

- `backend/src/modules/ia/ia-chat.service.ts`

## Relaciones

- `belongs_to` → [[domain--inteligencia|Inteligencia Artificial]]
- `uses` → [[component--modulo-ia|ia (modulo NestJS)]]
- `uses` → [[entity--ia-conversacion|ConversacionIa]]
- `reads` → [[table--ia-conversaciones|ia.conversaciones]]
- `uses` → [[entity--ia-mensaje|MensajeIa]]
- `reads` → [[table--ia-mensajes|ia.mensajes]]
- `uses` → [[entity--ia-ejecucion-herramienta|EjecucionHerramientaIa]]
- `reads` → [[table--ia-ejecuciones-herramientas|ia.ejecuciones_herramientas]]
- `uses` → [[service--ia-ia-configuracion|IaConfiguracionService]]
- `uses` → [[service--ia-ia-motor|IaMotorService]]
- `uses` → [[service--ia-ia-tools|IaToolsService]]

## Referenciado por

- [[api--ia-ia-chat|IaChatController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
