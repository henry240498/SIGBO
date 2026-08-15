/* =============================================================
   SIGBO-CBVC | Migracion 045 - Deposito: inventario fisico e incidencias
   ============================================================= */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'deposito.inventarios_fisicos', N'U') IS NULL
BEGIN
    CREATE TABLE deposito.inventarios_fisicos (
        id              UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_invf_id DEFAULT NEWSEQUENTIALID(),
        fecha           DATE          NOT NULL,
        ubicacion_id    UNIQUEIDENTIFIER NULL,
        responsable_id  UNIQUEIDENTIFIER NULL,
        estado          NVARCHAR(20)  NOT NULL CONSTRAINT DF_invf_estado DEFAULT N'EN_PROCESO',
        observacion     NVARCHAR(MAX) NULL,
        institucion_id  UNIQUEIDENTIFIER NULL,
        creado_en       DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_invf_creado DEFAULT SYSDATETIMEOFFSET(),
        creado_por      UNIQUEIDENTIFIER NULL,
        CONSTRAINT PK_inventarios_fisicos PRIMARY KEY CLUSTERED (id),
        CONSTRAINT FK_invf_ubicacion FOREIGN KEY (ubicacion_id) REFERENCES deposito.ubicaciones(id),
        CONSTRAINT FK_invf_responsable FOREIGN KEY (responsable_id) REFERENCES personal.bomberos(id),
        CONSTRAINT CK_invf_estado CHECK (estado IN (N'EN_PROCESO', N'FINALIZADO'))
    );
END
GO

IF OBJECT_ID(N'deposito.inventario_fisico_items', N'U') IS NULL
BEGIN
    CREATE TABLE deposito.inventario_fisico_items (
        id                  UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_invfi_id DEFAULT NEWSEQUENTIALID(),
        inventario_fisico_id UNIQUEIDENTIFIER NOT NULL,
        tipo_elemento       NVARCHAR(10)  NOT NULL,
        articulo_id         UNIQUEIDENTIFIER NULL,
        equipo_id           UNIQUEIDENTIFIER NULL,
        cantidad_sistema    DECIMAL(15,2) NOT NULL,
        cantidad_fisica     DECIMAL(15,2) NOT NULL,
        diferencia          DECIMAL(15,2) NOT NULL,
        genera_incidencia   BIT           NOT NULL CONSTRAINT DF_invfi_incid DEFAULT 0,
        observacion         NVARCHAR(MAX) NULL,
        creado_en           DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_invfi_creado DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT PK_inventario_fisico_items PRIMARY KEY CLUSTERED (id),
        CONSTRAINT FK_invfi_inventario FOREIGN KEY (inventario_fisico_id) REFERENCES deposito.inventarios_fisicos(id) ON DELETE CASCADE,
        CONSTRAINT FK_invfi_articulo FOREIGN KEY (articulo_id) REFERENCES deposito.articulos(id),
        CONSTRAINT FK_invfi_equipo FOREIGN KEY (equipo_id) REFERENCES equipos.equipos(id),
        CONSTRAINT CK_invfi_tipoelemento CHECK (tipo_elemento IN (N'EQUIPO', N'ARTICULO'))
    );
END
GO

IF OBJECT_ID(N'deposito.incidencias', N'U') IS NULL
BEGIN
    CREATE TABLE deposito.incidencias (
        id                      UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_inc_id DEFAULT NEWSEQUENTIALID(),
        origen_tipo             NVARCHAR(30)  NOT NULL,
        tipo_elemento           NVARCHAR(10)  NULL,
        articulo_id             UNIQUEIDENTIFIER NULL,
        equipo_id               UNIQUEIDENTIFIER NULL,
        vehiculo_id             UNIQUEIDENTIFIER NULL,
        inspeccion_movil_id     UNIQUEIDENTIFIER NULL,
        inventario_fisico_item_id UNIQUEIDENTIFIER NULL,
        descripcion             NVARCHAR(MAX) NOT NULL,
        gravedad                NVARCHAR(10)  NOT NULL CONSTRAINT DF_inc_gravedad DEFAULT N'MEDIA',
        estado                  NVARCHAR(20)  NOT NULL CONSTRAINT DF_inc_estado DEFAULT N'ABIERTA',
        fecha_apertura          DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_inc_fapertura DEFAULT SYSDATETIMEOFFSET(),
        reportado_por           UNIQUEIDENTIFIER NULL,
        resuelto_por            UNIQUEIDENTIFIER NULL,
        fecha_resolucion        DATETIMEOFFSET(3) NULL,
        resolucion              NVARCHAR(MAX) NULL,
        institucion_id          UNIQUEIDENTIFIER NULL,
        CONSTRAINT PK_incidencias PRIMARY KEY CLUSTERED (id),
        CONSTRAINT FK_inc_articulo FOREIGN KEY (articulo_id) REFERENCES deposito.articulos(id),
        CONSTRAINT FK_inc_equipo FOREIGN KEY (equipo_id) REFERENCES equipos.equipos(id),
        CONSTRAINT FK_inc_vehiculo FOREIGN KEY (vehiculo_id) REFERENCES vehiculos.vehiculos(id),
        CONSTRAINT FK_inc_inspeccion FOREIGN KEY (inspeccion_movil_id) REFERENCES operaciones.inspecciones_movil(id),
        CONSTRAINT FK_inc_invfitem FOREIGN KEY (inventario_fisico_item_id) REFERENCES deposito.inventario_fisico_items(id),
        CONSTRAINT CK_inc_origentipo CHECK (origen_tipo IN (N'INSPECCION_VEHICULO', N'INVENTARIO_FISICO', N'MANUAL', N'OTRO')),
        CONSTRAINT CK_inc_gravedad CHECK (gravedad IN (N'BAJA', N'MEDIA', N'ALTA')),
        CONSTRAINT CK_inc_estado CHECK (estado IN (N'ABIERTA', N'EN_REVISION', N'RESUELTA', N'DESCARTADA'))
    );
END
GO
