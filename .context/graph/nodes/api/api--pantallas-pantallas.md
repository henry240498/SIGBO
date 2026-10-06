---
id: api--pantallas-pantallas
tipo: API
nombre: PantallasController
nivel: L2
dominio: seguridad
resumen: Permisos por pantalla (rol, usuario, rango, cargo). Configurarlos requiere seguridad:gestionar_pantallas.
prefijo: /api/v1/pantallas
capa: backend
permisos: [navegacion:registrar, seguridad:gestionar_pantallas]
archivos:
  - backend/src/modules/pantallas/pantallas.controller.ts
edges:
  - [belongs_to, domain--seguridad]
  - [exposes, service--pantallas-pantallas]
  - [exposes, service--pantallas-navegacion]
terminos: [pantallas, navegacion, registrar, seguridad, gestionar]
---

# PantallasController

Permisos por pantalla (rol, usuario, rango, cargo). Configurarlos requiere seguridad:gestionar_pantallas.

- **Prefijo:** `/api/v1/pantallas`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/pantallas/mis-permisos` | `navegacion:registrar` |
| GET | `/pantallas` | `seguridad:gestionar_pantallas` |
| GET | `/pantallas/sujetos` | `seguridad:gestionar_pantallas` |
| GET | `/pantallas/reglas` | `seguridad:gestionar_pantallas` |
| PUT | `/pantallas/reglas` | `seguridad:gestionar_pantallas` |
| POST | `/pantallas` | `navegacion:registrar` |

## Archivos

- `backend/src/modules/pantallas/pantallas.controller.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `exposes` → [[service--pantallas-pantallas|PantallasService]]
- `exposes` → [[service--pantallas-navegacion|NavegacionService]]

## Referenciado por

- [[screen--dashboard-seguridad-pantallas|/dashboard/seguridad/pantallas]] `calls` →
- [[screen--dashboard-seguridad-pantallas|/dashboard/seguridad/pantallas]] `calls` →
- [[screen--dashboard-seguridad-pantallas|/dashboard/seguridad/pantallas]] `calls` →
- [[screen--dashboard-seguridad-pantallas|/dashboard/seguridad/pantallas]] `calls` →
- [[screen--dashboard-seguridad-pantallas|/dashboard/seguridad/pantallas]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
