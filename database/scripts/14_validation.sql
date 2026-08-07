/*
============================================================================
 14_validation.sql
 SIGBO-CBVC — Validacion de la replica
============================================================================
 Cada bloque compara un conteo real (obtenido de los catalogos del sistema
 de la base RECIEN CREADA) contra la cifra documentada en
 "SIGBO-CBVC_Documentacion_Sistema_2026-08-04.docx" (seccion "Resumen
 Numerico") o contra lo efectivamente definido por los scripts 04-07/12
 de esta carpeta, y emite:
     '✔ Coincide'          si el conteo real == el esperado
     '✘ Diferente'         si el conteo real != el esperado
 Para metricas sin cifra oficial de comparacion en la fuente (constraints
 UNIQUE/CHECK, por ejemplo) se reportan como informativas ('⚠ Sin cifra
 oficial de referencia'), nunca como pass/fail inventado.
============================================================================
*/

USE sigbo_cbvc;
GO

PRINT '=== 1. Esquemas (esperado: 11, evidencia: "Resumen Numerico") ===';
SELECT
    COUNT(*) AS esquemas_reales,
    11 AS esquemas_esperados,
    CASE WHEN COUNT(*) = 11 THEN N'✔ Coincide' ELSE N'✘ Diferente' END AS resultado
FROM sys.schemas
WHERE name IN ('seguridad','organizacion','personal','academia','operaciones',
               'vehiculos','equipos','servicios','finanzas','deposito','documentos');
GO

PRINT '=== 2. Tablas por esquema (evidencia: seccion "2.3 Esquemas de la Base de Datos") ===';
SELECT
    s.name AS esquema,
    COUNT(t.object_id) AS tablas_reales,
    e.tablas_esperadas,
    CASE WHEN COUNT(t.object_id) = e.tablas_esperadas THEN N'✔ Coincide' ELSE N'✘ Diferente' END AS resultado
FROM sys.schemas s
JOIN sys.tables t ON t.schema_id = s.schema_id
JOIN (VALUES ('seguridad',13),('organizacion',12),('personal',6),('academia',7),
             ('operaciones',5),('vehiculos',3),('equipos',4),('servicios',4),
             ('finanzas',2),('deposito',2),('documentos',1)
     ) AS e(esquema, tablas_esperadas) ON e.esquema = s.name
GROUP BY s.name, e.tablas_esperadas
ORDER BY s.name;
GO

PRINT '=== 3. Total de tablas (esperado: 59) ===';
SELECT
    COUNT(*) AS tablas_reales,
    59 AS tablas_esperadas,
    CASE WHEN COUNT(*) = 59 THEN N'✔ Coincide' ELSE N'✘ Diferente' END AS resultado
FROM sys.tables t
JOIN sys.schemas s ON s.schema_id = t.schema_id
WHERE s.name IN ('seguridad','organizacion','personal','academia','operaciones',
                 'vehiculos','equipos','servicios','finanzas','deposito','documentos');
GO

PRINT '=== 4. Total de columnas (esperado: 752 segun el documento fuente; una diferencia menor es esperable, ver REPORTE_REPLICACION.md seccion 10) ===';
SELECT
    COUNT(*) AS columnas_reales,
    752 AS columnas_esperadas_segun_documento,
    CASE WHEN COUNT(*) = 752 THEN N'✔ Coincide' ELSE N'⚠ Diferencia — revisar seccion 10 del reporte' END AS resultado
FROM sys.columns c
JOIN sys.tables t ON t.object_id = c.object_id
JOIN sys.schemas s ON s.schema_id = t.schema_id
WHERE s.name IN ('seguridad','organizacion','personal','academia','operaciones',
                 'vehiculos','equipos','servicios','finanzas','deposito','documentos');
GO

PRINT '=== 5. Primary Keys (esperado: 59, una por tabla) ===';
SELECT
    COUNT(*) AS pk_reales,
    59 AS pk_esperadas,
    CASE WHEN COUNT(*) = 59 THEN N'✔ Coincide' ELSE N'✘ Diferente' END AS resultado
FROM sys.key_constraints kc
JOIN sys.tables t ON t.object_id = kc.parent_object_id
JOIN sys.schemas s ON s.schema_id = t.schema_id
WHERE kc.type = 'PK'
  AND s.name IN ('seguridad','organizacion','personal','academia','operaciones',
                 'vehiculos','equipos','servicios','finanzas','deposito','documentos');
GO

