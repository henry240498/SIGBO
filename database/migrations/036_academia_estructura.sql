-- IMPORTANTE: este archivo contiene caracteres acentuados en literales
-- N'...'. Aplicar siempre con el codepage de entrada en UTF-8:
--   sqlcmd -S <server> -d sigbo_cbvc -U sigbo_app -P '<pwd>' -C -f 65001 -i 036_academia_estructura.sql
--
-- academia.inscripciones usa una columna calculada PERSISTED + indices
-- filtrados (igual que organizacion.parametros, que ya tiene indices
-- filtrados propios) -- ambos exigen QUOTED_IDENTIFIER ON en la sesion,
-- si no CREATE TABLE/INSERT fallan con error 1934. Confirmado
-- empiricamente en esta sesion.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO
--
-- Modulo Academia: reemplaza el schema academia.* legado (migracion 004,
-- aplicado pero con 0 filas de datos y solo 3 de 7 tablas con entidad
-- TypeORM) por un modelo mas rico -- ver plan. NO se dropea nada legado
-- todavia (eso ocurre en 038, una vez migrado el unico consumidor real:
-- personal/consultas-cruzadas.service.ts).
--
-- Reutiliza en vez de duplicar: organizacion.parametros (tipos/modalidad/
-- evaluacion/resultado), personal.bomberos (participantes/instructores/
-- responsables internos), operaciones.participantes_externos (participantes
-- externos -- NO se crea una tabla nueva para esto).

IF SCHEMA_ID(N'academia') IS NULL EXEC(N'CREATE SCHEMA academia');
GO

/* ============================================================= */
/* Instructores externos (catalogo propio, distinto de Personal)  */
/* ============================================================= */
IF OBJECT_ID(N'academia.instructores_externos', N'U') IS NULL
BEGIN
CREATE TABLE academia.instructores_externos (
    id             UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_iext_id DEFAULT NEWSEQUENTIALID(),
    nombre         NVARCHAR(100) NOT NULL,
    apellido       NVARCHAR(100) NULL,
    documento      NVARCHAR(20)  NULL,
    institucion    NVARCHAR(150) NULL,
    especialidad   NVARCHAR(150) NULL,
    telefono       NVARCHAR(20)  NULL,
    email          NVARCHAR(255) NULL,
    observaciones  NVARCHAR(MAX) NULL,
    activo         BIT NOT NULL CONSTRAINT DF_iext_activo DEFAULT 1,
    creado_en      DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_iext_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_iext_act DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_academia_instructores_externos PRIMARY KEY CLUSTERED (id)
);
END
GO

/* ============================================================= */
/* Actividad academica -- el "curso/capacitacion/taller/etc."     */
/* ============================================================= */
IF OBJECT_ID(N'academia.actividades', N'U') IS NULL
BEGIN
CREATE TABLE academia.actividades (
    id                        UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_acad_act_id DEFAULT NEWSEQUENTIALID(),
    codigo                    NVARCHAR(30)  NULL,
    nombre                    NVARCHAR(200) NOT NULL,
    tipo_actividad_id         UNIQUEIDENTIFIER NOT NULL,
    descripcion               NVARCHAR(MAX) NULL,
    objetivo                  NVARCHAR(MAX) NULL,
    institucion_organizadora  NVARCHAR(200) NULL,
    fecha_inicio              DATE NOT NULL,
    fecha_fin                 DATE NOT NULL,
    hora_inicio               TIME(0) NULL,
    hora_fin                  TIME(0) NULL,
    duracion_horas            DECIMAL(6,2) NULL,
    modalidad_id              UNIQUEIDENTIFIER NULL,
    lugar                     NVARCHAR(200) NULL,
    responsable_bombero_id    UNIQUEIDENTIFIER NULL,
    cupo                      INT NULL,
    requisitos                NVARCHAR(MAX) NULL,
    estado                    NVARCHAR(20) NOT NULL CONSTRAINT DF_acad_act_estado DEFAULT N'PLANIFICADA',
    observaciones             NVARCHAR(MAX) NULL,
    es_externa                BIT NOT NULL CONSTRAINT DF_acad_act_externa DEFAULT 0,
    institucion_id            UNIQUEIDENTIFIER NULL, -- reservado multi-institucion, sin usar todavia
    creado_en                 DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_acad_act_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en            DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_acad_act_act DEFAULT SYSDATETIMEOFFSET(),
    creado_por                UNIQUEIDENTIFIER NULL,
    actualizado_por           UNIQUEIDENTIFIER NULL,
    CONSTRAINT PK_academia_actividades PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_acad_act_estado CHECK (estado IN (N'PLANIFICADA',N'ABIERTA',N'EN_CURSO',N'FINALIZADA',N'CANCELADA')),
    CONSTRAINT CK_acad_act_fechas CHECK (fecha_fin >= fecha_inicio),
    CONSTRAINT FK_acad_act_tipo FOREIGN KEY (tipo_actividad_id) REFERENCES organizacion.parametros(id),
    CONSTRAINT FK_acad_act_modalidad FOREIGN KEY (modalidad_id) REFERENCES organizacion.parametros(id),
    CONSTRAINT FK_acad_act_responsable FOREIGN KEY (responsable_bombero_id) REFERENCES personal.bomberos(id)
);
CREATE INDEX IX_acad_actividades_estado ON academia.actividades(estado, fecha_inicio);
END
GO

