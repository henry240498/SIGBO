# Consulta y motor MATPEL — implementación local 2026-10-10

La consulta independiente ya tiene API, motor de selección, navegación institucional,
ficha, guía completa, índice de las 42 secciones, PDF autenticado y geometría relativa.
El código consulta exclusivamente versiones GRE registradas como VALIDADA; sin
catálogo o edición activa presenta su indisponibilidad. Nunca publica el candidato
privado para completar ese estado. Esta entrega no acredita cierre institucional de
las fases 3–10 ni despliegue en `sigbo_cbvc`.

## Recorrido de consulta

1. Abrir **Operaciones → MATPEL** con `matpel:consultar` y acceso por matriz.
2. Buscar identificador de cuatro dígitos, nombre o guía de tres dígitos. Elegir el
   nombre específico entre las coincidencias; ONU3171 no identifica una sola batería.
3. Leer la guía completa y las condiciones. También se puede abrir la GRE íntegra
   o recorrer sus secciones sin seleccionar un material.
4. Registrar condiciones observadas. Vacío significa desconocido; estimado y no
   confirmado conservan su calidad. La consulta sin identificación remite a guía111.
5. Consultar aislamiento y protección. Revisar su finalidad, aplicabilidad, faltantes,
   alternativas y advertencias; **Ver fuente** conserva la ficha y abre el PDF.
6. Para geometría, introducir ubicación y viento desde su dirección de origen.
   La representación no envía coordenadas a proveedores externos de teselas.

La cantidad liberada se expresa como decimal textual con unidad. `208L` es pequeño
y `208.000000000000001L` grande: PDF298 / impresa296. No se convierte masa a volumen
sin densidad respaldada. Día/noche no se deduce mediante un horario universal.
En Tabla3 se agregan datos opcionales compatibles con el contrato1:
`cantidadContenedor` y `numeroContenedores`, ambos con calidad/procedencia. Su
ausencia conserva INDETERMINADO. La cantidad de referencia de PDF340 / impresa338
no se usa como cantidad liberada ni se interpola entre recipientes.

## API implementada

Todas las rutas llevan prefijo `/api/v1`, sesión JWT y permiso `matpel:consultar`.
La matriz aplica la acción **ver** también al POST de cálculo, que no persiste datos.
Las consultas posteriores usan `versionGreId` explícito; UUID ajenos se rechazan.

| Método/ruta | Resultado |
|---|---|
| GET `/matpel/estado` | Edición activa validada o motivo de indisponibilidad |
| GET `/matpel/buscar` | Coincidencias y cursor ligado a edición/consulta |
| GET `/matpel/materiales/:entradaId` | Nombre específico, guía y fuentes por campo |
| GET `/matpel/guias/:numero` | Bloques originales completos, incluidas guías vacías |
| GET `/matpel/secciones` | Índice de secciones |
| GET `/matpel/secciones/:seccionId` | Texto documental no perteneciente a guías |
| GET `/matpel/tablas/:tablaId` | Filas/celdas paginadas y condiciones originales |
| GET `/matpel/fuentes/:referenciaId` | Extracto, caja, página PDF y etiquetas impresas |
| GET `/matpel/versiones/:versionGreId/archivo` | Bytes privados del PDF cotejados por hash |
| POST `/matpel/evaluaciones/consulta` | Selección reproducible y geometría complementaria |

La búsqueda normaliza acentos/espacios sin alterar el literal ni eliminar guiones
químicos. Los comodines se escapan y SQL usa parámetros. Leer guías111,121,167 no
exige una entrada asociada. La caché de hasta dos versiones vuelve a comprobar su
validación antes de reutilizar datos. La consulta no vuelve a parsear el PDF.

## Alcance del motor

`MotorMatpelService` conserva reglas, fuente SHA, versión, entradas, parámetros y
huella de consulta. Interpreta la selección de Tablas1–3 de la fuente estudiada.
Cada apartado distingue APLICABLE, NO_APLICABLE, INDETERMINADO y
DATOS_NO_DISPONIBLES. Un fallo, vacío o remisión nunca produce distancia cero.

Se conservaron distinciones de verde por nombre, `P` condicional, incendio y material
residual, cantidad/periodo desconocidos, agua/tierra/ambos, gas producido informativo,
remisión a Tabla3, cantidades publicadas por recipiente, viento nativo y `+`.
Varios materiales se abstienen: evaluar por separado no representa una mezcla.
La referencia de derrame en agua conserva la condición literal del agente extintor
de PDF3 / impresa1, con enlace a su fuente. Su presentación no resuelve precedencia
entre escenarios/guías ni convierte esa condición en prohibición de todo uso del agua.
Otra fuente SHA requiere nueva interpretación; los 26 registros y las 54 reglas
documentales no se declaran automatizados íntegramente por estas pruebas.

Las guías naranjas, auxilios y decisiones tácticas se entregan completas como texto y
fuente. El motor no prescribe tratamientos, calcula dosis, convierte proporciones
incompletas ni crea autoridad. Se preservan las diferencias de finalidad entre
precaución, aislamiento, protección residual y evacuación por incendio.

## Geometría complementaria

