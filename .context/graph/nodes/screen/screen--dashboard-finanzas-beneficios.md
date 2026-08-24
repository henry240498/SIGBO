---
id: screen--dashboard-finanzas-beneficios
tipo: SCREEN
nombre: /dashboard/finanzas/beneficios
nivel: L1
dominio: finanzas
resumen: Pantalla /dashboard/finanzas/beneficios.
ruta: /dashboard/finanzas/beneficios
capa: frontend
permisos: [finanzas:beneficios_administrar]
archivos:
  - frontend/src/app/dashboard/finanzas/beneficios/page.tsx
edges:
  - [belongs_to, domain--finanzas]
  - [uses, component--front-api]
  - [uses, component--front-parametros]
  - [uses, component--front-academia]
  - [uses, component--front-socios-protectores]
terminos: [finanzas, beneficios, administrar]
---

# /dashboard/finanzas/beneficios

Pantalla /dashboard/finanzas/beneficios.

- **Ruta:** `/dashboard/finanzas/beneficios`
- **Permisos referenciados:** `finanzas:beneficios_administrar`

## Archivos

- `frontend/src/app/dashboard/finanzas/beneficios/page.tsx`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-parametros|parametros]]
- `uses` → [[component--front-academia|academia]]
- `uses` → [[component--front-socios-protectores|socios-protectores]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
