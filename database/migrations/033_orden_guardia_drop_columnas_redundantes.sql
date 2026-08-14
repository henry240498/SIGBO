-- Limpieza: texto_header_institucional/logo_izquierda_url/logo_derecha_url
-- de operaciones.orden_guardia_configuracion quedan reemplazados por la
-- identidad institucional centralizada (organizacion.identidad_institucional,
-- migracion 031), reutilizable por cualquier modulo que genere documentos.
-- Confirmado antes de dropear: las 3 columnas estaban siempre NULL (la
-- migracion 030 nunca las incluyo en su INSERT de seed) y ya no las escribe
-- ningun DTO/formulario del frontend (limpiados en el mismo cambio).
ALTER TABLE operaciones.orden_guardia_configuracion DROP COLUMN texto_header_institucional;
ALTER TABLE operaciones.orden_guardia_configuracion DROP COLUMN logo_izquierda_url;
ALTER TABLE operaciones.orden_guardia_configuracion DROP COLUMN logo_derecha_url;
GO
