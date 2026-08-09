SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

/* =============================================================
   SIGBO-CBVC | Migracion 018 - Sistema de Parametros institucionales
   + normalizacion de Personal (Datos personales, Salud, Actividad
   profesional, Idiomas, Equipamiento).

   Corrige el bug reportado: el DTO de bomberos no declaraba varios
   campos que si existen en la tabla (estado_civil, direccion, etc.),
   y el ValidationPipe global (whitelist + forbidNonWhitelisted) los
   rechazaba. De paso, convierte en parametros administrables los
   campos que representan categorias repetibles (pais/departamento/
   ciudad/barrio, profesion, idioma, nivel de idioma, grupo sanguineo,
   factor RH, tipo de seguro, aseguradora) en vez de texto libre.

   Verificado antes de escribir esta migracion: 0 filas de
   personal.bomberos tienen pais<>'Paraguay', ciudad, departamento,
   barrio, grupo_sanguineo, factor_rh, tipo_seguro, numero_seguro,
   vigencia_seguro o estado_civil pobladas; personal.actividad_profesional
   e personal.idiomas_bombero estan vacias. No hay datos que migrar.
   ============================================================= */

/* --- 1) Tabla generica de parametros ---------------------------- */
CREATE TABLE organizacion.parametros (
    id                  UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_param_id DEFAULT NEWSEQUENTIALID(),
    tipo                NVARCHAR(40)  NOT NULL,
    padre_id            UNIQUEIDENTIFIER NULL,
    nombre              NVARCHAR(200) NOT NULL,
    nombre_normalizado  NVARCHAR(200) NOT NULL,
    codigo              NVARCHAR(20)  NULL,
    descripcion         NVARCHAR(MAX) NULL,
    orden               INT NOT NULL CONSTRAINT DF_param_orden DEFAULT 0,
    estado              NVARCHAR(20)  NOT NULL CONSTRAINT DF_param_estado DEFAULT 'ACTIVO',
    creado_en           DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_param_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en      DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_param_act DEFAULT SYSDATETIMEOFFSET(),
    eliminado_en        DATETIMEOFFSET(3) NULL,
    creado_por          UNIQUEIDENTIFIER NULL,
    actualizado_por     UNIQUEIDENTIFIER NULL,
    CONSTRAINT PK_parametros PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_param_tipo CHECK (tipo IN ('PAIS','DEPARTAMENTO','CIUDAD','BARRIO','PROFESION',
        'IDIOMA','NIVEL_IDIOMA','GRUPO_SANGUINEO','FACTOR_RH','TIPO_SEGURO','ASEGURADORA')),
    CONSTRAINT CK_param_estado CHECK (estado IN ('ACTIVO','INACTIVO')),
    CONSTRAINT FK_param_padre FOREIGN KEY (padre_id) REFERENCES organizacion.parametros(id)
);
GO

CREATE UNIQUE INDEX UQ_param_dedup_plano ON organizacion.parametros(tipo, nombre_normalizado)
    WHERE padre_id IS NULL;
GO
CREATE UNIQUE INDEX UQ_param_dedup_jerarquico ON organizacion.parametros(tipo, padre_id, nombre_normalizado)
    WHERE padre_id IS NOT NULL;
GO
CREATE INDEX IX_param_tipo_padre ON organizacion.parametros(tipo, padre_id);
GO

/* Seeds minimos y verificables (sin inventar geografia/profesiones/
   aseguradoras reales que no puedo confirmar). */
INSERT INTO organizacion.parametros (tipo, nombre, nombre_normalizado, orden)
SELECT v.tipo, v.nombre, v.nombre, v.orden FROM (VALUES
    (N'PAIS', N'Paraguay', 1)
) AS v(tipo, nombre, orden)
WHERE NOT EXISTS (SELECT 1 FROM organizacion.parametros p WHERE p.tipo = v.tipo AND p.nombre_normalizado = v.nombre AND p.padre_id IS NULL);
GO

