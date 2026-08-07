/*
============================================================================
 11_create_views.sql
 SIGBO-CBVC — Vistas y vistas materializadas
============================================================================
 No determinado / No detectado.

 Ver justificacion completa en el encabezado de 08_create_functions.sql:
 el documento fuente confirma explicitamente la ausencia de CREATE VIEW en
 todo el lote de migraciones revisado (000-015). Los "dashboards" y
 paneles de indicadores documentados en la seccion 4 (ej. GET
 /organizacion/dashboard, GET /seguridad/dashboard) se calculan con
 consultas agregadas ad-hoc desde el backend (NestJS/TypeORM), no contra
 vistas de base de datos.

 SQL Server no tiene "materialized views" con esa sintaxis (el equivalente
 es una vista con indexed view / CREATE UNIQUE CLUSTERED INDEX sobre una
 vista SCHEMABINDING); no se encontro evidencia de que el sistema use ese
 mecanismo.

 Script vacio, presente solo por numeracion.
============================================================================
*/

USE sigbo_cbvc;
GO
