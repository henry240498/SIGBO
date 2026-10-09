# GRE / MATPEL / SCI — plan de implementación por fases

Plan inicial: 2026-10-07. Actualización: 2026-10-09. Estado: **fases 1 y 2 concluidas; 3A–3C como fuente y extracción candidata; 3D backend de administración en validación; cotejo institucional pendiente**.

## Objetivo y forma de avanzar

Integrar la GRE real en SIGBO como consulta y apoyo contextual al incidente y al SCI, con decisiones humanas, procedencia verificable y una interfaz sencilla para campo. El pedido actual organiza la implementación por etapas; no declara terminada la integración.

Los requisitos completos se conservan en [REQUISITOS_ORIGINALES.md](REQUISITOS_ORIGINALES.md). Las 16 fases internas del apartado 96 se agrupan en diez entregas. Seguridad, auditoría, pruebas y documentación acompañan cada entrega, aunque también tengan un control final.

Cada fase se cierra con: resultado integrado o documento de análisis según corresponda, criterios de aceptación comprobados, evidencia de validación, pendientes explícitos y actualización de este registro. Se continúa con la siguiente etapa cuando se cumplen sus dependencias. Un fallo crítico pendiente mantiene abierta la fase afectada.

## Hallazgos iniciales verificados

Esta revisión es un diagnóstico inicial, no una auditoría completa ni una prueba de funcionamiento.

| Elemento | Evidencia y consecuencia |
|---|---|
| Fuente documental | Único archivo encontrado en `docs/Manuales`: `GRE2024-Spa-Web-a.pdf`, 8.182.725 bytes, PDF 1.7, 392 páginas. La portada y el título interno identifican la edición 2024 en español. El importador deberá descubrir el documento, sin fijar ese nombre. |
| Identidad del archivo | SHA-256: `bfc8b663259528dadd81a499afac2d5fd417467786ac616fb31625680f4ea4af`. |
| Extracción preliminar | PyMuPDF obtuvo texto no vacío en las 392 páginas. Las páginas PDF 31, 157, 293 y 389 tienen poco texto y corresponden a hojas de notas. Esto no acredita integridad de tablas, imágenes, colores ni orden de lectura. |
| Estructura | Marcadores para índices amarillo/azul, guías naranjas, tablas verdes 1/2/3, instrucciones de uso y anexos. Hay que distinguir página del archivo y numeración impresa; los marcadores no siempre señalan la primera fila de una tabla. |
| Backend y web | NestJS, TypeORM, SQL Server; Next.js y React según manifiestos actuales. Conservar convenciones y contratos existentes. |
| MATPEL actual | `frontend/src/app/dashboard/servicios/nuevo/page.tsx` contiene número ONU y descripción; `backend/src/modules/servicios/servicios.service.ts` contempla MATPEL. La búsqueda inicial no encontró servicios GRE estructurados. Falta rastrear su persistencia y consumidores. |
| Incidentes y SCI | `.context/INCIDENTES.md` y el diseño de centro de operaciones señalan preparación en curso y SCI completo pendiente. Existe trabajo local sin confirmar en `incidente-nucleo`; la búsqueda encontró su módulo sin consumidores actuales. No asumir integración operativa ni duplicar ese núcleo. |
| Mapas y documentos | Existen `MapaSeguimiento.tsx`, `MapaFlota.tsx`, cartografía y `VisorDocumento.tsx`. Revisar contratos antes de extenderlos; el visor actual está vinculado al módulo Documentos. |
| Offline | Flutter dispone de `offline.dart` y cola/cache reutilizables. La web tiene aviso de conectividad; no se verificó consulta GRE offline. Servidor local sin Internet y dispositivo sin conexión son situaciones distintas. |
| Meteorología | La búsqueda inicial por viento/meteorología/weather/open-meteo no localizó un proveedor en las fuentes consultadas. Estado: no verificado; no asumir que existe. |
| Estado de trabajo | Rama `main`, con cambios previos en grafo, núcleo de incidentes y archivos móviles. Conservarlos y coordinar la integración; no son cambios de esta tarea. |

