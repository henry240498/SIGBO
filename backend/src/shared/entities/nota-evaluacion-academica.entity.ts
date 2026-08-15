import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/** Resultado de UN participante (via su inscripcion) en UNA evaluacion.
 * Independiente del resultado final de la inscripcion (una actividad puede
 * tener varias evaluaciones; el resultado final se fija aparte, en
 * InscripcionActividadAcademica.resultadoFinalId). */
@Entity({ name: 'notas_evaluacion', schema: 'academia' })
export class NotaEvaluacionAcademica {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  evaluacionId: string;

  @Column({ type: 'uniqueidentifier' })
  inscripcionId: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  calificacion: number | null;

  /** Referencia a organizacion.parametros (tipo RESULTADO_ACADEMICO). */
  @Column({ type: 'uniqueidentifier', nullable: true })
  resultadoId: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  observaciones: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;
}
