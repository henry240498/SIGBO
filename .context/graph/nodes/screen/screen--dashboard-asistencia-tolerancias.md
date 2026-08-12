---
id: screen--dashboard-asistencia-tolerancias
tipo: SCREEN
nombre: /dashboard/asistencia/tolerancias
nivel: L1
dominio: asistencia
resumen: Pantalla /dashboard/asistencia/tolerancias.
ruta: /dashboard/asistencia/tolerancias
capa: frontend
permisos: [asistencia:asistencia_editar]
archivos:
  - frontend/src/app/dashboard/asistencia/tolerancias/page.tsx
edges:
  - [belongs_to, domain--asistencia]
  - [uses, component--front-api]
  - [uses, component--front-parametros]
  - [uses, component--front-asistencia]
terminos: [asistencia, tolerancias, editar]
---

# /dashboard/asistencia/tolerancias

Pantalla /dashboard/asistencia/tolerancias.

- **Ruta:** `/dashboard/asistencia/tolerancias`
- **Permisos referenciados:** `asistencia:asistencia_editar`

## Archivos

- `frontend/src/app/dashboard/asistencia/tolerancias/page.tsx`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-parametros|parametros]]
- `uses` → [[component--front-asistencia|asistencia]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
