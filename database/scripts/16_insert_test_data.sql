/*
============================================================================
 16_insert_test_data.sql
 SIGBO-CBVC — Datos de PRUEBA sinteticos (solo entorno local)
============================================================================
 ATENCION — ESTOS DATOS SON INVENTADOS

 No provienen del sistema original. Ninguna persona, cedula, telefono,
 email o direccion de este script corresponde a un dato real: son valores
 sinteticos generados para que el entorno local tenga contenido con el que
 probar consultas, JOINs y restricciones desde DBeaver.

 Los datos operativos reales NO estaban disponibles (ver
 13_insert_initial_data.sql y REPORTE_REPLICACION.md seccion 6.C). Este
 script NO los sustituye ni pretende aproximarlos: solo ejercita la
 estructura.

 EJECUCION OPCIONAL. Omitir este script si se va a cargar el dump real.
 Para revertir: 17_rollback_local_data.sql

 Orden de insercion respetado (padres antes que hijos):
   companias -> cuarteles -> rangos / cargos / especialidades
             -> bomberos  -> cuarteles.responsable_bombero_id (UPDATE)
             -> usuarios.bombero_id (UPDATE)
 Todo idempotente (WHERE NOT EXISTS sobre la clave natural UNIQUE).
============================================================================
*/

USE sigbo_cbvc;
GO

SET NOCOUNT ON;
GO

DECLARE @admin UNIQUEIDENTIFIER =
    (SELECT TOP 1 id FROM seguridad.usuarios WHERE username = N'admin.local');
GO

/* ---------------------------------------------------------------------
   1. organizacion.companias
--------------------------------------------------------------------- */
INSERT INTO organizacion.companias (codigo, nombre, ciudad, direccion, fecha_creacion, estado, creado_por)
SELECT v.codigo, v.nombre, v.ciudad, v.direccion, v.fecha_creacion, N'ACTIVO',
       (SELECT TOP 1 id FROM seguridad.usuarios WHERE username = N'admin.local')
FROM (VALUES
    (N'CIA-01', N'Primera Compania', N'Asuncion',   N'Av. Ejemplo 100 c/ Calle Prueba', CAST('1990-03-15' AS DATE)),
    (N'CIA-02', N'Segunda Compania', N'Lambare',    N'Av. Ejemplo 200 c/ Calle Prueba', CAST('1998-07-01' AS DATE)),
    (N'CIA-03', N'Tercera Compania', N'Fernando de la Mora', N'Av. Ejemplo 300',        CAST('2005-11-20' AS DATE))
) AS v(codigo, nombre, ciudad, direccion, fecha_creacion)
WHERE NOT EXISTS (SELECT 1 FROM organizacion.companias c WHERE c.codigo = v.codigo);
GO

/* ---------------------------------------------------------------------
   2. organizacion.cuarteles  (compania_id NOT NULL; responsable se asigna despues)
--------------------------------------------------------------------- */
INSERT INTO organizacion.cuarteles (codigo, nombre, compania_id, direccion, telefono, estado, creado_por)
SELECT v.codigo, v.nombre, c.id, v.direccion, v.telefono, N'ACTIVO',
       (SELECT TOP 1 id FROM seguridad.usuarios WHERE username = N'admin.local')
FROM (VALUES
    (N'CU-01', N'Cuartel Central',  N'CIA-01', N'Av. Ejemplo 100', N'021-000001'),
    (N'CU-02', N'Cuartel Norte',    N'CIA-01', N'Av. Ejemplo 150', N'021-000002'),
    (N'CU-03', N'Cuartel Sur',      N'CIA-02', N'Av. Ejemplo 200', N'021-000003'),
    (N'CU-04', N'Cuartel Este',     N'CIA-03', N'Av. Ejemplo 300', N'021-000004')
) AS v(codigo, nombre, compania_codigo, direccion, telefono)
JOIN organizacion.companias c ON c.codigo = v.compania_codigo
WHERE NOT EXISTS (SELECT 1 FROM organizacion.cuarteles q WHERE q.codigo = v.codigo);
GO

