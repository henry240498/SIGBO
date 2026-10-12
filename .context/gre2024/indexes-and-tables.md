# GRE24-INDEXES — índices y tablas

El artefacto contiene 5.330 filas de índices (2.665 por color), conciliadas en2.665
entradas por identificador y nombre normalizado. **ONU no es clave única del material**:
varios nombres/condiciones pueden compartirlo. Las filas sin identificador mantienen
ese vacío; no se les inventa ONU. Identificadores propios de GRE no se certifican
como números ONU de una lista regulatoria mediante la consulta.

Relaciones/campos cotejados por el auditor: pertenencia de ambos lados del índice,
identificador, nombre normalizado, guía, `P`, verde y existencia de guía con contenido.
La igualdad nativa por referencia prueba conservación de caracteres, pero falta
comprobar exhaustivamente la interpretación de colores, categorías y condiciones.

| Tabla | Filas | Celdas | Fuente y propósito |
|---|---:|---:|---|
| 1 | 427 | 5.124 | PDF296–333; distancias, condiciones tierra/agua, remisiones |
| 2 | 101 | 101 | PDF334–339; gases PTI al derramarse en agua, leyenda |
| 3 | 22 | 308 | PDF340–343; seis grupos/siete identificadores, contenedores y viento |

48 celdas de Tabla1 son remisiones a Tabla3, **no cifras**. Celdas de Tabla2 contienen
texto/fórmulas, no distancias. Los valores métricos/imperiales impresos están
redondeados de forma independiente: no regenerar uno a partir del otro ni exigir
equivalencia numérica exacta como criterio de fidelidad.

Las notas y condiciones deben consultarse con cada fila. `+` expresa posibilidad
de mayor distancia; un vacío o una remisión nunca equivale a cero. Tabla2 no
autoriza sustituir el material por el gas producido para calcular la distancia
(PDF334, impresa332). Tabla3 no se aplica a cualquier material/derrame.

Hallazgo `GRE24-ISSUE-T3-QUANTITIES`: cantidades/tipos de contenedor de PDF340
no están integrados en condiciones del catálogo actual. La reanudación conserva
fuentes propias de cinco cantidades en la regla documental y amplía el
[estudio de Tabla 3](estudio-tabla3.md), sin cambiar el candidato ni programar selección.
Hallazgo `GRE24-ISSUE-WATER-EXTINGUISHER`: la regla documental del flujo PDF3
existe en `reglas-operativas.json`; implementación y pruebas operativas pendientes.
Ver [pendientes](open-issues.md).

El auditor conserva resultados por celda/fila/referencia y discrepancias; no modifica
el catálogo para hacer coincidir cifras con la implementación. Para acceder al
artefacto local seguir [trazabilidad](data-lineage.md); para uso operativo público
seguir [procedimientos](decision-procedures.md), con su estado de validación.
