# GRE en APK 1.7.0+14 — entrega técnica y dependencias de cierre

Pedido: completar la integración GRE. Fecha de trabajo: 2026-10-12.
Esta entrega cierra cálculo local y asistencia de lectura de fotos en Android;
no acredita cobertura semántica integral ni aceptación institucional.

## Motor compartido sin conexión

`node scripts/matpel/compilar_motor_local.cjs` transpila las mismas fuentes
TypeScript del motor, validadores, perfil, solicitudes y geometría del servidor.
Genera `assets/gre/motor.js` y un manifiesto con huellas de cada fuente.
`--check` detecta cualquier divergencia y debe ejecutarse antes de compilar el APK.
No hay una segunda implementación de reglas GRE en Dart.

Android ejecuta ese código empaquetado dentro de un WebView sin navegación, red,
acceso a archivos, contenido externo, almacenamiento web ni ventanas. El puente
nativo solo aporta SHA-256 textual y el paquete en memoria durante inicialización.
Los datos JSON se interpretan como datos; nunca se ejecuta código descargado.
El APK y el manifiesto del motor se verifican antes de cargarlo. Android System
WebView debe admitir BigInt y las características ES2020 utilizadas.

La biblioteca verifica catálogo, PDF e interpretación antes de consultar. El motor
local además exige el hash del PDF estudiado y el mismo perfil de interpretación.
Una inicialización incompatible invalida la edición del motor; cerrar libera captura
y WebView. No escribe incidentes, decisiones, snapshots operativos ni cola offline.

Desde GRE se elige **Consultar sin conexión** con una edición modular previamente
descargada de manera autorizada. Conserva identificación explícita, desconocidos,
falso/cero, incertidumbre, decimales exactos, condiciones, fuentes, solicitudes y
geometría. La pantalla avisa que sin red no verifica vigencia ni revocaciones de
permisos. El manifiesto documental sigue declarando que el paquete no contiene
motor ejecutable; el motor compatible se distribuye exclusivamente dentro del APK.
El nuevo `sha256Contenido` opcional conserva la huella del catálogo institucional
en resultados nuevos; una copia anterior calcula la huella de su snapshot local.

Se reutiliza la interpretación y geometría existentes, sin cambiar reglas ni el
PDF. Fuente de geometría: GRE PDF297 / impresa295. Cantidades Tabla3: PDF340 /
impresa338. Distinción de guías naranjas y tablas: PDF349 / impresa347.
La matriz de pruebas usa 44 entradas del recorte literal y 18 escenarios por
entrada (792 comparaciones), con desconocidos, límites decimales, agua/incendio,
periodo, recipientes, ubicación y viento. Paridad no significa validación operativa.

## Lectura de placas por foto

