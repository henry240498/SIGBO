/*
============================================================================
 13_insert_initial_data.sql
 SIGBO-CBVC — Datos operativos / iniciales reales
============================================================================
 No disponible.

 Este proyecto NO tuvo acceso a un dump, backup (.bak) ni export de la
 base de datos real ni a ningun archivo de datos (CSV/JSON/INSERT) con
 registros operativos (usuarios reales, bomberos, servicios, vehiculos,
 movimientos, etc.). Todo lo relevado en REPORTE_REPLICACION.md y en los
 scripts 01-12 corresponde a ESTRUCTURA y a la porcion de datos maestros
 (permisos, configuracion) que las migraciones siembran de forma
 explicita e idempotente.

 QUE HACER PARA COMPLETAR ESTE SCRIPT (ver tambien REPORTE_REPLICACION.md
 seccion 7 "Instrucciones para datos"):
   1. Obtener acceso al servidor SQL Server 2019 Express origen (ver
      workflows/scripts/backup_sqlserver.ps1 en este mismo repositorio,
      que ya automatiza un BACKUP DATABASE ... WITH COPY_ONLY).
   2. Restaurar ese .bak en un entorno de staging.
   3. Exportar los datos operativos con el mecanismo apropiado al volumen
      real (ver seccion 7 del reporte: BCP/bulk export + BULK INSERT para
      volumenes grandes, o generar INSERTs para tablas pequenas de
      catalogo).
   4. Respetar el ORDEN DE CARGA documentado en REPORTE_REPLICACION.md
      seccion 5 "Orden de ejecucion" (padres antes que hijos, catalogos
      organizacion.* antes que personal.bomberos, personal.bomberos antes
      que organizacion.designaciones/ascensos, servicios.servicios antes
      que sus tablas hijas, etc.).
   5. Restaurar los valores de NEWSEQUENTIALID() se resuelve solo (cada
      INSERT sin especificar el id genera uno nuevo); si se preservan los
      GUID originales (recomendado para no romper relaciones), insertar
      el id explicitamente en el INSERT en lugar de dejar el DEFAULT.
   6. seguridad.logs_auditoria.id es BIGINT IDENTITY(1,1): si se migran
      filas reales conservando su id original, usar
      SET IDENTITY_INSERT seguridad.logs_auditoria ON/OFF alrededor del
      INSERT.

 Este archivo se deja como PLANTILLA (sin datos) para no inventar
 registros que no existen en la evidencia disponible.
============================================================================
*/

USE sigbo_cbvc;
GO

-- Plantilla de referencia (comentada) para cargar un catalogo pequeno
-- preservando el id original si se dispone del dump real:
--
-- SET IDENTITY_INSERT seguridad.logs_auditoria ON;
-- INSERT INTO seguridad.logs_auditoria (id, usuario_id, accion, recurso, fecha)
-- VALUES (1, N'...', N'LOGIN', N'seguridad.usuarios', SYSDATETIMEOFFSET());
-- SET IDENTITY_INSERT seguridad.logs_auditoria OFF;
