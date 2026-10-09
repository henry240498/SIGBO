/* Base DESECHABLE para la prueba de integración GRE (backend/src/modules/gre/gre-integracion.spec.ts).
   Crea una base NUEVA sigbo_gre_prueba_<16 hex>, indicada por BaseGre.
   No borra ni reutiliza bases existentes. Usar probar_integracion.cjs.
   Solo crea las dos tablas de seguridad de las que dependen 094 y la auditoría. */
IF N'$(BaseGre)' NOT LIKE N'sigbo_gre_prueba[_]%'
   OR LEN(N'$(BaseGre)') <> 33
   OR SUBSTRING(N'$(BaseGre)', 18, 16) LIKE N'%[^0-9a-f]%' COLLATE Latin1_General_100_BIN2
    THROW 51094, N'Nombre de base de prueba no permitido.', 1;
IF DB_ID(N'$(BaseGre)') IS NOT NULL
    THROW 51094, N'La base de prueba ya existe: no se recrea.', 1;
GO
CREATE DATABASE [$(BaseGre)];
GO
USE [$(BaseGre)];
GO
EXEC(N'CREATE SCHEMA seguridad');
GO
CREATE TABLE seguridad.usuarios (id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY, username NVARCHAR(100) NOT NULL);
CREATE TABLE seguridad.logs_auditoria (
    id BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    usuario_id UNIQUEIDENTIFIER NULL, accion NVARCHAR(100) NOT NULL, recurso NVARCHAR(100) NOT NULL,
    recurso_id UNIQUEIDENTIFIER NULL, ip VARCHAR(45) NULL, user_agent NVARCHAR(MAX) NULL,
    datos_antes NVARCHAR(MAX) NULL, datos_despues NVARCHAR(MAX) NULL, metadata NVARCHAR(MAX) NULL,
    fecha DATETIMEOFFSET(3) NOT NULL DEFAULT SYSDATETIMEOFFSET());
GO
IF EXISTS (SELECT 1 FROM sys.server_principals WHERE name = N'sigbo_app')
BEGIN
    CREATE USER sigbo_app FOR LOGIN sigbo_app;
    ALTER ROLE db_owner ADD MEMBER sigbo_app;
END
GO
