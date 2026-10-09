# Centro de mando, matriz de pantallas en toda la web y área Sistema

Fecha: 2026-10-09 · Estado: **diseño aprobado en conversación; especificación en revisión**

Pedido original: integrar el frontend y las funcionalidades dispersas o solo accesibles por
terminal en un panel en vivo, con acceso a módulos, pantallas, agentes, servicios, tareas,
configuración, registros y herramientas; datos reales, actualización automática, controles
operativos, manejo de errores y permisos; sin simulaciones ni botones inoperantes.

## 1. Objetivo

1. **Centro de mando** para todo el personal habilitado: lo primero que cada uno necesita
   según su rol — accesos rápidos a todo lo que puede usar, lo que está pasando ahora, su
   actividad y lo pendiente de su función — actualizado solo.
2. **Qué pantalla ve cada uno y qué puede hacer en ella**, configurable por usuario, rol,
   rango y cargo para **todas** las pantallas web, exigido por el backend.
3. **Área Sistema**: el estado real de los servicios, agentes y tareas del sistema, los
   respaldos, las migraciones, los registros y la app móvil, con las operaciones seguras que
   hoy exigen la terminal.
4. Corregir los **estados del bombero** a los cinco reales.

## 2. Respuestas del usuario que fijan el diseño

| Pregunta | Respuesta |
|---|---|
| ¿Qué es el panel? | Un **centro de mando** de acceso rápido para todos; cada uno ve lo que su rol permite |
| ¿Dónde vive? | **Acceso rápido en el Inicio y un ítem nuevo en el menú** |
| Quienes "no están en el servicio" | **Ambas cosas**: el personal no activo no ve nada del Centro de mando, y del resto cada uno ve el detalle solo de las emergencias en las que participa, salvo permiso de supervisión |
| Estados con acceso al Centro de mando | **Solo ACTIVO** (configurable después) |
| Operaciones desde la web | Respaldar ahora, procesar cola GRE, ejecutar avisos de vencimiento, mantenimiento de Snoopy: "realmente todo" lo viable |
| Autorización | **Configurable a voluntad por usuario, rol, rango y cargo**: qué pantallas se ven y qué se puede hacer en cada una |
| Alcance de esa configuración | **Todas las pantallas web, ya** |
| Migración de permisos | Aplicar **solo la 096** en la base local |
| App móvil | Terminar la web; el APK después, con la lista de lo que hay que agregarle registrada |
| Estados del bombero | Son **ACTIVO, SUSPENDIDO, LICENCIA, BAJA, FALLECIDO** (el código tiene siete y está mal) |
| Ruta de Piper | **Corregirla** en este trabajo |

## 3. Qué se reutiliza (regla de no duplicación)

