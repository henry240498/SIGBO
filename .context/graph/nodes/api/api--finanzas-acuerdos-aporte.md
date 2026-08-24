---
id: api--finanzas-acuerdos-aporte
tipo: API
nombre: AcuerdosAporteController
nivel: L2
dominio: finanzas
resumen: Superficie HTTP de acuerdos aporte bajo /api/v1/finanzas/acuerdos-aporte.
prefijo: /api/v1/finanzas/acuerdos-aporte
capa: backend
permisos: [finanzas:socios_ver, finanzas:socios_crear, finanzas:socios_editar]
archivos:
  - backend/src/modules/finanzas/acuerdos-aporte.controller.ts
edges:
  - [belongs_to, domain--finanzas]
  - [exposes, service--finanzas-acuerdos-aporte]
terminos: [acuerdos, aporte, finanzas, socios, ver, crear, editar]
---

# AcuerdosAporteController

Superficie HTTP de acuerdos aporte bajo /api/v1/finanzas/acuerdos-aporte.

- **Prefijo:** `/api/v1/finanzas/acuerdos-aporte`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/finanzas/acuerdos-aporte` | `finanzas:socios_ver` |
| POST | `/finanzas/acuerdos-aporte` | `finanzas:socios_crear` |
| GET | `/finanzas/acuerdos-aporte/:id` | `finanzas:socios_ver` |
| PUT | `/finanzas/acuerdos-aporte/:id` | `finanzas:socios_editar` |

## Archivos

- `backend/src/modules/finanzas/acuerdos-aporte.controller.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `exposes` → [[service--finanzas-acuerdos-aporte|AcuerdosAporteService]]

## Referenciado por

- [[component--front-socios-protectores|socios-protectores]] `calls` →
- [[component--front-socios-protectores|socios-protectores]] `calls` →
- [[component--front-socios-protectores|socios-protectores]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
