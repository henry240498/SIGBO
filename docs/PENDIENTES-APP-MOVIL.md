# Pendientes para la app móvil (corte siguiente)

Se terminó primero la web (2026-10-09). Esto es lo que la app debe incorporar, reutilizando los mismos
endpoints y reglas del backend. En el celular va solo lo esencial.

1. **Centro de mando esencial.** Consumir `GET /api/v1/centro-mando` y mostrar solo: mis emergencias en
   curso (por participación), alertas activas, mi próxima guardia, convocatorias abiertas, mi actividad
   y pendientes. Las reglas son las mismas que en la web: estado del bombero (solo ACTIVO por defecto),
   permiso base de cada sección y reglas de Seguridad › Permisos por pantalla (códigos `0xC002` a
   `0xC00B`). Sin sección Sistema ni accesos rápidos.
2. **Atender alertas** desde el Centro de mando con `PATCH /api/v1/alertas/:id/estado`
   (`servicios:editar`), con atender y cancelar, igual que la web.
3. **Acceso.** Si `GET /api/v1/centro-mando/acceso` responde `acceso: false`, la app no muestra el
   Centro de mando y explica el motivo que devuelve el servidor (un bombero SUSPENDIDO, LICENCIA, BAJA
   o FALLECIDO no lo ve).
4. **Estados del bombero.** Ahora son ACTIVO, SUSPENDIDO, LICENCIA, BAJA y FALLECIDO. Revisar cualquier
   pantalla o filtro de la app que muestre el estado de una persona (`servicio_activo.dart` usa
   `RETIRADO` solo para participantes de un servicio, que no cambia).
5. **Matriz por pantalla.** La app sigue con sus códigos `0xA…` y `GET /pantallas/mis-permisos`; la web
   usa `GET /pantallas/mis-permisos-web`. No mezclar. Las reglas web hoy no rigen a la app nativa:
   decidir si la app debe consultar `mis-permisos-web` (o un endpoint propio) para ocultar lo denegado.
6. **Conexión por QR.** La pantalla web Sistema › App móvil genera los mismos QR
   (`sigbo://servidor?url=…` e instalación) que `conectar-celulares.bat`; la app debe leer ese QR
   (`contenidoQrServidor` en `.movile/lib/conexion.dart`) si aún no lo hace.
7. **Actualización.** La web consulta cada 10 s, con reintento (20, 40, hasta 60 s), tope de 30 s por
   intento y sin consultar con la pestaña oculta. En la app conviene el mismo criterio con la app en
   segundo plano, más los SSE existentes (`/despacho/stream`, `/alertas/stream`) y una consulta al
   volver al frente.
8. **No va en la app:** mantenimiento de Snoopy, respaldos, registros, tareas, migraciones, reglas por
   pantalla y configuración.
