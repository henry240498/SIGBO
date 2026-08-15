import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type TipoMovimientoBancario = 'DEPOSITO' | 'TRANSFERENCIA' | 'DEBITO' | 'CREDITO' | 'COMISION' | 'OTRO';
export type EstadoConciliacion = 'PENDIENTE' | 'CONCILIADO' | 'DIFERENCIA';

/** Movimiento de extracto bancario (seccion 12) con conciliacion
 * simple (seccion 13): comparar contra SIGBO y marcar
 * Conciliado/Pendiente/Diferencia. Nunca se ajusta un movimiento
 * automaticamente para hacerlo coincidir -- la diferencia queda
 * visible. */
@Entity({ name: 'movimientos_bancarios', schema: 'finanzas' })
export class MovimientoBancario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  cuentaBancariaId: string;

  @Column({ type: 'nvarchar', length: 20 })
  tipo: TipoMovimientoBancario;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  importe: number;

  @Column({ type: 'nvarchar', length: 300 })
  descripcion: string;

  /** Operacion financiera asociada, cuando corresponde (seccion 12: "cada
   * movimiento debe poder asociarse a una operacion financiera"). */
  @Column({ type: 'uniqueidentifier', nullable: true })
  movimientoFinancieroId: string | null;

  @Column({ type: 'nvarchar', length: 20, default: 'PENDIENTE' })
  estadoConciliacion: EstadoConciliacion;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  fechaConciliacion: Date | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  conciliadoPor: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  observacion: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;
}
