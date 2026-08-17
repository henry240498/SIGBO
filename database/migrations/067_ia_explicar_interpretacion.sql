/* =============================================================
   SIGBO-CBVC | Migracion 067 - IA: explicar interpretacion
   =============================================================
   Motor de interpretacion semantica de Snoopy: cuando esta activo,
   la respuesta antepone como interpreto la consulta (modulo,
   intencion, filtros detectados) para poder verificar que el motor
   entendio bien -- seccion 25 del pedido de lenguaje natural.
   Apagado por defecto: es una ayuda de depuracion/confianza, no el
   comportamiento de fabrica.
   ============================================================= */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('ia.configuraciones') AND name = 'explicar_interpretacion')
    ALTER TABLE ia.configuraciones ADD explicar_interpretacion BIT NOT NULL CONSTRAINT DF_iaconf_explicar DEFAULT 0;
GO
