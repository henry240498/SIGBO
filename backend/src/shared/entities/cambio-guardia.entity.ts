import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type EstadoCambioGuardia = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'CANCELADO';

/** Solicitud de cambio/reemplazo de una asignacion de guardia (tabla ya
 * existente en el esquema operaciones). El flujo de aprobacion queda fuera
 * de esta fase del Modulo Asistencia; la entidad se registra para que la
 * tabla sea consultable/consistente con el resto del modulo. */
@Entity({ name: 'cambios_guardias', schema: 'operaciones' })
export class CambioGuardia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  asignacionOriginalId: string;

  @Column({ type: 'uniqueidentifier' })
  bomberoNuevoId: string;

  @Column({ type: 'uniqueidentifier' })
  solicitanteId: string;

  @Column({ type: 'datetimeoffset', precision: 3 })
  fechaSolicitud: Date;

  @Column({ type: 'date', nullable: true })
  fechaCambio: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  motivo: string | null;

  @Column({ type: 'nvarchar', length: 20, default: 'PENDIENTE' })
  estado: EstadoCambioGuardia;

  @Column({ type: 'uniqueidentifier', nullable: true })
  aprobadoPor: string | null;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  fechaAprobacion: Date | null;

  @Column({ type: 'nvarchar', nullable: true })
  observaciones: string | null;
}