INSERT INTO organizacion.parametros (tipo, nombre, nombre_normalizado, codigo, orden)
SELECT v.tipo, v.nombre, v.nombre_normalizado, v.codigo, v.orden FROM (VALUES
    (N'GRUPO_SANGUINEO', N'A',  N'a',  NULL, 1),
    (N'GRUPO_SANGUINEO', N'B',  N'b',  NULL, 2),
    (N'GRUPO_SANGUINEO', N'AB', N'ab', NULL, 3),
    (N'GRUPO_SANGUINEO', N'O',  N'o',  NULL, 4),
    (N'FACTOR_RH', N'Positivo', N'positivo', N'+', 1),
    (N'FACTOR_RH', N'Negativo', N'negativo', N'-', 2),
    (N'NIVEL_IDIOMA', N'Principiante', N'principiante', NULL, 1),
    (N'NIVEL_IDIOMA', N'Intermedio',   N'intermedio',   NULL, 2),
    (N'NIVEL_IDIOMA', N'Avanzado',     N'avanzado',     NULL, 3)
) AS v(tipo, nombre, nombre_normalizado, codigo, orden)
WHERE NOT EXISTS (SELECT 1 FROM organizacion.parametros p WHERE p.tipo = v.tipo AND p.nombre_normalizado = v.nombre_normalizado AND p.padre_id IS NULL);
GO

/* --- 2) Seguros del bombero (relacion 1:N, reemplaza los 3 campos sueltos) --- */
CREATE TABLE personal.seguros_bombero (
    id                    UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_segbmb_id DEFAULT NEWSEQUENTIALID(),
    bombero_id            UNIQUEIDENTIFIER NOT NULL,
    aseguradora_id        UNIQUEIDENTIFIER NULL,
    tipo_seguro_id        UNIQUEIDENTIFIER NULL,
    descripcion           NVARCHAR(MAX) NULL,
    numero_poliza         NVARCHAR(100) NULL,
    fecha_inicio          DATE NULL,
    fecha_vencimiento     DATE NULL,
    estado                NVARCHAR(20) NOT NULL CONSTRAINT DF_segbmb_estado DEFAULT 'ACTIVO',
    observaciones         NVARCHAR(MAX) NULL,
    documentacion_url     NVARCHAR(MAX) NULL,
    creado_en             DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_segbmb_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en        DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_segbmb_act DEFAULT SYSDATETIMEOFFSET(),
    creado_por            UNIQUEIDENTIFIER NULL,
    CONSTRAINT PK_seguros_bombero PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_segbmb_estado CHECK (estado IN ('ACTIVO','INACTIVO')),
    CONSTRAINT FK_segbmb_bombero FOREIGN KEY (bombero_id) REFERENCES personal.bomberos(id) ON DELETE CASCADE,
    CONSTRAINT FK_segbmb_aseguradora FOREIGN KEY (aseguradora_id) REFERENCES organizacion.parametros(id),
    CONSTRAINT FK_segbmb_tiposeguro FOREIGN KEY (tipo_seguro_id) REFERENCES organizacion.parametros(id)
);
GO
CREATE INDEX IX_segbmb_bombero ON personal.seguros_bombero(bombero_id);
GO

/* --- 3) personal.bomberos: quitar texto libre, agregar FK parametricos --- */
ALTER TABLE personal.bomberos DROP CONSTRAINT DF_bomberos_pais;
GO
ALTER TABLE personal.bomberos DROP COLUMN pais, ciudad, departamento, barrio,
    grupo_sanguineo, factor_rh, tipo_seguro, numero_seguro, vigencia_seguro;
GO

ALTER TABLE personal.bomberos ADD
    pais_id                     UNIQUEIDENTIFIER NULL,
    departamento_residencia_id  UNIQUEIDENTIFIER NULL,
    ciudad_id                   UNIQUEIDENTIFIER NULL,
    barrio_id                   UNIQUEIDENTIFIER NULL,
    grupo_sanguineo_id          UNIQUEIDENTIFIER NULL,
    factor_rh_id                UNIQUEIDENTIFIER NULL;
GO

ALTER TABLE personal.bomberos
    ADD CONSTRAINT FK_bomberos_pais_param        FOREIGN KEY (pais_id)                    REFERENCES organizacion.parametros(id),
        CONSTRAINT FK_bomberos_deptores_param     FOREIGN KEY (departamento_residencia_id) REFERENCES organizacion.parametros(id),
        CONSTRAINT FK_bomberos_ciudad_param       FOREIGN KEY (ciudad_id)                  REFERENCES organizacion.parametros(id),
        CONSTRAINT FK_bomberos_barrio_param       FOREIGN KEY (barrio_id)                  REFERENCES organizacion.parametros(id),
        CONSTRAINT FK_bomberos_gruposang_param    FOREIGN KEY (grupo_sanguineo_id)         REFERENCES organizacion.parametros(id),
        CONSTRAINT FK_bomberos_factorrh_param     FOREIGN KEY (factor_rh_id)               REFERENCES organizacion.parametros(id);
