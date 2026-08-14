SET NOCOUNT ON;
SET XACT_ABORT ON;
GO
/* Reconciliación aislada de Personal. No modifica datos: valida que las
   migraciones 016-019 hayan dejado disponible el esquema que consume el código. */
IF OBJECT_ID(N'personal.bomberos',N'U') IS NULL THROW 51000,N'Falta personal.bomberos',1;
IF OBJECT_ID(N'personal.seguros_bombero',N'U') IS NULL THROW 51000,N'Falta personal.seguros_bombero; aplique 018',1;
IF OBJECT_ID(N'personal.actividad_profesional',N'U') IS NULL THROW 51000,N'Falta personal.actividad_profesional; aplique 016',1;
IF OBJECT_ID(N'personal.idiomas_bombero',N'U') IS NULL THROW 51000,N'Falta personal.idiomas_bombero; aplique 016-018',1;
IF OBJECT_ID(N'organizacion.parametros',N'U') IS NULL THROW 51000,N'Falta organizacion.parametros; aplique 018',1;
DECLARE @faltantes TABLE(nombre SYSNAME);
INSERT @faltantes(nombre)
SELECT v.nombre FROM(VALUES
 (N'rango_id'),(N'cargo_principal_id'),(N'compania_id'),(N'cuartel_id'),(N'turno_id'),(N'tipo_guardia_id'),
 (N'condicion_institucional'),(N'tipo_bombero_id'),(N'brigada_id'),(N'departamento_id'),(N'unidad_id'),
 (N'pais_id'),(N'departamento_residencia_id'),(N'ciudad_id'),(N'barrio_id'),(N'grupo_sanguineo_id'),(N'factor_rh_id')
)v(nombre) WHERE COL_LENGTH(N'personal.bomberos',v.nombre) IS NULL;
IF EXISTS(SELECT 1 FROM @faltantes)
BEGIN
 DECLARE @mensaje NVARCHAR(2048)=N'Esquema Personal incompleto. Columnas faltantes: '+(SELECT STRING_AGG(nombre,N', ') FROM @faltantes);
 THROW 51001,@mensaje,1;
END
GO
PRINT N'Reconciliación de Personal verificada sin cambios de datos.';
GO
