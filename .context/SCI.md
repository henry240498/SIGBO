# SCI — Sistema de Comando de Incidentes: estado, brechas y cómo continuar

Pendiente de Jonás para Henry2026-10-12: solicitar el Reglamento General original
vigente para continuar la integraciónGRE/SCI y fotos vinculadas a servicios.
El usuario confirmó que no dispone de él aquí. Mostrar la consulta al retomar con Henry:
[registro y mensaje](PENDIENTES_PARA_HENRY.md). Sin envío externo ni respuesta confirmada.

Documento de traspaso para el agente que continúe el trabajo de SCI y gestión profesional de
incidentes en SIGBO. Escrito el 2026-10-11 a partir de un relevamiento del código (verificado
con `grep` en los puntos críticos) y de toda la documentación del repositorio. **El código es la
fuente de verdad**: antes de basar un cambio en este documento, verificá el archivo.

Pedido del usuario que origina este trabajo (2026-10-11): *"analiza el SCI y todo lo relacionado
con él y dame todo lo que falta agregar para que esto realmente sea un completo de gestión
profesional por incidente y de varios incidentes si lo amerita"*. Todavía **no se implementó
nada** de lo que lista este documento: es el análisis. El usuario no eligió aún por dónde
empezar (se le ofreció: P0 primero, o un diseño completo del SCI para revisar con el comando).

---

## 1. Lectura obligatoria antes de tocar nada

En este orden:

1. `AGENTS.md` (reglas permanentes; Reglamento General del CBVC antes de tocar flujos de
   Servicios/Guardias/Vehículos), `CLAUDE.md` (reglas que no hay que romper), `.context/contexto.md`,
   `.context/reglas.md`.
2. **Obligatorio para GRE/MATPEL/SCI:** `.context/gre2024/index.md` y
   `.context/gre2024/agent-instructions.md` (fuente original GRE, citar página PDF, no inventar,
   actualizar `validation-report.md` y `open-issues.md` al terminar).
3. `.context/INCIDENTES.md` (estado de ejecución del plan de incidentes y decisiones DEC-1..DEC-5).
4. `docs/superpowers/specs/2026-10-06-centro-operaciones-incidentes-design.md` (diseño aprobado del
   corte 1; §10–§12 listan lo que quedó fuera, incluido el SCI) y
   `docs/superpowers/plans/2026-10-07-centro-operaciones-incidentes.md` (tareas 0–2 hechas, 3–7 no).
5. `.context/DESPACHO.md`, `.context/MATPEL.md`, `docs/matpel/REQUISITOS_ORIGINALES.md`
   (§18–24, §46–51, §66–69: integración MATPEL↔SCI), `docs/matpel/PLAN_POR_FASES.md` (Fase 6),
   `docs/matpel/FASE_2_ARQUITECTURA.md`, `FASE_2_CONTRATOS.md`, `FASE_2_EXPERIENCIA.md`,
   `FASE_2_MATRIZ_GRE.md`.
6. `loquefaltadefinirBien.md` §4 (Guardias) y §5 (Servicios y emergencias).
7. `docs/CENTRO-DE-MANDO.md` (el "Centro de mando" de 2026-10-09 **no es** un comando SCI: es un
   panel institucional; ver §6.9) y `docs/PENDIENTES-APP-MOVIL.md`.

Índice semántico: `node .context/graph/context.mjs servicio despacho incidente --level L2`.

---

## 2. Restricciones que acotan todo el trabajo SCI

- **No automatizar decisiones de autoridades** ni introducir datos de ejemplo (`AGENTS.md`). El
  sistema registra, presenta y alerta; **el mando decide**. Nada de órdenes automáticas.
- **GRE es información, no orden** (REQ §20): distinguir visualmente "INFORMACIÓN GRE" de
  "DECISIÓN DEL SCI"; checklists solo si cada ítem se rastrea a la GRE (fuente, guía, sección,
  página); si la GRE no lo dice, no inventarlo; no deducir mezclas ni idoneidad de recursos.
- **No duplicar:** "el incidente es el servicio" (`servicios.servicios`); sin tabla `incidentes`
  paralela, sin módulo SCI paralelo, sin cronología paralela. Extender el núcleo 093.
- **Reglamento original no disponible** (open-issue GRE24-ISSUE-SCI, P0): bloquea cambiar flujos
  de **mando y elegibilidad** hasta tenerlo. Consulta y catálogos pueden avanzar sin imponer
  autoridad nueva. Si el reglamento es ambiguo: registrar la duda y pedir validación institucional.
