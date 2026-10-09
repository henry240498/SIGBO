# Fase 1 — diagnóstico SIGBO / GRE

Inspección: 2026-10-07. Cierre documental: 2026-10-08. **Diagnóstico concluido.** Se completaron el rastreo de componentes, el inventario de las 392 páginas, las reglas de utilización y la línea base de pruebas. La integración funcional sigue pendiente en las fases 2–10.

Esta entrega comprende análisis estático del código local, inspección del PDF real y pruebas automatizadas existentes. No certifica un despliegue, el estado actual de una base de datos ni la exactitud de todas las celdas del futuro catálogo.

- [Análisis documental y estrategia de extracción](FASE_1_GRE.md).
- [Reglas GRE con referencias a la fuente](FASE_1_REGLAS_GRE.md).
- [Validación y criterios de cierre](FASE_1_VALIDACION.md).
- [Inventario reproducible por página](evidencia/fase1/inventario-gre.json) y [mapa de secciones](evidencia/fase1/mapa-documental.md).
- [Plan de implementación](PLAN_POR_FASES.md) y [requisitos originales](REQUISITOS_ORIGINALES.md).

## 1. Qué existe y qué falta

SIGBO ya tiene registro de Servicios, Despacho con participantes y formularios, seguimiento de recursos, mapas, permisos, auditoría, almacenamiento privado y sincronización móvil. MATPEL aparece como dos campos del formulario de incendios. No se encontró catálogo GRE, importador, motor de selección tabular, OCR de identificación ni proveedor meteorológico en las fuentes revisadas.

El núcleo de incidentes tiene trabajo local previo, pero `IncidenteNucleoModule` todavía no figura importado por otro módulo. No se encontró una pantalla `/incidente` en las rutas web actuales. El SCI completo continúa pendiente según [INCIDENTES.md](../../.context/INCIDENTES.md). La integración debe extender ese trabajo y el mismo Servicio; construir otro SCI introduciría estados y cronologías paralelos.

## 2. Rastreo de flujos y contratos actuales

Las rutas siguientes llevan el prefijo global `/api/v1`. Los permisos son los observados en código, no una propuesta de permisos MATPEL. Las entidades listadas son los puntos de persistencia pertinentes, no el esquema completo del sistema.

