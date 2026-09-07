---
id: api--organizacion-identidad-institucional
tipo: API
nombre: IdentidadInstitucionalController
nivel: L2
dominio: organizacion
resumen: Superficie HTTP de identidad institucional bajo /api/v1/organizacion/identidad-institucional.
prefijo: /api/v1/organizacion/identidad-institucional
capa: backend
permisos: [organizacion:documentos_ver, organizacion:documentos_configurar]
archivos:
  - backend/src/modules/organizacion/identidad-institucional.controller.ts
edges:
  - [belongs_to, domain--organizacion]
  - [exposes, service--organizacion-identidad-institucional]
terminos: [identidad, institucional, organizacion, documentos, ver, configurar]
---

# IdentidadInstitucionalController

Superficie HTTP de identidad institucional bajo /api/v1/organizacion/identidad-institucional.

- **Prefijo:** `/api/v1/organizacion/identidad-institucional`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/organizacion/identidad-institucional` | `organizacion:documentos_ver` |
| PUT | `/organizacion/identidad-institucional` | `organizacion:documentos_configurar` |

## Archivos

- `backend/src/modules/organizacion/identidad-institucional.controller.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `exposes` → [[service--organizacion-identidad-institucional|IdentidadInstitucionalService]]

## Referenciado por

- [[component--front-organizacion|organizacion]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
