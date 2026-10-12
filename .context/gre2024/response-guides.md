# GRE24-GUIDES — guías naranjas

64 números111–174 ocupan PDF158–285: dos páginas por número, reconfirmado en
original y por el agente de lectura antes de su interrupción. 62 tienen contenido;
121(PDF178–179) y167(PDF270–271) declaran no tener materiales asociados. No tratarlas
como guías de respuesta utilizables ni como páginas perdidas.

El artefacto conserva título, páginas, líneas nativas, negrita/tamaño, bloques y
fuentes de cada bloque. El auditor inventaría esos bloques y coteja referencias;
la organización incluye peligros potenciales, seguridad pública y respuesta de
emergencia. Subapartados, advertencias, condiciones y orden del peligro primario
no pueden cambiarse para encajar en una plantilla de interfaz.

Las acciones particulares de cada guía **requieren formalización ejecutable y pruebas**.
Una cifra en un bloque puede referirse a aislamiento, derrame, incendio de tanque
o precaución distinta. No extraerla con una expresión regular y presentarla como
distancia aplicable sin conservar el activador y las excepciones.

Lectura existente integrada el 2026-10-10: [guías 111–120](response-guides/lectura111-120.md)
y [registro por cláusula](response-guides/lectura111-120.json). Conserva 20 páginas
originales (PDF 158–177; impresas 156–175), 100 bloques y 403 grupos de cláusulas.
La inspección visual y las notas por guía pertenecen a la sesión del 2026-10-09;
la reanudación verifica su integridad, sin atribuirse una lectura visual nueva.
Los 26 casos propuestos siguen sin resultado independiente ni ejecución de motor.
No sumar las plantillas de interpretación como predicados operativos formalizados.

Continuación 2026-10-10: [lote 121–130](response-guides/lectura121-130.md) y
[registro por cláusula](response-guides/lectura121-130.json), con 20 páginas
originales (PDF178–197 / impresas176–195) cotejadas en texto y vistas individualmente.
Son nueve guías con contenido y la121 intencionalmente vacía, 90 bloques,
414 grupos de cláusulas y156 líneas estructurales conservadas. Ocho condiciones
específicas quedan documentadas; sus ocho casos de comprensión están propuestos,
sin revisión independiente ni ejecución del motor.

Los dos lotes sumaban19 de62 guías con contenido y40 de128 páginas naranjas.
La continuación siguiente completa la lectura de las43 restantes.
`scripts/matpel/documentar_guias.py` prepara lotes sin atribuir inspección visual
a una imagen que solo se haya renderizado. El validador exige cobertura de cada
referencia original, incluso si se elimina una cláusula y se ajusta el conteo.

El encabezado general de primeros auxilios(PDF156) se remite desde las guías;
mostrar únicamente el bloque local puede ocultar esa dependencia. Las referencias
cruzadas deben formar parte del conocimiento y de las pruebas.

La [matriz](evidencia/auditoria-documental.json) identifica cada guía y bloque con
sus fuentes. El agente lector inicial no completó la revisión: no atribuirle
aceptación del catálogo ni la lectura principal posterior.

## Cierre de lectura de todas las guías —2026-10-10

Se leyeron directamente y se visualizaron individualmente las88 páginas restantes,
PDF198–285 / impresas196–283. Los cuatro lotes nuevos conservan1714 cláusulas,
notas específicas para cada número, activadores, distancias y límites:

| Lote | Con contenido / sin materiales | Páginas | Bloques | Cláusulas |
|---|---|---|---|---|
| [131–140](response-guides/lectura131-140.md) | 10 /0 | 20 | 100 | 435 |
| [141–150](response-guides/lectura141-150.md) | 10 /0 | 20 | 100 | 384 |
| [151–160](response-guides/lectura151-160.md) | 10 /0 | 20 | 100 | 417 |
| [161–174](response-guides/lectura161-174.md) | 13 /1 | 28 | 130 | 478 |
| Los seis lotes completos | 62 /2 | 128 | 620 | 2531 |

El [inventario](response-guides/inventario-guias.md) enlaza cada guía; su
[manifest](response-guides/inventario-guias.json) permite detectar omisión de un
lote completo, duplicación y cambio de estado. Las
[anotaciones](response-guides/notas131-174.json) conservan las conclusiones del
lector y fragmentos fuente seleccionados. Hay43 condiciones específicas nuevas
y87 casos propuestos:43 de condición,43 de información incompleta y uno de167
vacía. Ninguno se registra como prueba operativa aprobada.

Las [dependencias](response-guides/dependencias.md) se cotejaron en otras diez
páginas originales: auxilios generales, BLEVE/RIC, compatibilidad y ERAP. Tabla1
sigue requiriendo cotejo visual integral por celda; Tabla3 conserva su estudio previo.
Las remisiones entre guías están localizadas, con destinos dentro del inventario;
la localización no prueba precedencia ni evaluación conjunta.

Se corrigió `GRE24-ISSUE-GUIDE-HEADINGS`: títulos plurales de133/138 y título
partido de147 deben delimitar apartados. El preparador versión3 los conserva como
estructura; un control separado usa negrita, cajas y orden de la fuente para
auditar subapartados. La versión2 original se congeló en
`scripts/matpel/documentar_guias_v2.py`;121–130 conserva contenido y SHA de herramienta,
con su ruta de procedencia actualizada. Los informes históricos retienen sus hashes
y conteos como evidencia del momento de su emisión.

La lectura documental principal de las guías está completa. Siguen pendientes
interpretación independiente, inventario exhaustivo de reglas, predicados,
selección/precedencia del motor, integraciónSCI y aceptación institucional.