- **Lo que decide la institución es una fila, no una constante** (CLAUDE.md): tiempos de PAR,
  umbrales, requisitos de mando, catálogos de puestos/canales/instituciones → tablas o
  `organizacion.parametros`.
- **Solo open source y autoalojado** (memoria del usuario): nada que exija contratar un servicio
  (p. ej. clima: Open-Meteo es libre y autoalojable; mapas: teselas institucionales vía
  `SIGBO_MAP_TILES_URL`, sin terceros por defecto).
- **Actualización2026-10-12:** migraciones094/095 instaladas en el Docker local de
  desarrollo como parte directa del pedido de completarGRE, con respaldo verificado
  e historial. Ver `.context/gre2024/evidencia/instalacion-local-20261012.json`.
  No extrapolar esa instalación a producción ni activar catálogo por pruebas.
  El trabajador periódico permanece apagado; procesamiento de un candidato solicitado
  explícitamente mediante API. Los flujos de mando siguen pendientes del Reglamento original.
- **Confidencialidad:** dirección/coordenadas/víctimas/fotos de víctimas con permiso
  `despacho:confidencial` o la acción "confidencial" de la matriz por pantalla; cada acceso se
  audita (`ACCESO_CONFIDENCIAL`).
- **Principios del pedido de incidentes** (diseño §1): "si SIGBO puede saber un dato no lo pide";
  "una acción = un evento"; prioridad SEGURIDAD → VELOCIDAD → OPERATIVIDAD → TRAZABILIDAD →
  INFORMACIÓN → ADMINISTRACIÓN; ningún botón que no funcione.

---

## 3. Diagnóstico en una línea

SIGBO **registra y despacha bien, pero no comanda**. El "núcleo de incidentes" (migración 093)
está construido y **desconectado**; el SCI (mando, puestos, PAI, instalaciones, check-in,
desmovilización) **no existe**; MATPEL **no está vinculado** a ningún incidente.

Tres capas conviven sin integrarse:

1. **Parte de servicio** (formulario largo, `/dashboard/servicios/nuevo`, `servicios.controller.ts`,
   ruta `/servicios/comunicaciones`): el flujo más completo y real.
2. **Despacho operativo + servicio activo** (migraciones 088/090, módulo `despacho`): operativo.
3. **Núcleo de incidentes** (093, `backend/src/modules/incidente-nucleo/`): tablas + lógica pura +
   specs; **ningún módulo lo importa**.

---

## 4. Defectos verificados: parecen implementados y no lo están

Verificados con `grep` el 2026-10-11:

| Defecto | Evidencia |
|---|---|
| `IncidenteNucleoModule` no se importa en ningún módulo | 0 resultados fuera de `modules/incidente-nucleo/` |
| `servicios.gravedad` nunca se escribe (Centro de mando la muestra vacía) | solo lecturas (`servicio-activo.service.ts:97`, `informe-intervencion.pdf.ts`, indicadores) |
| `jefe_servicio_id` y `oficial_ro_id` sin uso | 0 resultados de `jefeServicioId`/`oficialRoId` fuera de la entidad |
| `servicios:comandar` / `servicios:operar` sembrados, ningún controlador los exige | 0 resultados en `*.controller.ts` |
| `fase_operativa` queda en `RECIBIDO` aunque el servicio pase a `EN_CURSO` | `flota` y `servicios` no llaman al motor de fases |
| `personal_servicio` nunca se inserta (solo lecturas) | relevamiento |
| `incidente_solicitudes`, `tripulacion_movil`, eventos `COMANDO_ASUMIDO`, `PERSONAL_ENTRA/SALE_ZONA`, `RECUENTO_PERSONAL`: solo esquema y lógica | relevamiento |
| El comandante es texto libre del parte (`comunicaciones_servicio.datos`), obligatorio para finalizar pero sin efecto sobre mando ni permisos | `servicios/nuevo/page.tsx`, `validarFinalizacion` |
| `servicio_participantes.rol` siempre `null` al unirse | `ServicioActivoService.unirme` |
| Un llamado no crea el servicio (solo `vincularServicio` a uno existente) | `llamados` |
| El despacho real pone `horaDespacho = horaSalida`: "asignado pero no salió" (093) sin flujo | `flota.service.ts` |
| La web no usa SSE (no hay `EventSource` en `frontend/src`); solo la app | relevamiento |
| `conclusiones` / `recomendaciones` de `servicios` nunca se completan | relevamiento |

