# SIGBO móvil y operación del cuartel

Todo lo que se construyó alrededor de la app Android (`.movile/`), la flota, los llamados,
el control del personal y la forma de levantar, conectar y distribuir el sistema.
Fecha de este documento: **2026-10-06**. El código manda: si algo de acá discrepa, vale el
archivo. Ver [[rule--el-grafo-no-es-la-verdad]].

## 1. Qué es

- App **Flutter** (`.movile/`), paquete `org.cbvc.sigbo`, nombre visible **SIGBO**, archivo
  `.movile/SIGBO.apk`. Última versión **publicada**: **1.5.6+12** (2026-10-06), con buzón de reportes, despacho, servicio activo, "Mantener sesión iniciada" y textos corregidos. Las apps instaladas la ofrecen al abrirse; el celular de prueba aún tiene la 1.5.5.
- Hace lo mismo que las pantallas operativas de la web y **funciona sin conexión**: lo que se
  registra queda en el celular y se envía solo al volver la red. Ver
  [[decision--app-movil-offline-primero]].
- Todo es **software libre y autoalojado** (Leaflet + OpenStreetMap, qrcode, pdfkit,
  Ollama, Telegram solo si se activa). Lo que exigiría contratar algo queda como decisión
  del cuartel.

## 2. Mapa de código

| Qué | Dónde |
|---|---|
| App | `.movile/lib/*.dart` (`main`, `operacion`, `gestion`, `terreno`, `offline`, `outbox`, `api`, `servidor`, `conexion`, `actualizador`, `verificacion_version`, `geo`, `store`, `background`, `notifier`, `convocatorias`) |
| Pruebas de la app | `.movile/test/` (7 archivos, **48 casos**) |
| Backend nuevo | módulos `flota`, `llamados`, `cartografia`, `control-personal`, `indicadores`, `reservas`, `prevencion`, `notificaciones`, `campo`, `app-movil`, `reportes` en `backend/src/modules/` |
| Hora de los hechos | `backend/src/shared/utils/instante.ts` ([[rule--hora-del-hecho-acotada]]) |
| BD de pruebas en memoria | `backend/src/shared/testing/base-falsa.ts` |
| Migraciones | `077` flota/despacho · `078` posición/mapa · `079` llamados/convocatorias · `080` cartografía · `081` dotación/bitácora · `082` control del personal · `083` reservas/prevención · `084` patente opcional · `085` llamados idempotentes · `086` adjuntos/víctimas/ausencias/avisos · `087` permiso `reportes:enviar` |
| Web | páginas de flota, mapa, dotación, servicios (llamados, convocatorias, cartografía, prevención, indicadores), personal/control, reservas, asistencia/ausencias |
| Lanzadores | `iniciar-sigbo.bat/.ps1`, `detener-sigbo.bat`, `tunel-sigbo.bat`, `conectar-celulares.bat` |
| Conexión | `scripts/conectar-celulares.mjs` (+ test), `scripts/verificar-conexion-movil.mjs`, `docs/CONECTAR-CELULARES.md` |
| APK | `.movile/scripts/publicar-apk.ps1`, `firmar-version.mjs`, `compilar-apk.ps1` |
| Respaldo | `workflows/scripts/respaldo-docker.ps1` (`-CopiarA`), `programar-respaldo.ps1`, `programar-arranque.ps1` |
| Textos con tilde | `scripts/tildes-dart.py` ([[rule--textos-de-la-app-con-tildes]]) |
| Hoja de ruta | `docs/HOJA-DE-RUTA-FUNCIONALIDADES.md` (Fase 6 agregada) |

## 2.1 Buzón de errores y sugerencias

Cualquier persona con sesión reporta un error o propone una mejora desde la **app**
(Inicio → Administración → *Reportar un problema*, `.movile/lib/reportes.dart`) o desde la
**web** (menú lateral → *Reportar un problema*, `/dashboard/reportar`). Cada reporte queda como
**un archivo de texto plano** en `backend/storage/reportes/` (o `REPORTES_DIR`), con nombre
`AAAAMMDD_HHMMSS_TIPO_<id>.txt`, que se lee con cualquier editor. Detalle y razones:
[[decision--reportes-como-texto-plano]].

