---
id: screen--dashboard-finanzas-presupuesto
tipo: SCREEN
nombre: /dashboard/finanzas/presupuesto
nivel: L1
dominio: finanzas
resumen: Pantalla /dashboard/finanzas/presupuesto.
ruta: /dashboard/finanzas/presupuesto
capa: frontend
permisos: [finanzas:administrar_presupuesto, finanzas:reportes]
archivos:
  - frontend/src/app/dashboard/finanzas/presupuesto/page.tsx
edges:
  - [belongs_to, domain--finanzas]
  - [uses, component--front-api]
  - [uses, component--front-parametros]
  - [uses, component--front-finanzas]
terminos: [finanzas, presupuesto, administrar, reportes]
---

# /dashboard/finanzas/presupuesto

Pantalla /dashboard/finanzas/presupuesto.

- **Ruta:** `/dashboard/finanzas/presupuesto`
- **Permisos referenciados:** `finanzas:administrar_presupuesto`, `finanzas:reportes`

## Archivos

- `frontend/src/app/dashboard/finanzas/presupuesto/page.tsx`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-parametros|parametros]]
- `uses` → [[component--front-finanzas|finanzas]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
