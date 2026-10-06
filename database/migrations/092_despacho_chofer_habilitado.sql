/* Separa en la auditoría a quien no puede recibir un pedido de chofer para esos móviles. */
IF EXISTS (
    SELECT 1 FROM sys.check_constraints
    WHERE name = N'CK_dest_entrega'
      AND parent_object_id = OBJECT_ID(N'servicios.solicitud_destinatarios')
)
    ALTER TABLE servicios.solicitud_destinatarios DROP CONSTRAINT CK_dest_entrega;
GO

ALTER TABLE servicios.solicitud_destinatarios
    ADD CONSTRAINT CK_dest_entrega CHECK (
        entrega IN ('ENVIADA', 'SIN_CONEXION', 'NO_DISPONIBLE', 'FUERA_DE_HORARIO', 'EN_SERVICIO', 'NO_HABILITADO_CHOFER')
    );
GO
