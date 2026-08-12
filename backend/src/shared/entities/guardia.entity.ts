import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type TurnoGuardia = 'DIURNO' | 'NOCTURNO' | 'COMPLETO';
export type TipoGuardiaRegistro = 'ORDINARIA' | 'ESPECIAL' | 'EXTRAORDINARIA';
export type EstadoGuardia = 'PLANIFICADA' | 'CONFIRMADA' | 'EN_CURSO' | 'FINALIZADA' | 'CANCELADA' | 'ANULADA';

/** Guardias programadas reales (schema operaciones). No confundir con
 * organizacion.tipos_guardia, que es el catalogo de tipos. */
@Entity({ name: 'guardias', schema: 'operaciones' })
export class Guardia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'nvarchar', length: 20 })
  turno: TurnoGuardia;

  @Column({ type: 'time', precision: 0 })
  horaInicio: string;

  @Column({ type: 'time', precision: 0 })
  horaFin: string;

  @Column({ type: 'nvarchar', length: 20, default: 'ORDINARIA' })
  tipo: TipoGuardiaRegistro;

  @Column({ type: 'nvarchar', length: 20, default: 'PLANIFICADA' })
  estado: EstadoGuardia;

  @Column({ type: 'uniqueidentifier', nullable: true })
  jefeGuardiaId: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  observaciones: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  institucionId: string | null;

  /** Grupo de guardia del que se recupero la composicion titular al crear
   * esta guardia (seccion 3 del pedido). Nullable: una guardia tambien
   * puede armarse sin partir de un grupo predefinido. */
  @Column({ type: 'uniqueidentifier', nullable: true })
  grupoGuardiaId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  cierreResponsableId: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  cierreObservacion: string | null;

  /** Snapshot JSON del resumen de cierre (seccion 22) -- inmutable una vez
   * cerrada, para que el informe no cambie retroactivamente si datos
   * relacionados se modifican despues. */
  @Column({ type: 'nvarchar', nullable: true })
  cierreResumen: string | null;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  cerradaEn: Date | null;

  /** Plantilla de horario que origino esta instancia (generacion automatica
   * o creacion manual con esquema seleccionado). Nullable: una guardia
   * tambien puede crearse sin partir de un esquema. */
  @Column({ type: 'uniqueidentifier', nullable: true })
  esquemaHorarioId: string | null;

  /** Feriado al que corresponde esta guardia, si aplica (seccion 17-18). */
  @Column({ type: 'uniqueidentifier', nullable: true })
  feriadoId: string | null;
}
