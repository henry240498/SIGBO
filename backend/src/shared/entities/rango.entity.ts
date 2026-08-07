import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'rangos', schema: 'organizacion' })
export class Rango {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 20 })
  codigo: string;

  @Column({ type: 'nvarchar', length: 100 })
  nombre: string;

  @Column({ type: 'int', default: 0 })
  nivelJerarquico: number;

  @Column({ type: 'nvarchar', nullable: true })
  descripcion: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  insigniaUrl: string | null;

  @Column({ type: 'nvarchar', length: 7, default: '#6B7280' })
  color: string;

  @Column({ type: 'int', default: 0 })
  ordenJerarquico: number;

  @Column({ type: 'nvarchar', length: 20, default: 'ACTIVO' })
  estado: 'ACTIVO' | 'INACTIVO';

  @Column({ type: 'nvarchar', nullable: true })
  observaciones: string | null;

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