| Flujo | UI / consumidor | API y contrato | Servicio / persistencia | Acceso, auditoría y validación |
|---|---|---|---|---|
| Comunicación MATPEL actual | `frontend/src/app/dashboard/servicios/nuevo/page.tsx`; campos `matpelOnu` y descripción, visibles para INCENDIO con tipo MAT-PEL | POST `/servicios/comunicaciones`, PATCH `/servicios/comunicaciones/:id`; `{tipo, formulario, version?}` en `GuardarComunicacionDto` | `ServiciosService`; `ComunicacionServicio.datos` JSON y `Servicio`; transacción serializable, bloqueo y versión | `servicios:crear` / `servicios:editar`; lectura `servicios:ver`. Auditoría conserva resumen tipo/estado/versión. Hay pruebas de geolocalización Servicios; no se identificó prueba específica del flujo GRE/MATPEL |
| Servicio activo | Web Servicios/Despacho y `frontend/src/lib/despacho.ts`; móvil `servicio_activo.dart` | GET `/despacho/servicios-activos`, GET `/despacho/servicios/:id`, POST `/:id/unirme`, PATCH `/:id/mi-estado` | `ServicioActivoService`; `ServicioParticipante`, `Servicio`, información del usuario | `despacho:servicio`, habilitación por Pantallas y reglas de participación; pruebas `servicio-activo.spec.ts` |
| Formularios de campo e historial | Mismos consumidores de servicio activo | GET/POST `/despacho/servicios/:id/formularios`; PATCH `/despacho/formularios/:id`; POST `/:id/anular`; GET `/:id/historial` | Definición, respuesta e historial de formularios; edición por propietario o administrador, control de versión | Definiciones: `despacho:formularios_admin`; respuestas: reglas de servicio y pantalla `0xA008`; redacción de campos confidenciales. El historial sirve de referencia para concurrencia, sin equivaler a eventos MATPEL |
| Mensajes y actualización | Despacho web/móvil | GET/POST `/despacho/servicios/:id/mensajes`; SSE `/despacho/stream` | Mensajes persistidos; `DespachoTiempoRealService` publica mediante `Subject` en memoria | Participación y permisos. El SSE requiere `despacho:responder` y tiene efectos de presencia del Despacho; no reutilizarlo como canal general del incidente sin diseñar su alcance |
| Preparación del núcleo | Trabajo previo en `backend/src/modules/incidente-nucleo/`; no controlador operativo identificado | No hay API pública del núcleo registrada en el código consultado | `CronologiaService`, `MotorFasesService`, políticas; entidades y migración 093 preparadas previamente | Cronología acepta el `EntityManager` de la acción, clave idempotente y huella del contenido; conserva fecha de ocurrencia/registro y actor. Pruebas `incidente-nucleo.spec.ts`; esto no prueba integración con app/web/DB |
| Recursos y móviles | Flota web, Despacho, móvil; bibliotecas `flota.ts` / `despacho.ts` | Controladores Flota/Despacho existentes para disponibilidad, despacho y posiciones | `FlotaService`, vehículos, despachos, dotación y disponibilidad | Reglas por operación y auditoría de despacho/cambio de estado. Disponibilidad, especialidad y compatibilidad MATPEL son datos diferentes; no convertir un conteo de dotación en idoneidad |
| Personal y capacidades | Ficha Personal; `TabEspecialidades.tsx`, `TabFormacion.tsx`; bibliotecas `personal.ts` / `guardias.ts` | GET `/personal/bomberos/:id/especialidades`, GET `/personal/bomberos/:bomberoId/certificaciones`, GET `/guardias` | `EspecialidadesBomberoService`: `BomberoEspecialidad` + `Especialidad`; certificaciones: `Certificacion`; `GuardiasService` | Lecturas `personal:ver` / `guardias:ver`; certificaciones y guardias tienen auditoría. El reemplazo de especialidades consultado no registra auditoría propia: consumir como información y diseñar trazabilidad de una futura decisión de recursos |
| Mapa del servicio | `MapaServicioDespacho.tsx`, `mapa_servicio.dart` | GET `/despacho/servicios/:id/mapa` | `ServicioActivoService`, participantes y posiciones; tiles desde configuración | Participante o `despacho:seguimiento`, Pantallas `0xA00E`; confidencialidad controla precisión. Una capa GRE no debe ampliar acceso a posiciones |
| Seguimiento geográfico | `SeguimientoGeografico.tsx`, `MapaSeguimiento.tsx`, `seguimiento-geografico.ts` | `/servicios/:servicioId/seguimiento`, subrutas de ruta planificada, eventos y pruebas | Servicio de seguimiento, puntos/rutas y evidencias actuales | Lectura `servicios:ver_gps`, escrituras `servicios:despachar`; hay nivel de acceso a pruebas. Mapa Leaflet cargado sin SSR; no tiene contrato de zonas GRE |
| Cartografía | Servicios/Cartografía, `MapaCartografia.tsx` | Controlador Cartografía: hidrantes, riesgos, preplanes | Coordenadas, versiones de preplan, utilidades de distancia Haversine | Permisos Servicios por lectura/escritura. No se encontró motor de dispersión ni almacenamiento espacial equivalente a PostGIS |
| Fuente PDF | Documentos y `VisorDocumento.tsx` | GET `/documentos/:id/vista-previa` / descarga autorizada | `DocumentosService`, documento registrado y archivo protegido | `documentos:ver` / `documentos:descargar` y confidencialidad. El visor recibe un Documento por id, no una ruta arbitraria; no incluye contrato de página GRE. El PDF en `docs/Manuales` no está acreditado como documento registrado |
| Fotos y adjuntos | `terreno.dart` y capturas existentes | Campo: POST `/adjuntos`, lista y archivo por controladores existentes | `AdjuntosService`, `Adjunto`, almacenamiento privado; PNG/JPEG/WebP/GIF, 8 MiB y 30 adjuntos por entidad | `adjuntos:subir` / `adjuntos:ver`; la revisión no encontró control de pertenencia al incidente en este servicio. Antes de reutilizar para OCR, concretar autorización por incidente y metadatos de evidencia |
| Offline móvil | `.movile/lib/offline.dart`, `api.dart`, `terreno.dart` | Cache GET y cola de mutaciones/archivos sobre API existente | SharedPreferences, archivos locales, sincronización ordenada y limpieza de sesión | Pruebas `offline_test.dart`, `offline_archivos_test.dart` y conexión. Sin paquete GRE descargado, hash de edición ni navegación de fuente offline |

