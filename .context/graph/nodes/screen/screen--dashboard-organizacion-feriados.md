---
id: screen--dashboard-organizacion-feriados
tipo: SCREEN
nombre: /dashboard/organizacion/feriados
nivel: L1
dominio: organizacion
resumen: Pantalla /dashboard/organizacion/feriados.
ruta: /dashboard/organizacion/feriados
capa: frontend
permisos: [organizacion:feriados_crear, organizacion:feriados_editar, organizacion:feriados_eliminar]
archivos:
  - frontend/src/app/dashboard/organizacion/feriados/page.tsx
edges:
  - [belongs_to, domain--organizacion]
  - [uses, component--front-confirmprovider]
  - [uses, component--front-api]
  - [uses, component--front-guardias]
  - [uses, component--front-aviso]
terminos: [organizacion, feriados, crear, editar, eliminar]
---

# /dashboard/organizacion/feriados

Pantalla /dashboard/organizacion/feriados.

- **Ruta:** `/dashboard/organizacion/feriados`
- **Permisos referenciados:** `organizacion:feriados_crear`, `organizacion:feriados_editar`, `organizacion:feriados_eliminar`

## Archivos

- `frontend/src/app/dashboard/organizacion/feriados/page.tsx`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `uses` → [[component--front-confirmprovider|ConfirmProvider]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-guardias|guardias]]
- `uses` → [[component--front-aviso|Aviso]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
