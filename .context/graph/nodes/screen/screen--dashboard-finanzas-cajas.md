---
id: screen--dashboard-finanzas-cajas
tipo: SCREEN
nombre: /dashboard/finanzas/cajas
nivel: L1
dominio: finanzas
resumen: Pantalla /dashboard/finanzas/cajas.
ruta: /dashboard/finanzas/cajas
capa: frontend
permisos: [finanzas:cerrar_caja, finanzas:administrar_cajas]
archivos:
  - frontend/src/app/dashboard/finanzas/cajas/page.tsx
edges:
  - [belongs_to, domain--finanzas]
  - [uses, component--front-api]
  - [uses, component--front-confirmprovider]
  - [uses, component--front-personal]
  - [uses, component--front-finanzas]
  - [uses, component--front-cargando]
  - [uses, component--front-aviso]
terminos: [finanzas, cajas, cerrar, caja, administrar]
---

# /dashboard/finanzas/cajas

Pantalla /dashboard/finanzas/cajas.

- **Ruta:** `/dashboard/finanzas/cajas`
- **Permisos referenciados:** `finanzas:cerrar_caja`, `finanzas:administrar_cajas`

## Archivos

- `frontend/src/app/dashboard/finanzas/cajas/page.tsx`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-confirmprovider|ConfirmProvider]]
- `uses` → [[component--front-personal|personal]]
- `uses` → [[component--front-finanzas|finanzas]]
- `uses` → [[component--front-cargando|Cargando]]
- `uses` → [[component--front-aviso|Aviso]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
