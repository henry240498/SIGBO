import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'idiomas_bombero', schema: 'personal' })
export class IdiomaBombero {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  bomberoId: string;

  @Column({ type: 'nvarchar', length: 50 })
  idioma: string;

  @Column({ type: 'nvarchar', length: 30, nullable: true })
  nivel: string | null;

  @Column({ type: 'nvarchar', length: 150, nullable: true })
  certificacion: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;
}
