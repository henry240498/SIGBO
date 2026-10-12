# Consulta documental GRE en la app móvil

Implementación local2026-10-10; aceptación operacional y distribución pendientes.

1. Entrar con una sesión que tenga `matpel:consultar` y abrir **Más herramientas
   operativas → Consulta GRE · MATPEL**.
2. Con conexión al servidor, elegir **Descargar edición vigente**. Se exige el
   permiso de consulta y las restricciones del servidor; no se asignan roles.
3. Tras verificar catálogo y PDF, buscar ONU/NA, nombre o guía. Un identificador
   con varios nombres exige elegir uno. La ficha abre en su propia pantalla;
   al volver conserva los resultados de búsqueda.
4. Leer la guía completa, las tablas manuales y las secciones. **Ver fuente**
   muestra el literal y separa página PDF de página impresa. **Guardar PDF original**
   permite exportar los bytes comprobados y abrir las figuras con un lector PDF.
5. Reabrir la copia sin red. **Ediciones guardadas** permite elegir una anterior
   tras verificarla de nuevo. Esa selección documental no cambia un incidente.

Sin descarga previa se informa que no hay copia; no se inventa una edición.
Una descarga incompleta, un403 o una edición no disponible conserva la copia
anterior. La lectura identifica la fecha/edición descargada y no afirma vigencia
posterior sin consultar al servidor. Un archivo alterado se bloquea; una descarga
verificada puede reparar la copia corrupta, conservando el archivo rechazado.

El paquete contiene solo documento/procedencia GRE. Se guarda en el directorio
privado de la app separado de la cola de incidentes. Las copias documentales no
son datos de una persona y pueden conservarse al cerrar/cambiar sesión; la pantalla
exige el permiso disponible para el usuario actual. No se encolan consultas ni
se almacenan decisiones, fotografías, posiciones, tokens o información personal
en el paquete. Los hashes son controles de integridad contra el manifest, sin
firma institucional ni verificación de vigencia externa.

La consulta usa `/matpel/estado` y `/matpel/versiones/:id/paquete` con el cliente
JWT/refresh existente. La descarga admite120s; las demás lecturas mantienen sus
plazos. No se amplió la lista de excepciones de la matriz web para clientes nativos:
las rutas MATPEL conservan sus restricciones de consulta también en la app.

El motor de condiciones, el mapa del incidente, fotografía/OCR y decisiones SCI
no se implementaron en este lector. La lectura de tablas es manual, con unidades
y condiciones originales y acceso al PDF. No interpreta automáticamente una
mezcla ni confirma identificación por el primer resultado.

Validación local: `flutter analyze --no-pub` sin incidencias,
`flutter test --no-pub --reporter expanded`56/56 y
`flutter build apk --debug --no-pub` aprobado. Ocho pruebas nuevas de MATPEL
incluyen interoperabilidad con el exportador backend, catálogo completo de2.665
entradas/38.810referencias/5.533celdas, integridad, archivo corrupto, recuperación,
primera apertura, permiso negativo y selección/fuente/403 en widgets.

Las pruebas de interoperabilidad requieren primero `npm run build` en `backend`
y Node disponible. Sin backend compilado se omite ese grupo con motivo explícito;
el caso de candidato completo también exige el archivo congelado local. La corrida
registrada ejecutó todos los casos, sin omitirlos. Son datos literales de prueba;
no importan, activan ni publican una versión en SQL.

Se regeneró `.dart_tool/package_config.json`, que contenía un prefijo inválido,
mediante `flutter pub get --offline`. `pubspec.yaml` y `pubspec.lock` no cambiaron.
El build conserva avisos previos de compatibilidad Gradle/AGP/Kotlin/SDK; no se
modificaron esas versiones. No se instaló el APK, publicó una actualización ni
probó Android/iOS físico, rendimiento de campo o el selector PDF en un teléfono.
El APK generado es de depuración; no acredita distribución institucional.

Ver [entrega MATPEL](../../docs/matpel/FASE_4_5_CONSULTA_MOTOR.md) y
[evidencia final](../../.context/gre2024/evidencia/validacion-consulta-motor-20261010.json).

## Actualización2026-10-11: descarga por partes

El cliente nativo usa `/matpel/versiones/:id/paquete/manifest` y
`/matpel/versiones/:id/paquete/partes/:parte` para catálogo, PDF e interpretación.
Mantiene JWT/refresh, permisoC y matriz web, sin base64 en producción. Los manifiestos
identifican tres tamaños/huellas. Verificación y JSON se ejecutan en un isolate;
la biblioteca indexa ids y publica el puntero tras renombrar la carpeta temporal.
El nombre del paquete incluye huellas de catálogo e interpretación; las copias
formato1 se siguen leyendo. Se detecta y repara también una parte perdida.

