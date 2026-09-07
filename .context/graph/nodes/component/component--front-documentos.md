---
id: component--front-documentos
tipo: COMPONENT
nombre: documentos
nivel: L2
dominio: documentos
resumen: "Helper de frontend \"documentos\" (60 exportaciones, consume 17 endpoint(s))."
capa: frontend
archivos:
  - frontend/src/lib/documentos.ts
edges:
  - [calls, api--documentos-documentos]
  - [calls, api--documentos-documentos]
  - [calls, api--documentos-documentos]
  - [calls, api--documentos-documentos]
  - [calls, api--documentos-documentos]
  - [calls, api--documentos-documentos]
  - [calls, api--documentos-documentos]
  - [calls, api--documentos-documentos]
  - [calls, api--documentos-dashboard-documentos]
  - [calls, api--documentos-consultas-documentos]
  - [calls, api--documentos-expedientes]
  - [calls, api--documentos-expedientes]
  - [calls, api--documentos-expedientes]
  - [calls, api--documentos-plantillas]
  - [calls, api--documentos-plantillas]
  - [calls, api--documentos-plantillas]
  - [calls, api--documentos-documentos]
terminos: [documentos, cargar, tipos, documento, categorias, estados, niveles, confidencialidad, motivos, anulacion, origen, alerta, vigencia, version, archivo, relacion, expediente, plantilla, firma, indicadores, registro, auditoria, filtros, versiones, relaciones]
---

# documentos

Helper de frontend "documentos" (60 exportaciones, consume 17 endpoint(s)).


## Archivos

- `frontend/src/lib/documentos.ts`

## Relaciones

- `calls` → [[api--documentos-documentos|DocumentosController]]
- `calls` → [[api--documentos-documentos|DocumentosController]]
- `calls` → [[api--documentos-documentos|DocumentosController]]
- `calls` → [[api--documentos-documentos|DocumentosController]]
- `calls` → [[api--documentos-documentos|DocumentosController]]
- `calls` → [[api--documentos-documentos|DocumentosController]]
- `calls` → [[api--documentos-documentos|DocumentosController]]
- `calls` → [[api--documentos-documentos|DocumentosController]]
- `calls` → [[api--documentos-dashboard-documentos|DashboardDocumentosController]]
- `calls` → [[api--documentos-consultas-documentos|ConsultasDocumentosController]]
- `calls` → [[api--documentos-expedientes|ExpedientesController]]
- `calls` → [[api--documentos-expedientes|ExpedientesController]]
- `calls` → [[api--documentos-expedientes|ExpedientesController]]
- `calls` → [[api--documentos-plantillas|PlantillasController]]
- `calls` → [[api--documentos-plantillas|PlantillasController]]
- `calls` → [[api--documentos-plantillas|PlantillasController]]
- `calls` → [[api--documentos-documentos|DocumentosController]]

## Referenciado por

- [[screen--dashboard-documentos-auditoria|/dashboard/documentos/auditoria]] `uses` →
- [[screen--dashboard-documentos-expedientes|/dashboard/documentos/expedientes]] `uses` →
- [[screen--dashboard-documentos-expedientes-id|/dashboard/documentos/expedientes/[id]]] `uses` →
- [[screen--dashboard-documentos-listado|/dashboard/documentos/listado]] `uses` →
- [[screen--dashboard-documentos|/dashboard/documentos]] `uses` →
- [[screen--dashboard-documentos-plantillas|/dashboard/documentos/plantillas]] `uses` →
- [[screen--dashboard-documentos-vencimientos|/dashboard/documentos/vencimientos]] `uses` →
- [[screen--dashboard-documentos-id|/dashboard/documentos/[id]]] `uses` →
- [[screen--dashboard-organizacion-documentos|/dashboard/organizacion/documentos]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
