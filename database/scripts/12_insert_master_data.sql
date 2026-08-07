/*
============================================================================
 12_insert_master_data.sql
 SIGBO-CBVC — Datos maestros / de configuracion (seed data)
============================================================================
 Contenido: UNICAMENTE lo que el documento fuente describe como datos
 sembrados por las migraciones (permisos del catalogo RBAC, otorgamiento
 de esos permisos al rol 'Administrador General', y la fila unica de
 seguridad.configuracion_sistema). Todo se escribe de forma IDEMPOTENTE
 (WHERE NOT EXISTS), replicando el patron documentado explicitamente:
 "Todas las inserciones de datos semilla/permisos... son idempotentes
 (usan WHERE NOT EXISTS), por lo que las migraciones pueden re-ejecutarse
 sin duplicar filas."

 LIMITACION IMPORTANTE: el rol 'Administrador General' se referencia
 repetidamente como destinatario de estos permisos, pero su propia fila
 (INSERT en seguridad.roles) NO esta documentada en el material disponible
 (se asume creada en 002_seguridad.sql, fuera del alcance de lo
 relevado). Este script NO inventa esa fila. Los INSERT de otorgamiento
 usan un SELECT id FROM seguridad.roles WHERE nombre = N'Administrador
 General': si esa fila no existe todavia en el entorno destino, el INSERT
 de otorgamiento simplemente no insertara nada (0 filas), sin error. Debe
 crearse esa fila manualmente antes de ejecutar este script, o ejecutar
 este script nuevamente despues de crearla (es idempotente).
============================================================================
*/

USE sigbo_cbvc;
GO

/* ---------------------------------------------------------------------
   Migracion 011: permiso 'seguridad:cerrar_sesion'
--------------------------------------------------------------------- */
INSERT INTO seguridad.permisos (nombre, descripcion, recurso, accion, categoria)
SELECT N'seguridad:cerrar_sesion', N'Cerrar sesiones activas de un usuario (accion administrativa distinta de ver)', N'seguridad', N'cerrar_sesion', N'Seguridad'
WHERE NOT EXISTS (SELECT 1 FROM seguridad.permisos WHERE nombre = N'seguridad:cerrar_sesion');
GO

INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id
FROM seguridad.roles r
CROSS JOIN seguridad.permisos p
WHERE r.nombre = N'Administrador General'
  AND p.nombre = N'seguridad:cerrar_sesion'
  AND NOT EXISTS (
      SELECT 1 FROM seguridad.asignacion_permisos_rol a
      WHERE a.rol_id = r.id AND a.permiso_id = p.id
  );
GO

