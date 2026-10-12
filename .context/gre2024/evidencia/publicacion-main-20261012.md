# Comprobaciones para publicar los cambios actuales en main

Fecha: 2026-10-12. Entorno de comprobación: Windows local, rama `main`.
Pedido explícito: «sube todo al main». Base observada: `3f123cd`.
Destino autorizado: `https://github.com/henry240498/SIGBO.git`, `origin/main`.

La entrega incluye consulta GRE web/Android, biblioteca documental, motor único
sin conexión, OCR local transitorio, regresión del progreso de importación y
conocimiento/evidencia conservados. El alcance y los pendientes institucionales
están en [la entrega técnica](../../../.movile/docs/GRE_CIERRE_20261012.md)
y [el pedido para Henry](../../PENDIENTES_PARA_HENRY.md).

## Correcciones necesarias para la publicación

- El workflow del APK usa Flutter 3.47.3, cuya etiqueta remota coincide con el SDK
  probado (`e8113bf45620cbeb8aff64947ee4c93e16adb4cf`). Recupera solo el wrapper
  ignorado, conserva el Android versionado y comprueba el motor compartido.
  El bootstrap local conserva los mismos archivos nativos y dependencias de OCR.
- El manifiesto del motor contiene hashes de bytes exactos. `.gitattributes`
  conserva los finales de línea de sus fuentes y artefactos; se cotejaron contra
  los blobs preparados en Git. El bundle sigue con SHA256
  `01cad9cb983227c6ae7fe12aae633630b8f6b66842abed05306300d50810afee`.
- Se actualizaron dependencias compatibles y sus lockfiles para superar la
  auditoría productiva exigida por CI: Multer 2.4.0, plataforma Nest 11.2.7,
  proxy-addr 2.0.8, Undici 7.30.0, Next 16.4.0, Sharp 0.35.5 y source-map-js 1.2.2.
  Backend conserva siete hallazgos moderados; su resolución propuesta requiere
  cambios mayores y no se aplicó `audit fix --force`.
- No se versionan `.env`, claves de firma, adjuntos, respaldos, caches Gradle,
  capturas temporales ni el APK compilado. El artefacto Android se obtiene por
  el workflow o compilación local; esta publicación no distribuye una actualización
  firmada a teléfonos existentes.

## Comprobaciones

La validación definitiva del backend/frontend tras actualizar los lockfiles queda
en `PUBLICATION_VALIDATION` de [proyecto.json](../../proyecto.json).
Antes de actualizar dependencias, backend: 672 aprobadas y nueve pruebas SQL
omitidas; frontend: 66 aprobadas y TypeScript sin errores.

Pruebas documentales: 88/88 aprobadas en esta publicación. Catálogo: 135 pantallas,
129 en la matriz. Auditoría de accesibilidad: línea base sin hallazgos.
Grafo: 1136 nodos, 3988 aristas, cero errores, diez avisos de nodos sin relaciones
y dos avisos previos del generador. Manifiesto de migraciones válido en modo
`-ValidateOnly`, sin modificar la base por esta tarea de publicación.
YAML del workflow y sintaxis PowerShell del bootstrap válidos.

Se revisaron los archivos versionables para detectar claves privadas, tokens de
proveedores, coincidencias con secretos locales y archivos de más de 95 MiB:
cero hallazgos. La comprobación de credenciales prohibidas de CI también pasó.

Los resultados del APK (80 pruebas Flutter, compilación y firma) permanecen en
[integracion-tecnica-20261012.json](integracion-tecnica-20261012.json).
Las comprobaciones técnicas no activan el catálogo ni cierran SCI. El Reglamento
original vigente, el cotejo y la aceptación institucional, y la prueba física
continúan pendientes.
