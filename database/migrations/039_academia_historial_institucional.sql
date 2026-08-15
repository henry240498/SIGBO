-- Agrega 'FORMACION_ACADEMICA' a los tipos de movimiento permitidos en
-- personal.historial_institucional, para que completar una actividad de
-- Academia deje un asiento propio (distinto de RECONOCIMIENTO, que la Foja
-- de Servicio ya usa para condecoraciones/distinciones -- mezclarlos
-- ensuciaria esa seccion).
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_histinst_tipo')
BEGIN
    ALTER TABLE personal.historial_institucional DROP CONSTRAINT CK_histinst_tipo;
END
GO

ALTER TABLE personal.historial_institucional
    ADD CONSTRAINT CK_histinst_tipo CHECK (tipo_movimiento IN
        ('INGRESO','ASCENSO','CAMBIO_RANGO','CAMBIO_CARGO','CAMBIO_COMPANIA','CAMBIO_CONDICION',
         'CAMBIO_CODIGO','LICENCIA','SUSPENSION','RECONOCIMIENTO','SANCION','RETIRO','FORMACION_ACADEMICA'));
GO
