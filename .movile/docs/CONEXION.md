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
