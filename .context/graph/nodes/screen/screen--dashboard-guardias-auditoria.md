---
id: screen--dashboard-guardias-auditoria
tipo: SCREEN
nombre: /dashboard/guardias/auditoria
nivel: L1
dominio: guardias
resumen: Pantalla /dashboard/guardias/auditoria, consume 1 endpoint(s).
ruta: /dashboard/guardias/auditoria
capa: frontend
archivos:
  - frontend/src/app/dashboard/guardias/auditoria/page.tsx
edges:
  - [belongs_to, domain--guardias]
  - [uses, component--front-api]
  - [uses, component--front-json-seguro]
  - [uses, component--front-cargando]
  - [calls, api--seguridad-auditoria]
terminos: [guardias, auditoria]
---

# /dashboard/guardias/auditoria

Pantalla /dashboard/guardias/auditoria, consume 1 endpoint(s).

- **Ruta:** `/dashboard/guardias/auditoria`

## Endpoints que consume

- `/seguridad/auditoria?recursoPrefijo=operaciones.&pageSize=200`

## Archivos

- `frontend/src/app/dashboard/guardias/auditoria/page.tsx`

## Relaciones

- `belongs_to` → [[domain--guardias|Guardias]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-json-seguro|json-seguro]]
- `uses` → [[component--front-cargando|Cargando]]
- `calls` → [[api--seguridad-auditoria|AuditoriaController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
