/* =============================================================
   SIGBO-CBVC | Migracion 000 - Crear base de datos
   ============================================================= */

IF DB_ID('sigbo_cbvc') IS NULL
BEGIN
    CREATE DATABASE sigbo_cbvc;
END
GO
