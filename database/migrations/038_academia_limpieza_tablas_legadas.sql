-- Elimina las 7 tablas del modelo viejo de Academia (migracion 004), ya
-- reemplazadas por el modelo nuevo de la migracion 036. Verificado antes de
-- aplicar: las 7 tablas seguian vacias (0 filas) en la base real, y el unico
-- consumidor real del modelo viejo (consultas-cruzadas.service.ts) ya fue
-- migrado al modelo nuevo y probado en vivo.
--
-- academia.aspirantes NO se toca: es territorio del futuro modulo de
-- Admision, fuera de alcance de esta tarea.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'academia.notas_examenes', N'U') IS NOT NULL
    DROP TABLE academia.notas_examenes;
GO

IF OBJECT_ID(N'academia.examenes', N'U') IS NOT NULL
    DROP TABLE academia.examenes;
GO

IF OBJECT_ID(N'academia.asistencia_academia', N'U') IS NOT NULL
    DROP TABLE academia.asistencia_academia;
GO

IF OBJECT_ID(N'academia.inscripciones_cursos', N'U') IS NOT NULL
    DROP TABLE academia.inscripciones_cursos;
GO

IF OBJECT_ID(N'academia.cursos', N'U') IS NOT NULL
    DROP TABLE academia.cursos;
GO

IF OBJECT_ID(N'academia.materias', N'U') IS NOT NULL
    DROP TABLE academia.materias;
GO
