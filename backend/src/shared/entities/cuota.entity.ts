import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type EstadoCuota = 'PENDIENTE' | 'PAGADA' | 'PARCIAL' | 'ANULADA' | 'EXONERADA';

/** Cuota institucional de un bombero para un periodo (seccion 7 del
 * pedido). No todos los bomberos necesariamente pagan cuota -- la
 * existencia de esta fila es siempre explicita, nunca implicita. */
@Entity({ name: 'cuotas', schema: 'finanzas' })
export class Cuota {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  bomberoId: string;

  /** Formato 'YYYY-MM'. */
  @Column({ type: 'char', length: 7 })
  periodo: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  importe: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  importePagado: number;

  @Column({ type: 'nvarchar', length: 20, default: 'PENDIENTE' })
  estado: EstadoCuota;

  @Column({ type: 'date', nullable: true })
  fechaVencimiento: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  movimientoId: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  observacion: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  institucionId: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;
}