/* ---------------------------------------------------------------------
   Migracion 012: 50 permisos del modulo Organizacion Institucional
   (documentados como "49 permisos" en el texto resumen del documento
   fuente; el listado detallado de recursos/acciones que el mismo
   documento transcribe suma 50. Se implementa el listado detallado por
   ser mas especifico y verificable. Ver REPORTE_REPLICACION.md seccion
   10 "Informacion faltante" para esta discrepancia.)
--------------------------------------------------------------------- */
INSERT INTO seguridad.permisos (nombre, descripcion, recurso, accion, categoria)
SELECT v.nombre, v.descripcion, N'organizacion', v.accion, N'Organizacion Institucional'
FROM (VALUES
    (N'organizacion:rangos_ver',            N'Ver catalogo de rangos',            N'ver'),
    (N'organizacion:rangos_crear',          N'Crear rangos',                      N'crear'),
    (N'organizacion:rangos_editar',         N'Editar rangos',                     N'editar'),
    (N'organizacion:rangos_eliminar',       N'Dar de baja / reactivar rangos',    N'eliminar'),
    (N'organizacion:cargos_ver',            N'Ver catalogo de cargos',            N'ver'),
    (N'organizacion:cargos_crear',          N'Crear cargos',                      N'crear'),
    (N'organizacion:cargos_editar',         N'Editar cargos',                     N'editar'),
    (N'organizacion:cargos_eliminar',       N'Dar de baja / reactivar cargos',    N'eliminar'),
    (N'organizacion:especialidades_ver',      N'Ver catalogo de especialidades',      N'ver'),
    (N'organizacion:especialidades_crear',    N'Crear especialidades',               N'crear'),
    (N'organizacion:especialidades_editar',   N'Editar especialidades',              N'editar'),
    (N'organizacion:especialidades_eliminar', N'Dar de baja / reactivar especialidades', N'eliminar'),
    (N'organizacion:companias_ver',         N'Ver catalogo de companias',         N'ver'),
    (N'organizacion:companias_crear',       N'Crear companias',                   N'crear'),
    (N'organizacion:companias_editar',      N'Editar companias',                  N'editar'),
    (N'organizacion:companias_eliminar',    N'Dar de baja / reactivar companias', N'eliminar'),
    (N'organizacion:cuarteles_ver',         N'Ver catalogo de cuarteles',         N'ver'),
    (N'organizacion:cuarteles_crear',       N'Crear cuarteles',                   N'crear'),
    (N'organizacion:cuarteles_editar',      N'Editar cuarteles',                  N'editar'),
    (N'organizacion:cuarteles_eliminar',    N'Dar de baja / reactivar cuarteles', N'eliminar'),
    (N'organizacion:brigadas_ver',          N'Ver catalogo de brigadas',          N'ver'),
    (N'organizacion:brigadas_crear',        N'Crear brigadas',                    N'crear'),
    (N'organizacion:brigadas_editar',       N'Editar brigadas',                   N'editar'),
    (N'organizacion:brigadas_eliminar',     N'Dar de baja / reactivar brigadas',  N'eliminar'),
    (N'organizacion:departamentos_ver',       N'Ver catalogo de departamentos',       N'ver'),
    (N'organizacion:departamentos_crear',     N'Crear departamentos',                N'crear'),
    (N'organizacion:departamentos_editar',    N'Editar departamentos',               N'editar'),
    (N'organizacion:departamentos_eliminar',  N'Dar de baja / reactivar departamentos', N'eliminar'),
    (N'organizacion:unidades_ver',          N'Ver catalogo de unidades',          N'ver'),
    (N'organizacion:unidades_crear',        N'Crear unidades',                    N'crear'),
    (N'organizacion:unidades_editar',       N'Editar unidades',                   N'editar'),
    (N'organizacion:unidades_eliminar',     N'Dar de baja / reactivar unidades',  N'eliminar'),
    (N'organizacion:turnos_ver',            N'Ver catalogo de turnos',            N'ver'),
    (N'organizacion:turnos_crear',          N'Crear turnos',                      N'crear'),
    (N'organizacion:turnos_editar',         N'Editar turnos',                     N'editar'),
    (N'organizacion:turnos_eliminar',       N'Dar de baja / reactivar turnos',    N'eliminar'),
    (N'organizacion:tipos_guardia_ver',       N'Ver catalogo de tipos de guardia',    N'ver'),
    (N'organizacion:tipos_guardia_crear',     N'Crear tipos de guardia',             N'crear'),
    (N'organizacion:tipos_guardia_editar',    N'Editar tipos de guardia',            N'editar'),
    (N'organizacion:tipos_guardia_eliminar',  N'Dar de baja / reactivar tipos de guardia', N'eliminar'),
    (N'organizacion:designaciones_ver',       N'Ver designaciones de cargo',          N'ver'),
    (N'organizacion:designaciones_crear',     N'Crear designaciones de cargo',        N'crear'),
    (N'organizacion:designaciones_editar',    N'Editar designaciones de cargo',       N'editar'),
    (N'organizacion:designaciones_finalizar', N'Finalizar (cerrar) una designacion',  N'finalizar'),
    (N'organizacion:designaciones_eliminar',  N'Dar de baja / reactivar designaciones', N'eliminar'),
    (N'organizacion:ascensos_ver',          N'Ver historial de ascensos',         N'ver'),
    (N'organizacion:ascensos_crear',        N'Registrar un ascenso',              N'crear'),
    (N'organizacion:ascensos_anular',       N'Anular un ascenso registrado',      N'anular'),
    (N'organizacion:ver_dashboard',         N'Ver el dashboard de Organizacion Institucional', N'ver_dashboard'),
    (N'organizacion:exportar_reportes',     N'Exportar reportes de Organizacion Institucional', N'exportar_reportes')
) AS v(nombre, descripcion, accion)
WHERE NOT EXISTS (SELECT 1 FROM seguridad.permisos p WHERE p.nombre = v.nombre);
GO

INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id
FROM seguridad.roles r
CROSS JOIN seguridad.permisos p
WHERE r.nombre = N'Administrador General'
  AND p.nombre LIKE N'organizacion:%'
  AND NOT EXISTS (
      SELECT 1 FROM seguridad.asignacion_permisos_rol a
      WHERE a.rol_id = r.id AND a.permiso_id = p.id
  );
GO

/* ---------------------------------------------------------------------
   Migracion 013/014/015: fila UNICA de seguridad.configuracion_sistema
   (estado final consolidado; ver notas de rename/columnas en
   04_create_tables.sql). Nunca debe existir mas de una fila.
--------------------------------------------------------------------- */
IF NOT EXISTS (SELECT 1 FROM seguridad.configuracion_sistema)
BEGIN
    INSERT INTO seguridad.configuracion_sistema
        (logo_login, fondo_login, texto_bajo_logo, nombre_sistema_menu, subtitulo_menu, logo_menu, perfil_edicion_libre)
    VALUES
        (N'/logo-cbvc.png', NULL, NULL, N'SIGBO-CBVC', N'Panel principal', NULL, 1);
END
GO

/* ---------------------------------------------------------------------
   Migracion 013: permiso 'seguridad:configurar_apariencia'
--------------------------------------------------------------------- */
INSERT INTO seguridad.permisos (nombre, descripcion, recurso, accion, categoria)
SELECT N'seguridad:configurar_apariencia', N'Personalizar logos/fondo/texto de login y menu', N'seguridad', N'configurar_apariencia', N'Seguridad'
WHERE NOT EXISTS (SELECT 1 FROM seguridad.permisos WHERE nombre = N'seguridad:configurar_apariencia');
GO

INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id
FROM seguridad.roles r
CROSS JOIN seguridad.permisos p
WHERE r.nombre = N'Administrador General'
  AND p.nombre = N'seguridad:configurar_apariencia'
  AND NOT EXISTS (
      SELECT 1 FROM seguridad.asignacion_permisos_rol a
      WHERE a.rol_id = r.id AND a.permiso_id = p.id
  );
GO

/* ---------------------------------------------------------------------
   Migracion 015: permiso 'seguridad:configurar_politica_perfil'
--------------------------------------------------------------------- */
INSERT INTO seguridad.permisos (nombre, descripcion, recurso, accion, categoria)
SELECT N'seguridad:configurar_politica_perfil', N'Definir la politica Libre/Fijo de edicion de datos personales', N'seguridad', N'configurar_politica_perfil', N'Seguridad'
WHERE NOT EXISTS (SELECT 1 FROM seguridad.permisos WHERE nombre = N'seguridad:configurar_politica_perfil');
GO

INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id
FROM seguridad.roles r
CROSS JOIN seguridad.permisos p
WHERE r.nombre = N'Administrador General'
  AND p.nombre = N'seguridad:configurar_politica_perfil'
  AND NOT EXISTS (
      SELECT 1 FROM seguridad.asignacion_permisos_rol a
      WHERE a.rol_id = r.id AND a.permiso_id = p.id
  );
GO

/*
    No determinado / fuera de alcance de la evidencia disponible:
      - Catalogo base de permisos y roles anterior a la migracion 011
        (ej. permisos de 'personal:*', 'vehiculos:*', 'equipos:*'
        mencionados en los workflows de agentes pero no en el diccionario
        de datos ni en las notas de migracion como INSERT explicitos).
      - Datos reales de organizacion.rangos/cargos/companias/etc. (no se
        encontraron sentencias INSERT con valores concretos para estos
        catalogos en la documentacion disponible).
    Ver REPORTE_REPLICACION.md seccion 10.
*/
