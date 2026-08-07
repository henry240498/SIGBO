import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'ascensos', schema: 'organizacion' })
export class Ascenso {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 30, nullable: true })
  codigo: string | null;

  @Column({ type: 'uniqueidentifier' })
  bomberoId: string;

  @Column({ type: 'uniqueidentifier', nullable: true })
  rangoAnteriorId: string | null;

  @Column({ type: 'uniqueidentifier' })
  rangoNuevoId: string;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  resolucion: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  motivo: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  observaciones: string | null;

  @Column({ type: 'nvarchar', length: 20, default: 'REGISTRADO' })
  estado: 'REGISTRADO' | 'ANULADO';

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
