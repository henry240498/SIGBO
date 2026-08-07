/* =============================================================
   SIGBO-CBVC | Migracion 001 - Esquemas
   Motor: Microsoft SQL Server 2019+
   ============================================================= */

IF SCHEMA_ID('seguridad')   IS NULL EXEC('CREATE SCHEMA seguridad');
GO
IF SCHEMA_ID('personal')    IS NULL EXEC('CREATE SCHEMA personal');
GO
IF SCHEMA_ID('academia')    IS NULL EXEC('CREATE SCHEMA academia');
GO
IF SCHEMA_ID('operaciones') IS NULL EXEC('CREATE SCHEMA operaciones');
GO
IF SCHEMA_ID('servicios')   IS NULL EXEC('CREATE SCHEMA servicios');
GO
IF SCHEMA_ID('vehiculos')   IS NULL EXEC('CREATE SCHEMA vehiculos');
GO
IF SCHEMA_ID('equipos')     IS NULL EXEC('CREATE SCHEMA equipos');
GO
IF SCHEMA_ID('finanzas')    IS NULL EXEC('CREATE SCHEMA finanzas');
GO
IF SCHEMA_ID('deposito')    IS NULL EXEC('CREATE SCHEMA deposito');
GO
IF SCHEMA_ID('documentos')  IS NULL EXEC('CREATE SCHEMA documentos');
GO
