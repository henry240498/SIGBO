IF OBJECT_ID(N'personal.bomberos',N'U') IS NULL
 THROW 51000,N'No existe personal.bomberos; aplique primero las migraciones base.',1;
GO
IF COL_LENGTH(N'personal.bomberos',N'estado') IS NULL
 THROW 51001,N'El esquema de Personal no es compatible: falta personal.bomberos.estado.',1;
GO
