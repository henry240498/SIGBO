import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type EstadoNotaCredito = 'EMITIDA' | 'ANULADA';

/** Correccion NO destructiva de una Factura (seccion 17 del pedido):
 * nunca se elimina ni modifica la factura original, se emite esta
 * fila adicional enlazada por facturaId -- la trazabilidad completa
 * queda en ambas tablas. */
@Entity({ name: 'notas_credito', schema: 'finanzas' })
export class NotaCredito {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  facturaId: string;

  @Column({ type: 'nvarchar', length: 50 })
  numero: string;

  @Column({ type: 'date' })
  fecha: string;

  /** Referencia a organizacion.parametros (tipo MOTIVO_NOTA_CREDITO_FINANZAS). */
  @Column({ type: 'uniqueidentifier' })
  motivoId: string;

  @Column({ type: 'nvarchar', length: 300, nullable: true })
  concepto: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  importe: number;

  @Column({ type: 'nvarchar', nullable: true })
  archivoUrl: string | null;

  @Column({ type: 'nvarchar', length: 20, default: 'EMITIDA' })
  estado: EstadoNotaCredito;

  @Column({ type: 'uniqueidentifier', nullable: true })
  institucionId: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
  creadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  creadoPor: string | null;
}
