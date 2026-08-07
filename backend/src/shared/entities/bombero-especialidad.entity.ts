import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'bombero_especialidades', schema: 'personal' })
export class BomberoEspecialidad {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  bomberoId: string;

  @Column({ type: 'uniqueidentifier' })
  especialidadId: string;

  @Column({ type: 'date', nullable: true })
  fechaObtencion: string | null;

  @Column({ type: 'nvarchar', length: 20, default: 'ACTIVA' })
  estado: string;

  @Column({ type: 'nvarchar', length: 30, nullable: true })
  nivel: string | null;

  @Column({ type: 'nvarchar', length: 200, nullable: true })
  institucionCertificadora: string | null;

  @Column({ type: 'date', nullable: true })
  vigencia: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;
}
