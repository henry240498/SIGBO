/* =============================================================
   SIGBO-CBVC | Migracion 004 - Esquema academia
   ============================================================= */

/* TABLA: aspirantes */
CREATE TABLE academia.aspirantes (
    id                 UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_asp_id DEFAULT NEWSEQUENTIALID(),
    cedula             NVARCHAR(20)  NOT NULL,
    nombre             NVARCHAR(100) NOT NULL,
    apellido           NVARCHAR(100) NOT NULL,
    fecha_nacimiento   DATE          NOT NULL,
    telefono           NVARCHAR(20)  NOT NULL,
    email              NVARCHAR(255) NULL,
    direccion          NVARCHAR(MAX) NULL,
    estado             NVARCHAR(20)  NOT NULL CONSTRAINT DF_asp_estado DEFAULT 'INSCRITO',
    fecha_inscripcion  DATE          NOT NULL CONSTRAINT DF_asp_finsc DEFAULT CAST(SYSDATETIME() AS DATE),
    fecha_inicio       DATE          NULL,
    fecha_fin          DATE          NULL,
    observaciones      NVARCHAR(MAX) NULL,
    creado_en          DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_asp_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en     DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_asp_act DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_aspirantes PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_aspirantes_cedula UNIQUE (cedula),
    CONSTRAINT CK_asp_estado CHECK (estado IN ('INSCRITO','EN_CURSO','APROBADO','RECHAZADO','RETIRADO'))
);
GO

/* TABLA: materias */
CREATE TABLE academia.materias (
    id                 UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_mat_id DEFAULT NEWSEQUENTIALID(),
    codigo             NVARCHAR(20)  NOT NULL,
    nombre             NVARCHAR(200) NOT NULL,
    descripcion        NVARCHAR(MAX) NULL,
    nivel              NVARCHAR(20)  NOT NULL,
    horas_teoricas     INT           NOT NULL CONSTRAINT DF_mat_ht DEFAULT 0,
    horas_practicas    INT           NOT NULL CONSTRAINT DF_mat_hp DEFAULT 0,
    horas_totales      AS (horas_teoricas + horas_practicas) PERSISTED,
    requiere_practicas BIT           NOT NULL CONSTRAINT DF_mat_reqp DEFAULT 0,
    nota_aprobacion    DECIMAL(5,2)  NOT NULL CONSTRAINT DF_mat_nota DEFAULT 60.00,
    creado_en          DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_mat_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en     DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_mat_act DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_materias PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_materias_codigo UNIQUE (codigo),
    CONSTRAINT CK_mat_nivel CHECK (nivel IN ('BASICO','INTERMEDIO','AVANZADO'))
);
GO

/* TABLA: cursos */
CREATE TABLE academia.cursos (
    id             UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_cur_id DEFAULT NEWSEQUENTIALID(),
    materia_id     UNIQUEIDENTIFIER NOT NULL,
    nombre         NVARCHAR(200) NOT NULL,
    descripcion    NVARCHAR(MAX) NULL,
    fecha_inicio   DATE          NOT NULL,
    fecha_fin      DATE          NOT NULL,
    horario        NVARCHAR(100) NULL,
    instructor_id  UNIQUEIDENTIFIER NULL,
    cupo_maximo    INT           NOT NULL CONSTRAINT DF_cur_cupomax DEFAULT 30,
    cupo_actual    INT           NOT NULL CONSTRAINT DF_cur_cupoact DEFAULT 0,
    estado         NVARCHAR(20)  NOT NULL CONSTRAINT DF_cur_estado DEFAULT 'PLANIFICADO',
    metadata       NVARCHAR(MAX) NULL,
    creado_en      DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_cur_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_cur_act DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_cursos PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_cur_estado   CHECK (estado IN ('PLANIFICADO','EN_CURSO','FINALIZADO','CANCELADO')),
    CONSTRAINT CK_cur_fechas   CHECK (fecha_fin >= fecha_inicio),
    CONSTRAINT CK_cur_metadata CHECK (metadata IS NULL OR ISJSON(metadata) = 1)
);
GO

/* TABLA: inscripciones_cursos
   PostgreSQL usaba UNIQUE (curso_id, COALESCE(bombero_id, aspirante_id)).
   SQL Server no admite expresiones en UNIQUE -> se materializa en participante_id. */
