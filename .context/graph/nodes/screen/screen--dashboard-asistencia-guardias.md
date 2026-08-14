---
id: screen--dashboard-asistencia-guardias
tipo: SCREEN
nombre: /dashboard/asistencia/guardias
nivel: L1
dominio: asistencia
resumen: Pantalla /dashboard/asistencia/guardias.
ruta: /dashboard/asistencia/guardias
capa: frontend
permisos: [asistencia:guardias_crear]
archivos:
  - frontend/src/app/dashboard/asistencia/guardias/page.tsx
edges:
  - [belongs_to, domain--asistencia]
  - [uses, component--front-api]
  - [uses, component--front-asistencia]
terminos: [asistencia, guardias, crear]
---

# /dashboard/asistencia/guardias

Pantalla /dashboard/asistencia/guardias.

- **Ruta:** `/dashboard/asistencia/guardias`
- **Permisos referenciados:** `asistencia:guardias_crear`

## Archivos

- `frontend/src/app/dashboard/asistencia/guardias/page.tsx`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-asistencia|asistencia]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
