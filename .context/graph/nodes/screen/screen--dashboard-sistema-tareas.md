---
id: screen--dashboard-sistema-tareas
tipo: SCREEN
nombre: /dashboard/sistema/tareas
nivel: L1
dominio: sistema
resumen: Pantalla /dashboard/sistema/tareas, consume 3 endpoint(s).
ruta: /dashboard/sistema/tareas
capa: frontend
permisos: [sistema:operar, matpel:administrar_gre]
archivos:
  - frontend/src/app/dashboard/sistema/tareas/page.tsx
edges:
  - [belongs_to, domain--sistema]
  - [uses, component--front-api]
  - [uses, component--front-aviso]
  - [uses, component--front-cargando]
  - [uses, component--front-confirmprovider]
  - [uses, component--front-permisospantallaprovider]
  - [uses, component--front-useactualizacionperiodica]
  - [calls, api--sistema-sistema]
  - [calls, api--sistema-sistema]
  - [calls, api--gre-gre-admin]
terminos: [sistema, tareas, operar, matpel, administrar, gre]
---

# /dashboard/sistema/tareas

Pantalla /dashboard/sistema/tareas, consume 3 endpoint(s).

- **Ruta:** `/dashboard/sistema/tareas`
- **Permisos referenciados:** `sistema:operar`, `matpel:administrar_gre`

## Endpoints que consume

- `/sistema/tareas`
- `/sistema/tareas/avisos-vencimiento/ejecutar`
- `/matpel/administracion/importaciones/procesar`

## Archivos

- `frontend/src/app/dashboard/sistema/tareas/page.tsx`

## Relaciones

- `belongs_to` → [[domain--sistema|Sistema]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-aviso|Aviso]]
- `uses` → [[component--front-cargando|Cargando]]
- `uses` → [[component--front-confirmprovider|ConfirmProvider]]
- `uses` → [[component--front-permisospantallaprovider|PermisosPantallaProvider]]
- `uses` → [[component--front-useactualizacionperiodica|useActualizacionPeriodica]]
- `calls` → [[api--sistema-sistema|SistemaController]]
- `calls` → [[api--sistema-sistema|SistemaController]]
- `calls` → [[api--gre-gre-admin|GreAdminController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
