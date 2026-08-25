---
id: screen--dashboard-deposito-bajas
tipo: SCREEN
nombre: /dashboard/deposito/bajas
nivel: L1
dominio: deposito
resumen: Pantalla /dashboard/deposito/bajas.
ruta: /dashboard/deposito/bajas
capa: frontend
permisos: [deposito:baja]
archivos:
  - frontend/src/app/dashboard/deposito/bajas/page.tsx
edges:
  - [belongs_to, domain--deposito]
  - [uses, component--front-api]
  - [uses, component--front-confirmprovider]
  - [uses, component--front-parametros]
  - [uses, component--front-personal]
  - [uses, component--front-vehiculos]
  - [uses, component--front-equipos]
  - [uses, component--front-deposito]
terminos: [deposito, bajas, baja]
---

# /dashboard/deposito/bajas

Pantalla /dashboard/deposito/bajas.

- **Ruta:** `/dashboard/deposito/bajas`
- **Permisos referenciados:** `deposito:baja`

## Archivos

- `frontend/src/app/dashboard/deposito/bajas/page.tsx`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-confirmprovider|ConfirmProvider]]
- `uses` → [[component--front-parametros|parametros]]
- `uses` → [[component--front-personal|personal]]
- `uses` → [[component--front-vehiculos|vehiculos]]
- `uses` → [[component--front-equipos|equipos]]
- `uses` → [[component--front-deposito|deposito]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
