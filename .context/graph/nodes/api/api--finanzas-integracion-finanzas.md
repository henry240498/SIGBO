---
id: api--finanzas-integracion-finanzas
tipo: API
nombre: IntegracionFinanzasController
nivel: L2
dominio: finanzas
resumen: Superficie HTTP de integracion finanzas bajo /api/v1/finanzas/deposito.
prefijo: /api/v1/finanzas/deposito
capa: backend
permisos: [finanzas:ver, finanzas:crear]
archivos:
  - backend/src/modules/finanzas/integracion-finanzas.controller.ts
edges:
  - [belongs_to, domain--finanzas]
  - [exposes, service--finanzas-integracion-finanzas]
terminos: [integracion, finanzas, deposito, ver, crear]
---

# IntegracionFinanzasController

Superficie HTTP de integracion finanzas bajo /api/v1/finanzas/deposito.

- **Prefijo:** `/api/v1/finanzas/deposito`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/finanzas/deposito/entradas-sin-registrar` | `finanzas:ver` |
| POST | `/finanzas/deposito/entradas/:entradaId/registrar` | `finanzas:crear` |

## Archivos

- `backend/src/modules/finanzas/integracion-finanzas.controller.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `exposes` → [[service--finanzas-integracion-finanzas|IntegracionFinanzasService]]

## Referenciado por

- [[component--front-finanzas|finanzas]] `calls` →
- [[component--front-finanzas|finanzas]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
