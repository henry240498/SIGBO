/*
============================================================================
 017_tipos_bombero.sql
 SIGBO-CBVC — Catalogo parametrizable de Tipos de Bombero

 Proposito: permitir que un administrador defina/edite las categorias de
 bombero (nombre + prefijo de codigo institucional) sin tocar codigo fuente.
 Reemplaza la lista fija de prefijos (BCF, BC, BVA, BVAF, BH, BJ) por un
 catalogo real. Coexiste con personal.bomberos.condicion_institucional
 (columna existente, NO se modifica ni se migra): tipo_bombero_id es un
 campo nuevo que gobierna el prefijo del codigo bomberil de ahora en
 adelante; condicion_institucional sigue como estaba para no afectar los
 registros reales ya cargados.
============================================================================
*/
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE TABLE personal.tipos_bombero (
    id               UNIQUEIDENTIFIER  NOT NULL CONSTRAINT DF_tipobmb_id DEFAULT NEWSEQUENTIALID(),
    nombre           NVARCHAR(150)     NOT NULL,
    prefijo          NVARCHAR(10)      NOT NULL,
    descripcion      NVARCHAR(MAX)     NULL,
    orden            INT               NOT NULL CONSTRAINT DF_tipobmb_orden DEFAULT 0,
    estado           NVARCHAR(20)      NOT NULL CONSTRAINT DF_tipobmb_estado DEFAULT N'ACTIVO',
    creado_en        DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_tipobmb_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en   DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_tipobmb_act DEFAULT SYSDATETIMEOFFSET(),
    eliminado_en     DATETIMEOFFSET(3) NULL,
    creado_por       UNIQUEIDENTIFIER  NULL,
    actualizado_por  UNIQUEIDENTIFIER  NULL,
    CONSTRAINT PK_tipos_bombero PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_tipobmb_nombre UNIQUE (nombre),
    CONSTRAINT UQ_tipobmb_prefijo UNIQUE (prefijo),
    CONSTRAINT CK_tipobmb_estado CHECK (estado IN ('ACTIVO','INACTIVO'))
);
GO

ALTER TABLE personal.bomberos ADD tipo_bombero_id UNIQUEIDENTIFIER NULL;
GO
ALTER TABLE personal.bomberos ADD CONSTRAINT FK_bomberos_tipobombero
    FOREIGN KEY (tipo_bombero_id) REFERENCES personal.tipos_bombero(id) ON DELETE SET NULL;
GO

CREATE INDEX IX_bomberos_tipo_bombero ON personal.bomberos(tipo_bombero_id);
GO

-- Seed: los 6 tipos documentados por la institucion (idempotente)
INSERT INTO personal.tipos_bombero (nombre, prefijo, orden)
SELECT v.nombre, v.prefijo, v.orden FROM (VALUES
  (N'Bombero Combatiente Fundador', N'BCF', 1),
  (N'Bombero Combatiente', N'BC', 2),
  (N'Bombero Voluntario Activo', N'BVA', 3),
  (N'Bombero Voluntario Combatiente Fundador', N'BVAF', 4),
  (N'Bombero Honorario', N'BH', 5),
  (N'Brigadista', N'BJ', 6)
) AS v(nombre, prefijo, orden)
WHERE NOT EXISTS (SELECT 1 FROM personal.tipos_bombero t WHERE t.prefijo = v.prefijo);
GO

-- Permisos nuevos (idempotente) + asignacion a Administrador General
INSERT INTO seguridad.permisos (nombre, recurso, accion, categoria)
SELECT v.nombre, v.recurso, v.accion, N'Personal'
FROM (VALUES
  (N'personal:tipos_bombero_ver',      N'personal', N'tipos_bombero_ver'),
  (N'personal:tipos_bombero_crear',    N'personal', N'tipos_bombero_crear'),
  (N'personal:tipos_bombero_editar',   N'personal', N'tipos_bombero_editar'),
  (N'personal:tipos_bombero_eliminar', N'personal', N'tipos_bombero_eliminar'),
  (N'personal:eliminar_fisico',        N'personal', N'eliminar_fisico')
) AS v(nombre, recurso, accion)
WHERE NOT EXISTS (SELECT 1 FROM seguridad.permisos p WHERE p.nombre = v.nombre);
GO

INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id FROM seguridad.roles r CROSS JOIN seguridad.permisos p
WHERE r.nombre = N'Administrador General'
  AND p.nombre IN (
    N'personal:tipos_bombero_ver', N'personal:tipos_bombero_crear',
    N'personal:tipos_bombero_editar', N'personal:tipos_bombero_eliminar',
    N'personal:eliminar_fisico'
  )
  AND NOT EXISTS (
    SELECT 1 FROM seguridad.asignacion_permisos_rol a
    WHERE a.rol_id = r.id AND a.permiso_id = p.id
  );
GO
