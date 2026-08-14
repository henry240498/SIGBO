---
id: table--organizacion-feriados
tipo: TABLE
nombre: organizacion.feriados
nivel: L2
dominio: organizacion
resumen: Tabla organizacion.feriados (12 columnas). Creada en 026_guardias_planificacion.sql.
tabla: feriados
archivos:
  - database/migrations/026_guardias_planificacion.sql
edges:
  - [defined_in, file--026-guardias-planificacion]
  - [belongs_to, domain--organizacion]
terminos: [organizacion, feriados, fecha, nombre, tipo, original, especial, activo, observacion, creado, actualizado]
---

# organizacion.feriados

Tabla organizacion.feriados (12 columnas). Creada en 026_guardias_planificacion.sql.

- **Esquema:** organizacion · **Columnas:** 12

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| fecha | DATE |
| nombre | NVARCHAR(150) |
| tipo | NVARCHAR(20) |
| fecha_original | DATE |
| es_especial | BIT |
| activo | BIT |
| observacion | NVARCHAR(MAX) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |
| actualizado_por | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/guardias`, `/dashboard/guardias/[id]`, `/dashboard/guardias/esquemas-horario`, `/dashboard/guardias/generar`, `/dashboard/guardias/grupos`, `/dashboard/guardias/grupos/[id]`, `/dashboard/guardias/ordenes`, `/dashboard/guardias/ordenes/[id]`, `/dashboard/guardias/ordenes/configuracion`, `/dashboard/guardias/ordenes/nueva`, `/dashboard/guardias/pernoctes`, `/dashboard/guardias/requisitos`, `/dashboard/guardias/sorteos`, `/dashboard/guardias/sorteos/[id]`, `/dashboard/organizacion/feriados`, `/dashboard/personal/[id]`
- **Endpoints:** FeriadosController, GuardiasController
- **Servicios:** FeriadosService, GeneracionService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/026_guardias_planificacion.sql`

## Relaciones

- `defined_in` → [[file--026-guardias-planificacion|026_guardias_planificacion.sql]]
- `belongs_to` → [[domain--organizacion|Organización Institucional]]

## Referenciado por

- [[entity--feriado|Feriado]] `persisted_in` →
- [[service--guardias-generacion|GeneracionService]] `reads` →
- [[service--organizacion-feriados|FeriadosService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
