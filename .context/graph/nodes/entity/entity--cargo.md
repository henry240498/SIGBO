---
id: entity--cargo
tipo: ENTITY
nombre: Cargo
nivel: L1
dominio: organizacion
resumen: Entidad Cargo, persistida en organizacion.cargos.
tabla: organizacion.cargos
archivos:
  - backend/src/shared/entities/cargo.entity.ts
edges:
  - [belongs_to, domain--organizacion]
  - [persisted_in, table--organizacion-cargos]
terminos: [cargo, cargos, organizacion]
---

# Cargo

Entidad Cargo, persistida en organizacion.cargos.

- **Tabla:** [[table--organizacion-cargos|organizacion.cargos]]
- **Columnas mapeadas:** 10

## Donde se usa

- **Pantallas:** `/dashboard/documentos`, `/dashboard/documentos/[id]`, `/dashboard/documentos/auditoria`, `/dashboard/documentos/expedientes`, `/dashboard/documentos/expedientes/[id]`, `/dashboard/documentos/listado`, `/dashboard/documentos/plantillas`, `/dashboard/documentos/vencimientos`, `/dashboard/finanzas`, `/dashboard/finanzas/cajas`, `/dashboard/finanzas/cuentas-bancarias`, `/dashboard/finanzas/cuotas`, `/dashboard/finanzas/ejercicios-fiscales`, `/dashboard/finanzas/facturacion`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/movimientos-bancarios`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/finanzas/presupuesto`, `/dashboard/finanzas/socios-protectores/[id]`, `/dashboard/guardias`, `/dashboard/guardias/[id]`, `/dashboard/guardias/esquemas-horario`, `/dashboard/guardias/generar`, `/dashboard/guardias/grupos`, `/dashboard/guardias/grupos/[id]`, `/dashboard/guardias/ordenes`, `/dashboard/guardias/ordenes/[id]`, `/dashboard/guardias/ordenes/configuracion`, `/dashboard/guardias/ordenes/nueva`, `/dashboard/guardias/pernoctes`, `/dashboard/guardias/planificacion`, `/dashboard/guardias/requisitos`, `/dashboard/guardias/sorteos`, `/dashboard/guardias/sorteos/[id]`, `/dashboard/organizacion/cargos`, `/dashboard/organizacion/designaciones`, `/dashboard/organizacion/documentos`, `/dashboard/organizacion/feriados`
- **Endpoints:** CargosController, DesignacionesController, FirmasDocumentoController, FojaServicioController, OrdenesGuardiaController, PlantillasController, ReportesAcademiaController, ReportesFinanzasController
- **Servicios:** CargosService, DashboardService, DesignacionesService, FirmasDocumentoService, FojaServicioService, OrdenesGuardiaService, PlantillasService, ReportesAcademiaService, ReportesFinanzasService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/cargo.entity.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `persisted_in` → [[table--organizacion-cargos|organizacion.cargos]]

## Referenciado por

- [[service--academia-reportes-academia|ReportesAcademiaService]] `uses` →
- [[service--documentos-firmas-documento|FirmasDocumentoService]] `uses` →
- [[service--documentos-plantillas|PlantillasService]] `uses` →
- [[service--finanzas-reportes-finanzas|ReportesFinanzasService]] `uses` →
- [[service--guardias-ordenes-guardia|OrdenesGuardiaService]] `uses` →
- [[service--organizacion-cargos|CargosService]] `uses` →
- [[service--organizacion-dashboard|DashboardService]] `uses` →
- [[service--organizacion-designaciones|DesignacionesService]] `uses` →
- [[service--personal-foja-servicio|FojaServicioService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
