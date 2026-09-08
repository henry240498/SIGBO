---
id: screen--dashboard-finanzas-socios-protectores-id
tipo: SCREEN
nombre: "/dashboard/finanzas/socios-protectores/[id]"
nivel: L1
dominio: finanzas
resumen: "Pantalla /dashboard/finanzas/socios-protectores/[id]."
ruta: /dashboard/finanzas/socios-protectores/[id]
capa: frontend
permisos: [finanzas:socios_crear, finanzas:socios_editar, finanzas:aportes_registrar, finanzas:aportes_editar]
archivos:
  - frontend/src/app/dashboard/finanzas/socios-protectores/[id]/page.tsx
edges:
  - [belongs_to, domain--finanzas]
  - [uses, component--front-inputprovider]
  - [uses, component--front-api]
  - [uses, component--front-parametros]
  - [uses, component--front-finanzas]
  - [uses, component--front-socios-protectores]
  - [uses, component--front-cargando]
  - [uses, component--front-aviso]
terminos: [finanzas, socios, protectores, crear, editar, aportes, registrar]
---

# /dashboard/finanzas/socios-protectores/[id]

Pantalla /dashboard/finanzas/socios-protectores/[id].

- **Ruta:** `/dashboard/finanzas/socios-protectores/[id]`
- **Permisos referenciados:** `finanzas:socios_crear`, `finanzas:socios_editar`, `finanzas:aportes_registrar`, `finanzas:aportes_editar`

## Archivos

- `frontend/src/app/dashboard/finanzas/socios-protectores/[id]/page.tsx`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `uses` → [[component--front-inputprovider|InputProvider]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-parametros|parametros]]
- `uses` → [[component--front-finanzas|finanzas]]
- `uses` → [[component--front-socios-protectores|socios-protectores]]
- `uses` → [[component--front-cargando|Cargando]]
- `uses` → [[component--front-aviso|Aviso]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
