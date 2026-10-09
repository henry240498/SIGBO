# Fase 1 — validación y cierre

Inspección y pruebas iniciales: 2026-10-07. Cierre y comprobación documental: 2026-10-08. Estado: **fase 1 concluida como diagnóstico**; fase 2 pendiente. No se certifica aptitud operativa del módulo GRE, aún sin implementar.

## Criterios del plan

| Criterio de fase 1 | Resultado | Evidencia |
|---|---|---|
| Componentes y contratos SIGBO, persistencia, permisos, auditoría y puntos de extensión | Completado; existentes, preparados y ausentes diferenciados | [Diagnóstico](FASE_1_DIAGNOSTICO.md); huellas de 71 fuentes en [fuentes-sigbo.json](evidencia/fase1/fuentes-sigbo.json) |
| Mapa de todo el PDF sin secciones omitidas | Completado: 392 páginas, 42 secciones; cobertura exacta sin huecos o duplicados | [Inventario por página](evidencia/fase1/inventario-gre.json), [mapa](evidencia/fase1/mapa-documental.md), [tratamiento detallado](FASE_1_GRE.md) |
| Tablas, figuras, notas, anexos, P y verde analizados | Completado como análisis de maquetación/aplicabilidad; no validación de todas las celdas | [Análisis documental](FASE_1_GRE.md); revisión visual de 392 páginas en contacto y muestras ampliadas |
| Reglas explícitas y fuentes | Completado: 38 reglas; diez extractos literales cotejados con texto nativo | [Catálogo](FASE_1_REGLAS_GRE.md), [validacion.json](evidencia/fase1/validacion.json) |
| Importación/OCR a partir de evidencia | Estrategia definida; OCR no ejecutado por disponer de texto nativo en todas las páginas | [Estrategia de extracción](FASE_1_GRE.md); herramienta diagnóstica sin DB/red |
| Línea base y fallos previos | Completado; dos fallos previos identificados, no corregidos en esta tarea | Resultados siguientes y antecedente [.context/INCIDENTES.md](../../.context/INCIDENTES.md) |
| Dudas, dependencias y siguiente entrega | Completado: diez cuestiones con fase/resolución | [Dependencias del diagnóstico](FASE_1_DIAGNOSTICO.md) |

## Pruebas existentes ejecutadas

| Plataforma | Comando y carpeta | Resultado | Alcance real |
|---|---|---|---|
| Backend | `npm test -- --json --outputFile=../logs/matpel/fase1/backend-tests.json`, en `backend` | **38 suites: 37 aprobadas, 1 fallida. 435 casos: 433 aprobados, 2 fallidos** | Incluye servicio activo, núcleo preparado, flota, campo, cartografía, seguridad y utilidades; no integración de GRE ni DB real |
| Frontend | `npm test`, en `frontend` | **9/9 aprobados**; ejecución repetida para conservar log completo | Pruebas de sección/URL; no cobertura de pantallas ni recorrido de usuario |
| Móvil | `flutter test --no-pub`, en `.movile` | **48/48 aprobados** | Conexión, geografía, modelos, offline/archivos, reportes y verificación de versiones; no paquete GRE ni recorrido en teléfono |

Los dos fallos backend están en `backend/src/modules/despacho/despacho.spec.ts`, líneas 218 y 340. Las expectativas de `CREAR_SOLICITUD` y `CAMBIAR_DISPONIBILIDAD` esperan un argumento, mientras la llamada de auditoría tiene un segundo argumento opcional `undefined`. Coinciden con la línea base anterior documentada en `INCIDENTES.md`. Se registra salida 1 de Jest; no se presenta el backend como completamente aprobado.

La primera captura de backend no produjo una línea base completa: PowerShell interrumpió por salida stderr. Se repitió capturando stdout/stderr juntos mediante Python; los conteos indicados proceden del JSON de la ejecución final completa. No se cambió el código de pruebas ni de Despacho.

## Comprobaciones de esta entrega

- Repetir inspección del mismo archivo devuelve JSON idéntico y mapa idéntico.
- El mismo contenido bajo otro nombre conserva hash y resumen. Con varios archivos, se rechaza selección automática ambigua; se acepta selección explícita dentro de la carpeta y se rechaza fuera de ella.
- 392 páginas aparecen una vez; 64 guías 111–174 tienen dos páginas; 121/167 están intencionalmente vacías. La alerta de PDF 154 se conserva.
- Diez extractos del catálogo coinciden con sus páginas, normalizando únicamente espacios.
- El texto de requisitos conserva el hash del adjunto original del usuario.
- Sintaxis del inspector, enlaces locales de documentación y whitespace comprobados. Los resultados detallados se guardan en [validacion.json](evidencia/fase1/validacion.json).

La herramienta [inspeccionar_gre.py](../../scripts/matpel/inspeccionar_gre.py) es independiente del runtime NestJS/Next/Flutter. No se agregó una dependencia productiva ni se cambió un contrato de aplicación.

## Evidencia y límites

Resultados compactos y hashes en `docs/matpel/evidencia/fase1/`. Logs de pruebas, texto nativo auxiliar y 27 imágenes reales de revisión en `logs/matpel/fase1/`, ignorados por Git. Los ocho contactos cubren las 392 páginas; las otras imágenes son ampliaciones seleccionadas. El inventario se reproduce con el comando documentado; el JSON registra la versión de PyMuPDF.

No se ejecutaron migraciones, consultas de estado de DB, modificaciones productivas, commits, pushes ni despliegues. No se realizaron builds, pruebas de navegador, mediciones de latencia o validación institucional de decisiones operativas: corresponden a las fases que incorporen funcionalidad. El diagnóstico no activa datos GRE ni declara que todas las distancias estén validadas.

Los dos fallos previos permanecen como dependencia D02. No impiden cerrar el análisis ni diseñar la fase 2, pero deberán resolverse y verificarse antes de aprobar la integración con Despacho. Los contratos SCI, autorización de adjuntos, concurrencia y validación celda a celda se conservan como trabajo explícito en el plan.
