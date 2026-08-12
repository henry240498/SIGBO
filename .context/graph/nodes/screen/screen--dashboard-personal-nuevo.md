---
id: screen--dashboard-personal-nuevo
tipo: SCREEN
nombre: /dashboard/personal/nuevo
nivel: L1
dominio: personal
resumen: Pantalla /dashboard/personal/nuevo, consume 1 endpoint(s).
ruta: /dashboard/personal/nuevo
capa: frontend
archivos:
  - frontend/src/app/dashboard/personal/nuevo/page.tsx
edges:
  - [belongs_to, domain--personal]
  - [uses, component--front-api]
  - [uses, component--front-parametros]
  - [calls, api--equipos-equipamiento-bombero]
terminos: [personal, nuevo]
---

# /dashboard/personal/nuevo

Pantalla /dashboard/personal/nuevo, consume 1 endpoint(s).

- **Ruta:** `/dashboard/personal/nuevo`

## Endpoints que consume

- `/personal/bomberos`

## Archivos

- `frontend/src/app/dashboard/personal/nuevo/page.tsx`

## Relaciones

- `belongs_to` → [[domain--personal|Personal]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-parametros|parametros]]
- `calls` → [[api--equipos-equipamiento-bombero|EquipamientoBomberoController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
