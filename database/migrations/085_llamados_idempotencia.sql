/* =============================================================
   SIGBO-CBVC | Migracion 085 - Llamados: clave de idempotencia
   =============================================================
   La app movil registra llamados sin conexion y los envia despues. Si la
   respuesta del servidor se pierde, el celular reintenta: con esta clave el
   servidor reconoce el reintento y no crea un llamado repetido. */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF COL_LENGTH('servicios.llamados', 'clave_idempotencia') IS NULL
    ALTER TABLE servicios.llamados ADD clave_idempotencia NVARCHAR(64) NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_llam_clave' AND object_id = OBJECT_ID('servicios.llamados'))
    CREATE UNIQUE INDEX UX_llam_clave ON servicios.llamados (clave_idempotencia) WHERE clave_idempotencia IS NOT NULL;
GO
