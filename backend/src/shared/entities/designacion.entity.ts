import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'designaciones', schema: 'organizacion' })
export class Designacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 30, nullable: true })
  codigo: string | null;

  @Column({ type: 'uniqueidentifier' })
  bomberoId: string;

  @Column({ type: 'uniqueidentifier' })
  cargoId: string;

  @Column({ type: 'uniqueidentifier', nullable: true })
  companiaId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  cuartelId: string | null;

  @Column({ type: 'date' })
  fechaDesde: string;

  @Column({ type: 'date', nullable: true })
  fechaHasta: string | null;

  @Column({ type: 'nvarchar', length: 20, default: 'ACTIVA' })
  estado: 'ACTIVA' | 'FINALIZADA' | 'ANULADA';

  @Column({ type: 'nvarchar', nullable: true })
  motivo: string | null;

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
