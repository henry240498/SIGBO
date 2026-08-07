import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/** Catalogo de tipos de guardia (24hs, 12hs, Nocturna...). No confundir con
 * operaciones.guardias, que son las guardias programadas reales. */
@Entity({ name: 'tipos_guardia', schema: 'organizacion' })
export class TipoGuardia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 20 })
  codigo: string;

  @Column({ type: 'nvarchar', length: 100 })
  nombre: string;

  @Column({ type: 'int', nullable: true })
  duracionHoras: number | null;

  @Column({ type: 'nvarchar', nullable: true })
  descripcion: string | null;

  @Column({ type: 'nvarchar', length: 20, default: 'ACTIVO' })
  estado: 'ACTIVO' | 'INACTIVO';

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  eliminadoEn: Date | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  actualizadoPor: string | null;
}
