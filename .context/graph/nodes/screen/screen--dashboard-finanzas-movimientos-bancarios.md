---
id: screen--dashboard-finanzas-movimientos-bancarios
tipo: SCREEN
nombre: /dashboard/finanzas/movimientos-bancarios
nivel: L1
dominio: finanzas
resumen: Pantalla /dashboard/finanzas/movimientos-bancarios.
ruta: /dashboard/finanzas/movimientos-bancarios
capa: frontend
permisos: [finanzas:crear, finanzas:conciliar]
archivos:
  - frontend/src/app/dashboard/finanzas/movimientos-bancarios/page.tsx
edges:
  - [belongs_to, domain--finanzas]
  - [uses, component--front-api]
  - [uses, component--front-finanzas]
terminos: [finanzas, movimientos, bancarios, crear, conciliar]
---

# /dashboard/finanzas/movimientos-bancarios

Pantalla /dashboard/finanzas/movimientos-bancarios.

- **Ruta:** `/dashboard/finanzas/movimientos-bancarios`
- **Permisos referenciados:** `finanzas:crear`, `finanzas:conciliar`

## Archivos

- `frontend/src/app/dashboard/finanzas/movimientos-bancarios/page.tsx`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-finanzas|finanzas]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
