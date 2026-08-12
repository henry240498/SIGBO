---
id: screen--dashboard-asistencia-eventos
tipo: SCREEN
nombre: /dashboard/asistencia/eventos
nivel: L1
dominio: asistencia
resumen: Pantalla /dashboard/asistencia/eventos.
ruta: /dashboard/asistencia/eventos
capa: frontend
permisos: [asistencia:eventos_crear]
archivos:
  - frontend/src/app/dashboard/asistencia/eventos/page.tsx
edges:
  - [belongs_to, domain--asistencia]
  - [uses, component--front-api]
  - [uses, component--front-parametros]
  - [uses, component--front-asistencia]
terminos: [asistencia, eventos, crear]
---

# /dashboard/asistencia/eventos

Pantalla /dashboard/asistencia/eventos.

- **Ruta:** `/dashboard/asistencia/eventos`
- **Permisos referenciados:** `asistencia:eventos_crear`

## Archivos

- `frontend/src/app/dashboard/asistencia/eventos/page.tsx`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-parametros|parametros]]
- `uses` → [[component--front-asistencia|asistencia]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
