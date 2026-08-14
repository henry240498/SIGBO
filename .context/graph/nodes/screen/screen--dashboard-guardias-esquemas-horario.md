---
id: screen--dashboard-guardias-esquemas-horario
tipo: SCREEN
nombre: /dashboard/guardias/esquemas-horario
nivel: L1
dominio: guardias
resumen: Pantalla /dashboard/guardias/esquemas-horario.
ruta: /dashboard/guardias/esquemas-horario
capa: frontend
permisos: [guardias:requisitos]
archivos:
  - frontend/src/app/dashboard/guardias/esquemas-horario/page.tsx
edges:
  - [belongs_to, domain--guardias]
  - [uses, component--front-api]
  - [uses, component--front-guardias]
terminos: [guardias, esquemas, horario, requisitos]
---

# /dashboard/guardias/esquemas-horario

Pantalla /dashboard/guardias/esquemas-horario.

- **Ruta:** `/dashboard/guardias/esquemas-horario`
- **Permisos referenciados:** `guardias:requisitos`

## Archivos

- `frontend/src/app/dashboard/guardias/esquemas-horario/page.tsx`

## Relaciones

- `belongs_to` → [[domain--guardias|Guardias]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-guardias|guardias]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
