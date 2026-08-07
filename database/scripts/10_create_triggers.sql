/*
============================================================================
 10_create_triggers.sql
 SIGBO-CBVC — Triggers
============================================================================
 No determinado / No detectado.

 Ver justificacion completa en el encabezado de 08_create_functions.sql:
 el documento fuente confirma explicitamente la ausencia de CREATE TRIGGER
 en todo el lote de migraciones revisado (000-015). Las columnas
 actualizado_en NO se mantienen via trigger; se asume (sin evidencia
 directa del ORM en este repositorio, ver REPORTE_REPLICACION.md seccion
 10) que TypeORM las reescribe desde la aplicacion en cada UPDATE, patron
 habitual de @UpdateDateColumn en este framework.

 Script vacio, presente solo por numeracion.
============================================================================
*/

USE sigbo_cbvc;
GO
