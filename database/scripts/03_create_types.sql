/*
============================================================================
 03_create_types.sql
 SIGBO-CBVC — Tipos de datos definidos por el usuario / extensiones
============================================================================
 No determinado.

 La documentacion fuente ("SIGBO-CBVC_Documentacion_Sistema_2026-08-04.docx")
 no menciona en ningun punto:
   - CREATE TYPE (alias types ni table types).
   - Extensiones de SQL Server (SQL Server no tiene el concepto de
     "extensiones" al estilo PostgreSQL; no aplica).
   - Dominios personalizados.

 Todos los "tipos especiales" que el sistema necesita se resuelven con
 tipos nativos de SQL Server 2019 combinados con CHECK constraints:
   - Listas cerradas de valores (ENUM-like)  -> NVARCHAR(n) + CHECK IN (...)
   - JSON                                    -> NVARCHAR(MAX) + CHECK (ISJSON(col) = 1)
   - Coordenadas geograficas (reemplazo de POINT de PostgreSQL, segun
     comentario explicito encontrado en 003_personal.sql) -> dos columnas
     DECIMAL(10,8) / DECIMAL(11,8) (latitud/longitud)

 Este script se deja presente (vacio, solo documentacion) unicamente para
 respetar la numeracion estandar de scripts solicitada. No hay nada que
 ejecutar.
============================================================================
*/

USE sigbo_cbvc;
GO
