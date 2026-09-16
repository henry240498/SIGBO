import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type TipoAlertaEmergencia = 'SOLICITUD_APOYO' | 'SOLICITUD_CHOFER';
export type EstadoAlertaEmergencia = 'PENDIENTE' | 'ATENDIDA' | 'CANCELADA';

/**
 * Solicitud inmediata de apoyo o de chofer emitida desde la app movil.
 *
 * Trazabilidad normativa (docs/REGLAMENTO_GENERAL_CBVC_TRAZABILIDAD.md):
 * - Radio y comunicaciones, Arts. 249-258: la radio operadora registra la
 *   llamada, la direccion, el despacho y el APOYO SOLICITADO. La alerta de
 *   tipo SOLICITUD_APOYO es la version movil de ese registro.
 * - Vehiculos y conductores, Arts. 230-248: el conductor por guardia debe
 *   estar autorizado y con licencia vigente. SOLICITUD_CHOFER pide ese rol.
 * - Servicios y mando operativo, Arts. 5-8 y 220-227: mando unico y personal
 *   habilitado; la alerta solo REGISTRA el hecho (quien, que, cuando). Atender
 *   o cancelar la registra quien corresponda y queda en auditoria; el sistema
 *   no decide por si solo consecuencias disciplinarias u operativas.
 *
 * Reutiliza: Usuario (solicitante), AuditoriaService (historial inmutable) y
 * los permisos existentes servicios:crear / servicios:ver / servicios:editar,
 * para no crear un sistema de autorizacion paralelo.
 */
@Entity({ name: 'alertas_emergencia', schema: 'servicios' })
@Index('IX_alertas_emergencia_estado_creado', ['estado', 'creadoEn'])
@Index('IX_alertas_emergencia_solicitante', ['solicitanteId', 'creadoEn'])
export class AlertaEmergencia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 20 })
  tipo: TipoAlertaEmergencia;

  @Column({ type: 'nvarchar', length: 20, default: 'PENDIENTE' })
  estado: EstadoAlertaEmergencia;

  /** Usuario SIGBO que presiono el boton. FK logica a seguridad.usuarios. */
  @Column({ name: 'solicitanteId', type: 'uniqueidentifier' })
  solicitanteId: string;

  /** Foto del nombre al momento de la solicitud (el username puede cambiar). */
  @Column({ name: 'solicitanteNombre', type: 'nvarchar', length: 200 })
  solicitanteNombre: string;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  detalle: string | null;

  @Column({ type: 'float', nullable: true })
  latitud: number | null;

  @Column({ type: 'float', nullable: true })
  longitud: number | null;

  /**
   * Clave de idempotencia generada por el movil (UUID v4 por pulsacion
   * intencional). UNIQUE: las repeticiones accidentales devuelven la alerta
   * original en lugar de crear duplicadas.
   */
  @Column({ name: 'claveIdempotencia', type: 'nvarchar', length: 64, unique: true })
  claveIdempotencia: string;

  /** Quien marco ATENDIDA/CANCELADA (autoridad/operador que la toma). */
  @Column({ name: 'atendidaPor', type: 'uniqueidentifier', nullable: true })
  atendidaPor: string | null;

  @Column({ name: 'atendidaPorNombre', type: 'nvarchar', length: 200, nullable: true })
  atendidaPorNombre: string | null;

  @Column({ name: 'atendidaEn', type: 'datetimeoffset', precision: 3, nullable: true })
  atendidaEn: Date | null;

  /** Fundamento breve del cambio de estado (exigido por trazabilidad). */
  @Column({ name: 'motivoEstado', type: 'nvarchar', length: 500, nullable: true })
  motivoEstado: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;
}
