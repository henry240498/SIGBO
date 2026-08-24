---
id: screen--dashboard-finanzas-ejercicios-fiscales
tipo: SCREEN
nombre: /dashboard/finanzas/ejercicios-fiscales
nivel: L1
dominio: finanzas
resumen: Pantalla /dashboard/finanzas/ejercicios-fiscales.
ruta: /dashboard/finanzas/ejercicios-fiscales
capa: frontend
permisos: [finanzas:administrar_presupuesto]
archivos:
  - frontend/src/app/dashboard/finanzas/ejercicios-fiscales/page.tsx
edges:
  - [belongs_to, domain--finanzas]
  - [uses, component--front-api]
  - [uses, component--front-finanzas]
terminos: [finanzas, ejercicios, fiscales, administrar, presupuesto]
---

# /dashboard/finanzas/ejercicios-fiscales

Pantalla /dashboard/finanzas/ejercicios-fiscales.

- **Ruta:** `/dashboard/finanzas/ejercicios-fiscales`
- **Permisos referenciados:** `finanzas:administrar_presupuesto`

## Archivos

- `frontend/src/app/dashboard/finanzas/ejercicios-fiscales/page.tsx`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-finanzas|finanzas]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
