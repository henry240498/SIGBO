/* =============================================================
   SIGBO-CBVC | Migracion 073 - IA: voz local para Snoopy (Etapa 2)
   =============================================================
   Extension del pivote de arquitectura de la migracion 060/072: STT
   (whisper.cpp) y TTS (Piper) son la MISMA clase de excepcion acotada que
   Ollama -- motores que corren en la misma maquina/red local, sin salir a
   internet, sin proveedor, sin "tokens". Ninguno de los dos decide que
   datos se entregan: whisper.cpp solo convierte audio->texto ANTES de que
   el mensaje entre al flujo normal de autorizacion de Snoopy, y Piper solo
   convierte texto->audio DESPUES de que la respuesta ya fue calculada y
   autorizada. Cero logica de negocio nueva, cero tabla nueva: la voz
   vive enteramente en la fila unica de configuracion, igual que Ollama.

   `voz_habilitada` nace en 0 (apagado): instalar esta migracion no
   cambia el comportamiento de ninguna instalacion existente hasta que
   un administrador la prenda explicitamente desde Configuracion. */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF COL_LENGTH('ia.configuraciones', 'voz_habilitada') IS NULL
    ALTER TABLE ia.configuraciones ADD voz_habilitada BIT NOT NULL CONSTRAINT DF_iacfg_voz_hab DEFAULT 0;
GO
IF COL_LENGTH('ia.configuraciones', 'entrada_voz_habilitada') IS NULL
    ALTER TABLE ia.configuraciones ADD entrada_voz_habilitada BIT NOT NULL CONSTRAINT DF_iacfg_voz_entrada DEFAULT 1;
GO
IF COL_LENGTH('ia.configuraciones', 'respuesta_voz_habilitada') IS NULL
    ALTER TABLE ia.configuraciones ADD respuesta_voz_habilitada BIT NOT NULL CONSTRAINT DF_iacfg_voz_respuesta DEFAULT 1;
GO
-- Volumen/velocidad se aplican en el navegador (HTMLAudioElement.volume /
-- playbackRate) sobre el audio ya generado -- no se le pide a Piper que
-- vuelva a sintetizar por cada cambio, el usuario los ajusta en caliente.
IF COL_LENGTH('ia.configuraciones', 'voz_volumen') IS NULL
    ALTER TABLE ia.configuraciones ADD voz_volumen DECIMAL(3,2) NOT NULL CONSTRAINT DF_iacfg_voz_volumen DEFAULT 1.00;
GO
IF COL_LENGTH('ia.configuraciones', 'voz_velocidad') IS NULL
    ALTER TABLE ia.configuraciones ADD voz_velocidad DECIMAL(3,2) NOT NULL CONSTRAINT DF_iacfg_voz_velocidad DEFAULT 1.00;
GO
-- Nombre del archivo de voz de Piper (ej. "es_AR-daniela-high"), no la ruta
-- completa -- la ruta real se arma contra piper_ruta_voz / la carpeta de
-- voces configurada, igual que ollama_modelo es un nombre, no una ruta.
IF COL_LENGTH('ia.configuraciones', 'voz_seleccionada') IS NULL
    ALTER TABLE ia.configuraciones ADD voz_seleccionada NVARCHAR(150) NULL;
GO
IF COL_LENGTH('ia.configuraciones', 'voz_idioma') IS NULL
    ALTER TABLE ia.configuraciones ADD voz_idioma NVARCHAR(10) NOT NULL CONSTRAINT DF_iacfg_voz_idioma DEFAULT N'es';
GO

IF COL_LENGTH('ia.configuraciones', 'whisper_url') IS NULL
    ALTER TABLE ia.configuraciones ADD whisper_url NVARCHAR(200) NOT NULL CONSTRAINT DF_iacfg_whisper_url DEFAULT N'http://localhost';
GO
IF COL_LENGTH('ia.configuraciones', 'whisper_puerto') IS NULL
    ALTER TABLE ia.configuraciones ADD whisper_puerto INT NOT NULL CONSTRAINT DF_iacfg_whisper_puerto DEFAULT 8090;
GO
IF COL_LENGTH('ia.configuraciones', 'whisper_timeout_ms') IS NULL
    ALTER TABLE ia.configuraciones ADD whisper_timeout_ms INT NOT NULL CONSTRAINT DF_iacfg_whisper_timeout DEFAULT 15000;
GO

-- Rutas de archivo (no hay "lista de modelos instalados" vía HTTP como en
-- Ollama: whisper-server carga UN modelo al arrancar por linea de comando,
-- y Piper es un binario CLI, no un servicio con API de inventario -- por
-- eso ambas quedan como ruta configurable en vez de nombre+catalogo).
IF COL_LENGTH('ia.configuraciones', 'piper_ruta_binario') IS NULL
    ALTER TABLE ia.configuraciones ADD piper_ruta_binario NVARCHAR(400) NULL;
GO
IF COL_LENGTH('ia.configuraciones', 'piper_ruta_voz') IS NULL
    ALTER TABLE ia.configuraciones ADD piper_ruta_voz NVARCHAR(400) NULL;
GO
IF COL_LENGTH('ia.configuraciones', 'piper_timeout_ms') IS NULL
    ALTER TABLE ia.configuraciones ADD piper_timeout_ms INT NOT NULL CONSTRAINT DF_iacfg_piper_timeout DEFAULT 15000;
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_iacfg_voz_volumen')
    ALTER TABLE ia.configuraciones ADD CONSTRAINT CK_iacfg_voz_volumen CHECK (voz_volumen BETWEEN 0 AND 1);
GO
IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_iacfg_voz_velocidad')
    ALTER TABLE ia.configuraciones ADD CONSTRAINT CK_iacfg_voz_velocidad CHECK (voz_velocidad BETWEEN 0.5 AND 2.0);
GO
IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_iacfg_whisper_puerto')
    ALTER TABLE ia.configuraciones ADD CONSTRAINT CK_iacfg_whisper_puerto CHECK (whisper_puerto BETWEEN 1 AND 65535);
GO
IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_iacfg_whisper_timeout')
    ALTER TABLE ia.configuraciones ADD CONSTRAINT CK_iacfg_whisper_timeout CHECK (whisper_timeout_ms BETWEEN 500 AND 120000);
GO
IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_iacfg_piper_timeout')
    ALTER TABLE ia.configuraciones ADD CONSTRAINT CK_iacfg_piper_timeout CHECK (piper_timeout_ms BETWEEN 500 AND 120000);
GO
