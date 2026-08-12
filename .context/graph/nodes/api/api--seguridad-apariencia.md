---
id: api--seguridad-apariencia
tipo: API
nombre: AparienciaController
nivel: L2
dominio: seguridad
resumen: Superficie HTTP de apariencia bajo /api/v1/seguridad/apariencia.
prefijo: /api/v1/seguridad/apariencia
capa: backend
permisos: [seguridad:configurar_apariencia, seguridad:configurar_politica_perfil]
archivos:
  - backend/src/modules/seguridad/apariencia.controller.ts
edges:
  - [belongs_to, domain--seguridad]
  - [exposes, service--seguridad-apariencia]
terminos: [apariencia, seguridad, configurar, politica, perfil]
---

# AparienciaController

Superficie HTTP de apariencia bajo /api/v1/seguridad/apariencia.

- **Prefijo:** `/api/v1/seguridad/apariencia`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/seguridad/apariencia` | — |
| PUT | `/seguridad/apariencia` | `seguridad:configurar_apariencia` |
| PUT | `/seguridad/apariencia/politica-perfil` | `seguridad:configurar_politica_perfil` |

## Archivos

- `backend/src/modules/seguridad/apariencia.controller.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `exposes` → [[service--seguridad-apariencia|AparienciaService]]

## Referenciado por

- [[screen--dashboard-seguridad-apariencia|/dashboard/seguridad/apariencia]] `calls` →
- [[screen--dashboard-seguridad-apariencia|/dashboard/seguridad/apariencia]] `calls` →
- [[screen--login|/login]] `calls` →
- [[screen--raiz|/]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
