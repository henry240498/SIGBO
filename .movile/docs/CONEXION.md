# Conexion: red local, tunel temporal y servidor publico futuro

## 0. Obtener el APK (app Flutter: Android + iOS, un solo codigo)

- **Sin instalar nada**: suba `.movile/` a GitHub; el workflow *SIGBO movil
  APK* compila y deja el `app-debug.apk` en Actions > artefactos.
- **Local**: `.\.movile\scripts\bootstrap-flutter.ps1` (una vez) y luego
  `.\.movile\scripts\compilar-apk.ps1`.
- **iOS**: solo en Mac (`scripts/bootstrap-ios.sh` + `flutter build ipa`).
  En Windows no se puede compilar para iPhone; la misma app Flutter sirve
  para ambas plataformas.

## 1. Red local (PC de Henry + celulares bomberos en el mismo WiFi)

1. En la PC: `.\.movile\scripts\red-local.ps1` para ver la IPv4 (ej. `192.168.1.10`).
2. Arrancar el backend: `cd backend; npm run start:dev` (puerto 3001).
3. Abrir el firewall una sola vez (admin):
   `New-NetFirewallRule -DisplayName "SIGBO backend 3001" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow`
4. En cada celular: instalar el APK, iniciar sesion con el usuario SIGBO y en
   **Ajustes > Servidor** poner `http://192.168.1.10:3001/api/v1` (la IP real).
5. Migrar la base una vez: `database\run-migrations.ps1` (crea la tabla
   `servicios.alertas_emergencia`, migracion 076).

La app nativa usa `Authorization: Bearer`; **no** depende de CORS. CORS solo
importa si tambien se abre el frontend web desde el celular.

## 2. Tunel temporal (probar fuera de la red local, sin servidor publico)

1. Backend corriendo en la PC (`npm run start:dev`).
2. Ejecutar `.\.movile\scripts\tunel.cmd`. Muestra una URL como
   `https://xxxx.trycloudflare.com`.
3. En la app: **Ajustes > Servidor** = `https://xxxx.trycloudflare.com/api/v1`.
4. La URL cambia en cada ejecucion: es solo para pruebas.

## 3. Servidor publico (futuro, sin rehacer la app)

1. Desplegar el mismo backend (variable `PORT`, TLS terminada en el proxy).
2. En cada celular cambiar **Ajustes > Servidor** a
   `https://api.sudominio.com/api/v1`. Nada mas: la logica, el login, las
   rutas `/alertas` y los permisos son los mismos.
3. Endurecer `.env` de produccion (`AUTH_COOKIE_SECURE=true`,
   `CORS_ORIGIN` con el dominio real, `ALERTAS_DEBOUNCE_SEGUNDOS` vigente).
4. Punto de extension push: el backend ya emite eventos por SSE
   (`GET /alertas/stream`); para push con la app cerrada a escala se agrega
   FCM publicando el mismo aviso que hoy genera `AlertaNotifier`, sin tocar
   la API ni la base de datos.

## Permisos Android que pide la app y por que

- Notificaciones: aviso visible de emergencia (obligatorio para alertar).
- Pantalla completa: `AlertActivity` sobre el bloqueo.
- Vibracion + tono: configurables en Ajustes.
- Segundo plano / arranque: solo si se activa **Monitoreo continuo**.
- Ubicacion: solo si se activa **Enviar ubicacion** (se adjunta lat/lng).
- Bateria: boton directo a los ajustes del sistema (Android exige hacerlo asi).


## 4. Actualizacion automatica de la app

La app se actualiza sola desde el servidor SIGBO (sin Play Store ni servicios de terceros).

**Para el celular (usuario):**
1. Al abrir la app, si hay una version nueva aparece «Nueva version X». Pulse **Actualizar ahora**.
2. La primera vez Android pide un permiso: la app lo explica y abre la pantalla. Active **«Permitir desde esta fuente»** y vuelva con la flecha atras.
3. Se descarga (con barra de avance) y Android muestra su instalador: pulse **Instalar**. La app se reinicia sola y conserva sesion y ajustes.
4. En cualquier momento: **Ajustes > Aplicacion > Buscar actualizaciones**.

### Como se garantiza que la actualizacion es legitima (cuatro candados)

1. **Firma digital del cuartel (Ed25519).** El publicador firma version, hash, tamano, obligatoriedad y notas con una clave privada que vive en `~\.sigbo\clave-actualizaciones.pem`, **fuera del repositorio y del servidor**. La app lleva embebida la clave publica (`lib/clave_publica.dart`) y descarta cualquier version sin firma valida. Un servidor comprometido no puede ofrecer un APK propio.
2. **Hash SHA-256 firmado.** La descarga se verifica contra el hash firmado; si no coincide, no se instala.
3. **Firma de Android.** Android solo instala una actualizacion firmada con el mismo certificado que la app instalada. `publicar-apk.ps1` lo comprueba con `apksigner`, fija la huella del certificado en la primera publicacion y rechaza APK de depuracion.
4. **El servidor verifica lo que anuncia.** Solo anuncia la version si `version.json` describe exactamente el APK que hay en disco, y limita a 5 las descargas simultaneas.

### Primera vez (una sola vez)
1. `node .movile\scripts\firmar-version.mjs generar-clave` — crea la clave privada y escribe la publica en la app.
2. **Haga una copia de `~\.sigbo\clave-actualizaciones.pem` fuera de esta PC** (pendrive cifrado, gestor de contrasenas). Si se pierde, las apps ya instaladas no aceptaran mas actualizaciones y habra que reinstalarlas a mano.
3. Cree la firma de release (`android\key.properties`, ver `android/app/build.gradle`) y compile con `flutter build apk --release`. Guarde ese keystore igual que la clave anterior.

### Publicar una version
1. Suba el numero en `pubspec.yaml` (`version: 1.2.0+3`; el numero tras el `+` debe crecer siempre).
2. Compile el APK de release.
3. `.\.movile\scripts\publicar-apk.ps1 -Notas "que cambio"` (`-Obligatoria` para forzarla). Verifica la firma del APK, fija el certificado, firma digitalmente, publica en `backend\storage\app-movil` (variable `APP_MOVIL_DIR`) y vuelve a verificar. No hace falta reiniciar el backend.
4. Comprobar en cualquier momento lo publicado: `node .movile\scripts\firmar-version.mjs verificar --destino backend\storage\app-movil`.

### Pruebas automaticas
- App: `cd .movile; flutter test` (la verificacion de firma coincide entre Node y Dart, y rechaza datos alterados o mal formados).
- Servidor: `cd backend; npm test` (`app-movil.service.spec.ts`).

Los celulares con una version anterior a la 1.1.0 (sin este mecanismo) deben instalar el APK 1.1.0 a mano una vez; desde ahi se actualizan solos.
