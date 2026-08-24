---
id: component--front-organizacion
tipo: COMPONENT
nombre: organizacion
nivel: L2
dominio: organizacion
resumen: "Helper de frontend \"organizacion\" (5 exportaciones, consume 1 endpoint(s))."
capa: frontend
archivos:
  - frontend/src/lib/organizacion.ts
edges:
  - [calls, api--organizacion-identidad-institucional]
terminos: [organizacion, linea, destacada, identidad, institucional, cargar, actualizar, subir, logo]
---

# organizacion

Helper de frontend "organizacion" (5 exportaciones, consume 1 endpoint(s)).


## Archivos

- `frontend/src/lib/organizacion.ts`

## Relaciones

- `calls` → [[api--organizacion-identidad-institucional|IdentidadInstitucionalController]]

## Referenciado por

- [[screen--dashboard-organizacion-documentos|/dashboard/organizacion/documentos]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
