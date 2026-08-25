---
id: entity--identidad-institucional
tipo: ENTITY
nombre: IdentidadInstitucional
nivel: L1
dominio: organizacion
resumen: "Identidad documental institucional (fila unica, patron ConfiguracionSistema/ AparienciaService/OrdenGuardiaConfiguracion): membrete, datos de contacto, logos y pie de pagina reutilizables por CUALQUIER modulo que genere documentos PDF/DOCX -- no un membrete por modulo. Primera pasada de una sola institucion (SIGBO no tiene institucion_id en ninguna tabla todavia)."
tabla: organizacion.identidad_institucional
archivos:
  - backend/src/shared/entities/identidad-institucional.entity.ts
edges:
  - [belongs_to, domain--organizacion]
  - [persisted_in, table--organizacion-identidad-institucional]
terminos: [identidad, institucional, organizacion]
---

# IdentidadInstitucional

Identidad documental institucional (fila unica, patron ConfiguracionSistema/ AparienciaService/OrdenGuardiaConfiguracion): membrete, datos de contacto, logos y pie de pagina reutilizables por CUALQUIER modulo que genere documentos PDF/DOCX -- no un membrete por modulo. Primera pasada de una sola institucion (SIGBO no tiene institucion_id en ninguna tabla todavia).

- **Tabla:** [[table--organizacion-identidad-institucional|organizacion.identidad_institucional]]
- **Columnas mapeadas:** 24

## Donde se usa

- **Pantallas:** `/dashboard/documentos`, `/dashboard/documentos/[id]`, `/dashboard/documentos/auditoria`, `/dashboard/documentos/expedientes`, `/dashboard/documentos/expedientes/[id]`, `/dashboard/documentos/listado`, `/dashboard/documentos/plantillas`, `/dashboard/documentos/vencimientos`, `/dashboard/finanzas`, `/dashboard/finanzas/cajas`, `/dashboard/finanzas/cuentas-bancarias`, `/dashboard/finanzas/cuotas`, `/dashboard/finanzas/ejercicios-fiscales`, `/dashboard/finanzas/facturacion`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/movimientos-bancarios`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/finanzas/presupuesto`, `/dashboard/finanzas/socios-protectores/[id]`, `/dashboard/guardias`, `/dashboard/guardias/[id]`, `/dashboard/guardias/esquemas-horario`, `/dashboard/guardias/generar`, `/dashboard/guardias/grupos`, `/dashboard/guardias/grupos/[id]`, `/dashboard/guardias/ordenes`, `/dashboard/guardias/ordenes/[id]`, `/dashboard/guardias/ordenes/configuracion`, `/dashboard/guardias/ordenes/nueva`, `/dashboard/guardias/pernoctes`, `/dashboard/guardias/requisitos`, `/dashboard/guardias/sorteos`, `/dashboard/guardias/sorteos/[id]`, `/dashboard/organizacion/documentos`, `/dashboard/organizacion/feriados`, `/dashboard/organizacion/guardias/planificacion`, `/dashboard/personal/[id]`
- **Endpoints:** IdentidadInstitucionalController, OrdenesGuardiaController, PlantillasController, ReportesAcademiaController, ReportesFinanzasController
- **Servicios:** IaToolsService, IdentidadInstitucionalService, OrdenesGuardiaService, PlantillasService, ReportesAcademiaService, ReportesFinanzasService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/identidad-institucional.entity.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `persisted_in` → [[table--organizacion-identidad-institucional|organizacion.identidad_institucional]]

## Referenciado por

- [[service--academia-reportes-academia|ReportesAcademiaService]] `uses` →
- [[service--documentos-plantillas|PlantillasService]] `uses` →
- [[service--finanzas-reportes-finanzas|ReportesFinanzasService]] `uses` →
- [[service--guardias-ordenes-guardia|OrdenesGuardiaService]] `uses` →
- [[service--ia-ia-tools|IaToolsService]] `uses` →
- [[service--organizacion-identidad-institucional|IdentidadInstitucionalService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
