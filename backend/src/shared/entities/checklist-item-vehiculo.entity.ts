import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type CategoriaChecklistItemVehiculo = 'MECANICA' | 'EQUIPAMIENTO' | 'OTRO';

/** Catalogo parametrizable de items de inspeccion de vehiculo (seccion 12
 * del pedido de Guardias). `tipoVehiculo` NULL significa que el item
 * aplica a todos los tipos. Consumido por el checklist de Condicion de
 * Moviles dentro de una guardia (Fase 4). */
@Entity({ name: 'checklist_items', schema: 'vehiculos' })
export class ChecklistItemVehiculo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  tipoVehiculo: string | null;

  @Column({ type: 'nvarchar', length: 150 })
  nombre: string;

  @Column({ type: 'nvarchar', length: 20, default: 'MECANICA' })
  categoria: CategoriaChecklistItemVehiculo;

  @Column({ type: 'int', default: 0 })
  orden: number;

  @Column({ type: 'bit', default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;
}
