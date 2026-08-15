-- Cache de "Cursos externos recomendados" (OBA/Thinkific), seccion 19-24 del
-- pedido. SIGBO solo guarda informacion PUBLICA (titulo, imagen, categoria,
-- duracion si esta disponible, URL) para mostrarla como catalogo de enlaces
-- externos -- nunca datos de inscripcion/progreso/calificacion individual,
-- que son responsabilidad exclusiva del usuario en el sitio externo.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'academia.cursos_externos_cache', N'U') IS NULL
BEGIN
    CREATE TABLE academia.cursos_externos_cache (
        id                 UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_curext_id DEFAULT NEWSEQUENTIALID(),
        titulo             NVARCHAR(300)     NOT NULL,
        url                NVARCHAR(500)     NOT NULL,
        imagen_url         NVARCHAR(500)     NULL,
        categoria          NVARCHAR(150)     NULL,
        duracion_texto     NVARCHAR(100)     NULL,
        fuente             NVARCHAR(100)     NOT NULL CONSTRAINT DF_curext_fuente DEFAULT N'OBA',
        actualizado_en     DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_curext_act DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT PK_cursos_externos_cache PRIMARY KEY CLUSTERED (id),
        CONSTRAINT UQ_curext_url UNIQUE (url)
    );
END
GO
