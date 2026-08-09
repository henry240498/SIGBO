import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/** Una poliza de seguro de un bombero. Relacion 1:N (un voluntario puede
 * tener varios seguros vigentes o historicos a la vez). */
@Entity({ name: 'seguros_bombero', schema: 'personal' })
export class SeguroBombero {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  bomberoId: string;

  @Column({ type: 'uniqueidentifier', nullable: true })
  aseguradoraId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  tipoSeguroId: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  descripcion: string | null;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  numeroPoliza: string | null;

  @Column({ type: 'date', nullable: true })
  fechaInicio: string | null;

  @Column({ type: 'date', nullable: true })
  fechaVencimiento: string | null;

  @Column({ type: 'nvarchar', length: 20, default: 'ACTIVO' })
  estado: 'ACTIVO' | 'INACTIVO';

  @Column({ type: 'nvarchar', nullable: true })
  observaciones: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  documentacionUrl: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;
}
