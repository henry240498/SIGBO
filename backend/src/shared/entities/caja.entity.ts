import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type EstadoCaja = 'ACTIVA' | 'INACTIVA';

/** Caja fisica de efectivo (seccion 4 del pedido) -- puede haber varias
 * (Caja General, Caja de Eventos, etc). `saldoActual` es el saldo
 * vigente, mantenido exclusivamente por MovimientosFinancierosService
 * al registrar/anular un movimiento (nunca se edita a mano). */
@Entity({ name: 'cajas', schema: 'finanzas' })
export class Caja {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 150 })
  nombre: string;

  @Column({ type: 'uniqueidentifier', nullable: true })
  responsableId: string | null;

  @Column({ type: 'nvarchar', length: 20, default: 'ACTIVA' })
  estado: EstadoCaja;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  saldoActual: number;

  @Column({ type: 'nvarchar', length: 3, default: 'PYG' })
  moneda: string;

  @Column({ type: 'uniqueidentifier', nullable: true })
  institucionId: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  observacion: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  actualizadoPor: string | null;
}