| Necesidad | Pieza existente | Cómo se usa |
|---|---|---|
| Reglas por usuario/rol/rango/cargo | `seguridad.pantallas` + `seguridad.pantalla_permisos` (mig. 090), `pantallas.logica.ts` (`decidir`, `reglaAplica`), `PantallasService` | Se extiende a la web; **misma semántica**: la matriz restringe, denegar gana |
| Administración de reglas | `/dashboard/seguridad/pantallas`, `PUT/DELETE /pantallas/reglas` | Se rediseña para ~145 pantallas; los endpoints no cambian |
| Control de permisos en cada endpoint | `PermissionsGuard` (en todos los controladores, después de `JwtAuthGuard`) | Aloja el control de la matriz web |
| Catálogo de pantallas web | `npm run generar:pantallas` → `src/lib/pantallas.generado.ts` | Se amplía con código estable y rutas de API |
| Menú, pestañas, buscador, migas | `lib/modulos.ts`, `TABS` de cada `layout.tsx`, `BuscadorPantallas`, `lib/navegacion.ts` | Filtran por la decisión de la matriz |
| Actividad propia | `GET /seguridad/mi-inicio` (`PerfilService.obtenerInicioPropio`) | Sección "Mi actividad" |
| Emergencias en curso, participación | `ServicioActivoService` (`activos`, `miembro`), `servicio_participantes`, `personal_servicio` | Sección "Emergencias en curso" filtrada por participación |
| Alertas, móviles, disponibilidad, convocatorias | `AlertasService`, `FlotaService` (`tablero`, `disponibilidad`, `vencimientos`), `LlamadosService` (convocatorias abiertas) | Secciones de "Ahora" y "Pendientes" |
| Denuncias, reservas, despacho, documentos | `DenunciasService.resumen`, `ReservasService`, `DespachoService` (solicitudes abiertas), `DocumentosService` | Sección "Pendientes de mi rol" |
| Estado de Snoopy y motores | `IaConfiguracionService`, `OllamaService`, `WhisperService`, `PiperService`; `PATCH ia/admin/estado` | Área Sistema › Estado y Tareas |
| Cola GRE | `GreImportacionService.procesarPendientes`, `gre-trabajador.service.ts` | "Procesar ahora" y estado de la cola |
| Avisos de vencimiento | `AvisosVencimientoService.ejecutar` | "Ejecutar ahora" y última ejecución |
| APK publicado | `AppMovilService` (`version.json`, `certificado.sha256`) | Área Sistema › App móvil |
| QR de conexión | lógica de `scripts/conectar-celulares.mjs` (`direccionesDeLaPc`, `contenidoQr`), paquete `qrcode` del frontend | Se porta al backend (direcciones) y al frontend (dibujo) |
| Respaldos | Tarea `SIGBO-Respaldo-Diario` → `workflows/scripts/respaldo-docker.ps1`, `respaldos/*.bak(.sha256)`, `respaldos/registro.log` | Se leen; "Respaldar ahora" lanza la **misma** tarea |
| Auditoría | `AuditoriaService.registrar` → `seguridad.logs_auditoria` | Toda operación del área Sistema y del Centro de mando |
| Configuración institucional | `configuracion.registry.ts` (borradores, versiones) | Nueva clave para los estados con acceso |
| Piezas de pantalla | `Aviso`, `Cargando`, `useConfirmacion`, `usePaginacion`/`Paginador`, `SystemIcon`, `.badge` con `--*-fill`, `.module-grid` | En todas las pantallas nuevas |

## 4. Pieza A — Matriz de pantallas en toda la web

### 4.1 Catálogo y códigos

- Toda pantalla bajo `app/dashboard/**/page.tsx`, **incluidas las de detalle** (`[id]`), recibe
  un código `0xBnnn` (prefijo B = web; A = app móvil, existente; C = secciones del Centro de
  mando y del área Sistema). Se excluye `dashboard/[modulo]` (página de "no existe").
- Los códigos se guardan en `frontend/scripts/pantallas-codigos.json` (ruta → código),
  **solo se agregan, nunca se renumeran ni se reutilizan**: una regla configurada no puede
  pasar a otra pantalla. Una ruta que desaparece conserva su código (queda inactiva).
- Las rutas del Centro de mando y del área Sistema llevan en ese archivo sus códigos `0xC…`
  fijados de antemano (§5.1, §6.1); el generador los respeta y no les da un `0xB…`.
- Las **secciones** del Centro de mando (§5.4) son entradas del catálogo sin ruta propia,
  declaradas en el backend (`catalogo-secciones.ts`) con su permiso base; se sincronizan a
  `seguridad.pantallas` igual que las demás.
- `npm run generar:pantallas` además:
  - recorre cada página **y los componentes que importa por ruta relativa**, y junta las
    llamadas `apiFetch('…')`, `descargarArchivo('…')` y `fetch(`${API_URL}…`)`; normaliza
    `${…}` a un segmento comodín y quita la query;
  - lee `frontend/scripts/pantallas-api-extra.json` para lo que no se puede deducir
    (rutas armadas en variables) y para declarar **POST de solo lectura** (exportar, buscar)
    con su acción real;
  - escribe `src/lib/pantallas.generado.ts` (ahora con `codigo` y patrón de ruta) y
    `backend/src/modules/pantallas/catalogo-web.generado.ts` (código, ruta web, nombre,
    módulo, llamadas de API con método cuando se conoce);
  - con `--verificar` falla si los archivos generados no están al día (se suma a CI).
- Se reporta, sin fallar, cada llamada que no pudo resolverse.

### 4.2 Sincronización al arrancar (backend)

