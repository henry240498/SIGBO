---
id: screen--dashboard-finanzas-cuentas-bancarias
tipo: SCREEN
nombre: /dashboard/finanzas/cuentas-bancarias
nivel: L1
dominio: finanzas
resumen: Pantalla /dashboard/finanzas/cuentas-bancarias.
ruta: /dashboard/finanzas/cuentas-bancarias
capa: frontend
permisos: [finanzas:administrar_cajas]
archivos:
  - frontend/src/app/dashboard/finanzas/cuentas-bancarias/page.tsx
edges:
  - [belongs_to, domain--finanzas]
  - [uses, component--front-api]
  - [uses, component--front-parametros]
  - [uses, component--front-personal]
  - [uses, component--front-finanzas]
terminos: [finanzas, cuentas, bancarias, administrar, cajas]
---

# /dashboard/finanzas/cuentas-bancarias

Pantalla /dashboard/finanzas/cuentas-bancarias.

- **Ruta:** `/dashboard/finanzas/cuentas-bancarias`
- **Permisos referenciados:** `finanzas:administrar_cajas`

## Archivos

- `frontend/src/app/dashboard/finanzas/cuentas-bancarias/page.tsx`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-parametros|parametros]]
- `uses` → [[component--front-personal|personal]]
- `uses` → [[component--front-finanzas|finanzas]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
