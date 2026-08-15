/* =============================================================
   SIGBO-CBVC | Migracion 060 - IA: motor local, sin proveedor externo
   =============================================================
   Pivote de arquitectura (pedido del usuario, corrige la migracion 057):
   Snoopy deja de ser un cliente de un LLM externo (Anthropic) y pasa a
   ser un motor de reconocimiento de intenciones construido en el propio
   backend de SIGBO -- sin llamadas salientes, sin dependencia de red,
   sin limite ligado a "tokens" de un proveedor. Se quitan las columnas
   que solo tenian sentido con un proveedor externo (modelo/tokens) y se
   agrega:
     - `limite_activo` en ia.configuraciones: el limitador de consultas
       por usuario (proteccion tecnica anti-abuso, no un presupuesto de
       costo) ahora es opt-in, apagado por defecto ("sin limites").
     - `ultimo_contexto_json` en ia.conversaciones: recuerda la ultima
       herramienta/argumentos usados para resolver preguntas de
       seguimiento ("y a que hora termina") sin un LLM que mantenga
       contexto por si solo (seccion 51 del pedido original).
   ============================================================= */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF EXISTS (SELECT 1 FROM sys.default_constraints WHERE name = 'DF_iacfg_proveedor')
    ALTER TABLE ia.configuraciones DROP CONSTRAINT DF_iacfg_proveedor;
GO
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('ia.configuraciones') AND name = 'proveedor')
    ALTER TABLE ia.configuraciones DROP COLUMN proveedor;
GO

IF EXISTS (SELECT 1 FROM sys.default_constraints WHERE name = 'DF_iacfg_modelo')
    ALTER TABLE ia.configuraciones DROP CONSTRAINT DF_iacfg_modelo;
GO
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('ia.configuraciones') AND name = 'modelo')
    ALTER TABLE ia.configuraciones DROP COLUMN modelo;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('ia.configuraciones') AND name = 'limite_activo')
    ALTER TABLE ia.configuraciones ADD limite_activo BIT NOT NULL CONSTRAINT DF_iacfg_limiteactivo DEFAULT 0;
GO

IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('ia.mensajes') AND name = 'modelo_utilizado')
    ALTER TABLE ia.mensajes DROP COLUMN modelo_utilizado;
GO
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('ia.mensajes') AND name = 'tokens_entrada')
    ALTER TABLE ia.mensajes DROP COLUMN tokens_entrada;
GO
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('ia.mensajes') AND name = 'tokens_salida')
    ALTER TABLE ia.mensajes DROP COLUMN tokens_salida;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('ia.conversaciones') AND name = 'ultimo_contexto_json')
    ALTER TABLE ia.conversaciones ADD ultimo_contexto_json NVARCHAR(MAX) NULL;
GO

/* Permiso separado para el borrado definitivo (seccion nueva del pedido):
   mas restrictivo que `desactivar` -- el apagado es reversible, esto no.
   Solo se otorga a ADMIN via 'all', ningun otro rol lo recibe por defecto. */
INSERT INTO seguridad.permisos (nombre, recurso, accion, categoria)
SELECT N'inteligencia:eliminar', N'inteligencia', N'eliminar', N'Inteligencia'
WHERE NOT EXISTS (SELECT 1 FROM seguridad.permisos WHERE nombre = N'inteligencia:eliminar');
GO
