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
  ("Cuenta no encontrada."). Además, una regla de Seguridad › Permisos por pantalla sobre la pantalla
  "Centro de mando" (0xC001) que no conceda Ver deja sin acceso a esa persona, tenga o no ficha: el
  servidor no devuelve el panel y dice "Una regla de Seguridad › Permisos por pantalla te restringe el
  Centro de mando." El estado del bombero se evalúa primero.
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
  pestañas, las migas de pan y el buscador ocultan lo que no se puede ver; una URL escrita a mano
  muestra "Sin acceso", que dice la causa ("Tu rol no incluye permiso para esta pantalla." o que la
  restringe una regla) y ofrece las otras pantallas visibles del mismo módulo. Si la portada de un
  módulo está denegada, el menú y las tarjetas del Inicio llevan a su primera pantalla visible.
  Mientras se cargan los permisos, la pantalla muestra "Comprobando tus permisos…" y no pide datos.
- Sin reglas configuradas, todo funciona exactamente como antes.
- **Alcance exacto de "Denegar".** Cada ruta de la API pertenece a las pantallas que la llaman, y
  pasa si **alguna** de ellas lo permite. De los archivos compartidos de la web (`src/lib`) cada
  pantalla cuenta solo las funciones que usa, así que casi todas las rutas son de una sola pantalla:
  hoy, 9 de 337 rutas de escritura son compartidas (5 entre módulos: por ejemplo la prueba de
  Ollama y el estado de Snoopy, que usan Sistema y Configuración de IA) y 69 de 259 de lectura
  (combos y catálogos, como la lista de bomberos). En esas, denegar una pantalla no bloquea la ruta
  mientras otra pantalla permitida la use. La tabla de rutas de cada pantalla las marca: "compartida
  con N pantallas — denegar esta no la bloquea si otra permitida la usa".
- **Vista previa:** elegir un usuario y ver qué pantallas ve y qué puede hacer, y si lo decide su rol
  o una regla.
- La administración de las reglas nunca queda bloqueada por una regla (para no dejar a nadie sin
  forma de deshacerla), y tampoco el inicio de sesión ni el perfil propio. Las rutas del Centro de
  mando no pasan por la matriz de rutas, pero su acceso sí respeta las reglas sobre su pantalla
  (0xC001) y cada sección, las suyas.

## Área Sistema

Menú › Sistema › **Sistema** (permisos sistema:ver, sistema:operar y sistema:ver_registros). La pestaña
Registros exige sistema:ver_registros; las demás, sistema:ver.

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
  deja lanzar otra igual; "Respaldar ahora" no se puede lanzar dos veces a la vez, y aparece
  deshabilitado con el motivo si la tarea no está programada, está deshabilitada o el Programador de
  tareas no responde. Un registro que existe pero no se puede leer (el de arranque automático, el
  `registro.log` de respaldos) se informa con el motivo, no como "sin registro".
- Si una actualización falla, la marca de la pantalla dice "Sin conexión con el servidor" solo cuando
  no hubo respuesta; un rechazo del servidor (403, 500) dice "No se pudo actualizar" y el aviso de la
  pantalla trae el mensaje.
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
- La **app móvil no pasa por las reglas de pantallas web en las rutas que ella usa**: tiene su propio
  conjunto (códigos 0xA…). Son despacho, alertas, convocatorias, flota, llamados, cartografía,
  prevención, reservas, ausencias, adjuntos, la actualización de la app y unas pocas rutas sueltas (la
  lista está en `backend/src/modules/seguridad/guards/rutas-app-movil.ts`, sacada de `.movile/lib`).
  Un cliente que se hiciera pasar por la app evitaría las restricciones por pantalla de la web solo
  en esas rutas (no los permisos por rol, que siguen rigiendo); en el resto de la API pasa por la
  matriz web como cualquiera. Es un riesgo aceptado a confirmar por el cuartel.
- La matriz **falla abierta**: si el servidor no puede leer las reglas (y nunca las leyó desde que
  arrancó) o no puede resolver los roles, el rango o el cargo de la persona, deja pasar el pedido, y
  mientras dure la falla no rige ninguna regla (tampoco la del Centro de mando). Si ya las había
  leído, sigue usando las últimas conocidas. Si el catálogo de pantallas no se pudo sincronizar con
  la base, las reglas sobre pantallas web no rigen hasta que se sincronice; las del Centro de mando
  (la pantalla y sus secciones) siguen rigiendo con las reglas ya guardadas.
- Centro de mando: "Alertas activas" muestra solicitante y detalle de todas las alertas pendientes a
  quien tenga servicios:ver, y "Guardia de turno" muestra nombres. Solo "Emergencias" se filtra por
  participación.
- Centro de mando: el límite de 100 emergencias activas se aplica antes del filtro por participación.
- Los pendientes del Centro de mando consultan el permiso por rol, no las reglas por pantalla.
- El contador que limita la auditoría de direcciones a una vez cada 10 minutos vive en memoria: se
  reinicia al reiniciar el servidor. La app móvil audita cada consulta, como antes.
- Sistema › Tareas › "Procesar una importación" (GRE) no aparece para nadie en esta base: lo exige el
  permiso matpel:administrar_gre, que siembra la migración 095, y las migraciones 094 y 095
  (GRE/MATPEL) no están aplicadas a propósito: esperan autorización de la institución. Con la 095
  aplicada y la 094 no, el botón aparece deshabilitado con el motivo ("Las migraciones 094 y 095 (GRE)
  no están aplicadas.").
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
- Qué llamadas se le atribuyen a una pantalla: las de su `page.tsx` y de los componentes que importa
  (`src/app`, `src/components`), completos; de `src/lib`, solo las funciones importadas por nombre y
  los helpers del mismo archivo que esas usan. `import * as x` o un import por defecto de `src/lib`
  cuenta el archivo completo. Una función de `src/lib` que ninguna pantalla importa no le asigna su
  ruta a nadie (la matriz no la restringe; el permiso por rol sí). Un archivo de `src/lib` que
  reexporta algo que importó (`import { a } from './y'; export { a };`) no lleva la dependencia: hoy
  no pasa, pero si se hace, la ruta queda sin pantalla. Importar desde el archivo original.
- Lo que el generador no puede deducir va en `frontend/scripts/pantallas-api-extra.json`: `llamadas`
  por pantalla, `llamadasPorFuncion` por función de `src/lib` (cuenta solo para las pantallas que
  usan esa función) y `acciones` (una ruta cuya acción no es la de su método).
- Cuidado con `archivosCubiertos` de ese archivo: silencia las llamadas no resueltas (ruta en una
  variable) de esos archivos, porque ya están declaradas a mano. Una llamada **nueva** con ruta
  variable en uno de ellos tampoco aparecerá en "Llamadas sin resolver": hay que declararla en
  `llamadas` o `llamadasPorFuncion`, o la matriz no la conocerá.
- Especificación: `docs/superpowers/specs/2026-10-09-centro-de-mando-design.md`.
