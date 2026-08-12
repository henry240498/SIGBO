---
id: screen--dashboard-seguridad-configuracion
tipo: SCREEN
nombre: /dashboard/seguridad/configuracion
nivel: L1
dominio: seguridad
resumen: Pantalla /dashboard/seguridad/configuracion.
ruta: /dashboard/seguridad/configuracion
capa: frontend
archivos:
  - frontend/src/app/dashboard/seguridad/configuracion/page.tsx
edges:
  - [belongs_to, domain--seguridad]
  - [uses, component--front-api]
  - [uses, component--front-configuracion]
terminos: [seguridad, configuracion]
---

# /dashboard/seguridad/configuracion

Pantalla /dashboard/seguridad/configuracion.

- **Ruta:** `/dashboard/seguridad/configuracion`

## Archivos

- `frontend/src/app/dashboard/seguridad/configuracion/page.tsx`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-configuracion|configuracion]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
