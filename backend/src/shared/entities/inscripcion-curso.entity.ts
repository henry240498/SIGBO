import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type EstadoInscripcionCurso = 'INSCRITO' | 'ACTIVO' | 'RETIRADO' | 'APROBADO' | 'REPROBADO';

/** Inscripciones de bomberos o aspirantes a un curso (schema academia).
 * participante_id es columna calculada: COALESCE(bombero_id, aspirante_id). */
@Entity({ name: 'inscripciones_cursos', schema: 'academia' })
export class InscripcionCurso {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  cursoId: string;

  @Column({ type: 'uniqueidentifier', nullable: true })
  bomberoId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  aspiranteId: string | null;

  @Column({ type: 'uniqueidentifier', insert: false, update: false, select: true, nullable: true })
  participanteId: string | null;

  @Column({ type: 'date' })
  fechaInscripcion: string;

  @Column({ type: 'nvarchar', length: 20, default: 'INSCRITO' })
  estado: EstadoInscripcionCurso;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  notaFinal: number | null;

  @Column({ type: 'int', default: 0 })
  asistenciaTotal: number;

  @Column({ type: 'nvarchar', nullable: true })
  observaciones: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;
}
