/* Permite que una rotación de grupo respete días fijos de la semana,
   por ejemplo Grupo 1=LUNES, ... Grupo 5=VIERNES. */
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID(N'operaciones.grupos_guardia')
      AND name = N'dias_semana_csv'
)
BEGIN
    ALTER TABLE operaciones.grupos_guardia
        ADD dias_semana_csv NVARCHAR(27) NULL;
END;
GO
