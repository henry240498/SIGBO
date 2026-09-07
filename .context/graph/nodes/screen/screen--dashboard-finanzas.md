---
id: screen--dashboard-finanzas
tipo: SCREEN
nombre: /dashboard/finanzas
nivel: L1
dominio: finanzas
resumen: Pantalla /dashboard/finanzas.
ruta: /dashboard/finanzas
capa: frontend
archivos:
  - frontend/src/app/dashboard/finanzas/page.tsx
edges:
  - [belongs_to, domain--finanzas]
  - [uses, component--front-parametros]
  - [uses, component--front-finanzas]
terminos: [finanzas]
---

# /dashboard/finanzas

Pantalla /dashboard/finanzas.

- **Ruta:** `/dashboard/finanzas`

## Archivos

- `frontend/src/app/dashboard/finanzas/page.tsx`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `uses` → [[component--front-parametros|parametros]]
- `uses` → [[component--front-finanzas|finanzas]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
