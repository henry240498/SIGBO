import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { FuenteAsistencia } from './marcacion-asistencia.entity';

export type EstadoParticipacion = 'COMPLETA' | 'PARCIAL' | 'NO_REGISTRADA' | 'AUSENTE_CONFIRMADO';

/** Asistencia de una persona (bombero o externo) A un evento -- distinta de
 * la marcacion fisica de entrada/salida del cuartel. Exactamente uno de
 * `bomberoId`/`participanteExternoId` debe estar presente (misma logica que
 * academia.inscripciones_cursos). `estadoParticipacion` nunca se asume
 * AUSENTE_CONFIRMADO automaticamente por falta de marcacion: solo se llega a
 * ese estado por confirmacion explicita de un responsable. */
@Entity({ name: 'participantes_evento', schema: 'operaciones' })
export class ParticipanteEvento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  eventoId: string;

  @Column({ type: 'uniqueidentifier', nullable: true })
  bomberoId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  participanteExternoId: string | null;

  @Column({ type: 'uniqueidentifier', insert: false, update: false })
  participanteId: string;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  horaRealInicio: Date | null;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  horaRealFin: Date | null;

  @Column({ type: 'int', insert: false, update: false, nullable: true })
  duracionMinutos: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  porcentajeParticipacion: number | null;

  @Column({ type: 'nvarchar', length: 20, default: 'NO_REGISTRADA' })
  estadoParticipacion: EstadoParticipacion;

  @Column({ type: 'nvarchar', length: 30, default: 'MANUAL' })
  fuente: FuenteAsistencia;

  @Column({ type: 'uniqueidentifier', nullable: true })
  registradoPor: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  observacion: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  institucionId: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;
}
