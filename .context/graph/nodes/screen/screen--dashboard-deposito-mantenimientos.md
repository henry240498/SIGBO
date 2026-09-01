---
id: screen--dashboard-deposito-mantenimientos
tipo: SCREEN
nombre: /dashboard/deposito/mantenimientos
nivel: L1
dominio: deposito
resumen: Pantalla /dashboard/deposito/mantenimientos.
ruta: /dashboard/deposito/mantenimientos
capa: frontend
permisos: [deposito:mantenimiento]
archivos:
  - frontend/src/app/dashboard/deposito/mantenimientos/page.tsx
edges:
  - [belongs_to, domain--deposito]
  - [uses, component--front-api]
  - [uses, component--front-personal]
  - [uses, component--front-equipos]
  - [uses, component--front-deposito]
  - [uses, component--front-aviso]
terminos: [deposito, mantenimientos, mantenimiento]
---

# /dashboard/deposito/mantenimientos

Pantalla /dashboard/deposito/mantenimientos.

- **Ruta:** `/dashboard/deposito/mantenimientos`
- **Permisos referenciados:** `deposito:mantenimiento`

## Archivos

- `frontend/src/app/dashboard/deposito/mantenimientos/page.tsx`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-personal|personal]]
- `uses` → [[component--front-equipos|equipos]]
- `uses` → [[component--front-deposito|deposito]]
- `uses` → [[component--front-aviso|Aviso]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
