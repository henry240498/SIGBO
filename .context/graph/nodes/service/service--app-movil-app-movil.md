---
id: service--app-movil-app-movil
tipo: SERVICE
nombre: AppMovilService
nivel: L2
dominio: servicios
resumen: "Distribucion propia del APK (sin tiendas ni servicios de terceros). El administrador publica con `.movile/scripts/publicar-apk.ps1`, que deja en `APP_MOVIL_DIR` (por defecto `storage/app-movil`) el APK y `version.json` firmado. La app consulta `/app-movil/version` y, si hay una version mayor con firma valida, la descarga de `/app-movil/descargar`. El servidor NO firma nada ni conoce la clave privada: solo sirve lo que el publicador firmo. Y como no puede fiarse de lo que hay en disco, comprueba que el `version.json` describa EXACTAMENTE el APK presente (tamano y hash): si alguien reemplaza el APK sin republicar, se deja de anunciar."
capa: backend
archivos:
  - backend/src/modules/app-movil/app-movil.service.ts
edges:
  - [belongs_to, domain--servicios]
  - [uses, component--modulo-app-movil]
terminos: [movil]
---

# AppMovilService

Distribucion propia del APK (sin tiendas ni servicios de terceros). El administrador publica con `.movile/scripts/publicar-apk.ps1`, que deja en `APP_MOVIL_DIR` (por defecto `storage/app-movil`) el APK y `version.json` firmado. La app consulta `/app-movil/version` y, si hay una version mayor con firma valida, la descarga de `/app-movil/descargar`. El servidor NO firma nada ni conoce la clave privada: solo sirve lo que el publicador firmo. Y como no puede fiarse de lo que hay en disco, comprueba que el `version.json` describa EXACTAMENTE el APK presente (tamano y hash): si alguien reemplaza el APK sin republicar, se deja de anunciar.


## Metodos

`obtenerVersion()` · `abrirApk()`

## Archivos

- `backend/src/modules/app-movil/app-movil.service.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `uses` → [[component--modulo-app-movil|app-movil (modulo NestJS)]]

## Referenciado por

- [[api--app-movil-app-movil|AppMovilController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
