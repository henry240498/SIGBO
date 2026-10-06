/* =============================================================
   SIGBO-CBVC | Migracion 084 - Vehiculos: la patente puede faltar
   =============================================================
   Hay moviles antiguos de la institucion cuya chapa no esta legible o no
   figura en la tarjeta. La restriccion UNIQUE de 006 admite una sola fila
   con patente NULL (SQL Server cuenta el NULL como un valor), asi que se
   reemplaza por un indice unico FILTRADO: sigue impidiendo repetir una
   chapa real, pero permite varios moviles sin chapa cargada. */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'UQ_vehiculos_patente' AND parent_object_id = OBJECT_ID('vehiculos.vehiculos'))
    ALTER TABLE vehiculos.vehiculos DROP CONSTRAINT UQ_vehiculos_patente;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_vehiculos_patente' AND object_id = OBJECT_ID('vehiculos.vehiculos'))
    CREATE UNIQUE INDEX UX_vehiculos_patente ON vehiculos.vehiculos (patente) WHERE patente IS NOT NULL;
GO