- Al iniciar, `CatalogoPantallasService` arma la **tabla de rutas** del backend con
  `DiscoveryService`/`MetadataScanner`: método, patrón (`/api/v1/personal/bomberos/:id`) y los
  permisos de `@RequirePermission`.
- Cruza cada llamada del catálogo con esa tabla (segmento a segmento; el comodín coincide con
  un parámetro o un literal) y obtiene, por pantalla, sus rutas reales. Índice en memoria:
  **patrón+método → códigos de pantalla**.
- Hace *upsert* en `seguridad.pantallas` de las pantallas web (código, nombre, descripción =
  módulo · ruta, `activa`). Las web que ya no están quedan `activa = 0`; **nunca se borran**
  (las reglas las referencian por FK). Las `0xA…` de la app móvil no se tocan.
- **Decisión** (se registra en `.context`): el catálogo de pantallas es código, no decisión
  institucional; sincronizarlo al arrancar evita una migración por cada pantalla nueva. Las
  **reglas** siguen siendo filas que decide la institución.
- Si la sincronización falla, el backend **arranca igual**, registra el error, y el control
  de la matriz web queda inactivo hasta el próximo arranque (no bloquea a nadie). El área
  Sistema lo muestra como alerta.

### 4.3 Control en el backend

- Vive en `PermissionsGuard`, después del chequeo por rol (corre en todos los controladores
  y ya tiene al usuario autenticado). Se obtiene el patrón con `request.route.path`.
- Algoritmo:
  1. Pantallas `S` que usan ese patrón+método. Si `S` está vacío → permitido (rige solo el rol).
  2. Reglas de esas pantallas (caché en memoria; se invalida al guardar o quitar una regla, y
     vence a los 60 s por seguridad). Si ninguna tiene reglas → permitido.
  3. Acción: GET/HEAD → `ver`; POST → `crear`; PUT/PATCH → `editar`; DELETE → `eliminar`;
     salvo lo declarado en `pantallas-api-extra.json`.
  4. Se resuelve el sujeto (roles vigentes, rango, cargo) solo si hay reglas.
  5. **Permitido si alguna pantalla de `S` lo permite**: sin reglas aplicables a la persona →
     sí; alguna aplicable con `denegar` → no; si no, alguna aplicable debe conceder la acción.
- Rechazo: 403 `No tenés permiso para {ver|crear|editar|eliminar} en «{pantalla}».` y se
  audita (`DENEGADO_POR_PANTALLA`, recurso `seguridad.pantalla_permisos`).
- **Propiedad central**: sin reglas web configuradas el comportamiento es idéntico al actual.
- Rutas compartidas (p. ej. `GET /personal/bomberos`, que alimenta combos de varias
  pantallas): denegar una pantalla bloquea sus rutas **propias**; las compartidas siguen
  disponibles si otra pantalla permitida las usa. Se documenta.
- El control de la app móvil (`exigir()` en los servicios de despacho) no cambia.

### 4.4 `GET /pantallas/mis-permisos`

- Pasa a estar disponible para **cualquier usuario autenticado** (como `mi-inicio`): devuelve
  solo las decisiones de quien llama. La app móvil sigue usándolo igual.
- Para cada pantalla web devuelve `{codigo, ruta, nombre, modulo, ver, crear, editar,
  eliminar}`. El permiso base para la interfaz: `ver` si tiene alguno de los permisos de las
  rutas GET de la pantalla; `crear`/`editar`/`eliminar`, alguno de los de las rutas POST,
  PUT/PATCH, DELETE. Una pantalla sin rutas de API usa el prefijo de su módulo.
- Incluye `centroMando: { acceso: boolean, motivo?: string }` (ver §5.3).

### 4.5 Frontend

- `lib/permisos-pantalla.ts` + hook `usePermisosPantalla()`: carga `mis-permisos` al montar el
  layout del dashboard y cada 5 minutos; lo guarda con la sesión. Si no se puede cargar, se
  vuelve a la lógica actual por prefijo y se muestra un aviso (nunca deja a nadie afuera
  por un error de red).
- Filtran por `ver`: el menú (un módulo aparece si tiene al menos una pantalla visible), las
  `TABS` de cada módulo, el buscador Ctrl+K, las migas, las tarjetas del Inicio y los accesos
  del Centro de mando.
