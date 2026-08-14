---
id: api--publicaciones-publicaciones
tipo: API
nombre: PublicacionesController
nivel: L2
dominio: publicaciones
resumen: Superficie HTTP de publicaciones bajo /api/v1/publicaciones.
prefijo: /api/v1/publicaciones
capa: backend
permisos: [publicaciones:administrar, seguridad:configurar_apariencia]
archivos:
  - backend/src/modules/publicaciones/publicaciones.controller.ts
edges:
  - [belongs_to, domain--publicaciones]
  - [exposes, service--publicaciones-publicaciones]
terminos: [publicaciones, administrar, seguridad, configurar, apariencia]
---

# PublicacionesController

Superficie HTTP de publicaciones bajo /api/v1/publicaciones.

- **Prefijo:** `/api/v1/publicaciones`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/publicaciones/publicas` | — |
| GET | `/publicaciones/estadisticas` | — |
| GET | `/publicaciones` | `publicaciones:administrar` o `seguridad:configurar_apariencia` |
| POST | `/publicaciones` | `publicaciones:administrar` o `seguridad:configurar_apariencia` |
| PUT | `/publicaciones/:id` | `publicaciones:administrar` o `seguridad:configurar_apariencia` |
| DELETE | `/publicaciones/:id` | `publicaciones:administrar` o `seguridad:configurar_apariencia` |
<<<<<<< Updated upstream
=======
| PUT | `/publicaciones` | `publicaciones:administrar` o `seguridad:configurar_apariencia` |
>>>>>>> Stashed changes

## Archivos

- `backend/src/modules/publicaciones/publicaciones.controller.ts`

## Relaciones

- `belongs_to` → [[domain--publicaciones|Publicaciones]]
- `exposes` → [[service--publicaciones-publicaciones|PublicacionesService]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
