import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type EstadoEventoAsistencia = 'PROGRAMADO' | 'EN_CURSO' | 'FINALIZADO' | 'CANCELADO';

/** Evento al que se puede asistir (guardia, reunion, capacitacion, academia,
 * etc. - el tipo es parametrizable, ver organizacion.parametros tipo
 * TIPO_EVENTO_ASISTENCIA). Distinto de la marcacion fisica de entrada/salida
 * (ver MarcacionAsistencia) y de la participacion de una persona en el
 * evento (ver ParticipanteEvento). */
@Entity({ name: 'eventos_asistencia', schema: 'operaciones' })
export class EventoAsistencia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 200 })
  nombre: string;

  @Column({ type: 'nvarchar', nullable: true })
  descripcion: string | null;

  @Column({ type: 'datetimeoffset', precision: 3 })
  fechaInicio: Date;

  @Column({ type: 'datetimeoffset', precision: 3 })
  fechaFin: Date;

  @Column({ type: 'nvarchar', length: 200, nullable: true })
  ubicacion: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  responsableId: string | null;

  @Column({ type: 'nvarchar', length: 20, default: 'PROGRAMADO' })
  estado: EstadoEventoAsistencia;

  @Column({ type: 'nvarchar', nullable: true })
  metadata: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;

  /** Referencia a organizacion.parametros (tipo TIPO_EVENTO_ASISTENCIA). */
  @Column({ type: 'uniqueidentifier', nullable: true })
  tipoEventoId: string | null;

  /** Campo preparado para multi-institucion futura; sin scoping real aun. */
  @Column({ type: 'uniqueidentifier', nullable: true })
  institucionId: string | null;

  /** Si el evento es una sesion/jornada de una actividad academica, enlaza
   * con ella. Null para guardias, reuniones u otros eventos no academicos. */
  @Column({ type: 'uniqueidentifier', nullable: true })
  actividadAcademicaId: string | null;
}
