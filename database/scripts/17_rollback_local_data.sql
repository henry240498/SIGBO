/*
============================================================================
 17_rollback_local_data.sql
 SIGBO-CBVC — Revertir SOLO los datos locales (scripts 15 y 16)
============================================================================
 Borra unicamente lo que crearon 15_bootstrap_local.sql y
 16_insert_test_data.sql. NO toca la estructura (tablas, FKs, indices) ni
 los datos maestros replicados por 12_insert_master_data.sql (permisos y
 configuracion), que SI forman parte de la replicacion del sistema
 original.

 Usar antes de cargar un dump real, para que los datos ficticios no se
 mezclen con datos verdaderos.

 El borrado va en orden inverso a las dependencias (hijos antes que
 padres) para no violar las FOREIGN KEY.

 SEGURIDAD: este script solo debe ejecutarse contra la base LOCAL
 sigbo_cbvc en localhost. El bloque de guarda de abajo aborta si se
 ejecuta contra un servidor que no sea el local.
============================================================================
*/

USE sigbo_cbvc;
GO

SET NOCOUNT ON;
GO

/* ---- guarda: solo entorno local ------------------------------------ */
IF NOT (SERVERPROPERTY('MachineName') = CAST(HOST_NAME() AS NVARCHAR(128)))
BEGIN
    RAISERROR('ABORTADO: el cliente y el servidor no estan en la misma maquina. Este script solo debe ejecutarse contra la instancia LOCAL.', 16, 1);
    SET NOEXEC ON;
END
GO

/* ---- 1. datos de prueba (16) --------------------------------------- */
UPDATE seguridad.usuarios SET bombero_id = NULL WHERE username = N'admin.local';
UPDATE organizacion.cuarteles SET responsable_bombero_id = NULL WHERE codigo LIKE N'CU-0%';
GO

DELETE d FROM organizacion.designaciones d
JOIN personal.bomberos b ON b.id = d.bombero_id
WHERE b.cedula LIKE N'10000%';

DELETE x FROM personal.bombero_especialidades x
JOIN personal.bomberos b ON b.id = x.bombero_id
WHERE b.cedula LIKE N'10000%';

DELETE FROM personal.bomberos            WHERE cedula LIKE N'10000%';
DELETE FROM organizacion.cuarteles       WHERE codigo LIKE N'CU-0%';
DELETE FROM organizacion.companias       WHERE codigo LIKE N'CIA-0%';
DELETE FROM organizacion.especialidades  WHERE codigo LIKE N'ES-0%';
UPDATE organizacion.cargos SET dependencia_cargo_id = NULL WHERE codigo LIKE N'CG-0%';
DELETE FROM organizacion.cargos          WHERE codigo LIKE N'CG-0%';
DELETE FROM organizacion.rangos          WHERE codigo LIKE N'RG-0%';
GO

/* ---- 2. bootstrap local (15) --------------------------------------- */
DELETE a FROM seguridad.asignacion_roles a
JOIN seguridad.usuarios u ON u.id = a.usuario_id
WHERE u.username = N'admin.local';

DELETE FROM seguridad.usuarios WHERE username = N'admin.local';
GO

/*
   El rol 'Administrador General' y sus permisos NO se borran por defecto:
   el rol se referencia explicitamente en 12_insert_master_data.sql, que
   SI es parte de la replicacion. Descomentar solo si se quiere dejar la
   base sin ningun rol:

   DELETE a FROM seguridad.asignacion_permisos_rol a
   JOIN seguridad.roles r ON r.id = a.rol_id
   WHERE r.nombre = N'Administrador General';
   DELETE FROM seguridad.roles WHERE nombre = N'Administrador General';
*/

SET NOEXEC OFF;
GO

PRINT '--- 17_rollback_local_data.sql: datos locales revertidos ---';
SELECT 'personal.bomberos' AS tabla, COUNT(*) AS filas FROM personal.bomberos
UNION ALL SELECT 'organizacion.companias', COUNT(*) FROM organizacion.companias
UNION ALL SELECT 'seguridad.usuarios',     COUNT(*) FROM seguridad.usuarios;
GO
