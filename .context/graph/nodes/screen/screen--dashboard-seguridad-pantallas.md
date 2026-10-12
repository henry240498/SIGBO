---
id: screen--dashboard-seguridad-pantallas
tipo: SCREEN
nombre: /dashboard/seguridad/pantallas
nivel: L1
dominio: seguridad
resumen: Pantalla /dashboard/seguridad/pantallas, consume 7 endpoint(s).
ruta: /dashboard/seguridad/pantallas
capa: frontend
archivos:
  - frontend/src/app/dashboard/seguridad/pantallas/page.tsx
edges:
  - [belongs_to, domain--seguridad]
  - [uses, component--front-api]
  - [uses, component--front-modulos]
  - [uses, component--front-aviso]
  - [uses, component--front-cargando]
  - [uses, component--front-confirmprovider]
  - [uses, component--front-pantallas-admin]
  - [calls, api--pantallas-pantallas]
  - [calls, api--pantallas-pantallas]
  - [calls, api--pantallas-pantallas]
  - [calls, api--pantallas-pantallas]
  - [calls, api--pantallas-pantallas]
  - [calls, api--pantallas-pantallas]
  - [calls, api--pantallas-pantallas]
terminos: [seguridad, pantallas]
---

# /dashboard/seguridad/pantallas

Pantalla /dashboard/seguridad/pantallas, consume 7 endpoint(s).

- **Ruta:** `/dashboard/seguridad/pantallas`

## Endpoints que consume

- `/pantallas`
- `/pantallas/catalogo-web`
- `/pantallas/sujetos`
- `/pantallas/reglas?codigo=`
- `/pantallas/reglas`
- `/pantallas/reglas/`
- `/pantallas/vista-previa?usuarioId=`

## Archivos

- `frontend/src/app/dashboard/seguridad/pantallas/page.tsx`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-modulos|modulos]]
- `uses` → [[component--front-aviso|Aviso]]
- `uses` → [[component--front-cargando|Cargando]]
- `uses` → [[component--front-confirmprovider|ConfirmProvider]]
- `uses` → [[component--front-pantallas-admin|pantallas-admin]]
- `calls` → [[api--pantallas-pantallas|PantallasController]]
- `calls` → [[api--pantallas-pantallas|PantallasController]]
- `calls` → [[api--pantallas-pantallas|PantallasController]]
- `calls` → [[api--pantallas-pantallas|PantallasController]]
- `calls` → [[api--pantallas-pantallas|PantallasController]]
- `calls` → [[api--pantallas-pantallas|PantallasController]]
- `calls` → [[api--pantallas-pantallas|PantallasController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
