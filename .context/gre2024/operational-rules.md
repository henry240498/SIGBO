# GRE24-RULES — reconstrucción de reglas

Antecedentes conservados: [38 reglas de uso del diagnóstico](../../docs/matpel/FASE_1_REGLAS_GRE.md)
y [26 registros extraídos](../../scripts/matpel/reglas_gre.py). Son conjuntos diferentes
de un estudio previo, **ninguno es el inventario exhaustivo de reglas de la GRE**.
Que un registro lleve `ejecutable=true` no demuestra existencia de motor operacional.

[reglas-operativas.json](reglas-operativas.json) añade conocimiento cotejado durante
esta misión, con id estable, descripción, activadores, entradas, procedimiento,
salida, excepciones, referencias cruzadas, páginas, evidencia, pruebas y limitaciones.
Los ids de esta misión no reutilizan `R01` con significado distinto; relacionan esos
antecedentes cuando corresponda.

Capas separadas en cada registro:

- Fuente literal: fragmento/PDF/impresa/caja cuando está disponible; no alterarlo.
- Interpretación: conclusión razonada y condiciones que la delimitan.
- Implementación: archivo/función o `NO_IMPLEMENTADA`.
- Hipótesis: registrar explícitamente; no utilizarlas como resultados operativos.
- No determinable: aquello que requiere información externa, operador o especialista.

Reglas cotejadas visualmente inicialmente: condicionante de uso de agua del flujo
PDF3; orientación/proporción de zona protectora PDF297; contexto de contenedores
de Tabla3 PDF340. Su estado es revisión documental limitada, sin validación
operativa del motor ni aceptación institucional. Los casos automatizados deberán
verificar activadores y abstención, no solamente presencia de palabras.

Reanudación 2026-10-10: las cinco cantidades de Tabla 3 tienen literal y fuente
propia en la regla `GRE24-T3-CONTENEDORES-CANTIDADES`; el validador coteja valores,
unidades y rangos contra PDF 340 / impresa 338. El [estudio](estudio-tabla3.md)
documenta las 22 filas y la distinción entre cilindro individual, múltiples recipientes,
cantidad asociada y volumen liberado. No implementa predicados ni cierra aceptación.

Continuación121–130: ocho reglas adicionales, para un total de11 en este archivo.
Conservan condiciones de agua en124, amoniaco confinado en125, aerosoles en126,
espuma para identidades específicas en127, remisiones de híbridos y agua sobre
carro tanque dañado en128, exclusión de polvo seco en129 y alternativa de espuma
en128/130. Fuente literal, activadores, entradas necesarias, incertidumbre y
excepciones constan por regla. Véase [estudio](response-guides/lectura121-130.md).
La formalización es documental, sin evaluador ejecutable. Sus ocho casos propuestos
siguen pendientes de revisión independiente y motor; no resuelven precedencia global.

Conflicto que debe conservarse: PDF286–287 presenta duplicación de distancias con
formulación condicionada a información disponible; nota3 de PDF297 utiliza una
formulación imperativa para liberación instantánea total de un embalaje. Antes de
implementarla estudiar alcance/contexto y registrar interpretación; no convertir
la discrepancia en multiplicador universal silencioso.

Continuación131–174:43 condiciones particulares adicionales, una por guía con
contenido, para54 reglas en este archivo. No se crea una regla de respuesta para167.
Cada registro relaciona fragmentos originales, subapartado, referencias/cajas,
activador, incógnitas, límites y dos casos documentales propuestos. Las notas
completas de cada guía siguen en los cuatro estudios enlazados desde el
[inventario](response-guides/inventario-guias.md).

Casos de especial atención: excepciones de agua y cinco partes en135;
estado de incendio/suministro en137; clorosilanos139/155/156; nitrato de amonio140;
baterías147; refrigeración148/150; ácido nítrico157; intervención especializada158;
autoridad radiológica161–166; aluminio fundido169; distancias de500m en172 y
escenarios800/1600m de173/174. Conservar las diferencias entre aislamiento,
evacuación considerada, evacuación requerida y dirección de cada distancia.

Esta formalización es documental y no ejecutable. `inventarioTotalDeReglas`
permanece `NO_DETERMINADO`: una condición particular por guía no agota todas
sus reglas ni todas las reglas de las392 páginas.

La [inspección de las392 páginas](paginas/README.md) amplía las anotaciones de
identificación, tablas y anexos. Los [hallazgos](paginas/hallazgos.json) conservan
literal, acción y contexto para viento/posición y umbrales; no se transformaron
en reglas ejecutables ni modifican las54 reglas documentadas anteriores. La
hipótesis química sobre1754 quedó descartada. Antes de una nueva regla, cotejar
estos hallazgos, condiciones de tablas y sus límites con la página original.
