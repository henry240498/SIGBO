---
id: entity--departamento
tipo: ENTITY
nombre: Departamento
nivel: L1
dominio: organizacion
resumen: Entidad Departamento, persistida en organizacion.departamentos.
tabla: organizacion.departamentos
archivos:
  - backend/src/shared/entities/departamento.entity.ts
edges:
  - [belongs_to, domain--organizacion]
  - [persisted_in, table--organizacion-departamentos]
terminos: [departamento, departamentos, organizacion]
---

# Departamento

Entidad Departamento, persistida en organizacion.departamentos.

- **Tabla:** [[table--organizacion-departamentos|organizacion.departamentos]]
- **Columnas mapeadas:** 7

## Donde se usa

- **Pantallas:** `/dashboard/organizacion/departamentos`
- **Endpoints:** DepartamentosController
- **Servicios:** DashboardService, DepartamentosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/departamento.entity.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `persisted_in` → [[table--organizacion-departamentos|organizacion.departamentos]]

## Referenciado por

- [[service--organizacion-dashboard|DashboardService]] `uses` →
- [[service--organizacion-departamentos|DepartamentosService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
