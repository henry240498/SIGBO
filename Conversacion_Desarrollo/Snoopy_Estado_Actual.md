# Snoopy — Estado actual (documento de continuidad)

**Última actualización:** 2026-09-01, tras la "AUDITORÍA FINAL DE ARQUITECTURA Y PREPARACIÓN PARA PRODUCCIÓN" (solo lectura — no se modificó código; ver `Snoopy_Auditoria_PreProduccion.md` para el detalle completo).

**Regla permanente desde esta etapa**: cada vez que se termine un desarrollo o ajuste de Snoopy, este archivo se actualiza. Es el estado de verdad persistente — no la memoria de una conversación anterior. Al empezar cualquier sesión nueva sobre Snoopy: leer este archivo primero, después el documento de la etapa más reciente en este mismo directorio (`Snoopy_Ollama_Integracion.md`, buscar el último `# ETAPA` o `# AUDITORÍA`), después inspeccionar el código real de lo que se vaya a tocar — nunca asumir que algo está terminado solo porque se menciona acá o en una conversación previa.

---

## 1. Qué es Snoopy

El asistente conversacional de SIGBO-CBVC. Responde preguntas en español sobre los datos reales de la institución (personal, guardias, vehículos, equipos, servicios, academia, depósito, documentos, finanzas, asistencia, organización) usando el permiso REAL del usuario autenticado que pregunta. No es un agente: no ejecuta acciones, no modifica nada, no tiene una tabla de "herramientas de escritura" en absoluto — cada una de sus 13 herramientas es una consulta de solo lectura contra la base real.

## 2. Arquitectura (invariante — no cambia sin una decisión explícita mayor)

```
Usuario autenticado → mensaje en español
  → IaMotorService.procesar() (motor determinístico local, sin red)
    → reconoce intención por patrones/palabras clave en español
    → resuelve contexto de la conversación (sujeto/fecha/guardia previos)
    → elige UNA herramienta de una lista blanca fija (13 herramientas)
    → [opcional] Ollama sugiere cuál herramienta si el patrón no alcanzó
       el umbral — Ollama NUNCA decide autorización ni accede a datos
  → IaToolsService: verifica @RequirePermission del usuario REAL
    → si no tiene permiso: mensaje explícito de "no autorizado", fin
    → si tiene permiso: ejecuta la consulta (TypeORM createQueryBuilder,
      siempre parametrizada, nunca SQL concatenado)
  → [opcional] Ollama reformula el texto de una respuesta YA autorizada
    y YA ejecutada — nunca antes, nunca decide qué se ejecuta
  → respuesta en español (texto, y opcionalmente voz vía Piper)
```

**Lo que esto garantiza, y que ninguna corrección futura debe romper:**
- Ollama es 100% opcional y auxiliar. Con Ollama apagado, inalcanzable, en timeout, o con el módulo deshabilitado por configuración, Snoopy responde exactamente igual (motor determinístico local) — verificado en cada etapa de este proyecto, la más reciente con 147 mensajes reales corridos con Ollama configurado como habilitado pero físicamente inalcanzable, más una prueba explícita con `ollamaHabilitado: false`.
- Ninguna herramienta escribe. No existe un concepto de "tool de escritura" en el registro — un intento de pedir una acción ("cambiale el rango a BC-61", "aprobale la propuesta 3", "rechazalo") se reconoce por patrón ANTES de llegar a `elegirHerramienta()` y se responde con un mensaje explícito de rechazo; aunque el reconocimiento fallara, no hay ninguna herramienta que pudiera ejecutar la acción de todos modos.
- El permiso que se verifica es siempre el del usuario autenticado real (`AuthenticatedUser` del JWT), nunca lo que el usuario *diga* ser ("soy administrador" en el texto del mensaje no tiene ningún efecto — no existe código que lea afirmaciones de identidad del mensaje).
- El frontend no autoriza nada — la lista de permisos en `localStorage` es cosmética, igual que en el resto de SIGBO. El backend es la única autoridad.

## 3. Módulos que Snoopy puede consultar, y con qué permiso