PRINT '=== 6. Foreign Keys fisicas (esperado: 68 — suma de constraints creados por 06_create_constraints.sql Parte A; NO es una cifra dada literalmente por el documento fuente) ===';
SELECT
    COUNT(*) AS fk_reales,
    68 AS fk_esperadas_segun_script_06,
    CASE WHEN COUNT(*) = 68 THEN N'✔ Coincide' ELSE N'✘ Diferente' END AS resultado
FROM sys.foreign_keys fk
JOIN sys.tables t ON t.object_id = fk.parent_object_id
JOIN sys.schemas s ON s.schema_id = t.schema_id
WHERE s.name IN ('seguridad','organizacion','personal','academia','operaciones',
                 'vehiculos','equipos','servicios','finanzas','deposito','documentos');
GO

PRINT '=== 7. Restricciones UNIQUE (informativo — sin cifra global oficial en la fuente) ===';
SELECT
    COUNT(*) AS unique_reales,
    N'⚠ Sin cifra oficial de referencia (validar tabla por tabla contra REPORTE_REPLICACION.md seccion 4)' AS resultado
FROM sys.key_constraints kc
JOIN sys.tables t ON t.object_id = kc.parent_object_id
JOIN sys.schemas s ON s.schema_id = t.schema_id
WHERE kc.type = 'UQ'
  AND s.name IN ('seguridad','organizacion','personal','academia','operaciones',
                 'vehiculos','equipos','servicios','finanzas','deposito','documentos');
GO

PRINT '=== 8. Restricciones CHECK (informativo — sin cifra global oficial en la fuente) ===';
SELECT
    COUNT(*) AS check_reales,
    N'⚠ Sin cifra oficial de referencia (validar tabla por tabla contra REPORTE_REPLICACION.md seccion 4)' AS resultado
FROM sys.check_constraints cc
JOIN sys.tables t ON t.object_id = cc.parent_object_id
JOIN sys.schemas s ON s.schema_id = t.schema_id
WHERE s.name IN ('seguridad','organizacion','personal','academia','operaciones',
                 'vehiculos','equipos','servicios','finanzas','deposito','documentos');
GO

PRINT '=== 9. Indices no clusterizados creados por 07_create_indexes.sql (esperado: 56 = 42+12+2) ===';
SELECT
    COUNT(*) AS indices_reales,
    56 AS indices_esperados,
    CASE WHEN COUNT(*) = 56 THEN N'✔ Coincide' ELSE N'✘ Diferente' END AS resultado
FROM sys.indexes i
JOIN sys.tables t ON t.object_id = i.object_id
JOIN sys.schemas s ON s.schema_id = t.schema_id
WHERE i.is_primary_key = 0
  AND i.is_unique_constraint = 0
  AND i.type = 2 /* NONCLUSTERED */
  AND s.name IN ('seguridad','organizacion','personal','academia','operaciones',
                 'vehiculos','equipos','servicios','finanzas','deposito','documentos');
GO

PRINT '=== 10. Columnas calculadas / computed columns (esperado: 4) ===';
SELECT
    COUNT(*) AS computed_reales,
    4 AS computed_esperadas,
    CASE WHEN COUNT(*) = 4 THEN N'✔ Coincide' ELSE N'✘ Diferente' END AS resultado
FROM sys.computed_columns cc
JOIN sys.tables t ON t.object_id = cc.object_id
JOIN sys.schemas s ON s.schema_id = t.schema_id
WHERE s.name IN ('seguridad','organizacion','personal','academia','operaciones',
                 'vehiculos','equipos','servicios','finanzas','deposito','documentos');
GO

PRINT '=== 11. Vistas, funciones, procedimientos, triggers (esperado: 0 para los cuatro, segun evidencia documental) ===';
SELECT 'VIEWS' AS tipo, COUNT(*) AS reales, 0 AS esperados,
       CASE WHEN COUNT(*) = 0 THEN N'✔ Coincide' ELSE N'✘ Diferente' END AS resultado
FROM sys.views v JOIN sys.schemas s ON s.schema_id = v.schema_id
WHERE s.name IN ('seguridad','organizacion','personal','academia','operaciones','vehiculos','equipos','servicios','finanzas','deposito','documentos')
UNION ALL
SELECT 'FUNCTIONS', COUNT(*), 0,
       CASE WHEN COUNT(*) = 0 THEN N'✔ Coincide' ELSE N'✘ Diferente' END
