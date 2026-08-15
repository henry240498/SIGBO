import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type EstadoLoteArticulo = 'VIGENTE' | 'VENCIDO' | 'AGOTADO';

/** Lote/vencimiento de un articulo (seccion 17 del pedido): insumos
 * medicos, medicamentos, materiales, productos quimicos. */
@Entity({ name: 'lotes_articulo', schema: 'deposito' })
export class LoteArticulo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  articuloId: string;

  @Column({ type: 'nvarchar', length: 50 })
  numeroLote: string;

  @Column({ type: 'date', nullable: true })
  fechaFabricacion: string | null;

  @Column({ type: 'date', nullable: true })
  fechaVencimiento: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  cantidad: number;

  @Column({ type: 'nvarchar', length: 20, default: 'VIGENTE' })
  estado: EstadoLoteArticulo;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;
}
