import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type EstadoCurso = 'PLANIFICADO' | 'EN_CURSO' | 'FINALIZADO' | 'CANCELADO';

/** Cursos dictados de una materia (schema academia). */
@Entity({ name: 'cursos', schema: 'academia' })
export class Curso {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  materiaId: string;

  @Column({ type: 'nvarchar', length: 200 })
  nombre: string;

  @Column({ type: 'nvarchar', nullable: true })
  descripcion: string | null;

  @Column({ type: 'date' })
  fechaInicio: string;

  @Column({ type: 'date' })
  fechaFin: string;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  horario: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  instructorId: string | null;

  @Column({ type: 'int', default: 30 })
  cupoMaximo: number;

  @Column({ type: 'int', default: 0 })
  cupoActual: number;

  @Column({ type: 'nvarchar', length: 20, default: 'PLANIFICADO' })
  estado: EstadoCurso;

  @Column({ type: 'nvarchar', nullable: true })
  metadata: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;
}
