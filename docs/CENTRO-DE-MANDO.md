# Centro de mando, permisos por pantalla y área Sistema

Guía para quien administra SIGBO en el cuartel. Describe lo que la web hace hoy; lo que todavía no
hace está en "Limitaciones conocidas", al final.

## Centro de mando

Menú › Operaciones › **Centro de mando** (también desde el botón "Abrir el Centro de mando" del Inicio).
Se actualiza solo cada 10 segundos mientras la pestaña está a la vista. Con la pestaña oculta no
consulta. Si una actualización falla, reintenta esperando 20, 40 y hasta 60 segundos, y cada intento
tiene un tope de 30 segundos para que un pedido colgado no congele el panel.

- **Quién lo ve.** Quien está vinculado a una ficha de bombero ve el Centro de mando solo si su estado
  está habilitado (por defecto, **solo ACTIVO**). Los estados del bombero son ACTIVO, SUSPENDIDO,
  LICENCIA, BAJA y FALLECIDO. Se cambia en Seguridad › Configuración global, "Estados con acceso al
  Centro de mando"; la lista no puede quedar vacía ("Elegí al menos un estado."). Las cuentas sin
  ficha de bombero (administración) se rigen por sus roles. Si la cuenta ya no existe, no hay acceso
  ("Cuenta no encontrada.").
- **Qué ve cada uno.** Cada sección exige su permiso por rol y, además, se puede restringir por
  usuario, rol, rango o cargo en Seguridad › Permisos por pantalla (grupo "Centro de mando"):

| Sección | Hace falta (alguno) |
|---|---|
| Emergencias en curso | servicios:ver, despacho:responder o despacho:servicio |
| Alertas activas (y marcarlas atendidas o cancelarlas) | servicios:ver (atender o cancelar: servicios:editar) |
| Móviles | vehiculos:ver o servicios:ver |
| Personal disponible | servicios:ver o despacho:seguimiento |
| Guardia de turno | guardias:ver o servicios:ver |
| Convocatorias abiertas | servicios:ver |
| Pendientes de mi función | cada ítem el suyo (despacho:seguimiento, denuncias:ver, reservas:decidir, vehiculos:ver, personal:ver) |
| Estado del sistema | sistema:ver |
| Mi actividad y Accesos rápidos | cualquier persona con acceso |

- **Emergencias.** Cada uno ve solo las emergencias que integra (participante vigente o personal del
  servicio). Quien tiene despacho:seguimiento o servicios:despachar (central, comandancia) ve todas.
  Las direcciones de las emergencias son información confidencial: su lectura desde el panel queda
  en Seguridad › Auditoría, como máximo una vez cada 10 minutos por persona.
- **Personal disponible.** Cuenta el estado efectivo: una disponibilidad temporal "al llamado" ya
  vencida cuenta como no disponible.
- **Pendientes.** El de denuncias se llama "Denuncias sin atender" (nuevas y en revisión).
- **Si una sección falla**, el panel muestra "No disponible: error interno" solo en esa sección y el
  resto sigue funcionando. El detalle queda en `logs/backend-err.log`.

## Permisos por pantalla (toda la web)

Seguridad › **Permisos por pantalla** lista todas las pantallas web, agrupadas por módulo, más las
secciones del Centro de mando y las pantallas de la app móvil.

- Una regla nombra a un **usuario, rol, rango o cargo** y marca Ver, Crear, Editar, Eliminar,
  Confidencial o **Denegar**.
- Las reglas **restringen** lo que el rol permite: nunca dan más. Para dar más, se asigna el permiso
  en Roles. **Denegar gana siempre.**
- El servidor las exige en cada pantalla, en menos de un minuto desde que se guardan. El menú, las
  pestañas y el buscador ocultan lo que no se puede ver; una URL escrita a mano muestra "Sin acceso".
- Sin reglas configuradas, todo funciona exactamente como antes.
- Si una ruta la usan varias pantallas (por ejemplo, la lista de bomberos de los combos), denegar una
  pantalla no la bloquea mientras otra pantalla permitida la use.
- **Vista previa:** elegir un usuario y ver qué pantallas ve y qué puede hacer, y si lo decide su rol
  o una regla.
- La administración de las reglas nunca queda bloqueada por una regla (para no dejar a nadie sin
  forma de deshacerla). Tampoco el inicio de sesión, el perfil propio ni el Centro de mando, que
  tienen su propia regla de acceso.

## Área Sistema

Menú › Sistema › **Sistema** (permisos sistema:ver, sistema:operar y sistema:ver_registros).

