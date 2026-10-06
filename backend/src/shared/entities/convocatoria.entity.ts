import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type EstadoConvocatoria = 'ABIERTA' | 'CERRADA';
export type RespuestaConvocatoria = 'VOY' | 'NO_PUEDO';
export type AccionRespuestaConvocatoria = 'ACEPTAR' | 'RECHAZAR' | 'CAMBIAR_RESPUESTA' | 'EN_CAMINO' | 'CANCELAR_ASISTENCIA' | 'LLEGAR';

/** Convocatoria al personal (migracion 079): un mensaje y las respuestas de cada
 * bombero. Informa y registra; no obliga a nadie. */
@Entity({ name: 'convocatorias', schema: 'servicios' })
export class Convocatoria {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier', nullable: true })
  llamadoId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  servicioId: string | null;

  @Column({ type: 'nvarchar', length: 500 })
  mensaje: string;

  @Column({ type: 'nvarchar', length: 20, default: 'ABIERTA' })
  estado: EstadoConvocatoria;

  @Column({ type: 'uniqueidentifier' })
  creadaPor: string;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  cerradaEn: Date | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  cerradaPor: string | null;
}

/** Respuesta de un bombero a una convocatoria: una fila por (convocatoria, usuario). */
@Entity({ name: 'convocatoria_respuestas', schema: 'servicios' })
export class ConvocatoriaRespuesta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  convocatoriaId: string;

  @Column({ type: 'uniqueidentifier' })
  usuarioId: string;

  @Column({ type: 'nvarchar', length: 200 })
  usuarioNombre: string;

  @Column({ type: 'nvarchar', length: 10 })
  respuesta: RespuestaConvocatoria;

  @Column({ type: 'int', nullable: true })
  etaMinutos: number | null;

  @Column({ type: 'datetimeoffset', precision: 3 })
  respondidoEn: Date;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  motivo: string | null;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  enCaminoEn: Date | null;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  canceladaEn: Date | null;
}

/** Historial append-only de cada respuesta y transición operativa. */
@Entity({ name: 'convocatoria_respuesta_eventos', schema: 'servicios' })
export class ConvocatoriaRespuestaEvento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  convocatoriaId: string;

  @Column({ type: 'uniqueidentifier' })
  usuarioId: string;

  @Column({ type: 'nvarchar', length: 200 })
  usuarioNombre: string;

  @Column({ type: 'nvarchar', length: 30 })
  accion: AccionRespuestaConvocatoria;

  @Column({ type: 'nvarchar', length: 10, nullable: true })
  respuesta: RespuestaConvocatoria | null;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  motivo: string | null;

  @Column({ type: 'datetimeoffset', precision: 3 })
  ocurridoEn: Date;
}