/* ============================================================= */
/* Instructores de una actividad (bombero interno o externo)      */
/* ============================================================= */
IF OBJECT_ID(N'academia.instructores_actividad', N'U') IS NULL
BEGIN
CREATE TABLE academia.instructores_actividad (
    id                   UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_acad_inst_id DEFAULT NEWSEQUENTIALID(),
    actividad_id         UNIQUEIDENTIFIER NOT NULL,
    bombero_id           UNIQUEIDENTIFIER NULL,
    instructor_externo_id UNIQUEIDENTIFIER NULL,
    rol_instructor       NVARCHAR(20) NOT NULL CONSTRAINT DF_acad_inst_rol DEFAULT N'PRINCIPAL',
    creado_en            DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_acad_inst_creado DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_academia_instructores_actividad PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_acad_inst_rol CHECK (rol_instructor IN (N'PRINCIPAL',N'AYUDANTE')),
    CONSTRAINT CK_acad_inst_persona CHECK (
        (bombero_id IS NOT NULL AND instructor_externo_id IS NULL) OR
        (bombero_id IS NULL AND instructor_externo_id IS NOT NULL)
    ),
    CONSTRAINT FK_acad_inst_actividad FOREIGN KEY (actividad_id) REFERENCES academia.actividades(id) ON DELETE CASCADE,
    CONSTRAINT FK_acad_inst_bombero FOREIGN KEY (bombero_id) REFERENCES personal.bomberos(id),
    CONSTRAINT FK_acad_inst_externo FOREIGN KEY (instructor_externo_id) REFERENCES academia.instructores_externos(id)
);
CREATE INDEX IX_acad_instructores_actividad ON academia.instructores_actividad(actividad_id);
END
GO

