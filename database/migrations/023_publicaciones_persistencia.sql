SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO
IF NOT EXISTS(SELECT 1 FROM sys.schemas WHERE name=N'contenido') EXEC(N'CREATE SCHEMA contenido');
GO
IF OBJECT_ID(N'contenido.publicaciones',N'U') IS NULL
BEGIN
 CREATE TABLE contenido.publicaciones(
  id UNIQUEIDENTIFIER NOT NULL,
  seccion NVARCHAR(30) NOT NULL,
  estado NVARCHAR(20) NOT NULL,
  visible BIT NOT NULL CONSTRAINT DF_publicaciones_visible DEFAULT 1,
  destacada BIT NOT NULL CONSTRAINT DF_publicaciones_destacada DEFAULT 0,
  orden INT NOT NULL CONSTRAINT DF_publicaciones_orden DEFAULT 0,
  fecha DATE NULL,
  publicarEn DATETIMEOFFSET(3) NULL,
  caducarEn DATETIMEOFFSET(3) NULL,
  contenidoJson NVARCHAR(MAX) NOT NULL,
  creado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_publicaciones_creado DEFAULT SYSDATETIMEOFFSET(),
  actualizado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_publicaciones_actualizado DEFAULT SYSDATETIMEOFFSET(),
  CONSTRAINT PK_publicaciones PRIMARY KEY(id),
  CONSTRAINT CK_publicaciones_json CHECK(ISJSON(contenidoJson)=1),
  CONSTRAINT CK_publicaciones_estado CHECK(estado IN(N'BORRADOR',N'PROGRAMADA',N'PUBLICADA',N'ARCHIVADA'))
 );
 CREATE INDEX IX_publicaciones_publicas ON contenido.publicaciones(visible,estado,seccion,orden,fecha);
END
GO