Fuentes de contexto leídas: `AGENTS.md`, `.context/contexto.md`, `.context/reglas.md`, `.context/ejecucion.md`, contexto y reglas generales del Vault, contexto L2 del grafo, matriz normativa institucional y documentación pertinente de incidentes. Antes de modificar flujos operativos, leer también los artículos aplicables del Reglamento original.

## Fases y resultados

| Fase | Entrega | Dependencias | Estado |
|---|---|---|---|
| 1 | Diagnóstico completo de SIGBO y GRE | Contexto del proyecto y fuente real | Concluida: diagnóstico, reglas y evidencia |
| 2 | Arquitectura y experiencia de usuario | Fase 1 | Concluida: diseño, contratos, recorridos y matriz GRE |
| 3 | Base GRE e importador reproducible | Fase 2 | En curso: 3A–3C candidatas; administración 3D en validación, cotejo institucional pendiente |
| 4 | API de consulta y motor determinístico | Fase 3 validada | Pendiente |
| 5 | Consulta MATPEL integrada y sencilla | Fases 2 y 4 | Pendiente |
| 6 | Incidente MATPEL e integración SCI | Fase 5 y núcleo/contratos SCI comprobados | Pendiente |
| 7 | Mapa operacional y condiciones | Fases 4 y 6 | Pendiente |
| 8 | Lectura de ONU por fotografía | Fases 5 y 6 | Pendiente |
| 9 | Consulta móvil, offline y degradación | Fase 5; integración de 6–8 según plataforma | Pendiente |
| 10 | Validación integral y entrega | Fases anteriores comprobadas | Pendiente |

### Fase 1 — comprender antes de implementar

**1A. SIGBO:** rastrear UI → API → servicio → persistencia → permisos → auditoría → pruebas para Servicios, Despacho, Incidentes/SCI, personal y recursos pertinentes, mapas, adjuntos y móvil. Registrar qué existe, qué está en desarrollo y qué falta. Revisar convenciones SQL/TypeORM, autenticación, almacenamiento, unidades y mecanismos de actualización. Obtener una línea base de pruebas actual, separando fallos previos.

**1B. GRE:** revisar todas las páginas y clasificar texto, tablas, figuras, diagramas, notas y anexos. Analizar instrucciones de utilización, limitaciones, relaciones y condiciones; comprobar estructura y coordenadas de tablas, resaltados verdes y sufijos como `P`. No basta con que haya texto extraíble. Registrar requisitos de OCR selectivo y método de comprobación visual.

**Cierre:** inventario de componentes y contratos; mapa de todas las páginas/secciones; catálogo de reglas explícitas con fuente; dudas y dependencias identificadas. Ninguna sección queda omitida sin registrar su tratamiento: dato estructurado, figura navegable o documento íntegro.

### Fase 2 — diseñar arquitectura y una experiencia intuitiva

Definir modelo conceptual, puntos de extensión, contratos API, permisos y eventos usando SIGBO. Diseñar dos recorridos: consulta sin incidente y panel contextual dentro del incidente. Especificar estados vacíos, error, carga, desconocido, ambigüedad y pérdida de conexión.

Definir fichas en tres niveles: información crítica visible, detalle operacional desplegable y texto/documento original. Conservar condicionantes y advertencias al condensar información. Separar visualmente información GRE, dato del operador, cálculo SIGBO, meteorología y decisión SCI.

**Cierre:** especificación de pantallas, recorridos, contratos y componentes a reutilizar; matriz GRE → ubicación en MATPEL/SCI; matriz de permisos; criterios medibles de usabilidad. Los esquemas de diseño son documentos de trabajo; la entrega funcional posterior deberá consultar datos reales.

### Fase 3 — construir una fuente de datos confiable

Dividir esta fase para que no se convierta en otra tarea monolítica:

- **3A. Documento y modelo:** detección por carpeta y contenido, selección explícita si hay varios archivos, hash, edición, numeración, modelo de procedencia por campo y versionamiento. Preparar cambios aditivos de esquema siguiendo convenciones; aplicar solo en un entorno identificado y dentro de la autorización correspondiente.
- **3B. Índices y guías:** extracción nativa, parsing de nombres/identificadores, relaciones, guías completas y señales visuales con valor operacional. No convertir un identificador en un material único si la fuente contiene varias entradas.
- **3C. Tablas y condiciones:** tablas 1, 2 y 3 según su estructura real, unidades, filas, columnas, notas, condiciones, referencias y reglas de aplicabilidad. No reducir todas las distancias a una sola cifra por ONU.
- **3D. Validación y administración:** proceso controlado fuera de peticiones de consulta, progreso, OCR selectivo si hace falta, idempotencia, reporte de errores y revisión dato ↔ fuente. Comparación entre ediciones, activación controlada, conservación histórica y recuperación de la edición anterior.

Estado 3A: [fuente privada y modelo preparados](FASE_3A_BASE_DOCUMENTAL.md), con [evidencia de validación](FASE_3A_VALIDACION.md). No equivale a importación completa: todavía no hay materiales/guías/tablas importados ni catálogo activado. Migración 094 preparada, sin aplicar.

Estado 3B: [índices y guías extraídos](FASE_3B_INDICES_GUIAS.md) a un artefacto candidato privado: 2.665 entradas por índice conciliadas, 64 guías (62 con contenido, 121/167 intencionalmente vacías), 0 hallazgos críticos. Sin persistencia, revisión humana ni activación (`aptoActivacion = false`).

Estado actual 3C: [tablas y condiciones](FASE_3C_TABLAS_CONDICIONES.md), 550 filas,
5.533 celdas, 26 reglas con procedencia y cobertura de 392 páginas. 46/46 pruebas
Python aprobadas. Estado 3D: [backend de administración](FASE_3D_ADMINISTRACION.md)
con permisos, carga transaccional, revisión e idempotencia, comparación y activación
controlada. SQL validado únicamente en bases temporales según la evidencia actual;
no equivale a cotejo institucional ni a catálogo activo en `sigbo_cbvc`.

**Cierre:** repetir la importación del mismo archivo sin duplicación; reconciliar cobertura por secciones; validar relaciones y valores críticos contra el PDF; preservar originales y dudas. No activar una importación con secciones críticas incompletas o inconsistencias críticas sin resolver. El OCR no convierte por sí solo un dato en validado.

### Fase 4 — servicios, búsqueda y motor MATPEL

Implementar consulta interna por identificador, nombre parcial, guía y alias/clasificación solo cuando estén respaldados por la fuente. Normalizar búsqueda sin alterar el original. Entregar datos de procedencia por apartado/campo y acceso autorizado al documento.

El motor selecciona información mediante condiciones explícitas de la GRE; conserva entradas, reglas, fuentes, edición y versión del motor. No deduce parámetros desconocidos ni combina materiales silenciosamente. Explicar aplicabilidad, falta de datos y ambigüedad. Consultar registros e índices; no reprocesar el PDF por búsqueda.

**Cierre:** pruebas con casos reales y casos de falta de datos, notas/excepciones, varios nombres por identificador, múltiples materiales y cambios de parámetros. Respuestas reproducibles, permisos verificados y auditoría de operaciones críticas. Fijar y medir un presupuesto de latencia en entorno de prueba identificado.

### Fase 5 — primera entrega funcional de consulta

Integrar acceso MATPEL en la navegación institucional, búsqueda directa, resultados inequívocos, ficha, guía completa, distancias aplicables, advertencias y «Ver fuente». Mantener ubicación de lectura al abrir/cerrar fuente. Acompañar con ayuda breve para el usuario.

**Cierre:** buscar un caso real, abrir ficha/guía y verificar cada dato crítico contra su página. Prueba en escritorio y móvil, teclado, contraste y lector de pantalla. Los estados sin resultados o datos no disponibles son claros. Es una consulta funcional; el módulo completo sigue pendiente hasta las fases siguientes.

### Fase 6 — incidente MATPEL y SCI

**6A. Dependencia:** comprobar estado real del centro de operaciones y las APIs de incidente. Acordar contratos con el trabajo existente. Si faltan capacidades SCI necesarias, registrarlas como trabajo explícito sobre el mismo módulo; no construir otro SCI ni declarar completa la integración con un botón de consulta.

