# Fase 3B — índices y guías

Trabajo: 2026-10-09. Entrega: extracción de los índices amarillo/azul y de las 64 guías naranjas de la GRE 2024 a un **artefacto candidato**, conciliado y sin hallazgos críticos. No se importó a SQL Server, no tiene revisión humana y no es apto para activación. Las tablas 1–3 (3C) y la revisión/persistencia/activación (3D) siguen pendientes.

## Resultado

[extraer_gre.py](../../scripts/matpel/extraer_gre.py), invocado desde el importador de 3A:

```powershell
python scripts/matpel/importar_gre.py --indices-guias
```

Publica en el almacén privado, junto al PDF, `<sha256>.indices-guias-1-busqueda-1-pymupdf1.28.2.json` con la misma publicación inmutable de 3A: un reintento acepta solo bytes idénticos y un artefacto alterado se rechaza sin sobrescribirse. El nombre incorpora versión de parser, normalizador y PyMuPDF; **cambiar el resultado del parser exige subir `VERSION_PARSER`**, o el reintento fallará por contenido distinto.

| Medida sobre la fuente real | Valor |
|---|---|
| Filas del índice amarillo (PDF 33–93) / azul (PDF 95–153) | 2.665 / 2.665 |
| Relaciones amarillo ↔ azul conciliadas / pendientes | 2.665 / 0 |
| Identificadores distintos; con más de una entrada | 1.984; 442 (máximo 10: 1075, 3303, 3306) |
| Entradas sin identificador (`— —`, explosivos genéricos) | 4 por índice |
| Entradas con sufijo P / resaltado verde, por índice | 102 / 415 |
| Guías 111–174; con contenido; intencionalmente vacías | 64; 62; 121 y 167 |
| Guías sin entradas en los índices | 111 (carga mixta/no identificada), 121, 167 |
| Referencias con página, caja y texto | 27.909 |
| Hallazgos críticos | 0 |

Casos de control de fase 1 confirmados: 1092 Acroleína estabilizada 131P y verde en ambos índices; 1689 Cianuro de sodio verde; 1075 conserva sus diez nombres como diez entradas; el ejemplo de guía 117 de PDF 154 no genera otra guía (117 es PDF 170–171). Se cotejó la imagen de PDF 35 con lo extraído: coinciden las ocho filas verdes y las nueve con P.

## Reglas de extracción

**Índices.** Columnas por los rótulos de cada página, nunca por coordenadas globales: entre páginas el cuerpo se desplaza ~5 pt. Cada fila se ancla en su número de guía y abarca los renglones de continuación hasta la siguiente. El límite entre campos tolera 4 pt para el nombre (en la columna derecha del amarillo empieza 2 pt antes de su rótulo) y 1 pt para guía e identificador (en PDF 134 un nombre llega a 3 pt del rótulo «Guía»). Guía (`\d{3}P?`) e identificador (`\d{4}` o `— —`) se validan por patrón: un límite equivocado detiene la extracción en vez de mezclar campos. La P se conserva como bandera de la relación material/guía; `guiaNumero` no lleva sufijo.

**Verde.** La fuente dibuja un rectángulo vectorial por celda (identificador, guía, nombre) que cubre todos los renglones de la fila; un solo trazo agrupa rectángulos disjuntos, por eso su recuadro global no sirve. Una fila es verde si el centro de cada una de sus palabras cae en un relleno verde; si solo algunas, queda `null` con hallazgo. Un relleno del cuerpo sin fila, un trazo no rectangular, transparencia o una imagen en la página también son hallazgos.

**Cobertura.** Toda palabra de una página de índice debe ser rótulo, pie («Página» y su número impreso, sin compararlo con la etiqueta PDF) o parte de una fila; si no, hallazgo. Solo la columna derecha de la última página puede quedar vacía.

**Conciliación.** Clave: identificador y nombre normalizado. Un guion pegado al fin de renglón une la palabra (el azul corta «(BAE-» / «II)» en 3324); el original conserva el salto. Ambos índices deben coincidir en guía, P y verde; la relación conciliada lleva esos valores y es la candidata a una `GreEntrada`. Falta, multiplicidad, discrepancia o guía vacía/inexistente son hallazgos.

