# GRE2024: inspección documental de las 392 páginas

Se completó la cobertura visual registrada del PDF local: **392/392 páginas**, con
146 antecedentes conservados y 246 inspecciones nuevas. Los registros nuevos se
escribieron después de ver individualmente las páginas renderizadas y consultar
el texto original. El preparador solo genera imágenes: no atribuye lectura.

Fuente: [PDF original](../../../docs/Manuales/GRE2024-Spa-Web-a.pdf), SHA256
`bfc8b663259528dadd81a499afac2d5fd417467786ac616fb31625680f4ea4af`.
El PDF y el candidato conservan sus bytes. Las notas distinguen número PDF y
numeración impresa; no se deduce una de la otra por una resta automática.

- [Inventario](inventario.json): una fila por página, texto e imagen con huellas,
  etiquetas impresas, sección y procedencia histórica o inspección nueva.
- [Anotaciones](notas.json): 246 páginas con observaciones, fragmentos originales y
  límites de la lectura. Conservarlas completas junto a los estudios previos.
- [Mapa de cobertura](cobertura.md): relación de las 392 páginas y sus evidencias.
- [Hallazgos y correcciones](hallazgos.json): fuentes exactas, hipótesis descartada,
  diferencias de contexto y cuestiones que requieren interpretación.
- [Registro visual](../evidencia/revision-visual.json): imágenes y conclusiones.

| Sección | Páginas PDF | Numeración impresa principal |
|---|---|---|
| Portada, identificación y precauciones | 1–31 | 1–29 desde PDF3; portadas sin contador |
| Índice amarillo | 32–93 | 30–91 |
| Índice azul | 94–153 | 92–151 |
| Uso naranja y auxilios | 154–157 | 152–155 |
| Guías de respuesta | 158–285 | 156–283 |
| Tablas y protección | 286–343 | 284–341 |
| Guía del usuario, protección, descontaminación y control | 344–355 | 342–353 |
| Baterías y BLEVE | 356–359 | 354–357 |
| QBRN y tablas de AEI | 360–369 | 358–367 |
| Glosario | 370–382 | 368–380 |
| Publicación, contactos, ERAP y contraportada | 383–392 | 381–388 hasta PDF390; PDF391/392 sin contador |

PDF154 tiene como pie principal **152**; los números 168/169 pertenecen a la
miniatura de una guía. Se preservan todos los rótulos, sin crear páginas o guías
adicionales. Las páginas de notas y las columnas vacías también se inspeccionaron.

La lectura de índices y tablas incluye estructura, condiciones, continuidad y
entradas relevantes. **No equivale al cotejo semántico independiente de cada
nombre o cada celda**. La auditoría técnica previa conserva su propio alcance y
fecha. Los 2531 grupos de cláusulas de las guías y las 54 reglas previas siguen
válidos; no son el inventario exhaustivo de reglas de toda la GRE.

Condiciones documentales que la implementación futura debe conservar:

- Una identidad incluye nombre, identificador, composición, concentración,
  estado y variante. ONU1613 y los vehículos/baterías de ONU3171 muestran por qué
  el identificador aislado puede no determinar guía, color o condición.
- Tabla1 distingue tierra/agua, tamaño, día/noche y finalidades de aislamiento y
  protección. Tabla2 informa gases generados; no reemplaza el material consultado.
  Tabla3 agrega recipiente/cantidad/viento. No mezclar sus criterios con QBRN/AEI.
- PDF365 / impresa363 usa cantidades QBRN pequeñas de hasta 2kg y grandes de
  hasta 25kg; PDF367 / impresa365 usa su propia matriz. No sustituirlas por el
  límite volumétrico de 208L ni extrapolar a cantidades mayores.
- PDF368–369 / impresas366–367 conserva distancias de daño, refugio y evacuación
  requerida/preferida. No convertirlas en una única distancia del motor de Tabla1.
- PDF371 / impresa369 define cantidades abundantes por un caudal mínimo de
  1900L/min. Caudal no es volumen disponible. PDF382 / impresa380 usa zonas de
  peligro tóxico A–D: no son áreas geográficas ni niveles de equipo protector.
- PDF360 / impresa358 emplea expresiones de viento para acciones diferentes.
  Precisar posición respecto de la fuente antes de codificar ubicación de comando.
  PDF21 / impresa19 y PDF377 / impresa375 tienen umbrales con contextos distintos.

Una anotación inicial confundió «trióxido» con «dióxido» para ONU1754. El cotejo
de PDF305 / impresa303, índices PDF47/96 / impresas45/94 y Tabla2 PDF336 /
impresa334 descartó esa hipótesis. El render adicional orientado se conserva
como evidencia. La corrección anterior y el motivo permanecen en el registro.

La vigencia, posibles erratas externas y los contactos no se verificaron en esta
lectura; PDF385 / impresa383 requiere comprobación periódica. Tampoco se acredita
comprensión independiente integral, prueba del motor, integración SCI ni aceptación
institucional. No se activó catálogo ni se cambiaron aplicación, SQL o producción.

Los controles reproducibles y el resultado están en [validación](../validation-report.md).
