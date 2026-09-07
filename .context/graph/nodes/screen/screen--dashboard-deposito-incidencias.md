---
id: screen--dashboard-deposito-incidencias
tipo: SCREEN
nombre: /dashboard/deposito/incidencias
nivel: L1
dominio: deposito
resumen: Pantalla /dashboard/deposito/incidencias.
ruta: /dashboard/deposito/incidencias
capa: frontend
permisos: [deposito:crear, deposito:editar]
archivos:
  - frontend/src/app/dashboard/deposito/incidencias/page.tsx
edges:
  - [belongs_to, domain--deposito]
  - [uses, component--front-api]
  - [uses, component--front-equipos]
  - [uses, component--front-vehiculos]
  - [uses, component--front-deposito]
terminos: [deposito, incidencias, crear, editar]
---

# /dashboard/deposito/incidencias

Pantalla /dashboard/deposito/incidencias.

- **Ruta:** `/dashboard/deposito/incidencias`
- **Permisos referenciados:** `deposito:crear`, `deposito:editar`

## Archivos

- `frontend/src/app/dashboard/deposito/incidencias/page.tsx`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-equipos|equipos]]
- `uses` → [[component--front-vehiculos|vehiculos]]
- `uses` → [[component--front-deposito|deposito]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
