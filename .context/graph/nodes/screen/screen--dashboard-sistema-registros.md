---
id: screen--dashboard-sistema-registros
tipo: SCREEN
nombre: /dashboard/sistema/registros
nivel: L1
dominio: sistema
resumen: Pantalla /dashboard/sistema/registros, consume 1 endpoint(s).
ruta: /dashboard/sistema/registros
capa: frontend
archivos:
  - frontend/src/app/dashboard/sistema/registros/page.tsx
edges:
  - [belongs_to, domain--sistema]
  - [uses, component--front-api]
  - [uses, component--front-aviso]
  - [uses, component--front-cargando]
  - [uses, component--front-permisospantallaprovider]
  - [uses, component--front-useactualizacionperiodica]
  - [calls, api--sistema-sistema]
terminos: [sistema, registros]
---

# /dashboard/sistema/registros

Pantalla /dashboard/sistema/registros, consume 1 endpoint(s).

- **Ruta:** `/dashboard/sistema/registros`

## Endpoints que consume

- `/sistema/registros?archivo=`

## Archivos

- `frontend/src/app/dashboard/sistema/registros/page.tsx`

## Relaciones

- `belongs_to` → [[domain--sistema|Sistema]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-aviso|Aviso]]
- `uses` → [[component--front-cargando|Cargando]]
- `uses` → [[component--front-permisospantallaprovider|PermisosPantallaProvider]]
- `uses` → [[component--front-useactualizacionperiodica|useActualizacionPeriodica]]
- `calls` → [[api--sistema-sistema|SistemaController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
