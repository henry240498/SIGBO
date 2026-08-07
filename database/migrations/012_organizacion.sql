SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

/* =============================================================
   SIGBO-CBVC | Migracion 012 - Esquema organizacion (maestro
   institucional: rangos, cargos, especialidades, companias,
   cuarteles, brigadas, departamentos, unidades, turnos, tipos de
   guardia, designaciones, ascensos).

   Nota de nombres: operaciones.guardias YA EXISTE como tabla de
   guardias programadas (turno real, jefe_guardia_id, etc). El
   catalogo de "tipos de guardia" (24hs, 12hs, Nocturna...) de este
   modulo se llama organizacion.tipos_guardia para no chocar.

   Baja logica: cada tabla tiene "estado" (ACTIVO/INACTIVO, para
   activar/desactivar) y "eliminado_en" (marca de baja logica desde
   la accion "Eliminar" de la UI). Nunca hay DELETE fisico.
   ============================================================= */

IF SCHEMA_ID('organizacion') IS NULL EXEC('CREATE SCHEMA organizacion');
GO

/* ================= RANGOS ================= */
CREATE TABLE organizacion.rangos (
    id                UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_rangos_id DEFAULT NEWSEQUENTIALID(),
    codigo            NVARCHAR(20)  NOT NULL,
    nombre            NVARCHAR(100) NOT NULL,
    nivel_jerarquico  INT           NOT NULL CONSTRAINT DF_rangos_nivel DEFAULT 0,
    descripcion       NVARCHAR(MAX) NULL,
    insignia_url      NVARCHAR(MAX) NULL,
    color             NVARCHAR(7)   NOT NULL CONSTRAINT DF_rangos_color DEFAULT '#6B7280',
    orden_jerarquico  INT           NOT NULL CONSTRAINT DF_rangos_orden DEFAULT 0,
    estado            NVARCHAR(20)  NOT NULL CONSTRAINT DF_rangos_estado DEFAULT 'ACTIVO',
    observaciones     NVARCHAR(MAX) NULL,
    creado_en         DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_rangos_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en    DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_rangos_act DEFAULT SYSDATETIMEOFFSET(),
    eliminado_en      DATETIMEOFFSET(3) NULL,
    creado_por        UNIQUEIDENTIFIER NULL,
    actualizado_por   UNIQUEIDENTIFIER NULL,
    CONSTRAINT PK_rangos PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_rangos_codigo UNIQUE (codigo),
    CONSTRAINT UQ_rangos_nombre UNIQUE (nombre),
    CONSTRAINT CK_rangos_estado CHECK (estado IN ('ACTIVO','INACTIVO'))
);
GO

/* ================= CARGOS ================= */
CREATE TABLE organizacion.cargos (
    id                   UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_cargos_id DEFAULT NEWSEQUENTIALID(),
    codigo               NVARCHAR(20)  NOT NULL,
    nombre               NVARCHAR(100) NOT NULL,
    descripcion          NVARCHAR(MAX) NULL,
    area                 NVARCHAR(100) NULL,
    nivel                INT           NULL,
    dependencia_cargo_id UNIQUEIDENTIFIER NULL,
    estado               NVARCHAR(20)  NOT NULL CONSTRAINT DF_cargos_estado DEFAULT 'ACTIVO',
    creado_en            DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_cargos_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en       DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_cargos_act DEFAULT SYSDATETIMEOFFSET(),
    eliminado_en         DATETIMEOFFSET(3) NULL,
    creado_por           UNIQUEIDENTIFIER NULL,
    actualizado_por      UNIQUEIDENTIFIER NULL,
    CONSTRAINT PK_cargos PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_cargos_codigo UNIQUE (codigo),
    CONSTRAINT UQ_cargos_nombre UNIQUE (nombre),
    CONSTRAINT CK_cargos_estado CHECK (estado IN ('ACTIVO','INACTIVO')),
    CONSTRAINT FK_cargos_dependencia FOREIGN KEY (dependencia_cargo_id) REFERENCES organizacion.cargos(id)
);
GO

