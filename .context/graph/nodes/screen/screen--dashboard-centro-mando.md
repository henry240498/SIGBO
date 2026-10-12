---
id: screen--dashboard-centro-mando
tipo: SCREEN
nombre: /dashboard/centro-mando
nivel: L1
dominio: seguridad
resumen: Pantalla /dashboard/centro-mando, consume 1 endpoint(s).
ruta: /dashboard/centro-mando
capa: frontend
permisos: [servicios:editar]
archivos:
  - frontend/src/app/dashboard/centro-mando/page.tsx
edges:
  - [belongs_to, domain--seguridad]
  - [uses, component--front-api]
  - [uses, component--front-aviso]
  - [uses, component--front-cargando]
  - [uses, component--front-permisospantallaprovider]
  - [uses, component--front-useactualizacionperiodica]
  - [calls, api--centro-mando-centro-mando]
terminos: [centro, mando, servicios, editar]
---

# /dashboard/centro-mando

Pantalla /dashboard/centro-mando, consume 1 endpoint(s).

- **Ruta:** `/dashboard/centro-mando`
- **Permisos referenciados:** `servicios:editar`

## Endpoints que consume

- `/centro-mando`

## Archivos

- `frontend/src/app/dashboard/centro-mando/page.tsx`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-aviso|Aviso]]
- `uses` → [[component--front-cargando|Cargando]]
- `uses` → [[component--front-permisospantallaprovider|PermisosPantallaProvider]]
- `uses` → [[component--front-useactualizacionperiodica|useActualizacionPeriodica]]
- `calls` → [[api--centro-mando-centro-mando|CentroMandoController]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
