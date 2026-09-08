---
id: screen--dashboard-deposito-movimientos
tipo: SCREEN
nombre: /dashboard/deposito/movimientos
nivel: L1
dominio: deposito
resumen: Pantalla /dashboard/deposito/movimientos.
ruta: /dashboard/deposito/movimientos
capa: frontend
permisos: [deposito:movimiento]
archivos:
  - frontend/src/app/dashboard/deposito/movimientos/page.tsx
edges:
  - [belongs_to, domain--deposito]
  - [uses, component--front-api]
  - [uses, component--front-parametros]
  - [uses, component--front-personal]
  - [uses, component--front-vehiculos]
  - [uses, component--front-equipos]
  - [uses, component--front-deposito]
  - [uses, component--front-aviso]
terminos: [deposito, movimientos, movimiento]
---

# /dashboard/deposito/movimientos

Pantalla /dashboard/deposito/movimientos.

- **Ruta:** `/dashboard/deposito/movimientos`
- **Permisos referenciados:** `deposito:movimiento`

## Archivos

- `frontend/src/app/dashboard/deposito/movimientos/page.tsx`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-parametros|parametros]]
- `uses` → [[component--front-personal|personal]]
- `uses` → [[component--front-vehiculos|vehiculos]]
- `uses` → [[component--front-equipos|equipos]]
- `uses` → [[component--front-deposito|deposito]]
- `uses` → [[component--front-aviso|Aviso]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
