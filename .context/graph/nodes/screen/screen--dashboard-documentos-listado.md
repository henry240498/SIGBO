---
id: screen--dashboard-documentos-listado
tipo: SCREEN
nombre: /dashboard/documentos/listado
nivel: L1
dominio: documentos
resumen: Pantalla /dashboard/documentos/listado.
ruta: /dashboard/documentos/listado
capa: frontend
permisos: [documentos:crear]
archivos:
  - frontend/src/app/dashboard/documentos/listado/page.tsx
edges:
  - [belongs_to, domain--documentos]
  - [uses, component--front-api]
  - [uses, component--front-parametros]
  - [uses, component--front-documentos]
terminos: [documentos, listado, crear]
---

# /dashboard/documentos/listado

Pantalla /dashboard/documentos/listado.

- **Ruta:** `/dashboard/documentos/listado`
- **Permisos referenciados:** `documentos:crear`

## Archivos

- `frontend/src/app/dashboard/documentos/listado/page.tsx`

## Relaciones

- `belongs_to` → [[domain--documentos|Documentos]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-parametros|parametros]]
- `uses` → [[component--front-documentos|documentos]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
