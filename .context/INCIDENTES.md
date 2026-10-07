# Centro de Operaciones e Incidentes

## 0. Decisiones del cuartel (tarea 0, 2026-10-07)

Implementación autorizada del plan `docs/superpowers/plans/2026-10-07-centro-operaciones-incidentes.md`. Se aplican las recomendaciones previstas por el plan al no recibirse cambios en las respuestas; son configurables y no sustituyen decisiones reservadas a autoridades institucionales.

| Decisión | Respuesta | Dónde se aplica |
|---|---|---|
| DEC-1 Condiciones críticas | Las diez propuestas: incendio fuera de control, víctima, víctima atrapada, persona desaparecida, derrumbe, riesgo estructural, material peligroso, riesgo de explosión, riesgo químico y riesgo biológico | Catálogo condiciones_situacion, migración 093 |
| DEC-2 Quién registra | Quien tenga servicios:operar; marcar fueraDeAsignacion cuando no figura en el incidente. EMERGENCIA nunca se bloquea por asignación | Acciones de campo, tarea 19 |
| DEC-3 Modo noche | Sí, con botón de cambio, limitado a /incidente | Tarea 21 |
| DEC-4 Horas de servicio | Hora más cercana; conservar siempre minutos exactos. Política institucional parametrizable | Lógica de horas, tarea 2 |
| DEC-5 Servicios antiguos sin comunicación | No aplica: no hay servicios REGISTRADO | Relleno de migración 093 |

Consultas previas, base **local de desarrollo**, contenedor `sigbo-sqlserver`, base `sigbo_cbvc`, TCP 127.0.0.1:14330:

- Servicios: un CANCELADO, sin comunicación; ningún REGISTRADO.
- Estadísticas de hora_salida: IX_desp_servicio, user_created=0; no hay estadísticas manuales que eliminar.
- CK_param_tipo consultado completo: lista institucional vigente sin tipos adicionales respecto del plan.
- Los seis permisos requeridos están presentes: servicios:finalizar, despacho:responder, despacho:seguimiento, despacho:confidencial, adjuntos:subir y vehiculos:ver_mapa.
- Roles: Administrador General (263 permisos), Bombero Operativo (13), Comandante (32), Encargado de Deposito (19), Instructor (15), Jefe de Guardia (27), Tesorero (13). Las nuevas asignaciones se derivan de permisos existentes y no de estos nombres, salvo el administrador previsto en el plan.
- No hay guardias recientes en curso; la interfaz debe representar ese vacío.
- Respaldo previo COPY_ONLY con CHECKSUM: logs/sigbo_antes_incidentes_20261007.bak; no versionado, conserva la base anterior.

## 1. Estado de ejecución

Preparación en curso. Ninguna funcionalidad de incidentes está validada todavía. Las tareas se siguen en el plan y en el registro de trabajo local de Superpowers.

## 2. Línea base de pruebas

Antes de cambiar código: backend **36 suites, 365 casos; 35 suites y 363 casos aprobados, dos fallos** (`npm test`, 415,263 s). Ambos fallos previos en `despacho.spec.ts` esperan una llamada de auditoría con un argumento mientras la implementación pasa un segundo argumento opcional `undefined`: CREAR_SOLICITUD y CAMBIAR_DISPONIBILIDAD. Se deben corregir en el trabajo sobre despacho y volver a verificar antes del punto de control A.

Los controles contra base real y navegador todavía están pendientes. No se presenta una prueba estática como validación operativa.
