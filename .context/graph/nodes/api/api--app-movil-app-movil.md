---
id: api--app-movil-app-movil
tipo: API
nombre: AppMovilController
nivel: L2
dominio: servicios
resumen: "Actualizacion de la app movil. Es publico a proposito: la app necesita poder actualizarse aunque la sesion haya vencido, y el APK no contiene datos (Android ademas exige que el APK nuevo este firmado con la misma clave que el instalado, y la app verifica el SHA-256 publicado)."
prefijo: /api/v1/app-movil
capa: backend
archivos:
  - backend/src/modules/app-movil/app-movil.controller.ts
edges:
  - [belongs_to, domain--servicios]
  - [exposes, service--app-movil-app-movil]
terminos: [movil]
---

# AppMovilController

Actualizacion de la app movil. Es publico a proposito: la app necesita poder actualizarse aunque la sesion haya vencido, y el APK no contiene datos (Android ademas exige que el APK nuevo este firmado con la misma clave que el instalado, y la app verifica el SHA-256 publicado).

- **Prefijo:** `/api/v1/app-movil`

## Rutas

| Verbo | Ruta | Permiso exigido |
|---|---|---|
| GET | `/app-movil/version` | — |
| GET | `/app-movil/descargar` | — |

## Archivos

- `backend/src/modules/app-movil/app-movil.controller.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `exposes` → [[service--app-movil-app-movil|AppMovilService]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
