---
id: screen--dashboard-finanzas-socios-protectores
tipo: SCREEN
nombre: /dashboard/finanzas/socios-protectores
nivel: L1
dominio: finanzas
resumen: Pantalla /dashboard/finanzas/socios-protectores.
ruta: /dashboard/finanzas/socios-protectores
capa: frontend
permisos: [finanzas:socios_crear, finanzas:socios_editar]
archivos:
  - frontend/src/app/dashboard/finanzas/socios-protectores/page.tsx
edges:
  - [belongs_to, domain--finanzas]
  - [uses, component--front-api]
  - [uses, component--front-personal]
  - [uses, component--front-parametros]
  - [uses, component--front-socios-protectores]
terminos: [finanzas, socios, protectores, crear, editar]
---

# /dashboard/finanzas/socios-protectores

Pantalla /dashboard/finanzas/socios-protectores.

- **Ruta:** `/dashboard/finanzas/socios-protectores`
- **Permisos referenciados:** `finanzas:socios_crear`, `finanzas:socios_editar`

## Archivos

- `frontend/src/app/dashboard/finanzas/socios-protectores/page.tsx`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-personal|personal]]
- `uses` → [[component--front-parametros|parametros]]
- `uses` → [[component--front-socios-protectores|socios-protectores]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
