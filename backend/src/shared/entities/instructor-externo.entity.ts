import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/** Instructor que no pertenece a la institucion (distinto de un bombero
 * instructor, que se referencia directamente desde personal.bomberos). */
@Entity({ name: 'instructores_externos', schema: 'academia' })
export class InstructorExterno {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 100 })
  nombre: string;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  apellido: string | null;

  @Column({ type: 'nvarchar', length: 20, nullable: true })
  documento: string | null;

  @Column({ type: 'nvarchar', length: 150, nullable: true })
  institucion: string | null;

  @Column({ type: 'nvarchar', length: 150, nullable: true })
  especialidad: string | null;

  @Column({ type: 'nvarchar', length: 20, nullable: true })
  telefono: string | null;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  email: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  observaciones: string | null;

  @Column({ type: 'bit', default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;
}
