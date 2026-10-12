---
id: screen--dashboard-sistema-app-movil
tipo: SCREEN
nombre: /dashboard/sistema/app-movil
nivel: L1
dominio: sistema
resumen: Pantalla /dashboard/sistema/app-movil, consume 2 endpoint(s).
ruta: /dashboard/sistema/app-movil
capa: frontend
archivos:
  - frontend/src/app/dashboard/sistema/app-movil/page.tsx
edges:
  - [belongs_to, domain--sistema]
  - [uses, component--front-api]
  - [uses, component--front-aviso]
  - [uses, component--front-cargando]
  - [uses, component--front-useactualizacionperiodica]
  - [calls, api--sistema-sistema]
  - [calls, api--sistema-sistema]
terminos: [sistema, movil]
---

# /dashboard/sistema/app-movil

Pantalla /dashboard/sistema/app-movil, consume 2 endpoint(s).

- **Ruta:** `/dashboard/sistema/app-movil`

## Endpoints que consume

- `/sistema/app-movil`
- `/sistema/conexion-movil`

## Archivos

- `frontend/src/app/dashboard/sistema/app-movil/page.tsx`

## Relaciones

- `belongs_to` → [[domain--sistema|Sistema]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-aviso|Aviso]]
- `uses` → [[component--front-cargando|Cargando]]
- `uses` → [[component--front-useactualizacionperiodica|useActualizacionPeriodica]]
- `calls` → [[api--sistema-sistema|SistemaController]]
- `calls` → [[api--sistema-sistema|SistemaController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