**6B. Contexto del incidente:** asociar identificaciones y edición GRE, evento, cantidad/unidad y calidad del dato. Admitir material desconocido y múltiples materiales sin aplicar a una mezcla reglas de una sustancia. Actualización progresiva con historial y recalculado selectivo.

**6C. SCI:** panel con peligros, seguridad y orientación pertinente; registro de decisiones por responsable, fecha, fundamento/fuente y parámetros consultados. Integrar recursos/personas/móviles disponibles sin afirmar automáticamente su idoneidad. Checklists solo desde contenido inequívoco de la GRE, con procedencia y validación operacional.

**Cierre:** flujo real servicio → identificación humana → información contextual → decisión registrada → historial reconstruible. Conservar mando, permisos y edición utilizada; probar cambios de identificación, parámetros y concurrencia. La información GRE no crea órdenes automáticas.

### Fase 7 — GIS y condiciones

Extender mapa y capas existentes con geometría geoespacial, aislamiento/protección cuando aplique, incidente y recursos disponibles. Distinguir distancia de fuente y geometría calculada. Verificar unidades, coordenadas, orientación y convención de dirección del viento.

Reutilizar meteorología si se acredita un servicio existente; si no existe, documentar e integrar la solución complementaria elegida sin atribuirla a GRE. Mostrar fuente, fecha, antigüedad y calidad; permitir condición desconocida. No inventar modelos de dispersión. Sin datos suficientes, informar qué representación no se puede determinar.

**Cierre:** geometrías y selección de valores comprobadas con casos reales; trazabilidad completa; actualización al cambiar parámetros; consulta textual utilizable cuando falla el mapa o falta viento.

### Fase 8 — fotografía y OCR de campo

Captura/carga → preprocesamiento local → OCR → candidatos válidos → confirmación/corrección humana → consulta. Reutilizar adjuntos y reglas de almacenamiento; definir límites y permisos. Conservar evidencia, candidatos, selección, usuario y fecha según política institucional.

**Cierre:** probar fotografías reales disponibles con distinta orientación, iluminación y calidad; rechazo de patrones ambiguos; selección entre candidatos. Si no se dispone de fotos representativas, dejar pendiente esa validación. Nunca confirmar identificación ni ejecutar una acción crítica únicamente por OCR. El ingreso manual sigue accesible.

### Fase 9 — móvil, offline y funcionamiento degradado

Separar consulta local en servidor y consulta descargada en dispositivo. Reutilizar capacidades Flutter; determinar el alcance web después de analizar cache, tamaño y permisos. Paquetes locales de edición validada, integridad, fuente original, actualización y recuperación. Conservar edición histórica al sincronizar.

Decisiones/incidentes: aplicar cola y conflictos según contratos existentes, diferenciando guardado local, pendiente y confirmado en servidor. Consultar GRE no debe depender de meteorología ni de APIs de IA.

**Cierre:** probar sin Internet con servidor accesible, dispositivo completamente desconectado con descarga previa, primera apertura sin descarga, mapa no disponible, OCR fallido, sesión expirada, edición actualizada y reconexión sin duplicación. Declarar por plataforma las funciones offline realmente comprobadas.

### Fase 10 — validación integral y entrega

Revisar todos los criterios del apartado 101 contra evidencia y verificar que el SCI mejoró con información contextual. Pruebas relevantes de backend/frontend, builds de plataformas afectadas, recorrido real en navegador y dispositivo, permisos negativos, rendimiento y regresiones. Validación humana del contenido crítico y del flujo operacional por responsables institucionales.

Completar manual breve, documentación técnica, procedimiento de reimportación/activación/recuperación y reporte final del apartado 100. Regenerar y validar el grafo después de cambios en módulos, entidades, API o pantallas.

**Cierre:** requisitos verificados, pendientes y limitaciones explícitos, datos y fuentes reales, pruebas registradas y procedimiento de actualización comprobado. El despliegue se trata como acción separada en un entorno identificado, con autorización aplicable y resultado revisable.

## Criterios de usabilidad que se comprobarán desde las primeras pantallas