/* ================= ESPECIALIDADES ================= */
CREATE TABLE organizacion.especialidades (
    id              UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_espec_id DEFAULT NEWSEQUENTIALID(),
    codigo          NVARCHAR(20)  NOT NULL,
    nombre          NVARCHAR(100) NOT NULL,
    descripcion     NVARCHAR(MAX) NULL,
    requisitos      NVARCHAR(MAX) NULL,
    estado          NVARCHAR(20)  NOT NULL CONSTRAINT DF_espec_estado DEFAULT 'ACTIVO',
    creado_en       DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_espec_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en  DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_espec_act DEFAULT SYSDATETIMEOFFSET(),
    eliminado_en    DATETIMEOFFSET(3) NULL,
    creado_por      UNIQUEIDENTIFIER NULL,
    actualizado_por UNIQUEIDENTIFIER NULL,
    CONSTRAINT PK_especialidades PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_especialidades_codigo UNIQUE (codigo),
    CONSTRAINT UQ_especialidades_nombre UNIQUE (nombre),
    CONSTRAINT CK_espec_estado CHECK (estado IN ('ACTIVO','INACTIVO'))
);
GO

/* ================= COMPANIAS ================= */
CREATE TABLE organizacion.companias (
    id              UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_comp_id DEFAULT NEWSEQUENTIALID(),
    codigo          NVARCHAR(20)  NOT NULL,
    nombre          NVARCHAR(100) NOT NULL,
    ciudad          NVARCHAR(100) NULL,
    direccion       NVARCHAR(MAX) NULL,
    fecha_creacion  DATE          NULL,
    estado          NVARCHAR(20)  NOT NULL CONSTRAINT DF_comp_estado DEFAULT 'ACTIVO',
    creado_en       DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_comp_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en  DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_comp_act DEFAULT SYSDATETIMEOFFSET(),
    eliminado_en    DATETIMEOFFSET(3) NULL,
    creado_por      UNIQUEIDENTIFIER NULL,
    actualizado_por UNIQUEIDENTIFIER NULL,
    CONSTRAINT PK_companias PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_companias_codigo UNIQUE (codigo),
    CONSTRAINT UQ_companias_nombre UNIQUE (nombre),
    CONSTRAINT CK_comp_estado CHECK (estado IN ('ACTIVO','INACTIVO'))
);
GO

/* ================= CUARTELES ================= */
CREATE TABLE organizacion.cuarteles (
    id                     UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_cuartel_id DEFAULT NEWSEQUENTIALID(),
    codigo                 NVARCHAR(20)  NOT NULL,
    nombre                 NVARCHAR(100) NOT NULL,
    compania_id            UNIQUEIDENTIFIER NOT NULL,
    direccion              NVARCHAR(MAX) NULL,
    telefono               NVARCHAR(20)  NULL,
    responsable_bombero_id UNIQUEIDENTIFIER NULL,
    estado                 NVARCHAR(20)  NOT NULL CONSTRAINT DF_cuartel_estado DEFAULT 'ACTIVO',
    creado_en              DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_cuartel_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en         DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_cuartel_act DEFAULT SYSDATETIMEOFFSET(),
    eliminado_en           DATETIMEOFFSET(3) NULL,
    creado_por             UNIQUEIDENTIFIER NULL,
    actualizado_por        UNIQUEIDENTIFIER NULL,
    CONSTRAINT PK_cuarteles PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_cuarteles_codigo UNIQUE (codigo),
    CONSTRAINT CK_cuartel_estado CHECK (estado IN ('ACTIVO','INACTIVO')),
    CONSTRAINT FK_cuartel_compania FOREIGN KEY (compania_id) REFERENCES organizacion.companias(id)
);
GO