- Endpoint: `POST /api/v1/reportes`, permiso `reportes:enviar` (migración 087, asignado a todos
  los roles existentes; un rol nuevo debe recibirlo desde Seguridad).
- Sin conexión la app lo encola y lo envía solo; un reenvío no duplica (id generado en el cliente).
- Límite: 30 reportes por hora y persona; mensaje de hasta 4000 caracteres.
- `backend/storage/` está en `.gitignore`: los reportes **no** viajan al repositorio.
- Para revisarlos hoy: abrir la carpeta. No hay pantalla para leerlos (decisión de mantenerlo simple).

## 3. Cómo funciona sin conexión

`offline.dart` + `outbox.dart`: cola persistente en `SharedPreferences`, envío **en orden**,
cada operación se clasifica con `clasificarRespuesta` en *hecho*, *reintentar* o *rechazada*
(las rechazadas se listan para que una persona las revise), lecturas en caché, cola aparte
para archivos (fotos/firmas copiadas con `path_provider`) y claves de idempotencia
(`claveIdempotencia`; los despachos y llamados llevan id generado por el cliente). Cada
registro lleva `ocurridoEn`/`tomadoEn`, la hora real del hecho.

Comprobado en un celular real: ver sección 7.

## 4. Conexión del celular con el servidor

1. El servidor corre en la PC del cuartel (`iniciar-sigbo.bat`): SQL Server en Docker
   (puerto **14330**), backend en **3001**, web en **3002**, Ollama.
2. `conectar-celulares.bat` detecta la IP de la red local (descarta adaptadores virtuales),
   verifica `/api/v1/salud` y genera una página con el QR. Contenido del QR:
   `sigbo://servidor?url=<http://IP:3001/api/v1 codificado>`.
3. En la app: **Conectar** → escanear el QR (o escribir la dirección) → **Probar conexión**
   → **Guardar**. Solo se guarda un servidor que respondió a la prueba.
4. Fuera del cuartel: `tunel-sigbo.bat` abre un túnel con `cloudflared`.

La red del cuartel no debe aislar clientes WiFi. Detalle en `docs/CONECTAR-CELULARES.md`.

## 5. Autenticación del cliente nativo

La app manda `X-SIGBO-Dispositivo: movil` y un JWT en `Authorization: Bearer`. El
middleware CSRF exige `Origin` a los navegadores y **exime al cliente nativo** que se
identifica así (`esClienteNativo`). Ver [[decision--cliente-nativo-exento-de-csrf]].
Login: `POST /auth/login` con `usernameOrEmail` y `password`.

## 6. Distribución del APK

Es un APK de **depuración** firmado con la clave del cuartel, no un release. Ver
[[decision--apk-depuracion-firmado-con-clave-propia]] y el procedimiento paso a paso en
[[workflow--apk-compilar-firmar-publicar]].

- El backend sirve `GET /app-movil/version` (JSON firmado con Ed25519) y
  `GET /app-movil/descargar`, ambos públicos.
- La app descarga solo si la firma de la versión valida con la clave pública embebida, el
  SHA-256 coincide y el certificado del APK es el fijado en la primera publicación.
- Las claves viven **fuera del repo**: `~/.sigbo/` (`clave-actualizaciones.pem`,
  `sigbo-release.jks`). Si se pierden no se puede publicar una actualización que las apps
  instaladas acepten.

## 7. Estado de verificación (2026-10-06)

**Automatizado** (última corrida completa; hoy se revalidaron solo los de la app y flota):
backend ~264 casos, app **45**, web 9 (`?seccion=`), scripts 6, y
`backend/scripts/verificar-escrituras.js` (42 escrituras reales en transacción con
rollback).

**En un celular real** (Xiaomi, HyperOS 3 / Android 16, por `adb`):

