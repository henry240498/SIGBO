import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TipoElementoDeposito } from './tenencia-deposito.entity';

/** Historial append-only de todo movimiento de Deposito (seccion 6 del
 * pedido). Nunca se edita ni se borra -- cualquier correccion se hace con
 * un movimiento nuevo. Cada fila representa un evento ya ocurrido; el
 * "estado actual" vive en deposito.tenencias, actualizado en la misma
 * transaccion que crea el movimiento correspondiente. */
@Entity({ name: 'movimientos', schema: 'deposito' })
export class MovimientoDeposito {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Referencia a organizacion.parametros (tipo TIPO_MOVIMIENTO_DEPOSITO). */
  @Column({ type: 'uniqueidentifier' })
  tipoMovimientoId: string;

  @Column({ type: 'nvarchar', length: 10 })
  tipoElemento: TipoElementoDeposito;

  @Column({ type: 'uniqueidentifier', nullable: true })
  equipoId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  articuloId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  loteId: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  cantidad: number | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  ubicacionOrigenId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  ubicacionDestinoId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  vehiculoOrigenId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  vehiculoDestinoId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  bomberoOrigenId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  bomberoDestinoId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  servicioOrigenId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  servicioDestinoId: string | null;

  /** Quien entrega/recibe fisicamente -- distinto de `creadoPor` (quien lo carga en el sistema). */
  @Column({ type: 'uniqueidentifier', nullable: true })
  responsableId: string | null;

  @Column({ type: 'nvarchar', length: 300, nullable: true })
  motivo: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  observacion: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  documentoUrl: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  institucionId: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;
}