- El layout del dashboard, ante una ruta con `ver = false`, muestra "No tenés acceso a esta
  pantalla" (con a quién pedirlo) en lugar del contenido.
- `puede('crear' | 'editar' | 'eliminar')` para la ruta actual. Las pantallas **nuevas** lo
  usan para ocultar acciones. En las **existentes** el backend rechaza con el mensaje claro y
  la pantalla lo muestra con su `Aviso`; ocultar esos botones se adopta pantalla por pantalla
  (limitación declarada, §13).

### 4.6 Seguridad › Pantallas (rediseño)

- Agrupada por módulo (y "App móvil" para las `0xA…`), con búsqueda por nombre o ruta.
- En cada pantalla: ruta web, rutas de API que cubre, permisos base, reglas existentes.
- **Vista previa**: elegir un usuario y ver qué pantallas ve y qué acciones tiene, con el
  origen de cada decisión (rol o regla). Endpoint `GET /pantallas/vista-previa?usuarioId=`
  (`seguridad:gestionar_pantallas`).

## 5. Pieza B — Centro de mando

### 5.1 Ubicación

- Pantalla `/dashboard/centro-mando`, código `0xC001`, primer ítem del grupo **Operaciones**
  del menú (`MODULOS` admite un ítem siempre visible, oculto solo si `centroMando.acceso` es
  falso).
- **Inicio**: el texto fijo "Estado del sistema · Operativo" se reemplaza por el estado real
  (`/salud`, y el semáforo del sistema para quien tiene `sistema:ver`) y un acceso destacado
  al Centro de mando. Las tarjetas de módulos y "Mi actividad operativa" se conservan.

### 5.2 Endpoint `GET /centro-mando`

- `JwtAuthGuard` (cualquier usuario autenticado, mismo criterio que `mi-inicio`); cada
  sección exige su propio permiso base y la matriz.
- Respuesta:
  `{ generadoEn, acceso: 'PERMITIDO' | 'SIN_ACCESO', motivo?, secciones: { [clave]: { estado: 'ok' | 'error' | 'sin_permiso', datos?, error? } } }`.
  Solo vienen las secciones que la persona puede ver; cada una se arma con
  `Promise.allSettled`, así una que falla no tumba a las demás.
- `GET /centro-mando/accesos`: el árbol módulo → pantallas visibles (de la matriz), para los
  accesos rápidos (sin consulta aparte del frontend).

### 5.3 Regla del estado del bombero