---

## 5. Inventario de lo que existe (para reutilizar, no duplicar)

### 5.1 Modelo de datos (esquema `servicios` salvo indicación)
- **`servicios`** (007 + 093): tipo (`tipos_servicio`, con `prioridad` int, `requiere_ro`,
  `requiere_vehiculo`), número `CS-AAAA-NNNNN` (`servicios.service.ts::siguienteNumero`), horas
  aviso/salida/llegada/fin, dirección/ciudad/lat/lon, descripción, informe, conclusiones,
  recomendaciones, fotos/documentos JSON, `gravedad` (LEVE/MODERADA/GRAVE/CRITICA, sin escritor),
  `vehiculo_principal_id`, `oficial_ro_id`, `jefe_servicio_id`, km, combustible.
  - `estado` (en uso): REGISTRADO → DESPACHADO (`flota.despachar`) → EN_CURSO (`flota.avanzar('llegada')`)
    → FINALIZADO (`servicios.finalizar`) | CANCELADO (`anular`). "Activo" = REGISTRADO, DESPACHADO,
    EN_CURSO (`servicio-activo.logica.ts::ESTADOS_ACTIVOS`).
  - 093 agregó `fase_operativa` (RECIBIDO, EVALUACION, DESPACHADO, EN_CAMINO, EN_LUGAR, OPERANDO,
    CONTROLADO, RETORNO, DISPONIBLE, CERRADO), `fase_desde`, `resultado` (CONTROLADO, RESUELTO,
    FALSA_ALARMA, CANCELADO, DERIVADO, NO_ATENDIDO, SIN_ACCESO, SIN_INTERVENCION).
- **Núcleo 093** (`incidente-nucleo/incidente.logica.ts`, `motor-fases.service.ts`,
  `cronologia.service.ts`, `politicas.ts`, `contexto.ts`): fases automáticas solo avanzan;
  manuales con permiso (EVALUACION `servicios:despachar`; OPERANDO/CONTROLADO/REACTIVADO
  `servicios:comandar`); `validarCierre` impide cerrar con móviles afuera o personal `en_zona=1`;
  `estadoDesdeFase`; `condicionesActivas`; `emergenciaActiva`; políticas `POLITICA_INCIDENTE`
  (`MARCAR_NO_ASIGNADO`/`SOLO_ASIGNADOS`, horas `MAS_CERCANA`/`HORA_INICIADA`/`HORAS_COMPLETAS`).
- **`incidente_eventos`** (093): bitácora única **inmutable** (trigger INSTEAD OF UPDATE/DELETE,
  error 51093), con hora del hecho y de registro, usuario, vehículo, despacho, lat/lon/precisión,
  fase anterior/nueva, fuente, `datos` JSON, `critico`, origen WEB/APP/SISTEMA, idempotencia
  SHA-256. Tipos (CHECK): SERVICIO_RECIBIDO, LLAMADO_VINCULADO, FASE_CAMBIADA, PRIORIDAD_CAMBIADA,
  MOVIL_DESPACHADO/SALIO/LLEGO/RETORNA/DISPONIBLE, DESPACHO_CANCELADO, TRIPULACION_AJUSTADA,
  PERSONAL_SUMADO, COMANDO_ASUMIDO, SITUACION_MARCADA/RESUELTA, RECURSO_SOLICITADO/ACTUALIZADO,
  VICTIMA_REGISTRADA, FOTO_TOMADA, MENSAJE, COMUNICACION, EMERGENCIA, EMERGENCIA_ATENDIDA,
  RESULTADO_DECLARADO, INCIDENTE_CERRADO, PERSONAL_ENTRA_ZONA, PERSONAL_SALE_ZONA,
  RECUENTO_PERSONAL. **Agregar tipos SCI = nueva migración que amplía el CHECK.**
- **`condiciones_situacion`** (093, 22 filas, grupos SITUACION y RIESGO, `critica`,
  `grupo_excluyente`): incluye material peligroso, explosión, químico, biológico, EPP obligatorio.
- **`tipos_recurso`** (093): AUTOBOMBA, RESCATE, CISTERNA, AMBULANCIA, PERSONAL, HERRAMIENTAS,
  ESPUMA, AGUA, POLICIA, HOSPITAL, OTRA_COMPANIA, OTRO (categorías MOVIL, PERSONAL, INSUMO, EXTERNO, OTRO).