GO

/* --- 4) actividad_profesional: profesion (texto) -> profesion_id (FK) --- */
ALTER TABLE personal.actividad_profesional DROP COLUMN profesion;
GO
ALTER TABLE personal.actividad_profesional ADD profesion_id UNIQUEIDENTIFIER NULL;
GO
ALTER TABLE personal.actividad_profesional
    ADD CONSTRAINT FK_actprof_profesion FOREIGN KEY (profesion_id) REFERENCES organizacion.parametros(id);
GO

/* --- 5) idiomas_bombero: idioma/nivel (texto) -> FK, unico por bombero --- */
ALTER TABLE personal.idiomas_bombero DROP COLUMN idioma, nivel;
GO
ALTER TABLE personal.idiomas_bombero ADD
    idioma_id       UNIQUEIDENTIFIER NULL,
    nivel_idioma_id UNIQUEIDENTIFIER NULL;
GO
/* La tabla esta vacia (verificado antes de escribir esta migracion), por
   lo que endurecer a NOT NULL no requiere backfill. */
ALTER TABLE personal.idiomas_bombero ALTER COLUMN idioma_id UNIQUEIDENTIFIER NOT NULL;
GO
ALTER TABLE personal.idiomas_bombero
    ADD CONSTRAINT FK_idiomabmb_idioma FOREIGN KEY (idioma_id)       REFERENCES organizacion.parametros(id),
        CONSTRAINT FK_idiomabmb_nivel  FOREIGN KEY (nivel_idioma_id) REFERENCES organizacion.parametros(id),
        CONSTRAINT UQ_idioma_bombero   UNIQUE (bombero_id, idioma_id);
GO

/* --- 6) prestamos_equipos: agregar hora + devolucion comprometida ---
   Tabla vacia (verificado antes de escribir esta migracion): se puede
   ensanchar el tipo directamente sin conversion de datos. */
ALTER TABLE equipos.prestamos_equipos ALTER COLUMN fecha_prestamo DATETIMEOFFSET(3) NOT NULL;
GO
ALTER TABLE equipos.prestamos_equipos ALTER COLUMN fecha_devolucion DATETIMEOFFSET(3) NULL;
GO
ALTER TABLE equipos.prestamos_equipos ADD fecha_devolucion_comprometida DATETIMEOFFSET(3) NULL;
GO

/* --- 7) Permisos nuevos --- */
INSERT INTO seguridad.permisos (nombre, recurso, accion, categoria)
SELECT v.nombre, v.recurso, v.accion, v.categoria
FROM (VALUES
    (N'organizacion:parametros_ver',     N'organizacion', N'parametros_ver',     N'Organizacion'),
    (N'organizacion:parametros_crear',   N'organizacion', N'parametros_crear',   N'Organizacion'),
    (N'organizacion:parametros_editar',  N'organizacion', N'parametros_editar',  N'Organizacion'),
    (N'organizacion:parametros_eliminar',N'organizacion', N'parametros_eliminar',N'Organizacion'),
    (N'personal:seguros_ver',      N'personal', N'seguros_ver',      N'Personal'),
    (N'personal:seguros_crear',    N'personal', N'seguros_crear',    N'Personal'),
    (N'personal:seguros_editar',   N'personal', N'seguros_editar',   N'Personal'),
    (N'personal:seguros_eliminar', N'personal', N'seguros_eliminar', N'Personal')
) AS v(nombre, recurso, accion, categoria)
WHERE NOT EXISTS (SELECT 1 FROM seguridad.permisos p WHERE p.nombre = v.nombre);
GO

INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id FROM seguridad.roles r CROSS JOIN seguridad.permisos p
WHERE r.nombre = N'Administrador General' AND p.nombre IN
    (N'organizacion:parametros_ver', N'organizacion:parametros_crear', N'organizacion:parametros_editar', N'organizacion:parametros_eliminar',
     N'personal:seguros_ver', N'personal:seguros_crear', N'personal:seguros_editar', N'personal:seguros_eliminar')
    AND NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol a WHERE a.rol_id = r.id AND a.permiso_id = p.id);
GO
