/* =============================================================
   SIGBO-CBVC | Migracion 075 - Vehiculos: alias/apodo
   =============================================================
   Fase de cierre de Snoopy: confirmado contra el modelo real (27
   columnas de vehiculos.vehiculos, revisadas una por una) que no existe
   ningun campo de alias/apodo -- "Murita" no resuelve a ningun vehiculo
   porque no hay donde guardarlo. Columna nueva, opcional (la gran
   mayoria de los vehiculos no tiene un apodo informal): no reemplaza a
   numero_interno/patente/chasis, es solo una forma adicional de
   identificar el vehiculo en busquedas (modulo Vehiculos y Snoopy). */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF COL_LENGTH('vehiculos.vehiculos', 'alias') IS NULL
    ALTER TABLE vehiculos.vehiculos ADD alias NVARCHAR(50) NULL;
GO