- **`incidente_solicitudes`** (093, "ciclo SCI"): SOLICITADO → APROBADO → DESPACHADO → EN_CAMINO →
  EN_USO → LIBERADO, salidas RECHAZADO/CANCELADO; versión optimista; idempotencia. Sin endpoint.
- **`despachos`** (077/081/093): un móvil por servicio; DESPACHADO → EN_SERVICIO → REGRESANDO →
  CERRADO | CANCELADO; un despacho activo por móvil (índice único); cada paso escribe
  `historial_servicios`, `vehiculos.estado_operativo` y `vehiculos.movil_estado_historial`.
- **`historial_servicios`** (007/071): línea geográfica (SALIDA_CUARTEL, LLEGADA_SERVICIO,
  LLEGADA/SALIDA_CENTRO_SALUD, GPS, PUNTO_CONTROL, …). **`rutas_planificadas`** (ruta del RO).
  **`pruebas_comunicacion`** (radio, nivel 1–5, distancia).
- **Personal en el incidente:** `servicio_participantes` (090; EN_CAMINO/EN_SITIO/RETIRADO, `rol`
  libre) y `personal_servicio` (007+093: `funcion` del parámetro `FUNCION_INCIDENTE`, `vehiculo_id`,
  `despacho_id`, `origen`, `en_zona`, `zona_desde`, `minutos_servicio`). Funciones semilla:
  COMANDANTE, JEFE_DOTACION, CONDUCTOR, BOMBERO, RESCATISTA, PARAMEDICO, OPERADOR, SEGURIDAD,
  COMUNICACIONES, LOGISTICA (son funciones a bordo, **no** puestos de un organigrama SCI).
  `vehiculos.tripulacion_movil` (093) sin uso.
- **Despacho operativo** (088): `disponibilidad_personal` (NO_DISPONIBLE, AL_LLAMADO, EN_BASE,
  EN_CAMINO, EN_SERVICIO), horarios/excepciones, `solicitudes_despacho` (CHOFER/PERSONAL/RAPIDA),
  destinatarios con ejes entrega y estado (`despacho.logica.ts::TRANSICIONES`),
  `solicitud_eventos` inmutable, ampliación (AL_LLAMADO temporal 4 h, `DESPACHO_TEMPORAL_HORAS`).
- **Convocatorias** (079/089) VOY/NO_PUEDO con ETA. **Alertas** (076) SOLICITUD_APOYO/CHOFER con
  SSE `/alertas/stream` y Telegram. **Llamados** (079) RECIBIDO/EN_ATENCION/CERRADO.
- **Campo** (086/093): `adjuntos` (FOTO/FIRMA con categoría DANO, VICTIMA, RIESGO, …),
  `victimas_servicio` (**solo conteos** RESCATADA/HERIDA/FALLECIDA/EVACUADA).
- **Formularios versionados** (090): `formulario_definiciones` (campos JSON, confidenciales,
  filtros por tipo/rol/permiso/etapa EN_CURSO|CIERRE), respuestas, historial inmutable. Candidato
  natural para checklists por tipo de incidente.
- **Chat** `servicio_mensajes` (inmutable, 500 car.). **Cartografía** (080): `hidrantes`,
  `puntos_riesgo`, `preplanes` versionados, `GET /cartografia/cercanos`. `vehiculos.posicion_actual`,
  `vehiculos.dotacion_movil`.

### 5.2 Pantallas y APIs existentes
- Web: `/dashboard/servicios` (parte + PDF `GET /servicios/comunicaciones/:id/exportar/pdf`),
  `/dashboard/servicios/despacho` (+ "Mapa y estado del servicio"), `llamados`, `convocatorias`,
  `cartografia`, `indicadores`, `prevencion`; `/dashboard/vehiculos/flota`; seguimiento geográfico
  (`SeguimientoGeografico.tsx`, `/servicios/:id/seguimiento`); `/dashboard/centro-mando`;
  `/dashboard/matpel` (consulta documental). **No existen** `/dashboard/servicios/operaciones`,
  `/dashboard/servicios/operaciones/[id]`, `.../informe`, `/dashboard/vehiculos/tripulacion` ni
  `/incidente/[id]` (diseñadas en el corte 1).
- Informe operativo PDF: `GET /flota/informe/:servicioId/pdf` (`flota/informe.service.ts`).
- Indicadores: `GET /indicadores/operativos` y `/calor` (tiempos de salida, respuesta, viaje).
- SSE: `/despacho/stream` (tipos solicitud_*, ampliacion, disponibilidad, servicio_actualizado,
  mensaje, formulario) y `/alertas/stream`; en memoria, una sola instancia.
