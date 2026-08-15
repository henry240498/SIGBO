/* =============================================================
   SIGBO-CBVC | Migracion 046 - Deposito: mantenimientos + confiscacion
   =============================================================
   Etapa 6. Agrega:
   1) 'Confiscacion' a TIPO_MOVIMIENTO_DEPOSITO -- caso de negocio real:
      un equipo confiscado a un bombero pasa a deposito.tenencias
      (En deposito / Disponible) sin dejar de registrar quien lo tenia
      antes (bombero_origen_id en deposito.movimientos) ni el motivo.
      Antes de esto solo existia 'Otro' como catch-all generico.
   2) deposito.mantenimientos: seguimiento estructurado de un
      elemento en mantenimiento (taller/responsable, fecha estimada
      de salida, fecha real, costo) -- section 14 del pedido, que solo
      estaba cubierto por el estado generico ESTADO_ELEMENTO_DEPOSITO
      = 'En mantenimiento' sin estos campos.
   ============================================================= */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

INSERT INTO organizacion.parametros (tipo, nombre, nombre_normalizado, orden)
SELECT v.tipo, v.nombre, v.nombre_normalizado, v.orden FROM (VALUES
    (N'TIPO_MOVIMIENTO_DEPOSITO', N'Confiscacion', N'confiscacion', 15)
) AS v(tipo, nombre, nombre_normalizado, orden)
WHERE NOT EXISTS (SELECT 1 FROM organizacion.parametros p WHERE p.tipo = v.tipo AND p.nombre_normalizado = v.nombre_normalizado AND p.padre_id IS NULL);
GO

IF OBJECT_ID(N'deposito.mantenimientos', N'U') IS NULL
BEGIN
    CREATE TABLE deposito.mantenimientos (
        id                     UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_mant_id DEFAULT NEWSEQUENTIALID(),
        tipo_elemento          NVARCHAR(10)  NOT NULL,
        articulo_id            UNIQUEIDENTIFIER NULL,
        equipo_id              UNIQUEIDENTIFIER NULL,
        cantidad               DECIMAL(15,2) NULL,
        motivo                 NVARCHAR(300) NOT NULL,
        responsable_id         UNIQUEIDENTIFIER NULL,
        taller_externo         NVARCHAR(200) NULL,
        fecha_ingreso          DATE          NOT NULL,
        fecha_estimada_salida  DATE          NULL,
        fecha_salida_real      DATE          NULL,
        costo                  DECIMAL(15,2) NULL,
        estado                 NVARCHAR(20)  NOT NULL CONSTRAINT DF_mant_estado DEFAULT N'EN_PROCESO',
        observacion            NVARCHAR(MAX) NULL,
        ubicacion_origen_id    UNIQUEIDENTIFIER NULL,
        movimiento_ingreso_id  UNIQUEIDENTIFIER NULL,
        movimiento_salida_id   UNIQUEIDENTIFIER NULL,
        institucion_id         UNIQUEIDENTIFIER NULL,
        creado_en              DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_mant_creado DEFAULT SYSDATETIMEOFFSET(),
        creado_por             UNIQUEIDENTIFIER NULL,
        CONSTRAINT PK_mantenimientos PRIMARY KEY CLUSTERED (id),
        CONSTRAINT FK_mant_articulo FOREIGN KEY (articulo_id) REFERENCES deposito.articulos(id),
        CONSTRAINT FK_mant_equipo FOREIGN KEY (equipo_id) REFERENCES equipos.equipos(id),
        CONSTRAINT FK_mant_responsable FOREIGN KEY (responsable_id) REFERENCES personal.bomberos(id),
        CONSTRAINT FK_mant_ubicacionorigen FOREIGN KEY (ubicacion_origen_id) REFERENCES deposito.ubicaciones(id),
        CONSTRAINT FK_mant_movingreso FOREIGN KEY (movimiento_ingreso_id) REFERENCES deposito.movimientos(id),
        CONSTRAINT FK_mant_movsalida FOREIGN KEY (movimiento_salida_id) REFERENCES deposito.movimientos(id),
        CONSTRAINT FK_mant_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id),
        CONSTRAINT CK_mant_tipoelemento CHECK (tipo_elemento IN (N'EQUIPO', N'ARTICULO')),
        CONSTRAINT CK_mant_estado CHECK (estado IN (N'EN_PROCESO', N'FINALIZADO'))
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_mant_equipo' AND object_id = OBJECT_ID('deposito.mantenimientos'))
    CREATE INDEX IX_mant_equipo ON deposito.mantenimientos(equipo_id);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_mant_estado' AND object_id = OBJECT_ID('deposito.mantenimientos'))
    CREATE INDEX IX_mant_estado ON deposito.mantenimientos(estado);
GO

INSERT INTO seguridad.permisos (nombre, recurso, accion, categoria)
SELECT v.nombre, v.recurso, v.accion, v.categoria FROM (VALUES
    (N'deposito:mantenimiento', N'deposito', N'mantenimiento', N'Deposito')
) AS v(nombre, recurso, accion, categoria)
WHERE NOT EXISTS (SELECT 1 FROM seguridad.permisos p WHERE p.nombre = v.nombre);
GO

INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id
FROM seguridad.roles r
CROSS JOIN seguridad.permisos p
WHERE r.nombre = N'Encargado de Deposito'
  AND p.nombre = N'deposito:mantenimiento'
  AND NOT EXISTS (
      SELECT 1 FROM seguridad.asignacion_permisos_rol apr
      WHERE apr.rol_id = r.id AND apr.permiso_id = p.id
  );
GO
