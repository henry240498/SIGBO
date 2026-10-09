# MATPEL / GRE / SCI

Actualizado: 2026-10-09.

## Alcance y estado

Implementación organizada por diez fases verificables. **Fases 1–2 concluidas como diagnóstico/diseño; 3A–3C como base y extracción candidata completa; 3D backend de administración en validación**. El cotejo institucional del catálogo sigue pendiente. No hay catálogo institucional activado ni pantallas MATPEL nuevas declaradas terminadas.

- [Plan, aceptación por fase y registro de ejecución](../docs/matpel/PLAN_POR_FASES.md).
- [Requisitos originales del usuario](../docs/matpel/REQUISITOS_ORIGINALES.md).
- [Estado del centro de operaciones e incidentes](INCIDENTES.md).
- [Diagnóstico de fase 1](../docs/matpel/FASE_1_DIAGNOSTICO.md).
- [Análisis GRE](../docs/matpel/FASE_1_GRE.md), [38 reglas de uso con fuentes](../docs/matpel/FASE_1_REGLAS_GRE.md) y [validación](../docs/matpel/FASE_1_VALIDACION.md).
- Fase 2: [arquitectura](../docs/matpel/FASE_2_ARQUITECTURA.md), [contratos/permisos](../docs/matpel/FASE_2_CONTRATOS.md), [experiencia](../docs/matpel/FASE_2_EXPERIENCIA.md), [matriz GRE → SCI](../docs/matpel/FASE_2_MATRIZ_GRE.md) y [validación](../docs/matpel/FASE_2_VALIDACION.md).
- Fase 3A: [base documental/modelo](../docs/matpel/FASE_3A_BASE_DOCUMENTAL.md) y [validación](../docs/matpel/FASE_3A_VALIDACION.md).
- Fase 3B: [índices y guías](../docs/matpel/FASE_3B_INDICES_GUIAS.md) y [evidencia](../docs/matpel/evidencia/fase3b/validacion.json).
- Fase 3C: [tablas y condiciones](../docs/matpel/FASE_3C_TABLAS_CONDICIONES.md).
- Fase 3D: [administración y prueba SQL aislada](../docs/matpel/FASE_3D_ADMINISTRACION.md), [evidencia actual](../docs/matpel/evidencia/fase3cd/validacion.json).

Cierre recuperado de 3A (2026-10-09): 16/16 pruebas documentales y 21/21 backend GRE aprobadas, compilación backend aprobada, reintento sobre fuente privada sin cambios. Grafo estándar regenerado y validado: 1.095 nodos, 3.836 aristas, ocho avisos previos. Evidencia y huellas en [validacion.json](../docs/matpel/evidencia/fase3a/validacion.json). No se repitió la línea base completa de fase 1 ni se aplicó la migración.

## Fuente identificada

`docs/Manuales/GRE2024-Spa-Web-a.pdf`: GRE 2024 en español, PDF 1.7, 392 páginas.

SHA-256: `bfc8b663259528dadd81a499afac2d5fd417467786ac616fb31625680f4ea4af`.

Inventario completo: 392 páginas con texto nativo, 42 secciones, 64 números de guía y 62 guías con contenido; 121 y 167 intencionalmente sin materiales. Figuras vectoriales, notas y tablas especiales BLEVE/QBRN/AEI incluidas. PDF 154 contiene un ejemplo de guía y numeración múltiple: no importarlo como guía extra. Cobertura y maquetación revisadas; no acredita precisión de todas las celdas.

[Inventario reproducible](../docs/matpel/evidencia/fase1/inventario-gre.json). Herramienta: `scripts/matpel/inspeccionar_gre.py`, solo diagnóstico, sin red/DB. OCR masivo no justificado por esta fuente; OCR selectivo si una región futura carece de texto útil. Detectar por contenido, sin nombre fijo en el futuro importador.

## Línea base y puntos de integración

- Backend: 38 suites, 435 casos; 433 aprobados y dos fallos previos de expectativas de auditoría en Despacho, coincidentes con `INCIDENTES.md`. No corregidos en esta tarea.
- Frontend: 9/9 pruebas de URL aprobadas; móvil: 48/48 aprobadas. No equivalen a pruebas operativas GRE.
- MATPEL actual persiste en JSON de comunicación; sin catálogo/edición ni historial semántico. UI no envía versión opcional del DTO.
- Núcleo preparado sin consumidores registrados; SCI completo pendiente. Reutilizar el mismo Servicio y cronología, sin módulo SCI paralelo.
- Adjuntos necesitan autorización por incidente antes de reutilización OCR; fuente PDF necesita contrato autorizado por documento/página.
- No se identificaron meteorología ni OCR en los módulos revisados. Consulta debe admitir desconocido y funcionar sin esas dependencias.

## Dependencias y reglas

- El SCI completo figura pendiente en el diseño del centro de operaciones. Verificar código y contratos actuales antes de integrar; extender el mismo núcleo.
- Conservar cambios locales previos en incidentes, grafo y móvil.
- GRE es fuente; SIGBO estructura y presenta; el mando decide. No utilizar APIs de IA ni generar datos operacionales.
- Trazabilidad, permisos, auditoría, pruebas y documentación desde cada entrega.
- Diseñar consulta e incidente por separado, con información crítica visible, incertidumbre explícita y acceso a fuente.
- Cumplir AGENTS.md y fuentes normativas antes de modificar flujos; migraciones y despliegues requieren entorno identificado y autorización aplicable.

