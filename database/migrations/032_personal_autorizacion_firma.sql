-- Autorizacion de firma digital (modulo Personal): distingue "tiene una
-- imagen de firma cargada" (columna preexistente personal.bomberos.
-- firma_digital_url) de "SIGBO esta autorizado a insertarla automaticamente
-- en documentos oficiales" (columna nueva). Nunca implica una a la otra.
ALTER TABLE personal.bomberos
    ADD autorizado_firma_digital BIT NOT NULL CONSTRAINT DF_bomb_autfirma DEFAULT 0;
GO

INSERT INTO seguridad.permisos (nombre, recurso, accion, categoria, descripcion)
SELECT v.nombre, v.recurso, v.accion, N'Personal', v.descripcion
FROM (VALUES
    (N'personal:gestionar_firma_digital', N'personal', N'gestionar_firma_digital', N'Cargar/reemplazar/eliminar la firma digital de un bombero y autorizar su uso automatico en documentos')
) AS v(nombre, recurso, accion, descripcion)
WHERE NOT EXISTS (SELECT 1 FROM seguridad.permisos p WHERE p.nombre = v.nombre);
GO

INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id
FROM seguridad.roles r
CROSS JOIN seguridad.permisos p
WHERE r.nombre IN (N'Administrador General', N'Comandante')
  AND p.nombre = N'personal:gestionar_firma_digital'
  AND NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol apr WHERE apr.rol_id = r.id AND apr.permiso_id = p.id);
GO
