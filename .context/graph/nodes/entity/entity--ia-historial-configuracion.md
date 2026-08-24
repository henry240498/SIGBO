---
id: entity--ia-historial-configuracion
tipo: ENTITY
nombre: HistorialConfiguracionIa
nivel: L1
dominio: inteligencia
resumen: "Cada cambio a ConfiguracionIa queda registrado con snapshot completo antes/despues (seccion 38 del pedido): \"valor anterior/valor nuevo/ usuario/fecha/hora/ip/motivo\". Append-only, nunca se edita ni se borra."
tabla: ia.historial_configuracion
archivos:
  - backend/src/shared/entities/ia-historial-configuracion.entity.ts
edges:
  - [belongs_to, domain--inteligencia]
  - [persisted_in, table--ia-historial-configuracion]
terminos: [historial, configuracion]
---

# HistorialConfiguracionIa

Cada cambio a ConfiguracionIa queda registrado con snapshot completo antes/despues (seccion 38 del pedido): "valor anterior/valor nuevo/ usuario/fecha/hora/ip/motivo". Append-only, nunca se edita ni se borra.

- **Tabla:** [[table--ia-historial-configuracion|ia.historial_configuracion]]
- **Columnas mapeadas:** 6

## Donde se usa

- **Pantallas:** `/dashboard/inteligencia`, `/dashboard/seguridad/inteligencia-artificial`, `/dashboard/seguridad/inteligencia-artificial/auditoria`, `/dashboard/seguridad/inteligencia-artificial/configuracion`, `/dashboard/seguridad/inteligencia-artificial/conversaciones`, `/dashboard/seguridad/inteligencia-artificial/propuestas`
- **Endpoints:** IaChatController, IaConfiguracionController
- **Servicios:** IaConfiguracionService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/ia-historial-configuracion.entity.ts`

## Relaciones

- `belongs_to` → [[domain--inteligencia|Inteligencia Artificial]]
- `persisted_in` → [[table--ia-historial-configuracion|ia.historial_configuracion]]

## Referenciado por

- [[service--ia-ia-configuracion|IaConfiguracionService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
