import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type EstadoActividadAcademica = 'PLANIFICADA' | 'ABIERTA' | 'EN_CURSO' | 'FINALIZADA' | 'CANCELADA';

/** La "actividad academica": curso/capacitacion/taller/etc. -- el tipo real
 * (Curso, Capacitacion, Academia, Taller, ...) es parametrizable via
 * organizacion.parametros (tipo TIPO_ACTIVIDAD_ACADEMICA), nunca fijo en
 * codigo. Cada sesion/encuentro de la actividad se representa como una fila
 * de operaciones.eventos_asistencia enlazada por actividadAcademicaId (ver
 * migracion 037) -- esta tabla no duplica el registro de asistencia. */
@Entity({ name: 'actividades', schema: 'academia' })
export class ActividadAcademica {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 30, nullable: true })
  codigo: string | null;

  @Column({ type: 'nvarchar', length: 200 })
  nombre: string;

  /** Referencia a organizacion.parametros (tipo TIPO_ACTIVIDAD_ACADEMICA). */
  @Column({ type: 'uniqueidentifier' })
  tipoActividadId: string;

  @Column({ type: 'nvarchar', nullable: true })
  descripcion: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  objetivo: string | null;

  @Column({ type: 'nvarchar', length: 200, nullable: true })
  institucionOrganizadora: string | null;

  @Column({ type: 'date' })
  fechaInicio: string;

  @Column({ type: 'date' })
  fechaFin: string;

  @Column({ type: 'time', precision: 0, nullable: true })
  horaInicio: string | null;

  @Column({ type: 'time', precision: 0, nullable: true })
  horaFin: string | null;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  duracionHoras: number | null;

  /** Referencia a organizacion.parametros (tipo MODALIDAD_ACADEMICA). */
  @Column({ type: 'uniqueidentifier', nullable: true })
  modalidadId: string | null;

  @Column({ type: 'nvarchar', length: 200, nullable: true })
  lugar: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  responsableBomberoId: string | null;

  @Column({ type: 'int', nullable: true })
  cupo: number | null;

  @Column({ type: 'nvarchar', nullable: true })
  requisitos: string | null;

  @Column({ type: 'nvarchar', length: 20, default: 'PLANIFICADA' })
  estado: EstadoActividadAcademica;

  @Column({ type: 'nvarchar', nullable: true })
  observaciones: string | null;

  /** Seccion 18 del pedido: capacitacion realizada fuera de la institucion. */
  @Column({ type: 'bit', default: false })
  esExterna: boolean;

  /** Reservado para multi-institucion; sin usar todavia. */
  @Column({ type: 'uniqueidentifier', nullable: true })
  institucionId: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  actualizadoPor: string | null;
}