Fuentes concretas: [ServiciosService](../../backend/src/modules/servicios/servicios.service.ts), [ServicioActivoController](../../backend/src/modules/despacho/servicio-activo.controller.ts), [ServicioActivoService](../../backend/src/modules/despacho/servicio-activo.service.ts), [núcleo preparado](../../backend/src/modules/incidente-nucleo/incidente-nucleo.module.ts), [AppModule](../../backend/src/app.module.ts), [especialidades](../../backend/src/modules/personal/especialidades-bombero.service.ts), [adjuntos](../../backend/src/modules/campo/adjuntos.service.ts), [offline](../../.movile/lib/offline.dart). Los nombres y hashes de fuentes seleccionadas quedan en [fuentes-sigbo.json](evidencia/fase1/fuentes-sigbo.json).

### 2.1. Particularidades del MATPEL existente

El número ONU vive dentro del JSON de comunicación. No tiene entidad de identificación, relación a una edición, confirmación humana, procedencia, condiciones tabulares ni historial semántico MATPEL. Los campos operativos copiados a `Servicio` no incluyen un número ONU indexado.

La UI limita el texto a cuatro caracteres, pero no acredita por sí misma que exista una entrada GRE. El guardado actual no envía `version`, aunque el DTO la admite y el backend verifica conflictos si llega. La integración deberá evitar actualizaciones perdidas.

El PDF de comunicación **sí recorre los campos restantes del formulario**, mediante `Object.entries(formulario)`, en [comunicacion-servicio.pdf.ts](../../backend/src/modules/servicios/comunicacion-servicio.pdf.ts). MATPEL puede salir como campo genérico; no existe una ficha GRE dedicada con fuentes y condiciones. La ausencia de una etiqueta literal «MATPEL» en ese archivo no significa que el dato no se imprima.

La validación de finalización del reporte pide datos administrativos y operativos. La consulta inicial de emergencia necesita admitir información desconocida; no conviene usar la finalización de una comunicación como requisito de acceso a GRE.

## 3. Convenciones que debe conservar la arquitectura

| Aspecto | Hallazgo | Consecuencia para fases siguientes |
|---|---|---|
| Plataforma | Manifiestos: NestJS 11, TypeORM 0.3, SQL Server; Next 16, React 19, Leaflet; Flutter/FlutterMap en móvil | Conservar los componentes del proyecto. Estas versiones proceden de manifiestos, sin consulta de novedades externas |
| SQL | `core/database/data-source-options.ts`: `SnakeNamingStrategy`, entidades compartidas, `synchronize: false` | Cambios aditivos y migraciones explícitas; no activar sincronización ni modificar una migración ya aplicada |
| Tipos | UUID para entidades, bigint en cronología; fechas datetimeoffset; coordenadas decimales; JSON en nvarchar(MAX) con validaciones según entidad | Hash/edición/versión y procedencia propios de GRE. Validar lat/lon, GeoJSON lon/lat, metros/km y dirección del viento antes de dibujar |
| Peticiones | Prefijo `/api/v1`; ValidationPipe con whitelist, transform y rechazo de campos adicionales | DTOs explícitos, rangos/unidades/estados desconocidos. No confiar en validación cliente |
| Sesión | Cookies JWT, comprobación de sesión vigente, PolicyEngine y permisos actuales; cliente `api.ts` usa credenciales y refresh | Extender autenticación actual. Las escrituras del cliente usan `X-SIGBO-Request`; respetar FormData y middleware existente |
| Permisos | `PermissionsGuard` usa `requiredPermissions.some(...)` | Varios argumentos de `RequirePermission` significan alternativa OR; si una acción exige ambos permisos, hace falta una comprobación explícita |
| Alcance | Pantallas + reglas de propiedad/participación y confidencialidad en ciertos servicios | Definir lectura GRE, administración de edición y decisiones de incidente por separado; no confiar en ocultar controles web |
| Auditoría | `AuditoriaService` y cronología preparada para acción + evento en una transacción | Guardar antes/después pertinente, actor, parámetros, fuente/edición, responsable y vínculo al evento. El resumen actual de comunicaciones no reconstruye decisiones MATPEL |
| Archivos | `shared/utils/almacenamiento.ts`: referencias opacas y rutas privadas, validación de contenido | Fuente GRE y fotografías mediante acceso autorizado. No exponer rutas locales ni usar el adjuntador de imágenes como almacén PDF |
| Actualización | Versiones en comunicaciones/formularios; SSE Despacho en memoria y consultas periódicas de consumidores | Concretar invalidación selectiva y concurrencia. No afirmar entrega multiinstancia ni sincronización SCI por la sola presencia del SSE |
| Offline | Flutter ya tiene cola/cache, tratamiento de errores y archivos; logout limpia datos de sesión | Reutilizar transporte, diseñar paquete GRE verificable aparte. Web: aviso de conexión y borradores locales no acreditan GRE offline |
| IA | Existe módulo IA en SIGBO para otros usos | El catálogo, importación, búsqueda y reglas GRE solicitadas deben funcionar sin sus APIs |

