# Fase 2 — validación del diseño y cierre

Fecha: 2026-10-08. Estado: **fase 2 concluida como diseño**. Arquitectura, recorridos, contratos y matriz documental listos para la fase 3. No se presenta este resultado como un módulo operativo o una prueba de usabilidad con bomberos.

## Entregables y aceptación

| Criterio del plan de fase 2 | Resultado / evidencia |
|---|---|
| Modelo conceptual y puntos de extensión | [Arquitectura](FASE_2_ARQUITECTURA.md): catálogo, referencias por campo, versiones, contexto sobre Servicio, evaluaciones y decisiones inmutables; mapa de archivos/fases |
| Dos recorridos, consulta e incidente | [Experiencia](FASE_2_EXPERIENCIA.md): búsqueda directa, selección ambigua, panel contextual, fuente, decisión y administración |
| Tres niveles de información y estados completos | Información crítica visible, detalle desplegable y documento. Carga, vacío, error, incertidumbre, conflicto, edición, conexión y degradación especificados |
| Contratos y matriz de autorización | [Contratos](FASE_2_CONTRATOS.md): 30 endpoints futuros, DTOs, diez capacidades, cuatro permisos nuevos propuestos, AND/alcance y alternativas explícitas de lectura administrativa, fuentes y versión |
| GRE → ubicación en MATPEL/SCI | [Matriz](FASE_2_MATRIZ_GRE.md): 42 secciones, 392 páginas, notas y tablas especiales, sin secciones omitidas |
| Criterios medibles de usabilidad | UX01–UX10 con pasos, fuente/retorno, certeza, accesibilidad, conflictos y rendimiento; mediciones y operadores todavía pendientes |
| Decisión registrada en contexto/grafo | Nodo curado `decision--matpel-catalogo-contexto-versionados`, estado DISEÑADA, vinculado a Servicio/núcleo/cronología existentes |

## Comprobaciones realizadas

- Registro JSON de contratos concuerda con tabla API; ids, rutas y fases únicos/válidos; capacidades referenciadas existentes. API17 mantiene G condicional para datos protegidos, no como requisito universal de geometría.
- Matriz JSON concuerda con el inventario real: títulos/rangos preservados, cobertura 1–392 exacta y hojas de notas explícitas.
- DTOs del bloque TypeScript verificados en memoria con el TypeScript instalado del backend; comprobación de sintaxis, sin implementación de controladores ni validación semántica de datos reales.
- Enlaces locales, whitespace, JSON y referencias de reglas R01–R38 comprobados. Requisitos originales conservados; huellas de fuentes de fase 1 contrastadas para detectar cambios operativos.
- Grafo regenerado desde código y nueva decisión; `node .context/graph/validar.mjs` terminó con salida 0: **1.054 nodos y 3.694 aristas**, ocho avisos de nodos sin relaciones y advertencia de renombre de tabla.

Resultados, huellas y límites en [validacion.json](evidencia/fase2/validacion.json); contratos en [contratos.json](evidencia/fase2/contratos.json) y matriz en [matriz-gre.json](evidencia/fase2/matriz-gre.json).

## Recuperación del grafo

Se hizo respaldo local de 1.140 archivos del grafo. El comando estándar `build-graph.mjs` se interrumpió por EPERM al eliminar la carpeta de nodos en Windows, después de borrar parte de los derivados. Se restauraron los archivos desde el respaldo y se verificaron sus huellas.

Se ejecutó una copia temporal del mismo generador con salidas aisladas bajo `logs/matpel/fase2/grafo-generado`; las fuentes del repositorio y el lector de decisiones permanecieron iguales. Se instalaron únicamente archivos generados nuevos/cambiados, sin borrar directorios del grafo. Se comprobó que no se omitían nodos anteriores y después se validó el grafo real. El `build-graph.mjs` que tenía cambios locales previos se conservó sin modificarlo.

Respaldo, manifest, generador temporal y reporte de recuperación quedan en `logs/matpel/fase2/`, ignorados por Git. El fallo y la recuperación se registran; no se afirma que el comando estándar haya completado correctamente en este entorno.

## Límites y dependencias restantes

No hubo cambios en módulos/entidades/API/pantallas operativas, aplicación de migraciones, permisos concedidos, datos de ejemplo, commits, pushes ni despliegues. Las entidades y endpoints documentados tienen estado propuesto. Se registró diseño en el grafo, sin inventar nodos de implementación para módulos futuros.

No se repitieron tests/builds de aplicación porque esta entrega no cambia código operativo. La [línea base de fase 1](FASE_1_VALIDACION.md) conserva fecha y alcance: frontend 9/9, móvil 48/48, backend 433/435 con dos fallos previos de Despacho. Esos fallos siguen pendientes; el cierre del diseño no los convierte en aprobados.

Validación de celda/condición crítica, importación reproducible, autorización implementada, recorridos en navegador/dispositivo, presupuesto de latencia y prueba con operadores se realizan en fases posteriores. La autoridad del núcleo y el Reglamento original no localizado siguen siendo dependencias antes de modificar flujos de mando; el diseño falla cerrado ante autoridad no verificable y permite continuar con catálogo/consulta.

**Siguiente entrega: fase 3A, documento y modelo.** Implementar identidad/almacenamiento de fuente, entidades/migración aditiva preparada, contrato del importador y control de versiones, sobre este diseño. La aplicación de migraciones requiere identificar entorno y autorización aplicable; no se deriva de este cierre documental.