/* ================= BRIGADAS ================= */
CREATE TABLE organizacion.brigadas (
    id              UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_brig_id DEFAULT NEWSEQUENTIALID(),
    codigo          NVARCHAR(20)  NOT NULL,
    nombre          NVARCHAR(100) NOT NULL,
    descripcion     NVARCHAR(MAX) NULL,
    estado          NVARCHAR(20)  NOT NULL CONSTRAINT DF_brig_estado DEFAULT 'ACTIVO',
    creado_en       DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_brig_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en  DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_brig_act DEFAULT SYSDATETIMEOFFSET(),
    eliminado_en    DATETIMEOFFSET(3) NULL,
    creado_por      UNIQUEIDENTIFIER NULL,
    actualizado_por UNIQUEIDENTIFIER NULL,
    CONSTRAINT PK_brigadas PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_brigadas_codigo UNIQUE (codigo),
    CONSTRAINT UQ_brigadas_nombre UNIQUE (nombre),
    CONSTRAINT CK_brig_estado CHECK (estado IN ('ACTIVO','INACTIVO'))
);
GO

/* ================= DEPARTAMENTOS ================= */
CREATE TABLE organizacion.departamentos (
    id              UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_depto_id DEFAULT NEWSEQUENTIALID(),
    codigo          NVARCHAR(20)  NOT NULL,
    nombre          NVARCHAR(100) NOT NULL,
    descripcion     NVARCHAR(MAX) NULL,
    estado          NVARCHAR(20)  NOT NULL CONSTRAINT DF_depto_estado DEFAULT 'ACTIVO',
    creado_en       DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_depto_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en  DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_depto_act DEFAULT SYSDATETIMEOFFSET(),
    eliminado_en    DATETIMEOFFSET(3) NULL,
    creado_por      UNIQUEIDENTIFIER NULL,
    actualizado_por UNIQUEIDENTIFIER NULL,
    CONSTRAINT PK_departamentos PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_departamentos_codigo UNIQUE (codigo),
    CONSTRAINT UQ_departamentos_nombre UNIQUE (nombre),
    CONSTRAINT CK_depto_estado CHECK (estado IN ('ACTIVO','INACTIVO'))
);
GO

/* ================= UNIDADES ================= */
CREATE TABLE organizacion.unidades (
    id              UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_unid_id DEFAULT NEWSEQUENTIALID(),
    codigo          NVARCHAR(20)  NOT NULL,
    nombre          NVARCHAR(100) NOT NULL,
    descripcion     NVARCHAR(MAX) NULL,
    brigada_id      UNIQUEIDENTIFIER NULL,
    estado          NVARCHAR(20)  NOT NULL CONSTRAINT DF_unid_estado DEFAULT 'ACTIVO',
    creado_en       DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_unid_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en  DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_unid_act DEFAULT SYSDATETIMEOFFSET(),
    eliminado_en    DATETIMEOFFSET(3) NULL,
    creado_por      UNIQUEIDENTIFIER NULL,
    actualizado_por UNIQUEIDENTIFIER NULL,
    CONSTRAINT PK_unidades PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_unidades_codigo UNIQUE (codigo),
    CONSTRAINT CK_unid_estado CHECK (estado IN ('ACTIVO','INACTIVO')),
    CONSTRAINT FK_unidades_brigada FOREIGN KEY (brigada_id) REFERENCES organizacion.brigadas(id)
);
GO

/* ================= TURNOS ================= */
CREATE TABLE organizacion.turnos (
    id                     UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_turno_id DEFAULT NEWSEQUENTIALID(),
    codigo                 NVARCHAR(20)  NOT NULL,
    nombre                 NVARCHAR(100) NOT NULL,
    hora_inicio            TIME(0)       NULL,
    hora_fin               TIME(0)       NULL,
    responsable_bombero_id UNIQUEIDENTIFIER NULL,
    estado                 NVARCHAR(20)  NOT NULL CONSTRAINT DF_turno_estado DEFAULT 'ACTIVO',
    creado_en              DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_turno_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en         DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_turno_act DEFAULT SYSDATETIMEOFFSET(),
    eliminado_en           DATETIMEOFFSET(3) NULL,
    creado_por             UNIQUEIDENTIFIER NULL,
    actualizado_por        UNIQUEIDENTIFIER NULL,
    CONSTRAINT PK_turnos PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_turnos_codigo UNIQUE (codigo),
    CONSTRAINT UQ_turnos_nombre UNIQUE (nombre),
    CONSTRAINT CK_turno_estado CHECK (estado IN ('ACTIVO','INACTIVO'))
);
GO

