import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type EstadoAsignacionGuardia = 'ASIGNADO' | 'CONFIRMADO' | 'REEMPLAZADO' | 'AUSENTE';
export type TipoParticipacionGuardia = 'TITULAR' | 'REFUERZO' | 'REEMPLAZO';

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

  @Column({ type: 'nvarchar', length: 20, default: 'TITULAR' })
  tipoParticipacion: TipoParticipacionGuardia;

  /** A que asignacion reemplaza (seccion 7). Solo aplica cuando
   * tipoParticipacion = 'REEMPLAZO'. */
  @Column({ type: 'uniqueidentifier', nullable: true })
  reemplazaAsignacionId: string | null;

  /** Horarios reales de entrada/salida de esta persona en esta guardia,
   * distintos del horario programado de la guardia (seccion 6: permite
   * calcular cumplimiento parcial). */
  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  horaEntrada: Date | null;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  horaSalida: Date | null;

  /** Estado de presencia del dia (organizacion.parametros, tipo
   * ESTADO_PRESENCIA_GUARDIA -- seccion 5). Distinto de `estado`, que es
   * el ciclo de vida de la asignacion (ASIGNADO/CONFIRMADO/...). */
  @Column({ type: 'nvarchar', length: 30, nullable: true })
  estadoPresencia: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  motivo: string | null;
}
