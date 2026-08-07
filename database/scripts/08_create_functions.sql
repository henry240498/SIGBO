/*
============================================================================
 08_create_functions.sql
 SIGBO-CBVC — Funciones definidas por el usuario
============================================================================
 No determinado / No detectado.

 El documento fuente afirma explicitamente, para cada bloque de
 migraciones revisado (000-003, 004-006, 007-010, 011-012, 013-015):
 "No hay vistas, procedimientos almacenados, funciones ni triggers en
 estos archivos" (frase equivalente repetida en cada bloque).

 La logica de negocio del sistema (calculo de antiguedad, generacion de
 reportes Excel/PDF, motor de politicas RBAC, validacion de contrasenas,
 etc.) esta implementada en la CAPA DE APLICACION (NestJS/TypeScript),
 NO en la base de datos, con la unica excepcion de las columnas
 CALCULADAS (computed columns) declaradas inline en 04_create_tables.sql:
   - personal.bomberos.antiguedad
   - academia.materias.horas_totales
   - academia.inscripciones_cursos.participante_id
   - servicios.servicios.kilometraje_total

 Este script se deja presente (vacio) solo para respetar la numeracion de
 scripts solicitada. No hay funciones que crear.
============================================================================
*/

USE sigbo_cbvc;
GO
