/*
============================================================================
 15_bootstrap_local.sql
 SIGBO-CBVC — Arranque minimo del entorno LOCAL
============================================================================
 ATENCION — ALCANCE DE ESTE SCRIPT

 Los scripts 01-14 son REPLICACION del sistema original (estructura y los
 datos semilla que las migraciones documentadas siembran). Este script 15
 NO forma parte de esa replicacion: contiene datos generados localmente,
 necesarios para que la base sea ARRANCABLE y USABLE en el equipo local.

 Existe porque 12_insert_master_data.sql otorga permisos al rol
 'Administrador General', pero la fila de ese rol NO estaba documentada en
 la fuente (ver REPORTE_REPLICACION.md seccion 8, apartado final y seccion
 10). Sin ella, los INSERT de otorgamiento insertan 0 filas y la base
 queda sin ningun rol ni usuario: inutilizable.

 QUE CREA (todo idempotente, WHERE NOT EXISTS):
   1. seguridad.roles           -> 'Administrador General' (es_sistema = 1)
   2. seguridad.asignacion_permisos_rol -> TODOS los permisos existentes
                                   otorgados a ese rol
   3. seguridad.usuarios        -> 1 usuario administrador LOCAL
   4. seguridad.asignacion_roles-> ese usuario <-> ese rol
   5. seguridad.configuracion_sistema -> garantiza la fila unica singleton

 SEGURIDAD — CREDENCIAL DE PRUEBA, NO PRODUCTIVA:
   usuario  : admin.local
   email    : admin.local@sigbo.local
   password : Sigbo.Local.2026
   El hash de abajo es un bcrypt (cost 10) generado en ESTA maquina para
   esa contrasena de prueba. NO proviene del sistema original: no se
   copio, reutilizo ni expuso ninguna credencial real. La cuenta se crea
   con debe_cambiar_password = 1.
   NO USAR ESTA CUENTA FUERA DEL ENTORNO LOCAL.

 EJECUTAR DESPUES de 12_insert_master_data.sql (para que los permisos ya
 existan) y ANTES de 16_insert_test_data.sql.

 Para revertir: 17_rollback_local_data.sql
============================================================================
*/

USE sigbo_cbvc;
GO

SET NOCOUNT ON;
GO

/* ---------------------------------------------------------------------
   1. Rol 'Administrador General'
--------------------------------------------------------------------- */
INSERT INTO seguridad.roles
    (nombre, descripcion, color, icono, prioridad, jerarquia,
     es_administrativo, es_operativo, es_predeterminado, es_sistema, activo)
SELECT N'Administrador General',
       N'Rol con acceso total al sistema. Creado por 15_bootstrap_local.sql para que el entorno local sea utilizable.',
       N'#DC2626', N'shield', 100, 100,
       1, 0, 0, 1, 1
WHERE NOT EXISTS (SELECT 1 FROM seguridad.roles WHERE nombre = N'Administrador General');
GO

/* ---------------------------------------------------------------------
   2. Otorgar TODOS los permisos existentes al rol
      (superconjunto de los otorgamientos puntuales de 12_insert_master_data.sql;
       re-ejecutable sin duplicar)
--------------------------------------------------------------------- */
INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id
FROM seguridad.roles r
CROSS JOIN seguridad.permisos p
WHERE r.nombre = N'Administrador General'
  AND NOT EXISTS (
      SELECT 1 FROM seguridad.asignacion_permisos_rol a
      WHERE a.rol_id = r.id AND a.permiso_id = p.id
  );
GO

/* ---------------------------------------------------------------------
   3. Usuario administrador LOCAL
      password_hash = bcrypt(cost 10) de 'Sigbo.Local.2026'
--------------------------------------------------------------------- */
INSERT INTO seguridad.usuarios
    (email, username, password_hash, salt, estado, idioma, zona_horaria,
     debe_cambiar_password)
SELECT N'admin.local@sigbo.local',
       N'admin.local',
       N'$2b$10$JiXuiMEaNtjLzNB.zqah1uvl2ZpqUEBU6Dgs8GbW40V/ggYLTsQFS',
       N'$2b$10$JiXuiMEaNtjLzNB.zqah1u',
       N'ACTIVO',
       N'es',
       N'America/Asuncion',
       1
WHERE NOT EXISTS (SELECT 1 FROM seguridad.usuarios WHERE username = N'admin.local');
GO

/* ---------------------------------------------------------------------
   4. Asignar el rol al usuario
--------------------------------------------------------------------- */
INSERT INTO seguridad.asignacion_roles (usuario_id, rol_id, motivo)
SELECT u.id, r.id, N'Bootstrap del entorno local (15_bootstrap_local.sql)'
FROM seguridad.usuarios u
CROSS JOIN seguridad.roles r
WHERE u.username = N'admin.local'
  AND r.nombre  = N'Administrador General'
  AND NOT EXISTS (
      SELECT 1 FROM seguridad.asignacion_roles a
      WHERE a.usuario_id = u.id AND a.rol_id = r.id
  );
GO

/* ---------------------------------------------------------------------
   5. Fila singleton de configuracion_sistema
      (12_insert_master_data.sql ya la crea; esto solo cubre el caso de
       una base creada sin ejecutar 12)
--------------------------------------------------------------------- */
IF NOT EXISTS (SELECT 1 FROM seguridad.configuracion_sistema)
BEGIN
    INSERT INTO seguridad.configuracion_sistema
        (logo_login, texto_bajo_logo, nombre_sistema_menu, subtitulo_menu, perfil_edicion_libre)
    VALUES (N'/logo-cbvc.png', N'Cuerpo de Bomberos Voluntarios', N'SIGBO-CBVC', N'Panel principal', 1);
END
GO

/* ---------------------------------------------------------------------
   Resultado
--------------------------------------------------------------------- */
PRINT '--- 15_bootstrap_local.sql ---';
SELECT 'roles'                     AS objeto, COUNT(*) AS filas FROM seguridad.roles
UNION ALL SELECT 'permisos',                  COUNT(*) FROM seguridad.permisos
UNION ALL SELECT 'permisos_del_rol_admin',    COUNT(*) FROM seguridad.asignacion_permisos_rol a
          JOIN seguridad.roles r ON r.id = a.rol_id AND r.nombre = N'Administrador General'
UNION ALL SELECT 'usuarios',                  COUNT(*) FROM seguridad.usuarios
UNION ALL SELECT 'asignacion_roles',          COUNT(*) FROM seguridad.asignacion_roles
UNION ALL SELECT 'configuracion_sistema',     COUNT(*) FROM seguridad.configuracion_sistema;
GO
