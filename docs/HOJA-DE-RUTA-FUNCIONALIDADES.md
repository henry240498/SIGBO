# Hoja de ruta de funcionalidades — SIGBO-CBVC

Plan para sumar las mejoras propuestas sin romper los invariantes del proyecto.
Es un **plan**, no código: cada fase se implementa por separado y se verifica antes de pasar a la siguiente.
Numeración de migraciones: la última aplicada es `076`; antes de crear una nueva, verificar el siguiente número libre (ya colisionó en `017`).

## Receta obligatoria para CADA funcionalidad

1. Consultar `node .context/graph/context.mjs <términos> --level L2` y leer solo los archivos que indique.
2. **Migración nueva** (nunca editar una aplicada) + **entidad TypeORM** en el mismo cambio. `synchronize` está en `false`.
3. Endpoints con `JwtAuthGuard` + `PermissionsGuard` y `@RequirePermission('modulo:accion')`; **sembrar cada permiso** en `seguridad.permisos` en la migración.
4. Reglas que decide la institución (umbrales, plazos, tipos) van como **filas** (`organizacion.parametros`/configuración), no como constantes.
5. Sin relaciones TypeORM: joins con `createQueryBuilder`.
6. Pantalla: `'use client'`, `useState`/`useEffect`, `cargar()` tras cada mutación, `<Aviso>`, `<Cargando>`, `<label htmlFor>`; colores solo con `var(--token)`. Agregarla al `TABS` del `layout.tsx` y correr `npm run generar:pantallas`.
7. Toda acción relevante pasa por `AuditoriaService`. Sin datos de ejemplo.
8. Verificar: `npx tsc --noEmit`, `npm run audit:contraste`, `npm run audit:a11y`, `node scripts/verificar-endpoints.mjs`, `npm test` (backend) y `node .context/graph/build-graph.mjs && node .context/graph/validar.mjs`.

## Base que ya existe y se reutiliza

| Necesidad | Ya existe |
|---|---|
| Móviles / vehículos | `vehiculos.vehiculos` (mig. 006, 023, 075), `vehiculos.checklist_items` (023), vehículos autorizados por conductor, guardias con móviles y bitácora (029) |
| Servicios y recorrido | `servicios.*` (007), rutas planificadas, pruebas de comunicación, `historial_servicios` con `movil_id` (071) |
| Alerta móvil | `servicios.alertas_emergencia` (076) y app Flutter en `.movile/` |
| Personal, salud, academia | módulos `personal`, `salud`, `academia` |
| Equipos y depósito | `equipos.equipos`, módulo `deposito` (inventario por cantidad) |
| Finanzas y socios | módulo `finanzas` (socios, aportes, facturación) |
| Asistente | módulo `ia` (Snoopy, solo lectura) |

## Fase 1 — Control de móviles (prioridad)

**Estado: completa.** Hecho: estado operativo y despacho (mig. `077`), mapa en vivo (`078`, la app informa la posición), vencimientos, dotación por móvil y bitácora de uso con kilómetros (`081`). Ya existían: inspección de móvil por guardia (1.3), mantenimientos y combustible (1.4/1.5). Queda como mejora: fotos y firma dentro de la inspección del móvil.

**Principio:** todo el software es open source (NestJS, Next.js, TypeORM, Leaflet, OpenStreetMap, Ollama, Flutter/geolocator, Piper, Whisper, qrcode, pdfkit). Cualquier funcionalidad nueva debe respetarlo: sin claves de API de pago ni servicios cerrados.

**Principio:** todo el software es open source (NestJS, Next.js, TypeORM, Leaflet, OpenStreetMap, Ollama, Flutter/geolocator, Piper, Whisper). Cualquier funcionalidad nueva debe respetarlo: sin claves de API de pago ni servicios cerrados.

