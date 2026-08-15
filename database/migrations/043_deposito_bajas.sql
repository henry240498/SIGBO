/* =============================================================
   SIGBO-CBVC | Migracion 043 - Deposito: bajas
   ============================================================= */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_param_tipo')
    ALTER TABLE organizacion.parametros DROP CONSTRAINT CK_param_tipo;
GO
IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_param_tipo')
    ALTER TABLE organizacion.parametros ADD CONSTRAINT CK_param_tipo CHECK (tipo IN (
        N'PAIS', N'DEPARTAMENTO', N'CIUDAD', N'BARRIO', N'PROFESION', N'IDIOMA', N'NIVEL_IDIOMA',
        N'GRUPO_SANGUINEO', N'FACTOR_RH', N'TIPO_SEGURO', N'ASEGURADORA', N'TIPO_EVENTO_ASISTENCIA',
        N'UBICACION_EQUIPO', N'ESTADO_PRESENCIA_GUARDIA', N'SECTOR_ESTACION',
        N'TIPO_ACTIVIDAD_ACADEMICA', N'MODALIDAD_ACADEMICA', N'TIPO_EVALUACION_ACADEMICA', N'RESULTADO_ACADEMICO',
        N'TIPO_UBICACION_DEPOSITO', N'TIPO_TENENCIA_DEPOSITO', N'ESTADO_ELEMENTO_DEPOSITO',
        N'TIPO_MOVIMIENTO_DEPOSITO', N'UNIDAD_MEDIDA_DEPOSITO', N'MOTIVO_BAJA_DEPOSITO'
    ));
GO

INSERT INTO organizacion.parametros (tipo, nombre, nombre_normalizado, orden)
SELECT v.tipo, v.nombre, v.nombre_normalizado, v.orden FROM (VALUES
    (N'MOTIVO_BAJA_DEPOSITO', N'Dano irreparable', N'dano irreparable', 1),
    (N'MOTIVO_BAJA_DEPOSITO', N'Perdida',          N'perdida',          2),
    (N'MOTIVO_BAJA_DEPOSITO', N'Obsolescencia',    N'obsolescencia',    3),
    (N'MOTIVO_BAJA_DEPOSITO', N'Vencimiento',      N'vencimiento',      4),
    (N'MOTIVO_BAJA_DEPOSITO', N'Transferencia',    N'transferencia',    5),
    (N'MOTIVO_BAJA_DEPOSITO', N'Donacion',         N'donacion',         6),
    (N'MOTIVO_BAJA_DEPOSITO', N'Otro',             N'otro',             7)
) AS v(tipo, nombre, nombre_normalizado, orden)
WHERE NOT EXISTS (SELECT 1 FROM organizacion.parametros p WHERE p.tipo = v.tipo AND p.nombre_normalizado = v.nombre_normalizado AND p.padre_id IS NULL);
GO

IF OBJECT_ID(N'deposito.bajas', N'U') IS NULL
BEGIN
    CREATE TABLE deposito.bajas (
        id              UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_baja_id DEFAULT NEWSEQUENTIALID(),
        tipo_elemento   NVARCHAR(10)  NOT NULL,
        articulo_id     UNIQUEIDENTIFIER NULL,
        equipo_id       UNIQUEIDENTIFIER NULL,
        cantidad        DECIMAL(15,2) NULL,
        motivo_baja_id  UNIQUEIDENTIFIER NOT NULL,
        fecha           DATE          NOT NULL,
        responsable_id  UNIQUEIDENTIFIER NULL,
        autorizado_por  UNIQUEIDENTIFIER NULL,
        documento_url   NVARCHAR(MAX) NULL,
        observacion     NVARCHAR(MAX) NULL,
        movimiento_id   UNIQUEIDENTIFIER NULL,
        institucion_id  UNIQUEIDENTIFIER NULL,
        creado_en       DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_baja_creado DEFAULT SYSDATETIMEOFFSET(),
        creado_por      UNIQUEIDENTIFIER NULL,
        CONSTRAINT PK_bajas PRIMARY KEY CLUSTERED (id),
        CONSTRAINT FK_baja_articulo FOREIGN KEY (articulo_id) REFERENCES deposito.articulos(id),
        CONSTRAINT FK_baja_equipo FOREIGN KEY (equipo_id) REFERENCES equipos.equipos(id),
        CONSTRAINT FK_baja_motivo FOREIGN KEY (motivo_baja_id) REFERENCES organizacion.parametros(id),
        CONSTRAINT FK_baja_responsable FOREIGN KEY (responsable_id) REFERENCES personal.bomberos(id),
        CONSTRAINT FK_baja_autoriza FOREIGN KEY (autorizado_por) REFERENCES personal.bomberos(id),
        CONSTRAINT FK_baja_movimiento FOREIGN KEY (movimiento_id) REFERENCES deposito.movimientos(id),
        CONSTRAINT CK_baja_tipoelemento CHECK (tipo_elemento IN (N'EQUIPO', N'ARTICULO'))
    );
END
GO
