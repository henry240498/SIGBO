/* =============================================================
   SIGBO-CBVC | Migracion 072 - IA: Ollama como motor local de Snoopy
   =============================================================
   Etapa 1 de "INTEGRACION DE OLLAMA LOCAL CON SNOOPY" (pedido del
   usuario). NO es un regreso a la migracion 057 (Snoopy cliente de un
   LLM externo, revertido por la migracion 060): Ollama corre en la
   misma maquina, sin llamadas salientes, sin dependencia de red, sin
   "tokens" de un proveedor -- exactamente las razones por las que se
   habia sacado el proveedor externo siguen respetadas. La diferencia es
   que ahora el motor puede, opcionalmente, apoyarse en un modelo local
   para (a) sugerir que herramienta usar cuando el reconocimiento por
   patrones no encuentra ninguna, y (b) redactar en lenguaje mas natural
   un resultado que SIGBO ya calculo y ya autorizo. Ollama nunca decide
   que datos se entregan ni consulta la base directamente.

   `ollama_habilitado` nace en 0 (apagado): instalar esta migracion no
   cambia el comportamiento de ninguna instalacion existente hasta que
   un administrador lo prenda explicitamente desde Configuracion.
   ============================================================= */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF COL_LENGTH('ia.configuraciones', 'ollama_habilitado') IS NULL
    ALTER TABLE ia.configuraciones ADD ollama_habilitado BIT NOT NULL CONSTRAINT DF_iacfg_ollama_hab DEFAULT 0;
GO
IF COL_LENGTH('ia.configuraciones', 'ollama_url') IS NULL
    ALTER TABLE ia.configuraciones ADD ollama_url NVARCHAR(200) NOT NULL CONSTRAINT DF_iacfg_ollama_url DEFAULT N'http://localhost';
GO
IF COL_LENGTH('ia.configuraciones', 'ollama_puerto') IS NULL
    ALTER TABLE ia.configuraciones ADD ollama_puerto INT NOT NULL CONSTRAINT DF_iacfg_ollama_puerto DEFAULT 11434;
GO
IF COL_LENGTH('ia.configuraciones', 'ollama_modelo') IS NULL
    ALTER TABLE ia.configuraciones ADD ollama_modelo NVARCHAR(100) NULL;
GO
IF COL_LENGTH('ia.configuraciones', 'ollama_timeout_ms') IS NULL
    ALTER TABLE ia.configuraciones ADD ollama_timeout_ms INT NOT NULL CONSTRAINT DF_iacfg_ollama_timeout DEFAULT 8000;
GO
IF COL_LENGTH('ia.configuraciones', 'ollama_temperatura') IS NULL
    ALTER TABLE ia.configuraciones ADD ollama_temperatura DECIMAL(3,2) NOT NULL CONSTRAINT DF_iacfg_ollama_temp DEFAULT 0.30;
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_iacfg_ollama_puerto')
    ALTER TABLE ia.configuraciones ADD CONSTRAINT CK_iacfg_ollama_puerto CHECK (ollama_puerto BETWEEN 1 AND 65535);
GO
IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_iacfg_ollama_timeout')
    ALTER TABLE ia.configuraciones ADD CONSTRAINT CK_iacfg_ollama_timeout CHECK (ollama_timeout_ms BETWEEN 500 AND 120000);
GO
IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_iacfg_ollama_temp')
    ALTER TABLE ia.configuraciones ADD CONSTRAINT CK_iacfg_ollama_temp CHECK (ollama_temperatura BETWEEN 0 AND 1);
GO

/* Informativo unicamente (que modelo local ayudo a redactar este
   mensaje puntual, si alguno) -- NO es un regreso a modelo/tokens de
   la migracion 057: no se factura nada, no hay proveedor, y queda NULL
   en el 100% de los mensajes mientras Ollama este apagado. */
IF COL_LENGTH('ia.mensajes', 'modelo_utilizado') IS NULL
    ALTER TABLE ia.mensajes ADD modelo_utilizado NVARCHAR(100) NULL;
GO
