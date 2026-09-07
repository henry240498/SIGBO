---
id: screen--dashboard-deposito-proveedores
tipo: SCREEN
nombre: /dashboard/deposito/proveedores
nivel: L1
dominio: deposito
resumen: Pantalla /dashboard/deposito/proveedores.
ruta: /dashboard/deposito/proveedores
capa: frontend
permisos: [deposito:crear, deposito:editar]
archivos:
  - frontend/src/app/dashboard/deposito/proveedores/page.tsx
edges:
  - [belongs_to, domain--deposito]
  - [uses, component--front-api]
  - [uses, component--front-deposito]
terminos: [deposito, proveedores, crear, editar]
---

# /dashboard/deposito/proveedores

Pantalla /dashboard/deposito/proveedores.

- **Ruta:** `/dashboard/deposito/proveedores`
- **Permisos referenciados:** `deposito:crear`, `deposito:editar`

## Archivos

- `frontend/src/app/dashboard/deposito/proveedores/page.tsx`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-deposito|deposito]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
