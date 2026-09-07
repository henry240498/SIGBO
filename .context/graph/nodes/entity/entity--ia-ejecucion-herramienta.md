---
id: entity--ia-ejecucion-herramienta
tipo: ENTITY
nombre: EjecucionHerramientaIa
nivel: L1
dominio: inteligencia
resumen: "Cada llamada a una herramienta de la lista blanca (secciones 8/12/45 del pedido) queda auditada aca, exista o no la respuesta final del modelo: usuario -> permiso evaluado -> resultado -> que se le devolvio al modelo (resumen, nunca el payload completo con datos sensibles)."
tabla: ia.ejecuciones_herramientas
archivos:
  - backend/src/shared/entities/ia-ejecucion-herramienta.entity.ts
edges:
  - [belongs_to, domain--inteligencia]
  - [persisted_in, table--ia-ejecuciones-herramientas]
terminos: [ejecucion, herramienta, ejecuciones, herramientas, resultado, permitido, denegado, error]
---

# EjecucionHerramientaIa

Cada llamada a una herramienta de la lista blanca (secciones 8/12/45 del pedido) queda auditada aca, exista o no la respuesta final del modelo: usuario -> permiso evaluado -> resultado -> que se le devolvio al modelo (resumen, nunca el payload completo con datos sensibles).

- **Tabla:** [[table--ia-ejecuciones-herramientas|ia.ejecuciones_herramientas]]
- **Columnas mapeadas:** 10

## Estados y enumeraciones

- `ResultadoEjecucionHerramientaIa`: `PERMITIDO` · `DENEGADO` · `ERROR`

## Donde se usa

- **Pantallas:** `/dashboard/inteligencia`, `/dashboard/seguridad/inteligencia-artificial`, `/dashboard/seguridad/inteligencia-artificial/auditoria`, `/dashboard/seguridad/inteligencia-artificial/configuracion`, `/dashboard/seguridad/inteligencia-artificial/conversaciones`, `/dashboard/seguridad/inteligencia-artificial/propuestas`
- **Endpoints:** IaAdminConversacionesController, IaChatController, IaConfiguracionController, IaDashboardController
- **Servicios:** IaChatService, IaConfiguracionService, IaConversacionesService, IaDashboardService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/ia-ejecucion-herramienta.entity.ts`

## Relaciones

- `belongs_to` → [[domain--inteligencia|Inteligencia Artificial]]
- `persisted_in` → [[table--ia-ejecuciones-herramientas|ia.ejecuciones_herramientas]]

## Referenciado por

- [[service--ia-ia-chat|IaChatService]] `uses` →
- [[service--ia-ia-configuracion|IaConfiguracionService]] `uses` →
- [[service--ia-ia-conversaciones|IaConversacionesService]] `uses` →
- [[service--ia-ia-dashboard|IaDashboardService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
