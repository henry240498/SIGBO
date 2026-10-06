---
id: screen--dashboard-servicios-convocatorias
tipo: SCREEN
nombre: /dashboard/servicios/convocatorias
nivel: L1
dominio: servicios
resumen: Pantalla /dashboard/servicios/convocatorias.
ruta: /dashboard/servicios/convocatorias
capa: frontend
permisos: [servicios:convocar]
archivos:
  - frontend/src/app/dashboard/servicios/convocatorias/page.tsx
edges:
  - [belongs_to, domain--servicios]
  - [uses, component--front-api]
  - [uses, component--front-llamados]
  - [uses, component--front-aviso]
  - [uses, component--front-cargando]
terminos: [servicios, convocatorias, convocar]
---

# /dashboard/servicios/convocatorias

Pantalla /dashboard/servicios/convocatorias.

- **Ruta:** `/dashboard/servicios/convocatorias`
- **Permisos referenciados:** `servicios:convocar`

## Archivos

- `frontend/src/app/dashboard/servicios/convocatorias/page.tsx`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-llamados|llamados]]
- `uses` → [[component--front-aviso|Aviso]]
- `uses` → [[component--front-cargando|Cargando]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