**Guías.** Número de cabecera y título por página; dos páginas consecutivas por guía; el título se compara normalizado (las dos páginas difieren en espacios finales). Los apartados se reconocen por la **estructura fija de la GRE y la negrita, no por el tamaño de letra**: el cuerpo varía entre 8,2 y 10 pt. Con un umbral por tamaño, ROPA PROTECTORA (8,2 pt, PDF 262) y DERRAME O FUGA / PRIMEROS AUXILIOS (8,7 pt) se fusionaban con el apartado anterior sin aviso, y «Incendio» (9 pt, PDF 200) se volvía subapartado cuando es un rótulo dentro de EVACUACIÓN, igual que «Derrame».

Cada guía con contenido debe tener una vez PELIGROS POTENCIALES (INCENDIO O EXPLOSIÓN, A LA SALUD), SEGURIDAD PÚBLICA (ROPA PROTECTORA, EVACUACIÓN) y RESPUESTA DE EMERGENCIA (FUEGO, DERRAME O FUGA, PRIMEROS AUXILIOS), cada subapartado bajo su padre. El orden de los peligros se conserva: el primario va primero (163 empieza por A LA SALUD). Los márgenes solo admiten rótulo, número, título y, en PDF 158, el título de la sección; el pie, «GRE2024» y «Página N». Cualquier otro texto en el margen es hallazgo, para no dejar fuera un renglón de contenido. Las guías 121 y 167 quedan `INTENCIONALMENTE_VACIA`, con la referencia de su leyenda.

## Contrato del artefacto

`tipo = gre_indices_guias_candidato`, `schemaVersion = 1`, `estadoCatalogo = NO_IMPORTADA`, `aptoActivacion = false`. Incluye identidad y páginas del manifiesto de 3A, las 42 secciones con su estado de extracción, cobertura por página de índice, entradas de cada índice, relaciones, guías (páginas con texto nativo íntegro y cada renglón con caja, negrita, tamaño y rol; bloques jerárquicos) y referencias. Cada campo de una entrada o guía y cada renglón de un bloque apunta a referencias existentes.

Valores alineados con la migración 094: `metodo` ∈ {`NATIVO`, `GEOMETRIA`} (la técnica concreta va en `tecnica`), estado de guía `CON_CONTENIDO`/`INTENCIONALMENTE_VACIA`, nombre ≤ 1.000 y normalizado ≤ 400 caracteres. `GreBloque` guarda texto plano; la negrita de cada renglón queda en `paginas[].lineas` para la ficha de fase 5.

`aptoActivacion` sigue en `false` aunque no haya hallazgos: faltan tablas y condiciones (3C), revisión dato ↔ fuente por responsables y persistencia controlada (3D). La consistencia entre índices y la geometría prueban coherencia interna, no la corrección editorial de cada nombre.

## Verificación

| Comprobación | Resultado |
|---|---|
| Pruebas 3B ([test_indices_guias_gre.py](../../scripts/matpel/test_indices_guias_gre.py)) y 3A | 36/36 aprobadas (20 nuevas + 16 de 3A), salida 0, 135 s |
| Publicación real en `backend/private_uploads/gre` | Salida 0; 15.547.725 bytes; SHA-256 `ea0e4d6f5ccadf11c3d7ae676f5dd7f3d6bb46b972aff4e5e3eb19dc0a31bb7b` |
| Reintento sobre el almacén real | Salida 0; `artefactoNuevo = false`; mismo hash; PDF y manifiesto de 3A sin cambios |
| Cotejo visual de PDF 35 contra lo extraído | Verde y P coinciden fila por fila |

Las pruebas usan el PDF auténtico. Una extracción compartida verifica cobertura, casos de control, jerarquía y referencias; un reintento por CLI comprueba que la salida es determinista y no duplica. Los casos de falla modifican en memoria una página auténtica: verde parcial, verde sin fila, texto fuera de columnas, maquetación desconocida, subapartado eliminado e índices discrepantes. No hay DB, red, OCR ni APIs de IA.

```powershell
cd scripts/matpel
python -m unittest test_indices_guias_gre test_documento_gre
```

Evidencia y huellas en [validacion.json](evidencia/fase3b/validacion.json).

## Límites y siguiente etapa

Perfil comprobado: GRE 2024 en español; otra edición o maquetación falla para revisión. No hay persistencia: la migración 094 sigue sin aplicar y el artefacto no se cargó en tablas. Sin controladores, permisos ni pantallas.

**Próxima entrega: 3C, tablas y condiciones** (tablas 1–3 con su estructura real, unidades, notas y aplicabilidad), luego 3D (revisión, importación controlada y activación).
