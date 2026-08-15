import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TipoElementoDeposito } from './tenencia-deposito.entity';

export type EstadoPrestamoItemDeposito = 'PENDIENTE' | 'DEVUELTO' | 'EXTRAVIADO' | 'DANIADO';

@Entity({ name: 'prestamo_items', schema: 'deposito' })
export class PrestamoDepositoItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  prestamoId: string;

  @Column({ type: 'nvarchar', length: 10 })
  tipoElemento: TipoElementoDeposito;

  @Column({ type: 'uniqueidentifier', nullable: true })
  articuloId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  equipoId: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  cantidad: number | null;

  @Column({ type: 'nvarchar', length: 20, default: 'PENDIENTE' })
  estadoItem: EstadoPrestamoItemDeposito;

  @Column({ type: 'nvarchar', nullable: true })
  observacion: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  movimientoEntregaId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  movimientoDevolucionId: string | null;
}
