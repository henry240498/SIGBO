# Mejora aplicada a la consulta GRE de SIGBO

Aplicación local del análisis del 2026-10-11, autorizada por el usuario. Se mantiene
NestJS/Next/Flutter y el catálogo original. No se ejecutan migraciones, activaciones,
publicaciones ni decisiones SCI. La aceptación operacional sigue pendiente.

## Resultado y fuente

El motor `gre2024-matpel-2` separa finalidad, fuente del resultado, estado de
implementación y validación operacional. Para una entrada no verde, Tabla 1 permanece
`NO_APLICABLE`; aislamiento y protección generales remiten a lectura de la guía
naranja con `DATOS_NO_DISPONIBLES` para una selección automática. También se corrige
el caso de una fila exclusivamente de derrame en agua consultada en tierra. No se
presenta la exclusión de una tabla como ausencia de distancias en la GRE.

Se conserva el bloque EVACUACIÓN íntegro, sus condiciones y acceso a toda la guía.
Ejemplo documental: entrada 1613, guía 154, PDF244–245 / impresas242–243, con
50m para líquidos,25m para sólidos y otras condiciones de incendio. No se selecciona
uno de estos escenarios por observar un solo número. R13/R15 y el flujo de PDF349 /
impresa347 delimitan tabla/guía; la automatización contextual naranja sigue pendiente.

## Definiciones cotejadas e interpretación versionada

`preparar_definiciones_motor.py` genera un perfil separado del candidato congelado,
solo para el SHA de GRE2024 estudiado. `--verificar` exige reproducción exacta.
La interpretación `gre2024-condiciones-2` contiene cinco cantidades nominales de
PDF340 / impresa338, tipos de fila/variantes, unidades, intervalos decimales y
54 reglas documentales con fuentes, condiciones, excepciones y límites. Estas reglas
permanecen de lectura; no se promueven por defecto a decisiones o cálculos.

La preparación comprueba los literales de cantidades contra las referencias de la
edición. Sin fuente compatible o sin el literal, no entrega esa capacidad al motor.
Cantidad liberada, cantidad nominal por recipiente y número de recipientes siguen
separados. No convierte masa en volumen sin respaldo ni interpreta mezcla por sumar
materiales. Las 54 reglas no equivalen al inventario exhaustivo de las2531 cláusulas.

Se preparan índices de entradas, filas, condiciones, celdas y reglas por cada lectura
inmutable. No se vuelven a extraer cantidades con regex en cada evaluación. La caché
SQL verifica validación antes de reutilizarse y conserva como máximo dos lecturas.

## Consulta guiada, calidad y trazabilidad

La API anterior permanece disponible. La web usa `POST /matpel/evaluaciones/consulta-v2`
con ámbito observado y calidad/método/observación original de identificación, además
de la calidad de cada dato. Una selección documental comienza sin confirmar la
sustancia observada. La API admite fecha/evidencia de identificación sin inventarlas;
la pantalla de consulta actual no guarda adjuntos ni registros del incidente.

El motor publica solicitudes a partir de faltantes y condiciones vigentes: volumen,
periodo, recipiente, cantidad nominal, número de recipientes, viento, medio e incendio.
Los demás datos pueden leerse y conservarse desconocidos. Se invalidan resultados
al cambiar la captura; escribir no mueve un campo de grupo ni pierde su foco.

Cada resultado conserva la traza de condiciones/reglas/fuentes y huellas del catálogo,
interpretación e inputs. La traza no significa adopción de una decisión. El ámbito
ajeno al transporte terrestre produce una advertencia de alcance. Logout limpia la
observación original, los datos y el resultado. Las rutas nuevas conservan JWT,
`matpel:consultar` y la matriz de pantallas; POST de consulta usa la acción de lectura.

## Biblioteca móvil por partes

La descarga nativa usa un manifiesto y tres partes binarias: catálogo JSON, PDF
original e interpretación JSON. Cada parte conserva tamaño y SHA256; no hay PDF
base64 ni un JSON incrustado dentro de otro en el canal de producción. El formato1
anterior y el HTML documental web permanecen legibles.

Flutter verifica/decodifica el formato2 en un isolate, indexa referencias por id y
muestra las condiciones documentales junto a la guía. Publica el puntero local tras
escribir y renombrar una carpeta temporal única. El nombre incluye huellas del
catálogo y de la interpretación, para conservar perfiles distintos de la misma
edición. La copia anterior y los archivos rechazados se conservan. Se comprueban
corrupción, falta de una parte, reparación y recuperación de la edición anterior.

En el candidato completo de2665 entradas,38810 referencias y5533 celdas, la
serialización medida pasa de39120544 a33981459 bytes, incluyendo manifiesto y nuevas
definiciones:5139085 bytes menos (13,14%). Se mide el tamaño de los mismos documentos;
no acredita tiempo HTTP, memoria de Android ni rendimiento de campo. Véase
[medición reproducible](../../.context/gre2024/evidencia/medicion-mejora-20261011.json).

El motor desconectado sigue deshabilitado explícitamente. Compartir definiciones
JSON entre TypeScript y Dart no demuestra conformidad de resultados; requiere una
batería común cotejada antes de habilitarlo. El lector no almacena decisiones SCI.

## Verificación y pendientes externos

Backend completo:664 pruebas aprobadas y9 omitidas por requerir SQL. Tras cerrar
la inmutabilidad/autorización se repitieron las tres suites MATPEL:48/48.
Frontend:66/66 pruebas y build de125 páginas. Navegador:20/20 comprobaciones con API
interceptada, motor real y PDF real; sin base institucional. Python:88/88 y reproducción
del perfil de definiciones. Flutter:59/59 (11MATPEL), análisis sin incidencias y APK
de depuración compilado. Grafo regenerado:1135nodos/3985aristas, cero errores, con
10 avisos de nodos sin relación y dos avisos históricos del generador. Se registran en la
[evidencia de implementación](../../.context/gre2024/evidencia/implementacion-mejora-20261011.json).

El verificador global de endpoints conserva12 llamadas previas sin ruta fuera de
MATPEL; el filtro MATPEL no tiene llamadas sin resolver. No se oculta ese límite.
Las primeras corridas del navegador requirieron completar el adaptador con los campos
de procedencia y restringir el init de sesión al marco principal del navegador PDF.
El protocolo de descarga del widget se prueba separado del reloj de hashing/archivos;
la biblioteca verifica bytes reales en pruebas con E/S e isolate.

Quedan la prueba de teléfono físico, cotejo independiente integral y aceptación
institucional. SCI/OCR ligados al Servicio, autoridad e historial requieren consultar
los artículos originales del Reglamento CBVC conforme a AGENTS; el usuario indicó
no tenerlo todavía. No se reinterpreta esa ausencia como autorización para cambiar
mando/Servicios. Estos pendientes externos no se declaran terminados por aprobar tests.
