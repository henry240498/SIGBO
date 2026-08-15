import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TipoElementoDeposito } from './tenencia-deposito.entity';

@Entity({ name: 'inventario_fisico_items', schema: 'deposito' })
export class InventarioFisicoItemDeposito {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  inventarioFisicoId: string;

  @Column({ type: 'nvarchar', length: 10 })
  tipoElemento: TipoElementoDeposito;

  @Column({ type: 'uniqueidentifier', nullable: true })
  articuloId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  equipoId: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  cantidadSistema: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  cantidadFisica: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  diferencia: number;

  @Column({ type: 'bit', default: false })
  generaIncidencia: boolean;

  @Column({ type: 'nvarchar', nullable: true })
  observacion: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;
}
