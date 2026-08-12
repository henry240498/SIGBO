IF SCHEMA_ID(N'contenido') IS NULL EXEC(N'CREATE SCHEMA contenido');
GO
IF OBJECT_ID(N'contenido.publicaciones',N'U') IS NULL
BEGIN
 CREATE TABLE contenido.publicaciones(
  id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_publicaciones PRIMARY KEY,
  seccion NVARCHAR(30) NOT NULL,
  estado NVARCHAR(20) NOT NULL,
  visible BIT NOT NULL CONSTRAINT DF_publicaciones_visible DEFAULT 1,
  destacada BIT NOT NULL CONSTRAINT DF_publicaciones_destacada DEFAULT 0,
  orden INT NOT NULL CONSTRAINT DF_publicaciones_orden DEFAULT 0,
  fecha DATE NULL,
  publicar_en DATETIMEOFFSET NULL,
  caducar_en DATETIMEOFFSET NULL,
  contenido_json NVARCHAR(MAX) NOT NULL,
  creado_en DATETIMEOFFSET NOT NULL CONSTRAINT DF_publicaciones_creado DEFAULT SYSDATETIMEOFFSET(),
  actualizado_en DATETIMEOFFSET NOT NULL CONSTRAINT DF_publicaciones_actualizado DEFAULT SYSDATETIMEOFFSET(),
  CONSTRAINT CK_publicaciones_estado CHECK(estado IN('BORRADOR','PROGRAMADA','PUBLICADA','ARCHIVADA'))
 );
 CREATE INDEX IX_publicaciones_publicas ON contenido.publicaciones(visible,estado,orden);
END;
GO
IF COL_LENGTH(N'contenido.publicaciones',N'contenido_json') IS NULL AND COL_LENGTH(N'contenido.publicaciones',N'contenidoJson') IS NOT NULL
BEGIN
 IF EXISTS(SELECT 1 FROM sys.check_constraints WHERE parent_object_id=OBJECT_ID(N'contenido.publicaciones') AND name=N'CK_publicaciones_json')
  ALTER TABLE contenido.publicaciones DROP CONSTRAINT CK_publicaciones_json;
 EXEC sp_rename N'contenido.publicaciones.contenidoJson',N'contenido_json',N'COLUMN';
 EXEC(N'ALTER TABLE contenido.publicaciones ADD CONSTRAINT CK_publicaciones_json CHECK(ISJSON(contenido_json)=1)');
END;
IF COL_LENGTH(N'contenido.publicaciones',N'publicar_en') IS NULL AND COL_LENGTH(N'contenido.publicaciones',N'publicarEn') IS NOT NULL
 EXEC sp_rename N'contenido.publicaciones.publicarEn',N'publicar_en',N'COLUMN';
IF COL_LENGTH(N'contenido.publicaciones',N'caducar_en') IS NULL AND COL_LENGTH(N'contenido.publicaciones',N'caducarEn') IS NOT NULL
 EXEC sp_rename N'contenido.publicaciones.caducarEn',N'caducar_en',N'COLUMN';
GO
