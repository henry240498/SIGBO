---
id: screen--dashboard-finanzas-movimientos
tipo: SCREEN
nombre: /dashboard/finanzas/movimientos
nivel: L1
dominio: finanzas
resumen: Pantalla /dashboard/finanzas/movimientos.
ruta: /dashboard/finanzas/movimientos
capa: frontend
permisos: [finanzas:crear, finanzas:anular, finanzas:reportes]
archivos:
  - frontend/src/app/dashboard/finanzas/movimientos/page.tsx
edges:
  - [belongs_to, domain--finanzas]
  - [uses, component--front-api]
  - [uses, component--front-parametros]
  - [uses, component--front-personal]
  - [uses, component--front-deposito]
  - [uses, component--front-finanzas]
terminos: [finanzas, movimientos, crear, anular, reportes]
---

# /dashboard/finanzas/movimientos

Pantalla /dashboard/finanzas/movimientos.

- **Ruta:** `/dashboard/finanzas/movimientos`
- **Permisos referenciados:** `finanzas:crear`, `finanzas:anular`, `finanzas:reportes`

## Archivos

- `frontend/src/app/dashboard/finanzas/movimientos/page.tsx`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-parametros|parametros]]
- `uses` → [[component--front-personal|personal]]
- `uses` → [[component--front-deposito|deposito]]
- `uses` → [[component--front-finanzas|finanzas]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
