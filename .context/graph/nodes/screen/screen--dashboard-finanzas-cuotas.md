---
id: screen--dashboard-finanzas-cuotas
tipo: SCREEN
nombre: /dashboard/finanzas/cuotas
nivel: L1
dominio: finanzas
resumen: Pantalla /dashboard/finanzas/cuotas.
ruta: /dashboard/finanzas/cuotas
capa: frontend
permisos: [finanzas:crear, finanzas:anular, finanzas:editar]
archivos:
  - frontend/src/app/dashboard/finanzas/cuotas/page.tsx
edges:
  - [belongs_to, domain--finanzas]
  - [uses, component--front-api]
  - [uses, component--front-personal]
  - [uses, component--front-finanzas]
terminos: [finanzas, cuotas, crear, anular, editar]
---

# /dashboard/finanzas/cuotas

Pantalla /dashboard/finanzas/cuotas.

- **Ruta:** `/dashboard/finanzas/cuotas`
- **Permisos referenciados:** `finanzas:crear`, `finanzas:anular`, `finanzas:editar`

## Archivos

- `frontend/src/app/dashboard/finanzas/cuotas/page.tsx`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-personal|personal]]
- `uses` → [[component--front-finanzas|finanzas]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
