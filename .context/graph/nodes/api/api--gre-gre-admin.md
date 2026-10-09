---
id: api--gre-gre-admin
tipo: API
nombre: GreAdminController
nivel: L2
dominio: matpel
resumen: "Administración de la GRE (fase 3D): fuentes, importación, revisión dato ↔ fuente, validación, comparación y activación. Cada capacidad es un permiso propio; administrar no concede validar ni activar, y ninguna concede mando sobre un incidente. - matpel:administrar_gre descubrir fuentes, importar, comparar - matpel:validar_gre revisar y validar una versión candidata - matpel:activar_gre activar o recuperar una versión validada"
prefijo: /api/v1/matpel/administracion
capa: backend
permisos: [matpel:administrar_gre, matpel:validar_gre, matpel:activar_gre]
archivos:
  - backend/src/modules/gre/gre-admin.controller.ts
edges:
  - [belongs_to, domain--matpel]
  - [exposes, service--gre-gre-importacion]
  - [exposes, service--gre-gre-revision]
  - [exposes, service--gre-gre-comparacion]
  - [exposes, service--gre-gre-activacion]
  - [exposes, service--gre-gre-fuentes]
terminos: [gre, admin, matpel, administracion, administrar, validar, activar]
---

# GreAdminController

Administración de la GRE (fase 3D): fuentes, importación, revisión dato ↔ fuente, validación, comparación y activación. Cada capacidad es un permiso propio; administrar no concede validar ni activar, y ninguna concede mando sobre un incidente. - matpel:administrar_gre descubrir fuentes, importar, comparar - matpel:validar_gre revisar y validar una versión candidata - matpel:activar_gre activar o recuperar una versión validada

- **Prefijo:** `/api/v1/matpel/administracion`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/matpel/administracion/documentos` | `matpel:administrar_gre` |
| POST | `/matpel/administracion/importaciones` | `matpel:administrar_gre` |
| GET | `/matpel/administracion/importaciones/:importacionId` | `matpel:administrar_gre` |
| GET | `/matpel/administracion/versiones` | `matpel:administrar_gre` o `matpel:validar_gre` o `matpel:activar_gre` |
| GET | `/matpel/administracion/versiones/:versionGreId/progreso` | `matpel:administrar_gre` o `matpel:validar_gre` |
| GET | `/matpel/administracion/versiones/:versionGreId/referencias` | `matpel:administrar_gre` o `matpel:validar_gre` |
| GET | `/matpel/administracion/versiones/:versionGreId/tablas/:tablaCodigo/paginas/:paginaPdf` | `matpel:administrar_gre` o `matpel:validar_gre` |
| POST | `/matpel/administracion/versiones/:versionGreId/revisiones` | `matpel:validar_gre` |
| POST | `/matpel/administracion/versiones/:versionGreId/validacion` | `matpel:validar_gre` |
| GET | `/matpel/administracion/versiones/:versionGreId/fuentes/:referenciaId` | `matpel:administrar_gre` o `matpel:validar_gre` |
| GET | `/matpel/administracion/versiones/:versionGreId/archivo` | `matpel:administrar_gre` o `matpel:validar_gre` |
| GET | `/matpel/administracion/comparacion` | `matpel:administrar_gre` |
| GET | `/matpel/administracion/activacion` | `matpel:administrar_gre` o `matpel:validar_gre` o `matpel:activar_gre` |
| POST | `/matpel/administracion/activacion` | `matpel:activar_gre` |

## Archivos

- `backend/src/modules/gre/gre-admin.controller.ts`

## Relaciones

- `belongs_to` → [[domain--matpel|matpel]]
- `exposes` → [[service--gre-gre-importacion|GreImportacionService]]
- `exposes` → [[service--gre-gre-revision|GreRevisionService]]
- `exposes` → [[service--gre-gre-comparacion|GreComparacionService]]
- `exposes` → [[service--gre-gre-activacion|GreActivacionService]]
- `exposes` → [[service--gre-gre-fuentes|GreFuentesService]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