CREATE TABLE academia.inscripciones_cursos (
    id                UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_insc_id DEFAULT NEWSEQUENTIALID(),
    curso_id          UNIQUEIDENTIFIER NOT NULL,
    bombero_id        UNIQUEIDENTIFIER NULL,
    aspirante_id      UNIQUEIDENTIFIER NULL,
    participante_id   AS (COALESCE(bombero_id, aspirante_id)) PERSISTED,
    fecha_inscripcion DATE          NOT NULL CONSTRAINT DF_insc_fecha DEFAULT CAST(SYSDATETIME() AS DATE),
    estado            NVARCHAR(20)  NOT NULL CONSTRAINT DF_insc_estado DEFAULT 'INSCRITO',
    nota_final        DECIMAL(5,2)  NULL,
    asistencia_total  INT           NOT NULL CONSTRAINT DF_insc_asist DEFAULT 0,
    observaciones     NVARCHAR(MAX) NULL,
    creado_en         DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_insc_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en    DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_insc_act DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_inscripciones_cursos PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_inscripciones_cursos UNIQUE (curso_id, participante_id),
    CONSTRAINT CK_insc_estado CHECK (estado IN ('INSCRITO','ACTIVO','RETIRADO','APROBADO','REPROBADO')),
    /* Exactamente uno de los dos participantes */
    CONSTRAINT CK_insc_participante CHECK (
        (bombero_id IS NOT NULL AND aspirante_id IS NULL) OR
        (bombero_id IS NULL AND aspirante_id IS NOT NULL)
    )
);
GO

/* TABLA: examenes */
CREATE TABLE academia.examenes (
    id                     UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_exa_id DEFAULT NEWSEQUENTIALID(),
    curso_id               UNIQUEIDENTIFIER NOT NULL,
    tipo                   NVARCHAR(20)  NOT NULL,
    titulo                 NVARCHAR(200) NOT NULL,
    descripcion            NVARCHAR(MAX) NULL,
    fecha                  DATE          NOT NULL,
    hora                   TIME(0)       NOT NULL,
    duracion_minutos       INT           NULL,
    nota_maxima            DECIMAL(5,2)  NOT NULL CONSTRAINT DF_exa_notamax DEFAULT 100.00,
    nota_minima_aprobacion DECIMAL(5,2)  NOT NULL CONSTRAINT DF_exa_notamin DEFAULT 60.00,
    creado_en              DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_exa_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en         DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_exa_act DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_examenes PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_exa_tipo CHECK (tipo IN ('TEORICO','PRACTICO','RECUPERATORIO'))
);
GO

/* TABLA: notas_examenes */
CREATE TABLE academia.notas_examenes (
    id             UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_nota_id DEFAULT NEWSEQUENTIALID(),
    examen_id      UNIQUEIDENTIFIER NOT NULL,
    inscripcion_id UNIQUEIDENTIFIER NOT NULL,
    nota           DECIMAL(5,2)  NULL,
    observaciones  NVARCHAR(MAX) NULL,
    estado         NVARCHAR(20)  NOT NULL CONSTRAINT DF_nota_estado DEFAULT 'PENDIENTE',
    creado_en      DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_nota_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_nota_act DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_notas_examenes PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_notas_examenes UNIQUE (examen_id, inscripcion_id),
    CONSTRAINT CK_nota_estado CHECK (estado IN ('PENDIENTE','APROBADO','REPROBADO','RECUPERANDO'))
);
GO

/* TABLA: asistencia_academia */
CREATE TABLE academia.asistencia_academia (
    id             UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_asisac_id DEFAULT NEWSEQUENTIALID(),
    inscripcion_id UNIQUEIDENTIFIER NOT NULL,
    fecha          DATE          NOT NULL,
    presente       BIT           NOT NULL CONSTRAINT DF_asisac_pres DEFAULT 0,
    justificado    BIT           NOT NULL CONSTRAINT DF_asisac_just DEFAULT 0,
    motivo         NVARCHAR(MAX) NULL,
    marcado_por    UNIQUEIDENTIFIER NULL,
    creado_en      DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_asisac_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_asisac_act DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_asistencia_academia PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_asistencia_academia UNIQUE (inscripcion_id, fecha)
);
GO
