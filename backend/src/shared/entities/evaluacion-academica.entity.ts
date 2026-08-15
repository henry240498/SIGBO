import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Una instancia de evaluacion dentro de una actividad academica (ej.
 * "Examen teorico del 15/03"). El tipo (teorico/practico/fisico/etc.) es
 * parametrizable via organizacion.parametros (tipo TIPO_EVALUACION_ACADEMICA). */
@Entity({ name: 'evaluaciones', schema: 'academia' })
export class EvaluacionAcademica {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  actividadId: string;

  @Column({ type: 'uniqueidentifier' })
  tipoEvaluacionId: string;

  @Column({ type: 'nvarchar', length: 200, nullable: true })
  titulo: string | null;

  @Column({ type: 'date', nullable: true })
  fecha: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  evaluadorBomberoId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  evaluadorExternoId: string | null;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  escala: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  observaciones: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;
}
