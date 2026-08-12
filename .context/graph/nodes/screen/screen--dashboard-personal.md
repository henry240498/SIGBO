---
id: screen--dashboard-personal
tipo: SCREEN
nombre: /dashboard/personal
nivel: L1
dominio: personal
resumen: Pantalla /dashboard/personal, consume 1 endpoint(s).
ruta: /dashboard/personal
capa: frontend
permisos: [personal:crear, personal:eliminar]
archivos:
  - frontend/src/app/dashboard/personal/page.tsx
edges:
  - [belongs_to, domain--personal]
  - [uses, component--front-api]
  - [uses, component--front-exportar]
  - [uses, component--front-texto]
  - [uses, component--front-personal]
  - [calls, api--equipos-equipamiento-bombero]
terminos: [personal, crear, eliminar]
---

# /dashboard/personal

Pantalla /dashboard/personal, consume 1 endpoint(s).

- **Ruta:** `/dashboard/personal`
- **Permisos referenciados:** `personal:crear`, `personal:eliminar`

## Endpoints que consume

- `/personal/bomberos/`

## Archivos

- `frontend/src/app/dashboard/personal/page.tsx`

## Relaciones

- `belongs_to` → [[domain--personal|Personal]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-exportar|exportar]]
- `uses` → [[component--front-texto|texto]]
- `uses` → [[component--front-personal|personal]]
- `calls` → [[api--equipos-equipamiento-bombero|EquipamientoBomberoController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
