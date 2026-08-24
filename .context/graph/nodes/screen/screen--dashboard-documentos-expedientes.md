---
id: screen--dashboard-documentos-expedientes
tipo: SCREEN
nombre: /dashboard/documentos/expedientes
nivel: L1
dominio: documentos
resumen: Pantalla /dashboard/documentos/expedientes.
ruta: /dashboard/documentos/expedientes
capa: frontend
permisos: [documentos:crear, documentos:editar]
archivos:
  - frontend/src/app/dashboard/documentos/expedientes/page.tsx
edges:
  - [belongs_to, domain--documentos]
  - [uses, component--front-api]
  - [uses, component--front-documentos]
terminos: [documentos, expedientes, crear, editar]
---

# /dashboard/documentos/expedientes

Pantalla /dashboard/documentos/expedientes.

- **Ruta:** `/dashboard/documentos/expedientes`
- **Permisos referenciados:** `documentos:crear`, `documentos:editar`

## Archivos

- `frontend/src/app/dashboard/documentos/expedientes/page.tsx`

## Relaciones

- `belongs_to` → [[domain--documentos|Documentos]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-documentos|documentos]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
