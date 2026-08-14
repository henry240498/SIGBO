# Configuración, publicaciones y cuenta

## Estado implementado

- La página pública solo muestra contenido editorial publicado desde `Publicaciones`.
- Las estadísticas públicas se calculan desde datos operativos reales y no crean registros.
- Las publicaciones persisten en `contenido.publicaciones`; cada registro conserva visibilidad, estado, orden, fechas y contenido independiente.
- La configuración global usa borradores, validación, publicación, historial, restauración y auditoría.
- Las preferencias personales se guardan por usuario y también en el dispositivo.
- Cada usuario puede consultar y cerrar sus propias sesiones. El cierre total obliga a iniciar sesión nuevamente.
- El bloqueo por intentos fallidos y la expiración de tokens son mecanismos reales del backend.
- MFA no se anuncia como disponible porque todavía no existe proveedor ni flujo de enrolamiento real.

## Migraciones nuevas

Ejecutar en orden:

1. `021_configuracion_integral.sql`
2. `022_permiso_publicaciones.sql`
3. `023_publicaciones_persistencia.sql`
4. `024_personal_reconciliacion_segura.sql`

La migración 024 es deliberadamente de solo verificación: evita una reconstrucción global y falla con un mensaje preciso si no se aplicaron correctamente las migraciones específicas de Personal.

## Comprobación

Desde `backend` y `frontend`, ejecutar `npm run build`. Después de iniciar ambos servicios, verificar `/api/v1/publicaciones/publicas`, `/api/v1/publicaciones/estadisticas` y la página `/`.

Los endpoints de preferencias y sesiones requieren autenticación. Los endpoints administrativos mantienen sus permisos correspondientes.
