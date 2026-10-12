---
id: api--sistema-sistema
tipo: API
nombre: SistemaController
nivel: L2
dominio: seguridad
resumen: "Area Sistema del Centro de mando (spec 2026-10-09 §6)."
prefijo: /api/v1/sistema
capa: backend
permisos: [sistema:ver, sistema:operar, sistema:ver_registros]
archivos:
  - backend/src/modules/sistema/sistema.controller.ts
edges:
  - [belongs_to, domain--seguridad]
  - [exposes, service--sistema-sistema]
  - [exposes, service--sistema-respaldos]
terminos: [sistema, ver, operar, registros]
---

# SistemaController

Area Sistema del Centro de mando (spec 2026-10-09 §6).

- **Prefijo:** `/api/v1/sistema`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/sistema/resumen` | `sistema:ver` |
| GET | `/sistema/estado` | `sistema:ver` |
| GET | `/sistema/tareas` | `sistema:ver` |
| POST | `/sistema/tareas/avisos-vencimiento/ejecutar` | `sistema:operar` |
| GET | `/sistema/respaldos` | `sistema:ver` |
| POST | `/sistema/respaldos/ejecutar` | `sistema:operar` |
| POST | `/sistema/respaldos/:archivo/verificar` | `sistema:operar` |
| GET | `/sistema/migraciones` | `sistema:ver` |
| GET | `/sistema/app-movil` | `sistema:ver` |
| GET | `/sistema/conexion-movil` | `sistema:ver` |
| GET | `/sistema/registros` | `sistema:ver_registros` |

## Archivos

- `backend/src/modules/sistema/sistema.controller.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `exposes` → [[service--sistema-sistema|SistemaService]]
- `exposes` → [[service--sistema-respaldos|RespaldosService]]

## Referenciado por

- [[screen--dashboard|/dashboard]] `calls` →
- [[screen--dashboard-sistema-app-movil|/dashboard/sistema/app-movil]] `calls` →
- [[screen--dashboard-sistema-app-movil|/dashboard/sistema/app-movil]] `calls` →
- [[screen--dashboard-sistema-datos|/dashboard/sistema/datos]] `calls` →
- [[screen--dashboard-sistema-datos|/dashboard/sistema/datos]] `calls` →
- [[screen--dashboard-sistema-datos|/dashboard/sistema/datos]] `calls` →
- [[screen--dashboard-sistema-datos|/dashboard/sistema/datos]] `calls` →
- [[screen--dashboard-sistema|/dashboard/sistema]] `calls` →
- [[screen--dashboard-sistema|/dashboard/sistema]] `calls` →
- [[screen--dashboard-sistema-registros|/dashboard/sistema/registros]] `calls` →
- [[screen--dashboard-sistema-tareas|/dashboard/sistema/tareas]] `calls` →
- [[screen--dashboard-sistema-tareas|/dashboard/sistema/tareas]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
