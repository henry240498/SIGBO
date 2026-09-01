---
id: screen--dashboard-asistencia-externos
tipo: SCREEN
nombre: /dashboard/asistencia/externos
nivel: L1
dominio: asistencia
resumen: Pantalla /dashboard/asistencia/externos.
ruta: /dashboard/asistencia/externos
capa: frontend
permisos: [asistencia:externos_crear, asistencia:externos_editar]
archivos:
  - frontend/src/app/dashboard/asistencia/externos/page.tsx
edges:
  - [belongs_to, domain--asistencia]
  - [uses, component--front-api]
  - [uses, component--front-asistencia]
  - [uses, component--front-aviso]
terminos: [asistencia, externos, crear, editar]
---

# /dashboard/asistencia/externos

Pantalla /dashboard/asistencia/externos.

- **Ruta:** `/dashboard/asistencia/externos`
- **Permisos referenciados:** `asistencia:externos_crear`, `asistencia:externos_editar`

## Archivos

- `frontend/src/app/dashboard/asistencia/externos/page.tsx`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-asistencia|asistencia]]
- `uses` → [[component--front-aviso|Aviso]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
