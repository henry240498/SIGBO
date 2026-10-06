---
id: dependency--flutter
tipo: DEPENDENCY
nombre: Flutter y el SDK de Android compilan la app móvil
nivel: L1
resumen: "La app .movile se compila con Flutter (canal estable) y el SDK de Android; ambos viven fuera del repo y Windows puede bloquear partes de Flutter."
archivos:
  - .movile/pubspec.yaml
  - .movile/android/app/build.gradle
  - .movile/scripts/compilar-apk.ps1
edges:
  - [depends_on, dependency--nodejs]
terminos: [flutter, dart, android, sdk, apk, gradle, compilar, compilan, movil, movile, compila, canal, estable, ambos, viven, fuera, repo, windows, puede, bloquear, partes]
---

# Flutter y el SDK de Android compilan la app móvil

La app .movile se compila con Flutter (canal estable) y el SDK de Android; ambos viven fuera del repo y Windows puede bloquear partes de Flutter.

Flutter vive en `C:/src/flutter`, el SDK de Android en `C:/Android/sdk` (build-tools
36.0.0, platform-tools con `adb`). Ninguno está en el repositorio. Plugins relevantes:
`geolocator`, `workmanager`, `image_picker`, `qr_code_scanner_plus`, `url_launcher`,
`path_provider`, `shared_preferences`, `ota_update`.

Fallas conocidas: [[error--smart-app-control-bloquea-flutter]]. Procedimiento:
[[workflow--apk-compilar-firmar-publicar]].


## Archivos

- `.movile/pubspec.yaml`
- `.movile/android/app/build.gradle`
- `.movile/scripts/compilar-apk.ps1`

## Relaciones

- `depends_on` → [[dependency--nodejs|Node.js 20+ y PowerShell como entorno de ejecucion]]

## Referenciado por

- [[decision--apk-depuracion-firmado-con-clave-propia|El APK distribuido es de depuración, vuelto a firmar con la clave del cuartel]] `depends_on` →
- [[error--editor-guarda-tildes-como-interrogacion|Una edición externa guardó las tildes y los separadores de la app como signos de interrogación]] `originates_from` →
- [[error--instalacion-usb-xiaomi|Instalar el APK por USB en Xiaomi falla con INSTALL_FAILED_USER_RESTRICTED]] `originates_from` →
- [[error--smart-app-control-bloquea-flutter|Smart App Control / Windows App Control bloquea ejecutables de Flutter]] `originates_from` →
- [[workflow--apk-compilar-firmar-publicar|Compilar, firmar, publicar e instalar el APK de SIGBO]] `depends_on` →

---
<sub>Nodo **curado** (editable a mano).</sub>
