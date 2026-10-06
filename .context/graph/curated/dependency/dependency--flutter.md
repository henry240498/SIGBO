---
id: dependency--flutter
tipo: DEPENDENCY
nombre: Flutter y el SDK de Android compilan la app móvil
nivel: L1
resumen: La app .movile se compila con Flutter (canal estable) y el SDK de Android; ambos viven fuera del repo y Windows puede bloquear partes de Flutter.
fuente: .movile/pubspec.yaml
archivos: [.movile/pubspec.yaml, .movile/android/app/build.gradle, .movile/scripts/compilar-apk.ps1]
terminos: [flutter, dart, android, sdk, apk, gradle, compilar]
edges:
  - [depends_on, dependency--nodejs]
---

Flutter vive en `C:/src/flutter`, el SDK de Android en `C:/Android/sdk` (build-tools
36.0.0, platform-tools con `adb`). Ninguno está en el repositorio. Plugins relevantes:
`geolocator`, `workmanager`, `image_picker`, `qr_code_scanner_plus`, `url_launcher`,
`path_provider`, `shared_preferences`, `ota_update`.

Fallas conocidas: [[error--smart-app-control-bloquea-flutter]]. Procedimiento:
[[workflow--apk-compilar-firmar-publicar]].