- App (`.movile/lib`): `despacho_movil.dart`, `servicio_activo.dart` (unirse, EN SITIO/RETIRADO,
  chat, formularios, mapa; **sin cola offline**), `operacion.dart`/`PantallaFlota` (con
  `Offline.ejecutar`), `terreno.dart` (fotos, firmas, víctimas con cola), `matpel.dart` (documental).

### 5.3 MATPEL/GRE hoy
- Cableado: consulta documental (`gre` + `matpel-consulta.controller.ts`, motor
  `motor-matpel.service.ts`, geometría `matpel-geometria.ts`), administración del catálogo
  (`gre-admin.controller.ts`). Permisos `matpel:consultar|administrar_gre|validar_gre|activar_gre`.
  Catálogo candidato con `aptoActivacion = false`.
- **Vínculo con el incidente: ninguno.** Lo único es texto libre en el parte (`matpelOnu`,
  `matpelDescripcion`, casilla MAT-PEL). Arquitectura propuesta: `MatpelModule` sobre el mismo
  Servicio y la cronología del núcleo, `MatpelContexto` (uno por servicio), `MatpelEvaluacion`
  (snapshot), decisión inmutable con responsable acreditado; endpoints API10–15
  (`GET /servicios/:id/matpel/panel`, `GET|POST /servicios/:id/matpel/decisiones`); acceso C/V/R/D
  (Decidir exige `servicios:comandar` + autoridad de mando acreditada). Fase 6 bloqueada por el
  Reglamento.

### 5.4 Permisos relevantes
`servicios:ver|crear|editar|eliminar|finalizar|despachar|convocar|exportar_informe|ver_gps|operar|comandar`,
`despacho:responder|solicitar|seguimiento|servicio|confidencial|formularios_admin`,
`vehiculos:ver|ver_mapa|posicion|estado|dotacion|tripulacion`, `adjuntos:ver|subir`, `matpel:*`.
Matriz por pantalla: `seguridad.pantallas` / `pantalla_permisos` (USUARIO/ROL/RANGO/CARGO;
códigos 0xA móvil, 0xB web, 0xC Centro de mando/Sistema).

---

## 6. Brechas contra un SCI profesional, por prioridad

Referencia SCI: curso SCI USAID/BHA (principios: terminología común, alcance de control 3–7
—óptimo 5—, organización modular, unidad de mando, comando unificado, PAI, instalaciones
designadas, manejo integral de recursos, comunicaciones integradas, control de personal). Los
números de formulario (SCI-201…221) son los de ese curso; **la institución define cuáles adopta y
con qué numeración**.

### P0 — Conectar lo que ya existe (sin esto no hay base)
1. Ejecutar las **tareas 3–7 del plan 2026-10-07**: conectar el núcleo a `flota` y `servicios`
   (cada acción escribe `incidente_eventos`; fase y estado coherentes), tripulación, flota, campo,
   módulo `incidentes`, pantallas de operaciones y `/incidente/[id]`. Revisar el plan contra el
   código actual antes (cambió mucho desde el 07-10: matriz por pantalla, estados del bombero,
   Centro de mando).
2. **Mando real:** "Asumir comando" (`POST …/:id/comando`, exige `servicios:comandar`) escribe
   `jefe_servicio_id` y emite `COMANDO_ASUMIDO`. El comandante del parte se **precarga** desde ahí.
3. **Gravedad y prioridad** asignables y reclasificables con evento `PRIORIDAD_CAMBIADA` (hoy nadie
   escribe `gravedad`).
4. **Llamado → servicio** en un paso (hoy solo se vincula a uno existente).
5. **Parte oficial generado desde el incidente** (decisión D6 del diseño): eliminar la doble carga
   formulario largo vs incidente.
6. **Conseguir el Reglamento original** (institucional, bloqueante para mando/elegibilidad).

### P1 — SCI básico por incidente (lo que necesita incluso un incidente chico)
1. **Mando:** transferencia formal (quién entrega, quién recibe, hora, briefing/SCI-201 adjunto),
   historial de comandantes, requisitos para ser comandante por rango/cargo/capacitación como
   **filas configurables** (decisión institucional).
2. **SCI-201 digital (resumen del incidente):** situación, croquis/mapa, objetivos iniciales,
   acciones, organigrama, recursos; precargado desde la bitácora.
