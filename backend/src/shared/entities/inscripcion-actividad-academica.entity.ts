import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type EstadoInscripcionActividad = 'INSCRITO' | 'ACTIVO' | 'RETIRADO' | 'FINALIZADO';

/** Inscripcion de un participante (bombero O participante externo, nunca
 * ambos) a una actividad academica. Reemplaza a la vieja
 * academia.inscripciones_cursos (schema legado, migracion 004). Distinto de
 * la asistencia por sesion, que vive en operaciones.participantes_evento. */
@Entity({ name: 'inscripciones', schema: 'academia' })
export class InscripcionActividadAcademica {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  actividadId: string;

  @Column({ type: 'uniqueidentifier', nullable: true })
  bomberoId: string | null;

  /** Referencia a operaciones.participantes_externos -- nunca se duplica
   * ese registro dentro de Academia. */
  @Column({ type: 'uniqueidentifier', nullable: true })
  participanteExternoId: string | null;

  @Column({ type: 'uniqueidentifier', insert: false, update: false, select: true, nullable: true })
  participanteId: string | null;

  @Column({ type: 'date' })
  fechaInscripcion: string;

  @Column({ type: 'nvarchar', length: 20, default: 'INSCRITO' })
  estado: EstadoInscripcionActividad;

  /** Referencia a organizacion.parametros (tipo RESULTADO_ACADEMICO). Nunca
   * se calcula solo: lo fija explicitamente quien corresponda (seccion 14
   * del pedido -- SIGBO no asume aprobacion por participar). */
  @Column({ type: 'uniqueidentifier', nullable: true })
  resultadoFinalId: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  observaciones: string | null;

  /** Snapshot del beneficio de Socio Protector aplicado al inscribirse
   * (seccion 12 del pedido): el costo base de la actividad NUNCA se
   * modifica, el descuento se guarda aca. Todo nullable porque la
   * mayoria de las inscripciones no tienen costo ni beneficio. */
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  costoBase: number | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  beneficioAplicadoId: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  descuentoImporte: number | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  costoFinal: number | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  actualizadoPor: string | null;
}