**Leer placa por foto** reutiliza cámara/galería existentes y procesa texto en
el teléfono con Tesseract4Android 4.9.0, Tesseract5 y modelos `eng`/`spa` de
`tessdata_fast` 4.1.0. Modelos incluidos en el APK, sin descarga durante uso.
Se conserva la licencia Apache2.0 y se registran hashes de los modelos.
Fuentes técnicas: [Tesseract4Android](https://github.com/adaptech-cz/Tesseract4Android)
y [modelos oficiales](https://github.com/tesseract-ocr/tessdata_fast/tree/4.1.0).

Se acota tamaño de foto y decodificación, corrige orientación EXIF y ejecuta OCR
en un trabajador. Solo acepta archivos privados de la aplicación; la copia
temporal propia se elimina al terminar. No transmite ni adjunta fotos a servicios.
El texto original y todos los candidatos numéricos de cuatro dígitos se muestran
para elegir. No transforma I/1 u O/0, no decide mezcla, no confirma identidad ni
interpreta confianza del OCR como certeza química. Buscar un candidato exige
elegir luego el nombre concreto. El método queda OCR y comienza NO_CONFIRMADO.
Si el texto excede los2000caracteres admitidos por observación, se avisa el recorte;
el texto íntegro permanece visible en la pantalla de lectura.

Esta asistencia de consulta transitoria no implementa los reconocimientos
operativos API18/API26 con adjunto, Servicio, historial y autorización F/E.
Esa integración sigue vinculada a la preparación del núcleo y fuente institucional.

## Servidor y límites de habilitación

Se compiló y reinició el backend local existente. GRE pasó de ruta ausente a ruta
registrada. El primer diagnóstico autenticado entregaba403 por permiso ausente.
Entorno comprobado: `development`, SQL local127.0.0.1:14330, base `sigbo_cbvc`.
La validación del manifiesto de migraciones pasó sin modificar la base.
Ver [diagnóstico](../../.context/gre2024/evidencia/servidor-preparacion-20261012.json).

La comprobación directa confirmó `dbo.__sigbo_migrations` existente. La inferencia
inicial de historial ausente era incorrecta: faltaban solo los registros094/095.
Se corrigió el diagnóstico antes de ejecutar DDL, sin inventar una línea base.

Como parte directa del pedido de completarGRE, se instalaron **solo094/095** en
desarrollo local, usando sus bytes y hashes originales, una transacción y registro
real en el historial existente. Antes se realizó respaldoCOPY_ONLY conCHECKSUM y
RESTOREVERIFYONLY. Las credenciales de aplicación carecen deBACKUP/DDL; se utilizó
la administración del contenedor local sin cambiar esas credenciales ni ampliar
su rol. La095 aplicó las asignaciones previstas para roles operativos y
AdministradorGeneral. No concede mandoSCI. [Evidencia de instalación](../../.context/gre2024/evidencia/instalacion-local-20261012.json).

La comprobación autenticada ahora responde200. Se solicitó y procesó mediante la
API administrativa la importación del PDF original estudiado; el candidato queda
para revisión, sin validación ni activación automática.
Resultado observado: COMPLETADA / REQUIERE_REVISION;392páginas,42secciones,
38810referencias,64números de guía,720bloques,2665entradas,3tablas,
550filas,5533celdas y45378relaciones campo/fuente. El reporte de importación tiene
0hallazgos técnicos; esto no sustituye cotejo ni aceptación institucional.
[Trabajo de importación](../../.context/gre2024/evidencia/importacion-local-20261012.json).
Para habilitar consulta/descarga operacional debe cotejarse/revisarse con
responsable y fundamento, validarse y activarse mediante la API administrativa.
No marcar referencias como verificadas automáticamente ni sustituir revisión
humana por estas pruebas. Después de nuevas asignaciones, volver a iniciar sesión
en el cliente para actualizar sus permisos almacenados.

El recorrido real detectó un timeout500 al leer el progreso mientras la transacción
de carga retenía la fila. Se corrigió en `GreImportacionService`: durante la carga
del mismo trabajador devuelve el snapshot público confirmado antes de iniciar la
transacción, sin inventar porcentaje ni exponer lease. Se libera tanto con commit
como con rollback. Timeouts de otro proceso se devuelven503, sin comunicar vacío
o fallo de importación. Tres regresiones comprueban respuesta inmediata, limpieza
en éxito/error y clasificación del timeout. No se cambió aislamiento global de SQL.

SCI permanece pendiente del Reglamento General original vigente. El resumen
`docs/REGLAMENTO_GENERAL_CBVC_TRAZABILIDAD.md` no lo reemplaza. AGENTS exige seguir
los artículos aplicables antes de modificar flujos de Servicios/mando; no se
asignaron autoridades ni automatizaron decisiones. Faltan, además, cotejo integral
de reglas/condiciones, aceptación operacional y pruebas con fotos representativas
en un teléfono real. No hay dispositivo físico ni emulador instalado.

Evidencia final: [integración técnica](../../.context/gre2024/evidencia/integracion-tecnica-20261012.json).
Los informes del2026-10-11 se conservan como antecedentes y sus pendientes de
motor local no describen esta entrega. Los límites institucionales siguen vigentes.
