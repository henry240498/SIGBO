---
id: entity--sorteo-guardia
tipo: ENTITY
nombre: SorteoGuardia
nivel: L1
dominio: asistencia
resumen: "Sorteo de personal para una fecha especial (seccion 20 del pedido: 8 de diciembre, Nochebuena, Navidad, vispera de Ano Nuevo, Ano Nuevo). Registra la corrida completa (fecha, motivo, cantidad a seleccionar, quien y cuando la ejecuto); los participantes -- elegibles seleccionados y no seleccionados -- viven en `SorteoParticipante`."
tabla: operaciones.sorteos_guardia
archivos:
  - backend/src/shared/entities/sorteo-guardia.entity.ts
edges:
  - [belongs_to, domain--asistencia]
  - [persisted_in, table--operaciones-sorteos-guardia]
terminos: [sorteo, guardia, sorteos, operaciones]
---

# SorteoGuardia

Sorteo de personal para una fecha especial (seccion 20 del pedido: 8 de diciembre, Nochebuena, Navidad, vispera de Ano Nuevo, Ano Nuevo). Registra la corrida completa (fecha, motivo, cantidad a seleccionar, quien y cuando la ejecuto); los participantes -- elegibles seleccionados y no seleccionados -- viven en `SorteoParticipante`.

- **Tabla:** [[table--operaciones-sorteos-guardia|operaciones.sorteos_guardia]]
- **Columnas mapeadas:** 7

## Donde se usa

- **Pantallas:** `/dashboard/guardias`, `/dashboard/guardias/[id]`, `/dashboard/guardias/esquemas-horario`, `/dashboard/guardias/generar`, `/dashboard/guardias/grupos`, `/dashboard/guardias/grupos/[id]`, `/dashboard/guardias/ordenes`, `/dashboard/guardias/ordenes/[id]`, `/dashboard/guardias/ordenes/configuracion`, `/dashboard/guardias/ordenes/nueva`, `/dashboard/guardias/pernoctes`, `/dashboard/guardias/requisitos`, `/dashboard/guardias/sorteos`, `/dashboard/guardias/sorteos/[id]`, `/dashboard/organizacion/feriados`, `/dashboard/personal/[id]`
- **Endpoints:** SorteosController
- **Servicios:** SorteosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/sorteo-guardia.entity.ts`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `persisted_in` → [[table--operaciones-sorteos-guardia|operaciones.sorteos_guardia]]

## Referenciado por

- [[service--guardias-sorteos|SorteosService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
