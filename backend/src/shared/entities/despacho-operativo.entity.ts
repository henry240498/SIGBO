import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type EstadoPersonal = 'NO_DISPONIBLE' | 'AL_LLAMADO' | 'EN_BASE' | 'EN_CAMINO' | 'EN_SERVICIO';
export type TipoSolicitud = 'CHOFER' | 'PERSONAL' | 'RAPIDA';
export type EstadoSolicitud = 'ABIERTA' | 'CERRADA' | 'CANCELADA';
/** Que paso al enviar: eje distinto de lo que la persona respondio. */
export type EntregaSolicitud = 'ENVIADA' | 'SIN_CONEXION' | 'NO_DISPONIBLE' | 'FUERA_DE_HORARIO' | 'EN_SERVICIO' | 'NO_HABILITADO_CHOFER';
/** Que hizo la persona. */
export type EstadoDestinatario = 'PENDIENTE' | 'ACEPTO' | 'NO_PUEDE' | 'CANCELO' | 'EN_CAMINO' | 'LLEGO';

/** Disponibilidad declarada de una persona (migracion 088). Una fila por usuario. */
@Entity({ name: 'disponibilidad_personal', schema: 'servicios' })
export class DisponibilidadPersonal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  usuarioId: string;

  @Column({ type: 'nvarchar', length: 20, default: 'NO_DISPONIBLE' })
  estado: EstadoPersonal;

  @Column({ type: 'datetimeoffset', precision: 3 })
  desde: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  solicitudId: string | null;

  @Column({ type: 'bit', default: false })
  usaHorario: boolean;

  /** Si hay fecha, el AL_LLAMADO es temporal (busqueda de personal adicional) y vuelve solo a NO_DISPONIBLE. */
  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  temporalHasta: Date | null;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  ultimaActividad: Date | null;

  /** Control de concurrencia optimista: toda actualizacion exige la version leida. */
  @Column({ type: 'int', default: 0 })
  version: number;

  @Column({ type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;
}

@Entity({ name: 'disponibilidad_horarios', schema: 'servicios' })
export class DisponibilidadHorario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  usuarioId: string;

  /** 1 = lunes ... 7 = domingo. */
  @Column({ type: 'tinyint' })
  diaSemana: number;

  @Column({ type: 'time' })
  horaDesde: string;

  @Column({ type: 'time' })
  horaHasta: string;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;
}

@Entity({ name: 'disponibilidad_excepciones', schema: 'servicios' })
export class DisponibilidadExcepcion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  usuarioId: string;

  @Column({ type: 'date' })
  fechaDesde: string;

  @Column({ type: 'date' })
  fechaHasta: string;

  @Column({ type: 'bit' })
  disponible: boolean;

  @Column({ type: 'time', nullable: true })
  horaDesde: string | null;

  @Column({ type: 'time', nullable: true })
  horaHasta: string | null;

  @Column({ type: 'nvarchar', length: 200, nullable: true })
  motivo: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;
}

@Entity({ name: 'solicitudes_despacho', schema: 'servicios' })
export class SolicitudDespacho {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 20 })
  tipo: TipoSolicitud;

  @Column({ type: 'uniqueidentifier', nullable: true })
  servicioId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  llamadoId: string | null;

  @Column({ type: 'nvarchar', length: 300, nullable: true })
  mensaje: string | null;

  @Column({ type: 'nvarchar', length: 20, default: 'ABIERTA' })
  estado: EstadoSolicitud;

  @Column({ type: 'int', nullable: true })
  requeridos: number | null;

  @Column({ type: 'uniqueidentifier' })
  creadaPor: string;

  @Column({ type: 'nvarchar', length: 120 })
  creadaPorNombre: string;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  cerradaEn: Date | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  cerradaPor: string | null;

  @Column({ type: 'nvarchar', length: 300, nullable: true })
  motivoCierre: string | null;

  @Column({ type: 'nvarchar', length: 64, nullable: true })
  claveIdempotencia: string | null;
}

@Entity({ name: 'solicitud_moviles', schema: 'servicios' })
export class SolicitudMovil {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  solicitudId: string;

  @Column({ type: 'uniqueidentifier' })
  vehiculoId: string;
}

@Entity({ name: 'solicitud_destinatarios', schema: 'servicios' })
export class SolicitudDestinatario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  solicitudId: string;

  @Column({ type: 'uniqueidentifier' })
  usuarioId: string;

  @Column({ type: 'nvarchar', length: 120 })
  usuarioNombre: string;

  @Column({ type: 'nvarchar', length: 20 })
  entrega: EntregaSolicitud;

  @Column({ type: 'datetimeoffset', precision: 3 })
  enviadaEn: Date;

  /** Cuando el dispositivo confirmo haber recibido la alerta a tiempo. */
  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  recibidaEn: Date | null;

  /** Si estaba sin conexion al enviar y la vio despues: queda distinguido de una recepcion a tiempo. */
  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  vistoTardeEn: Date | null;

  @Column({ type: 'nvarchar', length: 20, default: 'PENDIENTE' })
  estado: EstadoDestinatario;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  respondidoEn: Date | null;

  /** Hora de la primera aceptacion: no se pierde si despues cancela y vuelve a aceptar. */
  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  aceptadaEn: Date | null;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  enCaminoEn: Date | null;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  llegoEn: Date | null;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  canceladaEn: Date | null;

  @Column({ type: 'nvarchar', length: 200, nullable: true })
  motivo: string | null;

  /** Se sumo por "Buscar personal adicional" (estaba en NO_DISPONIBLE y eligio pasar a AL_LLAMADO). */
  @Column({ type: 'bit', default: false })
  ampliacion: boolean;

  @Column({ type: 'int', default: 0 })
  version: number;
}

/** Linea de tiempo de una solicitud. Solo se agrega: un disparador de la base impide UPDATE y DELETE. */
@Entity({ name: 'solicitud_eventos', schema: 'servicios' })
export class SolicitudEvento {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'uniqueidentifier' })
  solicitudId: string;

  @Column({ type: 'uniqueidentifier', nullable: true })
  actorId: string | null;

  @Column({ type: 'nvarchar', length: 120, nullable: true })
  actorNombre: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  destinatarioId: string | null;

  @Column({ type: 'nvarchar', length: 40 })
  tipo: string;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  detalle: string | null;

  @Column({ type: 'datetimeoffset', precision: 3 })
  ocurridoEn: Date;

  @Column({ type: 'datetimeoffset', precision: 3 })
  registradoEn: Date;
}
