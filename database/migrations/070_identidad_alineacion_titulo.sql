/* =============================================================
   SIGBO-CBVC | Migracion 070 - Identidad institucional: alineacion del titulo
   =============================================================
   Configuracion global (fila unica en organizacion.identidad_institucional,
   mismo patron que logos/pie de pagina): donde va el titulo/numero/fecha en
   la cabecera de CUALQUIER documento generado por SIGBO. Se agrega aca y no
   por-documento/por-plantilla porque el pedido pide "todo documento", y la
   institucion ya tiene un solo lugar para decidir el aspecto del membrete
   (seccion "un solo lugar, no un membrete distinto por modulo").
   ============================================================= */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF COL_LENGTH('organizacion.identidad_institucional', 'alineacion_titulo') IS NULL
    ALTER TABLE organizacion.identidad_institucional ADD alineacion_titulo NVARCHAR(20) NOT NULL CONSTRAINT DF_ident_alineacion DEFAULT N'CENTRO';
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_ident_alineacion')
    ALTER TABLE organizacion.identidad_institucional ADD CONSTRAINT CK_ident_alineacion CHECK (alineacion_titulo IN (N'IZQUIERDA', N'CENTRO', N'DERECHA'));
GO
