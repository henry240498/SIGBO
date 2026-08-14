---
id: entity--compania
tipo: ENTITY
nombre: Compania
nivel: L1
dominio: organizacion
resumen: Entidad Compania, persistida en organizacion.companias.
tabla: organizacion.companias
archivos:
  - backend/src/shared/entities/compania.entity.ts
edges:
  - [belongs_to, domain--organizacion]
  - [persisted_in, table--organizacion-companias]
terminos: [compania, companias, organizacion]
---

# Compania

Entidad Compania, persistida en organizacion.companias.

- **Tabla:** [[table--organizacion-companias|organizacion.companias]]
- **Columnas mapeadas:** 9

## Donde se usa

- **Pantallas:** `/dashboard/organizacion/companias`, `/dashboard/organizacion/cuarteles`, `/dashboard/organizacion/designaciones`
- **Endpoints:** CompaniasController, DesignacionesController, FojaServicioController
- **Servicios:** CompaniasService, DashboardService, DesignacionesService, FojaServicioService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/compania.entity.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `persisted_in` → [[table--organizacion-companias|organizacion.companias]]

## Referenciado por

- [[service--organizacion-companias|CompaniasService]] `uses` →
- [[service--organizacion-dashboard|DashboardService]] `uses` →
- [[service--organizacion-designaciones|DesignacionesService]] `uses` →
- [[service--personal-foja-servicio|FojaServicioService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
