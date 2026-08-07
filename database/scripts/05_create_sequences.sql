/*
============================================================================
 05_create_sequences.sql
 SIGBO-CBVC — Secuencias
============================================================================
 No aplica / No determinado.

 El sistema NO usa objetos CREATE SEQUENCE de SQL Server. La generacion de
 identificadores se resuelve, segun evidencia documental explicita
 (seccion 2.2 "Identificadores GUID de SQL Server" y el patron repetido en
 cada tabla del diccionario de datos), de dos formas:

   1) Casi todas las PK: UNIQUEIDENTIFIER NOT NULL DEFAULT NEWSEQUENTIALID()
      — un GUID secuencial generado por el propio motor en cada INSERT.
      Esto NO requiere (ni usa) un objeto SEQUENCE; ya se declara inline en
      cada CREATE TABLE del script 04_create_tables.sql.

   2) La unica excepcion documentada, seguridad.logs_auditoria, usa
      BIGINT IDENTITY(1,1) (columna autoincremental nativa), tampoco un
      objeto SEQUENCE independiente.

 No se encontro evidencia de ningun otro contador (por ejemplo, numeracion
 de folios/documentos) implementado como CREATE SEQUENCE; columnas como
 organizacion.ascensos.codigo o organizacion.designaciones.codigo se
 documentan como NVARCHAR sin restriccion UNIQUE ni relacion con una
 secuencia numerica.

 Este script se deja presente (vacio) solo para respetar la numeracion de
 scripts solicitada.
============================================================================
*/

USE sigbo_cbvc;
GO
