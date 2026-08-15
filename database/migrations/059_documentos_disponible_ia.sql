/* =============================================================
   SIGBO-CBVC | Migracion 059 - Documentos: disponibilidad para IA
   =============================================================
   Seccion 20 del pedido de Inteligencia Artificial: cada documento
   puede marcarse "disponible para IA" para excluir documentos
   sensibles de las busquedas de Snoopy sin tocar su clasificacion de
   confidencialidad (que sigue aplicando ademas de este flag -- ver
   DocumentosService.verificarAccesoConfidencial, reutilizado tal
   cual por la herramienta get_documentos). Por defecto en 0
   (opt-in): ningun documento existente queda expuesto a la IA hasta
   que alguien lo habilite explicitamente.
   ============================================================= */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('documentos.documentos_institucionales') AND name = 'disponible_para_ia')
    ALTER TABLE documentos.documentos_institucionales ADD disponible_para_ia BIT NOT NULL CONSTRAINT DF_doci_dispia DEFAULT 0;
GO
