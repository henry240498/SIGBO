/* SIGBO — 097: estados del bombero. Los reales son ACTIVO, SUSPENDIDO, LICENCIA, BAJA y
   FALLECIDO (decisión del cuartel, 2026-10-09). RETIRADO pasa a BAJA.
   ASPIRANTE y HONORARIO no se convierten solos: si hay fichas en esos estados el script
   se detiene y pide decidir cada caso. La condición institucional HONORARIO es otra
   columna (condicion_institucional) y no se toca. El historial institucional no se
   reescribe: una baja sigue registrando el tipo de movimiento RETIRO. Reejecutable. */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET XACT_ABORT ON;
GO
IF EXISTS (SELECT 1 FROM personal.bomberos WHERE estado IN (N'ASPIRANTE', N'HONORARIO'))
    THROW 51097, N'097: hay bomberos en estado ASPIRANTE u HONORARIO. Decidir el estado de cada uno (ACTIVO, SUSPENDIDO, LICENCIA, BAJA o FALLECIDO) antes de aplicar esta migración.', 1;
GO
IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_bomberos_estado' AND parent_object_id = OBJECT_ID(N'personal.bomberos'))
    ALTER TABLE personal.bomberos DROP CONSTRAINT CK_bomberos_estado;
GO
UPDATE personal.bomberos SET estado = N'BAJA' WHERE estado = N'RETIRADO';
GO
ALTER TABLE personal.bomberos
    ADD CONSTRAINT CK_bomberos_estado CHECK (estado IN (N'ACTIVO', N'SUSPENDIDO', N'LICENCIA', N'BAJA', N'FALLECIDO'));
GO
