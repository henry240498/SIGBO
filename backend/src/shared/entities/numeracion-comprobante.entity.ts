import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type EstadoNumeracionComprobante = 'ACTIVA' | 'INACTIVA' | 'AGOTADA';

/** Configuracion parametrizable de numeracion de comprobantes
 * (establecimiento/punto de expedicion/serie/timbrado/vigencia,
 * seccion 18 del pedido). Mismo espiritu que
 * documentos.NumeracionDocumento (contador por combinacion), con los
 * campos propios de la numeracion fiscal paraguaya. Solo se consume
 * al emitir una Factura con origen=SIGBO (preparado, no forzado). */
@Entity({ name: 'numeraciones_comprobantes', schema: 'finanzas' })
export class NumeracionComprobante {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Referencia a organizacion.parametros (tipo TIPO_DOCUMENTO_FINANZAS). */
  @Column({ type: 'uniqueidentifier' })
  tipoComprobanteId: string;

  @Column({ type: 'nvarchar', length: 3 })
  establecimiento: string;

  @Column({ type: 'nvarchar', length: 3 })
  puntoExpedicion: string;

  @Column({ type: 'nvarchar', length: 10, nullable: true })
  serie: string | null;

  @Column({ type: 'nvarchar', length: 20 })
  timbrado: string;

  @Column({ type: 'int' })
  numeracionDesde: number;

  @Column({ type: 'int' })
  numeracionHasta: number;

  @Column({ type: 'int', default: 0 })
  ultimoNumero: number;

  @Column({ type: 'date' })
  vigenciaDesde: string;

  @Column({ type: 'date', nullable: true })
  vigenciaHasta: string | null;

  @Column({ type: 'nvarchar', length: 20, default: 'ACTIVA' })
  estado: EstadoNumeracionComprobante;

  @Column({ type: 'uniqueidentifier', nullable: true })
  institucionId: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;
}
