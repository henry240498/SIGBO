/* Completa el catálogo de pantallas para rutas móviles ya existentes. */
SET NOCOUNT ON;

INSERT INTO seguridad.pantallas (codigo, nombre, descripcion, confidencial_aplica)
SELECT v.codigo, v.nombre, v.descripcion, v.confidencial
FROM (VALUES
    (N'0xA013', N'Alerta operativa', N'Detalle del llamado o alerta operativa recibida', 0),
    (N'0xA014', N'Ajustes de la aplicación', N'Preferencias locales y configuración del dispositivo', 0),
    (N'0xA015', N'Conexión con el servidor', N'Configuración y verificación de conexión con SIGBO', 0)
) AS v(codigo, nombre, descripcion, confidencial)
WHERE NOT EXISTS (SELECT 1 FROM seguridad.pantallas p WHERE p.codigo = v.codigo);
GO