## 4. Dependencias y cuestiones abiertas

| Id | Cuestión / evidencia | Resolución prevista | Efecto |
|---|---|---|---|
| D01 | Núcleo de incidentes en preparación, sin consumidores registrados; SCI completo pendiente | Coordinar contratos y estado real en fases 2 y 6 sobre el mismo Servicio | No impide diseñar consulta; impide declarar completa la integración SCI |
| D02 | Dos pruebas previas fallan en expectativas de auditoría de Despacho | Corregir y verificar dentro del trabajo de Despacho antes de aceptación de integración | Línea base conocida; no corregida como efecto del diagnóstico |
| D03 | Alcance de adjuntos no comprueba participación al incidente en el servicio revisado | Matriz de autorización por recurso, fases 2/8 | No reutilizar automáticamente las rutas para fotos operativas MATPEL |
| D04 | Versionado opcional no enviado por comunicación web | Contrato obligatorio para decisiones/actualizaciones concurrentes, fases 2/6 | Debe probarse conflicto y reintento; no sobrescritura silenciosa |
| D05 | No se identificó proveedor meteorológico ni OCR | Elegir mecanismo local y contrato complementario en fases 2/7/8 | Desconocido permitido; consulta no depende de esos servicios |
| D06 | Contactos GRE y ERAP tienen jurisdicción específica | Mostrar fuente y separar configuración institucional; validación por responsables | No imponer norma canadiense ni teléfonos extranjeros como regla local |
| D07 | Protección/evacuación y ajuste de distancias requieren juicio operacional | Mantener decisión humana con fundamento; validar reglas críticas con responsables antes de uso operativo | Software explica selección; no emite órdenes |
| D08 | No se consultó DB, registro Documentos, servidor ni navegador durante esta fase | Entorno identificado y recorridos operativos en fases que cambien código | Entidades/migraciones presentes no equivalen a esquema aplicado o funcionalidad desplegada |
| D09 | Tablas rotadas, resaltados y notas requieren validación de extracción celda a celda | Fase 3 con reconciliación y revisión del contenido crítico | El inventario no es un catálogo aprobado |
| D10 | Norma institucional puede tener actualizaciones | Consultar artículos aplicables antes de modificar Servicios/Personal/Guardias/Documentos; registrar ambigüedades | No introducir decisiones de autoridad ni datos de ejemplo |

Se conservaron cambios locales previos del grafo, incidentes y móvil. No se ejecutaron migraciones, escrituras en aplicaciones externas, commits, pushes ni despliegues. El grafo no se regeneró: esta fase añadió documentación y una herramienta documental, sin cambiar módulos, entidades, API o pantallas.

## 5. Entrada concreta a la fase 2

Diseñar consulta directa y panel dentro del incidente como dos recorridos sobre el mismo catálogo. Mantener identificación y estado de certeza visibles; mostrar primero peligros, seguridad y distancias **aplicables**, con edición y acceso a fuente. Resolver candidatos antes de asociar un material; aceptar desconocido sin inventar valores.

La siguiente entrega debe cerrar: entidades conceptuales y procedencia, contratos, autorización por recurso, extensión del núcleo, pantallas y estados vacíos/error/offline, responsabilidades humanas y criterios de usabilidad. No hace falta construir pantallas o un importador para dar por terminado este diagnóstico.
