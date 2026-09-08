---
id: screen--dashboard-asistencia
tipo: SCREEN
nombre: /dashboard/asistencia
nivel: L1
dominio: asistencia
resumen: Pantalla /dashboard/asistencia.
ruta: /dashboard/asistencia
capa: frontend
archivos:
  - frontend/src/app/dashboard/asistencia/page.tsx
edges:
  - [belongs_to, domain--asistencia]
  - [uses, component--front-asistencia]
  - [uses, component--front-cargando]
terminos: [asistencia]
---

# /dashboard/asistencia

Pantalla /dashboard/asistencia.

- **Ruta:** `/dashboard/asistencia`

## Archivos

- `frontend/src/app/dashboard/asistencia/page.tsx`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `uses` → [[component--front-asistencia|asistencia]]
- `uses` → [[component--front-cargando|Cargando]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