3. **Instalaciones en el mapa:** Puesto de Comando (PC), Área de Espera (E), Área de Concentración
   de Víctimas (ACV), Base; perímetro; zonas caliente/tibia/fría. **Las dibuja el comandante**; el
   sistema no las calcula (para MATPEL, distancias GRE solo como referencia citada).
4. **Organización modular:** organigrama del incidente con puestos activables a demanda — staff de
   comando (Seguridad, Enlace, Información Pública) y staff general (Operaciones, Planificación,
   Logística, Administración/Finanzas), divisiones (geográficas) / grupos (funcionales),
   fuerzas de tarea / equipos de intervención / recursos simples; **aviso de alcance de control**
   cuando un puesto tiene más de 7 a cargo (umbral configurable). Catálogo de puestos = tabla.
5. **Registro y control de recursos (SCI-211):** check-in de cada móvil/persona/recurso externo al
   llegar; estado dentro del incidente Disponible / Asignado / No disponible; asignación a
   división/grupo; Área de Espera con su encargado.
6. **Control de personal (PAR):** el núcleo ya lo diseña (`en_zona`, ENTRA/SALE, RECUENTO, cierre
   bloqueado con personal en zona — D9). Falta endpoint, pantalla, **temporizador de recuento
   configurable**, alerta "persona sin reportar" y señal de evacuación/abandono. EMERGENCIA
   (MAYDAY) ya existe como evento.
7. **Objetivos (SCI-202) y asignaciones tácticas (SCI-204)** por período operacional.
8. **Seguridad:** puesto de Oficial de Seguridad, análisis de riesgos (SCI-215A, sobre
   `condiciones_situacion` grupo RIESGO), EPP requerido; el Oficial de Seguridad puede detener una
   operación insegura (registro, no automatismo).
9. **Plan de comunicaciones (SCI-205):** canales/frecuencias por función desde un catálogo de la
   institución; radio operador (pedido en `loquefaltadefinirBien.md` §4–5).
10. **Víctimas (SCI-207 / ACV):** registro individual con triage (p. ej. START por colores; el
    método lo define la institución), destino hospitalario estructurado (catálogo de centros de
    salud), quién traslada; datos sensibles con acción "confidencial" y auditoría. Hoy solo conteos.
11. **Instituciones externas y Oficial de Enlace:** catálogo (policía, ambulancias/SEME, ANDE,
    ESSAP, Fiscalía, otros cuerpos), responsable presente, recursos que aportan. Hoy solo texto
    en el parte y `tipos_recurso` EXTERNO sin uso.
12. **Información pública:** comunicados aprobados por el comandante (nunca automáticos).
13. **Desmovilización (SCI-221):** check-out por recurso, estado del personal y del equipo,
    consumo de materiales **descontado del depósito** (hoy litros de agua/espuma/PQS son texto en
    el parte), tiempos.
