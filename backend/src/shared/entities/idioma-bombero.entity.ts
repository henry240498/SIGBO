import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'idiomas_bombero', schema: 'personal' })
export class IdiomaBombero {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  bomberoId: string;

  /** Referencia a organizacion.parametros (tipo IDIOMA). */
  @Column({ type: 'uniqueidentifier' })
  idiomaId: string;

  /** Referencia a organizacion.parametros (tipo NIVEL_IDIOMA). */
  @Column({ type: 'uniqueidentifier', nullable: true })
  nivelIdiomaId: string | null;

  @Column({ type: 'nvarchar', length: 150, nullable: true })
  certificacion: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;
}
