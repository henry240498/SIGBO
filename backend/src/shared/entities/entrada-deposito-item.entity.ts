import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TipoElementoDeposito } from './tenencia-deposito.entity';

/** Linea de una entrada -- un articulo (con cantidad) o un equipo
 * individual. `movimientoId` referencia el deposito.movimientos que esta
 * linea genero automaticamente al confirmarse la entrada. */
@Entity({ name: 'entrada_items', schema: 'deposito' })
export class EntradaDepositoItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  entradaId: string;

  @Column({ type: 'nvarchar', length: 10 })
  tipoElemento: TipoElementoDeposito;

  @Column({ type: 'uniqueidentifier', nullable: true })
  articuloId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  equipoId: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  cantidad: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  precioUnitario: number | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  subtotal: number | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  movimientoId: string | null;
}
