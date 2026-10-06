import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/** Lo que un movil debe llevar y lo hallado en el ultimo control (migracion 081). */
@Entity({ name: 'dotacion_movil', schema: 'vehiculos' })
export class DotacionMovil {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  vehiculoId: string;

  @Column({ type: 'nvarchar', length: 200 })
  descripcion: string;

  /** Articulo del deposito al que corresponde (informativo, sin descuento automatico). */
  @Column({ type: 'uniqueidentifier', nullable: true })
  articuloId: string | null;

  @Column({ type: 'int' })
  cantidadObjetivo: number;

  @Column({ type: 'int', nullable: true })
  cantidadActual: number | null;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  controladoEn: Date | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  controladoPor: string | null;

  @Column({ type: 'bit', default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;
}
