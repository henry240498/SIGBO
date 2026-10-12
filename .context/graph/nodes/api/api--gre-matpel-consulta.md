---
id: api--gre-matpel-consulta
tipo: API
nombre: MatpelConsultaController
nivel: L2
dominio: matpel
resumen: Superficie HTTP de matpel consulta bajo /api/v1/matpel.
prefijo: /api/v1/matpel
capa: backend
archivos:
  - backend/src/modules/gre/matpel-consulta.controller.ts
edges:
  - [belongs_to, domain--matpel]
  - [exposes, service--gre-matpel-consulta]
  - [exposes, service--gre-motor-matpel]
terminos: [matpel, consulta, gre]
---

# MatpelConsultaController

Superficie HTTP de matpel consulta bajo /api/v1/matpel.

- **Prefijo:** `/api/v1/matpel`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/matpel/estado` | — |
| GET | `/matpel/buscar` | — |
| GET | `/matpel/materiales/:entradaId` | — |
| GET | `/matpel/guias/:numero` | — |
| GET | `/matpel/secciones` | — |
| GET | `/matpel/secciones/:seccionId` | — |
| GET | `/matpel/tablas/:tablaId` | — |
| GET | `/matpel/fuentes/:referenciaId` | — |
| GET | `/matpel/versiones/:versionGreId/archivo` | — |
| POST | `/matpel/evaluaciones/consulta` | — |
| GET | `/matpel/versiones/:versionGreId/paquete` | — |
| POST | `/matpel/evaluaciones/consulta-v2` | — |
| GET | `/matpel/versiones/:versionGreId/paquete/manifest` | — |
| GET | `/matpel/versiones/:versionGreId/paquete/partes/:parte` | — |
| GET | `/matpel/versiones/:versionGreId/paquete/archivo` | — |

## Archivos

- `backend/src/modules/gre/matpel-consulta.controller.ts`

## Relaciones

- `belongs_to` → [[domain--matpel|MATPEL]]
- `exposes` → [[service--gre-matpel-consulta|MatpelConsultaService]]
- `exposes` → [[service--gre-motor-matpel|MotorMatpelService]]

## Referenciado por

- [[screen--dashboard-matpel|/dashboard/matpel]] `calls` →
- [[component--front-matpel|matpel]] `calls` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
