---
id: screen--dashboard-sistema-datos
tipo: SCREEN
nombre: /dashboard/sistema/datos
nivel: L1
dominio: sistema
resumen: Pantalla /dashboard/sistema/datos, consume 4 endpoint(s).
ruta: /dashboard/sistema/datos
capa: frontend
permisos: [sistema:operar]
archivos:
  - frontend/src/app/dashboard/sistema/datos/page.tsx
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
  - [calls, api--sistema-sistema]
  - [calls, api--sistema-sistema]
terminos: [sistema, datos, operar]
---

# /dashboard/sistema/datos

Pantalla /dashboard/sistema/datos, consume 4 endpoint(s).

- **Ruta:** `/dashboard/sistema/datos`
- **Permisos referenciados:** `sistema:operar`

## Endpoints que consume

- `/sistema/respaldos`
- `/sistema/migraciones`
- `/sistema/respaldos/ejecutar`
- `/sistema/respaldos/`

## Archivos

- `frontend/src/app/dashboard/sistema/datos/page.tsx`

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
- `calls` → [[api--sistema-sistema|SistemaController]]
- `calls` → [[api--sistema-sistema|SistemaController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
