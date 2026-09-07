---
id: screen--dashboard-documentos-plantillas
tipo: SCREEN
nombre: /dashboard/documentos/plantillas
nivel: L1
dominio: documentos
resumen: Pantalla /dashboard/documentos/plantillas.
ruta: /dashboard/documentos/plantillas
capa: frontend
permisos: [documentos:administrar, documentos:crear]
archivos:
  - frontend/src/app/dashboard/documentos/plantillas/page.tsx
edges:
  - [belongs_to, domain--documentos]
  - [uses, component--front-api]
  - [uses, component--front-personal]
  - [uses, component--front-parametros]
  - [uses, component--front-documentos]
terminos: [documentos, plantillas, administrar, crear]
---

# /dashboard/documentos/plantillas

Pantalla /dashboard/documentos/plantillas.

- **Ruta:** `/dashboard/documentos/plantillas`
- **Permisos referenciados:** `documentos:administrar`, `documentos:crear`

## Archivos

- `frontend/src/app/dashboard/documentos/plantillas/page.tsx`

## Relaciones

- `belongs_to` → [[domain--documentos|Documentos]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-personal|personal]]
- `uses` → [[component--front-parametros|parametros]]
- `uses` → [[component--front-documentos|documentos]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
