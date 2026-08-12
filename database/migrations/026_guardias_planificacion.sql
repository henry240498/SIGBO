SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

/* =============================================================
   SIGBO-CBVC | Migracion 026 - Guardias: planificacion,
   generacion automatica y sorteo (Fase A - fundamentos)

   Verificado antes de escribir esta migracion: operaciones.guardias
   sigue vacia (0 filas), por lo que migrar CK_guard_estado y
   renombrar PROGRAMADA->PLANIFICADA no pierde datos reales.
   ============================================================= */

/* --- 1) Disponibilidad para guardias (personal.bomberos) ------- */
ALTER TABLE personal.bomberos ADD
    realiza_guardias             BIT NOT NULL CONSTRAINT DF_bomb_realizaguard DEFAULT 1,
    realiza_guardias_especiales  BIT NOT NULL CONSTRAINT DF_bomb_realizaguardesp DEFAULT 0,
    frecuencia_normal_mensual    INT NULL,
    frecuencia_especial_mensual  INT NULL,
    dia_preferente_guardia       NVARCHAR(10) NULL;
GO
ALTER TABLE personal.bomberos
    ADD CONSTRAINT CK_bomb_diapreferente CHECK (dia_preferente_guardia IN
        ('NINGUNA','LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO','DOMINGO'));
GO
-- Defensivo/explicito: los estados no-ACTIVO no deben quedar habilitados
-- por el default aunque en la practica ya nacen en 1.
UPDATE personal.bomberos SET realiza_guardias = 1 WHERE estado = 'ACTIVO';
GO

/* --- 2) Feriados institucionales (incluye feriados moviles) ---- */
CREATE TABLE organizacion.feriados (
    id              UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_fer_id DEFAULT NEWSEQUENTIALID(),
    fecha           DATE NOT NULL,
    nombre          NVARCHAR(150) NOT NULL,
    tipo            NVARCHAR(20) NOT NULL CONSTRAINT DF_fer_tipo DEFAULT 'FIJO',
    fecha_original  DATE NULL,
    es_especial     BIT NOT NULL CONSTRAINT DF_fer_especial DEFAULT 1,
    activo          BIT NOT NULL CONSTRAINT DF_fer_activo DEFAULT 1,
    observacion     NVARCHAR(MAX) NULL,
    creado_en       DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_fer_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en  DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_fer_act DEFAULT SYSDATETIMEOFFSET(),
    creado_por      UNIQUEIDENTIFIER NULL,
    actualizado_por UNIQUEIDENTIFIER NULL,
    CONSTRAINT PK_feriados PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_fer_tipo CHECK (tipo IN ('FIJO','MOVIL','TRASLADADO'))
);
GO
CREATE INDEX IX_feriados_fecha ON organizacion.feriados(fecha) WHERE activo = 1;
GO

/* --- 3) Esquemas de horario de guardia (catalogo parametrizable
   de plantillas -- secciones 2/14/15/19 del pedido) -------------- */
CREATE TABLE operaciones.esquemas_horario_guardia (
    id                  UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_esqh_id DEFAULT NEWSEQUENTIALID(),
    nombre              NVARCHAR(150) NOT NULL,
    dias_semana_csv     NVARCHAR(30) NULL, -- 'LUN,MAR,MIE,JUE,VIE' o NULL = solo feriados/especial
    hora_inicio         TIME(0) NOT NULL,
    hora_fin            TIME(0) NOT NULL,
    cruza_medianoche    BIT NOT NULL CONSTRAINT DF_esqh_cruza DEFAULT 0,
    dias_duracion       INT NOT NULL CONSTRAINT DF_esqh_dias DEFAULT 1,
    es_especial         BIT NOT NULL CONSTRAINT DF_esqh_especial DEFAULT 0,
    requiere_oficial    BIT NOT NULL CONSTRAINT DF_esqh_reqoficial DEFAULT 1,
    requiere_chofer     BIT NOT NULL CONSTRAINT DF_esqh_reqchofer DEFAULT 1,
    cantidad_minima     INT NULL,
    cantidad_maxima     INT NULL,
    cantidad_oficiales  INT NOT NULL CONSTRAINT DF_esqh_cantoficiales DEFAULT 1,
    cantidad_choferes   INT NOT NULL CONSTRAINT DF_esqh_cantchoferes DEFAULT 1,
    orden               INT NOT NULL CONSTRAINT DF_esqh_orden DEFAULT 0,
    activo              BIT NOT NULL CONSTRAINT DF_esqh_activo DEFAULT 1,
    creado_en           DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_esqh_creado DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_esquemas_horario_guardia PRIMARY KEY CLUSTERED (id)
);
GO

