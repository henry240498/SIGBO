import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'actividad_profesional', schema: 'personal' })
export class ActividadProfesional {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  bomberoId: string;

  @Column({ type: 'nvarchar', length: 150, nullable: true })
  profesion: string | null;

  @Column({ type: 'nvarchar', length: 150, nullable: true })
  empresa: string | null;

  @Column({ type: 'nvarchar', length: 150, nullable: true })
  cargoLaboral: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  experiencia: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  actividadesRelacionadas: string | null;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;
}
