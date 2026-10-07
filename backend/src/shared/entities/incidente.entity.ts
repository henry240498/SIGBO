import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Flujo operativo del incidente (migracion 093). El orden importa: ver FASES en incidente.logica.ts. */
export type FaseOperativa =
  | 'RECIBIDO' | 'EVALUACION' | 'DESPACHADO' | 'EN_CAMINO' | 'EN_LUGAR'
  | 'OPERANDO' | 'CONTROLADO' | 'RETORNO' | 'DISPONIBLE' | 'CERRADO';

/** Como termino el incidente. Los alternativos al flujo normal son resultados, no fases. */
export type ResultadoIncidente =
  | 'CONTROLADO' | 'RESUELTO' | 'FALSA_ALARMA' | 'CANCELADO'
  | 'DERIVADO' | 'NO_ATENDIDO' | 'SIN_ACCESO' | 'SIN_INTERVENCION';

export type TipoEventoIncidente =
  | 'SERVICIO_RECIBIDO' | 'LLAMADO_VINCULADO' | 'FASE_CAMBIADA' | 'PRIORIDAD_CAMBIADA'
  | 'MOVIL_DESPACHADO' | 'MOVIL_SALIO' | 'MOVIL_LLEGO' | 'MOVIL_RETORNA' | 'MOVIL_DISPONIBLE'
  | 'DESPACHO_CANCELADO' | 'TRIPULACION_AJUSTADA' | 'PERSONAL_SUMADO' | 'COMANDO_ASUMIDO'
  | 'SITUACION_MARCADA' | 'SITUACION_RESUELTA' | 'RECURSO_SOLICITADO' | 'RECURSO_ACTUALIZADO'
  | 'VICTIMA_REGISTRADA' | 'FOTO_TOMADA' | 'MENSAJE' | 'COMUNICACION' | 'EMERGENCIA'
  | 'EMERGENCIA_ATENDIDA' | 'RESULTADO_DECLARADO' | 'INCIDENTE_CERRADO'
  | 'PERSONAL_ENTRA_ZONA' | 'PERSONAL_SALE_ZONA' | 'RECUENTO_PERSONAL';

export type OrigenEvento = 'WEB' | 'APP' | 'SISTEMA';
export type GrupoCondicion = 'SITUACION' | 'RIESGO';
export type CategoriaRecurso = 'MOVIL' | 'PERSONAL' | 'INSUMO' | 'EXTERNO' | 'OTRO';
export type PrioridadSolicitud = 'NORMAL' | 'URGENTE';
export type EstadoSolicitudRecurso =
  | 'SOLICITADO' | 'APROBADO' | 'DESPACHADO' | 'EN_CAMINO' | 'EN_USO' | 'LIBERADO' | 'RECHAZADO' | 'CANCELADO';

/** Bitacora unica del incidente: una accion = un evento. Inmutable (disparador en la base). */
@Entity({ name: 'incidente_eventos', schema: 'servicios' })
export class IncidenteEvento {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'uniqueidentifier' })
  servicioId: string;

  @Column({ type: 'nvarchar', length: 40 })
  tipo: TipoEventoIncidente;

  @Column({ type: 'nvarchar', length: 200 })
  titulo: string;

  /** Hora del hecho (acotada con instanteDelHecho), no la de llegada al servidor. */
  @Column({ type: 'datetimeoffset', precision: 3 })
  ocurridoEn: Date;

  @Column({ type: 'datetimeoffset', precision: 3 })
  registradoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  usuarioId: string | null;

  @Column({ type: 'nvarchar', length: 120, nullable: true })
  usuarioNombre: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  vehiculoId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  despachoId: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitud: number | null;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitud: number | null;

  @Column({ type: 'decimal', precision: 7, scale: 1, nullable: true })
  precisionM: number | null;

  @Column({ type: 'nvarchar', length: 20, nullable: true })
  faseAnterior: FaseOperativa | null;

  @Column({ type: 'nvarchar', length: 20, nullable: true })
  faseNueva: FaseOperativa | null;

  /** Tabla de origen del hecho (despachos, adjuntos, servicio_mensajes...) y su id. */
  @Column({ type: 'nvarchar', length: 30, nullable: true })
  fuente: string | null;

  @Column({ type: 'nvarchar', length: 64, nullable: true })
  fuenteId: string | null;

  /** JSON con el detalle estructurado. */
  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  datos: string | null;

  @Column({ type: 'bit', default: false })
  critico: boolean;

  @Column({ type: 'nvarchar', length: 10 })
  origen: OrigenEvento;

  @Column({ type: 'nvarchar', length: 200, nullable: true })
  dispositivo: string | null;

  @Column({ type: 'nvarchar', length: 64, nullable: true })
  claveIdempotencia: string | null;
}

/** Condicion que se marca en SITUACION (o un riesgo). Configurable: es una fila. */
@Entity({ name: 'condiciones_situacion', schema: 'servicios' })
export class CondicionSituacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 40 })
  codigo: string;

  @Column({ type: 'nvarchar', length: 80 })
  nombre: string;

  @Column({ type: 'nvarchar', length: 12 })
  grupo: GrupoCondicion;

  /** Si se marca, la central la ve como alerta critica. */
  @Column({ type: 'bit', default: false })
  critica: boolean;

  /** Las que comparten valor se excluyen: marcar una resuelve las otras. */
  @Column({ type: 'nvarchar', length: 30, nullable: true })
  grupoExcluyente: string | null;

  @Column({ type: 'int', default: 0 })
  orden: number;

  @Column({ type: 'bit', default: true })
  activo: boolean;
}

/** Recurso que se puede pedir con la SOLICITUD RAPIDA. Configurable. */
@Entity({ name: 'tipos_recurso', schema: 'servicios' })
export class TipoRecurso {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 30 })
  codigo: string;

  @Column({ type: 'nvarchar', length: 80 })
  nombre: string;

  @Column({ type: 'nvarchar', length: 10 })
  categoria: CategoriaRecurso;

  @Column({ type: 'int', default: 0 })
  orden: number;

  @Column({ type: 'bit', default: true })
  activo: boolean;
}

/** Pedido de recurso hecho durante el incidente, con su ciclo SCI. */
@Entity({ name: 'incidente_solicitudes', schema: 'servicios' })
export class IncidenteSolicitud {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  servicioId: string;

  @Column({ type: 'uniqueidentifier' })
  tipoRecursoId: string;

  @Column({ type: 'int', default: 1 })
  cantidad: number;

  @Column({ type: 'nvarchar', length: 10 })
  prioridad: PrioridadSolicitud;

  @Column({ type: 'nvarchar', length: 12, default: 'SOLICITADO' })
  estado: EstadoSolicitudRecurso;

  @Column({ type: 'nvarchar', length: 300, nullable: true })
  observacion: string | null;

  @Column({ type: 'uniqueidentifier' })
  solicitadoPor: string;

  @Column({ type: 'datetimeoffset', precision: 3 })
  solicitadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  actualizadoPor: string | null;

  @Column({ type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;

  @Column({ type: 'int', default: 0 })
  version: number;

  @Column({ type: 'nvarchar', length: 64, nullable: true })
  claveIdempotencia: string | null;
}
