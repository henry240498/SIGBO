# SIGBO Movil — alertas de bomberos en Flutter (Android + iOS)

App multiplataforma (un solo codigo Dart) + extension del backend existente.
**No es un sistema paralelo**: reutiliza login JWT, permisos, auditoria y base
de datos de SIGBO; solo agrega lo que no existia (ver tabla abajo).

## Analisis previo (que existe / que se reutiliza / que es nuevo)

| Necesidad | Estado en SIGBO | Decision |
|---|---|---|
| Usuarios, login, sesiones | Existe (`backend/src/modules/auth`, JWT + refresh) | Reutilizado. Con cabecera `X-SIGBO-Dispositivo: movil` el login/refresh devuelven tokens en JSON (la app los guarda cifrados y usa `Authorization: Bearer`, ya aceptado por el backend). |
| Autorizacion por permisos | Existe (`PermissionsGuard`) | Reutilizado: crear=`servicios:crear`, ver=`servicios:ver`, atender/cancelar=`servicios:editar`. Sin permisos ni seeds nuevos. |
| Comunicaciones de servicio | Existe `comunicaciones_servicio` (formulario con revision) | No se toca. La alerta inmediata es el **hecho previo** (quien pide apoyo/chofer y cuando), trazable a Reglamento Arts. 249-258 (radio/apoyo), 230-248 (conductores), 220-227 (mando). |
| Auditoria inmutable | Existe (`AuditoriaService`) | Reutilizada en crear/atender/cancelar (`servicios.alerta_emergencia`). |
| Tabla de alertas, API, tiempo real, idempotencia | No existia | **Nuevo backend**: `AlertaEmergencia` (`servicios.alertas_emergencia`, migracion `076`), `POST/GET/PATCH /api/v1/alertas`, SSE `GET /api/v1/alertas/stream`, clave de idempotencia UNIQUE + `ALERTAS_DEBOUNCE_SEGUNDOS` (env). |
| Push/FCM, VPS, dominio | No existen (ni se asumen) | Fuera de v1. Tiempo real en LAN = SSE + monitoreo + WorkManager; FCM queda documentado como extension. |

## Estructura (todo dentro de `.movile/`)

```
.movile/
  lib/                  # Codigo Dart (login, 2 botones, lista, alerta
                        #  fullscreen, ajustes, SSE, monitoreo, WorkManager)
    main.dart  api.dart  models.dart  store.dart  notifier.dart
    siren.dart  background.dart
  pubspec.yaml          # Dependencias (http, notificaciones, 2do plano...)
  .env.example          # URL inicial (valor por defecto, se cambia en la app)
  android_app_src/      # Personalizacion Android (manifest, MainActivity,
                        #  build.gradle, estilos) aplicada por el bootstrap
  ios_config/           # Overlay iOS (Info.plist, AppDelegate.swift)
  android/  ios/        # Generadas por bootstrap (no se versionan completas)
  scripts/
    bootstrap-flutter.ps1  # Genera android/ (+ios) con Flutter (una vez)
    compilar-apk.ps1       # flutter build apk --debug (PC de Henry)
    bootstrap-ios.sh       # Genera ios/ en Mac
    red-local.ps1          # IP LAN + firewall
    tunel.ps1 / tunel.cmd  # Exposicion temporal con cloudflared
  docs/CONEXION.md      # Red local, tunel y servidor futuro
```

## Obtener el APK (3 caminos, elija uno)

**A. Automatico (recomendado, sin instalar nada): GitHub Actions.**
Haga `push` de `.movile/` (o Actions > *SIGBO movil APK* > Run). El workflow
(`.github/workflows/sigbo-movil-apk.yml`) compila y publica el artefacto
`sigbo-alertas-debug` = `app-debug.apk` listo para instalar. Descarguelo,
copielo al celular y permita "origenes desconocidos" una vez.

**B. Local (PC de Henry con Flutter + Android SDK):**
```
.\.movile\scripts\bootstrap-flutter.ps1   # una sola vez
.\.movile\scripts\compilar-apk.ps1
```
APK en `build\app\outputs\flutter-apk\app-debug.apk`.
URL fija de fabrica (opcional): `$env:SIGBO_API_URL="http://IP:3001/api/v1"`.

**C. iOS (solo Mac con Xcode):** `sh scripts/bootstrap-ios.sh` y
`flutter build ipa --export-method ad-hoc` (requiere firma Apple; en
simulador basta `flutter run`). En Windows no se puede compilar iOS.

## Flujo de prueba local

1. `database\run-migrations.ps1` (tabla 076) y `cd backend; npm run start:dev`.
2. `.\.movile\scripts\red-local.ps1` (ver IP) y abrir firewall 3001.
3. Instalar APK, login con usuario SIGBO, Ajustes > Servidor =
   `http://IP:3001/api/v1`.
4. Presionar SOLICITAR APOYO / SOLICITAR CHOFER: los demas celulares
   (sesion + monitoreo activo o app abierta) reciben aviso con sonido,
   vibracion y pantalla de alerta; la alerta pasa PENDIENTE -> ATENDIDA /
   CANCELADA con motivo y auditoria.
5. Antiduplicados: bloqueo 3 s del boton + clave de idempotencia + ventana
   anti-rebote del servidor devuelven la solicitud original.
