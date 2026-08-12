---
id: screen--dashboard-seguridad-auditoria
tipo: SCREEN
nombre: /dashboard/seguridad/auditoria
nivel: L1
dominio: seguridad
resumen: Pantalla /dashboard/seguridad/auditoria, consume 1 endpoint(s).
ruta: /dashboard/seguridad/auditoria
capa: frontend
archivos:
  - frontend/src/app/dashboard/seguridad/auditoria/page.tsx
edges:
  - [belongs_to, domain--seguridad]
  - [uses, component--front-api]
  - [calls, api--seguridad-auditoria]
terminos: [seguridad, auditoria]
---

# /dashboard/seguridad/auditoria

Pantalla /dashboard/seguridad/auditoria, consume 1 endpoint(s).

- **Ruta:** `/dashboard/seguridad/auditoria`

## Endpoints que consume

- `/seguridad/auditoria?`

## Archivos

- `frontend/src/app/dashboard/seguridad/auditoria/page.tsx`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `uses` → [[component--front-api|api]]
- `calls` → [[api--seguridad-auditoria|AuditoriaController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
