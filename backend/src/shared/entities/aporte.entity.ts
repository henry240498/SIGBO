import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type EstadoAporte = 'REGISTRADO' | 'ANULADO';

/** Lo que un Socio Protector EFECTIVAMENTE pago -- nunca se ajusta
 * automaticamente el AcuerdoAporte a partir de esto. Cada aporte
 * impacta finanzas.movimientos_financieros como cualquier otro
 * ingreso (movimientoFinancieroId), nunca un ledger paralelo. */
@Entity({ name: 'aportes', schema: 'finanzas' })
export class Aporte {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  socioProtectorId: string;

  /** NULL para aportes extraordinarios sin acuerdo periodico. */
  @Column({ type: 'uniqueidentifier', nullable: true })
  acuerdoAporteId: string | null;

  @Column({ type: 'bit', default: false })
  esExtraordinario: boolean;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'time', precision: 0, nullable: true })
  hora: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  monto: number;

  @Column({ type: 'nvarchar', length: 3, default: 'PYG' })
  moneda: string;

  /** Formato 'YYYY-MM'; NULL cuando no corresponde a un periodo (extraordinario). */
  @Column({ type: 'char', length: 7, nullable: true })
  periodoCorrespondiente: string | null;

  @Column({ type: 'nvarchar', length: 300, nullable: true })
  concepto: string | null;

  /** Referencia a organizacion.parametros (tipo MEDIO_PAGO_FINANZAS). */
  @Column({ type: 'uniqueidentifier', nullable: true })
  medioPagoId: string | null;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  numeroComprobante: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  cajaId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  cuentaBancariaId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  facturaId: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  archivoUrl: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  movimientoFinancieroId: string | null;

  @Column({ type: 'nvarchar', length: 20, default: 'REGISTRADO' })
  estado: EstadoAporte;

  @Column({ type: 'uniqueidentifier', nullable: true })
  anuladoPor: string | null;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  fechaAnulacion: Date | null;

  @Column({ type: 'nvarchar', nullable: true })
  motivoAnulacion: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  observaciones: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  institucionId: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;
}