- Desde la entrada MATPEL, escribir o pegar el identificador y buscar; para una coincidencia inequívoca, acceder a la ficha crítica sin pasos de configuración. Si hay candidatos, elegir explícitamente.
- En un incidente, conservar a la vista su identificación y el estado del material; consultar la GRE sin abandonar repetidamente el contexto.
- Botones principales con objetivo de al menos 44 × 44 px, controles alcanzables en móvil y sin acciones dependientes exclusivamente del color.
- Mostrar primero identificación, peligros, seguridad y distancias aplicables. Permitir abrir los demás apartados sin saturar la pantalla inicial.
- «Ver fuente» accesible junto a cada bloque crítico; mostrar edición y numeración pertinente. Si el navegador no posiciona el PDF, ofrecer página indicada y descarga/lectura alternativa.
- No exigir una cantidad o condición inventada. Diferenciar desconocido, no confirmado, estimado y confirmado con texto visible.
- Reservar confirmaciones para identificación ambigua/OCR y acciones críticas; evitar preguntas repetidas en consultas.
- Conservar tonos azules, componentes, navegación y terminología institucional. No modificar diseño del login.
- Medir tareas con usuarios operacionales: búsqueda, lectura de condicionantes, acceso a fuente y registro de decisión. Registrar dificultades y corregirlas antes del cierre; no prometer usabilidad sin comprobarla.

## Cobertura de la propuesta original

| Apartados | Fases responsables |
|---|---|
| 0–6: fuente, restricciones y análisis | 1; restricciones en todas |
| 7–14: arquitectura, ingestión, procedencia e integridad | 2–4 |
| 15–16: consulta y fuente | 4–5 |
| 17–26: contexto, SCI, decisiones y evolución | 2 y 6 |
| 27–28: imagen y consulta sin Internet | 8–9 |
| 29–32: mapa, geometría, viento y reactividad | 4, 6–7 |
| 33–39: ficha, UX, motor y servicios | 2 y 4–7 |
| 40–42: futura IA/MCP/voz | 2 y 4: contratos reutilizables; sin implementar APIs de IA |
| 43–46: versiones, reimportación, auditoría y seguridad | 3–4 y 6; controles en todas |
| 47–52: consulta, SCI, recursos, eventos, calidad y OCR | 5–6 y 8 |
| 53–58: pruebas y funcionalidad real | Criterios de cierre en cada fase; control integral en 10 |
| 59–71: documentación, procedencia, fallbacks y experiencia | 2 y 5–10; documentación en cada fase |
| 72–86: comparación, almacenamiento, índices y administración | 3–4 |
| 87–95: simplicidad, responsabilidad y compatibilidad | 2 y 5–10; restricciones en todas |
| 96–99: etapas, adaptación y rastreo completo | Este plan; fases 1–2 y revisión en cada cambio |
| 100–103: informe, aceptación y resultado final | 10, con evidencia acumulada desde 1 |

La fase 1 cubre las fases internas 1–2 del apartado 96; la 2 cubre la 3; la 3 cubre 4–6; la 4 cubre 7 y parte del motor; la 5 cubre 8; la 6 cubre 9–10; la 7 cubre 11; la 8 cubre 12. Auditoría, pruebas y documentación (13–15) son transversales; validación final (16) corresponde a la fase 10. La fase 9 explicita offline/móvil para que no quede implícito.

## Registro de ejecución y siguiente etapa

