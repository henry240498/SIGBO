# GRE24-STRUCTURE — inventario y cobertura

El [inventario previo](../../docs/matpel/evidencia/fase1/inventario-gre.json) contiene
42 secciones que cubren 392 páginas. La [matriz actual](evidencia/auditoria-documental.json)
reabre el PDF, comprueba cada página y enumera cada sección, entrada conciliada,
guía, bloque de guía, fila, celda, nota de tabla y regla extraída. **Ese inventario
describe lo existente; aún no demuestra haber descubierto todas las reglas del documento.**

Rangos verificados por marcadores originales: identificación/precauciones PDF2–31;
índice amarillo32–93; azul94–153; uso naranja154–155; primeros auxilios156–157;
guías158–285; tablas/protección286–343; guía del usuario344–349;
protección/descontaminación/control350–355; baterías356; BLEVE357–359;
QBRN360–367; AEI368–369; glosario370–382; publicación/contactos/ERAP383–391;
portada1 y contraportada392. Subdivisiones exactas, incluidos límites de cada tabla,
constan por sección en la matriz y el inventario previo.

392 páginas tienen texto nativo; no hay imágenes raster, pero sí figuras vectoriales
en 377 páginas. **La ausencia de raster no significa ausencia de información visual.**
La extracción declara 292 páginas estructuradas y 100 conservadas como texto.
Las páginas31/157/293/389 son páginas de notas, no fallos de extracción.

Estados de cobertura independientes:

- `textoCatalogoCoincide`: hash de todo el texto nativo frente a la página original.
- `LINEA_Y_CAJA_NATIVAS` / `CARACTERES_NATIVOS_EN_CAJA`: cotejo automático de referencias.
- `RECTANGULO_RGB_COTEJADO`: identidad del rectángulo y color; no interpretación completa.
- `CAJA_VALIDA_SIGNIFICADO_GEOMETRICO_PENDIENTE`: ubicación comprobada, significado pendiente.
- `cotejoVisual` y `estudioOperativo`: requieren registros de lectura, preguntas y evidencia.
- `validacionOperativa`: implementación y pruebas todavía pendientes.

Denominadores: páginas inventariadas/392; páginas cotejadas visualmente/392;
referencias nativas cotejadas/referencias nativas existentes; filas cotejadas por
tabla/427,101,22; reglas verificadas/inventario real de reglas. El último denominador
es **no determinado** mientras no termine el estudio exhaustivo. No usar26 ni38
como número definitivo de todas las reglas GRE.

Inspección de páginas completada2026-10-10: [392/392 páginas](paginas/README.md),
con146 antecedentes y246 registros nuevos. Renderizar no marca una lectura:
la cobertura exige anotación y registro visual concordantes. La inspección de
tablas/índices no certifica cotejo independiente celda por celda ni inventario
exhaustivo de reglas. El mapa conserva numeración impresa y las miniaturas aparte.
