---
id: workflow--apk-compilar-firmar-publicar
tipo: WORKFLOW
nombre: Compilar, firmar, publicar e instalar el APK de SIGBO
nivel: L1
resumen: Subir la versión, compilar en depuración, firmar con apksigner y la clave del cuartel, publicar con publicar-apk.ps1 e instalar por adb.
dominio: servicios
fuente: .movile/scripts/publicar-apk.ps1
archivos: [.movile/pubspec.yaml, .movile/scripts/publicar-apk.ps1, .movile/scripts/firmar-version.mjs]
terminos: [apk, compilar, firmar, publicar, adb, version, apksigner, instalar]
edges:
  - [contains, decision--apk-depuracion-firmado-con-clave-propia]
  - [depends_on, dependency--flutter]
---

Receta verificada el 2026-10-06 (de 1.5.0 a 1.5.3):

1. Subir `version:` en `.movile/pubspec.yaml` (ej. `1.5.3+9`; el número tras `+` es el código).
2. `cd .movile; flutter analyze lib test; flutter test` (45 casos).
3. `flutter build apk --debug` → `build/app/outputs/flutter-apk/app-debug.apk`.
4. Firmar (la contraseña sale de `android/key.properties`, `storePassword`):
   `apksigner sign --ks ~/.sigbo/sigbo-release.jks --ks-key-alias sigbo --ks-pass env:KSPW --key-pass env:KSPW --out sigbo-alertas.apk app-debug.apk`
   con `C:/Android/sdk/build-tools/36.0.0/apksigner.bat`.
5. Copiar a `.movile/SIGBO.apk` y publicar:
   `powershell -File .movile/scripts/publicar-apk.ps1 -Apk SIGBO.apk -PermitirDebug -Notas "..."`
   (copia a `backend/storage/app-movil`, firma `version.json` y lo vuelve a verificar).
6. Instalar en un celular de prueba: `adb install -r SIGBO.apk`.

Las apps ya instaladas ofrecen la actualización al abrirse (no es obligatoria salvo
`-Obligatoria`). Si algo falla: [[error--smart-app-control-bloquea-flutter]],
[[error--instalacion-usb-xiaomi]].
