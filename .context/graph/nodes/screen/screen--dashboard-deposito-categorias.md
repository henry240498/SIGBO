---
id: screen--dashboard-deposito-categorias
tipo: SCREEN
nombre: /dashboard/deposito/categorias
nivel: L1
dominio: deposito
resumen: Pantalla /dashboard/deposito/categorias.
ruta: /dashboard/deposito/categorias
capa: frontend
permisos: [deposito:crear, deposito:editar, deposito:eliminar]
archivos:
  - frontend/src/app/dashboard/deposito/categorias/page.tsx
edges:
  - [belongs_to, domain--deposito]
  - [uses, component--front-api]
  - [uses, component--front-confirmprovider]
  - [uses, component--front-deposito]
  - [uses, component--front-aviso]
terminos: [deposito, categorias, crear, editar, eliminar]
---

# /dashboard/deposito/categorias

Pantalla /dashboard/deposito/categorias.

- **Ruta:** `/dashboard/deposito/categorias`
- **Permisos referenciados:** `deposito:crear`, `deposito:editar`, `deposito:eliminar`

## Archivos

- `frontend/src/app/dashboard/deposito/categorias/page.tsx`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-confirmprovider|ConfirmProvider]]
- `uses` → [[component--front-deposito|deposito]]
- `uses` → [[component--front-aviso|Aviso]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
