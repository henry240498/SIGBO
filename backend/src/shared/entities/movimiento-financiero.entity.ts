import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type TipoMovimientoFinanciero = 'INGRESO' | 'EGRESO';
export type EstadoMovimientoFinanciero = 'REGISTRADO' | 'ANULADO';

/** Ledger central de Finanzas (seccion 2 del pedido): cada fila es un
 * hecho economico consumado. Nunca se edita el importe de una fila ya
 * registrada -- se anula (estado + motivo + usuario + fecha, seccion
 * 20) y se carga un movimiento nuevo si corresponde. El saldo de una
 * caja/cuenta siempre es reconstruible sumando este historial, nunca
 * un numero suelto. */
@Entity({ name: 'movimientos_financieros', schema: 'finanzas' })
export class MovimientoFinanciero {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 10 })
  tipo: TipoMovimientoFinanciero;

  @Column({ type: 'date' })
  fecha: string;

  /** Referencia a organizacion.parametros (tipo TIPO_INGRESO_FINANZAS) -- solo si tipo=INGRESO. */
  @Column({ type: 'uniqueidentifier', nullable: true })
  tipoIngresoId: string | null;

  /** Referencia a organizacion.parametros (tipo CATEGORIA_EGRESO_FINANZAS) -- solo si tipo=EGRESO. */
  @Column({ type: 'uniqueidentifier', nullable: true })
  categoriaEgresoId: string | null;

  @Column({ type: 'nvarchar', length: 300 })
  concepto: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  importe: number;

  @Column({ type: 'nvarchar', length: 3, default: 'PYG' })
  moneda: string;

  /** Exactamente uno de cajaId/cuentaBancariaId (CK_movf_origen en SQL). */
  @Column({ type: 'uniqueidentifier', nullable: true })
  cajaId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  cuentaBancariaId: string | null;

  /** Turno de caja abierto en el momento del registro, cuando aplica. */
  @Column({ type: 'uniqueidentifier', nullable: true })
  turnoCajaId: string | null;

  /** Referencia a deposito.proveedores -- nunca se duplica el catalogo de proveedores. */
  @Column({ type: 'uniqueidentifier', nullable: true })
  proveedorId: string | null;

  /** Persona relacionada (donante, quien paga una cuota, etc) cuando es personal propio. */
  @Column({ type: 'uniqueidentifier', nullable: true })
  bomberoId: string | null;

  /** Persona/entidad relacionada quando no es personal propio (donante externo, institucion, etc). */
  @Column({ type: 'nvarchar', length: 300, nullable: true })
  entidadExterna: string | null;

  /** Quien entrega/recibe fisicamente -- distinto de creadoPor (quien lo carga en el sistema). */
  @Column({ type: 'uniqueidentifier', nullable: true })
  responsableId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  cuotaId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  ordenPagoId: string | null;

  /** Socio Protector que origino el ingreso (Aporte) -- seccion 5/26
   * del pedido: se distingue de bomberoId/entidadExterna para poder
   * reconstruir el estado de cuenta de un socio sin ambiguedad. */
  @Column({ type: 'uniqueidentifier', nullable: true })
  socioProtectorId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  aporteId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  facturaId: string | null;

  /** Referencia a deposito.entradas -- integracion compras/donaciones
   * (secciones 16-17): el egreso/ingreso apunta a la entrada de
   * Deposito que le dio origen en vez de reingresar los items. */
  @Column({ type: 'uniqueidentifier', nullable: true })
  depositoEntradaId: string | null;

  @Column({ type: 'uniqueidentifier' })
  ejercicioId: string;

  @Column({ type: 'nvarchar', nullable: true })
  observacion: string | null;

  @Column({ type: 'nvarchar', length: 20, default: 'REGISTRADO' })
  estado: EstadoMovimientoFinanciero;

  @Column({ type: 'uniqueidentifier', nullable: true })
  anuladoPor: string | null;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  fechaAnulacion: Date | null;

  /** Referencia a organizacion.parametros (tipo MOTIVO_ANULACION_FINANZAS). */
  @Column({ type: 'uniqueidentifier', nullable: true })
  motivoAnulacionId: string | null;

  @Column({ type: 'nvarchar', nullable: true })
  motivoAnulacionDetalle: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  institucionId: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;
}
