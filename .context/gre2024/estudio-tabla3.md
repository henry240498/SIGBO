# GRE24-STUDY-T3 — cantidades, filas y condiciones de Tabla 3

Reanudación: 2026-10-10. Fuente: [PDF original](../../docs/Manuales/GRE2024-Spa-Web-a.pdf),
**PDF 340–343, impresas 338–341**. Se leyeron las cuatro imágenes existentes y el
texto nativo; se cotejaron cabeceras, tipos de fila y las cinco cantidades explicativas.
No se afirma un segundo cotejo exhaustivo de las 308 cifras ni una prueba del motor.
Huellas y alcance: [registro visual](evidencia/revision-visual.json).

## Cantidades con fuente propia

Regla: `GRE24-T3-CONTENEDORES-CANTIDADES` en [reglas-operativas.json](reglas-operativas.json).
Cada parámetro conserva literal, página PDF e impresa, SHA del PDF y referencia del
candidato identificado por SHA. La validación compara métrica e imperial con sus
propios números impresos; no recalcula el equivalente.

| Tipo original | Cantidad métrica impresa | Cantidad imperial impresa |
|---|---:|---:|
| Carrotanque de ferrocarril | 80 000 kg | 176 370 libras |
| Autotanque o remolque | 20 000–25 000 kg | 44 092–55 116 libras |
| Tanque de agricultura | 3785 L | 1000 galones |
| Cilindro pequeño | 72 L | 19 galones |
| Cilindro ton | 757–1135 L | 200–300 galones |

Fuente de esta tabla: PDF 340, impresa 338. Estos son datos asociados a los tipos
descritos en la introducción. La página no define una función para interpolar
distancias por cantidad, elegir el recipiente de capacidad más cercana ni convertir
kg a L. Tampoco acredita que todo el contenido haya escapado. Ante capacidad distinta,
cantidad liberada desconocida o unidad incompatible, falta una justificación para
selección automática; registrar insuficiencia en el futuro motor.

## Material y fila deben conservarse juntos

| Grupo original | PDF / impresa | Filas presentes |
|---|---|---|
| UN1005, amoniaco anhidro | 341 / 339 | Ferrocarril; autotanque/remolque; tanque agrícola; múltiples cilindros pequeños |
| UN1017, cloro | 341 / 339 | Ferrocarril; autotanque/remolque; múltiples cilindros tones; múltiples pequeños o un ton |
| UN1040, óxido de etileno y óxido de etileno con nitrógeno | 342 / 340 | Ferrocarril; autotanque/remolque; múltiples pequeños o un ton |
| UN1050, cloruro de hidrógeno anhidro y UN2186, líquido refrigerado | 342 / 340 | Ferrocarril; autotanque/remolque; múltiples cilindros tones; múltiples pequeños o un ton |
| UN1052, fluoruro de hidrógeno anhidro | 343 / 341 | Ferrocarril; autotanque/remolque; múltiples pequeños o un ton |
| UN1079, dióxido de azufre | 343 / 341 | Ferrocarril; autotanque/remolque; múltiples cilindros tones; múltiples pequeños o un ton |

Son seis grupos, siete identificadores distintos y 22 filas. No crear una fila de
tanque agrícola para cloro copiando la de amoniaco. El mismo identificador UN1040
conserva dos nombres bajo el mismo encabezado; esto no convierte ONU en clave única
de todo el catálogo. UN1050 y UN2186 están expresamente agrupados en estas páginas.

**Condición de múltiples recipientes:** la introducción describe un cilindro pequeño
de 72 L, mientras las filas dicen múltiples cilindros pequeños. El encabezado de
Tabla 3 exige derrames grandes, más de 208 L o 55 galones EE.UU. (PDF 340, impresa
338). Un recipiente pequeño individual y una liberación agregada no son el mismo
dato. No activar Tabla 3 por la sola presencia de un cilindro ni multiplicar 72 por
el número de recipientes para inferir la cantidad efectivamente liberada. El número
de recipientes, el volumen liberado y su certeza siguen siendo entradas distintas.

La alternativa impresa «múltiples cilindros pequeños o un cilindro ton» debe
conservarse. No eliminar el «o», ni interpretar la cantidad individual explicativa
como garantía de que cualquier derrame de ese recipiente es grande. El significado
de una cantidad no respaldada necesita estudio y decisión documentada; no se
inventó aquí un algoritmo para resolverlo.

## Cabeceras y límites que condicionan la consulta

PDF 341–343 (impresas 339–341) distinguen primero aislamiento a la redonda en
metros/pies, y luego protección en dirección del viento en kilómetros/millas.
Protección tiene día/noche y tres clases de viento. Los límites publicados son
leve <10 km/h, moderado 10–20 km/h y fuerte >20 km/h; en mph son <6, 6–12 y >12.
Se conserva el sistema de entrada para comparar con su rango impreso. No usar una
conversión redondeada para desplazar silenciosamente una medición entre categorías.
Los indicadores ambientales de PDF 340 constituyen estimación, no una lectura
instrumental obtenida por SIGBO. El catálogo aún necesita cotejo independiente de
cada columna estructurada contra posición y cabecera (`GRE24-ISSUE-AUDITOR-T3-HEADERS`).

El signo `+` aparece en filas de cloro y dióxido de azufre; el pie indica posibilidad
de distancia mayor bajo ciertas condiciones atmosféricas (PDF 341 y 343, impresas
339 y 341). No presentarlo como máximo garantizado. La introducción a tablas verdes
(PDF 286–287, impresas 284–285) conserva ajustes reservados a personal técnicamente
calificado y condiciones ambientales; no se agregó un multiplicador universal.

## Casos documentales y trabajo pendiente

| Caso | Dato disponible | Conclusión documental sustentada | Fuente |
|---|---|---|---|
| T3-CANT-01 | Ferrocarril, 80 000 kg | Unidad es masa; no deducir L sin información adicional | PDF 340 / impresa 338 |
| T3-CANT-02 | Autotanque/remolque | Conservar rango 20 000–25 000 kg y su equivalente impreso | PDF 340 / impresa 338 |
| T3-CANT-03 | Un cilindro pequeño | Cantidad explicativa 72 L; las filas son múltiples; no basta para declarar derrame grande | PDF 340–343 / impresas 338–341 |
| T3-CANT-04 | Cloro en tanque agrícola | Tabla 3 no contiene esa combinación material/fila | PDF 341 / impresa 339 |
| T3-CANT-05 | Cloruro de hidrógeno UN2186 | Encabezado compartido con UN1050; conservar identidad original | PDF 342 / impresa 340 |
| T3-CANT-06 | Capacidad diferente de la publicada | No se encontró regla de interpolación o selección por proximidad en estas páginas | PDF 340–343 / impresas 338–341 |
| T3-CANT-07 | Viento exactamente 10 o 20 km/h | Extremos del rango publicado moderado; no convertirlos en leve/fuerte | PDF 340–343 / impresas 338–341 |
| T3-CANT-08 | Distancia con `+` | Conservar posibilidad de incremento y límites, sin máximo garantizado | PDF 341 y 343 / impresas 339 y 341 |

Estas conclusiones son lectura documental del agente principal, **no pruebas
operativas aprobadas ni auditoría independiente**. Pruebas de selección, geometría,
motor/SCI, integración y aceptación institucional siguen pendientes. Los controles
automatizados nuevos solo detectan pérdida o alteración de los números, unidades,
rangos y literales explicativos. El candidato inmutable no se modificó.
