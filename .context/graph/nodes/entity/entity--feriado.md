---
id: entity--feriado
tipo: ENTITY
nombre: Feriado
nivel: L1
dominio: organizacion
resumen: "Calendario de feriados institucional (seccion 17-18 del pedido de Guardias). Un feriado MOVIL puede trasladarse de fecha; `fechaOriginal` conserva la fecha previa cuando corresponde. Trasladar un feriado nunca reclasifica guardias en silencio -- ver FeriadosService.mover()."
tabla: organizacion.feriados
archivos:
  - backend/src/shared/entities/feriado.entity.ts
edges:
  - [belongs_to, domain--organizacion]
  - [persisted_in, table--organizacion-feriados]
terminos: [feriado, feriados, organizacion, tipo, fijo, movil, trasladado]
---

# Feriado

Calendario de feriados institucional (seccion 17-18 del pedido de Guardias). Un feriado MOVIL puede trasladarse de fecha; `fechaOriginal` conserva la fecha previa cuando corresponde. Trasladar un feriado nunca reclasifica guardias en silencio -- ver FeriadosService.mover().

- **Tabla:** [[table--organizacion-feriados|organizacion.feriados]]
- **Columnas mapeadas:** 9

## Estados y enumeraciones

- `TipoFeriado`: `FIJO` · `MOVIL` · `TRASLADADO`

## Donde se usa

- **Pantallas:** `/dashboard/guardias`, `/dashboard/guardias/[id]`, `/dashboard/guardias/esquemas-horario`, `/dashboard/guardias/generar`, `/dashboard/guardias/grupos`, `/dashboard/guardias/grupos/[id]`, `/dashboard/guardias/ordenes`, `/dashboard/guardias/ordenes/[id]`, `/dashboard/guardias/ordenes/configuracion`, `/dashboard/guardias/ordenes/nueva`, `/dashboard/guardias/pernoctes`, `/dashboard/guardias/requisitos`, `/dashboard/guardias/sorteos`, `/dashboard/guardias/sorteos/[id]`, `/dashboard/organizacion/feriados`, `/dashboard/personal/[id]`
- **Endpoints:** FeriadosController, GuardiasController
- **Servicios:** FeriadosService, GeneracionService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/feriado.entity.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `persisted_in` → [[table--organizacion-feriados|organizacion.feriados]]

## Referenciado por

- [[service--guardias-generacion|GeneracionService]] `uses` →
- [[service--organizacion-feriados|FeriadosService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