/* ---------------------------------------------------------------------
   3. organizacion.rangos  (escalafon de ejemplo, nivel ascendente)
--------------------------------------------------------------------- */
INSERT INTO organizacion.rangos (codigo, nombre, nivel_jerarquico, orden_jerarquico, color, descripcion, estado, creado_por)
SELECT v.codigo, v.nombre, v.nivel, v.nivel, v.color, v.descripcion, N'ACTIVO',
       (SELECT TOP 1 id FROM seguridad.usuarios WHERE username = N'admin.local')
FROM (VALUES
    (N'RG-01', N'Aspirante',             1, N'#9CA3AF', N'Personal en formacion inicial'),
    (N'RG-02', N'Bombero',               2, N'#3B82F6', N'Personal operativo base'),
    (N'RG-03', N'Cabo',                  3, N'#10B981', N'Mando de primer nivel'),
    (N'RG-04', N'Sargento',              4, N'#F59E0B', N'Mando intermedio'),
    (N'RG-05', N'Oficial Ayudante',      5, N'#F97316', N'Oficial subalterno'),
    (N'RG-06', N'Oficial Inspector',     6, N'#EF4444', N'Oficial superior'),
    (N'RG-07', N'Comandante',            7, N'#7C3AED', N'Maxima autoridad operativa')
) AS v(codigo, nombre, nivel, color, descripcion)
WHERE NOT EXISTS (SELECT 1 FROM organizacion.rangos r WHERE r.codigo = v.codigo);
GO

/* ---------------------------------------------------------------------
   4. organizacion.cargos
--------------------------------------------------------------------- */
INSERT INTO organizacion.cargos (codigo, nombre, area, nivel, descripcion, estado, creado_por)
SELECT v.codigo, v.nombre, v.area, v.nivel, v.descripcion, N'ACTIVO',
       (SELECT TOP 1 id FROM seguridad.usuarios WHERE username = N'admin.local')
FROM (VALUES
    (N'CG-01', N'Comandante de Cuerpo',   N'Comando',       1, N'Jefatura general del cuerpo'),
    (N'CG-02', N'Jefe de Compania',       N'Operaciones',   2, N'Responsable de una compania'),
    (N'CG-03', N'Jefe de Cuartel',        N'Operaciones',   3, N'Responsable de un cuartel'),
    (N'CG-04', N'Jefe de Guardia',        N'Operaciones',   4, N'Responsable de un turno de guardia'),
    (N'CG-05', N'Encargado de Deposito',  N'Logistica',     4, N'Gestion de insumos y stock'),
    (N'CG-06', N'Instructor de Academia', N'Academia',      4, N'Formacion y capacitacion')
) AS v(codigo, nombre, area, nivel, descripcion)
WHERE NOT EXISTS (SELECT 1 FROM organizacion.cargos g WHERE g.codigo = v.codigo);
GO

-- jerarquia interna de cargos (auto-referencia dependencia_cargo_id)
UPDATE h SET dependencia_cargo_id = p.id
FROM organizacion.cargos h
JOIN (VALUES (N'CG-02', N'CG-01'), (N'CG-03', N'CG-02'), (N'CG-04', N'CG-03'),
             (N'CG-05', N'CG-02'), (N'CG-06', N'CG-01')) AS v(hijo, padre) ON v.hijo = h.codigo
JOIN organizacion.cargos p ON p.codigo = v.padre
WHERE h.dependencia_cargo_id IS NULL;
GO

/* ---------------------------------------------------------------------
   5. organizacion.especialidades
--------------------------------------------------------------------- */
INSERT INTO organizacion.especialidades (codigo, nombre, descripcion, estado, creado_por)
SELECT v.codigo, v.nombre, v.descripcion, N'ACTIVO',
       (SELECT TOP 1 id FROM seguridad.usuarios WHERE username = N'admin.local')
FROM (VALUES
    (N'ES-01', N'Rescate Vehicular',        N'Extraccion de victimas en accidentes de transito'),
    (N'ES-02', N'Materiales Peligrosos',    N'Intervencion en incidentes HAZMAT'),
    (N'ES-03', N'Rescate en Altura',        N'Trabajo con cuerdas y estructuras'),
    (N'ES-04', N'Primeros Auxilios',        N'Atencion prehospitalaria basica'),
    (N'ES-05', N'Incendios Forestales',     N'Control de fuego en zonas rurales')
) AS v(codigo, nombre, descripcion)
WHERE NOT EXISTS (SELECT 1 FROM organizacion.especialidades e WHERE e.codigo = v.codigo);
GO

