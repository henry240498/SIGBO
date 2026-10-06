---
id: screen--dashboard-servicios-cartografia
tipo: SCREEN
nombre: /dashboard/servicios/cartografia
nivel: L1
dominio: servicios
resumen: Pantalla /dashboard/servicios/cartografia.
ruta: /dashboard/servicios/cartografia
capa: frontend
permisos: [servicios:crear, servicios:editar]
archivos:
  - frontend/src/app/dashboard/servicios/cartografia/page.tsx
edges:
  - [belongs_to, domain--servicios]
  - [uses, component--front-api]
  - [uses, component--front-cartografia]
  - [uses, component--front-aviso]
  - [uses, component--front-cargando]
terminos: [servicios, cartografia, crear, editar]
---

# /dashboard/servicios/cartografia

Pantalla /dashboard/servicios/cartografia.

- **Ruta:** `/dashboard/servicios/cartografia`
- **Permisos referenciados:** `servicios:crear`, `servicios:editar`

## Archivos

- `frontend/src/app/dashboard/servicios/cartografia/page.tsx`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-cartografia|cartografia]]
- `uses` → [[component--front-aviso|Aviso]]
- `uses` → [[component--front-cargando|Cargando]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
