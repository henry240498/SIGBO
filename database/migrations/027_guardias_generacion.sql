-- Fase B del motor de planificacion de Guardias: distingue que esquemas de
-- horario se resuelven vía rotación de grupo (operaciones.grupos_guardia)
-- de los que se resuelven asignando personal individual directamente
-- (ej. personal rentado en turnos diurnos). Sin esta columna el generador
-- automatico no tiene forma de saber cual mecanismo aplicar para cada
-- esquema, y ambos mecanismos conviven en el mismo catalogo parametrizable.
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('operaciones.esquemas_horario_guardia') AND name = 'usa_rotacion_grupo')
BEGIN
  ALTER TABLE operaciones.esquemas_horario_guardia ADD usa_rotacion_grupo BIT NOT NULL DEFAULT 0;
END
GO

UPDATE operaciones.esquemas_horario_guardia SET usa_rotacion_grupo = 1 WHERE nombre LIKE 'Grupos%' AND usa_rotacion_grupo = 0;
GO
