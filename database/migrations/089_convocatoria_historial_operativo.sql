/* =============================================================
   SIGBO-CBVC | Migracion 088 - Historial operativo de convocatorias
   =============================================================
   Conserva las filas actuales como estado resumido y agrega un registro
   append-only para respuestas y transiciones. No genera recepciones ficticias:
   solo persiste acciones confirmadas por el usuario.
*/
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF COL_LENGTH('servicios.convocatoria_respuestas', 'motivo') IS NULL
    ALTER TABLE servicios.convocatoria_respuestas ADD motivo NVARCHAR(500) NULL;
GO

IF COL_LENGTH('servicios.convocatoria_respuestas', 'en_camino_en') IS NULL
    ALTER TABLE servicios.convocatoria_respuestas ADD en_camino_en DATETIMEOFFSET(3) NULL;
GO

IF COL_LENGTH('servicios.convocatoria_respuestas', 'cancelada_en') IS NULL
    ALTER TABLE servicios.convocatoria_respuestas ADD cancelada_en DATETIMEOFFSET(3) NULL;
GO

IF OBJECT_ID('servicios.convocatoria_respuesta_eventos', 'U') IS NULL
BEGIN
    CREATE TABLE servicios.convocatoria_respuesta_eventos (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_conv_evt_id DEFAULT NEWSEQUENTIALID()
            CONSTRAINT PK_convocatoria_respuesta_eventos PRIMARY KEY,
        convocatoria_id UNIQUEIDENTIFIER NOT NULL,
        usuario_id UNIQUEIDENTIFIER NOT NULL,
        usuario_nombre NVARCHAR(200) NOT NULL,
        accion NVARCHAR(30) NOT NULL,
        respuesta NVARCHAR(10) NULL,
        motivo NVARCHAR(500) NULL,
        ocurrido_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_conv_evt_ocurrido DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT CK_conv_evt_accion CHECK (accion IN (
            'ACEPTAR', 'RECHAZAR', 'CAMBIAR_RESPUESTA', 'EN_CAMINO', 'CANCELAR_ASISTENCIA', 'LLEGAR'
        )),
        CONSTRAINT FK_conv_evt_conv FOREIGN KEY (convocatoria_id)
            REFERENCES servicios.convocatorias(id),
        CONSTRAINT FK_conv_evt_usuario FOREIGN KEY (usuario_id)
            REFERENCES seguridad.usuarios(id)
    );
    CREATE INDEX IX_conv_evt_conv_ocurrido
        ON servicios.convocatoria_respuesta_eventos (convocatoria_id, ocurrido_en ASC);
END
GO