/* ================= TIPOS DE GUARDIA ================= */
/* Catalogo de tipos (24hs, 12hs, Nocturna...). No confundir con
   operaciones.guardias (guardias programadas reales). */
CREATE TABLE organizacion.tipos_guardia (
    id              UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_tguard_id DEFAULT NEWSEQUENTIALID(),
    codigo          NVARCHAR(20)  NOT NULL,
    nombre          NVARCHAR(100) NOT NULL,
    duracion_horas  INT           NULL,
    descripcion     NVARCHAR(MAX) NULL,
    estado          NVARCHAR(20)  NOT NULL CONSTRAINT DF_tguard_estado DEFAULT 'ACTIVO',
    creado_en       DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_tguard_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en  DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_tguard_act DEFAULT SYSDATETIMEOFFSET(),
    eliminado_en    DATETIMEOFFSET(3) NULL,
    creado_por      UNIQUEIDENTIFIER NULL,
    actualizado_por UNIQUEIDENTIFIER NULL,
    CONSTRAINT PK_tipos_guardia PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_tipos_guardia_codigo UNIQUE (codigo),
    CONSTRAINT UQ_tipos_guardia_nombre UNIQUE (nombre),
    CONSTRAINT CK_tguard_estado CHECK (estado IN ('ACTIVO','INACTIVO'))
);
GO

/* ================= DESIGNACIONES ================= */
/* Historial de asignacion de personas a cargos (con desde/hasta) */
CREATE TABLE organizacion.designaciones (
    id              UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_desig_id DEFAULT NEWSEQUENTIALID(),
    codigo          NVARCHAR(30)  NULL,
    bombero_id      UNIQUEIDENTIFIER NOT NULL,
    cargo_id        UNIQUEIDENTIFIER NOT NULL,
    compania_id     UNIQUEIDENTIFIER NULL,
    cuartel_id      UNIQUEIDENTIFIER NULL,
    fecha_desde     DATE          NOT NULL,
    fecha_hasta     DATE          NULL,
    estado          NVARCHAR(20)  NOT NULL CONSTRAINT DF_desig_estado DEFAULT 'ACTIVA',
    motivo          NVARCHAR(MAX) NULL,
    observaciones   NVARCHAR(MAX) NULL,
    creado_en       DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_desig_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en  DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_desig_act DEFAULT SYSDATETIMEOFFSET(),
    eliminado_en    DATETIMEOFFSET(3) NULL,
    creado_por      UNIQUEIDENTIFIER NULL,
    actualizado_por UNIQUEIDENTIFIER NULL,
    CONSTRAINT PK_designaciones PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_desig_estado CHECK (estado IN ('ACTIVA','FINALIZADA','ANULADA')),
    CONSTRAINT CK_desig_fechas CHECK (fecha_hasta IS NULL OR fecha_hasta >= fecha_desde),
    CONSTRAINT FK_desig_bombero  FOREIGN KEY (bombero_id)  REFERENCES personal.bomberos(id),
    CONSTRAINT FK_desig_cargo    FOREIGN KEY (cargo_id)    REFERENCES organizacion.cargos(id),
    CONSTRAINT FK_desig_compania FOREIGN KEY (compania_id) REFERENCES organizacion.companias(id),
    CONSTRAINT FK_desig_cuartel  FOREIGN KEY (cuartel_id)  REFERENCES organizacion.cuarteles(id)
);
GO