/* ---------------------------------------------------------------------
   6. personal.bomberos  (datos 100% ficticios)
--------------------------------------------------------------------- */
INSERT INTO personal.bomberos
    (cedula, nombre, apellido, fecha_nacimiento, sexo, telefono_principal, email,
     ciudad, numero_bombero, rango, cargo, estado, fecha_ingreso,
     contactos_emergencia, rango_id, cargo_principal_id, compania_id, cuartel_id, creado_por)
SELECT v.cedula, v.nombre, v.apellido, v.fnac, v.sexo, v.tel, v.email,
       v.ciudad, v.numero, v.rango_txt, v.cargo_txt, v.estado, v.fingreso,
       N'[{"nombre":"Contacto de Prueba","parentesco":"Familiar","telefono":"021-999999"}]',
       r.id, g.id, c.id, q.id,
       (SELECT TOP 1 id FROM seguridad.usuarios WHERE username = N'admin.local')
FROM (VALUES
    (N'1000001', N'Carlos',  N'Gimenez',  CAST('1985-04-12' AS DATE), N'M', N'0981-100001', N'carlos.gimenez@sigbo.local',  N'Asuncion', N'B-0001', N'Comandante',        N'Comandante de Cuerpo',  N'ACTIVO',      CAST('2006-02-01' AS DATE), N'RG-07', N'CG-01', N'CIA-01', N'CU-01'),
    (N'1000002', N'Maria',   N'Lopez',    CAST('1990-09-23' AS DATE), N'F', N'0981-100002', N'maria.lopez@sigbo.local',     N'Asuncion', N'B-0002', N'Oficial Inspector', N'Jefe de Compania',      N'ACTIVO',      CAST('2011-05-15' AS DATE), N'RG-06', N'CG-02', N'CIA-01', N'CU-01'),
    (N'1000003', N'Jorge',   N'Benitez',  CAST('1992-01-30' AS DATE), N'M', N'0981-100003', N'jorge.benitez@sigbo.local',   N'Lambare',  N'B-0003', N'Sargento',          N'Jefe de Cuartel',       N'ACTIVO',      CAST('2014-08-10' AS DATE), N'RG-04', N'CG-03', N'CIA-02', N'CU-03'),
    (N'1000004', N'Lucia',   N'Riveros',  CAST('1995-06-05' AS DATE), N'F', N'0981-100004', N'lucia.riveros@sigbo.local',   N'Asuncion', N'B-0004', N'Cabo',              N'Jefe de Guardia',       N'ACTIVO',      CAST('2017-03-20' AS DATE), N'RG-03', N'CG-04', N'CIA-01', N'CU-02'),
    (N'1000005', N'Diego',   N'Ayala',    CAST('1998-11-11' AS DATE), N'M', N'0981-100005', N'diego.ayala@sigbo.local',     N'Fernando de la Mora', N'B-0005', N'Bombero', N'Encargado de Deposito', N'ACTIVO',      CAST('2019-09-01' AS DATE), N'RG-02', N'CG-05', N'CIA-03', N'CU-04'),
    (N'1000006', N'Sofia',   N'Cabrera',  CAST('2000-02-18' AS DATE), N'F', N'0981-100006', N'sofia.cabrera@sigbo.local',   N'Lambare',  N'B-0006', N'Bombero',           N'Instructor de Academia',N'ACTIVO',      CAST('2021-01-11' AS DATE), N'RG-02', N'CG-06', N'CIA-02', N'CU-03'),
    (N'1000007', N'Ramon',   N'Duarte',   CAST('2003-07-07' AS DATE), N'M', N'0981-100007', N'ramon.duarte@sigbo.local',    N'Asuncion', N'B-0007', N'Aspirante',         NULL,                     N'RESERVA',     CAST('2024-06-01' AS DATE), N'RG-01', NULL,     N'CIA-01', N'CU-02'),
    (N'1000008', N'Elena',   N'Vera',     CAST('1988-12-02' AS DATE), N'F', N'0981-100008', N'elena.vera@sigbo.local',      N'Asuncion', N'B-0008', N'Oficial Ayudante',  NULL,                     N'INOPERATIVO', CAST('2010-10-05' AS DATE), N'RG-05', NULL,     N'CIA-01', N'CU-01')
) AS v(cedula, nombre, apellido, fnac, sexo, tel, email, ciudad, numero, rango_txt, cargo_txt, estado, fingreso, rango_cod, cargo_cod, comp_cod, cuar_cod)
LEFT JOIN organizacion.rangos         r ON r.codigo = v.rango_cod
LEFT JOIN organizacion.cargos         g ON g.codigo = v.cargo_cod
LEFT JOIN organizacion.companias      c ON c.codigo = v.comp_cod
LEFT JOIN organizacion.cuarteles      q ON q.codigo = v.cuar_cod
WHERE NOT EXISTS (SELECT 1 FROM personal.bomberos b WHERE b.cedula = v.cedula);
GO

