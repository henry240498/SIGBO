import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'condicion_honorario', schema: 'personal' })
export class CondicionHonorario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  bomberoId: string;

  @Column({ type: 'date', nullable: true })
  fechaNombramiento: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  motivo: string | null;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  resolucion: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  documentoUrl: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  observaciones: string | null;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;
}