| # | Funcionalidad | Qué reutiliza | Tablas nuevas (esquema `vehiculos`/`servicios`) | Permisos nuevos | Pantallas |
|---|---|---|---|---|---|
| 1.1 | Estado operativo del móvil (en cuartel, despachado, en servicio, regresando, fuera de servicio) | `vehiculos`, `historial_servicios` | `estados_movil` (catálogo como parámetro) + `movil_estado_historial` | `vehiculos:estado` | Vehículos → Tablero de flota |
| 1.2 | Despacho de unidades (salida, llegada, fin, regreso, tiempos de respuesta) | `servicios`, `historial_servicios.movil_id` | `servicios.despachos` (servicio, móvil, hora_salida/llegada/fin/regreso) | `servicios:despachar` | Servicios → Despacho |
| 1.3 | Checklist diario por móvil, con fotos y bloqueo si falla un ítem crítico | `checklist_items` | `vehiculos.revisiones` + `revision_items` (resultado, foto, firma) | `vehiculos:revisar` | Vehículos → Revisión diaria (también en app) |
| 1.4 | Mantenimiento preventivo y vencimientos (VTV, seguro, km/horas) | `vehiculos` | `vehiculos.planes_mantenimiento`, `mantenimientos`, `vencimientos` | `vehiculos:mantenimiento` | Vehículos → Mantenimiento |
| 1.5 | Combustible y rendimiento | `vehiculos` | `vehiculos.cargas_combustible` | `vehiculos:combustible` | Vehículos → Combustible |
| 1.6 | Bitácora de uso (conductor, servicio, km) | guardias-móviles-bitácora (029) | ampliar bitácora existente (verificar antes de duplicar) | reutiliza `vehiculos:ver` | Vehículos → Bitácora |
| 1.7 | Inventario por móvil con reposición | `equipos`, `deposito` | `vehiculos.dotacion_movil` (artículo/equipo, cantidad objetivo) | `vehiculos:dotacion` | Vehículos → Dotación |
| 1.8 | **Mapa de flota en vivo** | `.movile` (GPS), 071 | `vehiculos.posiciones_movil` (última posición + histórico acotado) | `vehiculos:ver_mapa` | Vehículos → Mapa de flota |

Orden interno: 1.1 → 1.2 → 1.8 → 1.3 → 1.4 → 1.5/1.6/1.7.
Decisión previa para 1.8: mecanismo de tiempo real (polling cada N s, ya soportado, vs. WebSocket/SSE). Recomendado: **polling configurable** por parámetro, sin infraestructura nueva.

## Fase 2 — Emergencias y operación

**Estado: completa.** 2.1 llamados y 2.2 convocatorias con «voy» (mig. `079`, web y app), 2.3 disponibilidad en vivo, 2.4 resumen operativo en PDF, 2.5 hidrantes y puntos de riesgo y 2.6 pre-planes versionados (mig. `080`).

| # | Funcionalidad | Base | Nuevo |
|---|---|---|---|
| 2.1 | Cuadro de radio operador (llamado, dirección, tipo, unidades enviadas) | `alertas_emergencia`, `comunicaciones_servicio` | `servicios.llamados` + vínculo a `despachos` |
| 2.2 | Convocatoria masiva con confirmación "voy en camino" | alertas móviles, notificador de la app | `servicios.convocatorias` + `convocatoria_respuestas` |
| 2.3 | Disponibilidad en vivo | guardias, asistencia, posiciones | vista de consulta (sin tablas nuevas, sin vistas SQL por decisión de arquitectura) |
| 2.4 | Informe de intervención automático | servicios, despachos, depósito | generador PDF (como `comunicacion-servicio.pdf.ts`) |
| 2.5 | Hidrantes y puntos de riesgo | cuartel con lat/long (071) | `servicios.hidrantes`, `puntos_riesgo` |
| 2.6 | Pre-planes de incendio | documentos | `servicios.preplanes` (+ adjuntos vía `documentos`) |

## Fase 3 — Personal

**Estado: completa.** 3.1 aptitudes y vencimientos consolidados, 3.3 horas de servicio y descanso con límites que fija el cuartel, 3.5 fichaje por QR (mig. `082`). Ya existían y se integraron: 3.2 requisitos por puesto (`operaciones.requisitos_rol_guardia`) y 3.4 entrega de EPP (`equipos.prestamos_equipos`, ahora con sus vencimientos en el control).

| # | Funcionalidad | Base | Nuevo |
|---|---|---|---|
| 3.1 | Aptitud (carnet de salud, vacunas, licencia) con alertas | `salud`, vehículos autorizados | `salud.aptitudes` + parámetros de anticipación |
| 3.2 | Matriz de capacitaciones por puesto | `academia`, roles de guardia | `academia.requisitos_puesto` |
| 3.3 | Horas de servicio y descanso entre guardias | guardias, asistencia | cálculo en servicio; umbrales como parámetros |
| 3.4 | Control de EPP | `equipos` (trazabilidad individual) | `equipos.asignaciones_epp` con vida útil |
| 3.5 | Fichaje por QR/NFC | marcaciones | `operaciones.puntos_fichaje` |

## Fase 4 — Gestión y comunidad

**Estado: completa, salvo 4.3.** 4.1 indicadores, 4.2 mapa de calor, 4.4 reservas y 4.5 prevención (mig. `083`). **4.3 (portal de socios con pago online) no se hizo**: exige contratar una pasarela de pagos, crear cuentas para personas externas y definir la política de datos; es una decisión del cuartel, no técnica.

