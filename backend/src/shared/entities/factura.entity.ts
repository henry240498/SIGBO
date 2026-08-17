import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type OrigenFactura = 'MANUAL' | 'SIGBO';
export type EstadoFactura = 'EMITIDA' | 'ANULADA';

/** Registro de facturacion. `origen=MANUAL` es una factura fisica ya
 * emitida por el cuartel que solo se registra en SIGBO (no se
 * pretende que SIGBO la genero). `origen=SIGBO` queda preparado para
 * emision propia a futuro, sin integracion fiscal real todavia
 * (seccion 15-16 del pedido). La correccion de una factura NUNCA es
 * destructiva: se hace via NotaCredito, jamas editando/eliminando
 * esta fila. */
@Entity({ name: 'facturas', schema: 'finanzas' })
export class Factura {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 10, default: 'MANUAL' })
  origen: OrigenFactura;

  /** Referencia a organizacion.parametros (tipo TIPO_DOCUMENTO_FINANZAS, reutilizado). */
  @Column({ type: 'uniqueidentifier' })
  tipoComprobanteId: string;

  @Column({ type: 'nvarchar', length: 50 })
  numero: string;

  @Column({ type: 'nvarchar', length: 3, nullable: true })
  establecimiento: string | null;

  @Column({ type: 'nvarchar', length: 3, nullable: true })
  puntoExpedicion: string | null;

  @Column({ type: 'nvarchar', length: 10, nullable: true })
  serie: string | null;

  @Column({ type: 'nvarchar', length: 20, nullable: true })
  timbrado: string | null;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'uniqueidentifier', nullable: true })
  socioProtectorId: string | null;

  /** Cliente que no es un Socio Protector registrado. */
  @Column({ type: 'nvarchar', length: 200, nullable: true })
  clienteNombre: string | null;

  @Column({ type: 'nvarchar', length: 30, nullable: true })
  clienteRucCi: string | null;

  @Column({ type: 'nvarchar', length: 300 })
  concepto: string;

  @Column({ type: 'nvarchar', nullable: true })
  detalle: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 1 })
  cantidad: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  precioUnitario: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  descuento: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  impuestos: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  total: number;

  @Column({ type: 'nvarchar', length: 3, default: 'PYG' })
  moneda: string;

  /** Referencia a organizacion.parametros (tipo MEDIO_PAGO_FINANZAS). */
  @Column({ type: 'uniqueidentifier', nullable: true })
  formaPagoId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  aporteId: string | null;

  /** Preparado para facturar una inscripcion academica; no forzado. */
  @Column({ type: 'uniqueidentifier', nullable: true })
  inscripcionAcademiaId: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  archivoUrl: string | null;

  @Column({ type: 'nvarchar', length: 20, default: 'EMITIDA' })
  estado: EstadoFactura;

  @Column({ type: 'uniqueidentifier', nullable: true })
  anuladoPor: string | null;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  fechaAnulacion: Date | null;

  @Column({ type: 'nvarchar', nullable: true })
  motivoAnulacion: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  movimientoFinancieroId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  institucionId: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  actualizadoPor: string | null;
}