/* ================= ASCENSOS ================= */
CREATE TABLE organizacion.ascensos (
    id                UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_ascenso_id DEFAULT NEWSEQUENTIALID(),
    codigo            NVARCHAR(30)  NULL,
    bombero_id        UNIQUEIDENTIFIER NOT NULL,
    rango_anterior_id UNIQUEIDENTIFIER NULL,
    rango_nuevo_id    UNIQUEIDENTIFIER NOT NULL,
    fecha             DATE          NOT NULL,
    resolucion        NVARCHAR(100) NULL,
    motivo            NVARCHAR(MAX) NULL,
    observaciones     NVARCHAR(MAX) NULL,
    estado            NVARCHAR(20)  NOT NULL CONSTRAINT DF_ascenso_estado DEFAULT 'REGISTRADO',
    creado_en         DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_ascenso_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en    DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_ascenso_act DEFAULT SYSDATETIMEOFFSET(),
    eliminado_en      DATETIMEOFFSET(3) NULL,
    creado_por        UNIQUEIDENTIFIER NULL,
    actualizado_por   UNIQUEIDENTIFIER NULL,
    CONSTRAINT PK_ascensos PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_ascenso_estado CHECK (estado IN ('REGISTRADO','ANULADO')),
    CONSTRAINT FK_ascenso_bombero        FOREIGN KEY (bombero_id)        REFERENCES personal.bomberos(id),
    CONSTRAINT FK_ascenso_rango_anterior FOREIGN KEY (rango_anterior_id) REFERENCES organizacion.rangos(id) ON DELETE SET NULL,
    CONSTRAINT FK_ascenso_rango_nuevo    FOREIGN KEY (rango_nuevo_id)    REFERENCES organizacion.rangos(id)
);
GO

/* ================= BOMBERO <-> ESPECIALIDADES (muchos a muchos) ================= */
CREATE TABLE personal.bombero_especialidades (
    id               UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_bomesp_id DEFAULT NEWSEQUENTIALID(),
    bombero_id       UNIQUEIDENTIFIER NOT NULL,
    especialidad_id  UNIQUEIDENTIFIER NOT NULL,
    fecha_obtencion  DATE          NULL,
    estado           NVARCHAR(20)  NOT NULL CONSTRAINT DF_bomesp_estado DEFAULT 'ACTIVA',
    creado_en        DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_bomesp_creado DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_bombero_especialidades PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_bombero_especialidades UNIQUE (bombero_id, especialidad_id),
    CONSTRAINT FK_bomesp_bombero     FOREIGN KEY (bombero_id)      REFERENCES personal.bomberos(id) ON DELETE CASCADE,
    CONSTRAINT FK_bomesp_especialidad FOREIGN KEY (especialidad_id) REFERENCES organizacion.especialidades(id)
);
GO

/* ================= INTEGRACION: personal.bomberos ================= */
ALTER TABLE personal.bomberos ADD
    rango_id           UNIQUEIDENTIFIER NULL,
    cargo_principal_id UNIQUEIDENTIFIER NULL,
    compania_id        UNIQUEIDENTIFIER NULL,
    cuartel_id         UNIQUEIDENTIFIER NULL,
    turno_id           UNIQUEIDENTIFIER NULL,
    tipo_guardia_id    UNIQUEIDENTIFIER NULL;
GO

ALTER TABLE personal.bomberos
    ADD CONSTRAINT FK_bomberos_rango           FOREIGN KEY (rango_id)           REFERENCES organizacion.rangos(id)        ON DELETE SET NULL,
        CONSTRAINT FK_bomberos_cargo_principal FOREIGN KEY (cargo_principal_id) REFERENCES organizacion.cargos(id)        ON DELETE SET NULL,
        CONSTRAINT FK_bomberos_compania        FOREIGN KEY (compania_id)        REFERENCES organizacion.companias(id)     ON DELETE SET NULL,
        CONSTRAINT FK_bomberos_cuartel         FOREIGN KEY (cuartel_id)         REFERENCES organizacion.cuarteles(id)     ON DELETE SET NULL,
        CONSTRAINT FK_bomberos_turno           FOREIGN KEY (turno_id)           REFERENCES organizacion.turnos(id)        ON DELETE SET NULL,
        CONSTRAINT FK_bomberos_tipo_guardia    FOREIGN KEY (tipo_guardia_id)    REFERENCES organizacion.tipos_guardia(id) ON DELETE SET NULL;
