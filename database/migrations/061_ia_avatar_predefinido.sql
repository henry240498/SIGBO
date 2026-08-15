/* =============================================================
   SIGBO-CBVC | Migracion 061 - IA: avatar predefinido (emoji + color)
   =============================================================
   Alternativa sin archivo a la subida de imagen (que depende de que el
   navegador construya bien la URL contra el backend, seccion "no
   funciona" reportada por la institucion): un avatar predefinido es solo
   un emoji + un color de fondo, se renderiza al instante en el frontend,
   no hay archivo que subir ni servir -- cero superficie para que falle.
   `avatar_url` sigue existiendo para quien prefiera subir una imagen
   propia; son mutuamente excluyentes, el que se elige de ultimo gana
   (ver IaConfiguracionService.seleccionarAvatarPredefinido/actualizarAvatar).
   ============================================================= */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('ia.configuraciones') AND name = 'avatar_emoji')
    ALTER TABLE ia.configuraciones ADD avatar_emoji NVARCHAR(20) NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('ia.configuraciones') AND name = 'avatar_color_fondo')
    ALTER TABLE ia.configuraciones ADD avatar_color_fondo NVARCHAR(20) NULL;
GO

UPDATE ia.configuraciones SET avatar_emoji = N'🐶', avatar_color_fondo = N'#334155' WHERE avatar_url IS NULL AND avatar_emoji IS NULL;
GO
