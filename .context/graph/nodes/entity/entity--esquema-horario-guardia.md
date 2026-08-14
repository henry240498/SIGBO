---
id: entity--esquema-horario-guardia
tipo: ENTITY
nombre: EsquemaHorarioGuardia
nivel: L1
dominio: asistencia
resumen: "Catalogo parametrizable de plantillas de horario de guardia (secciones 2/14/15/19 del pedido): reemplaza cualquier horario \"quemado\" en el frontend. `diasSemanaCsv` NULL significa que el esquema solo se usa para feriados/fechas especiales, nunca por dia de semana normal."
tabla: operaciones.esquemas_horario_guardia
archivos:
  - backend/src/shared/entities/esquema-horario-guardia.entity.ts
edges:
  - [belongs_to, domain--asistencia]
  - [persisted_in, table--operaciones-esquemas-horario-guardia]
terminos: [esquema, horario, guardia, esquemas, operaciones]
---

# EsquemaHorarioGuardia

Catalogo parametrizable de plantillas de horario de guardia (secciones 2/14/15/19 del pedido): reemplaza cualquier horario "quemado" en el frontend. `diasSemanaCsv` NULL significa que el esquema solo se usa para feriados/fechas especiales, nunca por dia de semana normal.

- **Tabla:** [[table--operaciones-esquemas-horario-guardia|operaciones.esquemas_horario_guardia]]
- **Columnas mapeadas:** 16

## Donde se usa

- **Pantallas:** `/dashboard/guardias`, `/dashboard/guardias/[id]`, `/dashboard/guardias/esquemas-horario`, `/dashboard/guardias/generar`, `/dashboard/guardias/grupos`, `/dashboard/guardias/grupos/[id]`, `/dashboard/guardias/ordenes`, `/dashboard/guardias/ordenes/[id]`, `/dashboard/guardias/ordenes/configuracion`, `/dashboard/guardias/ordenes/nueva`, `/dashboard/guardias/pernoctes`, `/dashboard/guardias/requisitos`, `/dashboard/guardias/sorteos`, `/dashboard/guardias/sorteos/[id]`, `/dashboard/organizacion/feriados`, `/dashboard/personal/[id]`
- **Endpoints:** EsquemasHorarioController, GuardiasController, OrdenesGuardiaController, SorteosController
- **Servicios:** EsquemasHorarioService, GeneracionService, OrdenesGuardiaService, SorteosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/esquema-horario-guardia.entity.ts`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `persisted_in` → [[table--operaciones-esquemas-horario-guardia|operaciones.esquemas_horario_guardia]]

## Referenciado por

- [[service--guardias-esquemas-horario|EsquemasHorarioService]] `uses` →
- [[service--guardias-generacion|GeneracionService]] `uses` →
- [[service--guardias-ordenes-guardia|OrdenesGuardiaService]] `uses` →
- [[service--guardias-sorteos|SorteosService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