GO

ALTER TABLE organizacion.cuarteles
    ADD CONSTRAINT FK_cuartel_responsable FOREIGN KEY (responsable_bombero_id) REFERENCES personal.bomberos(id) ON DELETE SET NULL;
GO

ALTER TABLE organizacion.turnos
    ADD CONSTRAINT FK_turno_responsable FOREIGN KEY (responsable_bombero_id) REFERENCES personal.bomberos(id) ON DELETE SET NULL;
GO

/* ================= AUDITORIA (creado_por/actualizado_por -> usuarios) ================= */
ALTER TABLE organizacion.rangos
    ADD CONSTRAINT FK_rangos_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id),
        CONSTRAINT FK_rangos_actpor    FOREIGN KEY (actualizado_por) REFERENCES seguridad.usuarios(id);
GO
ALTER TABLE organizacion.cargos
    ADD CONSTRAINT FK_cargos_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id),
        CONSTRAINT FK_cargos_actpor    FOREIGN KEY (actualizado_por) REFERENCES seguridad.usuarios(id);
GO
ALTER TABLE organizacion.especialidades
    ADD CONSTRAINT FK_espec_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id),
        CONSTRAINT FK_espec_actpor    FOREIGN KEY (actualizado_por) REFERENCES seguridad.usuarios(id);
GO
ALTER TABLE organizacion.companias
    ADD CONSTRAINT FK_comp_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id),
        CONSTRAINT FK_comp_actpor    FOREIGN KEY (actualizado_por) REFERENCES seguridad.usuarios(id);
GO
ALTER TABLE organizacion.cuarteles
    ADD CONSTRAINT FK_cuartel_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id),
        CONSTRAINT FK_cuartel_actpor    FOREIGN KEY (actualizado_por) REFERENCES seguridad.usuarios(id);
GO
ALTER TABLE organizacion.brigadas
    ADD CONSTRAINT FK_brig_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id),
        CONSTRAINT FK_brig_actpor    FOREIGN KEY (actualizado_por) REFERENCES seguridad.usuarios(id);
GO
ALTER TABLE organizacion.departamentos
    ADD CONSTRAINT FK_depto_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id),
        CONSTRAINT FK_depto_actpor    FOREIGN KEY (actualizado_por) REFERENCES seguridad.usuarios(id);
GO
ALTER TABLE organizacion.unidades
    ADD CONSTRAINT FK_unid_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id),
        CONSTRAINT FK_unid_actpor    FOREIGN KEY (actualizado_por) REFERENCES seguridad.usuarios(id);
GO
ALTER TABLE organizacion.turnos
    ADD CONSTRAINT FK_turno_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id),
        CONSTRAINT FK_turno_actpor    FOREIGN KEY (actualizado_por) REFERENCES seguridad.usuarios(id);
GO
ALTER TABLE organizacion.tipos_guardia
    ADD CONSTRAINT FK_tguard_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id),
        CONSTRAINT FK_tguard_actpor    FOREIGN KEY (actualizado_por) REFERENCES seguridad.usuarios(id);
GO
ALTER TABLE organizacion.designaciones
    ADD CONSTRAINT FK_desig_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id),
        CONSTRAINT FK_desig_actpor    FOREIGN KEY (actualizado_por) REFERENCES seguridad.usuarios(id);
GO
ALTER TABLE organizacion.ascensos
    ADD CONSTRAINT FK_ascenso_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id),
        CONSTRAINT FK_ascenso_actpor    FOREIGN KEY (actualizado_por) REFERENCES seguridad.usuarios(id);
GO

