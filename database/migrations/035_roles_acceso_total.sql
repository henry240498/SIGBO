/* El rol Administrador General debe tener SIEMPRE todos los permisos,
   incluso los que se agreguen en migraciones futuras -- sin depender de que
   cada una recuerde asignarselos explicitamente (asi se detecto el problema
   con publicaciones/denuncias: la tabla de asignacion nunca se actualizo).
   Este flag hace que PolicyEngineService devuelva el catalogo completo de
   permisos para cualquier rol marcado, sin pasar por asignacion_permisos_rol. */
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID(N'seguridad.roles') AND name = N'acceso_total'
)
BEGIN
    ALTER TABLE seguridad.roles
        ADD acceso_total BIT NOT NULL CONSTRAINT DF_roles_acceso_total DEFAULT 0;
END;
GO

UPDATE seguridad.roles SET acceso_total = 1 WHERE nombre = N'Administrador General';
GO
