# Fase 3C — tablas y condiciones

Fecha: 2026-10-09. Estado: extracción candidata comprobada contra la fuente real;
cotejo institucional y activación del catálogo pendientes.

Fuente: GRE 2024 en español, 392 páginas, SHA-256
`bfc8b663259528dadd81a499afac2d5fd417467786ac616fb31625680f4ea4af`.
El perfil admite esta edición comprobada; otra edición requiere un perfil revisado.

## Resultado reproducible

`scripts/matpel/extraer_tablas.py` completa el extractor de índices/guías con las
tres tablas. `scripts/matpel/reglas_gre.py` conserva reglas con texto, parámetros
y referencias de la edición. `python scripts/matpel/importar_gre.py --catalogo`
publica un JSON inmutable en el almacén privado, sin consultar SQL.

| Contenido | Resultado |
|---|---:|
| Tabla 1, aislamiento y protección | 427 filas |
| Tabla 2, materiales que producen gases tóxicos en agua | 101 filas |
| Tabla 3, materiales/contenedores/periodo/viento | 22 filas, seis materiales |
| Celdas de las tres tablas | 5.533 |
| Reglas con procedencia | 26, once marcadas como selección ejecutable |
| Páginas estructuradas / conservadas como texto | 292 / 100 |
| Referencias a la fuente | 38.810 |
| Hallazgos críticos del extractor | 0 |

La cobertura comprende las 392 páginas y las 42 secciones; conservar texto de
anexos y acceso al PDF no acredita una interpretación estructurada de sus figuras.
Las 26 reglas extraídas son un subconjunto implementado de las 38 reglas del diagnóstico.
Las once reglas de selección aún no constituyen el motor operacional de fase 4.

## Tratamiento de la estructura real

Las tablas 1 y 3 contienen texto girado 90° dentro de páginas sin rotación declarada.
Se leen dirección de renglones, separadores dibujados, cabeceras y continuidad de
doble página. Las cajas conservan coordenadas PyMuPDF originales sin rotar.
La Tabla 2 tiene disposición horizontal y conserva fórmulas, gases y leyenda.

Cada fila conserva sus condiciones y vínculo de entrada; cada celda conserva
texto original, decimal textual, unidad, modificador y fuente. Las remisiones a
Tabla 3 no se sustituyen por distancias. Se distinguen tierra/agua, pequeño/grande,
día/noche, contenedor y rango de viento. El signo `+` permanece como modificador.
Un vacío no se interpreta como cero y un valor ilegible queda `NO_VALIDADO`.

Se concilian las filas con los índices: las 427 de Tabla 1 y las 101 de Tabla 2
tienen vínculo. Las remisiones a Tabla 3 coinciden con sus identificadores.
Cambios de columnas, texto sin fila y celdas ilegibles producen errores/hallazgos;
no se completan valores por suposición.

## Validación

`cd scripts/matpel; python -m unittest test_indices_guias_gre test_documento_gre`:
46/46 casos aprobados en 221,965 s en esta sesión. Incluye PDF real, geometría,
contenido conocido de celdas, condiciones, remisiones, manipulación de regiones
en memoria y reintento por CLI sin duplicación. No escribe datos operativos.

Artefacto `catalogo-1/busqueda-1/PyMuPDF 1.28.2`, 21.140.891 bytes, SHA-256
`0a936d3c97fd95195fa24fa7b0f9538ef946e726adf6f8542b65b0a5da10b543`.
`aptoActivacion = false`; las pruebas automáticas no reemplazan el cotejo humano.

Evidencia y validación backend: [fase 3D](FASE_3D_ADMINISTRACION.md).
