# Conectar los celulares con SIGBO (guia rapida)

Todo esta preparado. Cuando quieran conectar un celular:

## En la PC del cuartel (una vez por sesion)
1. Abrir **`iniciar-sigbo.bat`** y esperar «SIGBO-CBVC listo». (Si activaron `programar-arranque.ps1`, arranca solo.)
2. Abrir **`conectar-celulares.bat`**. Se abre una pagina con dos codigos QR y se comprueba que el servidor responde.

## En cada celular (con el mismo WiFi que la PC)
1. **Instalar la app** (solo la primera vez): escanear con la camara del celular el QR «Instalar la app» y descargar el APK; permitir «instalar apps desconocidas» cuando Android lo pida. (Tambien sirve pasar `.movile\SIGBO.apk` por cable o pendrive.)
2. Abrir **SIGBO** → **Conectar** → **Escanear QR** (el de «Conectar la app») → **Guardar**.
3. Iniciar sesion con el usuario de la persona. Los permisos de ese usuario deciden que pantallas ve.

La app prueba la conexion antes de guardar y explica que pasa si falla.

## Comprobar que todo esta bien desde la PC
`node scripts\verificar-conexion-movil.mjs` hace lo mismo que el celular (por la direccion de la red): sesion, lecturas, renovacion y descarga del APK. Si da «TODO OK» y el celular igual no conecta, el problema esta en el WiFi o el firewall.

## Si el celular no conecta
- Mismo WiFi (no datos moviles ni red de invitados). Algunos routers aislan los dispositivos entre si: desactivar el «aislamiento de clientes».
- Firewall de Windows: en PowerShell **como administrador**:
  `New-NetFirewallRule -DisplayName "SIGBO API 3001" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow -Profile Any`
- La direccion de la PC puede cambiar al reiniciar el router: reservar una IP fija para esta PC en el router.
- Fuera del cuartel: `tunel-sigbo.bat` muestra una direccion https temporal; en la app, Conectar → escribirla (o pegarla) y Probar conexion.

## Para dejar los celulares al dia
Compilar y publicar con `.movile\scripts\publicar-apk.ps1`: los celulares ya instalados ofrecen actualizar al abrir la app. Los pasos completos y las garantias de firma estan en `.movile\docs\CONEXION.md`.