/* ============================================================= */
/* Inscripciones (bombero o participante externo -- reutiliza      */
/* operaciones.participantes_externos, no se duplica)              */
/* ============================================================= */
IF OBJECT_ID(N'academia.inscripciones', N'U') IS NULL
BEGIN
CREATE TABLE academia.inscripciones (
    id                      UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_acad_insc_id DEFAULT NEWSEQUENTIALID(),
    actividad_id            UNIQUEIDENTIFIER NOT NULL,
    bombero_id              UNIQUEIDENTIFIER NULL,
    participante_externo_id UNIQUEIDENTIFIER NULL,
    participante_id         AS (COALESCE(bombero_id, participante_externo_id)) PERSISTED,
    fecha_inscripcion       DATE NOT NULL CONSTRAINT DF_acad_insc_fecha DEFAULT CAST(SYSDATETIME() AS DATE),
    estado                  NVARCHAR(20) NOT NULL CONSTRAINT DF_acad_insc_estado DEFAULT N'INSCRITO',
    resultado_final_id      UNIQUEIDENTIFIER NULL,
    observaciones           NVARCHAR(MAX) NULL,
    creado_en               DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_acad_insc_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en          DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_acad_insc_act DEFAULT SYSDATETIMEOFFSET(),
    creado_por              UNIQUEIDENTIFIER NULL,
    actualizado_por         UNIQUEIDENTIFIER NULL,
    CONSTRAINT PK_academia_inscripciones PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_academia_inscripciones UNIQUE (actividad_id, participante_id),
    CONSTRAINT CK_acad_insc_estado CHECK (estado IN (N'INSCRITO',N'ACTIVO',N'RETIRADO',N'FINALIZADO')),
    CONSTRAINT CK_acad_insc_participante CHECK (
        (bombero_id IS NOT NULL AND participante_externo_id IS NULL) OR
        (bombero_id IS NULL AND participante_externo_id IS NOT NULL)
    ),
    CONSTRAINT FK_acad_insc_actividad FOREIGN KEY (actividad_id) REFERENCES academia.actividades(id) ON DELETE CASCADE,
    CONSTRAINT FK_acad_insc_bombero FOREIGN KEY (bombero_id) REFERENCES personal.bomberos(id),
    CONSTRAINT FK_acad_insc_externo FOREIGN KEY (participante_externo_id) REFERENCES operaciones.participantes_externos(id),
    CONSTRAINT FK_acad_insc_resultado FOREIGN KEY (resultado_final_id) REFERENCES organizacion.parametros(id)
);
CREATE INDEX IX_acad_inscripciones_actividad ON academia.inscripciones(actividad_id);
CREATE INDEX IX_acad_inscripciones_bombero ON academia.inscripciones(bombero_id) WHERE bombero_id IS NOT NULL;
END
GO

/* ============================================================= */
/* Evaluaciones de una actividad + nota por inscripcion            */
/* ============================================================= */
IF OBJECT_ID(N'academia.evaluaciones', N'U') IS NULL
BEGIN
CREATE TABLE academia.evaluaciones (
    id                    UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_acad_eval_id DEFAULT NEWSEQUENTIALID(),
    actividad_id          UNIQUEIDENTIFIER NOT NULL,
    tipo_evaluacion_id    UNIQUEIDENTIFIER NOT NULL,
    titulo                NVARCHAR(200) NULL,
    fecha                 DATE NULL,
    evaluador_bombero_id  UNIQUEIDENTIFIER NULL,
    evaluador_externo_id  UNIQUEIDENTIFIER NULL,
    escala                NVARCHAR(100) NULL,
    observaciones         NVARCHAR(MAX) NULL,
    creado_en             DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_acad_eval_creado DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_academia_evaluaciones PRIMARY KEY CLUSTERED (id),
    CONSTRAINT FK_acad_eval_actividad FOREIGN KEY (actividad_id) REFERENCES academia.actividades(id) ON DELETE CASCADE,
    CONSTRAINT FK_acad_eval_tipo FOREIGN KEY (tipo_evaluacion_id) REFERENCES organizacion.parametros(id),
    CONSTRAINT FK_acad_eval_evaluador_bombero FOREIGN KEY (evaluador_bombero_id) REFERENCES personal.bomberos(id),
    CONSTRAINT FK_acad_eval_evaluador_externo FOREIGN KEY (evaluador_externo_id) REFERENCES academia.instructores_externos(id)
);
CREATE INDEX IX_acad_evaluaciones_actividad ON academia.evaluaciones(actividad_id);
END
GO

