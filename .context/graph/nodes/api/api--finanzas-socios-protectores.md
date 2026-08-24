---
id: api--finanzas-socios-protectores
tipo: API
nombre: SociosProtectoresController
nivel: L2
dominio: finanzas
resumen: Superficie HTTP de socios protectores bajo /api/v1/finanzas/socios-protectores.
prefijo: /api/v1/finanzas/socios-protectores
capa: backend
permisos: [finanzas:socios_ver, finanzas:socios_crear, finanzas:socios_editar]
archivos:
  - backend/src/modules/finanzas/socios-protectores.controller.ts
edges:
  - [belongs_to, domain--finanzas]
  - [exposes, service--finanzas-socios-protectores]
terminos: [socios, protectores, finanzas, ver, crear, editar]
---

# SociosProtectoresController

Superficie HTTP de socios protectores bajo /api/v1/finanzas/socios-protectores.

- **Prefijo:** `/api/v1/finanzas/socios-protectores`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/finanzas/socios-protectores` | `finanzas:socios_ver` |
| POST | `/finanzas/socios-protectores` | `finanzas:socios_crear` |
| GET | `/finanzas/socios-protectores/:id` | `finanzas:socios_ver` |
| PUT | `/finanzas/socios-protectores/:id` | `finanzas:socios_editar` |
| GET | `/finanzas/socios-protectores/:id/historial-codigo` | `finanzas:socios_ver` |
| GET | `/finanzas/socios-protectores/:id/estado-de-cuenta` | `finanzas:socios_ver` |

## Archivos

- `backend/src/modules/finanzas/socios-protectores.controller.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `exposes` → [[service--finanzas-socios-protectores|SociosProtectoresService]]

## Referenciado por

- [[component--front-socios-protectores|socios-protectores]] `calls` →
- [[component--front-socios-protectores|socios-protectores]] `calls` →
- [[component--front-socios-protectores|socios-protectores]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