- Si el usuario está vinculado a un bombero cuyo estado no está en la clave de configuración
  `operations.commandCenterStates` (por defecto `['ACTIVO']`), `acceso = 'SIN_ACCESO'` y no se
  devuelve ninguna sección. La pantalla lo explica ("Tu estado actual no tiene acceso al
  Centro de mando").
- Usuarios sin bombero vinculado (cuentas de administración): rigen sus roles.
- La clave se edita en Seguridad › Configuración (borrador → validar → publicar), como el
  resto del registro.

### 5.4 Secciones

Cada sección es una pantalla de la matriz (configurable por usuario, rol, rango y cargo).

| Clave | Código | Permiso base (alguno) | Fuente reutilizada | Contenido |
|---|---|---|---|---|
| `accesos` | 0xC002 | — (siempre) | catálogo + matriz | Módulos y pantallas permitidos, buscador |
| `emergencias` | 0xC003 | `servicios:ver`, `despacho:responder`, `despacho:servicio` | `ServicioActivoService`, participantes | Emergencias en curso (§5.5) |
| `alertas` | 0xC004 | `servicios:ver` | `AlertasService` | Alertas de emergencia activas |
| `moviles` | 0xC005 | `vehiculos:ver` | `FlotaService.tablero` | Móviles por estado operativo |
| `personal` | 0xC006 | `servicios:ver` | `FlotaService.disponibilidad` | Bomberos disponibles / en camino / en servicio |
| `guardia` | 0xC007 | `guardias:ver` | `GuardiasService` (consulta por la fecha de hoy) | Guardia vigente hoy y su personal |
| `convocatorias` | 0xC008 | `servicios:ver` | `LlamadosService` (abiertas) | Convocatorias abiertas |
| `mi_actividad` | 0xC009 | — (siempre) | `PerfilService.obtenerInicioPropio` | Próximas guardias y últimos servicios propios |
| `pendientes` | 0xC00A | según ítem | despacho, denuncias, reservas, flota, documentos | Bandeja de lo que espera a su función; cada ítem con su permiso |
| `sistema` | 0xC00B | `sistema:ver` | `SistemaService.resumen` | Semáforo y alertas del sistema, enlace al área Sistema |

Ítems de `pendientes`: solicitudes de despacho abiertas (`despacho:seguimiento`), denuncias
sin atender (`denuncias:ver`), reservas por decidir (`reservas:decidir`),
vencimientos de flota próximos (`vehiculos:ver`), documentos por vencer (`documentos:ver`).
Cada ítem enlaza a la pantalla donde se resuelve.

### 5.5 Emergencias en curso: participación y supervisión

- **Supervisión** (ve todas): `despacho:seguimiento` o `servicios:despachar`.
- Sin supervisión: solo las emergencias activas en las que **participa** — participante
  vigente del servicio (`servicio_participantes` con su usuario, sin `hasta`, no `RETIRADO`)
  o integrante en `personal_servicio` con su bombero vinculado. Las demás no aparecen.
- Cada tarjeta: número, tipo, prioridad, estado/fase, móviles, personal, tiempo transcurrido,
  enlace al detalle (que sigue exigiendo su propio permiso).

### 5.6 Actualización y errores

- Consulta cada **10 s** mientras la pestaña está visible (`visibilitychange`); al volver,
  consulta enseguida. Muestra "Actualizado hace N s".
- Si falla la consulta entera: conserva los últimos datos, marca "Sin conexión con el
  servidor", reintenta con espera creciente (10 → 20 → 40 s, tope 60 s).
- Si falla una sección: la tarjeta muestra su error; el resto sigue.
- Hook reutilizable `useActualizacionPeriodica(cargar, ms)` en `lib/`.

## 6. Pieza C — Área Sistema

### 6.1 Ubicación y pestañas

Módulo `sistema` en el grupo **Sistema** del menú (prefijo de permisos `sistema:`).

| Pestaña | Ruta | Código |
|---|---|---|
| Estado | `/dashboard/sistema` | 0xC010 |
| Tareas | `/dashboard/sistema/tareas` | 0xC011 |
| Respaldos y base de datos | `/dashboard/sistema/datos` | 0xC012 |
| App móvil | `/dashboard/sistema/app-movil` | 0xC013 |
| Registros | `/dashboard/sistema/registros` | 0xC014 |

Cada pestaña es una pantalla más de la matriz con su `0xC…`: `ver` = mirar la pestaña,
`crear` = ejecutar sus operaciones (los POST que esa pestaña llama), por el mecanismo general
de §4.3.

### 6.2 Endpoints `/api/v1/sistema`

| Método y ruta | Permiso | Qué hace |
|---|---|---|
| `GET /sistema/resumen` | `sistema:ver` | Semáforo general y alertas (lo usa el Centro de mando y el Inicio) |
| `GET /sistema/estado` | `sistema:ver` | Backend, base de datos, IA y motores, Telegram, conexiones en tiempo real, catálogo de pantallas |
| `GET /sistema/tareas` | `sistema:ver` | Tareas programadas de Windows y trabajos internos |
| `POST /sistema/tareas/avisos-vencimiento/ejecutar` | `sistema:operar` | Corre la revisión de avisos ahora |
| `GET /sistema/respaldos` | `sistema:ver` | Respaldos, último resultado, alertas |
| `POST /sistema/respaldos/ejecutar` | `sistema:operar` | `schtasks /Run /TN SIGBO-Respaldo-Diario` |
| `POST /sistema/respaldos/:archivo/verificar` | `sistema:operar` | Recalcula el SHA-256 y lo compara con su `.sha256` |
| `GET /sistema/migraciones` | `sistema:ver` | Aplicadas, pendientes y alteradas |
| `GET /sistema/app-movil` | `sistema:ver` | APK publicado, integridad, huella del certificado |
| `GET /sistema/conexion-movil` | `sistema:ver` | Direcciones de red del servidor y si responden |
| `GET /sistema/registros?archivo=&lineas=` | `sistema:ver_registros` | Últimas líneas de un registro de la lista cerrada |
| `POST /matpel/administracion/importaciones/procesar` | `matpel:administrar_gre` | Procesa una importación pendiente (en el módulo GRE) |

Mantenimiento/apagado de Snoopy y las pruebas de Ollama/Whisper/Piper usan los endpoints
**existentes** de `ia/admin/*` con sus permisos `inteligencia:*`; el área Sistema solo los
muestra cuando la persona los tiene.

### 6.3 Fuentes de cada dato

- **Backend**: versión de `package.json`, `process.uptime()`, `process.memoryUsage()`, Node,
  `NODE_ENV`, hora del servidor.
- **Base de datos**: `SELECT 1` cronometrado, `SERVERPROPERTY('ProductVersion')`, tamaño desde
  `sys.database_files`. Si el usuario de la base no tiene permiso para algún dato, ese dato
  se muestra "no disponible" (no falla la pestaña).
- **Migraciones**: `dbo.__sigbo_migrations` (nombre, hash, fecha) contra
  `database/migrations.sha256`. Carpeta configurable (`SIGBO_DATABASE_DIR`, por defecto
  `../database` relativo al backend); si no existe el manifiesto, se informa.
- **Respaldos**: `SIGBO_RESPALDOS_DIR` (por defecto `../respaldos`); solo archivos
  `^sigbo_cbvc-\d{8}-\d{6}\.bak$`; fecha desde el nombre (el registro no fecha sus entradas);
  `registro.log` se separa por corridas (`RESULTADO: OK|FALLO`). Alertas: sin respaldo en
  24 h, último resultado FALLO, nunca se probó restaurar, `.sha256` faltante.
- **Tareas programadas**: `schtasks /Query /TN <nombre> /V /FO CSV /NH` para
  `SIGBO-Respaldo-Diario` y `SIGBO-Arranque-Automatico` (lista fija). Solo en Windows; en otro
  sistema se informa "no disponible en este servidor". Se muestran estado, última ejecución,
  último resultado, próxima ejecución, y la cola de `logs/arranque-automatico.log`.
- **Trabajos internos**: el trabajador GRE y los avisos de vencimiento exponen un estado en
  memoria (`activo`, intervalo, `ocupado`, última ejecución, último resultado/error). La cola
  GRE se cuenta por estado en `matpel.gre_importaciones` **si la tabla existe**; si no
  (094 sin aplicar), "Procesar ahora" queda deshabilitado con el motivo.
- **IA**: estado de Snoopy (activo/mantenimiento/apagado), Ollama (conectado, modelos),
  Whisper, Piper — desde los servicios existentes.
- **Telegram**: configurado o no (sin mostrar el token).
- **Tiempo real**: conexiones abiertas a `/despacho/stream` y `/alertas/stream` (contadores en
  los servicios de cada bus).
- **Catálogo de pantallas**: sincronizado sí/no, cantidad, llamadas sin resolver.

### 6.4 Operaciones

- Sin ejecución de comandos arbitrarios. `execFile('schtasks.exe', [argumentos fijos])`,
  `shell: false`, con tiempo máximo; los nombres de tarea salen de una constante.
- **Respaldar ahora**: si la tarea ya está "En ejecución", responde 409. Confirmación previa
  en la interfaz (`useConfirmacion`). Se audita.
- **Verificar respaldo**: nombre validado por la expresión de §6.3 y resuelto dentro de la
  carpeta (sin rutas del cliente); SHA-256 por flujo. Se audita.
- **Ejecutar avisos** y **procesar GRE**: rechazan con 409 si ya hay una corrida en curso. Se
  auditan.
- Cada operación devuelve el resultado y la pantalla recarga con `cargar()`.

### 6.5 Registros

- Lista cerrada: `backend-out`, `backend-err`, `arranque-automatico` en `SIGBO_LOGS_DIR` (por
  defecto `../logs`). El cliente elige una clave, nunca una ruta.
- Se leen los últimos 256 KB y se devuelven hasta 500 líneas.
- Se ocultan antes de enviar: valores tras `password`, `secret`, `token`, `authorization`,
  `cookie`, `sa_password` (=, :), `Bearer …`, y cadenas con forma de JWT.
- "Seguir en vivo" consulta cada 5 s; filtro por texto y por nivel (ERROR/WARN/LOG).
- Enlaces a las auditorías existentes (Seguridad, IA, Documentos) según permisos.

### 6.6 App móvil

- APK publicado: versión, notas, tamaño, obligatoria, SHA-256 y si coincide con el archivo,
  huella del certificado.
- Conexión: direcciones IPv4 privadas del servidor (mismo filtro que
  `conectar-celulares.mjs`: sin adaptadores virtuales, Wi-Fi/Ethernet primero) y, para cada
  una, si `/api/v1/salud` responde (2 s). El frontend dibuja dos QR por dirección con
  `qrcode`: **Instalar** (`http://IP:PUERTO/api/v1/app-movil/descargar`) y **Conectar**
  (`sigbo://servidor?url=…`, el formato que lee la app).
- `conectar-celulares.bat` sigue funcionando (sin sesión); se documenta que la pantalla lo
  reemplaza para quien entra al sistema.

### 6.7 Lo que sigue en la terminal

Listado en la pestaña Estado, con el motivo y el comando, **sin botones**: iniciar/detener
SIGBO (es el mismo servidor), aplicar migraciones (cambian la estructura; 094/095 esperan a
la institución), publicar el APK (la clave privada no está en el servidor a propósito), el
túnel (expone el sistema a internet), programar o quitar tareas de Windows. Lo que el Centro
de Control del ecosistema ya opera se indica como tal.

## 7. Pieza D — Estados del bombero

- Valores: `ACTIVO`, `SUSPENDIDO`, `LICENCIA`, `BAJA`, `FALLECIDO`.
- Migración `097_estados_bombero.sql` (idempotente):
  - `RETIRADO` → `BAJA`.
  - Si hay filas en `ASPIRANTE` u `HONORARIO`, **aborta con un mensaje** que pide decidir cada
    caso antes de aplicarla (no se automatiza una decisión de la institución). En la base
    local la tabla está vacía.
  - Reemplaza `CK_bomberos_estado` por los cinco valores.
  - El historial institucional **no se reescribe**: pasar a `BAJA` sigue registrando el tipo
    de movimiento existente `RETIRO` (su CHECK no cambia) y la interfaz lo muestra como "Baja".
- Código: `EstadoBombero`, `create-bombero.dto.ts`, `bomberos.service.ts` (dar de baja guarda
  `BAJA`), `ia-nlu.util.ts` ("baja", "de baja", "dados de baja" → `BAJA`; sin "aspirante"),
  `lib/personal.ts`, `personal/page.tsx`, `personal/nuevo/page.tsx`, `TabInstitucional.tsx`.
- **No se toca**: la condición institucional `HONORARIO` (otra dimensión) ni el estado
  `RETIRADO` de los participantes de un servicio.
- Colores: ACTIVO verde; SUSPENDIDO, BAJA, FALLECIDO rojo (`--bad-fill`); LICENCIA ámbar
  (`--warn-fill`).

## 8. Corrección de Piper

- `piperRutaBinario` solo se acepta si su nombre de archivo es `piper` o `piper.exe` y está
  dentro de una carpeta permitida (`IA_PIPER_DIR`; si no está definida, la carpeta del valor
  ya guardado). Validación en el DTO y de nuevo en `PiperService` antes de `spawn`.
- `piperRutaVoz` debe terminar en `.onnx` y estar en la misma carpeta permitida.
- Prueba: rutas a otros ejecutables o fuera de la carpeta se rechazan.

## 9. Permisos

- Migración `096_sistema_permisos.sql`: `sistema:ver`, `sistema:operar`,
  `sistema:ver_registros` (categoría Sistema). El **Administrador General** los recibe por
  `acceso_total`; a otros roles se asignan desde Seguridad.
- La 096 se agrega a `run-migrations.ps1` y a `migrations.sha256`. Se aplica **sola** en la
  base local (sin 094/095), con respaldo previo.
- El Centro de mando no tiene permiso propio (como `mi-inicio`): cada sección exige el suyo.
- La 097 se aplica en la base local solo con autorización explícita (§2 autoriza la 096).

## 10. Manejo de errores

- Toda pantalla: `<Cargando>` al iniciar; `<Aviso tipo="error">` con el mensaje del backend;
  `<Aviso tipo="exito">` tras cada operación; nada de `alert`/`confirm` nativos.
- Dato no disponible (sin permiso de la base, no es Windows, archivo inexistente): se muestra
  "No disponible: {motivo}", nunca un valor inventado.
- Operaciones: 409 si ya está en curso, 403 con el mensaje de la matriz, 503 si una
  dependencia no responde; botones deshabilitados mientras corre (con el motivo visible).

## 11. Pruebas y verificación

Backend (Jest, sin base):
- Matriz web: sin reglas no cambia nada; denegar gana; ruta compartida permitida por otra
  pantalla; método → acción y excepciones; caché invalidada al guardar; patrón no catalogado.
- Cruce catálogo ↔ tabla de rutas (comodines, parámetros).
- Centro de mando: estado del bombero (ACTIVO sí, otros no, sin bombero según roles);
  participación vs supervisión; una sección que falla no tumba la respuesta.
- Sistema: lectura del registro de respaldos, validación de nombres de archivo, ocultamiento
  de secretos, `schtasks` con argumentos fijos (CSV de ejemplo), migraciones
  aplicadas/pendientes/alteradas, filtro de direcciones de red.
- Piper: rutas válidas e inválidas.

Frontend: `tsc --noEmit`, `npm test`, `audit:contraste`, `audit:a11y`,
`generar:pantallas --verificar`; `node scripts/verificar-endpoints.mjs`.

Integración real (este equipo): backend y frontend levantados; recorrido en el navegador con
`admin` y con un usuario de rol limitado; crear una regla de prueba (denegar una pantalla a un
usuario), comprobar menú, URL directa y 403 de la API, y **quitarla**; ejecutar cada operación
del área Sistema y verificar su efecto (respaldo nuevo en `respaldos/`, entrada de auditoría).
Suite completa del backend al final (las 2 fallas previas de Despacho se informan aparte).

## 12. Documentación y grafo

- `docs/CENTRO-DE-MANDO.md`: qué ve cada uno, cómo se configura, operaciones, limitaciones.
- `docs/PENDIENTES-APP-MOVIL.md`: lo que la app debe incorporar (Centro de mando esencial,
  estados del bombero nuevos si los muestra, matriz web vs `0xA…`, QR desde el sistema).
- `.context/graph/curated/`: DECISION (matriz web en `PermissionsGuard` + catálogo
  sincronizado al arrancar), RULE (pantalla nueva ⇒ `generar:pantallas`, que ahora también
  alimenta la matriz), actualización de reglas de estados del bombero. `build-graph.mjs` +
  `validar.mjs`.
- `CLAUDE.md` del proyecto: la regla 11 menciona el catálogo de la matriz; corrige el
  iniciador vigente (`iniciar-sigbo.ps1`, frontend en 3002).

## 13. Fuera de este trabajo y limitaciones

- App móvil (corte siguiente, con `docs/PENDIENTES-APP-MOVIL.md`).
- Ocultar botones de crear/editar/eliminar en las ~112 pantallas existentes: el backend ya
  los rechaza; la ocultación se adopta pantalla por pantalla con `puede()`.
- Secciones internas de una pantalla (p. ej. las 20 del legajo) no son pantallas de la matriz.
- Canal SSE para el Centro de mando (se usa consulta periódica, como el resto del sistema).
- Arreglar el encabezado con fecha que no escribe `programar-respaldo.ps1` (requiere volver a
  registrar la tarea en Windows): se informa en el área Sistema y se deja anotado.
- Activar `GRE_TRABAJADOR` o aplicar 094/095: decisión de la institución.

## 14. Orden de implementación

1. Estados del bombero (097 + código) y Piper (cambios acotados, con pruebas).
2. Permisos 096 y módulo backend `sistema` (estado, tareas, respaldos, migraciones, app
   móvil, registros, operaciones).
3. Catálogo web: generador ampliado, sincronización al arrancar, control en
   `PermissionsGuard`, `mis-permisos` y vista previa.
4. Frontend de la matriz: filtros de menú/pestañas/buscador, guarda de ruta, rediseño de
   Seguridad › Pantallas.
5. Centro de mando (backend + pantalla) e Inicio.
6. Pantallas del área Sistema.
7. Documentación, grafo, verificación completa y recorrido real.
