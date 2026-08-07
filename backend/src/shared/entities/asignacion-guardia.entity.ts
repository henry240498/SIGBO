import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type EstadoAsignacionGuardia = 'ASIGNADO' | 'CONFIRMADO' | 'REEMPLAZADO' | 'AUSENTE';

/** Bomberos asignados a cada guardia programada (schema operaciones). */
@Entity({ name: 'asignacion_guardias', schema: 'operaciones' })
export class AsignacionGuardia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  guardiaId: string;

  @Column({ type: 'uniqueidentifier' })
  bomberoId: string;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  rol: string | null;

  @Column({ type: 'nvarchar', length: 20, default: 'ASIGNADO' })
  estado: EstadoAsignacionGuardia;

  @Column({ type: 'datetimeoffset', precision: 3 })
  fechaAsignacion: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  asignadoPor: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  observaciones: string | null;
}