FROM sys.objects o JOIN sys.schemas s ON s.schema_id = o.schema_id
WHERE o.type IN ('FN','IF','TF') AND s.name IN ('seguridad','organizacion','personal','academia','operaciones','vehiculos','equipos','servicios','finanzas','deposito','documentos')
UNION ALL
SELECT 'PROCEDURES', COUNT(*), 0,
       CASE WHEN COUNT(*) = 0 THEN N'✔ Coincide' ELSE N'✘ Diferente' END
FROM sys.procedures p JOIN sys.schemas s ON s.schema_id = p.schema_id
WHERE s.name IN ('seguridad','organizacion','personal','academia','operaciones','vehiculos','equipos','servicios','finanzas','deposito','documentos')
UNION ALL
SELECT 'TRIGGERS', COUNT(*), 0,
       CASE WHEN COUNT(*) = 0 THEN N'✔ Coincide' ELSE N'✘ Diferente' END
FROM sys.triggers tr JOIN sys.tables t ON t.object_id = tr.parent_id
JOIN sys.schemas s ON s.schema_id = t.schema_id
WHERE s.name IN ('seguridad','organizacion','personal','academia','operaciones','vehiculos','equipos','servicios','finanzas','deposito','documentos');
GO

PRINT '=== 12. seguridad.configuracion_sistema debe tener EXACTAMENTE una fila (patron singleton) ===';
SELECT
    COUNT(*) AS filas_reales,
    1 AS filas_esperadas,
    CASE WHEN COUNT(*) = 1 THEN N'✔ Coincide' ELSE N'✘ Diferente' END AS resultado
FROM seguridad.configuracion_sistema;
GO

PRINT '=== 13. Cantidad de registros por tabla (util para comparar réplica vs. origen real, si se dispone de acceso a ambos) ===';
SELECT
    s.name AS esquema,
    t.name AS tabla,
    SUM(p.rows) AS filas
FROM sys.tables t
JOIN sys.schemas s ON s.schema_id = t.schema_id
JOIN sys.partitions p ON p.object_id = t.object_id AND p.index_id IN (0,1)
WHERE s.name IN ('seguridad','organizacion','personal','academia','operaciones',
                 'vehiculos','equipos','servicios','finanzas','deposito','documentos')
GROUP BY s.name, t.name
ORDER BY s.name, t.name;
GO

/*
============================================================================
 14b. PLANTILLA — comparacion BASE ORIGEN vs. BASE REPLICA
============================================================================
 Requiere un SERVIDOR VINCULADO (linked server) al servidor SQL Server
 origen. Reemplazar [SERVIDOR_ORIGEN] por el nombre real configurado con
 sp_addlinkedserver. Si no se dispone de acceso directo al origen, usar en
 su lugar el flujo de exportacion descrito en REPORTE_REPLICACION.md
 seccion 7 (export de metadatos de sys.columns/sys.foreign_keys/etc. desde
 el origen a un archivo, e importarlo a una tabla temporal aqui para
 comparar).

   Base original
        |
        v
   Metadatos (sys.tables / sys.columns / sys.foreign_keys / sys.indexes)
        |
        v
   Datos (COUNT(*) por tabla, checksums por tabla si aplica)
        |
        v
   Base replica (este script, secciones 1-13)
        |
        v
   Comparacion (bloque siguiente)
        |
        v
   Reporte de diferencias
============================================================================
*/

/*
SELECT
    o.esquema, o.tabla,
    o.columnas AS columnas_origen, r.columnas AS columnas_replica,
    CASE WHEN o.columnas = r.columnas THEN N'✔ Coincide' ELSE N'✘ Diferente' END AS resultado
FROM (
    SELECT s.name AS esquema, t.name AS tabla, COUNT(c.column_id) AS columnas
    FROM [SERVIDOR_ORIGEN].sigbo_cbvc.sys.tables t
    JOIN [SERVIDOR_ORIGEN].sigbo_cbvc.sys.schemas s ON s.schema_id = t.schema_id
    JOIN [SERVIDOR_ORIGEN].sigbo_cbvc.sys.columns c ON c.object_id = t.object_id
    GROUP BY s.name, t.name
) o
FULL OUTER JOIN (
    SELECT s.name AS esquema, t.name AS tabla, COUNT(c.column_id) AS columnas
    FROM sys.tables t
    JOIN sys.schemas s ON s.schema_id = t.schema_id
    JOIN sys.columns c ON c.object_id = t.object_id
    GROUP BY s.name, t.name
) r ON r.esquema = o.esquema AND r.tabla = o.tabla
ORDER BY o.esquema, o.tabla;
*/

/* Fin de 14_validation.sql */
