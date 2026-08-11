import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type RolGrupoGuardia = 'TITULAR' | 'CHOFER';

@Entity({ name: 'grupos_guardia_miembros', schema: 'operaciones' })
export class GrupoGuardiaMiembro {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  grupoId: string;

  @Column({ type: 'uniqueidentifier' })
  bomberoId: string;

  @Column({ type: 'nvarchar', length: 20, default: 'TITULAR' })
  rol: RolGrupoGuardia;

  @Column({ type: 'int', default: 0 })
  orden: number;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;
}