| Herramienta | Módulo | Permiso requerido | Qué responde |
|---|---|---|---|
| `get_institucion` | organización | ninguno (información pública institucional) | nombre, dirección, contacto del cuartel |
| `get_personal` | personal | `personal:ver` | busca/cuenta/lista bomberos por nombre, número, tipo, estado, rango; superlativo de antigüedad |
| `get_guardia_actual` | guardias | `guardias:ver` | guardia de una fecha puntual (relativa o explícita), próxima/siguiente guardia, rol específico (oficial a cargo, chofer), turno |
| `get_guardias` | guardias | `guardias:ver` | listado/conteo de guardias en un rango |
| `get_documentos` | documentos | `documentos:ver` | busca documentos por nombre/tipo |
| `get_servicios` | servicios | `servicios:ver` | cuenta/resume servicios por rango de fechas o tipo real; último servicio |
| `get_vehiculos` | vehículos | `vehiculos:ver` | busca por nombre/código/**alias** (nuevo, migración 075), lista por estado, superlativos de antigüedad/kilometraje |
| `get_equipos` | equipos | `equipos:ver` | busca por código, lista por estado, responsable actual, superlativo de antigüedad |
| `get_asistencia` | operaciones (marcaciones) | `asistencia:ver` | marcaciones de asistencia |
| `get_academia` | academia | `academia:ver` | catálogo de cursos/actividades con filtro real (**ya no incluye "mis cursos"**, ver `get_mis_cursos_academia`) |
| `get_mis_cursos_academia` | academia | `academia:ver_propio` (nuevo, migración 074) | cursos/certificaciones del propio usuario autenticado — nunca acepta un identificador de otra persona, estructuralmente auto-limitado |
| `get_finanzas` | finanzas | `finanzas:ver` | movimientos financieros del mes |
| `get_deposito` | depósito | `deposito:ver` | stock de artículos |

**Trampa de nombres recordatorio** (ya documentada en `CLAUDE.md`, se repite acá porque afecta directamente a Snoopy): el módulo de asistencia usa prefijo de permiso `asistencia:` aunque su esquema SQL es `operaciones` (compartido con guardias). No existe un prefijo `operaciones:` en ningún permiso.

**Falta de simetría real, no un bug**: no hay herramienta de finanzas/depósito que responda "mis X" del mismo modo que `get_mis_cursos_academia` — no se agregó porque no fue pedido; si se pide en el futuro, el patrón a seguir es el mismo (permiso `<modulo>:ver_propio` nuevo + herramienta separada que solo opera sobre `Usuario.bomberoId` del que pregunta, nunca sobre un argumento).

## 4. Qué Snoopy puede hacer

- Responder sobre datos reales de cualquiera de los módulos de arriba, si el usuario tiene el permiso `:ver` correspondiente (o `academia:ver_propio` para sus propios datos de Academia, sin el permiso general del módulo).
- Buscar un vehículo por su alias/apodo real ("¿Qué móvil es Murita?", "¿Dónde está el móvil Murita?", "buscar vehículo Murita") si el vehículo tiene un alias cargado — ver limitación en la sección 5 sobre las formas SIN la palabra "móvil"/"vehículo".
- Mantener el sujeto de una conversación (persona/vehículo/equipo/guardia/fecha) a través de preguntas de seguimiento ("¿y su estado?", "¿quién es el chofer?", "¿y qué turno es?") — ver sección 6.
- Reconocer fechas relativas en español: hoy/mañana/pasado mañana/ayer/anteayer, día de semana ("el lunes", "el próximo lunes", "el lunes pasado"), rango explícito ("entre el 1 y el 15 de agosto"), y "próxima/siguiente guardia" (la más cercana real, no una fecha fija).
- Responder superlativos reales (vehículo más antiguo/con más-menos kilometraje, equipo más antiguo, bombero con más antigüedad) contra columnas reales, con un fallback honesto ("No tengo datos suficientes para determinarlo.") cuando el dato no está cargado.
- Detectar y rechazar explícitamente intentos de escritura, en español formal y en formas coloquiales/voseo ("cambiale", "borralo", "aprobale", "denegale", "asignale", "reasigna", "inscribime", "rechazalo").
- Resistir intentos de prompt injection (ignorar instrucciones, asumir un rol, pedir credenciales/tokens/el prompt de sistema, SQL literal en el mensaje) sin ceder ni filtrar nada — verificado con 17 casos reales en la última etapa.
- Funcionar 100% sin Ollama (motor determinístico local siempre disponible).
- Responder por voz (Etapa 2: whisper.cpp para voz→texto, Piper para texto→voz), sobre el mismo núcleo — nunca una ruta alternativa de autorización.

## 5. Qué Snoopy NO puede hacer (por diseño, no por bug)

- **No ejecuta ninguna acción de escritura.** No existe una sola herramienta con capacidad de `.save()`/`.update()`/`.insert()`/`.delete()` en todo el módulo de IA (verificado por grep en cada etapa). Cualquier pedido de modificación se responde con: *"No puedo modificar, crear ni eliminar registros institucionales -- esa accion debe hacerse desde el modulo correspondiente por un usuario autorizado."*
- **No acepta "soy administrador" ni ninguna afirmación de identidad/permiso escrita en el mensaje.** El único permiso que cuenta es el del JWT.
- **No resuelve un alias de vehículo si el mensaje no menciona "móvil"/"vehículo" en ningún lado** ("¿Qué sabes de Murita?", "¿Cuál es Murita?", "¿Cuál es el estado de Murita?" sin más contexto). El reconocimiento de intención es 100% por patrones estáticos sobre el texto, nunca consulta la base durante la selección de herramienta — y esas mismas frases genéricas ("qué sabes de X", "cuál es X") ya las usa `get_personal` para buscar personas, con prioridad de empate. Cerrar esto de forma segura requeriría que el motor consulte aliases reales ANTES de elegir herramienta (cambio estructural) — documentado como decisión de arquitectura pendiente, no implementado. Las formas que SÍ mencionan "móvil"/"vehículo" ("qué móvil es Murita", "dónde está el móvil Murita", "buscar vehículo Murita") funcionan.
- **Un bombero sin `academia:ver` SÍ puede ver sus propios cursos** (desde la fase de cierre, permiso `academia:ver_propio`) — pero NO los de otra persona, ni el catálogo completo del módulo. Preguntar por un tercero ("¿Qué cursos tiene Juan Pérez?") sigue exigiendo `academia:ver`, verificado explícitamente.
- **No responde preguntas superlativas/agregadas fuera de las 4 implementadas** (vehículo por antigüedad/kilometraje, equipo por antigüedad, personal por antigüedad). Cualquier otra agregación (ej. "¿qué guardia tuvo más servicios?") no está implementada.
- **No mantiene el contexto indefinidamente.** Se corta explícitamente ante: pregunta de identidad/edad sobre la IA misma, mensaje de confusión ("Que", "?", reacciones cortas), mensaje sin sentido/no reconocido, o un cambio de tema claro (mensaje que matchea otra herramienta con patrón propio). Un simple "gracias" en el medio NO corta el contexto (es una excepción explícita, verificada).

## 6. Cómo funciona el contexto conversacional

Cada conversación guarda `ultimo_contexto_json` = `{herramienta, argumentos}` de la última consulta que SÍ se entendió. En el siguiente mensaje:

1. Si el mensaje matchea su propio patrón de herramienta (ej. "guardia de mañana"), se usa esa herramienta con sus propios argumentos — no hereda nada del contexto previo salvo lo que su propia extracción folks.
2. Si el mensaje "suena" a continuación (empieza con "y", "también", "además", o con un posesivo "su/sus" al inicio, o es la forma especial "¿quién es el rol?"/"¿qué turno es?" sobre una guardia recién consultada) Y hay contexto previo, se reusa la MISMA herramienta del contexto, se vuelven a extraer los argumentos del mensaje nuevo, y se **fusionan** sobre los argumentos previos (`fusionarArgumentos()`): los filtros nuevos pisan a los viejos, pero el `query` (sujeto puntual: código/nombre buscado) solo se reemplaza si el mensaje nuevo trae contenido real — así "¿y su estado?" después de "móvil REGA 5" no pierde a REGA 5 solo porque "estado" es la única palabra libre de esa segunda pregunta.
3. Cada herramienta que hace búsqueda libre (personal/vehículos/equipos/servicios) tiene un set de "palabras de atributo" (rango, año, kilometraje, responsable, etc.) que ignora al armar su `query` — así una pregunta sobre un ATRIBUTO del sujeto ya establecido nunca se confunde con una búsqueda nueva vacía.
4. `nuevoContexto: null` corta el hilo explícitamente en: identidad/edad de la IA, confusión, no-entendido. Un cambio de tema real (otra herramienta matcheada por patrón propio) reemplaza el contexto con el nuevo tema, sin mezclar datos del anterior.

## 7. Cómo funciona Ollama

Estrictamente auxiliar, en dos puntos posibles del flujo, nunca obligatorios:
- **Sugerencia de herramienta**: solo si el reconocimiento por patrones no encontró NADA (`elegirHerramienta()` devolvió null) y no es una pregunta de seguimiento. Ollama recibe la lista blanca de nombres de herramienta y debe devolver exactamente uno; además, `tieneRelacionMinima()` exige que el mensaje real toque esa herramienta con al menos una palabra clave o un patrón (aunque no llegue al umbral de 2) — Ollama puede inclinar la balanza sobre un tema que el mensaje YA toca, nunca inventar un tema de la nada.
- **Reformulación de respuesta**: solo sobre una respuesta YA autorizada y YA ejecutada — Ollama nunca ve ni decide qué datos se consultan, solo puede cambiar cómo se redactan.

Configuración: `ConfiguracionIa.ollamaHabilitado` (booleano, on/off explícito desde el panel de administración), modelo `llama3.2:3b`, host `localhost:11434` por defecto. Con el módulo deshabilitado o con Ollama inalcanzable/en timeout, el motor determinístico responde exactamente igual — probado explícitamente en cada etapa.

## 8. Cómo funciona la voz

`voz → WhisperService (whisper.cpp local, HTTP a whisper-server.exe) → texto → el mismo núcleo de arriba (IaMotorService.procesar()) → texto de respuesta → PiperService (piper.exe, archivo temporal real, no stdout) → voz`. `IaVozController` expone `POST /ia/voz/transcribir` y `POST /ia/voz/hablar` (este último verifica que el `mensajeId` pertenezca al usuario antes de sintetizar). No hay ninguna ruta de voz→acción directa — la voz solo reemplaza el canal de entrada/salida de texto, nunca el mecanismo de autorización. Frontend real y funcional (`dashboard/inteligencia/page.tsx`): botón de micrófono (`MediaRecorder`), botón "Escuchar" por mensaje de Snoopy, manejo de error explícito para micrófono denegado/whisper caído/Piper no disponible/transcripción vacía/voz deshabilitada.

**Selección de voz (fase de cierre)**: `PiperService.listarVoces()` escanea la carpeta real de voces (`C:\SIGBO-VozLocal\piper\voces\`) y `GET /ia/admin/config/piper/voces` expone esa lista; el panel de administración usa un combo (`ComboBuscable`) en vez de una ruta de archivo escrita a mano. Voces instaladas hoy: `es_AR-daniela-high` (original) y `es_MX-claude-high` (agregada en la fase de cierre, descargada del repositorio oficial de Piper en Hugging Face y probada con síntesis real). Agregar más voces no requiere código: cualquier `.onnx`+`.onnx.json` de Piper copiado a esa carpeta aparece solo en el combo.

## 9. Historial de correcciones por etapa (resumen — el detalle completo está en `Snoopy_Ollama_Integracion.md`)

1. **Integración Ollama (2026-08-28)**: de motor 100% local a motor local + Ollama opcional, revirtiendo un intento anterior fallido de usar un LLM externo (Anthropic, migración `060`).
2. **Etapa 2 — Voz local**: whisper.cpp + Piper, corrigiendo el bug de WAV corrupto de Piper por escribir a stdout en vez de a un archivo temporal real.
3. **Auditoría de consolidación (2026-08-31)**: 11 hallazgos documentados, sin corregir todavía (etapa de solo verificación).
4. **Corrección post-auditoría (2026-09-01)**: fecha relativa real en guardias (antes siempre devolvía "hoy"), pérdida de sujeto en `fusionarArgumentos`, "¿quién es el rol?" secuestrado por el patrón genérico de personal, familias de lenguaje natural (`DISPARADORES_SOLICITUD`), búsqueda por nombre en vehículos, bloqueo de escritura reestructurado. Superlativos documentados como fuera de alcance en esa etapa.
5. **Estabilización final (2026-09-01)**: referencias temporales hacia atrás ("el lunes pasado") y "próxima guardia"; contexto de guardia extendido a chofer/turno; **superlativos reales implementados** (vehículo, equipo, personal); servicios con tipo real/último/rango explícito; academia "mis cursos" (implementación inicial, luego movida — ver etapa 6); voseo rioplatense en verbos de escritura (aprobale/denegale/reasigna/inscribime); 9 bugs reales encontrados y corregidos por la propia batería de pruebas.
6. **Fase de cierre (2026-09-01, esta etapa)**: autoservicio real de Academia (permiso `academia:ver_propio` + herramienta separada `get_mis_cursos_academia`, estructuralmente auto-limitada); alias de vehículo (columna real, conectado en backend/frontend/Snoopy, probado con datos reales); combo de voces de Piper (antes texto libre) con una segunda voz real agregada y probada; 3 bugs más encontrados y corregidos (colisión de patrones `get_academia`/`get_mis_cursos_academia`, faltaba "buscar vehículo X", faltaban "qué móvil es X"/"dónde está el móvil X"). Diagnóstico exhaustivo de voz confirmó que ya estaba completa — no se tocó ningún archivo de voz.

## 10. Qué NO se debe volver a desarrollar sin que se pida explícitamente

- No agregar ninguna herramienta de escritura. El modelo "solo lectura, backend autoriza" es un requisito explícito y repetido en cada etapa de este proyecto.
- No inventar campos que no existen en el modelo real para "completar" una funcionalidad (alias de vehículo, "grupo" de guardia como algo distinto de `turno`, tipos de servicio que no están cargados). Si el dato no existe, la respuesta correcta es decirlo honestamente, no simular que existe.
- No dejar que el texto del mensaje del usuario influya en qué permiso se verifica. El único permiso válido es el del usuario autenticado real.
- No hacer que Ollama decida autorización ni ejecute nada por su cuenta — solo sugiere (con verificación de relación mínima) o reformula (sobre una respuesta ya ejecutada).
- No tocar los archivos de voz (`whisper.service.ts`, `piper.service.ts`, `ia-voz.service.ts`, `ia-voz.controller.ts`) salvo que una corrección sea estrictamente necesaria — ninguna etapa desde la Etapa 2 los ha necesitado tocar.
- No refactorizar por gusto. Cada etapa de este proyecto se ha limitado estrictamente a lo pedido, verificando primero contra el modelo de datos real antes de escribir cualquier patrón o consulta nueva.

## 11. Pendientes reales (no completados, con razón explícita)

**Encontrados en la auditoría de preproducción (2026-09-01, detalle completo en `Snoopy_Auditoria_PreProduccion.md`), NO corregidos por instrucción explícita de auditar sin tocar código:**

- 🔴 **`'tenemos'` falta en `PALABRAS_VACIAS`**: "¿Cuántos bomberos tenemos?"/"¿Qué vehículos tenemos?" responden con un falso "0 resultados" en vez del dato real. Corrección trivial (una palabra, mismo patrón que "dame"), pendiente de autorización para tocar código.
- 🔴 **Detección de continuidad conversacional por lista fija de arrancadores** ("y"/"también"/"además"/"su"/"sus"): seguimientos naturales sin esos arrancadores ("¿Dónde ocurrió?", "¿Cuántos están activos?" sin "y", "¿Dónde está eso?") cortan el contexto. Estructural — ver propuesta en la auditoría, pendiente de decisión.
- 🟡 "Aprueba esta resolución" no lo bloquea el detector de escritura (falta "resolución" en la lista de sustantivos) — cae en una búsqueda de documentos real en vez de rechazar explícitamente. Seguro (no escribe nada), pero confuso.
- 🟡 "Mes pasado"/"próximo mes" en `get_servicios`, fechas calendario explícitas ("el 25 de diciembre", "31/02/2026") en cualquier herramienta con fecha — no reconocidas; una fecha inválida puede hacer que la respuesta caiga silenciosamente sobre "hoy" sin avisar.
- 🟡 "¿Quién es el comandante?" no resuelve — `get_personal` no tiene filtro estructurado por rango/cargo, solo por tipo de bombero (BC/BI/etc).

**De etapas anteriores, sin cambios:**

- **Búsqueda de alias de vehículo sin la palabra "móvil"/"vehículo"** ("¿Qué sabes de Murita?", "¿Cuál es Murita?"): la auditoría de preproducción propuso una arquitectura concreta de resolución de entidades (catálogo fijo de identificadores + fallback antes de Ollama) — ver `Snoopy_Auditoria_PreProduccion.md`, sección 🧠. Pendiente de aprobación.
- **`get_personal` no tiene una rama de "solo este atributo"** como sí tiene `get_vehiculos` (intent `ANTIGUEDAD`) — un seguimiento tipo "¿cuál es su rango?" preserva correctamente el contexto (responde sobre la persona correcta) pero repite la ficha completa en vez de aislar solo el rango pedido. No pedido explícitamente, no implementado.
- **Prueba manual en navegador real con micrófono**: sigue sin hacerse por un humano — la verificación de código confirma que el flujo completo (`MediaRecorder` → transcribir → chat → hablar) está implementado y con manejo de error correcto, pero nadie grabó audio real todavía en esta serie de sesiones.
- **Superlativos/agregaciones más allá de las 4 implementadas** (ej. "¿qué guardia tuvo más servicios?", cualquier comparación entre módulos distintos): no pedido, no implementado.
- **Autoservicio en otros módulos** (finanzas/depósito "mis X"): no pedido; si se pide, mismo patrón que `get_mis_cursos_academia` (permiso `<modulo>:ver_propio` + herramienta separada auto-limitada a `Usuario.bomberoId`).

## 12. Dónde continuar en la próxima sesión

Hay 2 hallazgos 🔴 y 3 🟡 reales, documentados y NO corregidos (auditoría de solo lectura, instrucción explícita de no tocar código hasta recibir autorización) — ver sección 11 y `Snoopy_Auditoria_PreProduccion.md` para el detalle y la propuesta de arquitectura de resolución de entidades. Antes de escribir cualquier código nuevo sobre Snoopy:

1. Leer este archivo completo.
2. Leer la sección más reciente (el último `# ETAPA`/`# AUDITORÍA`/`# FASE`) de `Conversacion_Desarrollo/Snoopy_Ollama_Integracion.md` para el detalle técnico completo de la última corrección.
3. Verificar contra el código real (`backend/src/modules/ia/`) que lo que este documento describe sigue siendo cierto — este documento puede quedar desactualizado si alguien tocó código sin actualizarlo; el código manda.
4. Si el pedido nuevo es una funcionalidad, verificar el modelo de datos real ANTES de escribir cualquier patrón o consulta (columnas, tablas, permisos existentes) — no asumir, consultar `.context/graph/context.mjs` o leer la entidad directamente.
5. Al terminar, actualizar ESTE archivo (sección 9 con la etapa nueva, sección 11 si algún pendiente se resolvió o si aparece uno nuevo) — es la regla permanente desde 2026-09-01.
