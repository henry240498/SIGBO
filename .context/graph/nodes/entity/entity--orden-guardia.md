---
id: entity--orden-guardia
tipo: ENTITY
nombre: OrdenGuardia
nivel: L1
dominio: asistencia
resumen: "Documento oficial mensual de Orden de Guardia -- capa de lectura sobre la planificacion ya existente (Guardia/AsignacionGuardia/GrupoGuardia/ EsquemaHorarioGuardia), nunca una fuente de datos propia. `contenidoJson` (un `OrdenGuardiaSnapshot`) es el documento congelado en el momento de la publicacion: una vez `estado='PUBLICADA'` no vuelve a cambiar aunque la planificacion subyacente cambie despues -- mismo mecanismo de inmutabilidad que `FojaServicio`."
tabla: operaciones.ordenes_guardia
archivos:
  - backend/src/shared/entities/orden-guardia.entity.ts
edges:
  - [belongs_to, domain--asistencia]
  - [persisted_in, table--operaciones-ordenes-guardia]
terminos: [orden, guardia, ordenes, operaciones, estado, borrador, revisada, aprobada, publicada, anulada]
---

# OrdenGuardia

Documento oficial mensual de Orden de Guardia -- capa de lectura sobre la planificacion ya existente (Guardia/AsignacionGuardia/GrupoGuardia/ EsquemaHorarioGuardia), nunca una fuente de datos propia. `contenidoJson` (un `OrdenGuardiaSnapshot`) es el documento congelado en el momento de la publicacion: una vez `estado='PUBLICADA'` no vuelve a cambiar aunque la planificacion subyacente cambie despues -- mismo mecanismo de inmutabilidad que `FojaServicio`.

- **Tabla:** [[table--operaciones-ordenes-guardia|operaciones.ordenes_guardia]]
- **Columnas mapeadas:** 21

## Estados y enumeraciones

- `EstadoOrdenGuardia`: `BORRADOR` · `REVISADA` · `APROBADA` · `PUBLICADA` · `ANULADA`

## Donde se usa

- **Pantallas:** `/dashboard/guardias`, `/dashboard/guardias/[id]`, `/dashboard/guardias/esquemas-horario`, `/dashboard/guardias/generar`, `/dashboard/guardias/grupos`, `/dashboard/guardias/grupos/[id]`, `/dashboard/guardias/ordenes`, `/dashboard/guardias/ordenes/[id]`, `/dashboard/guardias/ordenes/configuracion`, `/dashboard/guardias/ordenes/nueva`, `/dashboard/guardias/pernoctes`, `/dashboard/guardias/requisitos`, `/dashboard/guardias/sorteos`, `/dashboard/guardias/sorteos/[id]`, `/dashboard/organizacion/feriados`, `/dashboard/personal/[id]`
- **Endpoints:** OrdenesGuardiaController
- **Servicios:** OrdenesGuardiaService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/orden-guardia.entity.ts`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `persisted_in` → [[table--operaciones-ordenes-guardia|operaciones.ordenes_guardia]]

## Referenciado por

- [[service--guardias-ordenes-guardia|OrdenesGuardiaService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
