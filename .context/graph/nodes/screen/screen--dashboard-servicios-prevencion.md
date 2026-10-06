---
id: screen--dashboard-servicios-prevencion
tipo: SCREEN
nombre: /dashboard/servicios/prevencion
nivel: L1
dominio: servicios
resumen: Pantalla /dashboard/servicios/prevencion.
ruta: /dashboard/servicios/prevencion
capa: frontend
permisos: [servicios:crear]
archivos:
  - frontend/src/app/dashboard/servicios/prevencion/page.tsx
edges:
  - [belongs_to, domain--servicios]
  - [uses, component--front-api]
  - [uses, component--front-reservas]
  - [uses, component--front-aviso]
  - [uses, component--front-cargando]
terminos: [servicios, prevencion, crear]
---

# /dashboard/servicios/prevencion

Pantalla /dashboard/servicios/prevencion.

- **Ruta:** `/dashboard/servicios/prevencion`
- **Permisos referenciados:** `servicios:crear`

## Archivos

- `frontend/src/app/dashboard/servicios/prevencion/page.tsx`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-reservas|reservas]]
- `uses` → [[component--front-aviso|Aviso]]
- `uses` → [[component--front-cargando|Cargando]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
