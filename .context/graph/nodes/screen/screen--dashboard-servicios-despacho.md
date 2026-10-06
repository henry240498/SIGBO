---
id: screen--dashboard-servicios-despacho
tipo: SCREEN
nombre: /dashboard/servicios/despacho
nivel: L1
dominio: servicios
resumen: Pantalla /dashboard/servicios/despacho.
ruta: /dashboard/servicios/despacho
capa: frontend
permisos: [despacho:seguimiento, despacho:solicitar]
archivos:
  - frontend/src/app/dashboard/servicios/despacho/page.tsx
edges:
  - [belongs_to, domain--servicios]
  - [uses, component--front-api]
  - [uses, component--front-despacho]
  - [uses, component--front-aviso]
  - [uses, component--front-cargando]
terminos: [servicios, despacho, seguimiento, solicitar]
---

# /dashboard/servicios/despacho

Pantalla /dashboard/servicios/despacho.

- **Ruta:** `/dashboard/servicios/despacho`
- **Permisos referenciados:** `despacho:seguimiento`, `despacho:solicitar`

## Archivos

- `frontend/src/app/dashboard/servicios/despacho/page.tsx`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-despacho|despacho]]
- `uses` → [[component--front-aviso|Aviso]]
- `uses` → [[component--front-cargando|Cargando]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
