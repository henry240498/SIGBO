---
id: screen--dashboard-documentos-vencimientos
tipo: SCREEN
nombre: /dashboard/documentos/vencimientos
nivel: L1
dominio: documentos
resumen: Pantalla /dashboard/documentos/vencimientos.
ruta: /dashboard/documentos/vencimientos
capa: frontend
archivos:
  - frontend/src/app/dashboard/documentos/vencimientos/page.tsx
edges:
  - [belongs_to, domain--documentos]
  - [uses, component--front-parametros]
  - [uses, component--front-documentos]
  - [uses, component--front-aviso]
terminos: [documentos, vencimientos]
---

# /dashboard/documentos/vencimientos

Pantalla /dashboard/documentos/vencimientos.

- **Ruta:** `/dashboard/documentos/vencimientos`

## Archivos

- `frontend/src/app/dashboard/documentos/vencimientos/page.tsx`

## Relaciones

- `belongs_to` → [[domain--documentos|Documentos]]
- `uses` → [[component--front-parametros|parametros]]
- `uses` → [[component--front-documentos|documentos]]
- `uses` → [[component--front-aviso|Aviso]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