| Pestaña | Qué muestra | Qué se puede hacer |
|---|---|---|
| Estado | Servidor, base de datos, Snoopy (Ollama, Whisper, Piper), Telegram, conexiones en tiempo real, permisos por pantalla | Probar Ollama (inteligencia:configurar); mantenimiento, apagado o reactivación de Snoopy (inteligencia:desactivar) |
| Tareas | Tareas de Windows (respaldo diario, arranque automático), avisos de vencimiento, importación GRE | Revisar vencimientos ahora; procesar una importación GRE (matpel:administrar_gre) |
| Respaldos y base de datos | Respaldos, su integridad, las últimas corridas, alertas; migraciones aplicadas, pendientes y alteradas | Respaldar ahora (lanza la tarea programada); verificar el SHA-256 de un respaldo |
| App móvil | Versión publicada del APK; QR para instalar y conectar por cada red del servidor | Nada: reemplaza a `conectar-celulares.bat` |
| Registros | Últimas líneas de los registros del servidor, con contraseñas, claves, tokens y cookies ocultos | Seguir en vivo, filtrar |

- Todo lo que se ejecuta queda en Seguridad › Auditoría, y también la lectura de los registros
  (con el nombre del archivo). La web no ejecuta comandos libres: solo tareas con nombre fijo.
- Si falta algo de lo que la operación necesita (Programador de tareas de Windows, Telegram, disco),
  la web lo dice con el motivo en lugar de fallar en silencio. Si ya hay una operación en curso, no
  deja lanzar otra igual; "Respaldar ahora" no se puede lanzar dos veces a la vez.
- Los registros se muestran con los secretos ocultos y cada línea se corta a 4000 caracteres.
- El resumen del Inicio y del Centro de mando no consulta el Programador de tareas; la pestaña
  Tareas lo consulta con una caché de 15 segundos.

## Lo que sigue en la terminal

Iniciar o detener SIGBO, aplicar migraciones, publicar el APK, abrir el túnel a internet y programar
tareas de Windows. Sistema › Estado, "Lo que sigue en la terminal", lista cada comando y por qué no
está en la web.

## Limitaciones conocidas

- En las pantallas que ya existían, los botones de crear, editar y eliminar no se ocultan cuando una
  regla los prohíbe: el servidor los rechaza con un mensaje claro. Se van ocultando pantalla por
  pantalla.
- Las secciones internas de una pantalla (por ejemplo, las del legajo) no tienen reglas propias.
- La **app móvil no pasa por las reglas de pantallas web**: tiene su propio conjunto (códigos 0xA…).
  Un cliente que se hiciera pasar por la app móvil evitaría las restricciones por pantalla de la web
  (no los permisos por rol, que siguen rigiendo). Es un riesgo aceptado a confirmar por el cuartel.
- Centro de mando: "Alertas activas" muestra solicitante y detalle de todas las alertas pendientes a
  quien tenga servicios:ver, y "Guardia de turno" muestra nombres. Solo "Emergencias" se filtra por
  participación.
- Centro de mando: el límite de 100 emergencias activas se aplica antes del filtro por participación.
- Los pendientes del Centro de mando consultan el permiso por rol, no las reglas por pantalla.
- El contador que limita la auditoría de direcciones a una vez cada 10 minutos vive en memoria: se
  reinicia al reiniciar el servidor. La app móvil audita cada consulta, como antes.
- Sistema › Tareas › "Procesar cola GRE" responde 403 en esta base: las migraciones 094 y 095
  (GRE/MATPEL) no están aplicadas a propósito y esperan autorización de la institución.
- Las tareas programadas solo se pueden consultar y lanzar en Windows; en otro sistema la pestaña
  muestra "No disponible" con el motivo.
- El registro de respaldos no escribe la fecha de cada corrida: la fecha sale del nombre del archivo.
  Corregirlo requiere volver a registrar la tarea de Windows.
- Pruebas: el frontend no tiene pruebas de componentes; el hook de actualización y las pantallas se
  verifican a mano. `despacho.spec.ts` tiene 2 fallas anteriores a este trabajo (CREAR_SOLICITUD y
  CAMBIAR_DISPONIBILIDAD) y `scripts/smoke-expediente.mjs` no envía los encabezados que pide la
  protección CSRF, así que su inicio de sesión recibe 403.
- No se corrió HawkScan (análisis de seguridad): requiere una cuenta de un servicio externo y el
  proyecto exige herramientas libres y autoalojadas.
- Lo que la app móvil todavía no incorpora está en `docs/PENDIENTES-APP-MOVIL.md`.

## Para quien desarrolla

- Pantalla nueva ⇒ `cd frontend; npm run generar:pantallas`. Asigna su código (nunca renumera),
  registra a qué rutas de la API llama y actualiza el catálogo del backend. CI corre
  `npm run verificar:pantallas`.
- Lo que el generador no puede deducir va en `frontend/scripts/pantallas-api-extra.json`.
- Especificación: `docs/superpowers/specs/2026-10-09-centro-de-mando-design.md`.
