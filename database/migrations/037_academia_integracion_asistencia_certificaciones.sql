-- Enlaza Academia con Asistencia y con Certificaciones, sin duplicar
-- ninguna de las dos: cada sesion/jornada de una actividad academica es una
-- fila de operaciones.eventos_asistencia (reutiliza ParticipanteEvento +
-- calcularSolapamientoMarcaciones ya existentes), y cada certificado
-- (interno o externo) sigue viviendo en personal.certificaciones, ahora con
-- un enlace opcional a la actividad que lo origino.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'operaciones.eventos_asistencia') AND name = 'actividad_academica_id')
BEGIN
    ALTER TABLE operaciones.eventos_asistencia
        ADD actividad_academica_id UNIQUEIDENTIFIER NULL
            CONSTRAINT FK_eventos_asistencia_actividad_academica REFERENCES academia.actividades(id);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'personal.certificaciones') AND name = 'actividad_academica_id')
BEGIN
    ALTER TABLE personal.certificaciones
        ADD actividad_academica_id UNIQUEIDENTIFIER NULL
            CONSTRAINT FK_certificaciones_actividad_academica REFERENCES academia.actividades(id);
END
GO