IF OBJECT_ID(N'academia.notas_evaluacion', N'U') IS NULL
BEGIN
CREATE TABLE academia.notas_evaluacion (
    id             UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_acad_nota_id DEFAULT NEWSEQUENTIALID(),
    evaluacion_id  UNIQUEIDENTIFIER NOT NULL,
    inscripcion_id UNIQUEIDENTIFIER NOT NULL,
    calificacion   DECIMAL(5,2) NULL,
    resultado_id   UNIQUEIDENTIFIER NULL,
    observaciones  NVARCHAR(MAX) NULL,
    creado_en      DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_acad_nota_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_acad_nota_act DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_academia_notas_evaluacion PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_academia_notas_evaluacion UNIQUE (evaluacion_id, inscripcion_id),
    CONSTRAINT FK_acad_nota_evaluacion FOREIGN KEY (evaluacion_id) REFERENCES academia.evaluaciones(id) ON DELETE CASCADE,
    -- Sin ON DELETE CASCADE aca: inscripcion_id ya llega a esta tabla via
    -- evaluacion_id->actividad_id->... ; una segunda ruta CASCADE en la
    -- misma tabla es rechazada por SQL Server (multiple cascade paths).
    -- En la practica una inscripcion nunca se borra fisicamente (pasa a
    -- RETIRADO), asi que esto no bloquea flujos reales.
    CONSTRAINT FK_acad_nota_inscripcion FOREIGN KEY (inscripcion_id) REFERENCES academia.inscripciones(id),
    CONSTRAINT FK_acad_nota_resultado FOREIGN KEY (resultado_id) REFERENCES organizacion.parametros(id)
);
CREATE INDEX IX_acad_notas_inscripcion ON academia.notas_evaluacion(inscripcion_id);
END
GO

/* ============================================================= */
/* Parametros nuevos (Organizacion Institucional -> Parametros)    */
/* ============================================================= */
-- organizacion.parametros.tipo tiene un CHECK de lista fija en la base
-- (ademas del union de TypeScript) -- se recrea con los 4 tipos nuevos.
IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_param_tipo')
    ALTER TABLE organizacion.parametros DROP CONSTRAINT CK_param_tipo;
GO
IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_param_tipo')
    ALTER TABLE organizacion.parametros ADD CONSTRAINT CK_param_tipo CHECK (tipo IN (
        N'PAIS', N'DEPARTAMENTO', N'CIUDAD', N'BARRIO', N'PROFESION', N'IDIOMA', N'NIVEL_IDIOMA',
        N'GRUPO_SANGUINEO', N'FACTOR_RH', N'TIPO_SEGURO', N'ASEGURADORA', N'TIPO_EVENTO_ASISTENCIA',
        N'UBICACION_EQUIPO', N'ESTADO_PRESENCIA_GUARDIA', N'SECTOR_ESTACION',
        N'TIPO_ACTIVIDAD_ACADEMICA', N'MODALIDAD_ACADEMICA', N'TIPO_EVALUACION_ACADEMICA', N'RESULTADO_ACADEMICO'
    ));
GO