| Fecha | Trabajo | Resultado | Limitación |
|---|---|---|---|
| 2026-10-07 | Lectura de requisitos/contexto, Git y contexto L2 | Plan por fases y dependencias documentados | No valida funcionalidades existentes |
| 2026-10-07 | Identificación PDF, SHA-256, metadatos, marcadores y extracción nativa de 392 páginas | GRE 2024 identificada; todas las páginas tienen texto extraíble | No es una importación estructurada ni una validación exhaustiva |
| 2026-10-07 | Revisión inicial de MATPEL, incidentes, mapas, visor, offline y búsqueda de meteorología | Componentes y dependencia SCI identificados | Persistencia, contratos y recorridos completos pendientes |
| 2026-10-07 | Validación documental y `git diff --check` | Diez fases presentes; 104 apartados originales (0–103) conservados con hash idéntico al adjunto; enlaces locales existentes; sin errores de whitespace | Comprobación documental, no pruebas de aplicación |
| 2026-10-07–08 | Fase 1A: rastreo de flujos, contratos, persistencia, permisos y auditoría; línea base actual | [Diagnóstico SIGBO](FASE_1_DIAGNOSTICO.md): puntos de extensión y diez dependencias; 71 fuentes identificadas por hash | Sin DB/navegador; núcleo SCI todavía sin consumidores registrados |
| 2026-10-07–08 | Fase 1B: inventario de 392 páginas, revisión visual y reglas | [Análisis GRE](FASE_1_GRE.md), [38 reglas con fuente](FASE_1_REGLAS_GRE.md), 42 secciones, 62 guías con contenido y dos intencionalmente vacías; tablas especiales incluidas | No valida todas las celdas ni activa catálogo |
| 2026-10-07–08 | Línea base y reproducibilidad documental | Frontend 9/9; móvil 48/48; backend 433/435, dos fallos previos en Despacho. Inventario repetido idéntico y detección sin nombre fijo verificada | [Validación detallada](FASE_1_VALIDACION.md); fallos previos pendientes de su trabajo correspondiente |
| 2026-10-08 | Fase 2: arquitectura, permisos, API, experiencia y matriz GRE | [Arquitectura](FASE_2_ARQUITECTURA.md), [contratos](FASE_2_CONTRATOS.md), [experiencia](FASE_2_EXPERIENCIA.md), [matriz](FASE_2_MATRIZ_GRE.md); 30 rutas futuras y 42 secciones cubiertas | Diseño, no controladores ni pantallas implementadas; núcleo/Reglamento original pendientes antes de flujos operativos |
| 2026-10-08 | Registro y validación de decisión de arquitectura en grafo | 1.054 nodos, 3.694 aristas, validación salida 0, ocho avisos; [informe](FASE_2_VALIDACION.md) | EPERM del generador estándar recuperado mediante respaldo y generación temporal; pruebas de usabilidad/runtime pendientes |
| 2026-10-08–09 | Fase 3A: fuente documental y modelo | [Base GRE](FASE_3A_BASE_DOCUMENTAL.md): copia privada de fuente real, reintento sin duplicación, 18 entidades/tablas, procedencia por campo, servicios internos y migración 094 preparada | Sin aplicación SQL, catálogo estructurado, activación ni API/pantallas; [validación](FASE_3A_VALIDACION.md) |
| 2026-10-09 | Recuperación y cierre de la sesión interrumpida de 3A | 16/16 pruebas documentales y 21/21 backend GRE; compilación aprobada; reintento sobre fuente existente sin cambios; grafo estándar regenerado y validado | [Informe y evidencia](FASE_3A_VALIDACION.md); esquema SQL preparado sin aplicar; 3B–D siguen pendientes |
| 2026-10-09 | Fase 3B: índices y guías (sesión interrumpida retomada) | [Extracción](FASE_3B_INDICES_GUIAS.md) de ambos índices y las 64 guías con referencias; conciliación 2.665/2.665; 36/36 pruebas Python; artefacto privado publicado y reintento sin cambios | Sin SQL, revisión humana ni activación; tablas en 3C; [evidencia](evidencia/fase3b/validacion.json) |

| 2026-10-09 | Recuperación de 3C–3D desde sesión interrumpida | Extracción candidata de las tres tablas y reglas, controles de revisión/idempotencia/lease y API administrativa; [informe](FASE_3D_ADMINISTRACION.md) y [evidencia](evidencia/fase3cd/validacion.json) | Cotejo institucional pendiente; sin migraciones/activación institucional ni pantallas nuevas |

**Pendiente para cerrar fase 3:** cotejo y aceptación institucional de la fuente
estructurada; aplicar esquema/permisos en un entorno identificado y autorizado.
Fase 4 implementa consulta/motor y fase 5 sus pantallas. La activación de una prueba
SQL desechable no habilita el uso operacional del catálogo.

La planificación inicial no ejecutó pruebas de aplicación; la fase 1 registra la línea base descrita. La fase 2 comprueba diseño, contratos y grafo, sin repetir tests/builds operativos. Las fases 3A y 3B incorporan código y sus verificaciones, detalladas en sus informes. No se aplicaron migraciones, commits, pushes ni despliegues por estas entregas.