| # | Funcionalidad | Base | Nuevo |
|---|---|---|---|
| 4.1 | Tablero de indicadores (tiempos de respuesta, disponibilidad, servicios por zona/franja) | despachos, servicios | endpoints de agregación; sin tablas nuevas |
| 4.2 | Mapa de calor de siniestros | servicios con coordenadas | solo frontend + agregación |
| 4.3 | Portal de socios y pago online | `finanzas` | requiere decisión de pasarela de pago |
| 4.4 | Reservas de instalaciones | — | `organizacion.reservas` |
| 4.5 | Prevención (certificados, inspecciones, cobro) | documentos, finanzas | `servicios.inspecciones_prevencion` |

## Fase 5 — Técnicas transversales

**Estado: completa.** Respaldo verificable y programado (`workflows/scripts/respaldo-docker.ps1` y `programar-respaldo.ps1`), avisos opcionales por Telegram (`TELEGRAM_BOT_TOKEN` y `TELEGRAM_CHAT_ID` en `backend/.env`) y herramienta `get_flota` de Snoopy (solo lectura). El modo sin conexión de la app ya cubre las alertas (cola de envío); el despacho no se hace desde el celular.

- **Modo offline en la app** (la app ya tiene `outbox.dart`: extenderlo a revisiones y despachos).
- **Respaldos automáticos**: ya existe `workflows/scripts/backup_sqlserver.ps1`; falta programarlo y verificar restauración.
- **Avisos WhatsApp/Telegram**: requiere cuenta y credenciales del proveedor (decisión del usuario).
- **Snoopy sobre flota**: nuevas herramientas de **solo lectura** (`get_flota`, `get_disponibilidad`), respetando el permiso real del usuario.

## Decisiones que necesito del cuartel antes de empezar

1. Estados oficiales del móvil y qué ítems del checklist bloquean la salida (son filas, las define la institución).
2. Frecuencia de actualización de la posición en el mapa y por cuánto tiempo se guarda el histórico.
3. Proveedor de mapas (el existente en 071) y de mensajería masiva.
4. Qué perfiles pueden despachar y cambiar estados (para sembrar los permisos).


## Fase 6 — Terreno, app movil y operacion continua

**Hecho** (migraciones `084` a `086`):
- App movil (`SIGBO.apk`): flota y despacho, llamados, fichaje por QR, hidrantes y riesgos, convocar, dotacion, personal, vencimientos, horas, reservas, prevencion, indicadores, ausencias y auditoria. Todo con copia local y cola de envio (sin conexion).
- Fotos y firmas desde el celular (`servicios.adjuntos`, archivos privados), con cola de archivos sin conexion; visor en la web (dotacion del movil).
- Personas afectadas por servicio (rescatadas, heridas, fallecidas, evacuadas), en el resumen operativo y en los indicadores.
- Resumen operativo: ahora incluye el personal que respondio a la convocatoria y las personas afectadas.
- Ausencias del personal con aprobacion; una ausencia aprobada marca al bombero como no disponible.
- Aviso por Telegram de vencimientos proximos (30, 15, 7, 3 dias, el dia y vencido), una sola vez por umbral y sin datos medicos.
- Aviso de movil que figura en el cuartel pero el GPS ubica lejos (`GEOCERCA_METROS`, 300 por defecto). Solo avisa; no cambia estados.
- Operacion continua: arranque automatico al iniciar sesion (`programar-arranque.ps1`), copia verificada del respaldo a un disco externo (`-CopiarA`), nombre de la app: SIGBO.

**No se hizo, y por que:**
- Mapa sin internet en la app: descargar en masa los planos de OpenStreetMap esta prohibido por su politica de uso; requiere generar un archivo propio de la zona (decision y datos del cuartel).
- Notificaciones empujadas con la app cerrada (ntfy/UnifiedPush): requiere instalar y mantener un servidor adicional; hoy la app las recibe por su monitoreo continuo.
- Cuotas de socios desde el celular y portal de socios (4.3): tocan dinero y datos de terceros; requieren decision del cuartel.
- Inventario del deposito con QR: pendiente (los equipos ya tienen el campo del codigo QR).
- Boton de panico / hombre caido: necesita calibrar con pruebas reales en celulares; una alarma falsa en una emergencia es peor que no tenerla.
- Radio digital entre celulares y sensores del cuartel: requieren hardware y servidor propio.
- APK de release: bloqueado en esta PC por una politica de Windows (Control de aplicaciones).
- Datos de ejemplo para capacitacion: las reglas del proyecto prohiben introducir datos de ejemplo.
