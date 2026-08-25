---
id: entity--sorteo-participante
tipo: ENTITY
nombre: SorteoParticipante
nivel: L1
dominio: asistencia
resumen: "Un candidato evaluado en un sorteo (`SorteoGuardia`), seleccionado o no. Se persisten TODOS los elegibles -- no solo los ganadores -- porque es la unica forma de que una auditoria futura pueda confirmar que el sorteo respeto el criterio de candidatos configurado (seccion 20 del pedido)."
tabla: operaciones.sorteo_participantes
archivos:
  - backend/src/shared/entities/sorteo-participante.entity.ts
edges:
  - [belongs_to, domain--asistencia]
  - [persisted_in, table--operaciones-sorteo-participantes]
terminos: [sorteo, participante, participantes, operaciones]
---

# SorteoParticipante

Un candidato evaluado en un sorteo (`SorteoGuardia`), seleccionado o no. Se persisten TODOS los elegibles -- no solo los ganadores -- porque es la unica forma de que una auditoria futura pueda confirmar que el sorteo respeto el criterio de candidatos configurado (seccion 20 del pedido).

- **Tabla:** [[table--operaciones-sorteo-participantes|operaciones.sorteo_participantes]]
- **Columnas mapeadas:** 4

## Donde se usa

- **Pantallas:** `/dashboard/guardias`, `/dashboard/guardias/[id]`, `/dashboard/guardias/esquemas-horario`, `/dashboard/guardias/generar`, `/dashboard/guardias/grupos`, `/dashboard/guardias/grupos/[id]`, `/dashboard/guardias/ordenes`, `/dashboard/guardias/ordenes/[id]`, `/dashboard/guardias/ordenes/configuracion`, `/dashboard/guardias/ordenes/nueva`, `/dashboard/guardias/pernoctes`, `/dashboard/guardias/requisitos`, `/dashboard/guardias/sorteos`, `/dashboard/guardias/sorteos/[id]`, `/dashboard/organizacion/feriados`, `/dashboard/organizacion/guardias/planificacion`, `/dashboard/personal/[id]`
- **Endpoints:** SorteosController
- **Servicios:** SorteosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/sorteo-participante.entity.ts`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `persisted_in` → [[table--operaciones-sorteo-participantes|operaciones.sorteo_participantes]]

## Referenciado por

- [[service--guardias-sorteos|SorteosService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
