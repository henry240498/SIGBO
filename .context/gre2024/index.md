---
id: GRE24-KNOWLEDGE-INDEX
tipo: conocimiento_documental
fuente: docs/Manuales/GRE2024-Spa-Web-a.pdf
estado: EN_CONSTRUCCION_NO_VALIDADO_INTEGRALMENTE
---

# Conocimiento operativo GRE2024

Entrega técnica2026-10-12: [APK1.7.0+14](../../.movile/docs/GRE_CIERRE_20261012.md)
agrega motor compartido sin conexión y lectura local de texto en placas.
Ruta GRE disponible en backend local;094/095 instaladas en desarrollo con respaldo
verificado. Candidato original importado para revisión; faltan revisión y activación
institucional. SCI y aceptación siguen pendientes; no declarar integración integral.

Entrada permanente para investigar, implementar y auditar GRE/MATPEL/SCI. La fuente
operativa es el **PDF original**, no el grafo ni el comportamiento actual del código.
Este conocimiento complementa [MATPEL](../MATPEL.md) y sus documentos anteriores;
no reemplaza ni borra las investigaciones de fases 1–3.

**Estado al2026-10-10:** lectura documental de las62 guías con contenido terminada,
con121 y167 confirmadas sin materiales. Se conservaron128 páginas naranjas,
620 bloques y2531 cláusulas en seis lotes. La [inspección de páginas](paginas/README.md)
registra392/392:146 antecedentes y246 inspecciones nuevas, sin páginas pendientes
de inspección visual. El cotejo independiente de cada celda y nombre sigue pendiente;
estos conteos no acreditan comprensión independiente integral.
La comprensión exhaustiva de las392 páginas no se declara demostrada. El motor de
selección, la consulta local y la lectura documental sin conexión web/Flutter están implementados y probados; la integraciónSCI y
la aceptación operacional siguen pendientes. Ninguna prueba documental activa un
catálogo institucional.

| Consulta | Documento |
|---|---|
| Identidad, procedencia, edición, límites | [Fuente de verdad](source-of-truth.md) |
| Inventario por sección/página y significado de la cobertura | [Estructura](document-structure.md) |
| Las392 páginas, anotaciones, imágenes y límites de la inspección | [Cobertura de páginas](paginas/README.md) |
| Estudio de alcance y uso, PDF344–349 | [Lectura de guía del usuario](estudio-guia-usuario.md) |
| Relaciones ONU/nombre/guía y tres tablas | [Índices y tablas](indexes-and-tables.md) |
| Cantidades y tipos de fila de Tabla 3, con límites | [Estudio de Tabla 3](estudio-tabla3.md) |
| Guías 111–174, bloques y condiciones | [Guías de respuesta](response-guides.md) |
| Lectura documental de 10 guías / 20 páginas / 403 cláusulas | [Lote 111–120](response-guides/lectura111-120.md) |
| Nueve guías con contenido y una vacía / 20 páginas / 414 cláusulas | [Lote 121–130](response-guides/lectura121-130.md) |
| Diez guías / 20 páginas / 435 cláusulas | [Lote 131–140](response-guides/lectura131-140.md) |
| Diez guías / 20 páginas / 384 cláusulas | [Lote 141–150](response-guides/lectura141-150.md) |
| Diez guías / 20 páginas / 417 cláusulas | [Lote 151–160](response-guides/lectura151-160.md) |
| Trece guías con contenido y167 vacía / 28 páginas / 478 cláusulas | [Lote 161–174](response-guides/lectura161-174.md) |
| Cobertura de todos los números, páginas y remisiones | [Inventario completo](response-guides/inventario-guias.md) |
| Auxilios generales, BLEVE, compatibilidad y ERAP | [Dependencias](response-guides/dependencias.md) |
| Reglas, condiciones, evidencia y estado por regla | [Reglas operativas](operational-rules.md) |
| Finalidades/unidades/geometría de distancias | [Aislamiento y distancias](isolation-and-distances.md) |
| Procedimientos de consulta, identificación y abstención | [Procedimientos](decision-procedures.md) |
| Resultado → campo → referencia → página original | [Trazabilidad](data-lineage.md) |
| Consulta/motor/geometría locales y dependencias SCI | [Implementación](engine-implementation.md) |
| Análisis de mejora: reglas estructuradas, resultados por finalidad y consulta guiada | [Propuesta 2026-10-11](../../docs/matpel/ANALISIS_MEJORA_ARQUITECTURA_20261011.md) |
| Implementación de las mejoras autorizadas, resultados y límites | [Mejora aplicada2026-10-11](../../docs/matpel/IMPLEMENTACION_MEJORA_20261011.md) |
| Recorrido, API, límites y validación de la entrega local | [Consulta MATPEL](../../docs/matpel/FASE_4_5_CONSULTA_MOTOR.md) |
| Consulta documental local, ediciones guardadas y fuentes en Flutter | [Lector móvil](../../.movile/docs/MATPEL.md) |
| Casos y controles reproducibles | [Pruebas](test-cases.md) |
| Estado, criterios de aceptación y evidencias | [Validación](validation-report.md) |
| Obligaciones para agentes y acceso entre proveedores | [Instrucciones](agent-instructions.md) |
| Discrepancias y tareas con impacto | [Pendientes](open-issues.md) |

Datos consultables: [matriz de auditoría](evidencia/auditoria-documental.json),
[reglas documentadas](reglas-operativas.json), [revisión visual](evidencia/revision-visual.json).
Los JSON conservan identificadores estables; las referencias `ref-*` se interpretan
solamente dentro del artefacto cuyo SHA consta en la matriz. No son UUID de SQL.

Para revisar cambios de software seguir también [AGENTS](../../AGENTS.md),
[reglas del proyecto](../reglas.md) y el grafo L2. Antes de una conclusión operativa
seguir la regla hasta el PDF y comprobar sus condiciones y limitaciones.