## Próximo trabajo

Cotejo humano dato ↔ fuente y aceptación institucional; motor/API de consulta en fase 4 y pantallas en fase 5. No activar el catálogo por resultado de una prueba automatizada. Migraciones 094/095 institucionales pendientes; solo 094 en bases temporales propias para validar SQL.

## Implementación actual de 3C–3D

- Artefacto `catalogo-1/busqueda-1/PyMuPDF 1.28.2`: 427/101/22 filas en tablas 1/2/3; 5.533 celdas, 26 reglas, 38.810 referencias y cero hallazgos del extractor. Cobertura 292 páginas estructuradas + 100 conservadas como texto. `aptoActivacion = false`.
- `GreModule` registrado en AppModule, API administrativa con permisos propios. Importación en cola con reclamación READ COMMITTED explícita (READPAST no admite SERIALIZABLE heredado), token/lease, carga transaccional, reintento e idempotencia. Worker apagado por defecto. Identidad incluye versión de PyMuPDF.
- Revisión de referencias paginadas y filas por página, propuestas auditadas; validar exige todas las referencias cotejadas, sin hallazgos/celdas NO_VALIDADO. Activación con revisión esperada, motivo e historial; la institución decide.
- `node scripts/matpel/probar_integracion.cjs` crea y elimina solo su base nueva `sigbo_gre_prueba_<16 hex>` en `sigbo-sqlserver`; no recrea pruebas anteriores ni aplica SQL en `sigbo_cbvc`.
- Pruebas Python: 46/46 aprobadas. Backend GRE: 43/43 aprobadas. SQL temporal: 9/9 aprobadas, base eliminada. Regresión backend: 473 aprobadas y los mismos dos fallos previos de Despacho (43 suites, 475 casos). Resultado SQL/build/grafo final en la evidencia actual.

Las secciones siguientes conservan el alcance histórico de las entregas 3A/3B; para el estado actual prevalece esta sección y el informe de 3D.

## Implementación de 3B

- `python scripts/matpel/importar_gre.py --indices-guias` publica en `backend/private_uploads/gre` un JSON inmutable por hash + versión de parser/normalizador/PyMuPDF. **Cambiar la salida del parser exige subir `VERSION_PARSER`** en `extraer_gre.py`; si no, el reintento falla por contenido distinto.
- 2.665 filas por índice, todas conciliadas por (identificador, nombre normalizado); 64 guías, 62 con contenido; 0 hallazgos críticos; `aptoActivacion = false` hasta 3C/3D.
- Trampas de la fuente: columnas por rótulos de cada página (se desplazan ~5 pt); nombres que empiezan antes de su rótulo; verde como rectángulos por celda; apartados de guía por estructura fija y negrita, no por tamaño (8,2–10 pt). Texto o señal sin fila/bloque es hallazgo.
- Pruebas: `cd scripts/matpel; python -m unittest test_indices_guias_gre test_documento_gre` (36 casos, ~2–3 min, PDF real, sin DB).

## Implementación de 3A

- Descubrimiento por contenido; selección con varias fuentes; copia privada identificada por SHA-256; JSON UTF-8 y manifiesto por versión documental/herramienta. Reintento sin duplicados, corrupción bloqueada y numeración múltiple conservada. Fuente real copiada, catálogo `NO_IMPORTADA`.
- 18 entidades/tablas propuestas con FKs por versión y fuente por campo, candidatas derivadas para correcciones, estados explícitos y protección SQL de contenido validado/historial. Decimales textuales hasta conciliación 3C; originales conservados.
- `GreModule`, lectura interna de versión VALIDADA y fuente privada verificada; sin controladores/AppModule, permisos concedidos ni workers en arranque.
- Migración 094 añadida a orden/hashes; no aplicada. Validación estática/metadata no prueba constraints/triggers/concurrencia en SQL Server.

## Decisiones de fase 2

- GreModule diseñado para catálogo/importación/fuentes, con base interna preparada en 3A; MatpelModule propuesto para motor y contexto sobre el mismo Servicio/núcleo/cronología. Sin integración operativa nueva.
- Entrada tiene id propio, distinto de ONU; varias entradas por identificador. Una versión GRE por contexto y snapshots históricos inmutables.
- 30 endpoints propuestos y diez capacidades. AND/alcance y alternativas de lectura administrativa explícitos; administrar GRE no concede mando. Cuatro permisos MATPEL por registrar junto a implementación, sin concesiones en esta fase.
- Consulta sin crear incidente; panel conserva contexto/certeza y solicita solo condiciones pertinentes. Fuente por bloque/celda; no confirmado o indeterminado no significa ausencia de riesgo.
- Toda la GRE mapeada: 42 secciones/392 páginas, incluidas notas y anexos. Criterios UX01–UX10 definidos, aún sin medición con operadores.
- Reglamento original no localizado en repositorio/adjuntos consultados: localizar/consultar artículos antes de cambios de mando/elegibilidad, validar vigencia institucional. Consulta y catálogo pueden avanzar sin imponer autoridad nueva.
- Grafo regenerado y validado: 1.054 nodos, 3.694 aristas, salida 0 y ocho avisos. Comando estándar tuvo EPERM; restauración verificada y generación temporal instaladas sin borrar directorios. Ver informe de fase 2.
