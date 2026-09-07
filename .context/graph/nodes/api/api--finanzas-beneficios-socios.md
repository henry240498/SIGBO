---
id: api--finanzas-beneficios-socios
tipo: API
nombre: BeneficiosSociosController
nivel: L2
dominio: finanzas
resumen: Superficie HTTP de beneficios socios bajo /api/v1/finanzas/beneficios.
prefijo: /api/v1/finanzas/beneficios
capa: backend
permisos: [finanzas:socios_ver, finanzas:beneficios_administrar]
archivos:
  - backend/src/modules/finanzas/beneficios-socios.controller.ts
edges:
  - [belongs_to, domain--finanzas]
  - [exposes, service--finanzas-beneficios-socios]
terminos: [beneficios, socios, finanzas, ver, administrar]
---

# BeneficiosSociosController

Superficie HTTP de beneficios socios bajo /api/v1/finanzas/beneficios.

- **Prefijo:** `/api/v1/finanzas/beneficios`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/finanzas/beneficios` | `finanzas:socios_ver` |
| POST | `/finanzas/beneficios` | `finanzas:beneficios_administrar` |
| POST | `/finanzas/beneficios/simular` | `finanzas:socios_ver` |
| GET | `/finanzas/beneficios/:id` | `finanzas:socios_ver` |
| PUT | `/finanzas/beneficios/:id` | `finanzas:beneficios_administrar` |

## Archivos

- `backend/src/modules/finanzas/beneficios-socios.controller.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `exposes` → [[service--finanzas-beneficios-socios|BeneficiosSociosService]]

## Referenciado por

- [[component--front-socios-protectores|socios-protectores]] `calls` →
- [[component--front-socios-protectores|socios-protectores]] `calls` →
- [[component--front-socios-protectores|socios-protectores]] `calls` →
- [[component--front-socios-protectores|socios-protectores]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
