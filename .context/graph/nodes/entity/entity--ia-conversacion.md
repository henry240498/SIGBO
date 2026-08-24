---
id: entity--ia-conversacion
tipo: ENTITY
nombre: ConversacionIa
nivel: L1
dominio: inteligencia
resumen: "Una sesion de chat con el asistente (seccion 6 del pedido): contenedor de MensajeIa, nunca un texto unico gigante (seccion 7). `usuarioId` es siempre quien conversa -- Snoopy nunca actua ni conversa \"como\" otro usuario."
tabla: ia.conversaciones
archivos:
  - backend/src/shared/entities/ia-conversacion.entity.ts
edges:
  - [belongs_to, domain--inteligencia]
  - [persisted_in, table--ia-conversaciones]
terminos: [conversacion, conversaciones, estado, activa, cerrada]
---

# ConversacionIa

Una sesion de chat con el asistente (seccion 6 del pedido): contenedor de MensajeIa, nunca un texto unico gigante (seccion 7). `usuarioId` es siempre quien conversa -- Snoopy nunca actua ni conversa "como" otro usuario.

- **Tabla:** [[table--ia-conversaciones|ia.conversaciones]]
- **Columnas mapeadas:** 7

## Estados y enumeraciones

- `EstadoConversacionIa`: `ACTIVA` · `CERRADA`

## Donde se usa

- **Pantallas:** `/dashboard/inteligencia`, `/dashboard/seguridad/inteligencia-artificial`, `/dashboard/seguridad/inteligencia-artificial/auditoria`, `/dashboard/seguridad/inteligencia-artificial/configuracion`, `/dashboard/seguridad/inteligencia-artificial/conversaciones`, `/dashboard/seguridad/inteligencia-artificial/propuestas`
- **Endpoints:** IaAdminConversacionesController, IaChatController, IaConfiguracionController, IaDashboardController
- **Servicios:** IaChatService, IaConfiguracionService, IaConversacionesService, IaDashboardService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/ia-conversacion.entity.ts`

## Relaciones

- `belongs_to` → [[domain--inteligencia|Inteligencia Artificial]]
- `persisted_in` → [[table--ia-conversaciones|ia.conversaciones]]

## Referenciado por

- [[service--ia-ia-chat|IaChatService]] `uses` →
- [[service--ia-ia-configuracion|IaConfiguracionService]] `uses` →
- [[service--ia-ia-conversaciones|IaConversacionesService]] `uses` →
- [[service--ia-ia-dashboard|IaDashboardService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