| Probado | Resultado |
|---|---|
| Instalar el APK y abrirlo | Bien. Icono propio (casco de bombero) centrado y legible |
| Conectar al servidor por la red local | Bien: "el servidor SIGBO responde" |
| Inicio de sesión | Bien; quedó registrado en Auditoría |
| 14 pantallas de Operación | Cargan sin errores (muchas vacías: no hay datos de ejemplo por regla) |
| Fichar entrada con QR de la pantalla de la PC | Bien: `ENTRADA`, guardado en el servidor |
| Llamado sin WiFi ni datos | Quedó en cola; el servidor tenía 0; al volver la red llegó 1, con la hora del hecho |
| Tildes | Corregidas (182 textos) y los defectos hallados en el celular arreglados en 1.5.3 |

**Buzón de reportes** (2026-10-06, celular real): enviado con red → archivo en el servidor con usuario, versión `1.5.4+10` y modelo; enviado **sin** red → "queda guardado en el celular" y llegó **una sola vez** al volver la red; endpoint verificado (201, duplicado, 400, 401).

**No probado todavía** (lo harán otras personas): fichaje sin conexión, fotos y firmas,
víctimas, alertas "Solicitar apoyo/chofer" de punta a punta, GPS con el móvil en
movimiento y geocerca, avisos por Telegram, actualización automática entre versiones
reales, instalación en otros modelos o marcas.

**Defecto conocido:** tras enviarse algo en cola, la pantalla sigue mostrando "Sin
conexión"/"Pendiente de envío" hasta tocar actualizar.

## 8. Registros de prueba que quedaron en la base

No hay API para borrarlos. Conviene limpiarlos antes de usar el sistema en serio:

- Un fichaje `ENTRADA` del usuario `admin` (2026-10-06 09:34) en el punto
  "Prueba de celular" (ya **desactivado**).
- Un llamado `PRUEBA OFFLINE calle test 123` (estado RECIBIDO).
- Una "SOLICITUD DE CHOFER" de `admin` (09:18), creada desde el celular.

## 9. Pendientes y límites honestos

- APK de **release**: Windows App Control bloquea `gen_snapshot.exe`. Ver
  [[error--smart-app-control-bloquea-flutter]].
- Mapas **sin conexión**: la política de OpenStreetMap no permite descargas masivas; haría
  falta un servidor propio de teselas.
- Ideas no hechas: push con ntfy, portal de pagos de socios, inventario por QR de
  depósito, botón de pánico / hombre caído, sensores y radio.
- **Edición paralela de `main.dart` y `operacion.dart`**: el 2026-10-06 a las 09:47-09:50 alguien
  rediseñó el inicio y la pantalla de Operación con una herramienta que guardó las tildes y los
  separadores `·` como `?`. Se restauraron 32 textos con vocabulario del APK y de los archivos
  sanos (ver [[error--editor-guarda-tildes-como-interrogacion]]). Si vuelve a pasar, correr
  `python scripts/tildes-dart.py --revisar` y buscar `[A-Za-z]?[a-z]` dentro de cadenas.
- Textos del **servidor y de la web** sin revisión de tildes; falta unificar tuteo y voseo
  (la app mezcla "toca/escribe" con "tenés").
- Nada de esto se probó con la red real del cuartel (firewall, aislamiento WiFi, túnel).
- La contraseña de desarrollo (`SIGBO_DEMO_PASSWORD` en `backend/.env`) debe cambiarse
  antes de producción.

## 10. Trampas operativas

- `iniciar-sigbo.ps1` se queda esperando una tecla al final; en automatizaciones, lanzarlo
  en segundo plano. Ver [[error--docker-parado-tras-reinicio]].
- Una instalación por `adb install -r` puede dejar el primer arranque en negro; cerrar y
  reabrir lo resuelve (visto una vez, causa no hallada).
- Instalar por USB en Xiaomi: [[error--instalacion-usb-xiaomi]].
- Probar por `adb`: la tecla Atrás en el login **sale de la app**; verificar con una captura
  antes de escribir credenciales. No volcar `logcat` sin filtrar ni cortar: incluye la lista
  de apps del usuario.
