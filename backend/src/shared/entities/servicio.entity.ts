import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type GravedadServicio = 'LEVE' | 'MODERADA' | 'GRAVE' | 'CRITICA';
export type EstadoServicio = 'REGISTRADO' | 'DESPACHADO' | 'EN_CURSO' | 'FINALIZADO' | 'CANCELADO';

/** Registro de cada servicio/intervencion (schema servicios). */
@Entity({ name: 'servicios', schema: 'servicios' })
export class Servicio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  tipoServicioId: string;

  @Column({ type: 'nvarchar', length: 20 })
  numeroServicio: string;

  @Column({ type: 'datetimeoffset', precision: 3 })
  fechaHoraAviso: Date;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  fechaHoraSalida: Date | null;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  fechaHoraLlegada: Date | null;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  fechaHoraFin: Date | null;

  @Column({ type: 'nvarchar' })
  direccion: string;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  ciudad: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  coordenadasLat: number | null;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  coordenadasLon: number | null;

  @Column({ type: 'nvarchar', nullable: true })
  descripcion: string | null;

  @Column({ type: 'nvarchar', length: 20, nullable: true })
  gravedad: GravedadServicio | null;

  @Column({ type: 'nvarchar', length: 20, default: 'REGISTRADO' })
  estado: EstadoServicio;

  @Column({ type: 'uniqueidentifier', nullable: true })
  vehiculoPrincipalId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  oficialRoId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  jefeServicioId: string | null;

  @Column({ type: 'int', nullable: true })
  kilometrajeSalida: number | null;

  @Column({ type: 'int', nullable: true })
  kilometrajeLlegada: number | null;

  @Column({ type: 'int', insert: false, update: false, select: true, nullable: true })
  kilometrajeTotal: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  combustibleUsado: number | null;

  @Column({ type: 'int', nullable: true })
  tiempoTotalMinutos: number | null;

  @Column({ type: 'nvarchar', nullable: true })
  informe: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  conclusiones: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  recomendaciones: string | null;

  @Column({ type: 'nvarchar', default: '[]' })
  fotos: string;

  @Column({ type: 'nvarchar', default: '[]' })
  documentos: string;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;
}
