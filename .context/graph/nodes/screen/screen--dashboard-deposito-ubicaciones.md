---
id: screen--dashboard-deposito-ubicaciones
tipo: SCREEN
nombre: /dashboard/deposito/ubicaciones
nivel: L1
dominio: deposito
resumen: Pantalla /dashboard/deposito/ubicaciones.
ruta: /dashboard/deposito/ubicaciones
capa: frontend
permisos: [deposito:crear, deposito:editar, deposito:eliminar]
archivos:
  - frontend/src/app/dashboard/deposito/ubicaciones/page.tsx
edges:
  - [belongs_to, domain--deposito]
  - [uses, component--front-api]
  - [uses, component--front-confirmprovider]
  - [uses, component--front-personal]
  - [uses, component--front-parametros]
  - [uses, component--front-deposito]
terminos: [deposito, ubicaciones, crear, editar, eliminar]
---

# /dashboard/deposito/ubicaciones

Pantalla /dashboard/deposito/ubicaciones.

- **Ruta:** `/dashboard/deposito/ubicaciones`
- **Permisos referenciados:** `deposito:crear`, `deposito:editar`, `deposito:eliminar`

## Archivos

- `frontend/src/app/dashboard/deposito/ubicaciones/page.tsx`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-confirmprovider|ConfirmProvider]]
- `uses` → [[component--front-personal|personal]]
- `uses` → [[component--front-parametros|parametros]]
- `uses` → [[component--front-deposito|deposito]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