/* ================= INDICES ================= */
CREATE INDEX IX_cargos_dependencia       ON organizacion.cargos(dependencia_cargo_id);
CREATE INDEX IX_cuarteles_compania       ON organizacion.cuarteles(compania_id);
CREATE INDEX IX_unidades_brigada         ON organizacion.unidades(brigada_id);
CREATE INDEX IX_designaciones_bombero    ON organizacion.designaciones(bombero_id);
CREATE INDEX IX_designaciones_cargo      ON organizacion.designaciones(cargo_id);
CREATE INDEX IX_designaciones_estado     ON organizacion.designaciones(estado);
CREATE INDEX IX_ascensos_bombero         ON organizacion.ascensos(bombero_id);
CREATE INDEX IX_bombero_especialidades_b ON personal.bombero_especialidades(bombero_id);
CREATE INDEX IX_bombero_especialidades_e ON personal.bombero_especialidades(especialidad_id);
CREATE INDEX IX_bomberos_rango_id        ON personal.bomberos(rango_id);
CREATE INDEX IX_bomberos_compania_id     ON personal.bomberos(compania_id);
CREATE INDEX IX_bomberos_cuartel_id      ON personal.bomberos(cuartel_id);
GO

/* ================= CATALOGO DE PERMISOS ================= */
INSERT INTO seguridad.permisos (nombre, recurso, accion, categoria)
SELECT v.nombre, v.recurso, v.accion, v.categoria
FROM (VALUES
    ('organizacion:rangos_ver',            'organizacion', 'rangos_ver',            'Organizacion Institucional'),
    ('organizacion:rangos_crear',          'organizacion', 'rangos_crear',          'Organizacion Institucional'),
    ('organizacion:rangos_editar',         'organizacion', 'rangos_editar',         'Organizacion Institucional'),
    ('organizacion:rangos_eliminar',       'organizacion', 'rangos_eliminar',       'Organizacion Institucional'),
    ('organizacion:cargos_ver',            'organizacion', 'cargos_ver',            'Organizacion Institucional'),
    ('organizacion:cargos_crear',          'organizacion', 'cargos_crear',          'Organizacion Institucional'),
    ('organizacion:cargos_editar',         'organizacion', 'cargos_editar',         'Organizacion Institucional'),
    ('organizacion:cargos_eliminar',       'organizacion', 'cargos_eliminar',       'Organizacion Institucional'),
    ('organizacion:especialidades_ver',      'organizacion', 'especialidades_ver',      'Organizacion Institucional'),
    ('organizacion:especialidades_crear',    'organizacion', 'especialidades_crear',    'Organizacion Institucional'),
    ('organizacion:especialidades_editar',   'organizacion', 'especialidades_editar',   'Organizacion Institucional'),
    ('organizacion:especialidades_eliminar', 'organizacion', 'especialidades_eliminar', 'Organizacion Institucional'),
    ('organizacion:companias_ver',         'organizacion', 'companias_ver',         'Organizacion Institucional'),
    ('organizacion:companias_crear',       'organizacion', 'companias_crear',       'Organizacion Institucional'),
    ('organizacion:companias_editar',      'organizacion', 'companias_editar',      'Organizacion Institucional'),
    ('organizacion:companias_eliminar',    'organizacion', 'companias_eliminar',    'Organizacion Institucional'),
    ('organizacion:cuarteles_ver',         'organizacion', 'cuarteles_ver',         'Organizacion Institucional'),
    ('organizacion:cuarteles_crear',       'organizacion', 'cuarteles_crear',       'Organizacion Institucional'),
    ('organizacion:cuarteles_editar',      'organizacion', 'cuarteles_editar',      'Organizacion Institucional'),
    ('organizacion:cuarteles_eliminar',    'organizacion', 'cuarteles_eliminar',    'Organizacion Institucional'),
    ('organizacion:brigadas_ver',          'organizacion', 'brigadas_ver',          'Organizacion Institucional'),
    ('organizacion:brigadas_crear',        'organizacion', 'brigadas_crear',        'Organizacion Institucional'),
    ('organizacion:brigadas_editar',       'organizacion', 'brigadas_editar',       'Organizacion Institucional'),
    ('organizacion:brigadas_eliminar',     'organizacion', 'brigadas_eliminar',     'Organizacion Institucional'),
    ('organizacion:departamentos_ver',      'organizacion', 'departamentos_ver',      'Organizacion Institucional'),
    ('organizacion:departamentos_crear',    'organizacion', 'departamentos_crear',    'Organizacion Institucional'),
    ('organizacion:departamentos_editar',   'organizacion', 'departamentos_editar',   'Organizacion Institucional'),
    ('organizacion:departamentos_eliminar', 'organizacion', 'departamentos_eliminar', 'Organizacion Institucional'),
    ('organizacion:unidades_ver',          'organizacion', 'unidades_ver',          'Organizacion Institucional'),
    ('organizacion:unidades_crear',        'organizacion', 'unidades_crear',        'Organizacion Institucional'),
    ('organizacion:unidades_editar',       'organizacion', 'unidades_editar',       'Organizacion Institucional'),
    ('organizacion:unidades_eliminar',     'organizacion', 'unidades_eliminar',     'Organizacion Institucional'),
    ('organizacion:turnos_ver',            'organizacion', 'turnos_ver',            'Organizacion Institucional'),
    ('organizacion:turnos_crear',          'organizacion', 'turnos_crear',          'Organizacion Institucional'),
    ('organizacion:turnos_editar',         'organizacion', 'turnos_editar',         'Organizacion Institucional'),
    ('organizacion:turnos_eliminar',       'organizacion', 'turnos_eliminar',       'Organizacion Institucional'),
    ('organizacion:tipos_guardia_ver',      'organizacion', 'tipos_guardia_ver',      'Organizacion Institucional'),
    ('organizacion:tipos_guardia_crear',    'organizacion', 'tipos_guardia_crear',    'Organizacion Institucional'),
    ('organizacion:tipos_guardia_editar',   'organizacion', 'tipos_guardia_editar',   'Organizacion Institucional'),
    ('organizacion:tipos_guardia_eliminar', 'organizacion', 'tipos_guardia_eliminar', 'Organizacion Institucional'),
    ('organizacion:designaciones_ver',       'organizacion', 'designaciones_ver',       'Organizacion Institucional'),
    ('organizacion:designaciones_crear',     'organizacion', 'designaciones_crear',     'Organizacion Institucional'),
    ('organizacion:designaciones_editar',    'organizacion', 'designaciones_editar',    'Organizacion Institucional'),
    ('organizacion:designaciones_finalizar', 'organizacion', 'designaciones_finalizar', 'Organizacion Institucional'),
    ('organizacion:designaciones_eliminar',  'organizacion', 'designaciones_eliminar',  'Organizacion Institucional'),
    ('organizacion:ascensos_ver',          'organizacion', 'ascensos_ver',          'Organizacion Institucional'),
    ('organizacion:ascensos_crear',        'organizacion', 'ascensos_crear',        'Organizacion Institucional'),
    ('organizacion:ascensos_anular',       'organizacion', 'ascensos_anular',       'Organizacion Institucional'),
    ('organizacion:ver_dashboard',         'organizacion', 'ver_dashboard',         'Organizacion Institucional'),
    ('organizacion:exportar_reportes',     'organizacion', 'exportar_reportes',     'Organizacion Institucional')
) AS v(nombre, recurso, accion, categoria)
WHERE NOT EXISTS (SELECT 1 FROM seguridad.permisos p WHERE p.nombre = v.nombre);
GO

/* Otorgar todos los permisos nuevos al rol Administrador General */
INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id
FROM seguridad.roles r
CROSS JOIN seguridad.permisos p
WHERE r.nombre = 'Administrador General'
  AND p.nombre LIKE 'organizacion:%'
  AND NOT EXISTS (
    SELECT 1 FROM seguridad.asignacion_permisos_rol apr
    WHERE apr.rol_id = r.id AND apr.permiso_id = p.id
  );
GO
