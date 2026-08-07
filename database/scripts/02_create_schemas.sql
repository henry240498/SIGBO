/*
============================================================================
 02_create_schemas.sql
 SIGBO-CBVC — Creacion de esquemas
============================================================================
 Fuente: "001_schemas.sql: crea (cada uno condicional via SCHEMA_ID) los 10
 esquemas logicos del sistema: seguridad, personal, academia, operaciones,
 servicios, vehiculos, equipos, finanzas, deposito, documentos."

 El esquema "organizacion" (11vo) se documenta como creado aparte, dentro
 de la migracion 012_organizacion.sql: "IF SCHEMA_ID('organizacion') IS
 NULL EXEC('CREATE SCHEMA organizacion')". Se incluye aqui igualmente para
 que este script agrupe la creacion de TODOS los esquemas de una vez
 (11 en total, cifra confirmada en el resumen numerico del documento
 fuente: "Esquemas de base de datos: 11").
============================================================================
*/

USE sigbo_cbvc;
GO

IF SCHEMA_ID(N'seguridad') IS NULL EXEC('CREATE SCHEMA seguridad');
GO
IF SCHEMA_ID(N'personal') IS NULL EXEC('CREATE SCHEMA personal');
GO
IF SCHEMA_ID(N'academia') IS NULL EXEC('CREATE SCHEMA academia');
GO
IF SCHEMA_ID(N'operaciones') IS NULL EXEC('CREATE SCHEMA operaciones');
GO
IF SCHEMA_ID(N'servicios') IS NULL EXEC('CREATE SCHEMA servicios');
GO
IF SCHEMA_ID(N'vehiculos') IS NULL EXEC('CREATE SCHEMA vehiculos');
GO
IF SCHEMA_ID(N'equipos') IS NULL EXEC('CREATE SCHEMA equipos');
GO
IF SCHEMA_ID(N'finanzas') IS NULL EXEC('CREATE SCHEMA finanzas');
GO
IF SCHEMA_ID(N'deposito') IS NULL EXEC('CREATE SCHEMA deposito');
GO
IF SCHEMA_ID(N'documentos') IS NULL EXEC('CREATE SCHEMA documentos');
GO
IF SCHEMA_ID(N'organizacion') IS NULL EXEC('CREATE SCHEMA organizacion');
GO

/*
    Tablas por esquema (evidencia: seccion "2.3 Esquemas de la Base de
    Datos" del documento fuente):
      seguridad     13   organizacion   12   personal     6
      academia       7   operaciones     5   vehiculos    3
      equipos        4   servicios       4   finanzas     2
      deposito       2   documentos      1
      TOTAL: 59 tablas (coincide con el "Resumen Numerico": 59)
*/
