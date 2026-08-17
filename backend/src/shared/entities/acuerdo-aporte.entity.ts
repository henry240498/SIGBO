import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type EstadoAcuerdoAporte = 'ACTIVO' | 'FINALIZADO' | 'SUSPENDIDO' | 'CANCELADO';

/** Lo que un Socio Protector SE COMPROMETIO a aportar -- distinto de
 * lo que efectivamente pago (finanzas.Aporte). Se separa porque las
 * condiciones cambian con el tiempo sin que eso deba reescribir el
 * historial de pagos ya realizados. */
@Entity({ name: 'acuerdos_aporte', schema: 'finanzas' })
export class AcuerdoAporte {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  socioProtectorId: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  montoAcordado: number;

  @Column({ type: 'nvarchar', length: 3, default: 'PYG' })
  moneda: string;

  /** Referencia a organizacion.parametros (tipo PERIODICIDAD_APORTE). */
  @Column({ type: 'uniqueidentifier' })
  periodicidadId: string;

  @Column({ type: 'date' })
  fechaInicio: string;

  @Column({ type: 'date', nullable: true })
  fechaFin: string | null;

  @Column({ type: 'nvarchar', length: 20, default: 'ACTIVO' })
  estado: EstadoAcuerdoAporte;

  /** Referencia a organizacion.parametros (tipo MEDIO_PAGO_FINANZAS). */
  @Column({ type: 'uniqueidentifier', nullable: true })
  medioPagoPreferidoId: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  observaciones: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  institucionId: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  actualizadoPor: string | null;
}
