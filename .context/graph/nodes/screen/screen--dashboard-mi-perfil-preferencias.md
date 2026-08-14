---
id: screen--dashboard-mi-perfil-preferencias
tipo: SCREEN
nombre: /dashboard/mi-perfil/preferencias
nivel: L1
dominio: seguridad
resumen: Pantalla /dashboard/mi-perfil/preferencias, consume 2 endpoint(s).
ruta: /dashboard/mi-perfil/preferencias
capa: frontend
archivos:
  - frontend/src/app/dashboard/mi-perfil/preferencias/page.tsx
edges:
  - [belongs_to, domain--seguridad]
  - [uses, component--front-api]
  - [uses, component--front-configuracion]
  - [calls, api--configuracion-configuracion]
  - [calls, api--configuracion-configuracion]
terminos: [perfil, preferencias]
---

# /dashboard/mi-perfil/preferencias

Pantalla /dashboard/mi-perfil/preferencias, consume 2 endpoint(s).

- **Ruta:** `/dashboard/mi-perfil/preferencias`

## Endpoints que consume

- `/configuracion/registro-preferencias`
- `/configuracion/mis-preferencias`

## Archivos

- `frontend/src/app/dashboard/mi-perfil/preferencias/page.tsx`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-configuracion|configuracion]]
- `calls` → [[api--configuracion-configuracion|ConfiguracionController]]
- `calls` → [[api--configuracion-configuracion|ConfiguracionController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
