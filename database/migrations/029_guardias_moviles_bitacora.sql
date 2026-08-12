-- Fase D del motor de planificacion de Guardias: condicion de moviles
-- dentro de una guardia (seccion 12/31/36-40 del pedido). Un renglon por
-- item de checklist verificado para un vehiculo, en una guardia -- mismo
-- diseño plano que operaciones.inspecciones_estacion (un renglon por
-- sector/estado), consumiendo el catalogo ya existente
-- vehiculos.checklist_items sin duplicarlo.
CREATE TABLE operaciones.inspecciones_movil (
    id                 UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_inspmovil_id DEFAULT NEWSEQUENTIALID(),
    guardia_id         UNIQUEIDENTIFIER NOT NULL,
    vehiculo_id        UNIQUEIDENTIFIER NOT NULL,
    checklist_item_id  UNIQUEIDENTIFIER NOT NULL,
    estado             NVARCHAR(10) NOT NULL CONSTRAINT DF_inspmovil_estado DEFAULT 'OK',
    observacion        NVARCHAR(MAX) NULL,
    responsable_id     UNIQUEIDENTIFIER NULL,
    creado_en          DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_inspmovil_creado DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_inspecciones_movil PRIMARY KEY CLUSTERED (id),
    CONSTRAINT FK_inspmovil_guardia FOREIGN KEY (guardia_id) REFERENCES operaciones.guardias(id),
    CONSTRAINT FK_inspmovil_vehiculo FOREIGN KEY (vehiculo_id) REFERENCES vehiculos.vehiculos(id),
    CONSTRAINT FK_inspmovil_item FOREIGN KEY (checklist_item_id) REFERENCES vehiculos.checklist_items(id),
    CONSTRAINT CK_inspmovil_estado CHECK (estado IN ('OK','NO_OK'))
);
CREATE INDEX IX_inspecciones_movil_guardia ON operaciones.inspecciones_movil(guardia_id);
GO