PDF297 / impresa295 fundamenta el círculo alrededor del derrame y el cuadrado de
longitudD y anchoD a favor del viento, con D/2 a cada lado. La dirección capturada
es **desde** donde sopla; el desplazamiento protector suma180°.
`sigbo-gre-figura-1` usa una proyección esférica de radio6371008.8m, identificada como
cálculo SIGBO. Las distancias y referencias originales permanecen separadas.

Sin ubicación no se dibujan zonas; sin viento se conserva solo un círculo aplicable.
Incendio presente/desconocido y fuente reactiva en agua se abstienen de representar
un origen fijo. `11.0+` no se convierte en borde máximo. Zonas polares, cruce del
antimeridiano y distancias superiores a20km quedan fuera de esta representación:
son límites técnicos del dibujo, no límites de peligro GRE. Si falla Leaflet,
continúan disponibles las distancias y las condiciones textuales.

## Consulta documental sin conexión

Con permiso `matpel:consultar` y una edición validada disponible, elegir
**Descargar consulta sin conexión**. Guardar el HTML y abrir ese mismo archivo en
un navegador con soporte WebCrypto. Incluye búsqueda por ONU/NA, nombre o guía,
selección explícita entre nombres, guías completas, tablas de lectura manual,
todas las secciones y el PDF original. «Ver fuente» distingue página PDF e impresa.

`GET /matpel/versiones/:versionGreId/paquete` entrega manifest, JSON del catálogo y
PDF codificado; `GET /matpel/versiones/:versionGreId/paquete/archivo` entrega el HTML.
Ambos revalidan la versión y comprueban los bytes originales antes de exportar.
La exportación usa campos GRE explícitos y excluye actores, rutas privadas e
incidentes. No registra datos en SQL. La web verifica `X-Content-SHA256` antes de
guardar; el archivo verifica los hashes internos antes de habilitar la consulta.
Los hashes prueban integridad contra el manifest descargado, no vigencia posterior
ni firma institucional del contenido. Una alteración conjunta del manifest y del
contenido no constituye una firma verificable.

El límite técnico es50MB para catálogo UTF-8 más PDF, antes de codificación. La
prueba con el candidato original completo produjo39.130.727bytes de HTML,
2.665 entradas conciliadas,38.810 referencias,392 páginas y42 secciones. Estos
archivos temporales son pruebas de exportación; no activan una edición.

El [recorrido sin conexión](../../.context/gre2024/evidencia/recorrido-offline-matpel-20261010.json)
abrió desde disco con el navegador desconectado desde el inicio:11 comprobaciones
aprobadas, cero recursos externos y rechazo de catálogo/PDF alterados. No requiere
sesión para releer el archivo guardado: contiene solamente la fuente documental
GRE. La descarga sí exige consulta autorizada. Sin descarga previa no existe copia
local. La vigencia de una edición posterior requiere reconectar y volver a descargar;
las copias históricas no se reemplazan automáticamente.

El motor de condiciones, mapa relativo, fotografías, historial y decisiones SCI
requieren capacidades adicionales. El archivo mantiene lectura manual y no promete
esas funciones sin conexión. También está implementado el [lector Flutter](../../.movile/docs/MATPEL.md):
descarga autenticada, hashes, lectura documental local y recuperación de ediciones
anteriores. Sus56 pruebas generales, análisis y APK de depuración están aprobados;
no se probó un teléfono físico ni se publicó/instaló la actualización.

## Evidencia y límites de aceptación

El [recorte de regresión](../../.context/gre2024/test-cases/motor-fuente.json) contiene
solo literales del candidato congelado y no es un catálogo publicable. Su cotejo
contra el original verifica cabeceras, notas, filas, celdas, reglas y coincidencias.
Un control adicional sigue las posiciones nativas de las cabeceras de PDF341–343 /
impresas339–341 y coteja308 celdas de Tabla3; no importa el parser de extracción.
Sus pruebas detectan alteraciones coordinadas de unidades, periodos y rangos.

El [recorrido de navegador](../../.context/gre2024/evidencia/recorrido-ui-matpel-20261010.json)
usa contexto separado, fuente real y motor compilado. Todas las peticiones API se
interceptan; no crea usuarios, versiones, incidentes ni decisiones en SQL. Su
alcance no equivale a probar una edición institucional activa o un dispositivo real.
El [informe técnico](../../.context/gre2024/evidencia/validacion-consulta-motor-20261010.json)
conserva comandos, resultados, hashes, respaldo y límites finales.

Pendiente: cotejo humano integral del catálogo, latencia con SQL en entorno aprobado,
prueba operacional institucional y habilitación administrada de la edición.
También quedan contexto/historial/decisiones SCI, fotografía/OCR, prueba en teléfono
físico y motor/sincronización local de las fases6–9. El archivo web y el lector
documental Flutter están implementados y probados con los alcances descritos arriba.
El usuario confirmó que todavía no dispone del Reglamento General del CBVC original.
AGENTS exige leer los artículos aplicables antes de modificar esos flujos. Las
autoridades y reglas institucionales nuevas no se infieren de roles técnicos.

No se ejecutaron migraciones, importaciones, activaciones, commits ni pushes en esta
continuación. Las dos expectativas históricas de pruebas de Despacho se ajustaron a
`AuditoriaService.registrar(input, manager?)`; no se cambió la lógica del servicio.
