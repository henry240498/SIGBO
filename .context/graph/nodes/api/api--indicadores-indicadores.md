---
id: api--indicadores-indicadores
tipo: API
nombre: IndicadoresController
nivel: L2
dominio: servicios
resumen: "Indicadores operativos del cuartel. Solo lectura: reutiliza servicios:ver."
prefijo: /api/v1/indicadores
capa: backend
permisos: [servicios:ver]
archivos:
  - backend/src/modules/indicadores/indicadores.controller.ts
edges:
  - [belongs_to, domain--servicios]
  - [exposes, service--indicadores-indicadores]
terminos: [indicadores, servicios, ver]
---

# IndicadoresController

Indicadores operativos del cuartel. Solo lectura: reutiliza servicios:ver.

- **Prefijo:** `/api/v1/indicadores`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/indicadores/operativos` | `servicios:ver` |
| GET | `/indicadores/calor` | `servicios:ver` |

## Archivos

- `backend/src/modules/indicadores/indicadores.controller.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `exposes` → [[service--indicadores-indicadores|IndicadoresService]]

## Referenciado por

- [[component--front-indicadores|indicadores]] `calls` →
- [[component--front-indicadores|indicadores]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
