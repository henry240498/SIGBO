---
id: screen--dashboard-documentos
tipo: SCREEN
nombre: /dashboard/documentos
nivel: L1
dominio: documentos
resumen: Pantalla /dashboard/documentos.
ruta: /dashboard/documentos
capa: frontend
archivos:
  - frontend/src/app/dashboard/documentos/page.tsx
edges:
  - [belongs_to, domain--documentos]
  - [uses, component--front-documentos]
terminos: [documentos]
---

# /dashboard/documentos

Pantalla /dashboard/documentos.

- **Ruta:** `/dashboard/documentos`

## Archivos

- `frontend/src/app/dashboard/documentos/page.tsx`

## Relaciones

- `belongs_to` → [[domain--documentos|Documentos]]
- `uses` → [[component--front-documentos|documentos]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
