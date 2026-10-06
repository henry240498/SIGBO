---
id: error--instalacion-usb-xiaomi
tipo: ERROR
nombre: Instalar el APK por USB en Xiaomi falla con INSTALL_FAILED_USER_RESTRICTED
nivel: L1
resumen: MIUI/HyperOS exige activar Instalar vía USB y Depuración USB (ajustes de seguridad), y aceptar un cartel en pantalla durante la instalación.
severidad: MEDIA
archivos:
  - docs/CONECTAR-CELULARES.md
edges:
  - [originates_from, dependency--flutter]
terminos: [xiaomi, miui, hyperos, adb, usb, instalar, user_restricted, depuracion, apk, falla, install, failed, user, restricted, hyper, exige, activar, via, ajustes, seguridad, aceptar, cartel, pantalla, durante, instalacion]
---

# Instalar el APK por USB en Xiaomi falla con INSTALL_FAILED_USER_RESTRICTED

MIUI/HyperOS exige activar Instalar vía USB y Depuración USB (ajustes de seguridad), y aceptar un cartel en pantalla durante la instalación.

## Síntoma

`adb install` termina con `INSTALL_FAILED_USER_RESTRICTED: Install canceled by user`, o el
dispositivo figura como `unauthorized`.

## Pasos que lo resolvieron (Xiaomi 2409BRN2CL, HyperOS 3 / Android 16)

1. Opciones de desarrollador: tocar 7 veces la versión de MIUI/OS.
2. Activar **Depuración por USB**, **Instalar vía USB** y **Depuración USB (ajustes de
   seguridad)**; las dos últimas piden cuenta Mi y conexión a internet.
3. Cable de datos, modo **Transferencia de archivos**, aceptar "¿Permitir depuración USB?".
4. Reintentar `adb install -r` **con el celular desbloqueado y mirando la pantalla**: el
   cartel de instalación dura segundos; si se ignora, la instalación se cancela.
5. Para que la cola sin conexión y las alertas funcionen en segundo plano: Inicio
   automático activado y ahorro de batería en "Sin restricciones".

Instalación sin cable: abrir `http://IP:3001/api/v1/app-movil/descargar` en el celular y
permitir "instalar de esta fuente"; Play Protect avisará que es desconocida.


## Archivos

- `docs/CONECTAR-CELULARES.md`

## Relaciones

- `originates_from` → [[dependency--flutter|Flutter y el SDK de Android compilan la app móvil]]

---
<sub>Nodo **curado** (editable a mano).</sub>
