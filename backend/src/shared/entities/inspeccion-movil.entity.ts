import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type EstadoInspeccionMovil = 'OK' | 'NO_OK';

/** Condicion de moviles dentro de una guardia (secciones 12/31/36-40 del
 * pedido): un renglon por item del catalogo `vehiculos.checklist_items`
 * verificado para un vehiculo especifico, en una guardia especifica. Mismo
 * diseno plano que `InspeccionEstacion`. */
@Entity({ name: 'inspecciones_movil', schema: 'operaciones' })
export class InspeccionMovil {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  guardiaId: string;

  @Column({ type: 'uniqueidentifier' })
  vehiculoId: string;

  @Column({ type: 'uniqueidentifier' })
  checklistItemId: string;

  @Column({ type: 'nvarchar', length: 10, default: 'OK' })
  estado: EstadoInspeccionMovil;

  @Column({ type: 'nvarchar', nullable: true })
  observacion: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  responsableId: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;
}
