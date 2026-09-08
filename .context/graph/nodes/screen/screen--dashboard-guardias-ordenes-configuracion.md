---
id: screen--dashboard-guardias-ordenes-configuracion
tipo: SCREEN
nombre: /dashboard/guardias/ordenes/configuracion
nivel: L1
dominio: guardias
resumen: Pantalla /dashboard/guardias/ordenes/configuracion.
ruta: /dashboard/guardias/ordenes/configuracion
capa: frontend
archivos:
  - frontend/src/app/dashboard/guardias/ordenes/configuracion/page.tsx
edges:
  - [belongs_to, domain--guardias]
  - [uses, component--front-personal]
  - [uses, component--front-guardias]
  - [uses, component--front-cargando]
  - [uses, component--front-aviso]
terminos: [guardias, ordenes, configuracion]
---

# /dashboard/guardias/ordenes/configuracion

Pantalla /dashboard/guardias/ordenes/configuracion.

- **Ruta:** `/dashboard/guardias/ordenes/configuracion`

## Archivos

- `frontend/src/app/dashboard/guardias/ordenes/configuracion/page.tsx`

## Relaciones

- `belongs_to` → [[domain--guardias|Guardias]]
- `uses` → [[component--front-personal|personal]]
- `uses` → [[component--front-guardias|guardias]]
- `uses` → [[component--front-cargando|Cargando]]
- `uses` → [[component--front-aviso|Aviso]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
