---
id: screen--dashboard
tipo: SCREEN
nombre: /dashboard
nivel: L1
dominio: seguridad
resumen: Pantalla /dashboard, consume 3 endpoint(s).
ruta: /dashboard
capa: frontend
permisos: [sistema:ver]
archivos:
  - frontend/src/app/dashboard/page.tsx
edges:
  - [belongs_to, domain--seguridad]
  - [uses, component--front-api]
  - [uses, component--front-modulos]
  - [uses, component--front-permisos-pantalla]
  - [uses, component--front-systemicon]
  - [uses, component--front-cargando]
  - [uses, component--front-aviso]
  - [uses, component--front-permisospantallaprovider]
  - [uses, component--front-useactualizacionperiodica]
  - [calls, api--salud-salud]
  - [calls, api--sistema-sistema]
  - [calls, api--seguridad-me]
terminos: [sistema, ver]
---

# /dashboard

Pantalla /dashboard, consume 3 endpoint(s).

- **Ruta:** `/dashboard`
- **Permisos referenciados:** `sistema:ver`

## Endpoints que consume

- `/salud`
- `/sistema/resumen`
- `/seguridad/mi-inicio`

## Archivos

- `frontend/src/app/dashboard/page.tsx`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-modulos|modulos]]
- `uses` → [[component--front-permisos-pantalla|permisos-pantalla]]
- `uses` → [[component--front-systemicon|SystemIcon]]
- `uses` → [[component--front-cargando|Cargando]]
- `uses` → [[component--front-aviso|Aviso]]
- `uses` → [[component--front-permisospantallaprovider|PermisosPantallaProvider]]
- `uses` → [[component--front-useactualizacionperiodica|useActualizacionPeriodica]]
- `calls` → [[api--salud-salud|SaludController]]
- `calls` → [[api--sistema-sistema|SistemaController]]
- `calls` → [[api--seguridad-me|MeController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
