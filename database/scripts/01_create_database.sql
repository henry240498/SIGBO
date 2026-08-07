/*
============================================================================
 01_create_database.sql
 SIGBO-CBVC — Creacion de la base de datos
============================================================================
 Motor    : Microsoft SQL Server 2019 Express (evidencia documental, ver
            REPORTE_REPLICACION.md seccion 1 "Resumen")
 Fuente   : Documento "SIGBO-CBVC_Documentacion_Sistema_2026-08-04.docx",
            nota de migracion "000_create_database.sql: solo crea la base
            de datos 'sigbo_cbvc' de forma condicional (IF DB_ID('sigbo_cbvc')
            IS NULL). No define tablas ni ningun otro objeto."
 Nota     : El nombre real de la base de datos ("sigbo_cbvc") SI esta
            documentado explicitamente en el .docx. Las opciones de
            configuracion (collation, tamano de archivos, autogrowth,
            recovery model) NO estan documentadas => "No determinado".
            Se dejan comentadas mas abajo como referencia de valores por
            defecto de SQL Server 2019 Express, NO como dato verificado.
============================================================================
*/

USE master;
GO

IF DB_ID(N'sigbo_cbvc') IS NULL
BEGIN
    CREATE DATABASE sigbo_cbvc;
    -- Collation: No determinado en la documentacion fuente.
    -- Si el entorno original usa una collation distinta a la del servidor
    -- destino, agregar aqui: COLLATE <collation_verificada>
END
GO

/*
    No determinado / no verificable con la evidencia disponible:
      - Collation de la base de datos.
      - Tamano inicial y autogrowth de archivos de datos/log.
      - Recovery model (SIMPLE/FULL/BULK_LOGGED).
      - Compatibility level.
    Antes de un despliegue productivo, confirmar estos valores contra el
    servidor SQL Server 2019 Express original (por ejemplo con
    sp_helpdb sigbo_cbvc) y ajustarlos aqui explicitamente.
*/

USE sigbo_cbvc;
GO