INSERT INTO organizacion.parametros (tipo, nombre, nombre_normalizado, orden)
SELECT v.tipo, v.nombre, v.nombre_normalizado, v.orden FROM (VALUES
    (N'TIPO_ACTIVIDAD_ACADEMICA', N'Curso',              N'curso',              1),
    (N'TIPO_ACTIVIDAD_ACADEMICA', N'Capacitación',       N'capacitacion',       2),
    (N'TIPO_ACTIVIDAD_ACADEMICA', N'Academia',           N'academia',           3),
    (N'TIPO_ACTIVIDAD_ACADEMICA', N'Taller',             N'taller',             4),
    (N'TIPO_ACTIVIDAD_ACADEMICA', N'Seminario',          N'seminario',          5),
    (N'TIPO_ACTIVIDAD_ACADEMICA', N'Jornada',            N'jornada',            6),
    (N'TIPO_ACTIVIDAD_ACADEMICA', N'Charla',             N'charla',             7),
    (N'TIPO_ACTIVIDAD_ACADEMICA', N'Instrucción',        N'instruccion',        8),
    (N'TIPO_ACTIVIDAD_ACADEMICA', N'Entrenamiento',      N'entrenamiento',      9),
    (N'TIPO_ACTIVIDAD_ACADEMICA', N'Práctica',           N'practica',           10),
    (N'TIPO_ACTIVIDAD_ACADEMICA', N'Simulacro',          N'simulacro',          11),
    (N'TIPO_ACTIVIDAD_ACADEMICA', N'Conferencia',        N'conferencia',        12),
    (N'TIPO_ACTIVIDAD_ACADEMICA', N'Curso externo',      N'curso externo',      13),
    (N'TIPO_ACTIVIDAD_ACADEMICA', N'Otra',               N'otra',               14),

    (N'MODALIDAD_ACADEMICA', N'Presencial',      N'presencial',      1),
    (N'MODALIDAD_ACADEMICA', N'Virtual',         N'virtual',         2),
    (N'MODALIDAD_ACADEMICA', N'Semipresencial',  N'semipresencial',  3),
    (N'MODALIDAD_ACADEMICA', N'Práctica',        N'practica',        4),
    (N'MODALIDAD_ACADEMICA', N'Otra',            N'otra',            5),

    (N'TIPO_EVALUACION_ACADEMICA', N'Examen teórico',    N'examen teorico',    1),
    (N'TIPO_EVALUACION_ACADEMICA', N'Examen práctico',   N'examen practico',   2),
    (N'TIPO_EVALUACION_ACADEMICA', N'Evaluación física', N'evaluacion fisica', 3),
    (N'TIPO_EVALUACION_ACADEMICA', N'Evaluación escrita',N'evaluacion escrita',4),
    (N'TIPO_EVALUACION_ACADEMICA', N'Evaluación oral',   N'evaluacion oral',   5),
    (N'TIPO_EVALUACION_ACADEMICA', N'Trabajo práctico',  N'trabajo practico',  6),
    (N'TIPO_EVALUACION_ACADEMICA', N'Sin evaluación',    N'sin evaluacion',    7),

    (N'RESULTADO_ACADEMICO', N'Aprobado',               N'aprobado',               1),
    (N'RESULTADO_ACADEMICO', N'No aprobado',            N'no aprobado',            2),
    (N'RESULTADO_ACADEMICO', N'Reprobado',              N'reprobado',              3),
    (N'RESULTADO_ACADEMICO', N'Pendiente',              N'pendiente',              4),
    (N'RESULTADO_ACADEMICO', N'Ausente',                N'ausente',                5),
    (N'RESULTADO_ACADEMICO', N'Participación parcial',  N'participacion parcial',  6),
    (N'RESULTADO_ACADEMICO', N'En proceso',             N'en proceso',             7),
    (N'RESULTADO_ACADEMICO', N'Sin evaluación',         N'sin evaluacion',         8)
) AS v(tipo, nombre, nombre_normalizado, orden)
WHERE NOT EXISTS (
    SELECT 1 FROM organizacion.parametros p
    WHERE p.tipo = v.tipo AND p.nombre_normalizado = v.nombre_normalizado AND p.padre_id IS NULL
);
GO

/* ============================================================= */
/* Permisos nuevos (los 6 academia:* ya existian desde antes --   */
/* ver seed-data.ts -- estos son adicionales, mismo patron)        */
/* ============================================================= */
INSERT INTO seguridad.permisos (nombre, recurso, accion, categoria, descripcion)
SELECT v.nombre, N'academia', v.accion, N'Academia', v.descripcion
FROM (VALUES
    (N'academia:gestionar_instructores', N'gestionar_instructores', N'Asignar y editar instructores (internos o externos) de una actividad'),
    (N'academia:registrar_asistencia',   N'registrar_asistencia',   N'Registrar asistencia de una actividad academica'),
    (N'academia:configurar',             N'configurar',             N'Configurar tipos, modalidades y catalogos propios de Academia')
) AS v(nombre, accion, descripcion)
WHERE NOT EXISTS (SELECT 1 FROM seguridad.permisos p WHERE p.nombre = v.nombre);
GO

-- Instructor ya tenia los 6 permisos academia:* originales -- se le suman
-- los de gestion de su propia actividad.
INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id
FROM seguridad.roles r
CROSS JOIN seguridad.permisos p
WHERE r.nombre = N'Instructor'
  AND p.nombre IN (N'academia:gestionar_instructores', N'academia:registrar_asistencia')
  AND NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol apr WHERE apr.rol_id = r.id AND apr.permiso_id = p.id);
GO

-- Comandante: el Reglamento lo ubica entre las autoridades que resuelven
-- (Academia/Comandancia); ya tenia solo 'ver', se amplia a certificar.
INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id
FROM seguridad.roles r
CROSS JOIN seguridad.permisos p
WHERE r.nombre = N'Comandante'
  AND p.nombre = N'academia:certificar'
  AND NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol apr WHERE apr.rol_id = r.id AND apr.permiso_id = p.id);
GO