La ficha muestra el bloque EVACUACIÓN completo y condiciones manuales del perfil
estudiado con páginas PDF/impresas. No interpreta automáticamente el escenario.
[Entrega, pruebas y límites](../../docs/matpel/IMPLEMENTACION_MEJORA_20261011.md).
La medición local reduce13,14% los bytes serializados del catálogo completo; no
mide memoria ni tiempos de un teléfono. Motor offline/SCI y prueba física pendientes.

Corrida final2026-10-11:59/59, sin omitidas,11MATPEL, análisis de archivos afectados
sin incidencias y APK de depuración compilado. El catálogo completo también se
verifica por el consumidor Flutter en formato2. La prueba de widget comprueba el
protocolo de descarga; la E/S/hashes/isolate y recuperación se comprueban por separado.
No se instaló el APK ni se afirmó validación física.

## APK 1.6.0+13: consulta guiada y biblioteca completa

Actualización posterior2026-10-12: [APK1.7.0+14 y cierre técnico](GRE_CIERRE_20261012.md)
implementa motor compartido sin conexión y lectura local de texto en fotos. Los
límites y resultados de1.6.0 que siguen se conservan como antecedente.

Entrega local del 2026-10-11. **Consulta guiada en servidor** está disponible desde
la entrada GRE, incluso sin edición descargada. Comprueba `matpel:consultar`,
sesión/refresh y `/matpel/estado`. Sin edición activa informa el límite y permite
volver a la biblioteca. No importa ni activa el candidato documental local.

Búsqueda por ONU/NA, nombre o guía, paginación y selección explícita del nombre;
la identidad no se confirma por el primer resultado. La captura incluye observación
original, método, ámbito y calidad por dato. Conserva desconocido, falso y cero;
separa cantidad liberada, cantidad nominal por recipiente, tipo/número de recipientes,
periodo, medio, incendio, viento y ubicación del derrame. Valida rangos y contradicciones
sin deducir cantidades ni transformar masa en volumen.

La app llama a `POST /matpel/evaluaciones/consulta-v2`, el mismo motor de la web.
Muestra solicitudes de datos faltantes, avisos, aislamiento/protección por finalidad,
Tablas1–3, lectura íntegra de EVACUACIÓN, condiciones, traza y huellas. Cambiar un
dato invalida el resultado y respuestas pendientes. Un401/403 limpia captura y
resultados; una edición diferente también. No se encola la evaluación ni se
persiste información del incidente en la biblioteca.

El mapa dibuja únicamente círculo/polígono recibidos, sin recalcular GRE, sin teselas
ni proveedor externo. La proyección para encuadre no cambia valores del motor.
Conserva motivos de geometría ausente, calidad de ubicación/viento y equivalente
textual. Fuente de figura y límites: PDF297 / impresa295, cotejada en texto e imagen.
R25 permanece en el motor existente. PDF349 / impresa347 y R13/R15 distinguen guía
naranja de tablas; PDF340 / impresa338 conserva cantidades nominales de Tabla3.
No se modificaron reglas ni el PDF original. Se consultó la publicación original
en [PHMSA](https://www.phmsa.dot.gov/training/hazmat/erg/gre2024-pdf-accesible-espanol);
esto no verifica bytes remotos ni vigencia institucional del catálogo.

La biblioteca descargada ahora ofrece las **tres tablas verdes completas**, por
filas paginadas, y las **54 condiciones documentadas** con fuentes y limitaciones.
Continúan búsqueda, guías completas, secciones, copia íntegra de392 páginas, PDF
verificado, descarga por partes, recuperación e historial. Requiere descarga
autorizada previa para lectura sin red. El APK no contiene datos de ejemplo.

Análisis, pruebas, compilación, firma y huellas:
[evidencia de esta entrega](../../.context/gre2024/evidencia/apk-gre-20261011.json).
Resultado final: análisis sin incidencias, 70 pruebas aprobadas, ninguna omitida,
APK compilado y firma verificada contra el certificado de la versión publicada.
Archivo local: [`SIGBO.apk`](../SIGBO.apk), versión `1.6.0+13`.
APK de depuración firmado para conservar compatibilidad con instalaciones previas.
Distribución automática y prueba física se registran separadamente. Motor offline,
OCR operativo, SCI y aceptación institucional siguen pendientes; la paridad de
consulta con la web no cierra esos trabajos.

En el servidor local observado, `/matpel/estado` responde404 y el usuario local
carece de `matpel:consultar`. Antes de usar consulta o descargar se requiere
preparar el servidor, permisos y una edición autorizada. No se ejecutaron
migraciones, importaciones ni activaciones como parte de esta entrega.
