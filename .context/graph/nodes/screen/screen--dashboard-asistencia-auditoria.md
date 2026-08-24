---
id: screen--dashboard-asistencia-auditoria
tipo: SCREEN
nombre: /dashboard/asistencia/auditoria
nivel: L1
dominio: asistencia
resumen: Pantalla /dashboard/asistencia/auditoria, consume 1 endpoint(s).
ruta: /dashboard/asistencia/auditoria
capa: frontend
archivos:
  - frontend/src/app/dashboard/asistencia/auditoria/page.tsx
edges:
  - [belongs_to, domain--asistencia]
  - [uses, component--front-api]
  - [uses, component--front-json-seguro]
  - [calls, api--seguridad-auditoria]
terminos: [asistencia, auditoria]
---

# /dashboard/asistencia/auditoria

Pantalla /dashboard/asistencia/auditoria, consume 1 endpoint(s).

- **Ruta:** `/dashboard/asistencia/auditoria`

## Endpoints que consume

- `/seguridad/auditoria?recursoPrefijo=operaciones.&pageSize=100`

## Archivos

- `frontend/src/app/dashboard/asistencia/auditoria/page.tsx`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-json-seguro|json-seguro]]
- `calls` → [[api--seguridad-auditoria|AuditoriaController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
