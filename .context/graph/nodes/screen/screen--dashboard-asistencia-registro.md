---
id: screen--dashboard-asistencia-registro
tipo: SCREEN
nombre: /dashboard/asistencia/registro
nivel: L1
dominio: asistencia
resumen: Pantalla /dashboard/asistencia/registro.
ruta: /dashboard/asistencia/registro
capa: frontend
permisos: [asistencia:asistencia_crear]
archivos:
  - frontend/src/app/dashboard/asistencia/registro/page.tsx
edges:
  - [belongs_to, domain--asistencia]
  - [uses, component--front-api]
  - [uses, component--front-personal]
  - [uses, component--front-asistencia]
  - [uses, component--front-aviso]
terminos: [asistencia, registro, crear]
---

# /dashboard/asistencia/registro

Pantalla /dashboard/asistencia/registro.

- **Ruta:** `/dashboard/asistencia/registro`
- **Permisos referenciados:** `asistencia:asistencia_crear`

## Archivos

- `frontend/src/app/dashboard/asistencia/registro/page.tsx`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-personal|personal]]
- `uses` → [[component--front-asistencia|asistencia]]
- `uses` → [[component--front-aviso|Aviso]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
