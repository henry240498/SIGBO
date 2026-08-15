import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type EstadoInventarioFisico = 'EN_PROCESO' | 'FINALIZADO';

/** Encabezado de un inventario fisico (seccion 15 del pedido): compara
 * sistema vs conteo real sin modificar silenciosamente el stock -- las
 * diferencias generan incidencias, el ajuste real se hace aparte con un
 * movimiento de tipo "Ajuste de inventario" explicito. */
@Entity({ name: 'inventarios_fisicos', schema: 'deposito' })
export class InventarioFisicoDeposito {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'uniqueidentifier', nullable: true })
  ubicacionId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  responsableId: string | null;

  @Column({ type: 'nvarchar', length: 20, default: 'EN_PROCESO' })
  estado: EstadoInventarioFisico;

  @Column({ type: 'nvarchar', nullable: true })
  observacion: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  institucionId: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;
}
