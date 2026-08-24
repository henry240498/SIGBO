---
id: entity--ia-propuesta-mejora
tipo: ENTITY
nombre: PropuestaMejoraIa
nivel: L1
dominio: inteligencia
resumen: "Propuesta de mejora de comportamiento del asistente (secciones 36-39 del pedido). La IA puede ORIGINAR una propuesta analizando conversaciones, nunca aplicarla: el estado solo avanza via accion humana explicita (aprobar/rechazar), y \"PUBLICADO\" no reprograma nada automaticamente -- es responsabilidad de un usuario autorizado trasladar la mejora aprobada a `ConfiguracionIa.instruccionesInstitucionales` u otro campo, dejando el cambio real registrado tambien en HistorialConfiguracionIa."
tabla: ia.propuestas_mejora
archivos:
  - backend/src/shared/entities/ia-propuesta-mejora.entity.ts
edges:
  - [belongs_to, domain--inteligencia]
  - [persisted_in, table--ia-propuestas-mejora]
terminos: [propuesta, mejora, propuestas, origen, usuario, estado, borrador, revision, aprobado, rechazado, publicado]
---

# PropuestaMejoraIa

Propuesta de mejora de comportamiento del asistente (secciones 36-39 del pedido). La IA puede ORIGINAR una propuesta analizando conversaciones, nunca aplicarla: el estado solo avanza via accion humana explicita (aprobar/rechazar), y "PUBLICADO" no reprograma nada automaticamente -- es responsabilidad de un usuario autorizado trasladar la mejora aprobada a `ConfiguracionIa.instruccionesInstitucionales` u otro campo, dejando el cambio real registrado tambien en HistorialConfiguracionIa.

- **Tabla:** [[table--ia-propuestas-mejora|ia.propuestas_mejora]]
- **Columnas mapeadas:** 9

## Estados y enumeraciones

- `OrigenPropuestaIa`: `IA` · `USUARIO`
- `EstadoPropuestaIa`: `BORRADOR` · `PROPUESTA` · `REVISION` · `APROBADO` · `RECHAZADO` · `PUBLICADO`

## Donde se usa

- **Pantallas:** `/dashboard/inteligencia`, `/dashboard/seguridad/inteligencia-artificial`, `/dashboard/seguridad/inteligencia-artificial/auditoria`, `/dashboard/seguridad/inteligencia-artificial/configuracion`, `/dashboard/seguridad/inteligencia-artificial/conversaciones`, `/dashboard/seguridad/inteligencia-artificial/propuestas`
- **Endpoints:** IaChatController, IaConfiguracionController, IaPropuestasMejoraController
- **Servicios:** IaConfiguracionService, IaPropuestasMejoraService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/ia-propuesta-mejora.entity.ts`

## Relaciones

- `belongs_to` → [[domain--inteligencia|Inteligencia Artificial]]
- `persisted_in` → [[table--ia-propuestas-mejora|ia.propuestas_mejora]]

## Referenciado por

- [[service--ia-ia-configuracion|IaConfiguracionService]] `uses` →
- [[service--ia-ia-propuestas-mejora|IaPropuestasMejoraService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
