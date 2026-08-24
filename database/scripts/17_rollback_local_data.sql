/*
============================================================================
 ARCHIVADO - no ejecutar
============================================================================

 El anterior rollback eliminaba datos creados por scripts de bootstrap y
 prueba que ya no forman parte de la ruta vigente. Se bloquea para evitar
 una eliminacion inesperada. Use un procedimiento de recuperacion aprobado
 y respaldos verificados para cualquier cambio real de datos.
============================================================================
*/

THROW 51002, N'17_rollback_local_data.sql esta archivado y no elimina datos.', 1;
GO