-- Seed de referencia (editable): los esquemas actuales del Cuerpo de
-- Bomberos, como PUNTO DE PARTIDA -- no como reglas fijas.
INSERT INTO operaciones.esquemas_horario_guardia
    (nombre, dias_semana_csv, hora_inicio, hora_fin, cruza_medianoche, es_especial, requiere_oficial, requiere_chofer, orden)
SELECT v.nombre, v.dias, v.hi, v.hf, v.cruza, v.especial, 1, v.chofer, v.orden FROM (VALUES
    (N'Personal rentado - manana',   N'LUN,MAR,MIE,JUE,VIE,SAB', CAST('06:00' AS TIME), CAST('14:00' AS TIME), 0, 0, 0, 1),
    (N'Personal rentado - tarde',    N'LUN,MAR,MIE,JUE,VIE,SAB', CAST('14:00' AS TIME), CAST('20:00' AS TIME), 0, 0, 0, 2),
    (N'Grupos - noche',              N'LUN,MAR,MIE,JUE,VIE',     CAST('20:00' AS TIME), CAST('06:00' AS TIME), 1, 0, 1, 3),
    (N'Grupos - sabado',             N'SAB',                     CAST('20:00' AS TIME), CAST('13:00' AS TIME), 1, 1, 1, 4),
    (N'Grupos - domingo',            N'DOM',                     CAST('13:00' AS TIME), CAST('06:00' AS TIME), 1, 1, 1, 5)
) AS v(nombre, dias, hi, hf, cruza, especial, chofer, orden)
WHERE NOT EXISTS (SELECT 1 FROM operaciones.esquemas_horario_guardia e WHERE e.nombre = v.nombre);
GO

/* --- 4) grupos_guardia: rotacion por ciclo + capacidad ---------- */
ALTER TABLE operaciones.grupos_guardia ADD
    ciclo_rotacion_dias  INT NULL,
    cantidad_minima      INT NULL,
    cantidad_maxima      INT NULL,
    cantidad_oficiales   INT NULL,
    cantidad_choferes    INT NULL;
GO

/* --- 5) guardias: referencia al esquema/feriado que la origino,
   y ciclo de vida ampliado (PLANIFICADA/CONFIRMADA/EN_CURSO/
   FINALIZADA/CANCELADA/ANULADA) -------------------------------- */
ALTER TABLE operaciones.guardias ADD
    esquema_horario_id  UNIQUEIDENTIFIER NULL,
    feriado_id          UNIQUEIDENTIFIER NULL;
GO
ALTER TABLE operaciones.guardias
    ADD CONSTRAINT FK_guard_esquemahorario FOREIGN KEY (esquema_horario_id) REFERENCES operaciones.esquemas_horario_guardia(id);
GO
ALTER TABLE operaciones.guardias
    ADD CONSTRAINT FK_guard_feriado FOREIGN KEY (feriado_id) REFERENCES organizacion.feriados(id);
GO

UPDATE operaciones.guardias SET estado = 'PLANIFICADA' WHERE estado = 'PROGRAMADA';
GO
ALTER TABLE operaciones.guardias DROP CONSTRAINT CK_guard_estado;
GO
ALTER TABLE operaciones.guardias DROP CONSTRAINT DF_guard_estado;
GO
ALTER TABLE operaciones.guardias ADD CONSTRAINT CK_guard_estado CHECK (estado IN
    ('PLANIFICADA','CONFIRMADA','EN_CURSO','FINALIZADA','CANCELADA','ANULADA'));
GO
ALTER TABLE operaciones.guardias
    ADD CONSTRAINT DF_guard_estado DEFAULT 'PLANIFICADA' FOR estado;
GO

/* --- 6) Permisos: la mayoria de las acciones de esta fase ya estan
   cubiertas por el namespace guardias:* ya sembrado
   (crear/editar/ver/eliminar/requisitos). Feriados vive en
   Organizacion (mismo patron que tipos_guardia/turnos), asi que
   sigue la convencion de esa pantalla con su propio prefijo. --- */
INSERT INTO seguridad.permisos (nombre, recurso, accion, categoria)
SELECT v.nombre, v.recurso, v.accion, N'Organizacion'
FROM (VALUES
    (N'organizacion:feriados_ver',     N'organizacion', N'feriados_ver'),
    (N'organizacion:feriados_crear',   N'organizacion', N'feriados_crear'),
    (N'organizacion:feriados_editar',  N'organizacion', N'feriados_editar'),
    (N'organizacion:feriados_eliminar',N'organizacion', N'feriados_eliminar')
) AS v(nombre, recurso, accion)
WHERE NOT EXISTS (SELECT 1 FROM seguridad.permisos p WHERE p.nombre = v.nombre);
GO

INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id FROM seguridad.roles r CROSS JOIN seguridad.permisos p
WHERE r.nombre = N'Administrador General' AND p.nombre LIKE 'organizacion:feriados_%'
    AND NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol a WHERE a.rol_id = r.id AND a.permiso_id = p.id);
GO