/* ---------------------------------------------------------------------
   7. personal.bombero_especialidades
--------------------------------------------------------------------- */
INSERT INTO personal.bombero_especialidades (bombero_id, especialidad_id, fecha_obtencion)
SELECT b.id, e.id, CAST('2022-04-01' AS DATE)
FROM (VALUES (N'1000001', N'ES-01'), (N'1000001', N'ES-02'),
             (N'1000002', N'ES-03'), (N'1000003', N'ES-01'),
             (N'1000004', N'ES-04'), (N'1000005', N'ES-05'),
             (N'1000006', N'ES-04')) AS v(cedula, esp)
JOIN personal.bomberos b            ON b.cedula = v.cedula
JOIN organizacion.especialidades e  ON e.codigo = v.esp
WHERE NOT EXISTS (
    SELECT 1 FROM personal.bombero_especialidades x
    WHERE x.bombero_id = b.id AND x.especialidad_id = e.id);
GO

/* ---------------------------------------------------------------------
   8. Cerrar relaciones circulares diferidas
--------------------------------------------------------------------- */
-- responsable de cada cuartel
UPDATE q SET responsable_bombero_id = b.id
FROM organizacion.cuarteles q
JOIN (VALUES (N'CU-01', N'1000002'), (N'CU-02', N'1000004'),
             (N'CU-03', N'1000003'), (N'CU-04', N'1000005')) AS v(cu, ced) ON v.cu = q.codigo
JOIN personal.bomberos b ON b.cedula = v.ced
WHERE q.responsable_bombero_id IS NULL;
GO

-- vincular el usuario administrador local con un legajo de bombero
UPDATE u SET bombero_id = b.id
FROM seguridad.usuarios u
CROSS JOIN personal.bomberos b
WHERE u.username = N'admin.local' AND b.cedula = N'1000001' AND u.bombero_id IS NULL;
GO

/* ---------------------------------------------------------------------
   9. organizacion.designaciones y ascensos (historial de ejemplo)
--------------------------------------------------------------------- */
INSERT INTO organizacion.designaciones (bombero_id, cargo_id, compania_id, cuartel_id, fecha_desde, estado, creado_por)
SELECT b.id, g.id, b.compania_id, b.cuartel_id, b.fecha_ingreso, N'ACTIVA',
       (SELECT TOP 1 id FROM seguridad.usuarios WHERE username = N'admin.local')
FROM personal.bomberos b
JOIN organizacion.cargos g ON g.id = b.cargo_principal_id
WHERE b.cedula LIKE N'10000%'
  AND NOT EXISTS (
      SELECT 1 FROM organizacion.designaciones d
      WHERE d.bombero_id = b.id AND d.cargo_id = g.id);
GO

PRINT '--- 16_insert_test_data.sql ---';
SELECT 'organizacion.companias'        AS tabla, COUNT(*) AS filas FROM organizacion.companias
UNION ALL SELECT 'organizacion.cuarteles',       COUNT(*) FROM organizacion.cuarteles
UNION ALL SELECT 'organizacion.rangos',          COUNT(*) FROM organizacion.rangos
UNION ALL SELECT 'organizacion.cargos',          COUNT(*) FROM organizacion.cargos
UNION ALL SELECT 'organizacion.especialidades',  COUNT(*) FROM organizacion.especialidades
UNION ALL SELECT 'organizacion.designaciones',   COUNT(*) FROM organizacion.designaciones
UNION ALL SELECT 'personal.bomberos',            COUNT(*) FROM personal.bomberos
UNION ALL SELECT 'personal.bombero_especialidades', COUNT(*) FROM personal.bombero_especialidades;
GO
