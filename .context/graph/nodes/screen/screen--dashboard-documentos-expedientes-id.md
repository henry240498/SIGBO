---
id: screen--dashboard-documentos-expedientes-id
tipo: SCREEN
nombre: "/dashboard/documentos/expedientes/[id]"
nivel: L1
dominio: documentos
resumen: "Pantalla /dashboard/documentos/expedientes/[id]."
ruta: /dashboard/documentos/expedientes/[id]
capa: frontend
archivos:
  - frontend/src/app/dashboard/documentos/expedientes/[id]/page.tsx
edges:
  - [belongs_to, domain--documentos]
  - [uses, component--front-documentos]
terminos: [documentos, expedientes]
---

# /dashboard/documentos/expedientes/[id]

Pantalla /dashboard/documentos/expedientes/[id].

- **Ruta:** `/dashboard/documentos/expedientes/[id]`

## Archivos

- `frontend/src/app/dashboard/documentos/expedientes/[id]/page.tsx`

## Relaciones

- `belongs_to` → [[domain--documentos|Documentos]]
- `uses` → [[component--front-documentos|documentos]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
