import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export type EstadoOrdenPago = 'BORRADOR' | 'SOLICITADO' | 'PENDIENTE_AUTORIZACION' | 'AUTORIZADO' | 'RECHAZADO' | 'PAGADO' | 'ANULADO';

/** Solicitud de gasto (seccion 18 del pedido) que atraviesa
 * BORRADOR -> SOLICITADO -> PENDIENTE_AUTORIZACION -> AUTORIZADO ->
 * PAGADO, con ramas RECHAZADO/ANULADO -- mismo patron de maquina de
 * estados que servicios.comunicaciones_servicio (permiso distinto por
 * transicion, `version` para optimistic locking, ver
 * OrdenesPagoService). Al pagarse genera el egreso real en
 * `movimientoId` -- la orden es la autorizacion, el movimiento es el
 * hecho economico consumado. */
@Entity({ name: 'ordenes_pago', schema: 'finanzas' })
export class OrdenPago {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 300 })
  concepto: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  importe: number;

  /** Referencia a organizacion.parametros (tipo CATEGORIA_EGRESO_FINANZAS). */
  @Column({ type: 'uniqueidentifier' })
  categoriaEgresoId: string;

  @Column({ type: 'uniqueidentifier', nullable: true })
  proveedorId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  cajaId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  cuentaBancariaId: string | null;

  @Column({ type: 'uniqueidentifier' })
  ejercicioId: string;

  @Column({ type: 'nvarchar', length: 30, default: 'BORRADOR' })
  estado: EstadoOrdenPago;

  @Column({ type: 'uniqueidentifier', nullable: true })
  solicitadoPor: string | null;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  fechaSolicitud: Date | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  autorizadoPor: string | null;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  fechaAutorizacion: Date | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  rechazadoPor: string | null;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  fechaRechazo: Date | null;

  @Column({ type: 'nvarchar', nullable: true })
  motivoRechazo: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  anuladoPor: string | null;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  fechaAnulacion: Date | null;

  @Column({ type: 'nvarchar', nullable: true })
  motivoAnulacion: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  movimientoId: string | null;

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ type: 'uniqueidentifier', nullable: true })
  institucionId: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  observacion: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;
}