14. **Cierre profesional:** informe final con revisión y aprobación (pedido en
    `loquefaltadefinirBien.md`: "informe correlativo… con revisión y aprobación"; "registrar
    modificaciones posteriores"), PDF de servidor, revisión posterior (AAR) y lecciones
    aprendidas (`conclusiones`/`recomendaciones` ya existen sin escritor).
15. **SCI-214 (registro de actividades por unidad):** derivable de `incidente_eventos` filtrando
    por persona/unidad; no requiere tabla nueva.

### P2 — Profesionalización
- **PAI escrito** cuando el incidente supera un período operacional o es multiinstitucional:
  ciclo de planificación ("P"), reunión de planificación, PAI exportable. **Plantillas/checklists
  por tipo de incidente** sobre `formulario_definiciones` (las de MATPEL solo si cada ítem cita la GRE).
- **Logística:** pedidos de recursos con aprobación del comandante (activar
  `incidente_solicitudes`), alimentación/rehidratación, **rotación y descanso por horas en escena**
  (hoy `control-personal/horas-servicio.service.ts` mide por guardia, no por incidente).
- **Administración/Finanzas:** costos por incidente (horas-persona, combustible, km, consumibles,
  externos), vínculo con `finanzas`; daños y reclamos.
- **Mapa operacional común (COP):** incidente, PC/zonas, móviles y personal en vivo, hidrantes y
  puntos de riesgo cercanos (integrar `GET /cartografia/cercanos` al incidente), preplan del
  punto de riesgo, **viento/meteorología** (proveedor autoalojado; documentar que no sale de la GRE).
- **Tiempo real en la web** (SSE en el tablero; hoy solo sondeo).
- **MATPEL en el incidente** (Fase 6 del plan MATPEL): panel GRE dentro del servicio, contexto
  MATPEL (material desconocido, múltiples materiales, calidad del dato CONFIRMADO/ESTIMADO/NO
  CONFIRMADO/DESCONOCIDO), registro de decisiones del SCI con fuente. Requiere Reglamento,
  094/095 y aceptación del catálogo.
- **Modo Incidente en la app Flutter con cola sin conexión** (primer corte del "orden recomendado"
  §12 del diseño). Ver `docs/PENDIENTES-APP-MOVIL.md`.

### P3 — Varios incidentes (cuando lo amerite)
Criterio: dos o más incidentes compitiendo por los mismos recursos, o un evento mayor (tormenta,
inundación) con muchos incidentes chicos. El criterio de activación lo fija la institución.
- **Tablero de incidentes simultáneos** ordenado por prioridad (vida → bienes → ambiente), con
  recursos comprometidos por incidente y **reserva mínima en cuartel** con alerta (umbral = fila).
  Hoy el Centro de mando lista por fecha de aviso, sin prioridad (`take: 100`).
- **Reasignación de recursos entre incidentes** con decisión registrada de quien comanda (nunca
  automática). Hoy no existe.
- **Comando de Área:** agrupa incidentes, su comandante, prioridades y recursos críticos.
- **Comando Unificado:** varias instituciones con jurisdicción en un mismo incidente, objetivos
  comunes, un solo PAI.
- **Ayuda mutua** entre cuarteles/compañías: pedido y recepción de recursos de otros cuerpos con
  su check-in. Hoy nada ("ayuda mutua"/"apoyo mutuo" sin resultados en el código).
- **Eventos planificados** (concentraciones, desfiles) con PAI previo; estadísticas consolidadas
  por evento mayor.

---

## 7. Decisiones institucionales pendientes (no las toma el sistema ni el agente)

- Reglamento de mando: quién puede ser comandante, cómo se transfiere, vigencia (GRE24-ISSUE-SCI P0).
- Formularios SCI oficiales y su numeración; cuándo es obligatorio el PAI escrito.
- Catálogos: puestos SCI, canales de radio, instituciones externas, centros de salud, método de triage.
- Tiempos: intervalo de PAR, umbral de alcance de control, reserva mínima en cuartel, descanso.
- Criterios de activación de Comando de Área / Unificado; integración con SEN y 911.
- Quién aprueba comunicados públicos; qué datos de víctimas se registran y quién los ve.
- Del plan anterior: confirmar el orden de cortes del diseño §12 (1 app Modo Incidente, 2
  comunicación desde el incidente, **3 SCI completo**, 4 voz, 5 estadísticas, 6 catálogos/E2E);
  revisión institucional de las 10 condiciones críticas (DEC-1); verificación de licencia del
  chofer (DESPACHO §7); prueba UX05 con cinco operadores (MATPEL).

---

## 8. Cómo continuar (proceso recomendado)

1. **Confirmar con el usuario** por dónde empezar: P0 (terminar el plan 2026-10-07) o un diseño
   completo del SCI para revisar con el comando. Recomendación dada: P0 primero (cualquier SCI
   quedaría colgado de datos que no se llenan), Reglamento en paralelo, luego P1 en cortes, P2,
   y P3 solo si el cuartel lo necesita.
2. Trabajo nuevo de esta escala: diseño escrito (`docs/superpowers/specs/AAAA-MM-DD-*-design.md`)
   aprobado por el usuario → plan (`docs/superpowers/plans/`) → ejecución por tareas con revisión.
   El usuario eligió en trabajos anteriores ejecución "por subagentes" y "directo en main".
3. Reglas técnicas del repo que aplican a cada cambio:
   - Migración nueva = **siguiente número libre (hoy 098)**, registrarla en
     `database/run-migrations.ps1` y `database/migrations.sha256`; una migración aplicada no se
     edita; entidad y migración en el mismo cambio (`synchronize: false`).
   - Permiso nuevo = usarlo con `@RequirePermission` (+ `JwtAuthGuard`, `PermissionsGuard`) **y**
     sembrarlo en `seguridad.permisos` (migración).
   - Pantalla nueva = agregarla al `TABS` del `layout.tsx` del módulo y correr
     `cd frontend; npm run generar:pantallas` (catálogo web + backend; entra a la matriz por
     pantalla; CI corre `verificar:pantallas`). Las llamadas de `src/lib` se atribuyen por función
     importada. Ocultar botones con `usePuede`/`puede()` (el servidor igual autoriza).
   - Pantallas `'use client'`, `useState`/`useEffect`, `cargar()` tras cada mutación, `apiFetch`
     con ruta relativa, `<Aviso>`, `<Cargando>`, `<ComboBuscable>`, `usePaginacion`; colores solo
     con `var(--…)`; etiquetas asociadas; `useActualizacionPeriodica` para datos en vivo (su
     `cargar` debe lanzar si falla).
   - Ninguna entidad usa relaciones TypeORM: joins explícitos.
4. Verificación: `cd backend; npm test` (al 2026-10-12 en `6c234b3`: 664 aprobadas, 9 omitidas,
   0 fallas — las 2 históricas de `despacho.spec.ts` quedaron corregidas);
   `cd frontend; npm test` (66/66); `npx tsc --noEmit; npm run audit:contraste; npm run audit:a11y;
   npm run verificar:pantallas` (135 pantallas, 129 en la matriz); `node scripts/verificar-endpoints.mjs`
   (12 sin ruta, previas).

---

## 9. Entorno local (para probar contra el sistema real)

- Arranque: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File iniciar-sigbo.ps1 -Rebuild -NoBrowser -NoPause`
  (libera los puertos, compila y levanta: SQL Server en Docker `sigbo-sqlserver` 127.0.0.1:14330,
  Ollama, backend **3001**, frontend `next start` **3002**). Tarda varios minutos; mirar `logs/`.
- Login por API: `POST /api/v1/auth/login` con `{usernameOrEmail, password}` y encabezados
  `Origin: http://localhost:3002` y `X-SIGBO-Request: 1` (las mutaciones también). Usuario `admin`;
  su clave es `SIGBO_DEMO_PASSWORD` de `backend/.env` — **leerla desde un script, nunca
  imprimirla**. Usuarios por rol en `docs/CREDENCIALES-Y-ROLES.md` (p. ej. `bombero`).
  El limitador de login da 429 tras ~10 inicios seguidos: iniciar sesión una vez y reutilizarla.
- Base local: migraciones hasta 097 aplicadas **salvo 094/095**; la 093 está aplicada (Sistema ›
  Migraciones solo lista 094 y 095 como pendientes, 2026-10-10). `personal.bomberos` está vacía
  (los usuarios no tienen ficha de bombero; el acceso al Centro de mando lo deciden sus roles).
- **Trabajo en paralelo:** otra sesión trabaja en este repo (GRE2024, `.context/graph/**`,
  `.context/gre2024/`, `AGENTS.md`, líneas GRE de `CLAUDE.md` y `.context/contexto.md`, campos GRE
  de `.context/proyecto.json`, `scripts/matpel/`, `despacho.spec.ts`). Commitear **solo por ruta
  explícita**; nunca `git add -A`/`.`/`commit -a`; para archivos compartidos, commit parcial con
  `git apply --cached`. No hacer push sin pedido del usuario.
- Seguridad de herramientas: no correr HawkScan (servicio externo; el proyecto exige libre y
  autoalojado). Telegram no está configurado en local.

---

## 10. Archivos clave

- Núcleo: `backend/src/modules/incidente-nucleo/` · entidades `backend/src/shared/entities/incidente.entity.ts`,
  `servicio.entity.ts`, `despacho.entity.ts`, `despacho-operativo.entity.ts` ·
  migración `database/migrations/093_centro_operaciones_incidentes.sql`.
- Flujos vivos: `backend/src/modules/servicios/` (parte, `validarFinalizacion`, PDF),
  `backend/src/modules/flota/` (despacho de móviles, informe PDF, disponibilidad),
  `backend/src/modules/despacho/` (`despacho.service.ts`, `servicio-activo.service.ts`, SSE),
  `backend/src/modules/llamados/`, `backend/src/modules/cartografia/`,
  `backend/src/modules/centro-mando/`, `backend/src/modules/gre/` (consulta MATPEL).
- Web: `frontend/src/app/dashboard/servicios/**`, `frontend/src/app/dashboard/vehiculos/flota`,
  `frontend/src/app/dashboard/centro-mando`, `frontend/src/app/dashboard/matpel`.
- App: `.movile/lib/servicio_activo.dart`, `despacho_movil.dart`, `operacion.dart`, `terreno.dart`,
  `offline.dart`, `outbox.dart`, `matpel.dart`.
- Documentos: ver §1.
