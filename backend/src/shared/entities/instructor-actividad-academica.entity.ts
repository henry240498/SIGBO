import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type RolInstructorActividad = 'PRINCIPAL' | 'AYUDANTE';

/** Instructor de una actividad academica -- bombero (referenciado desde
 * Personal) O instructor externo (nunca ambos, nunca ninguno). */
@Entity({ name: 'instructores_actividad', schema: 'academia' })
export class InstructorActividadAcademica {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  actividadId: string;

  @Column({ type: 'uniqueidentifier', nullable: true })
  bomberoId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  instructorExternoId: string | null;

  @Column({ type: 'nvarchar', length: 20, default: 'PRINCIPAL' })
  rolInstructor: RolInstructorActividad;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;
}
