---
id: api--finanzas-consultas-finanzas
tipo: API
nombre: ConsultasFinanzasController
nivel: L2
dominio: finanzas
resumen: Superficie HTTP de consultas finanzas bajo /api/v1/finanzas/consultas.
prefijo: /api/v1/finanzas/consultas
capa: backend
permisos: [finanzas:ver]
archivos:
  - backend/src/modules/finanzas/consultas-finanzas.controller.ts
edges:
  - [belongs_to, domain--finanzas]
  - [exposes, service--finanzas-consultas-finanzas]
terminos: [consultas, finanzas, ver]
---

# ConsultasFinanzasController

Superficie HTTP de consultas finanzas bajo /api/v1/finanzas/consultas.

- **Prefijo:** `/api/v1/finanzas/consultas`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/finanzas/consultas/saldo-cajas` | `finanzas:ver` |
| GET | `/finanzas/consultas/gasto-por-categoria/:nombreCategoria` | `finanzas:ver` |
| GET | `/finanzas/consultas/ingreso-por-tipo/:nombreTipo` | `finanzas:ver` |
| GET | `/finanzas/consultas/ordenes-pendientes` | `finanzas:ver` |

## Archivos

- `backend/src/modules/finanzas/consultas-finanzas.controller.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `exposes` → [[service--finanzas-consultas-finanzas|ConsultasFinanzasService]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
