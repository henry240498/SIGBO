---
id: screen--dashboard-seguridad-pantallas
tipo: SCREEN
nombre: /dashboard/seguridad/pantallas
nivel: L1
dominio: seguridad
resumen: Pantalla /dashboard/seguridad/pantallas, consume 5 endpoint(s).
ruta: /dashboard/seguridad/pantallas
capa: frontend
archivos:
  - frontend/src/app/dashboard/seguridad/pantallas/page.tsx
edges:
  - [belongs_to, domain--seguridad]
  - [uses, component--front-api]
  - [calls, api--pantallas-pantallas]
  - [calls, api--pantallas-pantallas]
  - [calls, api--pantallas-pantallas]
  - [calls, api--pantallas-pantallas]
  - [calls, api--pantallas-pantallas]
terminos: [seguridad, pantallas]
---

# /dashboard/seguridad/pantallas

Pantalla /dashboard/seguridad/pantallas, consume 5 endpoint(s).

- **Ruta:** `/dashboard/seguridad/pantallas`

## Endpoints que consume

- `/pantallas`
- `/pantallas/sujetos`
- `/pantallas/reglas?codigo=`
- `/pantallas/reglas`
- `/pantallas/reglas/`

## Archivos

- `frontend/src/app/dashboard/seguridad/pantallas/page.tsx`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `uses` → [[component--front-api|api]]
- `calls` → [[api--pantallas-pantallas|PantallasController]]
- `calls` → [[api--pantallas-pantallas|PantallasController]]
- `calls` → [[api--pantallas-pantallas|PantallasController]]
- `calls` → [[api--pantallas-pantallas|PantallasController]]
- `calls` → [[api--pantallas-pantallas|PantallasController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
