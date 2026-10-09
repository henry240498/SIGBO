---
id: api--flota-flota
tipo: API
nombre: FlotaController
nivel: L2
dominio: vehiculos
resumen: "Control de flota: tablero de moviles y despacho de unidades (migracion 077)."
prefijo: /api/v1/flota
capa: backend
permisos: [vehiculos:ver, vehiculos:ver_mapa, vehiculos:posicion, servicios:ver, vehiculos:estado, servicios:despachar, vehiculos:dotacion, servicios:exportar_informe]
archivos:
  - backend/src/modules/flota/flota.controller.ts
edges:
  - [belongs_to, domain--vehiculos]
  - [exposes, service--flota-flota]
  - [exposes, service--flota-dotacion]
  - [exposes, service--flota-disponibilidad]
  - [exposes, service--flota-informe]
terminos: [flota, vehiculos, ver, mapa, posicion, servicios, estado, despachar, dotacion, exportar, informe]
---

# FlotaController

Control de flota: tablero de moviles y despacho de unidades (migracion 077).

- **Prefijo:** `/api/v1/flota`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/flota/tablero` | `vehiculos:ver` |
| GET | `/flota/posiciones` | `vehiculos:ver_mapa` |
| GET | `/flota/moviles-reporte` | `vehiculos:posicion` |
| GET | `/flota/vencimientos` | `vehiculos:ver` |
| POST | `/flota/moviles/:id/posicion` | `vehiculos:posicion` |
| GET | `/flota/datos-pendientes` | `vehiculos:ver` |
| GET | `/flota/servicios-abiertos` | `servicios:ver` |
| GET | `/flota/moviles/:id/historial` | `vehiculos:ver` |
| PATCH | `/flota/moviles/:id/reponer-en-cuartel` | `vehiculos:estado` |
| GET | `/flota/despachos` | `servicios:ver` |
| POST | `/flota/despachos` | `servicios:despachar` |
| PATCH | `/flota/despachos/:id/llegada` | `servicios:despachar` |
| PATCH | `/flota/despachos/:id/fin` | `servicios:despachar` |
| PATCH | `/flota/despachos/:id/regreso` | `servicios:despachar` |
| PATCH | `/flota/despachos/:id/cancelar` | `servicios:despachar` |
| GET | `/flota/disponibilidad` | `servicios:ver` |
| GET | `/flota/faltantes` | `vehiculos:ver` |
| GET | `/flota/moviles/:id/dotacion` | `vehiculos:ver` |
| POST | `/flota/moviles/:id/dotacion` | `vehiculos:dotacion` |
| POST | `/flota/moviles/:id/dotacion/control` | `vehiculos:dotacion` |
| PATCH | `/flota/dotacion/:itemId` | `vehiculos:dotacion` |
| GET | `/flota/moviles/:id/bitacora` | `vehiculos:ver` |
| GET | `/flota/informe/:servicioId/pdf` | `servicios:exportar_informe` |

## Archivos

- `backend/src/modules/flota/flota.controller.ts`

## Relaciones

- `belongs_to` → [[domain--vehiculos|Vehículos]]
- `exposes` → [[service--flota-flota|FlotaService]]
- `exposes` → [[service--flota-dotacion|DotacionService]]
- `exposes` → [[service--flota-disponibilidad|DisponibilidadService]]
- `exposes` → [[service--flota-informe|InformeService]]

## Referenciado por

- [[component--front-flota|flota]] `calls` →
- [[component--front-flota|flota]] `calls` →
- [[component--front-flota|flota]] `calls` →
- [[component--front-flota|flota]] `calls` →
- [[component--front-flota|flota]] `calls` →
- [[component--front-flota|flota]] `calls` →
- [[component--front-flota|flota]] `calls` →
- [[component--front-flota|flota]] `calls` →
- [[component--front-flota|flota]] `calls` →
- [[component--front-flota|flota]] `calls` →
- [[component--front-flota|flota]] `calls` →
- [[component--front-flota|flota]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
